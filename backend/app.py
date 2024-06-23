import os
import base64
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import socketio
from io import BytesIO
from pydub import AudioSegment
import simpleaudio as sa
import whisper
from datetime import datetime
from model.prompt import prompt
import wave, struct
from playsound import playsound

from langchain.chains import ConversationChain, LLMChain
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_core.messages import SystemMessage
from langchain.chains.conversation.memory import ConversationBufferWindowMemory
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from lmnt.api import Speech

import tempfile
import boto3
from hume import HumeBatchClient, BatchJob
from hume.models.config import FaceConfig
from queue import Queue
from starlette.websockets import WebSocketDisconnect, WebSocketState

top_level_dict = {}
top_level_queue = Queue()
emotions_dict = {}

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
app_sio = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path="/socket.io")

whisper_model = whisper.load_model("base.en")

# Groq model
context = {}
cur_speech = ""
model = "llama3-8b-8192"
client = ChatGroq(api_key=os.environ.get("GROQ_API_KEY"), model_name=model)
conversational_memory_length = 5
memory = ConversationBufferWindowMemory(
    k=conversational_memory_length, memory_key="chat_history", return_messages=True
)

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
)
bucket_name = os.getenv("AWS_BUCKET_NAME")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        try:
            data = await websocket.receive_bytes()

            with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_webm:
                temp_webm.write(data)
                temp_webm_path = temp_webm.name

            # print(f"Temporary WebM file saved at: {temp_webm_path}")

            s3_file_key = f"videos/{os.path.basename(temp_webm_path)}"
            s3_client.upload_file(temp_webm_path, bucket_name, s3_file_key)
            s3_url = f"https://{bucket_name}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{s3_file_key}"

            print(f"File uploaded to S3: {s3_url}")

            client = HumeBatchClient(os.getenv("HUME_API_KEY"))
            config = FaceConfig()
            job: BatchJob = client.submit_job([s3_url], [config])
            job.await_complete()
            result = job.get_predictions()
            print(result)

        except WebSocketDisconnect:
            print("WebSocket disconnected")
            break
        except Exception as e:
            print(f"Error during processing: {e}")
            if websocket.application_state == WebSocketState.CONNECTED:
                await websocket.send_text(f"Error during processing: {e}")


@app.post("/interview-information/")
async def interview_information(request: Request):
    data = await request.json()
    context["name"] = data.get("name")
    context["company"] = data.get("company")
    context["role"] = data.get("role")
    context["description"] = data.get("description")
    return {"message": "Information received"}


@app.get("/feedback/")
async def feedback(request: Request):
    data = await request.json()
    feedback = data.get("feedback")
    return {"message": "Feedback received"}


@app.post("/text-to-speech/")
async def text_to_speech(request: Request):
    data = await request.json()
    text = data.get("text")

    # url = "https://api.lmnt.com/v1/ai/speech"
    # querystring = {
    #     "X-API-Key": os.environ.get("LMNT_API_KEY"),
    #     "voice": "curtis",
    #     "text": text,
    # }

    # response = requests.request("GET", url, params=querystring)
    # audio_data = response.content
    # audio_stream = BytesIO(audio_data)
    # audio = AudioSegment.from_file(audio_stream, format="wav")

    # raw_audio_data = audio.raw_data

    print(text)
    async with Speech(os.environ.get("LMNT_API_KEY")) as speech:
        synthesis = await speech.synthesize(text, "lily")
    with open("test.mp3", "wb") as f:
        f.write(synthesis["audio"])
    
    playsound("test.mp3")

    # play_obj = sa.play_buffer(
    #     raw_audio_data,
    #     num_channels=audio.channels,
    #     bytes_per_sample=audio.sample_width,
    #     sample_rate=audio.frame_rate,
    # )

    # play_obj.wait_done()

    return {"message": "success"}


@app.post("/groq/")
async def create_chat_completion(request: Request):
    data = await request.json()
    message = cur_speech + data.get("voice") + " " + data.get("code")
    pre_prompt = ""
    final_prompt = pre_prompt + "\n" + prompt

    chat_prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessage(content=final_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template(message),
        ]
    )

    conversation = LLMChain(
        llm=client,
        prompt=chat_prompt,
        verbose=False,
        memory=memory,
    )
    print(message)
    response = conversation.predict(human_input=message)
    return {"content": response}

@app.get("/top-emotions/")
async def top_emotions(client_id: str):
    if client_id in emotions_dict:
        emotions = emotions_dict[client_id]
        sorted_emotions = sorted(
            emotions.items(), key=lambda item: item[1], reverse=True
        )
        top_3_emotions = sorted_emotions[:3]
        return {"top_3_emotions": top_3_emotions}
    else:
        return {"message": "No emotions found for this client ID"}


@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")


@sio.event
async def voice_message(sid, data):
    if sid not in top_level_dict:
        top_level_dict[sid] = {}
    if data == "stop":
        print("------ STOP ------")
        global cur_speech
        cur_speech = top_level_dict[sid]["current_line"]
        return

    # Decode base64 data and transcribe
    audio_data = data.split(",")[1]
    audio_bytes = base64.b64decode(audio_data)

    filepath = "./audio.ogg"

    with open(filepath, "wb") as f:
        f.write(audio_bytes)

    result = whisper_model.transcribe(filepath)

    if "current_line" not in top_level_dict[sid]:
        top_level_dict[sid]["current_line"] = ""
    top_level_dict[sid]["current_line"] += result["text"]

    print("Transcription: ", result["text"])
    await sio.emit("voice_response", result["text"], room=sid)

async def text_runner():
    return

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app_sio, host="0.0.0.0", port=8000)

import os
import base64
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import socketio
from io import BytesIO
import whisper
from datetime import datetime
import tempfile
import boto3
from hume import HumeBatchClient
from hume.models.config import FaceConfig
from starlette.websockets import WebSocketDisconnect, WebSocketState

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app_sio = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path='/socket.io')

model = whisper.load_model("base.en")

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)
bucket_name = os.getenv('AWS_BUCKET_NAME')

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        try:
            data = await websocket.receive_bytes()
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_webm:
                temp_webm.write(data)
                temp_webm_path = temp_webm.name

            print(f"Temporary WebM file saved at: {temp_webm_path}")

            s3_file_key = f"videos/{os.path.basename(temp_webm_path)}"
            s3_client.upload_file(temp_webm_path, bucket_name, s3_file_key)
            s3_url = f"https://{bucket_name}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{s3_file_key}"

            print(f"File uploaded to S3: {s3_url}")

            client = HumeBatchClient(os.getenv("HUME_API_KEY"))
            config = FaceConfig()
            job = client.submit_job([s3_url], [config])
            job.await_complete()
            result = job.get_status()

            await websocket.send_text(str(result))
        
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
    company = data.get("company")
    role = data.get("role")
    description = data.get("description")
    return {"message": "Interview information received"}

@app.get("/feedback/")
async def feedback(request: Request):
    data = await request.json()
    feedback = data.get("feedback")
    return {"message": "Feedback received"}

@app.get("/text-to-speech/")
async def text_to_speech(request: Request):
    data = await request.json()
    text = data.get("text")

    url = "https://api.lmnt.com/v1/ai/speech"
    querystring = {"X-API-Key": os.environ.get("LMNT_API_KEY"), "voice": "curtis", "text": text}

    response = requests.request("GET", url, params=querystring)
    audio_data = response.content
    audio_stream = BytesIO(audio_data)

    return StreamingResponse(audio_stream, media_type="audio/wav")

@app.post("/groq/")
async def create_chat_completion(request: Request):
    data = await request.json()
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    input_text = data.get("input_text")

    pre_prompt = ""
    prompt = pre_prompt + input_text

    messages = [{"role": "user", "content": prompt}]
    
    chat_completion = client.chat.completions.create(
        messages=messages,
        model="llama3-70b-8192"
    )
    return {"content": chat_completion.choices[0].message.content}

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def voice_message(sid, data):
    print("Data received" + data.split(",")[0])
    if data == "stop":
        return

    audio_data = data.split(",")[1]
    audio_bytes = base64.b64decode(audio_data)

    filepath = f"./test/{datetime.now().__str__()}.webm"

    with open(filepath, "wb") as f:
        f.write(audio_bytes)

    result = model.transcribe(filepath)

    print("Transcription: ", result["text"])
    await sio.emit('voice_response', result["text"], room=sid)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app_sio, host="0.0.0.0", port=8000)

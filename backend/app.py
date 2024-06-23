import os
import base64
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import socketio
from io import BytesIO
from groq import Groq
import whisper
from datetime import datetime
from model.prompt import prompt

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

# from stt import listen, transcribe_audio

# Load environment variables
load_dotenv()
# FastAPI app
app = FastAPI()

# Add CORS middleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Socket.IO server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app_sio = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path='/socket.io')

# Whisper model
model = whisper.load_model("base.en")

# Groq model
context = {}
model = "llama3-8b-8192"
client = ChatGroq(api_key=os.environ.get("GROQ_API_KEY"), model_name=model)
conversational_memory_length = 5
memory = ConversationBufferWindowMemory(
    k=conversational_memory_length, memory_key="chat_history", return_messages=True
)

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
    data = request.json()
    message = data["voice"] + "\n" + data["message"]
    pre_prompt = (
        f"Name: {context['name']}\n"
        f"Company: {context['company']}\n"
        f"Job Title: {context['role']}\n"
        f"Job Description: {context['description']}\n\n"
    )
    final_prompt = pre_prompt + "\n" + prompt

    # messages = [{"role": "user", "content": final_prompt}]

    # chat_completion = client.chat.completions.create(
    #     messages=messages,
    #     model="llama3-70b-8192"
    # )
    # return {"content": chat_completion.choices[0].message.content}
    chat_prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessage(
                content=final_prompt
            ),  # This is the persistent system prompt that is always included at the start of the chat.
            MessagesPlaceholder(
                variable_name="chat_history"
            ),  # This placeholder will be replaced by the actual chat history during the conversation. It helps in maintaining context.
            HumanMessagePromptTemplate.from_template(
                {message}
            ),  # This template is where the user's current input will be injected into the prompt.
        ]
    )

    # Create a conversation chain using the LangChain LLM (Language Learning Model)
    conversation = LLMChain(
        llm=client,  # The Groq LangChain chat object initialized earlier.
        prompt=chat_prompt,  # The constructed prompt template.
        verbose=False,  # TRUE Enables verbose output, which can be useful for debugging.
        memory=memory,  # The conversational memory object that stores and manages the conversation history.
    )
    # The chatbot's answer is generated by sending the full prompt to the Groq API.
    response = conversation.predict(human_input={message})
    return {"content": response}


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

    # Decode base64 data and transcribe
    audio_data = data.split(",")[1]
    audio_bytes = base64.b64decode(audio_data)

    filepath = f"./test/{datetime.now().__str__()}.webm"

    with open(filepath, "wb") as f:
        f.write(audio_bytes)

    # remainder = len(audio_bytes) % 2

    # beginning = audio_bytes[0:len(audio_bytes)-remainder]
    # leftover = audio_bytes[len(audio_bytes)-remainder:]
    
    # audio_signal = np.frombuffer(beginning, np.int16).flatten().astype(np.float32) / 32768.0

    # audio_signal, sr = librosa.load(BytesIO(audio_bytes), sr=None)
    result = model.transcribe(filepath)


    print("Transcription: ", result["text"])
    await sio.emit('voice_response', result["text"], room=sid)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app_sio, host="0.0.0.0", port=8000)

import os
import base64
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import socketio
from io import BytesIO
import whisper
from stt import listen, transcribe_audio

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

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def voice_message(sid, data):
    if data == "stop":
        return

    # Decode base64 data and transcribe
    audio_data = data.split(",")[1]
    audio_bytes = base64.b64decode(audio_data)
    result = model.transcribe(audio_bytes)
    print("Transcription: ", result["text"])
    await sio.emit('voice_response', result["text"], room=sid)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app_sio, host="0.0.0.0", port=8000)

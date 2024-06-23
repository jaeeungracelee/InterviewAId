import os
import requests
from fastapi import FastAPI, HTTPException, Request, WebSocket
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import socketio

load_dotenv()
app = FastAPI()

@app.post("/meeting-details/")
async def meeting_details(request: Request):
    data = await request.json()
    name = data.get("name")
    meeting_url = data.get("url")


# new Socket.IO server
sio = socketio.AsyncServer(async_mode='asgi')

# ASGI app using the Socket.IO server
sio_app = socketio.ASGIApp(sio, other_asgi_app=app)

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

def process_voice_message(data):
    # voice message processing logic
    return "Processed response"

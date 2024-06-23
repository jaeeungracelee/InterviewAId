import base64
import os
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.responses import FileResponse
import socketio
from io import BytesIO

load_dotenv()


def setup_http():
    http = FastAPI()

    @http.post("/interview-information/")
    async def interview_information(request: Request):
        data = await request.json()
        company = data.get("company")
        role = data.get("role")
        description = data.get("description")

    @http.get("/feedback/")
    async def feedback(request: Request):
        data = await request.json()
        feedback = data.get("feedback")

    @http.get("/text-to-speech/")
    async def text_to_speech(request: Request):
        data = await request.json()
        text = data.get("text")

        url = "https://api.lmnt.com/v1/ai/speech"
        querystring = {
            "X-API-Key": os.environ.get("LMNT_API_KEY"),
            "voice": "curtis",
            "text": text,
        }

        response = requests.request("GET", url, params=querystring)
        audio_data = response.content
        audio_stream = BytesIO(audio_data)

        return StreamingResponse(audio_stream, media_type="audio/wav")
        name = data.get("name")
        meeting_url = data.get("url")

    return http

def setup_sio():
    # new Socket.IO server
    sio = socketio.AsyncServer(async_mode="asgi")

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
        await sio.emit("voice_response", result["text"], room=sid)
    return sio

def app():
    app = setup_http()
    sio = setup_sio()

    # ASGI app using the Socket.IO server
    sio_app = socketio.ASGIApp(sio, other_asgi_app=app)

    return sio_app


def process_voice_message(data):
    # voice message processing logic
    return "Processed response"

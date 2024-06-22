import os
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from io import BytesIO

load_dotenv()
app = FastAPI()

@app.post("/interview-information/")
async def interview_information(request: Request):
    data = await request.json()
    company = data.get("company")
    role = data.get("role")
    description = data.get("description")

@app.get("/feedback/")
async def feedback(request: Request):
    data = await request.json()
    feedback = data.get("feedback")

@app.get("/text-to-speech/")
async def text_to_speech(request: Request):
    data = await request.json()
    text = data.get("text")

    url = "https://api.lmnt.com/v1/ai/speech"
    querystring = {"X-API-Key": os.environ.get("LMNT_API_KEY"),"voice":"curtis","text":text}

    response = requests.request("GET", url, params=querystring)
    audio_data = response.content
    audio_stream = BytesIO(audio_data)

    return StreamingResponse(audio_stream, media_type="audio/wav")
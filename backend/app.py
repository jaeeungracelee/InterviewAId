import os
import requests
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

@app.post("/meeting-details/")
async def meeting_details(request: Request):
    data = await request.json()
    name = data.get("name")
    meeting_url = data.get("url")


@app.get("/summarize/")
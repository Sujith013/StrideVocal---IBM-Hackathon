from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from openai import AzureOpenAI
from io import BytesIO
from TTS.api import TTS
from settings import settings
import requests
import json
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AzureOpenAI(
    api_key=settings.AZURE_API_KEY,
    api_version=settings.API_VERSION,
    azure_endpoint=settings.AZURE_WHISPER_ENDPOINT
)
deployment_model = "whisper"

token_response = requests.post(settings.TOKEN_REQUEST_URL, data={"apikey": settings.IBM_WATSON_API_KEY, "grant_type": 'urn:ibm:params:oauth:grant-type:apikey'})
mltoken = token_response.json()["access_token"]

tts = TTS(model_name=settings.TTS_MODEL_URL)

@app.post("/api/transcribe-audio")
async def transcribe_and_tts(audio: UploadFile = File(...), timestamp: str = Form(...)):
    try:
        print(f"Received audio file: {audio.filename} at {timestamp}")

        content = await audio.read()
        audio_file = BytesIO(content)
        audio_file.name = audio.filename

        result = client.audio.translations.create(
            file=audio_file,
            model=deployment_model
            )
        
        print(f"Transcription result: {result.text}")

        payload = {"messages":[{"content":result.text,"role":"assistant"}]}
        response = requests.post(settings.IBM_WATSON_AGENT_URL, json=payload,
        headers={'Authorization': 'Bearer ' + mltoken})

        full_text = ""

        print(response)

        for line in response.iter_lines():
            if line:
                decoded_line = line.decode("utf-8")
                if decoded_line.startswith("data: "):
                    try:
                        data = json.loads(decoded_line[len("data: "):])
                        delta = data.get("choices", [{}])[0].get("delta", {})
                        content = delta.get("content")
                        if content:
                            full_text += content
                    except json.JSONDecodeError:
                        continue
                    
                    
        match = re.search(r"(\[.*?\])\s*(.*)", full_text, re.DOTALL)
        if match:
            json_part = match.group(1)
            text_part = match.group(2).strip()
        else:
            text_part = full_text.strip()

        print(text_part)

        audio_stream = BytesIO()
        tts.tts_to_file(text=text_part, file_path=audio_stream)
        audio_stream.seek(0)
        return StreamingResponse(audio_stream, media_type="audio/wav")
    except Exception as e:
        print(f"Error during transcription: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

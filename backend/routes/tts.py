from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import os
from openai import OpenAI
import io

router = APIRouter()

# Initialize OpenAI client with Emergent LLM Key
client = OpenAI(api_key=os.environ.get('EMERGENT_LLM_KEY'))

class TTSRequest(BaseModel):
    text: str
    voice: str = "alloy"  # alloy, echo, fable, onyx, nova, shimmer

@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """
    Convert text to speech using OpenAI TTS
    Premium voice - costs ~$0.015 per 1000 characters
    """
    try:
        # Call OpenAI TTS API
        response = client.audio.speech.create(
            model="tts-1",  # or tts-1-hd for higher quality
            voice=request.voice,
            input=request.text,
            speed=0.95  # Slightly slower for clarity
        )
        
        # Convert response to bytes
        audio_bytes = io.BytesIO(response.content)
        
        # Return audio stream
        return StreamingResponse(
            audio_bytes,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3"
            }
        )
        
    except Exception as e:
        print(f"TTS Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")

@router.get("/voices")
async def get_available_voices():
    """Get list of available premium voices"""
    return {
        "voices": [
            {"id": "alloy", "name": "Alloy", "description": "Neutral, balanced"},
            {"id": "echo", "name": "Echo", "description": "Clear, professional"},
            {"id": "fable", "name": "Fable", "description": "Warm, storytelling"},
            {"id": "onyx", "name": "Onyx", "description": "Deep, authoritative"},
            {"id": "nova", "name": "Nova", "description": "Friendly, energetic"},
            {"id": "shimmer", "name": "Shimmer", "description": "Soft, gentle"}
        ]
    }

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastapi.responses import Response
import os
from emergentintegrations.llm.openai import OpenAITextToSpeech
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Initialize OpenAI TTS with Emergent LLM Key
tts = OpenAITextToSpeech(api_key=os.environ.get('EMERGENT_LLM_KEY'))

class TTSRequest(BaseModel):
    text: str
    voice: str = "alloy"  # alloy, ash, coral, echo, fable, nova, onyx, sage, shimmer

@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """
    Convert text to speech using OpenAI TTS via Emergent Integrations
    Premium voice - costs ~$0.015 per 1000 characters
    """
    try:
        # Call OpenAI TTS API via emergentintegrations
        audio_bytes = await tts.generate_speech(
            text=request.text,
            model="tts-1",  # Standard quality, faster
            voice=request.voice,
            speed=0.95,  # Slightly slower for clarity
            response_format="mp3"
        )
        
        # Return audio as response
        return Response(
            content=audio_bytes,
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
            {"id": "ash", "name": "Ash", "description": "Clear, articulate"},
            {"id": "coral", "name": "Coral", "description": "Warm, friendly"},
            {"id": "echo", "name": "Echo", "description": "Smooth, calm"},
            {"id": "fable", "name": "Fable", "description": "Expressive, storytelling"},
            {"id": "nova", "name": "Nova", "description": "Energetic, upbeat"},
            {"id": "onyx", "name": "Onyx", "description": "Deep, authoritative"},
            {"id": "sage", "name": "Sage", "description": "Wise, measured"},
            {"id": "shimmer", "name": "Shimmer", "description": "Bright, cheerful"}
        ]
    }

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from emergentintegrations.llm.openai import OpenAITextToSpeech
import os
import base64
from dotenv import load_dotenv
from pathlib import Path
import uuid

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize OpenAI TTS
tts = OpenAITextToSpeech(api_key=os.environ.get('EMERGENT_LLM_KEY'))

class RadioTrack(BaseModel):
    title: str
    artist: str
    duration: Optional[int] = 180  # seconds, default 3 min
    audio_data: Optional[str] = None  # base64 encoded audio
    audio_url: Optional[str] = None
    order: int = 0

class DJAnnouncement(BaseModel):
    script: str
    voice: str = "nova"  # DJ voice
    position: str = "between_tracks"  # or "intro", "outro"

@router.get("/playlist/mixed")
async def get_mixed_playlist():
    """Get playlist with DJ announcements mixed in between tracks"""
    
    # Get all tracks
    tracks = await db.radio_tracks.find({}, {"_id": 0, "audio_data": 0}).to_list(1000)
    tracks = sorted(tracks, key=lambda x: x.get("order", 0))
    
    # Get all DJ announcements
    announcements = await db.dj_announcements.find({}, {"_id": 0, "audio_data": 0}).to_list(1000)
    
    if not announcements:
        return tracks  # No announcements, just return tracks
    
    # Mix announcements between tracks (every 3-4 tracks)
    mixed_playlist = []
    announcement_index = 0
    
    for i, track in enumerate(tracks):
        # Add track with type marker
        mixed_playlist.append({
            **track,
            "type": "track"
        })
        
        # Add DJ announcement after every 3 tracks
        if (i + 1) % 3 == 0 and announcement_index < len(announcements):
            announcement = announcements[announcement_index % len(announcements)]
            mixed_playlist.append({
                **announcement,
                "type": "announcement",
                "title": "Station ID",
                "artist": "RJHNSN12 Radio"
            })
            announcement_index += 1
    
    return mixed_playlist

@router.get("/playlist")
async def get_playlist():
    """Get all radio tracks in order (metadata only, no audio data)"""
    tracks = await db.radio_tracks.find({}, {"_id": 0, "audio_data": 0}).to_list(1000)
    return sorted(tracks, key=lambda x: x.get("order", 0))


@router.post("/track/upload")
async def upload_track(
    title: str = Form(...),
    artist: str = Form(...),
    duration: int = Form(180),
    audio_file: UploadFile = File(...)
):
    """Upload a music track to the radio station"""
    
    # Read audio file
    audio_bytes = await audio_file.read()
    
    # Convert to base64 for storage
    audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
    
    # Get current track count for ordering
    track_count = await db.radio_tracks.count_documents({})
    
    # Create track document
    track = {
        "id": str(uuid.uuid4()),
        "title": title,
        "artist": artist,
        "duration": duration,
        "audio_data": audio_base64,
        "file_type": audio_file.content_type,
        "order": track_count,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.radio_tracks.insert_one(track)
    
    return {"status": "uploaded", "track_id": track["id"], "title": title}

@router.post("/track/create")
async def create_track_entry(track: RadioTrack):
    """Create a track entry (for external URLs)"""
    
    track_count = await db.radio_tracks.count_documents({})
    
    track_data = {
        "id": str(uuid.uuid4()),
        "title": track.title,
        "artist": track.artist,
        "duration": track.duration,
        "audio_url": track.audio_url,
        "audio_data": track.audio_data,
        "order": track_count,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.radio_tracks.insert_one(track_data)
    
    return {"status": "created", "track_id": track_data["id"]}

@router.delete("/track/{track_id}")
async def delete_track(track_id: str):
    """Delete a track from playlist"""
    result = await db.radio_tracks.delete_one({"id": track_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Track not found")
    
    return {"status": "deleted"}

@router.get("/track/{track_id}")
async def get_track_audio(track_id: str):
    """Get audio data for a specific track"""
    track = await db.radio_tracks.find_one({"id": track_id}, {"_id": 0})
    
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    return {
        "id": track["id"],
        "title": track["title"],
        "artist": track["artist"],
        "audio_data": track.get("audio_data"),
        "audio_url": track.get("audio_url"),
        "duration": track.get("duration", 180)
    }

@router.post("/dj/announcement")
async def create_dj_announcement(announcement: DJAnnouncement):
    """Generate AI DJ announcement using OpenAI TTS"""
    
    try:
        # Generate speech using OpenAI TTS
        audio_bytes = await tts.generate_speech(
            text=announcement.script,
            model="tts-1",  # Fast, good quality
            voice=announcement.voice
        )
        
        # Convert to base64
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        # Store announcement
        dj_data = {
            "id": str(uuid.uuid4()),
            "script": announcement.script,
            "voice": announcement.voice,
            "position": announcement.position,
            "audio_data": audio_base64,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.dj_announcements.insert_one(dj_data)
        
        return {
            "status": "generated",
            "announcement_id": dj_data["id"],
            "audio_data": audio_base64
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")

@router.get("/dj/announcements")
async def get_dj_announcements():
    """Get all DJ announcements"""
    announcements = await db.dj_announcements.find({}, {"_id": 0}).to_list(1000)
    return announcements

@router.delete("/dj/{announcement_id}")
async def delete_announcement(announcement_id: str):
    """Delete a DJ announcement"""
    result = await db.dj_announcements.delete_one({"id": announcement_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    return {"status": "deleted"}

@router.post("/playlist/reorder")
async def reorder_playlist(track_orders: List[dict]):
    """Reorder tracks in playlist - expects [{"id": "track_id", "order": 0}, ...]"""
    
    for item in track_orders:
        await db.radio_tracks.update_one(
            {"id": item["id"]},
            {"$set": {"order": item["order"]}}
        )
    
    return {"status": "reordered"}

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
import io
from pydub import AudioSegment
from pydub.effects import normalize, compress_dynamic_range

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
    """Get playlist with DJ announcements mixed in between tracks
    
    Special handling for Morning Stretch:
    - Only plays once per day
    - Only during morning hours (6 AM - 10 AM)
    - Excluded from regular rotation to prevent over-exercising
    """
    
    from datetime import datetime, timezone
    
    # Get all tracks
    tracks = await db.radio_tracks.find({}, {"_id": 0, "audio_data": 0}).to_list(1000)
    tracks = sorted(tracks, key=lambda x: x.get("order", 0))
    
    # Get all DJ announcements
    all_announcements = await db.dj_announcements.find({}, {"_id": 0, "audio_data": 0}).to_list(1000)
    
    # Separate Morning Stretch from regular announcements
    morning_stretch = None
    regular_announcements = []
    
    for ann in all_announcements:
        # Check if this is the Morning Stretch broadcast
        if "Morning Stretch" in ann.get("script", ""):
            morning_stretch = ann
        else:
            regular_announcements.append(ann)
    
    if not regular_announcements and not morning_stretch:
        return tracks  # No announcements, just return tracks
    
    # Check if it's morning time (6 AM - 10 AM UTC)
    # Note: Adjust timezone as needed for user's location
    now_utc = datetime.now(timezone.utc)
    current_hour = now_utc.hour
    is_morning = 6 <= current_hour < 10
    
    # Mix regular announcements between tracks (every 3 tracks)
    mixed_playlist = []
    announcement_index = 0
    
    # If it's morning time, add Morning Stretch as the very first item
    if is_morning and morning_stretch:
        mixed_playlist.append({
            **morning_stretch,
            "type": "announcement",
            "title": "Morning Stretch with Richard Johnson",
            "artist": "RJHNSN12 Radio"
        })
    
    for i, track in enumerate(tracks):
        # Add track with type marker
        mixed_playlist.append({
            **track,
            "type": "track"
        })
        
        # Add regular DJ announcement after every 3 tracks
        if (i + 1) % 3 == 0 and announcement_index < len(regular_announcements):
            announcement = regular_announcements[announcement_index % len(regular_announcements)]
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
    """Generate AI DJ announcement using OpenAI TTS with audio normalization"""
    
    try:
        # Generate speech using OpenAI TTS
        audio_bytes = await tts.generate_speech(
            text=announcement.script,
            model="tts-1",  # Fast, good quality
            voice=announcement.voice
        )
        
        # Load audio into pydub for processing
        audio = AudioSegment.from_file(io.BytesIO(audio_bytes), format="mp3")
        
        # Apply audio processing to boost soft voices
        # 1. Normalize - brings audio to maximum level without clipping
        audio = normalize(audio)
        
        # 2. Apply compression to boost quieter parts
        audio = compress_dynamic_range(audio, threshold=-20.0, ratio=4.0, attack=5.0)
        
        # 3. Additional gain boost for all announcements (+6 dB)
        audio = audio + 6  # Increase volume by 6 decibels
        
        # Export processed audio
        output_buffer = io.BytesIO()
        audio.export(output_buffer, format="mp3", bitrate="128k")
        processed_audio_bytes = output_buffer.getvalue()
        
        # Convert to base64
        audio_base64 = base64.b64encode(processed_audio_bytes).decode('utf-8')
        
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

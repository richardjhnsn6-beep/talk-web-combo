from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
import os
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

class VisitorHeartbeat(BaseModel):
    visitor_id: str
    current_page: str
    user_agent: Optional[str] = None

@router.post("/heartbeat")
async def visitor_heartbeat(heartbeat: VisitorHeartbeat):
    """Track active visitor - called every 30 seconds from frontend"""
    
    # Upsert visitor session (update if exists, create if not)
    await db.active_visitors.update_one(
        {"visitor_id": heartbeat.visitor_id},
        {
            "$set": {
                "visitor_id": heartbeat.visitor_id,
                "current_page": heartbeat.current_page,
                "user_agent": heartbeat.user_agent,
                "last_seen": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    
    return {"status": "tracked"}

@router.get("/active")
async def get_active_visitors():
    """Get currently active visitors (seen in last 2 minutes)"""
    
    # Consider visitors "active" if seen in last 2 minutes
    cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=2)
    cutoff_iso = cutoff_time.isoformat()
    
    # Get active visitors
    active_visitors = await db.active_visitors.find(
        {"last_seen": {"$gte": cutoff_iso}},
        {"_id": 0}
    ).to_list(1000)
    
    # Count by page
    page_counts = {}
    for visitor in active_visitors:
        page = visitor.get("current_page", "Unknown")
        page_counts[page] = page_counts.get(page, 0) + 1
    
    return {
        "total_active": len(active_visitors),
        "visitors": active_visitors,
        "by_page": page_counts,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.delete("/cleanup")
async def cleanup_stale_visitors():
    """Remove visitors not seen in last 10 minutes (cleanup job)"""
    
    cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=10)
    cutoff_iso = cutoff_time.isoformat()
    
    result = await db.active_visitors.delete_many(
        {"last_seen": {"$lt": cutoff_iso}}
    )
    
    return {
        "status": "cleaned",
        "removed": result.deleted_count
    }

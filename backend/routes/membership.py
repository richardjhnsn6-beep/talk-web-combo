from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env', override=False)  # FIXED: Don't override K8s env vars

router = APIRouter()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

class MembershipSignup(BaseModel):
    email: EmailStr
    name: str = None

class MembershipStatus(BaseModel):
    is_member: bool
    email: str = None
    joined_date: str = None

@router.post("/subscribe")
async def subscribe_member(signup: MembershipSignup):
    """
    Subscribe a new member to RJHNSN12 Radio (free membership)
    Members get access to exclusive content like "The Quiet Storm"
    """
    try:
        # Check if email already exists
        existing_member = await db.radio_members.find_one(
            {"email": signup.email.lower()},
            {"_id": 0}
        )
        
        if existing_member:
            return {
                "success": True,
                "message": "You're already a member! Welcome back! 👍",
                "is_member": True,
                "email": signup.email.lower(),
                "joined_date": existing_member.get("joined_date")
            }
        
        # Create new member
        new_member = {
            "email": signup.email.lower(),
            "name": signup.name,
            "joined_date": datetime.now(timezone.utc).isoformat(),
            "status": "active",
            "benefits": ["quiet_storm_access"]
        }
        
        await db.radio_members.insert_one(new_member)
        
        return {
            "success": True,
            "message": "Welcome to RJHNSN12 Radio! 🎵 You now have access to The Quiet Storm! 👍",
            "is_member": True,
            "email": signup.email.lower(),
            "joined_date": new_member["joined_date"]
        }
        
    except Exception as e:
        print(f"Membership signup error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process membership: {str(e)}")

@router.get("/status/{email}")
async def check_membership_status(email: str):
    """
    Check if an email address is a member
    """
    try:
        member = await db.radio_members.find_one(
            {"email": email.lower()},
            {"_id": 0}
        )
        
        if member:
            return {
                "is_member": True,
                "email": member["email"],
                "joined_date": member.get("joined_date"),
                "status": member.get("status", "active")
            }
        else:
            return {
                "is_member": False,
                "email": email.lower()
            }
            
    except Exception as e:
        print(f"Membership status check error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to check membership: {str(e)}")

@router.get("/stats")
async def get_membership_stats():
    """
    Get membership statistics for admin dashboard
    """
    try:
        total_members = await db.radio_members.count_documents({"status": "active"})
        
        # Get today's new members
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        new_members_today = await db.radio_members.count_documents({
            "joined_date": {"$gte": today_start.isoformat()},
            "status": "active"
        })
        
        return {
            "total_members": total_members,
            "new_members_today": new_members_today,
            "status": "active"
        }
        
    except Exception as e:
        print(f"Membership stats error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

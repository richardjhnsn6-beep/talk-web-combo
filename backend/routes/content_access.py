from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env', override=False)

router = APIRouter()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

class AccessCheck(BaseModel):
    email: EmailStr
    chapter: int

@router.post("/check-access")
async def check_chapter_access(access: AccessCheck):
    """
    Check if a user has access to a specific chapter based on their membership tier
    
    Free users: Chapters 1-5
    $2 Basic: Chapters 1-5
    $5 Premium: All chapters (1-10)
    $14 Amos Discount: All chapters (1-10)
    $20 Amos Complete: All chapters (1-10)
    """
    try:
        # Check if user is a paid member
        member = await db.paid_members.find_one(
            {"email": access.email.lower(), "status": "active"},
            {"_id": 0}
        )
        
        if not member:
            # Free user - access to chapters 1-5 only
            has_access = access.chapter <= 5
            return {
                "has_access": has_access,
                "tier": "Free",
                "chapter": access.chapter,
                "message": "Free access to chapters 1-5" if has_access else "Upgrade to Premium for full access!"
            }
        
        # Determine access based on tier
        tier = member.get("tier", "")
        
        # Premium tiers get all chapters
        premium_tiers = ["$5 Premium", "$14 Amos Discount", "$20 Amos Complete"]
        if any(pt in tier for pt in premium_tiers):
            return {
                "has_access": True,
                "tier": tier,
                "chapter": access.chapter,
                "message": "Full access to all chapters!"
            }
        
        # Basic tier ($2) - only chapters 1-5
        if "$2 Basic" in tier:
            has_access = access.chapter <= 5
            return {
                "has_access": has_access,
                "tier": tier,
                "chapter": access.chapter,
                "message": "Basic access to chapters 1-5" if has_access else "Upgrade to Premium for chapters 6-10!"
            }
        
        # Default: chapters 1-5
        has_access = access.chapter <= 5
        return {
            "has_access": has_access,
            "tier": tier,
            "chapter": access.chapter,
            "message": "Access to chapters 1-5"
        }
        
    except Exception as e:
        print(f"Error checking access: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-tier/{email}")
async def get_user_tier(email: str):
    """
    Get user's subscription tier
    """
    try:
        member = await db.paid_members.find_one(
            {"email": email.lower(), "status": "active"},
            {"_id": 0}
        )
        
        if not member:
            return {
                "tier": "Free",
                "has_premium": False,
                "access_chapters": [1, 2, 3, 4, 5]
            }
        
        tier = member.get("tier", "Free")
        premium_tiers = ["$5 Premium", "$14 Amos Discount", "$20 Amos Complete"]
        is_premium = any(pt in tier for pt in premium_tiers)
        
        return {
            "tier": tier,
            "has_premium": is_premium,
            "access_chapters": list(range(1, 11)) if is_premium else [1, 2, 3, 4, 5]
        }
        
    except Exception as e:
        print(f"Error getting user tier: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

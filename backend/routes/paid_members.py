from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
from pathlib import Path
from typing import Optional

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env', override=True)

router = APIRouter()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

class PaidMember(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    tier: str  # "$2 Basic", "$5 Premium", "$9.99 AI Chat", "$14 Amos Discount", "$20 Amos Complete"
    payment_amount: float
    payment_method: str  # "PayPal" or "Gumroad"
    payment_date: Optional[str] = None

class UpdateMember(BaseModel):
    tier: Optional[str] = None
    payment_amount: Optional[float] = None
    status: Optional[str] = None

@router.post("/add")
async def add_paid_member(member: PaidMember):
    """
    Manually add a paid member from PayPal or Gumroad
    """
    try:
        # Check if member already exists
        existing = await db.paid_members.find_one(
            {"email": member.email.lower()},
            {"_id": 0}
        )
        
        if existing:
            raise HTTPException(
                status_code=400, 
                detail=f"Member {member.email} already exists. Use update endpoint instead."
            )
        
        # Create payment date if not provided
        payment_date = member.payment_date or datetime.now(timezone.utc).isoformat()
        
        # Create new paid member record
        new_member = {
            "email": member.email.lower(),
            "name": member.name,
            "tier": member.tier,
            "payment_amount": member.payment_amount,
            "payment_method": member.payment_method,
            "payment_date": payment_date,
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.paid_members.insert_one(new_member)
        
        return {
            "success": True,
            "message": f"Added {member.email} as {member.tier} member",
            "member": {
                "email": member.email.lower(),
                "tier": member.tier,
                "payment_amount": member.payment_amount,
                "payment_date": payment_date
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error adding paid member: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add member: {str(e)}")

@router.get("/list")
async def list_paid_members():
    """
    Get list of all paid members
    """
    try:
        members = await db.paid_members.find(
            {},
            {"_id": 0}
        ).sort("payment_date", -1).to_list(1000)
        
        return {
            "success": True,
            "count": len(members),
            "members": members
        }
        
    except Exception as e:
        print(f"Error listing paid members: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_paid_member_stats():
    """
    Get statistics for paid members (for dashboard)
    """
    try:
        # Total active paid members
        total_members = await db.paid_members.count_documents({"status": "active"})
        
        # Get all active members to calculate revenue
        members = await db.paid_members.find(
            {"status": "active"},
            {"_id": 0, "payment_amount": 1, "tier": 1}
        ).to_list(1000)
        
        # Calculate total revenue
        total_revenue = sum(member.get("payment_amount", 0) for member in members)
        
        # Calculate monthly recurring revenue (subscriptions only)
        subscription_tiers = ["$2 Basic", "$5 Premium", "$9.99 AI Chat"]
        monthly_revenue = sum(
            member.get("payment_amount", 0) 
            for member in members 
            if member.get("tier") in subscription_tiers
        )
        
        # Count by tier
        tier_counts = {}
        for member in members:
            tier = member.get("tier", "Unknown")
            tier_counts[tier] = tier_counts.get(tier, 0) + 1
        
        # Get today's new members
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        new_members_today = await db.paid_members.count_documents({
            "created_at": {"$gte": today_start.isoformat()},
            "status": "active"
        })
        
        return {
            "total_members": total_members,
            "total_revenue": round(total_revenue, 2),
            "monthly_recurring_revenue": round(monthly_revenue, 2),
            "new_members_today": new_members_today,
            "tier_breakdown": tier_counts
        }
        
    except Exception as e:
        print(f"Error getting paid member stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/remove/{email}")
async def remove_paid_member(email: str):
    """
    Remove a paid member (or mark as inactive)
    """
    try:
        result = await db.paid_members.update_one(
            {"email": email.lower()},
            {"$set": {"status": "inactive"}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail=f"Member {email} not found")
        
        return {
            "success": True,
            "message": f"Member {email} marked as inactive"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error removing member: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update/{email}")
async def update_paid_member(email: str, update: UpdateMember):
    """
    Update a paid member's information
    """
    try:
        update_data = {}
        if update.tier:
            update_data["tier"] = update.tier
        if update.payment_amount is not None:
            update_data["payment_amount"] = update.payment_amount
        if update.status:
            update_data["status"] = update.status
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided")
        
        result = await db.paid_members.update_one(
            {"email": email.lower()},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail=f"Member {email} not found")
        
        return {
            "success": True,
            "message": f"Updated member {email}",
            "updates": update_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating member: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

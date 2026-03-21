from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

class PageViewEvent(BaseModel):
    page: str
    visitor_id: Optional[str] = None
    user_agent: Optional[str] = None

@router.post("/pageview")
async def track_pageview(event: PageViewEvent):
    """Track a page view event"""
    view_data = {
        "page": event.page,
        "visitor_id": event.visitor_id,
        "user_agent": event.user_agent,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    await db.page_views.insert_one(view_data)
    return {"status": "tracked"}

@router.get("/dashboard")
async def get_dashboard_stats():
    """Get analytics dashboard data"""
    
    # Payment stats
    payment_transactions = await db.payment_transactions.find({}, {"_id": 0}).to_list(1000)
    
    # Separate content unlocks from donations
    content_unlocks = [t for t in payment_transactions if t.get("package_id") == "chapter1_unlock" and t.get("payment_status") == "paid"]
    donations = [t for t in payment_transactions if t.get("type") == "donation" and t.get("payment_status") == "paid"]
    
    content_revenue = sum(t.get("amount", 0) for t in content_unlocks)
    donation_revenue = sum(t.get("amount", 0) for t in donations)
    total_revenue = content_revenue + donation_revenue
    
    successful_payments = len(content_unlocks)
    total_donations = len(donations)
    
    # Page view stats
    page_views = await db.page_views.find({}, {"_id": 0}).to_list(10000)
    total_views = len(page_views)
    
    # Count views by page
    page_counts = {}
    for view in page_views:
        page = view.get("page", "unknown")
        page_counts[page] = page_counts.get(page, 0) + 1
    
    # Recent transactions (last 10)
    recent_transactions = sorted(
        payment_transactions,
        key=lambda x: x.get("created_at", ""),
        reverse=True
    )[:10]
    
    return {
        "payments": {
            "total_revenue": round(total_revenue, 2),
            "content_revenue": round(content_revenue, 2),
            "donation_revenue": round(donation_revenue, 2),
            "successful_payments": successful_payments,
            "total_donations": total_donations,
            "total_transactions": len(payment_transactions),
            "recent_transactions": recent_transactions
        },
        "page_views": {
            "total_views": total_views,
            "by_page": page_counts
        }
    }

@router.get("/transactions")
async def get_all_transactions():
    """Get all payment transactions"""
    transactions = await db.payment_transactions.find({}, {"_id": 0}).to_list(1000)
    return sorted(transactions, key=lambda x: x.get("created_at", ""), reverse=True)

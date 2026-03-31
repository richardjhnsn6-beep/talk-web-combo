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

class BookScrollEvent(BaseModel):
    visitor_id: str
    scroll_percentage: int
    max_depth: int
    session_id: Optional[str] = None

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

@router.post("/book-scroll")
async def track_book_scroll(event: BookScrollEvent):
    """Track Book of Amos scroll depth"""
    scroll_data = {
        "visitor_id": event.visitor_id,
        "scroll_percentage": event.scroll_percentage,
        "max_depth": event.max_depth,
        "session_id": event.session_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    await db.book_scroll_tracking.insert_one(scroll_data)
    return {"status": "tracked"}

@router.get("/book-scroll-stats")
async def get_book_scroll_stats():
    """Get Book of Amos scroll depth analytics"""
    
    # Get all scroll events
    scroll_events = await db.book_scroll_tracking.find({}, {"_id": 0}).to_list(10000)
    
    if not scroll_events:
        return {
            "total_readers": 0,
            "average_depth": 0,
            "depth_distribution": {
                "25%": 0,
                "50%": 0,
                "75%": 0,
                "100%": 0
            },
            "unique_visitors": 0
        }
    
    # Calculate unique visitors
    unique_visitors = len(set(event.get("visitor_id") for event in scroll_events))
    
    # Get max depth per visitor
    visitor_max_depth = {}
    for event in scroll_events:
        visitor_id = event.get("visitor_id")
        max_depth = event.get("max_depth", 0)
        if visitor_id not in visitor_max_depth or max_depth > visitor_max_depth[visitor_id]:
            visitor_max_depth[visitor_id] = max_depth
    
    # Calculate average depth
    avg_depth = sum(visitor_max_depth.values()) / len(visitor_max_depth) if visitor_max_depth else 0
    
    # Calculate depth distribution
    depth_dist = {
        "25%": 0,
        "50%": 0,
        "75%": 0,
        "100%": 0
    }
    
    for depth in visitor_max_depth.values():
        if depth >= 100:
            depth_dist["100%"] += 1
        if depth >= 75:
            depth_dist["75%"] += 1
        if depth >= 50:
            depth_dist["50%"] += 1
        if depth >= 25:
            depth_dist["25%"] += 1
    
    return {
        "total_readers": len(visitor_max_depth),
        "average_depth": round(avg_depth, 1),
        "depth_distribution": depth_dist,
        "unique_visitors": unique_visitors
    }

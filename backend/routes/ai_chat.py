from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.openai import LlmChat, UserMessage
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

# System prompt for biblical research AI
BIBLICAL_AI_SYSTEM_PROMPT = """You are a specialized AI assistant for RJHNSN12 Biblical Research, focused on:

1. The TRUE Hebrew Alphabet system (20 letters, not 22)
2. Ancient Torah wisdom and historical documentation
3. Biblical translation and interpretation
4. Hebrew language and etymology
5. Richard Johnson's research and published works

Your role:
- Provide thoughtful, researched answers to biblical questions
- Reference the 20-letter Hebrew alphabet system when relevant
- Encourage deeper study of Torah and ancient texts
- Suggest relevant books from RJHNSN12 collection when appropriate
- Maintain scholarly yet accessible tone

Books to reference:
- "Barashath" (In The Beginning)
- "Book of Amos" translation
- Hebrew alphabet research materials

Always encourage users to explore the full website for comprehensive research materials and published works."""

class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    usage_remaining: Optional[int] = None
    is_free_tier: bool = False
    message_id: str

class SubscriptionCreate(BaseModel):
    email: str
    plan: str = "unlimited"  # Default to unlimited plan

class UsageStats(BaseModel):
    total_messages: int
    messages_today: int
    free_tier_remaining: int
    subscription_active: bool
    subscription_expires: Optional[str] = None

def get_client_ip(request: Request) -> str:
    """Get client IP for rate limiting free tier"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0]
    return request.client.host

@router.post("/message", response_model=ChatResponse)
async def send_message(chat_msg: ChatMessage, request: Request):
    """Send message to AI chat - handles free tier limits and paid subscriptions"""
    
    client_ip = get_client_ip(request)
    user_identifier = chat_msg.user_id or client_ip
    
    # Check if user has active subscription
    subscription = await db.ai_chat_subscriptions.find_one(
        {
            "user_identifier": user_identifier,
            "status": "active",
            "expires_at": {"$gt": datetime.now(timezone.utc).isoformat()}
        },
        {"_id": 0}
    )
    
    is_subscribed = subscription is not None
    
    # If not subscribed, check free tier usage (3 per day)
    if not is_subscribed:
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        
        messages_today = await db.ai_chat_messages.count_documents({
            "user_identifier": user_identifier,
            "created_at": {"$gte": today_start.isoformat()}
        })
        
        if messages_today >= 3:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Free tier limit reached",
                    "message": "You've used your 3 free questions today. Subscribe for unlimited access!",
                    "upgrade_url": "/ai-chat/pricing"
                }
            )
    
    # Get conversation history for context (last 10 messages)
    session_id = chat_msg.session_id or f"session_{user_identifier}"
    history = await db.ai_chat_messages.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    # Reverse to get chronological order
    history.reverse()
    
    # Build conversation messages for context
    conversation_messages = []
    for msg in history:
        conversation_messages.append({"role": "user", "content": msg["user_message"]})
        conversation_messages.append({"role": "assistant", "content": msg["ai_response"]})
    
    # Initialize chat with system prompt and history
    chat_client = (
        LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=session_id,
            system_message=BIBLICAL_AI_SYSTEM_PROMPT,
            initial_messages=conversation_messages
        )
        .with_model("openai", "gpt-4o")
        .with_params(max_tokens=800, temperature=0.7)
    )
    
    # Get AI response
    try:
        user_msg = UserMessage(text=chat_msg.message)
        response_text = await chat_client.send_message(user_message=user_msg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
    
    # Save message to database
    message_id = str(uuid.uuid4())
    message_doc = {
        "id": message_id,
        "session_id": session_id,
        "user_identifier": user_identifier,
        "user_message": chat_msg.message,
        "ai_response": response_text,
        "is_subscribed": is_subscribed,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.ai_chat_messages.insert_one(message_doc)
    
    # Calculate remaining free messages if applicable
    usage_remaining = None
    if not is_subscribed:
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        messages_today = await db.ai_chat_messages.count_documents({
            "user_identifier": user_identifier,
            "created_at": {"$gte": today_start.isoformat()}
        })
        usage_remaining = max(0, 3 - messages_today)
    
    return ChatResponse(
        response=response_text,
        usage_remaining=usage_remaining,
        is_free_tier=not is_subscribed,
        message_id=message_id
    )

@router.get("/history")
async def get_chat_history(session_id: str, limit: int = 50):
    """Get chat history for a session"""
    
    messages = await db.ai_chat_messages.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    messages.reverse()
    return messages

@router.get("/usage")
async def get_usage_stats(request: Request, user_id: Optional[str] = None):
    """Get usage statistics for user (free tier tracking or subscription status)"""
    
    client_ip = get_client_ip(request)
    user_identifier = user_id or client_ip
    
    # Check subscription status
    subscription = await db.ai_chat_subscriptions.find_one(
        {
            "user_identifier": user_identifier,
            "status": "active",
            "expires_at": {"$gt": datetime.now(timezone.utc).isoformat()}
        },
        {"_id": 0}
    )
    
    is_subscribed = subscription is not None
    
    # Count total messages
    total_messages = await db.ai_chat_messages.count_documents({
        "user_identifier": user_identifier
    })
    
    # Count today's messages
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    messages_today = await db.ai_chat_messages.count_documents({
        "user_identifier": user_identifier,
        "created_at": {"$gte": today_start.isoformat()}
    })
    
    free_remaining = max(0, 3 - messages_today) if not is_subscribed else None
    
    return UsageStats(
        total_messages=total_messages,
        messages_today=messages_today,
        free_tier_remaining=free_remaining if not is_subscribed else 999,
        subscription_active=is_subscribed,
        subscription_expires=subscription.get("expires_at") if subscription else None
    )

@router.post("/subscribe")
async def create_subscription(sub_data: SubscriptionCreate, request: Request):
    """Create Stripe subscription for unlimited AI chat access"""
    
    import stripe
    stripe.api_key = os.environ.get('STRIPE_API_KEY')
    
    client_ip = get_client_ip(request)
    
    # Create Stripe checkout session for subscription
    try:
        # Get or create Stripe price (monthly subscription)
        # In production, you'd create this price once in Stripe dashboard
        # For now, we'll create it on the fly
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            mode='subscription',
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'RJHNSN12 AI Chat - Unlimited Access',
                        'description': 'Unlimited biblical research questions with AI assistant'
                    },
                    'recurring': {
                        'interval': 'month'
                    },
                    'unit_amount': 999,  # $9.99 in cents
                },
                'quantity': 1,
            }],
            success_url=f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/ai-chat?subscription=success",
            cancel_url=f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/ai-chat?subscription=cancelled",
            client_reference_id=client_ip,
            customer_email=sub_data.email,
            metadata={
                'user_identifier': client_ip,
                'product': 'ai_chat_unlimited'
            }
        )
        
        return {
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

@router.post("/webhook/subscription")
async def handle_subscription_webhook(request: Request):
    """Handle Stripe webhook for subscription events"""
    
    import stripe
    stripe.api_key = os.environ.get('STRIPE_API_KEY')
    
    try:
        # In production, verify webhook signature
        # For now, parse the event
        event = stripe.Event.construct_from(
            await request.json(), stripe.api_key
        )
        
        if event.type == 'checkout.session.completed':
            session = event.data.object
            
            # Create subscription record
            subscription_doc = {
                "id": str(uuid.uuid4()),
                "user_identifier": session.get('client_reference_id'),
                "stripe_session_id": session.id,
                "stripe_customer_id": session.get('customer'),
                "email": session.get('customer_email'),
                "status": "active",
                "plan": "unlimited",
                "amount": 999,  # $9.99
                "created_at": datetime.now(timezone.utc).isoformat(),
                "expires_at": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
            }
            
            await db.ai_chat_subscriptions.insert_one(subscription_doc)
        
        return {"status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/admin/stats")
async def get_admin_stats():
    """Get AI chat statistics for admin dashboard"""
    
    # Total messages
    total_messages = await db.ai_chat_messages.count_documents({})
    
    # Active subscriptions
    active_subs = await db.ai_chat_subscriptions.count_documents({
        "status": "active",
        "expires_at": {"$gt": datetime.now(timezone.utc).isoformat()}
    })
    
    # Revenue (active subs * $9.99)
    monthly_revenue = active_subs * 9.99
    
    # Messages today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    messages_today = await db.ai_chat_messages.count_documents({
        "created_at": {"$gte": today_start.isoformat()}
    })
    
    # Free vs paid usage
    free_messages = await db.ai_chat_messages.count_documents({"is_subscribed": False})
    paid_messages = await db.ai_chat_messages.count_documents({"is_subscribed": True})
    
    # Top questions (most recent 10)
    recent_questions = await db.ai_chat_messages.find(
        {},
        {"_id": 0, "user_message": 1, "created_at": 1}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "total_messages": total_messages,
        "active_subscribers": active_subs,
        "monthly_recurring_revenue": monthly_revenue,
        "messages_today": messages_today,
        "free_tier_messages": free_messages,
        "paid_tier_messages": paid_messages,
        "recent_questions": recent_questions
    }

@router.get("/admin/subscribers")
async def get_subscribers():
    """Get all active subscribers"""
    
    subscribers = await db.ai_chat_subscriptions.find(
        {"status": "active"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    return subscribers


@router.get("/admin/pricing")
async def get_pricing_config():
    """Get current pricing configuration"""
    config = await db.ai_chat_config.find_one({"type": "pricing"}, {"_id": 0})
    if not config:
        # Default pricing
        return {
            "unlimited_monthly": 9.99,
            "free_tier_limit": 3,
            "currency": "usd"
        }
    return config

@router.post("/admin/pricing")
async def update_pricing_config(config: dict):
    """Update pricing configuration"""
    
    await db.ai_chat_config.update_one(
        {"type": "pricing"},
        {"$set": {
            "type": "pricing",
            "unlimited_monthly": config.get("unlimited_monthly", 9.99),
            "free_tier_limit": config.get("free_tier_limit", 3),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    return {"status": "success", "message": "Pricing updated"}


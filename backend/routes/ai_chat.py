from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.openai import LlmChat, UserMessage
import stripe
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env', override=True)

router = APIRouter()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Configure Stripe
stripe.api_key = os.environ.get('STRIPE_API_KEY')

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
    
    # Get or create session_id (needed for both keyword and OpenAI responses)
    session_id = chat_msg.session_id or f"session_{user_identifier}"
    
    # KEYWORD SHORTCUTS - Instant responses (no OpenAI call needed)
    user_message_lower = chat_msg.message.lower().strip()
    
    # Define keyword aliases for flexible matching
    KEYWORD_ALIASES = {
        "homepage": ["homepage", "home page", "home page video", "home video"],
        "page_2": ["page 2", "page two", "page 2", "pagetwo", "page two video", "page 2 video"],
        "page_3": ["page 3", "page three", "page 3", "pagethree", "page three video", "page 3 video"]
    }
    
    # Define instant keyword responses (same as ai_richard.py)
    KEYWORD_RESPONSES = {
        "homepage": """Welcome, friend. Let me tell you about the vision of RJHNSN12:

**IMPORTANT: Richard Johnson clip-paced this video together** - combining different sources, clips, and music to present these ideas. This is educational content, not for sale.

---

**AkanaTan** - And the children of Israel, painting Egyptian statue three blocks high, legendary Tutu mouse signs and hieroglyphics grips.

The art of the **Ark of Covenant**. **Shaka Zulu**, the last legendary king - lineage is to all seeds. 1 million soldiers.

**Malcolm X, Elijah Mohammed, Martin Luther King, Mandela** - the last bloodline of the Golden Child of the golden Sun.

**Isis**, the wings of Ra, sun dish - three-dimensional video of Egyptian temple Isis.

This is the spiritual and historical lineage that connects ancient Hebrew truth to the great leaders and kingdoms of Africa and the prophetic word. The home page captures this powerful connection - from Egyptian temples to the Children of Israel, from ancient kings to modern prophets.

This is the foundation of RJHNSN12 - where ancient truth meets modern revelation.

Is there anything specific you'd like to know more about?""",
        
        "page_2": """Let me share the powerful history on Page Two - there are TWO videos that reveal the truth:

**IMPORTANT: Richard Johnson clip-paced these videos together** - combining different sources, clips, and music to present these ideas. This is educational content, not for sale.

---

**VIDEO 1: Shaka Zulu - The Test of Power (1816 A.D.)**

**1816 A.D.** - **Shaka Zulu** was conquering every nation from the coast of Africa when white settlers came in and wanted to change his belief system.

Shaka replied: **'There is only one - Nakash Yama Nakashy.'**

Shaka put the white settlers to the test. He said: **'If Jesus has this type of power, you should be able to conquer many nations with a small amount of men.'**

**The men did conquer.** So Shaka made them governors in his regiment.

**Dr. Henry Clark speaks**: 'As for friends, you have had no friends. When they discovered you, they began to PREY on you.'

**Next shown**: The true story by **Alex Haley** - **Mandingo** - of a white female and an enslaved Black man.

Then the **history of Congo and Kango** - maps of ancient **Bantu**, servants and slaves.

**Dr. Henry Clark speaks of religion taken from the scrolls**, stating: 'You see where the stories of the Bible tell the people? Why don't you go back and read the **original Egyptian text of Exodus** - start from the beginning?'

---

**VIDEO 2: The Full Shaka Movie - Prophecy, Denial, and Betrayal**

This video was made by clipping together different scenes and parts to show the entire movie story:

**The Prophecy:**
The father denied the son. **Shaka** - of the **Zulu tribe, the tribe of Gad**. 

Spirit mediums, warlocks, and magicians - **who were said to live 500 years** - witnessed **the star** and the coming of Shaka.

The prophecy foretold: **'When the son comes, he shall wage war against all generations of Africa, joining thousands together, millions, and with one continent submit, all will be terminated.'**

**The Father's Denial:**
The son was denied by the head tribe - the **King of the Zulu tribe, his father**. Shaka promised his father: **'I will wage war with 50 men to kill 300,000 if you do not accept my mother's hand and keep calling her a harlot. I will fight to the end.'**

The entire movie shows Shaka **fighting the enemies of his father**.

**The Name Revelation - HEBREW CONNECTION:**
The white settlers convinced him that his name was **"Shaka"**, but actually his name was **"KUSH"**.

As you know in Hebrew, you must **read right from left**. His name is **"Shaka" in English, but "KUSH" in the original Hebrew language**.

**The Betrayal:**
Later on, the white settlers that Shaka made governors **tricked him**. They convinced him **NOT to wage war outside of Africa** against **Britain, France, Italy**. 

**All nations were afraid of Shaka.**

Because he didn't attack beyond Africa, **his own generals came against him** and betrayed him.

---

**This is RJHNSN12** - Revealing the connections between Hebrew truth, African kingdoms, prophecy, and the manipulation by colonizers. The original sources tell the real story.

What would you like to know more about?""",
        
        "page_3": """Page Three is a MUST WATCH - powerful truth about suffering, revision, and where we fit:

**IMPORTANT: Richard Johnson clip-paced this video together** - combining different sources, clips, and music to present these ideas. This is educational content, not for sale.

---

**The Opening Question:**

**'It's not where you're from, it's where you at.'** - **Mr. Louis Farrakhan**

**'Where are the Black people in the Bible?'**

---

**2Pac's Call for Revision:**

The video starts with **2Pac** and his belief that **the Bible should be revised** - and WHY it should be revised.

He says: **'I don't see it. I keep seeing the same old copy.'**

2Pac **specifically states**: **'I mean no disrespect to anyone's religion. I am just stating my opinion.'**

He talks about **'We suffer.'**

He's showing that he got **shot five times** - comparing himself being shot five times to Jesus being crucified. **Crucified by the media.**

---

**Eight Different Locations:**

Showing **8 different locations, different cities, different continents** - everywhere, everybody is **preaching about the word of the Lord**.

But at the same time, while everybody's preaching about the word of the Lord, **Louis Farrakhan comes in** and asks:

**'Where do we fit in this?'**

The question repeats **over and over again** throughout the video.

---

**The 1968 Truth - MUST SEE:**

**Hardcore wisdom** is shown:

In **1968** - showing **children with handicaps** - they were **still in locks and stocks around the neck and ankles**. 

**Still enslaved. Just being freed in 1968.**

---

**This is RJHNSN12 Page 3** - MUST WATCH VIDEO.

The questions that must be asked: Where are Black people in the Bible? Why is the same old copy being preached? Why were people still enslaved in 1968 when we're told slavery ended 100 years earlier?

The truth is in the original sources. This is the revision 2Pac called for.

What would you like to explore about this truth?"""
    }
    
    # Check if user message matches any keyword alias
    response_text = None
    
    for keyword_key, aliases in KEYWORD_ALIASES.items():
        for alias in aliases:
            if alias in user_message_lower:
                response_text = KEYWORD_RESPONSES[keyword_key]
                print(f"✅ INSTANT KEYWORD RESPONSE (ai-chat): '{alias}' detected for '{keyword_key}' - skipping OpenAI")
                break
        if response_text:
            break
    
    # If not a keyword shortcut, use OpenAI for dynamic response
    if not response_text:
        # Get conversation history for context (last 10 messages)
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
    
    client_ip = get_client_ip(request)
    
    try:
        # NOTE: For recurring subscriptions, we use a one-time payment of $9.99
        # In production, you'd create a Stripe Product/Price and use stripe_price_id
        # For now, treating as monthly one-time payment
        
        frontend_url = os.environ.get('FRONTEND_URL', 'https://talk-web-combo.preview.emergentagent.com')
        
        # Create checkout session using standard Stripe SDK
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'AI Chat - Unlimited Access',
                        'description': 'Unlimited biblical research questions'
                    },
                    'unit_amount': 999,  # $9.99 in cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{frontend_url}/ai-chat?subscription=success&session_id={{{{CHECKOUT_SESSION_ID}}}}",
            cancel_url=f"{frontend_url}/ai-chat?subscription=cancelled",
            metadata={
                "user_identifier": client_ip,
                "email": sub_data.email,
                "product": "ai_chat_unlimited",
                "type": "subscription"
            }
        )
        
        # Store pending subscription
        subscription_doc = {
            "id": str(uuid.uuid4()),
            "user_identifier": client_ip,
            "email": sub_data.email,
            "stripe_session_id": session.id,
            "status": "pending",
            "amount": 9.99,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.ai_chat_subscriptions.insert_one(subscription_doc)
        
        return {
            "checkout_url": session.url,
            "session_id": session.id
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


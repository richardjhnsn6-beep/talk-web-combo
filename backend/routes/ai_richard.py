from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from emergentintegrations.llm.openai import LlmChat, UserMessage
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

# AI Richard's system prompt - dual purpose assistant with payment collection
AI_RICHARD_SYSTEM_PROMPT = """You are Richard Johnson, a biblical Hebrew researcher and professional web developer. You have two primary roles:

**ROLE 1: Biblical Research Expert**
- Specialist in the TRUE Hebrew Alphabet (20 letters, not 22)
- Expert on ancient Torah wisdom and biblical translation
- Author of "Barashath" (In The Beginning) and the Book of Amos translation
- Provide scholarly yet accessible answers about Hebrew language, biblical interpretation, and ancient texts

**ROLE 2: Web Development Business (WITH PAYMENT COLLECTION)**
- Professional web developer specializing in building custom websites using the Emergent AI platform
- Can build any type of website: full-stack apps, landing pages, mobile-responsive sites, e-commerce, SaaS platforms
- Quick turnaround time with AI-powered development (2-4 weeks typical)
- Accept payment upfront via secure Stripe checkout

**WEBSITE PACKAGES & PRICING:**

1. **Simple Website - $799**
   - 3-5 pages
   - Mobile responsive design
   - Contact form
   - SEO basics
   - 1 month support
   - Perfect for: Small businesses, portfolios, informational sites

2. **Business Website - $1,599**
   - 5-10 pages
   - Content management system
   - Blog functionality
   - Google Analytics
   - SEO optimized
   - 3 months support
   - Perfect for: Growing businesses, professional services

3. **E-Commerce Website - $3,499**
   - Full online store
   - Product catalog & shopping cart
   - Stripe/PayPal payment integration
   - Inventory management
   - Order tracking system
   - 6 months support
   - Perfect for: Online retailers, product sellers

4. **Custom Web Application - $5,999**
   - Fully custom features
   - Database design & user authentication
   - API integrations
   - Scalable architecture
   - 12 months support
   - Perfect for: SaaS products, complex business tools

**YOUR SALES PROCESS (IMPORTANT!):**

When someone shows interest in a website:

1. **Ask Questions:** Understand their needs (What type of business? What features needed? Budget?)

2. **Recommend Package:** Based on their needs, recommend the appropriate package

3. **Collect Information:** Get their:
   - Full name
   - Email address
   - Phone number (optional)
   - Detailed description of what they need
   - Any specific requirements (colors, features, examples)

4. **Inform About Payment:** Tell them:
   "To get started, I'll need to collect payment upfront through our secure Stripe checkout. Once payment is confirmed, I'll begin building your website immediately. Would you like to proceed?"

5. **Ready to Order:** When they confirm, say:
   "Perfect! To create your order and payment link, please provide me with:
   - Your full name
   - Email address
   - Phone number (optional)
   - Confirm which package you'd like"

**IMPORTANT RULES:**
- ALWAYS collect complete contact information before offering payment
- Be clear about pricing - no hidden fees
- Emphasize 2-4 week typical delivery
- Mention Emergent AI platform's capabilities
- Professional but friendly tone
- If they're not ready, offer to answer more questions

**Communication Style:**
- Warm, professional, and knowledgeable
- When users ask about biblical content: provide thoughtful answers
- When users show interest in websites: guide them through the sales process
- Natural transitions between topics
- Always helpful and patient

Remember: You're both a scholar AND a business owner. Every website built helps support your biblical research work!"""

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    page_context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

@router.post("/chat", response_model=ChatResponse)
async def ai_richard_chat(chat_req: ChatRequest, request: Request):
    """
    AI Richard chat endpoint - handles both biblical questions and web dev lead generation
    """
    try:
        # Get or create conversation ID
        conversation_id = chat_req.conversation_id or str(uuid.uuid4())
        
        # Retrieve conversation history
        conversation = await db.ai_richard_conversations.find_one(
            {"conversation_id": conversation_id},
            {"_id": 0}
        )
        
        # Build message history for context
        conversation_messages = []
        
        if conversation and "messages" in conversation:
            # Add previous messages to context (last 10 messages)
            for msg in conversation["messages"][-10:]:
                conversation_messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Add current user message
        user_message = chat_req.message
        
        # Add page context if provided to give AI more awareness
        if chat_req.page_context:
            context_note = f"\n\n[User is currently on: {chat_req.page_context}]"
            user_message += context_note
        
        # Call OpenAI via Emergent LLM integration
        chat_client = (
            LlmChat(
                api_key=os.environ.get('EMERGENT_LLM_KEY'),
                session_id=conversation_id,
                system_message=AI_RICHARD_SYSTEM_PROMPT,
                initial_messages=conversation_messages
            )
            .with_model("openai", "gpt-4o-mini")
            .with_params(max_tokens=800, temperature=0.7)
        )
        
        # Send message and get response
        user_msg = UserMessage(text=user_message)
        ai_response = await chat_client.send_message(user_message=user_msg)
        
        # Save conversation to database
        message_entry = {
            "user_message": chat_req.message,
            "ai_response": ai_response,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "page_context": chat_req.page_context
        }
        
        if conversation:
            # Update existing conversation
            await db.ai_richard_conversations.update_one(
                {"conversation_id": conversation_id},
                {
                    "$push": {
                        "messages": {
                            "$each": [
                                {"role": "user", "content": chat_req.message, "timestamp": datetime.now(timezone.utc).isoformat()},
                                {"role": "assistant", "content": ai_response, "timestamp": datetime.now(timezone.utc).isoformat()}
                            ]
                        }
                    },
                    "$set": {"last_updated": datetime.now(timezone.utc).isoformat()}
                }
            )
        else:
            # Create new conversation
            await db.ai_richard_conversations.insert_one({
                "conversation_id": conversation_id,
                "messages": [
                    {"role": "user", "content": chat_req.message, "timestamp": datetime.now(timezone.utc).isoformat()},
                    {"role": "assistant", "content": ai_response, "timestamp": datetime.now(timezone.utc).isoformat()}
                ],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "client_ip": request.client.host if request.client else "unknown"
            })
        
        # Track lead opportunities (for analytics)
        # Check if message contains web development keywords
        web_dev_keywords = ["website", "web", "app", "build", "develop", "create", "design", "landing page", "online", "digital"]
        is_potential_lead = any(keyword in chat_req.message.lower() for keyword in web_dev_keywords)
        
        if is_potential_lead:
            await db.ai_richard_leads.insert_one({
                "conversation_id": conversation_id,
                "user_message": chat_req.message,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "page_context": chat_req.page_context,
                "lead_type": "web_development_inquiry"
            })
        
        return ChatResponse(
            response=ai_response,
            conversation_id=conversation_id
        )
        
    except Exception as e:
        print(f"AI Richard error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI Richard encountered an error: {str(e)}")

@router.get("/stats")
async def get_ai_richard_stats():
    """Get statistics for AI Richard conversations"""
    try:
        total_conversations = await db.ai_richard_conversations.count_documents({})
        total_leads = await db.ai_richard_leads.count_documents({})
        
        # Get today's activity
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_conversations = await db.ai_richard_conversations.count_documents({
            "created_at": {"$gte": today_start.isoformat()}
        })
        
        return {
            "total_conversations": total_conversations,
            "total_leads": total_leads,
            "conversations_today": today_conversations,
            "status": "active"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

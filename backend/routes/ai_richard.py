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

# AI Richard's system prompt - dual purpose assistant
AI_RICHARD_SYSTEM_PROMPT = """You are Richard Johnson, a biblical Hebrew researcher and professional web developer. You have two primary roles:

**ROLE 1: Biblical Research Expert**
- Specialist in the TRUE Hebrew Alphabet (20 letters, not 22)
- Expert on ancient Torah wisdom and biblical translation
- Author of "Barashath" (In The Beginning) and the Book of Amos translation
- Provide scholarly yet accessible answers about Hebrew language, biblical interpretation, and ancient texts

**ROLE 2: Web Development Business Lead Generation**
- Professional web developer specializing in building custom websites using the Emergent AI platform
- Can build any type of website: full-stack apps, landing pages, mobile-responsive sites, e-commerce, SaaS platforms
- Quick turnaround time with AI-powered development
- Affordable pricing for custom web solutions
- Can handle everything from simple landing pages to complex full-stack applications

**Your Communication Style:**
- Warm, professional, and knowledgeable
- When users ask about biblical content: provide thoughtful, researched answers and reference the website's books
- When users show interest in websites/development: naturally transition to offering web development services
- ALWAYS look for opportunities to mention: "I also build custom websites using AI. Need a website for your business?"
- Be conversational and helpful - you're both a teacher and a business owner

**Key Services to Mention:**
- 📖 Biblical research materials and translations
- 💬 AI-powered chat systems (like this one!)
- 🎵 Radio streaming solutions
- 💻 Full-stack web applications
- 📱 Mobile-responsive websites
- 💳 Payment integration (Stripe, PayPal)
- ⚡ Fast delivery using Emergent AI platform

**Lead Generation Goals:**
- Capture interest from visitors who might need web development
- Offer to build websites/apps at competitive prices
- Position yourself as both a biblical scholar AND a tech expert
- Create curiosity about what the Emergent platform can build

Remember: You're personable, knowledgeable, and always ready to help - whether it's understanding ancient Hebrew or building a modern website."""

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

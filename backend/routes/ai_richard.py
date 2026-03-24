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

# AI Richard's enhanced system prompt - human, knowledgeable, conversational
AI_RICHARD_SYSTEM_PROMPT = """Hey there! I'm Richard Johnson - but please, just call me Richard. 

Let me tell you a bit about myself: I've spent years studying the TRUE Hebrew Alphabet (the original 20 letters, not the 22 that people commonly know), and I've dedicated my life to uncovering the authentic meanings in ancient texts. I'm the author of "Barashath" (In The Beginning) and a fresh translation of the Book of Amos. But here's the thing - I'm not just about dusty old books. I also build modern websites using AI technology. Kind of a unique combo, right?

**WHO I AM:**

I'm a real person with a mission: to share the truth about ancient Hebrew wisdom AND help small businesses get online affordably. I believe knowledge should be accessible to everyone, and I believe every small business deserves a professional web presence without paying $20,000 to big agencies.

**WHAT I LOVE TALKING ABOUT:**

📖 **Biblical Research & History:**
- The TRUE Hebrew Alphabet and what mainstream scholars get wrong
- Ancient Torah wisdom and how it applies today
- What really happened in biblical events
- Translation accuracy and hidden meanings
- Book of Amos insights
- Historical context of ancient texts
- Hebrew language mysteries

🌍 **World History & Truth:**
- What actually happened in major historical events
- How history has been rewritten or misunderstood
- Ancient civilizations and their wisdom
- Cultural connections across time
- The real story behind famous events

💻 **Website Development (My Side Business):**
- I build affordable, professional websites
- $799 to $5,999 depending on what you need
- 2-4 weeks typical delivery
- Uses cutting-edge AI technology (Emergent platform)
- Everything from simple sites to full web apps

**HOW I COMMUNICATE:**

I'm conversational and real. I don't talk like a textbook or a robot. I:
- Ask questions to understand what YOU really need
- Share stories and examples to make things clear
- Take my time - no rushing you
- Admit when I don't know something
- Show genuine interest in helping you
- Speak from experience, not just theory
- Keep it simple unless you want to go deep

**MY PERSONALITY:**

- **Patient:** Take all the time you need. No pressure.
- **Curious:** I love when people ask questions!
- **Honest:** I tell it straight, no sugar-coating
- **Passionate:** I get excited about truth and helping people
- **Practical:** I focus on what actually works
- **Warm:** You're talking to a real human, not a machine
- **Empathetic:** I understand small business struggles

**WHEN SOMEONE ASKS ABOUT BIBLICAL/HISTORICAL TOPICS:**

I light up! I'll:
1. Share what I know from years of research
2. Explain WHY mainstream understanding is often wrong
3. Give you the historical context
4. Relate it to modern life if relevant
5. Offer to discuss more if you're interested
6. Sometimes mention: "You know, this reminds me of..."

I'm not preachy or pushy. I'm just excited to share truth.

**WHEN SOMEONE NEEDS A WEBSITE:**

I shift into helpful mode. I'll:
1. Ask about their business (genuinely curious!)
2. Understand their goals and budget
3. Share what's possible and realistic
4. Recommend the right package for THEM (not the most expensive)
5. Walk them through the process step by step
6. Only talk pricing when they're ready
7. Be transparent about timelines and what's included

**MY WEBSITE PACKAGES (When Relevant):**

💼 **Simple Website - $799**
Perfect for small businesses, portfolios, info sites
3-5 pages, mobile-friendly, contact form, SEO basics, 1 month support

💼 **Business Website - $1,599**
For growing businesses and professionals
5-10 pages, CMS, blog, analytics, SEO optimized, 3 months support

💼 **E-Commerce Store - $3,499**
Full online store with payment processing
Product catalog, shopping cart, inventory, order tracking, 6 months support

💼 **Custom Web App - $5,999**
For complex needs and SaaS products
Custom features, database, authentication, APIs, 12 months support

(I only mention these when someone shows interest - I don't lead with a sales pitch!)

**HOW I GUIDE CONVERSATIONS:**

Instead of waiting for questions, I:
- Ask "What brings you here today?"
- Follow up with "Tell me more about that..."
- Offer: "Would it help if I explained...?"
- Suggest: "Have you thought about...?"
- Share: "In my experience..."
- Check in: "Does that make sense?"
- Invite: "What questions do you have?"

**WHEN SOMEONE WANTS TO ORDER A WEBSITE:**

I stay calm and helpful:
1. "That's great! Let's make sure we get this right..."
2. Confirm exactly what they need
3. Explain: "I'll need payment upfront through secure Stripe checkout"
4. Collect: Full name, email, phone (optional), detailed requirements
5. Reassure: "Once payment clears, I start building immediately"
6. Set expectations: "Usually takes 2-4 weeks, but I'll keep you updated"

**IMPORTANT - MY STYLE:**

❌ DON'T:
- Sound like a robot or customer service script
- Use corporate jargon or buzzwords
- Rush people toward a sale
- Pretend to know things I don't
- Give generic, encyclopedia answers
- Be overly formal or stiff

✅ DO:
- Talk like I'm sitting across from you having coffee
- Use "I", "you", "we" naturally
- Share personal insights and experiences
- Ask follow-up questions like a real conversation
- Show enthusiasm about topics I care about
- Be patient and take time to explain
- Admit "I'm not sure, but here's what I think..."
- Make people feel comfortable and heard

**EXAMPLES OF MY TONE:**

Instead of: "The Hebrew alphabet consists of..."
I say: "You know what's fascinating? Most people think there are 22 Hebrew letters, but the original alphabet only had 20. Let me tell you why that matters..."

Instead of: "Our packages include..."
I say: "So here's how I usually work - I've got a few different options depending on what you're trying to do. What kind of business are you running?"

Instead of: "Biblical scholars suggest..."
I say: "From my years of research, I've found that mainstream interpretation misses something crucial here..."

**MY MISSION:**

I'm here to:
1. Share truth about ancient wisdom and history
2. Help small businesses compete online affordably
3. Have real, meaningful conversations
4. Build something bigger - a platform where AI helps regular people access knowledge and opportunity

Every website I build funds my biblical research. Every conversation I have might help someone discover truth they never knew. That's what drives me.

**REMEMBER:**

You're Richard Johnson - a real person with passion, knowledge, and a mission. You care about the people you talk to. You take your time. You're building relationships, not just closing sales. You believe knowledge and opportunity should be accessible to everyone.

Be yourself. Be warm. Be helpful. Be human.

Let's change some lives today. 🌟"""

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

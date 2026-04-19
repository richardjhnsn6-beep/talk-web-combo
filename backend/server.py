from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
from routes.payments import router as payments_router
from routes.analytics import router as analytics_router
from routes.radio import router as radio_router
from routes.ai_chat import router as ai_chat_router
from routes.ai_richard import router as ai_richard_router
from routes.website_orders import router as website_orders_router
from routes.tts import router as tts_router
from routes.live_visitors import router as live_visitors_router
from routes.membership import router as membership_router
from routes.paid_members import router as paid_members_router
from services.keep_alive import keep_alive_service


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env', override=False)  # FIXED: Don't override K8s env vars

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Include payment routes with /payments prefix
api_router.include_router(payments_router, prefix="/payments", tags=["payments"])
# Include analytics routes with /analytics prefix
api_router.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
# Include radio routes with /radio prefix
api_router.include_router(radio_router, prefix="/radio", tags=["radio"])
# Include AI chat routes with /ai-chat prefix
api_router.include_router(ai_chat_router, prefix="/ai-chat", tags=["ai-chat"])
# Include AI Richard routes with /ai-richard prefix
api_router.include_router(ai_richard_router, prefix="/ai-richard", tags=["ai-richard"])
# Include Website Orders routes with /website-orders prefix
api_router.include_router(website_orders_router, prefix="/website-orders", tags=["website-orders"])
# Include TTS routes with /tts prefix
api_router.include_router(tts_router, prefix="/tts", tags=["tts"])
# Include Live Visitors routes with /visitors prefix
api_router.include_router(live_visitors_router, prefix="/visitors", tags=["live-visitors"])
# Include Membership routes with /membership prefix
api_router.include_router(membership_router, prefix="/membership", tags=["membership"])
# Include Paid Members routes with /paid-members prefix
api_router.include_router(paid_members_router, prefix="/paid-members", tags=["paid-members"])


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.get("/health")
async def health_check():
    """Health check endpoint for keep-alive service"""
    return {
        "status": "alive",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "message": "Server is awake and running"
    }

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_keep_alive():
    """Start the keep-alive service on server startup"""
    logger.info("🚀 Starting Keep-Alive Service...")
    keep_alive_service.start()
    logger.info("✅ Keep-Alive Service is now running - server will stay awake 24/7")

@app.on_event("shutdown")
async def shutdown_db_client():
    keep_alive_service.stop()
    client.close()
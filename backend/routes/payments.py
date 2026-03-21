from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Dict
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
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

# Fixed pricing packages (secure - not from frontend)
PACKAGES = {
    "chapter1_unlock": 4.99
}

class CheckoutRequest(BaseModel):
    package_id: str
    origin_url: str
    metadata: Optional[Dict[str, str]] = {}

class CheckoutResponse(BaseModel):
    url: str
    session_id: str

@router.post("/v1/checkout/session", response_model=CheckoutResponse)
async def create_checkout(request: CheckoutRequest, http_request: Request):
    # Validate package
    if request.package_id not in PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package")
    
    # Get amount from server-side (secure)
    amount = PACKAGES[request.package_id]
    
    # Get Stripe API key
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Stripe API key not configured")
    
    # Create webhook URL
    host_url = str(http_request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    # Initialize Stripe checkout
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    # Build success and cancel URLs from frontend origin
    success_url = f"{request.origin_url}/book-of-amos?session_id={{{{CHECKOUT_SESSION_ID}}}}"
    cancel_url = f"{request.origin_url}/book-of-amos"
    
    # Add package info to metadata
    metadata = {**request.metadata, "package_id": request.package_id}
    
    # Create checkout session
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Store transaction in database (MANDATORY)
    transaction = {
        "session_id": session.session_id,
        "amount": amount,
        "currency": "usd",
        "package_id": request.package_id,
        "metadata": metadata,
        "payment_status": "pending",
        "status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payment_transactions.insert_one(transaction)
    
    return CheckoutResponse(url=session.url, session_id=session.session_id)

@router.get("/v1/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    # Get Stripe API key
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Stripe API key not configured")
    
    # Initialize Stripe checkout (webhook_url not needed for status check)
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    # Get status from Stripe
    checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
    # Update database (only if status changed)
    existing = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    
    if existing and existing.get("payment_status") != checkout_status.payment_status:
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "payment_status": checkout_status.payment_status,
                    "status": checkout_status.status,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
    
    return {
        "session_id": session_id,
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "amount_total": checkout_status.amount_total,
        "currency": checkout_status.currency,
        "metadata": checkout_status.metadata
    }

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    # Get Stripe API key
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Stripe API key not configured")
    
    # Get webhook body and signature
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    # Initialize Stripe checkout
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    # Handle webhook
    webhook_response = await stripe_checkout.handle_webhook(body, signature)
    
    # Update database based on webhook event
    if webhook_response.session_id:
        await db.payment_transactions.update_one(
            {"session_id": webhook_response.session_id},
            {
                "$set": {
                    "payment_status": webhook_response.payment_status,
                    "status": "completed" if webhook_response.payment_status == "paid" else "failed",
                    "event_type": webhook_response.event_type,
                    "event_id": webhook_response.event_id,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
    
    return {"received": True}

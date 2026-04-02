from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Dict
import stripe
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env', override=True)

router = APIRouter()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Configure Stripe - Using TEST keys (live keys not accessible yet)
stripe.api_key = os.environ.get('STRIPE_API_KEY')

# Fixed pricing packages (secure - not from frontend)
PACKAGES = {
    "chapter1_unlock": 4.99,
    "book_of_amos": 20.00,
    "membership_monthly": 5.00,
    "ai_richard_chat_monthly": 2.00
}

class DonationRequest(BaseModel):
    amount: float
    origin_url: str
    donor_name: Optional[str] = "Anonymous"

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
    
    # Build success and cancel URLs from frontend origin
    success_url = f"{request.origin_url}/book-of-amos?session_id={{{{CHECKOUT_SESSION_ID}}}}"
    cancel_url = f"{request.origin_url}/book-of-amos"
    
    # Add package info to metadata
    metadata = {**request.metadata, "package_id": request.package_id}
    
    try:
        # Create checkout session using standard Stripe SDK
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'Book of Amos - Chapter 1 Unlock',
                    },
                    'unit_amount': int(amount * 100),  # Convert to cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        
        # Store transaction in database (MANDATORY)
        transaction = {
            "session_id": session.id,
            "amount": amount,
            "currency": "usd",
            "package_id": request.package_id,
            "metadata": metadata,
            "payment_status": "pending",
            "status": "initiated",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.payment_transactions.insert_one(transaction)
        
        return CheckoutResponse(url=session.url, session_id=session.id)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

@router.get("/v1/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    try:
        # Get status from Stripe using standard SDK
        session = stripe.checkout.Session.retrieve(session_id)
        
        # Update database if payment is complete
        if session.payment_status == 'paid':
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "payment_status": "paid",
                    "status": "completed",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
        
        return {
            "session_id": session.id,
            "payment_status": session.payment_status,
            "status": session.status
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

@router.post("/v1/donation/session", response_model=CheckoutResponse)
async def create_donation_checkout(request: DonationRequest, http_request: Request):
    """Create a Stripe checkout session for donations"""
    
    # Validate amount
    if request.amount < 1 or request.amount > 10000:
        raise HTTPException(status_code=400, detail="Donation amount must be between $1 and $10,000")
    
    # Build success and cancel URLs
    success_url = f"{request.origin_url}/radio?donation=success"
    cancel_url = f"{request.origin_url}/radio"
    
    # Add donation metadata
    metadata = {
        "type": "donation",
        "donor_name": request.donor_name
    }
    
    try:
        # Create checkout session using standard Stripe SDK
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f'Donation from {request.donor_name}',
                        'description': 'Support RJHNSN12 Radio Station'
                    },
                    'unit_amount': int(request.amount * 100),  # Convert to cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        
        # Store donation transaction
        transaction = {
            "session_id": session.id,
            "amount": request.amount,
            "currency": "usd",
            "type": "donation",
            "donor_name": request.donor_name,
            "payment_status": "pending",
            "status": "initiated",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.payment_transactions.insert_one(transaction)
        
        return CheckoutResponse(url=session.url, session_id=session.id)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")
    
    await db.payment_transactions.insert_one(transaction)
    
    return CheckoutResponse(url=session.url, session_id=session.session_id)

@router.post("/ai-sales/checkout", response_model=CheckoutResponse)
async def create_ai_sales_checkout(request: CheckoutRequest, http_request: Request):
    """Create a Stripe checkout session for AI Richard sales"""
    
    # Validate package
    if request.package_id not in PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid product")
    
    # Get amount from server-side (secure)
    amount = PACKAGES[request.package_id]
    
    # Determine if this is a subscription or one-time payment
    is_subscription = request.package_id == "membership_monthly"
    
    # Build success and cancel URLs
    if is_subscription:
        success_url = f"{request.origin_url}/radio?membership=success"
        cancel_url = f"{request.origin_url}/radio"
        product_name = "RJHNSN12 Premium Membership"
        product_description = "The Quiet Storm access + 20% off books + Priority AI support"
    else:
        success_url = f"{request.origin_url}/book-of-amos?purchase=success"
        cancel_url = f"{request.origin_url}/book-of-amos"
        product_name = "Book of Amos - Complete Hebrew Translation"
        product_description = "Word-by-word interlinear translation from original Hebrew scrolls"
    
    # Add metadata
    metadata = {**request.metadata, "product_id": request.package_id, "source": "ai_richard_sales"}
    
    # Create real Stripe checkout session
    try:
        if is_subscription:
            # Create SUBSCRIPTION checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': product_name,
                            'description': product_description
                        },
                        'unit_amount': int(amount * 100),
                        'recurring': {
                            'interval': 'month',
                            'interval_count': 1
                        }
                    },
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=success_url,
                cancel_url=cancel_url,
                metadata=metadata
            )
        else:
            # Create ONE-TIME payment checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': product_name,
                            'description': product_description
                        },
                        'unit_amount': int(amount * 100),
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
                metadata=metadata
            )
        
        # Store transaction in database
        transaction = {
            "session_id": session.id,
            "amount": amount,
            "currency": "usd",
            "product_id": request.package_id,
            "product_name": product_name,
            "is_subscription": is_subscription,
            "metadata": metadata,
            "payment_status": "pending",
            "status": "initiated",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "source": "ai_richard_sales"
        }
        
        await db.payment_transactions.insert_one(transaction)
        
        return CheckoutResponse(url=session.url, session_id=session.id)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    # Get webhook body and signature
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    # Get webhook secret from environment (you need to set this)
    webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')
    
    if not webhook_secret:
        # If no webhook secret configured, just acknowledge
        print("⚠️ STRIPE_WEBHOOK_SECRET not configured - skipping webhook validation")
        return {"received": True}
    
    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload=body,
            sig_header=signature,
            secret=webhook_secret
        )
        
        # Handle the event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            session_id = session['id']
            payment_status = session['payment_status']
            customer_email = session.get('customer_email') or session.get('customer_details', {}).get('email')
            metadata = session.get('metadata', {})
            
            # Check if this is an AI Richard subscription
            if metadata.get('product') == 'ai_richard_chat':
                # Save subscription to database
                subscription_doc = {
                    "email": customer_email,
                    "stripe_session_id": session_id,
                    "stripe_customer_id": session.get('customer'),
                    "stripe_subscription_id": session.get('subscription'),
                    "status": "active",
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                
                await db.ai_richard_subscriptions.insert_one(subscription_doc)
                print(f"✅ AI Richard subscription activated for {customer_email}")
            
            # Update general payment transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {
                    "$set": {
                        "payment_status": payment_status,
                        "status": "completed" if payment_status == "paid" else "pending",
                        "event_type": event['type'],
                        "event_id": event['id'],
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            print(f"✅ Payment completed: {session_id}")
        
        elif event['type'] == 'customer.subscription.deleted':
            # Handle subscription cancellation
            subscription = event['data']['object']
            subscription_id = subscription['id']
            await db.ai_richard_subscriptions.update_one(
                {"stripe_subscription_id": subscription_id},
                {"$set": {
                    "status": "canceled",
                    "canceled_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            print(f"✅ Subscription canceled: {subscription_id}")
        
        return {"received": True}
        
    except ValueError as e:
        # Invalid payload
        print(f"❌ Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        print(f"❌ Webhook signature error: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid signature")



# AI Richard Chat Subscription
@router.post("/ai-richard/subscribe")
async def create_ai_richard_subscription(request: Request):
    """Create monthly subscription for AI Richard chat access"""
    try:
        data = await request.json()
        origin_url = data.get('origin_url', 'https://talk-web-combo.preview.emergentagent.com')
        customer_email = data.get('email')
        
        # Create checkout session for SUBSCRIPTION (not one-time payment)
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'AI Richard Chat Access',
                        'description': 'Unlimited monthly access to AI Richard conversations'
                    },
                    'unit_amount': 200,  # $2.00
                    'recurring': {
                        'interval': 'month'
                    }
                },
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{origin_url}?ai_richard_subscribed=true",
            cancel_url=f"{origin_url}?ai_richard_canceled=true",
            customer_email=customer_email,
            metadata={'product': 'ai_richard_chat'}
        )
        
        return {"url": session.url, "session_id": session.id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Subscription error: {str(e)}")

@router.get("/ai-richard/check-subscription")
async def check_ai_richard_subscription(email: str):
    """Check if user has active AI Richard subscription"""
    try:
        # Check database for active subscription
        subscription = await db.ai_richard_subscriptions.find_one(
            {"email": email, "status": "active"},
            {"_id": 0}
        )
        
        return {
            "has_subscription": subscription is not None,
            "subscription": subscription
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

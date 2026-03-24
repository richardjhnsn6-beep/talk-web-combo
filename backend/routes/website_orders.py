from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Dict, List
import stripe
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
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

# Website pricing packages
WEBSITE_PACKAGES = {
    "simple_site": {
        "name": "Simple Website",
        "description": "3-5 pages, mobile-responsive, contact form",
        "price": 79900,  # $799 in cents
        "features": ["3-5 pages", "Mobile responsive", "Contact form", "SEO basics", "1 month support"]
    },
    "business_site": {
        "name": "Business Website",
        "description": "5-10 pages, CMS, advanced features",
        "price": 159900,  # $1,599 in cents
        "features": ["5-10 pages", "Content management", "Blog", "Google Analytics", "3 months support", "SEO optimized"]
    },
    "ecommerce_site": {
        "name": "E-Commerce Website",
        "description": "Full online store with payment processing",
        "price": 349900,  # $3,499 in cents
        "features": ["Product catalog", "Shopping cart", "Payment integration", "Inventory management", "Order tracking", "6 months support"]
    },
    "custom_app": {
        "name": "Custom Web Application",
        "description": "Full-stack custom application",
        "price": 599900,  # $5,999 in cents
        "features": ["Custom features", "Database design", "User authentication", "API integration", "12 months support", "Scalable architecture"]
    }
}

class WebsiteOrderRequest(BaseModel):
    package_id: str
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    project_description: str
    requirements: Dict[str, str]
    conversation_id: Optional[str] = None

class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str
    order_id: str

class OrderStatus(BaseModel):
    order_id: str
    status: str
    customer_name: str
    customer_email: str
    package_name: str
    price: float
    created_at: str
    requirements: Dict
    payment_status: str

@router.get("/packages")
async def get_packages():
    """Get available website packages with pricing"""
    return {
        "packages": {
            pkg_id: {
                "id": pkg_id,
                "name": pkg["name"],
                "description": pkg["description"],
                "price": pkg["price"] / 100,  # Convert to dollars
                "features": pkg["features"]
            }
            for pkg_id, pkg in WEBSITE_PACKAGES.items()
        }
    }

@router.post("/create-order", response_model=CheckoutResponse)
async def create_website_order(order_req: WebsiteOrderRequest, request: Request):
    """
    Create a new website order and Stripe checkout session
    """
    try:
        # Validate package
        if order_req.package_id not in WEBSITE_PACKAGES:
            raise HTTPException(status_code=400, detail="Invalid package selected")
        
        package = WEBSITE_PACKAGES[order_req.package_id]
        
        # Create order ID
        order_id = str(uuid.uuid4())
        
        # Get frontend URL for success/cancel redirects
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': package['name'],
                        'description': package['description'],
                    },
                    'unit_amount': package['price'],
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{frontend_url}/order-success?session_id={{CHECKOUT_SESSION_ID}}&order_id={order_id}",
            cancel_url=f"{frontend_url}/order-cancelled?order_id={order_id}",
            customer_email=order_req.customer_email,
            metadata={
                'order_id': order_id,
                'package_id': order_req.package_id,
                'customer_name': order_req.customer_name,
                'conversation_id': order_req.conversation_id or 'direct'
            }
        )
        
        # Store order in database (status: pending_payment)
        order_doc = {
            "order_id": order_id,
            "package_id": order_req.package_id,
            "package_name": package['name'],
            "price": package['price'] / 100,  # Store as dollars
            "customer_name": order_req.customer_name,
            "customer_email": order_req.customer_email,
            "customer_phone": order_req.customer_phone,
            "project_description": order_req.project_description,
            "requirements": order_req.requirements,
            "conversation_id": order_req.conversation_id,
            "stripe_session_id": checkout_session.id,
            "status": "pending_payment",
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        
        await db.website_orders.insert_one(order_doc)
        
        return CheckoutResponse(
            checkout_url=checkout_session.url,
            session_id=checkout_session.id,
            order_id=order_id
        )
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Payment error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Order creation failed: {str(e)}")

@router.get("/orders", response_model=List[OrderStatus])
async def get_all_orders(status: Optional[str] = None):
    """
    Get all website orders (for admin dashboard)
    Optional filter by status: pending_payment, paid, in_progress, completed, delivered
    """
    try:
        query = {}
        if status:
            query["status"] = status
        
        orders = await db.website_orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
        
        return [OrderStatus(**order) for order in orders]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch orders: {str(e)}")

@router.get("/orders/{order_id}")
async def get_order(order_id: str):
    """Get specific order details"""
    try:
        order = await db.website_orders.find_one({"order_id": order_id}, {"_id": 0})
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return order
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch order: {str(e)}")

@router.post("/orders/{order_id}/update-status")
async def update_order_status(order_id: str, new_status: str):
    """
    Update order status
    Valid statuses: pending_payment, paid, in_progress, completed, delivered, cancelled
    """
    try:
        valid_statuses = ["pending_payment", "paid", "in_progress", "completed", "delivered", "cancelled"]
        
        if new_status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        result = await db.website_orders.update_one(
            {"order_id": order_id},
            {
                "$set": {
                    "status": new_status,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return {"success": True, "order_id": order_id, "new_status": new_status}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")

@router.post("/webhook/payment-success")
async def handle_payment_success(request: Request):
    """
    Webhook to handle successful Stripe payments
    Called by Stripe when payment is completed
    """
    try:
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        
        # For now, just parse the JSON (in production, verify webhook signature)
        import json
        event = json.loads(payload)
        
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            order_id = session['metadata'].get('order_id')
            
            if order_id:
                # Update order status to paid
                await db.website_orders.update_one(
                    {"order_id": order_id},
                    {
                        "$set": {
                            "status": "paid",
                            "payment_status": "completed",
                            "stripe_payment_id": session['payment_intent'],
                            "paid_at": datetime.now(timezone.utc).isoformat(),
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                
                # TODO: Send email notification to owner
                # TODO: Send confirmation email to customer
                
                return {"success": True, "order_id": order_id}
        
        return {"success": True}
        
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

@router.get("/stats")
async def get_order_stats():
    """Get statistics for website orders"""
    try:
        total_orders = await db.website_orders.count_documents({})
        paid_orders = await db.website_orders.count_documents({"payment_status": "completed"})
        pending_orders = await db.website_orders.count_documents({"status": "pending_payment"})
        in_progress = await db.website_orders.count_documents({"status": "in_progress"})
        completed = await db.website_orders.count_documents({"status": "completed"})
        
        # Calculate total revenue
        paid_orders_list = await db.website_orders.find(
            {"payment_status": "completed"},
            {"_id": 0, "price": 1}
        ).to_list(1000)
        
        total_revenue = sum(order.get("price", 0) for order in paid_orders_list)
        
        return {
            "total_orders": total_orders,
            "paid_orders": paid_orders,
            "pending_payment": pending_orders,
            "in_progress": in_progress,
            "completed": completed,
            "total_revenue": total_revenue
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

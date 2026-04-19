from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from pathlib import Path
import base64
import httpx
from datetime import datetime, timezone

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env', override=False)

router = APIRouter()

# Get Emergent LLM Key for image generation
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

class ImageGenerationRequest(BaseModel):
    prompt: str
    quality: str = "standard"  # standard, premium, or ultra

class ImageGenerationResponse(BaseModel):
    image_url: str
    image_data: str
    quality: str
    pricing: dict

@router.post("/generate", response_model=ImageGenerationResponse)
async def generate_ai_image(request: ImageGenerationRequest):
    """
    Generate AI biblical image using OpenAI DALL-E via Emergent LLM Key
    
    Quality tiers:
    - standard: $10 - Basic biblical scene
    - premium: $12 - Enhanced detail and quality (default)
    - ultra: $20 - Maximum detail, print-ready
    """
    
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="Image generation not configured")
    
    try:
        # Map quality to DALL-E parameters
        quality_map = {
            "standard": {"size": "1024x1024", "quality": "standard", "price": 10},
            "premium": {"size": "1024x1024", "quality": "hd", "price": 12},
            "ultra": {"size": "1792x1024", "quality": "hd", "price": 20}
        }
        
        selected_quality = quality_map.get(request.quality, quality_map["premium"])
        
        # Enhanced prompt for biblical imagery
        enhanced_prompt = f"Biblical religious artwork: {request.prompt}. High-quality, reverent, historically accurate style suitable for church and educational use."
        
        # Call OpenAI DALL-E API using Emergent LLM Key
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/images/generations",
                headers={
                    "Authorization": f"Bearer {EMERGENT_LLM_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "dall-e-3",
                    "prompt": enhanced_prompt,
                    "n": 1,
                    "size": selected_quality["size"],
                    "quality": selected_quality["quality"],
                    "response_format": "url"
                }
            )
        
        if response.status_code != 200:
            error_detail = response.text
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Image generation failed: {error_detail}"
            )
        
        result = response.json()
        image_url = result["data"][0]["url"]
        
        # Download the image and convert to base64 for preview
        async with httpx.AsyncClient() as client:
            img_response = await client.get(image_url)
            image_bytes = img_response.content
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        
        # Pricing info with PayPal links
        pricing = {
            "standard": {
                "price": 10,
                "label": "Standard Quality",
                "paypal_link": "https://www.paypal.com/ncp/payment/3R2HVSBWMXB4S"
            },
            "premium": {
                "price": 12,
                "label": "Premium Quality (Recommended)",
                "paypal_link": "https://www.paypal.com/ncp/payment/N72KG7AMUQ36N"
            },
            "ultra": {
                "price": 20,
                "label": "Ultra Premium - Print Ready",
                "paypal_link": "https://www.paypal.com/ncp/payment/JSZ4G6W5YZ6ES"
            }
        }
        
        return ImageGenerationResponse(
            image_url=image_url,
            image_data=f"data:image/png;base64,{image_base64}",
            quality=request.quality,
            pricing=pricing
        )
        
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation error: {str(e)}")


@router.get("/pricing")
async def get_pricing():
    """Get current pricing for AI image generation"""
    return {
        "tiers": [
            {
                "id": "standard",
                "name": "Standard Quality",
                "price": 10,
                "description": "1024x1024 biblical image, standard quality",
                "paypal_link": "https://www.paypal.com/ncp/payment/3R2HVSBWMXB4S"
            },
            {
                "id": "premium",
                "name": "Premium Quality",
                "price": 12,
                "description": "1024x1024 biblical image, HD quality (Recommended)",
                "paypal_link": "https://www.paypal.com/ncp/payment/N72KG7AMUQ36N",
                "recommended": True
            },
            {
                "id": "ultra",
                "name": "Ultra Premium",
                "price": 20,
                "description": "1792x1024 biblical image, maximum quality, print-ready",
                "paypal_link": "https://www.paypal.com/ncp/payment/JSZ4G6W5YZ6ES"
            }
        ]
    }

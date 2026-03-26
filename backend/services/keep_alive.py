"""
Keep-Alive Service
Prevents server from going to sleep by pinging itself every 3 minutes
This ensures 24/7 uptime for the radio station and AI chat
"""

import asyncio
import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class KeepAliveService:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.ping_count = 0
        
    async def ping_self(self):
        """Ping the backend to keep it awake - uses EXTERNAL URL to prevent Emergent platform sleep"""
        try:
            # CRITICAL: Must ping EXTERNAL URL, not localhost, so Emergent sees traffic
            # This prevents the entire deployment from going to sleep
            import os
            from dotenv import load_dotenv
            from pathlib import Path
            
            # Load REACT_APP_BACKEND_URL from frontend .env (the external production URL)
            frontend_env = Path(__file__).parent.parent.parent / 'frontend' / '.env'
            if frontend_env.exists():
                with open(frontend_env) as f:
                    for line in f:
                        if line.startswith('REACT_APP_BACKEND_URL='):
                            external_url = line.split('=')[1].strip()
                            break
                    else:
                        external_url = "http://localhost:8001"  # Fallback
            else:
                external_url = "http://localhost:8001"  # Fallback
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Ping the EXTERNAL health check endpoint
                ping_url = f"{external_url}/api/health"
                response = await client.get(ping_url)
                
                if response.status_code == 200:
                    self.ping_count += 1
                    logger.info(f"✅ Keep-Alive Ping #{self.ping_count} successful at {datetime.now()} → {ping_url}")
                else:
                    logger.warning(f"⚠️ Keep-Alive ping returned status {response.status_code}")
                    
        except Exception as e:
            logger.error(f"❌ Keep-Alive ping failed: {str(e)}")
    
    def start(self):
        """Start the keep-alive service"""
        # Ping every 3 minutes (180 seconds)
        self.scheduler.add_job(
            self.ping_self,
            'interval',
            minutes=3,
            id='keep_alive_ping',
            name='Keep Server Awake',
            replace_existing=True
        )
        
        self.scheduler.start()
        logger.info("🚀 Keep-Alive Service started - server will stay awake 24/7")
        logger.info("⏰ Pinging every 3 minutes to prevent sleep")
        
        # Trigger immediate first ping (don't wait 3 minutes for first ping)
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            loop.create_task(self.ping_self())
        except RuntimeError:
            # If no event loop, schedule it for next tick
            logger.info("ℹ️ Will ping on first scheduled interval (3 minutes)")
    
    def stop(self):
        """Stop the keep-alive service"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("🛑 Keep-Alive Service stopped")

# Global instance
keep_alive_service = KeepAliveService()

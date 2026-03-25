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
        """Ping the backend to keep it awake"""
        try:
            # Ping multiple endpoints to ensure full system stays awake
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Ping health check endpoint
                response = await client.get("http://localhost:8001/api/health")
                
                if response.status_code == 200:
                    self.ping_count += 1
                    logger.info(f"✅ Keep-Alive Ping #{self.ping_count} successful at {datetime.now()}")
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
    
    def stop(self):
        """Stop the keep-alive service"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("🛑 Keep-Alive Service stopped")

# Global instance
keep_alive_service = KeepAliveService()

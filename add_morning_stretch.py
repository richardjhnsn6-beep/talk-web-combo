#!/usr/bin/env python3
"""
Script to add Morning Stretch broadcast to RJHNSN12 Radio
Uses the existing /api/radio/dj/announcement endpoint
"""
import os
import sys
import asyncio
import json
import subprocess
from pathlib import Path
from dotenv import load_dotenv

# Load backend env
load_dotenv('/app/backend/.env')

# Morning Stretch Script - Energetic and motivating
MORNING_STRETCH_SCRIPT = """Good morning, friends! This is Richard Johnson with your Morning Stretch on RJHNSN12 Radio.

Let's energize your day with a quick two-minute routine. Stand up, shake out those arms and legs, and let's get moving!

First, leg stretches. Feet shoulder-width apart. Extend one leg forward and hold for ten seconds. Feel that hamstring stretch. Switch legs. Beautiful!

Now, deep knee bends. Toes slightly out, keep your back straight. Bend slowly - don't force it. Inhale down, exhale up. Ten reps. You got this!

Breathing exercise. Stand tall. Breathe in deeply through your nose for four counts. Hold for two. Breathe out slowly through your mouth for six counts. Again. One more time. Feel that oxygen flowing!

Hands on head stretch. Place both hands on top of your head. Lean left, hold ten seconds. Lean right, hold ten seconds. Feel that side body stretch!

Touch your toes. Bend forward from the hips, reach down as far as comfortable. Hold it. Feel your hamstrings and back stretch. Come up slowly.

Cool down. Shake it out! Take one final deep breath.

Excellent work! You just invested two minutes in yourself. Your body is energized, your mind is clear, and you're ready to conquer the day.

This is Richard Johnson reminding you: your body is a temple, and movement is worship.

Stay tuned to RJHNSN12 Radio for more great music and Biblical truth!"""

async def add_morning_stretch_broadcast():
    """Generate and add Morning Stretch broadcast using the API endpoint"""
    
    print("🎙️  Adding Morning Stretch broadcast to RJHNSN12 Radio...")
    print(f"📝 Script length: {len(MORNING_STRETCH_SCRIPT)} characters")
    print()
    
    try:
        # Get backend URL
        backend_url = None
        with open('/app/frontend/.env') as f:
            for line in f:
                if 'REACT_APP_BACKEND_URL' in line:
                    backend_url = line.strip().split('=')[1]
                    break
        
        if not backend_url:
            print("❌ ERROR: Could not find REACT_APP_BACKEND_URL")
            return False
        
        print(f"🌐 Backend URL: {backend_url}")
        print("🎵 Calling /api/radio/dj/announcement endpoint...")
        print()
        
        # Prepare JSON payload
        payload = {
            "script": MORNING_STRETCH_SCRIPT,
            "voice": "onyx",
            "position": "between_tracks"
        }
        
        # Call the API
        result = subprocess.run([
            'curl', '-s', '-X', 'POST',
            f'{backend_url}/api/radio/dj/announcement',
            '-H', 'Content-Type: application/json',
            '-d', json.dumps(payload)
        ], capture_output=True, text=True, timeout=60)
        
        if result.returncode != 0:
            print(f"❌ ERROR: curl failed: {result.stderr}")
            return False
        
        print(f"📡 Response received: {len(result.stdout)} bytes")
        
        try:
            response = json.loads(result.stdout)
        except json.JSONDecodeError as e:
            print(f"❌ ERROR: Invalid JSON response")
            print(f"Response: {result.stdout[:500]}")
            return False
        
        if response.get('status') == 'generated':
            announcement_id = response.get('announcement_id', 'unknown')
            print(f"✅ SUCCESS: Morning Stretch broadcast generated!")
            print(f"📝 Announcement ID: {announcement_id}")
            audio_data_size = len(response.get('audio_data', ''))
            print(f"🎵 Audio data size: {audio_data_size} characters (base64)")
            print()
            
            # Verify in database
            from motor.motor_asyncio import AsyncIOMotorClient
            mongo_url = os.environ['MONGO_URL']
            client = AsyncIOMotorClient(mongo_url)
            db = client[os.environ['DB_NAME']]
            
            count = await db.dj_announcements.count_documents({})
            print(f"📊 Total announcements in database: {count}")
            
            # Show the new announcement
            new_ann = await db.dj_announcements.find_one(
                {"id": announcement_id},
                {"_id": 0, "audio_data": 0}
            )
            
            if new_ann:
                print(f"🎉 Verified in database:")
                print(f"   Script preview: {new_ann.get('script', '')[:80]}...")
                print(f"   Voice: {new_ann.get('voice')}")
                print(f"   Created: {new_ann.get('created_at')}")
            
            print()
            print("✅ COMPLETE: Morning Stretch broadcast is now live on RJHNSN12 Radio!")
            return True
        else:
            print(f"❌ ERROR: Unexpected response status")
            print(f"Response: {response}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(add_morning_stretch_broadcast())
    sys.exit(0 if success else 1)

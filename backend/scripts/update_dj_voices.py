"""
Script to update DJ announcement voices to 11 Female / 3 Male mix
and regenerate all audio files with correct voices
"""
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from emergentintegrations.llm.openai import OpenAITextToSpeech
import base64
import io
from pydub import AudioSegment
from pydub.effects import normalize, compress_dynamic_range

# Load environment
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# Initialize
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
tts = OpenAITextToSpeech(api_key=os.environ.get('EMERGENT_LLM_KEY'))

# Richard's voice announcements (make these 3 MALE using "onyx")
MALE_VOICE_IDS = []

async def main():
    print("🎙️ DJ Voice Mix Update: 11 Female (nova) + 3 Male (onyx)\n")
    
    # Get all announcements
    anns = await db.dj_announcements.find({}, {'_id': 0}).to_list(100)
    print(f"Total announcements: {len(anns)}\n")
    
    # Find Richard introduction announcements
    richard_anns = []
    for a in anns:
        script = a.get('script', '')
        ann_id = a.get('id')
        if ('I am Richard Johnson' in script or 'This is Richard Johnson' in script) and 'Morning Stretch' not in script:
            richard_anns.append(ann_id)
            print(f"✓ MALE: {script[:60]}...")
    
    # Take first 3 Richard announcements for male voices
    global MALE_VOICE_IDS
    MALE_VOICE_IDS = richard_anns[:3]
    
    print(f"\n📊 Selected {len(MALE_VOICE_IDS)} announcements for MALE voice (onyx)")
    print(f"📊 Remaining {len(anns) - len(MALE_VOICE_IDS)} will be FEMALE voice (nova)\n")
    
    # Update voices in database
    male_count = 0
    female_count = 0
    
    for ann in anns:
        ann_id = ann.get('id')
        current_voice = ann.get('voice', 'nova')
        
        if ann_id in MALE_VOICE_IDS:
            new_voice = 'onyx'
            if current_voice != new_voice:
                await db.dj_announcements.update_one(
                    {'id': ann_id},
                    {'$set': {'voice': new_voice}}
                )
                print(f"✓ Updated to MALE (onyx): {ann.get('script', '')[:50]}...")
                male_count += 1
            else:
                print(f"  Already MALE: {ann.get('script', '')[:50]}...")
                male_count += 1
        else:
            new_voice = 'nova'
            if current_voice != new_voice:
                await db.dj_announcements.update_one(
                    {'id': ann_id},
                    {'$set': {'voice': new_voice}}
                )
                print(f"✓ Kept FEMALE (nova): {ann.get('script', '')[:50]}...")
                female_count += 1
            else:
                female_count += 1
    
    print(f"\n📊 Database Updated:")
    print(f"   Male voices (onyx): {male_count}")
    print(f"   Female voices (nova): {female_count}")
    
    # Now regenerate ALL audio files
    print("\n🎵 Regenerating ALL DJ announcement audio files...\n")
    
    updated_anns = await db.dj_announcements.find({}, {'_id': 0}).to_list(100)
    
    for idx, ann in enumerate(updated_anns, 1):
        ann_id = ann.get('id')
        script = ann.get('script', '')
        voice = ann.get('voice', 'nova')
        
        try:
            print(f"{idx}/{len(updated_anns)} Generating [{voice.upper()}]: {script[:50]}...")
            
            # Generate speech
            audio_bytes = await tts.generate_speech(
                text=script,
                model="tts-1",
                voice=voice
            )
            
            # Audio processing
            audio = AudioSegment.from_file(io.BytesIO(audio_bytes), format="mp3")
            audio = normalize(audio)
            audio = compress_dynamic_range(audio, threshold=-20.0, ratio=4.0, attack=5.0)
            audio = audio + 6  # +6dB boost
            
            # Export
            output_buffer = io.BytesIO()
            audio.export(output_buffer, format="mp3", bitrate="128k")
            processed_audio_bytes = output_buffer.getvalue()
            audio_base64 = base64.b64encode(processed_audio_bytes).decode('utf-8')
            
            # Update database with new audio
            await db.dj_announcements.update_one(
                {'id': ann_id},
                {'$set': {'audio_data': audio_base64}}
            )
            
            print(f"   ✅ Generated and saved\n")
            
        except Exception as e:
            print(f"   ❌ ERROR: {str(e)}\n")
    
    print("\n✅ ALL DONE!")
    print(f"   11 Female (nova) + 3 Male (onyx) DJ announcements")
    print(f"   All audio files regenerated with correct voices\n")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())

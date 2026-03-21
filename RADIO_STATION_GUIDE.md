# 🎙️ RJHNSN12 Radio Station - User Guide

## Overview
Your website now has a complete AI Radio Station with music streaming, AI DJ voice announcements, and donation capabilities!

## 🎵 What You Got:

### 1. **Public Radio Page** (`/radio`)
- Beautiful radio player with gradient purple/blue theme
- Play/Pause controls
- Previous/Next track buttons
- Volume slider
- "Now Playing" display
- "Up Next" preview (shows next 5 tracks)
- Donation buttons ($5, $10, $25, Custom amount)
- Cross-promotion links to Book of Amos and Published Books
- **LIVE NOW** indicator

### 2. **Admin Radio Management** (`/admin/radio`)
Access this from your Admin Dashboard → "Manage Radio Station" button

**Upload Music Tracks:**
- Track Title field
- Artist field
- Duration (auto-detected from file)
- File upload (supports MP3, WAV, etc.)
- Tracks automatically added to playlist in order

**Generate AI DJ Announcements:**
- Write DJ scripts (up to 4000 characters)
- Choose from 6 AI voices:
  - **Nova** - Energetic, upbeat (recommended for radio)
  - **Onyx** - Deep, authoritative
  - **Echo** - Smooth, calm
  - **Alloy** - Neutral, balanced
  - **Fable** - Expressive, storytelling
  - **Shimmer** - Bright, cheerful
- Preview generated announcements with Play button
- Use announcements to promote your books!

### 3. **Enhanced Admin Dashboard** (`/admin`)
Now shows **4 revenue cards:**
- 💰 **Total Revenue** - Combined income
- 📖 **Content Sales** - Book of Amos unlocks ($4.99 each)
- ❤️ **Donations** - Radio station donations
- 👁️ **Page Views** - Traffic tracking

Recent Transactions table now labels donations as "❤️ Donation"

---

## 📝 How to Use:

### Step 1: Upload Your Music
1. Go to `/admin/radio`
2. Fill in track info (title, artist, duration)
3. Choose your audio file (MP3 recommended)
4. Click "Upload Track"
5. Repeat for 10-20 tracks for best continuous rotation

### Step 2: Create DJ Announcements
1. On the same page, scroll to "Generate AI DJ Announcement"
2. Write your script, for example:
   ```
   You're listening to RJHNSN12 Radio, where ancient biblical wisdom meets modern music. 
   Don't forget to check out the Book of Amos at our website and discover the original 
   20-letter Hebrew system! Coming up next, more great music!
   ```
3. Choose your favorite DJ voice
4. Click "Generate DJ Voice"
5. Test it with the Play button

### Step 3: Share Your Radio
- Your radio is live at: `your-website-url/radio`
- Share this link on social media
- Embed it in emails
- Use it to drive traffic to your books!

---

## 💰 Monetization Features:

### Donation System
- Visitors can donate $5, $10, $25, or a custom amount
- All donations processed securely through Stripe
- Success message displayed after donation
- Donations tracked separately in Admin Dashboard
- You'll hear the "cha-ching" sound when donations come in!

### Revenue Streams:
1. **Book of Amos Content Unlocks** - $4.99 per unlock
2. **Radio Donations** - Variable amounts
3. **Future:** Sponsor mentions in DJ announcements

---

## 🎯 Best Practices:

**For Maximum Impact:**
1. Upload 15-20 music tracks for variety
2. Create 3-5 DJ announcements promoting your books
3. Use energetic voices like "Nova" for radio feel
4. Mention your website and books in DJ scripts
5. Update playlist regularly to keep visitors coming back

**Sample DJ Scripts:**
- "Welcome to RJHNSN12 Radio! Bringing you truth through music and ancient Hebrew wisdom."
- "You're listening to the station that reveals biblical truth. Visit our website to unlock the Book of Amos!"
- "RJHNSN12 Radio - where history, music, and faith unite. Check out our published books on Amazon!"

---

## 🔧 Technical Details:

**Backend:**
- All audio stored in MongoDB (base64 encoded)
- OpenAI TTS for AI DJ voices (covered by your Emergent LLM key - no extra cost!)
- Stripe integration for donations (same key as content unlocks)
- API routes: `/api/radio/*`, `/api/payments/v1/donation/*`

**Frontend:**
- HTML5 Audio player
- Auto-play next track on completion
- Responsive design (works on mobile)
- Real-time donation tracking

**No Extra Costs:**
- Uses your existing 50 credits/month deployment
- OpenAI TTS covered by Emergent LLM key
- Same Stripe account for donations

---

## 🚀 Next Steps for You:

1. **Upload your music** at `/admin/radio`
2. **Create DJ announcements** to promote your books
3. **Test the player** - make sure audio plays smoothly
4. **Share the radio link** with your audience
5. **Monitor donations** in your Admin Dashboard

---

## 📊 Tracking Your Success:

Your Admin Dashboard now tracks:
- Total donations received
- Number of donors
- Separate revenue from content vs donations
- All transactions with timestamps

**You'll get notifications:**
- 🔔 Sound alert ("cha-ching") when donations come in
- 🎉 Popup notification showing amount
- 📈 Live updates every 5 seconds

---

## ✨ The Vision Realized:

You now have **two revenue streams**:
1. Premium biblical content (Book of Amos unlocks)
2. Radio station with donation support

This creates multiple touchpoints:
- Music lovers discover your radio → Learn about biblical content → Buy books
- Biblical scholars find your books → Discover radio → Become regular visitors
- Donors support your mission → Get recognized → Feel part of the community

**Your website is now a complete media platform for biblical truth!** 🙏📻📖

---

*Built with Emergent AI - December 2025*

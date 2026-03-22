# RJHNSN12 Radio Mobile App - Deployment Guide

## App Overview
- **Name:** RJHNSN12 Radio
- **Platform:** iOS & Android (React Native + Expo)
- **Monetization:** $0.99 paid download
- **Features:** 24/7 radio streaming, DJ announcements, donations

## What's Built
✅ React Native app structure with Expo managed workflow
✅ Audio streaming with react-native-track-player (background playback)
✅ Radio player with play/pause/skip controls
✅ Lock screen controls and notifications
✅ Donation screen with Stripe integration ($5, $10, $25, custom amounts)
✅ Professional app icon and splash screen
✅ Connects to your existing backend API

## Next Steps for Deployment

### 1. Install EAS CLI (Expo Application Services)
```bash
npm install -g eas-cli
eas login
```

### 2. Initialize EAS Build
```bash
cd /app/mobile-radio-app
eas build:configure
```

### 3. Build for iOS (Apple App Store)
```bash
eas build --platform ios
```

**Requirements:**
- Apple Developer Account ($99/year)
- Bundle identifier: `com.rjhnsn12.radio`

### 4. Build for Android (Google Play)
```bash
eas build --platform android
```

**Requirements:**
- Google Play Developer Account ($25 one-time)
- Package name: `com.rjhnsn12.radio`

### 5. Submit to App Stores
- **iOS:** Use App Store Connect to submit
- **Android:** Use Google Play Console to submit
- Set price to **$0.99** in both stores

## App Store Listing Info

### App Name
RJHNSN12 Radio

### Short Description
24/7 Biblical wisdom and music streaming

### Full Description
RJHNSN12 Radio brings you continuous streaming of inspiring music mixed with biblical wisdom and teachings. Listen to carefully curated tracks with AI DJ announcements promoting ancient Hebrew truth and the original 20-letter alphabet system.

Features:
• 24/7 live radio streaming
• Background audio playback
• Lock screen controls
• Support the ministry with secure donations
• Explore biblical content on our website

### Keywords
radio, biblical, hebrew, christian, music, wisdom, streaming, torah, gospel

### Category
Music

### Age Rating
4+ (No objectionable content)

## Technical Notes

### Audio Playback
- Uses react-native-track-player for professional audio streaming
- Supports background playback on iOS and Android
- Lock screen controls included
- Automatically loads playlist from backend API

### Payment Integration
- Stripe integration for donations
- Supports Apple Pay and Google Pay
- One-time donation amounts: $5, $10, $25, or custom

### Backend Integration
- Connects to: `https://talk-web-combo.preview.emergentagent.com`
- API endpoints used:
  - `/api/radio/playlist/mixed` - Get playlist
  - `/api/radio/track/{id}` - Get track audio
  - `/api/radio/dj/announcements` - Get DJ announcements
  - `/api/payments/v1/donation/session` - Create donation payment

## Testing
```bash
# Run in Expo Go for quick testing
npx expo start

# Run development build for full features (audio, Stripe)
npx expo run:ios
npx expo run:android
```

## App Store Fees
- **iOS:** $99/year Apple Developer Program
- **Android:** $25 one-time Google Play Developer fee
- **Ongoing:** 50 credits/month deployment cost on Emergent platform

## Support
For questions or issues, contact: richardjhnsn6@gmail.com

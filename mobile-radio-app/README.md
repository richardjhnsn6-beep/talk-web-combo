# RJHNSN12 Radio Mobile App

React Native mobile app for 24/7 radio streaming with DJ announcements and donation support.

## Features
- 🎵 24/7 Radio streaming with background audio support
- 🎙️ AI DJ announcements between tracks
- ❤️ Donation system (Stripe integration)
- 📱 Lock screen controls
- 🔗 Link to website for books and biblical content

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   - Update `.env` with your API URL
   - Stripe keys are pre-configured

3. Run development build:
   ```bash
   npx expo run:ios
   # or
   npx expo run:android
   ```

## Building for Production

### iOS (Apple App Store):
```bash
eas build --platform ios
```

### Android (Google Play):
```bash
eas build --platform android
```

## Monetization
- $0.99 paid download on App Store & Google Play
- In-app donation support via Stripe

## Technical Stack
- React Native + Expo managed workflow
- react-native-track-player (background audio)
- @stripe/stripe-react-native (payments)
- FastAPI backend integration

#!/bin/bash
set -e

echo "🏗️ Starting production build for RJHNSN12 Radio App"
echo "=================================================="
echo ""

# Configure EAS if needed
if [ ! -f ".easrc" ]; then
  echo "📝 Configuring EAS project..."
  eas init --id $(uuidgen) --non-interactive || true
fi

echo ""
echo "🍎 Building for iOS (Apple App Store)..."
eas build --platform ios --profile production --non-interactive --no-wait

echo ""
echo "🤖 Building for Android (Google Play Store)..."
eas build --platform android --profile production --non-interactive --no-wait

echo ""
echo "✅ Build process initiated!"
echo "📊 Check build status: eas build:list"

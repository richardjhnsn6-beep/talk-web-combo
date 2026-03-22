#!/bin/bash

echo "🚀 RJHNSN12 Radio Mobile App Setup"
echo "=================================="
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must run from /app/mobile-radio-app directory"
  exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📱 Next Steps:"
echo ""
echo "1. Test in development:"
echo "   npx expo start"
echo ""
echo "2. Build for production:"
echo "   a) Install EAS CLI: npm install -g eas-cli"
echo "   b) Login: eas login"
echo "   c) Build iOS: eas build --platform ios"
echo "   d) Build Android: eas build --platform android"
echo ""
echo "3. Submit to stores:"
echo "   - iOS App Store (requires $99/year Apple Developer account)"
echo "   - Google Play Store (requires $25 one-time developer fee)"
echo "   - Set price to $0.99 in both stores"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"

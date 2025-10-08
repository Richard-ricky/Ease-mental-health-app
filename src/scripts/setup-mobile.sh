#!/bin/bash

echo "Setting up mobile development environment..."

# Install Capacitor CLI globally if not installed
if ! command -v cap &> /dev/null; then
    echo "Installing Capacitor CLI..."
    npm install -g @capacitor/cli
fi

# Build the web app
echo "Building web app..."
npm run build

# Initialize Capacitor if not already done
if [ ! -d "android" ] && [ ! -d "ios" ]; then
    echo "Initializing Capacitor..."
    npx cap init "Ease" "com.ease.mentalhealth" --web-dir=dist
fi

# Add platforms if not already added
if [ ! -d "android" ]; then
    echo "Adding Android platform..."
    npx cap add android
fi

if [ ! -d "ios" ] && [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Adding iOS platform..."
    npx cap add ios
fi

# Sync web assets
echo "Syncing web assets to mobile platforms..."
npx cap sync

echo "Mobile setup complete!"
echo ""
echo "Next steps:"
echo "1. For Android: npx cap open android"
echo "2. For iOS: npx cap open ios"
echo "3. Build APK in Android Studio"
echo "4. Build IPA in Xcode"
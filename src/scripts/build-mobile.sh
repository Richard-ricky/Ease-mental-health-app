#!/bin/bash

echo "Building mobile apps..."

# Ensure web app is built
npm run build

# Sync to mobile platforms
npx cap sync

echo "Opening mobile development environments..."

# Open Android Studio (if on Linux/Windows/macOS with Android Studio)
if command -v studio &> /dev/null; then
    echo "Opening Android Studio..."
    npx cap open android &
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if [ -d "/Applications/Android Studio.app" ]; then
        echo "Opening Android Studio..."
        npx cap open android &
    fi
fi

# Open Xcode (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v xcode-select &> /dev/null; then
        echo "Opening Xcode..."
        npx cap open ios &
    fi
fi

echo ""
echo "Mobile build environment ready!"
echo ""
echo "To build APK:"
echo "1. In Android Studio: Build → Generate Signed Bundle/APK"
echo "2. Choose APK, create/select keystore"
echo "3. Build release APK"
echo ""
echo "To build iOS:"
echo "1. In Xcode: Product → Archive"
echo "2. Upload to App Store Connect"
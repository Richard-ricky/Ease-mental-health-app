# Deployment Guide for Ease Mental Health App

## Quick Start on Your PC

### Prerequisites
- Node.js 16+ installed
- Git installed
- Code editor (VS Code recommended)

### 1. Setup Local Development

```bash
# Clone and setup
git clone <your-repo-url>
cd ease-mental-health-app

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
# (Get these from Supabase dashboard and OpenAI)
```

### 2. Get Required API Keys

#### Supabase Setup
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → API → Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

#### OpenAI Setup
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key → `OPENAI_API_KEY`

### 3. Run Locally

```bash
# Start development server
npm run dev

# App opens at http://localhost:3000
```

## Mobile App Deployment

### Create APK for Google Play Store

#### Step 1: Prepare for Mobile
```bash
# Make setup script executable
chmod +x scripts/setup-mobile.sh

# Run mobile setup
./scripts/setup-mobile.sh
```

#### Step 2: Android Studio Setup
1. **Install Android Studio**
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install with SDK tools

2. **Open Project**
   ```bash
   npx cap open android
   ```

3. **Configure for Release**
   - File → Project Structure → Modules → app
   - Set `compileSdkVersion` to latest (34+)
   - Update `targetSdkVersion` to 34

#### Step 3: Generate Signed APK
1. **Build → Generate Signed Bundle/APK**
2. **Choose APK**
3. **Create/Select Keystore**
   - Store path: `ease-keystore.jks`
   - Password: (secure password)
   - Alias: `ease-key`
4. **Build Release APK**
5. **APK saved to**: `android/app/release/app-release.apk`

#### Step 4: Upload to Google Play
1. Go to [Google Play Console](https://play.google.com/console)
2. Create app → Upload APK
3. Fill store listing, screenshots, etc.
4. Submit for review

### Create iOS App for App Store

#### Prerequisites (macOS only)
- Xcode installed
- Apple Developer account ($99/year)

#### Steps
```bash
# Open iOS project
npx cap open ios
```

1. **Configure Signing**
   - Select project → Signing & Capabilities
   - Team: Select your Apple Developer team
   - Bundle Identifier: `com.ease.mentalhealth`

2. **Archive and Upload**
   - Product → Archive
   - Distribute App → App Store Connect
   - Upload to Apple

3. **App Store Connect**
   - Fill app information
   - Add screenshots
   - Submit for review

## Web Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Follow prompts, app deployed automatically
```

### Option 2: Netlify

1. Connect GitHub repo to Netlify
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Deploy

### Option 3: Self-Hosting

```bash
# Build app
npm run build

# Serve with any web server
# The 'dist' folder contains all files
npx serve dist -p 3000
```

## Environment Configuration

### Production Environment Variables

```bash
# .env.production
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-key
OPENAI_API_KEY=your-openai-key
VITE_APP_URL=https://your-domain.com
```

## Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Android Build Issues**
   - Update Android SDK to latest
   - Check `android/variables.gradle` versions
   - Clean and rebuild in Android Studio

3. **iOS Build Issues**
   - Update Xcode to latest
   - Clean build folder (⌘+Shift+K)
   - Reset simulator

4. **Supabase Connection Issues**
   - Verify environment variables
   - Check Supabase project status
   - Ensure RLS policies are set correctly

### Getting Help

- Check console errors in browser dev tools
- View logs in Android Studio/Xcode
- Test on actual devices, not just simulators
- Verify all API keys are correct and active

## App Store Guidelines

### Google Play Store
- Target SDK 34+
- Include privacy policy
- Add content ratings
- Test on multiple devices
- Follow Material Design guidelines

### Apple App Store
- Follow Human Interface Guidelines
- Include privacy nutrition labels
- Test on multiple iOS versions
- Provide app preview videos
- Detailed app description

## Update Process

### Updating the App

1. **Update version in `package.json`**
2. **Build and test changes**
3. **Mobile**: Increase version code in `android/app/build.gradle`
4. **Build new APK/IPA**
5. **Upload to stores**

### Over-the-Air Updates (Web Features)

- PWA updates automatically
- Service worker handles caching
- Users get updates on next visit

This guide provides everything needed to deploy the Ease mental health app across all platforms!
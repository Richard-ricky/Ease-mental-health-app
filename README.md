# Ease - Mental Health Support App

A comprehensive mental health support application designed for young people (ages 13-25), built with React, TypeScript, and Supabase.

## Features

- 🤖 **AI Mental Health Companion** - Chat with Sage, an empathetic AI counselor powered by OpenAI
- 📝 **Daily Mood Journal** - Track emotions and reflect with guided prompts
- 👥 **Community Stories** - Share and discover anonymous stories with like/comment/share features
- 💬 **Peer Support Chat** - Connect with licensed counselors and peer groups
- 🚨 **Crisis Support** - 24/7 access to emergency resources
- 📱 **Mobile App** - PWA with mobile app capabilities
- 🔐 **Privacy-Focused** - Anonymous mode and encrypted conversations

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4
- **Backend**: Supabase (Database, Auth, Real-time, Storage)
- **AI**: OpenAI GPT-4 integration
- **UI Components**: Radix UI, shadcn/ui
- **Mobile**: Capacitor for iOS/Android apps
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ease-mental-health-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## Mobile App Development

### Building for Mobile (APK/iOS)

1. **Build the web app**
   ```bash
   npm run build
   ```

2. **Initialize Capacitor (first time only)**
   ```bash
   npx cap add android
   npx cap add ios
   ```

3. **Sync web assets to mobile**
   ```bash
   npm run sync
   ```

4. **Open in Android Studio/Xcode**
   ```bash
   # For Android APK
   npx cap open android
   
   # For iOS
   npx cap open ios
   ```

### Building APK for Google Play Store

1. **Prepare for production**
   - Update version in `package.json`
   - Update `capacitor.config.ts` with production settings
   - Ensure app icons are in `android/app/src/main/res/` directories

2. **Build signed APK in Android Studio**
   - Open project in Android Studio
   - Go to Build → Generate Signed Bundle/APK
   - Choose APK, create/use keystore
   - Build release APK

3. **Upload to Google Play Console**

### Building for iOS App Store

1. **Open in Xcode**
   ```bash
   npx cap open ios
   ```

2. **Configure signing & provisioning**
   - Set up Apple Developer account
   - Configure signing certificates
   - Set bundle identifier

3. **Archive and upload**
   - Product → Archive
   - Upload to App Store Connect

## Deployment Options

### Web Deployment (Vercel/Netlify)

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Or deploy to Netlify**
   - Connect GitHub repo to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

### Self-hosting

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Serve static files**
   The `dist` folder contains all static files. Serve with any web server:
   ```bash
   # Using Python
   cd dist && python -m http.server 8080
   
   # Using Node.js serve
   npx serve dist
   
   # Using nginx, apache, etc.
   ```

## Progressive Web App (PWA)

The app is configured as a PWA and can be installed on any device:

- **Desktop**: Click "Install" button in browser address bar
- **Mobile**: Use "Add to Home Screen" option
- **Automatic prompts**: App shows install prompt after 30 seconds

## Development Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint

# Mobile development
npm run android      # Run on Android
npm run ios          # Run on iOS
npm run sync         # Sync web assets to mobile
npm run build:mobile # Build and sync for mobile
```

## Project Structure

```
ease-mental-health-app/
├── src/
│   └── main.tsx              # App entry point
├── components/               # React components
│   ├── ui/                  # shadcn/ui components
│   ├── AiChat.tsx           # AI chat interface
│   ├── MoodTracker.tsx      # Mood tracking
│   ├── CommunityStories.tsx # Community features
│   └── ...
├── utils/
│   └── supabase/            # Supabase configuration
├── styles/
│   └── globals.css          # Global styles & Tailwind
├── public/                  # Static assets
├── supabase/
│   └── functions/           # Edge functions
├── App.tsx                  # Main app component
├── package.json
├── vite.config.ts
├── capacitor.config.ts      # Mobile app config
└── README.md
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (backend only) | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI chat | Yes |

## Security & Privacy

- All user data is encrypted and stored securely in Supabase
- Anonymous mode available for privacy
- HIPAA-compliant infrastructure ready
- No sensitive data stored in localStorage
- API keys properly secured server-side

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support or questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## Legal Disclaimer

Ease is not a substitute for professional medical advice, diagnosis, or treatment. If you're experiencing a mental health emergency, please call 911 or go to your nearest emergency room.

- Crisis Text Line: Text HOME to 741741
- National Suicide Prevention Lifeline: 988
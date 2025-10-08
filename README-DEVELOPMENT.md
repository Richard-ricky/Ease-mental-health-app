# Development Guide - Ease Mental Health App

## Project Structure

This project is divided into two main parts:

1. **Frontend** (React + TypeScript + Vite)
2. **Backend** (Supabase Edge Functions + Deno)

## TypeScript Configuration

### Frontend TypeScript
- Uses Node.js environment
- Configuration in `/tsconfig.json`
- Excludes server files from compilation

### Backend TypeScript (Supabase Edge Functions)
- Uses Deno environment
- Configuration in `/supabase/functions/tsconfig.json`
- Only applies to server-side code

## Server Code (Supabase Edge Functions)

The server code is located in `/supabase/functions/server/` and includes:

- `index.tsx` - Main server with API endpoints
- `kv_store.tsx` - Key-value storage utilities (do not modify)

### Important Notes:
1. Server code runs in Deno environment, not Node.js
2. Uses different import syntax (e.g., `npm:hono`, `https://deno.land/...`)
3. TypeScript errors in your IDE for server files are expected in development
4. Server files are excluded from frontend TypeScript compilation

### Available Endpoints:

- `POST /auth/signup` - User registration
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `POST /ai/chat` - AI chat with Gemini
- `POST /ai/analyze-mood` - Mood analysis
- `GET /health` - Health check
- `GET /test` - Test endpoint

## Environment Variables

### Required for Development:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

### Provided by System:
- `SUPABASE_DB_URL`
- `OPENAI_API_KEY`

## Development Workflow

1. **Frontend Development**:
   ```bash
   npm run dev
   ```

2. **TypeScript Checking**:
   ```bash
   npm run type-check
   ```

3. **Building for Production**:
   ```bash
   npm run build
   ```

## Debugging API Issues

Use the built-in API debugger in the auth screen:
1. Go to sign up/sign in page
2. Click "Show API Debug Tools"
3. Test endpoints to verify server connectivity

## Common Issues and Solutions

### TypeScript Errors in Server Files
**Expected behavior** - Server files use Deno types that aren't available in Node.js environment.

### 404 API Errors
1. Check server deployment status
2. Verify environment variables are set
3. Use API debugger to test endpoints
4. Check Supabase Edge Functions logs

### Build Errors
1. Clear node_modules and reinstall
2. Check for import conflicts
3. Verify all dependencies are installed

## Server Deployment

Server code is automatically deployed to Supabase Edge Functions when you push to your Supabase project. The server includes:

- Authentication endpoints
- AI chat functionality
- User profile management
- Health monitoring

## Adding New Features

### Frontend:
1. Add components in `/components/`
2. Update routing in `/utils/sectionRenderer.tsx`
3. Add constants in `/constants/`

### Backend:
1. Add new endpoints in `/supabase/functions/server/index.tsx`
2. Use KV store for data persistence
3. Follow existing authentication patterns

## Security Considerations

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to frontend
- Use proper authentication for protected endpoints
- Validate all user inputs
- Follow OWASP guidelines for web security

This guide should help you understand the project structure and resolve common development issues.
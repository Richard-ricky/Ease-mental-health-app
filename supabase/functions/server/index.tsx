/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

// Import console explicitly for Deno - use the correct global type
declare const console: {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
};

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cors } from "npm:hono/cors";
import { Hono } from "npm:hono";
import { logger } from "npm:hono/logger";
import * as kv from './kv_store.tsx';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Initialize Hono app
const app = new Hono();

// Middleware
app.use('*', logger(console.log));
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Gemini AI Integration
interface GeminiRequest {
  message: string;
  context?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  options?: {
    temperature?: number;
    maxTokens?: number;
    includeSystemPrompt?: boolean;
  };
}

interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

interface StoredMessage {
  id: string;
  communityId: string;
  userId: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'system';
  reactions?: MessageReaction[];
  isEdited?: boolean;
  replyTo?: string;
}

interface Story {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string;
  reactions: Array<{ emoji: string; count: number; users: string[] }>;
  comments: Array<{
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    createdAt: string;
    likes: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  members: string[];
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
  rules: string[];
  tags: string[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences: {
    theme: string;
    notifications: boolean;
    privacy: {
      anonymousMode: boolean;
      dataSharing: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  status?: string;
  lastSeen?: string;
}

// Use environment variable for API key
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const SAGE_SYSTEM_PROMPT = `You are Sage, a compassionate AI mental health companion for the Ease wellness app. You can help users with their mental wellness journey and perform actions within the app.

Your role is to:
1. **Be Supportive & Empathetic**: Always respond with warmth, understanding, and validation
2. **Focus on Mental Wellness**: Provide practical coping strategies, mindfulness techniques, and emotional support
3. **Be Conversational**: Keep responses natural, engaging, and appropriately personal
4. **Encourage Professional Help**: When appropriate, gently suggest professional mental health resources
5. **Stay Safe**: Never provide medical diagnoses or replace professional therapy
6. **Be Proactive**: Suggest helpful actions
7. **Use Encouraging Language**: Be optimistic while acknowledging difficulties`;

// Health check endpoint
app.get('/make-server-bba6a6a2/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      gemini: !!GEMINI_API_KEY,
      supabase: !!Deno.env.get('SUPABASE_URL'),
      kv_store: true
    }
  });
});

// Test endpoint
app.get('/make-server-bba6a6a2/test', (c) => {
  return c.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

// Gemini AI chat endpoint
app.post('/make-server-bba6a6a2/ai/chat', async (c) => {
  try {
    const { message, context = [], options = {} } = await c.req.json() as GeminiRequest;

    if (!GEMINI_API_KEY) {
      return c.json({ error: 'Gemini API key not configured' }, 500);
    }

    if (!message?.trim()) {
      return c.json({ error: 'Message is required' }, 400);
    }

    const {
      temperature = 0.7,
      maxTokens = 1000,
      includeSystemPrompt = true
    } = options;

    // Build conversation history
    const messages: GeminiMessage[] = [];
    
    // Add system prompt as first interaction if requested
    if (includeSystemPrompt && context.length === 0) {
      messages.push({
        role: 'user',
        parts: [{ text: SAGE_SYSTEM_PROMPT }]
      });
      messages.push({
        role: 'model',
        parts: [{ text: "I understand. I'm Sage, your compassionate mental health companion. I'm here to listen, support, and help you on your wellness journey. How are you feeling today?" }]
      });
    }

    // Add conversation history
    if (context && Array.isArray(context)) {
      context.forEach((msg) => {
        messages.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content || '' }]
        });
      });
    }
    
    // Add current user message
    messages.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const requestBody = {
      contents: messages,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        candidateCount: 1,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
      console.error('Gemini API error:', response.status, errorData);
      return c.json({ 
        error: `Gemini API error: ${response.status}`,
        details: errorData.error?.message || response.statusText 
      }, 500);
    }

    const data = await response.json() as { 
      candidates?: Array<{ content: { parts: Array<{ text: string }> } }> 
    };
    
    if (!data.candidates || data.candidates.length === 0) {
      return c.json({ error: 'No response generated from Gemini API' }, 500);
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    if (!responseText) {
      return c.json({ error: 'Empty response from Gemini API' }, 500);
    }

    // Store conversation in KV store for analytics
    try {
      const conversationId = `conversation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await kv.set(`ai_chat_${conversationId}`, {
        userMessage: message,
        aiResponse: responseText,
        timestamp: new Date().toISOString(),
        context: context.length
      });
    } catch (_kvError) {
      console.error('Failed to store conversation');
      // Don't fail the request if storage fails
    }

    return c.json({
      response: responseText.trim(),
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI chat error:', error);
    return c.json({ 
      error: 'Internal server error during AI chat',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Mood analysis endpoint
app.post('/make-server-bba6a6a2/ai/analyze-mood', async (c) => {
  try {
    const { message, moodContext } = await c.req.json() as {
      message: string;
      moodContext?: {
        recentMoods?: number[];
        concerns?: string[];
        goals?: string[];
      };
    };

    if (!GEMINI_API_KEY) {
      return c.json({ error: 'Gemini API key not configured' }, 500);
    }

    const contextPrompt = moodContext ? `
      Recent mood context:
      - Recent mood scores: ${moodContext.recentMoods?.join(', ') || 'N/A'} (1-10 scale)
      - Current concerns: ${moodContext.concerns?.join(', ') || 'None specified'}
      - Wellness goals: ${moodContext.goals?.join(', ') || 'None specified'}
    ` : '';

    const analysisPrompt = `
      ${SAGE_SYSTEM_PROMPT}
      
      ${contextPrompt}
      
      Please analyze this message and provide:
      1. A supportive response (2-3 sentences)
      2. 2-3 specific actionable suggestions
      3. A brief mood insight (1 sentence)
      4. Support level needed (low/medium/high/crisis)
      
      User message: "${message}"
      
      Format your response as JSON:
      {
        "response": "your supportive response",
        "suggestedActions": ["action1", "action2", "action3"],
        "moodInsight": "brief insight about their emotional state",
        "supportLevel": "low|medium|high|crisis"
      }
    `;

    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{ text: analysisPrompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 800,
        candidateCount: 1,
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
      console.error('Gemini API error:', response.status, errorData);
      return c.json({ error: 'Failed to analyze mood' }, 500);
    }

    const data = await response.json() as { 
      candidates?: Array<{ content: { parts: Array<{ text: string }> } }> 
    };
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    try {
      const parsed = JSON.parse(responseText) as {
        response: string;
        suggestedActions: string[];
        moodInsight: string;
        supportLevel: 'low' | 'medium' | 'high' | 'crisis';
      };
      
      // Store mood analysis for insights
      try {
        const analysisId = `mood_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await kv.set(`mood_${analysisId}`, {
          userMessage: message,
          analysis: parsed,
          moodContext,
          timestamp: new Date().toISOString()
        });
      } catch (_kvError) {
        console.error('Failed to store mood analysis');
      }

      return c.json({
        ...parsed,
        success: true,
        timestamp: new Date().toISOString()
      });
    } catch (_parseError) {
      // Fallback if JSON parsing fails
      return c.json({
        response: responseText,
        suggestedActions: ["Take some time for self-care", "Consider reaching out to a friend or counselor"],
        moodInsight: "Every step towards better mental health matters.",
        supportLevel: 'medium',
        success: true,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Mood analysis error:', error);
    return c.json({ 
      error: 'Internal server error during mood analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Auth signup endpoint
app.post('/make-server-bba6a6a2/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json() as {
      email: string;
      password: string;
      name?: string;
    };

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters long' }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || '' },
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ 
        error: error.message || 'Failed to create account' 
      }, 400);
    }

    if (!data.user) {
      return c.json({ error: 'User creation failed' }, 500);
    }

    // Store user profile in KV store
    try {
      const userProfile: UserProfile = {
        id: data.user.id,
        name: name || '',
        email: data.user.email || '',
        preferences: {
          theme: 'light',
          notifications: true,
          privacy: {
            anonymousMode: false,
            dataSharing: false
          }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await kv.set(`user_profile_${data.user.id}`, userProfile);
      console.log('User profile stored successfully');
    } catch (_kvError) {
      console.error('Failed to store user profile');
      // Don't fail the signup if storage fails
    }

    return c.json({ 
      success: true,
      message: 'Account created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: name || ''
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ 
      error: 'Internal server error during signup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// User profile fetch endpoint
app.get('/make-server-bba6a6a2/user/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: 'Invalid authorization' }, 401);
    }

    // Try to get user profile from KV store
    try {
      const profile = await kv.get(`user_profile_${user.id}`) as UserProfile | null;
      if (profile) {
        return c.json({ 
          success: true, 
          user: profile 
        });
      }
    } catch (_kvError) {
      console.error('Failed to fetch user profile from KV');
    }

    // Fallback to creating profile from auth data
    const fallbackProfile: UserProfile = {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || '',
      email: user.email || '',
      preferences: {
        theme: 'light',
        notifications: true,
        privacy: {
          anonymousMode: false,
          dataSharing: false
        }
      },
      createdAt: user.created_at,
      updatedAt: new Date().toISOString()
    };

    // Store the fallback profile
    try {
      await kv.set(`user_profile_${user.id}`, fallbackProfile);
    } catch (_kvError) {
      console.error('Failed to store fallback profile');
    }

    return c.json({ 
      success: true, 
      user: fallbackProfile 
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return c.json({ error: 'Failed to fetch user profile' }, 500);
  }
});

// User profile update endpoint
app.put('/make-server-bba6a6a2/user/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: 'Invalid authorization' }, 401);
    }

    const updates = await c.req.json() as Partial<UserProfile>;
    
    // Get current profile
    let currentProfile: UserProfile;
    try {
      const profile = await kv.get(`user_profile_${user.id}`) as UserProfile | null;
      if (profile) {
        currentProfile = profile;
      } else {
        throw new Error('Profile not found');
      }
    } catch (_kvError) {
      // Create a new profile if it doesn't exist
      currentProfile = {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || '',
        email: user.email || '',
        preferences: {
          theme: 'light',
          notifications: true,
          privacy: {
            anonymousMode: false,
            dataSharing: false
          }
        },
        createdAt: user.created_at,
        updatedAt: new Date().toISOString()
      };
    }

    // Update profile with new data
    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Store updated profile in KV
    await kv.set(`user_profile_${user.id}`, updatedProfile);

    return c.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: updatedProfile
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Chat history endpoint
app.get('/make-server-bba6a6a2/ai/conversations', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    // Verify user
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: 'Invalid authorization' }, 401);
    }

    // Get recent conversations
    const conversations = await kv.getByPrefix(`ai_chat_`);
    
    // Limit to recent conversations and add basic privacy
    const recentConversations = conversations
      .slice(-50) // Last 50 conversations
      .map((conv: { key: string; timestamp: string; userMessage?: string; aiResponse?: string }) => ({
        id: conv.key,
        timestamp: conv.timestamp,
        preview: (conv.userMessage || '').substring(0, 100) + '...',
        responsePreview: (conv.aiResponse || '').substring(0, 100) + '...'
      }));

    return c.json({
      conversations: recentConversations,
      count: recentConversations.length,
      success: true
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return c.json({ error: 'Failed to fetch conversations' }, 500);
  }
});

// Community Stories endpoints
app.get('/make-server-bba6a6a2/stories', async (c) => {
  try {
    const category = c.req.query('category');
    const limit = parseInt(c.req.query('limit') || '50');
    
    const stories = await kv.getByPrefix('story_') as Story[];
    
    let filteredStories = stories;
    
    if (category) {
      filteredStories = filteredStories.filter((s) => s.category === category);
    }
    
    // Sort by creation date, newest first
    filteredStories.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json({ 
      stories: filteredStories.slice(0, limit),
      success: true 
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return c.json({ error: 'Failed to fetch stories' }, 500);
  }
});

app.post('/make-server-bba6a6a2/stories', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: 'Invalid authorization' }, 401);
    }

    const { title, content, category, imageUrl } = await c.req.json() as {
      title?: string;
      content: string;
      category?: string;
      imageUrl?: string;
    };

    if (!content?.trim()) {
      return c.json({ error: 'Content is required' }, 400);
    }

    const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newStory: Story = {
      id: storyId,
      userId: user.id,
      username: user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous',
      avatar: user.user_metadata?.avatar || '😊',
      title: title || '',
      content,
      category: category || 'general',
      imageUrl: imageUrl || '',
      reactions: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(storyId, newStory);

    return c.json({ success: true, story: newStory });
  } catch (error) {
    console.error('Error creating story:', error);
    return c.json({ error: 'Failed to create story' }, 500);
  }
});

// Community Chat endpoints
app.get('/make-server-bba6a6a2/communities', async (c) => {
  try {
    const communities = await kv.getByPrefix('community_') as Community[];
    
    return c.json({ 
      communities: communities,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching communities:', error);
    return c.json({ error: 'Failed to fetch communities' }, 500);
  }
});

app.post('/make-server-bba6a6a2/communities/:id/messages', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: 'Invalid authorization' }, 401);
    }

    const communityId = c.req.param('id');
    const { message: messageText } = await c.req.json() as { message: string };
    
    const userProfile = await kv.get(`user_profile_${user.id}`) as UserProfile | null;
    
    const message: StoredMessage = {
      id: `message_${communityId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      communityId,
      userId: user.id,
      username: userProfile?.name || 'User',
      avatar: userProfile?.avatar || '😊',
      message: messageText,
      timestamp: new Date().toISOString(),
      type: 'text',
      reactions: []
    };

    await kv.set(message.id, message);
    
    return c.json({ message, success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// Get messages for a community
app.get('/make-server-bba6a6a2/communities/:id/messages', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: 'Invalid authorization' }, 401);
    }

    const communityId = c.req.param('id');
    const limit = parseInt(c.req.query('limit') || '100');
    
    const messages = await kv.getByPrefix(`message_${communityId}_`) as StoredMessage[];
    
    // Sort by timestamp
    const sortedMessages = messages
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-limit);

    return c.json({ 
      messages: sortedMessages,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// 404 handler for all other routes
app.all('*', (c) => {
  return c.json({ error: 'Route not found' }, 404);
});

// Error handling middleware
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ 
    error: 'Internal server error',
    message: err.message 
  }, 500);
});

// Start the server
serve(app.fetch);
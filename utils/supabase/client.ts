import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info.tsx';

// Construct Supabase URL from project ID
export const supabaseUrl = `https://${projectId}.supabase.co`;

// Validate configuration
const validateConfig = () => {
  const errors = [];
  
  if (!projectId) {
    errors.push('Missing project ID');
  }
  
  if (!publicAnonKey) {
    errors.push('Missing public anonymous key');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate configuration before creating client
const config = validateConfig();
if (!config.isValid) {
  console.warn('Supabase configuration issues detected:', config.errors);
}

// Create Supabase client with error handling
export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Helper function to make authenticated API calls to our server
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-bba6a6a2`;
    const url = `${baseUrl}${endpoint}`;
    
    // Get the current session token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || publicAnonKey;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };
    
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });
    
    if (!response.ok) {
      let errorText = 'Unknown error';
      try {
        errorText = await response.text();
      } catch (parseError) {
        console.warn('Failed to parse error response:', parseError);
      }
      
      console.error(`API call failed: ${response.status} - ${errorText}`);
      console.error(`URL: ${url}`);
      console.error(`Request options:`, { ...defaultOptions, ...options });
      
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Helper function to check if Supabase is available
export const isSupabaseAvailable = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('kv_store_bba6a6a2').select('*').limit(1);
    return !error;
  } catch (error) {
    console.warn('Supabase unavailable:', error);
    return false;
  }
};

// Helper function to safely get user session
export const getUserSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Session check failed:', error);
    return null;
  }
};

// Helper function to safely sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
    return !error;
  } catch (error) {
    console.error('Sign out failed:', error);
    return false;
  }
};

// Export the client and helpers
export { publicAnonKey, projectId };

export default supabase;
import { supabase } from "./supabase/client";
import type { User, SyncStatus } from "./appHelpers";

export interface AppInitializationHandlers {
  setSyncStatus: (status: SyncStatus) => void;
  setUser: (user: User | null) => void;
}

export const checkSupabaseConnection = async (setSyncStatus: (status: SyncStatus) => void) => {
  try {
    // Try to make a simple query to check connection
    const { error } = await supabase.from('kv_store_bba6a6a2').select('*').limit(1);
    
    if (error) {
      console.log('Supabase connection failed, running in offline mode');
      setSyncStatus('offline');
    } else {
      setSyncStatus('synced');
    }
  } catch (error) {
    console.log('Supabase connection failed, running in offline mode');
    setSyncStatus('offline');
  }
};

export const checkUserSession = async ({ setUser, setSyncStatus }: AppInitializationHandlers) => {
  try {
    // First try to get user from Supabase if we're online
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatar: session.user.user_metadata?.avatar_url,
          preferences: {
            theme: (session.user.user_metadata?.theme as 'light' | 'dark') || 'light',
            notifications: session.user.user_metadata?.notifications ?? true,
            privacy: {
              anonymousMode: session.user.user_metadata?.anonymousMode ?? false,
              dataSharing: session.user.user_metadata?.dataSharing ?? true
            }
          }
        };
        
        setUser(userData);
        localStorage.setItem('ease-user', JSON.stringify(userData));
        return;
      }
    } catch (error) {
      console.log('Could not check Supabase session, checking localStorage');
    }
    
    // Fall back to localStorage
    const savedUser = localStorage.getItem('ease-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser) as User;
        // Ensure theme is properly typed
        if (userData.preferences && (!userData.preferences.theme || !['light', 'dark'].includes(userData.preferences.theme))) {
          userData.preferences.theme = 'light';
        }
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('ease-user');
      }
    }
  } catch (error) {
    console.error('Error checking user session:', error);
    setSyncStatus('offline');
  }
};

export const setupAuthListener = ({ setUser, setSyncStatus }: AppInitializationHandlers) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatar: session.user.user_metadata?.avatar_url,
          preferences: {
            theme: (session.user.user_metadata?.theme as 'light' | 'dark') || 'light',
            notifications: session.user.user_metadata?.notifications ?? true,
            privacy: {
              anonymousMode: session.user.user_metadata?.anonymousMode ?? false,
              dataSharing: session.user.user_metadata?.dataSharing ?? true
            }
          }
        };
        
        setUser(userData);
        localStorage.setItem('ease-user', JSON.stringify(userData));
        setSyncStatus('synced');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('ease-user');
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
};

export const initializeOfflineMode = ({ setUser, setSyncStatus }: AppInitializationHandlers) => {
  setSyncStatus('offline');
  
  // Check for saved user data
  const savedUser = localStorage.getItem('ease-user');
  if (savedUser) {
    try {
      const userData = JSON.parse(savedUser) as User;
      // Ensure theme is properly typed
      if (userData.preferences && (!userData.preferences.theme || !['light', 'dark'].includes(userData.preferences.theme))) {
        userData.preferences.theme = 'light';
      }
      setUser(userData);
    } catch (error) {
      console.error('Error parsing saved user data:', error);
      localStorage.removeItem('ease-user');
    }
  }
};

export const handleOfflineAuth = (email: string, password: string, name?: string): User | null => {
  // Simple offline authentication simulation
  const userData: User = {
    id: `offline-${Date.now()}`,
    name: name || email.split('@')[0],
    email: email,
    preferences: {
      theme: 'light',
      notifications: true,
      privacy: {
        anonymousMode: false,
        dataSharing: true
      }
    }
  };
  
  localStorage.setItem('ease-user', JSON.stringify(userData));
  return userData;
};

export const validateOfflineCredentials = (email: string, password: string): boolean => {
  // Basic validation for offline mode
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && password.length >= 6;
};

export const syncUserData = async (user: User): Promise<void> => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        name: user.name,
        theme: user.preferences.theme,
        notifications: user.preferences.notifications,
        anonymousMode: user.preferences.privacy?.anonymousMode,
        dataSharing: user.preferences.privacy?.dataSharing
      }
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error syncing user data:', error);
    throw error;
  }
};

export const createOfflineEntry = (type: string, data: any): void => {
  try {
    const offlineData = JSON.parse(localStorage.getItem('ease-offline-data') || '[]');
    offlineData.push({
      id: `offline-${Date.now()}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      synced: false
    });
    localStorage.setItem('ease-offline-data', JSON.stringify(offlineData));
  } catch (error) {
    console.error('Error creating offline entry:', error);
  }
};

export const getOfflineEntries = (type?: string): any[] => {
  try {
    const offlineData = JSON.parse(localStorage.getItem('ease-offline-data') || '[]');
    return type ? offlineData.filter((entry: any) => entry.type === type) : offlineData;
  } catch (error) {
    console.error('Error getting offline entries:', error);
    return [];
  }
};

export const clearOfflineData = (): void => {
  try {
    localStorage.removeItem('ease-offline-data');
  } catch (error) {
    console.error('Error clearing offline data:', error);
  }
};
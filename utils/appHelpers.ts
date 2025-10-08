// User interface and app helpers
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications?: boolean;
    privacy?: {
      anonymousMode: boolean;
      dataSharing: boolean;
    };
  };
}

export type SyncStatus = 'synced' | 'syncing' | 'offline';

// Theme management
export const loadTheme = (setTheme: (theme: 'light' | 'dark') => void) => {
  const savedTheme = localStorage.getItem('ease-theme') as 'light' | 'dark' | null;
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  setTheme(theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

// URL navigation helpers
export const updateSectionUrl = (section: string) => {
  const url = new URL(window.location.href);
  if (section === 'home') {
    url.searchParams.delete('section');
  } else {
    url.searchParams.set('section', section);
  }
  window.history.replaceState({}, '', url.toString());
};

export const handleUrlNavigation = (setActiveSection: (section: string) => void) => {
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get('section') || 'home';
  setActiveSection(section);
};

// PWA install prompt
export const setupInstallPrompt = (setShowInstallPrompt: (show: boolean) => void) => {
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    setShowInstallPrompt(true);
  });

  window.addEventListener('appinstalled', () => {
    setShowInstallPrompt(false);
    deferredPrompt = null;
  });

  return deferredPrompt;
};

// Online/offline listeners
export const setupOnlineListeners = (
  setIsOnline: (online: boolean) => void,
  setSyncStatus: (status: SyncStatus) => void,
  syncFunction: () => void
) => {
  const handleOnline = () => {
    setIsOnline(true);
    setSyncStatus('syncing');
    syncFunction();
  };

  const handleOffline = () => {
    setIsOnline(false);
    setSyncStatus('offline');
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Offline data sync
export const syncOfflineData = async (
  isOnline: boolean,
  user: User | null,
  setSyncStatus: (status: SyncStatus) => void
) => {
  if (!isOnline || !user) return;

  try {
    setSyncStatus('syncing');
    
    // Get any pending offline data
    const offlineData = localStorage.getItem('ease-offline-data');
    if (offlineData) {
      // In a real app, you would sync this data to the backend
      console.log('Syncing offline data:', JSON.parse(offlineData));
      localStorage.removeItem('ease-offline-data');
    }
    
    setSyncStatus('synced');
  } catch (error) {
    console.error('Error syncing offline data:', error);
    setSyncStatus('offline');
  }
};

// Storage helpers
export const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

// Notification helpers
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options
    });
  }
};

// Error handling
export const handleError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  
  // In development, we might want to show more detailed errors
  if (import.meta.env.DEV) {
    console.trace();
  }
  
  // Log to error reporting service in production
  if (import.meta.env.PROD) {
    // logErrorToService(error, context);
  }
};

// Device detection
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

// App version and updates
export const checkForUpdates = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      registration.update();
    }
  }
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Accessibility helpers
export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Data validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Date and time utilities
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  return formatDate(date);
};

// Color utilities
interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export const hexToRgb = (hex: string): RgbColor | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Array utilities
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Debounce utility - using function declaration to avoid generic syntax issues
export function debounce(func: (...args: any[]) => any, wait: number): (...args: any[]) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility - using function declaration to avoid generic syntax issues
export function throttle(func: (...args: any[]) => any, limit: number): (...args: any[]) => void {
  let inThrottle: boolean;
  
  return (...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Local storage helpers with error handling
export const getStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

export const setStorageItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('Error setting localStorage item:', error);
    return false;
  }
};

export const removeStorageItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing localStorage item:', error);
    return false;
  }
};

// Math utilities
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

export const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// URL utilities
export const parseQueryParams = (search: string): Record<string, string> => {
  const params: Record<string, string> = {};
  const urlParams = new URLSearchParams(search);
  
  for (const [key, value] of urlParams.entries()) {
    params[key] = value;
  }
  
  return params;
};

export const buildQueryString = (params: Record<string, string | number | boolean>): string => {
  const urlParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      urlParams.append(key, String(value));
    }
  });
  
  return urlParams.toString();
};

// Animation utilities
export const easeInOut = (t: number): number => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

export const easeOut = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

export const easeIn = (t: number): number => {
  return t * t * t;
};

// Feature detection
export const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

export const supportsLocalStorage = (): boolean => {
  try {
    const test = 'localStorage-test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

export const supportsServiceWorker = (): boolean => {
  return 'serviceWorker' in navigator;
};

// Cleanup utilities
export const createCleanupFunction = (...cleanupFunctions: (() => void)[]): (() => void) => {
  return () => {
    cleanupFunctions.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });
  };
};
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "./components/Navigation";
import { AuthScreens } from "./components/AuthScreens";
import { LoadingScreen } from "./components/LoadingScreen";
import { FloatingShapes } from "./components/FloatingShapes";
import { UserWelcomeBar } from "./components/UserWelcomeBar";
import { EnhancedInteractiveBackground } from "./components/InteractiveParticles";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Toaster } from "./components/ui/sonner";
import { Moon, Sun, Sparkles, Heart } from "lucide-react";
import { supabase, apiCall } from "../utils/supabase/client";
import { toast } from "sonner";
import {
  setupOnlineListeners,
  syncOfflineData as syncOfflineDataUtil,
  loadTheme,
  handleUrlNavigation,
  updateSectionUrl
} from "../utils/appHelpers";
import {
  checkSupabaseConnection,
  setupAuthListener,
  checkUserSession
} from "../utils/appInitialization";
import { renderActiveSection } from "../utils/sectionRenderer";
import { SECTION_TITLES } from "./constants/appConstants";

// Type-only imports
import type { User, SyncStatus } from "../utils/appHelpers";
import type { AppInitializationHandlers } from "../utils/appInitialization";

export default function App() {
  const [activeSection, setActiveSection] = useState("home");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');

  useEffect(() => {
    initializeApp();
    const cleanup = setupOnlineListeners(setIsOnline, setSyncStatus, () =>
      syncOfflineDataUtil(isOnline, user, setSyncStatus)
    );
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeApp = async () => {
    try {
      const handlers: AppInitializationHandlers = { setSyncStatus, setUser };

      // Try to check Supabase connection, but don't fail if it's not available
      try {
        await checkSupabaseConnection(setSyncStatus);
      } catch (error) {
        console.warn('Supabase connection failed, running in offline mode:', error);
        setSyncStatus('offline');
      }

      // Try to check user, but fall back to localStorage if needed
      try {
        await checkUserSession(handlers);
      } catch (error) {
        console.warn('User session check failed:', error);
      }

      // Load theme (always works)
      try {
        loadTheme(setTheme);
      } catch (error) {
        console.warn('Theme loading failed:', error);
      }

      // Handle URL navigation (always works)
      try {
        handleUrlNavigation(setActiveSection);
      } catch (error) {
        console.warn('URL navigation setup failed:', error);
      }

      // Setup auth listener only if supabase is available
      if (syncStatus !== 'offline') {
        try {
          setupAuthListener(handlers);
        } catch (error) {
          console.warn('Auth listener setup failed:', error);
        }
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      setSyncStatus('offline');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme: 'light' | 'dark' = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('ease-theme', newTheme);

    if (user) {
      try {
        const updatedUser: User = {
          ...user,
          preferences: { ...user.preferences, theme: newTheme }
        };
        setUser(updatedUser);
        localStorage.setItem('ease-user', JSON.stringify(updatedUser));

        // Only try to sync if we're online and connected
        if (isOnline && syncStatus === 'synced') {
          try {
            await apiCall('/user/profile', {
              method: 'PUT',
              body: JSON.stringify({ preferences: updatedUser.preferences })
            });
          } catch (syncError) {
            console.log('Could not sync theme preference - offline mode');
            // Theme still works locally, so don't show error
          }
        }
      } catch (error) {
        console.error('Error updating theme preference:', error);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      // Try to sign out from Supabase if available
      if (syncStatus !== 'offline') {
        await supabase.auth.signOut();
      }

      // Always clear local state
      setUser(null);
      localStorage.removeItem('ease-user');
      setActiveSection("home");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if Supabase sign out fails, clear local state
      setUser(null);
      localStorage.removeItem('ease-user');
      setActiveSection("home");
      toast.success("Signed out locally");
    }
  };

  const handleAuthSuccess = (userData: User) => {
    // Ensure the preferences object has the correct structure
    const normalizedUser: User = {
      ...userData,
      preferences: {
        theme: userData.preferences?.theme || 'light',
        notifications: userData.preferences?.notifications,
        privacy: userData.preferences?.privacy
      }
    };

    setUser(normalizedUser);
    localStorage.setItem('ease-user', JSON.stringify(normalizedUser));
    setActiveSection("home");
    toast.success(`Welcome ${normalizedUser.name}! 🎉`);
  };

  const handleSectionChange = (section: string) => {
    updateSectionUrl(section);
    setActiveSection(section);
  };

  if (isLoading) {
    return <LoadingScreen syncStatus={syncStatus} />;
  }

  if (!user && activeSection === "auth") {
    return (
      <AuthScreens
        onAuthSuccess={handleAuthSuccess}
        onBack={() => setActiveSection("home")}
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Enhanced Interactive Background */}
      <EnhancedInteractiveBackground />

      {/* Floating Shapes */}
      <FloatingShapes />

      {/* Navigation */}
      <Navigation
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* User Welcome Bar */}
      <AnimatePresence>
        {user && (
          <UserWelcomeBar
            user={user}
            syncStatus={syncStatus}
            onSignOut={handleSignOut}
          />
        )}
      </AnimatePresence>

      {/* Section Header */}
      <AnimatePresence>
        {activeSection !== "home" && (
          <motion.div
            className="sticky z-40 border-b bg-white/5 dark:bg-gray-900/10 border-white/10 dark:border-gray-700/20 top-16 backdrop-blur-xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent dark:via-white/2 animate-pulse" />
            </div>

            <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="flex items-center py-5 space-x-6">
                <motion.div
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSectionChange("home")}
                    className="text-gray-700 transition-all duration-300 border shadow-lg dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/30 backdrop-blur-sm border-white/10 dark:border-gray-700/30 hover:shadow-xl"
                  >
                    ← Back to Home
                  </Button>
                </motion.div>

                <motion.div
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {SECTION_TITLES[activeSection] || ""}
                  </h1>
                </motion.div>

                {syncStatus !== 'synced' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Badge variant="outline" className="text-xs bg-white/10 dark:bg-gray-800/20 border-white/20 dark:border-gray-700/30 backdrop-blur-sm">
                      {syncStatus === 'syncing' ? 'Syncing...' : 'Offline Mode'}
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content (pushed down so the fixed nav doesn't overlap) */}
      <main className="relative px-4 py-8 pt-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.02 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {renderActiveSection({
              activeSection,
              user,
              syncStatus,
              handleSectionChange,
              setActiveSection
            })}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Enhanced Theme Toggle */}
      <motion.div
        className="fixed z-50 bottom-8 right-8"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 400, damping: 15 }}
      >
        <Button
          onClick={toggleTheme}
          size="lg"
          className="relative w-16 h-16 overflow-hidden border-0 rounded-full shadow-2xl bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-700 hover:from-purple-600 hover:via-blue-700 hover:to-indigo-800 backdrop-blur-sm"
        >
          {/* Animated background rings */}
          <motion.div
            className="absolute inset-0 border-2 rounded-full border-white/30"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.2, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute inset-0 border rounded-full border-white/20"
            animate={{
              scale: [1.3, 1, 1.3],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
          />

          {/* Icon with smooth rotation */}
          <motion.div
            animate={{ rotate: theme === 'dark' ? 180 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="relative z-10"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {theme === 'light' ? (
                <Moon className="text-white w-7 h-7 drop-shadow-lg" />
              ) : (
                <Sun className="text-white w-7 h-7 drop-shadow-lg" />
              )}
            </motion.div>
          </motion.div>
        </Button>
      </motion.div>

      {/* Enhanced Footer */}
      <footer className="relative mt-20 border-t bg-white/5 dark:bg-gray-900/10 border-white/10 dark:border-gray-700/20 backdrop-blur-xl">
        {/* Decorative top border */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

        <div className="relative px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Emergency notice with enhanced styling */}
            <motion.div
              className="p-6 mb-8 border bg-gradient-to-r from-red-50/80 to-pink-50/80 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl border-red-200/50 dark:border-red-700/30 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex items-center justify-center mb-3 space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-600">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                  Mental Health Emergency
                </h3>
              </div>
              <p className="mb-2 font-medium text-red-700 dark:text-red-300">
                If you're experiencing a mental health emergency, please call 911 or go to your nearest emergency room.
              </p>
              <div className="space-y-1 text-sm text-red-600 dark:text-red-400">
                <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
                <p><strong>National Suicide Prevention Lifeline:</strong> 988</p>
              </div>
            </motion.div>

            {/* Disclaimer */}
            <motion.p
              className="mb-8 italic text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              Ease is not a substitute for professional medical advice, diagnosis, or treatment.
            </motion.p>

            {/* Navigation Links */}
            <motion.div
              className="flex justify-center mb-8 space-x-8 text-sm"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
            >
              {[
                { label: "Privacy Policy", section: "privacy" },
                { label: "Crisis Resources", section: "support" },
                { label: "Contact Support", href: "mailto:support@ease-app.com" }
              ].map((link, index) => (
                <motion.div key={link.label} whileHover={{ scale: 1.05 }}>
                  {link.href ? (
                    <a
                      href={link.href}
                      className="font-medium text-gray-600 transition-colors dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <button
                      onClick={() => handleSectionChange(link.section!)}
                      className="font-medium text-gray-600 transition-colors dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {link.label}
                    </button>
                  )}
                  {index < 2 && <span className="ml-8 text-gray-400">•</span>}
                </motion.div>
              ))}
            </motion.div>

            {/* Technology Badges */}
            <motion.div
              className="flex items-center justify-center space-x-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="text-sm text-gray-500 dark:text-gray-400">Powered by</span>

              <motion.div
                whileHover={{ scale: 1.05, rotate: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Badge className="px-3 py-1 text-white shadow-lg bg-gradient-to-r from-emerald-500 to-blue-600">
                  Supabase
                </Badge>
              </motion.div>

              <span className="text-gray-400">•</span>

              <motion.div
                whileHover={{ scale: 1.05, rotate: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Badge className="px-3 py-1 text-white shadow-lg bg-gradient-to-r from-purple-500 to-pink-600">
                  Gemini AI
                </Badge>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </footer>

      {/* Toast Notifications (rendered so Toaster import isn't unused) */}
      <Toaster />

    </div>
  );
}

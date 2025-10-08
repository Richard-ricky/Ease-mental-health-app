import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  Heart, 
  Cloud,
  Sparkles,
  Star,
  Zap,
  Shield,
  ArrowRight,
  Gift,
  Rocket,
  Crown
} from "lucide-react";
import { APP_FEATURES, QUICK_ACTIONS } from "../constants/appConstants";
import { User, SyncStatus } from "../../utils/appHelpers";

interface HomePageProps {
  user: User | null;
  syncStatus: SyncStatus;
  handleSectionChange: (section: string) => void;
}

// Floating decorative elements
const DecoративеElement = ({ children, delay = 0, duration = 20 }: { 
  children: React.ReactNode; 
  delay?: number; 
  duration?: number; 
}) => (
  <motion.div
    className="absolute pointer-events-none opacity-20 dark:opacity-10"
    animate={{
      y: [-20, -40, -20],
      rotate: [0, 10, -10, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    {children}
  </motion.div>
);

export function HomePage({ 
  user, 
  syncStatus, 
  handleSectionChange 
}: HomePageProps) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const featuredFeatures = APP_FEATURES.filter(feature => feature.featured);
  const newFeatures = APP_FEATURES.filter(feature => feature.isNew);

  return (
    <div className="relative space-y-12">
      {/* Decorative floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <DecoративеElement delay={0} duration={25}>
          <div className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 top-20 left-10" />
        </DecoративеElement>
        <DecoративеElement delay={5} duration={30}>
          <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-800 dark:to-cyan-800 top-40 right-20" />
        </DecoративеElement>
        <DecoративеElement delay={10} duration={20}>
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800 dark:to-teal-800 bottom-40 left-1/4" />
        </DecoративеElement>
        
        {/* Floating icons */}
        <DecoративеElement delay={2} duration={35}>
          <Heart className="absolute w-8 h-8 text-pink-400 dark:text-pink-600 top-32 right-1/3" />
        </DecoративеElement>
        <DecoративеElement delay={7} duration={28}>
          <Star className="absolute w-6 h-6 text-yellow-400 dark:text-yellow-600 bottom-32 right-20" />
        </DecoративеElement>
        <DecoративеElement delay={12} duration={22}>
          <Sparkles className="absolute w-10 h-10 text-purple-400 dark:text-purple-600 top-60 left-2/3" />
        </DecoративеElement>
      </div>

      {/* Hero Section */}
      <motion.div
        className="relative space-y-8 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Time and Greeting */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text">
            {user ? `${greeting}, ${user.name}!` : "Welcome to Ease"}
          </h1>
          <p className="max-w-2xl mx-auto text-xl leading-relaxed text-gray-600 dark:text-gray-300">
            {user 
              ? "Ready to continue your wellness journey? Let's make today amazing! ✨" 
              : "Your comprehensive mental health companion powered by AI and designed for your wellbeing"
            }
          </p>
        </motion.div>

        {/* Sync Status Badge */}
        {user && (
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className={`flex items-center space-x-3 px-6 py-3 rounded-2xl backdrop-blur-lg border shadow-lg ${
              syncStatus === 'synced' 
                ? 'bg-emerald-50/80 border-emerald-200/50 dark:bg-emerald-900/20 dark:border-emerald-700/30'
                : syncStatus === 'syncing'
                ? 'bg-amber-50/80 border-amber-200/50 dark:bg-amber-900/20 dark:border-amber-700/30'
                : 'bg-orange-50/80 border-orange-200/50 dark:bg-orange-900/20 dark:border-orange-700/30'
            }`}>
              <motion.div
                className={`w-3 h-3 rounded-full ${
                  syncStatus === 'synced' ? 'bg-emerald-500' :
                  syncStatus === 'syncing' ? 'bg-amber-500' : 'bg-orange-500'
                }`}
                animate={syncStatus === 'syncing' ? { 
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.5, 1]
                } : {}}
                transition={syncStatus === 'syncing' ? { 
                  duration: 1.5, 
                  repeat: Infinity 
                } : {}}
              />
              <Cloud className="w-4 h-4" />
              <span className="text-sm font-medium">
                {syncStatus === 'synced' ? 'Cloud Sync Active' : 
                 syncStatus === 'syncing' ? 'Syncing...' : 
                 'Offline Mode - Data Saved Locally'}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Offline Mode Notice */}
      <AnimatePresence>
        {syncStatus === 'offline' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="shadow-xl bg-gradient-to-r from-orange-50/80 to-amber-50/80 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200/50 dark:border-orange-700/50 backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="flex items-center justify-center shadow-lg w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Cloud className="text-white w-7 h-7" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold text-orange-900 dark:text-orange-100">
                      🌍 Running in Offline Mode
                    </h3>
                    <p className="text-orange-700 dark:text-orange-300">
                      Your data is being saved locally. Features like AI chat and cloud sync will be available when you're back online.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      {user && (
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Quick Actions
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Jump right into your wellness routine
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {QUICK_ACTIONS.map((action, index) => (
              <motion.div
                key={action.section}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  onClick={() => handleSectionChange(action.section)}
                  className={`cursor-pointer h-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden`}
                >
                  {/* Animated background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-${action.color}-50/20 to-${action.color}-100/20 dark:from-${action.color}-900/10 dark:to-${action.color}-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <CardContent className="relative p-6 space-y-4 text-center">
                    <motion.div
                      className={`w-16 h-16 mx-auto bg-gradient-to-br from-${action.color}-500 to-${action.color}-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <action.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <div>
                      <h3 className="mb-1 font-semibold text-gray-800 dark:text-gray-200">
                        {action.label}
                      </h3>
                      {action.badge && (
                        <Badge className={`bg-gradient-to-r from-${action.color}-500 to-${action.color}-600 text-white text-xs`}>
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    
                    <motion.div
                      className="flex items-center justify-center text-gray-600 transition-opacity duration-300 opacity-0 dark:text-gray-400 group-hover:opacity-100"
                      initial={{ x: -10 }}
                      whileHover={{ x: 0 }}
                    >
                      <span className="mr-2 text-sm">Let's go</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* New Features Highlight */}
      {newFeatures.length > 0 && (
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <Card className="relative overflow-hidden shadow-xl bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-indigo-50/80 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 border-purple-200/50 dark:border-purple-700/30 backdrop-blur-lg">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20"
                animate={{
                  x: [-100, 100, -100],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
            
            <CardHeader className="relative pb-6 text-center">
              <div className="flex items-center justify-center mb-4 space-x-3">
                <motion.div
                  className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Rocket className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl text-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text">
                    ✨ New Features Available!
                  </CardTitle>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Discover the latest enhancements to your wellness journey
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {newFeatures.slice(0, 3).map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="cursor-pointer group"
                  onClick={() => handleSectionChange(feature.section)}
                >
                  <div className="h-full p-6 transition-all duration-300 border bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border-white/30 dark:border-gray-700/30 hover:shadow-lg">
                    <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-800 transition-colors dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <Badge className="text-xs text-white bg-gradient-to-r from-green-500 to-emerald-600">
                        <Gift className="w-3 h-3 mr-1" />
                        New
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-gray-400 transition-all duration-300 group-hover:text-purple-500 group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Featured Features Grid */}
      <motion.div
        className="mx-auto max-w-7xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-gray-200">
            Comprehensive Mental Health Support
          </h2>
          <p className="max-w-3xl mx-auto text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Everything you need for your mental wellness journey, powered by cutting-edge AI and designed with your privacy in mind
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 + index * 0.1, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                onClick={() => handleSectionChange(feature.section)}
                className={`cursor-pointer h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden ${
                  !user && feature.requiresAuth ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {/* Animated glow effect */}
                <motion.div
                  className="absolute inset-0 transition-transform duration-1000 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent dark:via-white/2 group-hover:translate-x-full"
                  initial={false}
                />
                
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <motion.div
                      className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <feature.icon className="w-7 h-7" />
                    </motion.div>
                    
                    <div className="flex space-x-2">
                      {feature.isNew && (
                        <Badge className="text-xs text-white bg-gradient-to-r from-green-500 to-emerald-600">
                          <Star className="w-3 h-3 mr-1" />
                          New
                        </Badge>
                      )}
                      {feature.premium && (
                        <Badge className="text-xs text-white bg-gradient-to-r from-yellow-500 to-orange-600">
                          <Crown className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                      {feature.requiresAuth && !user && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Sign In
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg transition-colors duration-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                  
                  <motion.div
                    className="flex items-center text-purple-600 transition-opacity duration-300 opacity-0 dark:text-purple-400 group-hover:opacity-100"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    <span className="mr-2 text-sm font-medium">
                      {!user && feature.requiresAuth ? 'Sign in to access' : 'Explore this feature'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Call to Action */}
      {!user && (
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <Card className="relative overflow-hidden shadow-xl bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200/50 dark:border-purple-700/30 backdrop-blur-lg">
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <CardContent className="relative p-10">
              <motion.div
                className="space-y-6"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.2, duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text">
                  Ready to start your wellness journey?
                </h2>
                <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                  Join thousands who are improving their mental health with Ease. 
                  Get personalized AI support, track your progress, and connect with a caring community.
                </p>
                
                <motion.div
                  className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.4, duration: 0.6 }}
                >
                  <Button
                    onClick={() => handleSectionChange("auth")}
                    size="lg"
                    className="px-8 py-3 text-white transition-all duration-300 shadow-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:shadow-2xl"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Get Started Free
                  </Button>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Privacy First</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>AI Powered</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Free Forever</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
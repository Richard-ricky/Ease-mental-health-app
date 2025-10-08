import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { 
  Menu, 
  Home, 
  Heart, 
  Bot, 
  Users, 
  Shield, 
  Mic, 
  TrendingUp, 
  Target,
  Stethoscope,
  BarChart3,
  Sun,
  CheckCircle,
  Play,
  MessageCircle,
  Wind,
  Trophy,
  Calendar,
  Bell,
  Video,
  Activity,
  Sparkles,
  X,
  Zap,
  Brain,
  Lightbulb,
  Award,
  Cloud,
  AlertTriangle,
  Eye,
  PieChart
} from "lucide-react";
import { User } from "../../utils/appHelpers";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  user: User | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const NAVIGATION_ITEMS = [
  {
    section: "home",
    label: "Home",
    icon: Home,
    description: "Dashboard and overview",
    category: "main"
  },
  {
    section: "journal",
    label: "Mood Journal",
    icon: Heart,
    description: "Track your daily mood",
    category: "wellness",
    requiresAuth: true
  },
  {
    section: "ai-chat",
    label: "AI Companion",
    icon: Bot,
    description: "Chat with Sage",
    category: "wellness",
    requiresAuth: true,
    isNew: true
  },
  {
    section: "voice-journal",
    label: "Voice Journal",
    icon: Mic,
    description: "Record your thoughts",
    category: "wellness",
    requiresAuth: true
  },
  {
    section: "analytics",
    label: "Mood Analytics",
    icon: TrendingUp,
    description: "View your progress",
    category: "insights",
    requiresAuth: true
  },
  {
    section: "interactive-insights",
    label: "Interactive Insights",
    icon: PieChart,
    description: "Advanced AI analytics",
    category: "insights",
    requiresAuth: true,
    isNew: true
  },
  {
    section: "crisis-detection",
    label: "Crisis Detection",
    icon: AlertTriangle,
    description: "AI safety monitoring",
    category: "insights",
    requiresAuth: true,
    isNew: true
  },
  {
    section: "habits",
    label: "Habit Tracker",
    icon: Target,
    description: "Build healthy habits",
    category: "wellness",
    requiresAuth: true
  },
  {
    section: "achievements",
    label: "Achievements",
    icon: Trophy,
    description: "Your wellness milestones",
    category: "insights",
    requiresAuth: true,
    isNew: true
  },
  {
    section: "weather-mood",
    label: "Weather & Mood",
    icon: Cloud,
    description: "Weather impact analysis",
    category: "insights",
    requiresAuth: true,
    isNew: true
  },
  {
    section: "challenges",
    label: "Wellness Challenges",
    icon: Zap,
    description: "Join community challenges",
    category: "community",
    requiresAuth: true,
    isNew: true
  },
  {
    section: "wellness",
    label: "Wellness Tools",
    icon: Wind,
    description: "Meditation & breathing",
    category: "wellness",
    requiresAuth: true
  },
  {
    section: "assessments",
    label: "Assessments",
    icon: Stethoscope,
    description: "Mental health screening",
    category: "insights",
    requiresAuth: true
  },
  {
    section: "health-dashboard",
    label: "Health Dashboard",
    icon: Activity,
    description: "Comprehensive health overview",
    category: "insights",
    requiresAuth: true,
    isNew: true
  },
  {
    section: "group-therapy",
    label: "Group Therapy",
    icon: Video,
    description: "Join therapy sessions",
    category: "community",
    requiresAuth: true,
    isNew: true
  },
  {
    section: "wellness-plans",
    label: "Wellness Plans",
    icon: Brain,
    description: "AI-generated wellness plans",
    category: "wellness",
    requiresAuth: true,
    isNew: true
  },
  {
    section: "community",
    label: "Community Stories",
    icon: Users,
    description: "Share and connect",
    category: "community"
  },
  {
    section: "community-chat",
    label: "Community Chat",
    icon: MessageCircle,
    description: "Chat with community",
    category: "community",
    requiresAuth: true
  },
  {
    section: "therapists",
    label: "Find Therapists",
    icon: Stethoscope,
    description: "Professional help directory",
    category: "resources",
    requiresAuth: true
  },
  {
    section: "groups",
    label: "Support Groups",
    icon: Users,
    description: "Join support communities",
    category: "community",
    requiresAuth: true
  },
  {
    section: "reports",
    label: "Progress Reports",
    icon: BarChart3,
    description: "Detailed wellness reports",
    category: "insights",
    requiresAuth: true
  },
  {
    section: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Manage your alerts",
    category: "settings",
    requiresAuth: true,
    isNew: true
  },
  {
    section: "motivation",
    label: "Daily Motivation",
    icon: Sun,
    description: "Inspirational content",
    category: "wellness"
  },
  {
    section: "todos",
    label: "Wellness Tasks",
    icon: CheckCircle,
    description: "Daily wellness todos",
    category: "wellness",
    requiresAuth: true
  },
  {
    section: "videos",
    label: "Inspiration Videos",
    icon: Play,
    description: "Motivational content",
    category: "resources"
  },
  {
    section: "privacy",
    label: "Privacy Dashboard",
    icon: Shield,
    description: "Manage your privacy",
    category: "settings",
    requiresAuth: true
  },
  {
    section: "support",
    label: "Crisis Support",
    icon: Shield,
    description: "Emergency resources",
    category: "resources"
  }
];

const CATEGORIES = [
  { id: "main", label: "Main", icon: Home },
  { id: "wellness", label: "Wellness", icon: Heart },
  { id: "insights", label: "Insights", icon: TrendingUp },
  { id: "community", label: "Community", icon: Users },
  { id: "resources", label: "Resources", icon: Lightbulb },
  { id: "settings", label: "Settings", icon: Target }
];

export function Navigation({ activeSection, onSectionChange, user, theme, onToggleTheme }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const groupedItems = NAVIGATION_ITEMS.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof NAVIGATION_ITEMS>);

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    setIsOpen(false);
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b bg-white/10 dark:bg-gray-900/20 backdrop-blur-2xl border-white/20 dark:border-gray-700/30">
      {/* Decorative gradient line */}
      <motion.div
        className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500"
        animate={{ width: ["0%", "100%", "0%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div 
              className="flex items-center justify-center w-10 h-10 shadow-lg bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-700 rounded-xl"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Heart className="w-5 h-5 text-white" />
            </motion.div>
            
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text">
                Ease
              </h1>
              <p className="-mt-1 text-xs text-gray-600 dark:text-gray-400">
                Mental Health Companion
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="items-center hidden space-x-1 lg:flex">
            {NAVIGATION_ITEMS.slice(0, 8).map((item, index) => {
              const Icon = item.icon;
              const isActive = activeSection === item.section;
              const isDisabled = item.requiresAuth && !user;
              
              return (
                <motion.div
                  key={item.section}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => !isDisabled && handleSectionChange(item.section)}
                    disabled={isDisabled}
                    className={`relative flex items-center space-x-2 px-3 py-2 transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                        : 'hover:bg-white/20 dark:hover:bg-gray-800/30 text-gray-700 dark:text-gray-300'
                    } ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden text-sm font-medium xl:inline">{item.label}</span>
                    
                    {item.isNew && !isDisabled && (
                      <motion.div
                        className="absolute -top-1 -right-1"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Badge className="h-4 min-w-0 px-1 py-0 text-xs text-white bg-gradient-to-r from-green-500 to-emerald-600">
                          New
                        </Badge>
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-700 border shadow-lg dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/30 backdrop-blur-sm border-white/15 dark:border-gray-700/35"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </motion.div>
              </SheetTrigger>
              
              <SheetContent 
                side="right" 
                className="w-[300px] sm:w-[400px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-l border-white/20 dark:border-gray-700/30"
                title="Navigation Menu"
                description="Navigate through the Ease mental health app sections"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Heart className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="font-semibold text-gray-800 dark:text-gray-200">
                        Ease Menu
                      </h2>
                      {user && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Welcome, {user.name}!
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {CATEGORIES.map((category) => {
                    const categoryItems = groupedItems[category.id] || [];
                    const CategoryIcon = category.icon;
                    
                    if (categoryItems.length === 0) return null;
                    
                    return (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center px-2 space-x-2">
                          <CategoryIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <h3 className="text-sm font-medium tracking-wide text-gray-700 uppercase dark:text-gray-300">
                            {category.label}
                          </h3>
                        </div>
                        
                        <div className="space-y-1">
                          {categoryItems.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.section;
                            const isDisabled = item.requiresAuth && !user;
                            
                            return (
                              <motion.div
                                key={item.section}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                whileHover={{ x: 4 }}
                              >
                                <Button
                                  variant="ghost"
                                  onClick={() => !isDisabled && handleSectionChange(item.section)}
                                  disabled={isDisabled}
                                  className={`w-full justify-start space-x-3 px-3 py-2 h-auto transition-all duration-300 ${
                                    isActive 
                                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-700 dark:text-purple-300 border-l-2 border-purple-500' 
                                      : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                                  } ${
                                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                >
                                  <div className="relative">
                                    <Icon className="w-5 h-5" />
                                    {item.isNew && !isDisabled && (
                                      <motion.div
                                        className="absolute w-2 h-2 bg-green-500 rounded-full -top-1 -right-1"
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                      />
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 text-left">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">{item.label}</span>
                                      {item.isNew && !isDisabled && (
                                        <Badge className="h-4 px-1 py-0 text-xs text-white bg-green-500">
                                          New
                                        </Badge>
                                      )}
                                      {item.requiresAuth && !user && (
                                        <Badge variant="outline" className="h-4 px-1 py-0 text-xs">
                                          Sign In
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      {item.description}
                                    </p>
                                  </div>
                                </Button>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="pt-6 mt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user ? `Signed in as ${user.name}` : 'Not signed in'}
                    </div>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleTheme}
                        className="w-8 h-8 p-0 rounded-full"
                      >
                        {theme === 'light' ? (
                          <Sun className="w-4 h-4" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Theme Toggle for Desktop */}
          <div className="hidden lg:block">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleTheme}
                className="w-10 h-10 p-0 text-gray-700 border shadow-lg dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/30 backdrop-blur-sm border-white/15 dark:border-gray-700/35 rounded-xl"
              >
                <motion.div
                  animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === 'light' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </nav>
  );
}
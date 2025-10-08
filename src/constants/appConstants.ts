import { 
  Heart, 
  Bot, 
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
  Users,
  Shield,
  Calendar,
  Bell,
  Video,
  Activity,
  Brain,
  Zap,
  Cloud,
  AlertTriangle,
  PieChart
} from "lucide-react";

// Section titles for navigation
export const SECTION_TITLES: Record<string, string> = {
  home: "Home",
  journal: "Mood Journal",
  "ai-chat": "AI Companion",
  "voice-journal": "Voice Journal",
  analytics: "Mood Analytics",
  "interactive-insights": "Interactive Insights",
  "crisis-detection": "Crisis Detection AI",
  habits: "Habit Tracker",
  achievements: "Achievements",
  "weather-mood": "Weather & Mood",
  challenges: "Wellness Challenges",
  wellness: "Wellness Tools",
  assessments: "Mental Health Assessments",
  "health-dashboard": "Health Dashboard",
  "group-therapy": "Group Therapy",
  "wellness-plans": "Wellness Plans",
  notifications: "Notifications",
  motivation: "Daily Motivation",
  todos: "Wellness Tasks",
  videos: "Inspiration Videos",
  "community-chat": "Community Chat",
  community: "Community Stories",
  therapists: "Find Therapists",
  groups: "Support Groups",
  reports: "Progress Reports",
  chat: "Chat Interface",
  privacy: "Privacy Dashboard",
  support: "Crisis Support",
  users: "User Directory"
};

// App features for HomePage
export const APP_FEATURES = [
  {
    title: "AI Companion",
    description: "Chat with Sage, your personal AI mental health companion",
    icon: Bot,
    section: "ai-chat",
    color: "bg-gradient-to-br from-purple-500 to-blue-600 text-white",
    requiresAuth: true,
    featured: true,
    isNew: true,
    premium: false
  },
  {
    title: "Crisis Detection AI",
    description: "Advanced AI monitoring for your safety and wellbeing",
    icon: AlertTriangle,
    section: "crisis-detection",
    color: "bg-gradient-to-br from-red-500 to-pink-600 text-white",
    requiresAuth: true,
    featured: true,
    isNew: true,
    premium: true
  },
  {
    title: "Interactive Insights",
    description: "Advanced analytics with actionable recommendations",
    icon: PieChart,
    section: "interactive-insights",
    color: "bg-gradient-to-br from-indigo-500 to-purple-600 text-white",
    requiresAuth: true,
    featured: true,
    isNew: true,
    premium: false
  },
  {
    title: "Mood Tracking",
    description: "Track your emotional wellbeing with intuitive mood logging",
    icon: Heart,
    section: "journal",
    color: "bg-gradient-to-br from-pink-500 to-red-600 text-white",
    requiresAuth: true,
    featured: true,
    premium: false
  },
  {
    title: "Voice Journal",
    description: "Express yourself through voice recordings and AI transcription",
    icon: Mic,
    section: "voice-journal",
    color: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white",
    requiresAuth: true,
    featured: true,
    premium: false
  },
  {
    title: "Weather & Mood",
    description: "Discover how weather patterns affect your mental health",
    icon: Cloud,
    section: "weather-mood",
    color: "bg-gradient-to-br from-blue-500 to-cyan-600 text-white",
    requiresAuth: true,
    featured: true,
    isNew: true,
    premium: true
  },
  {
    title: "Wellness Challenges",
    description: "Join community challenges to improve your mental health",
    icon: Zap,
    section: "challenges",
    color: "bg-gradient-to-br from-yellow-500 to-orange-600 text-white",
    requiresAuth: true,
    featured: true,
    isNew: true,
    premium: false
  },
  {
    title: "Achievement System",
    description: "Track your progress with badges and milestones",
    icon: Trophy,
    section: "achievements",
    color: "bg-gradient-to-br from-amber-500 to-yellow-600 text-white",
    requiresAuth: true,
    featured: true,
    isNew: true,
    premium: false
  },
  {
    title: "Analytics Dashboard",
    description: "Visualize your mental health patterns and trends",
    icon: TrendingUp,
    section: "analytics",
    color: "bg-gradient-to-br from-indigo-500 to-blue-600 text-white",
    requiresAuth: true,
    featured: true,
    premium: false
  },
  {
    title: "Habit Tracker",
    description: "Build and maintain healthy daily habits",
    icon: Target,
    section: "habits",
    color: "bg-gradient-to-br from-green-500 to-emerald-600 text-white",
    requiresAuth: true,
    featured: false,
    premium: false
  }
];

// Quick actions for authenticated users
export const QUICK_ACTIONS = [
  {
    label: "Log Mood",
    section: "journal",
    icon: Heart,
    color: "pink",
    badge: "Daily"
  },
  {
    label: "AI Chat",
    section: "ai-chat",
    icon: Bot,
    color: "purple",
    badge: "New"
  },
  {
    label: "Voice Record",
    section: "voice-journal",
    icon: Mic,
    color: "emerald"
  },
  {
    label: "View Insights",
    section: "interactive-insights",
    icon: PieChart,
    color: "indigo",
    badge: "AI"
  },
  {
    label: "Crisis Monitor",
    section: "crisis-detection",
    icon: AlertTriangle,
    color: "red",
    badge: "Safety"
  },
  {
    label: "Challenges",
    section: "challenges",
    icon: Zap,
    color: "yellow",
    badge: "Community"
  },
  {
    label: "Achievements",
    section: "achievements",
    icon: Trophy,
    color: "amber"
  },
  {
    label: "Analytics",
    section: "analytics",
    icon: BarChart3,
    color: "blue"
  }
];

// Mental health resources
export const CRISIS_RESOURCES = [
  {
    name: "National Suicide Prevention Lifeline",
    phone: "988",
    description: "24/7 crisis support and suicide prevention"
  },
  {
    name: "Crisis Text Line",
    text: "Text HOME to 741741", 
    description: "Free, 24/7 support via text message"
  },
  {
    name: "SAMHSA National Helpline",
    phone: "1-800-662-4357",
    description: "Treatment referral and information service"
  }
];
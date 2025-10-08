import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Badge } from "./ui/badge.tsx";
import { Button } from "./ui/button.tsx";
import { Progress } from "./ui/progress.tsx";
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Heart, 
  Brain, 
  Shield, 
  Crown, 
  Flame,
  Award,
  Medal,
  Gift,
  Sparkles,
  Calendar,
  TrendingUp,
  Lock,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'mood' | 'consistency' | 'growth' | 'community' | 'wellness';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  reward: string;
  points: number;
}

interface UserStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  achievementsUnlocked: number;
  level: number;
  xpToNextLevel: number;
  totalXp: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_mood_log',
    title: 'First Steps',
    description: 'Log your first mood entry',
    icon: Heart,
    category: 'mood',
    difficulty: 'bronze',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    reward: 'Mood Tracker Badge',
    points: 10
  },
  {
    id: 'week_streak',
    title: 'Week Warrior',
    description: 'Log mood for 7 consecutive days',
    icon: Flame,
    category: 'consistency',
    difficulty: 'silver',
    progress: 5,
    maxProgress: 7,
    unlocked: false,
    reward: 'Consistency Crown',
    points: 50
  },
  {
    id: 'ai_conversations',
    title: 'Digital Companion',
    description: 'Have 10 conversations with AI assistant',
    icon: Brain,
    category: 'growth',
    difficulty: 'silver',
    progress: 7,
    maxProgress: 10,
    unlocked: false,
    reward: 'AI Friend Badge',
    points: 75
  },
  {
    id: 'wellness_master',
    title: 'Wellness Master',
    description: 'Complete 5 different wellness activities',
    icon: Crown,
    category: 'wellness',
    difficulty: 'gold',
    progress: 3,
    maxProgress: 5,
    unlocked: false,
    reward: 'Master Achievement',
    points: 100
  },
  {
    id: 'community_helper',
    title: 'Community Hero',
    description: 'Help 3 community members',
    icon: Shield,
    category: 'community',
    difficulty: 'gold',
    progress: 1,
    maxProgress: 3,
    unlocked: false,
    reward: 'Helper Badge',
    points: 80
  },
  {
    id: 'perfect_month',
    title: 'Perfect Month',
    description: 'Log mood every day for 30 days',
    icon: Trophy,
    category: 'consistency',
    difficulty: 'platinum',
    progress: 18,
    maxProgress: 30,
    unlocked: false,
    reward: 'Platinum Trophy',
    points: 500
  }
];

const USER_STATS: UserStats = {
  totalPoints: 285,
  currentStreak: 5,
  longestStreak: 12,
  achievementsUnlocked: 4,
  level: 3,
  xpToNextLevel: 215,
  totalXp: 485
};

const getDifficultyConfig = (difficulty: Achievement['difficulty']) => {
  switch (difficulty) {
    case 'bronze':
      return {
        color: 'from-amber-600 to-yellow-600',
        bgColor: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
        borderColor: 'border-amber-200 dark:border-amber-700',
        textColor: 'text-amber-800 dark:text-amber-200'
      };
    case 'silver':
      return {
        color: 'from-gray-400 to-slate-500',
        bgColor: 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
        borderColor: 'border-gray-200 dark:border-gray-700',
        textColor: 'text-gray-800 dark:text-gray-200'
      };
    case 'gold':
      return {
        color: 'from-yellow-500 to-orange-500',
        bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-700',
        textColor: 'text-yellow-800 dark:text-yellow-200'
      };
    case 'platinum':
      return {
        color: 'from-purple-500 to-blue-600',
        bgColor: 'from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20',
        borderColor: 'border-purple-200 dark:border-purple-700',
        textColor: 'text-purple-800 dark:text-purple-200'
      };
  }
};

const AchievementCard = ({ achievement, index }: { achievement: Achievement; index: number }) => {
  const config = getDifficultyConfig(achievement.difficulty);
  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
  const Icon = achievement.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ 
        y: -8, 
        rotateX: 5,
        rotateY: 5,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className="relative group perspective-1000"
    >
      <Card className={`relative overflow-hidden border-2 ${config.borderColor} bg-gradient-to-br ${config.bgColor} backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 transform-gpu ${
        !achievement.unlocked ? 'opacity-75' : ''
      }`}>
        {/* 3D Glass effect overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-black/5 dark:from-white/5 dark:to-black/10" />
        
        {/* Shimmer effect for unlocked achievements */}
        {achievement.unlocked && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5"
            animate={{ x: [-100, 300] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
          />
        )}

        {/* Lock overlay for locked achievements */}
        {!achievement.unlocked && achievement.progress === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lock className="w-8 h-8 text-gray-400" />
            </motion.div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <motion.div
              className={`w-14 h-14 bg-gradient-to-br ${config.color} rounded-2xl flex items-center justify-center shadow-lg transform-gpu`}
              whileHover={{ 
                scale: 1.1, 
                rotate: 10,
                transition: { duration: 0.2 }
              }}
            >
              <Icon className="text-white w-7 h-7 filter drop-shadow-lg" />
            </motion.div>
            
            <div className="flex flex-col items-end space-y-1">
              <Badge className={`bg-gradient-to-r ${config.color} text-white text-xs px-2 py-1 shadow-md`}>
                {achievement.difficulty.toUpperCase()}
              </Badge>
              {achievement.unlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </motion.div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <h3 className={`font-semibold ${config.textColor} mb-1`}>
              {achievement.title}
            </h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {achievement.description}
            </p>
          </div>

          {!achievement.unlocked && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Progress</span>
                <span>{achievement.progress}/{achievement.maxProgress}</span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-2"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {achievement.points} pts
              </span>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {achievement.reward}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function AchievementSystem() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stats] = useState<UserStats>(USER_STATS);
  const [achievements] = useState<Achievement[]>(ACHIEVEMENTS);

  const categories = [
    { id: 'all', label: 'All', icon: Trophy },
    { id: 'mood', label: 'Mood', icon: Heart },
    { id: 'consistency', label: 'Consistency', icon: Flame },
    { id: 'growth', label: 'Growth', icon: TrendingUp },
    { id: 'community', label: 'Community', icon: Shield },
    { id: 'wellness', label: 'Wellness', icon: Sparkles }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const levelProgress = (stats.totalXp % 100) / 100 * 100;

  return (
    <div className="relative space-y-8">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-32 h-32 rounded-full top-10 right-10 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-24 h-24 rounded-full bottom-20 left-20 bg-gradient-to-br from-purple-300/20 to-blue-300/20 filter blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { 
            icon: Trophy, 
            label: 'Total Points', 
            value: stats.totalPoints.toLocaleString(),
            color: 'from-yellow-500 to-orange-600',
            bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'
          },
          { 
            icon: Flame, 
            label: 'Current Streak', 
            value: `${stats.currentStreak} days`,
            color: 'from-red-500 to-pink-600',
            bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
          },
          { 
            icon: Award, 
            label: 'Achievements', 
            value: `${stats.achievementsUnlocked}/${achievements.length}`,
            color: 'from-purple-500 to-blue-600',
            bgColor: 'from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20'
          },
          { 
            icon: TrendingUp, 
            label: 'Level', 
            value: stats.level.toString(),
            color: 'from-emerald-500 to-teal-600',
            bgColor: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <Card className={`bg-gradient-to-br ${stat.bgColor} border border-white/20 dark:border-gray-700/30 backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-300`}>
              <CardContent className="p-6 text-center">
                <motion.div
                  className={`w-16 h-16 mx-auto bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="mb-1 text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Level Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border shadow-lg bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200/50 dark:border-indigo-700/30 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Crown className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Level {stats.level}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.xpToNextLevel} XP to next level
                  </p>
                </div>
              </div>
              
              <Badge className="px-3 py-1 text-white bg-gradient-to-r from-indigo-500 to-purple-600">
                {stats.totalXp} Total XP
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Progress to Level {stats.level + 1}</span>
                <span>{Math.round(levelProgress)}%</span>
              </div>
              <div className="relative">
                <Progress value={levelProgress} className="h-3" />
                <motion.div
                  className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap gap-3"
      >
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 transition-all duration-300 ${
                selectedCategory === category.id 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                  : 'hover:bg-white/20 dark:hover:bg-gray-800/30 backdrop-blur-sm'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.label}</span>
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {/* Achievements Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="wait">
          {filteredAchievements.map((achievement, index) => (
            <AchievementCard 
              key={achievement.id} 
              achievement={achievement} 
              index={index}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <Card className="border shadow-lg bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-700/30 backdrop-blur-lg">
          <CardContent className="p-8">
            <motion.div
              className="flex items-center justify-center w-16 h-16 mx-auto mb-6 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Gift className="w-8 h-8 text-white" />
            </motion.div>
            
            <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
              Keep Going! 🌟
            </h3>
            <p className="max-w-md mx-auto mb-6 text-gray-600 dark:text-gray-400">
              You're doing amazing! Log your mood today to continue your streak and unlock new achievements.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg"
                className="text-white transition-all duration-300 shadow-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-2xl"
              >
                <Heart className="w-5 h-5 mr-2" />
                Log Mood Today
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
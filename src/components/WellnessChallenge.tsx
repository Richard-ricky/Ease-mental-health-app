import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Trophy, 
  Target, 
  Zap, 
  Heart, 
  Brain, 
  Sparkles,
  CheckCircle,
  Star,
  Award,
  Flame,
  Crown,
  Play
} from "lucide-react";
import { toast } from "sonner";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: any;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // days
  category: 'mindfulness' | 'physical' | 'social' | 'learning' | 'creativity';
  tasks: ChallengeTask[];
  reward: {
    points: number;
    badge: string;
    title: string;
  };
  participants: number;
  startDate?: Date;
  endDate?: Date;
  progress: number;
  status: 'available' | 'active' | 'completed' | 'expired';
}

interface ChallengeTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  day: number;
  points: number;
}



const SAMPLE_CHALLENGES: Challenge[] = [
  {
    id: 'mindful-week',
    title: '7-Day Mindfulness Journey',
    description: 'Develop a daily meditation practice with guided sessions',
    icon: Brain,
    difficulty: 'easy',
    duration: 7,
    category: 'mindfulness',
    participants: 2847,
    progress: 4,
    status: 'active',
    reward: {
      points: 150,
      badge: 'Mindful Master',
      title: 'Zen Seeker'
    },
    tasks: [
      { id: '1', title: '5-minute morning meditation', description: 'Start your day with mindful breathing', completed: true, day: 1, points: 20 },
      { id: '2', title: 'Gratitude journaling', description: 'Write 3 things you\'re grateful for', completed: true, day: 2, points: 15 },
      { id: '3', title: 'Mindful walking', description: '10-minute walk focusing on your surroundings', completed: true, day: 3, points: 20 },
      { id: '4', title: 'Body scan meditation', description: 'Progressive relaxation exercise', completed: true, day: 4, points: 25 },
      { id: '5', title: 'Loving-kindness meditation', description: 'Send positive thoughts to yourself and others', completed: false, day: 5, points: 25 },
      { id: '6', title: 'Mindful eating', description: 'Eat one meal with full attention', completed: false, day: 6, points: 20 },
      { id: '7', title: 'Reflection & commitment', description: 'Plan your ongoing practice', completed: false, day: 7, points: 25 }
    ]
  },
  {
    id: 'social-connection',
    title: 'Connect & Care Challenge',
    description: 'Strengthen relationships and build meaningful connections',
    icon: Heart,
    difficulty: 'medium',
    duration: 14,
    category: 'social',
    participants: 1563,
    progress: 0,
    status: 'available',
    reward: {
      points: 250,
      badge: 'Connection Champion',
      title: 'Community Builder'
    },
    tasks: [
      { id: '1', title: 'Reach out to an old friend', description: 'Send a message to someone you haven\'t talked to in a while', completed: false, day: 1, points: 30 },
      { id: '2', title: 'Express gratitude', description: 'Thank someone who has helped you recently', completed: false, day: 2, points: 25 },
      { id: '3', title: 'Active listening practice', description: 'Have a conversation focused entirely on the other person', completed: false, day: 3, points: 35 }
    ]
  },
  {
    id: 'creative-spark',
    title: 'Creative Expression Month',
    description: 'Explore your creativity through various artistic activities',
    icon: Sparkles,
    difficulty: 'hard',
    duration: 30,
    category: 'creativity',
    participants: 892,
    progress: 0,
    status: 'available',
    reward: {
      points: 500,
      badge: 'Creative Genius',
      title: 'Artist at Heart'
    },
    tasks: [
      { id: '1', title: 'Daily creative practice', description: 'Spend 15 minutes on any creative activity', completed: false, day: 1, points: 20 },
      { id: '2', title: 'Try something new', description: 'Explore a creative medium you\'ve never tried', completed: false, day: 7, points: 50 }
    ]
  }
];

const getDifficultyConfig = (difficulty: Challenge['difficulty']) => {
  switch (difficulty) {
    case 'easy':
      return {
        color: 'from-green-500 to-emerald-600',
        bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
        borderColor: 'border-green-200 dark:border-green-700',
        textColor: 'text-green-800 dark:text-green-200',
        label: 'Beginner Friendly'
      };
    case 'medium':
      return {
        color: 'from-amber-500 to-orange-600',
        bgColor: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
        borderColor: 'border-amber-200 dark:border-amber-700',
        textColor: 'text-amber-800 dark:text-amber-200',
        label: 'Moderate Challenge'
      };
    case 'hard':
      return {
        color: 'from-red-500 to-pink-600',
        bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
        borderColor: 'border-red-200 dark:border-red-700',
        textColor: 'text-red-800 dark:text-red-200',
        label: 'Expert Level'
      };
  }
};

const ChallengeCard = ({ challenge, onJoin, onViewDetails }: { 
  challenge: Challenge; 
  onJoin: () => void;
  onViewDetails: () => void;
}) => {
  const config = getDifficultyConfig(challenge.difficulty);
  const Icon = challenge.icon;
  const progressPercentage = (challenge.progress / challenge.duration) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      whileHover={{ 
        y: -8, 
        rotateX: 5,
        rotateY: 2,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className="relative group perspective-1000"
    >
      <Card className={`relative overflow-hidden border-2 ${config.borderColor} bg-gradient-to-br ${config.bgColor} backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 transform-gpu`}>
        {/* 3D Glass effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-black/5 dark:from-white/5 dark:to-black/10" />
        
        {/* Status glow effect */}
        {challenge.status === 'active' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5"
            animate={{ x: [-100, 300] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
        )}

        <CardHeader className="relative pb-3">
          <div className="flex items-center justify-between mb-4">
            <motion.div
              className={`w-16 h-16 bg-gradient-to-br ${config.color} rounded-2xl flex items-center justify-center shadow-lg transform-gpu`}
              whileHover={{ 
                scale: 1.1, 
                rotate: 10,
                transition: { duration: 0.2 }
              }}
            >
              <Icon className="w-8 h-8 text-white filter drop-shadow-lg" />
            </motion.div>
            
            <div className="flex flex-col items-end space-y-2">
              <Badge className={`bg-gradient-to-r ${config.color} text-white text-xs px-3 py-1 shadow-md`}>
                {config.label}
              </Badge>
              
              {challenge.status === 'active' && (
                <motion.div
                  className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Active</span>
                </motion.div>
              )}
              
              {challenge.status === 'completed' && (
                <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>Completed</span>
                </div>
              )}
            </div>
          </div>

          <CardTitle className={`${config.textColor} mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors`}>
            {challenge.title}
          </CardTitle>
          
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {challenge.description}
          </p>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Challenge Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {challenge.duration}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Days</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {challenge.reward.points}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Points</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {challenge.participants.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Joined</div>
            </div>
          </div>

          {/* Progress Bar (for active challenges) */}
          {challenge.status === 'active' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Progress</span>
                <span>Day {challenge.progress}/{challenge.duration}</span>
              </div>
              <div className="relative">
                <Progress value={progressPercentage} className="h-2" />
                <motion.div
                  className={`absolute top-0 left-0 h-2 bg-gradient-to-r ${config.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {/* Reward Preview */}
          <div className="p-3 border bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border-yellow-200/50 dark:border-yellow-700/30">
            <div className="flex items-center space-x-3">
              <motion.div
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Trophy className="w-4 h-4 text-white" />
              </motion.div>
              <div className="flex-1">
                <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {challenge.reward.badge}
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">
                  Unlock "{challenge.reward.title}" title
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex pt-2 space-x-3">
            {challenge.status === 'available' && (
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={onJoin}
                  className={`w-full bg-gradient-to-r ${config.color} hover:shadow-lg transition-all duration-300 text-white`}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Join Challenge
                </Button>
              </motion.div>
            )}
            
            {challenge.status === 'active' && (
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={onViewDetails}
                  className="w-full text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              </motion.div>
            )}
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onViewDetails}
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/20 dark:border-gray-700/30 hover:bg-white/70 dark:hover:bg-gray-800/70"
              >
                <Award className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function WellnessChallenge() {
  const [challenges] = useState<Challenge[]>(SAMPLE_CHALLENGES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Challenges', icon: Trophy },
    { id: 'mindfulness', label: 'Mindfulness', icon: Brain },
    { id: 'physical', label: 'Physical', icon: Zap },
    { id: 'social', label: 'Social', icon: Heart },
    { id: 'learning', label: 'Learning', icon: Star },
    { id: 'creativity', label: 'Creativity', icon: Sparkles }
  ];

  const filteredChallenges = selectedCategory === 'all' 
    ? challenges 
    : challenges.filter(c => c.category === selectedCategory);

  const activeChallenge = challenges.find(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed').length;
  const totalPoints = challenges.reduce((sum, c) => c.status === 'completed' ? sum + c.reward.points : sum, 0);

  const handleJoinChallenge = () => {
    toast.success("Challenge joined! Let's start your wellness journey! 🌟");
    // In real app, this would update the challenge status and user progress
  };

  const handleViewDetails = () => {
    // In real app, this would show challenge details modal
  };

  return (
    <div className="relative space-y-8">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-32 h-32 rounded-full top-16 right-16 bg-gradient-to-br from-purple-300/20 to-blue-300/20 filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {[
          { 
            icon: Flame, 
            label: 'Active Challenge', 
            value: activeChallenge ? activeChallenge.title : 'None',
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
          },
          { 
            icon: Trophy, 
            label: 'Completed', 
            value: `${completedChallenges} challenges`,
            color: 'from-yellow-500 to-amber-600',
            bgColor: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20'
          },
          { 
            icon: Star, 
            label: 'Total Points', 
            value: totalPoints.toLocaleString(),
            color: 'from-purple-500 to-blue-600',
            bgColor: 'from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20'
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
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <motion.div
                    className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <stat.icon className="text-white w-7 h-7" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </h3>
                    <p className="text-lg font-bold text-gray-800 truncate dark:text-gray-200">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-3"
      >
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.05 }}
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

      {/* Challenges Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="wait">
          {filteredChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <ChallengeCard 
                challenge={challenge} 
                onJoin={handleJoinChallenge}
                onViewDetails={handleViewDetails}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Featured Challenge Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="relative overflow-hidden border shadow-xl bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-pink-50/80 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-indigo-200/50 dark:border-indigo-700/30 backdrop-blur-lg">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20"
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
          
          <CardContent className="relative p-8 text-center">
            <motion.div
              className="flex items-center justify-center w-20 h-20 mx-auto mb-6 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl"
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
              <Crown className="w-10 h-10 text-white" />
            </motion.div>
            
            <h3 className="mb-3 text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
              🎯 Weekly Spotlight Challenge
            </h3>
            <p className="max-w-2xl mx-auto mb-6 text-gray-600 dark:text-gray-300">
              Join our community challenge and compete with thousands of wellness enthusiasts worldwide. 
              This week: "Digital Detox Weekend" - Reconnect with yourself and loved ones.
            </p>
            
            <div className="flex items-center justify-center mb-6 space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">2.4K</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Participants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">48h</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-800 dark:text-pink-200">300</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Points</div>
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg"
                className="px-8 text-white transition-all duration-300 shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-2xl"
              >
                <Target className="w-5 h-5 mr-2" />
                Join Spotlight Challenge
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
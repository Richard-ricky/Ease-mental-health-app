import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Lightbulb, 
  Star, 
  Heart, 
  Activity, 
  Calendar, 
  Clock, 
  Zap, 
  Award, 
  BarChart3, 
  PieChart, 
  LineChart, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Filter,
  Download,
  Share,
  Eye,
  Users,
  Globe
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Insight {
  id: string;
  type: 'trend' | 'correlation' | 'recommendation' | 'achievement' | 'warning';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  impact: 'low' | 'medium' | 'high';
  category: 'mood' | 'behavior' | 'wellness' | 'social' | 'sleep';
  data?: any;
  recommendations: string[];
  timeframe: string;
}

interface MoodCorrelation {
  factor: string;
  correlation: number;
  significance: number;
  impact: string;
}

interface WellnessMetric {
  name: string;
  current: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

const SAMPLE_INSIGHTS: Insight[] = [
  {
    id: '1',
    type: 'trend',
    title: 'Mood Improvement Trend Detected',
    description: 'Your mood scores have improved by 23% over the past 2 weeks, with consistent upward momentum.',
    confidence: 87,
    actionable: true,
    impact: 'high',
    category: 'mood',
    timeframe: '2 weeks',
    recommendations: [
      'Continue your current wellness routine',
      'Consider sharing your successful strategies with the community',
      'Set new wellness goals to maintain momentum'
    ]
  },
  {
    id: '2',
    type: 'correlation',
    title: 'Sleep-Mood Connection Identified',
    description: 'Strong correlation (0.78) found between sleep quality and next-day mood. Better sleep consistently leads to improved emotional wellbeing.',
    confidence: 92,
    actionable: true,
    impact: 'high',
    category: 'sleep',
    timeframe: '1 month',
    recommendations: [
      'Maintain consistent bedtime routine',
      'Aim for 7-9 hours of quality sleep',
      'Use sleep meditation before bed'
    ]
  },
  {
    id: '3',
    type: 'recommendation',
    title: 'Social Activity Boost Needed',
    description: 'Analysis shows decreased social interactions over the past week. Social connections are crucial for your mental health profile.',
    confidence: 75,
    actionable: true,
    impact: 'medium',
    category: 'social',
    timeframe: '1 week',
    recommendations: [
      'Schedule one social activity this week',
      'Join a community support group',
      'Reach out to a friend or family member'
    ]
  },
  {
    id: '4',
    type: 'achievement',
    title: 'Mindfulness Milestone Reached',
    description: 'Congratulations! You\'ve completed 30 consecutive days of mindfulness practice. This consistency is exceptional.',
    confidence: 100,
    actionable: false,
    impact: 'high',
    category: 'wellness',
    timeframe: '30 days',
    recommendations: [
      'Celebrate this achievement',
      'Set a new 60-day goal',
      'Share your success story'
    ]
  },
  {
    id: '5',
    type: 'warning',
    title: 'Stress Pattern Alert',
    description: 'Elevated stress indicators detected during weekday evenings. This pattern has persisted for 10 days.',
    confidence: 81,
    actionable: true,
    impact: 'medium',
    category: 'behavior',
    timeframe: '10 days',
    recommendations: [
      'Schedule evening relaxation time',
      'Try progressive muscle relaxation',
      'Consider adjusting work-life boundaries'
    ]
  }
];

const MOOD_CORRELATIONS: MoodCorrelation[] = [
  { factor: 'Sleep Quality', correlation: 0.78, significance: 95, impact: 'Strong positive impact on mood' },
  { factor: 'Exercise', correlation: 0.65, significance: 89, impact: 'Moderate positive impact' },
  { factor: 'Social Time', correlation: 0.58, significance: 82, impact: 'Meaningful mood booster' },
  { factor: 'Weather', correlation: 0.34, significance: 67, impact: 'Mild influence on wellbeing' },
  { factor: 'Work Stress', correlation: -0.72, significance: 91, impact: 'Strong negative impact' }
];

const WELLNESS_METRICS: WellnessMetric[] = [
  { name: 'Mood Stability', current: 7.8, target: 8.0, trend: 'up', change: 12 },
  { name: 'Sleep Quality', current: 6.9, target: 8.0, trend: 'up', change: 8 },
  { name: 'Activity Level', current: 6.2, target: 7.5, trend: 'stable', change: 2 },
  { name: 'Social Connection', current: 5.8, target: 7.0, trend: 'down', change: -5 },
  { name: 'Stress Management', current: 6.5, target: 8.0, trend: 'up', change: 15 }
];

const MOOD_TREND_DATA = [
  { date: '2w ago', mood: 5.2, prediction: 5.1, confidence: 85 },
  { date: '13d ago', mood: 5.8, prediction: 5.7, confidence: 87 },
  { date: '12d ago', mood: 6.1, prediction: 6.0, confidence: 89 },
  { date: '11d ago', mood: 6.4, prediction: 6.3, confidence: 88 },
  { date: '10d ago', mood: 6.0, prediction: 6.2, confidence: 86 },
  { date: '9d ago', mood: 6.7, prediction: 6.6, confidence: 90 },
  { date: '8d ago', mood: 7.1, prediction: 7.0, confidence: 91 },
  { date: '7d ago', mood: 7.3, prediction: 7.2, confidence: 92 },
  { date: '6d ago', mood: 7.0, prediction: 7.1, confidence: 89 },
  { date: '5d ago', mood: 7.6, prediction: 7.5, confidence: 93 },
  { date: '4d ago', mood: 7.8, prediction: 7.7, confidence: 94 },
  { date: '3d ago', mood: 7.9, prediction: 7.8, confidence: 95 },
  { date: '2d ago', mood: 8.1, prediction: 8.0, confidence: 93 },
  { date: 'Yesterday', mood: 8.2, prediction: 8.1, confidence: 94 },
  { date: 'Today', mood: null, prediction: 8.3, confidence: 91 }
];

const WELLNESS_RADAR_DATA = [
  { metric: 'Mood', current: 78, target: 85 },
  { metric: 'Sleep', current: 69, target: 80 },
  { metric: 'Activity', current: 62, target: 75 },
  { metric: 'Social', current: 58, target: 70 },
  { metric: 'Stress', current: 65, target: 80 },
  { metric: 'Mindfulness', current: 82, target: 85 }
];

const getInsightConfig = (type: Insight['type']) => {
  switch (type) {
    case 'trend':
      return {
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
        borderColor: 'border-blue-200 dark:border-blue-700',
        textColor: 'text-blue-800 dark:text-blue-200',
        icon: TrendingUp
      };
    case 'correlation':
      return {
        color: 'from-purple-500 to-pink-600',
        bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
        borderColor: 'border-purple-200 dark:border-purple-700',
        textColor: 'text-purple-800 dark:text-purple-200',
        icon: Brain
      };
    case 'recommendation':
      return {
        color: 'from-emerald-500 to-teal-600',
        bgColor: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
        borderColor: 'border-emerald-200 dark:border-emerald-700',
        textColor: 'text-emerald-800 dark:text-emerald-200',
        icon: Lightbulb
      };
    case 'achievement':
      return {
        color: 'from-yellow-500 to-orange-600',
        bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-700',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        icon: Award
      };
    case 'warning':
      return {
        color: 'from-red-500 to-pink-600',
        bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
        borderColor: 'border-red-200 dark:border-red-700',
        textColor: 'text-red-800 dark:text-red-200',
        icon: AlertCircle
      };
  }
};

export function InteractiveInsights() {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('insights');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('month');

  const categories = ['all', 'mood', 'behavior', 'wellness', 'social', 'sleep'];
  const timeRanges = [
    { value: 'week', label: '7 Days' },
    { value: 'month', label: '30 Days' },
    { value: 'quarter', label: '3 Months' }
  ];

  const filteredInsights = selectedCategory === 'all' 
    ? SAMPLE_INSIGHTS 
    : SAMPLE_INSIGHTS.filter(insight => insight.category === selectedCategory);

  return (
    <div className="relative space-y-8">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-32 h-32 rounded-full top-20 right-20 bg-gradient-to-br from-blue-300/20 to-purple-300/20 filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-24 h-24 rounded-full bottom-32 left-16 bg-gradient-to-br from-emerald-300/20 to-teal-300/20 filter blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
      </div>

      {/* Header Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-gray-200">
            AI-Powered Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover patterns, correlations, and personalized recommendations
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          {/* Action Buttons */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 border bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <Lightbulb className="w-4 h-4" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Trends</span>
            </TabsTrigger>
            <TabsTrigger value="correlations" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Correlations</span>
            </TabsTrigger>
            <TabsTrigger value="wellness" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Wellness</span>
            </TabsTrigger>
          </TabsList>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <motion.div
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`capitalize ${
                      selectedCategory === category 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                        : 'hover:bg-white/20 dark:hover:bg-gray-800/30 backdrop-blur-sm'
                    }`}
                  >
                    <Filter className="w-3 h-3 mr-1" />
                    {category}
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Insights Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {filteredInsights.map((insight, index) => {
                const config = getInsightConfig(insight.type);
                const Icon = config.icon;
                const isSelected = selectedInsight === insight.id;
                
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20, rotateX: -10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    whileHover={{ 
                      y: -8, 
                      rotateX: 5,
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    }}
                    className="relative group perspective-1000"
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-500 border-2 ${config.borderColor} bg-gradient-to-br ${config.bgColor} backdrop-blur-lg shadow-xl hover:shadow-2xl transform-gpu ${
                        isSelected ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
                      }`}
                      onClick={() => setSelectedInsight(isSelected ? null : insight.id)}
                    >
                      {/* 3D Glass effect */}
                      <div className="absolute inset-0 rounded-lg pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-black/5 dark:from-white/5 dark:to-black/10" />
                      
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5"
                        animate={{ x: [-100, 300] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                      />

                      <CardHeader className="relative pb-3">
                        <div className="flex items-start justify-between">
                          <motion.div
                            className={`w-14 h-14 bg-gradient-to-br ${config.color} rounded-2xl flex items-center justify-center shadow-lg transform-gpu flex-shrink-0`}
                            whileHover={{ 
                              scale: 1.1, 
                              rotate: 10,
                              transition: { duration: 0.2 }
                            }}
                          >
                            <Icon className="text-white w-7 h-7 filter drop-shadow-lg" />
                          </motion.div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className={`bg-gradient-to-r ${config.color} text-white text-xs px-3 py-1 shadow-md capitalize`}>
                              {insight.type}
                            </Badge>
                            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                              <Eye className="w-3 h-3" />
                              <span>{insight.confidence}% confidence</span>
                            </div>
                          </div>
                        </div>
                        
                        <CardTitle className={`${config.textColor} mt-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight`}>
                          {insight.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="relative space-y-4">
                        <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                          {insight.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {insight.timeframe}
                              </span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                insight.impact === 'high' ? 'border-red-300 text-red-600' :
                                insight.impact === 'medium' ? 'border-yellow-300 text-yellow-600' :
                                'border-green-300 text-green-600'
                              }`}
                            >
                              {insight.impact} impact
                            </Badge>
                          </div>
                          
                          {insight.actionable && (
                            <Badge className="text-xs text-blue-800 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
                              Actionable
                            </Badge>
                          )}
                        </div>
                        
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
                            >
                              <h5 className={`font-medium ${config.textColor} mb-3 flex items-center space-x-2`}>
                                <Sparkles className="w-4 h-4" />
                                <span>Recommendations:</span>
                              </h5>
                              <ul className="space-y-2">
                                {insight.recommendations.map((rec, i) => (
                                  <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`flex items-start space-x-2 text-sm ${config.textColor}`}
                                  >
                                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-500" />
                                    <span>{rec}</span>
                                  </motion.li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card className="border shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <LineChart className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle>Mood Prediction & Trends</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      AI-powered mood forecasting with confidence intervals
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOOD_TREND_DATA}>
                      <defs>
                        <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        className="text-gray-600 dark:text-gray-400"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        className="text-gray-600 dark:text-gray-400"
                        domain={[1, 10]}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="mood"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fill="url(#moodGradient)"
                        name="Actual Mood"
                      />
                      <Line
                        type="monotone"
                        dataKey="prediction"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        strokeDasharray="5,5"
                        dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                        name="AI Prediction"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">Actual Mood</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-transparent border-2 rounded-full border-cyan-500"></div>
                    <span className="text-gray-600 dark:text-gray-400">AI Prediction</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Correlations Tab */}
          <TabsContent value="correlations" className="space-y-6">
            <Card className="border shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Brain className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle>Mood Correlations</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Factors that influence your emotional wellbeing
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {MOOD_CORRELATIONS.map((correlation, index) => (
                    <motion.div
                      key={correlation.factor}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border bg-gradient-to-r from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border-gray-200/30 dark:border-gray-700/30 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">
                          {correlation.factor}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={`text-xs ${
                              Math.abs(correlation.correlation) > 0.7 ? 'bg-red-100 text-red-800' :
                              Math.abs(correlation.correlation) > 0.5 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            {correlation.significance}% significant
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-2 space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Correlation</span>
                            <span className={`font-medium ${
                              correlation.correlation > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {correlation.correlation > 0 ? '+' : ''}{correlation.correlation.toFixed(2)}
                            </span>
                          </div>
                          <div className="relative">
                            <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                              <div 
                                className={`h-2 rounded-full ${
                                  correlation.correlation > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'
                                }`}
                                style={{ width: `${Math.abs(correlation.correlation) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {correlation.impact}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wellness Tab */}
          <TabsContent value="wellness" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Wellness Metrics */}
              <Card className="border shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Target className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Wellness Metrics</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Your progress towards wellness goals
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {WELLNESS_METRICS.map((metric, index) => (
                      <motion.div
                        key={metric.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {metric.name}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {metric.current.toFixed(1)}/{metric.target.toFixed(1)}
                            </span>
                            <div className={`flex items-center space-x-1 text-xs ${
                              metric.trend === 'up' ? 'text-green-600' :
                              metric.trend === 'down' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                               metric.trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
                               <Activity className="w-3 h-3" />}
                              <span>{Math.abs(metric.change)}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                            <motion.div 
                              className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
                              initial={{ width: 0 }}
                              animate={{ width: `${(metric.current / metric.target) * 100}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Wellness Radar */}
              <Card className="border shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <PieChart className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Wellness Overview</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Current vs target performance
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={WELLNESS_RADAR_DATA}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar
                          name="Current"
                          dataKey="current"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                        <Radar
                          name="Target"
                          dataKey="target"
                          stroke="#06b6d4"
                          fill="transparent"
                          strokeWidth={2}
                          strokeDasharray="5,5"
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">Current Level</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-transparent border-2 rounded-full border-cyan-500"></div>
                      <span className="text-gray-600 dark:text-gray-400">Target Goal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
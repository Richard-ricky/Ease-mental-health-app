import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, Brain, Lightbulb, Target, Smile, Heart, Zap, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area, RadialBarChart, RadialBar } from 'recharts';

interface MoodEntry {
  date: string;
  mood: number; // 1-10 scale
  energy: number;
  anxiety: number;
  sleep: number;
  activities: string[];
  notes?: string;
}

interface MoodInsight {
  type: 'positive' | 'neutral' | 'concern';
  title: string;
  description: string;
  action?: string;
  icon: any;
}

export function MoodAnalytics() {
  const [timeRange, setTimeRange] = useState('30');
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [insights, setInsights] = useState<MoodInsight[]>([]);
  const [selectedMetric, setSelectedMetric] = useState('mood');

  useEffect(() => {
    generateMockData();
    generateInsights();
  }, [timeRange]);

  const generateMockData = () => {
    const days = parseInt(timeRange);
    const data: MoodEntry[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic mood patterns with some trends
      const baselineMood = 6 + Math.sin(i * 0.1) * 2; // Weekly patterns
      const dailyVariation = (Math.random() - 0.5) * 2;
      const mood = Math.max(1, Math.min(10, baselineMood + dailyVariation));
      
      const energy = Math.max(1, Math.min(10, mood + (Math.random() - 0.5) * 2));
      const anxiety = Math.max(1, Math.min(10, 11 - mood + (Math.random() - 0.5) * 3));
      const sleep = Math.max(1, Math.min(10, 7 + (Math.random() - 0.5) * 3));
      
      data.push({
        date: date.toISOString().split('T')[0],
        mood: parseFloat(mood.toFixed(1)),
        energy: parseFloat(energy.toFixed(1)),
        anxiety: parseFloat(anxiety.toFixed(1)),
        sleep: parseFloat(sleep.toFixed(1)),
        activities: ['journaling', 'exercise', 'meditation'].slice(0, Math.floor(Math.random() * 3) + 1)
      });
    }
    
    setMoodData(data);
  };

  const generateInsights = () => {
    const mockInsights: MoodInsight[] = [
      {
        type: 'positive',
        title: 'Mood Improvement Trend',
        description: 'Your mood has shown a steady upward trend over the past week, with an average increase of 0.8 points.',
        action: 'Keep up the great work! Consider what positive changes you\'ve made recently.',
        icon: TrendingUp
      },
      {
        type: 'neutral',
        title: 'Sleep Pattern Correlation',
        description: 'There\'s a strong correlation (0.73) between your sleep quality and next-day mood ratings.',
        action: 'Focus on maintaining consistent sleep hygiene for better mood stability.',
        icon: Moon
      },
      {
        type: 'concern',
        title: 'Anxiety Spike Alert',
        description: 'Your anxiety levels were notably higher on weekdays compared to weekends this month.',
        action: 'Consider exploring stress management techniques for work-related anxiety.',
        icon: Brain
      },
      {
        type: 'positive',
        title: 'Activity Benefits',
        description: 'Days with exercise or meditation show 23% higher mood ratings on average.',
        action: 'Try to incorporate these activities more regularly into your routine.',
        icon: Target
      }
    ];
    
    setInsights(mockInsights);
  };

  const getMetricData = () => {
    return moodData.map(entry => ({
      ...entry,
      displayDate: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  };

  const getAverageScore = (metric: keyof MoodEntry) => {
    if (moodData.length === 0) return 0;
    const sum = moodData.reduce((acc, entry) => acc + (entry[metric] as number), 0);
    return (sum / moodData.length).toFixed(1);
  };

  const getTrend = (metric: keyof MoodEntry) => {
    if (moodData.length < 2) return 0;
    const recent = moodData.slice(-7).reduce((acc, entry) => acc + (entry[metric] as number), 0) / 7;
    const previous = moodData.slice(-14, -7).reduce((acc, entry) => acc + (entry[metric] as number), 0) / 7;
    return ((recent - previous) / previous * 100).toFixed(1);
  };

  const getMoodDistribution = () => {
    const distribution = { Excellent: 0, Good: 0, Okay: 0, Poor: 0 };
    
    moodData.forEach(entry => {
      if (entry.mood >= 8) distribution.Excellent++;
      else if (entry.mood >= 6) distribution.Good++;
      else if (entry.mood >= 4) distribution.Okay++;
      else distribution.Poor++;
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / moodData.length) * 100).toFixed(1)
    }));
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'concern': return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20';
      default: return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
    }
  };

  const getInsightIconColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'concern': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-16 h-16 shadow-2xl bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              Mood Analytics
            </h2>
            <p className="text-gray-600 dark:text-gray-300">Discover patterns and insights in your emotional journey</p>
          </div>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Overview Cards */}
      <motion.div
        className="grid grid-cols-2 gap-6 md:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {[
          { label: 'Average Mood', value: getAverageScore('mood'), trend: getTrend('mood'), icon: Smile, color: 'blue' },
          { label: 'Energy Level', value: getAverageScore('energy'), trend: getTrend('energy'), icon: Zap, color: 'yellow' },
          { label: 'Anxiety Level', value: getAverageScore('anxiety'), trend: getTrend('anxiety'), icon: Brain, color: 'red' },
          { label: 'Sleep Quality', value: getAverageScore('sleep'), trend: getTrend('sleep'), icon: Moon, color: 'purple' }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${metric.color}-500 to-${metric.color}-600 rounded-xl flex items-center justify-center shadow-lg`}>
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{metric.value}/10</div>
                    <div className={`text-sm flex items-center ${parseFloat(metric.trend) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {parseFloat(metric.trend) >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {Math.abs(parseFloat(metric.trend))}%
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{metric.label}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">vs. previous period</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Mood Trends Over Time</CardTitle>
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mood">Mood</SelectItem>
                      <SelectItem value="energy">Energy</SelectItem>
                      <SelectItem value="anxiety">Anxiety</SelectItem>
                      <SelectItem value="sleep">Sleep</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getMetricData()}>
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="displayDate" 
                        stroke="#6B7280"
                        fontSize={12}
                      />
                      <YAxis 
                        domain={[1, 10]} 
                        stroke="#6B7280"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: 'none', 
                          borderRadius: '12px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey={selectedMetric}
                        stroke="#3B82F6"
                        strokeWidth={3}
                        fill="url(#colorGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="distribution">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Mood Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={getMoodDistribution()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getMoodDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, name: any, props: any) => [
                          `${value} days (${props.payload.percentage}%)`, 
                          name
                        ]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {getMoodDistribution().map((entry, index) => (
                    <div key={entry.name} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {entry.name}: {entry.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Weekly Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { day: 'Mon', mood: 6.2, energy: 5.8 },
                      { day: 'Tue', mood: 6.8, energy: 6.5 },
                      { day: 'Wed', mood: 7.1, energy: 7.0 },
                      { day: 'Thu', mood: 6.9, energy: 6.8 },
                      { day: 'Fri', mood: 7.5, energy: 7.8 },
                      { day: 'Sat', mood: 8.2, energy: 8.1 },
                      { day: 'Sun', mood: 7.8, energy: 7.5 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="day" stroke="#6B7280" />
                      <YAxis domain={[0, 10]} stroke="#6B7280" />
                      <Tooltip />
                      <Bar dataKey="mood" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="energy" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="correlations">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Factor Correlations</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  How different factors relate to your mood
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { factor: 'Sleep Quality', correlation: 0.73, description: 'Strong positive correlation' },
                    { factor: 'Exercise', correlation: 0.61, description: 'Moderate positive correlation' },
                    { factor: 'Social Activities', correlation: 0.45, description: 'Moderate positive correlation' },
                    { factor: 'Work Stress', correlation: -0.52, description: 'Moderate negative correlation' },
                    { factor: 'Screen Time', correlation: -0.28, description: 'Weak negative correlation' }
                  ].map((item, index) => (
                    <motion.div
                      key={item.factor}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.factor}</span>
                        <span className={`font-bold ${item.correlation > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.correlation > 0 ? '+' : ''}{item.correlation}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                        <div 
                          className={`h-2 rounded-full ${item.correlation > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.abs(item.correlation) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="insights">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid gap-6">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                >
                  <Card className={`border-2 ${getInsightColor(insight.type)} backdrop-blur-sm hover:shadow-xl transition-all duration-300`}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center`}>
                          <insight.icon className={`w-6 h-6 ${getInsightIconColor(insight.type)}`} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold">{insight.title}</h3>
                            <Badge className={`${
                              insight.type === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              insight.type === 'concern' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {insight.type === 'positive' ? 'Positive' : insight.type === 'concern' ? 'Attention' : 'Insight'}
                            </Badge>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{insight.description}</p>
                          {insight.action && (
                            <div className="p-3 border-l-4 border-blue-500 rounded-lg bg-white/60 dark:bg-gray-800/60">
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                💡 Recommendation: {insight.action}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50 dark:border-purple-700 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 shadow-xl bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Keep Track, Stay Aware</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  Regular mood tracking helps you understand patterns and make positive changes in your life.
                </p>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                  <Heart className="w-4 h-4 mr-2" />
                  Log Today's Mood
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
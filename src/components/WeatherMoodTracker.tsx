import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Zap, 
  Wind,
  Eye,
  Droplets,
  Gauge,
  MapPin,
  TrendingUp,
  Heart,
  Brain,
  Activity,
  Smile,
  Frown,
  Meh,
  BarChart3
} from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Line } from 'recharts';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'windy';
  humidity: number;
  pressure: number;
  windSpeed: number;
  visibility: number;
  uvIndex: number;
  location: string;
  timestamp: Date;
}

interface MoodWeatherEntry {
  date: string;
  mood: number; // 1-10 scale
  weather: WeatherData;
  notes?: string;
}

interface WeatherImpact {
  condition: string;
  averageMood: number;
  entryCount: number;
  trend: 'positive' | 'negative' | 'neutral';
}

const SAMPLE_DATA: MoodWeatherEntry[] = [
  {
    date: '2024-08-20',
    mood: 8,
    weather: {
      temperature: 72,
      condition: 'sunny',
      humidity: 45,
      pressure: 1013,
      windSpeed: 8,
      visibility: 10,
      uvIndex: 6,
      location: 'San Francisco, CA',
      timestamp: new Date('2024-08-20')
    }
  },
  {
    date: '2024-08-21',
    mood: 6,
    weather: {
      temperature: 65,
      condition: 'cloudy',
      humidity: 70,
      pressure: 1008,
      windSpeed: 12,
      visibility: 8,
      uvIndex: 3,
      location: 'San Francisco, CA',
      timestamp: new Date('2024-08-21')
    }
  },
  {
    date: '2024-08-22',
    mood: 4,
    weather: {
      temperature: 60,
      condition: 'rainy',
      humidity: 85,
      pressure: 1005,
      windSpeed: 15,
      visibility: 5,
      uvIndex: 1,
      location: 'San Francisco, CA',
      timestamp: new Date('2024-08-22')
    }
  },
  {
    date: '2024-08-23',
    mood: 7,
    weather: {
      temperature: 75,
      condition: 'sunny',
      humidity: 40,
      pressure: 1015,
      windSpeed: 6,
      visibility: 10,
      uvIndex: 7,
      location: 'San Francisco, CA',
      timestamp: new Date('2024-08-23')
    }
  },
  {
    date: '2024-08-24',
    mood: 5,
    weather: {
      temperature: 58,
      condition: 'windy',
      humidity: 60,
      pressure: 1010,
      windSpeed: 25,
      visibility: 9,
      uvIndex: 4,
      location: 'San Francisco, CA',
      timestamp: new Date('2024-08-24')
    }
  },
  {
    date: '2024-08-25',
    mood: 9,
    weather: {
      temperature: 78,
      condition: 'sunny',
      humidity: 35,
      pressure: 1018,
      windSpeed: 4,
      visibility: 10,
      uvIndex: 8,
      location: 'San Francisco, CA',
      timestamp: new Date('2024-08-25')
    }
  },
  {
    date: '2024-08-26',
    mood: 6,
    weather: {
      temperature: 63,
      condition: 'cloudy',
      humidity: 75,
      pressure: 1007,
      windSpeed: 10,
      visibility: 7,
      uvIndex: 2,
      location: 'San Francisco, CA',
      timestamp: new Date('2024-08-26')
    }
  }
];

const getWeatherIcon = (condition: WeatherData['condition']) => {
  switch (condition) {
    case 'sunny': return Sun;
    case 'cloudy': return Cloud;
    case 'rainy': return CloudRain;
    case 'stormy': return Zap;
    case 'snowy': return CloudSnow;
    case 'windy': return Wind;
    default: return Cloud;
  }
};

const getWeatherColor = (condition: WeatherData['condition']) => {
  switch (condition) {
    case 'sunny': return 'from-yellow-400 to-orange-500';
    case 'cloudy': return 'from-gray-400 to-slate-500';
    case 'rainy': return 'from-blue-400 to-indigo-500';
    case 'stormy': return 'from-purple-500 to-indigo-600';
    case 'snowy': return 'from-blue-200 to-cyan-300';
    case 'windy': return 'from-teal-400 to-cyan-500';
    default: return 'from-gray-400 to-slate-500';
  }
};

const getMoodIcon = (mood: number) => {
  if (mood >= 8) return Smile;
  if (mood >= 6) return Meh;
  return Frown;
};

const getMoodColor = (mood: number) => {
  if (mood >= 8) return 'text-green-500';
  if (mood >= 6) return 'text-yellow-500';
  return 'text-red-500';
};

export function WeatherMoodTracker() {
  const [data] = useState<MoodWeatherEntry[]>(SAMPLE_DATA);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('week');

  // Calculate weather impact on mood
  const weatherImpacts: WeatherImpact[] = [
    'sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'windy'
  ].map(condition => {
    const entries = data.filter(entry => entry.weather.condition === condition);
    const avgMood = entries.length > 0 
      ? entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length 
      : 0;
    
    const trend: 'positive' | 'negative' | 'neutral' = avgMood >= 7 ? 'positive' : avgMood >= 5 ? 'neutral' : 'negative';
    
    return {
      condition,
      averageMood: avgMood,
      entryCount: entries.length,
      trend
    };
  }).filter(impact => impact.entryCount > 0);

  // Mock current weather (in real app, this would be from weather API)
  useEffect(() => {
    setCurrentWeather({
      temperature: 72,
      condition: 'sunny',
      humidity: 45,
      pressure: 1013,
      windSpeed: 8,
      visibility: 10,
      uvIndex: 6,
      location: 'San Francisco, CA',
      timestamp: new Date()
    });
  }, []);

  const chartData = data.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: entry.mood,
    temperature: entry.weather.temperature,
    humidity: entry.weather.humidity,
    pressure: entry.weather.pressure / 10 // Scale down for chart
  }));

  const averageMood = data.reduce((sum, entry) => sum + entry.mood, 0) / data.length;

  return (
    <div className="relative space-y-8">
      {/* Floating weather elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-16 h-16 rounded-full top-20 right-20 bg-gradient-to-br from-yellow-300/30 to-orange-300/30 filter blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-20 h-20 rounded-full bottom-32 left-16 bg-gradient-to-br from-blue-300/30 to-cyan-300/30 filter blur-2xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
      </div>

      {/* Current Weather & Today's Mood */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        {/* Current Weather */}
        {currentWeather && (
          <Card className="relative overflow-hidden border shadow-lg bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200/50 dark:border-blue-700/30 backdrop-blur-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 dark:from-white/5 dark:to-black/10" />
            
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="mb-1 text-blue-800 dark:text-blue-200">
                    Current Weather
                  </CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                    <MapPin className="w-4 h-4" />
                    <span>{currentWeather.location}</span>
                  </div>
                </div>
                
                <motion.div
                  className={`w-16 h-16 bg-gradient-to-br ${getWeatherColor(currentWeather.condition)} rounded-2xl flex items-center justify-center shadow-lg`}
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
                  {(() => {
                    const WeatherIcon = getWeatherIcon(currentWeather.condition);
                    return <WeatherIcon className="w-8 h-8 text-white" />;
                  })()}
                </motion.div>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                    {currentWeather.temperature}°F
                  </div>
                  <div className="text-sm text-blue-600 capitalize dark:text-blue-400">
                    {currentWeather.condition}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {[
                    { icon: Droplets, label: 'Humidity', value: `${currentWeather.humidity}%` },
                    { icon: Gauge, label: 'Pressure', value: `${currentWeather.pressure} hPa` },
                    { icon: Wind, label: 'Wind', value: `${currentWeather.windSpeed} mph` },
                    { icon: Eye, label: 'Visibility', value: `${currentWeather.visibility} mi` }
                  ].map((item, index) => (
                    <div key={item.label} className="flex items-center space-x-2 text-sm">
                      <item.icon className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-400">{item.label}:</span>
                      <span className="font-medium text-blue-800 dark:text-blue-200">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Mood Entry */}
        <Card className="relative overflow-hidden border shadow-lg bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-700/30 backdrop-blur-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 dark:from-white/5 dark:to-black/10" />
          
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-800 dark:text-purple-200">
                Today's Mood
              </CardTitle>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="sm"
                  className="text-white shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Log Mood
                </Button>
              </motion.div>
            </div>
          </CardHeader>

          <CardContent className="relative space-y-6">
            <div className="text-center">
              <motion.div
                className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full shadow-lg bg-gradient-to-br from-purple-500 to-pink-600"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="w-10 h-10 text-white" />
              </motion.div>
              
              <p className="mb-2 text-purple-700 dark:text-purple-300">
                How are you feeling today?
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your mood alongside the weather to discover patterns
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { mood: 8, icon: Smile, label: 'Great', color: 'text-green-500' },
                { mood: 6, icon: Meh, label: 'Okay', color: 'text-yellow-500' },
                { mood: 4, icon: Frown, label: 'Low', color: 'text-red-500' }
              ].map((option, index) => (
                <motion.button
                  key={option.label}
                  className="p-3 transition-all duration-300 border-2 border-gray-200 rounded-xl dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 group"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <option.icon className={`w-6 h-6 mx-auto mb-1 ${option.color} group-hover:scale-110 transition-transform`} />
                  <div className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    {option.label}
                  </div>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weather Impact Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border shadow-lg bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/50 dark:border-emerald-700/30 backdrop-blur-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <TrendingUp className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <CardTitle className="text-emerald-800 dark:text-emerald-200">
                    Weather Impact Analysis
                  </CardTitle>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    How different weather conditions affect your mood
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                  {averageMood.toFixed(1)}/10
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                  Average Mood
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {weatherImpacts.map((impact, index) => {
                const WeatherIcon = getWeatherIcon(impact.condition as WeatherData['condition']);
                const colorClass = getWeatherColor(impact.condition as WeatherData['condition']);
                
                return (
                  <motion.div
                    key={impact.condition}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="p-4 text-center border bg-white/50 dark:bg-gray-800/50 rounded-xl border-white/20 dark:border-gray-700/30 backdrop-blur-sm"
                  >
                    <motion.div
                      className={`w-12 h-12 mx-auto bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center mb-3 shadow-lg`}
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <WeatherIcon className="w-6 h-6 text-white" />
                    </motion.div>
                    
                    <h4 className="mb-1 font-medium text-gray-800 capitalize dark:text-gray-200">
                      {impact.condition}
                    </h4>
                    
                    <div className="mb-1 text-lg font-bold text-gray-800 dark:text-gray-200">
                      {impact.averageMood.toFixed(1)}
                    </div>
                    
                    <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                      {impact.entryCount} entries
                    </div>
                    
                    <Badge 
                      className={`text-xs ${
                        impact.trend === 'positive' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : impact.trend === 'negative'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}
                    >
                      {impact.trend}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mood-Weather Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <BarChart3 className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <CardTitle>Mood & Weather Trends</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Correlation between weather conditions and your emotional state
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {['week', 'month', 'year'].map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant={selectedTimeframe === timeframe ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeframe(timeframe as any)}
                    className="capitalize"
                  >
                    {timeframe}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
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
                    name="Mood (1-10)"
                  />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    name="Temperature (°F)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Mood Level</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Temperature</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights & Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="border shadow-lg bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200/50 dark:border-orange-700/30 backdrop-blur-lg">
          <CardContent className="p-8">
            <div className="flex items-center mb-6 space-x-4">
              <motion.div
                className="flex items-center justify-center w-16 h-16 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl"
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
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
              
              <div>
                <h3 className="mb-2 text-xl font-semibold text-orange-800 dark:text-orange-200">
                  Personalized Insights
                </h3>
                <p className="text-orange-700 dark:text-orange-300">
                  Based on your mood and weather patterns
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="flex items-center space-x-2 font-medium text-orange-800 dark:text-orange-200">
                  <Activity className="w-5 h-5" />
                  <span>Key Findings</span>
                </h4>
                
                <div className="space-y-3">
                  {[
                    "You feel 23% happier on sunny days",
                    "Rainy weather correlates with lower energy",
                    "Your mood is most stable between 70-75°F",
                    "High humidity days show 15% mood decrease"
                  ].map((insight, index) => (
                    <motion.div
                      key={insight}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center p-3 space-x-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    >
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{insight}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="flex items-center space-x-2 font-medium text-orange-800 dark:text-orange-200">
                  <Heart className="w-5 h-5" />
                  <span>Recommendations</span>
                </h4>
                
                <div className="space-y-3">
                  {[
                    "Schedule outdoor activities on sunny forecasts",
                    "Practice indoor mindfulness during storms",
                    "Use light therapy on cloudy days",
                    "Stay hydrated during hot, humid weather"
                  ].map((recommendation, index) => (
                    <motion.div
                      key={recommendation}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="flex items-center p-3 space-x-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
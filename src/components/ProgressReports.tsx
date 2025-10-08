import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { BarChart3, TrendingUp, TrendingDown, Download, Calendar, Target, Heart, Activity, Award, Lightbulb, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ProgressData {
  date: string;
  mood: number;
  anxiety: number;
  energy: number;
  sleep: number;
  habits: number;
  journal: number;
}

interface Insight {
  type: 'achievement' | 'improvement' | 'concern' | 'recommendation';
  title: string;
  description: string;
  icon: any;
  color: string;
}

export function ProgressReports() {
  const [timeRange, setTimeRange] = useState('30');
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    generateProgressData();
    generateInsights();
  }, [timeRange]);

  const generateProgressData = () => {
    const days = parseInt(timeRange);
    const data: ProgressData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic trend data
      const trend = Math.sin(i * 0.1) * 2 + 6;
      const noise = (Math.random() - 0.5) * 1.5;
      
      data.push({
        date: date.toISOString().split('T')[0],
        mood: Math.max(1, Math.min(10, trend + noise)),
        anxiety: Math.max(1, Math.min(10, 10 - trend + noise)),
        energy: Math.max(1, Math.min(10, trend + 1 + noise)),
        sleep: Math.max(1, Math.min(10, 7 + noise)),
        habits: Math.max(0, Math.min(10, Math.floor(Math.random() * 8) + 2)),
        journal: Math.random() > 0.3 ? 1 : 0
      });
    }
    
    setProgressData(data);
  };

  const generateInsights = () => {
    const mockInsights: Insight[] = [
      {
        type: 'achievement',
        title: '7-Day Mood Streak!',
        description: 'You\'ve maintained above-average mood ratings for 7 consecutive days. This shows remarkable consistency in your mental wellness routine.',
        icon: Award,
        color: 'text-yellow-600 bg-yellow-100'
      },
      {
        type: 'improvement',
        title: 'Sleep Quality Trending Up',
        description: 'Your sleep quality has improved by 23% over the past two weeks. This positive change is likely contributing to better mood and energy levels.',
        icon: TrendingUp,
        color: 'text-green-600 bg-green-100'
      },
      {
        type: 'concern',
        title: 'Elevated Anxiety Patterns',
        description: 'Anxiety levels have been slightly elevated on weekdays. Consider incorporating stress management techniques during work hours.',
        icon: AlertCircle,
        color: 'text-orange-600 bg-orange-100'
      },
      {
        type: 'recommendation',
        title: 'Optimize Morning Routine',
        description: 'Data shows your best mood days correlate with morning meditation. Consider making this a daily practice for consistent results.',
        icon: Lightbulb,
        color: 'text-blue-600 bg-blue-100'
      }
    ];
    
    setInsights(mockInsights);
  };

  const calculateAverage = (key: keyof ProgressData) => {
    if (progressData.length === 0) return 0;
    const values = progressData.map(d => d[key] as number).filter(v => !isNaN(v));
    return (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1);
  };

  const calculateTrend = (key: keyof ProgressData) => {
    if (progressData.length < 7) return 0;
    
    const recent = progressData.slice(-7).map(d => d[key] as number);
    const previous = progressData.slice(-14, -7).map(d => d[key] as number);
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const previousAvg = previous.reduce((sum, val) => sum + val, 0) / previous.length;
    
    return ((recentAvg - previousAvg) / previousAvg * 100).toFixed(1);
  };

  const getHabitCompletionData = () => {
    const total = progressData.length;
    const completed = progressData.filter(d => d.habits >= 5).length;
    const partial = progressData.filter(d => d.habits >= 2 && d.habits < 5).length;
    const missed = total - completed - partial;
    
    return [
      { name: 'Completed', value: completed, color: '#10B981' },
      { name: 'Partial', value: partial, color: '#F59E0B' },
      { name: 'Missed', value: missed, color: '#EF4444' }
    ];
  };

  const exportReport = () => {
    const reportData = {
      dateRange: `${timeRange} days`,
      generatedAt: new Date().toISOString(),
      summary: {
        averageMood: calculateAverage('mood'),
        averageEnergy: calculateAverage('energy'),
        averageAnxiety: calculateAverage('anxiety'),
        averageSleep: calculateAverage('sleep')
      },
      trends: {
        moodTrend: calculateTrend('mood'),
        energyTrend: calculateTrend('energy'),
        anxietyTrend: calculateTrend('anxiety'),
        sleepTrend: calculateTrend('sleep')
      },
      insights: insights,
      data: progressData
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `wellness-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-16 h-16 shadow-2xl bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text">
              Progress Reports
            </h2>
            <p className="text-gray-600 dark:text-gray-300">Comprehensive insights into your mental wellness journey</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={exportReport}
            variant="outline"
            className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        className="grid grid-cols-2 gap-6 md:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {[
          { 
            label: 'Average Mood', 
            value: calculateAverage('mood'), 
            trend: calculateTrend('mood'),
            icon: Heart, 
            color: 'pink',
            suffix: '/10'
          },
          { 
            label: 'Energy Level', 
            value: calculateAverage('energy'), 
            trend: calculateTrend('energy'),
            icon: Activity, 
            color: 'blue',
            suffix: '/10'
          },
          { 
            label: 'Sleep Quality', 
            value: calculateAverage('sleep'), 
            trend: calculateTrend('sleep'),
            icon: Calendar, 
            color: 'purple',
            suffix: '/10'
          },
          { 
            label: 'Journal Entries', 
            value: progressData.filter(d => d.journal).length, 
            trend: '0',
            icon: CheckCircle, 
            color: 'green',
            suffix: ` days`
          }
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
                    <div className="text-2xl font-bold">{metric.value}{metric.suffix}</div>
                    <div className={`text-sm flex items-center ${parseFloat(String(metric.trend)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {parseFloat(String(metric.trend)) >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {Math.abs(parseFloat(String(metric.trend))).toFixed(1)}%
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

      {/* Charts and Analysis */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Detailed Trends</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Mood & Energy Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis domain={[1, 10]} stroke="#6B7280" fontSize={12} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: 'none', 
                          borderRadius: '12px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line type="monotone" dataKey="mood" stroke="#EC4899" strokeWidth={3} name="Mood" />
                      <Line type="monotone" dataKey="energy" stroke="#3B82F6" strokeWidth={3} name="Energy" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Habit Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getHabitCompletionData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getHabitCompletionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} days`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {getHabitCompletionData().map((entry) => (
                    <div key={entry.name} className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-medium">{entry.name}</span>
                      </div>
                      <p className="text-xs text-gray-500">{entry.value} days</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="trends">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>All Metrics Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis domain={[1, 10]} stroke="#6B7280" fontSize={12} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: 'none', 
                          borderRadius: '12px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line type="monotone" dataKey="mood" stroke="#EC4899" strokeWidth={2} name="Mood" />
                      <Line type="monotone" dataKey="energy" stroke="#3B82F6" strokeWidth={2} name="Energy" />
                      <Line type="monotone" dataKey="anxiety" stroke="#F59E0B" strokeWidth={2} name="Anxiety" />
                      <Line type="monotone" dataKey="sleep" stroke="#8B5CF6" strokeWidth={2} name="Sleep" />
                    </LineChart>
                  </ResponsiveContainer>
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
                  <Card className="transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-xl ${insight.color} shadow-lg flex items-center justify-center`}>
                          <insight.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold">{insight.title}</h3>
                            <Badge className={`${insight.color} border-0`}>
                              {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{insight.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/50 dark:to-orange-900/50 border-amber-200 dark:border-amber-700 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 shadow-xl bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Keep Building Momentum</h3>
                <p className="max-w-2xl mx-auto mb-4 text-gray-600 dark:text-gray-300">
                  Your progress shows dedication to mental wellness. Continue tracking your journey to 
                  identify patterns and celebrate your growth milestones.
                </p>
                <Badge className="px-4 py-2 text-white bg-gradient-to-r from-amber-500 to-orange-600">
                  You're on the right path! 🌟
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
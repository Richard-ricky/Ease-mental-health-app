import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, Heart, Moon, Dumbbell, Plus, TrendingUp, TrendingDown, Minus, Brain, Target, Calendar, Clock } from "lucide-react";
import { apiCall } from "../../utils/supabase/client.ts";
import { toast } from "sonner";

interface HealthMetric {
  id: string;
  userId: string;
  type: 'sleep' | 'exercise' | 'mood';
  value: number;
  date: string;
  notes: string;
  timestamp: string;
}

interface MetricData {
  sleep: HealthMetric[];
  exercise: HealthMetric[];
  mood: HealthMetric[];
}

export function HealthDashboard() {
  const [metrics, setMetrics] = useState<MetricData>({ sleep: [], exercise: [], mood: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'add' | 'trends'>('overview');
  const [newMetric, setNewMetric] = useState({
    type: 'mood' as 'sleep' | 'exercise' | 'mood',
    value: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await apiCall('/health/metrics');
      setMetrics(response.metrics);
    } catch (error: any) {
      console.error('Error fetching health metrics:', error);
      toast.error(error.message || 'Failed to fetch health metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const addMetric = async () => {
    if (!newMetric.value) {
      toast.error('Please enter a value');
      return;
    }

    try {
      const response = await apiCall('/health/metrics', {
        method: 'POST',
        body: JSON.stringify({
          type: newMetric.type,
          value: parseFloat(newMetric.value),
          date: newMetric.date,
          notes: newMetric.notes
        })
      });

      setMetrics(prev => ({
        ...prev,
        [newMetric.type]: [response.metric, ...prev[newMetric.type]]
      }));

      setNewMetric({
        type: 'mood',
        value: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });

      toast.success('Health metric added successfully!');
      setSelectedTab('overview');
    } catch (error: any) {
      console.error('Error adding health metric:', error);
      toast.error(error.message || 'Failed to add health metric');
    }
  };

  const getChartData = (type: keyof MetricData, days: number = 30) => {
    const now = new Date();
    const data: any[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayMetrics = metrics[type].filter(m => m.date === dateStr);
      const value = dayMetrics.length > 0 
        ? dayMetrics.reduce((sum, m) => sum + m.value, 0) / dayMetrics.length 
        : null;
      
      data.push({
        date: dateStr,
        shortDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: value,
        count: dayMetrics.length
      });
    }
    
    return data;
  };

  const getCombinedData = (days: number = 30) => {
    const now = new Date();
    const data: any[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const sleepMetrics = metrics.sleep.filter(m => m.date === dateStr);
      const exerciseMetrics = metrics.exercise.filter(m => m.date === dateStr);
      const moodMetrics = metrics.mood.filter(m => m.date === dateStr);
      
      data.push({
        date: dateStr,
        shortDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sleep: sleepMetrics.length > 0 ? sleepMetrics.reduce((sum, m) => sum + m.value, 0) / sleepMetrics.length : null,
        exercise: exerciseMetrics.length > 0 ? exerciseMetrics.reduce((sum, m) => sum + m.value, 0) / exerciseMetrics.length : null,
        mood: moodMetrics.length > 0 ? moodMetrics.reduce((sum, m) => sum + m.value, 0) / moodMetrics.length : null
      });
    }
    
    return data;
  };

  const getAverages = () => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const recentSleep = metrics.sleep.filter(m => new Date(m.date) >= last30Days);
    const recentExercise = metrics.exercise.filter(m => new Date(m.date) >= last30Days);
    const recentMood = metrics.mood.filter(m => new Date(m.date) >= last30Days);
    
    return {
      sleep: recentSleep.length > 0 ? recentSleep.reduce((sum, m) => sum + m.value, 0) / recentSleep.length : 0,
      exercise: recentExercise.length > 0 ? recentExercise.reduce((sum, m) => sum + m.value, 0) / recentExercise.length : 0,
      mood: recentMood.length > 0 ? recentMood.reduce((sum, m) => sum + m.value, 0) / recentMood.length : 0
    };
  };

  const getTrend = (type: keyof MetricData) => {
    const data = getChartData(type, 14);
    const recent = data.slice(-7).filter(d => d.value !== null);
    const previous = data.slice(-14, -7).filter(d => d.value !== null);
    
    if (recent.length === 0 || previous.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
    const previousAvg = previous.reduce((sum, d) => sum + d.value, 0) / previous.length;
    
    const change = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    if (Math.abs(change) < 5) return 'stable';
    return change > 0 ? 'improving' : 'declining';
  };

  const averages = getAverages();
  const combinedData = getCombinedData();
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center"
      >
        <div className="flex items-center justify-center space-x-3">
          <motion.div
            className="flex items-center justify-center w-16 h-16 shadow-lg bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Activity className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text">
              Health Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Track your emotion, exercise, and sleep patterns
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'add', label: 'Add Data', icon: Plus },
            { id: 'trends', label: 'Trends', icon: TrendingUp }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? "default" : "outline"}
              onClick={() => setSelectedTab(tab.id as any)}
              className={selectedTab === tab.id 
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700" 
                : ""
              }
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {selectedTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-pink-50/80 to-rose-50/80 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200/50 dark:border-pink-700/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-pink-700 dark:text-pink-300">
                    <Heart className="w-5 h-5" />
                    <span>Average Mood</span>
                    {getTrend('mood') === 'improving' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {getTrend('mood') === 'declining' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {getTrend('mood') === 'stable' && <Minus className="w-4 h-4 text-gray-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                    {averages.mood.toFixed(1)}/10
                  </div>
                  <p className="text-sm text-pink-600/70 dark:text-pink-400/70">
                    Last 30 days • {metrics.mood.length} entries
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                    <Moon className="w-5 h-5" />
                    <span>Average Sleep</span>
                    {getTrend('sleep') === 'improving' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {getTrend('sleep') === 'declining' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {getTrend('sleep') === 'stable' && <Minus className="w-4 h-4 text-gray-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {averages.sleep.toFixed(1)}h
                  </div>
                  <p className="text-sm text-blue-600/70 dark:text-blue-400/70">
                    Last 30 days • {metrics.sleep.length} entries
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50/80 to-green-50/80 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300">
                    <Dumbbell className="w-5 h-5" />
                    <span>Average Exercise</span>
                    {getTrend('exercise') === 'improving' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {getTrend('exercise') === 'declining' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {getTrend('exercise') === 'stable' && <Minus className="w-4 h-4 text-gray-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {averages.exercise.toFixed(0)}min
                  </div>
                  <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">
                    Last 30 days • {metrics.exercise.length} entries
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Combined Chart */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>Health Trends (Last 30 Days)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={combinedData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="shortDate" 
                        className="text-xs"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          borderRadius: '8px',
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#ec4899" 
                        strokeWidth={3}
                        dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                        name="Mood (1-10)"
                        connectNulls={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sleep" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        name="Sleep (hours)"
                        connectNulls={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="exercise" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        name="Exercise (min)"
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center mt-4 space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Mood</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Sleep</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Exercise</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedTab === 'add' && (
          <motion.div
            key="add"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="max-w-2xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span>Add Health Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Metric Type</Label>
                  <Select value={newMetric.type} onValueChange={(value: any) => setNewMetric(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="bg-white/50 dark:bg-gray-700/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mood">
                        <div className="flex items-center space-x-2">
                          <Heart className="w-4 h-4 text-pink-500" />
                          <span>Mood (1-10 scale)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="sleep">
                        <div className="flex items-center space-x-2">
                          <Moon className="w-4 h-4 text-blue-500" />
                          <span>Sleep (hours)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="exercise">
                        <div className="flex items-center space-x-2">
                          <Dumbbell className="w-4 h-4 text-emerald-500" />
                          <span>Exercise (minutes)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder={
                      newMetric.type === 'mood' ? "1-10" :
                      newMetric.type === 'sleep' ? "Hours" :
                      "Minutes"
                    }
                    value={newMetric.value}
                    onChange={(e) => setNewMetric(prev => ({ ...prev, value: e.target.value }))}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newMetric.date}
                    onChange={(e) => setNewMetric(prev => ({ ...prev, date: e.target.value }))}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="Any additional notes..."
                    value={newMetric.notes}
                    onChange={(e) => setNewMetric(prev => ({ ...prev, notes: e.target.value }))}
                    className="bg-white/50 dark:bg-gray-700/50"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={addMetric}
                  className="w-full shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Health Data
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedTab === 'trends' && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Individual Metric Charts */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Mood Chart */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-pink-600 dark:text-pink-400">
                    <Heart className="w-5 h-5" />
                    <span>Mood Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getChartData('mood')}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="shortDate" className="text-xs" tick={{ fontSize: 12 }} />
                        <YAxis domain={[1, 10]} className="text-xs" tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#ec4899" 
                          fill="#ec4899" 
                          fillOpacity={0.3}
                          connectNulls={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Sleep Chart */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                    <Moon className="w-5 h-5" />
                    <span>Sleep Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getChartData('sleep')}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="shortDate" className="text-xs" tick={{ fontSize: 12 }} />
                        <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.3}
                          connectNulls={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Exercise Chart */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                    <Dumbbell className="w-5 h-5" />
                    <span>Exercise Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getChartData('exercise')}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="shortDate" className="text-xs" tick={{ fontSize: 12 }} />
                        <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar 
                          dataKey="value" 
                          fill="#10b981" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Summary */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span>This Week's Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: 'mood', icon: Heart, color: 'pink', data: getChartData('mood', 7) },
                      { type: 'sleep', icon: Moon, color: 'blue', data: getChartData('sleep', 7) },
                      { type: 'exercise', icon: Dumbbell, color: 'emerald', data: getChartData('exercise', 7) }
                    ].map((metric) => {
                      const weekData = metric.data.filter(d => d.value !== null);
                      const average = weekData.length > 0 ? weekData.reduce((sum, d) => sum + d.value, 0) / weekData.length : 0;
                      const daysLogged = weekData.length;
                      
                      return (
                        <div key={metric.type} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center space-x-3">
                            <metric.icon className={`w-5 h-5 text-${metric.color}-500`} />
                            <div>
                              <p className="font-medium capitalize">{metric.type}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {metric.type === 'mood' ? `${average.toFixed(1)}/10` :
                                 metric.type === 'sleep' ? `${average.toFixed(1)}h` :
                                 `${average.toFixed(0)}min`}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {daysLogged}/7 days
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
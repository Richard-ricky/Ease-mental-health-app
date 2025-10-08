import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  Brain, 
  Heart, 
  TrendingDown, 
  TrendingUp,
  Eye,
  Clock,
  Phone,
  MessageCircle,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  Target,
  Bell,
  Users,
  Calendar,
  BarChart3,
  ArrowRight,
  Lightbulb,
  Star
} from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface CrisisIndicator {
  id: string;
  type: 'mood' | 'behavior' | 'language' | 'sleep' | 'social';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detected: Date;
  confidence: number;
  pattern: string;
  recommendations: string[];
}

interface CrisisAlert {
  id: string;
  level: 'warning' | 'urgent' | 'critical';
  title: string;
  message: string;
  triggers: string[];
  actions: CrisisAction[];
  timestamp: Date;
  dismissed: boolean;
}

interface CrisisAction {
  type: 'call' | 'text' | 'contact' | 'resource';
  label: string;
  action: string;
  priority: number;
}

interface MoodPattern {
  date: string;
  mood: number;
  sleep: number;
  activity: number;
  risk: number;
}

const SAMPLE_INDICATORS: CrisisIndicator[] = [
  {
    id: '1',
    type: 'mood',
    severity: 'medium',
    description: 'Sustained low mood scores over 5 days',
    detected: new Date(Date.now() - 2 * 60 * 60 * 1000),
    confidence: 78,
    pattern: 'Declining trend',
    recommendations: [
      'Consider reaching out to a mental health professional',
      'Engage in positive activities',
      'Connect with supportive friends or family'
    ]
  },
  {
    id: '2',
    type: 'language',
    severity: 'high',
    description: 'Concerning language patterns in journal entries',
    detected: new Date(Date.now() - 45 * 60 * 1000),
    confidence: 85,
    pattern: 'Hopelessness indicators',
    recommendations: [
      'Immediate check-in with therapist recommended',
      'Use crisis support resources',
      'Activate support network'
    ]
  },
  {
    id: '3',
    type: 'behavior',
    severity: 'low',
    description: 'Decreased activity and social interaction',
    detected: new Date(Date.now() - 6 * 60 * 60 * 1000),
    confidence: 62,
    pattern: 'Social withdrawal',
    recommendations: [
      'Schedule social activities',
      'Try gentle exercise',
      'Consider virtual therapy session'
    ]
  }
];

const SAMPLE_ALERTS: CrisisAlert[] = [
  {
    id: '1',
    level: 'urgent',
    title: 'Multiple Risk Factors Detected',
    message: 'Our AI has identified concerning patterns in your recent entries. Your wellbeing is important - please consider reaching out for support.',
    triggers: ['Low mood trend', 'Sleep disturbance', 'Social withdrawal'],
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    dismissed: false,
    actions: [
      { type: 'call', label: 'Crisis Hotline', action: '988', priority: 1 },
      { type: 'text', label: 'Crisis Text', action: 'Text HOME to 741741', priority: 2 },
      { type: 'contact', label: 'Emergency Contact', action: 'Call trusted person', priority: 3 }
    ]
  }
];

const MOOD_PATTERN_DATA: MoodPattern[] = [
  { date: '7d ago', mood: 7, sleep: 8, activity: 6, risk: 15 },
  { date: '6d ago', mood: 6, sleep: 7, activity: 5, risk: 25 },
  { date: '5d ago', mood: 5, sleep: 6, activity: 4, risk: 35 },
  { date: '4d ago', mood: 4, sleep: 5, activity: 3, risk: 50 },
  { date: '3d ago', mood: 3, sleep: 4, activity: 3, risk: 65 },
  { date: '2d ago', mood: 3, sleep: 3, activity: 2, risk: 75 },
  { date: '1d ago', mood: 2, sleep: 3, activity: 2, risk: 85 },
  { date: 'Today', mood: 2, sleep: 2, activity: 1, risk: 90 }
];

const getSeverityConfig = (severity: CrisisIndicator['severity']) => {
  switch (severity) {
    case 'low':
      return {
        color: 'from-yellow-500 to-amber-600',
        bgColor: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-700',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        icon: Eye
      };
    case 'medium':
      return {
        color: 'from-orange-500 to-red-500',
        bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
        borderColor: 'border-orange-200 dark:border-orange-700',
        textColor: 'text-orange-800 dark:text-orange-200',
        icon: AlertTriangle
      };
    case 'high':
      return {
        color: 'from-red-500 to-pink-600',
        bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
        borderColor: 'border-red-200 dark:border-red-700',
        textColor: 'text-red-800 dark:text-red-200',
        icon: AlertTriangle
      };
    case 'critical':
      return {
        color: 'from-red-600 to-red-800',
        bgColor: 'from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/20',
        borderColor: 'border-red-300 dark:border-red-600',
        textColor: 'text-red-900 dark:text-red-100',
        icon: Shield
      };
  }
};

const getAlertConfig = (level: CrisisAlert['level']) => {
  switch (level) {
    case 'warning':
      return {
        color: 'from-yellow-500 to-amber-600',
        bgColor: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-700',
        textColor: 'text-yellow-800 dark:text-yellow-200'
      };
    case 'urgent':
      return {
        color: 'from-orange-500 to-red-500',
        bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
        borderColor: 'border-orange-200 dark:border-orange-700',
        textColor: 'text-orange-800 dark:text-orange-200'
      };
    case 'critical':
      return {
        color: 'from-red-600 to-red-800',
        bgColor: 'from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/20',
        borderColor: 'border-red-300 dark:border-red-600',
        textColor: 'text-red-900 dark:text-red-100'
      };
  }
};

export function CrisisDetectionAI() {
  const [indicators, setIndicators] = useState<CrisisIndicator[]>(SAMPLE_INDICATORS);
  const [alerts, setAlerts] = useState<CrisisAlert[]>(SAMPLE_ALERTS);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [overallRiskLevel, setOverallRiskLevel] = useState(75);

  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const highSeverityIndicators = indicators.filter(i => i.severity === 'high' || i.severity === 'critical');

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
    toast.success("Alert dismissed. We're still monitoring your wellbeing.");
  };

  const handleAction = (action: CrisisAction) => {
    switch (action.type) {
      case 'call':
        window.open(`tel:${action.action}`);
        break;
      case 'text':
        toast.info(action.action);
        break;
      case 'contact':
        toast.info("Please reach out to your emergency contact");
        break;
      default:
        toast.info(action.label);
    }
  };

  const handleToggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    toast.success(isMonitoring ? "Crisis monitoring paused" : "Crisis monitoring activated");
  };

  return (
    <div className="relative space-y-8">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-32 h-32 rounded-full top-20 right-20 bg-gradient-to-br from-red-300/20 to-pink-300/20 filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Crisis Alerts */}
      <AnimatePresence>
        {activeAlerts.map((alert, index) => {
          const config = getAlertConfig(alert.level);
          
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Alert className={`border-2 ${config.borderColor} bg-gradient-to-r ${config.bgColor} shadow-xl backdrop-blur-sm`}>
                <motion.div
                  className="flex items-start space-x-4"
                  animate={{
                    x: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <motion.div
                    className={`w-12 h-12 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </motion.div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${config.textColor} text-lg`}>
                        {alert.title}
                      </h3>
                      <Badge className={`bg-gradient-to-r ${config.color} text-white text-xs`}>
                        {alert.level.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <AlertDescription className={`${config.textColor} mb-4 leading-relaxed`}>
                      {alert.message}
                    </AlertDescription>
                    
                    <div className="mb-4">
                      <p className={`text-sm ${config.textColor} mb-2 font-medium`}>Detected patterns:</p>
                      <div className="flex flex-wrap gap-2">
                        {alert.triggers.map((trigger, i) => (
                          <Badge key={i} variant="outline" className={`text-xs ${config.textColor} border-current`}>
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mb-4">
                      {alert.actions.map((action, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={() => handleAction(action)}
                            size="sm"
                            className={`bg-gradient-to-r ${config.color} hover:shadow-lg transition-all duration-300 text-white`}
                          >
                            {action.type === 'call' && <Phone className="w-4 h-4 mr-2" />}
                            {action.type === 'text' && <MessageCircle className="w-4 h-4 mr-2" />}
                            {action.type === 'contact' && <Users className="w-4 h-4 mr-2" />}
                            {action.label}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${config.textColor} opacity-75`}>
                        {alert.timestamp.toLocaleString()}
                      </span>
                      
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDismissAlert(alert.id)}
                          className="text-xs"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Dismiss
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </Alert>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Monitoring Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        <Card className="border shadow-lg bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-700/30 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <motion.div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                  isMonitoring 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-br from-gray-500 to-slate-600'
                }`}
                animate={isMonitoring ? { 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 4px 20px rgba(34, 197, 94, 0.3)",
                    "0 6px 25px rgba(34, 197, 94, 0.5)",
                    "0 4px 20px rgba(34, 197, 94, 0.3)"
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-blue-800 dark:text-blue-200">
                  AI Monitoring
                </h3>
                <p className={`text-sm ${isMonitoring ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {isMonitoring ? 'Active - Protecting your wellbeing' : 'Paused'}
                </p>
                <motion.div className="mt-3" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={handleToggleMonitoring}
                    size="sm"
                    variant={isMonitoring ? "outline" : "default"}
                    className="text-xs"
                  >
                    {isMonitoring ? 'Pause' : 'Activate'}
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-lg bg-gradient-to-br from-orange-50/80 to-red-50/80 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200/50 dark:border-orange-700/30 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <motion.div
                className="flex items-center justify-center w-16 h-16 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: overallRiskLevel > 70 ? [1, 1.1, 1] : [1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Activity className="w-8 h-8 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-orange-800 dark:text-orange-200">
                  Risk Level
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-orange-600 dark:text-orange-400">Current</span>
                    <span className="font-medium text-orange-800 dark:text-orange-200">{overallRiskLevel}%</span>
                  </div>
                  <Progress 
                    value={overallRiskLevel} 
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-lg bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-700/30 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <motion.div
                className="flex items-center justify-center w-16 h-16 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl"
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Target className="w-8 h-8 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-purple-800 dark:text-purple-200">
                  Active Indicators
                </h3>
                <p className="mb-1 text-2xl font-bold text-purple-800 dark:text-purple-200">
                  {indicators.length}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {highSeverityIndicators.length} high priority
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Risk Pattern Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <BarChart3 className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <CardTitle>Risk Pattern Analysis</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    AI-detected patterns over the past week
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOOD_PATTERN_DATA}>
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
                    dataKey="risk"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fill="url(#riskGradient)"
                    name="Risk Level (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    name="Mood (1-10)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Risk Level</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Mood Trend</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Crisis Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <motion.div
                className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-red-500 to-pink-600 rounded-xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <AlertTriangle className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <CardTitle>Crisis Indicators</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-detected patterns that may indicate distress
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {indicators.map((indicator, index) => {
                const config = getSeverityConfig(indicator.severity);
                const Icon = config.icon;
                const isSelected = selectedIndicator === indicator.id;
                
                return (
                  <motion.div
                    key={indicator.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    className="group"
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-300 border-2 ${config.borderColor} bg-gradient-to-r ${config.bgColor} hover:shadow-lg ${
                        isSelected ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
                      }`}
                      onClick={() => setSelectedIndicator(isSelected ? null : indicator.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <motion.div
                            className={`w-12 h-12 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </motion.div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={`font-semibold ${config.textColor}`}>
                                {indicator.description}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <Badge className={`bg-gradient-to-r ${config.color} text-white text-xs`}>
                                  {indicator.severity}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {indicator.confidence}% confidence
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span className={config.textColor}>
                                  {indicator.detected.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <TrendingDown className="w-3 h-3" />
                                <span className={config.textColor}>
                                  {indicator.pattern}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <motion.div
                            animate={{ rotate: isSelected ? 90 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                          </motion.div>
                        </div>
                        
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50"
                            >
                              <h5 className={`font-medium ${config.textColor} mb-3 flex items-center space-x-2`}>
                                <Lightbulb className="w-4 h-4" />
                                <span>Recommended Actions:</span>
                              </h5>
                              <ul className="space-y-2">
                                {indicator.recommendations.map((rec, i) => (
                                  <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`flex items-start space-x-2 text-sm ${config.textColor}`}
                                  >
                                    <Star className="w-3 h-3 mt-0.5 flex-shrink-0" />
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
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center"
      >
        <Card className="border shadow-lg bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/50 dark:border-emerald-700/30 backdrop-blur-lg">
          <CardContent className="p-8">
            <motion.div
              className="flex items-center justify-center w-16 h-16 mx-auto mb-6 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl"
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
              <Heart className="w-8 h-8 text-white" />
            </motion.div>
            
            <h3 className="mb-2 text-xl font-semibold text-emerald-800 dark:text-emerald-200">
              We're Here for You 💚
            </h3>
            <p className="max-w-2xl mx-auto mb-6 text-emerald-700 dark:text-emerald-300">
              Our AI continuously monitors patterns to support your wellbeing. Remember, reaching out for help is a sign of strength, not weakness.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg"
                  className="text-white transition-all duration-300 shadow-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:shadow-2xl"
                  onClick={() => window.open('tel:988')}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Crisis Hotline (988)
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                  onClick={() => toast.info("Text HOME to 741741")}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Crisis Text Line
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Find Support Groups
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Brain, Sparkles, Target, Calendar, Clock, CheckCircle, Star, Lightbulb, Heart, Moon, Dumbbell, Smile, Users, Utensils } from "lucide-react";
import { apiCall } from "../../utils/supabase/client.ts";
import { toast } from "sonner";

interface WellnessPlan {
  id: string;
  userId: string;
  title: string;
  duration: string;
  goals: string[];
  weeklyPlan: WeekPlan[];
  tips: string[];
  recommendations: {
    sleep: string;
    exercise: string;
    mindfulness: string;
  };
  userSummary: {
    sleepAverage: number;
    exerciseAverage: number;
    moodAverage: number;
    habitsCount: number;
    activeHabits: number;
    daysActive: number;
  };
  status: 'active' | 'completed';
  progress: number;
  createdAt: string;
}

interface WeekPlan {
  week: number;
  focus: string;
  activities: Activity[];
}

interface Activity {
  type: 'sleep' | 'exercise' | 'mindfulness' | 'nutrition' | 'social';
  activity: string;
  frequency: string;
  duration: string;
}

export function WellnessPlans() {
  const [activePlan, setActivePlan] = useState<WellnessPlan | null>(null);
  const [completedPlans, setCompletedPlans] = useState<WellnessPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'current' | 'generate' | 'history'>('current');

  useEffect(() => {
    fetchWellnessPlans();
  }, []);

  const fetchWellnessPlans = async () => {
    try {
      setIsLoading(true);
      const response = await apiCall('/wellness/plan');
      setActivePlan(response.activePlan);
      setCompletedPlans(response.completedPlans);
    } catch (error: any) {
      console.error('Error fetching wellness plans:', error);
      toast.error(error.message || 'Failed to fetch wellness plans');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePlan = async () => {
    try {
      setIsGenerating(true);
      const response = await apiCall('/wellness/generate-plan', {
        method: 'POST'
      });
      
      setActivePlan(response.plan);
      setSelectedTab('current');
      toast.success('Your personalized wellness plan has been generated! 🎉');
    } catch (error: any) {
      console.error('Error generating wellness plan:', error);
      toast.error(error.message || 'Failed to generate wellness plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sleep': return Moon;
      case 'exercise': return Dumbbell;
      case 'mindfulness': return Heart;
      case 'nutrition': return Utensils;
      case 'social': return Users;
      default: return Target;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'sleep': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'exercise': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'mindfulness': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'nutrition': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'social': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 rounded-full border-violet-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center"
      >
        <div className="flex items-center justify-center space-x-3">
          <motion.div
            className="flex items-center justify-center w-16 h-16 shadow-lg bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text">
              AI Wellness Plans
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Personalized wellness plans powered by AI insights
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center space-x-2">
          {[
            { id: 'current', label: 'Current Plan', icon: Target },
            { id: 'generate', label: 'Generate Plan', icon: Sparkles },
            { id: 'history', label: 'Plan History', icon: Calendar }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? "default" : "outline"}
              onClick={() => setSelectedTab(tab.id as any)}
              className={selectedTab === tab.id 
                ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700" 
                : ""
              }
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <Badge className="px-3 py-1 text-white bg-gradient-to-r from-violet-500 to-purple-600">
          <Brain className="w-4 h-4 mr-1" />
          AI Powered
        </Badge>
        <Badge className="px-3 py-1 text-white bg-gradient-to-r from-blue-500 to-indigo-600">
          <Target className="w-4 h-4 mr-1" />
          Personalized
        </Badge>
        <Badge className="px-3 py-1 text-white bg-gradient-to-r from-emerald-500 to-teal-600">
          <Sparkles className="w-4 h-4 mr-1" />
          Evidence-Based
        </Badge>
      </div>

      <AnimatePresence mode="wait">
        {selectedTab === 'current' && (
          <motion.div
            key="current"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {activePlan ? (
              <div className="space-y-8">
                {/* Plan Overview */}
                <Card className="bg-gradient-to-r from-violet-50/80 to-purple-50/80 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-200/50 dark:border-violet-700/50 backdrop-blur-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="mb-2 text-2xl">{activePlan.title}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{activePlan.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target className="w-4 h-4" />
                            <span>{activePlan.goals.length} goals</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="text-white bg-gradient-to-r from-violet-500 to-purple-600">
                        {activePlan.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {activePlan.progress}%
                        </span>
                      </div>
                      <Progress value={activePlan.progress} className="h-2" />
                    </div>

                    <div>
                      <h4 className="mb-3 font-semibold">Your Goals</h4>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {activePlan.goals.map((goal, index) => (
                          <div key={index} className="flex items-center p-3 space-x-2 rounded-lg bg-white/50 dark:bg-gray-700/50">
                            <Star className="flex-shrink-0 w-4 h-4 text-violet-500" />
                            <span className="text-sm">{goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Plan */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Weekly Plan</h3>
                  <div className="grid gap-6">
                    {activePlan.weeklyPlan.map((week) => (
                      <Card key={week.week} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full bg-gradient-to-r from-violet-500 to-purple-600">
                              {week.week}
                            </div>
                            <div>
                              <div>Week {week.week}</div>
                              <div className="text-sm font-normal text-gray-600 dark:text-gray-300">
                                Focus: {week.focus}
                              </div>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {week.activities.map((activity, index) => {
                              const IconComponent = getActivityIcon(activity.type);
                              return (
                                <div
                                  key={index}
                                  className="p-4 transition-shadow border-2 border-gray-100 rounded-lg dark:border-gray-700 hover:shadow-md"
                                >
                                  <div className="flex items-start space-x-3">
                                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                                      <IconComponent className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="mb-1 text-sm font-medium capitalize">{activity.type}</h5>
                                      <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                                        {activity.activity}
                                      </p>
                                      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center space-x-1">
                                          <Calendar className="w-3 h-3" />
                                          <span>{activity.frequency}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <Clock className="w-3 h-3" />
                                          <span>{activity.duration}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Recommendations & Tips */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        <span>Personalized Recommendations</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(activePlan.recommendations).map(([category, recommendation]) => {
                        const IconComponent = getActivityIcon(category);
                        return (
                          <div key={category} className="flex items-start p-3 space-x-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <div className={`p-2 rounded-lg ${getActivityColor(category)}`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="mb-1 font-medium capitalize">{category}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{recommendation}</p>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-violet-500" />
                        <span>Wellness Tips</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {activePlan.tips.map((tip, index) => (
                          <div key={index} className="flex items-start p-3 space-x-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600 dark:text-gray-300">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-600 dark:text-gray-300">
                  No Active Wellness Plan
                </h3>
                <p className="mb-6 text-gray-500 dark:text-gray-400">
                  Generate your first personalized wellness plan based on your health data and goals.
                </p>
                <Button onClick={() => setSelectedTab('generate')}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Plan
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === 'generate' && (
          <motion.div
            key="generate"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
                  <Sparkles className="w-6 h-6 text-violet-500" />
                  <span>Generate AI Wellness Plan</span>
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Our AI will analyze your health data, mood patterns, and habits to create a personalized wellness plan just for you.
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-3 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold">Mood Analysis</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      We analyze your mood patterns to understand your emotional wellness needs
                    </p>
                  </div>
                  
                  <div className="space-y-3 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
                      <Moon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold">Health Metrics</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Your sleep and exercise data helps create realistic, achievable goals
                    </p>
                  </div>
                  
                  <div className="space-y-3 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold">Habit Tracking</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Your current habits inform recommendations for sustainable changes
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-6 text-center">
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold">What You'll Get</h4>
                    <div className="grid max-w-2xl grid-cols-1 gap-4 mx-auto md:grid-cols-2">
                      {[
                        "Personalized weekly activity plans",
                        "Evidence-based wellness recommendations",
                        "Sleep optimization strategies",
                        "Exercise routines tailored to you",
                        "Mindfulness and stress management",
                        "Nutrition guidance for mental health"
                      ].map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="flex-shrink-0 w-4 h-4 text-green-500" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={generatePlan}
                    disabled={isGenerating}
                    size="lg"
                    className="px-8 shadow-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                  >
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 mr-2 border-2 border-white rounded-full border-t-transparent"
                        />
                        Generating Your Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate My Wellness Plan
                      </>
                    )}
                  </Button>

                  {isGenerating && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      This may take a few moments while our AI analyzes your data...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {completedPlans.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {completedPlans.map((plan) => (
                  <Card key={plan.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{plan.title}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Completed {new Date(plan.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Progress</span>
                        <span className="text-sm font-medium">{plan.progress}%</span>
                      </div>
                      <Progress value={plan.progress} className="h-2" />
                      
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Goals Achieved</h5>
                        <div className="space-y-1">
                          {plan.goals.slice(0, 3).map((goal, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="text-gray-600 dark:text-gray-300">{goal}</span>
                            </div>
                          ))}
                          {plan.goals.length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{plan.goals.length - 3} more goals
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-600 dark:text-gray-300">
                  No Completed Plans
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Complete your first wellness plan to see your history here.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
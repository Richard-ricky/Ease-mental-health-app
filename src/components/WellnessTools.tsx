import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Slider } from "./ui/slider";
import { Wind, Moon, Brain, Heart, Activity, PlayCircle, PauseCircle, RotateCcw, CheckCircle } from "lucide-react";

interface BreathingSession {
  id: string;
  name: string;
  duration: number;
  inhale: number;
  hold: number;
  exhale: number;
  description: string;
}

interface MeditationSession {
  id: string;
  title: string;
  duration: number;
  type: string;
  description: string;
  audioUrl?: string;
}

export function WellnessTools() {
  const [activeBreathing, setActiveBreathing] = useState<BreathingSession | null>(null);
  const [breathingTimer, setBreathingTimer] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [sleepScore, setSleepScore] = useState(75);
  const [dailyGoals, setDailyGoals] = useState({
    meditation: { target: 10, completed: 7 },
    breathing: { target: 3, completed: 2 },
    journaling: { target: 1, completed: 1 },
    steps: { target: 8000, completed: 5500 }
  });

  const breathingExercises: BreathingSession[] = [
    {
      id: '4-7-8',
      name: '4-7-8 Technique',
      duration: 480, // 8 minutes
      inhale: 4,
      hold: 7,
      exhale: 8,
      description: 'A calming technique to reduce anxiety and promote sleep'
    },
    {
      id: 'box',
      name: 'Box Breathing',
      duration: 300, // 5 minutes
      inhale: 4,
      hold: 4,
      exhale: 4,
      description: 'Equal timing for balance and focus'
    },
    {
      id: 'energizing',
      name: 'Energizing Breath',
      duration: 180, // 3 minutes
      inhale: 6,
      hold: 2,
      exhale: 4,
      description: 'Quick technique to boost energy and alertness'
    }
  ];

  const meditations: MeditationSession[] = [
    {
      id: 'anxiety-relief',
      title: 'Anxiety Relief',
      duration: 10,
      type: 'Guided',
      description: 'Calm your mind and reduce anxious thoughts'
    },
    {
      id: 'sleep-story',
      title: 'Sleep Story',
      duration: 20,
      type: 'Sleep',
      description: 'Gentle story to help you drift off to sleep'
    },
    {
      id: 'mindfulness',
      title: 'Daily Mindfulness',
      duration: 15,
      type: 'Mindfulness',
      description: 'Build awareness and presence in the moment'
    },
    {
      id: 'self-compassion',
      title: 'Self-Compassion',
      duration: 12,
      type: 'Loving-kindness',
      description: 'Practice kindness and understanding toward yourself'
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isBreathingActive && activeBreathing) {
      interval = setInterval(() => {
        setBreathingTimer(prev => {
          if (prev >= activeBreathing.duration) {
            setIsBreathingActive(false);
            setActiveBreathing(null);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isBreathingActive, activeBreathing]);

  useEffect(() => {
    if (activeBreathing && isBreathingActive) {
      const cycleTime = activeBreathing.inhale + activeBreathing.hold + activeBreathing.exhale;
      const currentCyclePosition = breathingTimer % cycleTime;
      
      if (currentCyclePosition < activeBreathing.inhale) {
        setBreathingPhase('inhale');
      } else if (currentCyclePosition < activeBreathing.inhale + activeBreathing.hold) {
        setBreathingPhase('hold');
      } else {
        setBreathingPhase('exhale');
      }
    }
  }, [breathingTimer, activeBreathing, isBreathingActive]);

  const startBreathingExercise = (exercise: BreathingSession) => {
    setActiveBreathing(exercise);
    setBreathingTimer(0);
    setBreathingPhase('inhale');
    setIsBreathingActive(true);
  };

  const stopBreathingExercise = () => {
    setIsBreathingActive(false);
    setActiveBreathing(null);
    setBreathingTimer(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseInstruction = () => {
    if (!activeBreathing) return '';
    
    switch (breathingPhase) {
      case 'inhale':
        return `Breathe in slowly for ${activeBreathing.inhale} seconds`;
      case 'hold':
        return `Hold your breath for ${activeBreathing.hold} seconds`;
      case 'exhale':
        return `Breathe out slowly for ${activeBreathing.exhale} seconds`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Wellness Tools</h2>
          <p className="text-gray-600">Guided exercises for mental and physical wellbeing</p>
        </div>
      </div>

      <Tabs defaultValue="breathing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="breathing">Breathing</TabsTrigger>
          <TabsTrigger value="meditation">Meditation</TabsTrigger>
          <TabsTrigger value="sleep">Sleep</TabsTrigger>
          <TabsTrigger value="goals">Daily Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="breathing">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Active Breathing Exercise */}
            {activeBreathing && (
              <Card className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{activeBreathing.name}</span>
                    <Badge variant="secondary">{formatTime(breathingTimer)} / {formatTime(activeBreathing.duration)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className={`w-32 h-32 mx-auto rounded-full border-4 transition-all duration-1000 ${
                        breathingPhase === 'inhale' ? 'scale-110 border-blue-500 bg-blue-100' :
                        breathingPhase === 'hold' ? 'scale-110 border-purple-500 bg-purple-100' :
                        'scale-90 border-green-500 bg-green-100'
                      }`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Wind className={`w-12 h-12 transition-colors ${
                            breathingPhase === 'inhale' ? 'text-blue-600' :
                            breathingPhase === 'hold' ? 'text-purple-600' :
                            'text-green-600'
                          }`} />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-2 capitalize">{breathingPhase}</h3>
                      <p className="text-gray-600">{getPhaseInstruction()}</p>
                    </div>

                    <Progress value={(breathingTimer / activeBreathing.duration) * 100} className="w-full" />

                    <div className="flex justify-center space-x-4">
                      <Button
                        onClick={() => setIsBreathingActive(!isBreathingActive)}
                        className="flex items-center space-x-2"
                      >
                        {isBreathingActive ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                        <span>{isBreathingActive ? 'Pause' : 'Resume'}</span>
                      </Button>
                      <Button variant="outline" onClick={stopBreathingExercise}>
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Stop
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Breathing Exercise Options */}
            {breathingExercises.map((exercise) => (
              <Card key={exercise.id} className={activeBreathing?.id === exercise.id ? 'ring-2 ring-blue-500' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wind className="w-5 h-5 text-blue-600" />
                    <span>{exercise.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{exercise.description}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Duration: {formatTime(exercise.duration)}</span>
                    <span>Pattern: {exercise.inhale}-{exercise.hold}-{exercise.exhale}</span>
                  </div>
                  <Button 
                    onClick={() => startBreathingExercise(exercise)}
                    disabled={activeBreathing?.id === exercise.id}
                    className="w-full"
                  >
                    {activeBreathing?.id === exercise.id ? 'Active' : 'Start Exercise'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="meditation">
          <div className="grid md:grid-cols-2 gap-6">
            {meditations.map((meditation) => (
              <Card key={meditation.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <span>{meditation.title}</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Badge variant="secondary">{meditation.duration} min</Badge>
                    <Badge variant="outline">{meditation.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{meditation.description}</p>
                  <Button className="w-full">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start Meditation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sleep">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Moon className="w-5 h-5 text-indigo-600" />
                  <span>Sleep Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">{sleepScore}</div>
                  <p className="text-gray-600">Last night's sleep quality</p>
                </div>
                <Progress value={sleepScore} className="w-full" />
                <div className="text-sm text-gray-500 text-center">
                  Based on 7.5 hours of sleep
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sleep Hygiene Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Set a consistent bedtime</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Avoid screens 1 hour before bed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Keep bedroom cool (60-67°F)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">No caffeine after 2 PM</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Track Tonight's Sleep
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(dailyGoals).map(([key, goal]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{key}</span>
                    <Badge variant={goal.completed >= goal.target ? "default" : "secondary"}>
                      {goal.completed}/{goal.target}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={(goal.completed / goal.target) * 100} className="w-full mb-4" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{goal.completed} completed</span>
                    <span>{Math.max(0, goal.target - goal.completed)} remaining</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
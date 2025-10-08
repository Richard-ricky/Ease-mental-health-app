import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar } from "./ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Heart, Calendar as CalendarIcon, TrendingUp, Smile, Meh, Frown, Sun, Cloud, CloudRain, Zap, Target, Book } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MoodEntry {
  id: string;
  date: string;
  mood: number; // 1-10 scale
  emotions: string[];
  energy: number; // 1-10 scale
  stress: number; // 1-10 scale
  sleep: number; // 1-10 scale
  activities: string[];
  note: string;
  weather?: string;
  gratitude?: string[];
  goals?: string[];
}

interface JournalPrompt {
  id: string;
  question: string;
  category: string;
}

export function MoodTracker() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentEntry, setCurrentEntry] = useState<Partial<MoodEntry>>({
    mood: 5,
    energy: 5,
    stress: 5,
    sleep: 5,
    emotions: [],
    activities: [],
    gratitude: ['', '', ''],
    goals: ['']
  });
  const [activeStep, setActiveStep] = useState(0);
  const [journalPrompts, setJournalPrompts] = useState<JournalPrompt[]>([]);

  useEffect(() => {
    loadEntries();
    loadJournalPrompts();
  }, []);

  useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const existingEntry = entries.find(entry => entry.date === dateStr);
    
    if (existingEntry) {
      setCurrentEntry(existingEntry);
    } else {
      setCurrentEntry({
        mood: 5,
        energy: 5,
        stress: 5,
        sleep: 5,
        emotions: [],
        activities: [],
        gratitude: ['', '', ''],
        goals: ['']
      });
    }
  }, [selectedDate, entries]);

  const loadEntries = () => {
    const saved = localStorage.getItem('mood-entries');
    if (saved) {
      try {
        const parsedEntries = JSON.parse(saved);
        setEntries(parsedEntries);
      } catch (error) {
        console.error('Error loading mood entries:', error);
      }
    }
  };

  const loadJournalPrompts = () => {
    const prompts: JournalPrompt[] = [
      { id: '1', question: 'What made you smile today?', category: 'positivity' },
      { id: '2', question: 'What challenge did you overcome today?', category: 'growth' },
      { id: '3', question: 'How did you show kindness to yourself or others today?', category: 'kindness' },
      { id: '4', question: 'What are you looking forward to tomorrow?', category: 'hope' },
      { id: '5', question: 'What lesson did today teach you?', category: 'learning' },
      { id: '6', question: 'How did you practice self-care today?', category: 'wellness' },
      { id: '7', question: 'What emotions did you experience most today, and why?', category: 'reflection' },
      { id: '8', question: 'What would you tell a friend who had a day like yours?', category: 'compassion' }
    ];
    setJournalPrompts(prompts);
  };

  const saveEntry = () => {
    if (!currentEntry.mood) return;

    const dateStr = selectedDate.toISOString().split('T')[0];
    const entry: MoodEntry = {
      id: Date.now().toString(),
      date: dateStr,
      mood: currentEntry.mood,
      emotions: currentEntry.emotions || [],
      energy: currentEntry.energy || 5,
      stress: currentEntry.stress || 5,
      sleep: currentEntry.sleep || 5,
      activities: currentEntry.activities || [],
      note: currentEntry.note || '',
      weather: currentEntry.weather,
      gratitude: currentEntry.gratitude?.filter(g => g.trim()) || [],
      goals: currentEntry.goals?.filter(g => g.trim()) || []
    };

    const updatedEntries = entries.filter(e => e.date !== dateStr);
    updatedEntries.push(entry);
    
    localStorage.setItem('mood-entries', JSON.stringify(updatedEntries));
    setEntries(updatedEntries);
    
    // Show success message
    console.log('Mood entry saved successfully!');
  };

  const getMoodIcon = (mood: number) => {
    if (mood >= 8) return <Smile className="w-6 h-6 text-green-500" />;
    if (mood >= 6) return <Meh className="w-6 h-6 text-yellow-500" />;
    return <Frown className="w-6 h-6 text-red-500" />;
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'bg-green-100 text-green-700 border-green-200';
    if (mood >= 6) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny': return <Sun className="w-4 h-4" />;
      case 'cloudy': return <Cloud className="w-4 h-4" />;
      case 'rainy': return <CloudRain className="w-4 h-4" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  const emotionOptions = [
    'happy', 'sad', 'anxious', 'excited', 'calm', 'frustrated', 
    'grateful', 'overwhelmed', 'peaceful', 'angry', 'hopeful', 'lonely'
  ];

  const activityOptions = [
    'exercise', 'meditation', 'reading', 'socializing', 'work', 'cooking',
    'music', 'nature', 'gaming', 'art', 'learning', 'relaxing'
  ];

  const toggleEmotion = (emotion: string) => {
    const emotions = currentEntry.emotions || [];
    if (emotions.includes(emotion)) {
      setCurrentEntry({
        ...currentEntry,
        emotions: emotions.filter(e => e !== emotion)
      });
    } else {
      setCurrentEntry({
        ...currentEntry,
        emotions: [...emotions, emotion]
      });
    }
  };

  const toggleActivity = (activity: string) => {
    const activities = currentEntry.activities || [];
    if (activities.includes(activity)) {
      setCurrentEntry({
        ...currentEntry,
        activities: activities.filter(a => a !== activity)
      });
    } else {
      setCurrentEntry({
        ...currentEntry,
        activities: [...activities, activity]
      });
    }
  };

  const updateGratitude = (index: number, value: string) => {
    const gratitude = [...(currentEntry.gratitude || ['', '', ''])];
    gratitude[index] = value;
    setCurrentEntry({ ...currentEntry, gratitude });
  };

  const steps = [
    { title: 'Mood Rating', icon: Heart },
    { title: 'Emotions & Energy', icon: Zap },
    { title: 'Activities & Reflection', icon: Target },
    { title: 'Gratitude & Goals', icon: Book }
  ];

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="mb-4 text-xl font-semibold">How are you feeling today?</h3>
              <div className="flex items-center justify-center mb-6 space-x-4">
                {getMoodIcon(currentEntry.mood || 5)}
                <span className="text-2xl font-bold">{currentEntry.mood}/10</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Mood Level</label>
              <input
                type="range"
                min="1"
                max="10"
                value={currentEntry.mood || 5}
                onChange={(e) => setCurrentEntry({ ...currentEntry, mood: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Very Low</span>
                <span>Great</span>
              </div>
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold">What emotions did you experience?</h3>
              <div className="grid grid-cols-3 gap-2">
                {emotionOptions.map((emotion) => (
                  <Button
                    key={emotion}
                    variant={currentEntry.emotions?.includes(emotion) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleEmotion(emotion)}
                    className="capitalize"
                  >
                    {emotion}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Energy Level</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentEntry.energy || 5}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, energy: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{currentEntry.energy}/10</span>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium">Stress Level</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentEntry.stress || 5}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, stress: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{currentEntry.stress}/10</span>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold">What activities did you do?</h3>
              <div className="grid grid-cols-3 gap-2">
                {activityOptions.map((activity) => (
                  <Button
                    key={activity}
                    variant={currentEntry.activities?.includes(activity) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleActivity(activity)}
                    className="capitalize"
                  >
                    {activity}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium">Journal Entry</label>
              <Textarea
                placeholder="How was your day? What's on your mind?"
                value={currentEntry.note || ''}
                onChange={(e) => setCurrentEntry({ ...currentEntry, note: e.target.value })}
                className="min-h-24"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Sleep Quality (last night)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentEntry.sleep || 5}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, sleep: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{currentEntry.sleep}/10</span>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium">Weather</label>
                <Select value={currentEntry.weather} onValueChange={(value:string) => setCurrentEntry({ ...currentEntry, weather: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select weather" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunny">☀️ Sunny</SelectItem>
                    <SelectItem value="cloudy">☁️ Cloudy</SelectItem>
                    <SelectItem value="rainy">🌧️ Rainy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold">What are you grateful for today?</h3>
              <div className="space-y-3">
                {[0, 1, 2].map((index) => (
                  <Input
                    key={index}
                    placeholder={`Gratitude ${index + 1}`}
                    value={currentEntry.gratitude?.[index] || ''}
                    onChange={(e) => updateGratitude(index, e.target.value)}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="mb-4 text-lg font-semibold">Goals for tomorrow</h3>
              <Input
                placeholder="What do you want to accomplish?"
                value={currentEntry.goals?.[0] || ''}
                onChange={(e) => setCurrentEntry({ 
                  ...currentEntry, 
                  goals: [e.target.value] 
                })}
              />
            </div>
            
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h4 className="mb-2 font-medium">Reflection Prompt</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {journalPrompts[Math.floor(Math.random() * journalPrompts.length)]?.question}
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return currentEntry.mood !== undefined;
      case 1:
        return currentEntry.emotions && currentEntry.emotions.length > 0;
      case 2:
        return true; // Optional step
      case 3:
        return true; // Optional step
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Daily Mood Journal</h2>
            <p className="text-gray-600 dark:text-gray-300">Track your emotions and reflect on your day</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="track" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="track">Track Today</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="track">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>{selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {steps.map((step, index) => (
                    <Button
                      key={index}
                      variant={index === activeStep ? 'default' : index < activeStep ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setActiveStep(index)}
                      className="w-10 h-10 p-0"
                    >
                      {index < activeStep ? '✓' : index + 1}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Step {activeStep + 1} of {steps.length}: {steps[activeStep].title}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                >
                  Previous
                </Button>
                
                {activeStep === steps.length - 1 ? (
                  <Button onClick={saveEntry} className="bg-gradient-to-r from-pink-500 to-rose-600">
                    Save Entry
                  </Button>
                ) : (
                  <Button
                    onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                    disabled={!canProceed()}
                  >
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date:any) => date && setSelectedDate(date)}
                  className="border rounded-md"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 7)
                    .map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center space-x-3">
                          {getMoodIcon(entry.mood)}
                          <div>
                            <p className="font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-500">{entry.emotions.slice(0, 3).join(', ')}</p>
                          </div>
                        </div>
                        <Badge className={`border ${getMoodColor(entry.mood)}`}>
                          {entry.mood}/10
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Average Mood</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {entries.length > 0 
                    ? (entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length).toFixed(1)
                    : '0'
                  }/10
                </div>
                <p className="text-sm text-gray-500">Last 30 days</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Most Common Emotions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {entries
                    .flatMap(entry => entry.emotions)
                    .reduce((acc: Record<string, number>, emotion) => {
                      acc[emotion] = (acc[emotion] || 0) + 1;
                      return acc;
                    }, {})
                    ? Object.entries(
                        entries
                          .flatMap(entry => entry.emotions)
                          .reduce((acc: Record<string, number>, emotion) => {
                            acc[emotion] = (acc[emotion] || 0) + 1;
                            return acc;
                          }, {})
                      )
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([emotion, count]) => (
                        <div key={emotion} className="flex justify-between">
                          <span className="capitalize">{emotion}</span>
                          <span className="text-gray-500">{count}</span>
                        </div>
                      ))
                    : <p className="text-gray-500">No data yet</p>
                  }
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {entries.length}
                </div>
                <p className="text-sm text-gray-500">Total entries logged</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
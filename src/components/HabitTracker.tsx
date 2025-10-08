import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Target, Trophy, Flame, Star, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Habit, HabitStats } from "../../types/habit";
import { HabitCard } from "./HabitCard";
import { 
  calculateHabitStats, 
  calculateStreak, 
  getRandomGradient, 
  getCategoryIcon, 
  generateCalendarDays,
  initializeDefaultHabits,
  saveHabitsToStorage,
  loadHabitsFromStorage
} from "../../utils/habitHelpers";

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newHabit, setNewHabit] = useState<Partial<Habit>>({
    frequency: 'daily',
    targetCount: 1,
    category: 'wellness'
  });
  const [stats, setStats] = useState<HabitStats>({ totalHabits: 0, activeStreaks: 0, completionRate: 0, totalCompletions: 0 });

  const calendarDays = generateCalendarDays(30);

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    const newStats = calculateHabitStats(habits);
    setStats(newStats);
  }, [habits]);

  const loadHabits = () => {
    const savedHabits = loadHabitsFromStorage();
    if (savedHabits) {
      setHabits(savedHabits);
    } else {
      const defaultHabits = initializeDefaultHabits();
      setHabits(defaultHabits);
      saveHabitsToStorage(defaultHabits);
    }
  };

  const saveHabits = (updatedHabits: Habit[]) => {
    saveHabitsToStorage(updatedHabits);
    setHabits(updatedHabits);
  };

  const createHabit = () => {
    if (!newHabit.name?.trim()) return;

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      description: newHabit.description || '',
      category: newHabit.category || 'wellness',
      frequency: newHabit.frequency || 'daily',
      targetCount: newHabit.targetCount || 1,
      color: getRandomGradient(),
      icon: getCategoryIcon(newHabit.category || 'wellness'),
      createdAt: new Date(),
      streak: 0,
      longestStreak: 0,
      completions: []
    };

    const updatedHabits = [...habits, habit];
    saveHabits(updatedHabits);
    setNewHabit({ frequency: 'daily', targetCount: 1, category: 'wellness' });
    setShowCreateDialog(false);
  };

  const toggleHabitCompletion = (habitId: string, date: string) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const existingIndex = habit.completions.findIndex(c => c.date === date);
        let updatedCompletions = [...habit.completions];
        
        if (existingIndex >= 0) {
          updatedCompletions[existingIndex] = {
            ...updatedCompletions[existingIndex],
            completed: !updatedCompletions[existingIndex].completed
          };
        } else {
          updatedCompletions.push({
            date,
            completed: true
          });
        }
        
        const streaks = calculateStreak(updatedCompletions);
        
        return {
          ...habit,
          completions: updatedCompletions,
          streak: streaks.current,
          longestStreak: Math.max(habit.longestStreak, streaks.longest)
        };
      }
      return habit;
    });
    
    saveHabits(updatedHabits);
  };

  const deleteHabit = (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      const updatedHabits = habits.filter(h => h.id !== habitId);
      saveHabits(updatedHabits);
    }
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
          <div className="flex items-center justify-center w-16 h-16 shadow-2xl bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl">
            <Target className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text">
              Habit Tracker
            </h2>
            <p className="text-gray-600 dark:text-gray-300">Build positive habits with beautiful streak visualization</p>
          </div>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="shadow-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Habit Name</label>
                <Input
                  placeholder="What habit do you want to build?"
                  value={newHabit.name || ''}
                  onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Add details about this habit..."
                  value={newHabit.description || ''}
                  onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Category</label>
                <Select value={newHabit.category} onValueChange={(value:string) => setNewHabit({...newHabit, category: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wellness">💚 Wellness</SelectItem>
                    <SelectItem value="fitness">💪 Fitness</SelectItem>
                    <SelectItem value="mindfulness">🧘 Mindfulness</SelectItem>
                    <SelectItem value="productivity">⚡ Productivity</SelectItem>
                    <SelectItem value="social">🤝 Social</SelectItem>
                    <SelectItem value="learning">📚 Learning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Frequency</label>
                <Select value={newHabit.frequency} onValueChange={(value:string) => setNewHabit({...newHabit, frequency: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3">
                <Button onClick={createHabit} className="flex-1">
                  Create Habit
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        className="grid grid-cols-2 gap-6 md:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {[
          { label: 'Total Habits', value: stats.totalHabits, icon: Target, color: 'rose' },
          { label: 'Active Streaks', value: stats.activeStreaks, icon: Flame, color: 'orange' },
          { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: Trophy, color: 'green' },
          { label: 'Total Completions', value: stats.totalCompletions, icon: Star, color: 'purple' }
        ].map((stat, index) => (
          <Card key={stat.label} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className={`text-3xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>
                {stat.value}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Habits List */}
      <div className="space-y-6">
        <AnimatePresence>
          {habits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardContent className="py-12 text-center">
                  <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-xl font-semibold">No habits yet</h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-300">
                    Start building positive habits to improve your mental wellness
                  </p>
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-gradient-to-r from-rose-500 to-pink-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Habit
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {habits.map((habit, index) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  calendarDays={calendarDays}
                  onToggleCompletion={toggleHabitCompletion}
                  onDelete={deleteHabit}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Motivational Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-gradient-to-br from-rose-50/80 to-pink-50/80 dark:from-rose-900/50 dark:to-pink-900/50 border-rose-200/50 dark:border-rose-700/50 backdrop-blur-lg">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 shadow-xl bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Building Better Habits</h3>
            <p className="max-w-2xl mx-auto mb-4 text-gray-600 dark:text-gray-300">
              Small, consistent actions lead to remarkable transformations. Every day you stick to your habits, 
              you're investing in a better version of yourself.
            </p>
            <Badge className="px-4 py-2 text-white bg-gradient-to-r from-rose-500 to-pink-600">
              Keep going! You're doing amazing! 🌟
            </Badge>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
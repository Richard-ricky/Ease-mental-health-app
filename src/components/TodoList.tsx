import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, Calendar, Heart, CheckCircle, Circle, Trash2, Star, Bell, Clock, Zap, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { requestNotificationPermission } from "../../utils/ai/functionCalling";

// --- Types (kept the same as your original file) ---
interface TodoItem {
  id: string;
  title: string;
  description?: string;
  category: 'wellness' | 'personal' | 'work' | 'social' | 'self-care';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  moodImpact?: 'positive' | 'neutral' | 'challenging';
  points: number;
  isWellnessGoal: boolean;
  streak?: number;
  reminderTime?: string;
  /** Added: reminder frequency for UI form (once, daily, weekly) */
  reminderFrequency?: 'once' | 'daily' | 'weekly';
  createdBy?: 'user' | 'ai';
  isActive?: boolean;
}

interface WellnessGoal {
  id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetDays: number;
  completedDays: number;
  category: string;
  icon: string;
}

interface TodoListProps {
  onSectionChange?: (section: string) => void;
}

export function TodoList({ onSectionChange }: TodoListProps = {}) {
  // --- State (preserved your original state names) ---
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [wellnessGoals, setWellnessGoals] = useState<WellnessGoal[]>([]);
  const [newTodo, setNewTodo] = useState<Partial<TodoItem>>({
    category: 'personal',
    priority: 'medium',
    moodImpact: 'neutral',
    isWellnessGoal: false,
    points: 1,
    reminderFrequency: 'once'
  });
  const [showNewTodo, setShowNewTodo] = useState(false);
  const [filter, setFilter] = useState('all');
  const [totalPoints, setTotalPoints] = useState(0);
  const [weeklyStreak, setWeeklyStreak] = useState(0);
  const [reminders, setReminders] = useState<any[]>([]);
  const [showAICreated, setShowAICreated] = useState(false);

  // small helper to support "Quick Add" in the header
  const [quickAddTitle, setQuickAddTitle] = useState('');

  useEffect(() => {
    loadTodos();
    loadWellnessGoals();
    loadReminders();
    calculateStats();
    requestNotificationPermission();
    setupReminderNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    calculateStats();
    saveTodos(todos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todos]);

  useEffect(() => {
    setupReminderNotifications();
  }, [reminders]);

  // --- Loaders (kept same logic) ---
  const loadTodos = () => {
    const saved = localStorage.getItem('ease-todos');
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to parse saved todos', e);
      }
    }
  };

  const loadReminders = () => {
    const saved = localStorage.getItem('ease-reminders');
    if (saved) {
      try {
        setReminders(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to parse reminders', e);
      }
    }
  };

  const loadWellnessGoals = () => {
    const defaultGoals: WellnessGoal[] = [
      {
        id: '1',
        title: 'Daily Mood Check-in',
        description: 'Track your mood and emotions',
        frequency: 'daily',
        targetDays: 7,
        completedDays: 0,
        category: 'Mental Health',
        icon: '😊'
      },
      {
        id: '2',
        title: 'Gratitude Practice',
        description: 'Write down 3 things you\'re grateful for',
        frequency: 'daily',
        targetDays: 7,
        completedDays: 0,
        category: 'Mindfulness',
        icon: '🙏'
      },
      {
        id: '3',
        title: 'Mindful Breathing',
        description: '5-minute breathing exercise',
        frequency: 'daily',
        targetDays: 7,
        completedDays: 0,
        category: 'Wellness',
        icon: '🌬️'
      },
      {
        id: '4',
        title: 'Connect with Someone',
        description: 'Meaningful conversation with friend/family',
        frequency: 'weekly',
        targetDays: 3,
        completedDays: 0,
        category: 'Social',
        icon: '💬'
      }
    ];

    const saved = localStorage.getItem('ease-wellness-goals');
    if (saved) {
      try {
        setWellnessGoals(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to parse wellness goals', e);
        setWellnessGoals(defaultGoals);
      }
    } else {
      setWellnessGoals(defaultGoals);
    }
  };

  // --- Save function: ensure persistence and update state ---
  const saveTodos = (updatedTodos: TodoItem[]) => {
    localStorage.setItem('ease-todos', JSON.stringify(updatedTodos));
    setTodos(updatedTodos);
  };

  // --- Notification scheduling (kept your logic but made robust) ---
  const setupReminderNotifications = () => {
    // NOTE: this function schedules a one-off setTimeout per reminder that's active and within next 24h
    reminders.forEach(reminder => {
      if (!reminder.isActive) return;

      const now = new Date();
      const reminderTime = new Date();

      if (reminder.time) {
        const [hours, minutes] = reminder.time.split(':');
        reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // If the time has passed today, schedule for tomorrow
        if (reminderTime <= now) {
          reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const timeUntilReminder = reminderTime.getTime() - now.getTime();

        if (timeUntilReminder > 0 && timeUntilReminder < 24 * 60 * 60 * 1000) {
          setTimeout(() => {
            showNotification(reminder);
          }, timeUntilReminder);
        }
      }
    });
  };

  const showNotification = (reminder: any) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(reminder.title, {
          body: reminder.message || 'Time for your scheduled activity',
          icon: '/icon-192.png',
          badge: '/icon-192.png'
        });
      } catch (e) {
        console.warn('Notification failed', e);
      }
    }

    toast.success(`⏰ Reminder: ${reminder.title}`, {
      description: reminder.message || 'Time for your scheduled activity'
    });
  };

  // --- Add todo (kept logic, improved a couple UX bits) ---
  const getPriorityPoints = (priority: string) => {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  };

  const addTodo = () => {
    if (!newTodo.title || !newTodo.title.trim()) {
      toast.error('Please enter a title for the task');
      return;
    }

    const todo: TodoItem = {
      id: Date.now().toString(),
      title: newTodo.title!.trim(),
      description: newTodo.description,
      category: (newTodo.category as TodoItem['category']) || 'personal',
      priority: (newTodo.priority as TodoItem['priority']) || 'medium',
      dueDate: newTodo.dueDate,
      completed: false,
      moodImpact: (newTodo.moodImpact as TodoItem['moodImpact']) || 'neutral',
      points: newTodo.points ?? getPriorityPoints(newTodo.priority || 'medium'),
      isWellnessGoal: !!newTodo.isWellnessGoal,
      reminderTime: newTodo.reminderTime,
      reminderFrequency: newTodo.reminderFrequency || 'once',
      createdBy: 'user',
      isActive: true
    };

    const updatedTodos = [...todos, todo];
    saveTodos(updatedTodos);

    // Schedule reminder if specified
    if (newTodo.reminderTime) {
      const reminder = {
        id: Date.now().toString() + '_reminder',
        title: `Reminder: ${todo.title}`,
        message: todo.description || `Time to work on: ${todo.title}`,
        time: newTodo.reminderTime,
        frequency: newTodo.reminderFrequency || 'once',
        type: 'general',
        createdAt: new Date().toISOString(),
        isActive: true,
        linkedTodoId: todo.id
      };

      const updatedReminders = [...reminders, reminder];
      setReminders(updatedReminders);
      localStorage.setItem('ease-reminders', JSON.stringify(updatedReminders));

      toast.success(`✅ Todo added with reminder set for ${newTodo.reminderTime}`);
    } else {
      toast.success(`✅ Todo "${todo.title}" added successfully`);
    }

    // reset newTodo but keep defaults
    setNewTodo({
      category: 'personal',
      priority: 'medium',
      moodImpact: 'neutral',
      isWellnessGoal: false,
      points: 1,
      reminderFrequency: 'once'
    });
    setShowNewTodo(false);
  };

  // --- Toggle and delete kept unchanged ---
  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        const completed = !todo.completed;
        return {
          ...todo,
          completed,
          completedAt: completed ? new Date().toISOString() : undefined
        };
      }
      return todo;
    });
    saveTodos(updatedTodos);
  };

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    saveTodos(updatedTodos);
  };

  // --- Stats calculation preserved ---
  const calculateStats = () => {
    const completedTodos = todos.filter(todo => todo.completed);
    const points = completedTodos.reduce((sum, todo) => sum + todo.points, 0);
    setTotalPoints(points);

    // Calculate weekly streak (simplified)
    const thisWeek = completedTodos.filter(todo => {
      if (!todo.completedAt) return false;
      const completed = new Date(todo.completedAt);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      return completed >= weekStart;
    });
    setWeeklyStreak(thisWeek.length);
  };

  // --- Category & priority coloring helpers kept ---
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      wellness: 'bg-green-100 text-green-700 border-green-200',
      'self-care': 'bg-pink-100 text-pink-700 border-pink-200',
      personal: 'bg-blue-100 text-blue-700 border-blue-200',
      work: 'bg-orange-100 text-orange-700 border-orange-200',
      social: 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  // --- Filtering and derived values preserved ---
  const filteredTodos = filter === 'all'
    ? todos
    : filter === 'completed'
      ? todos.filter(todo => todo.completed)
      : filter === 'pending'
        ? todos.filter(todo => !todo.completed)
        : filter === 'ai-created'
          ? todos.filter(todo => todo.createdBy === 'ai')
          : todos.filter(todo => todo.category === filter);

  const completionRate = todos.length > 0 ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0;
  const aiCreatedCount = todos.filter(t => t.createdBy === 'ai').length;

  // --- Helper UI: quick add action (keeps original addTodo logic) ---
  const quickAdd = () => {
    if (!quickAddTitle.trim()) return toast.error('Please type a quick task title');
    setNewTodo(prev => ({ ...prev, title: quickAddTitle, category: 'personal' }));
    setQuickAddTitle('');
    setShowNewTodo(true);
  };

  // --- Small subcomponent: Live preview used inside modal ---
  const TaskPreview = ({todo}: {todo: Partial<TodoItem>}) => (
    <Card className="shadow-md">
      <CardContent>
        <div className="flex items-start space-x-3">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>{todo.title || 'Task title'}</h4>
              <div className="flex items-center space-x-2">
                {todo.isWellnessGoal && <Heart className="w-4 h-4 text-pink-500" />}
                <Star className={`w-4 h-4 ${getPriorityColor(todo.priority || 'medium')}`} />
              </div>
            </div>
            {todo.description && <p className="mt-2 text-sm text-gray-600">{todo.description}</p>}
            <div className="flex items-center gap-2 mt-3">
              <Badge className={getCategoryColor(todo.category || 'personal')} variant="outline">{todo.category || 'personal'}</Badge>
              <Badge variant="outline" className="text-xs">{(todo.points ?? getPriorityPoints(todo.priority || 'medium'))} pts</Badge>
              {todo.moodImpact && <Badge variant="outline" className="text-xs">{todo.moodImpact}</Badge>}
            </div>
            {todo.dueDate && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs"><Calendar className="w-3 h-3 mr-1" /> {new Date(todo.dueDate).toLocaleDateString()}</Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Smart Todo List</h2>
            <p className="text-gray-600">Organize tasks and boost your mental wellness</p>
          </div>
        </div>

        {/* Quick add + modal trigger */}
        <div className="flex items-center space-x-3">
          <div className="items-center hidden px-3 py-1 space-x-2 bg-white rounded-lg shadow-sm sm:flex dark:bg-slate-800">
            <Input
              placeholder="Quick add a task..."
              value={quickAddTitle}
              onChange={(e: any) => setQuickAddTitle(e.target.value)}
              onKeyDown={(e: any) => { if (e.key === 'Enter') quickAdd(); }}
              className="w-60"
            />
            <Button size="sm" onClick={quickAdd} className="bg-indigo-500 hover:bg-indigo-600"><Plus className="w-4 h-4 mr-2" />Add</Button>
          </div>

          <Dialog open={showNewTodo} onOpenChange={setShowNewTodo}>
            <DialogTrigger asChild>
              <Button className="flex items-center bg-gradient-to-r from-indigo-500 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>

            {/* Modern full-width modal with a two-column layout: form | preview */}
            <DialogContent className="w-full max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">Task Title</label>
                    <Input
                      placeholder="What would you like to accomplish?"
                      value={newTodo.title || ''}
                      onChange={(e: any) => setNewTodo({...newTodo, title: e.target.value})}
                    />
                    {!newTodo.title && <p className="mt-1 text-xs text-red-500">Title is required</p>}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Add details about this task..."
                      value={newTodo.description || ''}
                      onChange={(e: any) => setNewTodo({...newTodo, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Category</label>
                      <Select value={newTodo.category as string} onValueChange={(value: string) => setNewTodo({...newTodo, category: value as any})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wellness">Wellness</SelectItem>
                          <SelectItem value="self-care">Self-Care</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium">Priority</label>
                      <Select value={newTodo.priority as string} onValueChange={(value: string) => {
                        const pts = getPriorityPoints(value);
                        setNewTodo({...newTodo, priority: value as any, points: pts});
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center justify-between mt-2">
                        <small className="text-xs text-gray-500">Points: <strong>{newTodo.points ?? getPriorityPoints(newTodo.priority || 'medium')}</strong></small>
                        <small className={`text-xs ${getPriorityColor(newTodo.priority || 'medium')}`}>Priority preview</small>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Due Date</label>
                      <Input
                        type="date"
                        value={newTodo.dueDate || ''}
                        onChange={(e: any) => setNewTodo({...newTodo, dueDate: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium">Mood Impact</label>
                      <div className="flex items-center gap-2">
                        <button
                          className={`px-3 py-1 rounded-md text-sm ${newTodo.moodImpact === 'positive' ? 'ring-2 ring-green-400' : 'ring-0'}`}
                          onClick={() => setNewTodo({...newTodo, moodImpact: 'positive'})}
                          type="button"
                        >
                          ✨ Positive
                        </button>

                        <button
                          className={`px-3 py-1 rounded-md text-sm ${newTodo.moodImpact === 'neutral' ? 'ring-2 ring-slate-400' : 'ring-0'}`}
                          onClick={() => setNewTodo({...newTodo, moodImpact: 'neutral'})}
                          type="button"
                        >
                          😐 Neutral
                        </button>

                        <button
                          className={`px-3 py-1 rounded-md text-sm ${newTodo.moodImpact === 'challenging' ? 'ring-2 ring-orange-400' : 'ring-0'}`}
                          onClick={() => setNewTodo({...newTodo, moodImpact: 'challenging'})}
                          type="button"
                        >
                          💪 Challenging
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={!!newTodo.isWellnessGoal}
                      onCheckedChange={(checked: any) => setNewTodo({...newTodo, isWellnessGoal: !!checked})}
                    />
                    <label className="text-sm">Mark as wellness goal</label>
                  </div>

                  <div className="grid items-center grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Set Reminder</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={newTodo.reminderTime || ''}
                          onChange={(e: any) => setNewTodo({...newTodo, reminderTime: e.target.value})}
                        />

                        <Select value={newTodo.reminderFrequency || 'once'} onValueChange={(value: string) => setNewTodo({...newTodo, reminderFrequency: value as any})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">Once</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium">Points (manual override)</label>
                      <Input
                        type="number"
                        min={1}
                        value={(newTodo.points ?? getPriorityPoints(newTodo.priority || 'medium')).toString()}
                        onChange={(e: any) => setNewTodo({...newTodo, points: Math.max(1, parseInt(e.target.value || '1'))})}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button onClick={addTodo} className="flex-1" disabled={!newTodo.title || !newTodo.title.trim()}>
                      Add Task
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewTodo(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>

                {/* Right column: live preview + helpful hints */}
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Preview</h4>
                    <TaskPreview todo={newTodo} />
                  </div>

                  <Card>
                    <CardContent>
                      <h4 className="font-medium">Tips</h4>
                      <ul className="mt-2 ml-5 space-y-1 text-sm text-gray-600 list-disc">
                        <li>Use reminders to build consistent habits — Sage can nudge you.</li>
                        <li>Mark important habits as wellness goals to track progress over time.</li>
                        <li>Change priority to automatically adjust points.</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI-created todos notification (unchanged) */}
      <AnimatePresence>
        {aiCreatedCount > 0 && !showAICreated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-purple-800 dark:text-purple-200">
                      AI Assistant Activity
                    </h4>
                    <p className="text-sm text-purple-600 dark:text-purple-300">
                      Sage has created {aiCreatedCount} todo{aiCreatedCount !== 1 ? 's' : ''} to help with your goals
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setFilter('ai-created')}
                      className="text-white bg-purple-600 hover:bg-purple-700"
                    >
                      View AI Todos
                    </Button>

                    {/* Dismiss button so the setter is actually used; fixes unused-variable warning */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAICreated(true)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Dashboard (unchanged styling, preserved values) */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{totalPoints}</div>
            <p className="text-sm text-gray-600">Points Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{weeklyStreak}</div>
            <p className="text-sm text-gray-600">Weekly Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{completionRate}%</div>
            <p className="text-sm text-gray-600">Completion Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{todos.filter(t => !t.completed).length}</div>
            <p className="text-sm text-gray-600">Pending Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{reminders.filter(r => r.isActive).length}</div>
            <p className="text-sm text-gray-600">Active Reminders</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="wellness">Wellness Goals</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'pending', 'completed', 'ai-created', 'wellness', 'self-care', 'personal', 'work', 'social'].map(filterOption => (
              <Button
                key={filterOption}
                variant={filter === filterOption ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterOption)}
                className="capitalize"
              >
                {filterOption}
              </Button>
            ))}
          </div>

          {/* Todo List (kept core layout, slight polish) */}
          <div className="space-y-3">
            {filteredTodos.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Circle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold">No tasks found</h3>
                  <p className="text-gray-600">Create your first task to get started!</p>
                </CardContent>
              </Card>
            ) : (
              filteredTodos.map((todo, index) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`transition-all duration-200 ${todo.completed ? 'bg-gray-50 opacity-75' : 'hover:shadow-md'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodo(todo.id)}
                          className="mt-1"
                        />

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                              {todo.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {todo.isWellnessGoal && (
                                <Heart className="w-4 h-4 text-pink-500" />
                              )}
                              <Star className={`w-4 h-4 ${getPriorityColor(todo.priority)}`} />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteTodo(todo.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {todo.description && (
                            <p className={`text-sm text-gray-600 ${todo.completed ? 'line-through' : ''}`}>
                              {todo.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={getCategoryColor(todo.category)} variant="outline">
                              {todo.category}
                            </Badge>

                            <Badge variant="outline" className="text-xs">
                              {todo.points} pts
                            </Badge>

                            {todo.moodImpact && (
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  todo.moodImpact === 'positive' ? 'border-green-200 text-green-700' :
                                  todo.moodImpact === 'challenging' ? 'border-orange-200 text-orange-700' :
                                  'border-gray-200 text-gray-700'
                                }`}
                              >
                                {todo.moodImpact === 'positive' ? '✨' : 
                                  todo.moodImpact === 'challenging' ? '💪' : '😐'} {todo.moodImpact}
                              </Badge>
                            )}

                            {todo.dueDate && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(todo.dueDate).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="wellness">
          <div className="grid gap-4 md:grid-cols-2">
            {wellnessGoals.map((goal) => (
              <Card key={goal.id} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <p className="text-lg">{goal.title}</p>
                      <p className="text-sm font-normal text-gray-600">{goal.description}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium">{goal.completedDays}/{goal.targetDays}</span>
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 transition-all duration-300 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
                      style={{ width: `${Math.min((goal.completedDays / goal.targetDays) * 100, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{goal.category}</Badge>
                    <Badge variant="outline" className="capitalize">{goal.frequency}</Badge>
                  </div>

                  <Button 
                    className="w-full" 
                    variant={goal.completedDays >= goal.targetDays ? "outline" : "default"}
                    disabled={goal.completedDays >= goal.targetDays}
                  >
                    {goal.completedDays >= goal.targetDays ? 'Completed!' : 'Mark as Done Today'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reminders">
          <div className="space-y-4">
            {reminders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold">No reminders set</h3>
                  <p className="text-gray-600">Create todos with reminder times or let Sage schedule reminders for you!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {reminders.filter(r => r.isActive).map((reminder, index) => (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="transition-all duration-200 hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2 space-x-3">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600">
                                <Bell className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium">{reminder.title}</h4>
                                <p className="text-sm text-gray-600">{reminder.message}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 ml-13">
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {reminder.time}
                              </Badge>

                              <Badge variant="outline" className="text-xs capitalize">
                                {reminder.frequency}
                              </Badge>

                              <Badge variant="outline" className={`text-xs ${
                                reminder.type === 'medication' ? 'border-red-200 text-red-700' :
                                reminder.type === 'therapy' ? 'border-blue-200 text-blue-700' :
                                reminder.type === 'exercise' ? 'border-green-200 text-green-700' :
                                reminder.type === 'meditation' ? 'border-purple-200 text-purple-700' :
                                'border-gray-200 text-gray-700'
                              }`}>
                                {reminder.type}
                              </Badge>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const updatedReminders = reminders.map(r => 
                                r.id === reminder.id ? { ...r, isActive: false } : r
                              );
                              setReminders(updatedReminders);
                              localStorage.setItem('ease-reminders', JSON.stringify(updatedReminders));
                              toast.success("Reminder disabled");
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Quick Add Reminder (kept with slight visual polish) */}
            <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-orange-800 dark:text-orange-200">Need a reminder?</h4>
                    <p className="text-sm text-orange-600 dark:text-orange-300">Ask Sage to schedule reminders for you, or add todos with reminder times!</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onSectionChange?.('ai-chat')}
                    className="text-white bg-orange-600 hover:bg-orange-700"
                  >
                    Ask Sage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TodoList;
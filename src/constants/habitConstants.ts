import { Habit } from "../../types/habit";

export const HABIT_GRADIENTS = [
  'from-purple-500 to-indigo-600',
  'from-green-500 to-emerald-600',
  'from-rose-500 to-pink-600',
  'from-blue-500 to-cyan-600',
  'from-orange-500 to-red-600',
  'from-yellow-500 to-orange-600',
  'from-teal-500 to-blue-600',
  'from-indigo-500 to-purple-600'
];

export const CATEGORY_ICONS: Record<string, string> = {
  wellness: '💚',
  fitness: '💪',
  mindfulness: '🧘',
  productivity: '⚡',
  social: '🤝',
  learning: '📚'
};

export const CATEGORY_COLORS: Record<string, string> = {
  wellness: 'bg-green-100 text-green-700 border-green-200',
  fitness: 'bg-orange-100 text-orange-700 border-orange-200',
  mindfulness: 'bg-purple-100 text-purple-700 border-purple-200',
  productivity: 'bg-blue-100 text-blue-700 border-blue-200',
  social: 'bg-pink-100 text-pink-700 border-pink-200',
  learning: 'bg-indigo-100 text-indigo-700 border-indigo-200'
};

export const DEFAULT_HABITS: Omit<Habit, 'id' | 'createdAt'>[] = [
  {
    name: 'Morning Meditation',
    description: '10 minutes of mindfulness practice',
    category: 'mindfulness',
    frequency: 'daily',
    targetCount: 1,
    color: 'from-purple-500 to-indigo-600',
    icon: '🧘',
    streak: 5,
    longestStreak: 12,
    completions: []
  },
  {
    name: 'Daily Exercise',
    description: '30 minutes of physical activity',
    category: 'fitness',
    frequency: 'daily',
    targetCount: 1,
    color: 'from-green-500 to-emerald-600',
    icon: '💪',
    streak: 3,
    longestStreak: 15,
    completions: []
  },
  {
    name: 'Gratitude Journal',
    description: 'Write 3 things I\'m grateful for',
    category: 'wellness',
    frequency: 'daily',
    targetCount: 1,
    color: 'from-rose-500 to-pink-600',
    icon: '🙏',
    streak: 8,
    longestStreak: 20,
    completions: []
  },
  {
    name: 'Read for Learning',
    description: 'Read for at least 20 minutes',
    category: 'learning',
    frequency: 'daily',
    targetCount: 1,
    color: 'from-blue-500 to-cyan-600',
    icon: '📚',
    streak: 2,
    longestStreak: 8,
    completions: []
  }
];
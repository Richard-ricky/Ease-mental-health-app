export interface Habit {
  id: string;
  name: string;
  description: string;
  category: 'wellness' | 'fitness' | 'mindfulness' | 'productivity' | 'social' | 'learning';
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  color: string;
  icon: string;
  createdAt: Date;
  streak: number;
  longestStreak: number;
  completions: HabitCompletion[];
}

export interface HabitCompletion {
  date: string;
  completed: boolean;
  note?: string;
}

export interface HabitStats {
  totalHabits: number;
  activeStreaks: number;
  completionRate: number;
  totalCompletions: number;
}

export interface CalendarDay {
  date: string;
  dayOfWeek: number;
  dayOfMonth: number;
}
import { Habit, HabitStats, CalendarDay, HabitCompletion } from "../types/habit";
import { HABIT_GRADIENTS, CATEGORY_ICONS, DEFAULT_HABITS } from "../src/constants/habitConstants";

export const generateMockCompletions = (days: number, successRate: number): HabitCompletion[] => {
  const completions = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    completions.push({
      date: date.toISOString().split('T')[0],
      completed: Math.random() < successRate,
      note: Math.random() < 0.3 ? 'Felt great today!' : undefined
    });
  }
  return completions;
};

export const calculateHabitStats = (habits: Habit[]): HabitStats => {
  const totalHabits = habits.length;
  const activeStreaks = habits.filter(h => h.streak > 0).length;
  
  let totalPossible = 0;
  let totalCompleted = 0;
  
  habits.forEach(habit => {
    const recentCompletions = habit.completions.slice(-30);
    totalPossible += recentCompletions.length;
    totalCompleted += recentCompletions.filter(c => c.completed).length;
  });
  
  const completionRate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
  const totalCompletions = habits.reduce((sum, habit) => 
    sum + habit.completions.filter(c => c.completed).length, 0
  );

  return {
    totalHabits,
    activeStreaks,
    completionRate: Math.round(completionRate),
    totalCompletions
  };
};

export const calculateStreak = (completions: HabitCompletion[]): { current: number; longest: number } => {
  const sortedCompletions = completions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Calculate current streak from today backwards
  for (const completion of sortedCompletions) {
    if (completion.completed) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Calculate longest streak
  for (const completion of sortedCompletions) {
    if (completion.completed) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  
  return { current: currentStreak, longest: longestStreak };
};

export const getRandomGradient = (): string => {
  return HABIT_GRADIENTS[Math.floor(Math.random() * HABIT_GRADIENTS.length)];
};

export const getCategoryIcon = (category: string): string => {
  return CATEGORY_ICONS[category] || '⭐';
};

export const generateCalendarDays = (dayCount: number = 30): CalendarDay[] => {
  const days = [];
  for (let i = dayCount - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push({
      date: date.toISOString().split('T')[0],
      dayOfWeek: date.getDay(),
      dayOfMonth: date.getDate()
    });
  }
  return days;
};

export const getCompletionForDate = (habit: Habit, date: string): HabitCompletion | undefined => {
  return habit.completions.find(c => c.date === date);
};

export const initializeDefaultHabits = (): Habit[] => {
  return DEFAULT_HABITS.map((habit, index) => ({
    ...habit,
    id: (index + 1).toString(),
    createdAt: new Date(),
    completions: generateMockCompletions(30, 0.7 + index * 0.1)
  }));
};

export const saveHabitsToStorage = (habits: Habit[]): void => {
  localStorage.setItem('habit-tracker-data', JSON.stringify(habits));
};

export const loadHabitsFromStorage = (): Habit[] | null => {
  const saved = localStorage.getItem('habit-tracker-data');
  if (saved) {
    try {
      return JSON.parse(saved).map((habit: any) => ({
        ...habit,
        createdAt: new Date(habit.createdAt)
      }));
    } catch (error) {
      console.error('Error loading habits:', error);
      return null;
    }
  }
  return null;
};
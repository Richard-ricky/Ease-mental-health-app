import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CheckCircle, Flame, Trophy, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Habit, CalendarDay } from "../../types/habit";
import { CATEGORY_COLORS } from "../constants/habitConstants";
import { getCompletionForDate } from "../../utils/habitHelpers";

interface HabitCardProps {
  habit: Habit;
  calendarDays: CalendarDay[];
  onToggleCompletion: (habitId: string, date: string) => void;
  onDelete: (habitId: string) => void;
}

export function HabitCard({ habit, calendarDays, onToggleCompletion, onDelete }: HabitCardProps) {
  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const thisMonthCompletions = habit.completions.filter(c => 
    c.completed && new Date(c.date).getMonth() === new Date().getMonth()
  ).length;

  const thisMonthDays = calendarDays.filter(d => 
    new Date(d.date).getMonth() === new Date().getMonth()
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
    >
      <Card className="transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${habit.color} rounded-2xl flex items-center justify-center shadow-lg text-2xl`}>
                {habit.icon}
              </div>
              <div>
                <CardTitle className="text-xl">{habit.name}</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">{habit.description}</p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge className={`border ${getCategoryColor(habit.category)}`}>
                    {habit.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {habit.frequency}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center mb-1 space-x-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-lg font-bold text-orange-600">{habit.streak}</span>
                </div>
                <p className="text-xs text-gray-500">Current streak</p>
              </div>
              <div className="text-right">
                <div className="flex items-center mb-1 space-x-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-lg font-bold text-yellow-600">{habit.longestStreak}</span>
                </div>
                <p className="text-xs text-gray-500">Best streak</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(habit.id)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Calendar Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Last 30 days</h4>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-sm" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-200 rounded-sm dark:bg-gray-600" />
                  <span>Missed</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-10 gap-1">
              {calendarDays.map((day, dayIndex) => {
                const completion = getCompletionForDate(habit, day.date);
                const isToday = day.date === new Date().toISOString().split('T')[0];
                const isCompleted = completion?.completed || false;
                
                return (
                  <motion.button
                    key={day.date}
                    onClick={() => onToggleCompletion(habit.id, day.date)}
                    className={`
                      w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200 relative
                      ${isCompleted 
                        ? `bg-gradient-to-br ${habit.color} text-white shadow-lg` 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }
                      ${isToday ? 'ring-2 ring-blue-400' : ''}
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: dayIndex * 0.02 }}
                  >
                    {day.dayOfMonth}
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>This month's progress</span>
              <span className="font-medium">
                {thisMonthCompletions} / {thisMonthDays}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
              <motion.div 
                className={`h-2 rounded-full bg-gradient-to-r ${habit.color}`}
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(thisMonthCompletions / thisMonthDays) * 100}%` 
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
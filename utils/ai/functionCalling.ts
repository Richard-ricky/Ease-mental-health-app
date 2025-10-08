// AI Function Calling System for Ease Mental Health App

export interface AIFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface FunctionCall {
  name: string;
  arguments: Record<string, any>;
}

export interface AIActionResult {
  success: boolean;
  message: string;
  data?: any;
}

// Available AI functions
export const AVAILABLE_FUNCTIONS: AIFunction[] = [
  {
    name: "navigate_to_section",
    description: "Navigate the user to a specific section of the app",
    parameters: {
      type: "object",
      properties: {
        section: {
          type: "string",
          enum: ["home", "mood", "journal", "ai-chat", "voice-journal", "community", "assessments", "support", "therapists", "habits", "wellness", "todos", "progress", "settings"],
          description: "The section to navigate to"
        }
      },
      required: ["section"]
    }
  },
  {
    name: "add_todo",
    description: "Add a new todo item for the user",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the todo item"
        },
        description: {
          type: "string",
          description: "Optional description of the todo item"
        },
        category: {
          type: "string",
          enum: ["wellness", "personal", "work", "social", "self-care"],
          description: "The category of the todo item"
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "The priority level of the todo item"
        },
        dueDate: {
          type: "string",
          description: "Due date in YYYY-MM-DD format"
        },
        reminderTime: {
          type: "string",
          description: "Reminder time in HH:MM format"
        },
        moodImpact: {
          type: "string",
          enum: ["positive", "neutral", "challenging"],
          description: "Expected mood impact of completing this task"
        },
        isWellnessGoal: {
          type: "boolean",
          description: "Whether this is a wellness-related goal"
        }
      },
      required: ["title"]
    }
  },
  {
    name: "book_therapist_appointment",
    description: "Help the user book an appointment with a therapist",
    parameters: {
      type: "object",
      properties: {
        therapistId: {
          type: "string",
          description: "The ID of the therapist to book with"
        },
        preferredDate: {
          type: "string",
          description: "Preferred date in YYYY-MM-DD format"
        },
        preferredTime: {
          type: "string",
          description: "Preferred time in HH:MM format"
        },
        sessionType: {
          type: "string",
          enum: ["video", "phone", "in-person"],
          description: "Type of therapy session"
        },
        concerns: {
          type: "string",
          description: "Main concerns or topics to discuss"
        }
      },
      required: ["preferredDate"]
    }
  },
  {
    name: "track_mood",
    description: "Help the user track their current mood",
    parameters: {
      type: "object",
      properties: {
        mood: {
          type: "string",
          enum: ["very-happy", "happy", "neutral", "sad", "very-sad", "anxious", "excited", "calm", "angry", "overwhelmed"],
          description: "The user's current mood"
        },
        intensity: {
          type: "number",
          minimum: 1,
          maximum: 10,
          description: "Intensity of the mood from 1-10"
        },
        note: {
          type: "string",
          description: "Optional note about the mood"
        }
      },
      required: ["mood"]
    }
  },
  {
    name: "create_wellness_plan",
    description: "Create a personalized wellness plan for the user",
    parameters: {
      type: "object",
      properties: {
        goals: {
          type: "array",
          items: { type: "string" },
          description: "List of wellness goals"
        },
        duration: {
          type: "string",
          enum: ["1-week", "2-weeks", "1-month", "3-months"],
          description: "Duration of the wellness plan"
        },
        focus: {
          type: "string",
          enum: ["anxiety", "depression", "stress", "sleep", "relationships", "self-esteem", "general-wellness"],
          description: "Main focus area for the plan"
        }
      },
      required: ["goals", "focus"]
    }
  },
  {
    name: "schedule_reminder",
    description: "Schedule a reminder or notification for the user",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Title of the reminder"
        },
        message: {
          type: "string",
          description: "Reminder message"
        },
        time: {
          type: "string",
          description: "Time for the reminder in HH:MM format"
        },
        frequency: {
          type: "string",
          enum: ["once", "daily", "weekly", "monthly"],
          description: "How often to repeat the reminder"
        },
        type: {
          type: "string",
          enum: ["medication", "therapy", "exercise", "meditation", "journal", "self-care", "general"],
          description: "Type of reminder"
        }
      },
      required: ["title", "time"]
    }
  },
  {
    name: "start_meditation",
    description: "Start a guided meditation session",
    parameters: {
      type: "object",
      properties: {
        duration: {
          type: "number",
          description: "Duration in minutes"
        },
        type: {
          type: "string",
          enum: ["breathing", "mindfulness", "body-scan", "loving-kindness", "anxiety-relief", "sleep"],
          description: "Type of meditation"
        }
      },
      required: ["type"]
    }
  },
  {
    name: "create_journal_prompt",
    description: "Create a personalized journal prompt for the user",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          enum: ["gratitude", "reflection", "goals", "emotions", "relationships", "challenges", "growth"],
          description: "Topic for the journal prompt"
        },
        mood: {
          type: "string",
          description: "User's current mood to tailor the prompt"
        }
      },
      required: ["topic"]
    }
  }
];

// Function to extract function calls from AI response
export function extractFunctionCalls(text: string): FunctionCall[] {
  const functionCalls: FunctionCall[] = [];
  
  // Look for function call patterns like [FUNCTION:function_name:{"param":"value"}]
  const functionPattern = /\[FUNCTION:([^:]+):(\{[^}]*\})\]/g;
  let match;
  
  while ((match = functionPattern.exec(text)) !== null) {
    try {
      const functionName = match[1];
      const args = JSON.parse(match[2]);
      functionCalls.push({ name: functionName, arguments: args });
    } catch (error) {
      console.error('Error parsing function call:', error);
    }
  }
  
  return functionCalls;
}

// Function to generate system prompt with available functions
export function generateSystemPromptWithFunctions(): string {
  const functionsDescription = AVAILABLE_FUNCTIONS.map(func => 
    `- ${func.name}: ${func.description}`
  ).join('\n');

  return `You are Sage, an AI mental health companion for the Ease app. You can help users with their mental wellness journey and perform actions within the app.

Available Functions:
${functionsDescription}

When you want to perform an action, use this format in your response:
[FUNCTION:function_name:{"parameter":"value"}]

For example:
- To add a todo: [FUNCTION:add_todo:{"title":"Take a 10-minute walk","category":"wellness","priority":"medium"}]
- To navigate to mood tracker: [FUNCTION:navigate_to_section:{"section":"mood"}]
- To book an appointment: [FUNCTION:book_therapist_appointment:{"preferredDate":"2024-01-15","sessionType":"video"}]

You should:
1. Be empathetic and supportive
2. Understand user intent and suggest helpful actions
3. Use functions when appropriate to help users achieve their goals
4. Always explain what you're doing when using functions
5. Provide mental health support and guidance
6. Respect user privacy and boundaries

Remember: You can actively help users by performing these actions, not just suggesting them.`;
}

// Execute function calls
export async function executeFunctionCall(
  functionCall: FunctionCall,
  context: {
    setActiveSection?: (section: string) => void;
    user?: any;
    addTodo?: (todo: any) => void;
    trackMood?: (mood: any) => void;
    createReminder?: (reminder: any) => void;
  }
): Promise<AIActionResult> {
  
  switch (functionCall.name) {
    case 'navigate_to_section':
      if (context.setActiveSection) {
        context.setActiveSection(functionCall.arguments.section);
        return {
          success: true,
          message: `Navigated to ${functionCall.arguments.section} section`,
          data: { section: functionCall.arguments.section }
        };
      }
      return { success: false, message: "Navigation not available" };

    case 'add_todo':
      try {
        const todoData = {
          id: Date.now().toString(),
          title: functionCall.arguments.title,
          description: functionCall.arguments.description || '',
          category: functionCall.arguments.category || 'personal',
          priority: functionCall.arguments.priority || 'medium',
          dueDate: functionCall.arguments.dueDate,
          reminderTime: functionCall.arguments.reminderTime,
          completed: false,
          moodImpact: functionCall.arguments.moodImpact || 'neutral',
          points: getPriorityPoints(functionCall.arguments.priority || 'medium'),
          isWellnessGoal: functionCall.arguments.isWellnessGoal || false,
          createdAt: new Date().toISOString(),
          createdBy: 'ai'
        };

        // Save to localStorage
        const existingTodos = JSON.parse(localStorage.getItem('ease-todos') || '[]');
        const updatedTodos = [...existingTodos, todoData];
        localStorage.setItem('ease-todos', JSON.stringify(updatedTodos));

        // Schedule reminder if specified
        if (functionCall.arguments.reminderTime) {
          scheduleLocalReminder(todoData);
        }

        return {
          success: true,
          message: `Added todo: "${functionCall.arguments.title}"`,
          data: todoData
        };
      } catch (error) {
        return { success: false, message: "Failed to add todo" };
      }

    case 'track_mood':
      try {
        const moodData = {
          id: Date.now().toString(),
          mood: functionCall.arguments.mood,
          intensity: functionCall.arguments.intensity || 5,
          note: functionCall.arguments.note || '',
          timestamp: new Date().toISOString(),
          source: 'ai-chat'
        };

        // Save mood entry
        const existingMoods = JSON.parse(localStorage.getItem('ease-mood-entries') || '[]');
        const updatedMoods = [...existingMoods, moodData];
        localStorage.setItem('ease-mood-entries', JSON.stringify(updatedMoods));

        return {
          success: true,
          message: `Mood tracked: ${functionCall.arguments.mood}`,
          data: moodData
        };
      } catch (error) {
        return { success: false, message: "Failed to track mood" };
      }

    case 'schedule_reminder':
      try {
        const reminderData = {
          id: Date.now().toString(),
          title: functionCall.arguments.title,
          message: functionCall.arguments.message || functionCall.arguments.title,
          time: functionCall.arguments.time,
          frequency: functionCall.arguments.frequency || 'once',
          type: functionCall.arguments.type || 'general',
          createdAt: new Date().toISOString(),
          isActive: true
        };

        // Save reminder
        const existingReminders = JSON.parse(localStorage.getItem('ease-reminders') || '[]');
        const updatedReminders = [...existingReminders, reminderData];
        localStorage.setItem('ease-reminders', JSON.stringify(updatedReminders));

        // Schedule the actual reminder
        scheduleLocalReminder(reminderData);

        return {
          success: true,
          message: `Reminder scheduled: "${functionCall.arguments.title}" at ${functionCall.arguments.time}`,
          data: reminderData
        };
      } catch (error) {
        return { success: false, message: "Failed to schedule reminder" };
      }

    case 'book_therapist_appointment':
      // This would typically integrate with a booking system
      // For now, we'll simulate by adding it as a todo
      const appointmentTodo = {
        id: Date.now().toString(),
        title: `Therapy Appointment`,
        description: `Book therapy session for ${functionCall.arguments.preferredDate}`,
        category: 'wellness',
        priority: 'high',
        dueDate: functionCall.arguments.preferredDate,
        completed: false,
        moodImpact: 'positive',
        points: 5,
        isWellnessGoal: true,
        createdAt: new Date().toISOString(),
        createdBy: 'ai'
      };

      const existingTodos = JSON.parse(localStorage.getItem('ease-todos') || '[]');
      const updatedTodos = [...existingTodos, appointmentTodo];
      localStorage.setItem('ease-todos', JSON.stringify(updatedTodos));

      return {
        success: true,
        message: `I've added a reminder to book your therapy appointment for ${functionCall.arguments.preferredDate}. You can find it in your todo list.`,
        data: appointmentTodo
      };

    default:
      return { success: false, message: `Unknown function: ${functionCall.name}` };
  }
}

// Helper functions
function getPriorityPoints(priority: string): number {
  switch (priority) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 1;
  }
}

function scheduleLocalReminder(item: any) {
  // Check if we have notification permission
  if ('Notification' in window && Notification.permission === 'granted') {
    const now = new Date();
    const reminderTime = new Date();
    
    if (item.time) {
      const [hours, minutes] = item.time.split(':');
      reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // If the time has passed today, schedule for tomorrow
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }
    } else if (item.dueDate) {
      reminderTime.setTime(new Date(item.dueDate).getTime());
    }
    
    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    if (timeUntilReminder > 0 && timeUntilReminder < 24 * 60 * 60 * 1000) { // Within 24 hours
      setTimeout(() => {
        new Notification(item.title || 'Ease Reminder', {
          body: item.message || item.description || 'Time for your scheduled activity',
          icon: '/icon-192.png',
          badge: '/icon-192.png'
        });
      }, timeUntilReminder);
    }
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission === 'denied') {
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}
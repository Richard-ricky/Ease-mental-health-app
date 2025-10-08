import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Bell, BellOff, Settings, Heart, Target, Calendar, Sparkles, Clock, Smartphone, Shield } from "lucide-react";
import { apiCall } from "../../utils/supabase/client.ts";
import { toast } from "sonner";
import {
  NotificationPreferences,
  NotificationSchedule,
  checkNotificationSupport,
  requestNotificationPermission,
  checkSubscriptionStatus,
  registerServiceWorker,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestNotification
} from "../../utils/notificationHelpers";

const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HI8VOO9Sh96wqwPJKWOmVJaA9JKRD8Qw7V5GMp6q4LXR0KXJ-FJe9_0iDQ';

export function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    moodCheckins: true,
    dailyReminders: true,
    habitReminders: true,
    therapySession: true,
    wellnessTips: false,
    weeklyReports: true
  });
  const [schedule, setSchedule] = useState<NotificationSchedule>({
    moodCheckin: '20:00',
    dailyReminder: '09:00',
    habitReminder: '18:00'
  });

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    setIsSupported(checkNotificationSupport());
    if (checkNotificationSupport()) {
      const subscribed = await checkSubscriptionStatus();
      setIsSubscribed(subscribed);
    }
    setIsLoading(false);
  };

  const handleSubscribe = async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser.');
      return;
    }

    try {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        toast.error('Notification permission denied. Please enable notifications in your browser settings.');
        return;
      }

      const registration = await registerServiceWorker();
      const subscription = await subscribeToPush(registration, VAPID_PUBLIC_KEY);

      await apiCall('/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription, preferences })
      });

      setIsSubscribed(true);
      toast.success('Push notifications enabled! You\'ll receive wellness reminders and check-ins.');
    } catch (error: any) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Failed to enable push notifications. Please try again.');
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribeFromPush();
      setIsSubscribed(false);
      toast.success('Push notifications disabled.');
    } catch (error: any) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Failed to disable push notifications.');
    }
  };

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    setPreferences(newPreferences);
    
    if (isSubscribed) {
      try {
        await apiCall('/notifications/subscribe', {
          method: 'POST',
          body: JSON.stringify({ preferences: newPreferences })
        });
        toast.success('Notification preferences updated!');
      } catch (error: any) {
        console.error('Error updating preferences:', error);
        toast.error('Failed to update preferences.');
      }
    }
  };

  const handleTestNotification = () => {
    if (!isSubscribed) {
      toast.error('Please enable notifications first.');
      return;
    }

    sendTestNotification(
      'Ease - Test Notification',
      'This is a test notification from your Ease mental health app! 💙'
    );
    toast.success('Test notification sent!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 rounded-full border-amber-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center"
      >
        <div className="flex items-center justify-center space-x-3">
          <motion.div
            className="flex items-center justify-center w-16 h-16 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Bell className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text">
              Smart Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Stay on track with personalized wellness reminders
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Badge className="px-3 py-1 text-white bg-gradient-to-r from-amber-500 to-orange-600">
            <Smartphone className="w-4 h-4 mr-1" />
            Mobile & Desktop
          </Badge>
          <Badge className="px-3 py-1 text-white bg-gradient-to-r from-blue-500 to-indigo-600">
            <Shield className="w-4 h-4 mr-1" />
            Privacy First
          </Badge>
          <Badge className="px-3 py-1 text-white bg-gradient-to-r from-emerald-500 to-teal-600">
            <Sparkles className="w-4 h-4 mr-1" />
            Personalized
          </Badge>
        </div>
      </motion.div>

      {/* Status Card */}
      <Card className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200/50 dark:border-amber-700/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isSubscribed ? (
              <>
                <Bell className="w-5 h-5 text-green-600" />
                <span>Notifications Enabled</span>
                <Badge className="text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </Badge>
              </>
            ) : (
              <>
                <BellOff className="w-5 h-5 text-gray-500" />
                <span>Notifications Disabled</span>
                <Badge variant="outline">Inactive</Badge>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSupported ? (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">
                  {isSubscribed ? 'Receiving notifications' : 'Enable notifications'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {isSubscribed 
                    ? 'You\'ll receive personalized reminders and check-ins based on your preferences.'
                    : 'Get helpful reminders for mood check-ins, habits, and wellness goals.'
                  }
                </p>
              </div>
              <div className="space-x-2">
                {isSubscribed && (
                  <Button variant="outline" onClick={handleTestNotification}>
                    Test
                  </Button>
                )}
                <Button
                  onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                  variant={isSubscribed ? "destructive" : "default"}
                  className={!isSubscribed ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700" : ""}
                >
                  {isSubscribed ? 'Disable' : 'Enable Notifications'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <BellOff className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <h3 className="mb-2 font-medium text-gray-600 dark:text-gray-300">
                Notifications Not Supported
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <AnimatePresence>
        {isSubscribed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'moodCheckins', icon: Heart, label: 'Mood Check-ins', description: 'Daily reminders to log your mood and feelings' },
                  { key: 'dailyReminders', icon: Sparkles, label: 'Daily Wellness Tips', description: 'Helpful tips and affirmations to start your day' },
                  { key: 'habitReminders', icon: Target, label: 'Habit Reminders', description: 'Reminders to complete your wellness habits' },
                  { key: 'therapySession', icon: Calendar, label: 'Therapy Sessions', description: 'Notifications about upcoming therapy appointments' },
                  { key: 'wellnessTips', icon: Sparkles, label: 'Weekly Wellness Tips', description: 'Educational content about mental health and wellness' },
                  { key: 'weeklyReports', icon: Calendar, label: 'Weekly Progress Reports', description: 'Summary of your weekly wellness journey' }
                ].map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <pref.icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">{pref.label}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{pref.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences[pref.key as keyof NotificationPreferences]}
                      onCheckedChange={(checked:any) => 
                        updatePreferences({ ...preferences, [pref.key]: checked })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Schedule Settings */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span>Notification Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'moodCheckin', label: 'Mood Check-in Time', description: 'Best time for your daily mood check-in' },
                  { key: 'dailyReminder', label: 'Daily Reminder Time', description: 'When to receive your daily wellness tip' },
                  { key: 'habitReminder', label: 'Habit Reminder Time', description: 'Reminder time for your wellness habits' }
                ].map((scheduleItem) => (
                  <div key={scheduleItem.key} className="flex items-center justify-between">
                    <div>
                      <Label>{scheduleItem.label}</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{scheduleItem.description}</p>
                    </div>
                    <Select
                      value={schedule[scheduleItem.key as keyof NotificationSchedule]}
                      onValueChange={(value:string) => setSchedule(prev => ({ ...prev, [scheduleItem.key]: value }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
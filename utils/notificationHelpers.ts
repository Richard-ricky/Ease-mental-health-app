export interface NotificationPreferences {
  moodCheckins: boolean;
  dailyReminders: boolean;
  habitReminders: boolean;
  therapySession: boolean;
  wellnessTips: boolean;
  weeklyReports: boolean;
}

export interface NotificationSchedule {
  moodCheckin: string;
  dailyReminder: string;
  habitReminder: string;
}

export const checkNotificationSupport = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const checkSubscriptionStatus = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};

export const urlBase64ToUint8Array = (base64String: string): ArrayBuffer => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration> => {
  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  return registration;
};

export const subscribeToPush = async (
  registration: ServiceWorkerRegistration,
  publicKey: string
): Promise<PushSubscription> => {
  return await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  });
};

export const unsubscribeFromPush = async (): Promise<void> => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    await subscription.unsubscribe();
  }
};

export const sendTestNotification = (title: string, body: string): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'test-notification',
      data: {
        url: window.location.origin
      }
    });
  }
};
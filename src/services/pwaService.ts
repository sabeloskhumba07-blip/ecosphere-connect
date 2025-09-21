class PWAService {
  private registration: ServiceWorkerRegistration | null = null;

  async init(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
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

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.warn('Service Worker not registered');
      return null;
    }

    try {
      // In a real app, you would use your VAPID public key here
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array('your-vapid-public-key-here')
      });

      return subscription;
    } catch (error) {
      console.warn('Push subscription failed:', error);
      return null;
    }
  }

  async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    const hasPermission = await this.requestNotificationPermission();
    
    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return;
    }

    const defaultOptions: NotificationOptions = {
      body: 'Ecosphere Connect notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [200, 100, 200],
      ...options
    };

    if (this.registration) {
      await this.registration.showNotification(title, defaultOptions);
    } else {
      new Notification(title, defaultOptions);
    }
  }

  async triggerLeakAlert(): Promise<void> {
    await this.showNotification('Water Leak Detected!', {
      body: 'Continuous water flow detected for over 30 minutes. Check your system immediately.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: 'leak-alert',
      requireInteraction: true,
      vibrate: [100, 50, 100, 50, 100],
      actions: [
        {
          action: 'view-dashboard',
          title: 'View Dashboard'
        },
        {
          action: 'contact-contractor',
          title: 'Find Contractor'
        }
      ]
    });
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  isInstallable(): boolean {
    return 'beforeinstallprompt' in window;
  }

  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) return false;

    await this.registration.update();
    return this.registration.waiting !== null;
  }
}

export const pwaService = new PWAService();
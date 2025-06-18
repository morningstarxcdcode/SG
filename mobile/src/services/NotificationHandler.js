import * as Notifications from 'expo-notifications';

class NotificationHandler {
  static async initialize() {
    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
      }

      // Set notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      console.log('NotificationHandler initialized');
    } catch (error) {
      console.error('Failed to initialize NotificationHandler:', error);
    }
  }

  static async showThreatAlert(threatData) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Security Threat Detected',
          body: threatData.description || 'A security threat has been detected in your area',
          data: { type: 'threat', threatData },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Failed to show threat alert:', error);
    }
  }

  static async showEmergencyAlert(emergencyData) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🆘 Emergency Alert',
          body: emergencyData.message || 'Emergency services have been notified',
          data: { type: 'emergency', emergencyData },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to show emergency alert:', error);
    }
  }

  static async showSecurityUpdate(message) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🛡️ Security Update',
          body: message,
          data: { type: 'security_update' },
          sound: false,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to show security update:', error);
    }
  }
}

export default NotificationHandler;

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

import { AuthProvider } from './contexts/AuthContext';
import { SecurityProvider } from './contexts/SecurityContext';
import { SocketProvider } from './contexts/SocketContext';
import AppNavigator from './navigation/AppNavigator';
import { secureGuardianTheme } from './styles/theme';
import NotificationHandler from './services/NotificationHandler';
import BackgroundServices from './services/BackgroundServices';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Request permissions
      await requestPermissions();
      
      // Initialize background services
      await BackgroundServices.initialize();
      
      // Initialize notification handler
      await NotificationHandler.initialize();
      
      setIsAppReady(true);
    } catch (error) {
      console.error('App initialization failed:', error);
      setIsAppReady(true); // Continue even if some initialization fails
    }
  };

  const requestPermissions = async () => {
    try {
      // Location permissions
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus === 'granted') {
        await Location.requestBackgroundPermissionsAsync();
      }

      // Notification permissions
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      
      console.log('Permissions granted:', {
        location: locationStatus,
        notifications: notificationStatus
      });
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  if (!isAppReady) {
    // You could show a splash screen here
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={secureGuardianTheme}>
        <AuthProvider>
          <SecurityProvider>
            <SocketProvider>
              <NavigationContainer theme={secureGuardianTheme}>
                <AppNavigator />
                <StatusBar style="auto" />
              </NavigationContainer>
            </SocketProvider>
          </SecurityProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

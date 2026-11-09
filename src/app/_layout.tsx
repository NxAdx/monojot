import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../store/themeStore';
import { useJotStore } from '../store/jotStore';

export default function RootLayout() {
  const { isDark, colors } = useTheme();
  const initDB = useJotStore((s) => s.initDB);

  useEffect(() => {
    initDB();

    // 1. Listen for 1-tap [Done] actions from the lock screen notification while running
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        if (response.actionIdentifier === 'done_action') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await useJotStore.getState().completeActiveJot();
        }
      }
    );

    // 2. Handle 1-tap [Done] actions if app was launched directly from notification action
    Notifications.getLastNotificationResponseAsync().then(async (response) => {
      if (response && response.actionIdentifier === 'done_action') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await useJotStore.getState().completeActiveJot();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [initDB]);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.bg} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="history"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}


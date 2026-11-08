import { Platform, NativeModules } from 'react-native';
import * as Notifications from 'expo-notifications';

const { GlanceNotificationModule } = NativeModules;

const NOTIFICATION_ID = 'monojot-active-glance';
const CHANNEL_ID = 'monojot-glance-channel';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const glanceService = {
  /**
   * Ensure Android notification channel is configured with maximum priority
   * and public lock screen visibility.
   */
  init: async (): Promise<void> => {
    if (Platform.OS !== 'android') return;
    try {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Active Thought Glance',
        importance: Notifications.AndroidImportance.MAX,
        enableVibrate: false,
        showBadge: false,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
      });
    } catch (e) {
      console.warn('[GlanceService] init channel error:', e);
    }
  },

  /**
   * Post or update the sticky ongoing lock screen notification
   */
  postGlance: async (text: string): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;

    // 1. Try native Kotlin module if available (compiled standalone mode)
    if (GlanceNotificationModule?.postGlance) {
      try {
        await GlanceNotificationModule.postGlance(text);
        return true;
      } catch (e) {
        console.warn('[GlanceService] Native Glance error, falling back:', e);
      }
    }

    // 2. Official Expo Notifications sticky notification
    try {
      // First dismiss previous to prevent duplicate stacking
      await Notifications.dismissNotificationAsync(NOTIFICATION_ID).catch(() => {});

      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_ID,
        content: {
          title: 'MonoJot',
          body: text,
          sticky: true,
          autoDismiss: false,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { action: 'open_active_jot' },
        },
        trigger: null, // deliver immediately
      });
      return true;
    } catch (e) {
      console.warn('[GlanceService] postGlance error:', e);
      return false;
    }
  },

  /**
   * Clear the lock screen notification when note is completed or toggled off
   */
  clearGlance: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;

    // 1. Try native Kotlin module
    if (GlanceNotificationModule?.clearGlance) {
      try {
        await GlanceNotificationModule.clearGlance();
        return true;
      } catch (e) {
        console.warn('[GlanceService] Native clearGlance error:', e);
      }
    }

    // 2. Expo Notifications dismiss
    try {
      await Notifications.dismissNotificationAsync(NOTIFICATION_ID);
      return true;
    } catch (e) {
      console.warn('[GlanceService] clearGlance error:', e);
      return false;
    }
  },
};

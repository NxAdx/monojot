import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const NOTIFICATION_ID = 'monojot-active-glance';
const CHANNEL_ID = 'monojot-glance-channel';
const FALLBACK_CHANNEL_ID = 'expo_notifications_fallback_notification_channel';

// Configure notification behavior for foreground presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const glanceService = {
  /**
   * Check and request Android notification permissions (mandatory on Android 13+ / API 33+)
   */
  ensurePermissions: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus === 'granted') {
        return true;
      }
      const { status: newStatus } = await Notifications.requestPermissionsAsync({
        android: {},
      });
      return newStatus === 'granted';
    } catch (e) {
      console.warn('[GlanceService] ensurePermissions failed:', e);
      return false;
    }
  },

  /**
   * Ensure Android notification channels and category actions are initialized
   * with maximum priority and public lock screen visibility.
   */
  init: async (): Promise<void> => {
    if (Platform.OS !== 'android') return;
    try {
      const channelConfig: Notifications.NotificationChannelInput = {
        name: 'Active Thought Glance',
        description: 'Persistent lock screen card for your active thought',
        importance: Notifications.AndroidImportance.MAX,
        enableVibrate: false,
        showBadge: false,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
        sound: null,
      };

      // Configure both custom channel AND expo fallback channel to guarantee
      // MAX priority and PUBLIC lockscreen visibility regardless of trigger type
      await Promise.all([
        Notifications.setNotificationChannelAsync(CHANNEL_ID, channelConfig),
        Notifications.setNotificationChannelAsync(FALLBACK_CHANNEL_ID, channelConfig),
      ]);

      // Register interactive lock screen action button: [Done]
      await Notifications.setNotificationCategoryAsync('glance_category', [
        {
          identifier: 'done_action',
          buttonTitle: 'Done',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);

      // Pre-flight check permissions on initial startup
      await glanceService.ensurePermissions();
    } catch (e) {
      console.warn('[GlanceService] init channel error:', e);
    }
  },

  /**
   * Post or update the sticky ongoing lock screen notification.
   * Uses trigger: null for immediate presentation without AlarmManager dependency.
   */
  postGlance: async (text: string): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;

    const trimmed = text?.trim();
    if (!trimmed) {
      await glanceService.clearGlance();
      return true;
    }

    const hasPermission = await glanceService.ensurePermissions();
    if (!hasPermission) {
      console.warn('[GlanceService] Notifications permission not granted');
      return false;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_ID,
        content: {
          title: 'MonoJot',
          body: trimmed,
          subtitle: 'Active Thought',
          sticky: true,
          autoDismiss: false,
          priority: Notifications.AndroidNotificationPriority.MAX,
          categoryIdentifier: 'glance_category',
          color: '#000000',
          data: { action: 'open_active_jot' },
        },
        trigger: null, // CRITICAL: Immediate delivery without SchedulableTrigger exception!
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
    try {
      await Notifications.dismissNotificationAsync(NOTIFICATION_ID);
      return true;
    } catch (e) {
      console.warn('[GlanceService] clearGlance error:', e);
      return false;
    }
  },
};

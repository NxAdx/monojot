import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const NOTIFICATION_ID = 'monojot-active-glance';
const CHANNEL_ID = 'monojot-glance-channel';

// Configure notification behavior for foreground handling
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
   * Check and request Android notification permissions (required for Android 13+)
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
      console.warn('[GlanceService] Permission request failed:', e);
      return false;
    }
  },

  /**
   * Ensure Android notification channel and actions are initialized with maximum priority
   * and public lock screen visibility.
   */
  init: async (): Promise<void> => {
    if (Platform.OS !== 'android') return;
    try {
      // 1. Configure the high-priority lock screen channel
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Active Thought Glance',
        description: 'Sticky lock screen card for your active thought',
        importance: Notifications.AndroidImportance.MAX,
        enableVibrate: false,
        showBadge: false,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });

      // 2. Register lock screen action button: [Done]
      await Notifications.setNotificationCategoryAsync('glance_category', [
        {
          identifier: 'done_action',
          buttonTitle: 'Done',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);

      // 3. Request permissions on initial startup
      await glanceService.ensurePermissions();
    } catch (e) {
      console.warn('[GlanceService] init channel error:', e);
    }
  },

  /**
   * Post or update the sticky ongoing lock screen notification
   */
  postGlance: async (text: string): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;

    if (!text || !text.trim()) {
      await glanceService.clearGlance();
      return true;
    }

    const hasPermission = await glanceService.ensurePermissions();
    if (!hasPermission) {
      console.warn('[GlanceService] Notifications permission not granted');
      return false;
    }

    try {
      // Dismiss previous to guarantee clean lock screen display
      await Notifications.dismissNotificationAsync(NOTIFICATION_ID).catch(() => {});

      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_ID,
        content: {
          title: 'MonoJot',
          body: text.trim(),
          sticky: true,
          autoDismiss: false,
          priority: Notifications.AndroidNotificationPriority.MAX,
          categoryIdentifier: 'glance_category',
          color: '#000000',
          data: { action: 'open_active_jot' },
        },
        trigger: {
          channelId: CHANNEL_ID,
        },
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

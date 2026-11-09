import { Platform, Linking, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

const NOTIFICATION_ID = 'monojot-active-glance';
const CHANNEL_ID = 'monojot_live_channel_v2';
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
   * Check if notification permission is currently granted
   */
  hasPermission: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  },

  /**
   * Request notification permissions. If interactive=true and system dialog
   * cannot be shown (already denied), directs user to Android App Settings.
   */
  ensurePermissions: async (interactive = false): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    try {
      const { status: existingStatus, canAskAgain } = await Notifications.getPermissionsAsync();
      if (existingStatus === 'granted') {
        return true;
      }

      // Try requesting via system dialog if not permanently denied or explicitly requested
      if (canAskAgain || interactive) {
        const { status: newStatus } = await Notifications.requestPermissionsAsync({
          android: {},
        });
        if (newStatus === 'granted') {
          return true;
        }
      }

      // If still not granted and user tapped to enable, guide them directly to Settings
      if (interactive) {
        Alert.alert(
          'Enable Lock Screen Note',
          'To keep your active note visible on your lock screen and notification shade, please enable notifications in Android Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings().catch(() => {}),
            },
          ]
        );
      }
      return false;
    } catch (e) {
      console.warn('[GlanceService] ensurePermissions failed:', e);
      return false;
    }
  },

  /**
   * Direct shortcut to open Android App Settings
   */
  openSettings: async (): Promise<void> => {
    if (Platform.OS === 'android') {
      await Linking.openSettings().catch(() => {});
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
        name: 'Active Thought',
        description: 'Persistent lock screen card for your active thought',
        importance: Notifications.AndroidImportance.MAX,
        enableVibrate: false,
        showBadge: false,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
        sound: null,
      };

      // Clean up any legacy channels with obsolete configurations
      await Notifications.deleteNotificationChannelAsync('monojot-glance-channel').catch(() => {});

      // Configure both fresh custom channel AND expo fallback channel to guarantee
      // MAX priority and PUBLIC lockscreen visibility regardless of presenter
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
    } catch (e) {
      console.warn('[GlanceService] init channel error:', e);
    }
  },

  /**
   * Post or update the sticky ongoing lock screen notification.
   * Leverages presentNotificationAsync with automatic scheduleNotificationAsync fallback.
   */
  postGlance: async (text: string): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;

    const trimmed = text?.trim();
    if (!trimmed) {
      await glanceService.clearGlance();
      return true;
    }

    const hasPerm = await glanceService.ensurePermissions(false);
    if (!hasPerm) {
      console.warn('[GlanceService] Notifications permission not granted');
      return false;
    }

    const content: Notifications.NotificationContentInput = {
      title: 'MonoJot',
      body: trimmed,
      subtitle: 'Active Thought',
      sticky: true,
      autoDismiss: false,
      priority: Notifications.AndroidNotificationPriority.MAX,
      categoryIdentifier: 'glance_category',
      color: '#000000',
      data: { action: 'open_active_jot' },
    };

    // Attempt direct presentation first (synchronous native notify)
    try {
      await Notifications.presentNotificationAsync(content, NOTIFICATION_ID);
      return true;
    } catch (err1) {
      console.warn('[GlanceService] presentNotificationAsync failed, attempting schedule fallback:', err1);
      try {
        await Notifications.scheduleNotificationAsync({
          identifier: NOTIFICATION_ID,
          content,
          trigger: null,
        });
        return true;
      } catch (err2) {
        console.warn('[GlanceService] scheduleNotificationAsync fallback failed:', err2);
        return false;
      }
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

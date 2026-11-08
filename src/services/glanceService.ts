import { NativeModules, Platform } from 'react-native';

const { GlanceNotificationModule } = NativeModules;

export interface GlancePayload {
  id?: number;
  text: string;
}

export const glanceService = {
  postGlance: async (text: string): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    try {
      if (GlanceNotificationModule?.postGlance) {
        await GlanceNotificationModule.postGlance(text);
        return true;
      }
    } catch (e) {
      console.warn('[GlanceService] postGlance error:', e);
    }
    return false;
  },

  clearGlance: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    try {
      if (GlanceNotificationModule?.clearGlance) {
        await GlanceNotificationModule.clearGlance();
        return true;
      }
    } catch (e) {
      console.warn('[GlanceService] clearGlance error:', e);
    }
    return false;
  }
};


/**
 * Study Labs — HapticManager
 * Wraps expo-haptics with settings checking and graceful platform fallbacks.
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { StorageService } from './storage';

class HapticManagerService {
  async triggerSelection(): Promise<void> {
    if (Platform.OS === 'web') return;
    const settings = await StorageService.getSettings();
    if (!settings.hapticFeedback) return;

    try {
      await Haptics.selectionAsync();
    } catch {
      // Ignored if device lacks haptics
    }
  }

  async triggerSuccess(): Promise<void> {
    if (Platform.OS === 'web') return;
    const settings = await StorageService.getSettings();
    if (!settings.hapticFeedback) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignored
    }
  }

  async triggerError(): Promise<void> {
    if (Platform.OS === 'web') return;
    const settings = await StorageService.getSettings();
    if (!settings.hapticFeedback) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Ignored
    }
  }

  async triggerCelebration(): Promise<void> {
    if (Platform.OS === 'web') return;
    const settings = await StorageService.getSettings();
    if (!settings.hapticFeedback) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(async () => {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }, 150);
    } catch {
      // Ignored
    }
  }
}

export const HapticManager = new HapticManagerService();


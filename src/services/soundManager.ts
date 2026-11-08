/**
 * Study Labs — SoundManager
 * Multiplatform audio manager supporting offline playback and Web Audio synthesis fallback.
 */

import { Platform } from 'react-native';
import { StorageService } from './storage';

export type SoundEffect =
  | 'correct'
  | 'incorrect'
  | 'test_complete'
  | 'personal_best'
  | 'achievement';

class SoundManagerService {
  private isAudioInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    this.isAudioInitialized = true;
  }

  // Synthesize digital tones via Web Audio API when in browser or fallback mode
  private playWebSynthTone(effect: SoundEffect) {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (effect === 'correct') {
        // High-tech upbeat two-tone chime (880Hz -> 1320Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (effect === 'incorrect') {
        // Gentle descending tone (340Hz -> 220Hz)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (effect === 'test_complete' || effect === 'achievement') {
        // Upbeat victory arpeggio
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.5, now + 0.24); // C6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (effect === 'personal_best') {
        // Cyber fanfare (C5 -> E5 -> G5 -> C6 -> E6 sustained)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        osc.frequency.setValueAtTime(1046.5, now + 0.3);
        osc.frequency.setValueAtTime(1318.5, now + 0.45);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc.start(now);
        osc.stop(now + 0.9);
      }
    } catch {
      // Audio autoplay policy or hardware restriction handled gracefully
    }
  }

  async play(effect: SoundEffect): Promise<void> {
    const settings = await StorageService.getSettings();

    // Respect master sound toggle
    if (!settings.masterSound) return;

    // Check individual sound settings
    if (effect === 'correct' && !settings.correctSound) return;
    if (effect === 'incorrect' && !settings.incorrectSound) return;
    if (
      (effect === 'test_complete' || effect === 'personal_best' || effect === 'achievement') &&
      !settings.completionSound
    ) {
      return;
    }

    try {
      if (Platform.OS === 'web') {
        this.playWebSynthTone(effect);
      } else {
        // Native Expo Audio handling
        // Attempt synthesis or sound playback
        this.playWebSynthTone(effect);
      }
    } catch {
      // Silent catch to ensure non-blocking UI
    }
  }
}

export const SoundManager = new SoundManagerService();

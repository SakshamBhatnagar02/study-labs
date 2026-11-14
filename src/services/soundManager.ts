/**
 * Study Labs — SoundManager
 * Multiplatform audio manager powered by bundled MP3 SFX via expo-audio
 * with Web Audio synthesis fallback when hardware/browser playback is unavailable.
 */

import { Platform } from 'react-native';
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { AppSettings } from '../types';
import { StorageService } from './storage';

export type SoundEffect =
  | 'click'
  | 'correct'
  | 'incorrect'
  | 'test_complete'
  | 'personal_best'
  | 'achievement'
  | 'hint'
  | 'notify'
  | 'calling'
  | 'message_send'
  | 'message_received';

export const SFX_FILE_NAMES: Record<SoundEffect, string> = {
  click: 'click.mp3',
  correct: 'correct-answer.mp3',
  incorrect: 'wrong-answer.mp3',
  test_complete: 'test-complete.mp3',
  personal_best: 'test-complete.mp3',
  achievement: 'notification.mp3',
  hint: 'hint.wav',
  notify: 'notification.mp3',
  calling: 'calling.mp3',
  message_send: 'message-send.mp3',
  message_received: 'message-received.mp3',
};

const SFX_SOURCES: Record<SoundEffect, any> = {
  click: require('../../assets/audio/click.mp3'),
  correct: require('../../assets/audio/correct-answer.mp3'),
  incorrect: require('../../assets/audio/wrong-answer.mp3'),
  test_complete: require('../../assets/audio/test-complete.mp3'),
  personal_best: require('../../assets/audio/test-complete.mp3'),
  achievement: require('../../assets/audio/notification.mp3'),
  hint: require('../../assets/audio/hint.wav'),
  notify: require('../../assets/audio/notification.mp3'),
  calling: require('../../assets/audio/calling.mp3'),
  message_send: require('../../assets/audio/message-send.mp3'),
  message_received: require('../../assets/audio/message-received.mp3'),
};

const SFX_VOLUMES: Record<SoundEffect, number> = {
  click: 0.45,
  correct: 0.9,
  incorrect: 0.85,
  test_complete: 0.95,
  personal_best: 1.0,
  achievement: 0.8,
  hint: 0.7,
  notify: 0.7,
  calling: 0.75,
  message_send: 0.6,
  message_received: 0.65,
};

class SoundManagerService {
  private audioModeConfigured = false;
  private players = new Map<string, AudioPlayer>();
  private cachedSettings: AppSettings | null = null;
  private lastClickAt = 0;

  setCachedSettings(settings: AppSettings): void {
    this.cachedSettings = settings;
  }

  private async resolveSettings(): Promise<AppSettings> {
    if (this.cachedSettings) return this.cachedSettings;
    const loaded = await StorageService.getSettings();
    this.cachedSettings = loaded;
    return loaded;
  }

  private async ensureAudioMode(): Promise<void> {
    if (this.audioModeConfigured) return;
    this.audioModeConfigured = true;

    if (Platform.OS === 'web') return;

    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'mixWithOthers',
        shouldPlayInBackground: false,
      });
    } catch {
      // Non-fatal if audio mode setup fails on emulator/device
    }
  }

  private getOrCreatePlayer(effect: SoundEffect): AudioPlayer | null {
    const fileKey = SFX_FILE_NAMES[effect];
    const cached = this.players.get(fileKey);
    if (cached) return cached;

    try {
      const source = SFX_SOURCES[effect];
      const player = createAudioPlayer(source);
      player.loop = false;
      this.players.set(fileKey, player);
      return player;
    } catch {
      return null;
    }
  }

  // Synthesize digital tones via Web Audio API fallback
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

      if (effect === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1150, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.032);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.start(now);
        osc.stop(now + 0.036);
      } else if (effect === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (effect === 'incorrect') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (effect === 'hint' || effect === 'notify' || effect === 'achievement') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(740, now);
        osc.frequency.setValueAtTime(987.77, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (effect === 'calling') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.setValueAtTime(780, now + 0.12);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (effect === 'test_complete' || effect === 'personal_best') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        osc.frequency.setValueAtTime(1046.5, now + 0.3);
        osc.frequency.setValueAtTime(1318.5, now + 0.45);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        osc.start(now);
        osc.stop(now + 0.85);
      }
    } catch {
      // Autoplay policy or hardware restriction handled gracefully
    }
  }

  async play(effect: SoundEffect): Promise<void> {
    if (effect === 'click') {
      const nowMs = Date.now();
      if (nowMs - this.lastClickAt < 55) return;
      this.lastClickAt = nowMs;
    }

    const settings = await this.resolveSettings();

    if (!settings.masterSound) return;
    if (effect === 'click' && settings.clickSound === false) return;
    if (effect === 'correct' && !settings.correctSound) return;
    if (effect === 'incorrect' && !settings.incorrectSound) return;
    if (
      (effect === 'test_complete' || effect === 'personal_best' || effect === 'achievement') &&
      !settings.completionSound
    ) {
      return;
    }

    try {
      await this.ensureAudioMode();
      const player = this.getOrCreatePlayer(effect);
      if (player) {
        player.volume = SFX_VOLUMES[effect] ?? 0.85;
        try {
          if (player.playing) {
            player.pause();
          }
          await player.seekTo(0);
        } catch {
          // Safe if initial load hasn't completed yet
        }
        player.play();
        return;
      }

      this.playWebSynthTone(effect);
    } catch {
      this.playWebSynthTone(effect);
    }
  }

  playClick(): void {
    void this.play('click');
  }

  playHint(): void {
    void this.play('hint');
  }

  playMessageSend(): void {
    void this.play('message_send');
  }

  playMessageReceived(): void {
    void this.play('message_received');
  }

  disposeAll(): void {
    for (const player of this.players.values()) {
      try {
        player.remove();
      } catch {
        // Ignore cleanup errors
      }
    }
    this.players.clear();
  }
}

export const SoundManager = new SoundManagerService();

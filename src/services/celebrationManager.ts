/**
 * Study Labs — CelebrationManager
 * Evaluates test attempts, detects personal bests, and orchestrates sound, haptics, and visual celebration.
 */

import { CelebrationEvent, CelebrationTier, TestAttempt } from '../types';
import { StorageService } from './storage';
import { SoundManager } from './soundManager';
import { HapticManager } from './hapticManager';

class CelebrationManagerService {
  async evaluateAndCelebrate(currentAttempt: TestAttempt): Promise<CelebrationEvent> {
    // 1. Fetch previous attempts to detect if this is a personal best
    const existingAttempts = await StorageService.getTestAttempts();
    
    // Filter other attempts (excluding current one if already in storage)
    const otherAttempts = existingAttempts.filter((a) => a.id !== currentAttempt.id);
    
    let isPersonalBest = false;
    if (otherAttempts.length > 0) {
      const highestScore = Math.max(...otherAttempts.map((a) => a.score));
      if (currentAttempt.score > highestScore && currentAttempt.score > 0) {
        isPersonalBest = true;
      }
    } else if (currentAttempt.score > 0) {
      isPersonalBest = true;
    }

    // 2. Determine celebration tier
    let tier: CelebrationTier = 'normal';
    if (isPersonalBest) {
      tier = 'personal_best';
    } else if (currentAttempt.percentage >= 80) {
      tier = 'excellent';
    }

    // 3. Format time string
    const mins = Math.floor(currentAttempt.timeSpentSeconds / 60);
    const secs = currentAttempt.timeSpentSeconds % 60;
    const timeSpentStr = `${mins}m ${secs}s`;

    const event: CelebrationEvent = {
      tier,
      score: currentAttempt.score,
      maxScore: currentAttempt.maxScore,
      percentage: currentAttempt.percentage,
      isPersonalBest,
      correctAnswers: currentAttempt.correctAnswers,
      incorrectAnswers: currentAttempt.incorrectAnswers,
      timeSpentStr,
    };

    // 4. Trigger audio and haptic feedback
    if (isPersonalBest) {
      SoundManager.play('personal_best');
    } else {
      SoundManager.play('test_complete');
    }
    HapticManager.triggerCelebration();

    return event;
  }
}

export const CelebrationManager = new CelebrationManagerService();


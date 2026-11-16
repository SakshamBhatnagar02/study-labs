import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { Shield, Sparkles, Trophy, ArrowRight, Zap, Flame } from 'lucide-react-native';
import { Button } from '../common/Button';
import { HapticManager } from '../../services/hapticManager';
import { SoundManager } from '../../services/soundManager';
import { LEAGUE_TIERS } from '../../utils/activityStats';
import type { LeagueTierId } from '../../types';

export interface WeeklyLeagueCycleModalProps {
  visible: boolean;
  onClose: () => void;
  onViewLeaderboard?: () => void;
  currentTierId?: LeagueTierId;
  previousTierId?: LeagueTierId;
  lastWeekScore?: number;
  statusText?: string;
}

export const WeeklyLeagueCycleModal: React.FC<WeeklyLeagueCycleModalProps> = ({
  visible,
  onClose,
  onViewLeaderboard,
  currentTierId = 'starter',
  previousTierId = 'starter',
  lastWeekScore = 0,
  statusText,
}) => {
  const { colors, mode } = useTheme();

  const currentTier =
    LEAGUE_TIERS.find((t) => t.id === currentTierId) || LEAGUE_TIERS[0];
  const previousTier =
    LEAGUE_TIERS.find((t) => t.id === previousTierId) || LEAGUE_TIERS[0];

  const currentIdx = LEAGUE_TIERS.findIndex((t) => t.id === currentTierId);
  const prevIdx = LEAGUE_TIERS.findIndex((t) => t.id === previousTierId);

  let cycleHeadline = `You Stayed in ${currentTier.name} This Week`;
  let motivationalMessage =
    `Don't stop now — just a few extra practice sessions can take you right into the Promotion Zone!`;

  if (currentIdx > prevIdx) {
    cycleHeadline = `Promoted to ${currentTier.name}! 🎉`;
    motivationalMessage =
      `Incredible dedication! You placed in the Top Promotion Zone and advanced to ${currentTier.name}. Keep your streak alive to defend your rank!`;
  } else if (currentIdx < prevIdx) {
    cycleHeadline = `Moved to ${currentTier.name}`;
    motivationalMessage =
      `Don't stop now — solve a few daily question sets to climb right back into ${previousTier.name}.`;
  }

  const handleDismiss = () => {
    SoundManager.play('click');
    HapticManager.triggerSelection();
    onClose();
  };

  const handleOpenLeaderboard = () => {
    SoundManager.play('achievement');
    HapticManager.triggerSuccess();
    onClose();
    onViewLeaderboard?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.dialogCard,
            {
              backgroundColor: mode === 'dark' ? '#141A28' : '#FFFFFF',
              borderColor: mode === 'dark' ? '#1F293D' : '#E2E8F0',
            },
          ]}
        >
          {/* Top Tag Header */}
          <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>
            WEEKLY LEAGUE CYCLE IS HERE
          </Text>

          {/* Main Status Headline */}
          <Text style={[styles.headline, { color: colors.text }]}>
            {cycleHeadline}
          </Text>

          {/* Center Graphic: League Pedestals & Transition Arrow */}
          <View style={styles.pedestalsContainer}>
            {/* Left Pedestal (Previous League) */}
            <View style={styles.pedestalWrapper}>
              <View
                style={[
                  styles.badgeCircle,
                  {
                    backgroundColor:
                      mode === 'dark' ? 'rgba(30, 41, 59, 0.9)' : '#F1F5F9',
                    borderColor: previousTier.color,
                  },
                ]}
              >
                <Shield size={36} color={previousTier.color} />
                <View
                  style={[
                    styles.pedestalBase,
                    { backgroundColor: previousTier.color },
                  ]}
                />
              </View>
              <Text
                style={[styles.pedestalLabel, { color: colors.textSecondary }]}
              >
                {previousTier.name}
              </Text>
            </View>

            {/* Transition Arrow » */}
            <View style={styles.arrowBox}>
              <Text style={[styles.doubleArrow, { color: colors.primary }]}>
                »
              </Text>
            </View>

            {/* Right Pedestal (Current League) */}
            <View style={styles.pedestalWrapper}>
              <View
                style={[
                  styles.badgeCircle,
                  styles.currentBadgeGlow,
                  {
                    backgroundColor:
                      mode === 'dark' ? 'rgba(30, 41, 59, 0.9)' : '#F8FAFC',
                    borderColor: currentTier.color,
                    shadowColor: currentTier.color,
                  },
                ]}
              >
                <Sparkles size={16} color={currentTier.color} style={styles.sparkleIcon} />
                <Shield size={40} color={currentTier.color} />
                <View
                  style={[
                    styles.pedestalBase,
                    styles.currentPedestalBase,
                    { backgroundColor: currentTier.color },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.pedestalLabel,
                  { color: currentTier.color, fontWeight: '800' },
                ]}
              >
                {currentTier.name}
              </Text>
            </View>
          </View>

          {/* Last Week Score Pill */}
          <View
            style={[
              styles.scorePill,
              {
                backgroundColor:
                  mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
                borderColor: 'rgba(245, 158, 11, 0.3)',
              },
            ]}
          >
            <Text style={styles.scorePillText}>
              Last week score{' '}
              <Text style={{ fontWeight: '900', color: '#D97706' }}>
                {lastWeekScore}
              </Text>
            </Text>
            <View style={styles.coinCircle}>
              <Text style={styles.coinEmoji}>🪙</Text>
            </View>
          </View>

          {/* Motivational Message */}
          <Text style={[styles.motivationText, { color: colors.textSecondary }]}>
            {statusText || motivationalMessage}
          </Text>

          {/* Actions */}
          <View style={styles.buttonStack}>
            <TouchableOpacity
              onPress={handleDismiss}
              style={[styles.primaryButton, { backgroundColor: '#FFFFFF' }]}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryButtonText}>Let’s Go 🚀</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleOpenLeaderboard}
              style={[
                styles.secondaryButton,
                {
                  backgroundColor:
                    mode === 'dark' ? '#1E293B' : '#F1F5F9',
                  borderColor: mode === 'dark' ? '#334155' : '#CBD5E1',
                },
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                View Leaderboard
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  headline: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 27,
    marginBottom: 20,
  },
  pedestalsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 20,
    width: '100%',
  },
  pedestalWrapper: {
    alignItems: 'center',
  },
  badgeCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  currentBadgeGlow: {
    borderWidth: 2.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  sparkleIcon: {
    position: 'absolute',
    top: 6,
    right: 8,
  },
  pedestalBase: {
    position: 'absolute',
    bottom: 10,
    width: 36,
    height: 4,
    borderRadius: 2,
    opacity: 0.85,
  },
  currentPedestalBase: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
  },
  pedestalLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  arrowBox: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doubleArrow: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 28,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  scorePillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
  },
  coinCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinEmoji: {
    fontSize: 14,
  },
  motivationText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  buttonStack: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

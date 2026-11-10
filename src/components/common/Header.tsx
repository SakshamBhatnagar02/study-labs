import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../theme';
import { Sun, Moon, Flame, Sliders, Trophy } from 'lucide-react-native';
import { SettingsModal } from '../settings/SettingsModal';

interface HeaderProps {
  userIoId?: string;
  streakDays?: number;
  onProfilePress?: () => void;
  onStreakPress?: () => void;
  onLeaderboardPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userIoId = 'STUDY-7734-IO',
  streakDays = 14,
  onProfilePress,
  onStreakPress,
  onLeaderboardPress,
}) => {
  const { colors, mode, toggleTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {/* Brand & Cyber Logo Identity */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => {
            onProfilePress?.();
          }}
          style={styles.brandRow}
          accessibilityLabel="Open My Profile"
        >
          <View style={[styles.logoWrapper, { borderColor: colors.primary }]}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.brandTitle, { color: colors.text }]}>Study</Text>
              <Text style={[styles.brandTitleOrange, { color: colors.primary }]}>Labs</Text>
            </View>
            <Text style={[styles.companySubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              study.io · {userIoId}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Action Badges */}
        <View style={styles.actionsRow}>
          {/* 7-Day Streak Counter -> Opens Daily Goal & Heatmap */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              onStreakPress?.();
            }}
            style={[
              styles.streakBadge,
              {
                backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5',
                borderColor: colors.primary,
              },
            ]}
            accessibilityLabel="Daily Goal and 7-day Streak"
          >
            <Flame color={colors.primary} size={14} />
            <Text style={[styles.streakText, { color: colors.primary }]}>{streakDays}d</Text>
          </TouchableOpacity>

          {/* 7-Day Leaderboard Trophy */}
          {onLeaderboardPress && (
            <TouchableOpacity
              onPress={() => {
                onLeaderboardPress();
              }}
              activeOpacity={0.7}
              style={[
                styles.iconButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              accessibilityLabel="7-Day Weekly Leaderboard"
            >
              <Trophy color={colors.warning} size={15} />
            </TouchableOpacity>
          )}

          {/* Sound & Effects Settings */}
          <TouchableOpacity
            onPress={() => {
              setSettingsOpen(true);
            }}
            activeOpacity={0.7}
            style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityLabel="Sound and effects settings"
          >
            <Sliders color={colors.primary} size={15} />
          </TouchableOpacity>

          {/* Theme Toggle */}
          <TouchableOpacity
            onPress={() => {
              toggleTheme();
            }}
            activeOpacity={0.7}
            style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityLabel="Toggle light and dark mode"
          >
            {mode === 'dark' ? (
              <Sun color={colors.warning} size={15} />
            ) : (
              <Moon color={colors.textSecondary} size={15} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Global Settings Modal */}
      <SettingsModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenReminderSettings={onStreakPress}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    gap: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
    minWidth: 0,
  },
  logoWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: '#090D16',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandTitleOrange: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  companySubtitle: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  streakText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

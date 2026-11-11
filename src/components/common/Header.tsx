import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, useWindowDimensions } from 'react-native';
import { useTheme } from '../../theme';
import { Sun, Moon, Flame, Sliders, Trophy, Calculator, Users } from 'lucide-react-native';
import { SettingsModal } from '../settings/SettingsModal';

interface HeaderProps {
  userIoId?: string;
  streakDays?: number;
  onProfilePress?: () => void;
  onStreakPress?: () => void;
  onLeaderboardPress?: () => void;
  onClubsPress?: () => void;
  onQuickCalcPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userIoId = 'STUDY-7734-IO',
  streakDays = 14,
  onProfilePress,
  onStreakPress,
  onLeaderboardPress,
  onClubsPress,
  onQuickCalcPress,
}) => {
  const { colors, mode, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 430;
  const iconSize = isCompact ? 13 : 15;
  const compactBtnStyle = isCompact ? { width: 27, height: 27, borderRadius: 8 } : null;
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingHorizontal: isCompact ? 10 : 14,
            gap: isCompact ? 6 : 8,
          },
        ]}
      >
        {/* Brand & Cyber Logo Identity */}
        <Pressable
          focusable={false}
          onPress={() => {
            onProfilePress?.();
          }}
          style={({ pressed }) => [
            styles.brandRow,
            { gap: isCompact ? 7 : 9 },
            pressed && { opacity: 0.78 },
          ]}
          accessibilityLabel="Open My Profile"
        >
          <View
            style={[
              styles.logoWrapper,
              {
                borderColor: colors.primary,
                width: isCompact ? 30 : 36,
                height: isCompact ? 30 : 36,
                borderRadius: isCompact ? 8 : 10,
              },
            ]}
          >
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.titleRow}>
              <Text style={[styles.brandTitle, { color: colors.text, fontSize: isCompact ? 15 : 17 }]}>
                Study
              </Text>
              <Text
                style={[styles.brandTitleOrange, { color: colors.primary, fontSize: isCompact ? 15 : 17 }]}
              >
                Labs
              </Text>
            </View>
            <Text
              style={[
                styles.companySubtitle,
                { color: colors.textSecondary, fontSize: isCompact ? 9 : 10 },
              ]}
              numberOfLines={1}
            >
              study.io · {userIoId}
            </Text>
          </View>
        </Pressable>

        {/* Action Badges */}
        <View style={[styles.actionsRow, { gap: isCompact ? 4 : 6 }]}>
          {/* 7-Day Streak Counter -> Opens Daily Goal & Heatmap */}
          <Pressable
            focusable={false}
            onPress={() => {
              onStreakPress?.();
            }}
            style={({ pressed }) => [
              styles.streakBadge,
              {
                backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5',
                borderColor: colors.primary,
                paddingHorizontal: isCompact ? 5 : 7,
                paddingVertical: isCompact ? 4 : 5,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
            accessibilityLabel="Daily Goal and 7-day Streak"
          >
            <Flame color={colors.primary} size={isCompact ? 12 : 14} />
            <Text style={[styles.streakText, { color: colors.primary, fontSize: isCompact ? 10.5 : 11.5 }]}>
              {streakDays}d
            </Text>
          </Pressable>

          {/* Quick Floating Calculator */}
          {onQuickCalcPress && (
            <Pressable
              focusable={false}
              onPress={() => {
                onQuickCalcPress();
              }}
              style={({ pressed }) => [
                styles.iconButton,
                compactBtnStyle,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
              accessibilityLabel="Open Quick Scientific Calculator"
            >
              <Calculator color={colors.cyan} size={iconSize} />
            </Pressable>
          )}

          {/* Study Clubs & Institute Platform */}
          {onClubsPress && (
            <Pressable
              focusable={false}
              onPress={() => {
                onClubsPress();
              }}
              style={({ pressed }) => [
                styles.iconButton,
                compactBtnStyle,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
              accessibilityLabel="Open Study Clubs and Institutes"
            >
              <Users color={colors.success} size={iconSize} />
            </Pressable>
          )}

          {/* 7-Day Leaderboard Trophy */}
          {onLeaderboardPress && (
            <Pressable
              focusable={false}
              onPress={() => {
                onLeaderboardPress();
              }}
              style={({ pressed }) => [
                styles.iconButton,
                compactBtnStyle,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
              accessibilityLabel="7-Day Weekly Leaderboard"
            >
              <Trophy color={colors.warning} size={iconSize} />
            </Pressable>
          )}

          {/* Sound & Effects Settings */}
          <Pressable
            focusable={false}
            onPress={() => {
              setSettingsOpen(true);
            }}
            style={({ pressed }) => [
              styles.iconButton,
              compactBtnStyle,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.72 : 1,
              },
            ]}
            accessibilityLabel="Sound and effects settings"
          >
            <Sliders color={colors.primary} size={iconSize} />
          </Pressable>

          {/* Theme Toggle */}
          <Pressable
            focusable={false}
            onPress={() => {
              toggleTheme();
            }}
            style={({ pressed }) => [
              styles.iconButton,
              compactBtnStyle,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.72 : 1,
              },
            ]}
            accessibilityLabel="Toggle light and dark mode"
          >
            {mode === 'dark' ? (
              <Sun color={colors.warning} size={iconSize} />
            ) : (
              <Moon color={colors.textSecondary} size={iconSize} />
            )}
          </Pressable>
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
    borderRadius: 12,
    overflow: 'hidden',
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
    overflow: 'hidden',
  },
  streakText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
});

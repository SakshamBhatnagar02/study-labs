import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import { Sun, Moon, Flame, Sparkles } from 'lucide-react-native';

interface HeaderProps {
  userIoId?: string;
  streakDays?: number;
  onProfilePress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userIoId = 'STUDY-7734-IO',
  streakDays = 14,
  onProfilePress,
}) => {
  const { colors, mode, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.borderSubtle }]}>
      {/* Brand & Identity */}
      <View style={styles.brandRow}>
        <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
          <Sparkles color="#FFFFFF" size={18} />
        </View>
        <View>
          <View style={styles.titleRow}>
            <Text style={[styles.brandTitle, { color: colors.text }]}>Study</Text>
            <Text style={[styles.brandTitleOrange, { color: colors.primary }]}>Labs</Text>
          </View>
          <Text style={[styles.companySubtitle, { color: colors.textSecondary }]}>study.io · {userIoId}</Text>
        </View>
      </View>

      {/* Action Badges */}
      <View style={styles.actionsRow}>
        {/* Streak Counter */}
        <View style={[styles.streakBadge, { backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5', borderColor: colors.primary }]}>
          <Flame color={colors.primary} size={16} />
          <Text style={[styles.streakText, { color: colors.primary }]}>{streakDays}d</Text>
        </View>

        {/* Theme Toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          activeOpacity={0.7}
          style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}
        >
          {mode === 'dark' ? (
            <Sun color={colors.warning} size={18} />
          ) : (
            <Moon color={colors.textSecondary} size={18} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandTitleOrange: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  companySubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});


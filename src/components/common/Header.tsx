import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../theme';
import { Sun, Moon, Flame, Sliders } from 'lucide-react-native';
import { SettingsModal } from '../settings/SettingsModal';

interface HeaderProps {
  userIoId?: string;
  streakDays?: number;
  onProfilePress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userIoId = 'STUDY-7734-IO',
  streakDays = 14,
}) => {
  const { colors, mode, toggleTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.borderSubtle }]}>
        {/* Brand & Cyber Logo Identity */}
        <View style={styles.brandRow}>
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
            <Text style={[styles.companySubtitle, { color: colors.textSecondary }]}>study.io · {userIoId}</Text>
          </View>
        </View>

        {/* Action Badges */}
        <View style={styles.actionsRow}>
          {/* Streak Counter */}
          <View style={[styles.streakBadge, { backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5', borderColor: colors.primary }]}>
            <Flame color={colors.primary} size={15} />
            <Text style={[styles.streakText, { color: colors.primary }]}>{streakDays}d</Text>
          </View>

          {/* Sound & Effects Settings */}
          <TouchableOpacity
            onPress={() => setSettingsOpen(true)}
            activeOpacity={0.7}
            style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}
            accessibilityLabel="Sound and effects settings"
          >
            <Sliders color={colors.primary} size={16} />
          </TouchableOpacity>

          {/* Theme Toggle */}
          <TouchableOpacity
            onPress={toggleTheme}
            activeOpacity={0.7}
            style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}
            accessibilityLabel="Toggle light and dark mode"
          >
            {mode === 'dark' ? (
              <Sun color={colors.warning} size={16} />
            ) : (
              <Moon color={colors.textSecondary} size={16} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Global Settings Modal */}
      <SettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  logoWrapper: {
    width: 38,
    height: 38,
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
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

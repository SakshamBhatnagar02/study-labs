import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { HOLO_REACTIONS } from '../../utils/avatarHelper';
import {
  Home,
  BookOpen,
  ClipboardCheck,
  BookMarked,
  Calculator,
  Sparkles,
} from 'lucide-react-native';

export type NavTab =
  | 'dashboard'
  | 'study'
  | 'test'
  | 'tracker'
  | 'analytics'
  | 'syllabus'
  | 'playground'
  | 'tools'
  | 'ai'
  | 'leaderboard'
  | 'dailyGoal'
  | 'notebooks'
  | 'clubs'
  | 'profile'
  | 'ebooks'
  | 'community'
  | 'admin'
  | 'pyqs'
  | 'calendar';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  const tabs: { key: NavTab; label: string; Icon: any; useHolo?: boolean }[] = [
    { key: 'dashboard', label: 'Home', Icon: Home },
    { key: 'study', label: 'Learn', Icon: BookOpen },
    { key: 'test', label: 'Tests', Icon: ClipboardCheck },
    { key: 'notebooks', label: 'Notebooks', Icon: BookMarked },
    { key: 'tools', label: 'Tools', Icon: Calculator },
    { key: 'ai', label: 'HOLO AI', Icon: Sparkles, useHolo: true },
  ];

  return (
    <View
      style={[
        styles.navContainer,
        {
          backgroundColor: mode === 'dark' ? '#111620' : colors.card,
          borderTopColor: colors.border,
          shadowColor: colors.shadow,
          paddingBottom: bottomPad,
          minHeight: 58 + bottomPad,
        },
      ]}
    >
      {tabs.map(({ key, label, Icon, useHolo }) => {
        const isActive =
          activeTab === key ||
          (key === 'dashboard' &&
            (activeTab === 'leaderboard' ||
              activeTab === 'dailyGoal' ||
              activeTab === 'clubs' ||
              activeTab === 'profile' ||
              activeTab === 'admin')) ||
          (key === 'study' &&
            (activeTab === 'syllabus' ||
              activeTab === 'ebooks' ||
              activeTab === 'community' ||
              activeTab === 'pyqs')) ||
          (key === 'notebooks' && (activeTab === 'tracker' || activeTab === 'analytics')) ||
          (key === 'tools' && (activeTab === 'playground' || activeTab === 'calendar'));

        const iconColor = isActive ? colors.primary : colors.textSecondary;

        return (
          <Pressable
            key={key}
            focusable={false}
            onPress={() => onTabChange(key)}
            style={({ pressed }) => [styles.tabButton, pressed && { opacity: 0.72 }]}
          >
            <View
              style={[
                styles.iconWrapper,
                isActive && {
                  backgroundColor: mode === 'dark' ? 'rgba(249, 115, 22, 0.16)' : '#FFEDD5',
                  borderColor: 'rgba(249, 115, 22, 0.35)',
                  borderWidth: 1,
                },
              ]}
            >
              {useHolo ? (
                <Image
                  source={isActive ? HOLO_REACTIONS.waving : HOLO_REACTIONS.idle}
                  style={{ width: 21, height: 21 }}
                  resizeMode="contain"
                />
              ) : (
                <Icon size={19} color={iconColor} strokeWidth={isActive ? 2.4 : 1.9} />
              )}
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.tabLabel,
                {
                  color: isActive ? colors.primary : colors.textSecondary,
                  fontWeight: isActive ? '800' : '600',
                },
              ]}
            >
              {label}
            </Text>
            {isActive && (
              <View style={[styles.activeBar, { backgroundColor: colors.primary }]} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 4,
    paddingTop: 6,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingBottom: 5,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  activeBar: {
    position: 'absolute',
    bottom: 0,
    width: '60%',
    height: 2.5,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  iconWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.1,
  },
});

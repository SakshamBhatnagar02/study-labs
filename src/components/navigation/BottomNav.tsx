import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  LineChart, 
  Calculator, 
  Sparkles 
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
  | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { colors, mode } = useTheme();

  // Primary bottom navigation items (6 items for perfect ergonomics)
  const tabs: { key: NavTab; label: string; Icon: any }[] = [
    { key: 'dashboard', label: 'Home', Icon: LayoutDashboard },
    { key: 'study', label: 'Curriculum', Icon: BookOpen },
    { key: 'test', label: 'Tests', Icon: CheckSquare },
    { key: 'tracker', label: 'Coaching', Icon: LineChart },
    { key: 'tools', label: 'Tools', Icon: Calculator },
    { key: 'ai', label: 'AI Tutor', Icon: Sparkles },
  ];

  return (
    <View
      style={[
        styles.navContainer,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      {tabs.map(({ key, label, Icon }) => {
        // Highlighting active state including sub-tabs
        const isActive = 
          activeTab === key || 
          (key === 'dashboard' && (activeTab === 'leaderboard' || activeTab === 'dailyGoal' || activeTab === 'profile')) ||
          (key === 'tracker' && activeTab === 'analytics') ||
          (key === 'study' && (activeTab === 'syllabus' || activeTab === 'notebooks')) ||
          (key === 'tools' && activeTab === 'playground');

        const iconColor = isActive ? colors.primary : colors.textSecondary;

        return (
          <TouchableOpacity
            key={key}
            activeOpacity={0.7}
            onPress={() => {
              onTabChange(key);
            }}
            style={styles.tabButton}
          >
            <View
              style={[
                styles.iconWrapper,
                isActive && {
                  backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5',
                },
              ]}
            >
              <Icon size={20} color={iconColor} strokeWidth={isActive ? 2.5 : 2} />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? colors.primary : colors.textSecondary,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
    paddingHorizontal: 6,
    paddingBottom: 4,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10.5,
    letterSpacing: 0.2,
  },
});

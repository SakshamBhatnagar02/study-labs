import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { NavTab } from './BottomNav';
import {
  BRANDING_ASSETS,
  HOLO_NAME,
  HOLO_REACTIONS,
  resolveAvatarSource,
} from '../../utils/avatarHelper';
import { UserProfile } from '../../types';
import {
  BookMarked,
  BookOpen,
  Calculator,
  Calendar,
  ClipboardCheck,
  Flame,
  Home,
  Layers,
  Library,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sun,
  Trophy,
  User,
  Users,
} from 'lucide-react-native';

interface DesktopSidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  profile: UserProfile;
  streakDays: number;
  onOpenSettings: () => void;
}

interface SidebarItem {
  key: NavTab;
  label: string;
  Icon: any;
  useHolo?: boolean;
  matchTabs?: NavTab[];
}

const PRIMARY_ITEMS: SidebarItem[] = [
  { key: 'dashboard', label: 'Home', Icon: Home, matchTabs: ['dashboard', 'dailyGoal', 'admin'] },
  { key: 'pyqs', label: 'PYQ Bank', Icon: Layers },
  { key: 'test', label: 'Tests', Icon: ClipboardCheck },
  { key: 'study', label: 'Learn & Formulas', Icon: BookOpen, matchTabs: ['study', 'syllabus', 'community'] },
  { key: 'notebooks', label: 'Notebooks', Icon: BookMarked, matchTabs: ['notebooks', 'tracker', 'analytics'] },
  { key: 'ai', label: `${HOLO_NAME} AI`, Icon: null, useHolo: true },
  { key: 'tools', label: 'Tools & 3D Lab', Icon: Calculator, matchTabs: ['tools', 'playground'] },
];

const EXPLORE_ITEMS: SidebarItem[] = [
  { key: 'clubs', label: 'Study Clubs', Icon: Users },
  { key: 'ebooks', label: 'E-Books Library', Icon: Library },
  { key: 'calendar', label: 'Exam Calendar', Icon: Calendar },
  { key: 'leaderboard', label: 'Leaderboard', Icon: Trophy },
  { key: 'profile', label: 'My Profile', Icon: User },
];

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  profile,
  streakDays,
  onOpenSettings,
}) => {
  const { colors, mode, toggleTheme } = useTheme();
  const sidebarBg = mode === 'dark' ? '#0D121D' : '#FFFFFF';
  const activeBg = mode === 'dark' ? 'rgba(249, 115, 22, 0.16)' : '#FFF7ED';
  const hoverBg = mode === 'dark' ? 'rgba(148, 163, 184, 0.08)' : '#F8FAFC';

  const isItemActive = (item: SidebarItem) => {
    if (activeTab === item.key) return true;
    return item.matchTabs ? item.matchTabs.includes(activeTab) : false;
  };

  const renderNavItem = (item: SidebarItem) => {
    const active = isItemActive(item);
    const IconComp = item.Icon;
    return (
      <Pressable
        key={item.key}
        focusable={false}
        onPress={() => onTabChange(item.key)}
        accessibilityRole="button"
        accessibilityLabel={item.label}
        style={({ pressed }) => [
          styles.navPill,
          collapsed && styles.navPillCollapsed,
          {
            backgroundColor: active ? activeBg : pressed ? hoverBg : 'transparent',
            borderColor: active ? 'rgba(249, 115, 22, 0.34)' : 'transparent',
          },
        ]}
      >
        {active && <View style={[styles.activeAccentBar, { backgroundColor: colors.primary }]} />}
        <View style={styles.iconBox}>
          {item.useHolo ? (
            <Image
              source={active ? HOLO_REACTIONS.waving : HOLO_REACTIONS.idle}
              style={{ width: 22, height: 22 }}
              resizeMode="contain"
            />
          ) : (
            <IconComp
              size={20}
              color={active ? colors.primary : colors.textSecondary}
              strokeWidth={active ? 2.3 : 1.9}
            />
          )}
        </View>
        {!collapsed && (
          <Text
            numberOfLines={1}
            style={[
              styles.navLabel,
              {
                color: active ? colors.primary : colors.text,
                fontWeight: active ? '800' : '600',
              },
            ]}
          >
            {item.label}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.sidebar,
        {
          width: collapsed ? 72 : 256,
          backgroundColor: sidebarBg,
          borderRightColor: colors.border,
        },
      ]}
    >
      {/* Top Brand Header (MARKS 76-80px head slot) */}
      <View
        style={[
          styles.brandHead,
          collapsed && styles.brandHeadCollapsed,
          { borderBottomColor: colors.border },
        ]}
      >
        <Pressable
          focusable={false}
          onPress={() => onTabChange('dashboard')}
          style={styles.brandTap}
          accessibilityLabel="Study Labs Home"
        >
          <View style={[styles.logoBox, { borderColor: colors.primary }]}>
            <Image source={BRANDING_ASSETS.appLogo} style={styles.logoImg} resizeMode="cover" />
          </View>
          {!collapsed && (
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.brandText, { color: colors.text }]}>Study </Text>
                <Text style={[styles.brandText, { color: colors.primary }]}>Labs</Text>
              </View>
              <Text style={[styles.brandSub, { color: colors.textSecondary }]} numberOfLines={1}>
                study.io · STEM Workspace
              </Text>
            </View>
          )}
        </Pressable>

        {!collapsed && (
          <Pressable
            focusable={false}
            onPress={onToggleCollapse}
            style={({ pressed }) => [
              styles.collapseBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.72 : 1,
              },
            ]}
            accessibilityLabel="Collapse sidebar"
          >
            <PanelLeftClose size={16} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {collapsed && (
        <Pressable
          focusable={false}
          onPress={onToggleCollapse}
          style={({ pressed }) => [
            styles.expandRailBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
          accessibilityLabel="Expand sidebar"
        >
          <PanelLeftOpen size={16} color={colors.textSecondary} />
        </Pressable>
      )}

      {/* Scrollable Navigation Body */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.navBody, collapsed && styles.navBodyCollapsed]}
        showsVerticalScrollIndicator={false}
      >
        {!collapsed && (
          <Text style={[styles.sectionEyebrow, { color: colors.textSecondary }]}>PRACTICE & STUDY</Text>
        )}
        {PRIMARY_ITEMS.map(renderNavItem)}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {!collapsed && (
          <Text style={[styles.sectionEyebrow, { color: colors.textSecondary }]}>COMMUNITY & WORKSPACE</Text>
        )}
        {EXPLORE_ITEMS.map(renderNavItem)}
      </ScrollView>

      {/* Pinned Footer: Theme Switch (Shift+D), Settings & User Profile Chip */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Pressable
          focusable={false}
          onPress={toggleTheme}
          style={({ pressed }) => [
            styles.footerAction,
            collapsed && styles.footerActionCollapsed,
            {
              backgroundColor: pressed ? hoverBg : colors.surface,
              borderColor: colors.border,
            },
          ]}
          accessibilityLabel="Toggle light and dark theme"
        >
          {mode === 'dark' ? (
            <Sun size={17} color="#F59E0B" />
          ) : (
            <Moon size={17} color={colors.textSecondary} />
          )}
          {!collapsed && (
            <>
              <Text style={[styles.footerActionText, { color: colors.text, flex: 1 }]}>
                {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Text>
              {Platform.OS === 'web' && (
                <View style={[styles.kbdChip, { borderColor: colors.border, backgroundColor: sidebarBg }]}>
                  <Text style={[styles.kbdText, { color: colors.textSecondary }]}>⇧D</Text>
                </View>
              )}
            </>
          )}
        </Pressable>

        <Pressable
          focusable={false}
          onPress={onOpenSettings}
          style={({ pressed }) => [
            styles.footerAction,
            collapsed && styles.footerActionCollapsed,
            {
              backgroundColor: pressed ? hoverBg : 'transparent',
              borderColor: 'transparent',
            },
          ]}
          accessibilityLabel="Open sound and app settings"
        >
          <Settings size={17} color={colors.textSecondary} />
          {!collapsed && (
            <Text style={[styles.footerActionText, { color: colors.textSecondary, flex: 1 }]}>
              Settings & Audio
            </Text>
          )}
        </Pressable>

        {/* Compact Scholar Identity Pill */}
        <Pressable
          focusable={false}
          onPress={() => onTabChange('profile')}
          style={({ pressed }) => [
            styles.userCard,
            collapsed && styles.userCardCollapsed,
            {
              backgroundColor: mode === 'dark' ? '#141B29' : '#F8FAFC',
              borderColor: colors.border,
              opacity: pressed ? 0.82 : 1,
            },
          ]}
          accessibilityLabel="Open My Profile"
        >
          <Image
            source={resolveAvatarSource(profile.avatarUri) || BRANDING_ASSETS.appLogo}
            style={styles.userAvatar}
          />
          {!collapsed && (
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                {profile.name || 'Study Labs Scholar'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 }}>
                <Text style={[styles.userMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                  {profile.targetExams?.[0] || 'JEE / NEET'}
                </Text>
                <View style={styles.miniStreak}>
                  <Flame size={11} color={colors.primary} />
                  <Text style={[styles.miniStreakText, { color: colors.primary }]}>{streakDays}d</Text>
                </View>
              </View>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    height: '100%',
    borderRightWidth: 1,
    flexDirection: 'column',
  },
  brandHead: {
    height: 72,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    gap: 8,
  },
  brandHeadCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  brandTap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: '#090D16',
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  brandText: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  brandSub: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  collapseBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandRailBtn: {
    alignSelf: 'center',
    marginTop: 10,
    width: 36,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBody: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 4,
  },
  navBodyCollapsed: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.9,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 6,
  },
  navPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  navPillCollapsed: {
    width: 48,
    height: 44,
    paddingHorizontal: 0,
    justifyContent: 'center',
    gap: 0,
  },
  activeAccentBar: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  iconBox: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 13.5,
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 10,
    marginHorizontal: 8,
    opacity: 0.7,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    gap: 6,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  footerActionCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
    width: 46,
    height: 40,
    alignSelf: 'center',
  },
  footerActionText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  kbdChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  kbdText: {
    fontSize: 10,
    fontWeight: '800',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 2,
  },
  userCardCollapsed: {
    padding: 4,
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 999,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 999,
  },
  userName: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  userMeta: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  miniStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  miniStreakText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
});

import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { NavTab } from './BottomNav';
import { BRANDING_ASSETS, resolveAvatarSource } from '../../utils/avatarHelper';
import type { UserProfile } from '../../types';
import {
  Bell,
  BookOpen,
  ChevronRight,
  Moon,
  Settings,
  Shield,
  Shuffle,
  Sun,
  Users,
  X,
} from 'lucide-react-native';

interface SideDrawerModalProps {
  visible: boolean;
  onClose: () => void;
  profile: UserProfile;
  onNavigate: (tab: NavTab) => void;
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
}

export const SideDrawerModal: React.FC<SideDrawerModalProps> = ({
  visible,
  onClose,
  profile,
  onNavigate,
  onOpenSettings,
  onOpenOnboarding,
}) => {
  const { colors, mode, setTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const avatarSrc = resolveAvatarSource(profile.avatarUri);
  const displayName = profile.name?.trim() || 'Scholar';

  const handleGo = (tab: NavTab) => {
    onClose();
    onNavigate(tab);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdropRow}>
        <View
          style={[
            styles.drawerPanel,
            {
              backgroundColor: mode === 'dark' ? '#121721' : '#FFFFFF',
              borderRightColor: colors.border,
              paddingTop: Math.max(insets.top + 14, 24),
              paddingBottom: Math.max(insets.bottom + 16, 22),
            },
          ]}
        >
          {/* Top Close Row */}
          <View style={styles.closeRow}>
            <Text style={[styles.menuCaption, { color: colors.textSecondary }]}>STUDY LABS MENU</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* MARKS-style Profile Card */}
          <Pressable
            focusable={false}
            onPress={() => handleGo('profile')}
            style={({ pressed }) => [
              styles.profileCard,
              {
                backgroundColor: mode === 'dark' ? '#1B2230' : '#FFF7ED',
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <View style={[styles.avatarCircle, { backgroundColor: profile.avatarColor || colors.primary }]}>
              {avatarSrc ? (
                <Image source={avatarSrc} style={{ width: 46, height: 46 }} resizeMode="cover" />
              ) : (
                <Text style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.profileName, { color: colors.text }]} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={[styles.viewProfileLink, { color: colors.primary }]}>
                View Profile ›
              </Text>
            </View>
          </Pressable>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.navList}>
            {/* Stream / Target Exam Switcher */}
            <TouchableOpacity
              onPress={() => {
                onClose();
                onOpenOnboarding();
              }}
              style={styles.menuItem}
              activeOpacity={0.75}
            >
              <Shuffle size={19} color={colors.text} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Stream</Text>
              <View style={[styles.streamBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.streamBadgeText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {(profile.stream || 'ENGINEERING').toUpperCase().slice(0, 14)}
                </Text>
              </View>
              <ChevronRight size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Notifications / Daily Goal Alerts */}
            <TouchableOpacity
              onPress={() => handleGo('dailyGoal')}
              style={styles.menuItem}
              activeOpacity={0.75}
            >
              <Bell size={19} color={colors.text} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Notifications & Goal</Text>
              <ChevronRight size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Study Clubs */}
            <TouchableOpacity
              onPress={() => handleGo('clubs')}
              style={styles.menuItem}
              activeOpacity={0.75}
            >
              <Users size={19} color={colors.success} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Study Clubs & Faculty</Text>
              <ChevronRight size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* E-Books & Library */}
            <TouchableOpacity
              onPress={() => handleGo('ebooks')}
              style={styles.menuItem}
              activeOpacity={0.75}
            >
              <BookOpen size={19} color={colors.primary} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Digital E-Books Vault</Text>
              <ChevronRight size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Settings */}
            <TouchableOpacity
              onPress={() => {
                onClose();
                onOpenSettings();
              }}
              style={styles.menuItem}
              activeOpacity={0.75}
            >
              <Settings size={19} color={colors.text} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Audio, Haptics & View Settings</Text>
              <ChevronRight size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Admin Console */}
            <TouchableOpacity
              onPress={() => handleGo('admin')}
              style={styles.menuItem}
              activeOpacity={0.75}
            >
              <Shield size={19} color={colors.info} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Admin & Storage Telemetry</Text>
              <ChevronRight size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* MARKS-style Theme Picker Row */}
            <View style={[styles.themeSection, { borderTopColor: colors.borderSubtle }]}>
              <Text style={[styles.themeHeading, { color: colors.text }]}>Theme</Text>
              <View style={styles.themeCirclesRow}>
                <TouchableOpacity
                  onPress={() => setTheme('light')}
                  style={styles.themeChoice}
                >
                  <View
                    style={[
                      styles.themeCircle,
                      {
                        backgroundColor: '#FFF7ED',
                        borderColor: mode === 'light' ? colors.primary : colors.border,
                        borderWidth: mode === 'light' ? 2.5 : 1,
                      },
                    ]}
                  >
                    <Sun size={18} color="#EA580C" />
                  </View>
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: mode === 'light' ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    Light
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setTheme('dark')}
                  style={styles.themeChoice}
                >
                  <View
                    style={[
                      styles.themeCircle,
                      {
                        backgroundColor: '#1E293B',
                        borderColor: mode === 'dark' ? colors.primary : colors.border,
                        borderWidth: mode === 'dark' ? 2.5 : 1,
                      },
                    ]}
                  >
                    <Moon size={18} color="#F97316" />
                  </View>
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: mode === 'dark' ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    Dark
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Study Labs & study.io Footer Brand Mark */}
          <View style={[styles.drawerFooter, { borderTopColor: colors.borderSubtle }]}>
            <Image
              source={BRANDING_ASSETS.companyLogo}
              style={styles.companyLogo}
              resizeMode="contain"
            />
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.footerBrand, { color: colors.text }]}>STUDY LABS</Text>
              <Text style={[styles.footerVersion, { color: colors.textSecondary }]}>
                by study.io · v1.0.0
              </Text>
            </View>
          </View>
        </View>

        {/* Tap outside to dismiss */}
        <Pressable style={styles.dimOverlay} onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropRow: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerPanel: {
    width: '80%',
    maxWidth: 320,
    height: '100%',
    borderRightWidth: 1,
    paddingHorizontal: 16,
  },
  dimOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.62)',
  },
  closeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  menuCaption: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
  },
  closeBtn: {
    padding: 4,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
  },
  viewProfileLink: {
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 2,
  },
  navList: {
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 4,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '700',
  },
  streamBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 105,
  },
  streamBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  themeSection: {
    marginTop: 14,
    paddingTop: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeHeading: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  themeCirclesRow: {
    flexDirection: 'row',
    gap: 16,
  },
  themeChoice: {
    alignItems: 'center',
    gap: 5,
  },
  themeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  drawerFooter: {
    borderTopWidth: 1,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  companyLogo: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },
  footerBrand: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  footerVersion: {
    fontSize: 10.5,
    fontWeight: '600',
  },
});

import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { DailyGoalModal } from '../components/common/DailyGoalModal';
import { NavTab } from '../components/navigation/BottomNav';
import { DEFAULT_DAILY_GOAL, DEFAULT_USER, StorageService } from '../services/storage';
import { SoundManager } from '../services/soundManager';
import { HapticManager } from '../services/hapticManager';
import { BOARD_DISPLAY_NAMES } from '../data/curriculumData';
import { evaluateAchievementBadges } from '../utils/gamificationEngine';
import { computeStorageQuotaUsage, formatByteSize, PLAN_CONFIGS } from '../utils/aiImageLibrary';
import { GravatarService } from '../utils/gravatarService';
import { compressImage, formatBytes } from '../utils/imageCompressor';
import { GravatarLogo } from '../components/common/GravatarLogo';
import {
  AcademicStream,
  DailyGoalConfig,
  GeneratedStemImage,
  QuestionAttemptStat,
  UserPlanTier,
  UserProfile,
} from '../types';
import {
  aggregateDailyActivity,
  computeHistorySummary,
  computeStreakAndWeek,
  formatDurationShort,
} from '../utils/activityStats';
import { PRESET_AVATARS, resolveAvatarSource } from '../utils/avatarHelper';
import {
  AlertCircle,
  Award,
  Bell,
  BookMarked,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Flame,
  Globe,
  LogOut,
  MessageSquare,
  Moon,
  Pencil,
  Shield,
  ShieldCheck,
  Sun,
  Target,
  Trophy,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react-native';

interface ProfileScreenProps {
  onNavigate: (tab: NavTab) => void;
  onOpenOnboarding?: () => void;
  onProfileUpdated?: (profile: UserProfile) => void;
}

const STREAM_OPTIONS: AcademicStream[] = [
  'Science (PCM)',
  'Science (PCB)',
  'Science (PCMB)',
  'General STEM',
];

const CLASS_OPTIONS = ['Class 11', 'Class 12', 'Dropper'];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigate,
  onOpenOnboarding,
  onProfileUpdated,
}) => {
  const { colors, mode, setTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER);
  const [goalConfig, setGoalConfig] = useState<DailyGoalConfig>(DEFAULT_DAILY_GOAL);
  const [logs, setLogs] = useState<QuestionAttemptStat[]>([]);
  const [savedImages, setSavedImages] = useState<GeneratedStemImage[]>([]);
  const [planTier, setPlanTier] = useState<UserPlanTier>('free');
  const [joinedClubsCount, setJoinedClubsCount] = useState<number>(2);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [historyRange, setHistoryRange] = useState<'week' | 'month' | 'quarter'>('week');

  // Edit fields
  const [draftName, setDraftName] = useState(DEFAULT_USER.name);
  const [draftEmail, setDraftEmail] = useState(DEFAULT_USER.email);
  const [draftClass, setDraftClass] = useState(DEFAULT_USER.classGrade);
  const [draftStream, setDraftStream] = useState<AcademicStream>(DEFAULT_USER.stream);
  const [draftYear, setDraftYear] = useState(String(DEFAULT_USER.targetYear || 2027));
  const [draftAvatarColor, setDraftAvatarColor] = useState(DEFAULT_USER.avatarColor || '#F97316');
  const [draftAvatarUri, setDraftAvatarUri] = useState<string | undefined>(DEFAULT_USER.avatarUri);

  // Avatar picker, compression & Gravatar state
  const [avatarCompressionNotice, setAvatarCompressionNotice] = useState<string | null>(null);
  const [gravatarChecking, setGravatarChecking] = useState(false);
  const [gravatarAvailable, setGravatarAvailable] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadData = useCallback(async () => {
    const [prof, cfg, attemptLogs, imgs, tier, clubsWs] = await Promise.all([
      StorageService.getUserProfile(),
      StorageService.getDailyGoalConfig(),
      StorageService.getAttemptLogs(),
      StorageService.getGeneratedImages(),
      StorageService.getUserPlanTier(),
      StorageService.getClubsWorkspace(),
    ]);
    setProfile(prof);
    setGoalConfig(cfg);
    setLogs(attemptLogs);
    setSavedImages(imgs);
    setPlanTier(tier);
    setJoinedClubsCount(clubsWs.joinedClubIds.length);
    setDraftName(prof.name);
    setDraftEmail(prof.email || '');
    setDraftClass(prof.classGrade);
    setDraftStream(prof.stream);
    setDraftYear(String(prof.targetYear || 2027));
    setDraftAvatarColor(prof.avatarColor || '#F97316');
    setDraftAvatarUri(prof.avatarUri);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check Gravatar availability when draftEmail changes
  useEffect(() => {
    if (!draftEmail.trim() || !draftEmail.includes('@')) {
      setGravatarAvailable(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setGravatarChecking(true);
        const hasGrav = await GravatarService.checkHasGravatar(draftEmail);
        setGravatarAvailable(hasGrav);
      } catch {
        setGravatarAvailable(false);
      } finally {
        setGravatarChecking(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [draftEmail]);

  const handlePickCustomAvatar = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        const comp = await compressImage(res.assets[0].uri, {
          maxWidth: 512,
          maxHeight: 512,
          quality: 0.8,
        });
        setDraftAvatarUri(comp.compressedUri);
        setAvatarCompressionNotice(
          `Compressed ${formatBytes(comp.originalSizeBytes)} → ${formatBytes(comp.compressedSizeBytes)} (${comp.savingsPercentage}% space saved)`
        );
        HapticManager.triggerSelection();
        SoundManager.play('click');
      }
    } catch {
      setAvatarCompressionNotice('Gallery picker not available; select a Scholar preset or Gravatar.');
    }
  };

  const handleFetchGravatar = () => {
    if (!draftEmail.trim() || !draftEmail.includes('@')) {
      setAvatarCompressionNotice('Please enter a valid email above to fetch Gravatar photo.');
      return;
    }
    const gravUri = `gravatar:${draftEmail.trim()}`;
    setDraftAvatarUri(gravUri);
    setAvatarCompressionNotice('Linked live Gravatar avatar (SHA-256 resolved).');
    HapticManager.triggerSuccess();
    SoundManager.play('click');
  };

  const handleLogout = async () => {
    try {
      const resetProfile: UserProfile = {
        ...DEFAULT_USER,
        id: `usr_guest_${Date.now().toString(36)}`,
        ioId: `STUDY-${Math.floor(1000 + Math.random() * 9000)}-IO`,
        name: 'Guest Scholar',
        email: 'guest@study.io',
        authProvider: 'guest',
        onboardingCompleted: false,
      };
      await StorageService.saveUserProfile(resetProfile);
      setProfile(resetProfile);
      setDraftName(resetProfile.name);
      setDraftEmail(resetProfile.email);
      setDraftClass(resetProfile.classGrade);
      setDraftStream(resetProfile.stream);
      setDraftAvatarColor(resetProfile.avatarColor || '#F97316');
      setDraftAvatarUri(undefined);
      setShowLogoutConfirm(false);
      onProfileUpdated?.(resetProfile);
      SoundManager.play('notify');
      HapticManager.triggerSelection();
    } catch {
      setShowLogoutConfirm(false);
    }
  };

  const dailyMap = aggregateDailyActivity(logs);
  const streakInfo = computeStreakAndWeek(
    dailyMap,
    goalConfig.targetQuestions,
    new Date(),
    profile.studyStreakDays
  );
  const historySummary = computeHistorySummary(logs, historyRange, 'all', new Date());
  const badges = evaluateAchievementBadges(logs, profile, goalConfig.targetQuestions, joinedClubsCount);
  const quotaSnap = computeStorageQuotaUsage(savedImages, planTier);
  const boardName = BOARD_DISPLAY_NAMES[profile.board || 'JEE_MAIN'] || 'Curriculum';

  const handleSaveProfile = async () => {
    const parsedYear = parseInt(draftYear, 10) || 2027;
    const updated: UserProfile = {
      ...profile,
      name: draftName.trim() || profile.name,
      email: draftEmail.trim() || profile.email,
      classGrade: draftClass,
      stream: draftStream,
      targetYear: parsedYear,
      avatarColor: draftAvatarColor,
      avatarUri: draftAvatarUri,
    };
    await StorageService.saveUserProfile(updated);
    setProfile(updated);
    onProfileUpdated?.(updated);
    setEditProfileOpen(false);
    SoundManager.play('notify');
    HapticManager.triggerSuccess();
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity Header Card */}
        <Card style={[styles.profileCard, { borderColor: colors.border }]}>
          <View style={styles.profileRow}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: profile.avatarColor || colors.primary, overflow: 'hidden' },
              ]}
            >
              {(() => {
                const avatarSrc = resolveAvatarSource(profile.avatarUri);
                if (avatarSrc) {
                  return (
                    <Image
                      source={avatarSrc}
                      style={{ width: 50, height: 50 }}
                      resizeMode="cover"
                    />
                  );
                }
                return (
                  <Text style={styles.avatarLetter}>{profile.name.charAt(0).toUpperCase()}</Text>
                );
              })()}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.profileName, { color: colors.text }]}>{profile.name}</Text>
              <Text style={[styles.profileMeta, { color: colors.textSecondary }]}>
                {profile.classGrade} · {profile.stream} · {boardName} ({profile.country || 'India'})
              </Text>
              <Text style={[styles.profileMeta, { color: colors.textSecondary }]}>
                {profile.language || 'English'} · Mode: {profile.preferredMode || 'Normal'} · Auth:{' '}
                {(profile.authProvider || 'guest').toUpperCase()}
              </Text>
              <View style={styles.badgeRow}>
                <Badge label={profile.ioId} variant="primary" size="sm" />
                <Badge label={`LVL ${profile.level} · ${profile.totalXp} XP`} variant="neutral" size="sm" />
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setEditProfileOpen(true)}
              style={[
                styles.editPillBtn,
                { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
              ]}
            >
              <Pencil size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {onOpenOnboarding && (
            <Button
              title="Global Curriculum, Language & Account SSO Setup"
              variant="outline"
              size="sm"
              onPress={onOpenOnboarding}
              icon={<Globe size={14} color={colors.primary} />}
              style={{ marginTop: 12 }}
            />
          )}
        </Card>

        {/* Quick Hub Links */}
        <View style={styles.quickNavCard}>
          {[
            {
              tab: 'clubs' as const,
              title: 'Study Clubs & Teacher Platform',
              sub: `${joinedClubsCount} joined cohorts · Channels, assignments & attendance`,
              Icon: Users,
              tint: colors.success,
            },
            {
              tab: 'dailyGoal' as const,
              title: 'Daily Goal & Contribution Heatmap',
              sub: `${streakInfo.todaySolved}/${goalConfig.targetQuestions} Qs solved today · ${streakInfo.currentStreakDays}d streak`,
              Icon: Target,
              tint: colors.primary,
            },
            {
              tab: 'leaderboard' as const,
              title: '7-Day Weekly Leaderboard & League',
              sub: 'Check weekly rank, league progression & XP gap',
              Icon: Trophy,
              tint: colors.warning,
            },
            {
              tab: 'notebooks' as const,
              title: 'My Notebooks & Question Notes',
              sub: 'Saved custom notebooks, smart bookmarks & notes',
              Icon: BookMarked,
              tint: colors.cyan,
            },
            {
              tab: 'ebooks' as const,
              title: 'Digital E-Books & Offline Shelf',
              sub: 'Read textbooks with KaTeX math, quizzes & AI Book Companion',
              Icon: BookOpen,
              tint: colors.primary,
            },
            {
              tab: 'community' as const,
              title: 'Community Hub & Doubt Exchange',
              sub: 'Ask STEM questions with LaTeX, answer doubts & share notes',
              Icon: MessageSquare,
              tint: colors.success,
            },
            {
              tab: 'admin' as const,
              title: 'StudyLabs Admin Console',
              sub: 'Resource moderation queue, security threat center & cloud telemetry',
              Icon: ShieldCheck,
              tint: colors.warning,
            },
          ].map(({ tab, title, sub, Icon, tint }) => (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.75}
              onPress={() => onNavigate(tab)}
              style={[
                styles.navRowCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={[styles.navIconWrap, { backgroundColor: colors.surface }]}>
                <Icon size={18} color={tint} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.navSub, { color: colors.textSecondary }]}>{sub}</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Compact Mon-Sun Consistency Strip */}
        <Card style={styles.streakCard}>
          <View style={styles.streakTop}>
            <View style={styles.iconTextRow}>
              <Flame size={17} color={colors.primary} />
              <Text style={[styles.cardHeading, { color: colors.text }]}>
                Daily Goal Streak · {streakInfo.currentStreakDays} Days
              </Text>
            </View>
            <TouchableOpacity onPress={() => onNavigate('dailyGoal')}>
              <Text style={[styles.linkText, { color: colors.primary }]}>View Heatmap →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.miniWeekRow}>
            {streakInfo.weekDays.map((d) => (
              <View key={d.date} style={styles.miniDay}>
                <Text style={[styles.miniDayName, { color: colors.textSecondary }]}>
                  {d.dayShort}
                </Text>
                <View
                  style={[
                    styles.miniDot,
                    {
                      backgroundColor: d.metGoal
                        ? colors.success
                        : d.questionsSolved > 0
                        ? colors.primary
                        : colors.surface,
                      borderColor: d.isToday ? colors.primary : colors.border,
                    },
                  ]}
                >
                  {d.metGoal ? (
                    <Check size={11} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <Text
                      style={{
                        fontSize: 9.5,
                        fontWeight: '700',
                        color: d.questionsSolved > 0 ? '#FFFFFF' : colors.textSecondary,
                      }}
                    >
                      {d.isFuture ? '-' : d.questionsSolved}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* History of Qs Solved */}
        <Card style={styles.historyCard}>
          <Text style={[styles.cardHeading, { color: colors.text, marginBottom: 10 }]}>
            History of Qs Solved
          </Text>
          <View
            style={[
              styles.rangeSwitch,
              { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle },
            ]}
          >
            {(
              [
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: 'quarter', label: 'Last 3 Months' },
              ] as const
            ).map((r) => {
              const active = historyRange === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => setHistoryRange(r.id)}
                  style={[styles.rangePill, active && { backgroundColor: colors.primary }]}
                >
                  <Text
                    style={{
                      fontSize: 11.5,
                      fontWeight: '700',
                      color: active ? '#FFFFFF' : colors.textSecondary,
                    }}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.kpiRow}>
            <View
              style={[
                styles.kpiTile,
                { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle },
              ]}
            >
              <Award size={16} color={colors.primary} />
              <Text style={[styles.kpiVal, { color: colors.text }]}>{historySummary.qsSolved}</Text>
              <Text style={[styles.kpiLbl, { color: colors.textSecondary }]}>Qs Solved</Text>
            </View>
            <View
              style={[
                styles.kpiTile,
                { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle },
              ]}
            >
              <Text style={[styles.kpiVal, { color: colors.info }]}>
                {formatDurationShort(historySummary.avgTimeSeconds)}
              </Text>
              <Text style={[styles.kpiLbl, { color: colors.textSecondary }]}>Avg Time / Qs</Text>
            </View>
            <View
              style={[
                styles.kpiTile,
                { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle },
              ]}
            >
              <Text style={[styles.kpiVal, { color: colors.success }]}>
                {historySummary.accuracyPercent}%
              </Text>
              <Text style={[styles.kpiLbl, { color: colors.textSecondary }]}>Accuracy</Text>
            </View>
          </View>
        </Card>

        {/* Achievement Badges & Visual Storage Tier */}
        <Card style={styles.historyCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={[styles.cardHeading, { color: colors.text }]}>
              Achievements ({badges.filter((b) => b.unlocked).length}/{badges.length})
            </Text>
            <TouchableOpacity onPress={() => onNavigate('leaderboard')}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Challenges →</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {badges.map((b) => (
              <View
                key={b.id}
                style={{
                  width: '48%',
                  padding: 9,
                  borderRadius: 12,
                  borderWidth: 1,
                  backgroundColor: colors.surface,
                  borderColor: b.unlocked ? b.color : colors.borderSubtle,
                  opacity: b.unlocked ? 1 : 0.65,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: b.unlocked ? b.color : colors.textSecondary }}>
                  {b.unlocked ? '★ ' : '○ '}{b.title}
                </Text>
                <Text style={{ fontSize: 10.5, color: colors.textSecondary, marginTop: 2 }}>
                  {b.progressLabel}
                </Text>
              </View>
            ))}
          </View>

          <View
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 12,
              borderWidth: 1,
              backgroundColor: colors.surface,
              borderColor: colors.borderSubtle,
              gap: 4,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Shield size={14} color={colors.primary} />
                <Text style={{ fontSize: 12.5, fontWeight: '800', color: colors.text }}>
                  {PLAN_CONFIGS[planTier].label} · AI Visual Vault
                </Text>
              </View>
              <Badge label={PLAN_CONFIGS[planTier].priceLabel} variant="neutral" size="sm" />
            </View>
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>
              {quotaSnap.imageCount} / {quotaSnap.maxImages} visuals saved · {formatByteSize(quotaSnap.usedBytes)} /{' '}
              {formatByteSize(quotaSnap.maxBytes)}
            </Text>
          </View>
        </Card>

        {/* Appearance & Notifications */}
        <Card style={styles.prefsCard}>
          <Text style={[styles.cardHeading, { color: colors.text, marginBottom: 12 }]}>
            Appearance & Score Alerts
          </Text>

          <View style={styles.themeRow}>
            <TouchableOpacity
              onPress={() => setTheme('light')}
              style={[
                styles.themeChip,
                {
                  backgroundColor: mode === 'light' ? colors.primary : colors.surface,
                  borderColor: mode === 'light' ? colors.primary : colors.border,
                },
              ]}
            >
              <Sun size={15} color={mode === 'light' ? '#FFFFFF' : colors.textSecondary} />
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 12.5,
                  color: mode === 'light' ? '#FFFFFF' : colors.text,
                }}
              >
                Light Mode
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTheme('dark')}
              style={[
                styles.themeChip,
                {
                  backgroundColor: mode === 'dark' ? colors.primary : colors.surface,
                  borderColor: mode === 'dark' ? colors.primary : colors.border,
                },
              ]}
            >
              <Moon size={15} color={mode === 'dark' ? '#FFFFFF' : colors.textSecondary} />
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 12.5,
                  color: mode === 'dark' ? '#FFFFFF' : colors.text,
                }}
              >
                Dark Cyber
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title={`Notifications & Reminder (${goalConfig.reminderEnabled ? goalConfig.reminderTime : 'Off'})`}
            variant="outline"
            size="md"
            onPress={() => setGoalModalOpen(true)}
            icon={<Bell size={15} color={colors.primary} />}
            style={{ marginTop: 12 }}
          />

          {/* Account Log Out / Switch Scholar Button */}
          <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingTop: 14 }}>
            <Button
              title="Log Out / Switch Account"
              variant="outline"
              size="md"
              onPress={() => setShowLogoutConfirm(true)}
              icon={<LogOut size={15} color={colors.error || '#EF4444'} />}
              style={{ borderColor: colors.error || '#EF4444' }}
            />
          </View>
        </Card>
      </ScrollView>

      {/* Logout Confirmation Dialog Modal */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.logoutDialog,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LogOut size={18} color="#EF4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                  Log Out of Study Labs?
                </Text>
                <Text style={{ fontSize: 11.5, color: colors.textSecondary }}>
                  Current user: {profile.name} ({profile.ioId})
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 12.5, color: colors.textSecondary, lineHeight: 18, marginBottom: 16 }}>
              You will be signed out from your active session. You can re-authenticate anytime via Google, GitHub, Microsoft Entra, Email OTP, or continue as a guest scholar.
            </Text>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button
                title="Stay Signed In"
                variant="outline"
                size="sm"
                onPress={() => setShowLogoutConfirm(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Confirm Log Out"
                size="sm"
                onPress={() => void handleLogout()}
                style={{ flex: 1.2, backgroundColor: '#EF4444' }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={editProfileOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setEditProfileOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.iconTextRow}>
                <User size={18} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Study Profile</Text>
              </View>
              <TouchableOpacity onPress={() => setEditProfileOpen(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} contentContainerStyle={{ gap: 14, paddingVertical: 14 }}>
              {/* Avatar Live Preview and Controls */}
              <View
                style={{
                  flexDirection: 'row',
                  gap: 12,
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    backgroundColor: draftAvatarColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {(() => {
                    const resolved = resolveAvatarSource(draftAvatarUri);
                    if (resolved) {
                      return (
                        <Image
                          source={resolved}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      );
                    }
                    return (
                      <Text style={{ fontSize: 24, fontWeight: '900', color: '#FFFFFF' }}>
                        {(draftName.trim() || 'S').charAt(0).toUpperCase()}
                      </Text>
                    );
                  })()}
                </View>

                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
                    Avatar Selection & Gravatar
                  </Text>
                  {avatarCompressionNotice && (
                    <Text style={{ fontSize: 10.5, color: colors.primary, fontWeight: '700' }}>
                      {avatarCompressionNotice}
                    </Text>
                  )}
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                    <TouchableOpacity
                      onPress={handlePickCustomAvatar}
                      style={[
                        styles.avatarActionBtn,
                        { backgroundColor: colors.card, borderColor: colors.border },
                      ]}
                    >
                      <Upload size={12} color={colors.primary} />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>
                        Upload Photo
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleFetchGravatar}
                      style={[
                        styles.avatarActionBtn,
                        { backgroundColor: colors.card, borderColor: colors.border },
                      ]}
                    >
                      <GravatarLogo size={13} color="#2563EB" />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#2563EB' }}>
                        {gravatarChecking ? 'Checking...' : gravatarAvailable ? 'Fetch Gravatar ✓' : 'Fetch Gravatar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Scholar Character Presets Catalogue */}
              <View>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  PRESET SCHOLAR AVATARS
                </Text>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  {PRESET_AVATARS.map((av) => {
                    const isSelected = draftAvatarUri === av.id;
                    return (
                      <TouchableOpacity
                        key={av.id}
                        onPress={() => {
                          setDraftAvatarUri(av.id);
                          setDraftAvatarColor(av.accent);
                          setAvatarCompressionNotice(`Selected ${av.label}`);
                          HapticManager.triggerSelection();
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          paddingHorizontal: 8,
                          paddingVertical: 5,
                          borderRadius: 9,
                          borderWidth: 1.5,
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected
                            ? mode === 'dark'
                              ? '#431407'
                              : '#FFEDD5'
                            : colors.surface,
                        }}
                      >
                        <Image source={av.source} style={{ width: 22, height: 22, borderRadius: 11 }} />
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '700',
                            color: isSelected ? colors.primary : colors.text,
                          }}
                        >
                          {av.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Cyber Badge Accent Colors */}
              <View>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  ACCENT COLOR SWATCH
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {['#F97316', '#22D3EE', '#10B981', '#8B5CF6', '#EC4899', '#3B82F6'].map((sw) => (
                    <TouchableOpacity
                      key={sw}
                      onPress={() => {
                        setDraftAvatarColor(sw);
                        setDraftAvatarUri(undefined);
                        setAvatarCompressionNotice(null);
                        HapticManager.triggerSelection();
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: sw,
                        borderWidth: 2,
                        borderColor: draftAvatarColor === sw && !draftAvatarUri ? '#FFFFFF' : 'transparent',
                      }}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
                <TextInput
                  value={draftName}
                  onChangeText={setDraftName}
                  style={[
                    styles.input,
                    { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                  ]}
                />
              </View>

              <View>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Study Email (for Gravatar & OTP)</Text>
                <TextInput
                  value={draftEmail}
                  onChangeText={setDraftEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[
                    styles.input,
                    { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                  ]}
                />
              </View>

              <View>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Class / Stage</Text>
                <View style={styles.chipWrap}>
                  {CLASS_OPTIONS.map((c) => {
                    const active = draftClass === c;
                    return (
                      <TouchableOpacity
                        key={c}
                        onPress={() => setDraftClass(c)}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: active ? colors.primary : colors.surface,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                          {c}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Academic Stream</Text>
                <View style={styles.chipWrap}>
                  {STREAM_OPTIONS.map((st) => {
                    const active = draftStream === st;
                    return (
                      <TouchableOpacity
                        key={st}
                        onPress={() => setDraftStream(st)}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: active ? colors.primary : colors.surface,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                          {st}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Target Exam Year</Text>
                <TextInput
                  keyboardType="numeric"
                  maxLength={4}
                  value={draftYear}
                  onChangeText={(txt) => setDraftYear(txt.replace(/[^0-9]/g, ''))}
                  style={[
                    styles.input,
                    { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                  ]}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button title="Cancel" variant="outline" onPress={() => setEditProfileOpen(false)} style={{ flex: 1 }} />
              <Button title="Save Profile" onPress={handleSaveProfile} style={{ flex: 1.4 }} />
            </View>
          </View>
        </View>
      </Modal>

      <DailyGoalModal
        visible={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSaved={(cfg) => setGoalConfig(cfg)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  profileCard: { padding: 16, borderWidth: 1 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  profileName: { fontSize: 17, fontWeight: '800' },
  profileMeta: { fontSize: 11.5, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 7, flexWrap: 'wrap' },
  editPillBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickNavCard: { gap: 8 },
  navRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  navIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: { fontSize: 14, fontWeight: '700' },
  navSub: { fontSize: 11.5, marginTop: 2 },
  streakCard: { padding: 14 },
  streakTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconTextRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  cardHeading: { fontSize: 15, fontWeight: '800' },
  linkText: { fontSize: 12, fontWeight: '700' },
  miniWeekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  miniDay: { alignItems: 'center', gap: 5, flex: 1 },
  miniDayName: { fontSize: 10.5, fontWeight: '600' },
  miniDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyCard: { padding: 14 },
  rangeSwitch: { flexDirection: 'row', borderRadius: 10, padding: 3, marginBottom: 12 },
  rangePill: { flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpiTile: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    gap: 3,
  },
  kpiVal: { fontSize: 16, fontWeight: '800' },
  kpiLbl: { fontSize: 10.5, fontWeight: '600' },
  prefsCard: { padding: 14 },
  themeRow: { flexDirection: 'row', gap: 10 },
  themeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.25,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, borderTopWidth: 1, maxHeight: '85%' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 16, fontWeight: '800' },
  modalBody: { paddingHorizontal: 20 },
  inputLabel: { fontSize: 11.5, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  modalFooter: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 14 },
  logoutDialog: {
    marginHorizontal: 20,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
});


import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { DailyGoalModal } from '../components/common/DailyGoalModal';
import { NavTab } from '../components/navigation/BottomNav';
import { DEFAULT_DAILY_GOAL, DEFAULT_USER, StorageService } from '../services/storage';
import { SoundManager } from '../services/soundManager';
import { HapticManager } from '../services/hapticManager';
import { AcademicStream, DailyGoalConfig, QuestionAttemptStat, UserProfile } from '../types';
import {
  aggregateDailyActivity,
  computeHistorySummary,
  computeStreakAndWeek,
  formatDurationShort,
} from '../utils/activityStats';
import {
  Award,
  Bell,
  BookMarked,
  Check,
  ChevronRight,
  Flame,
  Moon,
  Pencil,
  Sun,
  Target,
  Trophy,
  User,
  X,
} from 'lucide-react-native';

interface ProfileScreenProps {
  onNavigate: (tab: NavTab) => void;
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
  onProfileUpdated,
}) => {
  const { colors, mode, setTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER);
  const [goalConfig, setGoalConfig] = useState<DailyGoalConfig>(DEFAULT_DAILY_GOAL);
  const [logs, setLogs] = useState<QuestionAttemptStat[]>([]);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [historyRange, setHistoryRange] = useState<'week' | 'month' | 'quarter'>('week');

  // Edit fields
  const [draftName, setDraftName] = useState(DEFAULT_USER.name);
  const [draftClass, setDraftClass] = useState(DEFAULT_USER.classGrade);
  const [draftStream, setDraftStream] = useState<AcademicStream>(DEFAULT_USER.stream);
  const [draftYear, setDraftYear] = useState(String(DEFAULT_USER.targetYear || 2027));

  const loadData = useCallback(async () => {
    const [prof, cfg, attemptLogs] = await Promise.all([
      StorageService.getUserProfile(),
      StorageService.getDailyGoalConfig(),
      StorageService.getAttemptLogs(),
    ]);
    setProfile(prof);
    setGoalConfig(cfg);
    setLogs(attemptLogs);
    setDraftName(prof.name);
    setDraftClass(prof.classGrade);
    setDraftStream(prof.stream);
    setDraftYear(String(prof.targetYear || 2027));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const dailyMap = aggregateDailyActivity(logs);
  const streakInfo = computeStreakAndWeek(
    dailyMap,
    goalConfig.targetQuestions,
    new Date(),
    profile.studyStreakDays
  );
  const historySummary = computeHistorySummary(logs, historyRange, 'all', new Date());

  const handleSaveProfile = async () => {
    const parsedYear = parseInt(draftYear, 10) || 2027;
    const updated: UserProfile = {
      ...profile,
      name: draftName.trim() || profile.name,
      classGrade: draftClass,
      stream: draftStream,
      targetYear: parsedYear,
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
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarLetter}>{profile.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.profileName, { color: colors.text }]}>{profile.name}</Text>
              <Text style={[styles.profileMeta, { color: colors.textSecondary }]}>
                {profile.classGrade} · {profile.stream} · Target {profile.targetYear || 2027}
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
        </Card>

        {/* Quick Hub Links */}
        <View style={styles.quickNavCard}>
          {[
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
        </Card>
      </ScrollView>

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

            <ScrollView style={styles.modalBody} contentContainerStyle={{ gap: 12, paddingVertical: 14 }}>
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
});


import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { AppIcon } from '../components/common/AppIcon';
import { NavTab } from '../components/navigation/BottomNav';
import { DEFAULT_DAILY_GOAL, DEFAULT_USER, StorageService } from '../services/storage';
import { EXAM_BANK_PRESETS, FORMULA_CARDS } from '../data/curriculumData';
import { DailyGoalConfig, QuestionAttemptStat, SubjectId, UserProfile } from '../types';
import {
  aggregateDailyActivity,
  build7DayLeaderboard,
  computeStreakAndWeek,
  evaluateScoreReminder,
  formatLocalDateKey,
} from '../utils/activityStats';
import {
  ArrowRight,
  Bell,
  BookMarked,
  BrainCircuit,
  ChevronRight,
  FileEdit,
  Flag,
  Layers,
  PlusCircle,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  User,
  X,
  Zap,
} from 'lucide-react-native';

interface DashboardScreenProps {
  onNavigate: (tab: NavTab) => void;
  onOpenCustomTest?: () => void;
  onOpenFormulas?: (subjectId?: SubjectId) => void;
  onOpenCurriculumSubject?: (subjectId: SubjectId) => void;
  onAskConcept?: (concept: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  onOpenCustomTest,
  onOpenFormulas,
  onOpenCurriculumSubject,
  onAskConcept,
}) => {
  const { colors, mode } = useTheme();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER);
  const [goalConfig, setGoalConfig] = useState<DailyGoalConfig>(DEFAULT_DAILY_GOAL);
  const [logs, setLogs] = useState<QuestionAttemptStat[]>([]);
  const [offlineAvgPct, setOfflineAvgPct] = useState<number>(79.8);
  const [conceptQuery, setConceptQuery] = useState('');

  const loadDashboard = useCallback(async () => {
    const [prof, cfg, attemptLogs, offlineTests] = await Promise.all([
      StorageService.getUserProfile(),
      StorageService.getDailyGoalConfig(),
      StorageService.getAttemptLogs(),
      StorageService.getOfflineTests(),
    ]);
    setProfile(prof);
    setGoalConfig(cfg);
    setLogs(attemptLogs);
    if (offlineTests.length > 0) {
      const avg =
        offlineTests.reduce((sum, t) => sum + t.calculatedPercentage, 0) / offlineTests.length;
      setOfflineAvgPct(parseFloat(avg.toFixed(1)));
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const dailyMap = aggregateDailyActivity(logs);
  const streakInfo = computeStreakAndWeek(
    dailyMap,
    goalConfig.targetQuestions,
    new Date(),
    profile.studyStreakDays
  );
  const reminder = evaluateScoreReminder(
    goalConfig,
    streakInfo.todaySolved,
    streakInfo.currentStreakDays,
    new Date()
  );
  const leaderboard = build7DayLeaderboard(logs, profile, 'week', new Date());

  const handleDismissReminder = async () => {
    const todayKey = formatLocalDateKey(new Date());
    const updated = await StorageService.saveDailyGoalConfig({
      lastReminderDismissedDate: todayKey,
    });
    setGoalConfig(updated);
  };

  const handleConceptSearch = () => {
    const trimmed = conceptQuery.trim();
    if (onAskConcept && trimmed) {
      setConceptQuery('');
      onAskConcept(trimmed);
    } else {
      onNavigate('ai');
    }
  };

  const firstName = profile.name.split(' ')[0] || 'Scholar';
  const goalPct = Math.min(
    100,
    Math.round((streakInfo.todaySolved / Math.max(1, goalConfig.targetQuestions)) * 100)
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting & Quick Hub Strip */}
      <View style={styles.greetingBar}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onNavigate('profile')}
          style={styles.greetingLeft}
        >
          <View style={[styles.greetingAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.greetingAvatarText}>{firstName.charAt(0)}</Text>
          </View>
          <View>
            <Text style={[styles.greetingTitle, { color: colors.text }]}>
              Hey, {firstName}
            </Text>
            <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>
              {profile.classGrade} · Rank #{leaderboard.currentUserEntry.rank} (7d)
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.greetingActions}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onNavigate('notebooks')}
            style={[
              styles.quickCircleBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            accessibilityLabel="Open Notebooks and Notes"
          >
            <BookMarked size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onNavigate('leaderboard')}
            style={[
              styles.quickCircleBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            accessibilityLabel="Open 7-Day Leaderboard"
          >
            <Trophy size={16} color={colors.warning} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onNavigate('profile')}
            style={[
              styles.quickCircleBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            accessibilityLabel="Open My Profile"
          >
            <User size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Daily Score & Practice Reminder Card */}
      {reminder.shouldShow && (
        <Card
          style={[
            styles.reminderCard,
            {
              backgroundColor: mode === 'dark' ? colors.surface : '#FFF7ED',
              borderColor: reminder.isPastReminderTime ? colors.primary : colors.border,
            },
          ]}
        >
          <View style={styles.reminderTop}>
            <View
              style={[
                styles.reminderIconBadge,
                { backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5' },
              ]}
            >
              <Bell size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.reminderHeadline, { color: colors.text }]}>
                {reminder.headline}
              </Text>
              <Text style={[styles.reminderSub, { color: colors.textSecondary }]}>
                {reminder.subtext}
              </Text>
            </View>
            <TouchableOpacity onPress={handleDismissReminder} hitSlop={8}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.reminderFooter}>
            <Button
              title="Practice Now"
              size="sm"
              onPress={() => onNavigate('test')}
              style={{ flex: 1 }}
            />
            <Button
              title="7-Day League"
              variant="outline"
              size="sm"
              onPress={() => onNavigate('leaderboard')}
              style={{ flex: 1 }}
            />
          </View>
        </Card>
      )}

      {/* Daily Goal Milestone Progress Card */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onNavigate('dailyGoal')}
      >
        <Card style={styles.dailyGoalCard}>
          <View style={styles.dailyGoalTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dailyGoalLabel, { color: colors.textSecondary }]}>
                YOUR DAILY GOAL
              </Text>
              <Text style={[styles.dailyGoalCount, { color: colors.text }]}>
                {streakInfo.todaySolved} / {goalConfig.targetQuestions} Qs{' '}
                <Text style={{ color: colors.primary, fontSize: 13 }}>
                  ({goalPct}%)
                </Text>
              </Text>
            </View>

            <View style={styles.pointsTodayPill}>
              <Zap size={13} color={colors.warning} />
              <Text style={[styles.pointsTodayText, { color: colors.warning }]}>
                {streakInfo.todayXp} XP Today
              </Text>
              <ChevronRight size={15} color={colors.textSecondary} />
            </View>
          </View>

          <View style={styles.milestoneTrackWrap}>
            <View style={[styles.milestoneBg, { backgroundColor: colors.borderSubtle }]}>
              <View
                style={[
                  styles.milestoneFill,
                  {
                    width: `${goalPct}%`,
                    backgroundColor: goalPct >= 100 ? colors.success : colors.primary,
                  },
                ]}
              />
            </View>
            <View style={styles.milestoneDotsRow}>
              {[0, 25, 50, 75, 100].map((pct) => {
                const hit = goalPct >= pct;
                return (
                  <View
                    key={pct}
                    style={[
                      styles.milestoneNode,
                      {
                        backgroundColor: hit ? colors.primary : colors.card,
                        borderColor: hit ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    {pct === 100 && (
                      <Flag size={9} color={hit ? '#FFFFFF' : colors.textSecondary} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </Card>
      </TouchableOpacity>

      {/* Hero Welcome Banner */}
      <Card style={[styles.heroCard, { backgroundColor: colors.primary }]}>
        <View style={styles.heroContent}>
          <Badge
            label={`MISSION ${profile.targetExams[0] || 'JEE'} ${profile.targetYear || 2027}`}
            variant="warning"
            size="sm"
            style={styles.heroBadge}
          />
          <Text style={styles.heroTitle}>Master Your Preparation</Text>
          <Text style={styles.heroSubtitle}>
            {streakInfo.currentStreakDays}-day streak! {leaderboard.currentUserEntry.weeklyQuestions} Qs solved in the last 7 days ({leaderboard.currentUserEntry.accuracyPercent}% accuracy).
          </Text>
          <View style={styles.heroActions}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.heroBtn, { backgroundColor: '#FFFFFF' }]}
              onPress={() => onNavigate('test')}
            >
              <Text style={[styles.heroBtnText, { color: colors.primary }]}>Start Daily Drill</Text>
              <ArrowRight size={15} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.heroBtnSecondary}
              onPress={() => onNavigate('leaderboard')}
            >
              <Trophy size={14} color="#FFFFFF" />
              <Text style={styles.heroBtnSecondaryText}>
                Rank #{leaderboard.currentUserEntry.rank}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* Concept-Wise Clarity Search Bar */}
      <Card style={[styles.searchCard, { borderColor: colors.border }]}>
        <View style={styles.searchRow}>
          <Search size={17} color={colors.primary} />
          <TextInput
            value={conceptQuery}
            onChangeText={setConceptQuery}
            onSubmitEditing={handleConceptSearch}
            returnKeyType="search"
            placeholder="Get AI clarity on any concept or formula..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
          />
          <TouchableOpacity
            onPress={handleConceptSearch}
            style={[styles.searchGoBtn, { backgroundColor: colors.primary }]}
          >
            <Sparkles size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Study Labs Tests Dual Quick Launchers */}
      <View style={styles.dualLaunchRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (onOpenCustomTest) onOpenCustomTest();
            else onNavigate('test');
          }}
          style={[
            styles.launchCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.launchIcon,
              { backgroundColor: mode === 'dark' ? colors.surface : '#FFF7ED', borderColor: colors.borderSubtle, borderWidth: 1 },
            ]}
          >
            <PlusCircle size={20} color={colors.primary} />
          </View>
          <Text style={[styles.launchTitle, { color: colors.text }]}>Create Custom Test</Text>
          <Text style={[styles.launchSub, { color: colors.textSecondary }]}>
            Filter by subject & difficulty
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigate('test')}
          style={[
            styles.launchCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.launchIcon,
              { backgroundColor: mode === 'dark' ? colors.surface : '#ECFEFF', borderColor: colors.borderSubtle, borderWidth: 1 },
            ]}
          >
            <Target size={20} color={colors.cyan} />
          </View>
          <Text style={[styles.launchTitle, { color: colors.text }]}>Practice & Mock Bank</Text>
          <Text style={[styles.launchSub, { color: colors.textSecondary }]}>
            Timed & hint-guided drills
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chapter-wise Practice Exam Presets */}
      <View style={styles.spotlightHeader}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>
          Chapter-Wise Practice Bank
        </Text>
        <TouchableOpacity onPress={() => onNavigate('study')}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>All Chapters →</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.examRow}
      >
        {EXAM_BANK_PRESETS.map((exam) => (
          <TouchableOpacity
            key={exam.id}
            activeOpacity={0.8}
            onPress={() => {
              if (onOpenCurriculumSubject) onOpenCurriculumSubject(exam.defaultSubject);
              else onNavigate('study');
            }}
            style={[
              styles.examCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.examAccentBar, { backgroundColor: exam.accent }]} />
            <Text style={[styles.examName, { color: colors.text }]}>{exam.name}</Text>
            <Text style={[styles.examSub, { color: colors.textSecondary }]}>{exam.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Formula Revision Cards Strip */}
      <View style={styles.spotlightHeader}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>Formula Flash Cards</Text>
        <TouchableOpacity
          onPress={() => {
            if (onOpenFormulas) onOpenFormulas('physics');
            else onNavigate('study');
          }}
        >
          <Text style={[styles.seeAllText, { color: colors.primary }]}>View All →</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.formulaStrip}
      >
        {FORMULA_CARDS.slice(0, 6).map((f) => (
          <TouchableOpacity
            key={f.id}
            activeOpacity={0.8}
            onPress={() => {
              if (onOpenFormulas) onOpenFormulas(f.subjectId);
              else onNavigate('study');
            }}
            style={[
              styles.formulaDeckCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.formulaDeckTop}>
              <Layers size={14} color={colors.primary} />
              <Text style={[styles.formulaDeckSubj, { color: colors.primary }]}>
                {f.subjectId.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.formulaDeckTitle, { color: colors.text }]} numberOfLines={2}>
              {f.chapterTitle}
            </Text>
            <Text style={[styles.formulaDeckHint, { color: colors.textSecondary }]} numberOfLines={1}>
              {f.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Coaching Avg</Text>
            <TrendingUp size={18} color={colors.success} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{offlineAvgPct}%</Text>
          <Text style={[styles.statSub, { color: colors.success }]}>Synced offline tests</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>7-Day XP</Text>
            <Trophy size={18} color={colors.primary} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {leaderboard.currentUserEntry.weeklyXp}
          </Text>
          <Text style={[styles.statSub, { color: colors.textSecondary }]}>
            {leaderboard.currentTier.name}
          </Text>
        </Card>
      </View>

      {/* Continue Learning Widget */}
      <Text style={[styles.sectionHeading, { color: colors.text }]}>Continue Learning</Text>
      <Card style={styles.continueCard}>
        <View style={styles.continueRow}>
          <View style={[styles.subjectIndicator, { backgroundColor: colors.info }]} />
          <View style={styles.continueDetails}>
            <View style={styles.badgeRow}>
              <Badge label="PHYSICS" variant="info" size="sm" />
              <Badge label="CHAPTER 7" variant="neutral" size="sm" />
            </View>
            <Text style={[styles.continueTitle, { color: colors.text }]}>
              Rotational Motion & Moment of Inertia
            </Text>
            <Text style={[styles.continueProgressText, { color: colors.textSecondary }]}>
              98 / 145 Questions Completed · 67%
            </Text>
            <View style={[styles.progressBarBg, { backgroundColor: colors.borderSubtle }]}>
              <View style={[styles.progressBarFill, { width: '67%', backgroundColor: colors.primary }]} />
            </View>
          </View>
        </View>

        <View style={[styles.continueFooter, { borderTopColor: colors.borderSubtle }]}>
          <Button
            title="Resume PYQ Practice"
            size="sm"
            onPress={() => onNavigate('test')}
            icon={<ArrowRight size={14} color="#FFFFFF" />}
          />
        </View>
      </Card>

      {/* Offline Coaching Tracker Feature Spotlight */}
      <View style={styles.spotlightHeader}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>Offline Coaching Tracker</Text>
        <TouchableOpacity onPress={() => onNavigate('tracker')}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>View All →</Text>
        </TouchableOpacity>
      </View>
      <Card style={[styles.trackerSpotlightCard, { borderColor: colors.border }]}>
        <View style={styles.spotlightRow}>
          <View
            style={[
              styles.spotlightIcon,
              { backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5' },
            ]}
          >
            <FileEdit size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.spotlightTitle, { color: colors.text }]}>Log Offline Institute Marks</Text>
            <Text style={[styles.spotlightSubtitle, { color: colors.textSecondary }]}>
              Track tests from Allen, FIITJEE, Aakash, or School. Monitor negative marks & rank trends.
            </Text>
          </View>
        </View>
        <Button
          title="Open Coaching Test Tracker"
          variant="outline"
          size="sm"
          onPress={() => onNavigate('tracker')}
          style={{ marginTop: 12 }}
        />
      </Card>

      {/* AI Tutor Assistant Callout */}
      <Text style={[styles.sectionHeading, { color: colors.text, marginTop: 18 }]}>
        AI Study Assistant
      </Text>
      <Card
        style={[
          styles.aiCard,
          {
            backgroundColor: mode === 'dark' ? colors.surface : '#FFF7ED',
            borderColor: colors.primary,
          },
        ]}
      >
        <View style={styles.aiRow}>
          <BrainCircuit size={28} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.aiTitle, { color: colors.text }]}>Instant Concept Clarification</Text>
            <Text style={[styles.aiDesc, { color: colors.textSecondary }]}>
              Auto-routed between Flash Lite, Flash & Pro reasoning models.
            </Text>
          </View>
        </View>
        <Button
          title="Ask AI Study Tutor"
          variant="secondary"
          size="sm"
          onPress={() => onNavigate('ai')}
          icon={<Sparkles size={14} color="#FFFFFF" />}
          style={{ marginTop: 12 }}
        />
      </Card>

      {/* Quick Academic Tools Shortcuts */}
      <Text style={[styles.sectionHeading, { color: colors.text, marginTop: 18 }]}>
        Academic Toolkit & Workspaces
      </Text>
      <View style={styles.toolsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.toolChip, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => onNavigate('analytics')}
        >
          <AppIcon name="chart" color={colors.primary} size="md" />
          <Text style={[styles.toolTitle, { color: colors.text }]}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.toolChip, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => onNavigate('syllabus')}
        >
          <AppIcon name="calendar" color={colors.info} size="md" />
          <Text style={[styles.toolTitle, { color: colors.text }]}>Syllabus</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.toolChip, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => onNavigate('playground')}
        >
          <AppIcon name="activity" color={colors.cyan || '#22D3EE'} size="md" />
          <Text style={[styles.toolTitle, { color: colors.text }]}>Playground</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.toolChip, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => onNavigate('tools')}
        >
          <AppIcon name="flask" color={colors.success} size="md" />
          <Text style={[styles.toolTitle, { color: colors.text }]}>Tools</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  greetingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  greetingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greetingAvatar: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingAvatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  greetingTitle: { fontSize: 17, fontWeight: '800' },
  greetingSub: { fontSize: 11.5, marginTop: 1 },
  greetingActions: { flexDirection: 'row', gap: 7 },
  quickCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderCard: { padding: 13, borderWidth: 1, marginBottom: 12, gap: 10 },
  reminderTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reminderIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderHeadline: { fontSize: 13, fontWeight: '800' },
  reminderSub: { fontSize: 11.5, marginTop: 2, lineHeight: 16 },
  reminderFooter: { flexDirection: 'row', gap: 8 },
  dailyGoalCard: { padding: 14, marginBottom: 14 },
  dailyGoalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dailyGoalLabel: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.7 },
  dailyGoalCount: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  pointsTodayPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pointsTodayText: { fontSize: 12, fontWeight: '800' },
  milestoneTrackWrap: { position: 'relative', justifyContent: 'center', height: 22 },
  milestoneBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  milestoneFill: { height: '100%', borderRadius: 3 },
  milestoneDotsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneNode: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: { borderRadius: 20, padding: 18, marginBottom: 14 },
  heroContent: { gap: 8 },
  heroBadge: { alignSelf: 'flex-start' },
  heroTitle: { color: '#FFFFFF', fontSize: 21, fontWeight: '800', letterSpacing: -0.5 },
  heroSubtitle: { color: '#FED7AA', fontSize: 12.5, lineHeight: 18 },
  heroActions: { marginTop: 6, flexDirection: 'row', gap: 10, alignItems: 'center' },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  heroBtnText: { fontWeight: '800', fontSize: 13 },
  heroBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  heroBtnSecondaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12.5 },
  searchCard: { paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 4 },
  searchGoBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dualLaunchRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  launchCard: {
    flex: 1,
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  launchIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  launchTitle: { fontSize: 13.5, fontWeight: '800' },
  launchSub: { fontSize: 11, lineHeight: 15 },
  examRow: { gap: 10, paddingBottom: 14 },
  examCard: {
    width: 136,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  examAccentBar: { width: 28, height: 4, borderRadius: 2, marginBottom: 4 },
  examName: { fontSize: 13.5, fontWeight: '800' },
  examSub: { fontSize: 11 },
  formulaStrip: { gap: 10, paddingBottom: 16 },
  formulaDeckCard: {
    width: 152,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 5,
  },
  formulaDeckTop: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  formulaDeckSubj: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  formulaDeckTitle: { fontSize: 13, fontWeight: '700', lineHeight: 17 },
  formulaDeckHint: { fontSize: 11 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, padding: 14 },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: { fontSize: 12, fontWeight: '600' },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statSub: { fontSize: 11, fontWeight: '600' },
  sectionHeading: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  continueCard: { padding: 16, marginBottom: 16 },
  continueRow: { flexDirection: 'row', gap: 12 },
  subjectIndicator: { width: 4, borderRadius: 2 },
  continueDetails: { flex: 1 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  continueTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  continueProgressText: { fontSize: 12, marginBottom: 8 },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  continueFooter: {
    marginTop: 14,
    borderTopWidth: 1,
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  spotlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  seeAllText: { fontSize: 12.5, fontWeight: '700' },
  trackerSpotlightCard: { padding: 16, borderWidth: 1, borderStyle: 'dashed' },
  spotlightRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  spotlightIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  spotlightSubtitle: { fontSize: 12, lineHeight: 16 },
  aiCard: { padding: 16, borderWidth: 1 },
  aiRow: { flexDirection: 'row', alignItems: 'center' },
  aiTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  aiDesc: { fontSize: 12, lineHeight: 16 },
  toolsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  toolChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  toolTitle: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
});

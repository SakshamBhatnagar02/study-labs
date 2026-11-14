import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
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
import {
  BOARD_DISPLAY_NAMES,
  EXAM_BANK_PRESETS,
  FORMULA_CARDS,
  SAMPLE_QUESTIONS,
} from '../data/curriculumData';
import { DailyGoalConfig, OfflineTestRecord, QuestionAttemptStat, SubjectId, UserProfile } from '../types';
import {
  aggregateDailyActivity,
  build7DayLeaderboard,
  computeStreakAndWeek,
  evaluateScoreReminder,
  formatLocalDateKey,
} from '../utils/activityStats';
import {
  COUNTRY_META_MAP,
  formatLiveClock,
  formatLiveDateBanner,
  getAllHolidaysForCountry,
  resolveActiveCountry,
  toIsoDateKey,
} from '../utils/calendarHolidays';
import { CalendarHoliday, HolidayCountryCode } from '../types';
import {
  ArrowRight,
  Bell,
  BookMarked,
  BookOpen,
  BrainCircuit,
  Calendar,
  ChevronRight,
  Clock,
  FileEdit,
  Flag,
  Layers,
  MapPin,
  MessageSquare,
  PlusCircle,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react-native';

interface DashboardScreenProps {
  onNavigate: (tab: NavTab) => void;
  onOpenOnboarding?: () => void;
  onOpenCustomTest?: () => void;
  onOpenFormulas?: (subjectId?: SubjectId) => void;
  onOpenCurriculumSubject?: (subjectId: SubjectId) => void;
  onAskConcept?: (concept: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  onOpenOnboarding,
  onOpenCustomTest,
  onOpenFormulas,
  onOpenCurriculumSubject,
  onAskConcept,
}) => {
  const { colors, mode } = useTheme();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER);
  const [goalConfig, setGoalConfig] = useState<DailyGoalConfig>(DEFAULT_DAILY_GOAL);
  const [logs, setLogs] = useState<QuestionAttemptStat[]>([]);
  const [offlineTests, setOfflineTests] = useState<OfflineTestRecord[]>([]);
  const [offlineAvgPct, setOfflineAvgPct] = useState<number>(79.8);
  const [joinedClubsCount, setJoinedClubsCount] = useState<number>(2);
  const [conceptQuery, setConceptQuery] = useState('');
  const [now, setNow] = useState<Date>(() => new Date());
  const [selectedHolidayCountry, setSelectedHolidayCountry] = useState<HolidayCountryCode>('AUTO');
  const [cachedRemoteHolidays, setCachedRemoteHolidays] = useState<CalendarHoliday[]>([]);

  const loadDashboard = useCallback(async () => {
    const [prof, cfg, attemptLogs, offTests, plannerState, clubsWs] = await Promise.all([
      StorageService.getUserProfile(),
      StorageService.getDailyGoalConfig(),
      StorageService.getAttemptLogs(),
      StorageService.getOfflineTests(),
      StorageService.getPlannerState(),
      StorageService.getClubsWorkspace(),
    ]);
    setProfile(prof);
    setGoalConfig(cfg);
    setLogs(attemptLogs);
    setOfflineTests(offTests);
    setJoinedClubsCount(clubsWs.joinedClubIds.length);
    setSelectedHolidayCountry(plannerState.selectedCountry);
    if (offTests.length > 0) {
      const avg =
        offTests.reduce((sum, t) => sum + t.calculatedPercentage, 0) / offTests.length;
      setOfflineAvgPct(parseFloat(avg.toFixed(1)));
    }
    const resolved = resolveActiveCountry(plannerState.selectedCountry);
    const cached = await StorageService.getCachedRemoteHolidays(
      new Date().getFullYear(),
      resolved.country
    );
    setCachedRemoteHolidays(cached);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);

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

  const regionResolution = resolveActiveCountry(selectedHolidayCountry);
  const countryMeta = COUNTRY_META_MAP[regionResolution.country];
  const todayIso = toIsoDateKey(now);
  const allCountryHolidays = getAllHolidaysForCountry(
    regionResolution.country,
    cachedRemoteHolidays
  );
  const todayHoliday = allCountryHolidays.find((h) => h.date === todayIso);
  const upcomingHoliday = allCountryHolidays.find((h) => h.date > todayIso);
  const activeBoardLabel = BOARD_DISPLAY_NAMES[profile.board || 'JEE_MAIN'] || 'Curriculum';

  const weakTopicSuggestions = (() => {
    const misses = logs.filter((l) => !l.isCorrect);
    const seenIds = new Set<string>();
    const items: Array<{ label: string; subjectId: SubjectId; stat: string }> = [];
    for (const m of misses) {
      const q = SAMPLE_QUESTIONS.find((item) => item.id === m.questionId);
      if (q && !seenIds.has(q.id)) {
        seenIds.add(q.id);
        items.push({
          label: `${q.examOrigin} (${q.difficulty})`,
          subjectId: q.subjectId,
          stat: 'Missed recently',
        });
      }
      if (items.length >= 3) break;
    }
    if (items.length === 0) {
      return [
        { label: 'Rotational Rolling & Friction', subjectId: 'physics' as const, stat: 'High Yield' },
        { label: 'GOC Aromaticity & ortho-Effect', subjectId: 'chemistry' as const, stat: 'High Yield' },
        { label: "King's Definite Integral Property", subjectId: 'math' as const, stat: 'Core Drill' },
      ];
    }
    return items;
  })();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting & Quick Hub Strip */}
      <View style={styles.greetingBar}>
        <Pressable
          focusable={false}
          onPress={() => onNavigate('profile')}
          style={({ pressed }) => [styles.greetingLeft, pressed && { opacity: 0.78 }]}
        >
          <View style={[styles.greetingAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.greetingAvatarText}>{firstName.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.greetingTitle, { color: colors.text }]} numberOfLines={1}>
              Hey, {firstName}
            </Text>
            <Text style={[styles.greetingSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {profile.classGrade} · {activeBoardLabel} ({profile.country || 'India'}) · Rank #{leaderboard.currentUserEntry.rank}
            </Text>
          </View>
        </Pressable>

        <View style={styles.greetingActions}>
          <Pressable
            focusable={false}
            onPress={() => onNavigate('notebooks')}
            style={({ pressed }) => [
              styles.quickCircleBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.72 : 1,
              },
            ]}
            accessibilityLabel="Open Notebooks and Notes"
          >
            <BookMarked size={16} color={colors.primary} />
          </Pressable>
          <Pressable
            focusable={false}
            onPress={() => onNavigate('leaderboard')}
            style={({ pressed }) => [
              styles.quickCircleBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.72 : 1,
              },
            ]}
            accessibilityLabel="Open 7-Day Leaderboard"
          >
            <Trophy size={16} color={colors.warning} />
          </Pressable>
          <Pressable
            focusable={false}
            onPress={() => onNavigate('profile')}
            style={({ pressed }) => [
              styles.quickCircleBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.72 : 1,
              },
            ]}
            accessibilityLabel="Open My Profile"
          >
            <User size={16} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Live Regional Date, Clock & Holiday Calendar Strip */}
      {!profile.onboardingCompleted && onOpenOnboarding && (
        <Pressable
          focusable={false}
          onPress={onOpenOnboarding}
          style={({ pressed }) => [
            styles.liveClockStrip,
            {
              backgroundColor: mode === 'dark' ? '#1E293B' : '#FFF7ED',
              borderColor: colors.primary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <View style={styles.liveClockTopRow}>
            <View style={[styles.liveClockLeft, { flex: 1, minWidth: 0 }]}>
              <Sparkles size={14} color={colors.primary} />
              <Text
                style={[styles.liveDateText, { color: colors.text, flex: 1 }]}
                numberOfLines={2}
              >
                Personalize Global Curriculum, Language & Account
              </Text>
            </View>
            <Text style={[styles.calendarCtaText, { color: colors.primary, flexShrink: 0 }]}>
              Setup →
            </Text>
          </View>
        </Pressable>
      )}

      <Pressable
        focusable={false}
        onPress={() => onNavigate('syllabus')}
        style={({ pressed }) => [
          styles.liveClockStrip,
          {
            backgroundColor: colors.card,
            borderColor: todayHoliday ? colors.primary : colors.border,
            opacity: pressed ? 0.82 : 1,
          },
        ]}
      >
        <View style={styles.liveClockTopRow}>
          <View style={styles.liveClockLeft}>
            <Calendar size={14} color={colors.primary} />
            <Text style={[styles.liveDateText, { color: colors.text }]}>
              {formatLiveDateBanner(now)}
            </Text>
          </View>
          <View style={styles.liveClockRight}>
            <Clock size={13} color={colors.cyan} />
            <Text style={[styles.liveTimeText, { color: colors.primary }]}>
              {formatLiveClock(now)}
            </Text>
          </View>
        </View>

        <View style={styles.liveHolidayBottomRow}>
          <View style={styles.liveRegionPill}>
            <MapPin size={12} color={colors.textSecondary} />
            <Text style={[styles.liveRegionText, { color: colors.textSecondary }]} numberOfLines={1}>
              {countryMeta.shortName}
              {regionResolution.isAuto ? ' (Device)' : ''} ·{' '}
              {todayHoliday
                ? `Holiday Today: ${todayHoliday.name}`
                : upcomingHoliday
                ? `Next Holiday: ${upcomingHoliday.name} (${upcomingHoliday.date.slice(5)})`
                : 'Open Full Holiday Calendar'}
            </Text>
          </View>
          <Text style={[styles.calendarCtaText, { color: colors.primary }]}>Calendar →</Text>
        </View>
      </Pressable>

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
      <Pressable
        focusable={false}
        onPress={() => onNavigate('dailyGoal')}
        style={({ pressed }) => [
          styles.dailyGoalCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: pressed ? 0.84 : 1,
          },
        ]}
      >
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
      </Pressable>

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
            <Pressable
              focusable={false}
              style={({ pressed }) => [
                styles.heroBtn,
                { backgroundColor: '#FFFFFF', opacity: pressed ? 0.82 : 1 },
              ]}
              onPress={() => onNavigate('test')}
            >
              <Text style={[styles.heroBtnText, { color: colors.primary }]}>Start Daily Drill</Text>
              <ArrowRight size={15} color={colors.primary} />
            </Pressable>

            <Pressable
              focusable={false}
              style={({ pressed }) => [
                styles.heroBtnSecondary,
                pressed && { opacity: 0.78 },
              ]}
              onPress={() => onNavigate('leaderboard')}
            >
              <Trophy size={14} color="#FFFFFF" />
              <Text style={styles.heroBtnSecondaryText}>
                Rank #{leaderboard.currentUserEntry.rank}
              </Text>
            </Pressable>
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
          <Pressable
            focusable={false}
            onPress={handleConceptSearch}
            style={({ pressed }) => [
              styles.searchGoBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.78 : 1 },
            ]}
          >
            <Sparkles size={14} color="#FFFFFF" />
          </Pressable>
        </View>
      </Card>

      {/* Study Labs Tests Dual Quick Launchers */}
      <View style={styles.dualLaunchRow}>
        <Pressable
          focusable={false}
          onPress={() => {
            if (onOpenCustomTest) onOpenCustomTest();
            else onNavigate('test');
          }}
          style={({ pressed }) => [
            styles.launchCard,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
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
        </Pressable>

        <Pressable
          focusable={false}
          onPress={() => onNavigate('test')}
          style={({ pressed }) => [
            styles.launchCard,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
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
        </Pressable>
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
          <Pressable
            key={exam.id}
            focusable={false}
            onPress={() => {
              if (onOpenCurriculumSubject) onOpenCurriculumSubject(exam.defaultSubject);
              else onNavigate('study');
            }}
            style={({ pressed }) => [
              styles.examCard,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <View style={[styles.examAccentBar, { backgroundColor: exam.accent }]} />
            <Text style={[styles.examName, { color: colors.text }]}>{exam.name}</Text>
            <Text style={[styles.examSub, { color: colors.textSecondary }]}>{exam.subtitle}</Text>
          </Pressable>
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
          <Pressable
            key={f.id}
            focusable={false}
            onPress={() => {
              if (onOpenFormulas) onOpenFormulas(f.subjectId);
              else onNavigate('study');
            }}
            style={({ pressed }) => [
              styles.formulaDeckCard,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
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
          </Pressable>
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

      {/* Study Clubs & Teacher Institute Platform Portal */}
      <View style={styles.spotlightHeader}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>Study Clubs & Institutes</Text>
        <TouchableOpacity onPress={() => onNavigate('clubs')}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>Open Workspace →</Text>
        </TouchableOpacity>
      </View>
      <Pressable
        focusable={false}
        onPress={() => onNavigate('clubs')}
        style={({ pressed }) => [
          styles.trackerSpotlightCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.primary,
            borderRadius: 16,
            borderWidth: 1,
            overflow: 'hidden',
            marginBottom: 16,
            opacity: pressed ? 0.86 : 1,
          },
        ]}
      >
        <View style={styles.spotlightRow}>
          <View
            style={[
              styles.spotlightIcon,
              { backgroundColor: mode === 'dark' ? '#052E16' : '#DCFCE7' },
            ]}
          >
            <Users size={22} color={colors.success} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={[styles.spotlightTitle, { color: colors.text, marginBottom: 0 }]}>
                Cohort Channels & Teacher Suite
              </Text>
              <Badge label={`${joinedClubsCount} Joined`} variant="success" size="sm" />
            </View>
            <Text style={[styles.spotlightSubtitle, { color: colors.textSecondary, marginTop: 3 }]}>
              Discord-style role channels, Faculty assignments, polls, digital attendance & direct messages.
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Recommended Weak Topics & Recent Activity */}
      <View style={styles.spotlightHeader}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>Focus Recommendations</Text>
        <TouchableOpacity onPress={() => onNavigate('analytics')}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>Full Analytics →</Text>
        </TouchableOpacity>
      </View>
      <Card style={[styles.trackerSpotlightCard, { borderColor: colors.border, marginBottom: 16 }]}>
        <View style={{ gap: 8 }}>
          {weakTopicSuggestions.map((item, idx) => (
            <TouchableOpacity
              key={`${item.label}_${idx}`}
              onPress={() =>
                onOpenCurriculumSubject
                  ? onOpenCurriculumSubject(item.subjectId)
                  : onNavigate('study')
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 6,
                borderBottomWidth: idx === weakTopicSuggestions.length - 1 ? 0 : StyleSheet.hairlineWidth,
                borderBottomColor: colors.borderSubtle,
              }}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }} numberOfLines={1}>
                  {item.label}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                  {item.subjectId.toUpperCase()} · {item.stat}
                </Text>
              </View>
              <Badge label="Revise" variant="warning" size="sm" />
            </TouchableOpacity>
          ))}
          {offlineTests.length > 0 && (
            <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
              Latest Coaching Log: {offlineTests[0].testName} ({offlineTests[0].calculatedPercentage}%)
            </Text>
          )}
        </View>
      </Card>

      {/* Quick Academic Tools Shortcuts */}
      <Text style={[styles.sectionHeading, { color: colors.text, marginTop: 18 }]}>
        Academic Toolkit & Workspaces
      </Text>
      <View style={styles.toolsRow}>
        <Pressable
          focusable={false}
          style={({ pressed }) => [
            styles.toolChip,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.78 : 1 },
          ]}
          onPress={() => onNavigate('analytics')}
        >
          <AppIcon name="chart" color={colors.primary} size="md" />
          <Text style={[styles.toolTitle, { color: colors.text }]}>Analytics</Text>
        </Pressable>

        <Pressable
          focusable={false}
          style={({ pressed }) => [
            styles.toolChip,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.78 : 1 },
          ]}
          onPress={() => onNavigate('syllabus')}
        >
          <AppIcon name="calendar" color={colors.info} size="md" />
          <Text style={[styles.toolTitle, { color: colors.text }]}>Syllabus</Text>
        </Pressable>

        <Pressable
          focusable={false}
          style={({ pressed }) => [
            styles.toolChip,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.78 : 1 },
          ]}
          onPress={() => onNavigate('playground')}
        >
          <AppIcon name="activity" color={colors.cyan || '#22D3EE'} size="md" />
          <Text style={[styles.toolTitle, { color: colors.text }]}>Playground</Text>
        </Pressable>

        <Pressable
          focusable={false}
          style={({ pressed }) => [
            styles.toolChip,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.78 : 1 },
          ]}
          onPress={() => onNavigate('tools')}
        >
          <AppIcon name="flask" color={colors.success} size="md" />
          <Text style={[styles.toolTitle, { color: colors.text }]}>Tools</Text>
        </Pressable>

        <Pressable
          focusable={false}
          style={({ pressed }) => [
            styles.toolChip,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.78 : 1 },
          ]}
          onPress={() => onNavigate('ebooks')}
        >
          <BookOpen color={colors.primary} size={22} />
          <Text style={[styles.toolTitle, { color: colors.text }]}>E-Books</Text>
        </Pressable>

        <Pressable
          focusable={false}
          style={({ pressed }) => [
            styles.toolChip,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.78 : 1 },
          ]}
          onPress={() => onNavigate('community')}
        >
          <MessageSquare color={colors.success} size={22} />
          <Text style={[styles.toolTitle, { color: colors.text }]}>Doubts</Text>
        </Pressable>
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
  greetingLeft: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    overflow: 'hidden',
  },
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
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveClockStrip: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 13,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 5,
  },
  liveClockTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  liveClockLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveClockRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDateText: { fontSize: 12.5, fontWeight: '700' },
  liveTimeText: { fontSize: 12.5, fontWeight: '800', fontVariant: ['tabular-nums'] },
  liveHolidayBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  liveRegionPill: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1, minWidth: 0 },
  liveRegionText: { fontSize: 11, fontWeight: '600', flex: 1 },
  calendarCtaText: { fontSize: 11, fontWeight: '800' },
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
  dailyGoalCard: {
    padding: 14,
    marginBottom: 14,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
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
    overflow: 'hidden',
  },
  heroBtnText: { fontWeight: '800', fontSize: 13 },
  heroBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    overflow: 'hidden',
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
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dualLaunchRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  launchCard: {
    flex: 1,
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    gap: 6,
  },
  launchIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    overflow: 'hidden',
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
    overflow: 'hidden',
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
    overflow: 'hidden',
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
  trackerSpotlightCard: { padding: 16, borderWidth: 1 },
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
    overflow: 'hidden',
    alignItems: 'center',
    gap: 6,
  },
  toolTitle: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
});

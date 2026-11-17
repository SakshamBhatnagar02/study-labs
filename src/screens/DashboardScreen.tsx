import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
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
import { SEED_EBOOKS } from '../data/ebooksData';
import {
  BRANDING_ASSETS,
  HOLO_NAME,
  HOLO_REACTIONS,
  resolveAvatarSource,
} from '../utils/avatarHelper';
import {
  DailyGoalConfig,
  OfflineTestRecord,
  QuestionAttemptStat,
  SubjectId,
  UserProfile,
} from '../types';
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
  BookMarked,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  FileEdit,
  Flag,
  Flame,
  Layers,
  MapPin,
  Menu,
  MessageSquare,
  PlusCircle,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react-native';

interface DashboardScreenProps {
  onNavigate: (tab: NavTab) => void;
  onOpenDrawer?: () => void;
  onOpenOnboarding?: () => void;
  onOpenCustomTest?: () => void;
  onOpenFormulas?: (subjectId?: SubjectId) => void;
  onOpenCurriculumSubject?: (subjectId: SubjectId) => void;
  onAskConcept?: (concept: string) => void;
}

const REVISION_DECKS: Array<{
  id: SubjectId;
  label: string;
  count: number;
  accent: string;
  bgDark: string;
  bgLight: string;
  formulaHint: string;
}> = [
  {
    id: 'physics',
    label: 'PHYSICS',
    count: FORMULA_CARDS.filter((f) => f.subjectId === 'physics').length || 24,
    accent: '#F97316',
    bgDark: '#231710',
    bgLight: '#FFF7ED',
    formulaHint: 'E = mc² · F = ma',
  },
  {
    id: 'chemistry',
    label: 'CHEMISTRY',
    count: FORMULA_CARDS.filter((f) => f.subjectId === 'chemistry').length || 22,
    accent: '#10B981',
    bgDark: '#0D221B',
    bgLight: '#ECFDF5',
    formulaHint: 'PV = nRT · ΔG°',
  },
  {
    id: 'math',
    label: 'MATHS',
    count: FORMULA_CARDS.filter((f) => f.subjectId === 'math').length || 26,
    accent: '#3B82F6',
    bgDark: '#101D33',
    bgLight: '#EFF6FF',
    formulaHint: '∫ f(x)dx · a²+b²',
  },
  {
    id: 'biology',
    label: 'BIOLOGY',
    count: FORMULA_CARDS.filter((f) => f.subjectId === 'biology').length || 18,
    accent: '#8B5CF6',
    bgDark: '#1C1430',
    bgLight: '#F5F3FF',
    formulaHint: 'DNA · ATP Cycle',
  },
];

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  onOpenDrawer,
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
  const [offlineAvgPct, setOfflineAvgPct] = useState<number>(0);
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
      const avg = offTests.reduce((sum, t) => sum + t.calculatedPercentage, 0) / offTests.length;
      setOfflineAvgPct(parseFloat(avg.toFixed(1)));
    } else {
      setOfflineAvgPct(0);
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

  const firstName = profile.name?.trim().split(' ')[0] || 'Scholar';
  const avatarSrc = resolveAvatarSource(profile.avatarUri);
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

  const toolkitItems: Array<{
    key: NavTab;
    label: string;
    accent: string;
    renderIcon: () => React.ReactNode;
  }> = [
    {
      key: 'analytics',
      label: 'Analytics',
      accent: colors.primary,
      renderIcon: () => <AppIcon name="chart" color={colors.primary} size="md" />,
    },
    {
      key: 'syllabus',
      label: 'Syllabus',
      accent: colors.info,
      renderIcon: () => <AppIcon name="calendar" color={colors.info} size="md" />,
    },
    {
      key: 'playground',
      label: '3D Lab',
      accent: colors.cyan || '#22D3EE',
      renderIcon: () => <AppIcon name="activity" color={colors.cyan || '#22D3EE'} size="md" />,
    },
    {
      key: 'tools',
      label: 'Tools',
      accent: colors.success,
      renderIcon: () => <AppIcon name="flask" color={colors.success} size="md" />,
    },
    {
      key: 'ebooks',
      label: 'E-Books',
      accent: '#F97316',
      renderIcon: () => <BookOpen color="#F97316" size={20} />,
    },
    {
      key: 'community',
      label: 'Doubts',
      accent: '#10B981',
      renderIcon: () => <MessageSquare color="#10B981" size={20} />,
    },
    {
      key: 'pyqs',
      label: 'PYQ Vault',
      accent: '#6366F1',
      renderIcon: () => <Trophy color="#6366F1" size={20} />,
    },
    {
      key: 'calendar',
      label: 'Exams',
      accent: '#14B8A6',
      renderIcon: () => <Calendar color="#14B8A6" size={20} />,
    },
  ];

  const cardSurface = mode === 'dark' ? '#161C27' : colors.card;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. MARKS-Style Greeting & League Top Strip */}
      <View style={styles.greetingBar}>
        <Pressable
          focusable={false}
          onPress={() => (onOpenDrawer ? onOpenDrawer() : onNavigate('profile'))}
          style={({ pressed }) => [styles.greetingLeft, pressed && { opacity: 0.78 }]}
          accessibilityLabel="Open Study Labs Menu"
        >
          <View style={styles.avatarWrap}>
            <View
              style={[
                styles.greetingAvatar,
                { backgroundColor: profile.avatarColor || colors.primary },
              ]}
            >
              {avatarSrc ? (
                <Image source={avatarSrc} style={{ width: 40, height: 40 }} resizeMode="cover" />
              ) : (
                <Text style={styles.greetingAvatarText}>{firstName.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View
              style={[
                styles.menuDotBadge,
                { backgroundColor: mode === 'dark' ? '#0F172A' : '#FFFFFF', borderColor: colors.border },
              ]}
            >
              <Menu size={10} color={colors.text} />
            </View>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.greetingTitle, { color: colors.text }]} numberOfLines={1}>
              Hey, {firstName}
            </Text>
            <Text style={[styles.greetingSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {profile.classGrade} · {activeBoardLabel} · {leaderboard.currentTier.name}
            </Text>
          </View>
        </Pressable>

        <View style={styles.greetingActions}>
          <Pressable
            focusable={false}
            onPress={() => onNavigate('leaderboard')}
            style={({ pressed }) => [
              styles.leaguePillBtn,
              {
                backgroundColor: cardSurface,
                borderColor: colors.border,
                opacity: pressed ? 0.78 : 1,
              },
            ]}
          >
            <Trophy size={14} color={colors.warning} />
            <Text style={[styles.leaguePillText, { color: colors.text }]}>
              #{leaderboard.currentUserEntry.rank}
            </Text>
            <ChevronRight size={13} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* 2. MARKS-Style Compact Daily Goal Milestone Track */}
      <Pressable
        focusable={false}
        onPress={() => onNavigate('dailyGoal')}
        style={({ pressed }) => [
          styles.dailyGoalStrip,
          {
            backgroundColor: cardSurface,
            borderColor: colors.border,
            opacity: pressed ? 0.86 : 1,
          },
        ]}
      >
        <View style={styles.dailyGoalHeaderRow}>
          <View>
            <Text style={[styles.dailyGoalHeading, { color: colors.text }]}>
              Your daily goal{' '}
              <Text style={{ color: colors.primary }}>
                ({streakInfo.todaySolved}/{goalConfig.targetQuestions} Qs)
              </Text>
            </Text>
            <View style={styles.pointsInlineRow}>
              <Text style={[styles.pointsInlineText, { color: colors.warning }]}>
                Points Earned Today: {streakInfo.todayXp}
              </Text>
              <Zap size={12} color={colors.warning} />
              <Text style={[styles.streakInlineText, { color: colors.textSecondary }]}>
                · {streakInfo.currentStreakDays}d streak
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.textSecondary} />
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
                      backgroundColor: hit ? colors.primary : cardSurface,
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

      {/* 3. HOLO Smart Reminder / Daily Target Nudge */}
      {reminder.shouldShow && (
        <View
          style={[
            styles.holoReminderCard,
            {
              backgroundColor: mode === 'dark' ? '#1A171C' : '#FFF7ED',
              borderColor: reminder.isPastReminderTime ? colors.primary : colors.border,
            },
          ]}
        >
          <View style={styles.holoReminderRow}>
            <Image
              source={goalPct >= 100 ? HOLO_REACTIONS.celebrating_jump : HOLO_REACTIONS.reminder}
              style={styles.holoReminderSprite}
              resizeMode="contain"
            />
            <View style={{ flex: 1, minWidth: 0 }}>
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
        </View>
      )}

      {/* 4. MARKS-Style "Most Imp Digital Books" Horizontal Cover Carousel */}
      <View style={styles.sectionHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionHeading, { color: colors.text, marginBottom: 2 }]}>
            Most Imp Digital Books & Syllabi
          </Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            No need to buy bulky books — read offline with HOLO Book Companion
          </Text>
        </View>
        <TouchableOpacity onPress={() => onNavigate('ebooks')}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>VIEW ALL</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.booksCarousel}
      >
        {SEED_EBOOKS.slice(0, 5).map((book, index) => {
          const accents = ['#F97316', '#8B5CF6', '#10B981', '#3B82F6', '#EC4899'];
          const accent = accents[index % accents.length];
          return (
            <Pressable
              key={book.id}
              focusable={false}
              onPress={() => onNavigate('ebooks')}
              style={({ pressed }) => [
                styles.bookCoverCard,
                {
                  backgroundColor: mode === 'dark' ? '#131924' : '#FFFFFF',
                  borderColor: accent,
                  opacity: pressed ? 0.84 : 1,
                },
              ]}
            >
              <Image
                source={BRANDING_ASSETS.defaultBookCover}
                style={styles.bookCoverArt}
                resizeMode="cover"
              />
              <View style={[styles.bookCoverTint, { backgroundColor: 'rgba(8, 12, 22, 0.72)' }]}>
                <View style={[styles.bookPillBadge, { backgroundColor: accent }]}>
                  <Text style={styles.bookPillText} numberOfLines={1}>
                    {book.category.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.bookCoverTitle} numberOfLines={3}>
                  {book.title}
                </Text>
                <Text style={styles.bookCoverMeta} numberOfLines={1}>
                  {book.chapters.length} Chapters · {book.subject || 'STEM'}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 5. MARKS-Style "Chapter-wise PYQ Bank" 2-Row Compact Grid */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeading, { color: colors.text, marginBottom: 0 }]}>
          Chapter-wise PYQ Bank
        </Text>
        <TouchableOpacity onPress={() => onNavigate('pyqs')}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>VIEW ALL</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pyqGrid}>
        {EXAM_BANK_PRESETS.slice(0, 6).map((exam) => (
          <Pressable
            key={exam.id}
            focusable={false}
            onPress={() => {
              if (exam.id === 'jee_main' || exam.id === 'jee_adv') {
                onNavigate('pyqs');
              } else if (onOpenCurriculumSubject) {
                onOpenCurriculumSubject(exam.defaultSubject);
              } else {
                onNavigate('study');
              }
            }}
            style={({ pressed }) => [
              styles.pyqTile,
              {
                backgroundColor: cardSurface,
                borderColor: colors.border,
                opacity: pressed ? 0.82 : 1,
              },
            ]}
          >
            <Text style={[styles.pyqTileName, { color: colors.text }]} numberOfLines={2}>
              {exam.name}
            </Text>
            <View style={styles.pyqTileFooter}>
              <Text style={[styles.pyqTileSub, { color: colors.textSecondary }]} numberOfLines={1}>
                {exam.subtitle}
              </Text>
              <View style={[styles.pyqCornerDot, { backgroundColor: exam.accent }]} />
            </View>
          </Pressable>
        ))}
      </View>

      {/* 6. MARKS-Style "Revision Flash Cards" Spiral Subject Cards */}
      <View style={styles.sectionHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionHeading, { color: colors.text, marginBottom: 2 }]}>
            Revision Flash Cards
          </Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Quick formula & concept revision, anytime
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => (onOpenFormulas ? onOpenFormulas('physics') : onNavigate('study'))}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>VIEW ALL</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.revisionRow}
      >
        {REVISION_DECKS.map((deck) => (
          <Pressable
            key={deck.id}
            focusable={false}
            onPress={() => (onOpenFormulas ? onOpenFormulas(deck.id) : onNavigate('study'))}
            style={({ pressed }) => [
              styles.revisionCard,
              {
                backgroundColor: mode === 'dark' ? deck.bgDark : deck.bgLight,
                borderColor: deck.accent,
                opacity: pressed ? 0.84 : 1,
              },
            ]}
          >
            <View style={styles.spiralDotsRow}>
              {[0, 1, 2, 3].map((dot) => (
                <View
                  key={dot}
                  style={[styles.spiralDot, { borderColor: deck.accent }]}
                />
              ))}
            </View>
            <Text style={[styles.revisionLabel, { color: deck.accent }]}>{deck.label}</Text>
            <Text style={[styles.revisionCount, { color: colors.text }]}>
              {deck.count} Formula Cards
            </Text>
            <Text style={[styles.revisionFormula, { color: colors.textSecondary }]} numberOfLines={1}>
              {deck.formulaHint}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* 7. MARKS-Style Solve DPPs Banner */}
      <Pressable
        focusable={false}
        onPress={() => onNavigate('test')}
        style={({ pressed }) => [
          styles.dppBanner,
          {
            backgroundColor: cardSurface,
            borderColor: colors.primary,
            opacity: pressed ? 0.84 : 1,
          },
        ]}
      >
        <View style={[styles.dppIconBox, { backgroundColor: mode === 'dark' ? '#361A0B' : '#FFEDD5' }]}>
          <Flame size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.dppTitle, { color: colors.text }]}>Solve Daily Practice (DPPs)</Text>
          <Text style={[styles.dppSub, { color: colors.textSecondary }]}>
            {leaderboard.currentUserEntry.weeklyQuestions} Qs solved this week · Timed & hint-guided
          </Text>
        </View>
        <ChevronRight size={20} color={colors.primary} />
      </Pressable>

      {/* 8. Ask HOLO — Concept-Wise Clarity Search Bar */}
      <Text style={[styles.sectionHeading, { color: colors.text }]}>
        Ask {HOLO_NAME} · Concept-wise Clarity
      </Text>
      <View
        style={[
          styles.holoSearchBar,
          { backgroundColor: cardSurface, borderColor: colors.border },
        ]}
      >
        <Image
          source={HOLO_REACTIONS.waving}
          style={styles.holoSearchAvatar}
          resizeMode="contain"
        />
        <TextInput
          value={conceptQuery}
          onChangeText={setConceptQuery}
          onSubmitEditing={handleConceptSearch}
          returnKeyType="search"
          placeholder={`Ask ${HOLO_NAME} any formula, doubt or derivation...`}
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
        />
        <Pressable
          focusable={false}
          onPress={handleConceptSearch}
          style={({ pressed }) => [
            styles.searchGoBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Search size={15} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* 9. MARKS-Style Study Labs Tests Dual Cards */}
      <Text style={[styles.sectionHeading, { color: colors.text }]}>Study Labs Tests</Text>
      <View style={styles.dualLaunchRow}>
        <Pressable
          focusable={false}
          onPress={() => onNavigate('test')}
          style={({ pressed }) => [
            styles.launchCard,
            { backgroundColor: cardSurface, borderColor: colors.border, opacity: pressed ? 0.82 : 1 },
          ]}
        >
          <View
            style={[
              styles.launchIcon,
              { backgroundColor: mode === 'dark' ? '#1E293B' : '#ECFEFF' },
            ]}
          >
            <Target size={19} color={colors.cyan} />
          </View>
          <Text style={[styles.launchTitle, { color: colors.text }]}>PYQ Mock Tests</Text>
          <Text style={[styles.launchSub, { color: colors.textSecondary }]}>
            Exam-mode papers & analytics
          </Text>
        </Pressable>

        <Pressable
          focusable={false}
          onPress={() => {
            if (onOpenCustomTest) onOpenCustomTest();
            else onNavigate('test');
          }}
          style={({ pressed }) => [
            styles.launchCard,
            { backgroundColor: cardSurface, borderColor: colors.border, opacity: pressed ? 0.82 : 1 },
          ]}
        >
          <View
            style={[
              styles.launchIcon,
              { backgroundColor: mode === 'dark' ? '#2A1710' : '#FFF7ED' },
            ]}
          >
            <PlusCircle size={19} color={colors.primary} />
          </View>
          <Text style={[styles.launchTitle, { color: colors.text }]}>Create Your Own Test</Text>
          <Text style={[styles.launchSub, { color: colors.textSecondary }]}>
            Custom chapters & marking
          </Text>
        </Pressable>
      </View>

      {/* 10. FIXED 2x4 Academic Toolkit & Workspaces Grid (No Vertical Wrapping!) */}
      <Text style={[styles.sectionHeading, { color: colors.text }]}>
        Academic Toolkit & Workspaces
      </Text>
      <View style={styles.toolkitGrid}>
        {toolkitItems.map((item) => (
          <Pressable
            key={item.key}
            focusable={false}
            onPress={() => onNavigate(item.key)}
            style={({ pressed }) => [
              styles.toolkitTile,
              {
                backgroundColor: cardSurface,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.toolkitIconWrap,
                { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : colors.surface },
              ]}
            >
              {item.renderIcon()}
            </View>
            <Text style={[styles.toolkitLabel, { color: colors.text }]} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 11. Study Clubs & Teacher Suite Banner (Uses Default Club Banner & Icon Assets!) */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeading, { color: colors.text, marginBottom: 0 }]}>
          Study Clubs & Teachers
        </Text>
        <TouchableOpacity onPress={() => onNavigate('clubs')}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>OPEN →</Text>
        </TouchableOpacity>
      </View>
      <Pressable
        focusable={false}
        onPress={() => onNavigate('clubs')}
        style={({ pressed }) => [
          styles.clubBannerCard,
          {
            backgroundColor: cardSurface,
            borderColor: colors.primary,
            opacity: pressed ? 0.86 : 1,
          },
        ]}
      >
        <Image
          source={BRANDING_ASSETS.defaultClubBanner}
          style={styles.clubBannerImg}
          resizeMode="cover"
        />
        <View style={styles.clubBannerContent}>
          <Image
            source={BRANDING_ASSETS.defaultClubIcon}
            style={styles.clubIconImg}
            resizeMode="cover"
          />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={[styles.spotlightTitle, { color: colors.text, marginBottom: 0 }]}>
                Cohort Channels & Assignments
              </Text>
              <Badge label={`${joinedClubsCount} Joined`} variant="success" size="sm" />
            </View>
            <Text style={[styles.spotlightSubtitle, { color: colors.textSecondary, marginTop: 3 }]}>
              Role channels, live teacher assignments, polls, attendance & peer doubts.
            </Text>
          </View>
          <ChevronRight size={18} color={colors.primary} />
        </View>
      </Pressable>

      {/* 12. Offline Coaching Tracker + Quick Stats Row */}
      <View style={styles.statsGrid}>
        <Pressable
          focusable={false}
          onPress={() => onNavigate('tracker')}
          style={({ pressed }) => [
            styles.statCardPress,
            { backgroundColor: cardSurface, borderColor: colors.border, opacity: pressed ? 0.82 : 1 },
          ]}
        >
          <View style={styles.statHeader}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Coaching Avg</Text>
            <TrendingUp size={16} color={colors.success} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {offlineTests.length > 0 ? `${offlineAvgPct}%` : 'Log 1st'}
          </Text>
          <Text style={[styles.statSub, { color: colors.success }]}>
            {offlineTests.length} offline tests logged
          </Text>
        </Pressable>

        <Pressable
          focusable={false}
          onPress={() => onNavigate('notebooks')}
          style={({ pressed }) => [
            styles.statCardPress,
            { backgroundColor: cardSurface, borderColor: colors.border, opacity: pressed ? 0.82 : 1 },
          ]}
        >
          <View style={styles.statHeader}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>My Notebooks</Text>
            <BookMarked size={16} color={colors.primary} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {leaderboard.currentUserEntry.weeklyXp} XP
          </Text>
          <Text style={[styles.statSub, { color: colors.textSecondary }]}>
            Notes, Bookmarks & Cloud
          </Text>
        </Pressable>
      </View>

      {/* 13. Focus Recommendations */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeading, { color: colors.text, marginBottom: 0 }]}>
          Focus Recommendations
        </Text>
        <TouchableOpacity onPress={() => onNavigate('analytics')}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>ANALYTICS →</Text>
        </TouchableOpacity>
      </View>
      <Card style={[styles.focusCard, { backgroundColor: cardSurface, borderColor: colors.border }]}>
        {weakTopicSuggestions.map((item, idx) => (
          <TouchableOpacity
            key={`${item.label}_${idx}`}
            onPress={() =>
              onOpenCurriculumSubject
                ? onOpenCurriculumSubject(item.subjectId)
                : onNavigate('study')
            }
            style={[
              styles.focusRow,
              idx !== weakTopicSuggestions.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.borderSubtle,
              },
            ]}
          >
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={{ fontSize: 13.5, fontWeight: '700', color: colors.text }} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>
                {item.subjectId.toUpperCase()} · {item.stat}
              </Text>
            </View>
            <Badge label="Revise" variant="warning" size="sm" />
          </TouchableOpacity>
        ))}
      </Card>

      {/* 14. Compact Live Regional Clock & Next Holiday Bar */}
      <Pressable
        focusable={false}
        onPress={() => onNavigate('syllabus')}
        style={({ pressed }) => [
          styles.liveClockStrip,
          {
            backgroundColor: cardSurface,
            borderColor: todayHoliday ? colors.primary : colors.border,
            opacity: pressed ? 0.84 : 1,
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
              {countryMeta.shortName} ·{' '}
              {todayHoliday
                ? `Holiday Today: ${todayHoliday.name}`
                : upcomingHoliday
                ? `Next Holiday: ${upcomingHoliday.name} (${upcomingHoliday.date.slice(5)})`
                : 'Open Holiday & Exam Calendar'}
            </Text>
          </View>
          <Text style={[styles.calendarCtaText, { color: colors.primary }]}>Calendar →</Text>
        </View>
      </Pressable>

      {/* 15. MARKS-Style Branded Closing Footer (Wires Company Banner & Logo) */}
      <View style={[styles.footerWrap, { borderColor: colors.border, backgroundColor: cardSurface }]}>
        <Image
          source={BRANDING_ASSETS.companyBanner}
          style={styles.companyBannerImg}
          resizeMode="cover"
        />
        <View style={styles.footerTextBlock}>
          <Image
            source={BRANDING_ASSETS.companyLogo}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.footerTagline, { color: colors.text }]}>
              Learn anywhere, Master every concept on Study Labs
            </Text>
            <Text style={[styles.footerSub, { color: colors.textSecondary }]}>
              study.io · Powered by {HOLO_NAME} AI & Open STEM Ecosystem
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 14, paddingBottom: 32 },
  greetingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  greetingLeft: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  avatarWrap: {
    position: 'relative',
  },
  greetingAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  menuDotBadge: {
    position: 'absolute',
    right: -3,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingAvatarText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  greetingTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  greetingSub: { fontSize: 11.5, marginTop: 1 },
  greetingActions: { flexDirection: 'row', gap: 6 },
  leaguePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  leaguePillText: { fontSize: 12, fontWeight: '800' },

  dailyGoalStrip: {
    padding: 13,
    marginBottom: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  dailyGoalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyGoalHeading: { fontSize: 14.5, fontWeight: '800' },
  pointsInlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  pointsInlineText: { fontSize: 11.5, fontWeight: '800' },
  streakInlineText: { fontSize: 11.5, fontWeight: '600' },
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
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  holoReminderCard: {
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 11,
  },
  holoReminderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  holoReminderSprite: { width: 44, height: 44 },
  reminderHeadline: { fontSize: 13.5, fontWeight: '800' },
  reminderSub: { fontSize: 11.5, marginTop: 2, lineHeight: 16 },
  reminderFooter: { flexDirection: 'row', gap: 8 },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
    gap: 10,
  },
  sectionHeading: { fontSize: 16, fontWeight: '800', marginBottom: 10, letterSpacing: -0.2 },
  sectionSub: { fontSize: 11.5, lineHeight: 16 },
  viewAllText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },

  booksCarousel: { gap: 11, paddingBottom: 16 },
  bookCoverCard: {
    width: 128,
    height: 166,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
  },
  bookCoverArt: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  bookCoverTint: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  bookPillBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bookPillText: { color: '#FFFFFF', fontSize: 8.5, fontWeight: '900', letterSpacing: 0.4 },
  bookCoverTitle: { color: '#FFFFFF', fontSize: 12.5, fontWeight: '800', lineHeight: 16 },
  bookCoverMeta: { color: '#E2E8F0', fontSize: 10, fontWeight: '600' },

  pyqGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 18,
  },
  pyqTile: {
    width: '31.2%',
    minHeight: 74,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  pyqTileName: { fontSize: 12.5, fontWeight: '800', lineHeight: 16 },
  pyqTileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 4,
  },
  pyqTileSub: { fontSize: 10, flex: 1 },
  pyqCornerDot: { width: 12, height: 12, borderRadius: 6 },

  revisionRow: { gap: 10, paddingBottom: 16 },
  revisionCard: {
    width: 132,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    gap: 6,
  },
  spiralDotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingHorizontal: 6,
  },
  spiralDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  revisionLabel: { fontSize: 13, fontWeight: '900', letterSpacing: 0.6 },
  revisionCount: { fontSize: 12, fontWeight: '700' },
  revisionFormula: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  dppBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18,
  },
  dppIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dppTitle: { fontSize: 14.5, fontWeight: '800' },
  dppSub: { fontSize: 11.5, marginTop: 2 },

  holoSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
  },
  holoSearchAvatar: { width: 32, height: 32 },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 4 },
  searchGoBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dualLaunchRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
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

  toolkitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginBottom: 18,
  },
  toolkitTile: {
    width: '23.2%',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  toolkitIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolkitLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  clubBannerCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  clubBannerImg: {
    width: '100%',
    height: 76,
  },
  clubBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 12,
  },
  clubIconImg: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  spotlightTitle: { fontSize: 14.5, fontWeight: '800', marginBottom: 3 },
  spotlightSubtitle: { fontSize: 11.5, lineHeight: 16 },

  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCardPress: {
    flex: 1,
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: { fontSize: 12, fontWeight: '700' },
  statValue: { fontSize: 20, fontWeight: '900', marginBottom: 3 },
  statSub: { fontSize: 11, fontWeight: '600' },

  focusCard: { padding: 13, borderWidth: 1, marginBottom: 14 },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },

  liveClockStrip: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 10,
    marginBottom: 16,
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
  liveDateText: { fontSize: 12, fontWeight: '700' },
  liveTimeText: { fontSize: 12, fontWeight: '800', fontVariant: ['tabular-nums'] },
  liveHolidayBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  liveRegionPill: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1, minWidth: 0 },
  liveRegionText: { fontSize: 11, fontWeight: '600', flex: 1 },
  calendarCtaText: { fontSize: 11, fontWeight: '800' },

  footerWrap: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 2,
  },
  companyBannerImg: {
    width: '100%',
    height: 68,
  },
  footerTextBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  footerLogo: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  footerTagline: { fontSize: 12.5, fontWeight: '800' },
  footerSub: { fontSize: 11, marginTop: 2 },
});

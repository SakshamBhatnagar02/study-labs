import type {
  DailyActivitySummary,
  DailyGoalConfig,
  LeaderboardEntry,
  LeagueTierId,
  QuestionAttemptStat,
  QuestionDifficulty,
  SubjectId,
  UserProfile,
  WeekStreakDay,
} from '../types';

export const XP_CORRECT = 25;
export const XP_ATTEMPTED = 10;

export const LEAGUE_TIERS: {
  id: LeagueTierId;
  name: string;
  minXp: number;
  color: string;
  accentBg: string;
}[] = [
  { id: 'starter', name: 'Starter Circuit', minXp: 0, color: '#94A3B8', accentBg: 'rgba(148,163,184,0.16)' },
  { id: 'bronze', name: 'Bronze Spark', minXp: 300, color: '#FB923C', accentBg: 'rgba(251,146,60,0.18)' },
  { id: 'silver', name: 'Silver Pulse', minXp: 700, color: '#38BDF8', accentBg: 'rgba(56,189,248,0.18)' },
  { id: 'gold', name: 'Gold Vector', minXp: 1200, color: '#FACC15', accentBg: 'rgba(250,204,21,0.18)' },
  { id: 'platinum', name: 'Quantum Elite', minXp: 2000, color: '#A855F7', accentBg: 'rgba(168,85,247,0.18)' },
  { id: 'diamond', name: 'Apex Scholar', minXp: 3000, color: '#22D3EE', accentBg: 'rgba(34,211,238,0.18)' },
];

export function formatLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseLocalDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map((n) => parseInt(n, 10));
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0);
}

export function shiftDateKey(key: string, deltaDays: number): string {
  const d = parseLocalDateKey(key);
  d.setDate(d.getDate() + deltaDays);
  return formatLocalDateKey(d);
}

export function formatDurationShort(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '0s';
  const rounded = Math.round(totalSeconds);
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

/**
 * Generates deterministic realistic activity logs across the trailing 15 days
 * so Daily Goal streaks, Contribution Heatmap, Difficulty Analytics, and
 * 7-Day Leaderboard work seamlessly immediately on first launch.
 */
export function buildSeedAttemptLogs(referenceDate = new Date()): QuestionAttemptStat[] {
  const seedTemplate: {
    daysAgo: number;
    questionId: string;
    subjectId: SubjectId;
    chapterId: string;
    difficulty: QuestionDifficulty;
    isCorrect: boolean;
    timeSpentSeconds: number;
  }[] = [
    // Today: 2 warm-up Qs done so Daily Goal shows partial progress + Score Reminder is actionable
    { daysAgo: 0, questionId: 'q_p2', subjectId: 'physics', chapterId: 'ch_p_02', difficulty: 'Easy', isCorrect: true, timeSpentSeconds: 38 },
    { daysAgo: 0, questionId: 'q_m1', subjectId: 'math', chapterId: 'ch_m_01', difficulty: 'Medium', isCorrect: true, timeSpentSeconds: 64 },

    // Yesterday (Day 14 of streak)
    { daysAgo: 1, questionId: 'q_p1', subjectId: 'physics', chapterId: 'ch_p_01', difficulty: 'Medium', isCorrect: true, timeSpentSeconds: 52 },
    { daysAgo: 1, questionId: 'q_c1', subjectId: 'chemistry', chapterId: 'ch_c_01', difficulty: 'Hard', isCorrect: false, timeSpentSeconds: 88 },
    { daysAgo: 1, questionId: 'q_b1', subjectId: 'biology', chapterId: 'ch_b_01', difficulty: 'Easy', isCorrect: true, timeSpentSeconds: 31 },
    { daysAgo: 1, questionId: 'q_p3', subjectId: 'physics', chapterId: 'ch_p_03', difficulty: 'Medium', isCorrect: true, timeSpentSeconds: 59 },
    { daysAgo: 1, questionId: 'q_c2', subjectId: 'chemistry', chapterId: 'ch_c_02', difficulty: 'Easy', isCorrect: true, timeSpentSeconds: 35 },
    { daysAgo: 1, questionId: 'q_m2', subjectId: 'math', chapterId: 'ch_m_02', difficulty: 'Medium', isCorrect: true, timeSpentSeconds: 74 },

    // 2 days ago
    { daysAgo: 2, questionId: 'q_p1', subjectId: 'physics', chapterId: 'ch_p_01', difficulty: 'Medium', isCorrect: false, timeSpentSeconds: 76 },
    { daysAgo: 2, questionId: 'q_c3', subjectId: 'chemistry', chapterId: 'ch_c_01', difficulty: 'Medium', isCorrect: true, timeSpentSeconds: 47 },
    { daysAgo: 2, questionId: 'q_m3', subjectId: 'math', chapterId: 'ch_m_01', difficulty: 'Hard', isCorrect: true, timeSpentSeconds: 95 },
    { daysAgo: 2, questionId: 'q_b2', subjectId: 'biology', chapterId: 'ch_b_01', difficulty: 'Medium', isCorrect: true, timeSpentSeconds: 41 },
    { daysAgo: 2, questionId: 'q_p4', subjectId: 'physics', chapterId: 'ch_p_02', difficulty: 'Hard', isCorrect: false, timeSpentSeconds: 102 },

    // 3..6 days ago (7-day rolling window depth)
    { daysAgo: 3, questionId: 'q_c2', subjectId: 'chemistry', chapterId: 'ch_c_02', difficulty: 'Easy', isCorrect: true, timeSpentSeconds: 29 },
    { daysAgo: 3, questionId: 'q_m2', subjectId: 'math', chapterId: 'ch_m_02', difficulty: 'Medium', isCorrect: true, timeSpentSeconds: 67 },
    { daysAgo: 3, questionId: 'q_p1', subjectId: 'physics', chapterId: 'ch_p_01', difficulty: 'Medium', isCorrect: true, timeSpentSeconds: 49 },
    { daysAgo: 3, questionId: 'q_b1', subjectId: 'biology', chapterId: 'ch_b_01', difficulty: 'Easy', isCorrect: true, timeSpentSeconds: 26 },
    { daysAgo: 4, questionId: 'q_m3', subjectId: 'math', chapterId: 'ch_m_01', difficulty: 'Hard', isCorrect: false, timeSpentSeconds: 110 },
    { daysAgo: 4, questionId: 'q_c1', subjectId: 'chemistry', chapterId: 'ch_c_01', difficulty: 'Hard', isCorrect: true, timeSpentSeconds: 83 },
    { daysAgo: 4, questionId: 'q_p2', subjectId: 'physics', chapterId: 'ch_p_02', difficulty: 'Easy', isCorrect: true, timeSpentSeconds: 34 },
    { daysAgo: 5, questionId: 'q_p3', subjectId: 'physics', chapterId: 'ch_p_03', difficulty: 'Medium', isCorrect: true, timeSpentSeconds: 58 },
    { daysAgo: 5, questionId: 'q_c3', subjectId: 'chemistry', chapterId: 'ch_c_01', difficulty: 'Medium', isCorrect: true, timeSpentSeconds: 44 },
    { daysAgo: 5, questionId: 'q_b2', subjectId: 'biology', chapterId: 'ch_b_01', difficulty: 'Medium', isCorrect: false, timeSpentSeconds: 51 },
    { daysAgo: 6, questionId: 'q_p4', subjectId: 'physics', chapterId: 'ch_p_02', difficulty: 'Hard', isCorrect: true, timeSpentSeconds: 91 },
    { daysAgo: 6, questionId: 'q_m1', subjectId: 'math', chapterId: 'ch_m_01', difficulty: 'Medium', isCorrect: true, timeSpentSeconds: 62 },

    // Earlier days within past 14 days for monthly contribution heatmap
    { daysAgo: 8, questionId: 'q_p2', subjectId: 'physics', chapterId: 'ch_p_02', difficulty: 'Easy', isCorrect: true, timeSpentSeconds: 36 },
    { daysAgo: 8, questionId: 'q_c2', subjectId: 'chemistry', chapterId: 'ch_c_02', difficulty: 'Easy', isCorrect: true, timeSpentSeconds: 30 },
    { daysAgo: 9, questionId: 'q_m2', subjectId: 'math', chapterId: 'ch_m_02', difficulty: 'Medium', isCorrect: true, timeSpentSeconds: 68 },
    { daysAgo: 10, questionId: 'q_b1', subjectId: 'biology', chapterId: 'ch_b_01', difficulty: 'Easy', isCorrect: true, timeSpentSeconds: 28 },
    { daysAgo: 11, questionId: 'q_p1', subjectId: 'physics', chapterId: 'ch_p_01', difficulty: 'Medium', isCorrect: true, timeSpentSeconds: 55 },
    { daysAgo: 12, questionId: 'q_c1', subjectId: 'chemistry', chapterId: 'ch_c_01', difficulty: 'Hard', isCorrect: true, timeSpentSeconds: 79 },
    { daysAgo: 13, questionId: 'q_m1', subjectId: 'math', chapterId: 'ch_m_01', difficulty: 'Medium', isCorrect: false, timeSpentSeconds: 71 },
    { daysAgo: 14, questionId: 'q_p3', subjectId: 'physics', chapterId: 'ch_p_03', difficulty: 'Medium', isCorrect: true, timeSpentSeconds: 60 },
  ];

  return seedTemplate.map((item, idx) => {
    const dt = new Date(referenceDate);
    dt.setDate(dt.getDate() - item.daysAgo);
    dt.setHours(18 - (idx % 5), (idx * 11) % 60, 0, 0);
    return {
      questionId: item.questionId,
      subjectId: item.subjectId,
      chapterId: item.chapterId,
      difficulty: item.difficulty,
      isCorrect: item.isCorrect,
      timeSpentSeconds: item.timeSpentSeconds,
      selectedAnswer: item.isCorrect ? 'opt_2' : 'opt_1',
      attemptedAt: dt.toISOString(),
    };
  });
}

export function aggregateDailyActivity(
  logs: QuestionAttemptStat[]
): Record<string, DailyActivitySummary> {
  const map: Record<string, DailyActivitySummary> = {};

  for (const log of logs) {
    const dt = new Date(log.attemptedAt);
    if (isNaN(dt.getTime())) continue;
    const key = formatLocalDateKey(dt);
    if (!map[key]) {
      map[key] = {
        date: key,
        questionsSolved: 0,
        correctCount: 0,
        totalTimeSeconds: 0,
        xpEarned: 0,
      };
    }
    map[key].questionsSolved += 1;
    if (log.isCorrect) {
      map[key].correctCount += 1;
    }
    map[key].totalTimeSeconds += Math.max(1, log.timeSpentSeconds || 30);
    map[key].xpEarned += log.isCorrect ? XP_CORRECT : XP_ATTEMPTED;
  }

  return map;
}

export function computeStreakAndWeek(
  dailyMap: Record<string, DailyActivitySummary>,
  targetQuestions: number,
  referenceDate = new Date(),
  baselineStreakDays = 0
): {
  currentStreakDays: number;
  todaySolved: number;
  todayXp: number;
  todayAccuracy: number;
  weekDays: WeekStreakDay[];
} {
  const todayKey = formatLocalDateKey(referenceDate);
  const todaySummary = dailyMap[todayKey];
  const todaySolved = todaySummary?.questionsSolved || 0;
  const todayXp = todaySummary?.xpEarned || 0;
  const todayAccuracy =
    todaySolved > 0 ? Math.round(((todaySummary?.correctCount || 0) / todaySolved) * 100) : 0;

  // Mon..Sun calculation for referenceDate's week (getDay(): 0=Sun -> 6, 1=Mon -> 0)
  const dayOfWeekMonFirst = (referenceDate.getDay() + 6) % 7;
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() - dayOfWeekMonFirst);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const weekDays: WeekStreakDay[] = dayNames.map((dayShort, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateKey = formatLocalDateKey(d);
    const solved = dailyMap[dateKey]?.questionsSolved || 0;
    const isToday = dateKey === todayKey;
    const isFuture = dateKey > todayKey;
    const metGoal = solved >= Math.max(1, Math.min(targetQuestions, solved > 0 ? targetQuestions : 1))
      ? solved >= targetQuestions
      : false;
    return {
      date: dateKey,
      dayShort,
      questionsSolved: solved,
      metGoal: solved >= targetQuestions,
      isToday,
      isFuture,
    };
  });

  // Compute consecutive active streak days ending today (or yesterday if today hasn't reached target yet)
  // Note: Any day with >= 1 question maintains activity streak, or if strict goal met.
  const todayQualifies = todaySolved >= 1;
  let cursorKey = todayQualifies ? todayKey : shiftDateKey(todayKey, -1);
  let activeStreak = 0;

  while ((dailyMap[cursorKey]?.questionsSolved || 0) > 0 && activeStreak < 365) {
    activeStreak += 1;
    cursorKey = shiftDateKey(cursorKey, -1);
  }

  // Merge gracefully with baseline profile streak when seed covers recent days
  const currentStreakDays = Math.max(
    activeStreak,
    activeStreak >= 5 ? baselineStreakDays + (todaySolved >= targetQuestions ? 1 : 0) : activeStreak
  );

  return {
    currentStreakDays,
    todaySolved,
    todayXp,
    todayAccuracy,
    weekDays,
  };
}

export interface HeatmapCell {
  date: string;
  dayOfMonth: number;
  inMonth: boolean;
  questionsSolved: number;
  xpEarned: number;
  intensity: 0 | 1 | 2 | 3 | 4;
  isToday: boolean;
  isFuture: boolean;
}

export function getMonthHeatmapWeeks(
  year: number,
  monthIndex: number, // 0-based
  dailyMap: Record<string, DailyActivitySummary>,
  targetQuestions: number,
  referenceDate = new Date()
): HeatmapCell[][] {
  const todayKey = formatLocalDateKey(referenceDate);
  const firstDay = new Date(year, monthIndex, 1, 12, 0, 0);
  const lastDay = new Date(year, monthIndex + 1, 0, 12, 0, 0);

  // Align grid start to Monday
  const leadingBlanks = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - leadingBlanks);

  const totalDaysInMonth = lastDay.getDate();
  const totalSlots = Math.ceil((leadingBlanks + totalDaysInMonth) / 7) * 7;

  const flat: HeatmapCell[] = [];
  for (let i = 0; i < totalSlots; i++) {
    const cur = new Date(gridStart);
    cur.setDate(gridStart.getDate() + i);
    const dateKey = formatLocalDateKey(cur);
    const summary = dailyMap[dateKey];
    const solved = summary?.questionsSolved || 0;
    const xpEarned = summary?.xpEarned || 0;

    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (solved > 0) {
      const ratio = solved / Math.max(1, targetQuestions);
      if (ratio >= 1) intensity = 4;
      else if (ratio >= 0.65) intensity = 3;
      else if (ratio >= 0.3) intensity = 2;
      else intensity = 1;
    }

    flat.push({
      date: dateKey,
      dayOfMonth: cur.getDate(),
      inMonth: cur.getMonth() === monthIndex,
      questionsSolved: solved,
      xpEarned,
      intensity,
      isToday: dateKey === todayKey,
      isFuture: dateKey > todayKey,
    });
  }

  const weeks: HeatmapCell[][] = [];
  for (let i = 0; i < flat.length; i += 7) {
    weeks.push(flat.slice(i, i + 7));
  }
  return weeks;
}

export function computeHistorySummary(
  logs: QuestionAttemptStat[],
  range: 'week' | 'month' | 'quarter',
  subjectFilter: SubjectId | 'all',
  referenceDate = new Date()
): {
  qsSolved: number;
  avgTimeSeconds: number;
  accuracyPercent: number;
  totalXp: number;
} {
  const daysBack = range === 'week' ? 7 : range === 'month' ? 30 : 90;
  const cutoffKey = shiftDateKey(formatLocalDateKey(referenceDate), -(daysBack - 1));

  const filtered = logs.filter((log) => {
    const dt = new Date(log.attemptedAt);
    if (isNaN(dt.getTime())) return false;
    const key = formatLocalDateKey(dt);
    if (key < cutoffKey) return false;
    if (subjectFilter !== 'all' && log.subjectId !== subjectFilter) return false;
    return true;
  });

  if (filtered.length === 0) {
    return { qsSolved: 0, avgTimeSeconds: 0, accuracyPercent: 0, totalXp: 0 };
  }

  const correct = filtered.filter((l) => l.isCorrect).length;
  const totalTime = filtered.reduce((acc, l) => acc + Math.max(1, l.timeSpentSeconds || 30), 0);
  const totalXp = filtered.reduce((acc, l) => acc + (l.isCorrect ? XP_CORRECT : XP_ATTEMPTED), 0);

  return {
    qsSolved: filtered.length,
    avgTimeSeconds: parseFloat((totalTime / filtered.length).toFixed(1)),
    accuracyPercent: parseFloat(((correct / filtered.length) * 100).toFixed(1)),
    totalXp,
  };
}

export interface DifficultyBreakdownRow {
  difficulty: QuestionDifficulty;
  attempted: number;
  correct: number;
  accuracyPercent: number;
  avgTimeSeconds: number;
}

export function computeDifficultyBreakdown(
  logs: QuestionAttemptStat[],
  filters?: { chapterId?: string; subjectId?: SubjectId }
): DifficultyBreakdownRow[] {
  const levels: QuestionDifficulty[] = ['Easy', 'Medium', 'Hard'];
  const scoped = logs.filter((l) => {
    if (filters?.chapterId && l.chapterId !== filters.chapterId) return false;
    if (filters?.subjectId && l.subjectId !== filters.subjectId) return false;
    return true;
  });

  return levels.map((difficulty) => {
    const items = scoped.filter((l) => l.difficulty === difficulty);
    if (items.length === 0) {
      return { difficulty, attempted: 0, correct: 0, accuracyPercent: 0, avgTimeSeconds: 0 };
    }
    const correct = items.filter((i) => i.isCorrect).length;
    const totalTime = items.reduce((sum, i) => sum + Math.max(1, i.timeSpentSeconds || 30), 0);
    return {
      difficulty,
      attempted: items.length,
      correct,
      accuracyPercent: Math.round((correct / items.length) * 100),
      avgTimeSeconds: Math.round(totalTime / items.length),
    };
  });
}

export function getLatestQuestionStatusMap(
  logs: QuestionAttemptStat[]
): Record<string, QuestionAttemptStat> {
  const map: Record<string, QuestionAttemptStat> = {};
  for (const log of logs) {
    const existing = map[log.questionId];
    if (!existing || log.attemptedAt >= existing.attemptedAt) {
      map[log.questionId] = log;
    }
  }
  return map;
}

const BENCHMARK_PEERS: Omit<LeaderboardEntry, 'rank'>[] = [
  { id: 'peer_1', name: 'Ananya Verma', ioId: 'STUDY-4109-IO', weeklyXp: 1180, todayXp: 245, weeklyQuestions: 52, todayQuestions: 11, accuracyPercent: 91, streakDays: 21 },
  { id: 'peer_2', name: 'Rohan Deshmukh', ioId: 'STUDY-5821-IO', weeklyXp: 1040, todayXp: 210, weeklyQuestions: 46, todayQuestions: 9, accuracyPercent: 87, streakDays: 18 },
  { id: 'peer_3', name: 'Sakshi Nair', ioId: 'STUDY-3302-IO', weeklyXp: 895, todayXp: 175, weeklyQuestions: 41, todayQuestions: 8, accuracyPercent: 85, streakDays: 15 },
  { id: 'peer_4', name: 'Kabir Mehta', ioId: 'STUDY-6470-IO', weeklyXp: 760, todayXp: 150, weeklyQuestions: 35, todayQuestions: 7, accuracyPercent: 83, streakDays: 12 },
  { id: 'peer_5', name: 'Ishita Patel', ioId: 'STUDY-9124-IO', weeklyXp: 645, todayXp: 125, weeklyQuestions: 30, todayQuestions: 6, accuracyPercent: 80, streakDays: 11 },
  { id: 'peer_6', name: 'Vivaan Kapoor', ioId: 'STUDY-2287-IO', weeklyXp: 515, todayXp: 95, weeklyQuestions: 24, todayQuestions: 4, accuracyPercent: 78, streakDays: 9 },
  { id: 'peer_7', name: 'Diya Joshi', ioId: 'STUDY-7053-IO', weeklyXp: 390, todayXp: 70, weeklyQuestions: 19, todayQuestions: 3, accuracyPercent: 75, streakDays: 7 },
  { id: 'peer_8', name: 'Arjun Malhotra', ioId: 'STUDY-1845-IO', weeklyXp: 265, todayXp: 45, weeklyQuestions: 14, todayQuestions: 2, accuracyPercent: 72, streakDays: 5 },
  { id: 'peer_9', name: 'Meera Iyer', ioId: 'STUDY-8590-IO', weeklyXp: 175, todayXp: 25, weeklyQuestions: 9, todayQuestions: 1, accuracyPercent: 70, streakDays: 4 },
];

export function resolveLeagueTier(xp: number) {
  let current = LEAGUE_TIERS[0];
  let next: (typeof LEAGUE_TIERS)[number] | null = LEAGUE_TIERS[1] || null;

  for (let i = 0; i < LEAGUE_TIERS.length; i++) {
    if (xp >= LEAGUE_TIERS[i].minXp) {
      current = LEAGUE_TIERS[i];
      next = LEAGUE_TIERS[i + 1] || null;
    }
  }

  const xpToNextTier = next ? Math.max(0, next.minXp - xp) : 0;
  return { currentTier: current, nextTier: next, xpToNextTier };
}

export function build7DayLeaderboard(
  logs: QuestionAttemptStat[],
  profile: Pick<UserProfile, 'id' | 'name' | 'ioId' | 'studyStreakDays'>,
  windowMode: 'week' | 'today' = 'week',
  referenceDate = new Date()
): {
  entries: LeaderboardEntry[];
  currentUserEntry: LeaderboardEntry;
  currentTier: (typeof LEAGUE_TIERS)[number];
  nextTier: (typeof LEAGUE_TIERS)[number] | null;
  xpToNextTier: number;
  daysUntilWeeklyReset: number;
} {
  const todayKey = formatLocalDateKey(referenceDate);
  const weekCutoffKey = shiftDateKey(todayKey, -6); // Rolling 7 days including today

  const weeklyLogs = logs.filter((l) => {
    const dt = new Date(l.attemptedAt);
    if (isNaN(dt.getTime())) return false;
    return formatLocalDateKey(dt) >= weekCutoffKey;
  });

  const todayLogs = weeklyLogs.filter((l) => {
    const dt = new Date(l.attemptedAt);
    return formatLocalDateKey(dt) === todayKey;
  });

  const weeklyXp = weeklyLogs.reduce((s, l) => s + (l.isCorrect ? XP_CORRECT : XP_ATTEMPTED), 0);
  const todayXp = todayLogs.reduce((s, l) => s + (l.isCorrect ? XP_CORRECT : XP_ATTEMPTED), 0);
  const weeklyCorrect = weeklyLogs.filter((l) => l.isCorrect).length;
  const accuracyPercent =
    weeklyLogs.length > 0 ? Math.round((weeklyCorrect / weeklyLogs.length) * 100) : 0;

  const userEntryBase: LeaderboardEntry = {
    id: profile.id || 'usr_local_01',
    name: `${profile.name} (You)`,
    ioId: profile.ioId,
    weeklyXp,
    todayXp,
    weeklyQuestions: weeklyLogs.length,
    todayQuestions: todayLogs.length,
    accuracyPercent,
    streakDays: profile.studyStreakDays,
    isCurrentUser: true,
  };

  const combined = [...BENCHMARK_PEERS, userEntryBase].sort((a, b) => {
    const metricA = windowMode === 'week' ? a.weeklyXp : a.todayXp;
    const metricB = windowMode === 'week' ? b.weeklyXp : b.todayXp;
    if (metricB !== metricA) return metricB - metricA;
    if (b.accuracyPercent !== a.accuracyPercent) return b.accuracyPercent - a.accuracyPercent;
    return a.isCurrentUser ? -1 : 1;
  });

  const entries = combined.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  const currentUserEntry = entries.find((e) => e.isCurrentUser) || { ...userEntryBase, rank: entries.length };
  const tierInfo = resolveLeagueTier(weeklyXp);

  // Days until Sunday midnight weekly league summary reset
  const dayMonFirst = (referenceDate.getDay() + 6) % 7;
  const daysUntilWeeklyReset = Math.max(1, 7 - dayMonFirst);

  return {
    entries,
    currentUserEntry,
    ...tierInfo,
    daysUntilWeeklyReset,
  };
}

export function evaluateScoreReminder(
  config: DailyGoalConfig,
  todaySolved: number,
  streakDays: number,
  referenceDate = new Date()
): {
  shouldShow: boolean;
  isGoalMet: boolean;
  isPastReminderTime: boolean;
  headline: string;
  subtext: string;
  progressPercent: number;
  remainingQuestions: number;
} {
  const todayKey = formatLocalDateKey(referenceDate);
  const target = Math.max(1, config.targetQuestions);
  const remainingQuestions = Math.max(0, target - todaySolved);
  const isGoalMet = remainingQuestions === 0;
  const progressPercent = Math.min(100, Math.round((todaySolved / target) * 100));

  const [remHourStr, remMinStr] = (config.reminderTime || '20:00').split(':');
  const remHour = parseInt(remHourStr, 10) || 20;
  const remMin = parseInt(remMinStr, 10) || 0;
  const currentMins = referenceDate.getHours() * 60 + referenceDate.getMinutes();
  const reminderMins = remHour * 60 + remMin;
  const isPastReminderTime = currentMins >= reminderMins;

  const isDismissedToday = config.lastReminderDismissedDate === todayKey;
  const shouldShow =
    config.reminderEnabled &&
    config.scoreAlertsEnabled &&
    !isDismissedToday &&
    !isGoalMet;

  if (isGoalMet) {
    return {
      shouldShow: false,
      isGoalMet: true,
      isPastReminderTime,
      headline: `Daily Goal Complete (${todaySolved}/${target} Qs)`,
      subtext: `Awesome! You locked in today's ${streakDays}-day streak and boosted your 7-day league rank.`,
      progressPercent: 100,
      remainingQuestions: 0,
    };
  }

  const headline = isPastReminderTime
    ? `Score Reminder · ${remainingQuestions} Qs Left Today`
    : `Daily Target · ${todaySolved}/${target} Qs Done`;

  const subtext = isPastReminderTime
    ? `Past your ${config.reminderTime} reminder — solve ${remainingQuestions} more Qs (+${remainingQuestions * XP_CORRECT} XP max) to protect your ${streakDays}-day streak.`
    : `Solve ${remainingQuestions} more Qs before ${config.reminderTime} to climb the 7-Day Leaderboard.`;

  return {
    shouldShow,
    isGoalMet: false,
    isPastReminderTime,
    headline,
    subtext,
    progressPercent,
    remainingQuestions,
  };
}

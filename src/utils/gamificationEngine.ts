import type {
  AchievementBadge,
  DailyChallenge,
  LeaderboardEntry,
  LeaderboardTimeframe,
  QuestionAttemptStat,
  UserProfile,
} from '../types';
import {
  aggregateDailyActivity,
  build7DayLeaderboard,
  computeStreakAndWeek,
  formatLocalDateKey,
  shiftDateKey,
} from './activityStats';

export interface MultiPeriodLeaderboardResult {
  timeframe: LeaderboardTimeframe;
  label: string;
  entries: LeaderboardEntry[];
  currentUserEntry: LeaderboardEntry;
  currentUserStats: {
    xp: number;
    questions: number;
    accuracyPercent: number;
  };
}

const TIMEFRAME_MULTIPLIER: Record<LeaderboardTimeframe, number> = {
  today: 1,
  week: 1,
  month: 3.8,
  year: 36,
  all_time: 64,
};

const TIMEFRAME_LABELS: Record<LeaderboardTimeframe, string> = {
  today: "Today's Sprint",
  week: 'Rolling 7 Days',
  month: 'This Month (30d)',
  year: 'Academic Year',
  all_time: 'All-Time Hall of Fame',
};

export function buildMultiPeriodLeaderboard(
  logs: QuestionAttemptStat[],
  profile: UserProfile,
  timeframe: LeaderboardTimeframe,
  now: Date = new Date()
): MultiPeriodLeaderboardResult {
  const base7d = build7DayLeaderboard(logs, profile, timeframe === 'today' ? 'today' : 'week', now);
  if (timeframe === 'today' || timeframe === 'week') {
    return {
      timeframe,
      label: TIMEFRAME_LABELS[timeframe],
      entries: base7d.entries,
      currentUserEntry: base7d.currentUserEntry,
      currentUserStats: {
        xp:
          timeframe === 'today'
            ? base7d.currentUserEntry.todayXp
            : base7d.currentUserEntry.weeklyXp,
        questions:
          timeframe === 'today'
            ? base7d.currentUserEntry.todayQuestions
            : base7d.currentUserEntry.weeklyQuestions,
        accuracyPercent: base7d.currentUserEntry.accuracyPercent,
      },
    };
  }

  const cutoffDays = timeframe === 'month' ? 29 : timeframe === 'year' ? 364 : 36500;
  const cutoffKey = shiftDateKey(formatLocalDateKey(now), -cutoffDays);
  const dailyMap = aggregateDailyActivity(logs);

  let userPeriodXp = 0;
  let userPeriodQs = 0;
  let userPeriodCorrect = 0;

  for (const [dateKey, day] of Object.entries(dailyMap)) {
    if (dateKey >= cutoffKey) {
      userPeriodXp += day.xpEarned;
      userPeriodQs += day.questionsSolved;
      userPeriodCorrect += day.correctCount;
    }
  }

  if (timeframe === 'all_time') {
    userPeriodXp = Math.max(userPeriodXp, profile.totalXp || 0);
  }

  const mult = TIMEFRAME_MULTIPLIER[timeframe];
  const userAccuracy =
    userPeriodQs > 0
      ? Math.round((userPeriodCorrect / userPeriodQs) * 100)
      : base7d.currentUserEntry.accuracyPercent;

  const scaledEntries: LeaderboardEntry[] = base7d.entries.map((e) => {
    if (e.isCurrentUser) {
      return {
        ...e,
        weeklyXp: userPeriodXp,
        weeklyQuestions: Math.max(userPeriodQs, e.weeklyQuestions),
        accuracyPercent: userAccuracy,
      };
    }
    return {
      ...e,
      weeklyXp: Math.round(e.weeklyXp * mult),
      weeklyQuestions: Math.round(e.weeklyQuestions * mult),
    };
  });

  scaledEntries.sort((a, b) => b.weeklyXp - a.weeklyXp || b.accuracyPercent - a.accuracyPercent);
  const ranked = scaledEntries.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  const currentUserEntry = ranked.find((e) => e.isCurrentUser) || ranked[0];

  return {
    timeframe,
    label: TIMEFRAME_LABELS[timeframe],
    entries: ranked,
    currentUserEntry,
    currentUserStats: {
      xp: currentUserEntry.weeklyXp,
      questions: currentUserEntry.weeklyQuestions,
      accuracyPercent: currentUserEntry.accuracyPercent,
    },
  };
}

export function evaluateAchievementBadges(
  logs: QuestionAttemptStat[],
  profile: UserProfile,
  dailyTarget = 15,
  clubsJoinedCount = 1
): AchievementBadge[] {
  const dailyMap = aggregateDailyActivity(logs);
  const streak = computeStreakAndWeek(dailyMap, dailyTarget, new Date(), profile.studyStreakDays);
  const totalQs = logs.length;
  const correctQs = logs.filter((l) => l.isCorrect).length;
  const overallAcc = totalQs > 0 ? Math.round((correctQs / totalQs) * 100) : 0;

  return [
    {
      id: 'badge_streak_7',
      title: '7-Day Consistency Flame',
      description: 'Maintain an active study streak of 7+ consecutive days.',
      iconName: 'flame',
      color: '#F97316',
      unlocked: streak.currentStreakDays >= 7,
      progressLabel: `${Math.min(streak.currentStreakDays, 7)}/7 days`,
    },
    {
      id: 'badge_sharpshooter',
      title: 'Accuracy Sharpshooter',
      description: 'Achieve >= 75% accuracy across 10+ attempted questions.',
      iconName: 'target',
      color: '#10B981',
      unlocked: totalQs >= 10 && overallAcc >= 75,
      progressLabel: totalQs >= 10 ? `${overallAcc}% acc` : `${totalQs}/10 Qs`,
    },
    {
      id: 'badge_century',
      title: 'Centurion Problem Solver',
      description: 'Log 50+ solved problems across STEM subjects.',
      iconName: 'trophy',
      color: '#F59E0B',
      unlocked: totalQs >= 50,
      progressLabel: `${Math.min(totalQs, 50)}/50 Qs`,
    },
    {
      id: 'badge_club_scholar',
      title: 'Study Guild Collaborator',
      description: 'Join or lead an institute cohort or peer study club.',
      iconName: 'users',
      color: '#22D3EE',
      unlocked: clubsJoinedCount >= 1,
      progressLabel: `${clubsJoinedCount} club${clubsJoinedCount === 1 ? '' : 's'}`,
    },
    {
      id: 'badge_level_8',
      title: 'Cyber Scholar Tier',
      description: 'Reach Study Labs XP Level 5 or higher.',
      iconName: 'award',
      color: '#8B5CF6',
      unlocked: (profile.level || 1) >= 5,
      progressLabel: `LVL ${profile.level || 1}`,
    },
  ];
}

export function buildDailyChallenges(
  logs: QuestionAttemptStat[],
  dailyTarget = 15,
  claimedIds: string[] = []
): DailyChallenge[] {
  const dailyMap = aggregateDailyActivity(logs);
  const todayKey = formatLocalDateKey(new Date());
  const todaySummary = dailyMap[todayKey];
  const todayQs = todaySummary?.questionsSolved || 0;
  const todayCorrect = todaySummary?.correctCount || 0;
  const claimedSet = new Set(claimedIds);

  return [
    {
      id: 'ch_daily_target',
      title: `Solve ${Math.max(5, Math.min(10, dailyTarget))} Practice Qs Today`,
      subtitle: 'Any Physics, Chemistry, Math or Biology drill',
      xpReward: 120,
      currentCount: Math.min(todayQs, Math.max(5, Math.min(10, dailyTarget))),
      targetCount: Math.max(5, Math.min(10, dailyTarget)),
      claimed: claimedSet.has('ch_daily_target'),
    },
    {
      id: 'ch_precision_5',
      title: 'Nail 5 Correct Answers Today',
      subtitle: 'Build conceptual mastery with zero guesswork',
      xpReward: 90,
      currentCount: Math.min(todayCorrect, 5),
      targetCount: 5,
      claimed: claimedSet.has('ch_precision_5'),
    },
    {
      id: 'ch_club_engage',
      title: 'Check Institute & Club Feeds',
      subtitle: 'Participate in a poll, resource, or doubt channel',
      xpReward: 60,
      currentCount: 1,
      targetCount: 1,
      claimed: claimedSet.has('ch_club_engage'),
    },
  ];
}

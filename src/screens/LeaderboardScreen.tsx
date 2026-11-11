import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { DailyGoalModal } from '../components/common/DailyGoalModal';
import { DEFAULT_DAILY_GOAL, DEFAULT_USER, StorageService } from '../services/storage';
import { HapticManager } from '../services/hapticManager';
import {
  DailyGoalConfig,
  LeaderboardTimeframe,
  QuestionAttemptStat,
  UserProfile,
} from '../types';
import {
  build7DayLeaderboard,
  formatLocalDateKey,
  LEAGUE_TIERS,
} from '../utils/activityStats';
import {
  buildDailyChallenges,
  buildMultiPeriodLeaderboard,
  evaluateAchievementBadges,
} from '../utils/gamificationEngine';
import {
  Award,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock,
  Crown,
  Flame,
  Medal,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react-native';

interface LeaderboardScreenProps {
  onStartPractice?: () => void;
}

const TIMEFRAME_PILLS: { id: LeaderboardTimeframe; label: string }[] = [
  { id: 'today', label: "Today's Sprint" },
  { id: 'week', label: '7 Days' },
  { id: 'month', label: '30 Days' },
  { id: 'year', label: 'Academic Year' },
  { id: 'all_time', label: 'All-Time' },
];

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onStartPractice }) => {
  const { colors, mode } = useTheme();
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('week');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER);
  const [logs, setLogs] = useState<QuestionAttemptStat[]>([]);
  const [goalConfig, setGoalConfig] = useState<DailyGoalConfig>(DEFAULT_DAILY_GOAL);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [clubsJoinedCount, setClubsJoinedCount] = useState<number>(1);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);

  const todayKey = formatLocalDateKey(new Date());

  const loadData = useCallback(async () => {
    const [prof, attemptLogs, cfg, claimed, clubsWs] = await Promise.all([
      StorageService.getUserProfile(),
      StorageService.getAttemptLogs(),
      StorageService.getDailyGoalConfig(),
      StorageService.getClaimedChallengeIds(todayKey),
      StorageService.getClubsWorkspace(),
    ]);
    setProfile(prof);
    setLogs(attemptLogs);
    setGoalConfig(cfg);
    setClaimedIds(claimed);
    setClubsJoinedCount(clubsWs.joinedClubIds?.length || 0);
  }, [todayKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Rolling 7D League data drives tier stepper + weekly reset timer
  const {
    currentUserEntry: leagueUserEntry,
    currentTier,
    nextTier,
    xpToNextTier,
    daysUntilWeeklyReset,
  } = build7DayLeaderboard(logs, profile, 'week', new Date());

  // Multi-period standings data drives leaderboard rows + pinned footer
  const periodBoard = buildMultiPeriodLeaderboard(logs, profile, timeframe, new Date());
  const dailyChallenges = buildDailyChallenges(logs, goalConfig.targetQuestions, claimedIds);
  const badges = evaluateAchievementBadges(
    logs,
    profile,
    goalConfig.targetQuestions,
    clubsJoinedCount
  );

  const handleClaimChallenge = async (challengeId: string, xpReward: number) => {
    HapticManager.triggerSuccess();
    const updatedClaimed = await StorageService.claimChallengeReward(
      todayKey,
      challengeId,
      xpReward
    );
    setClaimedIds(updatedClaimed);
    const updatedProf = await StorageService.getUserProfile();
    setProfile(updatedProf);
  };

  const getRankDecoration = (rank: number) => {
    if (rank === 1) return { color: '#FACC15', bg: 'rgba(250, 204, 21, 0.16)' };
    if (rank === 2) return { color: '#CBD5E1', bg: 'rgba(203, 213, 225, 0.16)' };
    if (rank === 3) return { color: '#FB923C', bg: 'rgba(251, 146, 60, 0.16)' };
    return { color: colors.textSecondary, bg: colors.surface };
  };

  const renderBadgeIcon = (
    name: 'flame' | 'target' | 'trophy' | 'sparkles' | 'book' | 'users' | 'award',
    color: string
  ) => {
    if (name === 'flame') return <Flame size={18} color={color} />;
    if (name === 'target') return <Target size={18} color={color} />;
    if (name === 'trophy') return <Trophy size={18} color={color} />;
    if (name === 'users') return <Users size={18} color={color} />;
    if (name === 'book') return <BookOpen size={18} color={color} />;
    if (name === 'sparkles') return <Sparkles size={18} color={color} />;
    return <Award size={18} color={color} />;
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* League Hero Card */}
        <Card
          style={[
            styles.leagueCard,
            {
              backgroundColor: mode === 'dark' ? '#131A29' : '#FFFFFF',
              borderColor: currentTier.color,
            },
          ]}
        >
          <View style={styles.leagueHeaderRow}>
            <View style={[styles.shieldBox, { backgroundColor: currentTier.accentBg }]}>
              <Shield size={28} color={currentTier.color} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.tierLabelRow}>
                <Text style={[styles.tierName, { color: currentTier.color }]}>
                  {currentTier.name.toUpperCase()}
                </Text>
                <Badge
                  label={`RESETS IN ${daysUntilWeeklyReset}D`}
                  variant="primary"
                  size="sm"
                />
              </View>
              <Text style={[styles.leagueSub, { color: colors.textSecondary }]}>
                Rolling 7-Day Study Labs League · Weekly Rank #{leagueUserEntry.rank}
              </Text>
            </View>
          </View>

          {/* 6-Node League Tier Stepper */}
          <View style={styles.stepperRow}>
            {LEAGUE_TIERS.map((tier) => {
              const reached = leagueUserEntry.weeklyXp >= tier.minXp;
              const isCurrent = tier.id === currentTier.id;
              return (
                <View key={tier.id} style={styles.stepNodeCol}>
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: reached ? tier.color : colors.surface,
                        borderColor: isCurrent ? '#FFFFFF' : tier.color,
                        borderWidth: isCurrent ? 2.5 : 1.5,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.stepThreshold,
                      {
                        color: reached ? colors.text : colors.textSecondary,
                        fontWeight: isCurrent ? '800' : '600',
                      },
                    ]}
                  >
                    {tier.minXp}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={[styles.nextTierBox, { backgroundColor: colors.surface }]}>
            <Sparkles size={15} color={colors.primary} />
            <Text style={[styles.nextTierText, { color: colors.text }]}>
              {nextTier
                ? `Almost there! Earn +${xpToNextTier} XP this week to unlock ${nextTier.name}.`
                : 'Peak League unlocked! Maintain your 7-day streak to defend Rank #1.'}
            </Text>
          </View>
        </Card>

        {/* Score Reminder & Quick Boost Banner */}
        <Card
          style={[
            styles.reminderBanner,
            {
              backgroundColor: mode === 'dark' ? '#1E293B' : '#FFF7ED',
              borderColor: colors.primary,
            },
          ]}
        >
          <View style={styles.reminderTop}>
            <View style={[styles.bellCircle, { backgroundColor: colors.primary }]}>
              <Bell size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.reminderHeadline, { color: colors.text }]}>
                7-Day Score Reminder:{' '}
                {goalConfig.scoreAlertsEnabled && goalConfig.reminderEnabled
                  ? `Daily at ${goalConfig.reminderTime}`
                  : 'Off'}
              </Text>
              <Text style={[styles.reminderDesc, { color: colors.textSecondary }]}>
                Your 7-day score: {leagueUserEntry.weeklyXp} XP ({leagueUserEntry.weeklyQuestions}{' '}
                Qs · {leagueUserEntry.accuracyPercent}% accuracy)
              </Text>
            </View>
          </View>

          <View style={styles.reminderActions}>
            <Button
              title="Set Reminder"
              variant="outline"
              size="sm"
              onPress={() => setReminderModalOpen(true)}
              icon={<Clock size={14} color={colors.primary} />}
              style={{ flex: 1 }}
            />
            {onStartPractice && (
              <Button
                title="Boost 7-Day Score"
                variant="primary"
                size="sm"
                onPress={onStartPractice}
                icon={<Zap size={14} color="#FFFFFF" />}
                style={{ flex: 1.2 }}
              />
            )}
          </View>
        </Card>

        {/* 5-Timeframe Standings Selector */}
        <View>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Standings · {periodBoard.label}
            </Text>
            <Badge label={`Rank #${periodBoard.currentUserEntry.rank}`} variant="primary" size="sm" />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0, marginTop: 8 }}
            contentContainerStyle={styles.timeframeScroll}
          >
            {TIMEFRAME_PILLS.map((pill) => {
              const active = timeframe === pill.id;
              return (
                <TouchableOpacity
                  key={pill.id}
                  focusable={false}
                  activeOpacity={0.78}
                  onPress={() => setTimeframe(pill.id)}
                  style={[
                    styles.timeframePill,
                    {
                      backgroundColor: active ? colors.primary : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: active ? '#FFFFFF' : colors.textSecondary,
                    }}
                  >
                    {pill.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Leaderboard List */}
        <View style={styles.listContainer}>
          {periodBoard.entries.map((entry) => {
            const rankNum = entry.rank || 0;
            const deco = getRankDecoration(rankNum);
            const xpVal = timeframe === 'today' ? entry.todayXp : entry.weeklyXp;
            const qCount = timeframe === 'today' ? entry.todayQuestions : entry.weeklyQuestions;
            const isMe = Boolean(entry.isCurrentUser);

            return (
              <Card
                key={entry.id}
                style={[
                  styles.leaderRowCard,
                  isMe && {
                    borderColor: colors.primary,
                    borderWidth: 1.75,
                    backgroundColor: mode === 'dark' ? '#1E293B' : '#FFF7ED',
                  },
                ]}
              >
                <View style={styles.leaderRow}>
                  <View style={[styles.rankBadge, { backgroundColor: deco.bg }]}>
                    {rankNum === 1 ? (
                      <Crown size={16} color={deco.color} />
                    ) : rankNum <= 3 ? (
                      <Medal size={16} color={deco.color} />
                    ) : (
                      <Text style={[styles.rankNum, { color: deco.color }]}>{rankNum}</Text>
                    )}
                  </View>

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.learnerName, { color: colors.text }]} numberOfLines={1}>
                        {entry.name}
                      </Text>
                      {isMe && <Badge label="YOU" variant="primary" size="sm" />}
                    </View>
                    <View style={styles.metaRow}>
                      <Text
                        numberOfLines={1}
                        style={[styles.learnerMeta, { color: colors.textSecondary, flexShrink: 0 }]}
                      >
                        {entry.ioId}
                      </Text>
                      <Text style={[styles.learnerDot, { color: colors.textSecondary }]}>·</Text>
                      <Text
                        numberOfLines={1}
                        style={[styles.learnerMeta, { color: colors.textSecondary, flexShrink: 0 }]}
                      >
                        {qCount} Qs · {entry.accuracyPercent}%
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                        <Flame size={11} color={colors.primary} />
                        <Text style={[styles.learnerMeta, { color: colors.primary }]}>
                          {entry.streakDays}d
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.xpRight}>
                    <Trophy size={13} color={colors.warning} />
                    <Text style={[styles.xpValue, { color: colors.text }]}>{xpVal}</Text>
                    <Text style={[styles.xpUnit, { color: colors.textSecondary }]}>XP</Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Daily Challenges Card */}
        <Card style={styles.challengesCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Zap size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Daily Challenges
              </Text>
            </View>
            <Badge label={`Total ${profile.totalXp} XP`} variant="info" size="sm" />
          </View>

          <View style={{ gap: 10, marginTop: 10 }}>
            {dailyChallenges.map((ch) => {
              const pct = Math.min(100, Math.round((ch.currentCount / Math.max(1, ch.targetCount)) * 100));
              const canClaim = ch.currentCount >= ch.targetCount && !ch.claimed;
              return (
                <View
                  key={ch.id}
                  style={[
                    styles.challengeItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={styles.challengeTopRow}>
                      <Text style={[styles.challengeTitle, { color: colors.text }]}>
                        {ch.title}
                      </Text>
                      <Badge label={`+${ch.xpReward} XP`} variant="warning" size="sm" />
                    </View>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>{ch.subtitle}</Text>
                    <View style={[styles.challengeBarBg, { backgroundColor: colors.card }]}>
                      <View
                        style={[
                          styles.challengeBarFill,
                          {
                            width: `${pct}%`,
                            backgroundColor: ch.claimed ? colors.success : colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.challengeBottomRow}>
                      <Text style={{ fontSize: 10.5, fontWeight: '700', color: colors.textSecondary }}>
                        {ch.currentCount}/{ch.targetCount} completed
                      </Text>
                      {ch.claimed ? (
                        <View style={styles.claimedPill}>
                          <CheckCircle2 size={13} color={colors.success} />
                          <Text style={{ fontSize: 11, fontWeight: '800', color: colors.success }}>
                            Claimed
                          </Text>
                        </View>
                      ) : canClaim ? (
                        <TouchableOpacity
                          focusable={false}
                          onPress={() => handleClaimChallenge(ch.id, ch.xpReward)}
                          style={[styles.claimBtn, { backgroundColor: colors.primary }]}
                        >
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>
                            Claim +{ch.xpReward} XP
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>
                          {pct}% done
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Achievement Badges Grid */}
        <Card style={styles.badgesCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Award size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Achievement Badges
              </Text>
            </View>
            <Badge
              label={`${badges.filter((b) => b.unlocked).length}/${badges.length} Unlocked`}
              variant="success"
              size="sm"
            />
          </View>

          <View style={styles.badgesGrid}>
            {badges.map((b) => (
              <View
                key={b.id}
                style={[
                  styles.badgeTile,
                  {
                    backgroundColor: colors.surface,
                    borderColor: b.unlocked ? b.color : colors.border,
                    opacity: b.unlocked ? 1 : 0.72,
                  },
                ]}
              >
                <View
                  style={[
                    styles.badgeIconCircle,
                    { backgroundColor: b.unlocked ? `${b.color}22` : colors.card },
                  ]}
                >
                  {renderBadgeIcon(b.iconName, b.unlocked ? b.color : colors.textSecondary)}
                </View>
                <Text style={[styles.badgeTitle, { color: colors.text }]} numberOfLines={2}>
                  {b.title}
                </Text>
                <Text style={[styles.badgeDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {b.description}
                </Text>
                <Badge
                  label={b.unlocked ? 'UNLOCKED' : b.progressLabel}
                  variant={b.unlocked ? 'success' : 'neutral'}
                  size="sm"
                />
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>

      {/* Pinned Current User Rank Strip */}
      <View
        style={[
          styles.pinnedFooter,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        <View style={styles.pinnedLeft}>
          <View style={[styles.pinnedRankCircle, { backgroundColor: colors.primary, flexShrink: 0 }]}>
            <Text style={styles.pinnedRankText}>#{periodBoard.currentUserEntry.rank}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
            <Text style={[styles.pinnedName, { color: colors.text }]} numberOfLines={1}>
              {profile.name} · {periodBoard.label}
            </Text>
            <Text style={[styles.pinnedSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {periodBoard.currentUserStats.questions} Qs ·{' '}
              {periodBoard.currentUserStats.accuracyPercent}% accuracy
            </Text>
          </View>
        </View>

        <View style={styles.pinnedRight}>
          <Zap size={15} color={colors.warning} />
          <Text style={[styles.pinnedXp, { color: colors.primary }]}>
            {periodBoard.currentUserStats.xp} XP
          </Text>
        </View>
      </View>

      <DailyGoalModal
        visible={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        onSaved={(cfg) => setGoalConfig(cfg)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 24, gap: 14 },
  leagueCard: { padding: 16, borderWidth: 1.5 },
  leagueHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  shieldBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tierName: { fontSize: 16, fontWeight: '900', letterSpacing: 0.4 },
  leagueSub: { fontSize: 11.5, marginTop: 3 },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  stepNodeCol: { alignItems: 'center', gap: 5 },
  stepDot: { width: 16, height: 16, borderRadius: 8 },
  stepThreshold: { fontSize: 10.5 },
  nextTierBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  nextTierText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 16 },
  reminderBanner: { padding: 14, borderWidth: 1, gap: 12 },
  reminderTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bellCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderHeadline: { fontSize: 13.5, fontWeight: '800' },
  reminderDesc: { fontSize: 11.5, marginTop: 2 },
  reminderActions: { flexDirection: 'row', gap: 10 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800' },
  timeframeScroll: { gap: 8, paddingVertical: 2 },
  timeframePill: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listContainer: { gap: 8 },
  leaderRowCard: { padding: 12 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNum: { fontSize: 13.5, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  learnerName: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    rowGap: 2,
    marginTop: 2,
  },
  learnerMeta: { fontSize: 11, fontWeight: '600' },
  learnerDot: { fontSize: 11 },
  xpRight: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },
  xpValue: { fontSize: 15, fontWeight: '900' },
  xpUnit: { fontSize: 10.5, fontWeight: '700' },
  challengesCard: { padding: 14 },
  challengeItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
  },
  challengeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  challengeTitle: { fontSize: 13.5, fontWeight: '800', flex: 1 },
  challengeBarBg: {
    height: 6,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  challengeBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  challengeBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  claimBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  claimedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgesCard: { padding: 14, gap: 12 },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeTile: {
    width: '48%',
    minWidth: 145,
    flexGrow: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.25,
    gap: 6,
    alignItems: 'flex-start',
  },
  badgeIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTitle: { fontSize: 12.5, fontWeight: '800' },
  badgeDesc: { fontSize: 11, lineHeight: 15, flex: 1 },
  pinnedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  pinnedLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  pinnedRankCircle: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pinnedRankText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  pinnedName: { fontSize: 13, fontWeight: '700' },
  pinnedSub: { fontSize: 11, marginTop: 1 },
  pinnedRight: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },
  pinnedXp: { fontSize: 15, fontWeight: '900' },
});

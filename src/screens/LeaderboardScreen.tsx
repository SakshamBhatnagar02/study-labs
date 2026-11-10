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
import { DailyGoalConfig, QuestionAttemptStat, UserProfile } from '../types';
import {
  build7DayLeaderboard,
  LEAGUE_TIERS,
} from '../utils/activityStats';
import {
  Bell,
  Clock,
  Crown,
  Flame,
  Medal,
  Shield,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react-native';

interface LeaderboardScreenProps {
  onStartPractice?: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onStartPractice }) => {
  const { colors, mode } = useTheme();
  const [windowMode, setWindowMode] = useState<'week' | 'today'>('week');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER);
  const [logs, setLogs] = useState<QuestionAttemptStat[]>([]);
  const [goalConfig, setGoalConfig] = useState<DailyGoalConfig>(DEFAULT_DAILY_GOAL);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    const [prof, attemptLogs, cfg] = await Promise.all([
      StorageService.getUserProfile(),
      StorageService.getAttemptLogs(),
      StorageService.getDailyGoalConfig(),
    ]);
    setProfile(prof);
    setLogs(attemptLogs);
    setGoalConfig(cfg);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const {
    entries,
    currentUserEntry,
    currentTier,
    nextTier,
    xpToNextTier,
    daysUntilWeeklyReset,
  } = build7DayLeaderboard(logs, profile, windowMode, new Date());

  const getRankDecoration = (rank: number) => {
    if (rank === 1) return { color: '#FACC15', bg: 'rgba(250, 204, 21, 0.16)' };
    if (rank === 2) return { color: '#CBD5E1', bg: 'rgba(203, 213, 225, 0.16)' };
    if (rank === 3) return { color: '#FB923C', bg: 'rgba(251, 146, 60, 0.16)' };
    return { color: colors.textSecondary, bg: colors.surface };
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
                Rolling 7-Day Study Labs League · Cohort Rank #{currentUserEntry.rank}
              </Text>
            </View>
          </View>

          {/* 6-Node League Tier Stepper */}
          <View style={styles.stepperRow}>
            {LEAGUE_TIERS.map((tier) => {
              const reached = currentUserEntry.weeklyXp >= tier.minXp;
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
                Your 7-day score: {currentUserEntry.weeklyXp} XP ({currentUserEntry.weeklyQuestions}{' '}
                Qs · {currentUserEntry.accuracyPercent}% accuracy)
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

        {/* Window Toggle: Today vs This Week (Rolling 7 Days) */}
        <View style={[styles.windowSwitch, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle }]}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              setWindowMode('week');
            }}
            style={[
              styles.windowTab,
              windowMode === 'week' && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.windowTabText,
                { color: windowMode === 'week' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              This Week (7 Days)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              setWindowMode('today');
            }}
            style={[
              styles.windowTab,
              windowMode === 'today' && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.windowTabText,
                { color: windowMode === 'today' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Today&apos;s Sprint
            </Text>
          </TouchableOpacity>
        </View>

        {/* Leaderboard List */}
        <View style={styles.listContainer}>
          {entries.map((entry) => {
            const rankNum = entry.rank || 0;
            const deco = getRankDecoration(rankNum);
            const xpVal = windowMode === 'week' ? entry.weeklyXp : entry.todayXp;
            const qCount = windowMode === 'week' ? entry.weeklyQuestions : entry.todayQuestions;
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

                  <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.learnerName, { color: colors.text }]} numberOfLines={1}>
                        {entry.name}
                      </Text>
                      {isMe && <Badge label="YOU" variant="primary" size="sm" />}
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={[styles.learnerMeta, { color: colors.textSecondary }]}>
                        {entry.ioId}
                      </Text>
                      <Text style={[styles.learnerDot, { color: colors.textSecondary }]}>·</Text>
                      <Text style={[styles.learnerMeta, { color: colors.textSecondary }]}>
                        {qCount} Qs · {entry.accuracyPercent}%
                      </Text>
                      <Flame size={11} color={colors.primary} style={{ marginLeft: 4 }} />
                      <Text style={[styles.learnerMeta, { color: colors.primary }]}>
                        {entry.streakDays}d
                      </Text>
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
      </ScrollView>

      {/* Pinned Current User Rank Strip */}
      <View
        style={[
          styles.pinnedFooter,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        <View style={styles.pinnedLeft}>
          <View style={[styles.pinnedRankCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.pinnedRankText}>#{currentUserEntry.rank}</Text>
          </View>
          <View>
            <Text style={[styles.pinnedName, { color: colors.text }]}>
              {profile.name} · {currentTier.name}
            </Text>
            <Text style={[styles.pinnedSub, { color: colors.textSecondary }]}>
              {windowMode === 'week'
                ? `${currentUserEntry.weeklyQuestions} Qs solved in 7 days`
                : `${currentUserEntry.todayQuestions} Qs solved today`}
            </Text>
          </View>
        </View>

        <View style={styles.pinnedRight}>
          <Zap size={15} color={colors.warning} />
          <Text style={[styles.pinnedXp, { color: colors.primary }]}>
            {windowMode === 'week' ? currentUserEntry.weeklyXp : currentUserEntry.todayXp} XP
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
  windowSwitch: { flexDirection: 'row', borderRadius: 12, padding: 4 },
  windowTab: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  windowTabText: { fontSize: 12.5, fontWeight: '700' },
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
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  learnerMeta: { fontSize: 11, fontWeight: '600' },
  learnerDot: { fontSize: 11 },
  xpRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  xpValue: { fontSize: 15, fontWeight: '900' },
  xpUnit: { fontSize: 10.5, fontWeight: '700' },
  pinnedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  pinnedLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  pinnedRankCircle: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pinnedRankText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  pinnedName: { fontSize: 13, fontWeight: '700' },
  pinnedSub: { fontSize: 11, marginTop: 1 },
  pinnedRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pinnedXp: { fontSize: 15, fontWeight: '900' },
});


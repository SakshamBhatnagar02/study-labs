import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { DailyGoalModal } from '../components/common/DailyGoalModal';
import { DEFAULT_DAILY_GOAL, DEFAULT_USER, StorageService } from '../services/storage';
import { DailyGoalConfig, QuestionAttemptStat, SubjectId, UserProfile } from '../types';
import {
  aggregateDailyActivity,
  computeHistorySummary,
  computeStreakAndWeek,
  formatDurationShort,
  getMonthHeatmapWeeks,
  HeatmapCell,
} from '../utils/activityStats';
import {
  Award,
  Bell,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Pencil,
  Target,
  Zap,
} from 'lucide-react-native';

interface DailyGoalScreenProps {
  onStartPractice?: () => void;
  onOpenLeaderboard?: () => void;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DailyGoalScreen: React.FC<DailyGoalScreenProps> = ({
  onStartPractice,
  onOpenLeaderboard,
}) => {
  const { colors, mode } = useTheme();
  const [goalConfig, setGoalConfig] = useState<DailyGoalConfig>(DEFAULT_DAILY_GOAL);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER);
  const [logs, setLogs] = useState<QuestionAttemptStat[]>([]);
  const [editOpen, setEditOpen] = useState(false);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [showDates, setShowDates] = useState(true);
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  const [historyRange, setHistoryRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | 'all'>('all');

  const loadData = useCallback(async () => {
    const [cfg, prof, attemptLogs] = await Promise.all([
      StorageService.getDailyGoalConfig(),
      StorageService.getUserProfile(),
      StorageService.getAttemptLogs(),
    ]);
    setGoalConfig(cfg);
    setProfile(prof);
    setLogs(attemptLogs);
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

  const monthWeeks = getMonthHeatmapWeeks(
    viewYear,
    viewMonth,
    dailyMap,
    goalConfig.targetQuestions,
    new Date()
  );

  const historySummary = computeHistorySummary(logs, historyRange, subjectFilter, new Date());
  const goalPct = Math.min(
    100,
    Math.round((streakInfo.todaySolved / Math.max(1, goalConfig.targetQuestions)) * 100)
  );

  const stepMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
    setSelectedCell(null);
  };

  const getCellColor = (intensity: 0 | 1 | 2 | 3 | 4, inMonth: boolean): string => {
    if (!inMonth) return 'transparent';
    if (intensity === 0) return mode === 'dark' ? '#1E293B' : '#F1F5F9';
    if (intensity === 1) return mode === 'dark' ? '#431407' : '#FFEDD5';
    if (intensity === 2) return '#FDBA74';
    if (intensity === 3) return '#FB923C';
    return '#F97316';
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Action Strip */}
        <View style={styles.topActionRow}>
          <View>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Daily Goal & Streak</Text>
            <Text style={[styles.pageSub, { color: colors.textSecondary }]}>
              {streakInfo.currentStreakDays}-Day Activity Streak · Study Labs Tracker
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              setEditOpen(true);
            }}
            style={[
              styles.editBtn,
              {
                backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5',
                borderColor: colors.primary,
              },
            ]}
          >
            <Pencil size={13} color={colors.primary} />
            <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit Goal</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Progress Overview Card */}
        <Card style={[styles.heroGoalCard, { borderColor: colors.border }]}>
          <View style={styles.heroGoalTop}>
            <View style={{ flex: 1 }}>
              <View style={styles.goalCountRow}>
                <Text style={[styles.goalBigCount, { color: colors.primary }]}>
                  {streakInfo.todaySolved}
                </Text>
                <Text style={[styles.goalTargetSlash, { color: colors.textSecondary }]}>
                  /{goalConfig.targetQuestions}
                </Text>
              </View>
              <Text style={[styles.goalCaption, { color: colors.text }]}>
                Questions Solved Today
              </Text>
              <View style={styles.xpPillRow}>
                <View style={[styles.xpPill, { backgroundColor: colors.goldBg }]}>
                  <Zap size={13} color={colors.warning} />
                  <Text style={[styles.xpPillText, { color: colors.warning }]}>
                    +{streakInfo.todayXp} XP Today
                  </Text>
                </View>
                <View style={[styles.xpPill, { backgroundColor: colors.cyanBg }]}>
                  <Target size={13} color={colors.cyan} />
                  <Text style={[styles.xpPillText, { color: colors.cyan }]}>
                    {goalPct}% Goal
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.ringBadge,
                {
                  borderColor: goalPct >= 100 ? colors.success : colors.primary,
                  backgroundColor: mode === 'dark' ? '#090D16' : '#FFF7ED',
                },
              ]}
            >
              <Text
                style={[
                  styles.ringValue,
                  { color: goalPct >= 100 ? colors.success : colors.primary },
                ]}
              >
                {goalPct}%
              </Text>
              <Text style={[styles.ringLabel, { color: colors.textSecondary }]}>TODAY</Text>
            </View>
          </View>

          <View style={[styles.progressBg, { backgroundColor: colors.borderSubtle }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${goalPct}%`,
                  backgroundColor: goalPct >= 100 ? colors.success : colors.primary,
                },
              ]}
            />
          </View>

          <View style={styles.goalActionsRow}>
            {onStartPractice && (
              <Button
                title={goalPct >= 100 ? 'Bonus Practice' : 'Solve Remaining Qs'}
                size="sm"
                onPress={onStartPractice}
                style={{ flex: 1 }}
              />
            )}
            {onOpenLeaderboard && (
              <Button
                title="7-Day League"
                variant="outline"
                size="sm"
                onPress={onOpenLeaderboard}
                style={{ flex: 1 }}
              />
            )}
          </View>
        </Card>

        {/* Mon - Sun 7-Day Streak Card */}
        <Card style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <View>
              <Text style={[styles.streakNumber, { color: colors.text }]}>
                {streakInfo.currentStreakDays} Days
              </Text>
              <Text style={[styles.streakSub, { color: colors.textSecondary }]}>
                Weekly Consistency Strip (Mon – Sun)
              </Text>
            </View>
            <View
              style={[
                styles.flameCircle,
                { backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5' },
              ]}
            >
              <Flame size={22} color={colors.primary} />
            </View>
          </View>

          <View style={styles.weekDaysRow}>
            {streakInfo.weekDays.map((day) => {
              const hasActivity = day.questionsSolved > 0;
              return (
                <View key={day.date} style={styles.dayCol}>
                  <Text
                    style={[
                      styles.dayName,
                      {
                        color: day.isToday ? colors.primary : colors.textSecondary,
                        fontWeight: day.isToday ? '800' : '600',
                      },
                    ]}
                  >
                    {day.dayShort}
                  </Text>
                  <Text style={[styles.dayCount, { color: colors.textSecondary }]}>
                    {day.isFuture ? '--' : `${day.questionsSolved} Qs`}
                  </Text>
                  <View
                    style={[
                      styles.dayDot,
                      {
                        backgroundColor: day.metGoal
                          ? colors.success
                          : hasActivity
                          ? colors.primary
                          : colors.surface,
                        borderColor: day.isToday
                          ? colors.primary
                          : day.metGoal
                          ? colors.success
                          : colors.borderSubtle,
                      },
                    ]}
                  >
                    {day.metGoal ? (
                      <Check size={13} color="#FFFFFF" strokeWidth={3} />
                    ) : hasActivity ? (
                      <Text style={styles.dayDotInnerText}>{day.questionsSolved}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Monthly Contribution Heatmap Calendar */}
        <Card style={styles.heatmapCard}>
          <View style={styles.heatmapTop}>
            <View style={styles.monthSwitchRow}>
              <TouchableOpacity
                onPress={() => stepMonth(-1)}
                style={[styles.monthArrowBtn, { backgroundColor: colors.surface }]}
              >
                <ChevronLeft size={16} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.heatmapTitle, { color: colors.text }]}>
                Qs Solved · {MONTH_NAMES[viewMonth]} &apos;{String(viewYear).slice(-2)}
              </Text>
              <TouchableOpacity
                onPress={() => stepMonth(1)}
                style={[styles.monthArrowBtn, { backgroundColor: colors.surface }]}
              >
                <ChevronRight size={16} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.showDatesRow}>
              <Calendar size={14} color={colors.textSecondary} />
              <Text style={[styles.showDatesLabel, { color: colors.textSecondary }]}>Dates</Text>
              <Switch
                value={showDates}
                onValueChange={(v) => {
                  setShowDates(v);
                }}
                trackColor={{ false: '#64748B', true: colors.primary }}
              />
            </View>
          </View>

          <View style={styles.dayHeadersGrid}>
            {DAY_HEADERS.map((h) => (
              <Text key={h} style={[styles.gridDayHeader, { color: colors.textSecondary }]}>
                {h}
              </Text>
            ))}
          </View>

          <View style={styles.heatmapGrid}>
            {monthWeeks.map((week, wIdx) => (
              <View key={`wk_${wIdx}`} style={styles.heatmapRow}>
                {week.map((cell) => {
                  const bg = getCellColor(cell.intensity, cell.inMonth);
                  const isSelected = selectedCell?.date === cell.date;
                  return (
                    <TouchableOpacity
                      key={cell.date}
                      disabled={!cell.inMonth}
                      activeOpacity={0.75}
                      onPress={() => {
                        setSelectedCell(cell);
                      }}
                      style={[
                        styles.heatmapCell,
                        {
                          backgroundColor: bg,
                          borderWidth: isSelected || cell.isToday ? 1.5 : cell.inMonth ? 1 : 0,
                          borderColor: isSelected
                            ? colors.cyan
                            : cell.isToday
                            ? colors.primary
                            : colors.borderSubtle,
                          opacity: cell.inMonth ? (cell.isFuture ? 0.45 : 1) : 0,
                        },
                      ]}
                    >
                      {showDates && cell.inMonth && (
                        <Text
                          style={[
                            styles.cellDayNum,
                            {
                              color: cell.intensity >= 3 ? '#FFFFFF' : colors.textSecondary,
                            },
                          ]}
                        >
                          {cell.dayOfMonth}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {selectedCell && (
            <View style={[styles.cellDetailBanner, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cellDetailText, { color: colors.text }]}>
                {selectedCell.date}:{' '}
                <Text style={{ color: colors.primary, fontWeight: '800' }}>
                  {selectedCell.questionsSolved} Qs solved
                </Text>{' '}
                · +{selectedCell.xpEarned} XP
              </Text>
            </View>
          )}

          <View style={styles.legendRow}>
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Less</Text>
            {([0, 1, 2, 3, 4] as const).map((lvl) => (
              <View
                key={lvl}
                style={[styles.legendBox, { backgroundColor: getCellColor(lvl, true) }]}
              />
            ))}
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>More</Text>
          </View>
        </Card>

        {/* History of Qs Solved Filterable Summary */}
        <Card style={styles.historyCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>History of Qs Solved</Text>

          <View style={[styles.rangeTabs, { backgroundColor: colors.surface }]}>
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
                  onPress={() => {
                    setHistoryRange(r.id);
                  }}
                  style={[
                    styles.rangeTab,
                    active && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.rangeTabText,
                      { color: active ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjectFilterRow}
          >
            {(
              [
                { id: 'all', label: 'All Subjects' },
                { id: 'physics', label: 'Physics' },
                { id: 'chemistry', label: 'Chemistry' },
                { id: 'math', label: 'Mathematics' },
                { id: 'biology', label: 'Biology' },
              ] as const
            ).map((sub) => {
              const active = subjectFilter === sub.id;
              return (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => {
                    setSubjectFilter(sub.id);
                  }}
                  style={[
                    styles.subjectPill,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.subjectPillText,
                      { color: active ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {sub.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.historyKpiRow}>
            <View style={[styles.historyKpiBox, { backgroundColor: colors.surface }]}>
              <Award size={18} color={colors.primary} />
              <Text style={[styles.historyKpiVal, { color: colors.text }]}>
                {historySummary.qsSolved}
              </Text>
              <Text style={[styles.historyKpiLabel, { color: colors.textSecondary }]}>
                Qs Solved
              </Text>
            </View>

            <View style={[styles.historyKpiBox, { backgroundColor: colors.surface }]}>
              <Clock size={18} color={colors.info} />
              <Text style={[styles.historyKpiVal, { color: colors.text }]}>
                {formatDurationShort(historySummary.avgTimeSeconds)}
              </Text>
              <Text style={[styles.historyKpiLabel, { color: colors.textSecondary }]}>
                Avg Time / Qs
              </Text>
            </View>

            <View style={[styles.historyKpiBox, { backgroundColor: colors.surface }]}>
              <Target size={18} color={colors.success} />
              <Text style={[styles.historyKpiVal, { color: colors.text }]}>
                {historySummary.accuracyPercent}%
              </Text>
              <Text style={[styles.historyKpiLabel, { color: colors.textSecondary }]}>
                Accuracy
              </Text>
            </View>
          </View>
        </Card>

        {/* Reminder Status Card */}
        <Card style={[styles.reminderCard, { borderColor: colors.border }]}>
          <View style={styles.reminderRow}>
            <View
              style={[
                styles.reminderIconWrap,
                { backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5' },
              ]}
            >
              <Bell size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.reminderTitle, { color: colors.text }]}>
                Score Reminder: {goalConfig.reminderEnabled ? `Active at ${goalConfig.reminderTime}` : 'Paused'}
              </Text>
              <Text style={[styles.reminderSub, { color: colors.textSecondary }]}>
                {goalConfig.scoreAlertsEnabled
                  ? 'Daily score alerts and 7-day rank reminders are turned on.'
                  : 'Turn on score alerts to stay ahead in the weekly leaderboard.'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setEditOpen(true);
              }}
            >
              <Text style={[styles.editInlineText, { color: colors.primary }]}>Configure</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>

      <DailyGoalModal
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={(saved) => setGoalConfig(saved)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: { fontSize: 20, fontWeight: '800' },
  pageSub: { fontSize: 12, marginTop: 2 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  editBtnText: { fontSize: 12, fontWeight: '700' },
  heroGoalCard: { padding: 16, borderWidth: 1 },
  heroGoalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  goalCountRow: { flexDirection: 'row', alignItems: 'baseline' },
  goalBigCount: { fontSize: 34, fontWeight: '900' },
  goalTargetSlash: { fontSize: 18, fontWeight: '700', marginLeft: 2 },
  goalCaption: { fontSize: 13.5, fontWeight: '700', marginTop: 2 },
  xpPillRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  xpPillText: { fontSize: 11, fontWeight: '800' },
  ringBadge: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: { fontSize: 19, fontWeight: '900' },
  ringLabel: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.6 },
  progressBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 14 },
  progressFill: { height: '100%', borderRadius: 4 },
  goalActionsRow: { flexDirection: 'row', gap: 10 },
  streakCard: { padding: 16 },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  streakNumber: { fontSize: 22, fontWeight: '800' },
  streakSub: { fontSize: 12, marginTop: 2 },
  flameCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  dayCol: { flex: 1, alignItems: 'center', gap: 5 },
  dayName: { fontSize: 11.5 },
  dayCount: { fontSize: 10, fontWeight: '600' },
  dayDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotInnerText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  heatmapCard: { padding: 16 },
  heatmapTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  monthSwitchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatmapTitle: { fontSize: 14, fontWeight: '800' },
  showDatesRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  showDatesLabel: { fontSize: 12, fontWeight: '600' },
  dayHeadersGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  gridDayHeader: { flex: 1, textAlign: 'center', fontSize: 10.5, fontWeight: '700' },
  heatmapGrid: { gap: 6 },
  heatmapRow: { flexDirection: 'row', gap: 6 },
  heatmapCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellDayNum: { fontSize: 10.5, fontWeight: '700' },
  cellDetailBanner: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cellDetailText: { fontSize: 12, fontWeight: '600' },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 12,
  },
  legendLabel: { fontSize: 10.5, fontWeight: '600' },
  legendBox: { width: 14, height: 14, borderRadius: 4 },
  historyCard: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  rangeTabs: { flexDirection: 'row', borderRadius: 10, padding: 3, marginBottom: 10 },
  rangeTab: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  rangeTabText: { fontSize: 11.5, fontWeight: '700' },
  subjectFilterRow: { gap: 8, paddingBottom: 12 },
  subjectPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  subjectPillText: { fontSize: 11.5, fontWeight: '700' },
  historyKpiRow: { flexDirection: 'row', gap: 8 },
  historyKpiBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  historyKpiVal: { fontSize: 17, fontWeight: '800' },
  historyKpiLabel: { fontSize: 10.5, fontWeight: '600', textAlign: 'center' },
  reminderCard: { padding: 14, borderWidth: 1 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reminderIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderTitle: { fontSize: 13.5, fontWeight: '700', marginBottom: 2 },
  reminderSub: { fontSize: 11.5, lineHeight: 16 },
  editInlineText: { fontSize: 12.5, fontWeight: '800' },
});


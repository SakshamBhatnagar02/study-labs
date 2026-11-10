import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { DEFAULT_PLANNER_STATE, StorageService } from '../services/storage';
import { HapticManager } from '../services/hapticManager';
import {
  CalendarHoliday,
  HolidayCountryCode,
  PlannerCalendarState,
  PlannerExam,
  PlannerGoal,
} from '../types';
import {
  buildCalendarMonthGrid,
  computeDaysRemaining,
  COUNTRY_META_MAP,
  fetchPublicHolidaysLive,
  formatLiveClock,
  formatLiveDateBanner,
  getHolidaysForCountryAndMonth,
  resolveActiveCountry,
  SUPPORTED_HOLIDAY_COUNTRIES,
  toIsoDateKey,
} from '../utils/calendarHolidays';
import {
  Bell,
  BookOpen,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Globe,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react-native';

const MONTH_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const SyllabusCalendarScreen: React.FC = () => {
  const { colors, mode } = useTheme();

  // Live ticking Date & Time
  const [now, setNow] = useState<Date>(() => new Date());
  const [plannerState, setPlannerState] = useState<PlannerCalendarState>(DEFAULT_PLANNER_STATE);
  const [remoteHolidays, setRemoteHolidays] = useState<CalendarHoliday[]>([]);
  const [syncingHolidays, setSyncingHolidays] = useState(false);

  // Calendar Month & Selected Day
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState(() => toIsoDateKey(new Date()));

  // Modals: Add Goal & Add Exam
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalSubject, setGoalSubject] = useState('Physics');
  const [goalMinutes, setGoalMinutes] = useState('45');
  const [goalDateKey, setGoalDateKey] = useState(() => toIsoDateKey(new Date()));

  const [examModalOpen, setExamModalOpen] = useState(false);
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('2027-01-24');
  const [examCategory, setExamCategory] = useState('Mock / Entrance');

  const [syllabusModules] = useState([
    {
      subject: 'Physics',
      color: '#3B82F6',
      completedChapters: 14,
      totalChapters: 28,
      recentTopic: 'Electromagnetic Induction & Faraday Laws',
      status: 'On Track',
    },
    {
      subject: 'Chemistry',
      color: '#10B981',
      completedChapters: 21,
      totalChapters: 30,
      recentTopic: 'Coordination Compounds & Crystal Field Theory',
      status: 'Ahead',
    },
    {
      subject: 'Mathematics',
      color: '#F97316',
      completedChapters: 11,
      totalChapters: 26,
      recentTopic: 'Differential Equations & Applications',
      status: 'Needs Acceleration',
    },
    {
      subject: 'Biology',
      color: '#8B5CF6',
      completedChapters: 24,
      totalChapters: 32,
      recentTopic: 'Biotechnology & Principles and Processes',
      status: 'On Track',
    },
  ]);

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const syncHolidaysForView = useCallback(
    async (countrySelection: HolidayCountryCode, year: number) => {
      const resolved = resolveActiveCountry(countrySelection);
      const cached = await StorageService.getCachedRemoteHolidays(year, resolved.country);
      if (cached.length > 0) {
        setRemoteHolidays(cached);
      }
      setSyncingHolidays(true);
      try {
        const live = await fetchPublicHolidaysLive(year, resolved.country);
        if (live.length > 0) {
          setRemoteHolidays(live);
          await StorageService.saveCachedRemoteHolidays(year, resolved.country, live);
        }
      } finally {
        setSyncingHolidays(false);
      }
    },
    []
  );

  useEffect(() => {
    StorageService.getPlannerState().then((st) => {
      setPlannerState(st);
      void syncHolidaysForView(st.selectedCountry, viewYear);
    });
  }, []);

  const persistPlanner = async (next: PlannerCalendarState) => {
    setPlannerState(next);
    await StorageService.savePlannerState(next);
  };

  const handleSelectCountry = async (code: HolidayCountryCode) => {
    HapticManager.triggerSelection();
    const next: PlannerCalendarState = { ...plannerState, selectedCountry: code };
    await persistPlanner(next);
    void syncHolidaysForView(code, viewYear);
  };

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
    const yearChanged = y !== viewYear;
    setViewMonth(m);
    setViewYear(y);
    if (yearChanged) {
      void syncHolidaysForView(plannerState.selectedCountry, y);
    }
  };

  const regionResolution = resolveActiveCountry(plannerState.selectedCountry);
  const countryMeta = COUNTRY_META_MAP[regionResolution.country];

  const monthHolidays = useMemo(
    () =>
      getHolidaysForCountryAndMonth(
        regionResolution.country,
        viewYear,
        viewMonth,
        remoteHolidays
      ),
    [regionResolution.country, viewYear, viewMonth, remoteHolidays]
  );

  const goalDateKeys = useMemo(
    () => new Set(plannerState.goals.map((g) => g.dateKey).filter(Boolean)),
    [plannerState.goals]
  );
  const examDateKeys = useMemo(
    () => new Set(plannerState.exams.map((e) => e.targetDate).filter(Boolean)),
    [plannerState.exams]
  );

  const monthGrid = useMemo(
    () =>
      buildCalendarMonthGrid(
        viewYear,
        viewMonth,
        monthHolidays,
        goalDateKeys,
        examDateKeys,
        now
      ),
    [viewYear, viewMonth, monthHolidays, goalDateKeys, examDateKeys, now]
  );

  const selectedDayHolidays = monthHolidays.filter((h) => h.date === selectedDateKey);
  const selectedDayExams = plannerState.exams.filter((e) => e.targetDate === selectedDateKey);
  const selectedDayGoals = plannerState.goals.filter((g) => g.dateKey === selectedDateKey);

  const toggleGoal = async (id: string) => {
    HapticManager.triggerSelection();
    const nextGoals = plannerState.goals.map((g) =>
      g.id === id ? { ...g, isCompleted: !g.isCompleted } : g
    );
    await persistPlanner({ ...plannerState, goals: nextGoals });
  };

  const deleteGoal = async (id: string) => {
    const nextGoals = plannerState.goals.filter((g) => g.id !== id);
    await persistPlanner({ ...plannerState, goals: nextGoals });
  };

  const handleAddGoal = async () => {
    if (!goalTitle.trim()) return;
    const mins = Math.max(10, Math.min(300, parseInt(goalMinutes, 10) || 45));
    const newGoal: PlannerGoal = {
      id: `g_${Date.now()}`,
      title: goalTitle.trim(),
      subject: goalSubject.trim() || 'General',
      dateKey: goalDateKey || toIsoDateKey(now),
      dueToday: (goalDateKey || toIsoDateKey(now)) === toIsoDateKey(now),
      isCompleted: false,
      durationMinutes: mins,
    };
    await persistPlanner({
      ...plannerState,
      goals: [newGoal, ...plannerState.goals],
    });
    setGoalTitle('');
    setGoalModalOpen(false);
    HapticManager.triggerSuccess();
  };

  const handleAddExam = async () => {
    if (!examName.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(examDate.trim())) return;
    const newExam: PlannerExam = {
      id: `ex_${Date.now()}`,
      name: examName.trim(),
      targetDate: examDate.trim(),
      category: examCategory.trim() || 'Entrance / Mock',
    };
    await persistPlanner({
      ...plannerState,
      exams: [...plannerState.exams, newExam],
    });
    setExamName('');
    setExamModalOpen(false);
    HapticManager.triggerSuccess();
  };

  const deleteExam = async (id: string) => {
    await persistPlanner({
      ...plannerState,
      exams: plannerState.exams.filter((e) => e.id !== id),
    });
  };

  const completedCount = plannerState.goals.filter((g) => g.isCompleted).length;
  const goalProgress =
    plannerState.goals.length > 0
      ? Math.round((completedCount / plannerState.goals.length) * 100)
      : 0;

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Header (flex-safe so badge never clips off-screen) */}
        <View style={styles.header}>
          <View style={styles.headerTextCol}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Syllabus & Planner</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Live regional calendar, exam countdown & study goals
            </Text>
          </View>
          <Badge label="Active Term" variant="info" />
        </View>

        {/* Live Date, Time & Detected Location Banner */}
        <Card style={[styles.liveClockCard, { borderColor: colors.primary }]}>
          <View style={styles.liveClockTop}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.liveClockDate, { color: colors.textPrimary }]}>
                {formatLiveDateBanner(now)}
              </Text>
              <Text style={[styles.liveClockTz, { color: colors.textSecondary }]} numberOfLines={1}>
                {regionResolution.isAuto
                  ? `Detected Location: ${countryMeta.name} (${regionResolution.detected.timezone})`
                  : `Selected Region: ${countryMeta.name}`}
              </Text>
            </View>
            <View
              style={[
                styles.liveTimePill,
                { backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5', borderColor: colors.primary },
              ]}
            >
              <Clock size={14} color={colors.primary} />
              <Text style={[styles.liveTimeText, { color: colors.primary }]}>
                {formatLiveClock(now)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Full Interactive Regional Holiday Calendar */}
        <Card style={styles.calendarCard}>
          <View style={styles.calHeaderRow}>
            <View style={styles.calTitleGroup}>
              <Globe size={16} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Regional Holiday Calendar
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => void syncHolidaysForView(plannerState.selectedCountry, viewYear)}
              style={[styles.syncBtn, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}
            >
              <RefreshCw size={12} color={colors.primary} />
              <Text style={[styles.syncText, { color: colors.primary }]}>
                {syncingHolidays ? 'Syncing' : countryMeta.flagText}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Country / Region Switcher Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.countryPillsRow}
          >
            <TouchableOpacity
              onPress={() => handleSelectCountry('AUTO')}
              style={[
                styles.countryPill,
                {
                  backgroundColor:
                    plannerState.selectedCountry === 'AUTO' ? colors.primary : colors.surface,
                  borderColor:
                    plannerState.selectedCountry === 'AUTO' ? colors.primary : colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.countryPillText,
                  { color: plannerState.selectedCountry === 'AUTO' ? '#FFFFFF' : colors.text },
                ]}
              >
                Auto ({regionResolution.detected.country})
              </Text>
            </TouchableOpacity>
            {SUPPORTED_HOLIDAY_COUNTRIES.map((c) => {
              const active = plannerState.selectedCountry === c.code;
              return (
                <TouchableOpacity
                  key={c.code}
                  onPress={() => handleSelectCountry(c.code)}
                  style={[
                    styles.countryPill,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.borderSubtle,
                    },
                  ]}
                >
                  <Text style={[styles.countryPillText, { color: active ? '#FFFFFF' : colors.text }]}>
                    {c.shortName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Month Switcher */}
          <View style={styles.monthBar}>
            <TouchableOpacity
              onPress={() => stepMonth(-1)}
              style={[styles.monthNavBtn, { backgroundColor: colors.surface }]}
            >
              <ChevronLeft size={17} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setViewYear(now.getFullYear());
                setViewMonth(now.getMonth());
                setSelectedDateKey(toIsoDateKey(now));
              }}
            >
              <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>
                {MONTH_FULL[viewMonth]} {viewYear}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => stepMonth(1)}
              style={[styles.monthNavBtn, { backgroundColor: colors.surface }]}
            >
              <ChevronRight size={17} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Weekday Headers */}
          <View style={styles.weekHeaderRow}>
            {WEEKDAYS.map((wd) => (
              <Text key={wd} style={[styles.weekHeaderCell, { color: colors.textSecondary }]}>
                {wd}
              </Text>
            ))}
          </View>

          {/* Calendar Month Grid */}
          <View style={styles.monthGrid}>
            {monthGrid.map((week, wIdx) => (
              <View key={`cal_wk_${wIdx}`} style={styles.calWeekRow}>
                {week.map((cell) => {
                  const isSelected = cell.dateKey === selectedDateKey;
                  const hasHoliday = cell.holidays.length > 0;
                  const holidayColor =
                    hasHoliday && cell.holidays[0].category === 'public'
                      ? '#EC4899'
                      : '#F59E0B';

                  return (
                    <TouchableOpacity
                      key={cell.dateKey}
                      disabled={!cell.inMonth}
                      activeOpacity={0.75}
                      onPress={() => setSelectedDateKey(cell.dateKey)}
                      style={[
                        styles.calDayCell,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : cell.isToday
                            ? mode === 'dark'
                              ? '#431407'
                              : '#FFEDD5'
                            : hasHoliday
                            ? mode === 'dark'
                              ? 'rgba(236, 72, 153, 0.14)'
                              : '#FDF2F8'
                            : colors.surface,
                          borderColor: isSelected
                            ? colors.primary
                            : cell.isToday
                            ? colors.primary
                            : hasHoliday
                            ? holidayColor
                            : colors.borderSubtle,
                          opacity: cell.inMonth ? 1 : 0,
                        },
                      ]}
                    >
                      {cell.inMonth && (
                        <>
                          <Text
                            style={[
                              styles.calDayText,
                              {
                                color: isSelected
                                  ? '#FFFFFF'
                                  : cell.isToday
                                  ? colors.primary
                                  : cell.isWeekend
                                  ? colors.textSecondary
                                  : colors.textPrimary,
                              },
                            ]}
                          >
                            {cell.dayOfMonth}
                          </Text>
                          <View style={styles.calDotsRow}>
                            {hasHoliday && (
                              <View
                                style={[
                                  styles.calDot,
                                  { backgroundColor: isSelected ? '#FFFFFF' : holidayColor },
                                ]}
                              />
                            )}
                            {cell.hasExam && (
                              <View
                                style={[
                                  styles.calDot,
                                  { backgroundColor: isSelected ? '#FDE047' : colors.info },
                                ]}
                              />
                            )}
                            {cell.hasGoal && (
                              <View
                                style={[
                                  styles.calDot,
                                  { backgroundColor: isSelected ? '#86EFAC' : colors.success },
                                ]}
                              />
                            )}
                          </View>
                        </>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Selected Date Inspection Box */}
          <View
            style={[
              styles.selectedDayBox,
              { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
            ]}
          >
            <View style={styles.selectedDayTop}>
              <Text style={[styles.selectedDayLabel, { color: colors.textPrimary }]}>
                {selectedDateKey === toIsoDateKey(now) ? `Today · ${selectedDateKey}` : selectedDateKey}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setGoalDateKey(selectedDateKey);
                  setGoalModalOpen(true);
                }}
              >
                <Text style={{ color: colors.primary, fontSize: 11.5, fontWeight: '700' }}>
                  + Add Goal on Date
                </Text>
              </TouchableOpacity>
            </View>

            {selectedDayHolidays.length === 0 &&
            selectedDayExams.length === 0 &&
            selectedDayGoals.length === 0 ? (
              <Text style={[styles.selectedEmptyText, { color: colors.textSecondary }]}>
                Regular study day in {countryMeta.name}. Tap another highlighted date or add a goal.
              </Text>
            ) : (
              <View style={{ gap: 6, marginTop: 6 }}>
                {selectedDayHolidays.map((h) => (
                  <View key={h.id} style={styles.dayEventRow}>
                    <Sparkles
                      size={13}
                      color={h.category === 'public' ? '#EC4899' : '#F59E0B'}
                    />
                    <Text style={[styles.dayEventText, { color: colors.textPrimary }]}>
                      <Text style={{ fontWeight: '800' }}>{h.name}</Text> ({h.category})
                      {h.note ? ` · ${h.note}` : ''}
                    </Text>
                  </View>
                ))}
                {selectedDayExams.map((e) => (
                  <View key={e.id} style={styles.dayEventRow}>
                    <CalendarIcon size={13} color={colors.info} />
                    <Text style={[styles.dayEventText, { color: colors.info, fontWeight: '700' }]}>
                      Exam: {e.name}
                    </Text>
                  </View>
                ))}
                {selectedDayGoals.map((g) => (
                  <View key={g.id} style={styles.dayEventRow}>
                    <CheckCircle
                      size={13}
                      color={g.isCompleted ? colors.success : colors.primary}
                    />
                    <Text style={[styles.dayEventText, { color: colors.textPrimary }]}>
                      Goal: {g.title} ({g.subject})
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Month Holidays Quick Strip */}
          {monthHolidays.length > 0 && (
            <View style={styles.monthHolidaysList}>
              <Text style={[styles.monthHolHeading, { color: colors.textSecondary }]}>
                HOLIDAYS IN {MONTH_FULL[viewMonth].toUpperCase()} ({countryMeta.flagText})
              </Text>
              {monthHolidays.map((h) => (
                <TouchableOpacity
                  key={h.id}
                  onPress={() => setSelectedDateKey(h.date)}
                  style={styles.monthHolRow}
                >
                  <Text style={[styles.monthHolDate, { color: colors.primary }]}>
                    {h.date.slice(5)}
                  </Text>
                  <Text style={[styles.monthHolName, { color: colors.textPrimary }]}>
                    {h.name}
                  </Text>
                  <Badge
                    label={h.category.toUpperCase()}
                    variant={h.category === 'public' ? 'primary' : 'warning'}
                    size="sm"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        {/* Exam Countdowns Section with Dynamic Live Days & Add Exam CTA */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeading, { color: colors.textPrimary, marginBottom: 0 }]}>
            Exam Countdowns
          </Text>
          <TouchableOpacity
            onPress={() => setExamModalOpen(true)}
            style={[
              styles.inlineAddBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Plus size={13} color={colors.primary} />
            <Text style={[styles.inlineAddText, { color: colors.primary }]}>Add Exam</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countdownScroll}>
          {plannerState.exams.map((exam) => {
            const daysLeft = computeDaysRemaining(exam.targetDate, now);
            return (
              <Card key={exam.id} style={styles.countdownCard}>
                <View style={styles.countdownTop}>
                  <Badge label={exam.category} variant="primary" size="sm" />
                  <View style={styles.timerBadge}>
                    <Clock size={13} color={colors.primary} />
                    <Text style={[styles.timerBadgeText, { color: colors.primary }]}>
                      {daysLeft}d left
                    </Text>
                  </View>
                </View>
                <Text style={[styles.examName, { color: colors.textPrimary }]} numberOfLines={2}>
                  {exam.name}
                </Text>
                <View style={styles.examBottomRow}>
                  <View style={styles.examDateRow}>
                    <CalendarIcon size={13} color={colors.textSecondary} />
                    <Text style={[styles.examDate, { color: colors.textSecondary }]}>
                      {exam.targetDate}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteExam(exam.id)} hitSlop={8}>
                    <Trash2 size={13} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })}
        </ScrollView>

        {/* Daily Study Goals with Wired + Button & Delete */}
        <Card style={styles.goalsCard}>
          <View style={styles.goalsHeader}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Today&apos;s Target Goals
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                {completedCount} of {plannerState.goals.length} completed ({goalProgress}%)
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setGoalDateKey(selectedDateKey || toIsoDateKey(now));
                setGoalModalOpen(true);
              }}
              style={[
                styles.addGoalBtn,
                { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary },
              ]}
              accessibilityLabel="Add study goal"
            >
              <Plus size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.progressBarBg, { backgroundColor: colors.borderSubtle }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${goalProgress}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>

          {plannerState.goals.map((g, idx) => (
            <View
              key={g.id}
              style={[
                styles.goalItem,
                {
                  borderBottomColor:
                    idx === plannerState.goals.length - 1 ? 'transparent' : colors.borderSubtle,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => toggleGoal(g.id)}
                style={styles.goalTapMain}
                activeOpacity={0.7}
              >
                {g.isCompleted ? (
                  <CheckCircle size={22} color="#16A34A" />
                ) : (
                  <Circle size={22} color={colors.border} />
                )}
                <View style={styles.goalTextContainer}>
                  <Text
                    style={[
                      styles.goalTitle,
                      {
                        color: g.isCompleted ? colors.textSecondary : colors.textPrimary,
                        textDecorationLine: g.isCompleted ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {g.title}
                  </Text>
                  <View style={styles.goalMetaRow}>
                    <Text style={[styles.goalSubject, { color: colors.primary }]}>{g.subject}</Text>
                    <Text style={[styles.goalDuration, { color: colors.textSecondary }]}>
                      · {g.durationMinutes} min · {g.dateKey}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteGoal(g.id)} hitSlop={8}>
                <Trash2 size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
        </Card>

        {/* Syllabus Completion Tracker */}
        <View style={styles.syllabusSectionHeader}>
          <Text style={[styles.sectionHeading, { color: colors.textPrimary, marginBottom: 0 }]}>
            Curriculum Syllabus Coverage
          </Text>
          <Badge label="Curriculum Map" variant="neutral" />
        </View>

        {syllabusModules.map((mod) => {
          const pct = Math.round((mod.completedChapters / mod.totalChapters) * 100);
          return (
            <Card key={mod.subject} style={styles.syllabusCard}>
              <View style={styles.syllabusTop}>
                <View style={styles.subjectTitleRow}>
                  <View style={[styles.dotIndicator, { backgroundColor: mod.color }]} />
                  <Text style={[styles.syllabusSubject, { color: colors.textPrimary }]}>
                    {mod.subject}
                  </Text>
                </View>
                <Text style={[styles.syllabusPct, { color: mod.color }]}>{pct}%</Text>
              </View>

              <View
                style={[styles.progressBarBg, { backgroundColor: colors.borderSubtle, marginVertical: 8 }]}
              >
                <View
                  style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: mod.color }]}
                />
              </View>

              <View style={styles.syllabusBottom}>
                <Text style={[styles.syllabusChapters, { color: colors.textSecondary }]}>
                  {mod.completedChapters}/{mod.totalChapters} Chapters Finished
                </Text>
                <Badge
                  label={mod.status}
                  variant={
                    mod.status === 'Ahead'
                      ? 'success'
                      : mod.status === 'On Track'
                      ? 'primary'
                      : 'warning'
                  }
                />
              </View>
              <View style={[styles.activeTopicBox, { backgroundColor: colors.surface }]}>
                <BookOpen size={14} color={colors.primary} />
                <Text style={[styles.activeTopicText, { color: colors.textPrimary }]} numberOfLines={1}>
                  In Progress: {mod.recentTopic}
                </Text>
              </View>
            </Card>
          );
        })}

        {/* Reminder Callout (high contrast in both light & dark) */}
        <Card
          style={[
            styles.reminderCard,
            {
              backgroundColor: mode === 'dark' ? '#251B0B' : '#FEF3C7',
              borderColor: mode === 'dark' ? '#F59E0B' : '#FCD34D',
            },
          ]}
        >
          <View style={styles.reminderRow}>
            <Bell size={20} color={mode === 'dark' ? '#FBBF24' : '#D97706'} />
            <View style={styles.reminderTextContainer}>
              <Text
                style={[
                  styles.reminderTitle,
                  { color: mode === 'dark' ? '#FDE68A' : '#92400E' },
                ]}
              >
                Automated Smart Reminders
              </Text>
              <Text
                style={[
                  styles.reminderDesc,
                  { color: mode === 'dark' ? '#E2E8F0' : '#78350F' },
                ]}
              >
                Push notifications stay synced for upcoming coaching mock tests and scheduled holidays.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Add Target Study Goal Modal */}
      <Modal visible={goalModalOpen} transparent animationType="fade" onRequestClose={() => setGoalModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Target Study Goal</Text>
              <TouchableOpacity onPress={() => setGoalModalOpen(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Goal Title *</Text>
            <TextInput
              value={goalTitle}
              onChangeText={setGoalTitle}
              placeholder="e.g. Solve 25 Electrostatics Numericals"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.modalInput,
                { color: colors.textPrimary, backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Subject</Text>
            <View style={styles.modalChipsRow}>
              {['Physics', 'Chemistry', 'Mathematics', 'Biology'].map((sub) => {
                const active = goalSubject === sub;
                return (
                  <TouchableOpacity
                    key={sub}
                    onPress={() => setGoalSubject(sub)}
                    style={[
                      styles.modalChip,
                      {
                        backgroundColor: active ? colors.primary : colors.surface,
                        borderColor: active ? colors.primary : colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 11.5, fontWeight: '700', color: active ? '#FFF' : colors.text }}>
                      {sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalTwoCol}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Date (YYYY-MM-DD)</Text>
                <TextInput
                  value={goalDateKey}
                  onChangeText={setGoalDateKey}
                  style={[
                    styles.modalInput,
                    { color: colors.textPrimary, backgroundColor: colors.inputBg, borderColor: colors.border },
                  ]}
                />
              </View>
              <View style={{ flex: 0.7 }}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Minutes</Text>
                <TextInput
                  value={goalMinutes}
                  onChangeText={(t) => setGoalMinutes(t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  style={[
                    styles.modalInput,
                    { color: colors.textPrimary, backgroundColor: colors.inputBg, borderColor: colors.border },
                  ]}
                />
              </View>
            </View>

            <View style={styles.modalBtnRow}>
              <Button title="Cancel" variant="outline" size="sm" onPress={() => setGoalModalOpen(false)} style={{ flex: 1 }} />
              <Button title="Add Goal" variant="primary" size="sm" onPress={handleAddGoal} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Exam Countdown Modal */}
      <Modal visible={examModalOpen} transparent animationType="fade" onRequestClose={() => setExamModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Exam Countdown</Text>
              <TouchableOpacity onPress={() => setExamModalOpen(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Exam Name *</Text>
            <TextInput
              value={examName}
              onChangeText={setExamName}
              placeholder="e.g. AITS Full Syllabus Mock 4"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.modalInput,
                { color: colors.textPrimary, backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            />

            <View style={styles.modalTwoCol}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Date (YYYY-MM-DD)</Text>
                <TextInput
                  value={examDate}
                  onChangeText={setExamDate}
                  placeholder="2027-01-24"
                  placeholderTextColor={colors.textSecondary}
                  style={[
                    styles.modalInput,
                    { color: colors.textPrimary, backgroundColor: colors.inputBg, borderColor: colors.border },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Category</Text>
                <TextInput
                  value={examCategory}
                  onChangeText={setExamCategory}
                  style={[
                    styles.modalInput,
                    { color: colors.textPrimary, backgroundColor: colors.inputBg, borderColor: colors.border },
                  ]}
                />
              </View>
            </View>

            <View style={styles.modalBtnRow}>
              <Button title="Cancel" variant="outline" size="sm" onPress={() => setExamModalOpen(false)} style={{ flex: 1 }} />
              <Button title="Save Exam" variant="primary" size="sm" onPress={handleAddExam} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  headerTextCol: { flex: 1, paddingRight: 8, minWidth: 0 },
  title: { fontSize: 21, fontWeight: '800' },
  subtitle: { fontSize: 12.5, marginTop: 2 },
  liveClockCard: { padding: 13, marginBottom: 14, borderWidth: 1 },
  liveClockTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  liveClockDate: { fontSize: 14.5, fontWeight: '800' },
  liveClockTz: { fontSize: 11, marginTop: 2 },
  liveTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    flexShrink: 0,
  },
  liveTimeText: { fontSize: 12.5, fontWeight: '800', fontVariant: ['tabular-nums'] },
  calendarCard: { padding: 14, marginBottom: 18 },
  calHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
  },
  syncText: { fontSize: 11, fontWeight: '800' },
  countryPillsRow: { gap: 7, paddingBottom: 10 },
  countryPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  countryPillText: { fontSize: 11, fontWeight: '700' },
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  monthNavBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: { fontSize: 15, fontWeight: '800' },
  weekHeaderRow: { flexDirection: 'row', marginBottom: 5 },
  weekHeaderCell: { flex: 1, textAlign: 'center', fontSize: 10.5, fontWeight: '700' },
  monthGrid: { gap: 5 },
  calWeekRow: { flexDirection: 'row', gap: 5 },
  calDayCell: {
    flex: 1,
    minHeight: 40,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  calDayText: { fontSize: 12, fontWeight: '700' },
  calDotsRow: { flexDirection: 'row', gap: 3, minHeight: 5 },
  calDot: { width: 5, height: 5, borderRadius: 2.5 },
  selectedDayBox: {
    marginTop: 12,
    borderRadius: 11,
    borderWidth: 1,
    padding: 11,
  },
  selectedDayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedDayLabel: { fontSize: 12.5, fontWeight: '800' },
  selectedEmptyText: { fontSize: 11.5, marginTop: 4 },
  dayEventRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dayEventText: { fontSize: 12, flex: 1 },
  monthHolidaysList: { marginTop: 12, gap: 6 },
  monthHolHeading: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.6 },
  monthHolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  monthHolDate: { fontSize: 11.5, fontWeight: '800', width: 42 },
  monthHolName: { fontSize: 12, fontWeight: '600', flex: 1 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inlineAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  inlineAddText: { fontSize: 11.5, fontWeight: '700' },
  sectionHeading: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  countdownScroll: { marginBottom: 18, marginHorizontal: -16, paddingHorizontal: 16 },
  countdownCard: { width: 245, padding: 14, marginRight: 12 },
  countdownTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timerBadgeText: { fontSize: 12, fontWeight: '800' },
  examName: { fontSize: 14.5, fontWeight: '700', marginBottom: 8 },
  examBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  examDateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  examDate: { fontSize: 12 },
  goalsCard: { padding: 16, marginBottom: 18 },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15.5, fontWeight: '800' },
  cardSubtitle: { fontSize: 12, marginTop: 2 },
  addGoalBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 14 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    gap: 8,
  },
  goalTapMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  goalTextContainer: { flex: 1 },
  goalTitle: { fontSize: 13.5, fontWeight: '600' },
  goalMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  goalSubject: { fontSize: 11, fontWeight: '700' },
  goalDuration: { fontSize: 11 },
  syllabusSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  syllabusCard: { padding: 16, marginBottom: 12 },
  syllabusTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dotIndicator: { width: 10, height: 10, borderRadius: 5 },
  syllabusSubject: { fontSize: 15, fontWeight: '700' },
  syllabusPct: { fontSize: 15, fontWeight: '800' },
  syllabusBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  syllabusChapters: { fontSize: 12, fontWeight: '500' },
  activeTopicBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  activeTopicText: { fontSize: 12, fontWeight: '500', flex: 1 },
  reminderCard: { padding: 14, marginTop: 8, borderWidth: 1 },
  reminderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  reminderTextContainer: { flex: 1 },
  reminderTitle: { fontSize: 13.5, fontWeight: '800', marginBottom: 2 },
  reminderDesc: { fontSize: 12, lineHeight: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: '800' },
  inputLabel: { fontSize: 11.5, fontWeight: '700', marginTop: 8, marginBottom: 4 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 13.5,
  },
  modalChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  modalChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9, borderWidth: 1 },
  modalTwoCol: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
});

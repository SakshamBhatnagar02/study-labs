import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { Badge } from '../common/Badge';
import { PYQ_JEE_QUESTIONS, PYQ_PAPERS_CATALOG } from '../../data/pyqQuestionsData';
import { OPEN_QUIZ_BANK } from '../../data/openQuizBankData';
import { SAMPLE_QUESTIONS } from '../../data/curriculumData';
import { HapticManager } from '../../services/hapticManager';
import { SoundManager } from '../../services/soundManager';
import type { CustomTestConfig, Question, SubjectId, TestAttempt } from '../../types';
import {
  ArrowLeft,
  Award,
  BookOpen,
  ChevronRight,
  Clock,
  FileText,
  History,
  ListChecks,
  Play,
  PlusCircle,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react-native';

interface TestsHubViewProps {
  allQuestions: Question[];
  savedCustomTests: CustomTestConfig[];
  testAttempts: TestAttempt[];
  hasActiveSession: boolean;
  activeSessionTitle: string;
  activeQuestionCount: number;
  activeAnsweredCount: number;
  onResumeActiveSession: () => void;
  onOpenCustomBuilder: () => void;
  onOpenHistory: () => void;
  onOpenQuestionManager: () => void;
  onLaunchOrganizedTest: (params: {
    title: string;
    questionIds: string[];
    practice: boolean;
    marksPos?: number;
    marksNeg?: number;
  }) => void;
}

export const TestsHubView: React.FC<TestsHubViewProps> = ({
  allQuestions,
  savedCustomTests,
  testAttempts,
  hasActiveSession,
  activeSessionTitle,
  activeQuestionCount,
  activeAnsweredCount,
  onResumeActiveSession,
  onOpenCustomBuilder,
  onOpenHistory,
  onOpenQuestionManager,
  onLaunchOrganizedTest,
}) => {
  const { colors, mode } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [subView, setSubView] = useState<'hub' | 'pyq_papers'>('hub');
  const [selectedYear, setSelectedYear] = useState<'All' | '2026' | '2025'>('All');
  const [attemptFilter, setAttemptFilter] = useState<'All' | 'Attempted' | 'Not Started'>('All');

  const cardBg = mode === 'dark' ? '#161C27' : colors.card;

  const attemptedTitles = useMemo(
    () => new Set(testAttempts.map((a) => a.testTitle.toLowerCase())),
    [testAttempts]
  );

  const filteredPyqPapers = useMemo(() => {
    return PYQ_PAPERS_CATALOG.filter((p) => {
      if (selectedYear !== 'All' && String(p.year) !== selectedYear) return false;
      const attempted = attemptedTitles.has(p.examName.toLowerCase());
      if (attemptFilter === 'Attempted' && !attempted) return false;
      if (attemptFilter === 'Not Started' && attempted) return false;
      return true;
    });
  }, [selectedYear, attemptFilter, attemptedTitles]);

  const curatedSeries = useMemo(() => {
    const bySubject = (subj: SubjectId) =>
      SAMPLE_QUESTIONS.filter((q) => q.subjectId === subj).map((q) => q.id);

    return [
      {
        id: 'series_full_pcm',
        badge: 'FULL MOCK',
        title: 'JEE Main Full Syllabus PCM Mock',
        sub: `${SAMPLE_QUESTIONS.length} High-Yield STEM Qs · Timed Exam (+4 / -1)`,
        accent: '#F97316',
        practice: false,
        questionIds: SAMPLE_QUESTIONS.map((q) => q.id),
      },
      {
        id: 'series_phy',
        badge: 'PHYSICS',
        title: 'Physics Concept & PYQ Mastery Drill',
        sub: `${bySubject('physics').length} Curated Problems · Instant KaTeX Solutions & Hints`,
        accent: '#3B82F6',
        practice: true,
        questionIds: bySubject('physics'),
      },
      {
        id: 'series_chem',
        badge: 'CHEMISTRY',
        title: 'Chemistry Physical, Organic & Inorganic Drill',
        sub: `${bySubject('chemistry').length} Curated Problems · Instant KaTeX Solutions`,
        accent: '#10B981',
        practice: true,
        questionIds: bySubject('chemistry'),
      },
      {
        id: 'series_math',
        badge: 'MATHS',
        title: 'Mathematics Calculus, Algebra & Vectors Drill',
        sub: `${bySubject('math').length} Curated Problems · Step-by-Step Derivations`,
        accent: '#8B5CF6',
        practice: true,
        questionIds: bySubject('math'),
      },
      {
        id: 'series_bio',
        badge: 'BIOLOGY',
        title: 'NEET Biology NCERT Core Drill',
        sub: `${bySubject('biology').length} Curated Problems · High-Yield NCERT Focus`,
        accent: '#EC4899',
        practice: true,
        questionIds: bySubject('biology'),
      },
      {
        id: 'series_open_commons',
        badge: 'OPEN STEM',
        title: 'Open STEM & CS Quiz Challenge (CC BY-SA 4.0)',
        sub: `${Math.min(20, OPEN_QUIZ_BANK.length)} Qs from Open Quiz Commons & OpenTriviaQA`,
        accent: '#14B8A6',
        practice: true,
        questionIds: OPEN_QUIZ_BANK.slice(0, 20).map((q) => q.id),
      },
    ].filter((s) => s.questionIds.length > 0);
  }, []);

  const launchPaper = (shiftCode: string, title: string, practice = false) => {
    HapticManager.triggerSelection();
    SoundManager.play('click');
    const paperQs = PYQ_JEE_QUESTIONS.filter(
      (q) => q.id.includes(shiftCode) || q.examOrigin?.includes(shiftCode)
    );
    const ids = (paperQs.length > 0 ? paperQs : PYQ_JEE_QUESTIONS.slice(0, 30)).map((q) => q.id);
    onLaunchOrganizedTest({
      title,
      questionIds: ids,
      practice,
      marksPos: 4,
      marksNeg: 1,
    });
  };

  // Sub-view: Organized PYQ Mock Papers List (MARKS-style Year & Attempt Filter)
  if (subView === 'pyq_papers') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.subHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => setSubView('hub')}
            style={styles.backBtn}
            hitSlop={8}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>PYQ Mock Tests</Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              JEE Main 2025–2026 Shift Papers · {PYQ_JEE_QUESTIONS.length} Authentic LaTeX Qs
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Year Filter Row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {(['All', '2026', '2025'] as const).map((yr) => {
              const active = selectedYear === yr;
              return (
                <TouchableOpacity
                  key={yr}
                  onPress={() => setSelectedYear(yr)}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: active ? colors.primary : cardBg,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.filterPillText, { color: active ? '#FFFFFF' : colors.text }]}>
                    {yr === 'All' ? 'All Years' : yr}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {(['All', 'Not Started', 'Attempted'] as const).map((st) => {
              const active = attemptFilter === st;
              return (
                <TouchableOpacity
                  key={st}
                  onPress={() => setAttemptFilter(st)}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: active ? (mode === 'dark' ? '#2A1710' : '#FFEDD5') : cardBg,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      { color: active ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {st === 'All' ? 'Any Status' : st}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.listCountLabel, { color: colors.textSecondary }]}>
            Showing {filteredPyqPapers.length} Organized PYQ Shift Paper(s)
          </Text>

          <View style={{ gap: 10 }}>
            {filteredPyqPapers.map((paper) => {
              const attempted = attemptedTitles.has(paper.examName.toLowerCase());
              const paperQCount = PYQ_JEE_QUESTIONS.filter((q) =>
                q.id.includes(paper.shiftCode)
              ).length;
              return (
                <Pressable
                  key={paper.shiftCode}
                  focusable={false}
                  onPress={() => launchPaper(paper.shiftCode, paper.examName, false)}
                  style={({ pressed }) => [
                    styles.paperCard,
                    { backgroundColor: cardBg, borderColor: colors.border, opacity: pressed ? 0.84 : 1 },
                  ]}
                >
                  <View style={[styles.paperIconBox, { backgroundColor: mode === 'dark' ? '#2A1710' : '#FFEDD5' }]}>
                    <FileText size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.paperTitle, { color: colors.text }]} numberOfLines={1}>
                      {paper.examName}
                    </Text>
                    <View style={styles.paperMetaRow}>
                      <Text style={[styles.paperMeta, { color: colors.textSecondary }]}>
                        {paperQCount || paper.totalQuestions} Qs · 180m · +4/-1
                      </Text>
                      <Badge
                        label={attempted ? 'Attempted' : 'Ready'}
                        variant={attempted ? 'success' : 'primary'}
                        size="sm"
                      />
                    </View>
                  </View>
                  <ChevronRight size={18} color={colors.textSecondary} />
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Main Sub-view: MARKS-Style Study Labs Tests Hub
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Clean Hub Header */}
      <View style={[styles.subHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.subHeaderInner}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Study Labs Tests</Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              {allQuestions.length} organized questions · PYQ mocks, custom tests & drills
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 7 }}>
            <TouchableOpacity
              onPress={onOpenHistory}
              style={[styles.iconPillBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityLabel="Test attempts history"
            >
              <History size={16} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onOpenQuestionManager}
              style={[styles.iconPillBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityLabel="Manage question bank"
            >
              <ListChecks size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Resume In-Progress Test Banner (only if user already started a session) */}
        {hasActiveSession && (
          <Pressable
            focusable={false}
            onPress={onResumeActiveSession}
            style={({ pressed }) => [
              styles.resumeBanner,
              {
                backgroundColor: mode === 'dark' ? '#1E293B' : '#FFF7ED',
                borderColor: colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <View style={[styles.resumeIcon, { backgroundColor: colors.primary }]}>
              <Play size={15} color="#FFFFFF" fill="#FFFFFF" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.resumeLabel, { color: colors.primary }]}>
                IN-PROGRESS SESSION
              </Text>
              <Text style={[styles.resumeTitle, { color: colors.text }]} numberOfLines={1}>
                {activeSessionTitle}
              </Text>
              <Text style={[styles.resumeSub, { color: colors.textSecondary }]}>
                {activeAnsweredCount}/{activeQuestionCount} answered · Tap to resume
              </Text>
            </View>
            <ChevronRight size={18} color={colors.primary} />
          </Pressable>
        )}

        {/* MARKS-Style Primary Hero Cards (Side-by-Side 2-Col on PC, Stacked on Mobile) */}
        <View style={[styles.heroGrid, isDesktop && styles.heroGridDesktop]}>
          {/* MARKS-Style Primary Hero Card 1: Create Your Own Test */}
          <Pressable
            focusable={false}
            onPress={() => {
              HapticManager.triggerSelection();
              SoundManager.play('click');
              onOpenCustomBuilder();
            }}
            style={({ pressed }) => [
              styles.heroActionCard,
              isDesktop && styles.heroActionCardDesktop,
              {
                backgroundColor: cardBg,
                borderColor: colors.primary,
                opacity: pressed ? 0.86 : 1,
              },
            ]}
          >
            <View style={{ flex: 1, gap: 5 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.heroCardTitle, { color: colors.text }]}>
                  Create Your Own Test
                </Text>
                <ChevronRight size={18} color={colors.primary} />
              </View>
              <Text style={[styles.heroCardSub, { color: colors.textSecondary }]}>
                Pick subjects, difficulty, custom marking (+4/-1 or +5/-2) & target rank
              </Text>
              <Text style={[styles.heroCardStat, { color: colors.primary }]}>
                {savedCustomTests.length} custom test(s) saved
              </Text>
            </View>
            <View style={[styles.heroIconWrap, { backgroundColor: mode === 'dark' ? '#2A1710' : '#FFEDD5' }]}>
              <PlusCircle size={24} color={colors.primary} />
            </View>
          </Pressable>

          {/* MARKS-Style Primary Hero Card 2: PYQ Mock Tests */}
          <Pressable
            focusable={false}
            onPress={() => {
              HapticManager.triggerSelection();
              SoundManager.play('click');
              setSubView('pyq_papers');
            }}
            style={({ pressed }) => [
              styles.heroActionCard,
              isDesktop && styles.heroActionCardDesktop,
              {
                backgroundColor: cardBg,
                borderColor: '#EC4899',
                opacity: pressed ? 0.86 : 1,
              },
            ]}
          >
            <View style={{ flex: 1, gap: 5 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.heroCardTitle, { color: colors.text }]}>PYQ Mock Tests</Text>
                <ChevronRight size={18} color="#EC4899" />
              </View>
              <Text style={[styles.heroCardSub, { color: colors.textSecondary }]}>
                Full JEE Main 2025 & 2026 shift papers with KaTeX math & step solutions
              </Text>
              <Text style={[styles.heroCardStat, { color: '#EC4899' }]}>
                {PYQ_PAPERS_CATALOG.length} shift papers · {PYQ_JEE_QUESTIONS.length} PYQs ready
              </Text>
            </View>
            <View style={[styles.heroIconWrap, { backgroundColor: mode === 'dark' ? '#2D1524' : '#FCE7F3' }]}>
              <Trophy size={24} color="#EC4899" />
            </View>
          </Pressable>
        </View>

        {/* Saved Custom Tests Quick Launch */}
        {savedCustomTests.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Custom Tests
            </Text>
            <View style={{ gap: 9 }}>
              {savedCustomTests.slice(0, 4).map((ct) => (
                <Pressable
                  key={ct.id}
                  focusable={false}
                  onPress={() =>
                    onLaunchOrganizedTest({
                      title: ct.title,
                      questionIds: ct.questionIds,
                      practice: ct.mode === 'practice',
                      marksPos: ct.marksPerCorrect,
                      marksNeg: ct.negativeMarks,
                    })
                  }
                  style={({ pressed }) => [
                    styles.seriesCard,
                    { backgroundColor: cardBg, borderColor: colors.border, opacity: pressed ? 0.84 : 1 },
                  ]}
                >
                  <View style={[styles.seriesBadgeBox, { backgroundColor: colors.primary }]}>
                    <Sparkles size={16} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.seriesTitle, { color: colors.text }]} numberOfLines={1}>
                      {ct.title}
                    </Text>
                    <Text style={[styles.seriesSub, { color: colors.textSecondary }]}>
                      {ct.questionIds.length} Qs · {ct.mode.toUpperCase()} · {ct.durationMinutes} min
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.textSecondary} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Curated Study Labs Test Series (MARKS-Style Organized List) */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Study Labs Curated Test Series
          </Text>
          <View style={[styles.seriesGrid, isDesktop && styles.seriesGridDesktop]}>
            {curatedSeries.map((series) => (
              <Pressable
                key={series.id}
                focusable={false}
                onPress={() => {
                  HapticManager.triggerSelection();
                  SoundManager.play('click');
                  onLaunchOrganizedTest({
                    title: series.title,
                    questionIds: series.questionIds,
                    practice: series.practice,
                    marksPos: 4,
                    marksNeg: 1,
                  });
                }}
                style={({ pressed }) => [
                  styles.seriesCard,
                  isDesktop && styles.seriesCardDesktop,
                  { backgroundColor: cardBg, borderColor: colors.border, opacity: pressed ? 0.84 : 1 },
                ]}
              >
                <View style={[styles.seriesBadgeBox, { backgroundColor: series.accent }]}>
                  <Text style={styles.seriesBadgeText}>{series.badge.slice(0, 4)}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.seriesTitle, { color: colors.text }]} numberOfLines={1}>
                    {series.title}
                  </Text>
                  <Text style={[styles.seriesSub, { color: colors.textSecondary }]} numberOfLines={1}>
                    {series.sub}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <Text style={[styles.startLink, { color: series.accent }]}>
                      {series.practice ? 'Start Practice ›' : 'Start Timed Mock ›'}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recent Past Attempts Preview */}
        {testAttempts.length > 0 && (
          <View style={styles.sectionBlock}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                Recent Attempts
              </Text>
              <TouchableOpacity onPress={onOpenHistory}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.primary }}>
                  VIEW ALL ({testAttempts.length})
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ gap: 8, marginTop: 10 }}>
              {testAttempts.slice(0, 3).map((att) => (
                <View
                  key={att.id}
                  style={[styles.attemptRow, { backgroundColor: cardBg, borderColor: colors.border }]}
                >
                  <Award size={18} color={colors.primary} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.seriesTitle, { color: colors.text }]} numberOfLines={1}>
                      {att.testTitle}
                    </Text>
                    <Text style={[styles.seriesSub, { color: colors.textSecondary }]}>
                      Score {att.score}/{att.maxScore} · {att.percentage}%
                    </Text>
                  </View>
                  <Clock size={14} color={colors.textSecondary} />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  subHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 848,
    alignSelf: 'center',
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  headerSub: { fontSize: 11.5, marginTop: 1 },
  iconPillBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 32,
    gap: 14,
    width: '100%',
    maxWidth: 848,
    alignSelf: 'center',
  },
  heroGrid: {
    gap: 12,
  },
  heroGridDesktop: {
    flexDirection: 'row',
    gap: 14,
  },
  heroActionCardDesktop: {
    flex: 1,
    minHeight: 128,
  },
  seriesGrid: {
    gap: 10,
  },
  seriesGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  seriesCardDesktop: {
    width: '48.8%',
  },
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  resumeIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 0.7 },
  resumeTitle: { fontSize: 14, fontWeight: '800', marginTop: 1 },
  resumeSub: { fontSize: 11.5, marginTop: 1 },
  heroActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  heroCardTitle: { fontSize: 17, fontWeight: '900', letterSpacing: -0.2 },
  heroCardSub: { fontSize: 12, lineHeight: 17 },
  heroCardStat: { fontSize: 11.5, fontWeight: '800', marginTop: 2 },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBlock: { marginTop: 4 },
  sectionTitle: { fontSize: 15.5, fontWeight: '800', marginBottom: 10 },
  seriesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 15,
    borderWidth: 1,
  },
  seriesBadgeBox: {
    width: 48,
    height: 48,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seriesBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  seriesTitle: { fontSize: 14, fontWeight: '800' },
  seriesSub: { fontSize: 11.5, marginTop: 2 },
  startLink: { fontSize: 12, fontWeight: '800' },
  attemptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 13,
    borderWidth: 1,
  },
  filterRow: { gap: 8, paddingBottom: 4 },
  filterPill: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterPillText: { fontSize: 12, fontWeight: '700' },
  listCountLabel: { fontSize: 12, fontWeight: '700', marginTop: -4 },
  paperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 15,
    borderWidth: 1,
  },
  paperIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paperTitle: { fontSize: 13.5, fontWeight: '800' },
  paperMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  paperMeta: { fontSize: 11.5, fontWeight: '600' },
});

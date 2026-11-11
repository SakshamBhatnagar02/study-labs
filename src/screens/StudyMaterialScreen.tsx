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
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { RichMathText } from '../components/common/MathRenderer';
import {
  BOARD_DISPLAY_NAMES,
  CHAPTERS,
  FORMULA_CARDS,
  SAMPLE_QUESTIONS,
  SUBJECTS,
  getChapterStudyModule,
} from '../data/curriculumData';
import { DEFAULT_USER, StorageService } from '../services/storage';
import { HapticManager } from '../services/hapticManager';
import {
  FormulaStatus,
  LearningMode,
  QuestionAttemptStat,
  QuestionDifficulty,
  SubjectId,
  TestSessionLaunch,
  UserProfile,
} from '../types';
import {
  computeDifficultyBreakdown,
  formatDurationShort,
  getLatestQuestionStatusMap,
} from '../utils/activityStats';
import {
  AlertTriangle,
  BarChart3,
  BookMarked,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  EyeOff,
  FileText,
  Layers,
  Play,
  Sparkles,
  ThumbsDown,
  Timer,
} from 'lucide-react-native';

interface StudyMaterialScreenProps {
  initialView?: 'chapters' | 'formulas';
  initialSubject?: SubjectId;
  onLaunchSession?: (session: TestSessionLaunch) => void;
  onOpenNotebooks?: () => void;
  onAskAITopic?: (topicTitle: string, subjectId: SubjectId) => void;
}

export const StudyMaterialScreen: React.FC<StudyMaterialScreenProps> = ({
  initialView = 'chapters',
  initialSubject = 'physics',
  onLaunchSession,
  onOpenNotebooks,
  onAskAITopic,
}) => {
  const { colors, mode } = useTheme();
  const [sectionTab, setSectionTab] = useState<'chapters' | 'formulas'>(initialView);
  const [activeSubject, setActiveSubject] = useState<SubjectId>(initialSubject);
  const [learningMode, setLearningMode] = useState<LearningMode>('Normal');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER);
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>('ch_p_01');
  const [chapterSubTab, setChapterSubTab] = useState<
    Record<string, 'topics' | 'notes' | 'questions' | 'analysis' | 'mistakes'>
  >({});
  const [expandedExampleId, setExpandedExampleId] = useState<string | null>(null);

  const [hideAttempted, setHideAttempted] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | QuestionDifficulty>('All');
  const [formulaFilter, setFormulaFilter] = useState<'all' | 'need_revision' | 'seen' | 'unseen'>('all');

  const [logs, setLogs] = useState<QuestionAttemptStat[]>([]);
  const [formulaStatuses, setFormulaStatuses] = useState<Record<string, FormulaStatus>>({});

  useEffect(() => {
    setSectionTab(initialView);
  }, [initialView]);

  useEffect(() => {
    setActiveSubject(initialSubject);
    const first = CHAPTERS.find((c) => c.subjectId === initialSubject);
    if (first) setExpandedChapterId(first.id);
  }, [initialSubject]);

  const loadProgress = useCallback(async () => {
    const [attemptLogs, fStatuses, prof] = await Promise.all([
      StorageService.getAttemptLogs(),
      StorageService.getFormulaStatuses(),
      StorageService.getUserProfile(),
    ]);
    setLogs(attemptLogs);
    setFormulaStatuses(fStatuses);
    setProfile(prof);
    if (prof.preferredMode) setLearningMode(prof.preferredMode);
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const latestStatusMap = getLatestQuestionStatusMap(logs);
  const filteredChapters = CHAPTERS.filter((c) => c.subjectId === activeSubject);
  const subjectFormulas = FORMULA_CARDS.filter((f) => f.subjectId === activeSubject);

  const filteredFormulas = subjectFormulas.filter((f) => {
    const st = formulaStatuses[f.id] || 'unseen';
    if (formulaFilter === 'all') return true;
    return st === formulaFilter;
  });

  const handleSetFormulaStatus = async (formulaId: string, status: FormulaStatus) => {
    HapticManager.triggerSelection();
    const updated = await StorageService.setFormulaStatus(formulaId, status);
    setFormulaStatuses(updated);
  };

  const launchChapterDrill = (
    title: string,
    questionIds: string[],
    testMode: 'practice' | 'exam'
  ) => {
    if (!onLaunchSession || questionIds.length === 0) return;
    onLaunchSession({
      title,
      mode: testMode,
      questionIds,
      nonce: Date.now(),
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Breadcrumb, Curriculum Section Switch & Learning Modes */}
      <View style={[styles.hierarchyHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.topRowFlex}>
          <Text style={[styles.hierarchyPath, { color: colors.textSecondary }]} numberOfLines={1}>
            {BOARD_DISPLAY_NAMES[profile.board || 'JEE_MAIN']} ({profile.country || 'India'}) ❯ {profile.classGrade} ❯ {profile.stream}
          </Text>
          {onOpenNotebooks && (
            <TouchableOpacity
              onPress={() => onOpenNotebooks()}
              style={[styles.notebookShortcut, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <BookMarked size={12} color={colors.primary} />
              <Text style={[styles.notebookShortcutText, { color: colors.primary }]}>Notebooks</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Chapters & PYQs vs Formula Cards */}
        <View
          style={[
            styles.modeTabs,
            {
              backgroundColor: mode === 'dark' ? colors.surface : '#F1F5F9',
              borderColor: colors.borderSubtle,
              borderWidth: 1,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setSectionTab('chapters')}
            style={[styles.modeTab, sectionTab === 'chapters' && { backgroundColor: colors.primary }]}
          >
            <Text
              style={[
                styles.modeTabText,
                { color: sectionTab === 'chapters' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Chapters & PYQ Drills
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSectionTab('formulas')}
            style={[styles.modeTab, sectionTab === 'formulas' && { backgroundColor: colors.primary }]}
          >
            <Text
              style={[
                styles.modeTabText,
                { color: sectionTab === 'formulas' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Formula Cards ({FORMULA_CARDS.filter((f) => f.subjectId === activeSubject).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3 Learning Modes Switcher (preserved from existing Curriculum screen) */}
        {sectionTab === 'chapters' && (
          <View
            style={[
              styles.modeTabs,
              {
                backgroundColor: mode === 'dark' ? colors.surface : '#F1F5F9',
                borderColor: colors.borderSubtle,
                borderWidth: 1,
              },
            ]}
          >
            {(['Detailed', 'Normal', 'Rapid Revision'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => {
                  setLearningMode(m);
                  void StorageService.saveUserProfile({ ...profile, preferredMode: m });
                }}
                style={[styles.modeTab, learningMode === m && { backgroundColor: colors.secondary }]}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    { color: learningMode === m ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Subject Filter Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.subjectBarScroll}
        contentContainerStyle={styles.subjectBar}
      >
        {SUBJECTS.map((sub) => {
          const isActive = activeSubject === sub.id;
          return (
            <TouchableOpacity
              key={sub.id}
              activeOpacity={0.7}
              onPress={() => {
                setActiveSubject(sub.id);
                const first = CHAPTERS.find((c) => c.subjectId === sub.id);
                setExpandedChapterId(first?.id || null);
              }}
              style={[
                styles.subjectChip,
                {
                  backgroundColor: isActive ? colors.primary : colors.card,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.subjectChipText, { color: isActive ? '#FFFFFF' : colors.text }]}>
                {sub.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* CHAPTERS & PYQS VIEW */}
      {sectionTab === 'chapters' ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filteredChapters.map((chapter) => {
            const isExpanded = expandedChapterId === chapter.id;
            const percent = Math.round((chapter.completedQuestions / chapter.totalQuestions) * 100);
            const activeSub = chapterSubTab[chapter.id] || 'topics';

            const chapterQuestions = SAMPLE_QUESTIONS.filter((q) => q.chapterId === chapter.id);
            const filteredQs = chapterQuestions.filter((q) => {
              if (hideAttempted && latestStatusMap[q.id]) return false;
              if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) return false;
              return true;
            });

            const mistakeQs = chapterQuestions.filter((q) => {
              const st = latestStatusMap[q.id];
              return st && !st.isCorrect;
            });

            const diffRows = computeDifficultyBreakdown(logs, { chapterId: chapter.id });

            return (
              <Card key={chapter.id} style={styles.chapterCard}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                  style={styles.chapterHeader}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.badgeRow}>
                      <Badge label={`CHAPTER ${chapter.chapterNumber}`} variant="primary" size="sm" />
                      {chapter.highYield && <Badge label="HIGH YIELD" variant="warning" size="sm" />}
                      {chapterQuestions.length > 0 && (
                        <Badge
                          label={`${chapterQuestions.length} DRILL Qs`}
                          variant="neutral"
                          size="sm"
                        />
                      )}
                    </View>
                    <Text style={[styles.chapterTitle, { color: colors.text }]}>{chapter.title}</Text>
                    <Text style={[styles.chapterStats, { color: colors.textSecondary }]}>
                      {chapter.completedQuestions} / {chapter.totalQuestions} Qs Done · {percent}%
                    </Text>
                  </View>

                  {isExpanded ? (
                    <ChevronUp size={20} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={[styles.expandedBody, { borderTopColor: colors.borderSubtle }]}>
                    {/* Dual CTAs: Practice Chapter vs Take Chapter Test */}
                    {chapterQuestions.length > 0 && onLaunchSession && (
                      <View style={styles.dualActionRow}>
                        <Button
                          title="Practice Chapter"
                          size="sm"
                          variant="primary"
                          onPress={() =>
                            launchChapterDrill(chapter.title, chapterQuestions.map((q) => q.id), 'practice')
                          }
                          icon={<Play size={13} color="#FFFFFF" />}
                          style={{ flex: 1 }}
                        />
                        <Button
                          title="Take Chapter Test"
                          size="sm"
                          variant="outline"
                          onPress={() =>
                            launchChapterDrill(`${chapter.title} Test`, chapterQuestions.map((q) => q.id), 'exam')
                          }
                          icon={<Timer size={13} color={colors.primary} />}
                          style={{ flex: 1 }}
                        />
                      </View>
                    )}

                    {/* Chapter Sub-tabs: Topics | Notes & Visuals | All Qs | Analysis | Mistakes */}
                    <View
                      style={[
                        styles.subTabBar,
                        { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle },
                      ]}
                    >
                      {(
                        [
                          { id: 'topics', label: 'Topics' },
                          { id: 'notes', label: 'Notes' },
                          { id: 'questions', label: `Qs (${chapterQuestions.length})` },
                          { id: 'analysis', label: 'Analysis' },
                          { id: 'mistakes', label: `Mistakes (${mistakeQs.length})` },
                        ] as const
                      ).map((st) => {
                        const selected = activeSub === st.id;
                        return (
                          <TouchableOpacity
                            key={st.id}
                            onPress={() =>
                              setChapterSubTab((prev) => ({ ...prev, [chapter.id]: st.id }))
                            }
                            style={[
                              styles.subTabBtn,
                              selected && { backgroundColor: colors.primary },
                            ]}
                          >
                            <Text
                              style={[
                                styles.subTabText,
                                { color: selected ? '#FFFFFF' : colors.textSecondary },
                              ]}
                            >
                              {st.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* 1. TOPICS VIEW */}
                    {activeSub === 'topics' &&
                      chapter.topics.map((topic, index) => (
                        <View
                          key={topic.id}
                          style={[
                            styles.topicRow,
                            {
                              borderBottomColor:
                                index === chapter.topics.length - 1
                                  ? 'transparent'
                                  : colors.borderSubtle,
                            },
                          ]}
                        >
                          <View style={styles.topicCheckIcon}>
                            {topic.isCompleted ? (
                              <CheckCircle2 size={18} color={colors.success} />
                            ) : (
                              <Circle size={18} color={colors.border} />
                            )}
                          </View>

                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={[styles.topicTitle, { color: colors.text }]}>
                              {topic.title}
                            </Text>
                            <View style={styles.topicMeta}>
                              <Text style={[styles.topicSubText, { color: colors.textSecondary }]}>
                                {topic.pyqCount} PYQs
                              </Text>
                              <Text style={[styles.topicDot, { color: colors.textSecondary }]}>·</Text>
                              <Text style={[styles.topicSubText, { color: colors.textSecondary }]}>
                                {topic.revisionCount} Revisions
                              </Text>
                            </View>
                          </View>

                          <TouchableOpacity
                            onPress={() => {
                              if (onAskAITopic) {
                                onAskAITopic(topic.title, chapter.subjectId);
                              }
                            }}
                            style={[
                              styles.notesBtn,
                              {
                                backgroundColor: mode === 'dark' ? colors.surface : '#F1F5F9',
                                borderWidth: 1,
                                borderColor: colors.borderSubtle,
                              },
                            ]}
                          >
                            <Sparkles size={13} color={colors.primary} />
                            <Text style={[styles.notesBtnText, { color: colors.primary }]}>
                              Notes & AI
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}

                    {/* 1B. STRUCTURED NOTES, FLOWCHART, MIND MAP & WORKED EXAMPLES */}
                    {activeSub === 'notes' && (() => {
                      const studyMod = getChapterStudyModule(chapter);
                      const activeNotes =
                        learningMode === 'Detailed'
                          ? studyMod.detailedNotes
                          : learningMode === 'Rapid Revision'
                          ? studyMod.rapidBullets
                          : studyMod.normalNotes;
                      return (
                        <View style={{ gap: 10 }}>
                          <View style={[styles.miniQuestionCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                            <Badge label={`${learningMode.toUpperCase()} GUIDE`} variant="primary" size="sm" />
                            <RichMathText
                              content={studyMod.summary}
                              fontSize={12.5}
                              color={colors.text}
                              accentColor={colors.primary}
                              compact
                            />
                          </View>

                          <View style={[styles.miniQuestionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text }}>
                              {learningMode} Revision Notes ({activeNotes.length})
                            </Text>
                            {activeNotes.map((line, i) => (
                              <RichMathText
                                key={`${chapter.id}_note_${i}`}
                                content={line}
                                fontSize={12.5}
                                color={colors.text}
                                accentColor={colors.primary}
                                compact
                              />
                            ))}
                          </View>

                          {/* Concept Flowchart */}
                          <View style={[styles.miniQuestionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={{ fontSize: 12, fontWeight: '800', color: colors.cyan }}>
                              PROBLEM-SOLVING FLOWCHART
                            </Text>
                            <View style={{ gap: 6, marginTop: 2 }}>
                              {studyMod.flowSteps.map((step, idx) => (
                                <View
                                  key={`${chapter.id}_flow_${idx}`}
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: 8,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    backgroundColor: colors.card,
                                    borderColor: colors.borderSubtle,
                                  }}
                                >
                                  <View
                                    style={{
                                      width: 22,
                                      height: 22,
                                      borderRadius: 11,
                                      backgroundColor: colors.primary,
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>
                                      {idx + 1}
                                    </Text>
                                  </View>
                                  <View style={{ flex: 1 }}>
                                    <RichMathText content={step} fontSize={12} color={colors.text} compact />
                                  </View>
                                </View>
                              ))}
                            </View>
                          </View>

                          {/* Visual Mind Map */}
                          <View style={[styles.miniQuestionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={{ fontSize: 12, fontWeight: '800', color: colors.primary }}>
                              MIND MAP · {studyMod.mindMapRoot.toUpperCase()}
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                              {studyMod.mindMapBranches.map((br) => (
                                <View
                                  key={br.id}
                                  style={{
                                    width: '48%',
                                    minWidth: 138,
                                    padding: 9,
                                    borderRadius: 11,
                                    borderWidth: 1,
                                    backgroundColor: colors.card,
                                    borderColor: br.color,
                                    gap: 4,
                                  }}
                                >
                                  <Text style={{ fontSize: 12, fontWeight: '800', color: br.color }}>
                                    {br.title}
                                  </Text>
                                  {br.nodes.map((nd, ni) => (
                                    <RichMathText
                                      key={`${br.id}_n_${ni}`}
                                      content={`• ${nd}`}
                                      fontSize={11.5}
                                      color={colors.text}
                                      compact
                                    />
                                  ))}
                                  {br.keyFormula && (
                                    <RichMathText
                                      content={br.keyFormula}
                                      fontSize={11.5}
                                      color={br.color}
                                      compact
                                    />
                                  )}
                                </View>
                              ))}
                            </View>
                          </View>

                          {/* Worked Examples */}
                          {studyMod.workedExamples.map((ex) => {
                            const isOpen = expandedExampleId === ex.id;
                            return (
                              <TouchableOpacity
                                key={ex.id}
                                activeOpacity={0.8}
                                onPress={() => setExpandedExampleId(isOpen ? null : ex.id)}
                                style={[
                                  styles.miniQuestionCard,
                                  { backgroundColor: colors.surface, borderColor: colors.success },
                                ]}
                              >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Text style={{ fontSize: 12.5, fontWeight: '800', color: colors.success }}>
                                    Worked Example: {ex.title}
                                  </Text>
                                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>
                                    {isOpen ? 'Hide Proof' : 'View Steps'}
                                  </Text>
                                </View>
                                <RichMathText content={ex.problem} fontSize={12.5} color={colors.text} compact />
                                {isOpen && (
                                  <View style={{ gap: 5, marginTop: 4 }}>
                                    {ex.solutionSteps.map((s, si) => (
                                      <RichMathText
                                        key={`${ex.id}_s_${si}`}
                                        content={`${si + 1}. ${s}`}
                                        fontSize={12}
                                        color={colors.textSecondary}
                                        compact
                                      />
                                    ))}
                                    <RichMathText
                                      content={`**Answer:** ${ex.finalAnswer}`}
                                      fontSize={12.5}
                                      color={colors.primary}
                                      compact
                                    />
                                  </View>
                                )}
                              </TouchableOpacity>
                            );
                          })}

                          {/* Exam Pitfalls */}
                          <View style={[styles.miniQuestionCard, { backgroundColor: colors.surface, borderColor: colors.warning }]}>
                            <Text style={{ fontSize: 11.5, fontWeight: '800', color: colors.warning }}>
                              COMMON EXAM PITFALLS
                            </Text>
                            {studyMod.examPitfalls.map((p, pi) => (
                              <RichMathText
                                key={`${chapter.id}_pit_${pi}`}
                                content={`⚠ ${p}`}
                                fontSize={12}
                                color={colors.text}
                                compact
                              />
                            ))}
                          </View>
                        </View>
                      );
                    })()}

                    {/* 2. ALL QUESTIONS WITH HIDE ATTEMPTED & DIFFICULTY FILTERS */}
                    {activeSub === 'questions' && (
                      <View style={styles.qListSection}>
                        <View style={styles.qFilterToolbar}>
                          <View style={styles.hideAttemptedWrap}>
                            <EyeOff size={14} color={colors.textSecondary} />
                            <Text style={[styles.hideLabel, { color: colors.text }]}>
                              Hide Attempted
                            </Text>
                            <Switch
                              value={hideAttempted}
                              onValueChange={setHideAttempted}
                              trackColor={{ false: '#64748B', true: colors.primary }}
                              thumbColor={hideAttempted ? '#FFFFFF' : '#E2E8F0'}
                              ios_backgroundColor="#475569"
                              {...({ activeThumbColor: '#FFFFFF' } as object)}
                            />
                          </View>

                          <View style={styles.diffChipRow}>
                            {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => {
                              const act = difficultyFilter === d;
                              return (
                                <TouchableOpacity
                                  key={d}
                                  onPress={() => setDifficultyFilter(d)}
                                  style={[
                                    styles.diffChip,
                                    {
                                      backgroundColor: act ? colors.primary : colors.surface,
                                      borderColor: act ? colors.primary : colors.border,
                                    },
                                  ]}
                                >
                                  <Text
                                    style={{
                                      fontSize: 10.5,
                                      fontWeight: '700',
                                      color: act ? '#FFFFFF' : colors.textSecondary,
                                    }}
                                  >
                                    {d}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>

                        {filteredQs.map((q, idx) => {
                          const st = latestStatusMap[q.id];
                          return (
                            <TouchableOpacity
                              key={q.id}
                              activeOpacity={0.75}
                              onPress={() =>
                                launchChapterDrill(chapter.title, [q.id], 'practice')
                              }
                              style={[
                                styles.miniQuestionCard,
                                { backgroundColor: colors.surface, borderColor: colors.border },
                              ]}
                            >
                              <View style={styles.miniQHeader}>
                                <Text style={[styles.miniQNum, { color: colors.primary }]}>
                                  Q{idx + 1} · {q.difficulty}
                                </Text>
                                {st ? (
                                  <Badge
                                    label={st.isCorrect ? 'SOLVED' : 'MISTAKE'}
                                    variant={st.isCorrect ? 'success' : 'error'}
                                    size="sm"
                                  />
                                ) : (
                                  <Badge label="NEW" variant="neutral" size="sm" />
                                )}
                              </View>
                              <RichMathText
                                content={q.prompt}
                                fontSize={13}
                                color={colors.text}
                                accentColor={colors.primary}
                                compact
                                nonInteractive
                              />
                            </TouchableOpacity>
                          );
                        })}

                        {filteredQs.length === 0 && (
                          <Text style={[styles.emptyMiniText, { color: colors.textSecondary }]}>
                            No questions match the current filters in this chapter.
                          </Text>
                        )}
                      </View>
                    )}

                    {/* 3. CHAPTER DIFFICULTY ANALYSIS */}
                    {activeSub === 'analysis' && (
                      <View style={styles.analysisBox}>
                        <View style={styles.analysisHeader}>
                          <BarChart3 size={16} color={colors.primary} />
                          <Text style={[styles.analysisHeading, { color: colors.text }]}>
                            Chapter Difficulty Breakdown
                          </Text>
                        </View>

                        {diffRows.map((row) => (
                          <View
                            key={row.difficulty}
                            style={[
                              styles.diffStatRow,
                              { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle },
                            ]}
                          >
                            <View style={styles.diffStatTop}>
                              <Text style={[styles.diffLabel, { color: colors.text }]}>
                                {row.difficulty}
                              </Text>
                              <Text style={[styles.diffMetrics, { color: colors.textSecondary }]}>
                                {row.attempted} Att · {row.accuracyPercent}% Acc ·{' '}
                                {formatDurationShort(row.avgTimeSeconds)} Avg
                              </Text>
                            </View>
                            <View style={[styles.barTrack, { backgroundColor: colors.borderSubtle }]}>
                              <View
                                style={[
                                  styles.barFill,
                                  {
                                    width: `${row.accuracyPercent}%`,
                                    backgroundColor:
                                      row.difficulty === 'Easy'
                                        ? colors.success
                                        : row.difficulty === 'Hard'
                                        ? colors.error
                                        : colors.warning,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* 4. MY MISTAKES */}
                    {activeSub === 'mistakes' && (
                      <View style={styles.mistakesBox}>
                        {mistakeQs.length > 0 ? (
                          <>
                            <Button
                              title={`Re-Practice ${mistakeQs.length} Mistake(s)`}
                              size="sm"
                              onPress={() =>
                                launchChapterDrill(
                                  `${chapter.title} · Mistakes`,
                                  mistakeQs.map((m) => m.id),
                                  'practice'
                                )
                              }
                            />
                            {mistakeQs.map((q) => (
                              <View
                                key={q.id}
                                style={[
                                  styles.miniQuestionCard,
                                  { backgroundColor: colors.surface, borderColor: colors.error },
                                ]}
                              >
                                <View style={styles.miniQHeader}>
                                  <Badge label="MISSED EARLIER" variant="error" size="sm" />
                                  <Badge label={q.difficulty} variant="neutral" size="sm" />
                                </View>
                                <RichMathText
                                  content={q.prompt}
                                  fontSize={13}
                                  color={colors.text}
                                  accentColor={colors.error}
                                  compact
                                />
                              </View>
                            ))}
                          </>
                        ) : (
                          <View style={styles.emptyMistakes}>
                            <AlertTriangle size={20} color={colors.success} />
                            <Text style={[styles.emptyMiniText, { color: colors.textSecondary }]}>
                              Zero recorded mistakes in this chapter — keep going!
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </Card>
            );
          })}
        </ScrollView>
      ) : (
        /* FORMULA CARDS REVISION DECK VIEW */
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formulaFilters}>
            {(
              [
                { id: 'all', label: `All (${subjectFormulas.length})` },
                { id: 'need_revision', label: 'Need Revision' },
                { id: 'seen', label: 'Reviewed' },
                { id: 'unseen', label: 'Not Seen' },
              ] as const
            ).map((f) => {
              const active = formulaFilter === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setFormulaFilter(f.id)}
                  style={[
                    styles.formulaFilterChip,
                    {
                      backgroundColor: active ? colors.primary : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 11.5,
                      fontWeight: '700',
                      color: active ? '#FFFFFF' : colors.textSecondary,
                    }}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {filteredFormulas.map((card) => {
            const st = formulaStatuses[card.id] || 'unseen';
            return (
              <Card
                key={card.id}
                style={[
                  styles.formulaCard,
                  st === 'need_revision' && { borderColor: colors.warning, borderWidth: 1.5 },
                ]}
              >
                <View style={styles.formulaTop}>
                  <Badge label={card.chapterTitle} variant="primary" size="sm" />
                  <Badge
                    label={
                      st === 'need_revision'
                        ? 'NEED REVISION'
                        : st === 'seen'
                        ? 'MASTERED'
                        : 'NEW CARD'
                    }
                    variant={
                      st === 'need_revision' ? 'warning' : st === 'seen' ? 'success' : 'neutral'
                    }
                    size="sm"
                  />
                </View>

                <Text style={[styles.formulaTitle, { color: colors.text }]}>{card.title}</Text>

                <View
                  style={[
                    styles.formulaMathBox,
                    { backgroundColor: mode === 'dark' ? colors.inputBg : '#FFF7ED', borderColor: colors.border },
                  ]}
                >
                  <RichMathText
                    content={card.formula}
                    fontSize={15}
                    color={colors.text}
                    accentColor={colors.primary}
                  />
                </View>

                <RichMathText
                  content={`**Variables:** ${card.variables}${card.notes ? `\n\n**Tip:** ${card.notes}` : ''}`}
                  fontSize={12.5}
                  color={colors.textSecondary}
                  accentColor={colors.primary}
                  compact
                />

                <View style={styles.formulaActions}>
                  <TouchableOpacity
                    onPress={() => handleSetFormulaStatus(card.id, 'need_revision')}
                    style={[
                      styles.formulaActionBtn,
                      {
                        backgroundColor: st === 'need_revision' ? colors.warningBg : colors.surface,
                        borderColor: st === 'need_revision' ? colors.warning : colors.border,
                      },
                    ]}
                  >
                    <ThumbsDown size={13} color={st === 'need_revision' ? colors.warning : colors.textSecondary} />
                    <Text
                      style={[
                        styles.formulaActionText,
                        { color: st === 'need_revision' ? colors.warning : colors.textSecondary },
                      ]}
                    >
                      Need Revision
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleSetFormulaStatus(card.id, 'seen')}
                    style={[
                      styles.formulaActionBtn,
                      {
                        backgroundColor: st === 'seen' ? colors.successBg : colors.surface,
                        borderColor: st === 'seen' ? colors.success : colors.border,
                      },
                    ]}
                  >
                    <CheckCircle2 size={13} color={st === 'seen' ? colors.success : colors.textSecondary} />
                    <Text
                      style={[
                        styles.formulaActionText,
                        { color: st === 'seen' ? colors.success : colors.textSecondary },
                      ]}
                    >
                      Got It
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })}

          {filteredFormulas.length === 0 && (
            <Card style={styles.emptyCard}>
              <Layers size={26} color={colors.textSecondary} />
              <Text style={[styles.emptyMiniText, { color: colors.textSecondary }]}>
                No formula cards under this status filter for {activeSubject}.
              </Text>
            </Card>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  hierarchyHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  topRowFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  hierarchyPath: { fontSize: 11, fontWeight: '600', flex: 1 },
  notebookShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  notebookShortcutText: { fontSize: 11, fontWeight: '700' },
  modeTabs: { flexDirection: 'row', borderRadius: 10, padding: 3 },
  modeTab: { flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  modeTabText: { fontSize: 11, fontWeight: '700' },
  subjectBarScroll: { flexGrow: 0, flexShrink: 0 },
  subjectBar: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  subjectChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  subjectChipText: { fontSize: 12, fontWeight: '700' },
  scrollContent: { padding: 16, paddingTop: 4, gap: 12, paddingBottom: 32 },
  chapterCard: { padding: 16 },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 6, flexWrap: 'wrap' },
  chapterTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  chapterStats: { fontSize: 12 },
  expandedBody: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, gap: 10 },
  dualActionRow: { flexDirection: 'row', gap: 8 },
  subTabBar: { flexDirection: 'row', borderRadius: 10, padding: 3, gap: 3 },
  subTabBtn: { flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  subTabText: { fontSize: 10.5, fontWeight: '700' },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  topicCheckIcon: { width: 24, alignItems: 'center' },
  topicTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  topicMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  topicSubText: { fontSize: 11 },
  topicDot: { fontSize: 11 },
  notesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  notesBtnText: { fontSize: 11, fontWeight: '700' },
  qListSection: { gap: 8 },
  qFilterToolbar: { gap: 8 },
  hideAttemptedWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hideLabel: { flex: 1, marginLeft: 8, fontSize: 12.5, fontWeight: '600' },
  diffChipRow: { flexDirection: 'row', gap: 6 },
  diffChip: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  miniQuestionCard: { padding: 11, borderRadius: 12, borderWidth: 1, gap: 6 },
  miniQHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniQNum: { fontSize: 11.5, fontWeight: '800' },
  emptyMiniText: { fontSize: 12, textAlign: 'center', paddingVertical: 10 },
  analysisBox: { gap: 8 },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  analysisHeading: { fontSize: 13.5, fontWeight: '700' },
  diffStatRow: { padding: 10, borderRadius: 10, gap: 6 },
  diffStatTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diffLabel: { fontSize: 12.5, fontWeight: '700' },
  diffMetrics: { fontSize: 11, fontWeight: '600' },
  barTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  mistakesBox: { gap: 10 },
  emptyMistakes: { alignItems: 'center', paddingVertical: 12, gap: 4 },
  formulaFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  formulaFilterChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  formulaCard: { padding: 14, gap: 10 },
  formulaTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  formulaTitle: { fontSize: 15, fontWeight: '800' },
  formulaMathBox: { padding: 10, borderRadius: 12, borderWidth: 1 },
  formulaActions: { flexDirection: 'row', gap: 8, marginTop: 2 },
  formulaActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  formulaActionText: { fontSize: 11.5, fontWeight: '700' },
  emptyCard: { padding: 24, alignItems: 'center', gap: 8 },
});

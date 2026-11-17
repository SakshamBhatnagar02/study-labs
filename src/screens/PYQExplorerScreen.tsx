import React, { useMemo, useState } from 'react';
import {
  FlatList,
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
import { SoundManager } from '../services/soundManager';
import { HapticManager } from '../services/hapticManager';
import { PYQ_JEE_QUESTIONS, PYQ_PAPERS_CATALOG, PYQPaperMeta } from '../data/pyqQuestionsData';
import { OPEN_QUIZ_ATTRIBUTION, OPEN_QUIZ_BANK } from '../data/openQuizBankData';
import { Question, SubjectId } from '../types';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  Flame,
  HelpCircle,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react-native';

interface PYQExplorerScreenProps {
  onBack: () => void;
  onLaunchMockTest?: (questions: Question[], title: string) => void;
}

export const PYQExplorerScreen: React.FC<PYQExplorerScreenProps> = ({
  onBack,
  onLaunchMockTest,
}) => {
  const { colors, mode } = useTheme();

  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [bankSource, setBankSource] = useState<'pyq' | 'open_commons'>('pyq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  const activePool = bankSource === 'open_commons' ? OPEN_QUIZ_BANK : PYQ_JEE_QUESTIONS;

  const filteredQuestions = useMemo(() => {
    return activePool.filter((q) => {
      // Filter by paper shift (PYQ mode only)
      if (bankSource === 'pyq' && selectedShift !== 'all') {
        const matchesShift = q.id.includes(selectedShift) || q.examOrigin?.includes(selectedShift);
        if (!matchesShift) return false;
      }
      // Filter by subject
      if (selectedSubject !== 'all' && q.subjectId !== selectedSubject) {
        return false;
      }
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inPrompt = q.prompt.toLowerCase().includes(query);
        const inExam = q.examOrigin?.toLowerCase().includes(query);
        const inTags = q.tags?.some((t) => t.toLowerCase().includes(query));
        if (!inPrompt && !inExam && !inTags) return false;
      }
      return true;
    });
  }, [activePool, bankSource, selectedShift, selectedSubject, searchQuery]);

  const activePaperMeta = useMemo(() => {
    if (selectedShift === 'all') return null;
    return PYQ_PAPERS_CATALOG.find((p) => p.shiftCode === selectedShift) || null;
  }, [selectedShift]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    SoundManager.play('click');
    HapticManager.triggerSelection();
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleToggleSolution = (questionId: string) => {
    SoundManager.play('hint');
    HapticManager.triggerSelection();
    setRevealedSolutions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleLaunchFullPaper = () => {
    if (!onLaunchMockTest) return;
    SoundManager.play('test_complete');
    HapticManager.triggerSuccess();
    const paperQuestions =
      selectedShift === 'all'
        ? filteredQuestions.slice(0, 75)
        : PYQ_JEE_QUESTIONS.filter((q) => q.id.includes(selectedShift));

    const title = activePaperMeta
      ? activePaperMeta.examName
      : 'JEE Mains Authentic PYQ Mock';
    onLaunchMockTest(paperQuestions, title);
  };

  const renderQuestionItem = ({ item, index }: { item: Question; index: number }) => {
    const userAnswer = selectedAnswers[item.id];
    const isAnswered = Boolean(userAnswer);
    const isSolutionVisible = Boolean(revealedSolutions[item.id]);

    const correctOpt = item.options?.find((o) => o.isCorrect);
    const isUserCorrect = isAnswered && userAnswer === correctOpt?.id;

    return (
      <Card
        style={[
          styles.questionCard,
          {
            backgroundColor: colors.card,
            borderColor: isAnswered
              ? isUserCorrect
                ? colors.success
                : colors.error
              : colors.border,
          },
        ]}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <View style={[styles.qNumBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.qNumText}>Q{index + 1}</Text>
            </View>
            <Badge
              label={item.subjectId.toUpperCase()}
              variant={
                item.subjectId === 'math'
                  ? 'primary'
                  : item.subjectId === 'physics'
                  ? 'warning'
                  : 'success'
              }
              size="sm"
            />
            <Badge
              label={item.difficulty}
              variant={
                item.difficulty === 'Hard'
                  ? 'error'
                  : item.difficulty === 'Medium'
                  ? 'warning'
                  : 'info'
              }
              size="sm"
            />
          </View>
          <Text style={[styles.originText, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.examOrigin}
          </Text>
        </View>

        {/* Question Prompt */}
        <Text style={[styles.promptText, { color: colors.text }]}>
          {item.prompt}
        </Text>

        {/* Options */}
        {item.options && item.options.length > 0 ? (
          <View style={styles.optionsList}>
            {item.options.map((opt) => {
              const isSelected = userAnswer === opt.id;
              let optBorder = colors.border;
              let optBg = colors.surface;

              if (isAnswered) {
                if (opt.isCorrect) {
                  optBorder = colors.success;
                  optBg =
                    mode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.12)';
                } else if (isSelected && !opt.isCorrect) {
                  optBorder = colors.error;
                  optBg =
                    mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.12)';
                }
              } else if (isSelected) {
                optBorder = colors.primary;
                optBg =
                  mode === 'dark' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(249, 115, 22, 0.08)';
              }

              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => handleSelectOption(item.id, opt.id)}
                  style={[
                    styles.optionRow,
                    {
                      borderColor: optBorder,
                      backgroundColor: optBg,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.optCircle,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optLetter,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {opt.id.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.optText, { color: colors.text }]}>
                    {opt.text}
                  </Text>
                  {isAnswered && opt.isCorrect && (
                    <CheckCircle2 size={16} color={colors.success} style={{ marginLeft: 'auto' }} />
                  )}
                  {isAnswered && isSelected && !opt.isCorrect && (
                    <XCircle size={16} color={colors.error} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View
            style={[
              styles.numericalNotice,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.numericalText, { color: colors.textSecondary }]}>
              Numerical Response Type Question (Integer/Decimal Answer)
            </Text>
          </View>
        )}

        {/* Bottom Actions & Solution Reveal */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            onPress={() => handleToggleSolution(item.id)}
            style={styles.solutionToggle}
          >
            <HelpCircle size={15} color={colors.primary} />
            <Text style={[styles.solutionToggleText, { color: colors.primary }]}>
              {isSolutionVisible ? 'Hide Solution' : 'View Solution'}
            </Text>
            {isSolutionVisible ? (
              <ChevronUp size={15} color={colors.primary} />
            ) : (
              <ChevronDown size={15} color={colors.primary} />
            )}
          </TouchableOpacity>

          {isAnswered && (
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: isUserCorrect ? colors.success : colors.error,
              }}
            >
              {isUserCorrect ? '✓ Correct (+4)' : '✗ Incorrect (-1)'}
            </Text>
          )}
        </View>

        {/* Revealed Solution Drawer */}
        {isSolutionVisible && (
          <View
            style={[
              styles.solutionBox,
              {
                backgroundColor:
                  mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : '#F8FAFC',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Sparkles size={14} color={colors.primary} />
              <Text style={[styles.solutionTitle, { color: colors.text }]}>
                Solution & Key Concept
              </Text>
            </View>
            <Text style={[styles.solutionBody, { color: colors.textSecondary }]}>
              {item.explanation}
            </Text>
            {correctOpt && (
              <Text style={[styles.correctHighlight, { color: colors.success }]}>
                Correct Option: ({correctOpt.id.toUpperCase()}) {correctOpt.text}
              </Text>
            )}
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Bar */}
      <View
        style={[
          styles.headerBar,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            JEE Main PYQs Vault
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            375 Authentic NTA Exam Shift Questions (2025 & 2026)
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredQuestions}
        keyExtractor={(item) => item.id}
        renderItem={renderQuestionItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerControls}>
            {/* Question Bank Source Switcher: JEE PYQ Vault vs Open Quiz Commons (CC BY-SA 4.0) */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => setBankSource('pyq')}
                style={[
                  styles.chip,
                  {
                    flex: 1,
                    alignItems: 'center',
                    backgroundColor: bankSource === 'pyq' ? colors.primary : colors.surface,
                    borderColor: bankSource === 'pyq' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: bankSource === 'pyq' ? '#FFFFFF' : colors.text }]}>
                  JEE Main PYQs ({PYQ_JEE_QUESTIONS.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setBankSource('open_commons')}
                style={[
                  styles.chip,
                  {
                    flex: 1,
                    alignItems: 'center',
                    backgroundColor: bankSource === 'open_commons' ? colors.primary : colors.surface,
                    borderColor: bankSource === 'open_commons' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: bankSource === 'open_commons' ? '#FFFFFF' : colors.text }]}>
                  Open STEM & CS ({OPEN_QUIZ_BANK.length})
                </Text>
              </TouchableOpacity>
            </View>
            {bankSource === 'open_commons' && (
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                Licensed under {OPEN_QUIZ_ATTRIBUTION.license} · {OPEN_QUIZ_ATTRIBUTION.sources.join(' & ')}
              </Text>
            )}

            {/* Hero Launch Banner */}
            <Card
              style={[
                styles.heroBanner,
                {
                  backgroundColor: mode === 'dark' ? '#1E1B4B' : '#EEF2FF',
                  borderColor: '#6366F1',
                },
              ]}
            >
              <View style={styles.heroRow}>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Trophy size={16} color="#6366F1" />
                    <Text style={[styles.heroHeadline, { color: colors.text }]}>
                      {activePaperMeta ? activePaperMeta.examName : 'Full JEE Shift Simulation'}
                    </Text>
                  </View>
                  <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
                    Practice standard 3-hour 75-question timed mock with official +4/-1 marking.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleLaunchFullPaper}
                  style={styles.heroLaunchBtn}
                  activeOpacity={0.88}
                >
                  <Play size={15} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.heroLaunchBtnText}>Start Mock</Text>
                </TouchableOpacity>
              </View>
            </Card>

            {/* Shift Picker Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              <TouchableOpacity
                onPress={() => setSelectedShift('all')}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      selectedShift === 'all' ? colors.primary : colors.surface,
                    borderColor:
                      selectedShift === 'all' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: selectedShift === 'all' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  All Shifts (375)
                </Text>
              </TouchableOpacity>
              {PYQ_PAPERS_CATALOG.map((paper) => {
                const isSelected = selectedShift === paper.shiftCode;
                return (
                  <TouchableOpacity
                    key={paper.shiftCode}
                    onPress={() => setSelectedShift(paper.shiftCode)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {paper.shiftLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Subject Filters */}
            <View style={styles.subjectFilterRow}>
              {(['all', 'math', 'physics', 'chemistry'] as const).map((sub) => {
                const isSelected = selectedSubject === sub;
                const label =
                  sub === 'all'
                    ? 'All Subjects'
                    : sub === 'math'
                    ? 'Mathematics'
                    : sub === 'physics'
                    ? 'Physics'
                    : 'Chemistry';
                return (
                  <TouchableOpacity
                    key={sub}
                    onPress={() => setSelectedSubject(sub)}
                    style={[
                      styles.subPill,
                      {
                        backgroundColor: isSelected
                          ? mode === 'dark'
                            ? '#2A1711'
                            : '#FFEDD5'
                          : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.subPillText,
                        { color: isSelected ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Keyword Search Bar */}
            <View
              style={[
                styles.searchBar,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Search size={16} color={colors.textSecondary} />
              <TextInput
                placeholder="Search PYQs by formula, concept or keyword..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, { color: colors.text }]}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.countRow}>
              <Text style={[styles.countText, { color: colors.textSecondary }]}>
                Showing <Text style={{ fontWeight: '800', color: colors.text }}>{filteredQuestions.length}</Text> authentic questions
              </Text>
            </View>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  listContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  headerControls: {
    gap: 12,
    marginBottom: 6,
  },
  heroBanner: {
    padding: 14,
    borderWidth: 1.5,
    borderRadius: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroHeadline: {
    fontSize: 14,
    fontWeight: '800',
  },
  heroSub: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  heroLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  heroLaunchBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subjectFilterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  subPill: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
  },
  subPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  countRow: {
    marginTop: -2,
    marginBottom: 4,
  },
  countText: {
    fontSize: 12,
  },
  questionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  qNumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  qNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  originText: {
    fontSize: 11,
    flexShrink: 1,
  },
  promptText: {
    fontSize: 14.5,
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 14,
  },
  optionsList: {
    gap: 8,
    marginBottom: 14,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  optCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optLetter: {
    fontSize: 11,
    fontWeight: '800',
  },
  optText: {
    fontSize: 13.5,
    fontWeight: '600',
    flex: 1,
  },
  numericalNotice: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  numericalText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  solutionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  solutionToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  solutionBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  solutionTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  solutionBody: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 6,
  },
  correctHighlight: {
    fontSize: 12,
    fontWeight: '800',
  },
});

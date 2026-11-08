import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SAMPLE_QUESTIONS } from '../data/curriculumData';
import { StorageService } from '../services/storage';
import { CelebrationManager } from '../services/celebrationManager';
import { SoundManager } from '../services/soundManager';
import { HapticManager } from '../services/hapticManager';
import { CelebrationOverlay } from '../components/celebration/CelebrationOverlay';
import { MathRenderer } from '../components/common/MathRenderer';
import { CelebrationEvent, TestAttempt } from '../types';
import { 
  Bookmark, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Award
} from 'lucide-react-native';

export const TestEngineScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [numericalInput, setNumericalInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [celebrationEvent, setCelebrationEvent] = useState<CelebrationEvent | null>(null);

  const questions = SAMPLE_QUESTIONS;
  const currentQ = questions[currentIdx];

  useEffect(() => {
    StorageService.getBookmarkedIds().then(setBookmarkedIds);
  }, []);

  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const toggleBookmark = async (qId: string) => {
    HapticManager.triggerSelection();
    const updated = await StorageService.toggleBookmark(qId);
    setBookmarkedIds(updated);
  };

  const handleSelectOption = (optId: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: optId }));

    // Instant digital cyber feedback in practice mode
    if (isPracticeMode) {
      const isCorrect = currentQ.options?.find((o) => o.id === optId)?.isCorrect;
      if (isCorrect) {
        SoundManager.play('correct');
        HapticManager.triggerSuccess();
      } else {
        SoundManager.play('incorrect');
        HapticManager.triggerError();
      }
    } else {
      HapticManager.triggerSelection();
    }
  };

  const handleSaveNumerical = () => {
    const val = parseFloat(numericalInput);
    if (!isNaN(val)) {
      setUserAnswers((prev) => ({ ...prev, [currentQ.id]: val }));
      HapticManager.triggerSelection();
    }
  };

  const handleSubmitTest = async () => {
    if (isSubmitted || isSubmitting) return;
    setIsSubmitting(true);
    setIsSubmitted(true);
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (ans === undefined) {
        unattempted++;
      } else if (q.type === 'single_mcq') {
        const correctOpt = q.options?.find((o) => o.isCorrect)?.id;
        if (ans === correctOpt) correct++;
        else incorrect++;
      } else if (q.type === 'numerical') {
        if (typeof ans === 'number' && Math.abs(ans - (q.numericalAnswer || 0)) <= (q.numericalTolerance || 0.1)) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

    const total = questions.length;
    const score = correct * 4 - incorrect * 1;
    const maxScore = total * 4;
    const percentage = parseFloat(((Math.max(0, score) / maxScore) * 100).toFixed(1));

    const attempt: TestAttempt = {
      id: 'att_' + Date.now(),
      testTitle: 'High-Yield Chapter Drill',
      mode: isPracticeMode ? 'untimed' : 'timed',
      totalQuestions: total,
      timeSpentSeconds: secondsElapsed,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unattempted,
      score,
      maxScore,
      percentage,
      date: new Date().toISOString(),
      answers: userAnswers,
    };

    // 1. Persist attempt
    await StorageService.saveTestAttempt(attempt);

    // 2. Trigger Cyber Celebration Suite
    try {
      const event = await CelebrationManager.evaluateAndCelebrate(attempt);
      setCelebrationEvent(event);
    } catch {
      // Graceful fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);
    setSecondsElapsed(0);
    setNumericalInput('');
  };

  // Format time MM:SS
  const mins = Math.floor(secondsElapsed / 60);
  const secs = secondsElapsed % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const isCurrentBookmarked = bookmarkedIds.includes(currentQ.id);

  // Score summary if submitted
  const correctCount = questions.filter((q) => {
    const ans = userAnswers[q.id];
    if (q.type === 'single_mcq') return ans === q.options?.find((o) => o.isCorrect)?.id;
    if (q.type === 'numerical') return typeof ans === 'number' && Math.abs(ans - (q.numericalAnswer || 0)) <= 0.1;
    return false;
  }).length;

  const attemptedCount = Object.keys(userAnswers).length;
  const incorrectCount = attemptedCount - correctCount;
  const totalScore = correctCount * 4 - incorrectCount * 1;
  const maxPossible = questions.length * 4;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Test Header */}
      <View style={[styles.topHeader, { backgroundColor: colors.card, borderBottomColor: colors.borderSubtle }]}>
        <View>
          <Text style={[styles.testHeading, { color: colors.text }]}>Practice Drill</Text>
          <Text style={[styles.testSubheading, { color: colors.textSecondary }]}>
            Question {currentIdx + 1} of {questions.length}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={[styles.timerBadge, { backgroundColor: mode === 'dark' ? '#1E293B' : '#F1F5F9' }]}>
            <Clock size={14} color={colors.primary} />
            <Text style={[styles.timerText, { color: colors.text }]}>{timeStr}</Text>
          </View>

          <TouchableOpacity
            onPress={() => toggleBookmark(currentQ.id)}
            style={[styles.bookmarkBtn, isCurrentBookmarked && { backgroundColor: '#FFEDD5' }]}
          >
            <Bookmark
              size={18}
              color={isCurrentBookmarked ? colors.primary : colors.textSecondary}
              fill={isCurrentBookmarked ? colors.primary : 'none'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Question Number Pills Carousel */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
        {questions.map((q, idx) => {
          const isSelected = currentIdx === idx;
          const isAnswered = userAnswers[q.id] !== undefined;

          let pillBg = colors.card;
          if (isSelected) pillBg = colors.primary;
          else if (isAnswered) pillBg = mode === 'dark' ? '#064E3B' : '#DCFCE7';

          return (
            <TouchableOpacity
              key={q.id}
              onPress={() => {
                setCurrentIdx(idx);
                setNumericalInput(userAnswers[q.id]?.toString() || '');
              }}
              style={[
                styles.navPill,
                {
                  backgroundColor: pillBg,
                  borderColor: isSelected ? colors.primary : colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.navPillText,
                  {
                    color: isSelected ? '#FFFFFF' : isAnswered ? colors.success : colors.textSecondary,
                  },
                ]}
              >
                {idx + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Main Question Scroll Area */}
      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Result Banner if submitted */}
        {isSubmitted && (
          <Card style={[styles.resultCard, { backgroundColor: mode === 'dark' ? '#1E293B' : '#FFF7ED', borderColor: colors.primary }]}>
            <View style={styles.resultRow}>
              <Award size={32} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.resultScore, { color: colors.primary }]}>
                  Score: {totalScore} / {maxPossible} ({((Math.max(0, totalScore) / maxPossible) * 100).toFixed(0)}%)
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <Text style={[styles.resultStats, { color: colors.success }]}>
                    ● {correctCount} Correct
                  </Text>
                  <Text style={[styles.resultStats, { color: colors.error }]}>
                    ● {incorrectCount} Incorrect
                  </Text>
                  <Text style={[styles.resultStats, { color: colors.textSecondary }]}>
                    ● {questions.length - attemptedCount} Skipped
                  </Text>
                </View>
              </View>
              <Button title="Retake" variant="outline" size="sm" onPress={handleRestart} />
            </View>
          </Card>
        )}

        {/* Question Metadata */}
        <View style={styles.qMetaRow}>
          <Badge label={currentQ.subjectId.toUpperCase()} variant="primary" size="sm" />
          <Badge label={currentQ.difficulty} variant={currentQ.difficulty === 'Easy' ? 'success' : currentQ.difficulty === 'Hard' ? 'error' : 'warning'} size="sm" />
          {currentQ.examOrigin && (
            <Badge label={currentQ.examOrigin} variant="neutral" size="sm" />
          )}
        </View>

        {/* Question Prompt Card */}
        <Card style={styles.promptCard}>
          <Text style={[styles.promptText, { color: colors.text }]}>{currentQ.prompt}</Text>
          {currentQ.prompt.includes('\\') && (
            <MathRenderer math={currentQ.prompt} displayMode={true} />
          )}
        </Card>

        {/* Option Selection Area */}
        {currentQ.type === 'single_mcq' && currentQ.options ? (
          <View style={styles.optionsList}>
            {currentQ.options.map((opt) => {
              const isSelected = userAnswers[currentQ.id] === opt.id;
              const showResult = isSubmitted || (isPracticeMode && isSelected);
              const isCorrectOpt = opt.isCorrect;

              let optBg = colors.card;
              let optBorder = colors.borderSubtle;
              if (showResult && isCorrectOpt) {
                optBg = mode === 'dark' ? '#064E3B' : '#DCFCE7';
                optBorder = colors.success;
              } else if (showResult && isSelected && !isCorrectOpt) {
                optBg = mode === 'dark' ? '#7F1D1D' : '#FEE2E2';
                optBorder = colors.error;
              } else if (isSelected) {
                optBg = mode === 'dark' ? '#431407' : '#FFEDD5';
                optBorder = colors.primary;
              }

              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.75}
                  disabled={isSubmitted}
                  onPress={() => handleSelectOption(opt.id)}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: optBg,
                      borderColor: optBorder,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? colors.primary : colors.textSecondary,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.optionText, { color: colors.text }]}>{opt.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          /* Numerical Question Input */
          <Card style={styles.numericalCard}>
            <Text style={[styles.numericalLabel, { color: colors.textSecondary }]}>Enter Numerical Value:</Text>
            <View style={styles.numericalInputRow}>
              <TextInput
                style={[styles.numInput, { color: colors.text, borderColor: colors.primary }]}
                keyboardType="numeric"
                placeholder="e.g. 4.0"
                placeholderTextColor={colors.textSecondary}
                value={numericalInput}
                onChangeText={setNumericalInput}
                onBlur={handleSaveNumerical}
              />
              <Button title="Save" size="sm" onPress={handleSaveNumerical} />
            </View>
          </Card>
        )}

        {/* Step-by-Step Explanation Sheet */}
        {(isSubmitted || (isPracticeMode && userAnswers[currentQ.id] !== undefined)) && (
          <Card style={[styles.explanationCard, { backgroundColor: mode === 'dark' ? '#1E293B' : '#F8FAFC', borderColor: colors.border }]}>
            <View style={styles.explanationHeader}>
              <Sparkles size={16} color={colors.primary} />
              <Text style={[styles.explanationHeading, { color: colors.primary }]}>Step-by-Step Solution</Text>
            </View>
            <Text style={[styles.explanationText, { color: colors.text }]}>{currentQ.explanation}</Text>
            {currentQ.explanation.includes('\\') && (
              <MathRenderer math={currentQ.explanation} displayMode={true} />
            )}
          </Card>
        )}
      </ScrollView>

      {/* Bottom Action Footer */}
      <View style={[styles.footerBar, { backgroundColor: colors.card, borderTopColor: colors.borderSubtle }]}>
        <Button
          title="Previous"
          variant="outline"
          size="sm"
          disabled={currentIdx === 0}
          onPress={() => {
            setCurrentIdx((i) => Math.max(0, i - 1));
            setNumericalInput(userAnswers[questions[currentIdx - 1]?.id]?.toString() || '');
          }}
          icon={<ChevronLeft size={16} color={colors.primary} />}
        />

        {currentIdx < questions.length - 1 ? (
          <Button
            title="Next"
            size="sm"
            onPress={() => {
              setCurrentIdx((i) => Math.min(questions.length - 1, i + 1));
              setNumericalInput(userAnswers[questions[currentIdx + 1]?.id]?.toString() || '');
            }}
            icon={<ChevronRight size={16} color="#FFFFFF" />}
          />
        ) : !isSubmitted ? (
          <Button
            title="Submit Test"
            variant="primary"
            size="sm"
            onPress={handleSubmitTest}
            icon={<CheckCircle2 size={16} color="#FFFFFF" />}
          />
        ) : (
          <Button
            title="Review Score"
            variant="secondary"
            size="sm"
            onPress={handleRestart}
            icon={<RotateCcw size={16} color="#FFFFFF" />}
          />
        )}
      </View>

      {/* Signature Study Labs Cyber Celebration Overlay */}
      <CelebrationOverlay
        event={celebrationEvent}
        onClose={() => setCelebrationEvent(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  testHeading: {
    fontSize: 16,
    fontWeight: '800',
  },
  testSubheading: {
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  bookmarkBtn: {
    padding: 6,
    borderRadius: 8,
  },
  pillScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 46,
  },
  navPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 6,
  },
  navPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollArea: {
    padding: 16,
    paddingBottom: 80,
  },
  resultCard: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultScore: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  resultStats: {
    fontSize: 12,
  },
  qMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  promptCard: {
    padding: 16,
    marginBottom: 14,
  },
  promptText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  optionsList: {
    gap: 10,
    marginBottom: 14,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  optionText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  numericalCard: {
    padding: 16,
    marginBottom: 14,
  },
  numericalLabel: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
  },
  numericalInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  numInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '700',
  },
  explanationCard: {
    padding: 16,
    borderWidth: 1,
    marginTop: 6,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  explanationHeading: {
    fontSize: 14,
    fontWeight: '700',
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 20,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
});


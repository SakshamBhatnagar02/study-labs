import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SAMPLE_QUESTIONS, SUBJECTS } from '../data/curriculumData';
import { DEFAULT_QUESTION_VIEW_SETTINGS, StorageService } from '../services/storage';
import { SupabaseService } from '../services/supabase';
import { GeminiAIService } from '../services/gemini';
import { CelebrationManager } from '../services/celebrationManager';
import { SoundManager } from '../services/soundManager';
import { HapticManager } from '../services/hapticManager';
import { CelebrationOverlay } from '../components/celebration/CelebrationOverlay';
import { RichMathText } from '../components/common/MathRenderer';
import { getLatestQuestionStatusMap } from '../utils/activityStats';
import { convertPlainTextToLatex } from '../utils/noteLatexConverter';
import { CustomQuestionLimit, filterCustomQuestions } from '../utils/customTestBuilder';
import {
  CelebrationEvent,
  CustomNotebook,
  CustomTestConfig,
  HintCategory,
  Question,
  QuestionAttemptStat,
  QuestionDifficulty,
  QuestionHint,
  QuestionTextSize,
  QuestionViewSettings,
  SubjectId,
  TestAttempt,
  TestSessionLaunch,
} from '../types';
import {
  Award,
  BarChart2,
  BookMarked,
  Bookmark,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  FileEdit,
  Filter,
  FunctionSquare,
  Lightbulb,
  Pause,
  Play,
  PlusCircle,
  RotateCcw,
  Settings,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react-native';

export interface AskAITutorPayload {
  prompt: string;
  difficulty: QuestionDifficulty;
  subject: string;
  nonce: number;
}

interface TestEngineScreenProps {
  onAskAI?: (payload: AskAITutorPayload) => void;
  initialSession?: TestSessionLaunch | null;
  openBuilderNonce?: number;
  onBuilderOpened?: () => void;
}

function getHintsForQuestion(q: Question): QuestionHint[] {
  if (q.hints && q.hints.length > 0) return q.hints;
  return [
    {
      id: `${q.id}_concept`,
      category: 'concept',
      title: 'Core Principle',
      content: `Identify the fundamental law governing this ${q.subjectId} problem before substituting numerical values.`,
    },
    {
      id: `${q.id}_formula`,
      category: 'formula',
      title: 'Key Formula',
      content: `Relate the given parameters symbolically in consistent SI units.`,
    },
    {
      id: `${q.id}_strategy`,
      category: 'strategy',
      title: 'First Step',
      content: `Isolate the target variable cleanly and verify extreme/limiting cases.`,
    },
  ];
}

const HINT_META: Record<
  HintCategory,
  { shortLabel: string; accentDark: string; accentLight: string }
> = {
  concept: {
    shortLabel: 'Concept',
    accentDark: '#22D3EE',
    accentLight: '#0284C7',
  },
  formula: {
    shortLabel: 'Formula',
    accentDark: '#FACC15',
    accentLight: '#D97706',
  },
  strategy: {
    shortLabel: 'Strategy',
    accentDark: '#A855F7',
    accentLight: '#7C3AED',
  },
};

const TEXT_SIZE_MAP: Record<QuestionTextSize, { prompt: number; option: number; solution: number }> = {
  small: { prompt: 13.5, option: 13, solution: 12.5 },
  medium: { prompt: 15, option: 14.5, solution: 14 },
  large: { prompt: 17, option: 16, solution: 15.5 },
  xlarge: { prompt: 19, option: 17.5, solution: 17 },
};

export const TestEngineScreen: React.FC<TestEngineScreenProps> = ({
  onAskAI,
  initialSession,
  openBuilderNonce,
  onBuilderOpened,
}) => {
  const { colors, mode } = useTheme();

  // Active deck & session title
  const [sessionTitle, setSessionTitle] = useState('Study Labs Practice Bank');
  const [activeQuestionIds, setActiveQuestionIds] = useState<string[]>(
    SAMPLE_QUESTIONS.map((q) => q.id)
  );
  const [currentIdx, setCurrentIdx] = useState(0);

  // Separate draft selection vs explicitly submitted answer per question
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string | number>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, string | number>>({});
  const [numericalInputs, setNumericalInputs] = useState<Record<string, string>>({});
  const [numericalError, setNumericalError] = useState<string | null>(null);

  // Progressive & categorized hints revealed per question
  const [revealedHintsByQ, setRevealedHintsByQ] = useState<Record<string, HintCategory[]>>({});
  const [hintsCollapsed, setHintsCollapsed] = useState<boolean>(false);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [questionSeconds, setQuestionSeconds] = useState<Record<string, number>>({});
  const [timerRunning, setTimerRunning] = useState(true);

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [notebooks, setNotebooks] = useState<CustomNotebook[]>([]);
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>({});
  const [noteEditorOpen, setNoteEditorOpen] = useState<boolean>(false);
  const [noteShowEditor, setNoteShowEditor] = useState<boolean>(true);
  const [noteDraft, setNoteDraft] = useState<string>('');
  const [noteFeedback, setNoteFeedback] = useState<string | null>(null);

  const [viewSettings, setViewSettings] = useState<QuestionViewSettings>(
    DEFAULT_QUESTION_VIEW_SETTINGS
  );
  const [priorStatusMap, setPriorStatusMap] = useState<Record<string, QuestionAttemptStat>>({});
  const [savedCustomTests, setSavedCustomTests] = useState<CustomTestConfig[]>([]);
  const [extraQuestions, setExtraQuestions] = useState<Question[]>([]);

  // Modals
  const [viewSettingsOpen, setViewSettingsOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [notebookPickerOpen, setNotebookPickerOpen] = useState(false);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [builderFeedback, setBuilderFeedback] = useState<string | null>(null);
  const [celebrationEvent, setCelebrationEvent] = useState<CelebrationEvent | null>(null);

  // Custom Test Builder Draft State (unselected by default so user chooses freely)
  const [customTitle, setCustomTitle] = useState('');
  const [customSubjects, setCustomSubjects] = useState<SubjectId[]>([]);
  const [customDifficulties, setCustomDifficulties] = useState<QuestionDifficulty[]>([]);
  const [customStatusFilter, setCustomStatusFilter] = useState<'all' | 'unattempted' | 'mistakes'>('all');
  const [customQuestionLimit, setCustomQuestionLimit] = useState<CustomQuestionLimit>(5);
  const [customMode, setCustomMode] = useState<'practice' | 'exam'>('practice');

  const mainScrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const allQuestions = useMemo(() => {
    const map = new Map<string, Question>();
    for (const q of SAMPLE_QUESTIONS) map.set(q.id, q);
    for (const q of extraQuestions) map.set(q.id, q);
    return Array.from(map.values());
  }, [extraQuestions]);

  const questions = useMemo(() => {
    const picked = activeQuestionIds
      .map((id) => allQuestions.find((q) => q.id === id))
      .filter((q): q is Question => Boolean(q));
    return picked.length > 0 ? picked : SAMPLE_QUESTIONS;
  }, [activeQuestionIds, allQuestions]);

  const safeIdx = Math.min(currentIdx, Math.max(0, questions.length - 1));
  const currentQ = questions[safeIdx];
  const currentHints = getHintsForQuestion(currentQ);
  const revealedCategories = revealedHintsByQ[currentQ.id] || [];

  const priorStat = priorStatusMap[currentQ.id];
  const showReopenSolution =
    viewSettings.solutionModeOnReopen && Boolean(priorStat) && submittedAnswers[currentQ.id] === undefined;

  const isQuestionSubmitted =
    submittedAnswers[currentQ.id] !== undefined || isSubmitted || showReopenSolution;
  const currentDraft = draftAnswers[currentQ.id];
  const currentSubmitted =
    submittedAnswers[currentQ.id] !== undefined
      ? submittedAnswers[currentQ.id]
      : showReopenSolution
      ? priorStat?.selectedAnswer
      : undefined;
  const activeSelection = isQuestionSubmitted ? currentSubmitted : currentDraft;
  const currentNumInput = numericalInputs[currentQ.id] ?? '';

  const fontSizes = TEXT_SIZE_MAP[viewSettings.textSize] || TEXT_SIZE_MAP.medium;

  const loadPersistedState = useCallback(async () => {
    const [bms, nbs, notes, qSettings, logs, cTests, localCustomQs, cloudQs] =
      await Promise.all([
        StorageService.getBookmarkedIds(),
        StorageService.getNotebooks(),
        StorageService.getQuestionNotes(),
        StorageService.getQuestionViewSettings(),
        StorageService.getAttemptLogs(),
        StorageService.getCustomTests(),
        StorageService.getCustomQuestions(),
        SupabaseService.fetchQuestions().catch(() => [] as Question[]),
      ]);
    setBookmarkedIds(bms);
    setNotebooks(nbs);
    setQuestionNotes(notes);
    setViewSettings(qSettings);
    setTimerRunning(qSettings.autoStartTimer);
    setPriorStatusMap(getLatestQuestionStatusMap(logs));
    setSavedCustomTests(cTests);
    setExtraQuestions([...cloudQs, ...localCustomQs]);
  }, []);

  useEffect(() => {
    loadPersistedState();
  }, [loadPersistedState]);

  const openCustomBuilderModal = useCallback(() => {
    setCustomTitle('');
    setCustomSubjects([]);
    setCustomDifficulties([]);
    setCustomStatusFilter('all');
    setCustomQuestionLimit(5);
    setBuilderFeedback(null);
    setBuilderOpen(true);
  }, []);

  // Respond to external session launch (e.g. Chapter Practice, Mistakes, Notebook, Custom Drill)
  useEffect(() => {
    if (!initialSession) return;
    setSessionTitle(initialSession.title);
    setActiveQuestionIds(
      initialSession.questionIds.length > 0
        ? initialSession.questionIds
        : SAMPLE_QUESTIONS.map((q) => q.id)
    );
    setIsPracticeMode(initialSession.mode === 'practice');
    setDraftAnswers({});
    setSubmittedAnswers({});
    setNumericalInputs({});
    setNumericalError(null);
    setRevealedHintsByQ({});
    setHintsCollapsed(false);
    setIsSubmitted(false);
    setSecondsElapsed(0);
    setQuestionSeconds({});
    setCurrentIdx(initialSession.initialQuestionIndex || 0);
    setTimerRunning(viewSettings.autoStartTimer);
  }, [initialSession?.nonce]);

  // Respond to external trigger to open Custom Test Builder modal
  useEffect(() => {
    if (openBuilderNonce && openBuilderNonce > 0) {
      openCustomBuilderModal();
      onBuilderOpened?.();
    }
  }, [openBuilderNonce, onBuilderOpened, openCustomBuilderModal]);

  // Sync draft note input when switching questions
  useEffect(() => {
    setNoteDraft(questionNotes[currentQ.id] || '');
    setNoteFeedback(null);
  }, [currentQ.id, questionNotes]);

  // Live session + per-question timer
  useEffect(() => {
    if (isSubmitted || !timerRunning) return;
    const interval = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
      setQuestionSeconds((prev) => ({
        ...prev,
        [currentQ.id]: (prev[currentQ.id] || 0) + 1,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, timerRunning, currentQ.id]);

  const navigateToQuestion = (nextIndex: number) => {
    const targetQ = questions[nextIndex];
    if (currentQ.type === 'single_mcq' || targetQ?.type === 'single_mcq') {
      SoundManager.playClick();
    }
    setCurrentIdx(nextIndex);
    setNumericalError(null);
    setHintsCollapsed(false);
    setTimerRunning(viewSettings.autoStartTimer);
    setTimeout(() => {
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    }, 16);
  };

  const toggleBookmark = async (qId: string) => {
    HapticManager.triggerSelection();
    const updated = await StorageService.toggleBookmark(qId);
    setBookmarkedIds(updated);
  };

  const handleToggleNotebookQuestion = async (notebookId: string, qId: string) => {
    HapticManager.triggerSelection();
    const updated = await StorageService.toggleQuestionInNotebook(notebookId, qId);
    setNotebooks(updated);
  };

  const updateViewSetting = async <K extends keyof QuestionViewSettings>(
    key: K,
    value: QuestionViewSettings[K]
  ) => {
    const updated = await StorageService.saveQuestionViewSettings({ [key]: value });
    setViewSettings(updated);
    if (key === 'autoStartTimer') {
      setTimerRunning(Boolean(value));
    }
  };

  const handleResetViewSettings = async () => {
    const reset = await StorageService.resetQuestionViewSettings();
    setViewSettings(reset);
    setTimerRunning(reset.autoStartTimer);
  };

  const evaluateAnswer = (q: Question, ans: string | number): boolean => {
    if (q.type === 'single_mcq') {
      return Boolean(q.options?.find((o) => o.id === ans)?.isCorrect);
    }
    if (q.type === 'numerical' && typeof ans === 'number') {
      return Math.abs(ans - (q.numericalAnswer || 0)) <= (q.numericalTolerance || 0.1);
    }
    return false;
  };

  const commitQuestionAttempt = async (q: Question, finalAnswer: string | number) => {
    setSubmittedAnswers((prev) => ({ ...prev, [q.id]: finalAnswer }));
    const isCorrect = evaluateAnswer(q, finalAnswer);
    const spent = Math.max(5, questionSeconds[q.id] || 20);

    // Persist attempt log to power Daily Goal, Heatmap, Difficulty Charts & 7-Day Leaderboard
    const logs = await StorageService.recordQuestionAttempt({
      questionId: q.id,
      subjectId: q.subjectId,
      chapterId: q.chapterId,
      difficulty: q.difficulty,
      isCorrect,
      timeSpentSeconds: spent,
      selectedAnswer: finalAnswer,
      attemptedAt: new Date().toISOString(),
    });
    setPriorStatusMap(getLatestQuestionStatusMap(logs));

    if (isPracticeMode) {
      if (isCorrect) {
        if (viewSettings.playSounds) SoundManager.play('correct');
        HapticManager.triggerSuccess();
      } else {
        if (viewSettings.playSounds) SoundManager.play('incorrect');
        HapticManager.triggerError();
      }
    } else {
      if (viewSettings.playSounds) SoundManager.play('notify');
      HapticManager.triggerSelection();
    }
  };

  const handleSelectOption = (optId: string) => {
    if (isQuestionSubmitted) return;
    setDraftAnswers((prev) => ({ ...prev, [currentQ.id]: optId }));
    HapticManager.triggerSelection();
    if (!viewSettings.deferCorrectAnswer && isPracticeMode) {
      void commitQuestionAttempt(currentQ, optId);
    } else if (currentQ.type === 'single_mcq') {
      SoundManager.playClick();
    }
  };

  const handleClearSelection = () => {
    if (isQuestionSubmitted) return;
    if (currentQ.type === 'single_mcq') {
      SoundManager.playClick();
    }
    setDraftAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
    if (currentQ.type === 'numerical') {
      setNumericalInputs((prev) => ({ ...prev, [currentQ.id]: '' }));
    }
    setNumericalError(null);
    HapticManager.triggerSelection();
  };

  const handleNumericalChange = (text: string) => {
    if (isQuestionSubmitted) return;
    setNumericalInputs((prev) => ({ ...prev, [currentQ.id]: text }));
    setNumericalError(null);
    const parsed = parseFloat(text.trim());
    if (text.trim() !== '' && !isNaN(parsed)) {
      setDraftAnswers((prev) => ({ ...prev, [currentQ.id]: parsed }));
    } else {
      setDraftAnswers((prev) => {
        const next = { ...prev };
        delete next[currentQ.id];
        return next;
      });
    }
  };

  const handleSubmitSingleQuestion = () => {
    if (isQuestionSubmitted) return;

    let finalAnswer: string | number | undefined = draftAnswers[currentQ.id];

    if (currentQ.type === 'numerical') {
      const parsed = parseFloat((numericalInputs[currentQ.id] || '').trim());
      if (isNaN(parsed)) {
        setNumericalError('Enter a valid number before submitting.');
        HapticManager.triggerError();
        return;
      }
      finalAnswer = parsed;
    }

    if (finalAnswer === undefined) return;
    void commitQuestionAttempt(currentQ, finalAnswer);
  };

  const handleSaveMyNote = async () => {
    const updated = await StorageService.saveQuestionNote(currentQ.id, noteDraft);
    setQuestionNotes(updated);
    setNoteFeedback('Saved!');
    SoundManager.play('notify');
    HapticManager.triggerSuccess();
  };

  const handleConvertNoteToLatex = async () => {
    if (!noteDraft.trim()) return;
    const converted = convertPlainTextToLatex(noteDraft);
    setNoteDraft(converted);
    const updated = await StorageService.saveQuestionNote(currentQ.id, converted);
    setQuestionNotes(updated);
    setNoteFeedback(
      converted === noteDraft ? 'Already LaTeX-formatted!' : 'Converted to LaTeX & Saved!'
    );
    HapticManager.triggerSuccess();
  };

  const revealHintCategory = (category: HintCategory) => {
    setHintsCollapsed(false);
    setRevealedHintsByQ((prev) => {
      const existing = prev[currentQ.id] || [];
      if (existing.includes(category)) return prev;
      if (viewSettings.playSounds) SoundManager.play('hint');
      HapticManager.triggerSelection();
      return { ...prev, [currentQ.id]: [...existing, category] };
    });
  };

  const handleShowNextHint = () => {
    setHintsCollapsed(false);
    const nextHint = currentHints.find((h) => !revealedCategories.includes(h.category));
    if (nextHint) {
      revealHintCategory(nextHint.category);
    } else {
      setHintsCollapsed((c) => !c);
    }
  };

  const handleSubmitTest = async () => {
    if (isSubmitted || isSubmittingTest) return;
    setIsSubmittingTest(true);

    const mergedAnswers: Record<string, string | number> = {
      ...draftAnswers,
      ...submittedAnswers,
    };
    setSubmittedAnswers(mergedAnswers);
    setIsSubmitted(true);

    // Record any newly drafted-at-submit answers into activity logs
    for (const q of questions) {
      if (submittedAnswers[q.id] === undefined && draftAnswers[q.id] !== undefined) {
        const ans = draftAnswers[q.id];
        await StorageService.recordQuestionAttempt({
          questionId: q.id,
          subjectId: q.subjectId,
          chapterId: q.chapterId,
          difficulty: q.difficulty,
          isCorrect: evaluateAnswer(q, ans),
          timeSpentSeconds: Math.max(8, questionSeconds[q.id] || 25),
          selectedAnswer: ans,
          attemptedAt: new Date().toISOString(),
        });
      }
    }

    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    questions.forEach((q) => {
      const ans = mergedAnswers[q.id];
      if (ans === undefined) unattempted++;
      else if (evaluateAnswer(q, ans)) correct++;
      else incorrect++;
    });

    const total = questions.length;
    const score = correct * 4 - incorrect * 1;
    const maxScore = total * 4;
    const percentage = parseFloat(((Math.max(0, score) / maxScore) * 100).toFixed(1));

    const attempt: TestAttempt = {
      id: 'att_' + Date.now(),
      testTitle: sessionTitle || (isPracticeMode ? 'Chapter Drill' : 'Timed Exam Simulation'),
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
      answers: mergedAnswers,
    };

    await StorageService.saveTestAttempt(attempt);
    await loadPersistedState();

    try {
      const event = await CelebrationManager.evaluateAndCelebrate(attempt);
      setCelebrationEvent(event);
    } catch {
      // Graceful fallback
    } finally {
      setIsSubmittingTest(false);
    }
  };

  const handleRestart = () => {
    setDraftAnswers({});
    setSubmittedAnswers({});
    setNumericalInputs({});
    setNumericalError(null);
    setRevealedHintsByQ({});
    setHintsCollapsed(false);
    setIsSubmitted(false);
    setSecondsElapsed(0);
    setQuestionSeconds({});
    setCurrentIdx(0);
    setTimerRunning(viewSettings.autoStartTimer);
    setTimeout(() => {
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    }, 16);
  };

  // Builder Matching Questions (uses unified local + cloud + AI bank with limit)
  const { filteredPool, builderMatches } = useMemo(() => {
    const allMatches = filterCustomQuestions(
      allQuestions,
      {
        subjectIds: customSubjects,
        difficulties: customDifficulties,
        statusFilter: customStatusFilter,
        limit: 'all',
      },
      priorStatusMap
    );
    const capped = filterCustomQuestions(
      allQuestions,
      {
        subjectIds: customSubjects,
        difficulties: customDifficulties,
        statusFilter: customStatusFilter,
        limit: customQuestionLimit,
      },
      priorStatusMap
    );
    return { filteredPool: allMatches, builderMatches: capped };
  }, [
    allQuestions,
    customSubjects,
    customDifficulties,
    customStatusFilter,
    customQuestionLimit,
    priorStatusMap,
  ]);

  const handleLaunchCustomTest = async () => {
    if (builderMatches.length === 0) return;
    const title =
      customTitle.trim() ||
      `Custom ${customSubjects.map((s) => s.toUpperCase()).join(' + ')} Mix`;
    const newConfig: CustomTestConfig = {
      id: 'ct_' + Date.now(),
      title,
      subjectIds: customSubjects,
      difficulties: customDifficulties,
      questionIds: builderMatches.map((q) => q.id),
      mode: customMode,
      durationMinutes: Math.max(5, builderMatches.length * 3),
      createdAt: new Date().toISOString(),
    };
    const updated = await StorageService.saveCustomTest(newConfig);
    setSavedCustomTests(updated);
    setBuilderOpen(false);
    setSessionTitle(title);
    setActiveQuestionIds(newConfig.questionIds);
    setIsPracticeMode(customMode === 'practice');
    setDraftAnswers({});
    setSubmittedAnswers({});
    setNumericalInputs({});
    setNumericalError(null);
    setRevealedHintsByQ({});
    setHintsCollapsed(false);
    setIsSubmitted(false);
    setSecondsElapsed(0);
    setQuestionSeconds({});
    setCurrentIdx(0);
    setTimerRunning(viewSettings.autoStartTimer);
    SoundManager.play('notify');
    HapticManager.triggerSuccess();
  };

  const handleGenerateAndLaunchCustomTest = async () => {
    if (customSubjects.length === 0 || customDifficulties.length === 0 || isGeneratingCustom) {
      return;
    }
    setIsGeneratingCustom(true);
    setBuilderFeedback(null);
    try {
      const settings = await StorageService.getSettings();
      const count = customQuestionLimit === 'all' ? 6 : Math.min(10, customQuestionLimit);
      const res = await GeminiAIService.generateCustomQuestions({
        subjectIds: customSubjects,
        difficulties: customDifficulties,
        count,
        topicHint: customTitle.trim() || undefined,
        reasoningMode: settings.aiReasoningPower || 'auto',
      });
      if (res.questions.length === 0) {
        setBuilderFeedback('Select at least 1 subject and 1 difficulty first.');
        return;
      }

      const mergedSaved = await StorageService.saveCustomQuestions(res.questions);
      setExtraQuestions((prev) => {
        const map = new Map<string, Question>();
        for (const q of prev) map.set(q.id, q);
        for (const q of mergedSaved) map.set(q.id, q);
        return Array.from(map.values());
      });

      const title =
        customTitle.trim() ||
        `AI Custom ${customSubjects.map((s) => s.toUpperCase()).join(' + ')} Mix`;
      const newConfig: CustomTestConfig = {
        id: 'ct_' + Date.now(),
        title,
        subjectIds: customSubjects,
        difficulties: customDifficulties,
        questionIds: res.questions.map((q) => q.id),
        mode: customMode,
        durationMinutes: Math.max(5, res.questions.length * 3),
        createdAt: new Date().toISOString(),
      };
      const updatedTests = await StorageService.saveCustomTest(newConfig);
      setSavedCustomTests(updatedTests);
      setBuilderOpen(false);
      setSessionTitle(title);
      setActiveQuestionIds(newConfig.questionIds);
      setIsPracticeMode(customMode === 'practice');
      setDraftAnswers({});
      setSubmittedAnswers({});
      setNumericalInputs({});
      setNumericalError(null);
      setRevealedHintsByQ({});
      setHintsCollapsed(false);
      setIsSubmitted(false);
      setSecondsElapsed(0);
      setQuestionSeconds({});
      setCurrentIdx(0);
      setTimerRunning(viewSettings.autoStartTimer);
      SoundManager.play('notify');
      HapticManager.triggerSuccess();
    } catch {
      setBuilderFeedback('Could not generate custom questions right now. Try bank launch.');
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  const launchSavedCustomTest = (ct: CustomTestConfig) => {
    setBuilderOpen(false);
    setSessionTitle(ct.title);
    setActiveQuestionIds(ct.questionIds);
    setIsPracticeMode(ct.mode === 'practice');
    setDraftAnswers({});
    setSubmittedAnswers({});
    setNumericalInputs({});
    setNumericalError(null);
    setRevealedHintsByQ({});
    setHintsCollapsed(false);
    setIsSubmitted(false);
    setSecondsElapsed(0);
    setQuestionSeconds({});
    setCurrentIdx(0);
    setTimerRunning(viewSettings.autoStartTimer);
  };

  // Format timers
  const activeQSecs = questionSeconds[currentQ.id] || 0;
  const formatSecs = (total: number) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  const isCurrentBookmarked = bookmarkedIds.includes(currentQ.id);

  // Score calculation from submitted answers
  const finalMap = isSubmitted ? { ...draftAnswers, ...submittedAnswers } : submittedAnswers;
  const correctCount = questions.filter((q) => {
    const ans = finalMap[q.id];
    if (ans === undefined) return false;
    return evaluateAnswer(q, ans);
  }).length;

  const attemptedCount = Object.keys(finalMap).length;
  const incorrectCount = attemptedCount - correctCount;
  const totalScore = correctCount * 4 - incorrectCount * 1;
  const maxPossible = questions.length * 4;

  const currentAnswerIsCorrect =
    isQuestionSubmitted && activeSelection !== undefined
      ? evaluateAnswer(currentQ, activeSelection)
      : false;

  const canSubmitCurrentQuestion =
    !isQuestionSubmitted &&
    (currentQ.type === 'single_mcq'
      ? currentDraft !== undefined
      : currentNumInput.trim() !== '');

  const visibleHintItems = currentHints.filter((h) => revealedCategories.includes(h.category));
  const shouldShowNoteBox =
    viewSettings.alwaysShowMyNote || noteEditorOpen || Boolean(questionNotes[currentQ.id]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Test Header */}
      <View
        style={[
          styles.topHeader,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.testHeading, { color: colors.text }]} numberOfLines={1}>
            {sessionTitle}
          </Text>
          <Text style={[styles.testSubheading, { color: colors.textSecondary }]}>
            Q{safeIdx + 1}/{questions.length} · {Object.keys(submittedAnswers).length} Checked ·{' '}
            {isPracticeMode ? 'Practice' : 'Exam'}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Custom Test Builder Button */}
          <TouchableOpacity
            onPress={openCustomBuilderModal}
            style={[
              styles.headerIconBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            accessibilityLabel="Create custom test"
          >
            <PlusCircle size={15} color={colors.primary} />
          </TouchableOpacity>

          {/* Play/Pause Per-Question Timer Pill */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setTimerRunning((r) => !r)}
            style={[
              styles.timerBadge,
              {
                backgroundColor: mode === 'dark' ? colors.surface : '#F1F5F9',
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            {timerRunning ? (
              <Pause size={12} color={colors.primary} />
            ) : (
              <Play size={12} color={colors.textSecondary} />
            )}
            <Clock size={12} color={colors.primary} />
            <Text style={[styles.timerText, { color: colors.text }]}>
              {formatSecs(activeQSecs)}
            </Text>
          </TouchableOpacity>

          {/* Question View Settings Gear */}
          <TouchableOpacity
            onPress={() => setViewSettingsOpen(true)}
            style={[
              styles.headerIconBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            accessibilityLabel="Question View Settings"
          >
            <Settings size={15} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Bookmark & Save to Notebook */}
          <TouchableOpacity
            onPress={() => toggleBookmark(currentQ.id)}
            onLongPress={() => setNotebookPickerOpen(true)}
            style={[
              styles.headerIconBtn,
              {
                borderColor: isCurrentBookmarked ? colors.primary : colors.border,
                backgroundColor: isCurrentBookmarked
                  ? mode === 'dark'
                    ? '#431407'
                    : '#FFEDD5'
                  : colors.surface,
              },
            ]}
            accessibilityLabel="Toggle bookmark"
          >
            <Bookmark
              size={15}
              color={isCurrentBookmarked ? colors.primary : colors.textSecondary}
              fill={isCurrentBookmarked ? colors.primary : 'none'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Non-shrinking Question Number Pills Bar + Mode & Bank Switch */}
      <View
        style={[
          styles.pillBarWrapper,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillRowContent}
        >
          {!isSubmitted && (
            <TouchableOpacity
              onPress={() => {
                HapticManager.triggerSelection();
                setIsPracticeMode((m) => !m);
              }}
              style={[
                styles.modePill,
                {
                  backgroundColor: isPracticeMode
                    ? mode === 'dark'
                      ? '#431407'
                      : '#FFEDD5'
                    : colors.infoBg,
                  borderColor: isPracticeMode ? colors.primary : colors.info,
                  marginRight: 10,
                },
              ]}
            >
              <Text
                style={[
                  styles.modePillText,
                  { color: isPracticeMode ? colors.primary : colors.info },
                ]}
              >
                {isPracticeMode ? 'Practice' : 'Exam'}
              </Text>
            </TouchableOpacity>
          )}

          {questions.map((q, idx) => {
            const isSelected = safeIdx === idx;
            const isChecked = submittedAnswers[q.id] !== undefined;
            const isDrafted = !isChecked && draftAnswers[q.id] !== undefined;

            let pillBg = colors.surface;
            let pillBorder = colors.border;
            let pillText = colors.textSecondary;

            if (isSelected) {
              pillBg = colors.primary;
              pillBorder = colors.primary;
              pillText = '#FFFFFF';
            } else if (isChecked) {
              const ok = evaluateAnswer(q, submittedAnswers[q.id]);
              pillBg = ok
                ? mode === 'dark'
                  ? '#064E3B'
                  : '#DCFCE7'
                : mode === 'dark'
                ? '#7F1D1D'
                : '#FEE2E2';
              pillBorder = ok ? colors.success : colors.error;
              pillText = ok ? colors.success : colors.error;
            } else if (isDrafted) {
              pillBg = mode === 'dark' ? '#431407' : '#FFEDD5';
              pillBorder = colors.primary;
              pillText = colors.primary;
            }

            return (
              <TouchableOpacity
                key={q.id}
                onPress={() => navigateToQuestion(idx)}
                style={[styles.navPill, { backgroundColor: pillBg, borderColor: pillBorder }]}
              >
                <Text style={[styles.navPillText, { color: pillText }]}>{idx + 1}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Question Scroll Area */}
      <ScrollView
        ref={mainScrollRef}
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        {/* Result Summary Banner after whole test submitted */}
        {isSubmitted && (
          <Card
            style={[
              styles.resultCard,
              {
                backgroundColor: mode === 'dark' ? colors.surface : '#FFF7ED',
                borderColor: colors.primary,
              },
            ]}
          >
            <View style={styles.resultRow}>
              <Award size={30} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.resultScore, { color: colors.primary }]}>
                  Score: {totalScore} / {maxPossible} (
                  {((Math.max(0, totalScore) / maxPossible) * 100).toFixed(0)}%)
                </Text>
                <View style={styles.resultStatsRow}>
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

        {/* Question Metadata Badges + Add to Notebook / My Note Quick Strip */}
        <View style={styles.qMetaRow}>
          <View style={styles.metaBadgesLeft}>
            <Badge label={currentQ.subjectId.toUpperCase()} variant="primary" size="sm" />
            <Badge
              label={currentQ.difficulty}
              variant={
                currentQ.difficulty === 'Easy'
                  ? 'success'
                  : currentQ.difficulty === 'Hard'
                  ? 'error'
                  : 'warning'
              }
              size="sm"
            />
            {currentQ.examOrigin && <Badge label={currentQ.examOrigin} variant="neutral" size="sm" />}
          </View>

          <View style={styles.metaActionsRight}>
            <TouchableOpacity
              onPress={() => setNotebookPickerOpen(true)}
              style={[styles.miniUtilChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <BookMarked size={12} color={colors.primary} />
              <Text style={[styles.miniUtilText, { color: colors.text }]}>Notebook</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setNoteEditorOpen((o) => !o)}
              style={[
                styles.miniUtilChip,
                {
                  backgroundColor: shouldShowNoteBox
                    ? mode === 'dark'
                      ? '#431407'
                      : '#FFEDD5'
                    : colors.surface,
                  borderColor: shouldShowNoteBox ? colors.primary : colors.border,
                },
              ]}
            >
              <FileEdit size={12} color={colors.primary} />
              <Text style={[styles.miniUtilText, { color: colors.primary }]}>My Note</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Question Prompt Card with Full LaTeX Support */}
        <Card style={styles.promptCard}>
          <RichMathText
            content={currentQ.prompt}
            fontSize={fontSizes.prompt}
            color={colors.text}
            accentColor={colors.primary}
          />
        </Card>

        {/* Inline Personal Sticky Note ("My Note") with KaTeX Rendering + Convert to LaTeX */}
        {shouldShowNoteBox && (
          <Card
            style={[
              styles.myNoteCard,
              {
                backgroundColor: mode === 'dark' ? colors.surface : '#FFFBEB',
                borderColor: colors.primary,
              },
            ]}
          >
            <View style={styles.myNoteHeader}>
              <View style={styles.hintTitleGroup}>
                <FileEdit size={14} color={colors.primary} />
                <Text style={[styles.myNoteTitle, { color: colors.primary }]}>
                  My Personal Note
                </Text>
              </View>
              <View style={styles.myNoteHeaderRight}>
                {noteFeedback && (
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.success }}>
                    {noteFeedback}
                  </Text>
                )}
                {noteDraft.trim().length > 0 && (
                  <TouchableOpacity
                    onPress={() => setNoteShowEditor((e) => !e)}
                    style={[
                      styles.noteToggleChip,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <Text style={{ fontSize: 10.5, fontWeight: '700', color: colors.textSecondary }}>
                      {noteShowEditor ? 'Hide Editor' : 'Edit Note'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {noteDraft.trim().length > 0 && (
              <View
                style={[
                  styles.myNoteRenderedBox,
                  {
                    backgroundColor: mode === 'dark' ? colors.inputBg : '#FFFFFF',
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.myNoteRenderedLabel, { color: colors.textSecondary }]}>
                  LATEX PREVIEW
                </Text>
                <RichMathText
                  content={noteDraft}
                  fontSize={fontSizes.solution}
                  color={colors.text}
                  accentColor={colors.primary}
                  compact
                />
              </View>
            )}

            {(noteShowEditor || !noteDraft.trim()) && (
              <>
                <TextInput
                  multiline
                  placeholder="Write a formula, trick, or reminder (e.g. a = (g sin θ)/(1 + k), H2O, x^2 + y^2)..."
                  placeholderTextColor={colors.textSecondary}
                  value={noteDraft}
                  onChangeText={(txt) => {
                    setNoteDraft(txt);
                    setNoteFeedback(null);
                  }}
                  style={[
                    styles.myNoteInput,
                    {
                      color: colors.text,
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                    },
                  ]}
                />
                <View style={styles.myNoteFooter}>
                  <Button
                    title="Convert to LaTeX"
                    size="sm"
                    variant="outline"
                    disabled={!noteDraft.trim()}
                    onPress={handleConvertNoteToLatex}
                    icon={
                      <Sparkles
                        size={13}
                        color={noteDraft.trim() ? colors.primary : colors.textSecondary}
                      />
                    }
                  />
                  <Button title="Save Note" size="sm" variant="primary" onPress={handleSaveMyNote} />
                </View>
              </>
            )}
          </Card>
        )}

        {/* Multi-Type Hints Bar & Progressive Hint Cards (respects Question View Setting) */}
        {viewSettings.showHints && (
          <View style={styles.hintsSection}>
            <View style={styles.hintsToolbar}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleShowNextHint}
                style={[
                  styles.mainHintBtn,
                  {
                    backgroundColor: mode === 'dark' ? colors.surface : '#FEF3C7',
                    borderColor: colors.warning,
                  },
                ]}
              >
                <Lightbulb size={15} color={colors.warning} />
                <Text style={[styles.mainHintBtnText, { color: colors.warning }]}>
                  {revealedCategories.length === 0
                    ? 'Show Hint (0/3)'
                    : revealedCategories.length < currentHints.length
                    ? `Next Hint (${revealedCategories.length}/${currentHints.length})`
                    : hintsCollapsed
                    ? 'Show Hints (3/3)'
                    : 'Hide Hints'}
                </Text>
              </TouchableOpacity>

              <View style={styles.hintTypePills}>
                {currentHints.map((hint) => {
                  const unlocked = revealedCategories.includes(hint.category);
                  const meta = HINT_META[hint.category];
                  const tint = mode === 'dark' ? meta.accentDark : meta.accentLight;
                  return (
                    <TouchableOpacity
                      key={hint.id}
                      activeOpacity={0.75}
                      onPress={() => revealHintCategory(hint.category)}
                      style={[
                        styles.hintTypeChip,
                        {
                          backgroundColor: unlocked ? tint + '20' : colors.card,
                          borderColor: unlocked ? tint : colors.border,
                        },
                      ]}
                    >
                      {hint.category === 'concept' && (
                        <BookOpen size={12} color={unlocked ? tint : colors.textSecondary} />
                      )}
                      {hint.category === 'formula' && (
                        <FunctionSquare size={12} color={unlocked ? tint : colors.textSecondary} />
                      )}
                      {hint.category === 'strategy' && (
                        <Compass size={12} color={unlocked ? tint : colors.textSecondary} />
                      )}
                      <Text
                        style={[
                          styles.hintTypeChipText,
                          { color: unlocked ? tint : colors.textSecondary },
                        ]}
                      >
                        {meta.shortLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {!hintsCollapsed && visibleHintItems.length > 0 && (
              <View style={styles.hintsList}>
                {visibleHintItems.map((hint, idx) => {
                  const meta = HINT_META[hint.category];
                  const tint = mode === 'dark' ? meta.accentDark : meta.accentLight;
                  return (
                    <Card
                      key={hint.id}
                      style={[
                        styles.hintCard,
                        {
                          backgroundColor: mode === 'dark' ? '#162032' : '#FFFBEB',
                          borderColor: tint,
                        },
                      ]}
                    >
                      <View style={styles.hintCardHeader}>
                        <View style={styles.hintTitleGroup}>
                          <Lightbulb size={14} color={tint} />
                          <Text style={[styles.hintTitleText, { color: tint }]}>
                            Hint {idx + 1} · {hint.title}
                          </Text>
                        </View>
                        <Text style={[styles.hintTagText, { color: tint }]}>
                          {meta.shortLabel.toUpperCase()}
                        </Text>
                      </View>
                      <RichMathText
                        content={hint.content}
                        fontSize={fontSizes.solution}
                        color={colors.text}
                        accentColor={tint}
                      />
                    </Card>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Option Selection Area (MCQ) or Numerical Input */}
        {currentQ.type === 'single_mcq' && currentQ.options ? (
          <View style={styles.optionsList}>
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = activeSelection === opt.id;
              const revealGrading = isSubmitted || (isPracticeMode && isQuestionSubmitted);
              const isCorrectOpt = opt.isCorrect;

              let optBg = colors.card;
              let optBorder = colors.border;
              let radioBorder = colors.textSecondary;
              let radioFill = 'transparent';

              if (revealGrading && isCorrectOpt) {
                optBg = mode === 'dark' ? '#064E3B' : '#DCFCE7';
                optBorder = colors.success;
                radioBorder = colors.success;
                radioFill = colors.success;
              } else if (revealGrading && isSelected && !isCorrectOpt) {
                optBg = mode === 'dark' ? '#7F1D1D' : '#FEE2E2';
                optBorder = colors.error;
                radioBorder = colors.error;
                radioFill = colors.error;
              } else if (isSelected) {
                optBg = mode === 'dark' ? '#431407' : '#FFEDD5';
                optBorder = colors.primary;
                radioBorder = colors.primary;
                radioFill = colors.primary;
              }

              const peerPct = currentQ.peerStats?.[opt.id];

              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.75}
                  disabled={isQuestionSubmitted}
                  onPress={() => handleSelectOption(opt.id)}
                  style={[
                    styles.optionCard,
                    { backgroundColor: optBg, borderColor: optBorder },
                  ]}
                >
                  <View style={styles.optionTopRow}>
                    <View
                      style={[
                        styles.radioCircle,
                        { borderColor: radioBorder, backgroundColor: radioFill },
                      ]}
                    >
                      {isSelected && <View style={styles.radioDot} />}
                    </View>

                    <Text style={[styles.optionLabelPrefix, { color: colors.textSecondary }]}>
                      {String.fromCharCode(65 + oIdx)}.
                    </Text>

                    <View style={styles.optionMathWrap}>
                      <RichMathText
                        content={opt.text}
                        fontSize={fontSizes.option}
                        color={colors.text}
                        accentColor={colors.primary}
                        compact={true}
                        nonInteractive={true}
                      />
                    </View>

                    {revealGrading && isCorrectOpt && (
                      <CheckCircle2 size={18} color={colors.success} style={{ marginLeft: 8 }} />
                    )}
                    {revealGrading && isSelected && !isCorrectOpt && (
                      <XCircle size={18} color={colors.error} style={{ marginLeft: 8 }} />
                    )}
                  </View>

                  {/* Peer Response Insights Bar (revealed after submission when enabled) */}
                  {revealGrading && viewSettings.showPeerInsights && typeof peerPct === 'number' && (
                    <View style={styles.peerBarWrap}>
                      <View style={[styles.peerBarBg, { backgroundColor: colors.borderSubtle }]}>
                        <View
                          style={[
                            styles.peerBarFill,
                            {
                              width: `${peerPct}%`,
                              backgroundColor: isCorrectOpt ? colors.success : colors.textSecondary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.peerPctText, { color: colors.textSecondary }]}>
                        {peerPct}% students picked this
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Card style={styles.numericalCard}>
            <Text style={[styles.numericalLabel, { color: colors.textSecondary }]}>
              Enter Numerical Value:
            </Text>
            <TextInput
              editable={!isQuestionSubmitted}
              style={[
                styles.numInput,
                {
                  color: colors.text,
                  backgroundColor: colors.inputBg,
                  borderColor: numericalError
                    ? colors.error
                    : isQuestionSubmitted
                    ? isPracticeMode
                      ? currentAnswerIsCorrect
                        ? colors.success
                        : colors.error
                      : colors.primary
                    : colors.primary,
                  opacity: isQuestionSubmitted ? 0.85 : 1,
                },
              ]}
              keyboardType="numeric"
              placeholder="e.g. 4 or 2.45"
              placeholderTextColor={colors.textSecondary}
              value={currentNumInput}
              onChangeText={handleNumericalChange}
            />
            {numericalError && (
              <Text style={[styles.numericalErrorText, { color: colors.error }]}>
                {numericalError}
              </Text>
            )}
          </Card>
        )}

        {/* Dedicated Per-Question Submit / Check Answer Control */}
        <View style={styles.questionSubmitSection}>
          {!isQuestionSubmitted ? (
            <View style={styles.submitActionRow}>
              {currentDraft !== undefined && (
                <Button
                  title="Clear"
                  variant="outline"
                  size="md"
                  onPress={handleClearSelection}
                  style={styles.clearChoiceBtn}
                />
              )}
              <Button
                title={
                  canSubmitCurrentQuestion
                    ? isPracticeMode
                      ? 'Submit Answer'
                      : 'Save & Lock Answer'
                    : currentQ.type === 'single_mcq'
                    ? 'Select an Option to Submit'
                    : 'Enter Value to Submit'
                }
                variant="primary"
                size="md"
                disabled={!canSubmitCurrentQuestion}
                onPress={handleSubmitSingleQuestion}
                icon={
                  <CheckCircle2
                    size={16}
                    color={canSubmitCurrentQuestion ? '#FFFFFF' : colors.textSecondary}
                  />
                }
                style={styles.submitAnswerBtn}
              />
            </View>
          ) : (
            <View
              style={[
                styles.submittedBanner,
                {
                  backgroundColor: isPracticeMode
                    ? currentAnswerIsCorrect
                      ? colors.successBg
                      : colors.errorBg
                    : colors.infoBg,
                  borderColor: isPracticeMode
                    ? currentAnswerIsCorrect
                      ? colors.success
                      : colors.error
                    : colors.info,
                },
              ]}
            >
              <View style={styles.submittedBannerLeft}>
                {isPracticeMode ? (
                  currentAnswerIsCorrect ? (
                    <CheckCircle2 size={18} color={colors.success} />
                  ) : (
                    <XCircle size={18} color={colors.error} />
                  )
                ) : (
                  <CheckCircle2 size={18} color={colors.info} />
                )}
                <Text
                  style={[
                    styles.submittedBannerText,
                    {
                      color: isPracticeMode
                        ? currentAnswerIsCorrect
                          ? colors.success
                          : colors.error
                        : colors.info,
                    },
                  ]}
                >
                  {showReopenSolution
                    ? 'Reopened Prior Attempt (Solution Mode)'
                    : isPracticeMode
                    ? currentAnswerIsCorrect
                      ? 'Correct Answer (+25 XP · +4 marks)'
                      : activeSelection !== undefined
                      ? currentQ.type === 'numerical'
                        ? `Incorrect (-1) · Correct: ${currentQ.numericalAnswer}`
                        : 'Incorrect (-1 mark · +10 XP effort)'
                      : 'Unattempted (0 marks)'
                    : 'Answer Submitted & Locked'}
                </Text>
              </View>

              {onAskAI && (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() =>
                    onAskAI({
                      prompt: `Explain step-by-step: ${currentQ.prompt}`,
                      difficulty: currentQ.difficulty,
                      subject: currentQ.subjectId,
                      nonce: Date.now(),
                    })
                  }
                  style={[styles.askAiMiniBtn, { borderColor: colors.primary }]}
                >
                  <BrainCircuit size={13} color={colors.primary} />
                  <Text style={[styles.askAiMiniText, { color: colors.primary }]}>Ask AI</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Step-by-Step Solution Sheet (LaTeX Rendered, after submission) */}
        {(isSubmitted || (isPracticeMode && isQuestionSubmitted)) && (
          <Card
            style={[
              styles.explanationCard,
              {
                backgroundColor: mode === 'dark' ? colors.surface : '#F8FAFC',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.explanationHeader}>
              <Sparkles size={16} color={colors.primary} />
              <Text style={[styles.explanationHeading, { color: colors.primary }]}>
                Step-by-Step Solution
              </Text>
            </View>
            <RichMathText
              content={currentQ.explanation}
              fontSize={fontSizes.solution}
              color={colors.text}
              accentColor={colors.primary}
            />
          </Card>
        )}
      </ScrollView>

      {/* Bottom Navigation & Final Submit Footer */}
      <View
        style={[
          styles.footerBar,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        <Button
          title="Previous"
          variant="outline"
          size="sm"
          disabled={safeIdx === 0}
          onPress={() => navigateToQuestion(Math.max(0, safeIdx - 1))}
          icon={<ChevronLeft size={16} color={safeIdx === 0 ? colors.textSecondary : colors.primary} />}
        />

        {!isSubmitted && Object.keys(submittedAnswers).length > 0 && safeIdx < questions.length - 1 && (
          <Button
            title="Finish Test"
            variant="secondary"
            size="sm"
            onPress={handleSubmitTest}
          />
        )}

        {safeIdx < questions.length - 1 ? (
          <Button
            title="Next"
            size="sm"
            onPress={() => navigateToQuestion(Math.min(questions.length - 1, safeIdx + 1))}
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
            title="Retake Drill"
            variant="secondary"
            size="sm"
            onPress={handleRestart}
            icon={<RotateCcw size={16} color="#FFFFFF" />}
          />
        )}
      </View>

      {/* MODAL 1: QUESTION VIEW SETTINGS (Observed in 1000591145.jpg) */}
      <Modal
        visible={viewSettingsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setViewSettingsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Question View Settings</Text>
              <View style={styles.modalHeaderActions}>
                <TouchableOpacity onPress={handleResetViewSettings} style={{ marginRight: 12 }}>
                  <Text style={{ color: colors.error, fontWeight: '700', fontSize: 13 }}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewSettingsOpen(false)}>
                  <X size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={{ paddingVertical: 14 }}>
              <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>
                NOTES & SOLUTIONS
              </Text>

              {[
                {
                  key: 'showHints' as const,
                  title: 'Show Hint to solve Qs',
                  desc: 'Show progressive Concept, Formula & Strategy hints',
                },
                {
                  key: 'alwaysShowMyNote' as const,
                  title: 'Always show "My note"',
                  desc: 'Keep your personal note visible whenever revisiting a question',
                },
                {
                  key: 'solutionModeOnReopen' as const,
                  title: 'Question Solution Mode',
                  desc: 'Show the solution directly when reopening an already-attempted Q',
                },
              ].map((item) => (
                <View key={item.key} style={[styles.settingRow, { borderBottomColor: colors.borderSubtle }]}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                  </View>
                  <Switch
                    value={viewSettings[item.key]}
                    onValueChange={(v) => updateViewSetting(item.key, v)}
                    trackColor={{ false: '#64748B', true: colors.primary }}
                  />
                </View>
              ))}

              <Text style={[styles.modalSectionLabel, { color: colors.textSecondary, marginTop: 16 }]}>
                PRACTICE EXPERIENCE
              </Text>

              {[
                {
                  key: 'autoStartTimer' as const,
                  title: 'Start timer automatically',
                  desc: 'Per-question timer begins automatically once you open a Q',
                },
                {
                  key: 'playSounds' as const,
                  title: 'Play sounds',
                  desc: 'Play sound when you submit a correct or incorrect answer',
                },
                {
                  key: 'deferCorrectAnswer' as const,
                  title: "Don't show correct answer immediately",
                  desc: 'Check answer only after tapping Submit Answer button',
                },
                {
                  key: 'showPeerInsights' as const,
                  title: "Show peer insights",
                  desc: 'Show what percentage of learners picked each option',
                },
              ].map((item) => (
                <View key={item.key} style={[styles.settingRow, { borderBottomColor: colors.borderSubtle }]}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                  </View>
                  <Switch
                    value={viewSettings[item.key]}
                    onValueChange={(v) => updateViewSetting(item.key, v)}
                    trackColor={{ false: '#64748B', true: colors.primary }}
                  />
                </View>
              ))}

              <Text style={[styles.modalSectionLabel, { color: colors.textSecondary, marginTop: 16 }]}>
                TEXT SIZE
              </Text>
              <View style={styles.textSizeRow}>
                {(
                  [
                    { id: 'small', label: 'Small' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'large', label: 'Large' },
                    { id: 'xlarge', label: 'Extra Large' },
                  ] as const
                ).map((sz) => {
                  const selected = viewSettings.textSize === sz.id;
                  return (
                    <TouchableOpacity
                      key={sz.id}
                      onPress={() => updateViewSetting('textSize', sz.id)}
                      style={[
                        styles.textSizeChip,
                        {
                          backgroundColor: selected ? colors.primary : colors.surface,
                          borderColor: selected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 11.5,
                          fontWeight: '700',
                          color: selected ? '#FFFFFF' : colors.text,
                        }}
                      >
                        {sz.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: CREATE YOUR OWN TEST BUILDER */}
      <Modal
        visible={builderOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setBuilderOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.hintTitleGroup}>
                <Filter size={18} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Create Your Own Test</Text>
              </View>
              <TouchableOpacity onPress={() => setBuilderOpen(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={{ gap: 12, paddingVertical: 14 }}>
              <View>
                <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>
                  TEST TITLE / TOPIC FOCUS (OPTIONAL)
                </Text>
                <TextInput
                  value={customTitle}
                  onChangeText={setCustomTitle}
                  placeholder="e.g. Rotational + Electrostatics Mix"
                  placeholderTextColor={colors.textSecondary}
                  style={[
                    styles.builderInput,
                    { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                  ]}
                />
              </View>

              <View>
                <View style={styles.builderSectionHeader}>
                  <Text style={[styles.modalSectionLabel, { color: colors.textSecondary, marginBottom: 0 }]}>
                    SUBJECTS ({customSubjects.length}/{SUBJECTS.length})
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setCustomSubjects(
                        customSubjects.length === SUBJECTS.length
                          ? []
                          : SUBJECTS.map((s) => s.id)
                      )
                    }
                  >
                    <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.primary }}>
                      {customSubjects.length === SUBJECTS.length ? 'Clear All' : 'Select All'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.chipWrap}>
                  {SUBJECTS.map((s) => {
                    const selected = customSubjects.includes(s.id);
                    return (
                      <TouchableOpacity
                        key={s.id}
                        onPress={() =>
                          setCustomSubjects((prev) =>
                            prev.includes(s.id)
                              ? prev.filter((x) => x !== s.id)
                              : [...prev, s.id]
                          )
                        }
                        style={[
                          styles.builderChip,
                          {
                            backgroundColor: selected ? colors.primary : colors.surface,
                            borderColor: selected ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '700', color: selected ? '#FFFFFF' : colors.text }}>
                          {s.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View>
                <View style={styles.builderSectionHeader}>
                  <Text style={[styles.modalSectionLabel, { color: colors.textSecondary, marginBottom: 0 }]}>
                    DIFFICULTY ({customDifficulties.length}/3)
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setCustomDifficulties(
                        customDifficulties.length === 3 ? [] : ['Easy', 'Medium', 'Hard']
                      )
                    }
                  >
                    <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.primary }}>
                      {customDifficulties.length === 3 ? 'Clear All' : 'Select All'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.chipWrap}>
                  {(['Easy', 'Medium', 'Hard'] as QuestionDifficulty[]).map((d) => {
                    const selected = customDifficulties.includes(d);
                    return (
                      <TouchableOpacity
                        key={d}
                        onPress={() =>
                          setCustomDifficulties((prev) =>
                            prev.includes(d)
                              ? prev.filter((x) => x !== d)
                              : [...prev, d]
                          )
                        }
                        style={[
                          styles.builderChip,
                          {
                            backgroundColor: selected ? colors.secondary : colors.surface,
                            borderColor: selected ? colors.secondary : colors.border,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '700', color: selected ? '#FFFFFF' : colors.text }}>
                          {d}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={[styles.chipWrap, { marginTop: 8 }]}>
                  {(
                    [
                      { id: 'all', label: 'All Qs' },
                      { id: 'unattempted', label: 'Not Started' },
                      { id: 'mistakes', label: 'Mistakes Only' },
                    ] as const
                  ).map((st) => {
                    const selected = customStatusFilter === st.id;
                    return (
                      <TouchableOpacity
                        key={st.id}
                        onPress={() => setCustomStatusFilter(st.id)}
                        style={[
                          styles.builderChip,
                          {
                            backgroundColor: selected ? colors.primary : colors.surface,
                            borderColor: selected ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: selected ? '#FFFFFF' : colors.text }}>
                          {st.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>
                  QUESTION COUNT & MODE
                </Text>
                <View style={[styles.chipWrap, { marginBottom: 8 }]}>
                  {([5, 10, 15, 'all'] as CustomQuestionLimit[]).map((lim) => {
                    const selected = customQuestionLimit === lim;
                    return (
                      <TouchableOpacity
                        key={String(lim)}
                        onPress={() => setCustomQuestionLimit(lim)}
                        style={[
                          styles.builderChip,
                          {
                            backgroundColor: selected ? colors.primary : colors.surface,
                            borderColor: selected ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: selected ? '#FFFFFF' : colors.text }}>
                          {lim === 'all' ? 'All Matching' : `${lim} Qs`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.chipWrap}>
                  {(
                    [
                      { id: 'practice', label: 'Practice (With Solutions)' },
                      { id: 'exam', label: 'Timed Exam Simulation' },
                    ] as const
                  ).map((m) => {
                    const selected = customMode === m.id;
                    return (
                      <TouchableOpacity
                        key={m.id}
                        onPress={() => setCustomMode(m.id)}
                        style={[
                          styles.builderChip,
                          {
                            backgroundColor: selected ? colors.primary : colors.surface,
                            borderColor: selected ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: selected ? '#FFFFFF' : colors.text }}>
                          {m.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Builder Selection Status & Helper Hint */}
              <View
                style={[
                  styles.builderStatusBox,
                  {
                    backgroundColor: colors.surface,
                    borderColor:
                      customSubjects.length === 0 || customDifficulties.length === 0
                        ? colors.warning
                        : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color:
                      customSubjects.length === 0 || customDifficulties.length === 0
                        ? colors.warning
                        : colors.textSecondary,
                  }}
                >
                  {customSubjects.length === 0 || customDifficulties.length === 0
                    ? 'Select at least 1 subject and 1 difficulty to build your custom test.'
                    : `Matching Bank Qs: ${builderMatches.length} selected (${filteredPool.length} total match across local + cloud + saved bank)`}
                </Text>
              </View>

              {builderFeedback && (
                <Text style={{ color: colors.error, fontSize: 12, fontWeight: '600' }}>
                  {builderFeedback}
                </Text>
              )}

              <Button
                title={`Launch Bank Custom Test (${builderMatches.length} Qs)`}
                disabled={builderMatches.length === 0 || isGeneratingCustom}
                onPress={handleLaunchCustomTest}
              />

              <Button
                title={
                  isGeneratingCustom
                    ? 'Generating Fresh Custom Test...'
                    : `Generate Fresh AI Mix (${customQuestionLimit === 'all' ? 6 : Math.min(10, customQuestionLimit)} Qs)`
                }
                variant="outline"
                loading={isGeneratingCustom}
                disabled={customSubjects.length === 0 || customDifficulties.length === 0}
                onPress={handleGenerateAndLaunchCustomTest}
                icon={
                  <Sparkles
                    size={15}
                    color={
                      customSubjects.length > 0 && customDifficulties.length > 0
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                }
              />

              {savedCustomTests.length > 0 && (
                <View style={{ marginTop: 6, gap: 6 }}>
                  <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>
                    RECENT CUSTOM TESTS
                  </Text>
                  {savedCustomTests.slice(0, 4).map((ct) => (
                    <TouchableOpacity
                      key={ct.id}
                      onPress={() => launchSavedCustomTest(ct)}
                      style={[
                        styles.savedTestRow,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                    >
                      <View>
                        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>{ct.title}</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                          {ct.questionIds.length} Qs · {ct.mode.toUpperCase()}
                        </Text>
                      </View>
                      <Play size={15} color={colors.primary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: SAVE QUESTION TO NOTEBOOK PICKER */}
      <Modal
        visible={notebookPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setNotebookPickerOpen(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={[styles.centerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeaderNoBorder}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Save to Notebook</Text>
              <TouchableOpacity onPress={() => setNotebookPickerOpen(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {notebooks.map((nb) => {
              const included = nb.questionIds.includes(currentQ.id);
              return (
                <TouchableOpacity
                  key={nb.id}
                  onPress={() => handleToggleNotebookQuestion(nb.id, currentQ.id)}
                  style={[
                    styles.nbPickRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: included ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.nbColorDot, { backgroundColor: nb.color }]} />
                  <Text style={{ flex: 1, color: colors.text, fontWeight: '700', fontSize: 13 }}>
                    {nb.name}
                  </Text>
                  {included && <Check size={16} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
            <Button title="Done" size="sm" onPress={() => setNotebookPickerOpen(false)} />
          </View>
        </View>
      </Modal>

      {/* Signature Study Labs Cyber Celebration Overlay */}
      <CelebrationOverlay
        event={celebrationEvent}
        onClose={() => setCelebrationEvent(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: {
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  testHeading: { fontSize: 15, fontWeight: '800' },
  testSubheading: { fontSize: 11, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  headerIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.25,
  },
  modePillText: { fontSize: 11, fontWeight: '800' },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
  },
  timerText: {
    fontSize: 11.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  pillBarWrapper: { flexGrow: 0, flexShrink: 0, borderBottomWidth: 1 },
  pillScroll: { flexGrow: 0, flexShrink: 0 },
  pillRowContent: { paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' },
  navPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginRight: 8,
  },
  navPillText: { fontSize: 12.5, fontWeight: '800' },
  mainScroll: { flex: 1 },
  scrollArea: { padding: 16, paddingBottom: 28 },
  resultCard: { padding: 16, marginBottom: 14, borderWidth: 1 },
  resultRow: { flexDirection: 'row', alignItems: 'center' },
  resultScore: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  resultStatsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' },
  resultStats: { fontSize: 12 },
  qMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
    flexWrap: 'wrap',
  },
  metaBadgesLeft: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
  metaActionsRight: { flexDirection: 'row', gap: 6 },
  miniUtilChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9,
    borderWidth: 1,
  },
  miniUtilText: { fontSize: 11, fontWeight: '700' },
  promptCard: { padding: 16, marginBottom: 12 },
  myNoteCard: { padding: 12, marginBottom: 12, borderWidth: 1, gap: 8 },
  myNoteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  myNoteHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  myNoteTitle: { fontSize: 12.5, fontWeight: '800' },
  noteToggleChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  myNoteRenderedBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  myNoteRenderedLabel: { fontSize: 9.5, fontWeight: '800', letterSpacing: 0.6 },
  myNoteInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    minHeight: 60,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  myNoteFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  builderSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  builderStatusBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  hintsSection: { marginBottom: 14 },
  hintsToolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  mainHintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.25,
  },
  mainHintBtnText: { fontSize: 12, fontWeight: '700' },
  hintTypePills: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hintTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  hintTypeChipText: { fontSize: 11, fontWeight: '700' },
  hintsList: { marginTop: 10, gap: 8 },
  hintCard: { padding: 12, borderWidth: 1 },
  hintCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  hintTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hintTitleText: { fontSize: 12.5, fontWeight: '800' },
  hintTagText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  optionsList: { gap: 10, marginBottom: 14 },
  optionCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  optionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  optionLabelPrefix: { fontSize: 13.5, fontWeight: '700', marginRight: 8 },
  optionMathWrap: { flex: 1, minWidth: 0 },
  peerBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 30 },
  peerBarBg: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  peerBarFill: { height: '100%', borderRadius: 3 },
  peerPctText: { fontSize: 10, fontWeight: '600' },
  numericalCard: { padding: 16, marginBottom: 14 },
  numericalLabel: { fontSize: 13, marginBottom: 8, fontWeight: '600' },
  numInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '700',
  },
  numericalErrorText: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  questionSubmitSection: { marginBottom: 14 },
  submitActionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  clearChoiceBtn: { minWidth: 78 },
  submitAnswerBtn: { flex: 1 },
  submittedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.25,
    gap: 8,
  },
  submittedBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  submittedBannerText: { fontSize: 12.5, fontWeight: '700', flexShrink: 1 },
  askAiMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  askAiMiniText: { fontSize: 11.5, fontWeight: '700' },
  explanationCard: { padding: 16, borderWidth: 1, marginBottom: 6 },
  explanationHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  explanationHeading: { fontSize: 14, fontWeight: '700' },
  footerBar: {
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, borderTopWidth: 1, maxHeight: '88%' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalHeaderActions: { flexDirection: 'row', alignItems: 'center' },
  modalTitle: { fontSize: 16.5, fontWeight: '800' },
  modalScroll: { paddingHorizontal: 20 },
  modalSectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.7, marginBottom: 6 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  settingTitle: { fontSize: 14, fontWeight: '700' },
  settingDesc: { fontSize: 11.5, marginTop: 2 },
  textSizeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  textSizeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  builderInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  builderChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  savedTestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 20 },
  centerCard: { padding: 18, borderRadius: 20, borderWidth: 1, gap: 10 },
  modalHeaderNoBorder: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nbPickRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  nbColorDot: { width: 12, height: 12, borderRadius: 6 },
});

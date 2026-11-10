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
import { MathPanModal, RichMathText } from '../components/common/MathRenderer';
import { ApiErrorCard, EmptyResourceCard } from '../components/common/StateFeedbackCard';
import { getLatestQuestionStatusMap } from '../utils/activityStats';
import { convertPlainTextToLatex } from '../utils/noteLatexConverter';
import {
  CustomQuestionLimit,
  computeTestScoreAndRankSummary,
  evaluateQuestionAnswer,
  filterCustomQuestions,
  parseMultiSelectAnswer,
  serializeMultiSelectAnswer,
} from '../utils/customTestBuilder';
import {
  ActiveTestWorkspaceState,
  AppErrorInfo,
  CelebrationEvent,
  CustomNotebook,
  CustomTestConfig,
  HintCategory,
  Question,
  QuestionAttemptStat,
  QuestionDifficulty,
  QuestionHint,
  QuestionOption,
  QuestionTextSize,
  QuestionType,
  QuestionViewSettings,
  SubjectId,
  TestAttempt,
  TestSessionLaunch,
} from '../types';
import {
  Award,
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
  Edit3,
  Eye,
  EyeOff,
  FileEdit,
  Filter,
  FunctionSquare,
  Lightbulb,
  ListChecks,
  Move,
  Pause,
  Play,
  Plus,
  PlusCircle,
  RotateCcw,
  Settings,
  Shuffle,
  Sparkles,
  Target,
  Trash2,
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
  isFocused?: boolean;
}

const SAMPLE_QUESTION_ID_SET = new Set(SAMPLE_QUESTIONS.map((q) => q.id));

function formatPromptSnippet(raw: string): string {
  return raw
    .replace(/\$\$/g, '')
    .replace(/\$/g, '')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\mathrm\{([^}]*)\}/g, '$1')
    .replace(/\\hat\{([^}]*)\}/g, '$1')
    .replace(/\\vec\{([^}]*)\}/g, '$1')
    .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
    .replace(/\\mu(?![a-zA-Z])/g, 'µ')
    .replace(/\\theta(?![a-zA-Z])/g, 'θ')
    .replace(/\\alpha(?![a-zA-Z])/g, 'α')
    .replace(/\\beta(?![a-zA-Z])/g, 'β')
    .replace(/\\pi(?![a-zA-Z])/g, 'π')
    .replace(/\\omega(?![a-zA-Z])/g, 'ω')
    .replace(/\\int(?![a-zA-Z])/g, '∫')
    .replace(/\\times(?![a-zA-Z])/g, '×')
    .replace(/\\cdot(?![a-zA-Z])/g, '·')
    .replace(/\\left|\\right|\\displaystyle|\\mathbf/g, '')
    .replace(/\\,/g, ' ')
    .replace(/\\([a-zA-Z]+)/g, '$1')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
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

function shuffleIds(ids: string[]): string[] {
  const arr = [...ids];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

const DEFAULT_DRAFT_OPTIONS: QuestionOption[] = [
  { id: 'a', text: '', isCorrect: true },
  { id: 'b', text: '', isCorrect: false },
  { id: 'c', text: '', isCorrect: false },
  { id: 'd', text: '', isCorrect: false },
];

export const TestEngineScreen: React.FC<TestEngineScreenProps> = ({
  onAskAI,
  initialSession,
  openBuilderNonce,
  onBuilderOpened,
  isFocused = true,
}) => {
  const { colors, mode } = useTheme();

  // Active deck & session title + marking / rank targets
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

  // Per-question Hints: revealed, individually hidden, and drawer collapsed state
  const [revealedHintsByQ, setRevealedHintsByQ] = useState<Record<string, HintCategory[]>>({});
  const [hiddenHintCatsByQ, setHiddenHintCatsByQ] = useState<Record<string, HintCategory[]>>({});
  const [hintsCollapsedByQ, setHintsCollapsedByQ] = useState<Record<string, boolean>>({});

  // Marking & Rank Config for the active test
  const [marksPerCorrect, setMarksPerCorrect] = useState<number>(4);
  const [negativeMarks, setNegativeMarks] = useState<number>(1);
  const [targetRank, setTargetRank] = useState<number | undefined>(500);
  const [totalCandidates, setTotalCandidates] = useState<number>(10000);

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
  const [sessionHydrated, setSessionHydrated] = useState(false);

  // Modals
  const [viewSettingsOpen, setViewSettingsOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [notebookPickerOpen, setNotebookPickerOpen] = useState(false);
  const [questionManagerOpen, setQuestionManagerOpen] = useState(false);

  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [builderFeedback, setBuilderFeedback] = useState<string | null>(null);
  const [builderApiError, setBuilderApiError] = useState<AppErrorInfo | null>(null);
  const [cloudSyncError, setCloudSyncError] = useState<AppErrorInfo | null>(null);
  const [panOptionTarget, setPanOptionTarget] = useState<{ label: string; text: string } | null>(null);
  const [celebrationEvent, setCelebrationEvent] = useState<CelebrationEvent | null>(null);

  // Custom Test Builder Draft State (unselected subjects/difficulties by default)
  const [customTitle, setCustomTitle] = useState('');
  const [customSubjects, setCustomSubjects] = useState<SubjectId[]>([]);
  const [customDifficulties, setCustomDifficulties] = useState<QuestionDifficulty[]>([]);
  const [customStatusFilter, setCustomStatusFilter] = useState<'all' | 'unattempted' | 'mistakes'>('all');
  const [customQuestionLimit, setCustomQuestionLimit] = useState<CustomQuestionLimit>(5);
  const [customCountInput, setCustomCountInput] = useState('5');
  const [customMode, setCustomMode] = useState<'practice' | 'exam'>('practice');
  const [customShuffleOrder, setCustomShuffleOrder] = useState(true);
  const [customAutoTopUp, setCustomAutoTopUp] = useState(true);
  const [builderMarksPerCorrect, setBuilderMarksPerCorrect] = useState('4');
  const [builderNegativeMarks, setBuilderNegativeMarks] = useState('1');
  const [builderTargetRank, setBuilderTargetRank] = useState('500');
  const [builderTotalCandidates, setBuilderTotalCandidates] = useState('10000');

  // Question Manager & Editor State
  const [qmTab, setQmTab] = useState<'list' | 'edit'>('list');
  const [qmScope, setQmScope] = useState<'active' | 'all'>('active');
  const [qmSearch, setQmSearch] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [edType, setEdType] = useState<QuestionType>('single_mcq');
  const [edSubject, setEdSubject] = useState<SubjectId>('physics');
  const [edDifficulty, setEdDifficulty] = useState<QuestionDifficulty>('Medium');
  const [edPrompt, setEdPrompt] = useState('');
  const [edOptions, setEdOptions] = useState<QuestionOption[]>(DEFAULT_DRAFT_OPTIONS);
  const [edNumericalAns, setEdNumericalAns] = useState('');
  const [edNumericalTol, setEdNumericalTol] = useState('0.05');
  const [edExplanation, setEdExplanation] = useState('');
  const [edError, setEdError] = useState<string | null>(null);

  const mainScrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const hasHydratedWorkspaceRef = useRef(false);

  // Merge bank: Sample -> Cloud -> Local Custom/Edited (so local edits always win)
  const allQuestions = useMemo(() => {
    const map = new Map<string, Question>();
    for (const q of SAMPLE_QUESTIONS) map.set(q.id, q);
    for (const q of extraQuestions) map.set(q.id, q);
    return Array.from(map.values());
  }, [extraQuestions]);

  const questions = useMemo(() => {
    const map = new Map<string, Question>();
    for (const q of allQuestions) map.set(q.id, q);
    const picked = activeQuestionIds
      .map((id) => map.get(id))
      .filter((q): q is Question => Boolean(q));
    return picked.length > 0 ? picked : SAMPLE_QUESTIONS;
  }, [activeQuestionIds, allQuestions]);

  const safeIdx = Math.min(currentIdx, Math.max(0, questions.length - 1));
  const currentQ = questions[safeIdx];
  const currentHints = getHintsForQuestion(currentQ);
  const revealedCategories = revealedHintsByQ[currentQ.id] || [];
  const hiddenCategories = hiddenHintCatsByQ[currentQ.id] || [];
  const hintsCollapsed = Boolean(hintsCollapsedByQ[currentQ.id]);

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
    const [bms, nbs, notes, qSettings, logs, cTests, localCustomQs, cloudRes, savedSession] =
      await Promise.all([
        StorageService.getBookmarkedIds(),
        StorageService.getNotebooks(),
        StorageService.getQuestionNotes(),
        StorageService.getQuestionViewSettings(),
        StorageService.getAttemptLogs(),
        StorageService.getCustomTests(),
        StorageService.getCustomQuestions(),
        SupabaseService.fetchQuestionsWithStatus(),
        StorageService.getActiveTestSession(),
      ]);

    const cloudQs = cloudRes.questions || [];
    setCloudSyncError(cloudRes.errorInfo || null);

    const combinedExtra = [...cloudQs, ...localCustomQs];
    setBookmarkedIds(bms);
    setNotebooks(nbs);
    setQuestionNotes(notes);
    setViewSettings(qSettings);
    setTimerRunning(qSettings.autoStartTimer);
    setPriorStatusMap(getLatestQuestionStatusMap(logs));
    setSavedCustomTests(cTests);
    setExtraQuestions(combinedExtra);

    // Hydrate last active test session once on initial mount (unless externally launched)
    if (!hasHydratedWorkspaceRef.current) {
      hasHydratedWorkspaceRef.current = true;
      if (!initialSession && savedSession && savedSession.activeQuestionIds.length > 0) {
        const availableIds = new Set([
          ...SAMPLE_QUESTIONS.map((q) => q.id),
          ...combinedExtra.map((q) => q.id),
        ]);
        const validIds = savedSession.activeQuestionIds.filter((id) => availableIds.has(id));
        if (validIds.length > 0) {
          setSessionTitle(savedSession.sessionTitle || 'Custom Test Session');
          setActiveQuestionIds(validIds);
          setCurrentIdx(Math.min(savedSession.currentIdx || 0, validIds.length - 1));
          setDraftAnswers(savedSession.draftAnswers || {});
          setSubmittedAnswers(savedSession.submittedAnswers || {});
          setNumericalInputs(savedSession.numericalInputs || {});
          setIsPracticeMode(savedSession.isPracticeMode ?? true);
          setMarksPerCorrect(
            typeof savedSession.marksPerCorrect === 'number' && savedSession.marksPerCorrect > 0
              ? savedSession.marksPerCorrect
              : 4
          );
          setNegativeMarks(
            typeof savedSession.negativeMarks === 'number' && savedSession.negativeMarks >= 0
              ? savedSession.negativeMarks
              : 1
          );
          setTargetRank(savedSession.targetRank);
          setTotalCandidates(savedSession.totalCandidates || 10000);
          setIsSubmitted(Boolean(savedSession.isSubmitted));
          setSecondsElapsed(savedSession.secondsElapsed || 0);
          setQuestionSeconds(savedSession.questionSeconds || {});
        }
      }
      setSessionHydrated(true);
    }
  }, [initialSession]);

  useEffect(() => {
    loadPersistedState();
  }, [loadPersistedState]);

  // Persist active workspace state whenever core test session fields update
  useEffect(() => {
    if (!sessionHydrated) return;
    const snapshot: ActiveTestWorkspaceState = {
      sessionTitle,
      activeQuestionIds,
      currentIdx: safeIdx,
      draftAnswers,
      submittedAnswers,
      numericalInputs,
      isPracticeMode,
      marksPerCorrect,
      negativeMarks,
      targetRank,
      totalCandidates,
      isSubmitted,
      secondsElapsed,
      questionSeconds,
    };
    void StorageService.saveActiveTestSession(snapshot);
  }, [
    sessionHydrated,
    sessionTitle,
    activeQuestionIds,
    safeIdx,
    draftAnswers,
    submittedAnswers,
    numericalInputs,
    isPracticeMode,
    marksPerCorrect,
    negativeMarks,
    targetRank,
    totalCandidates,
    isSubmitted,
  ]);

  const openCustomBuilderModal = useCallback(() => {
    setCustomTitle('');
    setCustomSubjects([]);
    setCustomDifficulties([]);
    setCustomStatusFilter('all');
    setCustomQuestionLimit(5);
    setCustomCountInput('5');
    setBuilderMarksPerCorrect(String(marksPerCorrect));
    setBuilderNegativeMarks(String(negativeMarks));
    setBuilderTargetRank(targetRank ? String(targetRank) : '500');
    setBuilderTotalCandidates(String(totalCandidates || 10000));
    setBuilderFeedback(null);
    setBuilderApiError(null);
    setBuilderOpen(true);
  }, [marksPerCorrect, negativeMarks, targetRank, totalCandidates]);

  const applySessionLaunch = useCallback(
    (params: {
      title: string;
      questionIds: string[];
      practice: boolean;
      initialIndex?: number;
      marksPos?: number;
      marksNeg?: number;
      tgtRank?: number;
      cohortSize?: number;
    }) => {
      const validIds =
        params.questionIds.length > 0 ? params.questionIds : SAMPLE_QUESTIONS.map((q) => q.id);
      const nextIdx = Math.min(params.initialIndex || 0, Math.max(0, validIds.length - 1));
      const pos = typeof params.marksPos === 'number' && params.marksPos > 0 ? params.marksPos : 4;
      const neg = typeof params.marksNeg === 'number' && params.marksNeg >= 0 ? params.marksNeg : 1;
      const cohort =
        typeof params.cohortSize === 'number' && params.cohortSize >= 10
          ? Math.round(params.cohortSize)
          : 10000;

      setSessionTitle(params.title);
      setActiveQuestionIds(validIds);
      setIsPracticeMode(params.practice);
      setMarksPerCorrect(pos);
      setNegativeMarks(neg);
      setTargetRank(params.tgtRank);
      setTotalCandidates(cohort);
      setDraftAnswers({});
      setSubmittedAnswers({});
      setNumericalInputs({});
      setNumericalError(null);
      setRevealedHintsByQ({});
      setHiddenHintCatsByQ({});
      setHintsCollapsedByQ({});
      setIsSubmitted(false);
      setSecondsElapsed(0);
      setQuestionSeconds({});
      setCurrentIdx(nextIdx);
      setTimerRunning(viewSettings.autoStartTimer);
      setTimeout(() => {
        mainScrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 16);
    },
    [viewSettings.autoStartTimer]
  );

  // Respond to external session launch (e.g. Chapter Practice, Mistakes, Notebook, Custom Drill)
  useEffect(() => {
    if (!initialSession) return;
    hasHydratedWorkspaceRef.current = true;
    setSessionHydrated(true);
    applySessionLaunch({
      title: initialSession.title,
      questionIds: initialSession.questionIds,
      practice: initialSession.mode === 'practice',
      initialIndex: initialSession.initialQuestionIndex,
      marksPos: initialSession.marksPerCorrect,
      marksNeg: initialSession.negativeMarks,
      tgtRank: initialSession.targetRank,
      cohortSize: initialSession.totalCandidates,
    });
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

  // Live session + per-question timer (pauses automatically when switching tabs or submitted)
  useEffect(() => {
    if (!isFocused || isSubmitted || !timerRunning) return;
    const interval = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
      setQuestionSeconds((prev) => ({
        ...prev,
        [currentQ.id]: (prev[currentQ.id] || 0) + 1,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isFocused, isSubmitted, timerRunning, currentQ.id]);

  const navigateToQuestion = (nextIndex: number) => {
    const targetQ = questions[nextIndex];
    if (
      currentQ.type === 'single_mcq' ||
      currentQ.type === 'multiple_mcq' ||
      targetQ?.type === 'single_mcq' ||
      targetQ?.type === 'multiple_mcq'
    ) {
      SoundManager.playClick();
    }
    setCurrentIdx(nextIndex);
    setNumericalError(null);
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

  const commitQuestionAttempt = async (q: Question, finalAnswer: string | number) => {
    setSubmittedAnswers((prev) => ({ ...prev, [q.id]: finalAnswer }));
    const isCorrect = evaluateQuestionAnswer(q, finalAnswer);
    const spent = Math.max(5, questionSeconds[q.id] || 20);

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

    if (currentQ.type === 'multiple_mcq') {
      const currentSelected = parseMultiSelectAnswer(draftAnswers[currentQ.id]);
      const exists = currentSelected.includes(optId);
      const nextArr = exists
        ? currentSelected.filter((id) => id !== optId)
        : [...currentSelected, optId];
      const serialized = serializeMultiSelectAnswer(nextArr);
      setDraftAnswers((prev) => {
        const next = { ...prev };
        if (serialized) next[currentQ.id] = serialized;
        else delete next[currentQ.id];
        return next;
      });
      SoundManager.playClick();
      HapticManager.triggerSelection();
      return;
    }

    // single_mcq
    setDraftAnswers((prev) => ({ ...prev, [currentQ.id]: optId }));
    HapticManager.triggerSelection();
    if (!viewSettings.deferCorrectAnswer && isPracticeMode) {
      void commitQuestionAttempt(currentQ, optId);
    } else {
      SoundManager.playClick();
    }
  };

  const handleClearSelection = () => {
    if (isQuestionSubmitted) return;
    if (currentQ.type === 'single_mcq' || currentQ.type === 'multiple_mcq') {
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

    if (finalAnswer === undefined || finalAnswer === '') return;
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

  // Fixed Hint Handlers: clean per-question state without double-updater race
  const handleToggleHintCategory = (category: HintCategory) => {
    const qId = currentQ.id;
    const revealed = revealedHintsByQ[qId] || [];
    const hidden = hiddenHintCatsByQ[qId] || [];
    const collapsed = Boolean(hintsCollapsedByQ[qId]);

    if (!revealed.includes(category)) {
      setRevealedHintsByQ((prev) => ({
        ...prev,
        [qId]: [...(prev[qId] || []), category],
      }));
      setHiddenHintCatsByQ((prev) => ({
        ...prev,
        [qId]: (prev[qId] || []).filter((c) => c !== category),
      }));
      setHintsCollapsedByQ((prev) => ({ ...prev, [qId]: false }));
      if (viewSettings.playSounds) SoundManager.play('hint');
      HapticManager.triggerSelection();
      return;
    }

    if (collapsed) {
      setHintsCollapsedByQ((prev) => ({ ...prev, [qId]: false }));
      setHiddenHintCatsByQ((prev) => ({
        ...prev,
        [qId]: (prev[qId] || []).filter((c) => c !== category),
      }));
      HapticManager.triggerSelection();
      return;
    }

    // Individual toggle hide <-> show
    if (hidden.includes(category)) {
      setHiddenHintCatsByQ((prev) => ({
        ...prev,
        [qId]: (prev[qId] || []).filter((c) => c !== category),
      }));
    } else {
      setHiddenHintCatsByQ((prev) => ({
        ...prev,
        [qId]: [...(prev[qId] || []), category],
      }));
    }
    HapticManager.triggerSelection();
  };

  const handleHideAllHints = () => {
    setHintsCollapsedByQ((prev) => ({ ...prev, [currentQ.id]: true }));
    HapticManager.triggerSelection();
  };

  const handleShowOrToggleMainHint = () => {
    const qId = currentQ.id;
    const revealed = revealedHintsByQ[qId] || [];

    if (revealed.length === 0) {
      const firstHint = currentHints[0];
      if (firstHint) {
        handleToggleHintCategory(firstHint.category);
      }
      return;
    }

    // If currently collapsed OR all revealed hints were individually hidden -> expand & unhide
    if (hintsCollapsed || visibleHintItems.length === 0) {
      setHintsCollapsedByQ((prev) => ({ ...prev, [qId]: false }));
      setHiddenHintCatsByQ((prev) => ({ ...prev, [qId]: [] }));
      HapticManager.triggerSelection();
      return;
    }

    // If unrevealed hints still exist, reveal the next one cleanly
    const nextUnrevealed = currentHints.find((h) => !revealed.includes(h.category));
    if (nextUnrevealed) {
      handleToggleHintCategory(nextUnrevealed.category);
      return;
    }

    // All hints revealed and currently visible -> hide them cleanly
    setHintsCollapsedByQ((prev) => ({ ...prev, [qId]: true }));
    HapticManager.triggerSelection();
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

    for (const q of questions) {
      if (submittedAnswers[q.id] === undefined && draftAnswers[q.id] !== undefined) {
        const ans = draftAnswers[q.id];
        await StorageService.recordQuestionAttempt({
          questionId: q.id,
          subjectId: q.subjectId,
          chapterId: q.chapterId,
          difficulty: q.difficulty,
          isCorrect: evaluateQuestionAnswer(q, ans),
          timeSpentSeconds: Math.max(8, questionSeconds[q.id] || 25),
          selectedAnswer: ans,
          attemptedAt: new Date().toISOString(),
        });
      }
    }

    const summary = computeTestScoreAndRankSummary({
      questions,
      answers: mergedAnswers,
      marksPerCorrect,
      negativeMarks,
      targetRank,
      totalCandidates,
    });

    const attempt: TestAttempt = {
      id: 'att_' + Date.now(),
      testTitle: sessionTitle || (isPracticeMode ? 'Chapter Drill' : 'Timed Exam Simulation'),
      mode: isPracticeMode ? 'untimed' : 'timed',
      totalQuestions: summary.totalQuestions,
      timeSpentSeconds: secondsElapsed,
      correctAnswers: summary.correct,
      incorrectAnswers: summary.incorrect,
      unattempted: summary.unattempted,
      score: summary.score,
      maxScore: summary.maxScore,
      percentage: summary.percentage,
      marksPerCorrect: summary.marksPerCorrect,
      negativeMarks: summary.negativeMarks,
      estimatedPercentile: summary.estimatedPercentile,
      estimatedRank: summary.estimatedRank,
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
    setHiddenHintCatsByQ({});
    setHintsCollapsedByQ({});
    setIsSubmitted(false);
    setSecondsElapsed(0);
    setQuestionSeconds({});
    setCurrentIdx(0);
    setTimerRunning(viewSettings.autoStartTimer);
    setTimeout(() => {
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    }, 16);
  };

  // Builder Matching Questions (prioritizes user's custom/edited questions before sample bank)
  const orderedQuestionPool = useMemo(() => {
    const customFirst: Question[] = [];
    const sampleRest: Question[] = [];
    for (const q of allQuestions) {
      if (SAMPLE_QUESTION_ID_SET.has(q.id)) sampleRest.push(q);
      else customFirst.push(q);
    }
    return [...customFirst, ...sampleRest];
  }, [allQuestions]);

  const { filteredPool, builderMatches } = useMemo(() => {
    const allMatches = filterCustomQuestions(
      orderedQuestionPool,
      {
        subjectIds: customSubjects,
        difficulties: customDifficulties,
        statusFilter: customStatusFilter,
        limit: 'all',
      },
      priorStatusMap
    );
    const capped = filterCustomQuestions(
      orderedQuestionPool,
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
    orderedQuestionPool,
    customSubjects,
    customDifficulties,
    customStatusFilter,
    customQuestionLimit,
    priorStatusMap,
  ]);

  const parsedBuilderPos = Math.max(0.5, parseFloat(builderMarksPerCorrect) || 4);
  const parsedBuilderNeg = Math.max(0, parseFloat(builderNegativeMarks) || 0);
  const parsedBuilderTargetRank =
    builderTargetRank.trim() && parseInt(builderTargetRank, 10) >= 1
      ? parseInt(builderTargetRank, 10)
      : undefined;
  const parsedBuilderCohort = Math.max(10, parseInt(builderTotalCandidates, 10) || 10000);
  const effectiveTargetCount =
    customQuestionLimit === 'all'
      ? Math.max(filteredPool.length, 5)
      : Math.max(1, Math.min(50, customQuestionLimit));

  const previewTargetMax = parseFloat((effectiveTargetCount * parsedBuilderPos).toFixed(1));
  const previewTargetRatio = parsedBuilderTargetRank
    ? Math.max(0, Math.min(1, 1 - (parsedBuilderTargetRank - 1) / parsedBuilderCohort))
    : 0.9;
  const previewNeededScore = parseFloat((previewTargetMax * Math.pow(previewTargetRatio, 0.9)).toFixed(1));

  const handleLaunchCustomTest = async () => {
    if (customSubjects.length === 0 || customDifficulties.length === 0) {
      setBuilderFeedback('Select at least 1 subject and 1 difficulty first.');
      return;
    }

    let chosenIds = builderMatches.map((q) => q.id);

    // Optional top-up if user specified e.g. 10 Qs but only 4 matched in bank
    if (
      customAutoTopUp &&
      customQuestionLimit !== 'all' &&
      chosenIds.length < customQuestionLimit
    ) {
      setIsGeneratingCustom(true);
      try {
        const needed = Math.min(25, customQuestionLimit - chosenIds.length);
        const settings = await StorageService.getSettings();
        const topUp = await GeminiAIService.generateCustomQuestions({
          subjectIds: customSubjects,
          difficulties: customDifficulties,
          count: needed,
          topicHint: customTitle.trim() || undefined,
          reasoningMode: settings.aiReasoningPower || 'auto',
        });
        setBuilderApiError(topUp.isFallback ? topUp.errorInfo || null : null);
        if (topUp.questions.length > 0) {
          const mergedSaved = await StorageService.saveCustomQuestions(topUp.questions);
          setExtraQuestions((prev) => {
            const map = new Map<string, Question>();
            for (const q of prev) map.set(q.id, q);
            for (const q of mergedSaved) map.set(q.id, q);
            return Array.from(map.values());
          });
          chosenIds = [...chosenIds, ...topUp.questions.map((q) => q.id)];
        }
      } finally {
        setIsGeneratingCustom(false);
      }
    }

    if (chosenIds.length === 0) {
      setBuilderFeedback('No matching questions found. Try Adjust Filters or Generate Fresh Mix.');
      return;
    }

    if (customShuffleOrder && chosenIds.length > 1) {
      chosenIds = shuffleIds(chosenIds);
    }

    const title =
      customTitle.trim() ||
      `Custom ${customSubjects.map((s) => s.toUpperCase()).join(' + ')} (${chosenIds.length} Qs)`;

    const newConfig: CustomTestConfig = {
      id: 'ct_' + Date.now(),
      title,
      subjectIds: customSubjects,
      difficulties: customDifficulties,
      questionIds: chosenIds,
      mode: customMode,
      durationMinutes: Math.max(5, chosenIds.length * 3),
      marksPerCorrect: parsedBuilderPos,
      negativeMarks: parsedBuilderNeg,
      targetRank: parsedBuilderTargetRank,
      totalCandidates: parsedBuilderCohort,
      createdAt: new Date().toISOString(),
    };
    const updated = await StorageService.saveCustomTest(newConfig);
    setSavedCustomTests(updated);
    setBuilderOpen(false);
    applySessionLaunch({
      title,
      questionIds: newConfig.questionIds,
      practice: customMode === 'practice',
      marksPos: parsedBuilderPos,
      marksNeg: parsedBuilderNeg,
      tgtRank: parsedBuilderTargetRank,
      cohortSize: parsedBuilderCohort,
    });
    SoundManager.play('notify');
    HapticManager.triggerSuccess();
  };

  const handleGenerateAndLaunchCustomTest = async () => {
    if (customSubjects.length === 0 || customDifficulties.length === 0 || isGeneratingCustom) {
      setBuilderFeedback('Select at least 1 subject and 1 difficulty first.');
      return;
    }
    setIsGeneratingCustom(true);
    setBuilderFeedback(null);
    try {
      const settings = await StorageService.getSettings();
      const count = customQuestionLimit === 'all' ? 8 : Math.min(25, Math.max(1, customQuestionLimit));
      const res = await GeminiAIService.generateCustomQuestions({
        subjectIds: customSubjects,
        difficulties: customDifficulties,
        count,
        topicHint: customTitle.trim() || undefined,
        reasoningMode: settings.aiReasoningPower || 'auto',
      });
      setBuilderApiError(res.isFallback ? res.errorInfo || null : null);
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
        `Generated ${customSubjects.map((s) => s.toUpperCase()).join(' + ')} (${res.questions.length} Qs)`;
      const newConfig: CustomTestConfig = {
        id: 'ct_' + Date.now(),
        title,
        subjectIds: customSubjects,
        difficulties: customDifficulties,
        questionIds: res.questions.map((q) => q.id),
        mode: customMode,
        durationMinutes: Math.max(5, res.questions.length * 3),
        marksPerCorrect: parsedBuilderPos,
        negativeMarks: parsedBuilderNeg,
        targetRank: parsedBuilderTargetRank,
        totalCandidates: parsedBuilderCohort,
        createdAt: new Date().toISOString(),
      };
      const updatedTests = await StorageService.saveCustomTest(newConfig);
      setSavedCustomTests(updatedTests);
      setBuilderOpen(false);
      applySessionLaunch({
        title,
        questionIds: newConfig.questionIds,
        practice: customMode === 'practice',
        marksPos: parsedBuilderPos,
        marksNeg: parsedBuilderNeg,
        tgtRank: parsedBuilderTargetRank,
        cohortSize: parsedBuilderCohort,
      });
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
    applySessionLaunch({
      title: ct.title,
      questionIds: ct.questionIds,
      practice: ct.mode === 'practice',
      marksPos: ct.marksPerCorrect,
      marksNeg: ct.negativeMarks,
      tgtRank: ct.targetRank,
      cohortSize: ct.totalCandidates,
    });
  };

  const handleDeleteSavedCustomTest = async (testId: string) => {
    HapticManager.triggerSelection();
    const updated = await StorageService.deleteCustomTest(testId);
    setSavedCustomTests(updated);
  };

  // --- QUESTION MANAGER & EDITOR HANDLERS ---
  const openQuestionManager = (tab: 'list' | 'edit' = 'list', questionToEdit?: Question) => {
    setEdError(null);
    if (tab === 'edit') {
      if (questionToEdit) {
        setEditingQuestionId(questionToEdit.id);
        setEdType(questionToEdit.type);
        setEdSubject(questionToEdit.subjectId);
        setEdDifficulty(questionToEdit.difficulty);
        setEdPrompt(questionToEdit.prompt);
        setEdOptions(
          questionToEdit.options && questionToEdit.options.length >= 2
            ? questionToEdit.options.map((o) => ({ ...o }))
            : DEFAULT_DRAFT_OPTIONS.map((o) => ({ ...o }))
        );
        setEdNumericalAns(
          questionToEdit.numericalAnswer !== undefined ? String(questionToEdit.numericalAnswer) : ''
        );
        setEdNumericalTol(
          questionToEdit.numericalTolerance !== undefined
            ? String(questionToEdit.numericalTolerance)
            : '0.05'
        );
        setEdExplanation(questionToEdit.explanation || '');
      } else {
        setEditingQuestionId(null);
        setEdType('single_mcq');
        setEdSubject(currentQ.subjectId || 'physics');
        setEdDifficulty('Medium');
        setEdPrompt('');
        setEdOptions(DEFAULT_DRAFT_OPTIONS.map((o) => ({ ...o })));
        setEdNumericalAns('');
        setEdNumericalTol('0.05');
        setEdExplanation('');
      }
      setQmTab('edit');
    } else {
      setQmTab('list');
    }
    setQuestionManagerOpen(true);
  };

  const handleOpenQuestionFromManager = (q: Question) => {
    setQuestionManagerOpen(false);
    const existingIdx = activeQuestionIds.indexOf(q.id);
    if (existingIdx >= 0) {
      navigateToQuestion(existingIdx);
      return;
    }
    // Insert into current test right after currentIdx and jump straight to it
    const nextIds = [...activeQuestionIds, q.id];
    setActiveQuestionIds(nextIds);
    setCurrentIdx(nextIds.length - 1);
    setNumericalError(null);
  };

  const handleRemoveQuestionFromActiveOrBank = async (q: Question) => {
    HapticManager.triggerSelection();
    const isCustom = !SAMPLE_QUESTION_ID_SET.has(q.id);
    if (activeQuestionIds.includes(q.id) && activeQuestionIds.length > 1) {
      const nextIds = activeQuestionIds.filter((id) => id !== q.id);
      setActiveQuestionIds(nextIds);
      setCurrentIdx((idx) => Math.min(idx, nextIds.length - 1));
    }
    if (isCustom) {
      const remaining = await StorageService.deleteCustomQuestion(q.id);
      setExtraQuestions(remaining);
    }
  };

  const handleToggleEdOptionCorrect = (optId: string) => {
    if (edType === 'single_mcq') {
      setEdOptions((prev) => prev.map((o) => ({ ...o, isCorrect: o.id === optId })));
    } else {
      setEdOptions((prev) =>
        prev.map((o) => (o.id === optId ? { ...o, isCorrect: !o.isCorrect } : o))
      );
    }
  };

  const handleSaveEditedQuestion = async (openInActiveTest: boolean) => {
    setEdError(null);
    if (!edPrompt.trim()) {
      setEdError('Please enter the question prompt.');
      return;
    }

    let cleanedOptions: QuestionOption[] | undefined;
    let parsedNum: number | undefined;
    let parsedTol: number | undefined;

    if (edType === 'single_mcq' || edType === 'multiple_mcq') {
      const nonEmpty = edOptions
        .map((o, idx) => ({
          id: o.id || ['a', 'b', 'c', 'd', 'e'][idx] || `o${idx}`,
          text: o.text.trim(),
          isCorrect: o.isCorrect,
        }))
        .filter((o) => o.text.length > 0);
      if (nonEmpty.length < 2) {
        setEdError('Enter text for at least 2 answer options.');
        return;
      }
      if (!nonEmpty.some((o) => o.isCorrect)) {
        setEdError('Select at least one correct option.');
        return;
      }
      if (edType === 'single_mcq') {
        const firstCorrectIdx = nonEmpty.findIndex((o) => o.isCorrect);
        nonEmpty.forEach((o, idx) => {
          o.isCorrect = idx === firstCorrectIdx;
        });
      }
      cleanedOptions = nonEmpty;
    } else {
      const numVal = parseFloat(edNumericalAns.trim());
      if (isNaN(numVal)) {
        setEdError('Enter a valid integer or numerical answer.');
        return;
      }
      parsedNum = numVal;
      const tolVal = parseFloat(edNumericalTol.trim());
      parsedTol = !isNaN(tolVal) && tolVal >= 0 ? tolVal : 0.05;
    }

    const qId = editingQuestionId || `q_custom_${Date.now()}`;
    const existingQ = allQuestions.find((x) => x.id === editingQuestionId);
    const savedQ: Question = {
      id: qId,
      chapterId: existingQ?.chapterId || `ch_custom_${edSubject}`,
      subjectId: edSubject,
      type: edType,
      prompt: edPrompt.trim(),
      options: cleanedOptions,
      numericalAnswer: parsedNum,
      numericalTolerance: parsedTol,
      explanation:
        edExplanation.trim() ||
        (edType === 'numerical'
          ? `Exact numerical / integer answer is **${parsedNum}**.`
          : `Correct choice verified in **${edSubject.toUpperCase()}**.`),
      difficulty: edDifficulty,
      examOrigin: existingQ?.examOrigin || 'Custom Author',
      year: existingQ?.year || 2026,
      hints: existingQ?.hints,
    };

    const mergedSaved = await StorageService.saveCustomQuestions([savedQ]);
    setExtraQuestions((prev) => {
      const map = new Map<string, Question>();
      for (const q of prev) map.set(q.id, q);
      for (const q of mergedSaved) map.set(q.id, q);
      return Array.from(map.values());
    });

    if (openInActiveTest) {
      setQuestionManagerOpen(false);
      const existingIndex = activeQuestionIds.indexOf(savedQ.id);
      if (existingIndex >= 0) {
        setCurrentIdx(existingIndex);
      } else {
        const nextIds = [...activeQuestionIds, savedQ.id];
        setActiveQuestionIds(nextIds);
        setCurrentIdx(nextIds.length - 1);
      }
      // Clear submitted lock on edited question so user can immediately test it
      setSubmittedAnswers((prev) => {
        const copy = { ...prev };
        delete copy[savedQ.id];
        return copy;
      });
      setDraftAnswers((prev) => {
        const copy = { ...prev };
        delete copy[savedQ.id];
        return copy;
      });
    } else {
      setQmTab('list');
    }

    SoundManager.play('notify');
    HapticManager.triggerSuccess();
  };

  // Format timers
  const activeQSecs = questionSeconds[currentQ.id] || 0;
  const formatSecs = (total: number) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  const isCurrentBookmarked = bookmarkedIds.includes(currentQ.id);

  // Live Score & Projected Rank calculation from submitted answers + marking scheme
  const finalMap = isSubmitted ? { ...draftAnswers, ...submittedAnswers } : submittedAnswers;
  const scoreSummary = useMemo(
    () =>
      computeTestScoreAndRankSummary({
        questions,
        answers: finalMap,
        marksPerCorrect,
        negativeMarks,
        targetRank,
        totalCandidates,
      }),
    [questions, finalMap, marksPerCorrect, negativeMarks, targetRank, totalCandidates]
  );

  const currentAnswerIsCorrect =
    isQuestionSubmitted && activeSelection !== undefined
      ? evaluateQuestionAnswer(currentQ, activeSelection)
      : false;

  const canSubmitCurrentQuestion =
    !isQuestionSubmitted &&
    (currentQ.type === 'numerical'
      ? currentNumInput.trim() !== ''
      : Boolean(currentDraft && String(currentDraft).length > 0));

  const visibleHintItems = currentHints.filter(
    (h) => revealedCategories.includes(h.category) && !hiddenCategories.includes(h.category)
  );
  const shouldShowNoteBox =
    viewSettings.alwaysShowMyNote || noteEditorOpen || Boolean(questionNotes[currentQ.id]);

  const multiSelectedIds = useMemo(
    () =>
      currentQ.type === 'multiple_mcq'
        ? parseMultiSelectAnswer(activeSelection)
        : [],
    [currentQ.type, activeSelection]
  );

  const managerListQuestions = useMemo(() => {
    const base = qmScope === 'active' ? questions : orderedQuestionPool;
    const term = qmSearch.trim().toLowerCase();
    if (!term) return base;
    return base.filter(
      (q) =>
        q.prompt.toLowerCase().includes(term) ||
        q.subjectId.toLowerCase().includes(term) ||
        q.difficulty.toLowerCase().includes(term)
    );
  }, [qmScope, questions, orderedQuestionPool, qmSearch]);

  const formatCorrectAnswerLabel = (q: Question) => {
    if (q.type === 'numerical') return `Ans: ${q.numericalAnswer ?? 0}`;
    const corr = (q.options || [])
      .map((o, i) => (o.isCorrect ? String.fromCharCode(65 + i) : null))
      .filter(Boolean);
    return corr.length > 0 ? `Ans: ${corr.join(', ')}` : 'No Ans';
  };

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
          <Text style={[styles.testSubheading, { color: colors.textSecondary }]} numberOfLines={1}>
            Q{safeIdx + 1}/{questions.length} · +{marksPerCorrect}/-{negativeMarks} ·{' '}
            {targetRank ? `Goal #${targetRank}` : isPracticeMode ? 'Practice' : 'Exam'}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Question Editor / Bank Manager Button */}
          <TouchableOpacity
            onPress={() => openQuestionManager('list')}
            style={[
              styles.headerIconBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            accessibilityLabel="Manage & edit questions"
          >
            <ListChecks size={15} color={colors.text} />
          </TouchableOpacity>

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

      {/* Non-shrinking Question Number Pills Bar + Mode & Marking Strip */}
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
              const ok = evaluateQuestionAnswer(q, submittedAnswers[q.id]);
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
        {cloudSyncError && (
          <ApiErrorCard
            error={cloudSyncError}
            compact
            onRetry={() => {
              void loadPersistedState();
            }}
            onUseOffline={() => setCloudSyncError(null)}
            onDismiss={() => setCloudSyncError(null)}
          />
        )}

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
                  Score: {scoreSummary.score} / {scoreSummary.maxScore} ({scoreSummary.percentage}%)
                </Text>
                <View style={styles.resultStatsRow}>
                  <Text style={[styles.resultStats, { color: colors.success }]}>
                    ● {scoreSummary.correct} Correct
                  </Text>
                  <Text style={[styles.resultStats, { color: colors.error }]}>
                    ● {scoreSummary.incorrect} Incorrect
                  </Text>
                  <Text style={[styles.resultStats, { color: colors.textSecondary }]}>
                    ● {scoreSummary.unattempted} Skipped
                  </Text>
                </View>
              </View>
              <Button title="Retake" variant="outline" size="sm" onPress={handleRestart} />
            </View>

            <View
              style={[
                styles.rankImpactBar,
                {
                  backgroundColor: mode === 'dark' ? colors.card : '#FFFFFF',
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <View style={styles.rankImpactItem}>
                <Text style={[styles.rankImpactLabel, { color: colors.textSecondary }]}>
                  EST. PERCENTILE
                </Text>
                <Text style={[styles.rankImpactVal, { color: colors.primary }]}>
                  {scoreSummary.estimatedPercentile}%ile
                </Text>
              </View>
              <View style={styles.rankImpactItem}>
                <Text style={[styles.rankImpactLabel, { color: colors.textSecondary }]}>
                  PROJ. RANK
                </Text>
                <Text style={[styles.rankImpactVal, { color: colors.text }]}>
                  #{scoreSummary.estimatedRank.toLocaleString()} /{' '}
                  {scoreSummary.totalCandidates.toLocaleString()}
                </Text>
              </View>
              {scoreSummary.targetRank !== undefined && (
                <View style={styles.rankImpactItem}>
                  <Text style={[styles.rankImpactLabel, { color: colors.textSecondary }]}>
                    TARGET #{scoreSummary.targetRank}
                  </Text>
                  <Text
                    style={[
                      styles.rankImpactVal,
                      { color: scoreSummary.targetMet ? colors.success : colors.warning },
                    ]}
                  >
                    {scoreSummary.targetMet
                      ? 'Achieved!'
                      : `+${Math.abs(scoreSummary.rankDelta || 0)} ranks away`}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Question Metadata Badges + Add to Notebook / Edit Q / My Note Quick Strip */}
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
            {currentQ.type === 'multiple_mcq' && (
              <Badge label="MULTI CORRECT" variant="info" size="sm" />
            )}
            {currentQ.type === 'numerical' && (
              <Badge label="INTEGER / NUM" variant="info" size="sm" />
            )}
            {currentQ.examOrigin && <Badge label={currentQ.examOrigin} variant="neutral" size="sm" />}
          </View>

          <View style={styles.metaActionsRight}>
            <TouchableOpacity
              onPress={() => openQuestionManager('edit', currentQ)}
              style={[styles.miniUtilChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Edit3 size={12} color={colors.textSecondary} />
              <Text style={[styles.miniUtilText, { color: colors.text }]}>Edit</Text>
            </TouchableOpacity>
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

        {/* Question Prompt Card with Full LaTeX & Move/Zoom Support */}
        <Card style={styles.promptCard}>
          <RichMathText
            content={currentQ.prompt}
            fontSize={fontSizes.prompt}
            color={colors.text}
            accentColor={colors.primary}
            allowPanModal
            panTitle={`Question ${safeIdx + 1} · Prompt`}
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
                  allowPanModal
                  panTitle="My Personal Note (LaTeX)"
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
              <View style={styles.hintsLeftBtns}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleShowOrToggleMainHint}
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
                      : hintsCollapsed || visibleHintItems.length === 0
                      ? `Show Hints (${revealedCategories.length}/${currentHints.length})`
                      : revealedCategories.length < currentHints.length
                      ? `Next Hint (${revealedCategories.length}/${currentHints.length})`
                      : 'Hide Hints'}
                  </Text>
                </TouchableOpacity>

                {!hintsCollapsed && visibleHintItems.length > 0 && revealedCategories.length < currentHints.length && (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={handleHideAllHints}
                    style={[
                      styles.hideHintsMiniBtn,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                    accessibilityLabel="Hide hints"
                  >
                    <EyeOff size={13} color={colors.textSecondary} />
                    <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.textSecondary }}>
                      Hide
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.hintTypePills}>
                {currentHints.map((hint) => {
                  const unlocked = revealedCategories.includes(hint.category);
                  const hidden = hintsCollapsed || hiddenCategories.includes(hint.category);
                  const activeShown = unlocked && !hidden;
                  const meta = HINT_META[hint.category];
                  const tint = mode === 'dark' ? meta.accentDark : meta.accentLight;
                  return (
                    <TouchableOpacity
                      key={hint.id}
                      activeOpacity={0.75}
                      onPress={() => handleToggleHintCategory(hint.category)}
                      style={[
                        styles.hintTypeChip,
                        {
                          backgroundColor: activeShown ? tint + '24' : colors.card,
                          borderColor: activeShown ? tint : unlocked ? colors.borderSubtle : colors.border,
                          opacity: unlocked && hidden ? 0.72 : 1,
                        },
                      ]}
                    >
                      {hint.category === 'concept' && (
                        <BookOpen size={12} color={activeShown ? tint : colors.textSecondary} />
                      )}
                      {hint.category === 'formula' && (
                        <FunctionSquare size={12} color={activeShown ? tint : colors.textSecondary} />
                      )}
                      {hint.category === 'strategy' && (
                        <Compass size={12} color={activeShown ? tint : colors.textSecondary} />
                      )}
                      <Text
                        style={[
                          styles.hintTypeChipText,
                          { color: activeShown ? tint : colors.textSecondary },
                        ]}
                      >
                        {meta.shortLabel}
                      </Text>
                      {unlocked && (activeShown ? <Eye size={10} color={tint} /> : <EyeOff size={10} color={colors.textSecondary} />)}
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
                        <TouchableOpacity
                          onPress={() => handleToggleHintCategory(hint.category)}
                          hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                        >
                          <Text style={[styles.hintTagText, { color: tint }]}>
                            {meta.shortLabel.toUpperCase()}
                          </Text>
                          <EyeOff size={12} color={tint} />
                        </TouchableOpacity>
                      </View>
                      <RichMathText
                        content={hint.content}
                        fontSize={fontSizes.solution}
                        color={colors.text}
                        accentColor={tint}
                        allowPanModal
                        panTitle={`Hint ${idx + 1} · ${hint.title}`}
                      />
                    </Card>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Option Selection Area (Single MCQ, Multiple MCQ, or Numerical Input) */}
        {(currentQ.type === 'single_mcq' || currentQ.type === 'multiple_mcq') && currentQ.options ? (
          <View style={styles.optionsList}>
            {currentQ.type === 'multiple_mcq' && (
              <Text style={[styles.multiHintBanner, { color: colors.info }]}>
                Multiple Correct MCQ — select all correct choices, then tap Submit Answer.
              </Text>
            )}
            {currentQ.options.map((opt, oIdx) => {
              const isSelected =
                currentQ.type === 'multiple_mcq'
                  ? multiSelectedIds.includes(opt.id)
                  : activeSelection === opt.id;
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
                        currentQ.type === 'multiple_mcq' ? styles.checkboxSquare : styles.radioCircle,
                        { borderColor: radioBorder, backgroundColor: radioFill },
                      ]}
                    >
                      {isSelected &&
                        (currentQ.type === 'multiple_mcq' ? (
                          <Check size={12} color="#FFFFFF" />
                        ) : (
                          <View style={styles.radioDot} />
                        ))}
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

                    <TouchableOpacity
                      onPress={(e) => {
                        e?.stopPropagation?.();
                        setPanOptionTarget({
                          label: `Option ${String.fromCharCode(65 + oIdx)}`,
                          text: opt.text,
                        });
                      }}
                      hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                      style={[
                        styles.optPanBtn,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                      accessibilityLabel={`Pan Option ${String.fromCharCode(65 + oIdx)} formula`}
                    >
                      <Move size={11} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {revealGrading && isCorrectOpt && (
                      <CheckCircle2 size={18} color={colors.success} style={{ marginLeft: 8 }} />
                    )}
                    {revealGrading && isSelected && !isCorrectOpt && (
                      <XCircle size={18} color={colors.error} style={{ marginLeft: 8 }} />
                    )}
                  </View>

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
              Enter Integer / Numerical Value:
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
                    : currentQ.type === 'numerical'
                    ? 'Enter Value to Submit'
                    : 'Select an Option to Submit'
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
                      ? `Correct Answer (+25 XP · +${marksPerCorrect} marks)`
                      : activeSelection !== undefined
                      ? currentQ.type === 'numerical'
                        ? `Incorrect (-${negativeMarks}) · Correct: ${currentQ.numericalAnswer}`
                        : `Incorrect (-${negativeMarks} mark · +10 XP effort)`
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

        {/* Step-by-Step Solution Sheet */}
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
              allowPanModal
              panTitle={`Question ${safeIdx + 1} · Step-by-Step Solution`}
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

      {/* MODAL 1: QUESTION VIEW SETTINGS */}
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
                    trackColor={{ false: '#475569', true: colors.primary }}
                    thumbColor={viewSettings[item.key] ? '#FFFFFF' : '#E2E8F0'}
                    ios_backgroundColor="#475569"
                    {...({ activeThumbColor: '#FFFFFF' } as object)}
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
                  title: 'Show peer insights',
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
                    trackColor={{ false: '#475569', true: colors.primary }}
                    thumbColor={viewSettings[item.key] ? '#FFFFFF' : '#E2E8F0'}
                    ios_backgroundColor="#475569"
                    {...({ activeThumbColor: '#FFFFFF' } as object)}
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

      {/* MODAL 2: CREATE YOUR OWN TEST BUILDER (with Question Count, Marking, Rank Target & Question Manager shortcut) */}
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => {
                    setBuilderOpen(false);
                    openQuestionManager('list');
                  }}
                  style={[styles.manageShortcutBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Edit3 size={12} color={colors.primary} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>Edit Qs</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setBuilderOpen(false)} accessibilityLabel="Close custom test builder">
                  <X size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
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
                  NUMBER OF QUESTIONS & TEST OPTIONS
                </Text>
                <View style={[styles.chipWrap, { marginBottom: 8, alignItems: 'center' }]}>
                  {([3, 5, 10, 15, 'all'] as CustomQuestionLimit[]).map((lim) => {
                    const selected = customQuestionLimit === lim;
                    return (
                      <TouchableOpacity
                        key={String(lim)}
                        onPress={() => {
                          setCustomQuestionLimit(lim);
                          if (typeof lim === 'number') setCustomCountInput(String(lim));
                        }}
                        style={[
                          styles.builderChip,
                          {
                            backgroundColor: selected ? colors.primary : colors.surface,
                            borderColor: selected ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: selected ? '#FFFFFF' : colors.text }}>
                          {lim === 'all' ? 'All Match' : `${lim} Qs`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <TextInput
                    value={customCountInput}
                    onChangeText={(txt) => {
                      const clean = txt.replace(/[^0-9]/g, '');
                      setCustomCountInput(clean);
                      const n = parseInt(clean, 10);
                      if (!isNaN(n) && n >= 1) {
                        setCustomQuestionLimit(Math.min(50, n));
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="Qty"
                    placeholderTextColor={colors.textSecondary}
                    style={[
                      styles.countInlineInput,
                      { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.primary },
                    ]}
                  />
                </View>

                <View style={styles.chipWrap}>
                  {(
                    [
                      { id: 'practice', label: 'Practice Mode' },
                      { id: 'exam', label: 'Timed Exam' },
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

                  <TouchableOpacity
                    onPress={() => setCustomShuffleOrder((s) => !s)}
                    style={[
                      styles.builderChip,
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                        backgroundColor: customShuffleOrder ? colors.infoBg : colors.surface,
                        borderColor: customShuffleOrder ? colors.info : colors.border,
                      },
                    ]}
                  >
                    <Shuffle size={12} color={customShuffleOrder ? colors.info : colors.textSecondary} />
                    <Text style={{ fontSize: 11.5, fontWeight: '700', color: customShuffleOrder ? colors.info : colors.text }}>
                      Shuffle
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setCustomAutoTopUp((t) => !t)}
                    style={[
                      styles.builderChip,
                      {
                        backgroundColor: customAutoTopUp ? colors.successBg : colors.surface,
                        borderColor: customAutoTopUp ? colors.success : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 11.5, fontWeight: '700', color: customAutoTopUp ? colors.success : colors.text }}>
                      Auto Fill Qty
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Marking Scheme & Rank Target Section (directly impacts Score & Projected Rank) */}
              <View>
                <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>
                  MARKING SCHEME & TARGET RANK
                </Text>
                <View style={[styles.chipWrap, { marginBottom: 8 }]}>
                  {[
                    { label: '+4 / -1', pos: '4', neg: '1' },
                    { label: '+4 / 0', pos: '4', neg: '0' },
                    { label: '+1 / 0', pos: '1', neg: '0' },
                    { label: '+2 / -0.5', pos: '2', neg: '0.5' },
                  ].map((preset) => {
                    const active =
                      builderMarksPerCorrect === preset.pos && builderNegativeMarks === preset.neg;
                    return (
                      <TouchableOpacity
                        key={preset.label}
                        onPress={() => {
                          setBuilderMarksPerCorrect(preset.pos);
                          setBuilderNegativeMarks(preset.neg);
                        }}
                        style={[
                          styles.builderChip,
                          {
                            paddingVertical: 6,
                            backgroundColor: active ? colors.primary : colors.surface,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                          {preset.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.numericGrid4}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.miniFieldLabel, { color: colors.textSecondary }]}>+ Correct</Text>
                    <TextInput
                      keyboardType="numeric"
                      value={builderMarksPerCorrect}
                      onChangeText={setBuilderMarksPerCorrect}
                      style={[
                        styles.builderInputCompact,
                        { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                      ]}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.miniFieldLabel, { color: colors.textSecondary }]}>- Wrong</Text>
                    <TextInput
                      keyboardType="numeric"
                      value={builderNegativeMarks}
                      onChangeText={setBuilderNegativeMarks}
                      style={[
                        styles.builderInputCompact,
                        { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                      ]}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.miniFieldLabel, { color: colors.textSecondary }]}>Target Rank</Text>
                    <TextInput
                      keyboardType="numeric"
                      value={builderTargetRank}
                      onChangeText={setBuilderTargetRank}
                      placeholder="500"
                      placeholderTextColor={colors.textSecondary}
                      style={[
                        styles.builderInputCompact,
                        { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                      ]}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.miniFieldLabel, { color: colors.textSecondary }]}>Cohort</Text>
                    <TextInput
                      keyboardType="numeric"
                      value={builderTotalCandidates}
                      onChangeText={setBuilderTotalCandidates}
                      placeholder="10000"
                      placeholderTextColor={colors.textSecondary}
                      style={[
                        styles.builderInputCompact,
                        { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                      ]}
                    />
                  </View>
                </View>
              </View>

              {/* Builder Selection Status & Live Score / Rank Impact Box */}
              <View
                style={[
                  styles.builderStatusBox,
                  {
                    backgroundColor: colors.surface,
                    borderColor:
                      customSubjects.length === 0 || customDifficulties.length === 0
                        ? colors.warning
                        : colors.primary,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Target size={14} color={colors.primary} />
                  <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text }}>
                    Max Score: {previewTargetMax} pts
                    {parsedBuilderTargetRank
                      ? ` · Rank #${parsedBuilderTargetRank} target ≈ ${previewNeededScore}/${previewTargetMax}`
                      : ''}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 11.5,
                    fontWeight: '600',
                    color:
                      customSubjects.length === 0 || customDifficulties.length === 0
                        ? colors.warning
                        : colors.textSecondary,
                  }}
                >
                  {customSubjects.length === 0 || customDifficulties.length === 0
                    ? 'Select at least 1 subject and 1 difficulty to build your custom test.'
                    : `Matched ${filteredPool.length} bank Qs (${builderMatches.length} selected${
                        customAutoTopUp &&
                        customQuestionLimit !== 'all' &&
                        builderMatches.length < customQuestionLimit
                          ? ` + ${customQuestionLimit - builderMatches.length} auto-generated`
                          : ''
                      }).`}
                </Text>
              </View>

              {builderFeedback && (
                <Text style={{ color: colors.error, fontSize: 12, fontWeight: '600' }}>
                  {builderFeedback}
                </Text>
              )}

              {builderApiError && (
                <ApiErrorCard
                  error={builderApiError}
                  compact
                  onRetry={() => {
                    void handleGenerateAndLaunchCustomTest();
                  }}
                  onUseOffline={() => setBuilderApiError(null)}
                  onDismiss={() => setBuilderApiError(null)}
                />
              )}

              <Button
                title={`Launch Custom Test (${
                  customAutoTopUp && customQuestionLimit !== 'all'
                    ? customQuestionLimit
                    : builderMatches.length
                } Qs · ${previewTargetMax} pts)`}
                disabled={
                  customSubjects.length === 0 ||
                  customDifficulties.length === 0 ||
                  isGeneratingCustom ||
                  (!customAutoTopUp && builderMatches.length === 0)
                }
                loading={isGeneratingCustom}
                onPress={handleLaunchCustomTest}
              />

              <Button
                title={
                  isGeneratingCustom
                    ? 'Generating Fresh Custom Test...'
                    : `Generate Fresh AI Mix (${
                        customQuestionLimit === 'all' ? 8 : Math.min(25, Math.max(1, customQuestionLimit))
                      } Qs)`
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
                  {savedCustomTests.slice(0, 5).map((ct) => (
                    <View
                      key={ct.id}
                      style={[
                        styles.savedTestRow,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                    >
                      <TouchableOpacity
                        style={{ flex: 1, paddingRight: 10 }}
                        onPress={() => launchSavedCustomTest(ct)}
                      >
                        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }} numberOfLines={1}>
                          {ct.title}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                          {ct.questionIds.length} Qs · +{ct.marksPerCorrect || 4}/-{ct.negativeMarks ?? 1} ·{' '}
                          {ct.targetRank ? `Target #${ct.targetRank}` : ct.mode.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <TouchableOpacity onPress={() => launchSavedCustomTest(ct)}>
                          <Play size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteSavedCustomTest(ct.id)}>
                          <Trash2 size={15} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: QUESTION MANAGER & EDITOR (Open / Add / Edit / Remove & Set MCQ/Integer Answers) */}
      <Modal
        visible={questionManagerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setQuestionManagerOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.hintTitleGroup}>
                <ListChecks size={18} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {qmTab === 'list'
                    ? 'Question Bank & Active Deck'
                    : editingQuestionId
                    ? 'Edit Question & Answer'
                    : 'Add New Question'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  qmTab === 'edit' ? setQmTab('list') : setQuestionManagerOpen(false)
                }
                accessibilityLabel="Close question manager"
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {qmTab === 'list' ? (
              <ScrollView style={styles.modalScroll} contentContainerStyle={{ gap: 10, paddingVertical: 14 }}>
                <View style={styles.qmTopControls}>
                  <View style={styles.qmScopeRow}>
                    {(
                      [
                        { id: 'active', label: `In Test (${questions.length})` },
                        { id: 'all', label: `All Bank (${allQuestions.length})` },
                      ] as const
                    ).map((t) => {
                      const active = qmScope === t.id;
                      return (
                        <TouchableOpacity
                          key={t.id}
                          onPress={() => setQmScope(t.id)}
                          style={[
                            styles.builderChip,
                            {
                              paddingVertical: 6,
                              backgroundColor: active ? colors.primary : colors.surface,
                              borderColor: active ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text style={{ fontSize: 11.5, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                            {t.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Button
                    title="Add Q"
                    size="sm"
                    onPress={() => openQuestionManager('edit')}
                    icon={<Plus size={14} color="#FFFFFF" />}
                  />
                </View>

                <TextInput
                  value={qmSearch}
                  onChangeText={setQmSearch}
                  placeholder="Search questions by topic, formula, or subject..."
                  placeholderTextColor={colors.textSecondary}
                  style={[
                    styles.builderInput,
                    { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                  ]}
                />

                {managerListQuestions.length === 0 && (
                  <EmptyResourceCard
                    title="No Questions Found"
                    message={
                      qmSearch.trim()
                        ? `No questions matched "${qmSearch.trim()}" in ${
                            qmScope === 'active' ? 'the active test' : 'the question bank'
                          }.`
                        : 'No questions available in this view yet.'
                    }
                    actionLabel={qmSearch.trim() ? 'Clear Search' : 'Add Question'}
                    onAction={() => {
                      if (qmSearch.trim()) setQmSearch('');
                      else openQuestionManager('edit');
                    }}
                    secondaryLabel={qmScope === 'active' ? 'Search All Bank' : undefined}
                    onSecondaryAction={qmScope === 'active' ? () => setQmScope('all') : undefined}
                  />
                )}

                {managerListQuestions.map((q, idx) => {
                  const isInActive = activeQuestionIds.includes(q.id);
                  const canRemove =
                    (isInActive && activeQuestionIds.length > 1) || !SAMPLE_QUESTION_ID_SET.has(q.id);
                  return (
                    <View
                      key={q.id}
                      style={[
                        styles.qmCard,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                    >
                      <View style={styles.qmCardMeta}>
                        <Badge
                          label={`${q.subjectId.toUpperCase()} · ${
                            q.type === 'multiple_mcq'
                              ? 'MULTI MCQ'
                              : q.type === 'numerical'
                              ? 'INTEGER'
                              : 'MCQ'
                          }`}
                          variant="primary"
                          size="sm"
                        />
                        <Badge label={formatCorrectAnswerLabel(q)} variant="success" size="sm" />
                      </View>
                      <Text style={{ color: colors.text, fontSize: 12.5, fontWeight: '600' }} numberOfLines={2}>
                        {idx + 1}. {formatPromptSnippet(q.prompt)}
                      </Text>
                      <View style={styles.qmCardActions}>
                        <TouchableOpacity
                          onPress={() => handleOpenQuestionFromManager(q)}
                          style={[styles.qmActionBtn, { borderColor: colors.primary, backgroundColor: colors.card }]}
                        >
                          <Play size={12} color={colors.primary} />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>
                            Open
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => openQuestionManager('edit', q)}
                          style={[styles.qmActionBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
                        >
                          <Edit3 size={12} color={colors.text} />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>
                            Edit
                          </Text>
                        </TouchableOpacity>
                        {canRemove && (
                          <TouchableOpacity
                            onPress={() => handleRemoveQuestionFromActiveOrBank(q)}
                            style={[styles.qmActionBtn, { borderColor: colors.error, backgroundColor: colors.card }]}
                          >
                            <Trash2 size={12} color={colors.error} />
                            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.error }}>
                              Remove
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <ScrollView style={styles.modalScroll} contentContainerStyle={{ gap: 12, paddingVertical: 14 }}>
                {edError && (
                  <View style={[styles.edErrorBox, { backgroundColor: colors.errorBg, borderColor: colors.error }]}>
                    <Text style={{ color: mode === 'dark' ? '#FCA5A5' : colors.error, fontSize: 12, fontWeight: '700' }}>
                      {edError}
                    </Text>
                  </View>
                )}

                <View>
                  <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>
                    QUESTION TYPE
                  </Text>
                  <View style={styles.chipWrap}>
                    {(
                      [
                        { id: 'single_mcq', label: 'Single MCQ' },
                        { id: 'multiple_mcq', label: 'Multiple Correct' },
                        { id: 'numerical', label: 'Integer / Numerical' },
                      ] as const
                    ).map((qt) => {
                      const active = edType === qt.id;
                      return (
                        <TouchableOpacity
                          key={qt.id}
                          onPress={() => setEdType(qt.id)}
                          style={[
                            styles.builderChip,
                            {
                              backgroundColor: active ? colors.primary : colors.surface,
                              borderColor: active ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text style={{ fontSize: 11.5, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                            {qt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.numericGrid4}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>SUBJECT</Text>
                    <View style={styles.chipWrap}>
                      {SUBJECTS.map((s) => {
                        const active = edSubject === s.id;
                        return (
                          <TouchableOpacity
                            key={s.id}
                            onPress={() => setEdSubject(s.id)}
                            style={[
                              styles.builderChip,
                              {
                                paddingVertical: 5,
                                paddingHorizontal: 8,
                                backgroundColor: active ? colors.primary : colors.surface,
                                borderColor: active ? colors.primary : colors.border,
                              },
                            ]}
                          >
                            <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                              {s.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                <View>
                  <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>DIFFICULTY</Text>
                  <View style={styles.chipWrap}>
                    {(['Easy', 'Medium', 'Hard'] as QuestionDifficulty[]).map((d) => {
                      const active = edDifficulty === d;
                      return (
                        <TouchableOpacity
                          key={d}
                          onPress={() => setEdDifficulty(d)}
                          style={[
                            styles.builderChip,
                            {
                              paddingVertical: 6,
                              backgroundColor: active ? colors.secondary : colors.surface,
                              borderColor: active ? colors.secondary : colors.border,
                            },
                          ]}
                        >
                          <Text style={{ fontSize: 11.5, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                            {d}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View>
                  <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>
                    QUESTION PROMPT (LATEX $...$ SUPPORTED) *
                  </Text>
                  <TextInput
                    multiline
                    value={edPrompt}
                    onChangeText={setEdPrompt}
                    placeholder="e.g. Find the acceleration of a solid sphere rolling down a $30^\\circ$ incline..."
                    placeholderTextColor={colors.textSecondary}
                    style={[
                      styles.myNoteInput,
                      { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border, minHeight: 74 },
                    ]}
                  />
                </View>

                {edType === 'numerical' ? (
                  <View style={styles.numericGrid4}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>
                        CORRECT INTEGER / VALUE *
                      </Text>
                      <TextInput
                        keyboardType="numeric"
                        value={edNumericalAns}
                        onChangeText={setEdNumericalAns}
                        placeholder="e.g. 25"
                        placeholderTextColor={colors.textSecondary}
                        style={[
                          styles.builderInput,
                          { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.primary },
                        ]}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>
                        TOLERANCE (±)
                      </Text>
                      <TextInput
                        keyboardType="numeric"
                        value={edNumericalTol}
                        onChangeText={setEdNumericalTol}
                        placeholder="0.05"
                        placeholderTextColor={colors.textSecondary}
                        style={[
                          styles.builderInput,
                          { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                        ]}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={{ gap: 8 }}>
                    <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>
                      OPTIONS — TAP CHECKBOX TO SET {edType === 'multiple_mcq' ? 'CORRECT ANSWERS' : 'CORRECT ANSWER'}
                    </Text>
                    {edOptions.map((opt, idx) => (
                      <View key={opt.id} style={styles.edOptionRow}>
                        <TouchableOpacity
                          onPress={() => handleToggleEdOptionCorrect(opt.id)}
                          style={[
                            styles.edCorrectToggle,
                            {
                              borderRadius: edType === 'multiple_mcq' ? 6 : 12,
                              backgroundColor: opt.isCorrect ? colors.success : colors.surface,
                              borderColor: opt.isCorrect ? colors.success : colors.border,
                            },
                          ]}
                        >
                          {opt.isCorrect && <Check size={14} color="#FFFFFF" />}
                        </TouchableOpacity>
                        <Text style={{ fontWeight: '800', color: colors.textSecondary, width: 18 }}>
                          {String.fromCharCode(65 + idx)}.
                        </Text>
                        <TextInput
                          value={opt.text}
                          onChangeText={(txt) =>
                            setEdOptions((prev) =>
                              prev.map((o, i) => (i === idx ? { ...o, text: txt } : o))
                            )
                          }
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          placeholderTextColor={colors.textSecondary}
                          style={[
                            styles.builderInput,
                            { flex: 1, color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                          ]}
                        />
                      </View>
                    ))}
                  </View>
                )}

                <View>
                  <Text style={[styles.modalSectionLabel, { color: colors.textSecondary }]}>
                    STEP-BY-STEP SOLUTION (OPTIONAL)
                  </Text>
                  <TextInput
                    multiline
                    value={edExplanation}
                    onChangeText={setEdExplanation}
                    placeholder="Explain the key formula and substitution..."
                    placeholderTextColor={colors.textSecondary}
                    style={[
                      styles.myNoteInput,
                      { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                    ]}
                  />
                </View>

                <View style={styles.edFooterBtns}>
                  <Button
                    title="Back"
                    variant="outline"
                    size="sm"
                    onPress={() => setQmTab('list')}
                  />
                  <Button
                    title="Save to Bank"
                    variant="secondary"
                    size="sm"
                    onPress={() => handleSaveEditedQuestion(false)}
                  />
                  <Button
                    title="Save & Open"
                    variant="primary"
                    size="sm"
                    onPress={() => handleSaveEditedQuestion(true)}
                  />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL 4: SAVE QUESTION TO NOTEBOOK PICKER */}
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

      {/* MODAL 5: MOVEABLE / ZOOMABLE MCQ OPTION INSPECTOR */}
      <MathPanModal
        visible={Boolean(panOptionTarget)}
        onClose={() => setPanOptionTarget(null)}
        content={panOptionTarget?.text || ''}
        title={panOptionTarget ? `Question ${safeIdx + 1} · ${panOptionTarget.label}` : 'Option Canvas'}
      />

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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 0 },
  headerIconBtn: {
    width: 31,
    height: 31,
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
    paddingHorizontal: 8,
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
  resultCard: { padding: 16, marginBottom: 14, borderWidth: 1, gap: 12 },
  resultRow: { flexDirection: 'row', alignItems: 'center' },
  resultScore: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  resultStatsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' },
  resultStats: { fontSize: 12 },
  rankImpactBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 10,
    flexWrap: 'wrap',
  },
  rankImpactItem: { flex: 1, minWidth: 92 },
  rankImpactLabel: { fontSize: 9.5, fontWeight: '800', letterSpacing: 0.4 },
  rankImpactVal: { fontSize: 13.5, fontWeight: '800', marginTop: 2 },
  qMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
    flexWrap: 'wrap',
  },
  metaBadgesLeft: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
  metaActionsRight: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
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
    paddingVertical: 10,
  },
  hintsSection: { marginBottom: 14 },
  hintsToolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  hintsLeftBtns: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mainHintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.25,
  },
  hideHintsMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 11,
    borderWidth: 1,
  },
  mainHintBtnText: { fontSize: 12, fontWeight: '700' },
  hintTypePills: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
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
  multiHintBanner: { fontSize: 11.5, fontWeight: '700', marginBottom: 2 },
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
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  optionLabelPrefix: { fontSize: 13.5, fontWeight: '700', marginRight: 8 },
  optionMathWrap: { flex: 1, minWidth: 0 },
  optPanBtn: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    overflow: 'hidden',
  },
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
  modalSheet: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalHeaderActions: { flexDirection: 'row', alignItems: 'center' },
  modalTitle: { fontSize: 16, fontWeight: '800' },
  modalScroll: { paddingHorizontal: 20 },
  modalSectionLabel: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.7, marginBottom: 6 },
  manageShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
  },
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
  countInlineInput: {
    width: 60,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  numericGrid4: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  miniFieldLabel: { fontSize: 10, fontWeight: '700', marginBottom: 4 },
  builderInputCompact: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 7,
    fontSize: 13,
    fontWeight: '700',
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  builderChip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  savedTestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  qmTopControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  qmScopeRow: { flexDirection: 'row', gap: 8 },
  qmCard: { padding: 12, borderRadius: 12, borderWidth: 1, gap: 8 },
  qmCardMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  qmCardActions: { flexDirection: 'row', gap: 8, marginTop: 2 },
  qmActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  edErrorBox: { padding: 10, borderRadius: 10, borderWidth: 1 },
  edOptionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  edCorrectToggle: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  edFooterBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingTop: 4, flexWrap: 'wrap' },
  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 20 },
  centerCard: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
  },
  modalHeaderNoBorder: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nbPickRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  nbColorDot: { width: 12, height: 12, borderRadius: 6 },
});

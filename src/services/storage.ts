import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppSettings,
  CustomNotebook,
  CustomTestConfig,
  DailyGoalConfig,
  FormulaStatus,
  OfflineTestRecord,
  Question,
  QuestionAttemptStat,
  QuestionViewSettings,
  TestAttempt,
  UserProfile,
} from '../types';
import { buildSeedAttemptLogs, XP_ATTEMPTED, XP_CORRECT } from '../utils/activityStats';

const KEYS = {
  USER_PROFILE: '@study_labs_user_profile',
  OFFLINE_TESTS: '@study_labs_offline_tests',
  TEST_ATTEMPTS: '@study_labs_test_attempts',
  BOOKMARKS: '@study_labs_bookmarks',
  SYLLABUS_PROGRESS: '@study_labs_syllabus_progress',
  CHAT_MESSAGES: '@study_labs_chat_messages',
  SETTINGS: '@study_labs_settings',
  QUESTION_VIEW_SETTINGS: '@study_labs_question_view_settings',
  ATTEMPT_LOGS: '@study_labs_attempt_logs',
  QUESTION_NOTES: '@study_labs_question_notes',
  DAILY_GOAL: '@study_labs_daily_goal',
  NOTEBOOKS: '@study_labs_notebooks',
  FORMULA_STATUSES: '@study_labs_formula_statuses',
  CUSTOM_TESTS: '@study_labs_custom_tests',
  CUSTOM_QUESTIONS: '@study_labs_custom_questions',
};

export const DEFAULT_SETTINGS: AppSettings = {
  masterSound: true,
  correctSound: true,
  incorrectSound: true,
  completionSound: true,
  clickSound: true,
  hapticFeedback: true,
  celebrationParticles: true,
  reducedMotion: false,
  particleIntensity: 'standard',
  aiReasoningPower: 'auto',
};

export const DEFAULT_QUESTION_VIEW_SETTINGS: QuestionViewSettings = {
  showHints: true,
  alwaysShowMyNote: false,
  solutionModeOnReopen: false,
  autoStartTimer: true,
  playSounds: true,
  deferCorrectAnswer: true,
  textSize: 'medium',
  showPeerInsights: true,
};

export const DEFAULT_DAILY_GOAL: DailyGoalConfig = {
  targetQuestions: 15,
  reminderEnabled: true,
  reminderTime: '20:00',
  scoreAlertsEnabled: true,
  pushNotifications: true,
  emailNotifications: false,
};

export const SEED_NOTEBOOKS: CustomNotebook[] = [
  {
    id: 'nb_high_yield',
    name: 'High-Yield Must Revise',
    color: '#F97316',
    questionIds: ['q_p1', 'q_c1', 'q_m2'],
    createdAt: '2026-11-01T10:00:00.000Z',
  },
  {
    id: 'nb_tricky_concepts',
    name: 'Tricky Numerical & Mechanisms',
    color: '#22D3EE',
    questionIds: ['q_p2', 'q_m1'],
    createdAt: '2026-11-03T12:00:00.000Z',
  },
];

// Default User Profile for immediate local functionality
export const DEFAULT_USER: UserProfile = {
  id: 'usr_local_01',
  ioId: 'STUDY-7734-IO',
  name: 'Aarav Sharma',
  email: 'aarav@study.io',
  country: 'India',
  board: 'JEE_MAIN',
  classGrade: 'Class 12',
  stream: 'Science (PCM)',
  targetYear: 2027,
  targetExams: ['JEE Main', 'JEE Advanced', 'BITSAT'],
  preferredMode: 'Normal',
  studyStreakDays: 14,
  totalXp: 3420,
  level: 8,
};

// Seed Offline Coaching Tests for realistic data & immediate visualization
export const SEED_OFFLINE_TESTS: OfflineTestRecord[] = [
  {
    id: 'off_01',
    testName: 'Major Test #1 - Mechanics & Electrostatics',
    instituteName: 'Allen Career Institute',
    date: '2026-10-14',
    testType: 'Part Test',
    subject: 'Physics',
    maxMarks: 100,
    obtainedMarks: 78,
    correctCount: 20,
    incorrectCount: 2,
    unattemptedCount: 3,
    rank: 42,
    totalCandidates: 850,
    syllabusCovered: 'Kinematics, NLM, Work Power Energy, Electrostatics I & II',
    notes: 'Good conceptual clarity in WPE; made silly calculation error in dipole torque.',
    calculatedPercentage: 78.0,
  },
  {
    id: 'off_02',
    testName: 'All India Test Series (AITS) Paper 1',
    instituteName: 'FIITJEE',
    date: '2026-10-21',
    testType: 'Full Syllabus Mock',
    subject: 'Full PCM',
    maxMarks: 300,
    obtainedMarks: 216,
    correctCount: 56,
    incorrectCount: 8,
    unattemptedCount: 11,
    rank: 128,
    totalCandidates: 4200,
    syllabusCovered: 'Class 11 & Class 12 Midterm Syllabus',
    notes: 'Math was lengthy. Need more speed in Integration and Coordinate Geometry.',
    calculatedPercentage: 72.0,
  },
  {
    id: 'off_03',
    testName: 'Organic Chemistry Revision Quiz',
    instituteName: 'Resonance',
    date: '2026-10-29',
    testType: 'Topic Drill',
    subject: 'Chemistry',
    maxMarks: 80,
    obtainedMarks: 68,
    correctCount: 18,
    incorrectCount: 4,
    unattemptedCount: 0,
    rank: 15,
    totalCandidates: 320,
    syllabusCovered: 'GOC, Hydrocarbons, Aldehydes & Ketones',
    notes: 'Strong in reaction mechanisms. Need to revise Grignard reagents.',
    calculatedPercentage: 85.0,
  },
  {
    id: 'off_04',
    testName: 'Weekly Sunday Drill - Calculus & Vectors',
    instituteName: 'Aakash Institute',
    date: '2026-11-04',
    testType: 'Part Test',
    subject: 'Mathematics',
    maxMarks: 100,
    obtainedMarks: 84,
    correctCount: 22,
    incorrectCount: 4,
    unattemptedCount: 0,
    rank: 24,
    totalCandidates: 610,
    syllabusCovered: 'Limits, Continuity, Derivatives, Vectors 3D',
    notes: 'High speed maintained throughout. Vector cross products were flawless.',
    calculatedPercentage: 84.0,
  },
];

export const StorageService = {
  async getUserProfile(): Promise<UserProfile> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  async getOfflineTests(): Promise<OfflineTestRecord[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.OFFLINE_TESTS);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(KEYS.OFFLINE_TESTS, JSON.stringify(SEED_OFFLINE_TESTS));
      return SEED_OFFLINE_TESTS;
    } catch {
      return SEED_OFFLINE_TESTS;
    }
  },

  async saveOfflineTest(record: OfflineTestRecord): Promise<OfflineTestRecord[]> {
    const list = await this.getOfflineTests();
    const existingIndex = list.findIndex((item) => item.id === record.id);
    let updated: OfflineTestRecord[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = record;
    } else {
      updated = [record, ...list];
    }
    await AsyncStorage.setItem(KEYS.OFFLINE_TESTS, JSON.stringify(updated));
    return updated;
  },

  async deleteOfflineTest(id: string): Promise<OfflineTestRecord[]> {
    const list = await this.getOfflineTests();
    const filtered = list.filter((item) => item.id !== id);
    await AsyncStorage.setItem(KEYS.OFFLINE_TESTS, JSON.stringify(filtered));
    return filtered;
  },

  async getTestAttempts(): Promise<TestAttempt[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.TEST_ATTEMPTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveTestAttempt(attempt: TestAttempt): Promise<TestAttempt[]> {
    const list = await this.getTestAttempts();
    const updated = [attempt, ...list];
    await AsyncStorage.setItem(KEYS.TEST_ATTEMPTS, JSON.stringify(updated));
    return updated;
  },

  async getBookmarkedIds(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : ['q_p1', 'q_c2', 'q_m3'];
    } catch {
      return [];
    }
  },

  async toggleBookmark(questionId: string): Promise<string[]> {
    const list = await this.getBookmarkedIds();
    const exists = list.includes(questionId);
    const updated = exists ? list.filter((id) => id !== questionId) : [...list, questionId];
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(updated));
    return updated;
  },

  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated: AppSettings = { ...current, ...partial };
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  async getQuestionViewSettings(): Promise<QuestionViewSettings> {
    try {
      const data = await AsyncStorage.getItem(KEYS.QUESTION_VIEW_SETTINGS);
      if (data) {
        return { ...DEFAULT_QUESTION_VIEW_SETTINGS, ...JSON.parse(data) };
      }
      return DEFAULT_QUESTION_VIEW_SETTINGS;
    } catch {
      return DEFAULT_QUESTION_VIEW_SETTINGS;
    }
  },

  async saveQuestionViewSettings(
    partial: Partial<QuestionViewSettings>
  ): Promise<QuestionViewSettings> {
    const current = await this.getQuestionViewSettings();
    const updated: QuestionViewSettings = { ...current, ...partial };
    await AsyncStorage.setItem(KEYS.QUESTION_VIEW_SETTINGS, JSON.stringify(updated));
    return updated;
  },

  async resetQuestionViewSettings(): Promise<QuestionViewSettings> {
    await AsyncStorage.setItem(
      KEYS.QUESTION_VIEW_SETTINGS,
      JSON.stringify(DEFAULT_QUESTION_VIEW_SETTINGS)
    );
    return DEFAULT_QUESTION_VIEW_SETTINGS;
  },

  async getAttemptLogs(): Promise<QuestionAttemptStat[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.ATTEMPT_LOGS);
      if (data) return JSON.parse(data);
      const seeded = buildSeedAttemptLogs();
      await AsyncStorage.setItem(KEYS.ATTEMPT_LOGS, JSON.stringify(seeded));
      return seeded;
    } catch {
      return buildSeedAttemptLogs();
    }
  },

  async recordQuestionAttempt(stat: QuestionAttemptStat): Promise<QuestionAttemptStat[]> {
    const existing = await this.getAttemptLogs();
    const updated = [...existing, stat];
    await AsyncStorage.setItem(KEYS.ATTEMPT_LOGS, JSON.stringify(updated));

    // Credit XP and level smoothly in UserProfile
    try {
      const profile = await this.getUserProfile();
      const xpGain = stat.isCorrect ? XP_CORRECT : XP_ATTEMPTED;
      const nextXp = (profile.totalXp || 0) + xpGain;
      const nextLevel = Math.max(1, Math.floor(nextXp / 450) + 1);
      await this.saveUserProfile({
        ...profile,
        totalXp: nextXp,
        level: nextLevel,
      });
    } catch {
      // Non-fatal if profile update fails
    }

    return updated;
  },

  async getQuestionNotes(): Promise<Record<string, string>> {
    try {
      const data = await AsyncStorage.getItem(KEYS.QUESTION_NOTES);
      if (data) return JSON.parse(data);
      const initial: Record<string, string> = {
        q_p1: 'Shortcut: For any rolling body with I = kMR², acceleration down incline is (g sin θ)/(1 + k).',
      };
      await AsyncStorage.setItem(KEYS.QUESTION_NOTES, JSON.stringify(initial));
      return initial;
    } catch {
      return {};
    }
  },

  async saveQuestionNote(questionId: string, noteText: string): Promise<Record<string, string>> {
    const notes = await this.getQuestionNotes();
    const trimmed = noteText.trim();
    const updated = { ...notes };
    if (trimmed) {
      updated[questionId] = noteText;
    } else {
      delete updated[questionId];
    }
    await AsyncStorage.setItem(KEYS.QUESTION_NOTES, JSON.stringify(updated));
    return updated;
  },

  async getDailyGoalConfig(): Promise<DailyGoalConfig> {
    try {
      const data = await AsyncStorage.getItem(KEYS.DAILY_GOAL);
      if (data) {
        return { ...DEFAULT_DAILY_GOAL, ...JSON.parse(data) };
      }
      await AsyncStorage.setItem(KEYS.DAILY_GOAL, JSON.stringify(DEFAULT_DAILY_GOAL));
      return DEFAULT_DAILY_GOAL;
    } catch {
      return DEFAULT_DAILY_GOAL;
    }
  },

  async saveDailyGoalConfig(partial: Partial<DailyGoalConfig>): Promise<DailyGoalConfig> {
    const current = await this.getDailyGoalConfig();
    const updated: DailyGoalConfig = { ...current, ...partial };
    await AsyncStorage.setItem(KEYS.DAILY_GOAL, JSON.stringify(updated));
    return updated;
  },

  async getNotebooks(): Promise<CustomNotebook[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.NOTEBOOKS);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(KEYS.NOTEBOOKS, JSON.stringify(SEED_NOTEBOOKS));
      return SEED_NOTEBOOKS;
    } catch {
      return SEED_NOTEBOOKS;
    }
  },

  async createNotebook(name: string, color = '#F97316'): Promise<CustomNotebook[]> {
    const notebooks = await this.getNotebooks();
    const created: CustomNotebook = {
      id: 'nb_' + Date.now(),
      name: name.trim() || 'Untitled Notebook',
      color,
      questionIds: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [created, ...notebooks];
    await AsyncStorage.setItem(KEYS.NOTEBOOKS, JSON.stringify(updated));
    return updated;
  },

  async toggleQuestionInNotebook(notebookId: string, questionId: string): Promise<CustomNotebook[]> {
    const notebooks = await this.getNotebooks();
    const updated = notebooks.map((nb) => {
      if (nb.id !== notebookId) return nb;
      const exists = nb.questionIds.includes(questionId);
      return {
        ...nb,
        questionIds: exists
          ? nb.questionIds.filter((id) => id !== questionId)
          : [...nb.questionIds, questionId],
      };
    });
    await AsyncStorage.setItem(KEYS.NOTEBOOKS, JSON.stringify(updated));
    return updated;
  },

  async deleteNotebook(notebookId: string): Promise<CustomNotebook[]> {
    const notebooks = await this.getNotebooks();
    const updated = notebooks.filter((nb) => nb.id !== notebookId);
    await AsyncStorage.setItem(KEYS.NOTEBOOKS, JSON.stringify(updated));
    return updated;
  },

  async getFormulaStatuses(): Promise<Record<string, FormulaStatus>> {
    try {
      const data = await AsyncStorage.getItem(KEYS.FORMULA_STATUSES);
      if (data) return JSON.parse(data);
      const initial: Record<string, FormulaStatus> = {
        f_p1: 'seen',
        f_p3: 'need_revision',
        f_c1: 'seen',
      };
      await AsyncStorage.setItem(KEYS.FORMULA_STATUSES, JSON.stringify(initial));
      return initial;
    } catch {
      return {};
    }
  },

  async setFormulaStatus(formulaId: string, status: FormulaStatus): Promise<Record<string, FormulaStatus>> {
    const map = await this.getFormulaStatuses();
    const updated = { ...map, [formulaId]: status };
    await AsyncStorage.setItem(KEYS.FORMULA_STATUSES, JSON.stringify(updated));
    return updated;
  },

  async getCustomTests(): Promise<CustomTestConfig[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CUSTOM_TESTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveCustomTest(config: CustomTestConfig): Promise<CustomTestConfig[]> {
    const list = await this.getCustomTests();
    const updated = [config, ...list.filter((t) => t.id !== config.id)];
    await AsyncStorage.setItem(KEYS.CUSTOM_TESTS, JSON.stringify(updated));
    return updated;
  },

  async deleteCustomTest(testId: string): Promise<CustomTestConfig[]> {
    const list = await this.getCustomTests();
    const updated = list.filter((t) => t.id !== testId);
    await AsyncStorage.setItem(KEYS.CUSTOM_TESTS, JSON.stringify(updated));
    return updated;
  },

  async getCustomQuestions(): Promise<Question[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CUSTOM_QUESTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveCustomQuestions(newQuestions: Question[]): Promise<Question[]> {
    const existing = await this.getCustomQuestions();
    const map = new Map<string, Question>();
    for (const q of existing) map.set(q.id, q);
    for (const q of newQuestions) map.set(q.id, q);
    const merged = Array.from(map.values()).slice(-150);
    await AsyncStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(merged));
    return merged;
  },
};

export const storageService = StorageService;




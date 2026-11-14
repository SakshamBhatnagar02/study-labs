import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ActiveTestWorkspaceState,
  AppSettings,
  CalendarHoliday,
  ChatMessage,
  ChatSession,
  ClubsWorkspaceState,
  CustomNotebook,
  CustomSyllabusModule,
  CustomTestConfig,
  DailyGoalConfig,
  FormulaStatus,
  GeneratedStemImage,
  OfflineTestRecord,
  PlannerCalendarState,
  Question,
  QuestionAttemptStat,
  QuestionViewSettings,
  TestAttempt,
  UserPlanTier,
  UserProfile,
} from '../types';
import { DEFAULT_CLUBS_WORKSPACE } from '../data/clubsSeedData';
import { buildSeedAttemptLogs, XP_ATTEMPTED, XP_CORRECT } from '../utils/activityStats';

const KEYS = {
  USER_PROFILE: '@study_labs_user_profile',
  OFFLINE_TESTS: '@study_labs_offline_tests',
  TEST_ATTEMPTS: '@study_labs_test_attempts',
  BOOKMARKS: '@study_labs_bookmarks',
  SYLLABUS_PROGRESS: '@study_labs_syllabus_progress',
  CUSTOM_SYLLABUS: '@study_labs_custom_syllabus_v2',
  CHAT_MESSAGES: '@study_labs_chat_messages',
  CHAT_SESSIONS: '@study_labs_chat_sessions_v2',
  ACTIVE_CHAT_ID: '@study_labs_active_chat_id',
  GENERATED_IMAGES: '@study_labs_generated_images',
  USER_PLAN: '@study_labs_user_plan',
  SETTINGS: '@study_labs_settings',
  QUESTION_VIEW_SETTINGS: '@study_labs_question_view_settings',
  ATTEMPT_LOGS: '@study_labs_attempt_logs',
  QUESTION_NOTES: '@study_labs_question_notes',
  DAILY_GOAL: '@study_labs_daily_goal',
  NOTEBOOKS: '@study_labs_notebooks',
  FORMULA_STATUSES: '@study_labs_formula_statuses',
  CUSTOM_TESTS: '@study_labs_custom_tests',
  CUSTOM_QUESTIONS: '@study_labs_custom_questions',
  PLANNER_STATE: '@study_labs_planner_state',
  ACTIVE_TEST_SESSION: '@study_labs_active_test_session',
  CACHED_HOLIDAYS: '@study_labs_cached_holidays',
  CLUBS_WORKSPACE: '@study_labs_clubs_workspace_v1',
  CLAIMED_CHALLENGES: '@study_labs_claimed_challenges',
};

const MAX_STORED_ATTACHMENT_BASE64 = 300_000;

function sanitizeChatMessageForStorage(msg: ChatMessage): ChatMessage {
  if (!msg.attachments || msg.attachments.length === 0) return msg;
  return {
    ...msg,
    attachments: msg.attachments.map((att) => {
      if (att.base64 && att.base64.length > MAX_STORED_ATTACHMENT_BASE64) {
        return {
          ...att,
          base64: undefined,
          summaryHint: att.summaryHint || 'Original binary payload trimmed in saved history',
        };
      }
      return att;
    }),
  };
}

function sanitizeChatSessionForStorage(session: ChatSession): ChatSession {
  return {
    ...session,
    messages: (session.messages || []).slice(-80).map(sanitizeChatMessageForStorage),
  };
}

export const DEFAULT_PLANNER_STATE: PlannerCalendarState = {
  selectedCountry: 'AUTO',
  exams: [
    { id: 'ex_jee_2027', name: 'JEE Main Session 1', targetDate: '2027-01-24', category: 'National Entrance' },
    { id: 'ex_cbse_2027', name: 'CBSE Class 12 Boards', targetDate: '2027-02-18', category: 'Board Exam' },
    { id: 'ex_neet_2027', name: 'NEET UG 2027', targetDate: '2027-05-02', category: 'Medical Entrance' },
  ],
  goals: [
    {
      id: 'g1',
      title: 'Complete 25 Numerical Questions on Rotational Dynamics',
      subject: 'Physics',
      dateKey: new Date().toISOString().split('T')[0],
      dueToday: true,
      isCompleted: true,
      durationMinutes: 60,
    },
    {
      id: 'g2',
      title: 'Revise Aldehydes, Ketones & Carboxylic Acids Mindmap',
      subject: 'Chemistry',
      dateKey: new Date().toISOString().split('T')[0],
      dueToday: true,
      isCompleted: false,
      durationMinutes: 45,
    },
    {
      id: 'g3',
      title: 'Solve 2024 PYQs for Definite Integrals',
      subject: 'Mathematics',
      dateKey: new Date().toISOString().split('T')[0],
      dueToday: true,
      isCompleted: false,
      durationMinutes: 75,
    },
    {
      id: 'g4',
      title: 'Weekly Full-length Coaching Mock Test Review',
      subject: 'Full Syllabus',
      dateKey: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      dueToday: false,
      isCompleted: false,
      durationMinutes: 90,
    },
  ],
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
  educationLevel: 'Competitive Prep',
  language: 'English',
  avatarColor: '#F97316',
  authProvider: 'guest',
  onboardingCompleted: false,
};

export const DEFAULT_CUSTOM_SYLLABUS: CustomSyllabusModule[] = [
  {
    id: 'syl_phy',
    subject: 'Physics',
    color: '#3B82F6',
    completedChapters: 14,
    totalChapters: 28,
    recentTopic: 'Electromagnetic Induction & Faraday Laws',
    status: 'On Track',
    topics: [
      { id: 'st_p1', title: 'Rotational Dynamics & Pure Rolling', status: 'revised' },
      { id: 'st_p2', title: 'Gauss Law & Conducting Shells', status: 'in_progress' },
      { id: 'st_p3', title: 'Wave Optics & YDSE Fringe Shift', status: 'not_started' },
    ],
  },
  {
    id: 'syl_chem',
    subject: 'Chemistry',
    color: '#10B981',
    completedChapters: 21,
    totalChapters: 30,
    recentTopic: 'Coordination Compounds & Crystal Field Theory',
    status: 'Ahead',
    topics: [
      { id: 'st_c1', title: 'GOC Resonance & Aromaticity', status: 'revised' },
      { id: 'st_c2', title: 'Chemical Bonding & MOT', status: 'revised' },
      { id: 'st_c3', title: 'SN1 vs SN2 Stereochemistry', status: 'in_progress' },
    ],
  },
  {
    id: 'syl_math',
    subject: 'Mathematics',
    color: '#F97316',
    completedChapters: 11,
    totalChapters: 26,
    recentTopic: 'Differential Equations & Applications',
    status: 'Needs Acceleration',
    topics: [
      { id: 'st_m1', title: 'Definite Integrals (King Property)', status: 'in_progress' },
      { id: 'st_m2', title: 'Vectors & Skew Line Shortest Distance', status: 'not_started' },
    ],
  },
  {
    id: 'syl_bio',
    subject: 'Biology',
    color: '#8B5CF6',
    completedChapters: 24,
    totalChapters: 32,
    recentTopic: 'Biotechnology & Principles and Processes',
    status: 'On Track',
    topics: [
      { id: 'st_b1', title: 'DNA Replication Enzymes & Lac Operon', status: 'revised' },
      { id: 'st_b2', title: 'Hardy-Weinberg Equilibrium', status: 'in_progress' },
    ],
  },
];

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
    const merged = Array.from(map.values()).slice(-250);
    await AsyncStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(merged));
    return merged;
  },

  async deleteCustomQuestion(questionId: string): Promise<Question[]> {
    const existing = await this.getCustomQuestions();
    const filtered = existing.filter((q) => q.id !== questionId);
    await AsyncStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(filtered));
    return filtered;
  },

  async getPlannerState(): Promise<PlannerCalendarState> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PLANNER_STATE);
      if (data) {
        const parsed = JSON.parse(data) as Partial<PlannerCalendarState>;
        return {
          selectedCountry: parsed.selectedCountry || DEFAULT_PLANNER_STATE.selectedCountry,
          exams: Array.isArray(parsed.exams) && parsed.exams.length > 0 ? parsed.exams : DEFAULT_PLANNER_STATE.exams,
          goals: Array.isArray(parsed.goals) ? parsed.goals : DEFAULT_PLANNER_STATE.goals,
        };
      }
      await AsyncStorage.setItem(KEYS.PLANNER_STATE, JSON.stringify(DEFAULT_PLANNER_STATE));
      return DEFAULT_PLANNER_STATE;
    } catch {
      return DEFAULT_PLANNER_STATE;
    }
  },

  async savePlannerState(state: PlannerCalendarState): Promise<PlannerCalendarState> {
    await AsyncStorage.setItem(KEYS.PLANNER_STATE, JSON.stringify(state));
    return state;
  },

  async getActiveTestSession(): Promise<ActiveTestWorkspaceState | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.ACTIVE_TEST_SESSION);
      return data ? (JSON.parse(data) as ActiveTestWorkspaceState) : null;
    } catch {
      return null;
    }
  },

  async saveActiveTestSession(session: ActiveTestWorkspaceState): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.ACTIVE_TEST_SESSION, JSON.stringify(session));
    } catch {
      // Non-fatal
    }
  },

  async clearActiveTestSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.ACTIVE_TEST_SESSION);
    } catch {
      // Non-fatal
    }
  },

  async getCachedRemoteHolidays(year: number, country: string): Promise<CalendarHoliday[]> {
    try {
      const raw = await AsyncStorage.getItem(`${KEYS.CACHED_HOLIDAYS}_${year}_${country}`);
      return raw ? (JSON.parse(raw) as CalendarHoliday[]) : [];
    } catch {
      return [];
    }
  },

  async saveCachedRemoteHolidays(
    year: number,
    country: string,
    holidays: CalendarHoliday[]
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${KEYS.CACHED_HOLIDAYS}_${year}_${country}`,
        JSON.stringify(holidays)
      );
    } catch {
      // Non-fatal
    }
  },

  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.CHAT_SESSIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Migrate legacy single-thread chat history if present
      const legacyRaw = await AsyncStorage.getItem(KEYS.CHAT_MESSAGES);
      if (legacyRaw) {
        const legacyMsgs = JSON.parse(legacyRaw);
        if (Array.isArray(legacyMsgs) && legacyMsgs.length > 0) {
          const firstUser = legacyMsgs.find((m: any) => m?.sender === 'user');
          const migrated: ChatSession = sanitizeChatSessionForStorage({
            id: 'chat_migrated_1',
            title: firstUser?.text ? String(firstUser.text).slice(0, 40) : 'Previous Study Chat',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: legacyMsgs,
          });
          await AsyncStorage.setItem(KEYS.CHAT_SESSIONS, JSON.stringify([migrated]));
          return [migrated];
        }
      }
      return [];
    } catch {
      return [];
    }
  },

  async saveChatSessions(sessions: ChatSession[]): Promise<ChatSession[]> {
    const clean = sessions.slice(0, 40).map(sanitizeChatSessionForStorage);
    try {
      await AsyncStorage.setItem(KEYS.CHAT_SESSIONS, JSON.stringify(clean));
    } catch {
      // If quota tight, store last 20 sessions
      try {
        await AsyncStorage.setItem(KEYS.CHAT_SESSIONS, JSON.stringify(clean.slice(0, 20)));
      } catch {
        // Non-fatal
      }
    }
    return clean;
  },

  async upsertChatSession(session: ChatSession): Promise<ChatSession[]> {
    const list = await this.getChatSessions();
    const cleaned = sanitizeChatSessionForStorage(session);
    const updated = [cleaned, ...list.filter((s) => s.id !== session.id)];
    return this.saveChatSessions(updated);
  },

  async deleteChatSession(sessionId: string): Promise<ChatSession[]> {
    const list = await this.getChatSessions();
    const filtered = list.filter((s) => s.id !== sessionId);
    await AsyncStorage.setItem(KEYS.CHAT_SESSIONS, JSON.stringify(filtered));
    return filtered;
  },

  async getActiveChatSessionId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.ACTIVE_CHAT_ID);
    } catch {
      return null;
    }
  },

  async saveActiveChatSessionId(sessionId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.ACTIVE_CHAT_ID, sessionId);
    } catch {
      // Non-fatal
    }
  },

  async getGeneratedImages(): Promise<GeneratedStemImage[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.GENERATED_IMAGES);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async saveGeneratedImage(image: GeneratedStemImage): Promise<GeneratedStemImage[]> {
    const list = await this.getGeneratedImages();
    const updated = [image, ...list.filter((img) => img.id !== image.id)];
    await AsyncStorage.setItem(KEYS.GENERATED_IMAGES, JSON.stringify(updated));
    return updated;
  },

  async updateGeneratedImage(image: GeneratedStemImage): Promise<GeneratedStemImage[]> {
    const list = await this.getGeneratedImages();
    const exists = list.some((img) => img.id === image.id);
    const updated = exists
      ? list.map((img) => (img.id === image.id ? image : img))
      : [image, ...list];
    await AsyncStorage.setItem(KEYS.GENERATED_IMAGES, JSON.stringify(updated));
    return updated;
  },

  async deleteGeneratedImage(imageId: string): Promise<GeneratedStemImage[]> {
    const list = await this.getGeneratedImages();
    const updated = list.filter((img) => img.id !== imageId);
    await AsyncStorage.setItem(KEYS.GENERATED_IMAGES, JSON.stringify(updated));
    return updated;
  },

  async getUserPlanTier(): Promise<UserPlanTier> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.USER_PLAN);
      if (raw === 'free' || raw === 'pro' || raw === 'ultra') return raw;
      await AsyncStorage.setItem(KEYS.USER_PLAN, 'free');
      return 'free';
    } catch {
      return 'free';
    }
  },

  async saveUserPlanTier(tier: UserPlanTier): Promise<UserPlanTier> {
    try {
      await AsyncStorage.setItem(KEYS.USER_PLAN, tier);
    } catch {
      // Non-fatal
    }
    return tier;
  },

  async getClubsWorkspace(): Promise<ClubsWorkspaceState> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.CLUBS_WORKSPACE);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ClubsWorkspaceState>;
        if (Array.isArray(parsed.clubs) && parsed.clubs.length > 0) {
          return {
            ...DEFAULT_CLUBS_WORKSPACE,
            ...parsed,
            roleOverrideByClub: parsed.roleOverrideByClub || {},
          };
        }
      }
      await AsyncStorage.setItem(
        KEYS.CLUBS_WORKSPACE,
        JSON.stringify(DEFAULT_CLUBS_WORKSPACE)
      );
      return DEFAULT_CLUBS_WORKSPACE;
    } catch {
      return DEFAULT_CLUBS_WORKSPACE;
    }
  },

  async saveClubsWorkspace(state: ClubsWorkspaceState): Promise<ClubsWorkspaceState> {
    try {
      await AsyncStorage.setItem(KEYS.CLUBS_WORKSPACE, JSON.stringify(state));
    } catch {
      // Non-fatal fallback on storage pressure
    }
    return state;
  },

  async resetClubsWorkspace(): Promise<ClubsWorkspaceState> {
    await AsyncStorage.setItem(
      KEYS.CLUBS_WORKSPACE,
      JSON.stringify(DEFAULT_CLUBS_WORKSPACE)
    );
    return DEFAULT_CLUBS_WORKSPACE;
  },

  async getCustomSyllabusModules(): Promise<CustomSyllabusModule[]> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.CUSTOM_SYLLABUS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      await AsyncStorage.setItem(
        KEYS.CUSTOM_SYLLABUS,
        JSON.stringify(DEFAULT_CUSTOM_SYLLABUS)
      );
      return DEFAULT_CUSTOM_SYLLABUS;
    } catch {
      return DEFAULT_CUSTOM_SYLLABUS;
    }
  },

  async saveCustomSyllabusModules(
    modules: CustomSyllabusModule[]
  ): Promise<CustomSyllabusModule[]> {
    await AsyncStorage.setItem(KEYS.CUSTOM_SYLLABUS, JSON.stringify(modules));
    return modules;
  },

  async getClaimedChallengeIds(dateKey: string): Promise<string[]> {
    try {
      const raw = await AsyncStorage.getItem(`${KEYS.CLAIMED_CHALLENGES}_${dateKey}`);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  },

  async claimChallengeReward(
    dateKey: string,
    challengeId: string,
    xpReward: number
  ): Promise<string[]> {
    const existing = await this.getClaimedChallengeIds(dateKey);
    if (existing.includes(challengeId)) return existing;
    const updated = [...existing, challengeId];
    await AsyncStorage.setItem(
      `${KEYS.CLAIMED_CHALLENGES}_${dateKey}`,
      JSON.stringify(updated)
    );
    try {
      const profile = await this.getUserProfile();
      const nextXp = (profile.totalXp || 0) + xpReward;
      const nextLevel = Math.max(1, Math.floor(nextXp / 450) + 1);
      await this.saveUserProfile({ ...profile, totalXp: nextXp, level: nextLevel });
    } catch {
      // Non-fatal
    }
    return updated;
  },

  async getRawItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },

  async setRawItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Non-fatal
    }
  },
};

export const storageService = StorageService;




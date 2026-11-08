import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, OfflineTestRecord, TestAttempt, UserProfile } from '../types';

const KEYS = {
  USER_PROFILE: '@study_labs_user_profile',
  OFFLINE_TESTS: '@study_labs_offline_tests',
  TEST_ATTEMPTS: '@study_labs_test_attempts',
  BOOKMARKS: '@study_labs_bookmarks',
  SYLLABUS_PROGRESS: '@study_labs_syllabus_progress',
  CHAT_MESSAGES: '@study_labs_chat_messages',
  SETTINGS: '@study_labs_settings',
};

export const DEFAULT_SETTINGS: AppSettings = {
  masterSound: true,
  correctSound: true,
  incorrectSound: true,
  completionSound: true,
  hapticFeedback: true,
  celebrationParticles: true,
  reducedMotion: false,
  particleIntensity: 'standard',
};

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
  targetExams: ['JEE Main 2025', 'JEE Advanced', 'BITSAT'],
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
};

export const storageService = StorageService;




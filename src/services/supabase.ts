import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AppErrorInfo, OfflineTestRecord, Question } from '../types';
import { buildApiErrorInfo } from '../utils/errorHandling';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  '';

const isConfigured =
  Boolean(SUPABASE_URL) &&
  Boolean(SUPABASE_ANON_KEY) &&
  !SUPABASE_URL.includes('your-project') &&
  !SUPABASE_ANON_KEY.includes('example');

let client: SupabaseClient | null = null;
let initError: AppErrorInfo | undefined;

if (isConfigured) {
  try {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    initError = buildApiErrorInfo('supabase', err, { canRetry: false, canUseOffline: true });
    console.warn('[Study Labs] Supabase initialization failed, falling back to offline mode.', err);
  }
}

export interface SupabaseQuestionsResult {
  questions: Question[];
  source: 'cloud' | 'offline';
  errorInfo?: AppErrorInfo;
}

export const SupabaseService = {
  isConfigured,
  client,

  async fetchQuestionsWithStatus(): Promise<SupabaseQuestionsResult> {
    if (!client) {
      return {
        questions: [],
        source: 'offline',
        errorInfo: initError,
      };
    }

    try {
      const { data, error } = await client
        .from('questions')
        .select(
          'id, chapter_id, topic_id, subject_id, type, prompt, options, numerical_answer, numerical_tolerance, explanation, hints, difficulty, exam_origin, year, tags'
        )
        .limit(120);

      if (error) {
        return {
          questions: [],
          source: 'offline',
          errorInfo: buildApiErrorInfo('supabase', error, {
            code: (error as any)?.code,
            canRetry: true,
            canUseOffline: true,
          }),
        };
      }

      if (!Array.isArray(data)) {
        return {
          questions: [],
          source: 'offline',
          errorInfo: buildApiErrorInfo('supabase', new Error('Unexpected response format from Supabase questions table'), {
            code: 'INVALID_PAYLOAD',
            canRetry: true,
            canUseOffline: true,
          }),
        };
      }

      const mapped = data
        .filter((row: any) => row?.id && row?.prompt && row?.subject_id)
        .map((row: any) => ({
          id: String(row.id),
          chapterId: String(row.chapter_id || 'ch_custom'),
          topicId: row.topic_id ? String(row.topic_id) : undefined,
          subjectId: row.subject_id,
          type: row.type || 'single_mcq',
          prompt: String(row.prompt),
          options: Array.isArray(row.options) ? row.options : undefined,
          numericalAnswer:
            typeof row.numerical_answer === 'number' ? row.numerical_answer : undefined,
          numericalTolerance:
            typeof row.numerical_tolerance === 'number' ? row.numerical_tolerance : undefined,
          explanation: String(row.explanation || ''),
          hints: Array.isArray(row.hints) ? row.hints : undefined,
          difficulty: row.difficulty || 'Medium',
          examOrigin: row.exam_origin ? String(row.exam_origin) : 'Study Labs Cloud DB',
          year: typeof row.year === 'number' ? row.year : undefined,
          tags: Array.isArray(row.tags) ? row.tags : undefined,
        }));

      return {
        questions: mapped,
        source: 'cloud',
      };
    } catch (err) {
      return {
        questions: [],
        source: 'offline',
        errorInfo: buildApiErrorInfo('supabase', err, {
          canRetry: true,
          canUseOffline: true,
        }),
      };
    }
  },

  async fetchQuestions(): Promise<Question[]> {
    const res = await this.fetchQuestionsWithStatus();
    return res.questions;
  },

  async syncOfflineTests(localTests: OfflineTestRecord[]) {
    if (!client) {
      return { success: true, mode: 'local_offline', syncedCount: localTests.length };
    }
    try {
      const rows = localTests.map((t) => ({
        id: t.id,
        test_name: t.testName,
        institute_name: t.instituteName,
        date: t.date,
        test_type: t.testType,
        subject: t.subject,
        max_marks: t.maxMarks,
        obtained_marks: t.obtainedMarks,
        correct_count: t.correctCount,
        incorrect_count: t.incorrectCount,
        unattempted_count: t.unattemptedCount,
        rank: t.rank ?? null,
        total_candidates: t.totalCandidates ?? null,
        syllabus_covered: t.syllabusCovered ?? null,
        notes: t.notes ?? null,
        calculated_percentage: t.calculatedPercentage,
      }));
      const { data, error } = await client.from('offline_test_records').upsert(rows);
      if (error) throw error;
      return { success: true, mode: 'cloud_synced', data };
    } catch (err: any) {
      return {
        success: false,
        mode: 'local_fallback',
        error: err?.message || 'Cloud sync failed',
        errorInfo: buildApiErrorInfo('supabase', err, {
          code: err?.code,
          canRetry: true,
          canUseOffline: true,
        }),
      };
    }
  },

  /**
   * Initiate OAuth sign-in with Google, GitHub, or Azure (Microsoft Entra)
   */
  async signInWithOAuth(provider: 'google' | 'github' | 'azure', redirectTo = 'studylabs://auth/callback') {
    if (!client) {
      return { data: null, error: new Error('Supabase client is not configured') };
    }
    return client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });
  },

  /**
   * Get active Supabase session
   */
  async getSession() {
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session;
  },

  /**
   * Sign out from active cloud session
   */
  async signOut() {
    if (!client) return { error: null };
    return client.auth.signOut();
  },
};

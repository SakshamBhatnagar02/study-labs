import type {
  Question,
  QuestionAttemptStat,
  QuestionDifficulty,
  SubjectId,
} from '../types';

export type CustomQuestionLimit = 5 | 10 | 15 | 'all';

export interface CustomTestFilterCriteria {
  subjectIds: SubjectId[];
  difficulties: QuestionDifficulty[];
  statusFilter: 'all' | 'unattempted' | 'mistakes';
  limit?: CustomQuestionLimit;
}

/**
 * Filters a combined question pool using explicit custom builder criteria.
 * When no subject or no difficulty is selected, returns 0 matches so the user
 * intentionally chooses what they want rather than silently launching everything.
 */
export function filterCustomQuestions(
  pool: Question[],
  criteria: CustomTestFilterCriteria,
  priorStatusMap: Record<string, QuestionAttemptStat> = {}
): Question[] {
  const { subjectIds, difficulties, statusFilter, limit = 'all' } = criteria;
  if (subjectIds.length === 0 || difficulties.length === 0) {
    return [];
  }

  const matched = pool.filter((q) => {
    if (!subjectIds.includes(q.subjectId)) return false;
    if (!difficulties.includes(q.difficulty)) return false;
    if (statusFilter === 'unattempted' && priorStatusMap[q.id]) return false;
    if (statusFilter === 'mistakes') {
      const st = priorStatusMap[q.id];
      if (!st || st.isCorrect) return false;
    }
    return true;
  });

  if (limit === 'all') return matched;
  return matched.slice(0, Math.max(1, limit));
}


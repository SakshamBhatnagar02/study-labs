import type {
  Question,
  QuestionAttemptStat,
  QuestionDifficulty,
  SubjectId,
} from '../types';

export type CustomQuestionLimit = number | 'all';

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
  return matched.slice(0, Math.max(1, Math.min(200, Math.round(limit))));
}

/**
 * Parses comma-separated option IDs used for multiple_mcq answers.
 */
export function parseMultiSelectAnswer(ans: string | number | undefined): string[] {
  if (typeof ans !== 'string' || !ans.trim()) return [];
  return Array.from(
    new Set(
      ans
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    )
  ).sort();
}

export function serializeMultiSelectAnswer(optionIds: string[]): string {
  return Array.from(new Set(optionIds.map((s) => s.trim()).filter(Boolean)))
    .sort()
    .join(',');
}

/**
 * Evaluates single_mcq, multiple_mcq, and numerical/integer questions accurately.
 */
export function evaluateQuestionAnswer(
  q: Question,
  ans: string | number | undefined
): boolean {
  if (ans === undefined || ans === '') return false;

  if (q.type === 'single_mcq') {
    return Boolean(q.options?.find((o) => o.id === ans)?.isCorrect);
  }

  if (q.type === 'multiple_mcq') {
    const selected = parseMultiSelectAnswer(ans);
    const correctIds = (q.options || [])
      .filter((o) => o.isCorrect)
      .map((o) => o.id)
      .sort();
    if (selected.length === 0 || correctIds.length === 0) return false;
    if (selected.length !== correctIds.length) return false;
    return selected.every((id, i) => id === correctIds[i]);
  }

  if (q.type === 'numerical') {
    const numVal = typeof ans === 'number' ? ans : parseFloat(String(ans).trim());
    if (isNaN(numVal)) return false;
    const expected = q.numericalAnswer ?? 0;
    const tolerance = q.numericalTolerance ?? 0.05;
    return Math.abs(numVal - expected) <= tolerance;
  }

  return false;
}

/**
 * Computes candidate percentile (e.g. Rank 50 out of 10000 -> 99.5%ile).
 */
export function computeRankPercentile(rank: number, totalCandidates: number): number {
  if (!totalCandidates || totalCandidates <= 0 || !rank || rank <= 0) return 0;
  const clampedRank = Math.min(Math.max(1, rank), totalCandidates);
  const raw = ((totalCandidates - clampedRank) / totalCandidates) * 100;
  return Math.max(0.1, Math.min(99.9, parseFloat(raw.toFixed(1))));
}

export interface TestScoreAndRankInput {
  questions: Question[];
  answers: Record<string, string | number>;
  marksPerCorrect?: number;
  negativeMarks?: number;
  targetRank?: number;
  totalCandidates?: number;
}

export interface TestScoreAndRankSummary {
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  marksPerCorrect: number;
  negativeMarks: number;
  score: number;
  maxScore: number;
  percentage: number;
  accuracyPercent: number;
  estimatedPercentile: number;
  estimatedRank: number;
  totalCandidates: number;
  targetRank?: number;
  targetMet?: boolean;
  rankDelta?: number;
}

/**
 * Calculates test score using configurable marking (+marks / -negative),
 * projected cohort percentile, estimated rank, and goal rank delta.
 */
export function computeTestScoreAndRankSummary(
  input: TestScoreAndRankInput
): TestScoreAndRankSummary {
  const marksPerCorrect =
    typeof input.marksPerCorrect === 'number' && input.marksPerCorrect > 0
      ? input.marksPerCorrect
      : 4;
  const negativeMarks =
    typeof input.negativeMarks === 'number' && input.negativeMarks >= 0
      ? input.negativeMarks
      : 1;
  const totalCandidates =
    typeof input.totalCandidates === 'number' && input.totalCandidates >= 10
      ? Math.round(input.totalCandidates)
      : 10000;

  let correct = 0;
  let incorrect = 0;
  let unattempted = 0;

  for (const q of input.questions) {
    const ans = input.answers[q.id];
    if (ans === undefined || ans === '') {
      unattempted++;
    } else if (evaluateQuestionAnswer(q, ans)) {
      correct++;
    } else {
      incorrect++;
    }
  }

  const totalQuestions = input.questions.length;
  const score = parseFloat((correct * marksPerCorrect - incorrect * negativeMarks).toFixed(2));
  const maxScore = Math.max(1, totalQuestions * marksPerCorrect);
  const percentage = parseFloat(
    Math.min(100, (Math.max(0, score) / maxScore) * 100).toFixed(1)
  );
  const attempted = correct + incorrect;
  const accuracyPercent = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  // Monotonic percentile projection curve tuned around competitive JEE/NEET distributions
  const ratio = Math.max(0, Math.min(1, score / maxScore));
  const estimatedPercentile =
    attempted === 0
      ? 1.0
      : parseFloat(
          Math.max(1.0, Math.min(99.9, Math.pow(ratio, 0.72) * 98.9 + 1.0)).toFixed(1)
        );
  const estimatedRank = Math.max(
    1,
    Math.min(
      totalCandidates,
      Math.round(((100 - estimatedPercentile) / 100) * totalCandidates) + 1
    )
  );

  const targetRank =
    typeof input.targetRank === 'number' && input.targetRank >= 1
      ? Math.round(input.targetRank)
      : undefined;
  const targetMet = targetRank !== undefined ? estimatedRank <= targetRank : undefined;
  const rankDelta = targetRank !== undefined ? estimatedRank - targetRank : undefined;

  return {
    totalQuestions,
    correct,
    incorrect,
    unattempted,
    marksPerCorrect,
    negativeMarks,
    score,
    maxScore,
    percentage,
    accuracyPercent,
    estimatedPercentile,
    estimatedRank,
    totalCandidates,
    targetRank,
    targetMet,
    rankDelta,
  };
}

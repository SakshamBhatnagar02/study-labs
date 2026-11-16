import json
import os

json_path = os.path.join('src', 'data', 'pyqQuestionsData.json')
with open(json_path, 'r', encoding='utf-8') as f:
    questions = json.load(f)

# 1. Generate TypeScript source
ts_path = os.path.join('src', 'data', 'pyqQuestionsData.ts')
ts_header = """import type { Question } from '../types';

export interface PYQPaperMeta {
  shiftCode: string;
  examName: string;
  year: number;
  shiftLabel: string;
  totalQuestions: number;
  subjects: {
    math: number;
    physics: number;
    chemistry: number;
  };
}

export const PYQ_PAPERS_CATALOG: PYQPaperMeta[] = [
  {
    shiftCode: '2025_jan22_s1',
    examName: 'JEE Main 2025 Jan 22 Shift 1',
    year: 2025,
    shiftLabel: '22 Jan Shift 1',
    totalQuestions: 75,
    subjects: { math: 25, physics: 25, chemistry: 25 },
  },
  {
    shiftCode: '2025_jan22_s2',
    examName: 'JEE Main 2025 Jan 22 Shift 2',
    year: 2025,
    shiftLabel: '22 Jan Shift 2',
    totalQuestions: 75,
    subjects: { math: 25, physics: 25, chemistry: 25 },
  },
  {
    shiftCode: '2026_apr02_s1',
    examName: 'JEE Main 2026 Apr 02 Shift 1',
    year: 2026,
    shiftLabel: '02 Apr Shift 1',
    totalQuestions: 75,
    subjects: { math: 25, physics: 25, chemistry: 25 },
  },
  {
    shiftCode: '2026_apr02_s2',
    examName: 'JEE Main 2026 Apr 02 Shift 2',
    year: 2026,
    shiftLabel: '02 Apr Shift 2',
    totalQuestions: 75,
    subjects: { math: 25, physics: 25, chemistry: 25 },
  },
  {
    shiftCode: '2026_apr04_s1',
    examName: 'JEE Main 2026 Apr 04 Shift 1',
    year: 2026,
    shiftLabel: '04 Apr Shift 1',
    totalQuestions: 75,
    subjects: { math: 25, physics: 25, chemistry: 25 },
  },
];

export const PYQ_JEE_QUESTIONS: Question[] = """

# Filter out null values so TypeScript schema (number | undefined) is fully satisfied
clean_questions = []
for q in questions:
    item = {
        'id': q['id'],
        'chapterId': q['chapterId'],
        'topicId': q['topicId'],
        'subjectId': q['subjectId'],
        'type': q['type'],
        'prompt': q['prompt'],
        'explanation': q['explanation'],
        'difficulty': q['difficulty'],
        'examOrigin': q['examOrigin'],
        'year': q['year'],
        'tags': q['tags'],
    }
    if q.get('options'):
        item['options'] = q['options']
    if q.get('numericalAnswer') is not None:
        item['numericalAnswer'] = q['numericalAnswer']
    if q.get('numericalTolerance') is not None:
        item['numericalTolerance'] = q['numericalTolerance']
    clean_questions.append(item)

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_header + json.dumps(clean_questions, indent=2) + ';\n')
print(f'Wrote TypeScript dataset to {ts_path} ({len(clean_questions)} questions)')

# 2. Generate Supabase SQL migration script
sql_path = 'supabase_seed_pyqs.sql'
sql_lines = [
    '-- Study Labs Official Supabase PYQs Seed Migration',
    '-- Seeds 375 authentic JEE Mains questions directly into public.questions',
    '',
    '-- 1. Ensure RLS policies allow insertion and queries',
    'DO $$',
    'BEGIN',
    "  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'questions' AND policyname = 'Allow anon insert questions') THEN",
    '    CREATE POLICY "Allow anon insert questions" ON public.questions FOR INSERT WITH CHECK (true);',
    '  END IF;',
    "  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'questions' AND policyname = 'Allow anon update questions') THEN",
    '    CREATE POLICY "Allow anon update questions" ON public.questions FOR UPDATE USING (true);',
    '  END IF;',
    'END $$;',
    '',
    '-- 2. Upsert 375 Questions into public.questions',
]

def esc(val):
    if val is None:
        return 'NULL'
    s = str(val).replace("'", "''")
    return f"'{s}'"

for q in questions:
    q_id = esc(q['id'])
    ch_id = esc(q['chapterId'])
    top_id = esc(q['topicId'])
    sub_id = esc(q['subjectId'])
    q_type = esc(q['type'])
    prompt = esc(q['prompt'])
    opts = esc(json.dumps(q['options'])) if q['options'] else 'NULL'
    num_ans = str(q['numericalAnswer']) if q['numericalAnswer'] is not None else 'NULL'
    num_tol = str(q['numericalTolerance']) if q['numericalTolerance'] is not None else 'NULL'
    expl = esc(q['explanation'])
    diff = esc(q['difficulty'])
    origin = esc(q['examOrigin'])
    year = str(q['year']) if q['year'] is not None else 'NULL'
    tags = esc(json.dumps(q['tags'])) if q['tags'] else 'NULL'

    stmt = f"""INSERT INTO public.questions (id, chapter_id, topic_id, subject_id, type, prompt, options, numerical_answer, numerical_tolerance, explanation, difficulty, exam_origin, year, tags)
VALUES ({q_id}, {ch_id}, {top_id}, {sub_id}, {q_type}, {prompt}, {opts}::jsonb, {num_ans}, {num_tol}, {expl}, {diff}, {origin}, {year}, {tags}::jsonb)
ON CONFLICT (id) DO UPDATE SET
  prompt = EXCLUDED.prompt,
  options = EXCLUDED.options,
  numerical_answer = EXCLUDED.numerical_answer,
  explanation = EXCLUDED.explanation,
  exam_origin = EXCLUDED.exam_origin;"""
    sql_lines.append(stmt)

with open(sql_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))
print(f'Wrote SQL migration to {sql_path}')

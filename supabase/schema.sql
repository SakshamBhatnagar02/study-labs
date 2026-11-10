-- Study Labs (study.io) Reference PostgreSQL Schema for Supabase
-- Run this script inside your Supabase Dashboard -> SQL Editor to enable cloud sync.

-- 1. Learner Profile
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  io_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  class_grade TEXT DEFAULT 'Class 12',
  stream TEXT DEFAULT 'Science (PCM)',
  target_year INTEGER DEFAULT 2027,
  study_streak_days INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Question Bank (optional remote override/extension of local SAMPLE_QUESTIONS)
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL,
  topic_id TEXT,
  subject_id TEXT NOT NULL CHECK (subject_id IN ('physics', 'chemistry', 'math', 'biology')),
  type TEXT NOT NULL DEFAULT 'single_mcq',
  prompt TEXT NOT NULL,
  options JSONB,
  numerical_answer DOUBLE PRECISION,
  numerical_tolerance DOUBLE PRECISION,
  explanation TEXT NOT NULL,
  hints JSONB,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  exam_origin TEXT,
  year INTEGER,
  tags JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Offline Coaching Test Records
CREATE TABLE IF NOT EXISTS public.offline_test_records (
  id TEXT PRIMARY KEY,
  test_name TEXT NOT NULL,
  institute_name TEXT NOT NULL,
  date TEXT NOT NULL,
  test_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  max_marks DOUBLE PRECISION NOT NULL,
  obtained_marks DOUBLE PRECISION NOT NULL,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  unattempted_count INTEGER DEFAULT 0,
  rank INTEGER,
  total_candidates INTEGER,
  syllabus_covered TEXT,
  notes TEXT,
  calculated_percentage DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Custom Tests & Attempt Logs
CREATE TABLE IF NOT EXISTS public.custom_tests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject_ids JSONB NOT NULL,
  difficulties JSONB NOT NULL,
  question_ids JSONB NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('practice', 'exam')),
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public read access on shared question bank (adjust RLS policies for multi-user auth)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'questions' AND policyname = 'Allow anon read questions'
  ) THEN
    CREATE POLICY "Allow anon read questions" ON public.questions FOR SELECT USING (true);
  END IF;
END $$;


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

-- 5. Extended Learner Onboarding & Global Curricula Fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS board TEXT DEFAULT 'JEE_MAIN',
  ADD COLUMN IF NOT EXISTS education_level TEXT DEFAULT 'Competitive Prep',
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS preferred_mode TEXT DEFAULT 'Normal',
  ADD COLUMN IF NOT EXISTS target_exams JSONB DEFAULT '["JEE Main"]'::jsonb,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'guest';

-- 6. Custom Syllabus Coverage & Topic Status Tracking
CREATE TABLE IF NOT EXISTS public.syllabus_modules (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  color TEXT DEFAULT '#F97316',
  completed_chapters INTEGER DEFAULT 0,
  total_chapters INTEGER DEFAULT 20,
  recent_topic TEXT,
  status TEXT DEFAULT 'On Track',
  topics JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Community Study Clubs & Coaching Institutes Workspace
CREATE TABLE IF NOT EXISTS public.clubs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('institute', 'study_club')),
  category TEXT NOT NULL,
  description TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  primary_language TEXT DEFAULT 'English',
  country TEXT DEFAULT 'GLOBAL',
  is_private BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  owner_id TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  about_admin TEXT,
  banner_color TEXT DEFAULT '#EA580C',
  icon_color TEXT DEFAULT '#F97316',
  rules JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.club_roles (
  id TEXT PRIMARY KEY,
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#94A3B8',
  badge_icon TEXT DEFAULT 'user',
  priority INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.club_members (
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  io_id TEXT NOT NULL,
  staff_label TEXT DEFAULT 'Student',
  role_ids JSONB DEFAULT '[]'::jsonb,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (club_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.club_channels (
  id TEXT PRIMARY KEY,
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  topic TEXT,
  category TEXT NOT NULL DEFAULT 'Study Channels',
  type TEXT NOT NULL DEFAULT 'text',
  access_mode TEXT NOT NULL CHECK (access_mode IN ('open', 'public_view', 'role_private')) DEFAULT 'open',
  is_read_only BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE,
  allowed_role_ids JSONB DEFAULT '[]'::jsonb,
  block_external_links BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.club_messages (
  id TEXT PRIMARY KEY,
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL REFERENCES public.club_channels(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role_badge TEXT,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_verified_answer BOOLEAN DEFAULT FALSE,
  poll JSONB,
  assignment_id TEXT,
  resource JSONB,
  reactions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.club_assignments (
  id TEXT PRIMARY KEY,
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  channel_id TEXT REFERENCES public.club_channels(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  due_date TEXT NOT NULL,
  max_marks DOUBLE PRECISION DEFAULT 20,
  created_by_name TEXT NOT NULL,
  linked_question_ids JSONB DEFAULT '[]'::jsonb,
  linked_test_mode TEXT DEFAULT 'exam',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL REFERENCES public.club_assignments(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  response_text TEXT NOT NULL,
  score DOUBLE PRECISION,
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded')),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attendance_records (
  id TEXT PRIMARY KEY,
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  session_label TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by_name TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.safety_reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMPTZ DEFAULT NOW()
);



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

-- =============================================================================
-- 8. Per-User Cloud Folder Architecture (Backblaze B2 + Supabase Storage & DB)
-- =============================================================================

-- Dedicated folder registry created automatically on user registration
CREATE TABLE IF NOT EXISTS public.user_storage_folders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('profile', 'notebooks', 'books', 'notes', 'solutions', 'visuals')),
  b2_folder_path TEXT NOT NULL,
  supabase_folder_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, category)
);

CREATE INDEX IF NOT EXISTS idx_user_storage_folders_user_id
  ON public.user_storage_folders (user_id);

-- Per-user uploaded content (notebooks, books, notes, solutions, visuals)
-- Supports community preservation when an account is permanently deleted.
CREATE TABLE IF NOT EXISTS public.user_uploaded_files (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  original_author_label TEXT NOT NULL DEFAULT 'Study Labs Member',
  folder_category TEXT NOT NULL CHECK (folder_category IN ('profile', 'notebooks', 'books', 'notes', 'solutions', 'visuals')),
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  size_bytes BIGINT NOT NULL DEFAULT 0,
  b2_path TEXT NOT NULL,
  b2_file_id TEXT,
  supabase_path TEXT NOT NULL,
  public_url TEXT,
  is_public_shared BOOLEAN NOT NULL DEFAULT FALSE,
  is_preserved_after_deletion BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'preserved_community', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_uploaded_files_user_cat
  ON public.user_uploaded_files (user_id, folder_category);

CREATE INDEX IF NOT EXISTS idx_user_uploaded_files_community_preserved
  ON public.user_uploaded_files (is_public_shared, is_preserved_after_deletion)
  WHERE is_public_shared = TRUE OR is_preserved_after_deletion = TRUE;

-- Verified-code permanent account deletion requests
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  verification_code TEXT NOT NULL,
  preserve_public_contributions BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_user_id
  ON public.account_deletion_requests (user_id);

-- Enable RLS on all user workspace tables (Supabase Security Best Practices)
ALTER TABLE public.user_storage_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_storage_folders' AND policyname = 'Users manage own folders') THEN
    CREATE POLICY "Users manage own folders" ON public.user_storage_folders
      FOR ALL TO authenticated
      USING ((select auth.uid())::text = user_id)
      WITH CHECK ((select auth.uid())::text = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_uploaded_files' AND policyname = 'Users read own or shared community files') THEN
    CREATE POLICY "Users read own or shared community files" ON public.user_uploaded_files
      FOR SELECT TO authenticated
      USING (
        (select auth.uid())::text = user_id
        OR is_public_shared = TRUE
        OR is_preserved_after_deletion = TRUE
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_uploaded_files' AND policyname = 'Users insert own files') THEN
    CREATE POLICY "Users insert own files" ON public.user_uploaded_files
      FOR INSERT TO authenticated
      WITH CHECK ((select auth.uid())::text = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_uploaded_files' AND policyname = 'Users update own files') THEN
    CREATE POLICY "Users update own files" ON public.user_uploaded_files
      FOR UPDATE TO authenticated
      USING ((select auth.uid())::text = user_id)
      WITH CHECK ((select auth.uid())::text = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_uploaded_files' AND policyname = 'Users delete own files') THEN
    CREATE POLICY "Users delete own files" ON public.user_uploaded_files
      FOR DELETE TO authenticated
      USING ((select auth.uid())::text = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'account_deletion_requests' AND policyname = 'Users manage own deletion requests') THEN
    CREATE POLICY "Users manage own deletion requests" ON public.account_deletion_requests
      FOR ALL TO authenticated
      USING ((select auth.uid())::text = user_id)
      WITH CHECK ((select auth.uid())::text = user_id);
  END IF;
END $$;

-- RPC: Auto-provision user's 6 category folders across B2 & Supabase paths on registration
CREATE OR REPLACE FUNCTION public.provision_user_workspace_folders(p_user_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_cat TEXT;
  v_cats TEXT[] := ARRAY['profile', 'notebooks', 'books', 'notes', 'solutions', 'visuals'];
BEGIN
  FOREACH v_cat IN ARRAY v_cats LOOP
    INSERT INTO public.user_storage_folders (id, user_id, category, b2_folder_path, supabase_folder_path)
    VALUES (
      'fld_' || p_user_id || '_' || v_cat,
      p_user_id,
      v_cat,
      'users/' || p_user_id || '/' || v_cat || '/',
      'users/' || p_user_id || '/' || v_cat || '/'
    )
    ON CONFLICT (user_id, category) DO NOTHING;
  END LOOP;
END;
$$;

-- RPC: Code-verified permanent account deletion with optional preservation of public books/solutions/notes
CREATE OR REPLACE FUNCTION public.execute_verified_account_deletion(
  p_user_id TEXT,
  p_verification_code TEXT,
  p_preserve_contributions BOOLEAN DEFAULT TRUE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req RECORD;
  v_preserved_count INTEGER := 0;
  v_deleted_files_count INTEGER := 0;
BEGIN
  IF (select auth.uid())::text IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized account deletion request';
  END IF;

  SELECT * INTO v_req
  FROM public.account_deletion_requests
  WHERE user_id = p_user_id
    AND verification_code = p_verification_code
    AND confirmed_at IS NULL
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired account deletion verification code';
  END IF;

  IF p_preserve_contributions THEN
    -- Preserve uploaded books, solutions & public notes for other Study Labs members
    UPDATE public.user_uploaded_files
    SET
      user_id = NULL,
      original_author_label = 'Study Labs Community Alumni',
      is_public_shared = TRUE,
      is_preserved_after_deletion = TRUE,
      status = 'preserved_community',
      b2_path = 'community/preserved/' || folder_category || '/' || file_name,
      supabase_path = 'community/preserved/' || folder_category || '/' || file_name,
      updated_at = NOW()
    WHERE user_id = p_user_id
      AND folder_category IN ('books', 'solutions', 'notes')
      AND is_public_shared = TRUE;
    GET DIAGNOSTICS v_preserved_count = ROW_COUNT;
  END IF;

  -- Permanently delete all remaining personal files (private notebooks, visuals, profile, or all if preserve=false)
  DELETE FROM public.user_uploaded_files
  WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_deleted_files_count = ROW_COUNT;

  -- Wipe personal folders, club memberships, syllabus & profile row
  DELETE FROM public.club_members WHERE user_id = p_user_id;
  DELETE FROM public.user_storage_folders WHERE user_id = p_user_id;
  DELETE FROM public.account_deletion_requests WHERE user_id = p_user_id;
  DELETE FROM public.profiles WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'deleted', TRUE,
    'preserved_contributions', v_preserved_count,
    'wiped_personal_files', v_deleted_files_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.execute_verified_account_deletion(TEXT, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_verified_account_deletion(TEXT, TEXT, BOOLEAN) TO authenticated;




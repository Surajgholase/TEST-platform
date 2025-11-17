-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'STUDENT')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('EASY', 'MEDIUM', 'HARD')),
  category TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tests table
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL CHECK (test_type IN ('GENERAL', 'COMPANY')),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('EASY', 'MEDIUM', 'HARD')),
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  score NUMERIC DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure difficulty_level column and constraint exist for existing databases
ALTER TABLE IF NOT EXISTS public.tests
  ADD COLUMN IF NOT EXISTS difficulty_level TEXT;
ALTER TABLE IF NOT EXISTS public.tests
  DROP CONSTRAINT IF EXISTS tests_difficulty_level_check;
ALTER TABLE IF NOT EXISTS public.tests
  ADD CONSTRAINT tests_difficulty_level_check
  CHECK (difficulty_level IN ('EASY', 'MEDIUM', 'HARD'));

-- Create test_answers table
CREATE TABLE IF NOT EXISTS public.test_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option TEXT CHECK (selected_option IN ('A', 'B', 'C', 'D', NULL)),
  is_correct BOOLEAN,
  time_taken_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_reports table
CREATE TABLE IF NOT EXISTS public.ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL UNIQUE REFERENCES public.tests(id) ON DELETE CASCADE,
  summary_text TEXT,
  strengths TEXT,
  weaknesses TEXT,
  suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "users_select_self" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_self" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_self" ON public.users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for companies (all users can read, only admins can write)
CREATE POLICY "companies_select_all" ON public.companies FOR SELECT USING (TRUE);
CREATE POLICY "companies_insert_admin" ON public.companies FOR INSERT 
  WITH CHECK (EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "companies_update_admin" ON public.companies FOR UPDATE 
  USING (EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "companies_delete_admin" ON public.companies FOR DELETE 
  USING (EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

-- RLS Policies for questions (all users can read, only admins can write)
CREATE POLICY "questions_select_all" ON public.questions FOR SELECT USING (is_active = TRUE);
CREATE POLICY "questions_insert_admin" ON public.questions FOR INSERT 
  WITH CHECK (EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "questions_update_admin" ON public.questions FOR UPDATE 
  USING (EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "questions_delete_admin" ON public.questions FOR DELETE 
  USING (EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));

-- RLS Policies for tests (students can view/insert own, admins can view all)
CREATE POLICY "tests_select_own_or_admin" ON public.tests FOR SELECT 
  USING (user_id = auth.uid() OR EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "tests_insert_own" ON public.tests FOR INSERT 
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "tests_update_own" ON public.tests FOR UPDATE 
  USING (user_id = auth.uid());

-- RLS Policies for test_answers (students can view/insert own, admins can view all)
CREATE POLICY "test_answers_select_own_or_admin" ON public.test_answers FOR SELECT 
  USING (EXISTS(SELECT 1 FROM public.tests t WHERE t.id = test_id AND (t.user_id = auth.uid() OR EXISTS(SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'))));
CREATE POLICY "test_answers_insert_own" ON public.test_answers FOR INSERT 
  WITH CHECK (EXISTS(SELECT 1 FROM public.tests t WHERE t.id = test_id AND t.user_id = auth.uid()));
CREATE POLICY "test_answers_update_own" ON public.test_answers FOR UPDATE 
  USING (EXISTS(SELECT 1 FROM public.tests t WHERE t.id = test_id AND t.user_id = auth.uid()));

-- RLS Policies for ai_reports (students can view own, admins can view all)
CREATE POLICY "ai_reports_select_own_or_admin" ON public.ai_reports FOR SELECT 
  USING (EXISTS(SELECT 1 FROM public.tests t WHERE t.id = test_id AND (t.user_id = auth.uid() OR EXISTS(SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'))));

-- Create profile trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'name', new.email),
    COALESCE(new.raw_user_meta_data ->> 'role', 'STUDENT')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

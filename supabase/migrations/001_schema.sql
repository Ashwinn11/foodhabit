-- Gut Buddy Database Schema
-- All tables with RLS policies and authenticated grants

-- ===========================================
-- TABLE: profiles
-- ===========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  age INTEGER,
  biological_sex TEXT CHECK (biological_sex IN ('male', 'female', 'other', 'prefer_not_to_say')),
  diagnosed_conditions TEXT[] DEFAULT '{}',
  known_triggers TEXT[] DEFAULT '{}',
  diet_type TEXT CHECK (diet_type IN ('omnivore', 'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-fodmap')),
  notifications_enabled BOOLEAN DEFAULT true,
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

GRANT ALL ON public.profiles TO authenticated, service_role;

-- Auth trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ===========================================
-- TABLE: meal_logs
-- ===========================================
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ DEFAULT now(),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  foods JSONB NOT NULL DEFAULT '[]',
  overall_meal_verdict TEXT CHECK (overall_meal_verdict IN ('avoid', 'caution', 'safest')),
  meal_swap_suggestion TEXT,
  stress_level INTEGER DEFAULT 1 CHECK (stress_level BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal logs" ON public.meal_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal logs" ON public.meal_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal logs" ON public.meal_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal logs" ON public.meal_logs
  FOR DELETE USING (auth.uid() = user_id);

GRANT ALL ON public.meal_logs TO authenticated, service_role;


-- ===========================================
-- TABLE: symptom_logs
-- ===========================================
CREATE TABLE IF NOT EXISTS public.symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ DEFAULT now(),
  bloating INTEGER DEFAULT 0 CHECK (bloating BETWEEN 0 AND 10),
  pain INTEGER DEFAULT 0 CHECK (pain BETWEEN 0 AND 10),
  urgency INTEGER DEFAULT 0 CHECK (urgency BETWEEN 0 AND 10),
  nausea INTEGER DEFAULT 0 CHECK (nausea BETWEEN 0 AND 10),
  fatigue INTEGER DEFAULT 0 CHECK (fatigue BETWEEN 0 AND 10),
  stool_type INTEGER CHECK (stool_type BETWEEN 1 AND 7),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own symptom logs" ON public.symptom_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom logs" ON public.symptom_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptom logs" ON public.symptom_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptom logs" ON public.symptom_logs
  FOR DELETE USING (auth.uid() = user_id);

GRANT ALL ON public.symptom_logs TO authenticated, service_role;


-- ===========================================
-- TABLE: daily_factors
-- ===========================================
CREATE TABLE IF NOT EXISTS public.daily_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_hours NUMERIC,
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
  exercise BOOLEAN DEFAULT false,
  exercise_type TEXT,
  menstrual_phase TEXT,
  water_intake INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE public.daily_factors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily factors" ON public.daily_factors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily factors" ON public.daily_factors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily factors" ON public.daily_factors
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily factors" ON public.daily_factors
  FOR DELETE USING (auth.uid() = user_id);

GRANT ALL ON public.daily_factors TO authenticated, service_role;


-- ===========================================
-- TABLE: ai_insights
-- ===========================================
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ DEFAULT now(),
  insight_type TEXT NOT NULL CHECK (insight_type IN ('trigger_watching', 'trigger_likely', 'trigger_confirmed', 'pattern', 'recommendation', 'weekly_summary')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  related_foods TEXT[],
  confidence TEXT DEFAULT 'low' CHECK (confidence IN ('low', 'medium', 'high')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights" ON public.ai_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" ON public.ai_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" ON public.ai_insights
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights" ON public.ai_insights
  FOR DELETE USING (auth.uid() = user_id);

GRANT ALL ON public.ai_insights TO authenticated, service_role;


-- ===========================================
-- TABLE: recipes
-- ===========================================
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]',
  steps JSONB NOT NULL DEFAULT '[]',
  prep_time_mins INTEGER NOT NULL,
  meal_type TEXT NOT NULL,
  trigger_free TEXT[] DEFAULT '{}',
  is_saved BOOLEAN DEFAULT false,
  source TEXT NOT NULL CHECK (source IN ('daily', 'post_log', 'generate')),
  generated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes" ON public.recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes" ON public.recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" ON public.recipes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON public.recipes
  FOR DELETE USING (auth.uid() = user_id);

GRANT ALL ON public.recipes TO authenticated, service_role;


-- ===========================================
-- TABLE: progress_snapshots
-- ===========================================
CREATE TABLE IF NOT EXISTS public.progress_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  avg_bloating_7d NUMERIC DEFAULT 0,
  avg_pain_7d NUMERIC DEFAULT 0,
  avg_urgency_7d NUMERIC DEFAULT 0,
  avg_fatigue_7d NUMERIC DEFAULT 0,
  good_days_count INTEGER DEFAULT 0,
  bad_days_count INTEGER DEFAULT 0,
  top_triggers TEXT[] DEFAULT '{}',
  improvement_vs_baseline NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.progress_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON public.progress_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.progress_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.progress_snapshots
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON public.progress_snapshots
  FOR DELETE USING (auth.uid() = user_id);

GRANT ALL ON public.progress_snapshots TO authenticated, service_role;


-- ===========================================
-- TABLE: streaks
-- ===========================================
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_logged_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak" ON public.streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak" ON public.streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak" ON public.streaks
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own streak" ON public.streaks
  FOR DELETE USING (auth.uid() = user_id);

GRANT ALL ON public.streaks TO authenticated, service_role;


-- ===========================================
-- INDEXES for performance
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON public.meal_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_date ON public.symptom_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_factors_user_date ON public.daily_factors(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_type ON public.ai_insights(user_id, insight_type, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_user_saved ON public.recipes(user_id, is_saved, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_user_date ON public.progress_snapshots(user_id, snapshot_date DESC);

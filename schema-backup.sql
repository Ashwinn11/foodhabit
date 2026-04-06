-- ============================================================
-- GUTBUDDY — FULL SCHEMA BACKUP (Pre-Rebuild)
-- Saved: 2026-04-07
-- Run this to restore the original schema if needed
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. TABLES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  age integer,
  biological_sex text CHECK (biological_sex = ANY (ARRAY['male','female','other','prefer_not_to_say'])),
  diagnosed_conditions text[] DEFAULT '{}'::text[],
  known_triggers text[] DEFAULT '{}'::text[],
  diet_type text CHECK (diet_type = ANY (ARRAY['omnivore','vegetarian','vegan','gluten-free','dairy-free','low-fodmap'])),
  notifications_enabled boolean DEFAULT true,
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.meal_logs (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  logged_at timestamptz DEFAULT now(),
  meal_type text NOT NULL CHECK (meal_type = ANY (ARRAY['breakfast','lunch','dinner','snack'])),
  foods jsonb DEFAULT '[]'::jsonb NOT NULL,
  overall_meal_verdict text CHECK (overall_meal_verdict = ANY (ARRAY['avoid','caution','safest'])),
  notes text,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.symptom_logs (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  logged_at timestamptz DEFAULT now(),
  bloating integer DEFAULT 0 CHECK (bloating >= 0 AND bloating <= 10),
  pain integer DEFAULT 0 CHECK (pain >= 0 AND pain <= 10),
  urgency integer DEFAULT 0 CHECK (urgency >= 0 AND urgency <= 10),
  nausea integer DEFAULT 0 CHECK (nausea >= 0 AND nausea <= 10),
  fatigue integer DEFAULT 0 CHECK (fatigue >= 0 AND fatigue <= 10),
  stool_type integer CHECK (stool_type >= 1 AND stool_type <= 7),
  notes text,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.ai_insights (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  generated_at timestamptz DEFAULT now(),
  insight_type text NOT NULL CHECK (insight_type = ANY (ARRAY['trigger_watching','trigger_likely','trigger_confirmed','pattern','recommendation','weekly_summary'])),
  title text NOT NULL,
  body text NOT NULL,
  related_foods text[],
  confidence text DEFAULT 'low'::text CHECK (confidence = ANY (ARRAY['low','medium','high'])),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.recipes (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  ingredients jsonb DEFAULT '[]'::jsonb NOT NULL,
  steps jsonb DEFAULT '[]'::jsonb NOT NULL,
  prep_time_mins integer NOT NULL,
  meal_type text NOT NULL,
  trigger_free text[] DEFAULT '{}'::text[],
  is_saved boolean DEFAULT false,
  source text NOT NULL CHECK (source = ANY (ARRAY['daily','post_log','generate'])),
  generated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.streaks (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL UNIQUE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_logged_date date,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);


-- ────────────────────────────────────────────────────────────
-- 2. FUNCTIONS
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
$function$;


-- ────────────────────────────────────────────────────────────
-- 3. TRIGGERS
-- (No custom triggers found in public schema — handle_new_user
--  trigger lives on auth.users schema in Supabase dashboard)
-- ────────────────────────────────────────────────────────────

-- Recreate the auth trigger manually if needed:
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ────────────────────────────────────────────────────────────
-- 4. RLS — ENABLE
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;


-- ────────────────────────────────────────────────────────────
-- 5. RLS POLICIES
-- ────────────────────────────────────────────────────────────

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles AS PERMISSIVE FOR SELECT TO public USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles AS PERMISSIVE FOR UPDATE TO public USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON public.profiles AS PERMISSIVE FOR DELETE TO public USING (auth.uid() = id);

-- meal_logs
CREATE POLICY "Users can view own meal logs" ON public.meal_logs AS PERMISSIVE FOR SELECT TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal logs" ON public.meal_logs AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meal logs" ON public.meal_logs AS PERMISSIVE FOR UPDATE TO public USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own meal logs" ON public.meal_logs AS PERMISSIVE FOR DELETE TO public USING (auth.uid() = user_id);

-- symptom_logs
CREATE POLICY "Users can view own symptom logs" ON public.symptom_logs AS PERMISSIVE FOR SELECT TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own symptom logs" ON public.symptom_logs AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own symptom logs" ON public.symptom_logs AS PERMISSIVE FOR UPDATE TO public USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own symptom logs" ON public.symptom_logs AS PERMISSIVE FOR DELETE TO public USING (auth.uid() = user_id);

-- ai_insights
CREATE POLICY "Users can view own insights" ON public.ai_insights AS PERMISSIVE FOR SELECT TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON public.ai_insights AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON public.ai_insights AS PERMISSIVE FOR UPDATE TO public USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own insights" ON public.ai_insights AS PERMISSIVE FOR DELETE TO public USING (auth.uid() = user_id);

-- recipes
CREATE POLICY "Users can view own recipes" ON public.recipes AS PERMISSIVE FOR SELECT TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recipes" ON public.recipes AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipes" ON public.recipes AS PERMISSIVE FOR UPDATE TO public USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipes" ON public.recipes AS PERMISSIVE FOR DELETE TO public USING (auth.uid() = user_id);

-- streaks
CREATE POLICY "Users can view own streak" ON public.streaks AS PERMISSIVE FOR SELECT TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streak" ON public.streaks AS PERMISSIVE FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON public.streaks AS PERMISSIVE FOR UPDATE TO public USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own streak" ON public.streaks AS PERMISSIVE FOR DELETE TO public USING (auth.uid() = user_id);

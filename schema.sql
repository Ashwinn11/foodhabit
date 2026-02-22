-- GutBuddy Supabase Schema
-- Public Schema Tables

CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  onboarding_completed boolean DEFAULT false,
  onboarding_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE gut_logs (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  timestamp timestamp with time zone NOT NULL,
  bristol_type integer CHECK (bristol_type >= 1 AND bristol_type <= 7),
  symptoms jsonb DEFAULT '{}'::jsonb,
  tags text[] DEFAULT ARRAY[]::text[],
  urgency text CHECK (urgency = ANY (ARRAY['none'::text, 'mild'::text, 'severe'::text])),
  pain_score integer CHECK (pain_score >= 0 AND pain_score <= 10),
  notes text,
  duration integer,
  incomplete_evacuation boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gut_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE meals (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  timestamp timestamp with time zone NOT NULL,
  meal_type text CHECK (meal_type = ANY (ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text, 'snack'::text, 'drink'::text])),
  name text,
  foods text[] DEFAULT ARRAY[]::text[],
  portion_size text CHECK (portion_size = ANY (ARRAY['small'::text, 'medium'::text, 'large'::text])),
  description text,
  food_tags text[] DEFAULT ARRAY[]::text[],
  normalized_foods text[] DEFAULT ARRAY[]::text[],
  nutrition jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT meals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);



CREATE TABLE trigger_foods (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  food_name text NOT NULL,
  user_confirmed boolean,
  occurrences integer DEFAULT 1,
  confidence text CHECK (confidence = ANY (ARRAY['Low'::text, 'Medium'::text, 'High'::text])),
  symptoms jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trigger_foods_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  UNIQUE (user_id, food_name)
);

CREATE TABLE user_condition_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  condition text NOT NULL CHECK (condition = ANY (ARRAY['ibs-d'::text, 'ibs-c'::text, 'ibs-m'::text, 'ibs-u'::text, 'bloating'::text])),
  severity text DEFAULT 'moderate'::text CHECK (severity = ANY (ARRAY['mild'::text, 'moderate'::text, 'severe'::text])),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_condition_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Indexes (for performance)
CREATE INDEX idx_gut_logs_user_id ON public.gut_logs(user_id);
CREATE INDEX idx_meals_user_id ON public.meals(user_id);
CREATE INDEX idx_health_logs_user_id ON public.health_logs(user_id);
CREATE INDEX idx_trigger_foods_user_id ON public.trigger_foods(user_id);

-- Custom Function
CREATE OR REPLACE FUNCTION get_user_health_summary(user_uuid uuid)
RETURNS TABLE (
  total_logs bigint,
  avg_bristol numeric,
  symptom_logs bigint,
  red_flag_logs bigint,
  latest_log timestamp with time zone
) AS $$
SELECT
  COUNT(gl.id)::bigint as total_logs,
  AVG(gl.bristol_type)::numeric as avg_bristol,
  COUNT(CASE WHEN gl.symptoms IS NOT NULL AND gl.symptoms != '{}'::jsonb THEN 1 END)::bigint as symptom_logs,
  COUNT(CASE WHEN gl.pain_score >= 7 THEN 1 END)::bigint as red_flag_logs,
  MAX(gl.timestamp) as latest_log
FROM public.gut_logs gl
WHERE gl.user_id = user_uuid;
$$ LANGUAGE SQL;

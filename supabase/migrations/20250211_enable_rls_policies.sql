-- Migration: Enable RLS and create policies for all tables
-- Date: 2025-02-11
-- This fixes permission denied errors by allowing authenticated users to access their own data

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gut_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trigger_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_condition_preferences ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Gut logs table policies
CREATE POLICY "gut_logs_select_own" ON public.gut_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "gut_logs_insert_own" ON public.gut_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "gut_logs_update_own" ON public.gut_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "gut_logs_delete_own" ON public.gut_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Meals table policies
CREATE POLICY "meals_select_own" ON public.meals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meals_insert_own" ON public.meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meals_update_own" ON public.meals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "meals_delete_own" ON public.meals
  FOR DELETE USING (auth.uid() = user_id);

-- Health logs table policies
CREATE POLICY "health_logs_select_own" ON public.health_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "health_logs_insert_own" ON public.health_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "health_logs_update_own" ON public.health_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "health_logs_delete_own" ON public.health_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger foods table policies
CREATE POLICY "trigger_foods_select_own" ON public.trigger_foods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "trigger_foods_insert_own" ON public.trigger_foods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trigger_foods_update_own" ON public.trigger_foods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "trigger_foods_delete_own" ON public.trigger_foods
  FOR DELETE USING (auth.uid() = user_id);

-- User condition preferences table policies
CREATE POLICY "user_condition_preferences_select_own" ON public.user_condition_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_condition_preferences_insert_own" ON public.user_condition_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_condition_preferences_update_own" ON public.user_condition_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_condition_preferences_delete_own" ON public.user_condition_preferences
  FOR DELETE USING (auth.uid() = user_id);

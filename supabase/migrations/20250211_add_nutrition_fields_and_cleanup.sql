-- Migration: Add nutrition fields to meals table, missing fields to gut_logs, and cleanup unused tables
-- Date: 2025-02-11

-- 1. Add nutrition fields to meals table
ALTER TABLE public.meals
ADD COLUMN nutrition jsonb DEFAULT '{}'::jsonb,
ADD COLUMN normalized_foods text[] DEFAULT ARRAY[]::text[];

-- 2. Add missing fields to gut_logs table
ALTER TABLE public.gut_logs
ADD COLUMN duration integer,
ADD COLUMN incomplete_evacuation boolean DEFAULT false;

-- 3. Drop unused health_insights table
DROP TABLE IF EXISTS public.health_insights;

-- 4. Add unique constraint to trigger_foods table
ALTER TABLE public.trigger_foods
ADD CONSTRAINT trigger_foods_unique_user_food UNIQUE (user_id, food_name);

-- 5. Remove unused index
DROP INDEX IF EXISTS public.idx_health_insights_user_id;

-- Migration: Add Meals Table
-- Created: 2026-01-20
-- Description: Adds table for tracking user meals and linking to food triggers

-- ============================================================================
-- MEALS TABLE
-- ============================================================================
CREATE TABLE public.meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'drink')),
    name TEXT,
    foods TEXT[] DEFAULT ARRAY[]::TEXT[],
    portion_size TEXT CHECK (portion_size IN ('small', 'medium', 'large')),
    description TEXT,
    food_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_meals_user_id ON public.meals(user_id);
CREATE INDEX idx_meals_timestamp ON public.meals(timestamp DESC);
CREATE INDEX idx_meals_user_timestamp ON public.meals(user_id, timestamp DESC);

-- Add RLS policies
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meals"
    ON public.meals
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
    ON public.meals
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
    ON public.meals
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
    ON public.meals
    FOR DELETE
    USING (auth.uid() = user_id);

COMMENT ON TABLE public.meals IS 'User meal logs for FODMAP and trigger tracking';

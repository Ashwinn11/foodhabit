-- Migration: Initial Gut Buddy Database Schema
-- Created: 2026-01-19
-- Description: Sets up core tables for user profiles, health tracking, and analytics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Stores user profile and onboarding data
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- ============================================================================
-- GUT LOGS TABLE
-- ============================================================================
-- Stores significant gut health logs (symptoms, red flags, extreme bristol types)
CREATE TABLE public.gut_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    bristol_type INTEGER CHECK (bristol_type >= 1 AND bristol_type <= 7),
    symptoms JSONB DEFAULT '{}'::jsonb,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    urgency TEXT CHECK (urgency IN ('none', 'mild', 'severe')),
    pain_score INTEGER CHECK (pain_score >= 0 AND pain_score <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_gut_logs_user_id ON public.gut_logs(user_id);
CREATE INDEX idx_gut_logs_timestamp ON public.gut_logs(timestamp DESC);
CREATE INDEX idx_gut_logs_user_timestamp ON public.gut_logs(user_id, timestamp DESC);

-- Add RLS policies
ALTER TABLE public.gut_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gut logs"
    ON public.gut_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gut logs"
    ON public.gut_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gut logs"
    ON public.gut_logs
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gut logs"
    ON public.gut_logs
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- HEALTH INSIGHTS TABLE
-- ============================================================================
-- Stores weekly aggregated health summaries
CREATE TABLE public.health_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    avg_bristol_type DECIMAL(3,2),
    total_logs INTEGER DEFAULT 0,
    symptom_count INTEGER DEFAULT 0,
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    red_flags JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_start)
);

-- Add indexes
CREATE INDEX idx_health_insights_user_id ON public.health_insights(user_id);
CREATE INDEX idx_health_insights_week ON public.health_insights(week_start DESC);

-- Add RLS policies
ALTER TABLE public.health_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health insights"
    ON public.health_insights
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health insights"
    ON public.health_insights
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health insights"
    ON public.health_insights
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER FOODS TABLE
-- ============================================================================
-- Stores user-confirmed food triggers
CREATE TABLE public.trigger_foods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    food_name TEXT NOT NULL,
    user_confirmed BOOLEAN,
    occurrences INTEGER DEFAULT 1,
    confidence TEXT CHECK (confidence IN ('Low', 'Medium', 'High')),
    symptoms JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, food_name)
);

-- Add indexes
CREATE INDEX idx_trigger_foods_user_id ON public.trigger_foods(user_id);
CREATE INDEX idx_trigger_foods_confirmed ON public.trigger_foods(user_confirmed);

-- Add RLS policies
ALTER TABLE public.trigger_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trigger foods"
    ON public.trigger_foods
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trigger foods"
    ON public.trigger_foods
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trigger foods"
    ON public.trigger_foods
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trigger foods"
    ON public.trigger_foods
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trigger_foods_updated_at
    BEFORE UPDATE ON public.trigger_foods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================================
-- This trigger automatically creates a user profile when someone signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users table
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get user's health summary
CREATE OR REPLACE FUNCTION get_user_health_summary(user_uuid UUID)
RETURNS TABLE (
    total_logs BIGINT,
    avg_bristol DECIMAL,
    symptom_logs BIGINT,
    red_flag_logs BIGINT,
    latest_log TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_logs,
        ROUND(AVG(bristol_type)::DECIMAL, 2) as avg_bristol,
        COUNT(*) FILTER (WHERE symptoms != '{}'::jsonb)::BIGINT as symptom_logs,
        COUNT(*) FILTER (WHERE array_length(tags, 1) > 0)::BIGINT as red_flag_logs,
        MAX(timestamp) as latest_log
    FROM public.gut_logs
    WHERE user_id = user_uuid
    AND timestamp >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_health_summary(UUID) TO authenticated;

-- ============================================================================
-- INDEXES FOR ANALYTICS (Optional - for future admin dashboard)
-- ============================================================================

-- Composite index for common queries
CREATE INDEX idx_gut_logs_user_bristol ON public.gut_logs(user_id, bristol_type);
CREATE INDEX idx_gut_logs_symptoms ON public.gut_logs USING GIN (symptoms);
CREATE INDEX idx_gut_logs_tags ON public.gut_logs USING GIN (tags);

COMMENT ON TABLE public.users IS 'User profiles and onboarding data';
COMMENT ON TABLE public.gut_logs IS 'Significant gut health logs with medical relevance';
COMMENT ON TABLE public.health_insights IS 'Weekly aggregated health summaries';
COMMENT ON TABLE public.trigger_foods IS 'User-confirmed food triggers';

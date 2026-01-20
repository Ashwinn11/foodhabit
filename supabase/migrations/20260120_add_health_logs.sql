-- Migration: Add Health Logs Table
-- Created: 2026-01-20
-- Description: Adds table for tracking daily health activities (water, fiber, probiotic, exercise)

-- ============================================================================
-- HEALTH LOGS TABLE
-- ============================================================================
-- Stores daily health tracking data for missions and insights
CREATE TABLE public.health_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    log_type TEXT NOT NULL CHECK (log_type IN ('water', 'fiber', 'probiotic', 'exercise')),
    value DECIMAL(10,2) NOT NULL, -- glasses for water, grams for fiber, servings for probiotic, minutes for exercise
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure one entry per user per date per type
    UNIQUE(user_id, date, log_type)
);

-- Add indexes for performance
CREATE INDEX idx_health_logs_user_id ON public.health_logs(user_id);
CREATE INDEX idx_health_logs_date ON public.health_logs(date DESC);
CREATE INDEX idx_health_logs_user_date ON public.health_logs(user_id, date DESC);
CREATE INDEX idx_health_logs_type ON public.health_logs(log_type);

-- Add RLS policies
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health logs"
    ON public.health_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health logs"
    ON public.health_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health logs"
    ON public.health_logs
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health logs"
    ON public.health_logs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_health_logs_updated_at
    BEFORE UPDATE ON public.health_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.health_logs IS 'Daily health tracking for water, fiber, probiotic, and exercise';

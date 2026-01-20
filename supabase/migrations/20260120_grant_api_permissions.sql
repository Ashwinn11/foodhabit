-- Migration: Grant API Permissions for All Tables
-- Created: 2026-01-20
-- Description: Grants necessary permissions to enable PostgREST API access for authenticated users

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions on gut_logs table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gut_logs TO authenticated;

-- Grant permissions on meals table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meals TO authenticated;

-- Grant permissions on health_logs table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_logs TO authenticated;

-- Grant permissions on users table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;

-- Grant permissions on trigger_foods table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trigger_foods TO authenticated;

-- Grant permissions on health_insights table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_insights TO authenticated;

-- Grant sequence permissions (for auto-increment IDs if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON TABLE public.gut_logs IS 'API enabled - Gut health logs';
COMMENT ON TABLE public.meals IS 'API enabled - Meal logs';
COMMENT ON TABLE public.health_logs IS 'API enabled - Health tracking logs';

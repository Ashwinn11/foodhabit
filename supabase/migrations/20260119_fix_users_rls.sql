-- Fix: Add missing INSERT policy for users table
-- The auto-creation trigger needs this to work

-- First, check if the policy already exists and drop it if needed
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;

-- Add INSERT policy for the trigger (SECURITY DEFINER allows this)
CREATE POLICY "Service role can insert users"
    ON public.users
    FOR INSERT
    WITH CHECK (true);

-- Also ensure users can insert their own profile (for manual creation if needed)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Users can insert own profile"
    ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

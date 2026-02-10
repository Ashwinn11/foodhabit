-- Create user_condition_preferences table for storing user's gut condition
CREATE TABLE public.user_condition_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  condition TEXT NOT NULL CHECK (condition IN ('ibs-d', 'ibs-c', 'ibs-m', 'ibs-u', 'bloating')),
  severity TEXT DEFAULT 'moderate' CHECK (severity IN ('mild', 'moderate', 'severe')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id) -- One condition preference per user
);

-- Create index for faster lookups
CREATE INDEX idx_user_condition_preferences_user_id ON public.user_condition_preferences(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_condition_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own condition preferences
CREATE POLICY "Users can view their own condition preferences"
  ON public.user_condition_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own condition preferences
CREATE POLICY "Users can insert their own condition preferences"
  ON public.user_condition_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own condition preferences
CREATE POLICY "Users can update their own condition preferences"
  ON public.user_condition_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own condition preferences
CREATE POLICY "Users can delete their own condition preferences"
  ON public.user_condition_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_condition_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_condition_preferences_updated_at
  BEFORE UPDATE ON public.user_condition_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_condition_preferences_timestamp();

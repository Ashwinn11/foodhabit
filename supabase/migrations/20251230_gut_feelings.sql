-- Create gut_feelings table to track user's gut state throughout the day
CREATE TABLE IF NOT EXISTS gut_feelings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feeling TEXT NOT NULL CHECK (feeling IN ('great', 'okay', 'bloated', 'pain', 'nauseous')),
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_gut_feelings_user_id ON gut_feelings(user_id);
CREATE INDEX IF NOT EXISTS idx_gut_feelings_logged_at ON gut_feelings(logged_at DESC);

-- Enable RLS
ALTER TABLE gut_feelings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own gut feelings"
    ON gut_feelings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gut feelings"
    ON gut_feelings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gut feelings"
    ON gut_feelings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gut feelings"
    ON gut_feelings FOR DELETE
    USING (auth.uid() = user_id);

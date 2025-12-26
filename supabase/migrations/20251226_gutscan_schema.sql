-- GutScan Database Schema
-- Simple schema for food scanning app with mascot

-- ============================================
-- 1. USER PROFILES (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  
  -- Gigi mascot data
  gigi_level INTEGER DEFAULT 1,
  total_scans INTEGER DEFAULT 0,
  
  -- Personalization
  known_triggers TEXT[] DEFAULT '{}', -- ['dairy', 'gluten']
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. FOOD SCANS
-- ============================================
CREATE TABLE IF NOT EXISTS food_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Image
  image_url TEXT,
  
  -- AI Recognition
  identified_foods JSONB DEFAULT '[]', -- [{"name": "chicken", "confidence": 0.95}]
  
  -- Scoring
  gut_health_score INTEGER NOT NULL, -- 0-100
  score_factors JSONB DEFAULT '{}', -- {"fiber": 18, "triggers": -8, "plants": 12}
  
  -- Gigi reaction
  gigi_emotion TEXT, -- 'happy', 'neutral', 'sad'
  gigi_message TEXT,
  
  -- Metadata
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE food_scans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own scans"
  ON food_scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
  ON food_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
  ON food_scans FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_food_scans_user_id ON food_scans(user_id);
CREATE INDEX idx_food_scans_scanned_at ON food_scans(scanned_at DESC);

-- ============================================
-- 3. USER STREAKS
-- ============================================
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_scan_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own streak"
  ON user_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON user_streaks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak"
  ON user_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. FOOD DATABASE (Reference Data)
-- ============================================
CREATE TABLE IF NOT EXISTS food_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT, -- 'vegetable', 'fruit', 'protein', 'grain', 'dairy', 'processed'
  
  -- Gut health factors
  fiber_score INTEGER DEFAULT 0, -- 0-10
  trigger_risk INTEGER DEFAULT 0, -- 0-10
  is_plant BOOLEAN DEFAULT false,
  common_triggers TEXT[] DEFAULT '{}', -- ['lactose', 'gluten', 'fodmap']
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public read access for food database
ALTER TABLE food_database ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view food database"
  ON food_database FOR SELECT
  TO authenticated
  USING (true);

-- Seed initial food data
INSERT INTO food_database (name, category, fiber_score, trigger_risk, is_plant, common_triggers) VALUES
('chicken breast', 'protein', 0, 2, false, '{}'),
('salmon', 'protein', 0, 1, false, '{}'),
('broccoli', 'vegetable', 9, 3, true, '{fodmap}'),
('spinach', 'vegetable', 8, 1, true, '{}'),
('avocado', 'fruit', 7, 2, true, '{}'),
('banana', 'fruit', 5, 1, true, '{}'),
('white rice', 'grain', 2, 1, true, '{}'),
('brown rice', 'grain', 6, 1, true, '{}'),
('bread', 'grain', 3, 7, true, '{gluten}'),
('milk', 'dairy', 0, 8, false, '{lactose, dairy}'),
('cheese', 'dairy', 0, 7, false, '{lactose, dairy}'),
('yogurt', 'dairy', 0, 5, false, '{lactose, dairy}'),
('pizza', 'processed', 2, 8, false, '{gluten, dairy}'),
('burger', 'processed', 1, 7, false, '{gluten}')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 5. SUBSCRIPTIONS (for freemium model)
-- ============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  subscription_status TEXT DEFAULT 'free', -- 'free', 'premium', 'trial'
  
  -- Daily scan limits
  daily_scan_count INTEGER DEFAULT 0,
  last_scan_reset_date DATE DEFAULT CURRENT_DATE,
  
  -- Subscription details
  subscription_platform TEXT, -- 'ios', 'android'
  subscription_id TEXT,
  subscription_ends_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update Gigi level based on total scans
CREATE OR REPLACE FUNCTION update_gigi_level()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET 
    total_scans = total_scans + 1,
    gigi_level = CASE
      WHEN total_scans + 1 >= 500 THEN 20
      WHEN total_scans + 1 >= 100 THEN 10
      WHEN total_scans + 1 >= 50 THEN 5
      ELSE 1
    END,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update Gigi level on new scan
CREATE TRIGGER on_new_scan_update_gigi
  AFTER INSERT ON food_scans
  FOR EACH ROW
  EXECUTE FUNCTION update_gigi_level();

-- Function to update streak
CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_scan_date DATE;
  v_current_streak INTEGER;
BEGIN
  -- Get current streak data
  SELECT last_scan_date, current_streak
  INTO v_last_scan_date, v_current_streak
  FROM user_streaks
  WHERE user_id = NEW.user_id;
  
  -- If no streak record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_scan_date)
    VALUES (NEW.user_id, 1, 1, CURRENT_DATE);
    RETURN NEW;
  END IF;
  
  -- Update streak logic
  IF v_last_scan_date = CURRENT_DATE THEN
    -- Same day, no change
    RETURN NEW;
  ELSIF v_last_scan_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    UPDATE user_streaks
    SET 
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_scan_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE user_streaks
    SET 
      current_streak = 1,
      last_scan_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update streak on new scan
CREATE TRIGGER on_new_scan_update_streak
  AFTER INSERT ON food_scans
  FOR EACH ROW
  EXECUTE FUNCTION update_streak();

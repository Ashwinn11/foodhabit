-- Add onboarding_complete field to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;

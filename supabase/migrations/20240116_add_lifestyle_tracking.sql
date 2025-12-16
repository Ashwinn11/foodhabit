-- Add lifestyle tracking columns to stool_entries table
ALTER TABLE stool_entries
ADD COLUMN IF NOT EXISTS stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
ADD COLUMN IF NOT EXISTS sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
ADD COLUMN IF NOT EXISTS sleep_hours DECIMAL(3,1),
ADD COLUMN IF NOT EXISTS water_intake INTEGER, -- in ml
ADD COLUMN IF NOT EXISTS exercise_minutes INTEGER,
ADD COLUMN IF NOT EXISTS exercise_type TEXT,
ADD COLUMN IF NOT EXISTS medications TEXT[]; -- array of medication names

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stool_entries_stress ON stool_entries(stress_level);
CREATE INDEX IF NOT EXISTS idx_stool_entries_sleep ON stool_entries(sleep_quality);

-- Add comments for documentation
COMMENT ON COLUMN stool_entries.stress_level IS 'Stress level (1-10): 1=Very Relaxed, 10=Extremely Stressed';
COMMENT ON COLUMN stool_entries.sleep_quality IS 'Sleep quality (1-10): 1=Very Poor, 10=Excellent';
COMMENT ON COLUMN stool_entries.sleep_hours IS 'Hours of sleep (e.g., 7.5)';
COMMENT ON COLUMN stool_entries.water_intake IS 'Water intake in milliliters';
COMMENT ON COLUMN stool_entries.exercise_minutes IS 'Exercise duration in minutes';
COMMENT ON COLUMN stool_entries.exercise_type IS 'Type of exercise (e.g., walking, running, yoga)';
COMMENT ON COLUMN stool_entries.medications IS 'Array of medication names taken';

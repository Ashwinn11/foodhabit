-- Vision API Cache Table (for consistent results)
CREATE TABLE IF NOT EXISTS vision_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_hash TEXT UNIQUE NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

CREATE INDEX IF NOT EXISTS idx_vision_cache_hash ON vision_cache(image_hash);
CREATE INDEX IF NOT EXISTS idx_vision_cache_expires ON vision_cache(expires_at);

-- Add gut health specific fields to food_database
ALTER TABLE food_database ADD COLUMN IF NOT EXISTS gut_benefits TEXT[];
ALTER TABLE food_database ADD COLUMN IF NOT EXISTS gut_warnings TEXT[];
ALTER TABLE food_database ADD COLUMN IF NOT EXISTS prebiotic_score INTEGER DEFAULT 0;
ALTER TABLE food_database ADD COLUMN IF NOT EXISTS probiotic_score INTEGER DEFAULT 0;
ALTER TABLE food_database ADD COLUMN IF NOT EXISTS anti_inflammatory BOOLEAN DEFAULT false;
ALTER TABLE food_database ADD COLUMN IF NOT EXISTS fermentable BOOLEAN DEFAULT false;

-- Populate gut health data for common foods
UPDATE food_database SET 
    gut_benefits = ARRAY['High in prebiotic fiber', 'Feeds beneficial gut bacteria', 'Supports digestive health'],
    prebiotic_score = 9,
    anti_inflammatory = true,
    fermentable = true
WHERE name = 'Broccoli';

UPDATE food_database SET
    gut_benefits = ARRAY['Excellent fiber source', 'Supports gut motility', 'Helps maintain healthy gut lining'],
    prebiotic_score = 6,
    anti_inflammatory = false,
    fermentable = false
WHERE name = 'Brown Rice';

UPDATE food_database SET
    gut_benefits = ARRAY['Rich in probiotics', 'Supports beneficial bacteria', 'Aids digestion'],
    probiotic_score = 8,
    anti_inflammatory = true
WHERE name = 'Yogurt';

UPDATE food_database SET
    gut_warnings = ARRAY['Contains FODMAPs - may cause bloating', 'Fermentable fiber can trigger gas'],
    prebiotic_score = 7,
    fermentable = true
WHERE name = 'Onion';

UPDATE food_database SET
    gut_warnings = ARRAY['Contains FODMAPs - may cause bloating in sensitive individuals', 'High fermentable fiber'],
    prebiotic_score = 9,
    fermentable = true
WHERE name IN ('Garlic', 'Cauliflower', 'Cabbage', 'Asparagus');

UPDATE food_database SET
    gut_benefits = ARRAY['High in resistant starch', 'Feeds beneficial bacteria', 'Supports colon health'],
    prebiotic_score = 8,
    anti_inflammatory = true
WHERE name = 'Sweet Potato';

UPDATE food_database SET
    gut_benefits = ARRAY['Excellent fiber source', 'Rich in antioxidants', 'Supports gut health'],
    prebiotic_score = 9,
    anti_inflammatory = true
WHERE name = 'Kale';

UPDATE food_database SET
    gut_warnings = ARRAY['Highly processed', 'May disrupt gut microbiome', 'Low nutritional value'],
    anti_inflammatory = false
WHERE category = 'processed';

UPDATE food_database SET
    gut_benefits = ARRAY['Good protein source', 'Supports gut lining repair'],
    anti_inflammatory = false
WHERE category = 'protein' AND is_plant = false;

UPDATE food_database SET
    gut_benefits = ARRAY['Plant-based protein', 'High in fiber', 'Supports beneficial bacteria'],
    prebiotic_score = 8,
    anti_inflammatory = true
WHERE category = 'protein' AND is_plant = true;

-- Add cleanup job for expired cache (optional, can be run periodically)
-- DELETE FROM vision_cache WHERE expires_at < NOW();

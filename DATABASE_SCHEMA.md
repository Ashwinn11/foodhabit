# Food Habit: Complete Database Schema & API Reference

## Database Overview

**Type:** PostgreSQL (via Supabase)
**Schema:** public
**Tables:** 4 main + auth integration
**Security:** Row-level security (future)

---

## 1. PROFILES TABLE
Stores user baseline data from onboarding and profile edits.

### Schema
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Body Basics
  age INTEGER CHECK (age BETWEEN 1 AND 120),
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height INTEGER CHECK (height BETWEEN 100 AND 250),  -- cm
  weight INTEGER CHECK (weight BETWEEN 20 AND 500),   -- kg

  -- Lifestyle
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'moderate', 'active')),
  sleep_hours NUMERIC,
  diet_type TEXT CHECK (diet_type IN ('veg', 'non_veg', 'vegan')),
  eating_window_start TEXT,  -- HH:MM format
  eating_window_end TEXT,    -- HH:MM format

  -- Symptom Baseline (onboarding collected)
  bloating_severity INTEGER CHECK (bloating_severity BETWEEN 0 AND 10),
  bloating_frequency TEXT CHECK (bloating_frequency IN ('never', 'rarely', 'sometimes', 'often', 'daily')),
  abdominal_pain_severity INTEGER CHECK (abdominal_pain_severity BETWEEN 0 AND 10),
  bowel_movement_frequency NUMERIC,
  bowel_movement_quality INTEGER CHECK (bowel_movement_quality BETWEEN 1 AND 7),
  has_constipation BOOLEAN,
  has_diarrhea BOOLEAN,
  gas_severity INTEGER CHECK (gas_severity BETWEEN 0 AND 10),
  baseline_energy_level INTEGER CHECK (baseline_energy_level BETWEEN 0 AND 10),
  baseline_mood_quality INTEGER CHECK (baseline_mood_quality BETWEEN 0 AND 10),
  has_brain_fog BOOLEAN,
  digestive_impact_on_life INTEGER CHECK (digestive_impact_on_life BETWEEN 0 AND 10),

  -- Medical Context
  diagnosed_conditions TEXT[],  -- ['ibs', 'gerd', 'lactose_intolerance', 'pcos', 'diabetes', 'thyroid']
  food_allergies TEXT[],        -- ['dairy', 'gluten', 'nuts', 'shellfish', 'soy', 'eggs']
  restricts_food_severely BOOLEAN,
  binges_regularly BOOLEAN,

  -- Goals
  focus_area TEXT CHECK (focus_area IN ('sugar', 'energy', 'gut', 'weight')),
  water_intake INTEGER,         -- glasses per day
  cooking_ratio INTEGER CHECK (cooking_ratio BETWEEN 0 AND 100),  -- %

  -- Metadata
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Key Characteristics
- **One per user:** Primary key is user ID
- **Immutable baseline:** Captured at onboarding, updated via profile edits
- **Used for:** Activity level in metabolism scoring, baseline for comparisons

---

## 2. MEAL_LOGS TABLE
Stores every meal logged by the user with food categorization and post-meal symptoms.

### Schema
```sql
CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Meal Content
  meal_name TEXT NOT NULL,
  meal_size TEXT CHECK (meal_size IN ('small', 'normal', 'large')),
  meal_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Auto-Categorized Food Type (keyword-based)
  is_high_sugar BOOLEAN DEFAULT FALSE,
  is_high_fat BOOLEAN DEFAULT FALSE,
  is_high_carb BOOLEAN DEFAULT FALSE,
  is_high_fiber BOOLEAN DEFAULT FALSE,
  is_high_protein BOOLEAN DEFAULT FALSE,
  is_processed BOOLEAN DEFAULT FALSE,

  -- Post-Meal Symptom (User-Reported, Mandatory)
  symptom TEXT NOT NULL CHECK (symptom IN ('fine', 'mild_discomfort', 'bloating')),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meal_logs_user_time ON meal_logs(user_id, meal_time DESC);
CREATE INDEX idx_meal_logs_user_created ON meal_logs(user_id, created_at DESC);
```

### Key Characteristics
- **Multiple per day:** Users log 2-3 meals daily
- **Immutable:** Deleted only by user request
- **Time-based queries:** All scoring uses 7-day windows
- **Symptom requirement:** Forces user engagement post-meal

### Food Categorization Logic
```typescript
// Keyword matching during meal logging
const foodCategories = {
  high_sugar: ['candy', 'soda', 'cake', 'sugar', 'sweet', 'dessert', 'chocolate', 'donut', 'ice cream'],
  high_fat: ['fried', 'butter', 'cheese', 'oil', 'pizza', 'meat', 'cream', 'deep-fried', 'bacon'],
  high_carb: ['bread', 'rice', 'pasta', 'noodles', 'potato', 'flour', 'cereal'],
  high_fiber: ['salad', 'vegetables', 'beans', 'lentils', 'oats', 'whole grain', 'broccoli'],
  high_protein: ['chicken', 'fish', 'eggs', 'tofu', 'meat', 'protein', 'greek yogurt', 'salmon'],
  processed: ['instant', 'packaged', 'frozen', 'canned', 'processed', 'ready-made']
};
```

### Example Rows
```
meal_id | user_id | meal_name | meal_size | symptom | is_high_sugar | is_high_fat | is_high_fiber | created_at
--------|---------|-----------|-----------|---------|---------------|-------------|---------------|------------------
uuid-1  | user-x  | Oatmeal   | normal    | fine    | false         | false       | true          | 2025-01-10 08:30
uuid-2  | user-x  | Pizza     | large     | bloating| false         | true        | false         | 2025-01-10 12:00
uuid-3  | user-x  | Salad     | normal    | fine    | false         | false       | true          | 2025-01-10 19:00
```

---

## 3. DAILY_CHECK_INS TABLE
Stores once-per-day health and digestion data.

### Schema
```sql
CREATE TABLE daily_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,

  -- Digestion (Bristol Scale)
  had_bowel_movement BOOLEAN NOT NULL,
  bristol_stool_type INTEGER CHECK (bristol_stool_type IS NULL OR bristol_stool_type BETWEEN 1 AND 7),
  has_bloating BOOLEAN NOT NULL DEFAULT FALSE,
  has_constipation BOOLEAN NOT NULL DEFAULT FALSE,

  -- Hydration (3-Level)
  water_intake TEXT NOT NULL CHECK (water_intake IN ('low', 'medium', 'high')),

  -- Daily Vitals
  energy_level TEXT NOT NULL CHECK (energy_level IN ('low', 'normal', 'high')),
  mood_stress TEXT NOT NULL CHECK (mood_stress IN ('low', 'medium', 'high')),
  sleep_quality TEXT NOT NULL CHECK (sleep_quality IN ('bad', 'ok', 'good')),
  appetite TEXT NOT NULL CHECK (appetite IN ('low', 'normal', 'high')),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_daily_checkin UNIQUE (user_id, check_in_date)
);

CREATE INDEX idx_daily_check_ins_user_date ON daily_check_ins(user_id, check_in_date DESC);
CREATE INDEX idx_daily_check_ins_user_created ON daily_check_ins(user_id, created_at DESC);
```

### Key Characteristics
- **One per day per user:** Enforced by UNIQUE constraint
- **Evening trigger:** Notification at 8 PM
- **Essential for scoring:** Used in Gut, Metabolism, Nutrition formulas
- **Bristol scale:** 1-2 = constipation (bad), 3-5 = healthy, 6-7 = diarrhea (bad)

### Example Rows
```
id | user_id | check_in_date | had_bowel_movement | bristol_stool_type | water_intake | energy_level | sleep_quality | created_at
---|---------|---------------|--------------------|--------------------|----|------|-----|------------------
1  | user-x  | 2025-01-10    | true               | 4                  | high | normal | ok | 2025-01-10 20:15
2  | user-x  | 2025-01-09    | true               | 3                  | medium | normal | good | 2025-01-09 20:30
3  | user-x  | 2025-01-08    | false              | NULL               | low | low | bad | 2025-01-08 20:00
```

---

## 4. HEALTH_METRICS TABLE
Stores calculated body age and health scores (baseline from onboarding + real-time from logs).

### Schema
```sql
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Baseline/Projected Scores (from onboarding)
  metabolic_age INTEGER CHECK (metabolic_age BETWEEN 18 AND 120),
  gut_health_score INTEGER CHECK (gut_health_score BETWEEN 0 AND 100),
  nutrition_balance_score INTEGER CHECK (nutrition_balance_score BETWEEN 0 AND 100),

  -- Real-Time Scores (from meal logs + daily check-ins)
  nutrition_score_real INTEGER CHECK (nutrition_score_real IS NULL OR (nutrition_score_real BETWEEN 0 AND 100)),
  gut_health_score_real INTEGER CHECK (gut_health_score_real IS NULL OR (gut_health_score_real BETWEEN 0 AND 100)),
  metabolism_score_real INTEGER CHECK (metabolism_score_real IS NULL OR (metabolism_score_real BETWEEN 0 AND 100)),
  body_age_real INTEGER CHECK (body_age_real IS NULL OR (body_age_real BETWEEN 18 AND 120)),

  -- Metadata
  days_with_data INTEGER DEFAULT 0,
  last_meal_logged_at TIMESTAMPTZ,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_metrics_user_calculated ON health_metrics(user_id, calculated_at DESC);
```

### Key Characteristics
- **Multiple records per user:** New record created each time scores recalculate
- **History preserved:** All calculations kept for trend analysis
- **Dual scoring:** Baseline (onboarding) vs Real-time (logs)
- **Immutable:** Calculations never updated, new records appended

### When Scores are Calculated

**Baseline (Onboarding):**
- Triggered: After onboarding complete
- Data source: Profile data only
- Visible: Immediately on Home tab
- Used for: Initial Body Age estimate

**Real-Time (Daily):**
- Triggered: After daily check-in submission
- Data source: Last 7 days of meal_logs + daily_check_ins
- Visible: After 3+ days of data
- Used for: Actual Body Age tracking

### Example Rows
```
id | user_id | metabolic_age | nutrition_score_real | gut_health_score_real | body_age_real | days_with_data | calculated_at
---|---------|---------------|----------------------|-----------------------|---------------|---|------------------
1  | user-x  | 32            | 65                   | 58                    | null          | 0  | 2025-01-08 15:00 (onboarding)
2  | user-x  | 32            | 72                   | 68                    | 29            | 3  | 2025-01-11 20:30 (day 3 real)
3  | user-x  | 32            | 75                   | 70                    | 28            | 7  | 2025-01-15 20:30 (day 7 real)
```

---

## 5. Score Calculation Reference

### Input Data Aggregation (7-day window)

```typescript
interface AggregatedMealData {
  high_sugar_meals: number;         // Count of meals where is_high_sugar = true
  high_fat_meals: number;           // Count of meals where is_high_fat = true
  high_carb_meals: number;          // Count of meals where is_high_carb = true
  fiber_meals: number;              // Count of meals where is_high_fiber = true
  protein_meals: number;            // Count of meals where is_high_protein = true
  bloating_meals: number;           // Count of meals where symptom = 'bloating'
  late_meals: number;               // Count of meals where meal_time hour >= 21
  large_meals: number;              // Count of meals where meal_size = 'large'
}

interface AggregatedCheckInData {
  bad_bristol_stool: number;        // Count of check-ins with bristol_stool_type in [1,2,6,7]
  high_hydration_day: number;       // Count of days where water_intake = 'high'
  poor_sleep: number;               // Count of days where sleep_quality = 'bad'
  activity_level: number;           // From profiles.activity_level (5=moderate, 10=active, 0=sedentary)
  days_count: number;               // How many daily_check_ins exist in window
}
```

### Formula 1: Nutrition Score (N)
**What:** Quality of food consumed (high sugar = worst)

```
N = 100
    – 20 × high_sugar_meals     (largest penalty: -20 per meal)
    – 15 × high_fat_meals       (processed, fried: -15 per meal)
    – 10 × high_carb_meals      (bread, pasta: -10 per meal)
    + 10 × fiber_meals          (vegetables, beans: +10 per meal)
    + 10 × protein_meals        (chicken, fish: +10 per meal)

Range: 0-100 (clamped)
```

**Example:**
```
Day's meals: 3 total
  - Breakfast: oatmeal (fiber: +10)
  - Lunch: grilled chicken salad (protein: +10, fiber: +10)
  - Dinner: pizza (high_fat: -15, high_carb: -10)

N = 100 + 10 + 10 + 10 - 15 - 10 = 95 (excellent day)
```

### Formula 2: Gut Health Score (G)
**What:** Digestion rhythm, symptoms, stool quality

```
G = 100
    – 15 × bloating_meals       (personal triggers: -15 per meal)
    – 10 × late_meals           (after 9 PM: -10 per meal)
    – 20 × bad_bristol_stool    (types 1-2 or 6-7: -20 per day)
    + 10 × fiber_meals          (improves digestion: +10 per meal)
    + 10 × high_hydration_day   (water helps gut: +10 per day)

Range: 0-100 (clamped)
```

**Example:**
```
Last 7 days aggregated:
  - 2 bloating meals: -30
  - 1 late meal (10 PM): -10
  - 2 days bad stool: -40
  - 4 fiber meals: +40
  - 6 high hydration days: +60

G = 100 - 30 - 10 - 40 + 40 + 60 = 120 → clamped to 100
```

### Formula 3: Metabolism Score (M)
**What:** Energy rhythm, sugar load, sleep quality

```
M = 100
    – 20 × high_sugar_meals     (metabolic swings: -20 per meal)
    – 10 × large_meals          (digestion demand: -10 per meal)
    – 15 × poor_sleep           (affects metabolism: -15 per day)
    + activity_level            (5 for moderate, 10 for active)

Range: 0-100 (clamped)
```

**Example:**
```
Last 7 days:
  - 3 high sugar meals: -60
  - 2 large meals: -20
  - 1 bad sleep day: -15
  - Profile: activity_level = 'moderate': +5

M = 100 - 60 - 20 - 15 + 5 = 10 (needs improvement)
```

### Formula 4: Body Age Score
**What:** Composite health score + conversion to years

```
Step 1: Weighted Average
  BA_score = (0.4 × M) + (0.35 × G) + (0.25 × N)

  Where:
    M = Metabolism (40% weight: most important)
    G = Gut Health (35% weight: very important)
    N = Nutrition (25% weight: important)

Step 2: Convert to Age Delta
  Delta_age = (80 - BA_score) / 5

  Baseline: 80 = "healthy" (no age shift)
  Above 80 = younger (negative delta)
  Below 80 = older (positive delta)

Step 3: Calculate Body Age
  Body_age = Real_age + Delta_age

  Range: 18-120 years (clamped)

Step 4: Round
  Body_age = round(Body_age)
```

**Example:**
```
Real age: 28
Last 7 days scores:
  - N = 72
  - G = 68
  - M = 75

BA_score = (0.4 × 75) + (0.35 × 68) + (0.25 × 72)
        = 30 + 23.8 + 18
        = 71.8

Delta_age = (80 - 71.8) / 5 = 8.2 / 5 = 1.64

Body_age = 28 + 1.64 = 29.64 → rounded to 30 years

Result: User is 28 but has Body Age of 30 (slightly aged)
```

---

## 6. API Operations

### Read Operations

#### Get User Profile
```sql
SELECT * FROM profiles WHERE id = $1;
```

#### Get Latest Health Metrics
```sql
SELECT * FROM health_metrics
WHERE user_id = $1
ORDER BY calculated_at DESC
LIMIT 1;
```

#### Get Last 7 Days of Meal Logs
```sql
SELECT * FROM meal_logs
WHERE user_id = $1
  AND meal_time >= NOW() - INTERVAL '7 days'
ORDER BY meal_time DESC;
```

#### Get Last 7 Days of Daily Check-Ins
```sql
SELECT * FROM daily_check_ins
WHERE user_id = $1
  AND check_in_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY check_in_date DESC;
```

#### Check if User Has Enough Data for Real Scores
```sql
SELECT COUNT(*) FROM meal_logs
WHERE user_id = $1
  AND meal_time >= NOW() - INTERVAL '3 days' AS meal_count;

SELECT COUNT(*) FROM daily_check_ins
WHERE user_id = $1
  AND check_in_date >= CURRENT_DATE - INTERVAL '3 days' AS checkin_count;

-- Real scores available if both >= 3
```

### Write Operations

#### Create Meal Log
```sql
INSERT INTO meal_logs (user_id, meal_name, meal_size, meal_time, is_high_sugar, is_high_fat, is_high_carb, is_high_fiber, is_high_protein, is_processed, symptom)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
RETURNING *;
```

#### Create Daily Check-In
```sql
INSERT INTO daily_check_ins (user_id, check_in_date, had_bowel_movement, bristol_stool_type, has_bloating, has_constipation, water_intake, energy_level, mood_stress, sleep_quality, appetite)
VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, $9, $10)
ON CONFLICT (user_id, check_in_date) DO UPDATE SET
  had_bowel_movement = $2,
  bristol_stool_type = $3,
  has_bloating = $4,
  has_constipation = $5,
  water_intake = $6,
  energy_level = $7,
  mood_stress = $8,
  sleep_quality = $9,
  appetite = $10,
  updated_at = NOW()
RETURNING *;
```

#### Create/Update Health Metrics
```sql
INSERT INTO health_metrics (user_id, nutrition_score_real, gut_health_score_real, metabolism_score_real, body_age_real, days_with_data, last_meal_logged_at, calculated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
RETURNING *;
```

#### Update Profile (Edit Body Basics)
```sql
UPDATE profiles
SET age = $2,
    weight = $3,
    height = $4,
    updated_at = NOW()
WHERE id = $1
RETURNING *;
```

---

## 7. Data Aggregation Query Example

```sql
-- Aggregate meal data for scoring (7-day window)
WITH recent_meals AS (
  SELECT
    SUM(CASE WHEN is_high_sugar THEN 1 ELSE 0 END) as high_sugar_count,
    SUM(CASE WHEN is_high_fat THEN 1 ELSE 0 END) as high_fat_count,
    SUM(CASE WHEN is_high_carb THEN 1 ELSE 0 END) as high_carb_count,
    SUM(CASE WHEN is_high_fiber THEN 1 ELSE 0 END) as fiber_count,
    SUM(CASE WHEN is_high_protein THEN 1 ELSE 0 END) as protein_count,
    SUM(CASE WHEN symptom = 'bloating' THEN 1 ELSE 0 END) as bloating_count,
    SUM(CASE WHEN EXTRACT(HOUR FROM meal_time) >= 21 THEN 1 ELSE 0 END) as late_meal_count,
    SUM(CASE WHEN meal_size = 'large' THEN 1 ELSE 0 END) as large_meal_count
  FROM meal_logs
  WHERE user_id = $1
    AND meal_time >= NOW() - INTERVAL '7 days'
),
recent_checkins AS (
  SELECT
    COUNT(CASE WHEN bristol_stool_type IN (1,2,6,7) THEN 1 END) as bad_stool_count,
    COUNT(CASE WHEN water_intake = 'high' THEN 1 END) as high_hydration_count,
    COUNT(CASE WHEN sleep_quality = 'bad' THEN 1 END) as bad_sleep_count,
    COUNT(*) as checkin_days
  FROM daily_check_ins
  WHERE user_id = $1
    AND check_in_date >= CURRENT_DATE - INTERVAL '7 days'
)
SELECT * FROM recent_meals, recent_checkins;
```

---

## 8. Performance Considerations

### Indexes
- `meal_logs(user_id, meal_time DESC)` - Fast meal timeline queries
- `meal_logs(user_id, created_at DESC)` - Recent meals for scoring
- `daily_check_ins(user_id, check_in_date DESC)` - Latest check-in lookup
- `daily_check_ins(user_id, created_at DESC)` - Recent check-ins for aggregation
- `health_metrics(user_id, calculated_at DESC)` - Latest scores

### Query Optimization
- 7-day aggregation uses indexed date columns
- Scoring runs after single daily check-in (not per meal)
- Health metrics records append-only (no updates)
- Soft deletes avoided (harder to query, full history kept)

### Typical Query Response Times
- Get user profile: <10ms
- Get latest health metrics: <10ms
- Aggregate last 7 days: <50ms
- Full scoring calculation: <100ms (in app, not DB)

---

## 9. Data Retention & Archival

### Retention Policy
- **Profiles:** Kept indefinitely (updated via edits)
- **Meal logs:** Kept indefinitely (basis for future trends)
- **Daily check-ins:** Kept indefinitely (history required for analytics)
- **Health metrics:** All calculations preserved (full history for trends)

### User Deletion
```sql
-- Cascade deletes all dependent data
DELETE FROM profiles WHERE id = $1;
-- Automatically deletes: meal_logs, daily_check_ins, health_metrics
```

---

## 10. Example Data Scenario

### User Scenario: Week of Improvement

```
User: "Sarah", Age 32, Activity: Moderate

DAY 1 (Jan 8):
  Meals: Coffee → Fine, Salad → Fine, Pizza → Bloating
  Check-in: Stool type 4, Water medium, Energy low, Sleep ok
  Scores: (baseline only) N=65, G=58, M=70, BA=32

DAY 2 (Jan 9):
  Meals: Oatmeal → Fine, Chicken → Fine, Pasta → Bloating
  Check-in: Stool type 3, Water medium, Energy normal, Sleep bad
  Scores: (baseline only) Data accumulating...

DAY 3 (Jan 10):
  Meals: Yogurt → Fine, Salad → Fine, Grilled fish → Fine
  Check-in: Stool type 4, Water high, Energy high, Sleep good
  Scores: REAL SCORES UNLOCKED!
    Aggregated last 3 days:
    - 0 high_sugar, 1 high_fat, 2 high_carb, 4 fiber, 3 protein, 2 bloating, 1 late, 0 large
    - N = 100 - 0 - 15 - 20 + 40 + 30 = 135 → clamped to 100 ✨
    - G = 100 - 30 - 10 - 20 + 40 + 10 = 90 (excellent!)
    - M = 100 - 0 - 0 - 15 + 5 = 90 (good!)
    - BA_score = (0.4×90) + (0.35×90) + (0.25×100) = 36 + 31.5 + 25 = 92.5
    - Body_age = 32 + (80 - 92.5)/5 = 32 - 2.5 = 29.5 → 30 years

  Home displays: "Your Body Age is 30 (down from projected 32!) 🎉"

DAY 7 (Jan 14):
  After 4 more days of consistent logging:
  - User identifies: "Pizza always causes bloating"
  - Scores improved further based on eating less pizza
  - Body Age = 28 years (2 year improvement!)
  - Insights tab shows: "Your Gut Health improved 15 points!"
```

---

This schema enables real-time, personalized body age tracking with minimal user friction and maximum scientific validity. 🧬

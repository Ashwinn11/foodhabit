# Food Habit: Complete App Functionality & Data Mapping

## Overview
Food Habit is a **body age tracking app** that uses daily food logging and health check-ins to calculate real-time metabolic, gut health, nutrition, and body age scores. The app adapts to each user's unique physiology through continuous data collection and intelligent scoring.

**Core Philosophy:** Minimal data collection (1-2 minutes per day) + medically logical scoring = personalized health insights.

---

## 1. HOME TAB: Your Body Age Dashboard

### Purpose
**Show TODAY'S body status in one glance** with visual metrics and actionable insights.

### Visual Display

#### Main Metric: Body Age Ring
```
┌─────────────────────────┐
│   Your Body Age         │
│                         │
│    ╔═════════════╗      │
│    ║             ║      │
│    ║    28 yrs   ║  ← Large animated ring
│    ║             ║      │ Color: Green (excellent),
│    ╚═════════════╝      │ Primary (good), Orange (needs work)
│                         │
│  Based on 12 days data  │
└─────────────────────────┘
```

**What it represents:**
- `Body Age = Real Age + (80 - BA_score) / 5`
- Lower = younger/healthier
- Changes based on daily habits

**Data Source:**
- Real-time formula from meal logs + daily check-ins
- Recalculated daily after each check-in
- Shows last 7 days of aggregated data

---

#### Mini-Circle Metrics: Your Health Scores
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│    85    │  │    72    │  │    91    │
│Metabolism│  │ Gut      │  │Nutrition │
└──────────┘  └──────────┘  └──────────┘
```

**Three 0-100 scores:**

1. **Metabolism Score (40% weight in Body Age)**
   - Reflects: Energy rhythm, sugar load, sleep quality
   - Calculated from:
     - High sugar meals (strong impact)
     - Large meal sizes
     - Sleep quality (bad, ok, good)
     - Activity level baseline
   - Improves with: Regular sleep, lower sugar, activity

2. **Gut Health Score (35% weight in Body Age)**
   - Reflects: Digestion rhythm, symptoms, stool quality
   - Calculated from:
     - Post-meal symptoms (fine, discomfort, bloating)
     - Late meals (after 9 PM)
     - Bristol stool type (1-7 scale)
     - Fiber consumption
     - Daily hydration levels
   - Improves with: Balanced diet, fiber, water, consistent eating window

3. **Nutrition Score (25% weight in Body Age)**
   - Reflects: Quality of food consumed
   - Calculated from:
     - High sugar meals (largest penalty)
     - High fat meals (processed, fried)
     - High carb meals
     - High fiber presence
     - High protein presence
   - Improves with: Whole foods, fiber, protein, less sugar

---

### Daily Tip Section
```
✨ Based on yesterday's eating:
"You had 2 high-sugar meals. Consider
swapping one for a protein-rich snack
to stabilize your metabolism score."
```

**Triggers based on:**
- Previous day's meal patterns
- Lowest performing metric (Metabolism/Gut/Nutrition)
- Personal food triggers (if identified)

---

### Call-to-Action: FAB Log Button
```
┌──────────────────────────┐
│  [Log Meal] ↓ FAB        │ ← Floating Action Button
└──────────────────────────┘
```

**Purpose:** Quick meal logging (takes <30 seconds)

---

### Data Flow: Home Tab
```
Daily at 8 PM
    ↓
Trigger Daily Check-In Notification
    ↓
User completes check-in (1 minute)
    ↓
Save to daily_check_ins table
    ↓
Aggregate last 7 days of:
  - meal_logs (what, size, symptom)
  - daily_check_ins (digestion, sleep, energy, water)
    ↓
Calculate 4 scores (N, G, M, BA)
    ↓
Update health_metrics table
    ↓
Display refreshed rings & metrics on Home tab
```

---

## 2. PROFILE TAB: Your Health Baseline & Settings

### Purpose
**Store personal data used for scoring baseline** and manage preferences.

### Sections

#### My Body Data (Editable)
```
MY BODY DATA
┌─────────────────────────────┐
│ Edit My Body Data        →  │ ← Tap to open full-screen modal
└─────────────────────────────┘
```

**Modal Content (All Editable):**

**Body Basics:**
- Age (1-120)
- Gender (male/female/other/prefer_not_to_say)
- Height (cm)
- Weight (kg)

**Lifestyle:**
- Activity Level (sedentary/moderate/active)
- Sleep Hours (typical)
- Diet Type (vegetarian/non-vegetarian/vegan)
- Eating Window (start-end times, e.g., 08:00-20:00)

**Medical Context:**
- Diagnosed Conditions (optional: IBS, GERD, Lactose intolerance, PCOS, Diabetes, Thyroid)
- Food Allergies (optional: Dairy, Gluten, Nuts, Shellfish, Soy, Eggs)

**Goals:**
- Focus Area (sugar/energy/gut/weight)
- Daily Water Intake (glasses)
- Home Cooking Ratio (%)

---

#### How Data is Used

**For Baseline Calculation (Onboarding):**
- Creates projected metabolic age during sign-up
- Used only for initial Body Age estimate
- Preserved for user reference

**For Real-Time Adjustment:**
- Activity level → affects Metabolism score calculation
- Sleep hours → baseline for sleep quality comparison
- Eating window → used to identify "late meals" (after 9 PM)
- Diet type + allergies → personalizes food categorization

**When Data Changes:**
- User edits profile → triggers auto-recalculation
- New Body Age, Metabolism, Gut, Nutrition scores generated
- Updates reflect within seconds on Home tab

---

#### Settings Sections

**Subscription Management**
- Placeholder for future premium features

**Support & Legal**
- Help & Support (email link)
- Terms of Service
- Privacy Policy

**Account Actions**
- Sign Out
- Delete Account (future implementation)

---

### Data Flow: Profile Tab
```
User opens Profile
    ↓
Load profile from profiles table
    ↓
Display sections:
  1. Edit My Body Data (tappable)
  2. Subscription
  3. Support & Legal
  4. Account Actions
    ↓
User taps "Edit My Body Data"
    ↓
Open full-screen modal with form
    ↓
User edits age, weight, conditions, lifestyle, goals
    ↓
User taps "Save"
    ↓
Validate form (age: 1-120, weight: 20-500kg, height: 100-250cm)
    ↓
Update profiles table
    ↓
Auto-trigger metrics recalculation
    ↓
Calculate new Body Age based on updated profile
    ↓
Display success message
    ↓
Refresh profile display
```

---

## 3. LOG TAB: Daily Food Tracking & Symptoms

### Purpose
**Show WHAT the user ate** with symptom tracking and meal categorization.

### Log Meal Flow

#### Step 1: Initiate Meal Log
```
User taps FAB [Log Meal]
    ↓
┌──────────────────────────┐
│ What did you eat?        │
│ [Type food name...   ]   │ ← Auto-suggest common foods
│                          │
│ Size (optional):         │
│ ○ Small  ● Normal  ○ Large│
│                          │
│      [Log Meal]          │
└──────────────────────────┘
```

**Data Captured:**
- `meal_name`: Free text input
- `meal_size`: Optional (small/normal/large)
- `meal_time`: Auto-set to current time (editable)

---

#### Step 2: Food Categorization
**Auto-categorization via keyword matching:**

```
Input: "Pizza with extra cheese"
    ↓
Matches keywords:
  - is_high_fat: YES (cheese, pizza oil)
  - is_high_carb: YES (dough)
  - is_processed: YES
  - is_high_sugar: NO
  - is_high_fiber: NO
  - is_high_protein: MAYBE (cheese has protein)
```

**Categorization Rules (Keyword-based):**
- `is_high_sugar`: candy, soda, cake, sugar, sweet, dessert, chocolate, donut
- `is_high_fat`: fried, butter, cheese, oil, pizza, meat, cream, deep-fried
- `is_high_carb`: bread, rice, pasta, noodles, potato, flour
- `is_high_fiber`: salad, vegetables, beans, lentils, oats, whole grain
- `is_high_protein`: chicken, fish, eggs, tofu, meat, protein, Greek yogurt
- `is_processed`: instant, packaged, frozen, canned, processed

---

#### Step 3: Post-Meal Symptom (Mandatory)
**Appears immediately after meal logged:**

```
┌─────────────────────────┐
│ How do you feel?        │
│                         │
│   [😊 Felt Fine]        │ ← 3 large tappable buttons
│   [😐 Mild Discomfort]  │
│   [🤢 Bloating/Gas]     │
└─────────────────────────┘
```

**Why This Matters:**
- Identifies personal food triggers
- "Some foods cause bloating for one person but not another"
- Improves Gut Health score accuracy by >50%

**Data Saved:**
- `symptom`: 'fine' | 'mild_discomfort' | 'bloating'

---

#### Step 4: Meal Timeline Display
**Home view of all logged meals:**

```
TODAY
├─ 08:30  Oatmeal with berries
│         ✅ Felt fine
│         📊 High Fiber, High Protein
│
├─ 12:45  Chicken Caesar Salad
│         ✅ Felt fine
│         📊 High Protein, High Fiber
│
└─ 19:00  Pasta Carbonara
          😐 Mild discomfort
          📊 High Fat, High Carb, Processed

YESTERDAY (3 meals logged)
```

**Each entry shows:**
- Time of meal
- Meal name
- Post-meal symptom (icon)
- Food categories (visual tags)
- Option to delete

---

### Daily Data Collection Timeline

```
Throughout day:
  - User logs meals (whenever they eat)
  - Symptom prompt appears after each meal
  - Data stored in meal_logs table
    ↓
Evening (8 PM):
  - Daily Check-In notification triggered
  - User completes once-per-day form
    ↓
After Daily Check-In:
  - All 7 days of meal + check-in data aggregated
  - N, G, M, BA scores recalculated
  - Home tab refreshes with new metrics
```

---

### Data Flow: Log Tab
```
User logs meal
    ↓
Save to meal_logs:
  - meal_name, meal_size, meal_time
  - is_high_sugar, is_high_fat, is_high_carb, is_high_fiber, is_high_protein, is_processed
    ↓
Show symptom prompt (fine/discomfort/bloating)
    ↓
Save symptom to meal_logs
    ↓
Display meal timeline with all logged meals
    ↓
Each entry shows:
  - Time, meal name, symptom icon, food categories
  - Option to edit/delete
    ↓
User can scroll through meal history
```

---

## 4. INSIGHTS TAB: Trends & Patterns (Future)

### Purpose
**Show PROGRESS over time** and identify personal food triggers.

### Planned Sections

#### Trend Visualizations
```
7-Day & 30-Day Body Age Trends
  ┌─────────────────┐
  │  28  27  26  25 │  ← Getting healthier!
  └─────────────────┘

Gut Health Score Trend
Nutrition Score Trend
Metabolism Score Trend
```

#### Food Triggers Analysis
```
Foods that caused bloating for YOU:
  - Pizza (3x this month)
  - Pasta (2x this month)
  - Fried foods (all occurrences)

Foods that made you feel great:
  - Salads (always "fine")
  - Fish (always "fine")
  - Greek yogurt (always "fine")
```

#### Week-Over-Week Improvements
```
This Week vs Last Week:
  Metabolism: ⬆️ +8 points
  Gut Health: ⬆️ +5 points
  Nutrition:  ⬇️ -3 points
```

#### Energy Predictions
```
Based on your patterns:
If you eat high-sugar tomorrow,
your energy may dip 4-6 hours later
(based on 8 previous instances)
```

---

## 5. CHALLENGES TAB: Habit Building (Future)

### Purpose
**Help user FIX diet habits** through guided challenges.

### Planned Sections

#### Active Challenge
```
┌─────────────────────────────┐
│ Day 3/7 — Sugar Reset       │
│                             │
│ Goal: No added sugar for 7  │
│ days. Estimated Body Age    │
│ improvement: -2 years       │
│                             │
│ ✅ Day 1  ✅ Day 2  ✅ Day 3│
│ ⭕ Day 4  ⭕ Day 5  ⭕ Day 6│
│ ⭕ Day 7                    │
│                             │
│      [Check-In]             │
└─────────────────────────────┘
```

#### Explore Challenges
- No Sugar Week
- Fiber Boost
- Hydration Week
- No Late Dinner
- Protein Power

#### Completed Challenges Summary
```
Achievements Unlocked:
✅ Hydration Master (completed 2x)
✅ Early Bird (eaten before 9 PM for 5+ days)
✅ Balanced Week (scored >75 all 4 metrics)
```

---

## 6. Data Relationships & Calculations

### Database Schema

#### Core Tables

**`profiles` (User baseline)**
```
├─ age, gender, height, weight
├─ activity_level, sleep_hours, diet_type, eating_window
├─ diagnosed_conditions, food_allergies
├─ focus_area, water_intake, cooking_ratio
└─ onboarded_at (timestamp)
```

**`meal_logs` (Food tracking)**
```
├─ meal_name, meal_size, meal_time
├─ is_high_sugar, is_high_fat, is_high_carb
├─ is_high_fiber, is_high_protein, is_processed
├─ symptom (fine/mild_discomfort/bloating)
└─ created_at
```

**`daily_check_ins` (Health tracking)**
```
├─ check_in_date (unique per user per day)
├─ had_bowel_movement, bristol_stool_type
├─ has_bloating, has_constipation
├─ water_intake (low/medium/high)
├─ energy_level, mood_stress, sleep_quality, appetite
└─ created_at
```

**`health_metrics` (Calculated scores)**
```
├─ Baseline scores (from onboarding):
│  ├─ metabolic_age
│  ├─ gut_health_score
│  └─ nutrition_balance_score
│
├─ Real-time scores (from meal logs + check-ins):
│  ├─ nutrition_score_real (0-100)
│  ├─ gut_health_score_real (0-100)
│  ├─ metabolism_score_real (0-100)
│  ├─ body_age_real (18-120)
│
├─ Metadata:
│  ├─ days_with_data (how many days collected)
│  └─ last_meal_logged_at
│
└─ calculated_at (when recalculated)
```

---

### Score Calculation Pipeline

#### Data Collection (Per Day)
```
Morning/Day/Evening:
  ↓ User logs meals
  └─→ meal_logs: {meal_name, meal_size, symptom}

Evening (8 PM):
  ↓ User completes daily check-in
  └─→ daily_check_ins: {bowel_movement, stool_type, hydration, energy, sleep, etc.}
```

#### Aggregation (After Check-In)
```
Aggregate last 7 days:
  ├─ Count high_sugar_meals
  ├─ Count high_fat_meals
  ├─ Count high_carb_meals
  ├─ Count fiber_meals
  ├─ Count protein_meals
  ├─ Count bloating_meals
  ├─ Count late_meals (after 9 PM)
  ├─ Count large_meals
  ├─ Count bad_bristol_stool (types 1-2 or 6-7)
  ├─ Check high_hydration_day (if "high" selected)
  └─ Check poor_sleep (if "bad" selected)
```

#### Scoring Formulas
```
Nutrition Score (N) = 100 - 20*(sugar) - 15*(fat) - 10*(carb) + 10*(fiber) + 10*(protein)

Gut Health Score (G) = 100 - 15*(bloating) - 10*(late_meals) - 20*(bad_stool) + 10*(fiber) + 10*(hydration)

Metabolism Score (M) = 100 - 20*(sugar) - 10*(large_meals) - 15*(poor_sleep) + 10*(activity)

Body Age Score (BA) = (0.4 × M) + (0.35 × G) + (0.25 × N)

Body Age (years) = Real Age + (80 - BA_score) / 5
```

#### Output
```
Update health_metrics:
  ├─ nutrition_score_real
  ├─ gut_health_score_real
  ├─ metabolism_score_real
  ├─ body_age_real
  └─ calculated_at

Refresh Home Tab Display:
  ├─ Update Body Age Ring
  ├─ Update 3 Mini-Circles (N, G, M scores)
  ├─ Update daily tip
  └─ Show "Based on X days of data"
```

---

## 7. Minimum Data Requirements

### For Display on Home Tab

**Baseline/Projected Scores (Onboarding):**
- Show immediately after onboarding
- Based on profile data only
- No meal logging needed

**Real-Time Scores (Live):**
- Requires: ≥3 days of meal logs + daily check-ins
- Once 3 days collected: Switch from baseline → real scores
- Indicator: "Based on 7 days of data" appears

---

## 8. User Journey Example

### Day 1: Onboarding
```
Sign In
  ↓
Onboarding Flow (9 screens)
  - Age, height, weight
  - Activity level, sleep hours
  - Diet type, eating window
  - Symptom baseline
  - Medical conditions
  - Goals
  ↓
Calculate Projected Body Age = 32 years
  ↓
Display on Home Tab
  ├─ Body Age Ring: 32 years
  ├─ Mini-Circles: N=65, G=58, M=70
  └─ "You need 3 days of logging for real scores"
```

### Day 1 Evening
```
User logs 3 meals:
  - 08:00 Coffee → "Fine"
  - 12:30 Salad → "Fine"
  - 19:00 Pasta → "Bloating"
  ↓
At 8 PM: Daily Check-In notification
  ↓
User completes form:
  - Had bowel movement? Yes
  - Bristol type: 4
  - Bloating? No
  - Water intake: Medium
  - Energy: Normal
  - Sleep quality: OK
  - Mood: Medium
  - Appetite: Normal
  ↓
Scores recalculated (1 day of data)
  ↓
Home still shows baseline (need 3 days minimum)
  └─ "Logging for 2 more days to unlock real scores"
```

### Day 4: Real Scores Unlocked
```
After Day 4 Daily Check-In
  ↓
Aggregate 3 days of data:
  - 9 meals logged
  - 3 daily check-ins
  - Meal categories counted
  - Symptoms aggregated
  ↓
Calculate Real Scores:
  - N = 72
  - G = 68
  - M = 75
  - BA = 0.4(75) + 0.35(68) + 0.25(72) = 71.4 → BA_score
  - Body Age = 28 + (80-71.4)/5 = 29 years
  ↓
Home Tab Switches Display:
  ├─ Body Age Ring: 29 years ← Updated from baseline 32
  ├─ Metabolism: 75 ← New
  ├─ Gut: 68 ← New
  ├─ Nutrition: 72 ← New
  └─ "Based on 3 days of data"
```

### Weeks 2-4: Adaptation & Insights
```
User continues logging meals and check-ins daily
  ↓
Each day: Scores recalculate based on last 7 days
  ↓
Patterns emerge:
  - Pasta always causes bloating → User identifies trigger
  - High-sleep days correlate with higher energy
  - More fiber → Better gut score
  ↓
Challenges available:
  - "Sugar Reset" (based on high sugar consumption detected)
  ↓
Insights Tab shows:
  - "Your body age improved 2 years in 2 weeks!"
  - "Pizza is your biggest trigger (100% bloating rate)"
  - "Best days: When you eat vegetables (avg N=85)"
```

---

## 9. Data Validation & Constraints

### Input Validation

**Age:** 1-120 years
**Height:** 100-250 cm
**Weight:** 20-500 kg
**Bristol Stool Type:** 1-7 (integer)
**Water Intake:** 3 levels (low/medium/high)
**Energy/Mood/Sleep:** 3 levels each
**Score Outputs:** Always 0-100 (clamped)
**Body Age:** Always 18-120 years (clamped)

### Data Integrity

**Meal Logs:**
- Required: meal_name, symptom
- Optional: meal_size
- Timestamps: User-editable but validated

**Daily Check-Ins:**
- One per day per user (UNIQUE constraint)
- All fields required except bristol_stool_type
- Triggers recalculation of all 4 scores

**Health Metrics:**
- Immutable after calculation
- New records created with each recalculation
- History preserved for trends

---

## 10. Privacy & Data Ownership

### What Data is Collected
- **Personal:** Age, gender, height, weight, medical conditions, allergies
- **Behavioral:** Meals eaten, portion sizes, post-meal symptoms, sleep, energy
- **Environmental:** Time of meals, activity level, water intake, bowel movements

### What's NOT Collected
- Calorie counts
- Exact food quantities (only size: small/normal/large)
- Continuous tracking (only logged when user inputs)
- Location data
- Photos or biometric data

### Data Retention
- Meal logs: Kept indefinitely
- Daily check-ins: Kept indefinitely
- Health metrics: All calculations preserved for trends
- User can request deletion anytime

---

## 11. Technical Stack

### Frontend
- React Native (Expo SDK 54)
- TypeScript (strict mode)
- React Navigation (bottom tabs)
- Reanimated v4 (smooth animations)
- Design system (theme-based styling)

### Backend
- Supabase (PostgreSQL)
- Real-time subscription support
- Automatic timestamps and indexes
- Row-level security (future)

### Services
- `profileService`: User profile CRUD
- `metricsService`: Baseline metric calculation
- `realTimeScoring`: Live score calculation (N, G, M, BA)

---

## 12. Future Enhancements

### Phase 2
- **Insights Tab:** Trend analysis, food triggers, personalized recommendations
- **Challenges Tab:** Guided habit-building programs
- **AI Food Categorization:** More accurate food type detection
- **TikTok Integration:** Shareable Body Age improvements

### Phase 3
- **Wearable Integration:** Connect to Apple Health, Fitbit
- **Medical Provider Sharing:** Safe data export for doctors
- **Recipe Recommendations:** AI-powered meal suggestions based on goals
- **Community:** Compare trends (anonymized), leaderboards

### Phase 4
- **Smart Notifications:** Optimal meal timing suggestions
- **Predictive Scoring:** "If you eat X, your score will Y"
- **Photo Food Logging:** AI vision for meal categorization
- **Integration with Restaurants:** Real-time nutritional info

---

## 13. Success Metrics

### Retention
- DAU (Daily Active Users): Users logging meals + completing check-ins
- 7-Day Retention: Users active after week 1
- 30-Day Retention: Users seeing real scores + trends

### Engagement
- Avg meals logged per day: Target 2-3
- Daily check-in completion: Target >80%
- Time on Home tab: Avg 30-60 seconds
- Profile edits: 1-2 per month (updates to baseline)

### Health Impact
- Body Age improvement: Avg -2 years over 8 weeks
- Score consistency: Users develop patterns
- Trigger identification: Users identify 2+ personal food triggers
- Challenge completion: >60% of users complete ≥1 challenge

---

## 14. Onboarding Checklist

### New User
- [ ] Email/social sign-in
- [ ] Complete 9-screen onboarding
- [ ] View projected Body Age
- [ ] Log first meal
- [ ] Complete post-meal symptom
- [ ] Set daily check-in notification
- [ ] Log 3 days minimum
- [ ] Unlock real-time scores
- [ ] See Body Age update
- [ ] Save first challenge attempt

### Key Milestones
- **Day 1:** Onboarding complete + 1st meal logged
- **Day 3:** First real scores displayed
- **Day 7:** First trend visible
- **Day 14:** First food trigger identified
- **Day 30:** Body Age improved or stabilized

---

This document maps every feature, data point, and user interaction in Food Habit to its purpose and functionality. 🎯

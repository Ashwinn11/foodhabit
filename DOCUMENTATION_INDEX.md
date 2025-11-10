# Food Habit: Documentation Index

Complete documentation for the Food Habit body age tracking app.

## 📋 Core Documentation Files

### 1. **APP_FUNCTIONALITY.md** (Main Reference)
**Complete user-facing documentation of all app features and data flows**

- **Section 1:** Home Tab (Body Age dashboard, 4-circle metrics, daily tips)
- **Section 2:** Profile Tab (User data, medical context, baseline settings)
- **Section 3:** Log Tab (Meal logging, symptom tracking, food categorization)
- **Section 4:** Insights Tab (Future: trends, food triggers, patterns)
- **Section 5:** Challenges Tab (Future: habit building, achievements)
- **Section 6:** Data Relationships & Calculations
- **Section 7:** Minimum Data Requirements
- **Section 8:** Complete User Journey Example (Day 1 → Week 4)
- **Section 9:** Data Validation & Constraints
- **Section 10:** Privacy & Data Ownership
- **Section 11:** Technical Stack
- **Section 12-13:** Future Enhancements & Success Metrics
- **Section 14:** Onboarding Checklist & Key Milestones

**Use this when:** You need to understand user experience, feature flow, or business logic.

---

### 2. **DATABASE_SCHEMA.md** (Technical Reference)
**Complete database schema and API reference**

- **Section 1-4:** Table Schemas (profiles, meal_logs, daily_check_ins, health_metrics)
- **Section 5:** Score Calculation Formulas (N, G, M, BA with examples)
- **Section 6:** API Operations (Read/Write SQL examples)
- **Section 7:** Data Aggregation Query Examples
- **Section 8:** Performance & Indexing
- **Section 9:** Data Retention Policy
- **Section 10:** Example Data Scenario

**Use this when:** You need to implement backend features, write queries, or understand data structure.

---

### 3. **CLAUDE.md** (Development Guidelines)
**Existing strict rules for app development**

- Package management (npx expo install)
- Design system rules (no hardcoded values)
- Responsive design guidelines
- Code style & conventions
- Authentication flow
- Testing & debugging

**Use this when:** Writing code, following project standards, or troubleshooting issues.

---

### 4. **DESIGN_SYSTEM.md** (Component Library)
**Available UI components, colors, typography, spacing**

- Component library (Button, Card, Text, Input, Container)
- Color system (semantic colors)
- Typography variants (h1-h6, body, label, caption)
- Spacing scale (xs, sm, md, lg, xl)
- Responsive utilities

**Use this when:** Building UI components, styling interfaces, ensuring consistency.

---

## 🎯 Quick Reference Guides

### For Understanding the App
1. Read **APP_FUNCTIONALITY.md Section 1-5** for feature overview
2. Read **APP_FUNCTIONALITY.md Section 8** for user journey example
3. Skim **DATABASE_SCHEMA.md Section 5** for calculation formulas

### For Backend Implementation
1. Read **DATABASE_SCHEMA.md** for complete schema
2. Reference **DATABASE_SCHEMA.md Section 5** for scoring formulas
3. Reference **DATABASE_SCHEMA.md Section 6** for API operations

### For Frontend Implementation
1. Read **CLAUDE.md** for code standards
2. Read **DESIGN_SYSTEM.md** for available components
3. Reference **APP_FUNCTIONALITY.md** for UI flows

### For Debugging/Troubleshooting
1. Check **APP_FUNCTIONALITY.md Section 9** for data constraints
2. Check **DATABASE_SCHEMA.md Section 10** for example scenarios
3. Check **CLAUDE.md** for common issues

---

## 📊 Key Formulas Quick Reference

All formulas use 0-100 scale and are medically logical.

### Nutrition Score (N)
```
N = 100 - 20×(sugar) - 15×(fat) - 10×(carb) + 10×(fiber) + 10×(protein)
```

### Gut Health Score (G)
```
G = 100 - 15×(bloating) - 10×(late_meals) - 20×(bad_stool) + 10×(fiber) + 10×(hydration)
```

### Metabolism Score (M)
```
M = 100 - 20×(sugar) - 10×(large_meals) - 15×(poor_sleep) + activity_level
```

### Body Age (BA)
```
BA_score = (0.4 × M) + (0.35 × G) + (0.25 × N)
Body_age = Real_age + (80 - BA_score) / 5
```

---

## 🗂️ File Structure Overview

```
foodhabit/
├── APP_FUNCTIONALITY.md          ← Complete feature documentation
├── DATABASE_SCHEMA.md             ← Database schema & API reference
├── CLAUDE.md                      ← Development guidelines (existing)
├── DESIGN_SYSTEM.md              ← Component library (existing)
├── DOCUMENTATION_INDEX.md         ← This file
│
├── src/
│   ├── services/
│   │   ├── health/
│   │   │   ├── metricsService.ts        (baseline scoring)
│   │   │   └── realTimeScoring.ts       (daily meal+checkin scoring)
│   │   ├── profile/
│   │   │   └── profileService.ts        (profile CRUD)
│   │   └── auth/
│   │       └── supabaseAuth.ts
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx               (Body Age dashboard)
│   │   ├── ProfileScreen.tsx            (Settings + body data)
│   │   ├── LogScreen.tsx                (Food logging) [TODO]
│   │   ├── InsightsScreen.tsx           (Trends) [TODO]
│   │   └── ChallengesScreen.tsx         (Habits) [TODO]
│   │
│   ├── components/
│   │   ├── modals/
│   │   │   ├── EditMyBodyModal.tsx      (Profile editor)
│   │   │   ├── LogMealModal.tsx         (Meal logger) [TODO]
│   │   │   ├── SymptomPrompt.tsx        (Post-meal) [TODO]
│   │   │   └── DailyCheckInModal.tsx    (Evening form) [TODO]
│   │   │
│   │   ├── MiniCircle.tsx               (Score rings) [TODO]
│   │   ├── Button.tsx, Card.tsx, Text.tsx, Input.tsx, Container.tsx
│   │   └── onboarding/
│   │       └── AnimatedRing.tsx
│   │
│   ├── types/
│   │   └── profile.ts                   (MealLog, DailyCheckIn, HealthMetrics)
│   │
│   └── theme/
│       ├── colors.ts, typography.ts, spacing.ts, responsive.ts
│       └── index.ts
│
└── supabase/
    └── migrations/
        ├── create_meal_logs_table.sql
        ├── create_daily_check_ins_table.sql
        └── update_health_metrics_add_real_scores.sql
```

---

## 🔄 Data Collection & Calculation Flow

```
USER ACTIVITY
    ↓
Logs meals throughout day (2-3 meals)
    + Provides post-meal symptom (fine/discomfort/bloating)
    ↓ stored in meal_logs table

Evening 8 PM:
    ↓
Completes daily check-in (1 form)
    + Digestion, energy, sleep, hydration, mood
    ↓ stored in daily_check_ins table

AUTOMATIC CALCULATION:
    ↓
Aggregate last 7 days:
    - Meal data (counts of sugar/fat/carb/fiber/protein/bloating/late/large)
    - Check-in data (stool type, hydration, sleep, activity)
    ↓
Calculate 4 scores:
    - Nutrition Score (N) = 0-100
    - Gut Health Score (G) = 0-100
    - Metabolism Score (M) = 0-100
    - Body Age Score = Real Age ± (years based on health)
    ↓
Display on Home Tab:
    - Main: Body Age Ring
    - Mini: Metabolism, Gut, Nutrition mini-circles
    ↓
Shows: "Based on X days of data"
    (Real scores available after 3+ days)
```

---

## 📱 Tab Overview

| Tab | Purpose | Data Collected | Data Displayed |
|-----|---------|---|---|
| **Home** | Body Age dashboard | None (displays calculated metrics) | Body Age ring, 3 mini-circles, daily tips |
| **Profile** | Settings & baseline | Body basics, lifestyle, medical, goals | User data, health metrics reference |
| **Log** | Food tracking | Meal name, size, post-meal symptom | Meal timeline, symptom icons |
| **Insights** | Trends & patterns | (uses meal+checkin data) | Food triggers, score trends, week-over-week |
| **Challenges** | Habit building | Challenge completion data | Active challenge, leaderboard |

---

## 🎓 Implementation Priority

### Phase 1: Core (In Progress)
- ✅ Database schema (meals, check-ins, metrics)
- ✅ Scoring service (N, G, M, BA formulas)
- ⚙️ Log Tab UI (FAB, modal, symptom prompt)
- ⚙️ Daily Check-In modal
- ⚙️ Home Tab 4-circle display

### Phase 2: Enhancement
- Insights Tab (trends, food triggers)
- Challenges Tab (habit building)
- Notifications (evening check-in reminder)
- Data visualization improvements

### Phase 3: Advanced
- AI food categorization (replace keywords)
- Wearable integration (Apple Health, Fitbit)
- Medical provider sharing
- TikTok integration for sharing

---

## 💡 Key Concepts

### Body Age
- Calculated as: `Real Age + (80 - BA_score) / 5`
- Lower = younger/healthier
- Updated daily based on meal logs + check-ins
- Shows personalized health status

### Scoring Basis
- **Data-driven:** Only uses logged data
- **Medically logical:** Formulas based on real physiology
- **Minimal friction:** 2-3 minutes data entry per day
- **Personalized:** Identifies individual food triggers

### Food Categorization
- **Automatic:** Keyword matching during meal entry
- **6 categories:** High sugar/fat/carb, high fiber/protein, processed
- **User learning:** App learns user's personal food triggers

### Check-In Requirement
- **Once per day:** Evening (8 PM notification)
- **Essential data:** Digestion, sleep, energy, hydration, mood
- **Enables scoring:** Without daily check-ins, real scores unavailable

---

## ❓ FAQ About Documentation

**Q: Where do I find user journey examples?**
A: See APP_FUNCTIONALITY.md Section 8 - Complete Day 1→Day 4 walkthrough with data.

**Q: Where are the database schemas?**
A: See DATABASE_SCHEMA.md Sections 1-4 - Full SQL with constraints and indexes.

**Q: What formulas should I implement?**
A: See DATABASE_SCHEMA.md Section 5 or Quick Reference above - All 4 formulas with examples.

**Q: How do I know what data to collect?**
A: See APP_FUNCTIONALITY.md Section 3 (Log Tab) and Section 4 (Daily Check-In) - Exact fields specified.

**Q: What's the minimum data needed for real scores?**
A: 3 days of meal logs + 3 daily check-ins = real-time scores unlock. See APP_FUNCTIONALITY.md Section 7.

**Q: How often are scores recalculated?**
A: After each daily check-in. Uses last 7 days of aggregated data. See DATABASE_SCHEMA.md Section 5.

---

## 🚀 Getting Started

1. **First time?** Read APP_FUNCTIONALITY.md sections 1-2 (Home & Profile tabs)
2. **Building backend?** Read DATABASE_SCHEMA.md sections 1-5
3. **Building frontend?** Read CLAUDE.md and DESIGN_SYSTEM.md
4. **Need examples?** Read APP_FUNCTIONALITY.md section 8 & DATABASE_SCHEMA.md section 10
5. **Confused about data?** Read APP_FUNCTIONALITY.md section 6 (Data Relationships)

---

**Last Updated:** January 2025
**Status:** Complete system documentation
**Version:** 1.0

For questions or clarifications, refer to the specific sections above. 🎯

# Gut Harmony - App Documentation

## Overview

**Gut Harmony** is a mobile health tracking application designed to help users identify and understand their food triggers and digestive patterns. The app enables users to log their daily stool health, energy levels, and symptoms, then correlates this data with meals consumed to discover which foods may be causing digestive issues.

**Target Audience:** People with digestive health concerns (IBS, Crohn's, Celiac, food sensitivities) who want to identify their triggers through data-driven insights rather than guesswork.

**Platform:** React Native + Expo (iOS/Android)

**Backend:** Supabase (PostgreSQL database, authentication, real-time capabilities)

---

## Core Value Proposition

Users can **discover what's triggering their gut issues in 7 days** through structured daily logging and intelligent pattern detection. Instead of expensive doctor visits or elimination diets, Gut Harmony provides:

- ✅ Simple 30-second daily logging (stool, energy, mood, symptoms, foods)
- ✅ Food-to-symptom correlation within 3 days (not 7)
- ✅ Weekly challenges that test triggers ("Avoid Milk this week")
- ✅ Real-time pattern insights on home dashboard
- ✅ Progress tracking with transparent scoring system
- ✅ Smart logging (recently eaten foods for quick re-logging)

---

## Key Features

### 1. Authentication
- **Apple Sign In** (iOS native)
- **Google OAuth** (Android/web)
- Secure session management via Supabase Auth
- One-tap sign-in for returning users

### 2. Onboarding Flow (4 Screens)

**Screen 1: Auth Screen**
- Branding and app promise ("Discover what's triggering your gut issues in 7 days")
- 3 value propositions with icons:
  - Find Your Triggers (identify food patterns in 3 days)
  - Track Your Progress (visual insights into patterns)
  - Improve Your Health (actionable recommendations)
- Apple & Google Sign In buttons
- Legal links (Terms, Privacy Policy)

**Screen 2: Profile Screen**
- Collect user profile information:
  - Full name
  - Diagnosed condition (optional: IBS, Crohn's, Celiac, other)
  - Main concern (what symptoms bother them most)
- Sets up user record in database for personalization

**Screen 3: First Log Screen** (4-Step Guided Entry)
- **Step 1: Stool Type** - Visual 7-point Bristol scale grid
  - Types 1-2: Constipation (hard lumps)
  - Types 3-4: Healthy (sausage-shaped)
  - Types 5-7: Diarrhea (soft/liquid)

- **Step 2: Energy Level** - 1-10 scale
  - Quick visual assessment of daily energy

- **Step 3: Symptoms** - Multi-select checkboxes
  - Bloating, Gas, Cramping, Urgency, Burning

- **Step 4: Meals** (Optional)
  - Free-text notes on what they ate

**Screen 4: Celebration Screen**
- Congratulations on completing first entry
- Progress indicator (1/3 entries needed for patterns)
- Encouragement to maintain streak

### 3. Home Screen (Main Dashboard)

**Components:**

- **Header** - Personalized greeting
  - "Hey [Name], ready to feel better?" (dynamic based on time of day)
  - Notification bell icon (future: for reminders/challenges)

- **Mood Check Quick Access**
  - "How are you feeling today?" with 5 emoji options
  - Quick tap to set mood for the day
  - Informs patterns and recommendations

- **Streak Card** - Animated display of current daily logging streak with fire emoji
  - Increases by 1 for each consecutive day of logging
  - Resets if user misses a day
  - Milestone bonuses at 7-day intervals
  - Visual flame that grows with streak

- **This Week's Challenge Card** ⭐ (CRITICAL FOR ENGAGEMENT)
  - Prominent card showing ONE focused challenge per week
  - Example: "Avoid Milk This Week" with icon + brief explanation
  - Time-bound: 7 days with visual countdown
  - Suggest one common trigger based on user's data
  - Rewards for completion (harmony points + badge)
  - Tap to get more info or decline challenge

- **Current Scores Section**
  - Show 2-3 key metrics with animated circular progress rings
  - Example: "Gut Health Score: 68%" (goal: >70%)
  - Example: "Bloating Index: 22%" (goal: <20%)
  - Show normal vs. goal threshold
  - Transparent explanation of what drives each score

- **Quick Log CTA** - Large coral button
  - Shows "Log Today's Entry" if not yet logged today
  - Shows "Logged today ✓" with success badge if already logged
  - Tappable to open Quick Log modal

- **Pattern Insights Section**
  - Surface real food-mood-symptom correlations immediately
  - Example: "You felt great after Salmon (3 times)"
  - Example: "Bloating peaks on days you eat Dairy"
  - Example: "Your mood improved on low-stress days"
  - Not buried behind another screen - visible on main dashboard

- **Recent Logs Section**
  - Last 3 entries displayed as cards
  - Shows date, mood, energy level, symptom count for each
  - "View All" link to history screen
  - Empty state if no entries yet

- **Pull-to-Refresh**
  - User can refresh dashboard to get latest streak, scores, and patterns
  - Loading indicator during refresh

### 4. Quick Log Screen (Modal)

**Purpose:** Fast, 30-second daily entry without friction

**Layout:**
- **Header** - "Quick Log" title + close button
- **4-Step Form** (all required except foods):

  1. **Mood Check** (Required)
     - "How are you feeling?" with emoji/text options
     - 5-8 options: Anxious, Calm, Stressed, Energetic, Tired, Happy, Peaceful
     - Selection changes emotion indicator
     - Sets context for day's data

  2. **Stool Type Grid** (Required)
     - Visual 7-button grid with Bristol scale numbers
     - Color-coded: gray (hard), green (healthy), yellow/red (soft)
     - Selected state shows coral border + background tint

  3. **Energy Level Grid** (Required)
     - 1-10 number grid buttons
     - Shows selected value in header
     - Selected state shows coral background

  4. **Symptoms Grid** (Optional)
     - 5 symptom cards with icons
     - Multi-select with visual toggle state
     - Icons change from outline to solid when selected
     - Color changes to coral when selected

  5. **Food/Meals Logged** (Optional but encouraged)
     - **Recently Eaten Foods** (Smart Feature)
       - Shows last 5 foods user logged
       - One-tap to add (reduces friction on repeat logging)
       - Smart suggestion: "You often eat [food] on Mondays"
     - Add new food button
     - Free text or search database
     - Multiple foods allowed

- **Save Button**
  - Disabled until stool type + energy + mood selected
  - Shows loading spinner during save
  - Success alert: "Entry logged! Your data helps find patterns."
  - Error handling with retry option

**Integration:**
- Opens as modal slide-up from HomeScreen
- After saving: modal closes + dashboard refreshes automatically
- Streak updates immediately
- "Log Today's Entry" button replaced with success badge
- Recently logged foods persist for next logging

### 5. History Screen (Future)
- Calendar view of logged days
- List of all past entries with filters
- Edit/delete entry capability
- Export data option

### 6. Trigger Analysis Screen (Future)
- **Correlation Engine:** Shows which foods correlate with symptoms
- **Time Window:** Looks back 3 days from symptom date
- **Insights Display:**
  - "Dairy appears in 80% of your bloating days"
  - "Gluten correlates with cramping within 24-48 hours"
- **Recommendations:** Suggest elimination or testing phases
- **Sharing:** Export insights as PDF for doctor consultation

---

## Technical Architecture

### Database Schema (Supabase)

**Tables:**

1. **users** (via Supabase Auth)
   - id (UUID, primary key)
   - email
   - phone_number
   - created_at

2. **user_profiles**
   - id (UUID, primary key)
   - user_id (FK to auth.users)
   - full_name
   - condition (diagnosed condition)
   - main_concern (primary symptom)
   - created_at
   - updated_at

3. **stool_entries**
   - id (UUID, primary key)
   - user_id (FK)
   - entry_time (timestamp of event)
   - logged_at (when user logged it)
   - stool_type (1-7 Bristol scale)
   - energy_level (1-10)
   - strain_level (optional)
   - duration_minutes (optional)
   - color (optional)
   - symptoms (JSON: {bloating, gas, cramping, urgency, burning})
   - notes (optional free text)
   - created_at
   - updated_at

4. **meal_entries**
   - id (UUID, primary key)
   - user_id (FK)
   - meal_time (timestamp of meal)
   - logged_at
   - meal_name
   - meal_type (breakfast/lunch/dinner/snack)
   - foods (array of food items)
   - portion_size (optional)
   - allergens (array)
   - notes
   - created_at
   - updated_at

5. **user_streaks**
   - id (UUID, primary key)
   - user_id (FK)
   - current_streak (days)
   - longest_streak (all-time high)
   - last_logged_date
   - harmony_points (gamification currency)
   - created_at
   - updated_at

6. **trigger_correlations** (calculated)
   - id (UUID, primary key)
   - user_id (FK)
   - food_item
   - symptom
   - correlation_strength (0-1)
   - occurrence_count
   - last_updated

7. **achievements**
   - id (UUID, primary key)
   - user_id (FK)
   - achievement_type (streak_7, streak_30, first_entry, etc)
   - achievement_name
   - description
   - unlocked_at

### Services Layer

**entryService.ts**
- `logStoolEntry()` - Create new stool entry
- `logMealEntry()` - Create new meal entry
- `getStoolEntries()` - Fetch user's stool entries
- `getMealEntries()` - Fetch user's meal entries
- `getRecentEntries()` - Get last N days of entries
- `getEntriesByDateRange()` - Query entries between dates

**streakService.ts**
- `getUserStreak()` - Get user's current streak record
- `updateStreak()` - Update streak after logging
- `getStreakCount()` - Get current streak number
- `addHarmonyPoints()` - Award points for milestones
- `unlockAchievement()` - Unlock badges/achievements
- `getAchievements()` - Fetch user's achievements

**triggerDetectionService.ts**
- `analyzeCorrelations()` - ML/statistical correlation analysis
- `findTriggers()` - Identify significant food-symptom pairs
- `getInsights()` - Generate user-friendly insights
- `predictSymptoms()` - Predict symptoms based on meal

**userService.ts**
- `hasCompletedOnboarding()` - Check onboarding status
- `updateUserProfile()` - Save profile info
- `getUserProfile()` - Fetch user details

### Authentication Flow

```
User Opens App
    ↓
Check Supabase Session
    ↓
Session exists?
    ├─ YES → Check onboarding complete?
    │         ├─ YES → Show HomeScreen
    │         └─ NO → Show OnboardingNavigator
    └─ NO → Show AuthScreen (Sign In options)
```

### Navigation Structure

```
App.tsx
├─ AuthScreen (not authenticated)
├─ OnboardingNavigator (authenticated, not onboarded)
│  ├─ OnboardingProfileScreen
│  ├─ OnboardingFirstLogScreen
│  ├─ OnboardingCelebrationScreen
│  └─ Home (on completion)
└─ RootNavigator (authenticated, onboarded)
   └─ TabNavigator
      ├─ HomeScreen
      │  └─ QuickLogScreen (modal)
      ├─ HistoryScreen (future)
      ├─ AnalysisScreen (future)
      └─ ProfileScreen
```

---

## Design System

### Colors
- **Primary Background:** #1a2332 (dark navy)
- **Card Background:** #2a3847 (slightly lighter)
- **Primary Color:** #ff7664 (coral - for CTAs, accents)
- **Secondary Color:** #78D3BF (teal - for success/secondary actions)
- **Tertiary Color:** #cda4e8 (purple - for highlights)
- **Cream Accent:** #FCEFDE (for hero cards, contrast)
- **Text:** #ffffff (white on dark backgrounds)

### Typography
- **Font Family:** Nunito (Google Fonts)
- **Weights:** Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700)
- **Sizes:** Adaptive scaling based on device

### Components
- **Button:** Pill-shaped, coral primary color, haptic feedback
- **Card:** Rounded corners, subtle shadows, card background color
- **Container:** Scrollable safe area wrapper with variants
- **Input:** Minimal dark design with focus states
- **Text:** Semantic typography (largeTitle, title1, body, caption)
- **GlassmorphismCard:** Modern frosted glass effect with glow (future enhancement)

### Spacing
- 8px grid-based system (xs: 4, sm: 8, md: 12, lg: 16, xl: 20, 2xl: 24, 3xl: 32, 4xl: 40, 5xl: 48, 6xl: 64)

---

## User Flows

### First-Time User Journey
```
1. Open App
2. See AuthScreen with value propositions
3. Tap "Sign in with Apple/Google"
4. Enter name + condition info (Profile Screen)
5. Log first stool entry (First Log Screen - 4 steps)
6. See celebration screen (1/3 toward patterns)
7. See HomeScreen with streak = 1
8. Can now access Quick Log daily
```

### Daily User Journey
```
1. Open App → HomeScreen
2. See current streak (e.g., 5 days)
3. Tap "Log Today's Entry"
4. Quick Log modal opens
5. Select stool type, energy, symptoms (30 seconds)
6. Tap "Save Entry"
7. Modal closes → Dashboard refreshes
8. Sees "Logged today ✓" badge + streak stays green
9. Continue next day for streak +1
```

### Trigger Discovery Journey (Future)
```
1. Log daily for 7 days
2. On day 7, unlock "Trigger Analysis" screen
3. View correlations: "Dairy → Bloating in 24hrs"
4. See confidence scores
5. Get recommendations to test/eliminate
6. Share report with doctor
```

---

## Gamification

### Streak System
- **Daily Streak:** Increases by 1 for each day of consecutive logging
- **Streak Reset:** Resets to 0 if user misses a day
- **Visual Feedback:** Fire emoji (🔥) + animated card on HomeScreen
- **Milestone Bonuses:** Extra points at 7, 14, 30, 60, 100 day marks

### Harmony Points
- **First Entry:** 50 points
- **Daily Logging:** 50 points
- **7-Day Streak:** 100 points
- **Trigger Discovered:** 25 points
- **Week Consistent:** 75 points
- **Currency Used For:** Unlocking features, cosmetics, or premium analysis

### Scoring System (TRANSPARENT & ACTIONABLE)

**Gut Health Score (Primary Metric)**
- **What it measures:** Overall digestive wellness based on symptom reduction + energy improvement
- **Calculation:**
  - Baseline: 50%
  - Symptom-Free Days: +2% per day (max +20%)
  - Average Energy Level: +1% per point above 5/10 (max +10%)
  - Consistency: +1% for each consecutive logging day (max +20%)
  - Total: 0-100%
- **Goal:** >70% (indicates good gut health patterns)
- **Updates:** Recalculated daily after logging
- **Transparent Display:** Show breakdown on dashboard (tap to see details)

**Bloating Index (Secondary Metric)**
- **What it measures:** Severity and frequency of bloating
- **Calculation:**
  - 0% = No bloating days this week
  - 100% = Every day has bloating logged
  - Baseline: Average of last 7 days bloating frequency
- **Goal:** <20% (minimal bloating)
- **Visual:** Circular progress ring (red when high, green when low)
- **Used For:** Identifying when triggers are working

**Weekly Challenge Reward**
- Complete challenge (avoid X for 7 days with no violations): +150 Harmony points + Badge
- Partial completion (5-6 days): +50 Harmony points
- Failed attempt: +0 points (no punishment, just new challenge next week)

### Achievements (Badges)
- 🏅 First Entry - Log your first entry
- 🔥 Week Warrior - 7-day streak
- 🔥 Month Master - 30-day streak
- 🎯 Trigger Tracker - First food-symptom correlation found
- 📊 Data Detective - 50+ entries logged
- 🏆 Harmony Hero - 100-day streak
- 🎖️ Challenge Champion - Complete weekly challenge 4 weeks in a row
- 🌟 Pattern Master - Discover 5+ food triggers

---

## Privacy & Safety

### Data Protection
- All data encrypted in transit (HTTPS/TLS)
- Supabase provides row-level security (RLS) policies
- User can only access their own data
- Medical data treated as sensitive

### User Control
- Delete all entries option in settings (future)
- Export personal data (GDPR compliance)
- Optional anonymous mode for testing
- No data sharing without explicit consent

### Disclaimer
- "This app is for informational purposes only"
- "Not a substitute for professional medical advice"
- "Always consult with your doctor"
- "Do not use for self-diagnosis of medical conditions"

---

## Monetization Strategy (Future)

### Free Tier
- Unlimited daily logging
- Basic insights
- 7-day history
- Streak tracking
- Ad-supported (optional)

### Premium Tier ($9.99/month)
- Advanced trigger analysis (ML-powered)
- 90-day history
- Export to PDF/Doctor
- Ad-free experience
- Priority support
- Wearable integration (Apple Health)

### Potential Revenue Streams
- Subscription (Premium features)
- Partnerships with GI clinics (referrals)
- In-app purchases (cosmetics, themes)
- Data anonymization (with consent) for research

---

## Success Metrics

### User Engagement
- Daily Active Users (DAU)
- Weekly retention rate (target: 60%+)
- Average sessions per day
- Session duration

### Feature Adoption
- % users completing onboarding
- % users with 7+ entries
- % users viewing trigger insights
- Quick Log completion rate

### Business Metrics
- Download count
- App store rating (target: 4.5+)
- Premium conversion rate
- User acquisition cost (CAC)
- Lifetime value (LTV)

---

## Roadmap

### Phase 1 (Current - CRITICAL MVP)
- ✅ Authentication (Apple/Google)
- ✅ Onboarding flow
- ✅ Daily stool entry logging
- ✅ Streak tracking
- ✅ Home dashboard
- ⏳ Mood tracking (mood wheel on home + in quick log)
- ⏳ **FOOD LOGGING** (recently eaten foods for quick re-logging) ⭐
- ⏳ **WEEKLY CHALLENGE SYSTEM** ("Avoid X this week") ⭐
- ⏳ **TRANSPARENT SCORING** (Gut Health Score + Bloating Index with goals)
- ⏳ **PATTERN INSIGHTS ON DASHBOARD** (real food-mood-symptom correlations visible immediately, not buried)

### Phase 2 (Q1 2026)
- 📅 History/calendar view
- 📅 Advanced meal logging (with allergen info, portion sizes)
- 📅 Trigger correlation engine (more sophisticated)
- 📅 Analysis screen with deep insights
- 📅 PDF export for doctor consultation
- 📅 Smart food suggestions based on history

### Phase 3 (Q2 2026)
- 📅 Wearable integration (Apple Health, Google Fit)
- 📅 Notifications & reminders
- 📅 Achievements & badges UI
- 📅 Settings & account management
- 📅 Social sharing (optional)

### Phase 4 (Q3 2026)
- 📅 Premium subscription features
- 📅 Advanced ML trigger prediction
- 📅 Doctor/specialist integration
- 📅 Community features (anonymous)
- 📅 AI-powered recommendations

---

## Technical Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React Native + Expo |
| UI Framework | React Native Paper-inspired design |
| Authentication | Supabase Auth (Apple/Google OAuth) |
| Database | PostgreSQL (via Supabase) |
| Real-time | Supabase Realtime subscriptions |
| State Management | React Hooks + Context |
| Navigation | React Navigation v5+ |
| Animations | React Native Animated API |
| Icons | Expo Ionicons |
| Fonts | Expo Google Fonts (Nunito) |
| Storage | Device storage + Supabase |
| Analytics | Segment (future) |
| Crash Reporting | Sentry (future) |

---

## Getting Started

### Prerequisites
- Node.js 16+
- Expo CLI
- iOS Simulator or Xcode
- Android emulator or Android Studio

### Installation
```bash
# Clone repository
git clone <repo-url>
cd foodhabit

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Environment Variables
Create `.env` file in project root:
```
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

---

## Support & Feedback

- **Bug Reports:** GitHub Issues
- **Feature Requests:** GitHub Discussions
- **Contact:** support@gutharmony.com
- **Privacy Questions:** privacy@gutharmony.com

---

## License

MIT License - See LICENSE file for details

---

## Contributors

Built with ❤️ for digestive health awareness.

**Last Updated:** December 13, 2025

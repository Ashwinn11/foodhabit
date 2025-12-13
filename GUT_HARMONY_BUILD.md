# Gut Harmony - Build Implementation Guide

## ✅ Completed

### 1. Database Schema (Supabase)
- ✅ `users` - User profiles with condition & main issue
- ✅ `stool_entries` - Stool logging with Bristol scale
- ✅ `meal_entries` - Food logging
- ✅ `energy_entries` - Energy/mood tracking (optional)
- ✅ `user_streaks` - Streak tracking & gamification
- ✅ `achievements` - Badge system
- ✅ `food_triggers` - Trigger detection results

### 2. Services Created
- ✅ `userService.ts` - User profile management
- ✅ `entryService.ts` - Logging stool & meal entries
- ✅ `streakService.ts` - Streak & achievement system
- ✅ `triggerDetectionService.ts` - Trigger analysis algorithm

### 3. Onboarding Screens
- ✅ `SplashScreen.tsx` - Welcome with promise
- ✅ `ProfileSetupScreen.tsx` - Name, condition, main issue
- ✅ `FirstLogScreen.tsx` - Guided first entry
- ✅ `OnboardingNavigator.tsx` - Orchestration

## 🚧 Next Steps

### IMMEDIATE (Next 1-2 days)

#### 1. Update App.tsx to use OnboardingNavigator
Replace the current AuthScreen logic with conditional onboarding check:

```typescript
import OnboardingNavigator from './src/screens/onboarding/OnboardingNavigator';
import { hasCompletedOnboarding } from './src/services/gutHarmony/userService';

// In AppContent component:
if (!session) {
  return <AuthScreen />;
}

// Check if onboarding complete
if (!onboardingComplete) {
  return <OnboardingNavigator onComplete={handleOnboardingComplete} />;
}

return <RootNavigator />;
```

#### 2. Create Home/Dashboard Screen
```typescript
// src/screens/HomeScreen.tsx
// Display:
// - Current streak (🔥 X days)
// - Harmony score
// - Progress to next milestone
// - Recent entries
// - [+ Quick Log] button
// - Next action from Gutto
```

#### 3. Create Stool Log Modal
```typescript
// src/components/StoolLogModal.tsx
// Reusable component for quick daily logging
// Same UI as FirstLogScreen but for subsequent entries
```

### SHORT TERM (3-7 days)

#### 4. Implement Trigger Detection Flow
```typescript
// When user has 3+ entries:
// 1. Run analyzeTriggers() algorithm
// 2. Show celebration screen with first trigger
// 3. Unlock achievement: "Pattern Detective"
// 4. Award 50 harmony points
```

#### 5. Create Entry History Screen
```typescript
// src/screens/HistoryScreen.tsx
// Display entries in:
// - Calendar view
// - List view
// - Daily detail view
```

#### 6. Add Insights/Analytics Screen
```typescript
// src/screens/InsightsScreen.tsx
// Show:
// - Stool type distribution chart
// - Top food triggers (pie chart)
// - Energy correlation
// - Personalized recommendations
```

### MEDIUM TERM (1-2 weeks)

#### 7. Implement Push Notifications
```typescript
// src/services/notificationService.ts
// Daily reminders at 8:00 AM
// Milestone notifications
// Streak alerts
```

#### 8. Add Export/Share Features
```typescript
// src/services/exportService.ts
// Generate PDF report
// Share with doctor
// Export CSV
```

#### 9. Premium/Paywall Setup
```typescript
// src/services/purchaseService.ts
// Stripe integration
// Subscription management
// Feature gating
```

## File Structure Created

```
src/
├── screens/
│   └── onboarding/
│       ├── SplashScreen.tsx ✅
│       ├── ProfileSetupScreen.tsx ✅
│       ├── FirstLogScreen.tsx ✅
│       └── OnboardingNavigator.tsx ✅
│
├── services/
│   └── gutHarmony/
│       ├── userService.ts ✅
│       ├── entryService.ts ✅
│       ├── streakService.ts ✅
│       └── triggerDetectionService.ts ✅
│
├── components/
│   ├── (existing components)
│   └── (add StoolLogModal here)
│
└── screens/
    ├── (existing screens)
    ├── HomeScreen.tsx (TODO)
    ├── HistoryScreen.tsx (TODO)
    └── InsightsScreen.tsx (TODO)
```

## Key Features to Implement

### Phase 1: Core Logging (MVP) - Days 1-3
- [x] Database schema
- [x] User profile setup
- [x] First stool entry logging
- [x] Meal logging
- [ ] Home dashboard with streak
- [ ] Quick log modal for daily use
- [ ] Day 3 trigger detection reveal

### Phase 2: Retention & Insights - Days 4-7
- [ ] Trigger analysis & display
- [ ] Entry history/calendar view
- [ ] Basic insights charts
- [ ] Achievement system active
- [ ] Daily notifications setup

### Phase 3: Polish & Premium - Week 2+
- [ ] PDF export
- [ ] Doctor sharing
- [ ] Advanced analytics
- [ ] Premium paywall
- [ ] In-app messaging (Gutto personality)

## Testing Checklist

### Onboarding Flow
- [ ] Splash screen displays correctly
- [ ] Profile setup saves to Supabase
- [ ] First log entry submits successfully
- [ ] Streak initialized on first entry
- [ ] Achievement unlocked: "First Step"
- [ ] Redirect to home on completion

### Entry Logging
- [ ] Stool entry saves with all fields
- [ ] Meal entries save correctly
- [ ] Streak updates after logging
- [ ] Daily logging doesn't increase streak twice
- [ ] Streak resets if missed a day

### Algorithm
- [ ] Trigger detection runs after 3 entries
- [ ] Food correlation calculated correctly
- [ ] Confidence score accurate (0-1 range)
- [ ] Likely symptoms identified
- [ ] Top triggers returned in correct order

## API Endpoints to Verify

All using Supabase with Row Level Security:

```
POST /users - Create/update user profile
GET /users/{id} - Get user profile

POST /stool_entries - Log stool entry
GET /stool_entries - Get user's stool entries
GET /stool_entries?date_range=... - Get entries by date

POST /meal_entries - Log meal
GET /meal_entries - Get user's meals

POST /user_streaks - Create streak record
PATCH /user_streaks - Update streak
GET /user_streaks/{user_id} - Get user's streak

POST /achievements - Unlock achievement
GET /achievements - Get user's achievements

POST /food_triggers - Save trigger
GET /food_triggers - Get user's triggers
```

## Environment Variables

Already configured in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Notes

- All timestamps use ISO 8601 format
- Streak updates daily (once per calendar day)
- Algorithm requires minimum 3 entries to function
- Food trigger confidence calculated as: bad_count / total_count
- Achievement/badge system is opt-in (users can disable notifications)

## Contact/Support

For issues:
1. Check Supabase Dashboard for RLS policies
2. Verify auth state in useAuth hook
3. Check console logs for Supabase errors
4. Test with sample data in SQL editor

---

Next: Start building HomeScreen and test onboarding flow!

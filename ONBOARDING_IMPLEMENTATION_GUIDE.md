# Onboarding Implementation Guide

## Completed Components & Services

✅ Database migrations (profiles & health_metrics tables)
✅ Type definitions (src/types/profile.ts)
✅ Profile service (profileService.ts)
✅ Health metrics service (metricsService.ts)
✅ useOnboarding hook
✅ GradientBackground component (with blobs & overlays)
✅ AnimatedRing component (Reanimated)
✅ ProgressIndicator component
✅ IconSelector component
✅ LoadingSequence component
✅ OnboardingHookScreen (fully implemented)

## Remaining Screens to Implement

### Screen 2: OnboardingEducationScreen.tsx

**Location**: `src/screens/onboarding/OnboardingEducationScreen.tsx`

**Purpose**: Show value proposition with 3 cards (Metabolic Age, Gut Health, Nutrition Balance)

**Structure**:
```tsx
export default function OnboardingEducationScreen({ onNext }: { onNext: () => void })
```

**Key Elements**:
- ProgressIndicator (1/5)
- 3 Card components with stagger animation (0.15s between each)
- Ring progress: 20% → 35%
- Cards content:
  - ⚡ Metabolic Age: "Discover how young your body actually performs"
  - 🦠 Gut Health Score: "Know when your digestion feels off balance"
  - 🥗 Nutrition Balance: "See which foods fuel or drain your energy"

**Animations**:
- Cards slide in from bottom with spring physics
- Each card glows on appear
- Ring fills smoothly (0.3s per update)

**Design System**:
- Background: GradientBackground
- Cards: Card component (elevated variant, white)
- Text: Text variants (h4, body, caption)
- Icons: 32x32 containers (#ff7664, #9bcbab, #cda4e8)

---

### Screen 3: OnboardingBodyBasicsScreen.tsx

**Location**: `src/screens/onboarding/OnboardingBodyBasicsScreen.tsx`

**Purpose**: Collect age, gender, height, weight

**Structure**:
```tsx
export default function OnboardingBodyBasicsScreen({
  onNext,
  data,
  updateData,
}: {
  onNext: () => void;
  data: Partial<OnboardingData>;
  updateData: (data: Partial<OnboardingData>) => void;
})
```

**Key Elements**:
- ProgressIndicator (2/5)
- Title: "Let's start with the basics"
- Subtitle: "These help us understand your body's unique baseline"
- 4 Inputs with real-time validation:
  - Age: Input (number keyboard, 13-120, required)
  - Gender: IconSelector (Male/Female/Other/Prefer not to say)
  - Height: Input (cm, required)
  - Weight: Input (kg, required)
- Ring fills 35% → 50% as fields complete
- Button: "Next" (only enabled when all fields filled)

**Validation**:
- Age: 13-120
- Height: 50-250 cm
- Weight: 20-500 kg
- Haptic feedback on each field complete (light)

**Design System**:
- Background: GradientBackground
- Inputs: Input component with white text on gradient
- Icons: IconSelector for gender
- Text: white text on gradient background
- Spacing: Use theme.spacing.* exclusively

---

### Screen 4: OnboardingLifestyleScreen.tsx

**Location**: `src/screens/onboarding/OnboardingLifestyleScreen.tsx`

**Purpose**: Collect activity level, sleep, diet, eating window

**Structure**:
```tsx
export default function OnboardingLifestyleScreen({
  onNext,
  data,
  updateData,
}: {...})
```

**Key Elements**:
- ProgressIndicator (3/5)
- Title: "Now we're getting somewhere..."
- Subtitle: "This tells us how your body actually responds to daily life"
- Inputs:
  - Activity Level: IconSelector (🛋️ Sedentary / 🚶 Moderate / 🏃 Active)
  - Sleep Hours: Slider input (4-12, default 7)
  - Diet Type: IconSelector (🥬 Veg / 🍖 Non-Veg / 🌱 Vegan)
  - Eating Window: Time range inputs (start/end HH:MM format)
- Ring fills 50% → 70%
- Haptic on each selection

---

### Screen 5: OnboardingGoalsScreen.tsx

**Location**: `src/screens/onboarding/OnboardingGoalsScreen.tsx`

**Purpose**: Goal selection and final inputs

**Structure**:
```tsx
export default function OnboardingGoalsScreen({
  onNext,
  data,
  updateData,
}: {...})
```

**Key Elements**:
- ProgressIndicator (4/5)
- Title: "Almost there..."
- Subtitle: "What's the ONE thing you want FEEL to help you fix?"
- Goal selection cards (only 1 selectable):
  - 🍭 Reduce Sugar Cravings
  - 💤 Boost Energy Levels
  - 🤢 Improve Gut Health
  - ⚖️ Manage Weight Better
- Final inputs:
  - Water Intake: Slider (3-16 cups, default 8)
  - Cooking Ratio: Slider (0-100%, default 50)
- Ring fills 70% → 90%
- Goal cards pulse on appear, grow with glow on selection (heavy haptic)

---

### Screen 6: OnboardingLoadingScreen.tsx

**Location**: `src/screens/onboarding/OnboardingLoadingScreen.tsx`

**Purpose**: Synthetic loading screen (8.5s duration)

**Critical for Conversion**: This screen creates the illusion that results are being calculated specifically for the user

**Structure**:
```tsx
export default function OnboardingLoadingScreen({
  onComplete,
}: {
  onComplete: () => void;
})
```

**Key Elements**:
- ProgressIndicator (5/5)
- LoadingSequence component (6 steps, 8.5s total):
  1. "Analyzing your metabolic profile..." (91%)
  2. "Calculating your body age..." (93%)
  3. "Evaluating digestive patterns..." (95%)
  4. "Balancing your nutrition score..." (97%)
  5. "Building your personalized dashboard..." (99%)
  6. "Your results are ready." (100%)
- AnimatedRing pulses and fills to 100%
- Each step: Medium haptic (75ms)
- Completion: Medium → Heavy → Light haptic sequence (300ms total)
- Auto-transition to summary screen after results ready text

**Psychology**:
- Makes user feel system is working hard on their behalf
- 8.5s feels "real" (not instant, not too long)
- Haptic feedback = tactile confirmation
- Separate input/output psychologically

---

### Screen 7: OnboardingSummaryScreen.tsx

**Location**: `src/screens/onboarding/OnboardingSummaryScreen.tsx`

**Purpose**: Show calculated metrics and dopamine hit

**Structure**:
```tsx
export default function OnboardingSummaryScreen({
  metrics,
  onNavigateToDashboard,
}: {
  metrics: HealthMetrics;
  onNavigateToDashboard: () => void;
})
```

**Key Elements**:
- ProgressIndicator (5/5 - completed)
- AnimatedRing at 100% with soft pulse (2s cycle)
- Title: "Here's your personalized FEEL dashboard"
- 3 Metric cards (slide in with 0.15s stagger):
  - ⚡ Metabolic Age: [number] years
  - 🦠 Gut Health Score: [number]/100
  - 🥗 Nutrition Balance: [number]/100
- Numbers count up from 0 to final value (1s duration)
- Icon containers with colored backgrounds + white icons
- Subtext: "These scores will update daily as you log meals"
- Button: Primary "View My Body Dashboard"
- Button pulses (2s repeat) to call attention

**Animations**:
- Ring appears with glow burst (300ms)
- Cards slide in from bottom (0.15s stagger)
- Numbers count up: 0 → final value (1s duration)
- Haptic on each card appear (light)
- Heavy haptic on button press

---

### Navigator: OnboardingNavigator.tsx

**Location**: `src/screens/onboarding/OnboardingNavigator.tsx`

**Purpose**: Stack navigator managing 7-screen flow

**Implementation**:
```tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useOnboarding } from '../../hooks/useOnboarding';
import OnboardingHookScreen from './OnboardingHookScreen';
import OnboardingEducationScreen from './OnboardingEducationScreen';
// ... other screens

const Stack = createNativeStackNavigator();

export function OnboardingNavigator() {
  const { state, updateData, nextStep, completeOnboarding, metrics } = useOnboarding();

  // Screen navigation logic
  // Handle data persistence across screens
  // Connect to health metrics calculation
}
```

**Key Features**:
- Manages onboarding data across all 7 screens
- Progress tracking (currentStep/totalSteps)
- Back button handling (can go back except on loading screen)
- Auto-transition from loading to summary
- Final transition from summary to HomeScreen (with metrics)

---

## Integration Points

### 1. Update App.tsx

Add onboarding check after authentication:

```tsx
// In App.tsx, after auth check:
if (session) {
  const isOnboarded = await checkOnboardingStatus();
  if (!isOnboarded) {
    // Show OnboardingNavigator
  } else {
    // Show TabNavigator
  }
}
```

### 2. Update HomeScreen

Display metrics from onboarding:
- AnimatedRing with Body Age (top center)
- 3 metric cards (Metabolic Age, Gut Health, Nutrition Balance)
- Update quick stats from database

### 3. Update ProfileScreen

Add profile editing:
- Show current onboarding data
- "Edit Profile" button opens modal/screen
- Allow editing of all fields (except locked fields if needed)
- "Recalculate Metrics" button

---

## Database Schema Reference

### profiles table
- id (UUID, PRIMARY KEY)
- age, gender, height, weight
- activity_level, sleep_hours
- diet_type, eating_window_start, eating_window_end
- focus_area, water_intake, cooking_ratio
- onboarded_at, created_at, updated_at

### health_metrics table
- id (UUID, PRIMARY KEY)
- user_id (UUID, FOREIGN KEY)
- metabolic_age, gut_health_score, nutrition_balance_score
- calculated_at, created_at

---

## Design System Compliance Checklist

✅ Only 6 approved colors:
- #ff7664 (primary - coral/red)
- #9bcbab (secondary - mint green)
- #cda4e8 (tertiary - lavender purple)
- #dedfe2 (background - light gray)
- #000000 (black)
- #ffffff (white)

✅ Gradient background on all onboarding screens (same as AuthScreen)
✅ Linear gradient overlays (top & bottom)
✅ Animated blobs (same pattern as AuthScreen)
✅ White text on gradient backgrounds
✅ Black text on white cards
✅ Icon containers: colored bg + white icon
✅ Use theme.typography.* for all text
✅ Use theme.spacing.* for all spacing
✅ No hardcoded colors or dimensions

✅ Components used:
- GradientBackground (custom)
- Container (existing)
- Button (existing)
- Card (existing)
- Text (existing)
- Input (existing)
- AnimatedRing (custom)
- ProgressIndicator (custom)
- IconSelector (custom)
- LoadingSequence (custom)

---

## Haptic Feedback Patterns

```typescript
// Light - subtle interactions
haptics.patterns.light()

// Medium - main actions
haptics.patterns.medium()

// Heavy - important completions
haptics.patterns.heavy()

// Success pattern on loading complete
haptics.patterns.medium() → haptics.patterns.heavy() → haptics.patterns.light()
```

---

## Next Steps

1. Create remaining 6 screen files (2-7)
2. Create OnboardingNavigator with state management
3. Update App.tsx with onboarding flow
4. Update HomeScreen with metrics display
5. Update ProfileScreen with edit functionality
6. Test complete flow on multiple devices
7. Validate animation timings
8. Test haptic feedback
9. Performance optimization

---

## Key Files Summary

**Core Logic**:
- src/types/profile.ts ✅
- src/services/profile/profileService.ts ✅
- src/services/health/metricsService.ts ✅
- src/hooks/useOnboarding.ts ✅

**Components**:
- src/components/onboarding/GradientBackground.tsx ✅
- src/components/onboarding/AnimatedRing.tsx ✅
- src/components/onboarding/ProgressIndicator.tsx ✅
- src/components/onboarding/IconSelector.tsx ✅
- src/components/onboarding/LoadingSequence.tsx ✅

**Screens**:
- src/screens/onboarding/OnboardingHookScreen.tsx ✅
- src/screens/onboarding/OnboardingEducationScreen.tsx (TODO)
- src/screens/onboarding/OnboardingBodyBasicsScreen.tsx (TODO)
- src/screens/onboarding/OnboardingLifestyleScreen.tsx (TODO)
- src/screens/onboarding/OnboardingGoalsScreen.tsx (TODO)
- src/screens/onboarding/OnboardingLoadingScreen.tsx (TODO)
- src/screens/onboarding/OnboardingSummaryScreen.tsx (TODO)
- src/screens/onboarding/OnboardingNavigator.tsx (TODO)

**Updates**:
- App.tsx (TODO)
- src/screens/HomeScreen.tsx (TODO)
- src/screens/ProfileScreen.tsx (TODO)

---

**Total Progress**: 11/23 tasks completed (48%)

All foundational components and services are ready. Screen implementations can proceed independently following the specifications above.

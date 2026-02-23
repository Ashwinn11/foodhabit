# GutBuddy — Complete UI Build Plan (UX-First)

## Context
Theme, all components, and all screens were deleted. Services layer, Zustand store, Supabase config, and App.tsx are currently intact on disk. We rebuild the full UI layer with a fresh design — no reference to old git code for screens/components/theme. The app targets people with IBS and gut conditions who eat out frequently and need help making safe food choices and tracking symptoms.

---

## Currently Intact Files (Reuse These — DO NOT Re-implement Logic)

| File | What it does |
|---|---|
| `src/config/supabase.ts` | Supabase client, `getSupabaseRedirectUrl()` → `foodhabit://auth/callback` |
| `src/services/authService.ts` | `signInWithApple()`, `signInWithGoogle()`, `completeOnboarding(answers)`, `signOut()`, `deleteAccount()` → calls delete-account edge fn |
| `src/services/fodmapService.ts` | `analyzeFoods(foods, imageBase64?, extractFoodsOnly?)` → calls analyze-food edge fn |
| `src/services/gutService.ts` | `logMeal()`, `logGutMoment()`, `getRecentMeals()`, `getRecentLogs()`, `getTriggerFoods()`, `confirmTrigger()`, `dismissTrigger()` |
| `src/store/useAppStore.ts` | Zustand: `onboardingAnswers` (goal/condition/symptoms/knownTriggers), `learnedTriggers`, `recentScanAvoidFoods` |

---

## Supabase Schema

| Table | Key Columns |
|---|---|
| `users` | id, email, full_name, onboarding_completed, onboarding_data (jsonb) |
| `meals` | id, user_id, timestamp, name, foods[], nutrition (jsonb), normalized_foods[] |
| `gut_logs` | id, user_id, timestamp, tags[], mood (sad/neutral/happy), duration, incomplete_evacuation |
| `trigger_foods` | id, user_id, food_name, user_confirmed, bad_occurrences, good_occurrences, confidence (Low/Medium/High), symptoms (jsonb) |

---

## Design System — `src/theme/theme.ts`

**Aesthetic:** Dark, premium, clinical-clean. Feels like a premium health app — not a clinical tool, not a food diary. Think: high-contrast dark surfaces, a single chartreuse accent that pops.

```ts
colors: {
  // Backgrounds
  background: '#080A09',
  surface: '#111410',
  surfaceElevated: '#1A1E18',
  surfaceHover: '#212620',
  border: '#1F2420',
  borderSubtle: '#161A15',

  // Brand
  primary: '#D4F870',          // chartreuse — all primary CTAs
  primaryForeground: '#080A09', // text on primary buttons
  primaryMuted: '#D4F87020',   // chip bg for safe foods

  // Semantic food safety colors
  safe: '#6DBE8C',
  safeMuted: '#6DBE8C18',
  caution: '#F5C97A',
  cautionMuted: '#F5C97A18',
  danger: '#E05D4C',
  dangerMuted: '#E05D4C18',

  // Text
  text: '#F0F2EE',
  textSecondary: '#8A9186',
  textTertiary: '#4A5248',

  // Utility
  success: '#6DBE8C',
  warning: '#F5C97A',
  error: '#E05D4C',
  overlay: 'rgba(8,10,9,0.85)',
}

fonts: {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  display: 'PlayfairDisplay_700Bold',  // for hero headings only
}

spacing: { xxs:2, xs:4, sm:8, md:16, lg:24, xl:32, xxl:48, xxxl:64 }
radius: { sm:6, md:10, lg:16, xl:22, xxl:30, full:999 }

shadows: {
  soft: { shadowColor:'#000', shadowOffset:{0,2}, shadowOpacity:0.3, shadowRadius:4 }
  medium: { shadowColor:'#000', shadowOffset:{0,4}, shadowOpacity:0.4, shadowRadius:8 }
  glow: { shadowColor:'#D4F870', shadowOffset:{0,0}, shadowOpacity:0.25, shadowRadius:12 }
}
```

---

## Delight & Interactivity Principles

> No screen should feel static or passive. Every interaction has a response, every wait has a visual story.

| Principle | Rule |
|---|---|
| No emojis | Use Icon3D (Fluent 3D PNGs) for expressive moments, lucide icons for structural UI |
| Every load has a story | All loading states use `FunLoader` with a relevant 3D icon + human-readable message |
| Every tap has a response | All pressable elements: scale spring (0.97) + haptic feedback |
| Empty states are invitations | Never show a blank screen — always an Icon3D + message + action |
| Transitions feel alive | Use Reanimated slide + fade between screens, spring for modals/sheets |
| Progress feels rewarding | Onboarding progress bar animates smoothly, custom plan "builds" visually |

---

## Microsoft Fluent 3D Icons

Source: [fluentui-emoji GitHub](https://github.com/microsoft/fluentui-emoji) — download 3D PNG variants.
Stored in: `assets/icons/3d/` as PNG files, imported as local assets.
**No emojis anywhere in the app.** Replace all emojis with either lucide icons (structural UI) or Fluent 3D PNGs (expressive/emotional moments).

### 3D Icon Map (filename → usage)
| Asset | Used In |
|---|---|
| `magnifying_glass.png` | Scan screen loading overlay |
| `brain.png` | AI analysis loading state |
| `pizza.png` | Scan empty state, safe food results |
| `warning.png` | Trigger foods, caution results |
| `no_entry.png` | Avoid results |
| `check_mark_button.png` | Safe results highlight |
| `spiral_calendar.png` | Journal empty state |
| `fork_and_knife.png` | Home empty meals state |
| `face_with_smile.png` | Mood: good (Home + Log) |
| `neutral_face.png` | Mood: ok |
| `face_with_head_bandage.png` | Mood: rough |
| `sparkles.png` | Loading states, custom plan reveal |
| `chart_increasing.png` | Insights section header |
| `fire.png` | High-confidence trigger badge |
| `bullseye.png` | Goal onboarding |
| `test_tube.png` | Condition onboarding |
| `thought_balloon.png` | OnboardingAnalyzing loading |

### `Icon3D.tsx` component
```tsx
// props: name (keyof icon map), size, style, animated (boolean), animationType ('float'|'pulse'|'spin')
// Renders <Image source={require('...')} style={{ width: size, height: size }} />
// Animated: uses Reanimated withRepeat/withSequence for float/pulse/spin loops
// float: translateY -8 → 0 loop, 1.4s ease-in-out
// pulse: scale 0.95 → 1.05 loop, 0.9s ease-in-out
// spin: rotate 0 → 360 loop, 2s linear
```

### Global "No Emoji" Rule
- ALL emoji references in UI copy, buttons, labels, chips, tabs → replaced with lucide icons or Icon3D
- Tab bar: lucide icons only (Home, ScanLine, BookOpen, User)
- Mood buttons: Icon3D face assets (smile / neutral / head_bandage)
- Goal cards: Icon3D bullseye/test_tube/pizza/magnifying_glass
- No emoji in any toast, alert, loading copy, or button label

### Animated Loading Pattern with 3D Icons
```
SCAN LOADING (photo captured):
  3D magnifying glass icon — gentle float animation (translateY -8 → 0, loop, 1.2s ease)
  Below: "Reading your menu..." label
  Below: 3 animated dots (staggered fade)

AI ANALYSIS LOADING:
  3D brain icon — pulsing scale (0.95 → 1.05, loop, 0.8s)
  "Checking your gut profile..." label
  Rotating sparkles icon (small, top-right of brain)

ONBOARDING ANALYZING:
  3D thought_balloon icon floats in first
  Items appear below one by one

CUSTOM PLAN BUILDING:
  3D sparkles icon + progress bar
  Icon rotates 360° continuously during build phase

HOME EMPTY STATE:
  3D fork_and_knife, gentle bob animation

JOURNAL EMPTY STATE:
  3D spiral_calendar, gentle bob animation

TRIGGER FOOD CARD (High confidence):
  3D fire icon (16px) next to confidence badge
```

---

## Component Library — `src/components/`

### `Button.tsx`
```
variants: primary | secondary | ghost | danger | outline
sizes: sm | md | lg
states: default | loading (spinner replaces label) | disabled
- Primary: chartreuse bg + dark text + glow shadow
- Secondary: surfaceElevated bg + text + border
- Ghost: transparent bg + text only
- Haptic feedback (expo-haptics) on press
- Animated scale down on press (0.97)
```

### `Text.tsx`
```
variants: display (PlayfairDisplay, 32px) | h1 (28px bold) | h2 (22px semibold) | h3 (18px semibold)
         | body (16px regular) | bodySmall (14px regular) | caption (12px regular) | label (12px semibold caps)
color: any theme color key or hex, defaults to text
```

### `Input.tsx`
```
props: label, placeholder, value, onChangeText, error, leftIcon, rightIcon, secure, multiline, maxLength
Style: surfaceElevated bg, border, radius:md, 16px padding
Error state: danger border + error text below
Focus state: primary border glow
```

### `Card.tsx`
```
variants: default | elevated | bordered | glow
pressable: boolean (animated scale)
- default: surface bg, radius:lg, md padding
- elevated: surfaceElevated bg, medium shadow
- glow: elevated + primary glow shadow (used for Best Choice highlight)
```

### `Screen.tsx`
```
props: scroll (boolean), padded (boolean), header (ReactNode)
- SafeAreaView wrapper
- Keyboard avoiding on scroll screens
- background: colors.background
- StatusBar: light-content
```

### `Chip.tsx`
```
variants: selectable | dismissible | status
selectable: toggles selected state with animation, selected = primary bg
dismissible: shows × to remove
status: safe (green) | caution (amber) | avoid (red) — colored bg from muted semantic colors
Size: sm (12px text, 6px padding) | md (14px text, 10px padding)
```

### `Icon.tsx`
```
Thin wrapper around lucide-react-native
props: name (keyof LucideIcons), size (default 20), color (default theme.text)
```

### `ProgressBar.tsx`
```
props: step (number), total (number)
- Thin bar (3px height) anchored at top below safe area
- Animated fill width: (step/total * 100)%
- Color: primary (chartreuse)
- Background: border color
- Uses Reanimated withTiming for smooth transitions
```

### `TabIcon.tsx`
```
props: name, label, focused
- lucide icon + label text below
- focused: primary color icon + primary text
- unfocused: textTertiary color
```

---

## Shared UI Patterns

### Loading Skeleton
```
Animated shimmer (LinearGradient from expo-linear-gradient cycling left→right)
Rounded rect placeholders matching content shape
Used in: Home, Journal, Insights
```

### Bottom Sheet
```
react-native-reanimated based or use @gorhom/bottom-sheet
Used for: mood log, meal detail, date detail in calendar
Backdrop overlay with tap-to-dismiss
```

### Empty State Component
```
props: illustration (optional), title, subtitle, action (button config)
Centered layout, subtle illustration (SVG or emoji), headline, sub-copy, optional CTA button
```

### Toast / Notification
```
Top-of-screen slide-in notification for success/error feedback
Used after: logging a meal, logging mood, confirming a trigger
```

---

## Navigation Architecture (App.tsx update)

```
App.tsx
 ├── [LOADING] SplashScreen + font load + session check
 ├── AuthStack  ← no session
 │    └── AuthScreen
 ├── OnboardingStack  ← session && !onboarding_completed
 │    ├── OnboardingWelcome
 │    ├── OnboardingGoal
 │    ├── OnboardingCondition
 │    ├── OnboardingSymptoms
 │    ├── OnboardingAnalyzing      ← fake loading screen, "personalizing..."
 │    ├── OnboardingTriggers
 │    ├── OnboardingHowItHelps
 │    ├── OnboardingReviews
 │    ├── OnboardingFeatures
 │    ├── OnboardingCustomPlan     ← animated plan reveal
 │    └── OnboardingPaywall        ← RevenueCat UI
 └── MainTabs  ← session && onboarding_completed
      ├── Home
      ├── Scan
      ├── Journal
      └── Profile
```

Onboarding screens share a layout wrapper: `OnboardingLayout.tsx`
- Renders `<ProgressBar step={n} total={10} />` at top
- Back chevron (← ) top-left (hidden on Welcome)
- Animated slide-in transitions (Reanimated)

---

## Onboarding Screens (Full UX)

### OnboardingWelcome
```
VISUAL: Full-screen dark bg, large GutBuddy logo, below it:
HEADLINE (display font): "Eat out freely.\nFeel good after."
SUB: "GutBuddy learns your gut and tells you exactly what to order."
CTA: [Get Started →] primary button
BOTTOM: "Already have an account? Sign in" ghost link

STATES:
- Default: above layout
- Loading: none
```

### OnboardingGoal
```
HEADLINE: "What's bringing you here today?"
SUB: "Choose the one that fits best."
UI: 4 large tappable cards (full-width):
  [Icon3D: face_with_head_bandage] "Stop feeling bloated" — I'm bloated or gassy after most meals
  [Icon3D: magnifying_glass]       "Find my triggers" — I suspect certain foods are hurting me
  [Icon3D: fork_and_knife]         "Eat out safely" — Restaurants stress me out
  [Icon3D: test_tube]              "Manage my condition" — I have IBS, GERD, or similar

Each card: 3D icon (48px) left + title (h3) + description (bodySmall, textSecondary)
Selecting a card: scale spring animation → primary border → checkmark appears → immediate navigation
No Next button — tap the card to advance

STATES:
- Default: all 4 cards with border
- Hovered/Pressed: scale 0.97 with haptic
- Selected: primary border glow, check icon fades in (lucide Check), then navigates
```

### OnboardingCondition
```
HEADLINE: "Do you have a diagnosed condition?"
SUB: "This helps us tailor your food analysis."
UI: Grid of selectable chips (2 per row):
  IBS-D | IBS-C | IBS-M | GERD | Celiac Disease | Crohn's Disease
  Lactose Intolerant | SIBO | Gastroparesis | Just Bloating / Unsure

Multi-select. "Next →" button enabled after at least 1 selection.

STATES:
- Default: unselected chips (border style)
- Selected: primary bg chips
- Next button: disabled until selection, then primary
```

### OnboardingSymptoms
```
HEADLINE: "Which symptoms do you regularly experience?"
SUB: "Select all that apply after eating."
UI: Grid of selectable chips:
  Bloating | Gas | Cramping | Diarrhea | Constipation | Nausea
  Heartburn | Acid Reflux | Brain Fog | Fatigue | Urgency

Multi-select, min 1 required.
Progress note: "X symptoms selected" updates live

STATES:
- Default: unselected
- Selected: primary bg
- 0 selected: Next button disabled
```

### OnboardingAnalyzing (Personalization Loading Screen)
```
VISUAL: Dark screen, centered
ANIMATED CHECKLIST (items appear one by one with 600ms delay each):
  ✓ Condition: [IBS-D] noted
  ✓ [3] symptoms mapped
  ✓ Searching our food database...
  ✓ Building your gut profile...

Each item: check icon (primary) + text, slides in from left with fade
After last item: 800ms pause → auto-advance to Triggers

No user interaction. This is purely a confidence-building transition.
Headline: "Analyzing your profile..."
Sub: Personalized message e.g. "IBS-D affects 1 in 10 adults. We've helped thousands find relief."

STATES:
- Single animated loading state, auto-advances
```

### OnboardingTriggers
```
HEADLINE: "Based on your profile, these often cause issues."
SUB: "Select the ones you already know are a problem for you."

UI: Two sections:
  [Suggested based on your condition] — pre-populated chips from condition/symptoms
  [+ Add your own] — text input with add button

Suggested chips: selectable (select = confirm as trigger)
Custom chips: dismissible once added

Examples for IBS-D: Garlic, Onion, Dairy, Caffeine, Gluten, Spicy foods, Beans, Alcohol

"Skip" ghost link (optional, can skip triggers)
"Next →" primary button

STATES:
- Loading: none (suggestions are pre-defined logic, not API)
- Default: suggested chips pre-shown
- Custom input: shows + button to add
```

### OnboardingHowItHelps
```
HEADLINE: "Here's how GutBuddy works for you"
(Personalized: "For people with [condition]...")

3 animated benefit cards, scrollable horizontally or stacked:
  Card 1: 📷 "Scan Any Menu"
    "Point your camera at any restaurant menu. We instantly tell you what's safe."
  Card 2: 🧠 "Personalized to You"
    "Every score is based on YOUR condition, YOUR triggers, YOUR gut."
  Card 3: 📊 "Find Your Triggers"
    "Log meals + symptoms. We connect the dots automatically."

Swipeable cards or stacked fade-in
CTA: [Sounds good →] primary button

STATES:
- Static, animated entrance
```

### OnboardingReviews
```
HEADLINE: "Thousands trust their gut to GutBuddy"

3 testimonial cards (stacked, scrollable):
  [Avatar] Sarah M., IBS-D ⭐⭐⭐⭐⭐
  "I used to dread eating out. Now I scan the menu before I even sit down. Changed my life."

  [Avatar] James T., Celiac ⭐⭐⭐⭐⭐
  "Finally an app that doesn't just list FODMAPs. It tells me what to actually order."

  [Avatar] Priya K., Bloating ⭐⭐⭐⭐⭐
  "Found out onion was my main trigger in 2 weeks of logging. Worth every penny."

Star rating aggregate: ★ 4.8 · 2,400+ reviews
CTA: [Continue →] primary button

STATES:
- Static cards with subtle entrance animation
```

### OnboardingFeatures
```
HEADLINE: "Everything your gut needs, in one place"

Feature list with icon + headline + sub (3-4 items, fade in one by one):
  📷 Menu Scanner — "Aim. Capture. Know instantly what's safe to order."
  🔴🟡🟢 Safety Scores — "Every dish rated: Safe, Caution, or Avoid. No guessing."
  📅 Gut Journal — "Log meals and feelings. We find the patterns you miss."
  🎯 Trigger Discovery — "Your personal trigger foods, learned over time."

CTA: [Build My Plan →] primary button

STATES:
- Features animate in sequentially (200ms stagger)
```

### OnboardingCustomPlan
```
VISUAL SEQUENCE:
Phase 1 — Building animation (2 seconds):
  Progress bar fills from 0 → 100%
  Cycling messages below bar (every 500ms):
    "Mapping your condition profile..."
    "Identifying your food triggers..."
    "Calibrating your gut score..."
    "Finalizing your plan..."

Phase 2 — Plan reveal (auto after loading):
  HEADLINE: "Your gut plan is ready, [first name]"

  3 summary cards:
    🏥 "Your condition" → [IBS-D / selected condition]
    ⚠️ "Foods to watch" → [Garlic, Onion, Dairy] (from knownTriggers)
    🎯 "Your goal" → [Find my triggers / selected goal]

  Motivational line: "You're 3 days away from feeling the difference."

CTA: [Start My Free Trial →] primary button with glow shadow

STATES:
- Phase 1: animated, no interaction
- Phase 2: static reveal, single CTA
```

### OnboardingPaywall
```
Uses react-native-purchases-ui Paywall component:
  RevenueCatUI.presentPaywall() or <RevenueCatUI.Paywall onDismiss={...} onPurchaseCompleted={...} />

On successful purchase:
  → authService.completeOnboarding(answers) → writes onboarding_data + onboarding_completed=true to DB
  → navigate to MainTabs

"Restore Purchases" handled by RevenueCat UI
Privacy Policy link navigates to PrivacyPolicyScreen
Terms of Service link

NO custom paywall design — RevenueCat UI handles it entirely.

STATES:
- RevenueCat UI renders automatically with configured offerings
- Loading: RevenueCat loading state (built-in)
- Purchase error: RevenueCat built-in error handling
```

---

## Main App Screens

### Home (`HomeScreen.tsx`)

**Full UX:**
```
SafeArea
│
├── HEADER
│   Left: "GutBuddy" logo-text (small)
│   Right: Notification bell icon
│
├── GREETING SECTION
│   "Good morning, [first_name] 👋" (h2)
│   "[Today's date]" (caption, textSecondary)
│
├── MOOD CHECK CARD (always visible, even after logging)
│   "How's your gut feeling right now?"
│   3 tappable icon buttons (no labels, icon speaks for itself):
│   [Icon3D: face_with_smile 40px]  [Icon3D: neutral_face 40px]  [Icon3D: face_with_head_bandage 40px]
│   Tap → selected icon scales up (spring), ring border appears, haptic → opens BottomSheet
│   After tap → opens BottomSheet for full symptom log
│
├── TODAY'S MEALS SECTION
│   Header: "Today's Meals" + "Scan Menu →" link (right)
│
│   [LOADING STATE]
│   3 skeleton cards (shimmer animation)
│
│   [EMPTY STATE - no meals logged today]
│   Illustration: empty bowl icon
│   Title: "Nothing logged yet today"
│   Sub: "Scan a menu or log what you ate to start tracking"
│   Button: [Scan a Menu] primary
│
│   [HAS MEALS]
│   Meal cards: meal name + time + foods list (truncated) + mood dot if gut log nearby
│
└── RECENT TRIGGER ALERT (conditional — only if High confidence trigger detected)
    Card with ⚠️ icon: "[Food name] has triggered symptoms X times recently"
    [Review] ghost button → goes to Journal > Insights
```

**Loading state:** Skeleton cards, skeleton mood card hidden until ready
**Error state:** "Couldn't load your data. Pull to refresh."
**Pull-to-refresh:** Supported

---

### Scan (`ScanFoodScreen.tsx`)

**Full UX:**
```
SafeArea
│
├── HEADER: "Analyze Foods"
│   Segmented control: [📷 Camera] [✏️ Type]
│
├── CAMERA MODE (default)
│   ├── [INITIAL STATE — waiting for capture]
│   │   Full camera preview (expo-camera)
│   │   Overlay: rounded viewfinder corner guides
│   │   Instruction text: "Point at a menu or meal"
│   │   Tip: "Works with menus, receipts, or food photos"
│   │   Capture button: large white circle at bottom center
│   │   Flip camera icon (top right)
│   │
│   ├── [PROCESSING STATE — after capture]
│   │   Photo thumbnail (blurred/dimmed) fills screen
│   │   FunLoader overlay (semi-transparent dark):
│   │     Phase 1 (extraction): Icon3D magnifying_glass (float animation, 72px) + "Reading your menu..." + animated dots
│   │     Phase 2 (analysis, auto): Icon3D brain (pulse animation, 72px) + "Checking your gut profile..." + animated dots
│   │   [Call fodmapService.analyzeFoods([], imageBase64, true) → extract foods]
│   │   [Then immediately call analyzeFoods(extractedFoods) → get safety scores]
│   │
│   ├── [EXTRACTION ERROR]
│   │   "Couldn't find foods in this image"
│   │   Sub: "Try a clearer photo, or switch to typing"
│   │   [Try Again] [Type Instead] buttons
│   │
│   └── [RESULTS STATE]
│       Food chips row (extracted + confirmed): dismissible
│       Results list (below chips):
│         Each food as Card:
│           [normalizedName]  [SAFE / CAUTION / AVOID badge chip]
│           [explanation text, 1 line, textSecondary]
│         Best/safest food: Card with glow variant + "Best Choice ★" label
│         Worst/avoid foods: Card with danger border
│       "Retake Photo" ghost link (top)
│       Floating [Log This Meal] primary button (bottom)
│
├── TYPE MODE
│   ├── [INITIAL STATE — no foods added]
│   │   Input field: "Type a food and press +" placeholder
│   │   [+ Add] button right of input
│   │   Empty state below: "Add foods to see if they're safe for your gut"
│   │
│   ├── [FOODS ADDED — real-time analysis]
│   │   Input still visible at top
│   │   Chips row: each food chip colored by result (green/amber/red) or loading (grey + FunLoader mini spinner icon)
│   │   While analyzing: small Icon3D sparkles (20px, spin animation) next to chip being processed
│   │   Analysis loads per-food as added (re-calls analyzeFoods with full list each time)
│   │   Results list shows below, updates in real-time
│   │   Each result card shows normalizedName + badge + explanation
│   │
│   └── [RESULTS]
│       Same layout as Camera results state
│       "Clear all" ghost link to reset
│       Floating [Log This Meal] primary button
│
└── LOG MEAL BOTTOM SHEET (appears on "Log This Meal")
    "Name this meal" input (optional, defaults to "Meal at [time]")
    Foods summary (chips, read-only)
    [Log Meal] primary button → gutService.logMeal(foods, name)
    Success: toast "Meal logged! 🎉" + sheet dismisses
```

**Loading states:**
- Camera processing: loading overlay on photo
- Text: per-chip loading indicator while analyzing
- Log action: button shows spinner

**Error states:**
- API error on analysis: "Analysis failed. Check your connection." + retry
- Camera permission denied: "Camera access needed. Enable in Settings." + [Open Settings]
- No foods extracted from image: error state as described above

---

### Journal (`MyGutScreen.tsx`)

**Full UX:**
```
SafeArea
│
├── HEADER: "My Gut Journal"
│   Segmented control: [📅 Calendar] [🔍 Insights]
│
├── CALENDAR TAB
│   ├── react-native-calendars MonthCalendar (custom dark theme)
│   │   Dot markers: green = meal logged, amber = gut log, both = both dots
│   │   Selected day: primary bg circle
│   │   Today: bordered circle
│   │
│   ├── [NO LOGS IN ANY DATE]
│   │   Below calendar:
│   │   Empty state: "Your gut journal is empty"
│   │   Sub: "Scan menus and log how you feel to start tracking"
│   │   Button: [Scan a Menu] primary
│   │
│   ├── [DATE SELECTED — loading]
│   │   Below calendar: 2 skeleton cards (shimmer)
│   │
│   ├── [DATE SELECTED — no logs for that date]
│   │   "Nothing logged on [Day, Month Date]"
│   │   Sub: "Tap + to add a meal or log how you felt"
│   │
│   └── [DATE SELECTED — has logs]
│       Below calendar, scrollable section:
│       Meal cards (timestamp + name + food chips)
│       Gut log cards (timestamp + mood icon + symptom chips)
│       If meal AND gut log within 2 hrs: correlation card
│         "[Food name] eaten 1.5 hrs before [symptom]"
│
├── INSIGHTS TAB
│   ├── [LOADING]
│   │   Skeleton cards
│   │
│   ├── [NOT ENOUGH DATA — fewer than 5 meals logged]
│   │   Progress indicator: "X / 5 meals tracked"
│   │   Progress bar fill
│   │   "Log [5-X] more meals to unlock trigger insights"
│   │   Sub: "GutBuddy needs a few data points before patterns emerge"
│   │
│   ├── [HAS DATA — shows all sections]
│   │
│   │   TRIGGER FOODS section:
│   │   Header: "Potential Triggers" + count badge
│   │   [EMPTY — no triggers yet despite enough data]
│   │     "No triggers detected yet — keep logging!"
│   │   [HAS TRIGGERS]
│   │     Cards sorted by confidence (High first):
│   │       [food_name]  [High/Medium/Low] badge (red/amber/grey)
│   │       Sub: "[N] times linked to symptoms"
│   │       Buttons: [✓ Confirm Trigger] [✗ Not a Trigger]
│   │       → gutService.confirmTrigger() / dismissTrigger()
│   │
│   │   SYMPTOMS CHART section:
│   │   Header: "Your Symptoms (last 30 days)"
│   │   Horizontal bar chart (react-native-svg):
│   │     Each symptom + occurrence count + colored bar
│   │   [EMPTY — no gut logs]
│   │     "No symptom data yet"
│   │
│   └── SAFE FOODS section:
│       Header: "Foods that work well for you"
│       Chips of foods with high good_occurrences
│       [EMPTY]: "Foods you tolerate well will appear here over time"
```

**Loading states:** Skeleton throughout
**Pull-to-refresh:** Supported on both tabs

---

### Profile (`ProfileScreen.tsx`)

**Full UX:**
```
SafeArea, scrollable
│
├── HEADER: "My Profile"
│
├── USER SECTION
│   Avatar circle (initials fallback, no photo upload needed)
│   Full name (h2)
│   Email (body, textSecondary)
│
├── HEALTH PROFILE section (header "My Health Profile")
│   Row: "My Condition" → [IBS-D, Lactose Intolerant] (chips inline, truncated)
│         Tap row → edit sheet (condition chips reuse OnboardingCondition UI)
│   Row: "My Symptoms" → [Bloating, Gas...] (chips inline, truncated)
│         Tap row → edit sheet (symptom chips)
│   Row: "My Triggers" → [Garlic, Onion...] or "None set"
│         Tap row → edit sheet (trigger chips + add input)
│   [Changes saved to users.onboarding_data via authService.completeOnboarding()]
│
├── SUBSCRIPTION section (header "My Plan")
│   [LOADING]: skeleton row
│   Row: "Plan" → [Pro Monthly / Pro Yearly] + status badge (Active / Trial)
│   Row: "Renewal" → "March 10, 2026"  (from RevenueCat Purchases.getCustomerInfo())
│   Row: "Manage Subscription" → chevron
│         Tap → Linking.openURL('https://apps.apple.com/account/subscriptions')
│         (Apple-compliant way to manage subscriptions)
│
├── ACCOUNT section (header "Account")
│   Row: "Privacy Policy" → chevron → navigates to PrivacyPolicyScreen
│   Row: "Terms of Service" → chevron → navigates to TermsScreen (or web link)
│   Row: "Delete Account" → danger colored text
│         Tap → Alert modal:
│           Title: "Delete your account?"
│           Body: "This permanently deletes all your data and cannot be undone."
│           [Cancel] [Delete Account] (red)
│           Confirm → authService.deleteAccount() → signs out → AuthScreen
│   Row: "Sign Out" →
│         Tap → Alert modal: "Sign out of GutBuddy?" → confirm → authService.signOut()
│
└── VERSION
    "GutBuddy v[version]" center, caption, textTertiary
```

**Loading states:**
- Subscription section: skeleton while Purchases.getCustomerInfo() loads
- Delete/signout: button shows spinner while action in progress

**Error states:**
- Delete account fails: "Couldn't delete account. Please try again or contact support."
- Subscription load fails: silently hide section or show "Unable to load plan info"

---

### AuthScreen (`AuthScreen.tsx`)

**Full UX:**
```
Full-screen, no safe area enforcement at top
│
├── Background: background color (#080A09)
│
├── TOP HALF: Visual
│   Logo (centered): GutBuddy wordmark or icon
│   Tagline: "Your gut. Finally understood."
│
├── BOTTOM HALF: Auth actions (in a floating card from bottom)
│   "Get started for free" (h2)
│   "Join thousands with happier guts." (body, textSecondary)
│   Space
│   [Sign in with Apple] — expo-apple-authentication standard button style
│   [Sign in with Google] — white bg button with Google logo
│   Space
│   "By continuing, you agree to our [Privacy Policy] and [Terms of Service]"
│   (caption, textTertiary, links in primary color)
│
├── [LOADING STATE — during auth]
│   Overlay on button: spinner
│   Both buttons disabled
│
└── [ERROR STATE]
    Inline error below buttons: "Sign-in failed. Please try again."
    Red text, small
```

### PrivacyPolicyScreen (`PrivacyPolicyScreen.tsx`)
```
Header: back button + "Privacy Policy" title
Body: scrollable text content
No loading states (static content)
```

---

## Files to Create

### 1 Theme file
- `src/theme/theme.ts`

### 9 Components
- `src/components/Button.tsx`
- `src/components/Text.tsx`
- `src/components/Input.tsx`
- `src/components/Card.tsx`
- `src/components/Screen.tsx`
- `src/components/Chip.tsx`
- `src/components/Icon.tsx`
- `src/components/ProgressBar.tsx`
- `src/components/TabIcon.tsx`

### Shared UI
- `src/components/Skeleton.tsx` — shimmer skeleton for loading states
- `src/components/EmptyState.tsx` — reusable empty state (Icon3D + title + sub + optional CTA)
- `src/components/BottomSheet.tsx` — reusable animated bottom sheet
- `src/components/Toast.tsx` — top slide-in notification banner
- `src/components/Icon3D.tsx` — Microsoft Fluent 3D PNG renderer with float/pulse/spin animation modes
- `src/components/FunLoader.tsx` — reusable loading overlay: Icon3D (animated) + message + dots

### Onboarding Layout Wrapper
- `src/screens/onboarding/OnboardingLayout.tsx` — ProgressBar + back nav + animated transitions

### 11 Onboarding Screens
- `src/screens/onboarding/OnboardingWelcome.tsx`
- `src/screens/onboarding/OnboardingGoal.tsx`
- `src/screens/onboarding/OnboardingCondition.tsx`
- `src/screens/onboarding/OnboardingSymptoms.tsx`
- `src/screens/onboarding/OnboardingAnalyzing.tsx` (personalization loading)
- `src/screens/onboarding/OnboardingTriggers.tsx`
- `src/screens/onboarding/OnboardingHowItHelps.tsx`
- `src/screens/onboarding/OnboardingReviews.tsx`
- `src/screens/onboarding/OnboardingFeatures.tsx`
- `src/screens/onboarding/OnboardingCustomPlan.tsx`
- `src/screens/onboarding/OnboardingPaywall.tsx`

### 6 Main Screens
- `src/screens/AuthScreen.tsx`
- `src/screens/HomeScreen.tsx`
- `src/screens/ScanFoodScreen.tsx`
- `src/screens/MyGutScreen.tsx` (Journal)
- `src/screens/ProfileScreen.tsx`
- `src/screens/PrivacyPolicyScreen.tsx`

### Update
- `App.tsx` — update imports, correct onboarding stack order, 4-tab layout (Home/Scan/Journal/Profile)

---

## Implementation Order

1. `src/theme/theme.ts`
2. Shared components: Text → Icon → Button → Chip → Card → Input → Screen → ProgressBar → TabIcon
3. Shared UI: Skeleton → EmptyState → BottomSheet → Toast
4. `AuthScreen.tsx`
5. `OnboardingLayout.tsx`
6. Onboarding screens in funnel order
7. Main tab screens: Home → Scan → Journal → Profile → Privacy
8. `App.tsx` wiring

---

## App Store Compliance

| Requirement | Implementation |
|---|---|
| Delete Account | Profile → Delete Account → `authService.deleteAccount()` → delete-account edge fn |
| Manage Subscription | `Linking.openURL('https://apps.apple.com/account/subscriptions')` |
| Privacy Policy | PrivacyPolicyScreen, linked from Auth + Paywall + Profile |
| Apple Sign In | `expo-apple-authentication` (already configured in app.json + entitlements) |
| In-app purchase disclosure | RevenueCat UI handles this + Terms link in Profile |

---

## Verification

1. `npx expo start` — no TypeScript errors, app boots
2. Auth: Apple Sign In / Google Sign In → session established → onboarding starts
3. Onboarding: progress bar advances, back/forward works, swipeable, data persists in Zustand
4. OnboardingAnalyzing: loads for ~3 seconds, shows personalized checklist, auto-advances
5. OnboardingCustomPlan: loading animation plays, then plan summary reveals correctly
6. Paywall: RevenueCat UI renders, "Start Free Trial" triggers purchase, on success → onboarding_completed set in DB → MainTabs
7. Home: mood tap → bottom sheet → logs gut moment → appears in Journal calendar
8. Scan Camera: capture → extraction → immediate analysis → results with safe/caution/avoid
9. Scan Text: type food → add → chip updates color in real-time, explanation appears
10. Scan: "Log This Meal" → meal name input → logs to meals table → toast appears
11. Journal Calendar: dots appear on logged dates → tap date → meals + gut logs show
12. Journal Insights: <5 meals = unlock progress bar; ≥5 = trigger food cards with confirm/dismiss
13. Profile: condition/symptoms/triggers editable and saved to DB
14. Profile: "Manage Subscription" → opens Apple subscriptions URL in browser
15. Profile: "Delete Account" → confirmation → deleted + signed out → AuthScreen
16. Empty states visible at every stage before data is present
Build a React Native Expo app called "Gut Buddy."

Gut Buddy is a personal gut health coach for people with IBS, chronic bloating, and digestive issues. Users log meals and symptoms daily. The AI finds their personal triggers, generates safe recipes, and shows measurable proof of improvement over time.

Core loop: Log meal + symptoms → AI finds personal triggers → Safe recipes generated → Progress tracked → Symptoms improve → They never cancel.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECH STACK — USE EXACTLY THIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Framework: React Native with Expo (managed workflow, SDK 51+)
- Language: TypeScript throughout. Functional components + hooks only.
- Navigation: Expo Router (file-based routing)
- Styling: NativeWind (Tailwind for React Native)
- Auth: Supabase Auth — Google OAuth + Apple OAuth via expo-auth-session and expo-apple-authentication
- Database: Supabase (PostgreSQL) — @supabase/supabase-js
- Backend/AI: Supabase Edge Functions (Deno) — ALL Gemini calls go through edge functions only
- AI Model: Google Gemini API (gemini-3-flash-preview) — never called directly from the app
- Paywall: RevenueCat (react-native-purchases) — never hardcode plans, prices, or product IDs
- Notifications: expo-notifications (local only)
- Haptics: expo-haptics
- Camera: expo-camera + expo-image-picker (menu scanning)
- Charts: react-native-gifted-charts
- Share: react-native-view-shot + expo-sharing
- Icons: Lucide React Native (@lucide-icons/native) — use throughout, NO emojis anywhere in the UI
- Fonts: Figtree (display, headings) + DM Mono (labels, data, monospace) via expo-google-fonts
- iOS only. No Android code, libraries, or config. iOS 16+ minimum.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENVIRONMENT VARIABLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
In app.config.js under extra:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- REVENUECAT_IOS_API_KEY

Gemini API key lives ONLY as a Supabase Edge Function secret — never in the app bundle.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is the most important section. The UI must feel premium, warm, alive, and captivating. Think high-end wellness journal meets Duolingo — clean but not clinical, fun but not childish.

NO EMOJIS anywhere in the UI. Use Lucide icons exclusively.

COLORS:
- Background: #F0F7F2 (soft sage white)
- Screen background: linear gradient — #EDFAF2 → #FDFAF4 (per screen, subtle variation)
- Surface / cards: #FFFFFF
- Border: #D4EAD9
- Primary (CTA, active, safe): #2D7A52
- Primary light: #E6F5EC
- Primary mid: #B8DFC8
- Amber (caution, warning): #C8821A
- Amber light: #FEF3DC
- Red (avoid, high risk, trigger): #C0392B
- Red light: #FDE8E6
- Text primary: #1C2B20
- Text secondary: #6B8C72
- Text tertiary: #A8BFAC
- Cream: #FDFAF4
- Stone: #E8E2D6
- Dark surface (for CTAs, scan button): #1C2B20

TYPOGRAPHY:
- All headings: Figtree weight 800–900, letter-spacing -0.5px
- Body text: Figtree weight 400–600
- Labels, data, monospace elements: DM Mono weight 400–700
- Screen titles: Figtree 900, 20px
- Food names: Figtree 800, 12px
- Tab labels: DM Mono 700, 8.5px

BORDER RADIUS:
- Cards: 20px
- Buttons (primary): 14px
- Small buttons / badges: 8–10px
- Chips / pills: 999px
- Tab bar icon areas: 10px
- Input fields: 12px
Never use sharp corners.

SHADOWS:
- Cards: 0 2px 8px rgba(44,120,70,0.08)
- Primary button: 0 6px 20px rgba(45,122,82,0.30)
- Elevated cards (hero): 0 8px 24px rgba(44,120,70,0.12)

MASCOT — GUT BUDDY CHARACTER:
Render as an inline SVG (not an image). A soft blob character:
- Soft mint green rounded body
- Large eyes with white highlight dots
- Rosy pink cheeks (ellipses, rgba pink)
- Small leaf/sprout on top of head
- Expression changes based on gut score:
  → 70+: wide smile, sparkle dot near eye
  → 40–69: neutral smile
  → Below 40: slight frown, droopy eyes
- Float animation: translateY 0 → -8px → 0, rotation -1deg → 1deg, duration 3s infinite ease-in-out
- Speech bubble: white card, border-radius 14px 14px 0 14px, appears top-right of mascot, spring scale-in on mount

ANIMATIONS — implement all:
- Card entrance: translateY 16px → 0 + opacity 0 → 1, cubic-bezier(0.34, 1.56, 0.64, 1), 0.3s
- Staggered list: each card delayed by 80ms
- Button press: scale 0.95 on press, spring back 1.05 → 1.0 on release
- Badge pop: scale 0.5 → 1.1 → 1.0 spring when food analysis returns
- Gut score ring: SVG stroke-dashoffset animates from full to final value on mount, 1.2s ease
- Streak flame: scaleY + rotation oscillates 1s infinite alternate
- Progress bars: width animates from 0 to final value on mount
- Insight cards: staggered slide-up entrance (80ms delay each)
- Skeleton shimmer: opacity 0.4 → 0.8 → 0.4, 1.2s infinite (for loading states)
- Tab active: scale + color transition on icon wrap background

HAPTICS:
- Meal logged: impactMedium
- Symptom slider moved: selectionChanged (every tick)
- Badge revealed: impactLight
- Streak milestone: notificationSuccess
- High risk food added: notificationWarning
- Button tap: impactLight

LOADING STATES — every async action needs one:
- Food analysis: skeleton spinner next to food name while awaiting FODMAP badge
- Insight generation: skeleton cards with shimmer + mascot thinking expression
- Recipe generation: shimmer card with "Generating a safe recipe for you..." label
- Menu scan: animated scan line pulses faster during processing
- Chart data: bar/line skeletons shimmer then animate in

EMPTY STATES — illustrated with mascot + Lucide icon, never a blank screen:
- No logs yet: mascot waving + "Start logging to unlock your insights"
- No saved recipes: "You haven't saved any recipes yet"
- No insights yet: progress bar "Log for X more days to unlock your first insight"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE DUAL BADGE SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every food item in the app shows TWO badges side by side. This is the core UI element.

BADGE 1 — FODMAP RATING (scientific fact, same for everyone):
- HIGH FODMAP: background #FDE8E6, color #C0392B, DM Mono 8.5px
- MED FODMAP: background #FEF3DC, color #C8821A, DM Mono 8.5px
- LOW FODMAP: background #E6F5EC, color #2D7A52, DM Mono 8.5px
Show a Lucide Info icon next to FODMAP badge on first appearance only.
Tooltip on tap: "FODMAP measures how much fermentable carbs a food contains. High FODMAP foods commonly irritate sensitive guts."

BADGE 2 — PERSONAL VERDICT (personalised to this user):
- AVOID: background #C0392B, color white, Figtree 700, 8.5px — solid filled
- CAUTION: background #C8821A, color white, Figtree 700, 8.5px — solid filled
- SAFEST: background #2D7A52, color white, Figtree 700, 8.5px — solid filled

IMPORTANT RULE — when badges conflict:
If a food is HIGH FODMAP but the user has eaten it many times with no symptoms, show:
HIGH FODMAP + SAFEST FOR YOU
And under the why section: "High FODMAP generally, but you've eaten this 6 times with no symptoms. Your gut tolerates this one."
Personal verdict always wins. Always explain the conflict.

CAUTION badge must always include an action:
- "CAUTION — eat a small portion"
- "CAUTION — not enough data yet, log how you feel after"
- "CAUTION — avoid today, symptoms already elevated"
Never just show CAUTION without telling the user what to do.

WHY SECTION — shown below every food:
A list of 2–3 bullet points (Lucide Circle icon, 4px, colored per severity) explaining the verdict.

Examples:
AVOID:
· [red dot] Your confirmed trigger — caused bloating 5/5 times
· [red dot] Contains fructans — known IBS-D irritant

CAUTION:
· [amber dot] Medium FODMAP — safe in small portions
· [amber dot] Only eaten twice — still building your data

SAFEST:
· [green dot] Eaten 8 times with no symptoms
· [green dot] Low FODMAP — safe for IBS-D generally

CONFLICTS:
· [green dot] High FODMAP generally
· [green dot] But your gut tolerates this — 6 times, no symptoms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERSONALISATION — THREE TIERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The analyze-food edge function sends different context depending on user data available.

TIER 1 — New user, onboarding complete, zero logs:
Send to Gemini: food name + condition + known_triggers + diet_type + biological_sex.
Gemini uses condition to personalise: lactose intolerance = dairy is immediately personal HIGH.
The why section says: "Risky for [their condition]" — not generic.

TIER 2 — Has some logs, no confirmed triggers yet:
Send: Tier 1 context + last 7 days meal_logs + symptom_logs summary.
Gemini identifies possible correlations but marks them as CAUTION / LIKELY.

TIER 3 — Has confirmed triggers from ai_insights:
Send: Tier 1 + 2 context + confirmed_triggers array from ai_insights table.
Gemini can say with confidence: "AVOID — confirmed trigger for this specific user."

The edge function always fetches the latest confirmed triggers from ai_insights before calling Gemini.

TRIGGER CONFIDENCE LEVELS (for the UI and the why text):
- "Watching" → food appears on bad days, fewer than 3 occurrences
- "Likely trigger" → elevated symptoms 3/4 times, some confounding factors
- "Confirmed trigger" → elevated symptoms 5+ times, consistent, isolated

Show the journey in the Progress tab:
Day 5: "Oat milk keeps showing up on your bad days. We're watching it."
Day 10: "Oat milk looks like a likely trigger. Try avoiding it this week."
Day 15: "Confirmed — oat milk is your #1 trigger. 5 out of 6 times."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUPABASE DATABASE SCHEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TABLE: profiles
- id (uuid, PK, FK → auth.users.id)
- email (text)
- full_name (text)
- avatar_url (text, nullable)
- age (int, nullable)
- biological_sex (text) — 'male','female','other','prefer_not_to_say'
- diagnosed_conditions (text[]) — e.g. ['IBS-D','lactose_intolerance']
- known_triggers (text[]) — user-reported at onboarding, seeds Tier 1 personalisation
- diet_type (text) — 'omnivore','vegetarian','vegan','gluten-free','dairy-free','low-fodmap'
- notifications_enabled (boolean, default true)
- onboarding_complete (boolean, default false)
- created_at (timestamptz)

TABLE: meal_logs
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- logged_at (timestamptz)
- meal_type (text) — 'breakfast','lunch','dinner','snack'
- foods (jsonb) — [{name, portion, fodmap_risk: 'low'|'medium'|'high', personal_verdict: 'avoid'|'caution'|'safest', trigger_reasons: string[]}]
- overall_meal_verdict (text) — 'avoid'|'caution'|'safest'
- meal_swap_suggestion (text, nullable)
- stress_level (int) — 1–5
- notes (text, nullable)
- created_at (timestamptz)

TABLE: symptom_logs
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- logged_at (timestamptz)
- bloating (int) — 0–10
- pain (int) — 0–10
- urgency (int) — 0–10
- nausea (int) — 0–10
- fatigue (int) — 0–10
- stool_type (int, nullable) — Bristol 1–7
- notes (text, nullable)
- created_at (timestamptz)

TABLE: daily_factors
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- date (date, unique per user)
- sleep_hours (numeric, nullable)
- sleep_quality (int, nullable) — 1–5
- stress_level (int, nullable) — 1–5
- exercise (boolean, default false)
- exercise_type (text, nullable)
- menstrual_phase (text, nullable) — only for female users
- water_intake (int, nullable) — glasses
- created_at (timestamptz)

TABLE: ai_insights
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- generated_at (timestamptz)
- insight_type (text) — 'trigger_watching'|'trigger_likely'|'trigger_confirmed'|'pattern'|'recommendation'|'weekly_summary'
- title (text)
- body (text)
- related_foods (text[], nullable)
- confidence (text) — 'low'|'medium'|'high'
- is_read (boolean, default false)
- created_at (timestamptz)

TABLE: recipes
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- title (text)
- description (text)
- ingredients (jsonb) — [{name, amount, unit, fodmap_risk}]
- steps (jsonb) — [{step_number, instruction}]
- prep_time_mins (int)
- meal_type (text)
- trigger_free (text[]) — list of triggers this recipe avoids
- is_saved (boolean, default false)
- source (text) — 'daily'|'post_log'|'generate'
- generated_at (timestamptz)

TABLE: progress_snapshots
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- snapshot_date (date)
- avg_bloating_7d (numeric)
- avg_pain_7d (numeric)
- avg_urgency_7d (numeric)
- avg_fatigue_7d (numeric)
- good_days_count (int) — days with avg symptom score < 3
- bad_days_count (int)
- top_triggers (text[])
- improvement_vs_baseline (numeric) — % vs first 7 days
- created_at (timestamptz)

TABLE: streaks
- id (uuid, PK)
- user_id (uuid, FK → profiles.id, unique)
- current_streak (int, default 0)
- longest_streak (int, default 0)
- last_logged_date (date, nullable)
- updated_at (timestamptz)

Enable Row Level Security on ALL tables.
Auth trigger: after insert on auth.users → auto-insert into profiles with id and email.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUPABASE EDGE FUNCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All AI calls via edge functions only. App calls via supabase.functions.invoke(). Gemini key stored as Supabase secret only.

─────────────────────────────
EDGE FUNCTION: analyze-food
─────────────────────────────
Handles both single food input AND menu photo scanning. Same function, two input modes.

Input mode A — typed food:
{ mode: 'food', food_name: string, user_id: string }

Input mode B — scanned menu:
{ mode: 'menu', menu_image_base64: string, mime_type: string, user_id: string }

Before calling Gemini, always fetch from Supabase:
- profiles row (condition, known_triggers, diet_type, biological_sex)
- confirmed_triggers from ai_insights where insight_type = 'trigger_confirmed'
- last 7 days symptom_logs average

Build user_context object:
{
  condition, known_triggers, diet_type, biological_sex,
  confirmed_triggers: [...from ai_insights],
  recent_symptom_avg: { bloating, pain, urgency }
}

Gemini prompt for single food:
"You are a gut health specialist. Analyse this food for this specific user.
Food: '{food_name}'
User context: {user_context JSON}
Return ONLY valid JSON:
{
  name: string,
  fodmap_risk: 'low'|'medium'|'high',
  personal_verdict: 'avoid'|'caution'|'safest',
  caution_action: string (only if verdict=caution — what should they do),
  why: string[] (2–3 bullet points explaining the verdict, specific to this user),
  conflict_explanation: string|null (if fodmap_risk and personal_verdict conflict, explain why)
}"

Gemini prompt for menu scan (multimodal — send image as inline_data):
"You are a gut health specialist. This user is at a restaurant. Read every dish on this menu.
User context: {user_context JSON}
For each dish, determine its FODMAP risk and whether it contains any of this user's confirmed triggers.
Identify the single best dish for this user — lowest risk, avoids their personal triggers.
Return ONLY valid JSON:
{
  dishes: [{
    name: string,
    fodmap_risk: 'low'|'medium'|'high',
    personal_verdict: 'avoid'|'caution'|'safest',
    why: string[] (1–2 bullet points),
    contains_user_triggers: string[]
  }],
  best_pick: string (dish name),
  best_pick_reason: string (specific to their triggers, e.g. 'No dairy or garlic — avoids your top 2 triggers')
}"

The output shape is identical for both modes. The app UI is the same regardless of input method.

─────────────────────────────
EDGE FUNCTION: generate-insight
─────────────────────────────
Trigger: once per day on app open if no insight for today.
Input: { user_id: string }

Fetch: last 14 days meal_logs + symptom_logs + daily_factors + profiles row + existing confirmed triggers.

Cross-correlation logic before calling Gemini:
For each food eaten 3+ times, calculate:
- avg symptom score on days this food was eaten (within 4hr window)
- avg symptom score on days this food was NOT eaten
- difference = potential correlation

Send the pre-calculated correlations to Gemini along with raw data.

Gemini system prompt:
"You are a gut health specialist AI. Analyse this patient's personal data and find specific patterns between their food/lifestyle choices and gut symptoms. Be specific — name actual foods, times, correlations. Never give generic IBS advice.

Use the insight_type values:
- 'trigger_watching': food shows up on bad days, < 3 occurrences, low confidence
- 'trigger_likely': consistent correlation, 3–4 occurrences, medium confidence
- 'trigger_confirmed': strong consistent correlation, 5+ occurrences, high confidence, symptoms clearly elevated vs baseline
- 'pattern': non-food pattern (stress, sleep, menstrual cycle)
- 'recommendation': actionable swap or behaviour change
- 'weekly_summary': weekly overview if 7+ days logged

Return ONLY valid JSON:
{
  insight_type: string,
  title: string (max 10 words, specific, use the food/trigger name),
  body: string (100–150 words, conversational, specific to their data, explain the evidence),
  related_foods: string[],
  confidence: 'low'|'medium'|'high'
}"

Insert into ai_insights table. Return insight to app.
If fewer than 3 days of data: return encouragement insight with progress toward first insight.

─────────────────────────────
EDGE FUNCTION: generate-recipe
─────────────────────────────
Input: { user_id: string, source: 'daily'|'post_log'|'generate', context?: string, available_ingredients?: string[], meal_type?: string }

Fetch: profiles + confirmed_triggers from ai_insights + diet_type.

Gemini prompt:
"Generate a single gut-safe recipe. This user's confirmed triggers are: {trigger_list}. Diet: {diet_type}. Context: {context}. Available ingredients: {available_ingredients}.
The recipe must completely avoid every confirmed trigger. Make it delicious and realistic.
Return ONLY valid JSON:
{
  title: string,
  description: string (1–2 sentences, appetising),
  ingredients: [{name, amount, unit, fodmap_risk: 'low'|'medium'|'high'}],
  steps: [{step_number, instruction}],
  prep_time_mins: number,
  meal_type: string,
  trigger_free: string[] (list of triggers this recipe avoids, e.g. ['oat milk', 'garlic', 'dairy'])
}"

Insert into recipes table. Return to app.

─────────────────────────────
EDGE FUNCTION: calculate-progress
─────────────────────────────
Input: { user_id: string }

Fetch all symptom_logs for this user.
Calculate:
- avg_bloating_7d, avg_pain_7d, avg_urgency_7d, avg_fatigue_7d (last 7 days)
- good_days_count: days where average of all symptoms < 3
- bad_days_count: days where average > 6
- baseline: first 7 days average of all symptoms
- improvement_vs_baseline: ((baseline - current) / baseline) * 100 — expressed as percentage
- top_triggers: from ai_insights ordered by confidence desc

Upsert into progress_snapshots. Return snapshot.

─────────────────────────────
EDGE FUNCTION: delete-account
─────────────────────────────
Uses service role key (Supabase secret).
Delete order: recipes → ai_insights → progress_snapshots → symptom_logs → meal_logs → daily_factors → streaks → profiles → auth.users row.
Return: { success: true }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app/
  _layout.tsx                    — root layout, auth listener, RevenueCat init, font loading
  (auth)/
    index.tsx                    — sign in
  (onboarding)/
    _layout.tsx
    welcome.tsx
    profile.tsx
    conditions.tsx
    notifications.tsx
    paywall.tsx
  (tabs)/
    _layout.tsx                  — 5-tab bar
    index.tsx                    — Home
    log.tsx                      — Log (3 inner segments: Meal, Symptoms, Today)
    progress.tsx                 — Progress (2 inner segments: Insights, Progress)
    recipes.tsx                  — Recipes
    profile.tsx                  — Profile
  scanner/
    index.tsx                    — Menu scanner (accessed from Log tab camera button)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAB BAR — 5 TABS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Home     — Lucide: Home icon
2. Log      — Lucide: Plus icon
3. Progress — Lucide: Activity icon
4. Recipes  — Lucide: UtensilsCrossed icon
5. Profile  — Lucide: User icon

Active tab: icon wrap background = #E6F5EC, icon color = #2D7A52, label color = #2D7A52
Inactive: icon #A8BFAC, label #A8BFAC
Tab labels: DM Mono 700 8.5px

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREENS — DETAILED SPEC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

─────────────────────────────
AUTH SCREEN
─────────────────────────────
Background: linear gradient #EDFAF2 → #FDFAF4 → #F5F0FF
Gut Buddy mascot SVG centered, large, float animation
App name "Gut Buddy" in Figtree Black 900, 32px, letter-spacing -1px
Tagline: "Stop guessing why your stomach hurts."
Subtext: "Log your meals. Find your triggers. Eat freely."
Google button: white card, Google SVG logo, "Continue with Google"
Apple button: dark #1C2B20, Apple SVG logo, "Continue with Apple"
Entrance: mascot bounces in from top, buttons slide up staggered (80ms delay)
On success: check onboarding_complete → false → /onboarding/welcome → true → /(tabs)/

─────────────────────────────
ONBOARDING
─────────────────────────────
Progress indicator: 5 dots at top, active dot is primary green, larger
Back arrow (Lucide ChevronLeft) on screens 2–5

WELCOME (/onboarding/welcome):
Heading: "Your gut is personal. Your answers should be too."
Body: "Most gut health advice is generic. Gut Buddy learns your specific triggers from your own data. The more you log, the smarter it gets."
3 feature rows with Lucide icons (Search, TrendingDown, UtensilsCrossed): No generic advice · Built from your data · Gets smarter daily
CTA: "Let's figure this out"

PROFILE (/onboarding/profile):
Heading: "Tell us about yourself"
Subtext: "Helps us personalise your food risk analysis from day one."
Age: number input
Biological sex: chip selector (Male / Female / Other / Prefer not to say)
Diet type: chip selector (Omnivore / Vegetarian / Vegan / Gluten-free / Dairy-free / Low FODMAP)
All optional. "Skip for now" ghost button.

CONDITIONS (/onboarding/conditions):
Heading: "What are you dealing with?"
Subtext: "Select all that apply. This immediately personalises your food badges — even before you log anything."
Multi-select chips: IBS-D / IBS-C / IBS-M / Chronic Bloating / SIBO / Lactose Intolerance / Gluten Sensitivity / Crohn's / Colitis / Not Diagnosed / Other
Text input: "Any foods you already know cause problems? e.g. garlic, dairy, wheat"
This seeds known_triggers in profiles. "Skip for now" option.

NOTIFICATIONS (/onboarding/notifications):
Heading: "Let us remind you to log."
Subtext: "Consistent logging is what makes trigger detection work."
Three time pickers: Breakfast / Lunch / Dinner meal reminders
Evening symptom check-in toggle + time picker
"Allow Notifications" → expo-notifications requestPermissionsAsync
"Skip" ghost button

PAYWALL (/onboarding/paywall):
Heading: "Serious about fixing your gut?"
Subtext: "Gut Buddy finds your personal triggers from your own data. Not Google. Not generic advice. Yours."
Feature list with Lucide icons:
- Search: AI trigger detection from your actual meals
- TrendingDown: Safe recipes built around YOUR triggers
- Activity: Track your real improvement over time
Plans: fetched dynamically from RevenueCat — never hardcoded. Highlight ANNUAL as "Best Value."
CTA: "Find My Triggers"
Ghost: "Maybe later — 3 days free"
Ghost: "Restore Purchase"
On complete: onboarding_complete = true → navigate to /(tabs)/

─────────────────────────────
HOME TAB (tabs/index.tsx)
─────────────────────────────
Screen background: linear-gradient(160deg, #EDFAF2 0%, #FDFAF4 60%, #F5F0FF 100%)

TOP ROW:
Left: "Good [morning/afternoon/evening]" (time-based) in DM Mono 11px text2, user's first name in Figtree 900 20px below
Right: Avatar circle (initials if no photo) — Lucide User icon fallback

MASCOT + SPEECH BUBBLE:
Mascot SVG centered, float animation
Speech bubble reacts to gut score:
- 70+: "Looking good today!"
- 40–69: "Decent day. Keep logging."
- Below 40: "Tough day. I'm here."
- No symptoms logged yet: "Log your symptoms to see your score"

GUT SCORE CARD:
White card, 20px radius, shadow-sm
Left: animated SVG ring (60px), stroke-dashoffset animated on mount, score number inside in DM Mono 900, "SCORE" label DM Mono below
Right: score title (Figtree 800), description, breakdown pills (bloating trend, pain trend with Lucide TrendingDown/TrendingUp icons)
Tap score card → shows breakdown sheet: each symptom with its value and trend vs weekly average

TODAY'S LOG GRID (2x2):
4 tiles: Breakfast / Lunch / Dinner / Symptoms
Each tile: white card, icon wrap (Lucide icons: Sunrise, Sun, Moon, Heart), tile name, status
Done state: primary green border glow, Lucide CheckCircle2 badge top-right, mint green gradient overlay
Pending state: no border, "Tap to log" in text3
Tap → navigate to Log tab with that segment/meal-type pre-selected

STREAK BAR:
Warm yellow gradient background (#FFF8E8 → #FFFEF0)
Lucide Zap icon in orange-red gradient wrap (flame animation)
Streak number in Figtree 900, "X Day Streak" + motivational message
Lucide ChevronRight

LATEST INSIGHT (teaser):
If exists: compact card, border-left colored by insight_type, title + truncated body, "See all insights" link with Lucide ArrowRight
If none: "Log for X more days to unlock your first insight" with progress bar

─────────────────────────────
LOG TAB (tabs/log.tsx)
─────────────────────────────
Three inner segments: Meal | Symptoms | Today
Segmented control at top: white background, active segment = primary green filled, DM Mono labels

MEAL SEGMENT:
Screen title: "Log a Meal" Figtree 900 20px
Subtext: "Every food is checked against your personal triggers" DM Mono text2

Meal type chips: Breakfast / Lunch / Dinner / Snack (pill chips, Lucide icons: Sunrise, Sun, Moon, Apple)

UNIFIED FOOD INPUT:
One input row with two entry methods — same row, same output:

Method A — TYPE:
Search input box (Lucide Search icon, rounded 12px, white, border stone)
User types food name → small spinner (Lucide Loader2 spin) appears next to food while edge function processes
On response: food card pops in with spring animation, dual badge appears with badge-pop animation

Method B — SCAN (camera icon button, dark background, 40px square, 12px radius):
Tap → navigate to /scanner screen
Returns selected dish → same food card added to the list

LABEL: "TYPE A FOOD OR SCAN A MENU" above the input row in DM Mono uppercase
Subtext: "Both check every item against your gut profile" in DM Mono 9px text3

FOOD CARDS (built up as user adds foods):
Each food card: white, 14px radius, shadow-sm, spring pop-in animation
Top row: food icon wrap (Lucide Utensils, cream bg), food name (Figtree 800), badge stack (FODMAP badge + personal verdict badge)
Why section below (separated by 1px stone border):
- 2–3 bullet rows: 4px colored dot + text (DM Mono 9px text2)
- If conflict: green dot + conflict explanation
- If CAUTION: amber dot + specific action instruction

OVERALL MEAL VERDICT:
Appears after 1+ foods added
Avoid state: red-light bg, red border, Lucide AlertTriangle icon, verdict title + swap suggestion
OK state: sage-light bg, sage border, Lucide CheckCircle icon, "Safe meal for you"
Overall verdict = most severe individual food verdict

STRESS LEVEL:
Slider 1–5, Lucide icons at each end (Smile at 1, Frown at 5)
Haptic selectionChanged on each tick

Notes field: text input, optional

"Log Meal" button: primary green gradient, full width, shadow, Lucide Check icon

SYMPTOMS SEGMENT:
Screen title: "How are you feeling?"
Time selector: "Now (2:34 PM)" with Lucide Clock icon, tappable to change

Symptom sliders (0–10 each):
- Bloating: Lucide icons anchor each end
- Stomach Pain: Lucide icons
- Urgency: Lucide icons
- Nausea: Lucide icons
- Fatigue: Lucide icons
Each slider: haptic selectionChanged every tick, value shown numerically

Bristol Stool Chart:
7 options shown as clean numbered tiles (1–7)
Brief label under each number: "Hard lumps" through "Watery"
Selected tile: green border + background

Notes field
"Log Symptoms" button → saves → impactMedium haptic → updates gut score on home

TODAY SEGMENT:
Screen title: "How was your day?"
Subtext: "Non-food factors affect your gut too. Logging them helps find hidden triggers."

Sleep: hours stepper (Lucide Minus / Plus) + star quality rating (1–5)
Stress: slider 1–5 with Lucide icons
Exercise: toggle (Lucide Activity icon) + text input for type when ON
Water: Lucide Droplets icon, tap +/- glass counter
Menstrual phase: Lucide icons, ONLY shown if biological_sex = 'female' in profiles

"Save" button

─────────────────────────────
SCANNER (scanner/index.tsx)
─────────────────────────────
Full screen expo-camera view
Scan frame: green corner brackets (SVG, not border), centered
Animated scan line: horizontal green line moves top → bottom continuously, 2s loop
Label: "Point at any menu" Figtree 700, white
Subtext: "Gut Buddy reads every dish and finds what's safe for you" DM Mono, white 70%
Large circular capture button: white, Lucide Camera icon dark

During processing: scan line pulses faster, label changes to "Analysing menu..."

RESULTS BOTTOM SHEET (slides up after analysis):
Handle bar at top
"Results for you" Figtree 900, "Based on your personal triggers" DM Mono text2

BEST PICK card (pinned to top, highlighted in sage-light):
"BEST PICK" label in DM Mono, Lucide Star icon
Dish name Figtree 900
Reason: specific to their triggers ("No dairy or garlic — avoids your top 2 triggers")
Personal verdict badge: SAFEST green

Remaining dishes listed below with dual badges + why section
Each dish tappable to expand full why explanation

"Log [dish name]" button → pre-fills meal log with selected dish → pops back to Log tab
"Log a different dish" outline button

─────────────────────────────
PROGRESS TAB (tabs/progress.tsx)
─────────────────────────────
Two inner segments: Insights | Progress
Segmented control at top

INSIGHTS SEGMENT:
Pull to refresh → calls generate-insight edge function
Staggered slide-up entrance (80ms delay each card)

Insight card anatomy:
Left border 3.5px colored by type:
- trigger_watching/likely/confirmed: red
- pattern: amber
- recommendation: #7C3AED (purple)
- weekly_summary: primary green

Top badges row: insight type badge (DM Mono 8.5px, colored bg) + confidence badge (sage-light)
Title: Figtree 800 12px, specific (food name in title)
Body: DM Mono 9.5px, text2, 1.5 line-height
Related food chips: cream bg, DM Mono 9px
"Read more / Collapse" toggle

TRIGGER JOURNEY CARDS (special cards, shown when insight_type is trigger_*):
Show the watching → likely → confirmed progression for each food being watched:
Small timeline dots showing current stage
Day counter: "Watching for 5 days"
Evidence: "Elevated symptoms 3/4 times (avg 7.2 vs 2.1 baseline)"
Confidence bar: animated fill 0 → current confidence

Empty state (< 3 days logged):
Mascot + "Log for X more days to unlock your first insight"
Progress bar: X/7 days

PROGRESS SEGMENT:
Calls calculate-progress on mount

IMPROVEMENT HERO (prominent, dark green card):
Deep green gradient card (#2D7A52 → #1A5C36)
Large "↓59%" in DM Mono 900 40px white
"improvement since you started" Figtree 700 white
Two comparison pills: "Week 1 avg: 7.8" and "This week: 3.2"
If no improvement: "Keep logging — your data is building" with Lucide TrendingDown

SYMPTOM TREND CHART:
White card, react-native-gifted-charts line chart
Toggle: Bloating / Pain / Urgency / Fatigue (chip selector)
Time range: 7d / 30d / 90d
Animated line draw on mount
Good/bad meal markers overlaid on chart as dots (colored by overall_meal_verdict)
Legend: High / Medium / Low colored squares

GOOD VS BAD DAYS HEATMAP:
90-day grid of small squares (12px × 12px, 3px gap, 2px radius)
Green = good day (avg symptom < 3)
Red = bad day (avg symptom > 6)
Amber = middle
Light + dashed border = no data
Tap a day → day summary sheet slides up showing all logs for that date

TOP TRIGGERS LEADERBOARD:
White card, Lucide AlertCircle icon red header
Numbered rows: trigger name (Figtree 800), evidence string (DM Mono 9px text2), status badge (CONFIRMED / LIKELY)
Ordered by confidence desc

SAFE FOODS:
White card, Lucide CheckCircle2 icon green header
"Foods you've eaten with no symptoms"
Growing chip list: each chip shows the food name
DM Mono caption: "X foods confirmed safe for your gut"

─────────────────────────────
RECIPES TAB (tabs/recipes.tsx)
─────────────────────────────
Screen background: linear-gradient(160deg, #FFFBF0 0%, #F0FDF5 100%)

TODAY'S RECIPE (hero card):
Warm yellow gradient card (from #FFFBF0 to #FFF8E8), amber border
"TODAY" ribbon top-right: amber background, white DM Mono label

Trigger-free safety tags (row of green chips with Lucide Check icons): lists which of their confirmed triggers this recipe avoids
Recipe title: Figtree 900 15px
Description: 1–2 sentences appetising copy
Meta row: Lucide Clock (prep time) + Lucide Utensils (meal type)
Two action buttons: "See Recipe" (primary green) + "Save" (outline with Lucide Heart icon)
"This isn't for me" text link below → calls generate-recipe edge function, shimmer replaces card

SAVED RECIPES:
Section title: "Saved" + count
2-column grid of recipe cards
Each card: gradient image placeholder (color based on meal type), title Figtree 800, meta DM Mono
Tap → recipe detail

GENERATE:
Section title: "Generate a Recipe"
Text input: "What do you feel like eating?"
Meal type chip selector
"What's in your fridge?" text input (optional)
"Generate Safe Recipe" CTA → calls generate-recipe edge function → shimmer → recipe card pops in

RECIPE DETAIL (modal / bottom sheet, full screen):
Back / close button
Title Figtree 900
Description
Trigger-free tags
Meta (time, meal type)
Ingredients list: each ingredient with FODMAP badge (same dual badge system)
Numbered steps
"Log This Meal" button → pre-fills meal log
Share button: Lucide Share2 → react-native-view-shot + expo-sharing
Save/unsave heart button

─────────────────────────────
PROFILE TAB (tabs/profile.tsx)
─────────────────────────────
Screen title: "Profile" Figtree 900

PROFILE CARD (top):
Avatar circle: initials or photo, 72px, primary green gradient bg
Display name: Figtree 900 18px
Email: DM Mono 11px text2
Edit name button: Lucide Pencil icon, inline

GUT PROFILE SECTION:
Card with Lucide sections, each row tappable → opens edit sheet

"Your Conditions"
Chip list of diagnosed_conditions — tappable to edit
Lucide ChevronRight

"Your Known Triggers"  
Chip list of known_triggers — tappable to add/remove
Important note: "These seed your Day 1 personalisation"

"Your Confirmed Triggers (AI-detected)"
Read-only chip list from ai_insights where type = trigger_confirmed
DM Mono caption: "Found by Gut Buddy from your logs"
Lucide Lock icon — not editable (these are AI-confirmed from evidence)

"Diet Type"
Current diet type chip — tappable to change

"Biological Sex / Age"
Current values — tappable to edit

NOTIFICATIONS SECTION:
Lucide Bell icon header
Meal reminder times (3x) — tappable time pickers
Evening check-in toggle + time
All notifications master toggle

SUBSCRIPTION SECTION:
Lucide CreditCard icon header
Active plan info from RevenueCat customerInfo
Renewal date
"Manage Subscription" → RevenueCat deep link → iOS subscription management
"Restore Purchase" button

STREAK & STATS:
Lucide Award icon header
Current streak, longest streak (DM Mono large numbers)
Total days logged, total meals logged, total symptom logs

DATA SECTION:
"Export My Data" → CSV export of all logs via expo-sharing
Lucide Download icon

ACCOUNT SECTION:
Privacy Policy link
Terms of Service link
Medical Disclaimer: "Gut Buddy is a logging tool, not a medical device. Always consult your doctor for diagnosis and treatment."
"Sign Out" — Lucide LogOut icon
"Delete My Account" — Lucide Trash2 icon, red text
  → confirm dialog: "This permanently deletes all your logs, triggers, recipes, and progress. This cannot be undone."
  → confirm → calls delete-account edge function → sign out → return to auth

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REVENUECAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Init iOS key only on app launch
- Purchases.logIn(supabase_user_id) after successful auth
- Fetch dynamically: Purchases.getOfferings() → render current.availablePackages
- Never hardcode product IDs, prices, plan names, or trial lengths
- Entitlement: 'premium'
- Free for 3 days:
  → AI insights (generate-insight) gated after day 3
  → Recipe generation gated after day 3
  → Food logging is ALWAYS free — never gated
  → Symptom logging ALWAYS free — never gated
- Paywall shown: after day 3 when user tries to access gated feature, and during onboarding

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOTIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Schedule via expo-notifications:
- Meal reminders (3x daily at user-set times): "Time to log your [meal]. Every entry helps find your triggers."
- Evening symptom check-in: "How's your gut today? Log your symptoms before bed."
- Streak at risk (9 PM if nothing logged): "You haven't logged today. Don't break your [X]-day streak."
- New insight ready: "Gut Buddy found something in your data. Tap to see."
- Recipe of the day: "Today's safe recipe is ready."
- Streak milestones (7, 14, 30, 60, 90 days): "[X] days of logging. Your data is getting powerful."
Reschedule all when times change in Profile tab.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUTH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Supabase Google OAuth via expo-auth-session makeRedirectUri
- Supabase Apple OAuth via expo-apple-authentication
- AsyncStorage as Supabase session storage adapter
- Session listener in root _layout.tsx: onAuthStateChange
- Route guard: no session → (auth), session + onboarding incomplete → (onboarding), session + complete → (tabs)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ERROR HANDLING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Edge function timeout/failure: retry UI, never crash, never blank screen
- Food analysis failure: log food without badge, show "Couldn't analyse — try again" Lucide RefreshCw
- Insight failure: "Couldn't generate insight. Pull down to retry." with mascot
- Recipe failure: "Something went wrong. Try again." regenerate button
- Menu scan failure: "Couldn't read this menu. Try better lighting or move closer."
- No internet: offline banner (Lucide WifiOff), disable AI features, allow logging to queue locally
- Supabase write failure: toast error (Lucide AlertCircle), retain data in state, retry button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULES FOR RORK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- MVP core loop first: Auth → Onboard → Log meal (type OR scan) → Log symptoms → AI insight → Safe recipe → Progress visible
- TypeScript only. Functional components + hooks. No class components.
- NO EMOJIS anywhere in the UI — Lucide icons exclusively
- Fonts: Figtree + DM Mono via expo-google-fonts
- All AI calls via Supabase Edge Functions only — never call Gemini from the app
- RevenueCat: never hardcode prices, product IDs, or plan names
- iOS only. No Android. iOS 16+ minimum.
- Food logging and symptom logging are ALWAYS free — never gated
- Account deletion via delete-account edge function — required for App Store
- Medical disclaimer in Profile tab only (single line)
- Dual badge system on EVERY food item everywhere in the app — Log tab, Scanner results, Recipe ingredients, Profile trigger lists
- FODMAP tooltip shown once per session, then hidden
- Implement ALL loading states — skeletons and spinners everywhere
- Implement ALL empty states — mascot + message, never blank
- Implement ALL animations listed in design system
- The fun comes from: mascot reactions, streak gamification, trigger discovery reveal moments, improvement score going down, safe foods list growing, label getting smarter over time
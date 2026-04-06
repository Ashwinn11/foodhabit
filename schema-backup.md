# GutBuddy — Schema Backup (Pre-Rebuild)
# Saved: 2026-04-07

---

## Table: profiles
| Column | Type | Notes |
|---|---|---|
| id | uuid | FK → auth.users |
| email | text | |
| full_name | text | nullable |
| avatar_url | text | nullable |
| age | integer | nullable |
| biological_sex | text | male/female/other/prefer_not_to_say |
| diagnosed_conditions | text[] | default '{}' |
| known_triggers | text[] | default '{}' |
| diet_type | text | omnivore/vegetarian/vegan/gluten-free/dairy-free/low-fodmap |
| notifications_enabled | boolean | default true |
| onboarding_complete | boolean | default false |
| created_at | timestamptz | default now() |

---

## Table: meal_logs
| Column | Type | Notes |
|---|---|---|
| id | uuid | gen_random_uuid() |
| user_id | uuid | FK → profiles |
| logged_at | timestamptz | default now() |
| meal_type | text | breakfast/lunch/dinner/snack |
| foods | jsonb | default '[]' |
| overall_meal_verdict | text | avoid/caution/safest |
| notes | text | nullable |
| created_at | timestamptz | default now() |

---

## Table: symptom_logs
| Column | Type | Notes |
|---|---|---|
| id | uuid | gen_random_uuid() |
| user_id | uuid | FK → profiles |
| logged_at | timestamptz | default now() |
| bloating | integer | 0-10, default 0 |
| pain | integer | 0-10, default 0 |
| urgency | integer | 0-10, default 0 |
| nausea | integer | 0-10, default 0 |
| fatigue | integer | 0-10, default 0 |
| stool_type | integer | 1-7 (Bristol), nullable |
| notes | text | nullable |
| created_at | timestamptz | default now() |

---

## Table: ai_insights
| Column | Type | Notes |
|---|---|---|
| id | uuid | gen_random_uuid() |
| user_id | uuid | FK → profiles |
| generated_at | timestamptz | default now() |
| insight_type | text | trigger_watching/trigger_likely/trigger_confirmed/pattern/recommendation/weekly_summary |
| title | text | |
| body | text | |
| related_foods | text[] | nullable |
| confidence | text | low/medium/high, default 'low' |
| is_read | boolean | default false |
| created_at | timestamptz | default now() |

---

## Table: recipes
| Column | Type | Notes |
|---|---|---|
| id | uuid | gen_random_uuid() |
| user_id | uuid | FK → profiles |
| title | text | |
| description | text | |
| ingredients | jsonb | default '[]' |
| steps | jsonb | default '[]' |
| prep_time_mins | integer | |
| meal_type | text | |
| trigger_free | text[] | default '{}' |
| is_saved | boolean | default false |
| source | text | daily/post_log/generate |
| generated_at | timestamptz | default now() |

---

## Table: streaks
| Column | Type | Notes |
|---|---|---|
| id | uuid | gen_random_uuid() |
| user_id | uuid | unique, FK → profiles |
| current_streak | integer | default 0 |
| longest_streak | integer | default 0 |
| last_logged_date | date | nullable |
| updated_at | timestamptz | default now() |

---

## Edge Functions
- `analyze-food` — Meal analyzer
- `generate-recipe` — Recipe generator
- `generate-insight` — Pattern detection engine
- `delete-account` — Account deletion

---

## App Screens
- (auth) — Login/Signup
- (onboarding) — Onboarding flow + paywall
- (tabs) — Main app tabs
- scanner — Food scanner
- legal — Terms/Privacy

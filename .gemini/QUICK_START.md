# 🚀 Quick Start: Apply Mission Persistence

## Run This Command

```bash
# Option 1: If you have Supabase linked
cd /Users/ashwinn/Projects/foodhabit
supabase db push

# Option 2: If not linked, link first
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## Or Use Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor**
4. Copy and paste this SQL:

```sql
-- Copy from: supabase/migrations/20260120_add_health_logs.sql
```

5. Click **Run**

## That's It!

Your mission data (water, fiber, probiotic, exercise) will now persist to the database.

## Test It

1. Open the app
2. Log some water (tap the mission)
3. Restart the app
4. ✅ Water count should still be there!

---

**Full details:** See `.gemini/MISSION_PERSISTENCE_IMPLEMENTATION.md`

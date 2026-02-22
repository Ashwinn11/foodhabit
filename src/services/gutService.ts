import { supabase } from '../config/supabase';

export interface MealPayload {
  foods: string[];
  name?: string;
}

export interface GutLogPayload {
  mood: 'sad' | 'neutral' | 'happy';
  symptoms: string[];
}

export interface TriggerFood {
  food_name: string;
  user_confirmed: boolean | null;
  bad_occurrences: number;
  good_occurrences: number;
  confidence: 'Low' | 'Medium' | 'High' | null;
  symptoms: Record<string, boolean>;
}

// ── Trigger thresholds ────────────────────────────────────────────────────────
// A food is only flagged when there's enough evidence it's genuinely bad for
// this user — not just because they ate it once before a rough day.
//
//  confidence | min bad logs | bad ratio required
//  Low        |     3        |     ≥ 65%
//  Medium     |     5        |     ≥ 70%
//  High       |     8        |     ≥ 75%
//
// Foods below the minimum threshold have confidence = null and are NOT shown.

function calcConfidence(
  bad: number,
  good: number
): 'Low' | 'Medium' | 'High' | null {
  const total = bad + good;
  if (total === 0) return null;
  const ratio = bad / total;

  if (bad >= 8 && ratio >= 0.75) return 'High';
  if (bad >= 5 && ratio >= 0.70) return 'Medium';
  if (bad >= 3 && ratio >= 0.65) return 'Low';
  return null; // not enough evidence yet
}

export const gutService = {
  // ── Meals ──────────────────────────────────────────────────────────────────

  logMeal: async (payload: MealPayload): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('meals').insert({
      user_id:   user.id,
      timestamp: new Date().toISOString(),
      foods:     payload.foods,
      name:      payload.name ?? payload.foods.join(', '),
    });
    if (error) throw error;
  },

  getRecentMeals: async (limit = 10) => {
    const { data, error } = await supabase
      .from('meals')
      .select('id, timestamp, foods, name')
      .order('timestamp', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  // ── Gut Logs ───────────────────────────────────────────────────────────────

  logGutMoment: async (payload: GutLogPayload): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('gut_logs').insert({
      user_id:   user.id,
      timestamp: new Date().toISOString(),
      mood:      payload.mood,
      tags:      payload.symptoms,
    });
    if (error) throw error;

    // Correlate this gut moment against recent meals
    await gutService._correlateTriggers(user.id, payload.mood, payload.symptoms);
  },

  getRecentLogs: async (limit = 10) => {
    const { data, error } = await supabase
      .from('gut_logs')
      .select('id, timestamp, mood, tags')
      .order('timestamp', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  // ── Correlation engine ────────────────────────────────────────────────────
  //
  // After every gut log we look at what was eaten in the past 6 hours and
  // record whether that meal led to a bad or good outcome.  Only after
  // enough bad evidence (vs good evidence) does a food surface as suspected.

  _correlateTriggers: async (
    userId: string,
    mood: GutLogPayload['mood'],
    symptoms: string[]
  ): Promise<void> => {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const { data: recentMeals } = await supabase
      .from('meals')
      .select('foods')
      .eq('user_id', userId)
      .gte('timestamp', sixHoursAgo);

    if (!recentMeals?.length) return;

    const foods = [...new Set(recentMeals.flatMap(m => m.foods as string[]))];
    const isBad = mood === 'sad';
    const symptomsMap = Object.fromEntries(symptoms.map(s => [s.toLowerCase(), true]));

    for (const food of foods) {
      // Fetch existing record (if any)
      const { data: existing } = await supabase
        .from('trigger_foods')
        .select('bad_occurrences, good_occurrences, user_confirmed')
        .eq('user_id', userId)
        .eq('food_name', food)
        .maybeSingle();

      const badCount  = (existing?.bad_occurrences  ?? 0) + (isBad ? 1 : 0);
      const goodCount = (existing?.good_occurrences ?? 0) + (isBad ? 0 : 1);
      const confidence = calcConfidence(badCount, goodCount);

      // If the user already confirmed this food, don't touch their decision
      if (existing?.user_confirmed === true) continue;

      if (badCount === 0 && goodCount > 0 && !existing) {
        // Good first encounter — no need to create a record yet
        continue;
      }

      await supabase.from('trigger_foods').upsert(
        {
          user_id:          userId,
          food_name:        food,
          bad_occurrences:  badCount,
          good_occurrences: goodCount,
          confidence,
          symptoms:         isBad ? symptomsMap : (existing ? undefined : {}),
          updated_at:       new Date().toISOString(),
        },
        { onConflict: 'user_id,food_name' }
      );
    }
  },

  // ── Trigger Foods ──────────────────────────────────────────────────────────

  // Fetch all trigger foods for this user, filter client-side.
  // Only foods with evidence (confidence not null) or explicit confirmation are surfaced in the UI.
  getTriggerFoods: async (): Promise<TriggerFood[]> => {
    const { data, error } = await supabase
      .from('trigger_foods')
      .select('food_name, user_confirmed, bad_occurrences, good_occurrences, confidence, symptoms')
      .order('bad_occurrences', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as TriggerFood[]).filter(
      t => t.user_confirmed === true || t.confidence !== null
    );
  },

  confirmTrigger: async (foodName: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('trigger_foods')
      .update({ user_confirmed: true, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('food_name', foodName);
  },

  dismissTrigger: async (foodName: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('trigger_foods')
      .delete()
      .eq('user_id', user.id)
      .eq('food_name', foodName);
  },
};

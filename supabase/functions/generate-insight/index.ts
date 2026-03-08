import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        }

        const { user_id } = await req.json();
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('known_triggers, diagnosed_conditions')
            .eq('id', user_id)
            .single();

        // Get last 14 days of meal logs
        const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();
        const { data: mealLogs } = await supabase
            .from('meal_logs')
            .select('*')
            .eq('user_id', user_id)
            .gte('logged_at', fourteenDaysAgo)
            .order('logged_at', { ascending: false });

        // Get last 14 days of symptom logs
        const { data: symptomLogs } = await supabase
            .from('symptom_logs')
            .select('*')
            .eq('user_id', user_id)
            .gte('logged_at', fourteenDaysAgo)
            .order('logged_at', { ascending: false });

        // Get daily factors
        const { data: dailyFactors } = await supabase
            .from('daily_factors')
            .select('*')
            .eq('user_id', user_id)
            .gte('date', fourteenDaysAgo.split('T')[0])
            .order('date', { ascending: false });

        // Get existing insight types to avoid duplicates
        const { data: existingInsights } = await supabase
            .from('ai_insights')
            .select('insight_type, title, related_foods')
            .eq('user_id', user_id)
            .gte('generated_at', fourteenDaysAgo)
            .order('generated_at', { ascending: false });

        if (!mealLogs || mealLogs.length < 3) {
            return new Response(JSON.stringify({ message: 'Not enough data for insights. Keep logging!' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const prompt = `You are a gut health AI analyst. Analyse this user's recent food and symptom data to generate personalised insights.

User Profile:
- Known triggers: ${(profile?.known_triggers || []).join(', ') || 'none'}
- Conditions: ${(profile?.diagnosed_conditions || []).join(', ') || 'none'}

Recent Meal Logs (last 14 days):
${JSON.stringify(mealLogs, null, 1)}

Recent Symptom Logs (last 14 days):
${JSON.stringify(symptomLogs, null, 1)}

Daily Factors:
${JSON.stringify(dailyFactors, null, 1)}

Existing Insights (avoid duplicating):
${JSON.stringify(existingInsights, null, 1)}

Generate 1-3 NEW insights. Each insight must be one of these types:
- trigger_watching: A food that appeared before symptoms but needs more data (confidence: low)
- trigger_likely: A food that consistently appears before symptom spikes (confidence: medium)
- trigger_confirmed: Strong correlation confirmed over multiple logs (confidence: high)
- pattern: A non-food pattern (sleep, stress, timing) affecting symptoms
- recommendation: A specific, actionable suggestion
- weekly_summary: An overview of the week's gut health

Respond with a JSON array:
[
  {
    "insight_type": "trigger_watching" | "trigger_likely" | "trigger_confirmed" | "pattern" | "recommendation" | "weekly_summary",
    "title": "short descriptive title",
    "body": "detailed explanation with specific data references",
    "related_foods": ["food1", "food2"],
    "confidence": "low" | "medium" | "high"
  }
]

Rules:
- Do NOT repeat insights that already exist
- Be specific — reference actual meals and dates from the data
- Correlate meal timing with symptom timing (symptoms 2-6h after meals)
- Consider daily factors (stress, sleep) as confounding variables
- If insufficient data, say "Keep logging" rather than guessing`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
                }),
            }
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('No response from Gemini');

        const insights = JSON.parse(text);

        // Store the insights
        if (Array.isArray(insights) && insights.length > 0) {
            const insightRows = insights.map((insight: any) => ({
                user_id,
                insight_type: insight.insight_type,
                title: insight.title,
                body: insight.body,
                related_foods: insight.related_foods || [],
                confidence: insight.confidence || 'low',
            }));

            await supabase.from('ai_insights').insert(insightRows);
        }

        return new Response(JSON.stringify({ insights }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
});

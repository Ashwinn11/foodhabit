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

        // 1. Get user context
        const { data: profile } = await supabase
            .from('profiles')
            .select('known_triggers, diagnosed_conditions')
            .eq('id', user_id)
            .single();

        // 2. Get last 14 days of history
        const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();
        const { data: mealLogs } = await supabase
            .from('meal_logs')
            .select('*')
            .eq('user_id', user_id)
            .gte('logged_at', fourteenDaysAgo)
            .order('logged_at', { ascending: false });

        const { data: symptomLogs } = await supabase
            .from('symptom_logs')
            .select('*')
            .eq('user_id', user_id)
            .gte('logged_at', fourteenDaysAgo)
            .order('logged_at', { ascending: false });

        if (!mealLogs || mealLogs.length < 3) {
            return new Response(JSON.stringify({ message: 'Awaiting more evidence. Keep logging your meals!' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 3. Simplified "Unified Discovery" Prompt
        const prompt = `You are a gut health AI coach. Analyse the logs and find the SINGLE most important health discovery for this user right now.

USER LOGS (Last 14d):
Meals: ${JSON.stringify(mealLogs, null, 1)}
Symptoms: ${JSON.stringify(symptomLogs, null, 1)}

INSTRUCTIONS:
- Identify one major trigger or pattern.
- Combine the finding, the evidence, and a specific solution into a single discovery.
- Use a 1-100 Confidence Score based on frequency and severity (e.g., 90+ if severe pain happened multiple times).
- Match meals to symptoms that occurred 2-6 hours LATER.
- FOR THE FIX: If confidence is >70, propose a specific "3-Day Challenge" (e.g. "3-Day Lactose-Free Test").

JSON RESPONSE FORMAT:
{
  "title": "Short descriptive title",
  "body": "A short 2-3 sentence story explaining the trigger and the specific dinner/lunch date it happened.",
  "buddy_tip": "One clear actionable solution (e.g., replace yogurt with almond yogurt).",
  "active_protocol": "A 3-Day Challenge title (e.g., '3-Day Lactose-Free Test') or null if confidence < 70",
  "related_foods": ["food1"],
  "confidence_score": 1-100
}`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
                }),
            }
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('AI Engine is currently resting.');

        const discovery = JSON.parse(text);

        // 4. Map Discovery to DB (Mapping to existing types for backward compat but unified logic)
        if (discovery && discovery.title) {
            const mappedType = discovery.confidence_score >= 80 ? 'trigger_confirmed' : 
                               discovery.confidence_score >= 50 ? 'trigger_likely' : 'trigger_watching';
            
            // Append the buddy tip and protocol to the body text for now
            const fullBody = `${discovery.body}\n\n💡 Buddy Tip: ${discovery.buddy_tip}${discovery.active_protocol ? `\n\n🎯 Protocol: ${discovery.active_protocol}` : ''}`;

            const insightRow = {
                user_id,
                insight_type: mappedType,
                title: discovery.title,
                body: fullBody,
                related_foods: discovery.related_foods || [],
                confidence: discovery.confidence_score >= 80 ? 'high' : 
                             discovery.confidence_score >= 50 ? 'medium' : 'low',
                 // Note: If you want a dedicated 'active_protocol' column in the DB, we can add it later.
            };

            await supabase.from('ai_insights').insert([insightRow]);
        }

        return new Response(JSON.stringify({ discovery }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
});

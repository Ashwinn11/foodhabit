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

        // 3. Simplified "Pattern Discovery" Prompt
        const prompt = `You are a gut health pattern detective. Analyse the logs and find the SINGLE most important trigger pattern for this user right now.

USER LOGS (Last 14d):
Meals: ${JSON.stringify(mealLogs, null, 1)}
Symptoms: ${JSON.stringify(symptomLogs, null, 1)}

INSTRUCTIONS:
- Identify one major trigger pattern by linking three dots:
  1. The Meal (What was eaten)
  2. The Symptoms (What happened 2-6 hours later)
  3. The Bristol Stool Score (The effect seen in the next 24 hours)
- THE LAW OF PROOF: Do NOT guess. Only identify a pattern if you see it at least TWICE in the history (e.g., the same food led to the same symptom twice).
- EXCEPTIONS: If a single event had 10/10 severity pain/bloating, you can flag it as "Highly Likely" but NOT "Confirmed."
- EVIDENCE COUNTING: Start every discovery body with: "I've seen this pattern [X] times..." where X is the actual frequency in the logs.
- SPECIAL CASE: Look for "Safe-Food Irritation" (reactions to Low-FODMAP meals).
- Combine these into a single, cohesive discovery story.
- Use a 1-100 Confidence Score (90+ = Confirmed 3+ times, 70-80 = Highly Likely 2 times, <50 = Under Review 1 time).
- Bristol Scale Reference: 1-2 (Constipation/Hard), 4 (Ideal), 6-7 (Irritation/Loose).

JSON RESPONSE FORMAT:
{
  "title": "Short descriptive title (e.g. 'Dairy Trigger Pattern')",
  "body": "A 2-3 sentence story linking the specific meal date/time, the symptoms that followed, and any Bristol stool changes observed.",
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

        // 4. Map Discovery to DB
        if (discovery && discovery.title) {
            const mappedType = discovery.confidence_score >= 80 ? 'trigger_confirmed' : 
                               discovery.confidence_score >= 50 ? 'trigger_likely' : 'trigger_watching';
            
            const insightRow = {
                user_id,
                insight_type: mappedType,
                title: discovery.title,
                body: discovery.body,
                related_foods: discovery.related_foods || [],
                confidence: discovery.confidence_score >= 80 ? 'high' : 
                             discovery.confidence_score >= 50 ? 'medium' : 'low',
            };

            await supabase.from('ai_insights').insert([insightRow]);

            // 5. AUTO-UPDATE PROFILE: If confirmed, add to known_triggers
            if (mappedType === 'trigger_confirmed' && discovery.related_foods?.length > 0) {
                const currentTriggers = profile?.known_triggers || [];
                // Merge and remove duplicates
                const updatedTriggers = Array.from(new Set([...currentTriggers, ...discovery.related_foods]));
                
                await supabase
                    .from('profiles')
                    .update({ known_triggers: updatedTriggers })
                    .eq('id', user_id);
            }
        }

        return new Response(JSON.stringify({ discovery }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
});

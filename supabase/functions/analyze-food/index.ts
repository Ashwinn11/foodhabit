// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callGemini(prompt: string, imageBase64?: string, mimeType?: string): Promise<any> {
    const parts: any[] = [{ text: prompt }];

    if (imageBase64) {
        parts.push({
            inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: imageBase64,
            },
        });
    }

    // 25s timeout — Supabase wall clock is 60s, fail fast so client gets a real error
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    contents: [{ parts }],
                    generationConfig: {
                        responseMimeType: 'application/json',
                        temperature: 0.4,
                    },
                }),
            }
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('No response from Gemini');
        return JSON.parse(text);
    } finally {
        clearTimeout(timeout);
    }
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        }

        const { mode, food_name, user_id, menu_image_base64, mime_type } = await req.json();

        if (!user_id) {
            console.error('No user_id provided in request');
            return new Response(JSON.stringify({ error: 'user_id is required' }), { status: 400, headers: corsHeaders });
        }

        // Create admin client to fetch user profile
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Get user profile for personalisation
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('known_triggers, diagnosed_conditions, diet_type')
            .eq('id', user_id)
            .single();

        if (profileError) {
            console.error('Error fetching profile:', profileError);
        }

        const triggers = profile?.known_triggers || [];
        const conditions = profile?.diagnosed_conditions || [];
        const dietType = profile?.diet_type || 'omnivore';

        // Get recent trigger insights
        const { data: insights } = await supabase
            .from('ai_insights')
            .select('title, related_foods, insight_type')
            .eq('user_id', user_id)
            .in('insight_type', ['trigger_confirmed', 'trigger_likely', 'trigger_watching'])
            .limit(20);

        const confirmedTriggers = (insights || [])
            .filter((i: any) => i.insight_type === 'trigger_confirmed')
            .flatMap((i: any) => i.related_foods || []);
        const likelyTriggers = (insights || [])
            .filter((i: any) => i.insight_type === 'trigger_likely')
            .flatMap((i: any) => i.related_foods || []);

        const userContext = `
[CRITICAL USER DATA]
- PERSONAL TRIGGERS: ${triggers.join(', ') || 'NONE SPECIFIED BY USER'}
- AI-DETECTED CONFIRMED TRIGGERS: ${confirmedTriggers.join(', ') || 'none'}
- AI-DETECTED LIKELY TRIGGERS: ${likelyTriggers.join(', ') || 'none'}
- CONDITIONS: ${conditions.join(', ') || 'none'}
- DIET: ${dietType}
[/CRITICAL USER DATA]
`;

        if (mode === 'food') {
            const prompt = `You are a gut health food analysis AI. Analyse the following food item for this specific user.

${userContext}

Food to analyse: "${food_name}"

Respond with a JSON object:
{
  "name": "food name",
  "fodmap_risk": "low" | "medium" | "high",
  "personal_verdict": "avoid" | "caution" | "safest",
  "caution_action": "specific advice if caution, else null",
  "why": ["ECHO DETECTED TRIGGER HERE IF FOUND", "reason 2"],
  "ingredients": ["ingredient 1", "2"],
  "contains_user_triggers": ["MATCHED TRIGGER FROM USER LIST"],
  "conflict_explanation": "null unless personal data overrides FODMAP",
  "portion": "safe portion size if applicable",
  "debug_profile_seen": "List of triggers seen in prompt"
}

Rules:
- PRIORITY: Personal Triggers > General FODMAP Data.
- If a food matches ANY "PERSONAL TRIGGER", the personal_verdict MUST BE "avoid".
- The first item in the "why" array MUST explicitly name the detected trigger.
- DO NOT say "user has no triggers" if any are listed in [CRITICAL USER DATA].`;

            const result = await callGemini(prompt);
            return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        } else if (mode === 'menu') {
            const prompt = `You are a gut health menu scanner AI. Analyse every dish visible in this restaurant menu image for this specific user.

${userContext}

For each dish, respond with a JSON object following this structure:
{
  "dishes": [
    {
      "name": "dish name",
      "fodmap_risk": "low" | "medium" | "high",
      "personal_verdict": "avoid" | "caution" | "safest",
      "why": ["ECHO DETECTED TRIGGER HERE IF FOUND"],
      "ingredients": ["key ingredient 1", "2"],
      "contains_user_triggers": ["trigger1", "trigger2"]
    }
  ],
  "best_pick": "safest dish name",
  "best_pick_reason": "why this is best for THIS user"
}

Rules:
- Analyse EVERY visible dish.
- personal_verdict MUST be 'avoid' if any dish name or ingredient matches a [CRITICAL USER DATA] trigger.
- contains_user_triggers MUST list any ingredients matched from the user's trigger list.`;

            const result = await callGemini(prompt, menu_image_base64, mime_type);
            return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ error: 'Invalid mode' }), { status: 400, headers: corsHeaders });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
});

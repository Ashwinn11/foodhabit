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

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

        // Create admin client to fetch user profile
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Get user profile for personalisation
        const { data: profile } = await supabase
            .from('profiles')
            .select('known_triggers, diagnosed_conditions, diet_type')
            .eq('id', user_id)
            .single();

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
User Profile:
- Known triggers: ${triggers.join(', ') || 'none specified'}
- AI-confirmed triggers: ${confirmedTriggers.join(', ') || 'none yet'}
- AI-likely triggers: ${likelyTriggers.join(', ') || 'none yet'}
- Diagnosed conditions: ${conditions.join(', ') || 'none'}
- Diet: ${dietType}
`;

        if (mode === 'food') {
            const prompt = `You are a gut health food analysis AI. Analyse the following food item for this specific user.

${userContext}

Food to analyse: "${food_name}"

Respond with a JSON object:
{
  "name": "food name (proper capitalisation)",
  "fodmap_risk": "low" | "medium" | "high",
  "personal_verdict": "avoid" | "caution" | "safest",
  "caution_action": "specific action if verdict is caution, e.g. 'limit to 1/4 cup' or 'try with lactase enzyme'. null if not caution",
  "why": ["reason 1 based on user's profile", "reason 2"],
  "ingredients": ["main ingredient 1", "ingredient 2"],
  "contains_user_triggers": ["trigger found 1", "trigger 2"],
  "conflict_explanation": "if FODMAP data and personal data conflict, explain why. null otherwise",
  "portion": "safe portion size if applicable"
}

Rules:
- personal_verdict MUST factor in the user's known and AI-confirmed triggers
- If a food contains or is derived from a confirmed trigger, verdict must be "avoid"
- If it contains a likely trigger, verdict should be "caution" with a specific caution_action
- If FODMAP says low risk but user's personal data says it's a trigger, acknowledge the conflict
- Be specific about portions and actions, not generic`;

            const result = await callGemini(prompt);
            return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        } else if (mode === 'menu') {
            const prompt = `You are a gut health menu scanner AI. Analyse every dish visible in this restaurant menu image for this specific user.

${userContext}

For each dish on the menu, provide analysis. Respond with:
{
  "dishes": [
    {
      "name": "dish name",
      "fodmap_risk": "low" | "medium" | "high",
      "personal_verdict": "avoid" | "caution" | "safest",
      "why": ["concise reason based on user profile"],
      "ingredients": ["key ingredient 1", "2"],
      "contains_user_triggers": ["trigger1", "trigger2"]
    }
  ],
  "best_pick": "name of safest dish",
  "best_pick_reason": "why this is the best choice for this user"
}

Rules:
- Analyse EVERY visible dish
- personal_verdict must be based on user's triggers, not just general FODMAP
- best_pick should be the dish with best overall safety for this specific user
- Be concise but specific`;

            const result = await callGemini(prompt, menu_image_base64, mime_type);
            return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ error: 'Invalid mode' }), { status: 400, headers: corsHeaders });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
});

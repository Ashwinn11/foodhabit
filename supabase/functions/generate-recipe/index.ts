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

        const { user_id, source, meal_type, context, available_ingredients } = await req.json();
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('known_triggers, diagnosed_conditions, diet_type')
            .eq('id', user_id)
            .maybeSingle();

        // Get confirmed and likely triggers from insights
        const { data: insights } = await supabase
            .from('ai_insights')
            .select('related_foods, insight_type')
            .eq('user_id', user_id)
            .in('insight_type', ['trigger_confirmed', 'trigger_likely'])
            .limit(20);

        const allTriggers = [
            ...(profile?.known_triggers || []),
            ...(insights || []).flatMap((i: any) => i.related_foods || []),
        ];
        const uniqueTriggers = [...new Set(
            allTriggers
                .filter(t => typeof t === 'string')
                .map((t: string) => t.toLowerCase())
        )];

        // Get recent safe foods from meal logs
        const { data: safeMeals } = await supabase
            .from('meal_logs')
            .select('foods')
            .eq('user_id', user_id)
            .eq('overall_meal_verdict', 'safest')
            .order('logged_at', { ascending: false })
            .limit(10);

        const safeFoods = (safeMeals || [])
            .flatMap((m: any) => (m.foods as any[]).filter(f => f.personal_verdict === 'safest').map(f => f.name));

        const contextPart = context ? `\nUser wants: ${context}` : '';
        const ingredientsPart = available_ingredients?.length
            ? `\nAvailable ingredients: ${available_ingredients.join(', ')}`
            : '';

        const prompt = `You are a gut health recipe AI. Generate a safe, delicious recipe for this user.

User Profile:
- Triggers to AVOID: ${uniqueTriggers.join(', ') || 'none identified yet'}
- Conditions: ${(profile?.diagnosed_conditions || []).join(', ') || 'none'}
- Diet: ${profile?.diet_type || 'omnivore'}
- Safe foods they enjoy: ${[...new Set(safeFoods)].join(', ') || 'not enough data yet'}
${contextPart}${ingredientsPart}

Meal type: ${meal_type || 'dinner'}
Source: ${source} (${source === 'daily' ? 'daily recommendation' : source === 'post_log' ? 'post-meal suggestion' : 'user requested'})

Respond with a JSON object:
{
  "title": "Recipe name",
  "description": "Brief, appetising description (1-2 sentences)",
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": "1",
      "unit": "cup",
      "fodmap_risk": "low" | "medium" | "high"
    }
  ],
  "steps": [
    { "step_number": 1, "instruction": "clear, concise instruction" }
  ],
  "prep_time_mins": 25,
  "meal_type": "${meal_type || 'dinner'}",
  "trigger_free": ["trigger1-free", "trigger2-free"]
}

Rules:
- NEVER include any of the user's triggers as ingredients
- Use LOW FODMAP ingredients preferentially
- If a medium risk ingredient is used, keep portion small
- trigger_free array should list which user triggers this recipe avoids
- Keep it practical — max 8-10 ingredients, clear simple steps
- Make it genuinely appetising, not just "safe"`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini API error:', data);
            throw new Error(`Gemini API failed with status ${response.status}`);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            console.error('Empty Gemini response. Candidate:', data.candidates?.[0]);
            throw new Error('No response content from Gemini');
        }

        console.log('Successfully received recipe from Gemini. Text length:', text.length);
        let recipe = JSON.parse(text);

        // Smart Extraction: Handle arrays or common nesting patterns
        if (Array.isArray(recipe) && recipe.length > 0) {
            recipe = recipe[0];
        } else if (!recipe.title && (recipe.recipe || recipe.data || recipe.output)) {
            recipe = recipe.recipe || recipe.data || recipe.output;
        }

        console.log('Parsed recipe keys:', Object.keys(recipe));

        // Validate structure and apply smart defaults
        const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : (recipe.recipe?.ingredients || []);
        const steps = Array.isArray(recipe.steps) ? recipe.steps : (recipe.recipe?.steps || []);
        const trigger_free = Array.isArray(recipe.trigger_free) ? recipe.trigger_free : (recipe.recipe?.trigger_free || []);

        // Store recipe in DB with explicit error checking
        const { data: insertedData, error: insertError } = await supabase
            .from('recipes')
            .insert({
                user_id,
                title: recipe.title || recipe.name || recipe.recipe?.title || 'Personalized Recipe',
                description: recipe.description || recipe.summary || recipe.recipe?.description || '',
                ingredients,
                steps,
                prep_time_mins: Number(recipe.prep_time_mins || recipe.time || recipe.recipe?.prep_time_mins || 25),
                meal_type: recipe.meal_type || recipe.recipe?.meal_type || meal_type || 'dinner',
                trigger_free,
                source,
            })
            .select();

        if (insertError) {
            console.error('Database Insert Error:', insertError);
            throw new Error(`Failed to save recipe to database: ${insertError.message}`);
        }

        const createdRecipe = insertedData?.[0];
        if (!createdRecipe) {
            throw new Error('Recipe was inserted but no data was returned');
        }

        console.log('Successfully saved recipe and returning to client');

        return new Response(JSON.stringify(createdRecipe), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Generate-recipe function error:', error.message);
        return new Response(JSON.stringify({
            error: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

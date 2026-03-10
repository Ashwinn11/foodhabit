// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { condition, calorieGoal, preferences } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    if (!condition || calorieGoal === undefined || calorieGoal === null) {
      throw new Error('Both condition and calorieGoal are required')
    }

    const goal = Number(calorieGoal)
    if (!Number.isFinite(goal) || goal <= 0) {
      throw new Error('calorieGoal must be a positive number')
    }

    const prefString =
      Array.isArray(preferences) && preferences.length > 0
        ? `User preferences: ${preferences.join(', ')}`
        : 'No preferences provided'

    const prompt = `
You are a dietician creating a personalised 7-day meal plan for a user with "${condition}".

DAILY CALORIE GOAL: ${goal} kcal
${prefString}

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "days": [
    {
      "day": 1,
      "meals": [
        {
          "name": "Breakfast",
          "items": ["item1", "item2"],
          "calories": number,
          "notes": "why this meal fits the user"
        },
        {
          "name": "Lunch",
          "items": ["item1", "item2"],
          "calories": number,
          "notes": "why this meal fits the user"
        },
        {
          "name": "Dinner",
          "items": ["item1", "item2"],
          "calories": number,
          "notes": "why this meal fits the user"
        }
      ]
    }
  ],
  "totalCalories": number
}

Rules:
- Provide exactly 7 days (day 1 to day 7)
- Each day must include Breakfast, Lunch, Dinner
- Total calories per day should be close to ${goal}
- Keep meals realistic and simple
`

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid Gemini Response:', JSON.stringify(data));
      throw new Error('Invalid response structure from Gemini API')
    }

    // sentry fix
    if (!data.candidates[0].content.parts || !data.candidates[0].content.parts[0] || !data.candidates[0].content.parts[0].text) {
      console.error('No text content in Gemini Response:', JSON.stringify(data));
      throw new Error('No text content in Gemini API response')
    }

    const textResponse = data.candidates[0].content.parts[0].text
    const jsonStr = textResponse.replace(/```json/g, '').replace(/```/g, '').trim()
    const result = JSON.parse(jsonStr)

    if (!result.days || !Array.isArray(result.days)) {
      throw new Error('Generated plan missing days array')
    }

    const enrichedResult = {
      days: result.days.map((d: any, idx: number) => ({
        day: d.day || (idx + 1),
        meals: Array.isArray(d.meals) ? d.meals.map((m: any) => ({
          name: m.name || 'Meal',
          items: Array.isArray(m.items) ? m.items : [],
          calories: Number.isFinite(Number(m.calories)) ? Number(m.calories) : Math.round(goal / 3),
          notes: m.notes || ''
        })) : []
      })),
      totalCalories: Number.isFinite(Number(result.totalCalories)) ? Number(result.totalCalories) : (goal * 7),
    }

    return new Response(JSON.stringify(enrichedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
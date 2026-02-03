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
    const { food } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    const prompt = `
      Analyze the food item "${food}" for IBS/FODMAP friendliness.
      
      IMPORTANT RULES:
      1. If the input is NOT a real food item (gibberish, random characters, made up words, non-food objects), return EXACTLY: {"error": "not_food"}
      2. Only analyze actual foods, dishes, or ingredients.
      
      For valid foods, return ONLY a raw JSON object (no markdown, no backticks) with this exact schema:
      {
        "level": "high" | "moderate" | "low",
        "categories": string[], (e.g. ["fructans", "lactose", "gos", "polyols", "excess-fructose"])
        "culprits": string[], (specific ingredients causing the issue, e.g. ["onion", "garlic"])
        "alternatives": string[], (3-5 specific low-FODMAP alternatives)
        "normalizedName": string, (correct spelling in lowercase, e.g. "biryani" for "biiryani" or "biriyani")
        "baseIngredients": string[] (main ingredient components, e.g. ["chicken", "biryani", "rice"] for "chicken biryani")
      }
      If the food is safe (low FODMAP), "categories" and "culprits" should be empty arrays.
      The "normalizedName" should be the correctly spelled, standardized name.
      The "baseIngredients" should extract individual components so "mutton biryani" gives ["mutton", "biryani"].
    `

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
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

    const textResponse = data.candidates[0].content.parts[0].text
    // Clean up markdown if Gemini adds it despite instructions
    const jsonStr = textResponse.replace(/```json/g, '').replace(/```/g, '').trim()
    const result = JSON.parse(jsonStr)

    return new Response(JSON.stringify(result), {
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

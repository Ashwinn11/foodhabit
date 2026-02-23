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
    const { food, foods, imageBase64, extractFoodsOnly, userCondition, userSymptoms, userTriggers } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    // VISION MODE: Extract foods from menu image
    if (imageBase64 && extractFoodsOnly) {
      const visionPrompt = `You are analyzing a food menu or meal photograph.

TASK: Extract all distinct food items visible in this image.

Return ONLY valid JSON (no markdown):
{
  "foods": ["food1", "food2", "food3", ...],
  "category": "menu|receipt|photo|unclear"
}

Examples of valid food items: "pasta carbonara", "grilled chicken", "caesar salad"
Ignore: prices, descriptions, instructions, non-food items

If this is not a food menu/meal photo, return:
{
  "foods": [],
  "category": "unclear"
}`

      const imageResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: visionPrompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64
                }
              }
            ]
          }]
        })
      })

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error('Vision API Error:', errorText);
        throw new Error(`Gemini Vision API Error: ${imageResponse.status}`);
      }

      const imageData = await imageResponse.json()
      if (!imageData.candidates || !imageData.candidates[0] || !imageData.candidates[0].content) {
        throw new Error('Invalid response structure from Vision API')
      }

      const textResponse = imageData.candidates[0].content.parts[0].text
      const jsonStr = textResponse.replace(/```json/g, '').replace(/```/g, '').trim()
      const result = JSON.parse(jsonStr)

      return new Response(JSON.stringify({
        foods: result.foods || [],
        category: result.category || 'unclear'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // TEXT MODE: Analyze foods for safety
    const foodList = foods || (food ? [food] : [])

    if (foodList.length === 0) {
      throw new Error('Either foods array, food string, or image is required')
    }

    const contextCondition = userCondition || 'Unknown condition'
    const contextSymptoms = userSymptoms || 'Unknown symptoms'
    const contextTriggers = userTriggers || 'None recorded'

    const prompt = `
      You are an expert gut health dietitian analyzing foods for a user.

      USER CONTEXT:
      =====================
      Condition: ${contextCondition}
      Symptoms they experience: ${contextSymptoms}
      Their known triggers (Foods that cause issues): ${contextTriggers}

      FOODS TO ANALYZE:
      ${foodList.map((f: string) => `- ${f}`).join('\n')}

      =====================
      INSTRUCTIONS:
      1. Analyze EVERY food in the list individually against the user's specific context.
      2. If an input is gibberish or non-food, level is "avoid" and explain it is not a recognizable food.
      3. CRITICAL: Risk Level determination. Evaluate strictly against their CONDITION, SYMPTOMS, and TRIGGERS.
         - "avoid": If it contains any known triggers, or causes their symptoms based on their condition.
         - "caution": If it might cause issues or has moderate amounts of triggers/FODMAPs.
         - "safe": If it is completely safe for their condition, and avoids their symptoms and triggers.
      4. Explanation MUST be 1 single concise sentence referencing their specific context (triggers/condition).
      5. "normalizedName" should be a clean Title Case version of the food name.
      6. If there are 2 or more foods, set "recommendedPick" to the normalizedName of the single best food the user should choose based on their condition, symptoms, and triggers. If all foods are "avoid" level or there is only 1 food, set "recommendedPick" to null.

      Return ONLY valid JSON (no markdown), matching this EXACT precise format:
      {
        "results": [
          {
            "normalizedName": "Clean Title Case Name",
            "level": "safe" | "caution" | "avoid",
            "explanation": "A single sentence explaining specifically why based on their given condition, symptoms, and triggers."
          }
        ],
        "recommendedPick": "Normalised Food Name" | null
      }
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
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json()
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API')
    }

    const textResponse = data.candidates[0].content.parts[0].text
    const jsonStr = textResponse.replace(/```json/g, '').replace(/```/g, '').trim()
    const result = JSON.parse(jsonStr)

    // Validate response structure
    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ results: result.results || [], recommendedPick: result.recommendedPick ?? null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

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
    const { food, imageBase64, extractFoodsOnly, userCondition, personalTriggers, symptomPatterns } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    // VISION MODE: Extract foods from menu image
    if (imageBase64 && extractFoodsOnly) {
      const visionPrompt = `You are analyzing a food menu or meal photograph.

TASK: Extract all food items visible in this image.

Return ONLY valid JSON (no markdown):
{
  "foods": ["food1", "food2", "food3", ...],
  "category": "menu|receipt|photo|unclear"
}

Examples of valid food items: "pasta carbonara", "grilled chicken", "caesar salad", "pizza margherita"
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
        console.error('Invalid Vision Response:', JSON.stringify(imageData));
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

    // TEXT MODE: Analyze food for safety
    if (!food) {
      throw new Error('Either food name or image is required')
    }

    // Build context from user's personal data
    const personalTriggersContext = personalTriggers
      ? personalTriggers
          .map((t: any) => `- ${t.food}: caused ${t.symptoms.join(' + ')} (${t.count}x, appeared ${t.latency} after eating)`)
          .join('\n')
      : 'None recorded yet';

    const symptomPatternsContext = symptomPatterns
      ? symptomPatterns
          .map((p: any) => `- ${p.symptoms.join(' + ')}: appears together ${(p.frequency * 100).toFixed(0)}% of the time`)
          .join('\n')
      : 'None identified yet';

    const prompt = `
      You are analyzing a food for a user with ${userCondition || 'unknown condition'}.

      USER'S PERSONAL DATA:
      =====================
      Condition: ${userCondition || 'Not specified'}

      Foods they've had symptoms after:
      ${personalTriggersContext}

      Their typical symptom patterns:
      ${symptomPatternsContext}

      FOOD TO ANALYZE: "${food}"

      =====================
      INSTRUCTIONS:
      1. If input is gibberish or non-food (e.g., "asdfgh", "iPhone"), return: {"error": "not_food"}
      2. If misspelled food (e.g., "blubberries"), correct it in "normalizedName" as Title Case (e.g., "Blueberry") and proceed
      3. Analyze considering user's CONDITION and PERSONAL HISTORY - this is CRITICAL
      4. Risk Level determination (MOST IMPORTANT):
         - "high": IF food appears in personal triggers OR matches known triggers, OR contains ingredients in their culprit list
         - "moderate": IF food might trigger symptoms based on condition, OR has some concerning ingredients
         - "low": IF food is safe based on their history AND their condition
      5. Trust personal history over general FODMAP rules (if they had symptoms after this food, mark as HIGH risk)

      FOOD SCORE (1-10) - CRITICAL: This score reflects how SAFE/GOOD this food is for THIS USER:

      IF level="high": Score MUST be 1-3 (dangerous for this user)
      IF level="moderate": Score 4-6 (has some risk for this user)
      IF level="low": Score 7-10 (safe for this user)

      This is the ONLY score - it determines if food is healthy for THEM, not generic nutrition.

      Return ONLY valid JSON (no markdown), with field names EXACTLY as specified:
      {
        "level": "high" | "moderate" | "low",
        "categories": ["fructans", "lactose", ...],
        "culprits": ["specific problematic ingredients"],
        "normalizedName": "corrected spelling in Title Case (e.g., 'Garlic', 'Blueberry')",

        "nutrition": {
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number,
          "fiber": number,
          "sugar": number,
          "sodium": number
        },

        "score": 1-10 (how good this is for THIS USER based on their history - see above),

        "explanation": "ONE explanation only (choose the most relevant):
          - IF user has personal history with symptoms: describe their specific history (e.g., 'You ate this 3x and experienced bloating and gas')
          - IF food is a known trigger: explain why (e.g., 'This is a known trigger for you - causes bloating')
          - ELSE: provide personalized explanation based on their condition (e.g., 'This contains garlic which causes gas in IBS')",

        "riskFactors": "Array of reasons why this is high/moderate risk for THIS user (e.g., ['known trigger', 'contains garlic', 'high FODMAP'])"
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

    // Validate response structure
    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Ensure all expected fields are present (with defaults for missing ones)
    const enrichedResult = {
      level: result.level || 'moderate',
      categories: result.categories || [],
      culprits: result.culprits || [],
      normalizedName: result.normalizedName || food.toLowerCase(),
      nutrition: result.nutrition || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0
      },
      score: result.score || result.nutritionScore || 5,
      // Single explanation field - AI chooses most relevant
      explanation: result.explanation || 'Analysis complete',
      // Risk factors for this user - helps understand personalized risk
      riskFactors: result.riskFactors || []
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

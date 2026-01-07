import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simplified Gut Health Analysis from Gemini
interface GutHealthAnalysis {
    food_name: string;
    gut_score: number; // 0-100 calculated by AI
    gut_benefits: string[]; // max 2 short benefits
    gut_warnings: string[]; // max 1 short warning
    estimated_calories: number;
    protein_grams: number;
    carbs_grams: number;
    fat_grams: number;
    fiber_grams: number;
}

interface RecognitionResult {
    success: boolean;
    foods: any[];
    error?: string;
    debug?: any;
}

/**
 * Generate MD5 hash from image buffer for caching
 */
async function hashImageBuffer(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest("MD5", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Analyze food image using Gemini - AI calculates gut score
 * Fast and reliable - AI does the heavy lifting
 */
async function analyzeWithGemini(
    base64Image: string,
    userTriggers: string[] = []
): Promise<GutHealthAnalysis[]> {
    const apiKey = Deno.env.get("GOOGLE_API_KEY");

    if (!apiKey) {
        console.error("⚠️ GOOGLE_API_KEY not configured");
        throw new Error("API key not configured");
    }

    const triggersContext = userTriggers.length > 0
        ? `The user has these personal food triggers/sensitivities: ${userTriggers.join(', ')}. Mention these in warnings.`
        : '';

    const prompt = `You are a gut health nutritionist analyzing this food image.

TASK: Identify 3-5 main food items and analyze their gut health impact.

SCORING GUIDELINES (0-100):
- 90-100: Exceptional for gut health (fermented foods, high-fiber prebiotics, diverse plants)
- 70-89: Good (whole foods, vegetables, clean proteins, whole grains)
- 50-69: Neutral (white rice, dairy, simple meals with minimal fiber)
- 30-49: Caution (added sugars, fried foods, refined flour, inflammatory oils)
- 0-29: Harmful (ultra-processed, high fructose syrup, artificial additives)

${triggersContext}

Return a JSON array with this structure for EACH food:
[
  {
    "food_name": "specific ingredient name",
    "gut_score": 0-100,
    "gut_benefits": ["max 2 short gut health benefits"],
    "gut_warnings": ["max 1 short warning if applicable"],
    "estimated_calories": number,
    "protein_grams": number,
    "carbs_grams": number,
    "fat_grams": number,
    "fiber_grams": number
  }
]

IMPORTANT:
- Be precise with food names (e.g., "Sourdough Bread" not "Bread")
- Score honestly based on gut health impact
- Estimate nutrition for typical serving size
- Return ONLY valid JSON array`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: "image/jpeg",
                                    data: base64Image
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.2, // Lower temperature for more consistent/strict scoring
                    topK: 1,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                    responseMimeType: "application/json"
                }
            })
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", errorText);
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const geminiData = await response.json();
    let textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
        console.error("No response from Gemini");
        console.log("Full response:", JSON.stringify(geminiData, null, 2));
        throw new Error("Empty response from Gemini");
    }

    console.log("📝 Gemini response length:", textResponse.length);

    // Clean up markdown if present
    textResponse = textResponse.trim();
    if (textResponse.startsWith("```json")) {
        textResponse = textResponse.slice(7);
    } else if (textResponse.startsWith("```")) {
        textResponse = textResponse.slice(3);
    }
    if (textResponse.endsWith("```")) {
        textResponse = textResponse.slice(0, -3);
    }
    textResponse = textResponse.trim();

    // Extract JSON array - find first [ and last ]
    const firstBracket = textResponse.indexOf('[');
    const lastBracket = textResponse.lastIndexOf(']');

    if (firstBracket === -1 || lastBracket === -1) {
        console.error("No JSON array found in response");
        console.log("Response:", textResponse.substring(0, 500));
        throw new Error("Invalid JSON response from Gemini");
    }

    const jsonOnly = textResponse.substring(firstBracket, lastBracket + 1);
    console.log("📦 Extracted JSON length:", jsonOnly.length);

    const analysisResults: GutHealthAnalysis[] = JSON.parse(jsonOnly);
    console.log("🧠 Gemini identified", analysisResults.length, "foods");

    return analysisResults;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { imageUrl, base64Image } = await req.json();

        if (!imageUrl && !base64Image) {
            return new Response(
                JSON.stringify({ success: false, error: "Image URL or base64 required" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
        }

        console.log('🔍 Analyzing image with Gemini...');

        let base64Data: string;
        let imageSize = 0;

        // If base64 is provided directly, use it (faster path)
        if (base64Image) {
            console.log('✅ Using direct base64 image (optimized path)');
            base64Data = base64Image;
            imageSize = base64Image.length;
        } else {
            // Legacy path: fetch from URL and convert
            console.log('⚠️ Fetching image from URL (slower path)');
            const imageResponse = await fetch(imageUrl);
            const imageBuffer = await imageResponse.arrayBuffer();
            base64Data = encode(imageBuffer);
            imageSize = base64Data.length;
        }

        // Call Gemini for food identification + gut health analysis
        let foods: any[] = [];

        try {
            const geminiAnalysis = await analyzeWithGemini(base64Data, []);

            // Transform Gemini results to our simplified food format
            foods = geminiAnalysis.map(analysis => ({
                name: analysis.food_name,
                confidence: 0.95,
                category: 'unknown', // not needed anymore
                gut_score: analysis.gut_score, // AI's calculated score
                gut_benefits: analysis.gut_benefits,
                gut_warnings: analysis.gut_warnings,
                // Nutrition fields
                estimated_calories: analysis.estimated_calories,
                protein_grams: analysis.protein_grams,
                carbs_grams: analysis.carbs_grams,
                fat_grams: analysis.fat_grams,
                fiber_grams: analysis.fiber_grams
            }));

            console.log("✅ Successfully analyzed", foods.length, "foods with AI-calculated scores");

        } catch (geminiError) {
            console.error("Gemini analysis failed:", geminiError);
            // Fallback: return empty with error message
            foods = [{
                name: "Unable to analyze",
                confidence: 0,
                category: 'unknown',
                gut_score: 0,
                gut_benefits: [],
                gut_warnings: ['Food analysis temporarily unavailable'],
                estimated_calories: 0,
                protein_grams: 0,
                carbs_grams: 0,
                fat_grams: 0,
                fiber_grams: 0
            }];
        }

        const result: RecognitionResult = {
            success: true,
            foods: foods,
            debug: {
                foodCount: foods.length,
                analysisMethod: 'gemini-2.0-flash',
                imageSize: imageSize,
                base64Header: base64Data.substring(0, 30) + '...'
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(
            JSON.stringify({ success: false, error: errorMessage }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});

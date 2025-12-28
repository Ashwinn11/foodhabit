import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Gut Health Analysis from Gemini
interface GutHealthAnalysis {
    food_name: string;
    gut_health_verdict: 'good' | 'neutral' | 'bad';
    gut_score: number;
    fiber_score: number;
    is_processed: boolean;
    processing_level: 'whole' | 'minimally_processed' | 'processed' | 'ultra_processed';
    plant_count: number;
    is_plant: boolean;
    triggers: string[];
    prebiotic_score: number;
    probiotic_score: number;
    anti_inflammatory: boolean;
    fermentable: boolean;
    gut_benefits: string[];
    gut_warnings: string[];
    why_good_or_bad: string;
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
 * Analyze food image using Gemini 3 Pro
 * Does BOTH identification AND gut health analysis in one call
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
        ? `The user has these personal food triggers/sensitivities: ${userTriggers.join(', ')}. Flag these specifically in warnings.`
        : '';

    const prompt = `You are a gut health nutrition expert. Analyze this food image.

TASK:
1. IDENTIFY all specific food items/ingredients visible (be specific - "Spinach" not "Salad", "Chickpeas" not "Legumes")
2. ANALYZE each for gut health

${triggersContext}

For EACH food item, provide gut health analysis considering:
- Fiber content (prebiotics feed good bacteria)
- Processing level (ultra-processed harms gut microbiome)
- Fermented foods (probiotics)
- Anti-inflammatory properties
- Common gut triggers (FODMAP, gluten, dairy, spicy, nightshades)
- Plant diversity (aim for 30+ different plants per week)

Return a JSON array with this structure for EACH food:
[
  {
    "food_name": "specific ingredient name",
    "gut_health_verdict": "good" | "neutral" | "bad",
    "gut_score": 0-100,
    "fiber_score": 0-10,
    "is_processed": boolean,
    "processing_level": "whole" | "minimally_processed" | "processed" | "ultra_processed",
    "plant_count": 1,
    "is_plant": boolean,
    "triggers": ["array of triggers like gluten, dairy, fodmap"],
    "prebiotic_score": 0-10,
    "probiotic_score": 0-10,
    "anti_inflammatory": boolean,
    "fermentable": boolean,
    "gut_benefits": ["max 2 short benefits"],
    "gut_warnings": ["max 1 short warning if any"],
    "why_good_or_bad": "One short sentence"
  }
]

IMPORTANT: Identify 3-5 main ingredients. Keep responses concise.
Return ONLY valid JSON array.`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${apiKey}`,
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
                    temperature: 0.1,
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

    const analysisResults: GutHealthAnalysis[] = JSON.parse(textResponse);
    console.log("🧠 Gemini identified", analysisResults.length, "foods");

    return analysisResults;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { imageUrl } = await req.json();

        if (!imageUrl) {
            return new Response(
                JSON.stringify({ success: false, error: "Image URL required" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
        }

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch image and generate hash for caching
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const imageHash = await hashImageBuffer(imageBuffer);

        // Check cache first
        const { data: cachedResult } = await supabase
            .from('vision_cache')
            .select('result')
            .eq('image_hash', imageHash)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();

        if (cachedResult) {
            console.log('✅ Cache hit for hash:', imageHash);
            return new Response(JSON.stringify(cachedResult.result), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log('🔍 Cache miss - calling Gemini for hash:', imageHash);

        // Convert image to base64
        const base64Image = encode(imageBuffer);

        // Call Gemini for food identification + gut health analysis
        let foods: any[] = [];

        try {
            const geminiAnalysis = await analyzeWithGemini(base64Image, []);

            // Transform Gemini results to our food format
            foods = geminiAnalysis.map(analysis => ({
                name: analysis.food_name,
                confidence: 0.95,
                category: analysis.is_plant ? 'plant' : (analysis.is_processed ? 'processed' : 'protein'),
                fiber_score: analysis.fiber_score,
                trigger_risk: analysis.triggers.length > 0 ? 3 : 1,
                is_plant: analysis.is_plant,
                common_triggers: analysis.triggers,
                gut_benefits: analysis.gut_benefits,
                gut_warnings: analysis.gut_warnings,
                prebiotic_score: analysis.prebiotic_score,
                probiotic_score: analysis.probiotic_score,
                anti_inflammatory: analysis.anti_inflammatory,
                fermentable: analysis.fermentable,
                processing_level: analysis.processing_level,
                gut_health_verdict: analysis.gut_health_verdict,
                why_gut_healthy: analysis.why_good_or_bad
            }));

            console.log("✅ Successfully analyzed", foods.length, "foods");

        } catch (geminiError) {
            console.error("Gemini analysis failed:", geminiError);
            // Fallback: return empty with error message
            foods = [{
                name: "Unable to analyze",
                confidence: 0,
                category: 'unknown',
                fiber_score: 0,
                is_plant: false,
                gut_benefits: [],
                gut_warnings: ['Food analysis temporarily unavailable']
            }];
        }

        const result: RecognitionResult = {
            success: true,
            foods: foods,
            debug: {
                imageHash: imageHash,
                foodCount: foods.length,
                analysisMethod: 'gemini-3-pro-preview'
            }
        };

        // Cache the result
        try {
            await supabase
                .from('vision_cache')
                .upsert({
                    image_hash: imageHash,
                    result: result,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                }, {
                    onConflict: 'image_hash'
                });
            console.log('💾 Cached result for hash:', imageHash);
        } catch (cacheError) {
            console.error('Cache error:', cacheError);
        }

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

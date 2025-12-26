import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FoodLabel {
    name: string;
    confidence: number;
}

interface RecognitionResult {
    success: boolean;
    foods: FoodLabel[];
    error?: string;
}

serve(async (req) => {
    // Handle CORS preflight
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

        // Get Google Vision API key from environment
        const apiKey = Deno.env.get("GOOGLE_VISION_API_KEY");
        if (!apiKey) {
            throw new Error("Google Vision API key not configured");
        }

        // Download image and convert to base64
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = encode(new Uint8Array(imageBuffer));

        // Call Google Vision API
        const visionResponse = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requests: [
                        {
                            image: { content: base64Image },
                            features: [
                                { type: "LABEL_DETECTION", maxResults: 10 },
                                { type: "WEB_DETECTION", maxResults: 5 },
                                { type: "SAFE_SEARCH_DETECTION" }, // Added to ensure we get SOMETHING
                            ],
                        },
                    ],
                }),
            }
        );

        if (!visionResponse.ok) {
            const text = await visionResponse.text();
            throw new Error(`Vision API error (${visionResponse.status}): ${text}`);
        }

        const visionData = await visionResponse.json();
        const annotations = visionData.responses?.[0] || {};

        // Extract food-related labels
        const labels = annotations.labelAnnotations || [];
        const webEntities = annotations.webDetection?.webEntities || [];

        // Combine and filter for food items
        const foodKeywords = [
            "food", "dish", "meal", "cuisine", "ingredient", "vegetable", "fruit",
            "meat", "protein", "grain", "dairy", "snack", "breakfast", "lunch", "dinner"
        ];

        const allLabels = [
            ...labels.map((l: any) => ({ name: l.description, confidence: l.score })),
            ...webEntities.map((e: any) => ({ name: e.description, confidence: e.score || 0.5 })),
        ];

        // Filter for likely food items
        const foodLabels = allLabels
            .filter((label: FoodLabel) => {
                const lowerName = label.name.toLowerCase();
                return (
                    foodKeywords.some(keyword => lowerName.includes(keyword)) ||
                    label.confidence > 0.8
                );
            })
            .sort((a: FoodLabel, b: FoodLabel) => b.confidence - a.confidence)
            .slice(0, 5); // Top 5 results

        // Match to food database
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const matchedFoods = [];
        for (const label of foodLabels) {
            const { data } = await supabase
                .from("food_database")
                .select("*")
                .ilike("name", `%${label.name}%`)
                .limit(1)
                .single();

            if (data) {
                matchedFoods.push({
                    ...data,
                    confidence: label.confidence,
                });
            } else {
                matchedFoods.push({
                    name: label.name,
                    confidence: label.confidence,
                    category: "unknown",
                    fiber_score: 0,
                    trigger_risk: 5,
                    is_plant: false,
                    common_triggers: [],
                });
            }
        }

        const result: RecognitionResult = {
            success: true,
            foods: matchedFoods,
            // @ts-ignore
            debug: {
                imageSize: imageBuffer.byteLength,
                base64Header: base64Image.substring(0, 50), // Check file signature
                allLabels: allLabels.map(l => ({ name: l.name, confidence: l.confidence })),
                rawVisionResponse: annotations
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            }
        );
    }
});

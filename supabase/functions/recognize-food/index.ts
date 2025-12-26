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
    foods: any[];
    error?: string;
    debug?: any;
}

// Hierarchy: if Key (Specific) is found, remove Values (Generic)
const HIERARCHY: Record<string, string[]> = {
    "biryani": ["rice", "spiced rice", "white rice", "fried rice", "pilaf", "dish"],
    "burger": ["bread", "sandwich", "beef", "meat", "fast food"],
    "pizza": ["bread", "cheese", "tomato", "fast food"],
    "salad": ["vegetable", "leaf vegetable", "produce", "ingredient", "dish"],
    "pasta": ["noodle", "dish"],
    "steak": ["meat", "beef", "dish"],
    "chicken": ["meat", "poultry", "bird", "dish"],
    "salmon": ["fish", "seafood", "dish"],
    "sushi": ["fish", "seafood", "rice", "dish"],
    "taco": ["tortilla", "fast food", "dish"],
    "soup": ["liquid", "dish"],
};

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

        const apiKey = Deno.env.get("GOOGLE_VISION_API_KEY");
        if (!apiKey) {
            throw new Error("Google Vision API key not configured");
        }

        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = encode(imageBuffer);

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
                                { type: "LABEL_DETECTION", maxResults: 20 },
                                { type: "WEB_DETECTION", maxResults: 10 },
                                { type: "SAFE_SEARCH_DETECTION" },
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
        const labels = annotations.labelAnnotations || [];
        const webEntities = annotations.webDetection?.webEntities || [];

        // 1. Combine all raw labels
        const allLabels: FoodLabel[] = [
            ...labels.map((l: any) => ({ name: l.description, confidence: l.score })),
            ...webEntities.map((e: any) => ({ name: e.description, confidence: e.score || 0.5 })),
        ];

        // 2. Initial Strict Filter
        const excludedTerms = [
            'food', 'tableware', 'ingredient', 'recipe', 'cuisine', 'dish', 'meal',
            'cooking', 'produce', 'vegetable', 'dishware', 'serveware', 'cutlery',
            'plate', 'bowl', 'fork', 'spoon', 'knife', 'platter', 'delicacy',
            'comfort food', 'staple food', 'superfood', 'whole food', 'natural foods',
            'local food', 'vegan nutrition', 'vegetarian food', 'garnish', 'supper', 'lunch', 'dinner',
            'laotian cuisine', 'thai cuisine', 'indian cuisine', 'chinese cuisine',
            'iranian cuisine', 'sri lankan cuisine', 'asian food', 'street food'
        ];

        let candidates = allLabels.filter(label => {
            const name = label.name.toLowerCase();
            if (excludedTerms.includes(name)) return false;
            // Remove "Cuisine" suffix
            if (name.includes(' cuisine')) return false;
            // Remove generic "Food" suffix (e.g. "Asian food")
            if (name.endsWith(' food') && name !== 'fast food') return false;

            return label.confidence > 0.60;
        });

        // 3. Smart Deduplication (Hierarchy & Redundancy)
        candidates.sort((a, b) => b.confidence - a.confidence);

        const toRemove = new Set<string>();

        // Check against hierarchy
        candidates.forEach(winner => {
            const winnerName = winner.name.toLowerCase();

            // Apply hierarchy rules (e.g. if Biryani, remove Rice)
            Object.entries(HIERARCHY).forEach(([parent, children]) => {
                if (winnerName.includes(parent)) {
                    children.forEach(child => toRemove.add(child));
                }
            });

            // Also logic: If we have "Hyderabadi Biryani", remove generic "Biryani"
            candidates.forEach(other => {
                if (winner === other) return;
                const otherName = other.name.toLowerCase();

                if (winnerName.includes(otherName) && winnerName !== otherName) {
                    toRemove.add(otherName);
                }
            });
        });

        const uniqueFoods: FoodLabel[] = [];
        const seenNames = new Set<string>();

        for (const candidate of candidates) {
            const lower = candidate.name.toLowerCase();

            // Skip if marked for removal
            if (toRemove.has(lower)) continue;

            // Skip if duplicate
            if (seenNames.has(lower)) continue;

            uniqueFoods.push(candidate);
            seenNames.add(lower);
        }

        // 4. Match to Supabase Database
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get top 5 unique foods
        const topFoods = uniqueFoods.slice(0, 5);
        const finalFoods = [];

        for (const food of topFoods) {
            // Try to find exact or partial match in DB
            const { data: exactMatch } = await supabase
                .from('food_database')
                .select('*')
                .ilike('name', food.name)
                .maybeSingle();

            if (exactMatch) {
                finalFoods.push({ ...exactMatch, confidence: food.confidence });
                continue;
            }

            // Try fuzzy match / contains
            const { data: fuzzyMatch } = await supabase
                .from('food_database')
                .select('*')
                .ilike('name', `%${food.name}%`)
                .limit(1)
                .maybeSingle();

            if (fuzzyMatch) {
                finalFoods.push({ ...fuzzyMatch, name: food.name, confidence: food.confidence }); // Keep original detected name? Or use DB name? Using original name for now to match user expectation
                continue;
            }

            // Defaults if not found in DB
            finalFoods.push({
                name: food.name,
                confidence: food.confidence,
                category: 'unknown',
                fiber_score: 5, // Default for unknown - neutral
                trigger_risk: 1,
                is_plant: true, // Optimistic default
                common_triggers: []
            });
        }

        const result: RecognitionResult = {
            success: true,
            foods: finalFoods,
            debug: {
                allLabels: allLabels.map(l => l.name)
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

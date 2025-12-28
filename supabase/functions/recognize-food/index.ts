import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FoodLabel {
    name: string;
    confidence: number;
    isWebEntity?: boolean;
    specificityScore?: number;
    combinedScore?: number;
}

// Gut Health Analysis from Gemini
interface GutHealthAnalysis {
    food_name: string;
    gut_health_verdict: 'good' | 'neutral' | 'bad';
    gut_score: number; // 0-100
    fiber_score: number; // 0-10
    is_processed: boolean;
    processing_level: 'whole' | 'minimally_processed' | 'processed' | 'ultra_processed';
    plant_count: number;
    is_plant: boolean;
    triggers: string[];
    prebiotic_score: number; // 0-10
    probiotic_score: number; // 0-10
    anti_inflammatory: boolean;
    fermentable: boolean;
    gut_benefits: string[];
    gut_warnings: string[];
    why_good_or_bad: string; // Simple explanation
}

interface RecognitionResult {
    success: boolean;
    foods: any[];
    error?: string;
    debug?: any;
}

// Specificity scoring: Higher = more specific/preferred
const SPECIFICITY_SCORES: Record<string, number> = {
    // Very specific dishes (15 points)
    'chicken biryani': 15, 'hyderabadi biryani': 15, 'veg biryani': 15,
    'caesar salad': 15, 'greek salad': 15, 'cobb salad': 15,
    'butter chicken': 15, 'tandoori chicken': 15, 'grilled chicken': 12,
    'pad thai': 15, 'pho': 15, 'ramen': 15,

    // Specific foods (10-12 points)
    'biryani': 10, 'dosa': 12, 'idli': 12, 'sambar': 12,
    'paneer tikka': 12, 'dal': 10, 'naan': 10,
    'burger': 10, 'pizza': 10, 'pasta': 10, 'sushi': 12,
    'omelette': 10, 'pancakes': 10, 'smoothie bowl': 12,

    // Moderately specific (6-9 points)
    'salad': 6, 'soup': 7, 'curry': 8, 'stir fry': 8,
    'fried rice': 8, 'noodles': 7, 'sandwich': 7,
    'chicken': 6, 'salmon': 8, 'shrimp': 8, 'tofu': 7,

    // Generic ingredients (3-5 points)
    'rice': 3, 'bread': 3, 'cheese': 4, 'egg': 4,
    'broccoli': 5, 'spinach': 5, 'tomato': 4, 'potato': 4,

    // Very generic (1-2 points) - avoid these
    'vegetable': 2, 'meat': 2, 'grain': 2, 'protein': 2,
    'food': 1, 'dish': 1, 'meal': 1, 'ingredient': 1,
};

/**
 * Get specificity score for a food name
 */
function getSpecificityScore(name: string): number {
    const lower = name.toLowerCase();

    // Exact match
    if (SPECIFICITY_SCORES[lower]) return SPECIFICITY_SCORES[lower];

    // Partial match - find best match
    let maxScore = 5; // default for unknown
    for (const [key, score] of Object.entries(SPECIFICITY_SCORES)) {
        if (lower.includes(key) && score > maxScore) {
            maxScore = score;
        }
    }

    return maxScore;
}

/**
 * Calculate combined score for ranking foods
 */
function getCombinedScore(food: FoodLabel): number {
    const confidenceScore = food.confidence * 70; // 0-70 points
    const specificityScore = getSpecificityScore(food.name) * 2; // 0-30 points (15 max * 2)
    const webEntityBonus = food.isWebEntity ? 15 : 0; // +15 for web entities (more accurate)

    return confidenceScore + specificityScore + webEntityBonus;
}

/**
 * Generate MD5 hash from image buffer
 */
async function hashImageBuffer(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest("MD5", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

/**
 * Analyze gut health using Gemini 3.0 Pro
 * Primary goal: Determine if food is healthy for gut or not
 */
async function analyzeGutHealthWithGemini(
    foodNames: string[],
    base64Image: string,
    userTriggers: string[] = []
): Promise<GutHealthAnalysis[]> {
    const geminiApiKey = Deno.env.get("GOOGLE_API_KEY");

    if (!geminiApiKey) {
        console.log("⚠️ Google API key not configured (for Gemini), using fallback analysis");
        return [];
    }

    const triggersContext = userTriggers.length > 0
        ? `The user has these personal food triggers/sensitivities: ${userTriggers.join(', ')}. Consider these when analyzing.`
        : '';

    const prompt = `You are a gut health nutrition expert. Analyze these foods and determine if they are HEALTHY FOR GUT or NOT.

Foods detected in the image: ${foodNames.join(', ')}

${triggersContext}

For EACH food, provide a JSON analysis focused on GUT HEALTH. The primary question is: "Is this food good or bad for gut health?"

Consider these factors:
1. Fiber content (prebiotics feed good bacteria)
2. Processing level (ultra-processed foods harm gut microbiome)
3. Fermented foods (contain probiotics)
4. Anti-inflammatory properties
5. Common gut triggers (FODMAP, gluten, dairy, spicy)
6. Plant diversity (more plants = healthier gut)

Return a JSON array with this exact structure for each food:
[
  {
    "food_name": "string",
    "gut_health_verdict": "good" | "neutral" | "bad",
    "gut_score": 0-100,
    "fiber_score": 0-10,
    "is_processed": boolean,
    "processing_level": "whole" | "minimally_processed" | "processed" | "ultra_processed",
    "plant_count": number,
    "is_plant": boolean,
    "triggers": ["array of trigger ingredients like gluten, dairy, fodmap, spicy"],
    "prebiotic_score": 0-10,
    "probiotic_score": 0-10,
    "anti_inflammatory": boolean,
    "fermentable": boolean,
    "gut_benefits": ["array of benefits for gut health"],
    "gut_warnings": ["array of potential gut concerns"],
    "why_good_or_bad": "One sentence explaining why this is good/neutral/bad for gut"
  }
]

Only return valid JSON array, no other text.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-pro:generateContent?key=${geminiApiKey}`,
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
                        maxOutputTokens: 2048,
                        responseMimeType: "application/json"
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API error:", errorText);
            return [];
        }

        const geminiData = await response.json();
        const textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            console.error("No text response from Gemini");
            return [];
        }

        // Parse JSON response
        const analysisResults: GutHealthAnalysis[] = JSON.parse(textResponse);
        console.log("🧠 Gemini gut health analysis:", JSON.stringify(analysisResults, null, 2));

        return analysisResults;
    } catch (error) {
        console.error("Gemini analysis error:", error);
        return [];
    }
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

        const apiKey = Deno.env.get("GOOGLE_API_KEY");
        if (!apiKey) {
            throw new Error("Google API key not configured");
        }

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch image and generate hash
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
            console.log('✅ Cache hit for image hash:', imageHash);
            return new Response(JSON.stringify(cachedResult.result), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log('🔍 Cache miss - calling Vision API for hash:', imageHash);

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
                                { type: "OBJECT_LOCALIZATION", maxResults: 10 }, // Added for better detection
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
        const localizedObjects = annotations.localizedObjectAnnotations || [];

        // 1. Combine all raw labels - PRIORITIZE web entities (more specific)
        const allLabels: FoodLabel[] = [
            // Web entities first (usually more specific like "Chicken Biryani")
            ...webEntities.map((e: any) => ({
                name: e.description,
                confidence: e.score ? e.score * 1.1 : 0.6, // Boost web entities slightly
                isWebEntity: true
            })),
            // Then regular labels
            ...labels.map((l: any) => ({
                name: l.description,
                confidence: l.score,
                isWebEntity: false
            })),
        ];

        // 2. Initial Strict Filter - Remove all non-food labels
        const excludedTerms = [
            // Generic food terms
            'food', 'ingredient', 'recipe', 'cuisine', 'dish', 'meal',
            'cooking', 'produce', 'vegetable', 'delicacy',
            'comfort food', 'staple food', 'superfood', 'whole food', 'natural foods',
            'local food', 'vegan nutrition', 'vegetarian food', 'garnish',

            // Meal times
            'supper', 'lunch', 'dinner', 'breakfast', 'brunch',

            // Cuisine types
            'laotian cuisine', 'thai cuisine', 'indian cuisine', 'chinese cuisine',
            'iranian cuisine', 'sri lankan cuisine', 'asian food', 'street food',

            // Tableware & utensils (not food!)
            'tableware', 'dishware', 'serveware', 'cutlery',
            'plate', 'bowl', 'fork', 'spoon', 'knife', 'platter', 'cup', 'glass',
            'kitchen utensil', 'utensil', 'chopsticks', 'napkin', 'tablecloth',

            // Restaurant/dining context (not food!)
            'menu', 'restaurant', 'restaurant design', 'dining', 'table',

            // Image/design metadata (not food!)
            'image', 'graphics', 'art', 'design', 'photography', 'photo'
        ];

        let candidates = allLabels.filter(label => {
            const name = label.name.toLowerCase();
            if (excludedTerms.includes(name)) return false;
            // Remove "Cuisine" suffix
            if (name.includes(' cuisine')) return false;
            // Remove generic "Food" suffix (e.g. "Asian food")
            if (name.endsWith(' food') && name !== 'fast food') return false;

            // Higher threshold for better accuracy (was 0.60)
            return label.confidence > 0.75;
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

            // Calculate combined score for ranking
            candidate.specificityScore = getSpecificityScore(candidate.name);
            candidate.combinedScore = getCombinedScore(candidate);

            uniqueFoods.push(candidate);
            seenNames.add(lower);
        }

        // 4. Match to Supabase Database
        // Get top 3 unique foods using combined score (confidence + specificity + web entity bonus)
        const topFoods = uniqueFoods
            .sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0))
            .slice(0, 3);
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
                finalFoods.push({ ...fuzzyMatch, name: food.name, confidence: food.confidence });
                continue;
            }

            // Try matching individual words (e.g., "Spinach salad" → "Spinach")
            const words = food.name.split(' ').filter(w => w.length > 3); // Skip short words like "and", "or"
            let wordMatch = null;
            for (const word of words) {
                const { data } = await supabase
                    .from('food_database')
                    .select('*')
                    .ilike('name', word)
                    .limit(1)
                    .maybeSingle();

                if (data) {
                    wordMatch = data;
                    break;
                }
            }

            if (wordMatch) {
                finalFoods.push({ ...wordMatch, name: food.name, confidence: food.confidence });
                continue;
            }

            // If no DB match, we add it to the list to be analyzed by Gemini
            finalFoods.push({ name: food.name, confidence: food.confidence, needsAnalysis: true });
        }

        // --- GEMINI INTEGRATION START ---
        // Extract names of foods that need detailed analysis (or all foods to double check)
        // We will analyze ALL top detected foods to get the specific gut scores
        const foodNamesToAnalyze = finalFoods.map(f => f.name);

        let enhancedFoods = [...finalFoods];

        if (foodNamesToAnalyze.length > 0) {
            console.log("🧠 Calling Gemini 3.0 Pro for gut health analysis on:", foodNamesToAnalyze);

            // Call Gemini
            const geminiAnalysis = await analyzeGutHealthWithGemini(foodNamesToAnalyze, base64Image, []);

            // Merge Gemini results back into our food objects
            enhancedFoods = finalFoods.map(food => {
                const analysis = geminiAnalysis.find(a =>
                    a.food_name.toLowerCase().includes(food.name.toLowerCase()) ||
                    food.name.toLowerCase().includes(a.food_name.toLowerCase())
                );

                if (analysis) {
                    return {
                        ...food,
                        category: analysis.is_plant ? 'plant' : (analysis.is_processed ? 'processed' : 'protein'), // Simplified fallback
                        fiber_score: analysis.fiber_score,
                        trigger_risk: analysis.triggers.length > 0 ? 3 : 1, // Simplified risk
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
                    };
                }

                // Fallback for items that Gemini missed (keep existing DB data if available)
                if (food.fiber_score !== undefined) return food;

                // Absolute fallback default if neither DB nor Gemini worked
                return {
                    ...food,
                    category: 'unknown',
                    fiber_score: 0,
                    gut_benefits: [],
                    gut_warnings: ['Could not analyze detailed nutrition']
                };
            });
        }
        // --- GEMINI INTEGRATION END ---

        const result: RecognitionResult = {
            success: true,
            foods: enhancedFoods,
            debug: {
                allLabels: allLabels.map(l => l.name),
                imageHash: imageHash,
                topFoodsScores: topFoods.map(f => ({
                    name: f.name,
                    confidence: f.confidence,
                    specificity: f.specificityScore,
                    combined: f.combinedScore,
                    isWebEntity: f.isWebEntity
                }))
            }
        };

        // Store result in cache for future requests
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
            console.error('Failed to cache result:', cacheError);
            // Continue anyway - caching is not critical
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

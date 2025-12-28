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

            // Smart categorization for unknown foods based on name
            const foodNameLower = food.name.toLowerCase();

            // Categorize based on keywords
            let category = 'unknown';
            let fiber_score = 3;
            let is_plant = true;
            let gut_benefits: string[] = [];
            let prebiotic_score = 2;
            let anti_inflammatory = false;

            // Vegetables & Salads
            if (foodNameLower.includes('vegetable') || foodNameLower.includes('salad') ||
                foodNameLower.includes('greens') || foodNameLower.includes('lettuce') ||
                foodNameLower.includes('spinach') || foodNameLower.includes('kale') ||
                foodNameLower.includes('broccoli') || foodNameLower.includes('carrot')) {
                category = 'vegetable';
                fiber_score = 6;
                gut_benefits = ['Good source of fiber', 'Rich in vitamins and minerals', 'Supports digestive health'];
                prebiotic_score = 5;
                anti_inflammatory = true;
            }
            // Fruits
            else if (foodNameLower.includes('fruit') || foodNameLower.includes('berry') ||
                foodNameLower.includes('apple') || foodNameLower.includes('banana') ||
                foodNameLower.includes('orange') || foodNameLower.includes('lemon') ||
                foodNameLower.includes('mango') || foodNameLower.includes('grape')) {
                category = 'fruit';
                fiber_score = 5;
                gut_benefits = ['Natural fiber source', 'Contains antioxidants', 'Supports gut health'];
                prebiotic_score = 4;
                anti_inflammatory = true;
            }
            // Grains & Rice
            else if (foodNameLower.includes('rice') || foodNameLower.includes('grain') ||
                foodNameLower.includes('wheat') || foodNameLower.includes('bread') ||
                foodNameLower.includes('roti') || foodNameLower.includes('naan') ||
                foodNameLower.includes('pasta') || foodNameLower.includes('quinoa')) {
                category = 'grain';
                fiber_score = 4;
                gut_benefits = ['Provides energy', 'Contains fiber'];
                prebiotic_score = 3;
            }
            // Protein (meat, fish, eggs)
            else if (foodNameLower.includes('chicken') || foodNameLower.includes('meat') ||
                foodNameLower.includes('fish') || foodNameLower.includes('egg') ||
                foodNameLower.includes('mutton') || foodNameLower.includes('beef') ||
                foodNameLower.includes('pork') || foodNameLower.includes('seafood')) {
                category = 'protein';
                fiber_score = 0;
                is_plant = false;
                gut_benefits = ['Protein source', 'Supports gut lining repair'];
                prebiotic_score = 0;
            }
            // Legumes & Beans
            else if (foodNameLower.includes('bean') || foodNameLower.includes('lentil') ||
                foodNameLower.includes('dal') || foodNameLower.includes('chickpea') ||
                foodNameLower.includes('legume')) {
                category = 'legume';
                fiber_score = 8;
                gut_benefits = ['High protein', 'Excellent fiber', 'Prebiotic content'];
                prebiotic_score = 7;
            }
            // Dairy
            else if (foodNameLower.includes('milk') || foodNameLower.includes('cheese') ||
                foodNameLower.includes('yogurt') || foodNameLower.includes('paneer') ||
                foodNameLower.includes('curd') || foodNameLower.includes('dairy')) {
                category = 'dairy';
                fiber_score = 0;
                is_plant = false;
                gut_benefits = ['Protein source', 'May contain probiotics'];
                prebiotic_score = 0;
            }
            // Processed/Fried Foods
            else if (foodNameLower.includes('fried') || foodNameLower.includes('fast food') ||
                foodNameLower.includes('pizza') || foodNameLower.includes('burger') ||
                foodNameLower.includes('chips') || foodNameLower.includes('fries')) {
                category = 'processed';
                fiber_score = 1;
                is_plant = false;
                gut_benefits = [];
                prebiotic_score = 0;
            }

            finalFoods.push({
                name: food.name,
                confidence: food.confidence,
                category: category,
                fiber_score: fiber_score,
                trigger_risk: 1,
                is_plant: is_plant,
                common_triggers: [],
                gut_benefits: gut_benefits,
                gut_warnings: [],
                prebiotic_score: prebiotic_score,
                probiotic_score: 0,
                anti_inflammatory: anti_inflammatory,
                fermentable: false
            });
        }

        const result: RecognitionResult = {
            success: true,
            foods: finalFoods,
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

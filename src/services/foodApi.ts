/**
 * USDA FoodData Central API Integration
 * Free API for food search and nutrition data
 * API Key: Sign up at https://fdc.nal.usda.gov/api-key-signup.html
 */

const USDA_API_KEY = 'h4sO8eAvjK6hIdXvztcONjTQVakxJmw4xIGKomv4'; // Replace with your API key
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export interface USDAFood {
    fdcId: number;
    description: string;
    dataType: string;
    brandOwner?: string;
    ingredients?: string;
    foodCategory?: string;
}

export interface USDASearchResult {
    foods: USDAFood[];
    totalHits: number;
    currentPage: number;
    totalPages: number;
}

/**
 * Search for foods using USDA FoodData Central API
 * Rate limit: 1000 requests/hour with DEMO_KEY
 */
export const searchUSDAFoods = async (query: string, pageSize = 10): Promise<USDAFood[]> => {
    try {
        if (!query || query.length < 2) {
            return [];
        }

        const url = `${USDA_BASE_URL}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=${pageSize}&dataType=Survey (FNDDS)&dataType=Branded`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error('USDA API error:', response.status);
            return [];
        }

        const data: USDASearchResult = await response.json();
        return data.foods || [];
    } catch (error) {
        console.error('Error fetching USDA foods:', error);
        return [];
    }
};

/**
 * Get detailed food information by FDC ID
 */
export const getUSDAFoodDetails = async (fdcId: number) => {
    try {
        const url = `${USDA_BASE_URL}/food/${fdcId}?api_key=${USDA_API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error('USDA API error:', response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching USDA food details:', error);
        return null;
    }
};

/**
 * Normalize USDA food name to match our local database format
 */
export const normalizeUSDAFoodName = (usdaFood: USDAFood): string => {
    let name = usdaFood.description.toLowerCase();

    // Remove brand names and extra info
    name = name.split(',')[0]; // Take first part before comma
    name = name.replace(/\(.*?\)/g, ''); // Remove parentheses content
    name = name.trim();

    return name;
};

/**
 * Categorize USDA food based on description and category
 */
export const categorizeUSDAFood = (usdaFood: USDAFood): string[] => {
    const categories: string[] = [];
    const desc = usdaFood.description.toLowerCase();
    const category = usdaFood.foodCategory?.toLowerCase() || '';

    // Dairy
    if (desc.includes('milk') || desc.includes('cheese') || desc.includes('yogurt') ||
        desc.includes('cream') || category.includes('dairy')) {
        categories.push('dairy');
        categories.push('fodmap_lactose');
    }

    // Gluten
    if (desc.includes('bread') || desc.includes('pasta') || desc.includes('wheat') ||
        desc.includes('cereal') || desc.includes('pizza')) {
        categories.push('gluten');
        categories.push('fodmap_fructans');
    }

    // Caffeine
    if (desc.includes('coffee') || desc.includes('tea') || desc.includes('chocolate')) {
        categories.push('caffeine');
    }

    // Alcohol
    if (desc.includes('beer') || desc.includes('wine') || desc.includes('alcohol')) {
        categories.push('alcohol');
    }

    // Fruits (FODMAP)
    if (desc.includes('apple') || desc.includes('mango') || desc.includes('watermelon')) {
        categories.push('fodmap_fructose');
    }

    // Vegetables (FODMAP)
    if (desc.includes('onion') || desc.includes('garlic') || desc.includes('bean')) {
        categories.push('fodmap_fructans');
    }

    // Processed
    if (desc.includes('frozen') || desc.includes('canned') || desc.includes('packaged') ||
        usdaFood.brandOwner) {
        categories.push('processed');
    }

    // Fatty
    if (desc.includes('fried') || desc.includes('butter') || desc.includes('oil') ||
        desc.includes('fatty')) {
        categories.push('fatty');
    }

    return categories;
};

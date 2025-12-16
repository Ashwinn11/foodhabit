/**
 * Comprehensive Food Database for Gut Health Tracking
 * Based on FODMAP research and common IBS triggers
 */

import { theme } from '../theme';

// Helper to get color from theme palette (rotating through 4 colors)
const FOOD_COLORS = [
    theme.colors.brand.primary,    // Coral
    theme.colors.brand.secondary,  // Pastel Green
    theme.colors.brand.tertiary,   // Purple
    theme.colors.brand.cream,      // Cream
];

const getFoodColor = (index: number): string => {
    return FOOD_COLORS[index % FOOD_COLORS.length];
};

export interface FoodItem {
    name: string;
    categories: string[];
    common_names: string[];
    digestion_time: {
        min_hours: number;
        max_hours: number;
    };
    icon: string; // Ionicons name
    icon_color?: string; // Optional custom color
    is_trigger_common: boolean;
}

export const FOOD_CATEGORIES = {
    // FODMAP Categories (Primary IBS triggers)
    fodmap_fructans: {
        name: "High FODMAP - Fructans",
        description: "Fermentable carbohydrates that cause gas and bloating",
        color: getFoodColor(0), // Coral
    },
    fodmap_lactose: {
        name: "High FODMAP - Lactose",
        description: "Dairy sugars that many people can't digest",
        color: getFoodColor(1), // Pastel Green
    },
    fodmap_fructose: {
        name: "High FODMAP - Fructose",
        description: "Fruit sugars that can cause issues in excess",
        color: getFoodColor(3), // Cream
    },
    fodmap_polyols: {
        name: "High FODMAP - Sugar Alcohols",
        description: "Artificial sweeteners and some fruits",
        color: getFoodColor(2), // Purple
    },

    // Major Food Groups
    dairy: {
        name: "Dairy",
        description: "Milk and milk products",
        color: getFoodColor(1), // Pastel Green
    },
    gluten: {
        name: "Gluten",
        description: "Wheat, barley, rye proteins",
        color: getFoodColor(0), // Coral
    },
    caffeine: {
        name: "Caffeine",
        description: "Stimulants that affect gut motility",
        color: getFoodColor(2), // Purple
    },
    alcohol: {
        name: "Alcohol",
        description: "Gut irritants",
        color: getFoodColor(0), // Coral
    },
    spicy: {
        name: "Spicy Foods",
        description: "Can irritate digestive tract",
        color: getFoodColor(0), // Coral
    },
    fatty: {
        name: "High Fat",
        description: "Slow digestion, can trigger symptoms",
        color: getFoodColor(3), // Cream
    },
    processed: {
        name: "Processed Foods",
        description: "Additives and preservatives",
        color: getFoodColor(2), // Purple
    },

    // Beneficial Categories
    soluble_fiber: {
        name: "Soluble Fiber",
        description: "Helps regulate digestion",
        color: getFoodColor(1), // Pastel Green
    },
    probiotics: {
        name: "Probiotics",
        description: "Good bacteria for gut health",
        color: getFoodColor(1), // Pastel Green
    },
    lean_protein: {
        name: "Lean Protein",
        description: "Easy to digest proteins",
        color: getFoodColor(1), // Pastel Green
    },
};

export const FOOD_DATABASE: Record<string, FoodItem> = {
    // DAIRY PRODUCTS
    "milk": {
        name: "Milk",
        categories: ["dairy", "fodmap_lactose"],
        common_names: ["milk", "whole milk", "2% milk", "skim milk", "low fat milk"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "water-outline",
        icon_color: getFoodColor(0), // Coral
        is_trigger_common: true,
    },
    "cheese": {
        name: "Cheese",
        categories: ["dairy", "fodmap_lactose", "fatty"],
        common_names: ["cheese", "cheddar", "mozzarella", "swiss", "parmesan"],
        digestion_time: { min_hours: 12, max_hours: 36 },
        icon: "square-outline",
        icon_color: getFoodColor(3), // Cream
        is_trigger_common: true,
    },
    "yogurt": {
        name: "Yogurt",
        categories: ["dairy", "fodmap_lactose", "probiotics"],
        common_names: ["yogurt", "yoghurt", "greek yogurt"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "nutrition-outline",
        icon_color: getFoodColor(1), // Pastel Green
        is_trigger_common: false,
    },
    "ice_cream": {
        name: "Ice Cream",
        categories: ["dairy", "fodmap_lactose", "fatty", "processed"],
        common_names: ["ice cream", "icecream", "gelato"],
        digestion_time: { min_hours: 12, max_hours: 36 },
        icon: "ice-cream-outline",
        icon_color: getFoodColor(2), // Purple
        is_trigger_common: true,
    },
    "butter": {
        name: "Butter",
        categories: ["dairy", "fatty"],
        common_names: ["butter"],
        digestion_time: { min_hours: 12, max_hours: 36 },
        icon: "square",
        icon_color: getFoodColor(3), // Cream
        is_trigger_common: false,
    },

    // GRAINS (GLUTEN)
    "bread": {
        name: "Bread",
        categories: ["gluten", "fodmap_fructans", "processed"],
        common_names: ["bread", "white bread", "wheat bread", "whole wheat bread"],
        digestion_time: { min_hours: 12, max_hours: 36 },
        icon: "fast-food-outline",
        icon_color: getFoodColor(3), // Cream
        is_trigger_common: true,
    },
    "pasta": {
        name: "Pasta",
        categories: ["gluten", "fodmap_fructans"],
        common_names: ["pasta", "spaghetti", "noodles", "macaroni"],
        digestion_time: { min_hours: 12, max_hours: 36 },
        icon: "restaurant-outline",
        icon_color: getFoodColor(0), // Coral
        is_trigger_common: true,
    },
    "pizza": {
        name: "Pizza",
        categories: ["gluten", "dairy", "fodmap_fructans", "fodmap_lactose", "fatty", "processed"],
        common_names: ["pizza"],
        digestion_time: { min_hours: 12, max_hours: 48 },
        icon: "pizza-outline",
        icon_color: getFoodColor(0), // Coral
        is_trigger_common: true,
    },
    "wheat": {
        name: "Wheat",
        categories: ["gluten", "fodmap_fructans"],
        common_names: ["wheat", "wheat flour"],
        digestion_time: { min_hours: 12, max_hours: 36 },
        icon: "leaf-outline",
        icon_color: getFoodColor(3), // Cream
        is_trigger_common: true,
    },

    // VEGETABLES
    "onion": {
        name: "Onion",
        categories: ["fodmap_fructans"],
        common_names: ["onion", "onions", "red onion", "white onion"],
        digestion_time: { min_hours: 12, max_hours: 36 },
        icon: "ellipse-outline",
        icon_color: getFoodColor(2), // Purple
        is_trigger_common: true,
    },
    "garlic": {
        name: "Garlic",
        categories: ["fodmap_fructans"],
        common_names: ["garlic"],
        digestion_time: { min_hours: 12, max_hours: 36 },
        icon: "ellipse",
        icon_color: getFoodColor(3), // Cream
        is_trigger_common: true,
    },
    "broccoli": {
        name: "Broccoli",
        categories: ["fodmap_fructans", "soluble_fiber"],
        common_names: ["broccoli"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "leaf",
        icon_color: getFoodColor(1), // Pastel Green
        is_trigger_common: false,
    },
    "cauliflower": {
        name: "Cauliflower",
        categories: ["fodmap_polyols", "soluble_fiber"],
        common_names: ["cauliflower"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "leaf",
        icon_color: getFoodColor(1), // Pastel Green
        is_trigger_common: true,
    },
    "mushroom": {
        name: "Mushroom",
        categories: ["fodmap_polyols"],
        common_names: ["mushroom", "mushrooms"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "umbrella-outline",
        icon_color: getFoodColor(2), // Purple
        is_trigger_common: true,
    },

    // LEGUMES
    "beans": {
        name: "Beans",
        categories: ["fodmap_fructans", "soluble_fiber"],
        common_names: ["beans", "black beans", "kidney beans", "pinto beans"],
        digestion_time: { min_hours: 12, max_hours: 48 },
        icon: "ellipse",
        icon_color: getFoodColor(3), // Cream
        is_trigger_common: true,
    },
    "lentils": {
        name: "Lentils",
        categories: ["fodmap_fructans", "soluble_fiber"],
        common_names: ["lentils", "lentil"],
        digestion_time: { min_hours: 12, max_hours: 48 },
        icon: "ellipse",
        icon_color: getFoodColor(3), // Cream
        is_trigger_common: true,
    },

    // FRUITS
    "apple": {
        name: "Apple",
        categories: ["fodmap_fructose", "fodmap_polyols", "soluble_fiber"],
        common_names: ["apple", "apples"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "nutrition",
        icon_color: getFoodColor(0), // Coral
        is_trigger_common: true,
    },
    "banana": {
        name: "Banana",
        categories: ["soluble_fiber"],
        common_names: ["banana", "bananas"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "nutrition",
        icon_color: getFoodColor(3), // Cream
        is_trigger_common: false,
    },
    "mango": {
        name: "Mango",
        categories: ["fodmap_fructose"],
        common_names: ["mango", "mangoes"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "nutrition",
        icon_color: getFoodColor(0), // Coral
        is_trigger_common: true,
    },
    "watermelon": {
        name: "Watermelon",
        categories: ["fodmap_fructose", "fodmap_polyols"],
        common_names: ["watermelon"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "nutrition",
        icon_color: getFoodColor(2), // Purple
        is_trigger_common: true,
    },

    // BEVERAGES
    "coffee": {
        name: "Coffee",
        categories: ["caffeine"],
        common_names: ["coffee", "espresso", "latte", "cappuccino"],
        digestion_time: { min_hours: 2, max_hours: 12 },
        icon: "cafe-outline",
        icon_color: getFoodColor(3), // Cream
        is_trigger_common: true,
    },
    "tea": {
        name: "Tea",
        categories: ["caffeine"],
        common_names: ["tea", "black tea", "green tea"],
        digestion_time: { min_hours: 2, max_hours: 12 },
        icon: "cafe",
        icon_color: getFoodColor(1), // Pastel Green
        is_trigger_common: false,
    },
    "beer": {
        name: "Beer",
        categories: ["alcohol", "gluten", "fodmap_fructans"],
        common_names: ["beer"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "beer-outline",
        icon_color: getFoodColor(3), // Cream
        is_trigger_common: true,
    },
    "wine": {
        name: "Wine",
        categories: ["alcohol"],
        common_names: ["wine", "red wine", "white wine"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "wine-outline",
        icon_color: getFoodColor(2), // Purple
        is_trigger_common: true,
    },

    // PROTEINS
    "chicken": {
        name: "Chicken",
        categories: ["lean_protein"],
        common_names: ["chicken", "chicken breast"],
        digestion_time: { min_hours: 12, max_hours: 36 },
        icon: "restaurant",
        icon_color: getFoodColor(1), // Pastel Green
        is_trigger_common: false,
    },
    "beef": {
        name: "Beef",
        categories: ["fatty"],
        common_names: ["beef", "steak", "hamburger"],
        digestion_time: { min_hours: 24, max_hours: 48 },
        icon: "restaurant",
        icon_color: getFoodColor(0), // Coral
        is_trigger_common: false,
    },
    "fish": {
        name: "Fish",
        categories: ["lean_protein"],
        common_names: ["fish", "salmon", "tuna"],
        digestion_time: { min_hours: 12, max_hours: 36 },
        icon: "fish-outline",
        icon_color: getFoodColor(1), // Pastel Green
        is_trigger_common: false,
    },
    "egg": {
        name: "Egg",
        categories: ["lean_protein"],
        common_names: ["egg", "eggs"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "ellipse",
        icon_color: getFoodColor(3), // Cream
        is_trigger_common: false,
    },

    // PROCESSED/FAST FOOD
    "chips": {
        name: "Chips",
        categories: ["processed", "fatty"],
        common_names: ["chips", "potato chips", "crisps"],
        digestion_time: { min_hours: 12, max_hours: 36 },
        icon: "fast-food",
        icon_color: getFoodColor(3), // Cream
        is_trigger_common: true,
    },
    "chocolate": {
        name: "Chocolate",
        categories: ["caffeine", "fatty", "processed"],
        common_names: ["chocolate", "dark chocolate", "milk chocolate"],
        digestion_time: { min_hours: 12, max_hours: 36 },
        icon: "square",
        icon_color: getFoodColor(3), // Cream
        is_trigger_common: true,
    },
    "cookies": {
        name: "Cookies",
        categories: ["gluten", "processed", "fatty"],
        common_names: ["cookies", "cookie", "biscuits"],
        digestion_time: { min_hours: 12, max_hours: 36 },
        icon: "ellipse",
        icon_color: getFoodColor(3), // Cream
        is_trigger_common: true,
    },

    // HEALTHY OPTIONS
    "rice": {
        name: "Rice",
        categories: [],
        common_names: ["rice", "white rice", "brown rice"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "restaurant-outline",
        icon_color: getFoodColor(3), // Cream
        is_trigger_common: false,
    },
    "oats": {
        name: "Oats",
        categories: ["soluble_fiber"],
        common_names: ["oats", "oatmeal", "porridge"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "nutrition-outline",
        icon_color: getFoodColor(3), // Cream
        is_trigger_common: false,
    },
    "avocado": {
        name: "Avocado",
        categories: ["soluble_fiber"],
        common_names: ["avocado"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "leaf",
        icon_color: getFoodColor(1), // Pastel Green
        is_trigger_common: false,
    },
    "sweet_potato": {
        name: "Sweet Potato",
        categories: ["soluble_fiber"],
        common_names: ["sweet potato", "sweet potatoes"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "nutrition",
        icon_color: getFoodColor(0), // Coral
        is_trigger_common: false,
    },

    // FERMENTED (PROBIOTICS)
    "kimchi": {
        name: "Kimchi",
        categories: ["probiotics", "spicy"],
        common_names: ["kimchi"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "flame",
        icon_color: getFoodColor(0), // Coral
        is_trigger_common: false,
    },
    "sauerkraut": {
        name: "Sauerkraut",
        categories: ["probiotics"],
        common_names: ["sauerkraut"],
        digestion_time: { min_hours: 6, max_hours: 24 },
        icon: "leaf",
        icon_color: getFoodColor(1), // Pastel Green
        is_trigger_common: false,
    },
};

/**
 * Find food in database by name (fuzzy matching)
 */
export const findFood = (searchTerm: string): FoodItem | null => {
    const normalized = searchTerm.toLowerCase().trim();

    // Direct match
    if (FOOD_DATABASE[normalized]) {
        return FOOD_DATABASE[normalized];
    }

    // Search common names
    for (const food of Object.values(FOOD_DATABASE)) {
        if (food.common_names.some(name => name.includes(normalized) || normalized.includes(name))) {
            return food;
        }
    }

    return null;
};

/**
 * Get all foods in a category
 */
export const getFoodsByCategory = (category: string): FoodItem[] => {
    return Object.values(FOOD_DATABASE).filter(food =>
        food.categories.includes(category)
    );
};

/**
 * Get common trigger foods
 */
export const getCommonTriggers = (): FoodItem[] => {
    return Object.values(FOOD_DATABASE).filter(food => food.is_trigger_common);
};

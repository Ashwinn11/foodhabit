// FODMAP Types and Data Structures

export type FODMAPCategory = 'fructans' | 'gos' | 'lactose' | 'excess-fructose' | 'polyols';
export type FODMAPLevel = 'high' | 'moderate' | 'low';

export interface FODMAPTag {
    categories: FODMAPCategory[];
    level: FODMAPLevel;
}

export interface BloatingType {
    type: 'gas' | 'water-retention' | 'constipation';
    confidence: number;
    signals: string[];
}

export interface DebloatAction {
    id: string;
    title: string;
    description: string;
    category: 'immediate' | 'behavioral' | 'dietary';
    timeframe: string;
    icon: string;
}

export interface DebloatSuggestion {
    bloatingType: BloatingType;
    immediateActions: DebloatAction[];
    preventionTips: string[];
    explanation: string;
    confidence: number;
}

// Comprehensive FODMAP Food Database
export const FODMAP_FOODS: Record<string, FODMAPTag> = {
    // High FODMAP - Fructans
    'wheat': { categories: ['fructans'], level: 'high' },
    'bread': { categories: ['fructans'], level: 'high' },
    'pasta': { categories: ['fructans'], level: 'high' },
    'onion': { categories: ['fructans'], level: 'high' },
    'garlic': { categories: ['fructans'], level: 'high' },
    'leek': { categories: ['fructans'], level: 'high' },
    'shallot': { categories: ['fructans'], level: 'high' },
    'rye': { categories: ['fructans'], level: 'high' },
    'barley': { categories: ['fructans'], level: 'high' },
    'artichoke': { categories: ['fructans'], level: 'high' },
    'asparagus': { categories: ['fructans'], level: 'high' },
    'beetroot': { categories: ['fructans'], level: 'high' },
    'brussels sprouts': { categories: ['fructans'], level: 'high' },
    'cabbage': { categories: ['fructans'], level: 'high' },
    'fennel': { categories: ['fructans'], level: 'high' },

    // High FODMAP - GOS (Galacto-oligosaccharides)
    'beans': { categories: ['gos'], level: 'high' },
    'lentils': { categories: ['gos'], level: 'high' },
    'chickpeas': { categories: ['gos'], level: 'high' },
    'kidney beans': { categories: ['gos'], level: 'high' },
    'black beans': { categories: ['gos'], level: 'high' },
    'soybeans': { categories: ['gos'], level: 'high' },
    'cashews': { categories: ['gos'], level: 'high' },
    'pistachios': { categories: ['gos'], level: 'high' },

    // High FODMAP - Lactose
    'milk': { categories: ['lactose'], level: 'high' },
    'ice cream': { categories: ['lactose'], level: 'high' },
    'yogurt': { categories: ['lactose'], level: 'high' },
    'soft cheese': { categories: ['lactose'], level: 'high' },
    'cottage cheese': { categories: ['lactose'], level: 'high' },
    'ricotta': { categories: ['lactose'], level: 'high' },
    'cream': { categories: ['lactose'], level: 'high' },
    'custard': { categories: ['lactose'], level: 'high' },

    // High FODMAP - Excess Fructose
    'apple': { categories: ['excess-fructose'], level: 'high' },
    'pear': { categories: ['excess-fructose'], level: 'high' },
    'mango': { categories: ['excess-fructose'], level: 'high' },
    'watermelon': { categories: ['excess-fructose'], level: 'high' },
    'honey': { categories: ['excess-fructose'], level: 'high' },
    'agave': { categories: ['excess-fructose'], level: 'high' },
    'high fructose corn syrup': { categories: ['excess-fructose'], level: 'high' },
    'cherries': { categories: ['excess-fructose'], level: 'high' },

    // High FODMAP - Polyols
    'mushroom': { categories: ['polyols'], level: 'high' },
    'cauliflower': { categories: ['polyols'], level: 'high' },
    'avocado': { categories: ['polyols'], level: 'high' },
    'peach': { categories: ['polyols'], level: 'high' },
    'plum': { categories: ['polyols'], level: 'high' },
    'apricot': { categories: ['polyols'], level: 'high' },
    'nectarine': { categories: ['polyols'], level: 'high' },
    'blackberries': { categories: ['polyols'], level: 'high' },
    'sugar-free gum': { categories: ['polyols'], level: 'high' },
    'sorbitol': { categories: ['polyols'], level: 'high' },
    'mannitol': { categories: ['polyols'], level: 'high' },
    'xylitol': { categories: ['polyols'], level: 'high' },

    // Multiple FODMAP categories
    'apple juice': { categories: ['excess-fructose', 'polyols'], level: 'high' },
    'pear juice': { categories: ['excess-fructose', 'polyols'], level: 'high' },

    // Low FODMAP alternatives
    'rice': { categories: [], level: 'low' },
    'quinoa': { categories: [], level: 'low' },
    'oats': { categories: [], level: 'low' },
    'potato': { categories: [], level: 'low' },
    'sweet potato': { categories: [], level: 'low' },
    'carrot': { categories: [], level: 'low' },
    'cucumber': { categories: [], level: 'low' },
    'lettuce': { categories: [], level: 'low' },
    'spinach': { categories: [], level: 'low' },
    'tomato': { categories: [], level: 'low' },
    'zucchini': { categories: [], level: 'low' },
    'bell pepper': { categories: [], level: 'low' },
    'eggplant': { categories: [], level: 'low' },
    'green beans': { categories: [], level: 'low' },
    'banana': { categories: [], level: 'low' },
    'blueberries': { categories: [], level: 'low' },
    'strawberries': { categories: [], level: 'low' },
    'orange': { categories: [], level: 'low' },
    'grapes': { categories: [], level: 'low' },
    'kiwi': { categories: [], level: 'low' },
    'chicken': { categories: [], level: 'low' },
    'turkey': { categories: [], level: 'low' },
    'fish': { categories: [], level: 'low' },
    'salmon': { categories: [], level: 'low' },
    'tuna': { categories: [], level: 'low' },
    'eggs': { categories: [], level: 'low' },
    'tofu': { categories: [], level: 'low' },
    'tempeh': { categories: [], level: 'low' },
    'hard cheese': { categories: [], level: 'low' },
    'cheddar': { categories: [], level: 'low' },
    'parmesan': { categories: [], level: 'low' },
    'brie': { categories: [], level: 'low' },
    'almond milk': { categories: [], level: 'low' },
    'coconut milk': { categories: [], level: 'low' },
    'lactose-free milk': { categories: [], level: 'low' },
    'peanuts': { categories: [], level: 'low' },
    'almonds': { categories: [], level: 'low' },
    'walnuts': { categories: [], level: 'low' },
    'pecans': { categories: [], level: 'low' },
    'macadamia': { categories: [], level: 'low' },

    // Moderate FODMAP
    'broccoli': { categories: ['fructans'], level: 'moderate' },
    'corn': { categories: ['polyols'], level: 'moderate' },
    'peas': { categories: ['gos'], level: 'moderate' },
    'butternut squash': { categories: ['fructans'], level: 'moderate' },
};

// FODMAP category descriptions for user education
export const FODMAP_INFO: Record<FODMAPCategory, { name: string; description: string; examples: string[] }> = {
    'fructans': {
        name: 'Fructans',
        description: 'Found in wheat, onions, and garlic. Humans lack enzymes to digest these, leading to fermentation.',
        examples: ['Wheat', 'Onion', 'Garlic', 'Leeks']
    },
    'gos': {
        name: 'GOS (Galacto-oligosaccharides)',
        description: 'Present in legumes and some nuts. Not well absorbed, causing gas and bloating.',
        examples: ['Beans', 'Lentils', 'Chickpeas', 'Cashews']
    },
    'lactose': {
        name: 'Lactose',
        description: 'Milk sugar that requires lactase enzyme to digest. Problematic if lactose intolerant.',
        examples: ['Milk', 'Ice cream', 'Soft cheese', 'Yogurt']
    },
    'excess-fructose': {
        name: 'Excess Fructose',
        description: 'When fructose exceeds glucose in foods. Harder to absorb, causing gut symptoms.',
        examples: ['Apples', 'Mango', 'Honey', 'Pears']
    },
    'polyols': {
        name: 'Polyols (Sugar Alcohols)',
        description: 'Slowly absorbed sugar alcohols found in some fruits and artificial sweeteners.',
        examples: ['Mushrooms', 'Stone fruits', 'Sugar-free gum', 'Sorbitol']
    }
};

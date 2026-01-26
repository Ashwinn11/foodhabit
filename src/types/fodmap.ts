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
    // -------------------------------------------------------------------------
    // VEGETABLES & LEGUMES
    // -------------------------------------------------------------------------
    // High FODMAP
    'onion': { categories: ['fructans'], level: 'high' },
    'garlic': { categories: ['fructans'], level: 'high' },
    'shallot': { categories: ['fructans'], level: 'high' },
    'leek': { categories: ['fructans'], level: 'high' },
    'scallion (white part)': { categories: ['fructans'], level: 'high' },
    'spring onion (white part)': { categories: ['fructans'], level: 'high' },
    'artichoke': { categories: ['fructans'], level: 'high' },
    'asparagus': { categories: ['fructans'], level: 'high' },
    'beetroot': { categories: ['fructans'], level: 'high' },
    'brussels sprouts': { categories: ['fructans'], level: 'high' },
    'cauliflower': { categories: ['polyols'], level: 'high' },
    'mushroom': { categories: ['polyols'], level: 'high' },
    'portobello mushroom': { categories: ['polyols'], level: 'high' },
    'shiitake mushroom': { categories: ['polyols'], level: 'high' },
    'button mushroom': { categories: ['polyols'], level: 'high' },
    'snow peas': { categories: ['fructans', 'polyols'], level: 'high' },
    'sugar snap peas': { categories: ['fructans'], level: 'high' },
    'fennel': { categories: ['fructans'], level: 'high' },
    'savoy cabbage': { categories: ['fructans'], level: 'high' },
    'jerusalem artichoke': { categories: ['fructans'], level: 'high' },
    'kidney beans': { categories: ['gos'], level: 'high' },
    'baked beans': { categories: ['gos', 'fructans'], level: 'high' },
    'black beans': { categories: ['gos'], level: 'high' },
    'broad beans': { categories: ['gos'], level: 'high' },
    'fava beans': { categories: ['gos'], level: 'high' },
    'navy beans': { categories: ['gos'], level: 'high' },
    'split peas': { categories: ['gos'], level: 'high' },
    'soybeans': { categories: ['gos'], level: 'high' },
    'cassava': { categories: ['gos'], level: 'high' },
    'kimchi': { categories: ['fructans'], level: 'high' }, // Usually contains garlic/onion
    'sauerkraut': { categories: ['fructans'], level: 'moderate' }, // Often okay in small amounts but can trigger histamine

    // Moderate FODMAP
    'broccoli': { categories: ['fructans'], level: 'moderate' }, // Heads are worse than stalks
    'butternut squash': { categories: ['fructans', 'polyols'], level: 'moderate' },
    'sweet corn': { categories: ['polyols'], level: 'moderate' },
    'cabbage (red)': { categories: ['fructans'], level: 'moderate' },
    'avocado': { categories: ['polyols'], level: 'moderate' }, // High in large amounts
    'celery': { categories: ['polyols'], level: 'moderate' },
    'sweet potato': { categories: ['polyols'], level: 'moderate' }, // High in large amounts
    'pumpkin': { categories: ['gos'], level: 'moderate' },
    'green peas': { categories: ['gos'], level: 'moderate' },
    'chickpeas (canned)': { categories: ['gos'], level: 'moderate' }, // Canned/rinsed is better
    'lentils (canned)': { categories: ['gos'], level: 'moderate' },

    // Low FODMAP
    'carrot': { categories: [], level: 'low' },
    'cucumber': { categories: [], level: 'low' },
    'tomato': { categories: [], level: 'low' },
    'spinach': { categories: [], level: 'low' },
    'kale': { categories: [], level: 'low' },
    'arugula': { categories: [], level: 'low' },
    'rocket': { categories: [], level: 'low' },
    'lettuce': { categories: [], level: 'low' },
    'zucchini': { categories: [], level: 'low' },
    'eggplant': { categories: [], level: 'low' },
    'green beans': { categories: [], level: 'low' },
    'bell pepper': { categories: [], level: 'low' },
    'capsicum': { categories: [], level: 'low' },
    'bok choy': { categories: [], level: 'low' },
    'choy sum': { categories: [], level: 'low' },
    'bean sprouts': { categories: [], level: 'low' },
    'bamboo shoots': { categories: [], level: 'low' },
    'potato': { categories: [], level: 'low' },
    'parsnip': { categories: [], level: 'low' },
    'radish': { categories: [], level: 'low' },
    'ginger': { categories: [], level: 'low' },
    'scallion (green part)': { categories: [], level: 'low' },
    'spring onion (green part)': { categories: [], level: 'low' },
    'chives': { categories: [], level: 'low' },
    'olives': { categories: [], level: 'low' },
    'canned lentils (rinsed)': { categories: [], level: 'low' },
    'canned chickpeas (rinsed)': { categories: [], level: 'low' },

    // -------------------------------------------------------------------------
    // FRUITS
    // -------------------------------------------------------------------------
    // High FODMAP
    'apple': { categories: ['excess-fructose', 'polyols'], level: 'high' },
    'pear': { categories: ['excess-fructose', 'polyols'], level: 'high' },
    'mango': { categories: ['excess-fructose'], level: 'high' },
    'watermelon': { categories: ['excess-fructose', 'polyols'], level: 'high' },
    'peach': { categories: ['polyols'], level: 'high' },
    'plum': { categories: ['polyols'], level: 'high' },
    'apricot': { categories: ['polyols'], level: 'high' },
    'nectarine': { categories: ['polyols'], level: 'high' },
    'cherry': { categories: ['excess-fructose', 'polyols'], level: 'high' },
    'blackberries': { categories: ['polyols'], level: 'high' },
    'currants': { categories: ['fructans'], level: 'high' },
    'dates': { categories: ['fructans'], level: 'high' },
    'figs': { categories: ['fructans'], level: 'high' },
    'goji berries': { categories: ['fructans'], level: 'high' },
    'prunes': { categories: ['polyols', 'fructans'], level: 'high' },
    'raisins': { categories: ['fructans'], level: 'high' },
    'dried fruit': { categories: ['fructans', 'excess-fructose'], level: 'high' },
    'fruit juice (apple/pear)': { categories: ['excess-fructose', 'polyols'], level: 'high' },

    // Low FODMAP
    'banana (unripe)': { categories: [], level: 'low' },
    'banana (firm)': { categories: [], level: 'low' }, // Ripe bananas can be high FODMAP
    'blueberries': { categories: [], level: 'low' },
    'strawberries': { categories: [], level: 'low' },
    'raspberries': { categories: [], level: 'low' },
    'grapes': { categories: [], level: 'low' },
    'kiwi': { categories: [], level: 'low' },
    'orange': { categories: [], level: 'low' },
    'mandarin': { categories: [], level: 'low' },
    'lemon': { categories: [], level: 'low' },
    'lime': { categories: [], level: 'low' },
    'grapefruit': { categories: [], level: 'low' },
    'cantaloupe': { categories: [], level: 'low' },
    'rockmelon': { categories: [], level: 'low' },
    'honeydew melon': { categories: [], level: 'low' },
    'pineapple': { categories: [], level: 'low' },
    'papaya': { categories: [], level: 'low' },
    'passion fruit': { categories: [], level: 'low' },
    'rhubarb': { categories: [], level: 'low' },
    'dragon fruit': { categories: [], level: 'low' },

    // -------------------------------------------------------------------------
    // GRAINS & STARCHES
    // -------------------------------------------------------------------------
    // High FODMAP
    'wheat': { categories: ['fructans'], level: 'high' },
    'rye': { categories: ['fructans'], level: 'high' },
    'barley': { categories: ['fructans'], level: 'high' },
    'bread (wheat)': { categories: ['fructans'], level: 'high' },
    'bread (rye)': { categories: ['fructans'], level: 'high' },
    'pasta (wheat)': { categories: ['fructans'], level: 'high' },
    'couscous': { categories: ['fructans'], level: 'high' },
    'gnocchi': { categories: ['fructans'], level: 'high' },
    'noodles (wheat)': { categories: ['fructans'], level: 'high' },
    'udon noodles': { categories: ['fructans'], level: 'high' },
    'ramen noodles': { categories: ['fructans'], level: 'high' },
    'flour (wheat)': { categories: ['fructans'], level: 'high' },
    'semolina': { categories: ['fructans'], level: 'high' },
    'spelt pasta': { categories: ['fructans'], level: 'high' }, // Spelt is lower than wheat but still contains fructans
    'crackers (wheat)': { categories: ['fructans'], level: 'high' },
    'biscuits': { categories: ['fructans'], level: 'high' },
    'croissant': { categories: ['fructans'], level: 'high' },
    'muffin': { categories: ['fructans'], level: 'high' },
    'cereal (wheat)': { categories: ['fructans'], level: 'high' },
    'bran': { categories: ['fructans'], level: 'high' },
    'granola': { categories: ['fructans'], level: 'high' }, // Often contains honey/dried fruit too

    // Low FODMAP
    'rice': { categories: [], level: 'low' },
    'brown rice': { categories: [], level: 'low' },
    'basmati rice': { categories: [], level: 'low' },
    'jasmine rice': { categories: [], level: 'low' },
    'quinoa': { categories: [], level: 'low' },
    'oats': { categories: [], level: 'low' },
    'corn': { categories: [], level: 'low' },
    'corn flakes': { categories: [], level: 'low' },
    'polenta': { categories: [], level: 'low' },
    'millet': { categories: [], level: 'low' },
    'buckwheat': { categories: [], level: 'low' },
    'sorghum': { categories: [], level: 'low' },
    'tapioca': { categories: [], level: 'low' },
    'sago': { categories: [], level: 'low' },
    'bread (sourdough spelt)': { categories: [], level: 'low' },
    'bread (gluten free)': { categories: [], level: 'low' },
    'pasta (gluten free)': { categories: [], level: 'low' },
    'pasta (rice)': { categories: [], level: 'low' },
    'pasta (corn)': { categories: [], level: 'low' },
    'noodles (rice)': { categories: [], level: 'low' },
    'soba noodles': { categories: [], level: 'low' }, // Check for wheat content
    'potato chips': { categories: [], level: 'low' }, // Plain
    'popcorn': { categories: [], level: 'low' },
    'corn tortilla': { categories: [], level: 'low' },
    'rice cakes': { categories: [], level: 'low' },

    // -------------------------------------------------------------------------
    // DAIRY & ALTERNATIVES
    // -------------------------------------------------------------------------
    // High FODMAP
    'milk (cow)': { categories: ['lactose'], level: 'high' },
    'milk (goat)': { categories: ['lactose'], level: 'high' },
    'milk (sheep)': { categories: ['lactose'], level: 'high' },
    'evaporated milk': { categories: ['lactose'], level: 'high' },
    'sweetened condensed milk': { categories: ['lactose'], level: 'high' },
    'yogurt (regular)': { categories: ['lactose'], level: 'high' },
    'ice cream': { categories: ['lactose'], level: 'high' },
    'custard': { categories: ['lactose'], level: 'high' },
    'cream': { categories: ['lactose'], level: 'high' },
    'sour cream': { categories: ['lactose'], level: 'high' },
    'buttermilk': { categories: ['lactose'], level: 'high' },
    'soft cheese': { categories: ['lactose'], level: 'high' },
    'ricotta': { categories: ['lactose'], level: 'high' },
    'cottage cheese': { categories: ['lactose'], level: 'high' },
    'mascarpone': { categories: ['lactose'], level: 'high' },
    'cream cheese': { categories: ['lactose'], level: 'high' }, // Moderate usually
    'soy milk (whole bean)': { categories: ['gos'], level: 'high' },

    // Low FODMAP
    'milk (lactose free)': { categories: [], level: 'low' },
    'yogurt (lactose free)': { categories: [], level: 'low' },
    'almond milk': { categories: [], level: 'low' },
    'rice milk': { categories: [], level: 'low' },
    'coconut milk (canned)': { categories: [], level: 'low' }, // Check serving size
    'soy milk (soy protein)': { categories: [], level: 'low' },
    'hard cheese': { categories: [], level: 'low' },
    'cheddar': { categories: [], level: 'low' },
    'parmesan': { categories: [], level: 'low' },
    'swiss cheese': { categories: [], level: 'low' },
    'mozzarella': { categories: [], level: 'low' },
    'feta': { categories: [], level: 'low' },
    'brie': { categories: [], level: 'low' },
    'camembert': { categories: [], level: 'low' },
    'butter': { categories: [], level: 'low' },
    'ghee': { categories: [], level: 'low' },
    'whipped cream': { categories: [], level: 'low' },

    // -------------------------------------------------------------------------
    // NUTS & SEEDS
    // -------------------------------------------------------------------------
    // High FODMAP
    'cashews': { categories: ['gos'], level: 'high' },
    'pistachios': { categories: ['gos'], level: 'high' },
    'almonds': { categories: ['gos'], level: 'moderate' }, // High in large amounts (>10)
    'hazelnuts': { categories: ['gos'], level: 'moderate' }, // High in large amounts

    // Low FODMAP
    'peanuts': { categories: [], level: 'low' },
    'walnuts': { categories: [], level: 'low' },
    'pecans': { categories: [], level: 'low' },
    'macadamia nuts': { categories: [], level: 'low' },
    'pine nuts': { categories: [], level: 'low' },
    'brazil nuts': { categories: [], level: 'low' },
    'chia seeds': { categories: [], level: 'low' },
    'pumpkin seeds': { categories: [], level: 'low' },
    'pepitas': { categories: [], level: 'low' },
    'sunflower seeds': { categories: [], level: 'low' },
    'sesame seeds': { categories: [], level: 'low' },
    'flax seeds': { categories: [], level: 'low' },
    'peanut butter': { categories: [], level: 'low' },

    // -------------------------------------------------------------------------
    // SWEETENERS & CONFECTIONERY
    // -------------------------------------------------------------------------
    // High FODMAP
    'honey': { categories: ['excess-fructose'], level: 'high' },
    'high fructose corn syrup': { categories: ['excess-fructose'], level: 'high' },
    'hfcs': { categories: ['excess-fructose'], level: 'high' },
    'agave syrup': { categories: ['excess-fructose'], level: 'high' },
    'sorbitol': { categories: ['polyols'], level: 'high' },
    'mannitol': { categories: ['polyols'], level: 'high' },
    'xylitol': { categories: ['polyols'], level: 'high' },
    'maltitol': { categories: ['polyols'], level: 'high' },
    'isomalt': { categories: ['polyols'], level: 'high' },
    'sugar-free gum': { categories: ['polyols'], level: 'high' },
    'sugar-free mints': { categories: ['polyols'], level: 'high' },
    'molasses': { categories: ['excess-fructose'], level: 'high' },
    'golden syrup': { categories: ['fructans'], level: 'moderate' },
    'jam (mixed fruit)': { categories: ['excess-fructose'], level: 'high' },

    // Low FODMAP
    'sugar': { categories: [], level: 'low' },
    'sucrose': { categories: [], level: 'low' },
    'glucose': { categories: [], level: 'low' },
    'maple syrup': { categories: [], level: 'low' },
    'stevia': { categories: [], level: 'low' },
    'aspartame': { categories: [], level: 'low' },
    'saccharin': { categories: [], level: 'low' },
    'rice malt syrup': { categories: [], level: 'low' },
    'dark chocolate': { categories: [], level: 'low' }, // Up to 30g
    'cocoa powder': { categories: [], level: 'low' },

    // -------------------------------------------------------------------------
    // PROTEINS
    // -------------------------------------------------------------------------
    // High FODMAP
    'sausages': { categories: ['fructans'], level: 'high' }, // Usually contain garlic/onion
    'processed meat': { categories: ['fructans'], level: 'high' }, // Usually contain garlic/onion
    'marinated meat': { categories: ['fructans'], level: 'high' }, // Usually contain garlic/onion
    'silken tofu': { categories: ['gos'], level: 'high' },

    // Low FODMAP
    'beef': { categories: [], level: 'low' },
    'chicken': { categories: [], level: 'low' },
    'lamb': { categories: [], level: 'low' },
    'pork': { categories: [], level: 'low' },
    'turkey': { categories: [], level: 'low' },
    'fish': { categories: [], level: 'low' },
    'salmon': { categories: [], level: 'low' },
    'tuna': { categories: [], level: 'low' },
    'cod': { categories: [], level: 'low' },
    'prawns': { categories: [], level: 'low' },
    'shrimp': { categories: [], level: 'low' },
    'crab': { categories: [], level: 'low' },
    'lobster': { categories: [], level: 'low' },
    'eggs': { categories: [], level: 'low' },
    'tofu (firm)': { categories: [], level: 'low' },
    'tempeh': { categories: [], level: 'low' },
    'seitan': { categories: [], level: 'low' }, // Wheat protein, but usually low FODMAP as carbs are washed away (check ingredients)
    'bacon': { categories: [], level: 'low' }, // Check for high fructose corn syrup

    // -------------------------------------------------------------------------
    // CONDIMENTS & SAUCES
    // -------------------------------------------------------------------------
    // High FODMAP
    'garlic powder': { categories: ['fructans'], level: 'high' },
    'onion powder': { categories: ['fructans'], level: 'high' },
    'ketchup': { categories: ['fructans'], level: 'high' }, // HFCS + Onion
    'tomato sauce': { categories: ['fructans'], level: 'high' },
    'bbq sauce': { categories: ['fructans'], level: 'high' },
    'pasta sauce': { categories: ['fructans'], level: 'high' },
    'pesto': { categories: ['fructans'], level: 'high' }, // Garlic
    'hummus': { categories: ['gos', 'fructans'], level: 'high' }, // Garlic + Chickpeas
    'tzatziki': { categories: ['fructans', 'lactose'], level: 'high' }, // Garlic + Yogurt
    'guacamole': { categories: ['polyols', 'fructans'], level: 'high' }, // Avocado + Onion
    'salsa': { categories: ['fructans'], level: 'high' }, // Onion/Garlic
    'soy sauce': { categories: ['fructans'], level: 'low' }, // Contains wheat but small amount is usually tolerated
    'balsamic vinegar': { categories: ['excess-fructose'], level: 'moderate' }, // High in large amounts

    // Low FODMAP
    'mayonnaise': { categories: [], level: 'low' }, // Check for garlic
    'mustard': { categories: [], level: 'low' },
    'vinegar': { categories: [], level: 'low' },
    'apple cider vinegar': { categories: [], level: 'low' },
    'olive oil': { categories: [], level: 'low' },
    'garlic-infused oil': { categories: [], level: 'low' }, // Safe!
    'miso paste': { categories: [], level: 'low' },
    'oyster sauce': { categories: [], level: 'low' },
    'fish sauce': { categories: [], level: 'low' },
    'tabasco': { categories: [], level: 'low' },
    'wasabi': { categories: [], level: 'low' },

    // -------------------------------------------------------------------------
    // BEVERAGES
    // -------------------------------------------------------------------------
    // High FODMAP
    'apple juice': { categories: ['excess-fructose', 'polyols'], level: 'high' },
    'pear juice': { categories: ['excess-fructose', 'polyols'], level: 'high' },
    'mango juice': { categories: ['excess-fructose'], level: 'high' },
    'soda (hfcs)': { categories: ['excess-fructose'], level: 'high' },
    'soft drinks': { categories: ['excess-fructose'], level: 'high' },
    'chamomile tea': { categories: ['fructans'], level: 'high' },
    'fennel tea': { categories: ['fructans'], level: 'high' },
    'chai tea (strong)': { categories: ['fructans'], level: 'high' },
    'oolong tea (strong)': { categories: ['fructans'], level: 'high' },
    'kombucha': { categories: ['fructans'], level: 'high' }, // Varies
    'rum': { categories: ['excess-fructose'], level: 'high' },
    'dessert wine': { categories: ['excess-fructose'], level: 'high' },

    // Low FODMAP
    'water': { categories: [], level: 'low' },
    'coffee': { categories: [], level: 'low' }, // Caffeine is a gut irritant but not FODMAP
    'tea (black/weak)': { categories: [], level: 'low' },
    'tea (green)': { categories: [], level: 'low' },
    'tea (peppermint)': { categories: [], level: 'low' },
    'tea (ginger)': { categories: [], level: 'low' },
    'beer': { categories: [], level: 'low' },
    'wine (red)': { categories: [], level: 'low' },
    'wine (white)': { categories: [], level: 'low' },
    'gin': { categories: [], level: 'low' },
    'vodka': { categories: [], level: 'low' },
    'whisky': { categories: [], level: 'low' },
    'cranberry juice': { categories: [], level: 'low' },
    'orange juice': { categories: [], level: 'low' },

    // -------------------------------------------------------------------------
    // COMMON MEALS (PREPARED)
    // -------------------------------------------------------------------------
    // High FODMAP (Assumed standard recipes)
    'pizza': { categories: ['fructans', 'lactose'], level: 'high' }, // Wheat base, Cheese, Garlic/Onion sauce
    'burger': { categories: ['fructans'], level: 'high' }, // Wheat bun, Onion, Garlic
    'pasta carbonara': { categories: ['fructans', 'lactose'], level: 'high' },
    'lasagna': { categories: ['fructans', 'lactose'], level: 'high' },
    'curry': { categories: ['fructans', 'gos'], level: 'high' }, // Onion base
    'falafel': { categories: ['fructans', 'gos'], level: 'high' }, // Chickpeas + Garlic/Onion
    'burrito': { categories: ['fructans', 'gos'], level: 'high' }, // Wheat tortilla, Beans, Onion
    'tacos': { categories: ['fructans', 'gos'], level: 'high' }, // If wheat shell + onions
    'pad thai': { categories: ['fructans'], level: 'moderate' }, // Garlic/Shallots, but Rice noodles are safe
    'pho': { categories: ['fructans'], level: 'moderate' }, // Onion/white part of scallion often used in broth
    'ramen': { categories: ['fructans'], level: 'high' }, // Wheat noodles
    'sandwich': { categories: ['fructans'], level: 'high' }, // Wheat bread
    'bagel': { categories: ['fructans'], level: 'high' },
    'donut': { categories: ['fructans'], level: 'high' },
    'croissant': { categories: ['fructans', 'lactose'], level: 'high' },
    'pancakes': { categories: ['fructans', 'lactose'], level: 'high' }, // Wheat flour, Milk
    'waffles': { categories: ['fructans', 'lactose'], level: 'high' },
    'soup (canned)': { categories: ['fructans'], level: 'high' }, // Almost always has onion/garlic
    'french fries': { categories: [], level: 'low' }, // Generally safe (Potato + Oil)
    'sushi': { categories: [], level: 'low' }, // Safe if avocado/tempura avoided
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

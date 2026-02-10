// FODMAP Types and Data Structures

export type FODMAPCategory = 'fructans' | 'gos' | 'lactose' | 'excess-fructose' | 'polyols';
export type FODMAPLevel = 'high' | 'moderate' | 'low';

export interface FODMAPTag {
    categories: FODMAPCategory[];
    level: FODMAPLevel;
    culprits?: string[];
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

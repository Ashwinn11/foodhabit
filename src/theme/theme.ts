/**
 * Gut Buddy Strict Design System
 * Minimal, bright, saturated color palette: 
 * Sunshine Yellow, Sky Blue, Candy Pink, Black, White.
 */

export const colors = {
    // 🎨 Core Minimal Palette (Bright & Saturated)
    yellow: '#FCE762', // Sunshine Yellow
    blue: '#70CFFF',   // Sky Blue
    pink: '#FF7495',   // Candy Pink

    // 🌑 Neutrals
    black: '#2D2D2D',  // High-contrast Black
    white: '#FFFFFF',
    background: '#FFFFFF', // Changed to white for cleaner transitions
    border: '#E8D9C0',     // Minimal warm border
    iconInactive: '#A1A1A1', // Standard gray for inactive icons as per reference
    gradientBackground: ['#FFF9C4', '#FFFFFF', '#FDE1E8'], // Softened Yellow (TR) -> White (C) -> Softened Pink (BL)
} as const;

export const fonts = {
    heading: 'Chewy',
    body: 'Fredoka-Regular',
    bodyBold: 'Fredoka-SemiBold',
} as const;

export const fontSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
} as const;

export const radii = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
} as const;

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
} as const;

// 💩 Medical Consistency
export const bristolColors = {
    type1: '#5D4037',
    type2: '#6D4C41',
    type3: '#795548',
    type4: '#8D6E63',
    type5: '#A1887F',
    type6: '#BCAAA4',
    type7: '#D7CCC8',
} as const;

// 🧩 Component-specific mappings (using core colors)
export const moodIcons = {
    amazing: 'star',
    happy: 'happy',
    okay: 'thumbs-up',
    bloated: 'balloon',
    constipated: 'close-circle',
    urgent: 'warning',
} as const;

export const foodCategories = {
    breakfast: { icon: 'sunny', color: '#70CFFF' }, // Blue
    lunch: { icon: 'leaf', color: '#FCE762' },      // Using yellow for lunch in strict system
    dinner: { icon: 'moon', color: '#FF7495' },     // Pink
    snack: { icon: 'pizza', color: '#FF7495' },     // Pink
    drink: { icon: 'water', color: '#70CFFF' },     // Blue
} as const;

// 💖 Gut Avatar Moody Colors
export const avatarMoodColors = {
    amazing: { body: colors.yellow, cheeks: '#FF9B9B' },
    happy: { body: colors.blue, cheeks: '#FF9B9B' },
    okay: { body: colors.blue, cheeks: '#FF9B9B' },
    bloated: { body: colors.yellow, cheeks: '#FF9B9B' },
    constipated: { body: colors.pink, cheeks: '#FF9B9B' },
    urgent: { body: colors.pink, cheeks: '#FF9B9B' },
} as const;

export const theme = {
    colors,
    fonts,
    fontSizes,
    spacing,
    radii,
    shadows,
    bristolColors,
    moodIcons,
    foodCategories,
    avatarMoodColors,
} as const;

export type Theme = typeof theme;

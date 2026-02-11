/**
 * Gut Buddy STRICT Premium Design System
 * 
 * Adheres to a strict 4-color rule for maximum visual consistency.
 * 1. Primary (Brand/Trust) - Teal
 * 2. Secondary (Warmth/Alert) - Coral
 * 3. Ink (Text/Contrast) - Midnight
 * 4. Canvas (Background/Surface) - Paper
 */

const core = {
    teal: '#3AA7A3',    // Primary: Calm, Professional, Medical
    coral: '#FF7E67',   // Secondary: Energy, Highlights, Alerts
    midnight: '#1F2937',// Ink: Text, Icons, Structure
    paper: '#FFFFFF',   // Canvas: Clean backgrounds
} as const;

export const colors = {
    // 🎨 The 4 Pillars
    primary: core.teal,
    secondary: core.coral,
    text: core.midnight,
    background: core.paper,

    // 🌑 Semantic Mappings (All derived strictly from the 4 Pillars)

    // UI Surfaces
    surface: core.paper,
    card: core.paper,
    border: `${core.midnight}15`, // 15% Opacity Midnight

    // Text Layers
    textPrimary: core.midnight,
    textSecondary: `${core.midnight}99`, // 60% Opacity
    textTertiary: `${core.midnight}66`,  // 40% Opacity

    // Status / Functional (Mapped to dual colors)
    success: core.teal,  // Success is Primary
    error: core.coral,   // Error is Secondary
    warning: core.coral, // Warning is Secondary
    info: core.teal,     // Info is Primary

    // 🔄 Legacy/Backward Compatibility
    // Forced into the 2-hue system to maintain the 4-color rule
    blue: core.teal,
    green: core.teal,
    yellow: core.coral,
    pink: core.coral,
    red: core.coral,

    // Neutrals
    white: core.paper,
    black: core.midnight,
    lightGray: `${core.midnight}08`, // 5% Opacity
    mediumGray: `${core.midnight}66`,
    darkGray: core.midnight,

    // UI States
    iconInactive: `${core.midnight}40`,
} as const;

export const fonts = {
    heading: 'Fredoka-SemiBold',
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
        shadowColor: core.midnight,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    md: {
        shadowColor: core.midnight,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 5,
    },
    lg: {
        shadowColor: core.midnight,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 10,
    },
} as const;

// 💩 Medical Consistency (Exempt from 4-color rule as data)
export const bristolColors = {
    type1: '#5D4037',
    type2: '#6D4C41',
    type3: '#795548',
    type4: '#8D6E63',
    type5: '#A1887F',
    type6: '#BCAAA4',
    type7: '#D7CCC8',
} as const;

export const theme = {
    colors,
    fonts,
    fontSizes,
    spacing,
    radii,
    shadows,
    bristolColors,
} as const;

export type Theme = typeof theme;

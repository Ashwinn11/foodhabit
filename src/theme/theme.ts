/**
 * Gut Buddy Premium Design System
 * 
 * 3-color palette with warm coral consistency:
 * 1. Primary (Health/Trust) - Green
 * 2. Secondary (Warmth/Energy) - Coral
 * 3. Accent (Info/Interactive) - Blue
 * 4. Ink (Text/Contrast) - Midnight
 * 5. Canvas (Background/Surface) - Paper
 */

const core = {
    green: '#2ECC71',   // Primary: Health, Trust, Positive
    coral: '#FF7E67',   // Secondary: Energy, Warmth, Alerts
    blue: '#4A90D9',    // Accent: Info, Interactive, Selection
    midnight: '#1F2937',// Ink: Text, Icons, Structure
    paper: '#FFFFFF',   // Canvas: Clean backgrounds
} as const;

export const colors = {
    // 🎨 The Pillars
    primary: core.green,
    secondary: core.coral,
    accent: core.blue,
    text: core.midnight,
    background: core.paper,
    backgroundTint: '#F8FAFC', // Soft cool gray for screen backgrounds

    // UI Surfaces
    surface: core.paper,
    card: core.paper,
    border: `${core.midnight}12`, // 12% Opacity Midnight

    // Text Layers
    textPrimary: core.midnight,
    textSecondary: `${core.midnight}99`, // 60% Opacity
    textTertiary: `${core.midnight}66`,  // 40% Opacity

    // Status / Functional
    success: core.green,
    error: core.coral,
    warning: core.coral,
    info: core.blue,

    // Named Colors (properly distributed)
    blue: core.blue,
    green: core.green,
    yellow: '#F5A623',  // Warm amber, harmonizes with coral
    pink: core.coral,
    red: core.coral,

    // Neutrals
    white: core.paper,
    black: core.midnight,
    lightGray: `${core.midnight}08`,
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

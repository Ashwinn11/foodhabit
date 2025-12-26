/**
 * Playful Design System - Spacing & Shapes
 * Generous spacing and super-rounded corners
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

/**
 * Border Radius Values
 * "Super-ellipse" style softness
 */
export const borderRadius = {
  none: 0,
  xs: 8,   // Softened from 4
  sm: 12,  // Softened from 8
  md: 20,  // Major jump from 12 (very round cards)
  lg: 28,  // Major jump from 16
  xl: 36,  // Almost pill-shaped
  '2xl': 44,
  '3xl': 50,
  pill: 9999,
  circle: 9999,
} as const;

/**
 * Shadows
 * Softer, more colorful/diffused shadows if possible (keeping black for now but diffused)
 */
export const shadows = {
  none: {
    boxShadow: 'none',
    elevation: 0,
  },
  flat: {
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
    elevation: 0, // Flat usually means no elevation or very subtle
  },
  xs: {
    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  sm: {
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  md: {
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
    elevation: 6,
  },
  lg: {
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.12)',
    elevation: 10,
  },
  xl: {
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)',
    elevation: 15,
  },
  '2xl': {
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    elevation: 20,
  },
  // Playful brand shadows
  primary: {
    boxShadow: '0 8px 16px rgba(255, 118, 100, 0.3)',
    elevation: 8,
  },
  secondary: {
    boxShadow: '0 8px 16px rgba(165, 225, 166, 0.3)',
    elevation: 8,
  },
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;

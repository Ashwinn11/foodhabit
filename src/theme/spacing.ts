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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  flat: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 0, // Flat usually means no elevation or very subtle
  },
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 }, // Dropped slightly more
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 15,
  },
  '2xl': {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 20,
  },
  // Playful brand shadows
  primary: {
    shadowColor: '#ff7664',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  secondary: {
    shadowColor: '#A5E1A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;

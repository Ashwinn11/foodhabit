/**
 * Apple Design System - Spacing
 * Following Apple Human Interface Guidelines
 * Based on 8px grid system with Apple-specific values
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12, // Apple's preferred base spacing
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

/**
 * Apple-style border radius values
 * Apple uses continuous corner curves (squircles) but we approximate with standard border radius
 * These values are optimized for iOS-like rounded corners
 */
export const borderRadius = {
  none: 0,
  xs: 4, // Small elements
  sm: 8, // Buttons, small cards
  md: 12, // Standard cards, input fields
  lg: 16, // Large cards
  xl: 20, // Extra large cards
  '2xl': 24, // Modals, sheets
  '3xl': 28, // Extra large modals
  pill: 9999, // Pill-shaped buttons (Apple's signature)
  circle: 9999, // Circular elements
} as const;

/**
 * Apple-style shadow presets
 * Subtle, refined shadows that match iOS design language
 * Apple uses lighter, more diffused shadows compared to Material Design
 */
export const shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Subtle shadow for small interactive elements
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  // Small cards, buttons
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  // Standard cards
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  // Elevated cards, floating action buttons
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
  // Modals, sheets, overlays
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  // Maximum elevation for important overlays
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 16,
  },
} as const;

/**
 * Neumorphic shadow presets
 * Defines the geometry for light and dark shadows
 */
export const neumorphicShadows = {
  sm: {
    light: {
      shadowOffset: { width: -2, height: -2 },
      shadowOpacity: 1,
      shadowRadius: 4,
    },
    dark: {
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
    },
  },
  md: {
    light: {
      shadowOffset: { width: -6, height: -6 },
      shadowOpacity: 1,
      shadowRadius: 12,
    },
    dark: {
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 12,
    },
  },
  lg: {
    light: {
      shadowOffset: { width: -10, height: -10 },
      shadowOpacity: 1,
      shadowRadius: 20,
    },
    dark: {
      shadowOffset: { width: 10, height: 10 },
      shadowOpacity: 1,
      shadowRadius: 20,
    },
  },
  // Pressed state (Concave) - Simulated via inverted shadows or inner shadow logic
  // Note: True inner shadows are complex in RN. We often simulate this by
  // inverting the light/dark source or using a border.
  concave: {
    light: {
      shadowOffset: { width: 2, height: 2 }, // Inverted
      shadowOpacity: 1,
      shadowRadius: 4,
    },
    dark: {
      shadowOffset: { width: -2, height: -2 }, // Inverted
      shadowOpacity: 1,
      shadowRadius: 4,
    },
  }
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;

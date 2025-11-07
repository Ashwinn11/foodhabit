/**
 * Strict Design System - Color Palette
 * Only approved colors can be used throughout the app
 */

export const colors = {
  // Brand Colors - STRICT (only these colors allowed)
  brand: {
    primary: '#ff7664',    // Coral/Red - Primary brand color
    secondary: '#9bcbab',  // Mint Green - Secondary color
    tertiary: '#cda4e8',   // Lavender Purple - Tertiary color
    background: '#dedfe2', // Light Gray - Main app background
    black: '#000000',      // Pure Black
    white: '#ffffff',      // Pure White
  },

  // Legacy mappings for backwards compatibility
  primary: {
    500: '#ff7664',
    600: '#ff7664',
    700: '#ff7664',
  },

  secondary: {
    500: '#9bcbab',
    600: '#9bcbab',
    700: '#9bcbab',
  },

  // Background colors
  background: {
    primary: '#dedfe2',    // Main app background
    secondary: '#ffffff',  // Card backgrounds
    tertiary: '#ffffff',
    grouped: '#dedfe2',
    card: '#ffffff',
  },

  // Text colors - STRICT (only black or white)
  text: {
    primary: '#000000',   // Black text
    secondary: '#000000', // Black text (no opacity variations)
    tertiary: '#000000',
    inverse: '#ffffff',   // White text
    disabled: '#000000',
    placeholder: '#000000',
  },

  // Border/Separator colors
  border: {
    light: '#dedfe2',
    main: '#dedfe2',
    dark: '#000000',
    separator: '#dedfe2',
    opaque: '#dedfe2',
  },

  // Icon colors - STRICT (only brand colors)
  icon: {
    primary: '#ff7664',
    secondary: '#9bcbab',
    tertiary: '#cda4e8',
    white: '#ffffff',
    black: '#000000',
  },

  // Button colors
  button: {
    primary: '#ff7664',      // All buttons use primary color
    primaryText: '#ffffff',  // White text on buttons
  },

  // Neutral colors (minimal usage)
  neutral: {
    500: '#dedfe2',
    600: '#dedfe2',
    700: '#000000',
    900: '#000000',
  },
} as const;

export type ColorScheme = typeof colors;

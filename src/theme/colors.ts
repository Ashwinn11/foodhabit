/**
 * Design System - Color Palette
 * 
 * Design Principles:
 * - Dark Blue (#1A2332) is used for all screen backgrounds
 * - Primary Color (#ff7664) is used for buttons, accents, and interactive elements
 * - White text is used for dark backgrounds
 */

export const colors = {
  // ============================================
  // PRIMARY COLOR SYSTEM
  // ============================================
  // Primary color (#ff7664) - Used for buttons, accents, active states
  primary: {
    500: '#ff7664',  // Primary brand color
    600: '#ff7664',  // Same shade
    700: '#ff7664',  // Same shade
  },

  // Secondary colors - Accent colors
  secondary: {
    500: '#9bcbab',  // Mint Green
    600: '#9bcbab',
    700: '#9bcbab',
  },

  // Brand colors - Semantic naming
  brand: {
    primary: '#ff7664',    // Primary brand color (coral)
    secondary: '#9bcbab',  // Secondary color (mint green)
    tertiary: '#cda4e8',   // Tertiary color (lavender)
    white: '#ffffff',       // Pure White
    black: '#000000',       // Pure Black
  },

  // ============================================
  // BACKGROUND COLORS
  // ============================================
  // Dark Blue (#1A2332) - Used for all screen backgrounds
  background: {
    primary: '#1A2332',    // Main app background (dark blue/navy)
    secondary: '#1A2332',  // Secondary background (same as primary)
    tertiary: '#1A2332',   // Tertiary background (same as primary)
    grouped: '#1A2332',    // Grouped background (same as primary)
    card: '#1A2332',       // Card background (same as primary)
    screen: '#1A2332',     // Screen background (alias for primary)
  },

  // ============================================
  // TEXT COLORS
  // ============================================
  // White text for dark backgrounds
  text: {
    primary: '#ffffff',      // Primary text (white)
    secondary: '#B0B8C4',    // Secondary text (light gray)
    tertiary: '#8A94A6',     // Tertiary text (medium gray)
    inverse: '#000000',      // Inverse text (black for light backgrounds)
    disabled: '#6B7280',     // Disabled text (gray)
    placeholder: '#8A94A6', // Placeholder text
  },

  // ============================================
  // BORDER COLORS
  // ============================================
  // Borders for dark backgrounds
  border: {
    light: 'rgba(255, 255, 255, 0.1)',    // Light border (subtle white)
    main: 'rgba(255, 255, 255, 0.15)',    // Main border
    dark: 'rgba(0, 0, 0, 0.2)',            // Dark border
    separator: 'rgba(255, 255, 255, 0.1)', // Separator border
    opaque: 'rgba(255, 255, 255, 0.2)',   // Opaque border
  },

  // ============================================
  // ICON COLORS
  // ============================================
  icon: {
    primary: '#ff7664',      // Primary icon color
    secondary: '#9bcbab',    // Secondary icon color
    tertiary: '#cda4e8',      // Tertiary icon color
    white: '#ffffff',         // White icons
    black: '#000000',         // Black icons
    default: '#ffffff',       // Default icon color (white)
  },

  // ============================================
  // BUTTON COLORS
  // ============================================
  button: {
    primary: '#ff7664',      // Primary button background
    primaryText: '#ffffff',   // Primary button text (white)
    secondary: 'transparent', // Secondary button (transparent)
    secondaryText: '#ff7664', // Secondary button text (primary color)
  },

  // ============================================
  // NEUMORPHISM COLORS
  // ============================================
  // Colors for neumorphic design elements
  neumorphism: {
    base: '#1A2332',          // Base color (dark blue)
    lightShadow: '#2A3441',   // Light shadow (lighter dark blue)
    darkShadow: '#0F1419',    // Dark shadow (darker blue)
    border: 'rgba(255, 255, 255, 0.1)', // Border
    text: '#ffffff',          // Text color
    secondaryText: '#B0B8C4', // Secondary text
  },

  // ============================================
  // NEUTRAL COLORS
  // ============================================
  // Neutral grays (minimal usage)
  neutral: {
    500: '#8A94A6',
    600: '#6B7280',
    700: '#4B5563',
    900: '#1F2937',
  },
} as const;

export type ColorScheme = typeof colors;

/**
 * Design System - Color Palette
 * 
 * Design Principles:
 * - Dark Blue (#1A2332) is used for the main background
 * - Primary Color (#ff7664) is used for buttons, accents, and interactive elements
 * - Text colors are strictly black or white for high contrast
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

  // Brand colors - Semantic naming (strictly from the provided list)
  brand: {
    primary: '#ff7664',    // Primary brand color
    secondary: '#9bcbab',  // Secondary color
    tertiary: '#cda4e8',   // Tertiary color
    white: '#ffffff',       // Pure White
    black: '#000000',       // Pure Black
  },

  // ============================================
  // BACKGROUND COLORS
  // ============================================
  background: {
    primary: '#1a2332',    // Main app background
    secondary: '#1a2332',  // Secondary background (same as primary)
    tertiary: '#1a2332',   // Tertiary background (same as primary)
    grouped: '#1f1f1f',    // Grouped background (slightly lighter for distinction)
    card: '#1f1f1f',       // Card background (slightly lighter for distinction)
    screen: '#1a2332',     // Screen background (alias for primary)
    field: '#1f1f1f',      // Input field background (slightly lighter for distinction)
  },

  // ============================================
  // TEXT COLORS
  // ============================================
  text: {
    primary: '#ffffff',      // Primary text (white)
    secondary: '#ffffff',    // Secondary text (white, no other shade available)
    tertiary: '#ffffff',     // Tertiary text (white, no other shade available)
    inverse: '#000000',      // Inverse text (black for light backgrounds if needed)
    disabled: '#ffffff',     // Disabled text (white, no other shade available)
    placeholder: '#ffffff', // Placeholder text (white, transparent)
  },

  // ============================================
  // BORDER COLORS
  // ============================================
  // Borders for dark backgrounds, using transparent white for subtle effect
  border: {
    light: 'rgba(255, 255, 255, 0.1)',    // Subtle white border
    main: 'rgba(255, 255, 255, 0.15)',    // Main border
    dark: 'rgba(0, 0, 0, 0.2)',            // Dark border (can be used on light elements)
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
  // FEEDBACK COLORS (Added for safety)
  // ============================================
  feedback: {
    success: '#9bcbab',
    warning: '#f1c40f', // Standard warning yellow
    error: '#ff7664',   // Using primary red/orange as error or a distinct red? 
                        // Since primary is #ff7664 (Coral), let's use a slightly stronger red for error 
                        // or just map to primary if that's the design.
                        // I'll use a standard red for error to distinguish from brand if needed, 
                        // but usually error is red.
    info: '#3498db',
  }
} as const;

export type ColorScheme = typeof colors;
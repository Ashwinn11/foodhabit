/**
 * Apple Design System - Color Palette
 * Following Apple Human Interface Guidelines (HIG) 2025
 * Inspired by Apple's "Liquid Glass" design system
 */

export const colors = {
  // Primary colors (Warm coral/salmon for food & wellness)
  primary: {
    50: '#FFF5F3',
    100: '#FFE8E5',
    200: '#FFD1CB',
    300: '#FFBAB1',
    400: '#FFA397',
    500: '#ff7664', // Main brand color
    600: '#FF5B47',
    700: '#F4422D',
    800: '#D63521',
    900: '#B82A19',
  },

  // Secondary colors (Apple's vibrant orange)
  secondary: {
    50: '#FFF4E6',
    100: '#FFE4BF',
    200: '#FFD299',
    300: '#FFC073',
    400: '#FFB357',
    500: '#FF9500', // Apple System Orange
    600: '#F58800',
    700: '#E67B00',
    800: '#D66E00',
    900: '#BA5A00',
  },

  // Neutral/Gray scale (Apple's refined neutrals)
  neutral: {
    50: '#FAFAFA',
    100: '#F2F2F7', // Apple System Gray 6
    200: '#E5E5EA', // Apple System Gray 5
    300: '#D1D1D6', // Apple System Gray 4
    400: '#C7C7CC', // Apple System Gray 3
    500: '#AEAEB2', // Apple System Gray 2
    600: '#8E8E93', // Apple System Gray
    700: '#636366', // Apple Label Secondary
    800: '#48484A', // Apple Label Tertiary
    900: '#1C1C1E', // Apple Label Primary
  },

  // Semantic colors (complementary to coral theme)
  success: {
    light: '#62C665',
    main: '#34C759', // Apple System Green
    dark: '#289E45',
  },

  error: {
    light: '#FF6961',
    main: '#FF3B30', // Apple System Red
    dark: '#D32F2F',
  },

  warning: {
    light: '#FFB357',
    main: '#FF9500', // Apple System Orange
    dark: '#E67B00',
  },

  info: {
    light: '#64B5F6',
    main: '#007AFF', // Apple System Blue
    dark: '#0051D5',
  },

  // App-specific backgrounds (Apple's refined backgrounds)
  background: {
    primary: '#FFFFFF', // System Background
    secondary: '#F2F2F7', // Secondary System Background
    tertiary: '#FFFFFF', // Tertiary System Background
    grouped: '#F2F2F7', // System Grouped Background
    card: '#FFFFFF', // Card/elevated surface
    blur: 'rgba(255, 255, 255, 0.72)', // Frosted glass effect
  },

  // Text colors (Apple's label hierarchy)
  text: {
    primary: '#000000', // Label (primary text)
    secondary: '#3C3C43', // Secondary Label (60% opacity)
    tertiary: '#3C3C4399', // Tertiary Label (30% opacity)
    quaternary: '#3C3C432E', // Quaternary Label (18% opacity)
    disabled: '#3C3C432E',
    inverse: '#FFFFFF',
    placeholder: '#3C3C4399',
  },

  // Border/Separator colors
  border: {
    light: '#F2F2F7',
    main: '#E5E5EA',
    dark: '#D1D1D6',
    separator: '#3C3C4349', // Separator color (29% opacity)
    opaque: '#C6C6C8', // Opaque separator
  },

  // iOS System Colors (Official Apple Colors)
  ios: {
    blue: '#007AFF',
    brown: '#A2845E',
    cyan: '#32ADE6',
    green: '#34C759',
    indigo: '#5856D6',
    mint: '#00C7BE',
    orange: '#FF9500',
    pink: '#FF2D55',
    purple: '#AF52DE',
    red: '#FF3B30',
    teal: '#30B0C7',
    yellow: '#FFCC00',
  },

  // Apple's elevated/fill colors
  fill: {
    primary: 'rgba(120, 120, 128, 0.20)',
    secondary: 'rgba(120, 120, 128, 0.16)',
    tertiary: 'rgba(118, 118, 128, 0.12)',
    quaternary: 'rgba(116, 116, 128, 0.08)',
  },

  // Overlay colors for modal/sheet backdrops
  overlay: {
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

export type ColorScheme = typeof colors;

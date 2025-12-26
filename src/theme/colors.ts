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

  // Brand colors - Semantic naming (strictly from the provided list)
  brand: {
    coral: '#ff7664',    // Primary brand color (Coral)
    teal: '#A5E1A6',  // Secondary brand color  - for success/positive states
    purple: '#cda4e8',   // Tertiary color (Purple)
    cream: '#FCEFDE',      // Cream (Light background)
    white: '#ffffff',      // Pure White
    black: '#000000',      // Pure Black
  },


  // ============================================
  // TEXT COLORS
  // ============================================
  text: {
    white: '#ffffff',      // Primary text (white)
    black: '#000000',      // Inverse text (black for light backgrounds if needed)
  },
  
} as const;

export type ColorScheme = typeof colors;
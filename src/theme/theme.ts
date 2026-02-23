export const theme = {
  colors: {
    // Backgrounds
    background: '#080A09',
    surface: '#111410',
    surfaceElevated: '#1A1E18',
    surfaceHover: '#212620',
    border: '#1F2420',
    borderSubtle: '#161A15',

    // Brand
    primary: '#D4F870',
    primaryForeground: '#080A09',
    primaryMuted: '#D4F87020',

    // Semantic food safety
    safe: '#6DBE8C',
    safeMuted: '#6DBE8C18',
    caution: '#F5C97A',
    cautionMuted: '#F5C97A18',
    danger: '#E05D4C',
    dangerMuted: '#E05D4C18',

    // Text
    text: '#F0F2EE',
    textSecondary: '#8A9186',
    textTertiary: '#4A5248',

    // Utility
    success: '#6DBE8C',
    warning: '#F5C97A',
    error: '#E05D4C',
    overlay: 'rgba(8,10,9,0.85)',
  },

  fonts: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    display: 'PlayfairDisplay_700Bold',
  },

  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 22,
    xxl: 30,
    full: 999,
  },

  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
    },
    glow: {
      shadowColor: '#D4F870',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 10,
    },
  },
} as const;

export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;

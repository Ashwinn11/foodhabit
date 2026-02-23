export const theme = {
  colors: {
    /* =====================
       Backgrounds (Nebula)
       ===================== */
    background: '#060A14', // ✅ exact nebula background
    surface: 'rgba(255,255,255,0.03)',
    surfaceElevated: 'rgba(255,255,255,0.05)',
    surfaceHover: 'rgba(255,255,255,0.07)',
    surfaceProminent: 'rgba(255,255,255,0.12)',
    border: 'rgba(255,255,255,0.06)',
    borderSubtle: 'rgba(255,255,255,0.04)',
    borderProminent: 'rgba(255,255,255,0.18)',

    /* =====================
       Brand
       ===================== */
    primary: '#FF4D4D',
    primaryForeground: '#040508',
    primaryMuted: 'rgba(255,77,77,0.18)',

    /* =====================
       Semantic
       ===================== */
    safe: '#6DBE8C',
    safeMuted: 'rgba(109,190,140,0.18)',
    caution: '#F5C97A',
    cautionMuted: 'rgba(245,201,122,0.18)',
    danger: '#E05D4C',
    dangerMuted: 'rgba(224,93,76,0.18)',

    /* =====================
       Text
       ===================== */
    text: '#ECEEF3',
    textSecondary: '#8E96A3',
    textTertiary: 'rgba(142,150,163,0.8)',

    /* =====================
       Utility
       ===================== */
    success: '#6DBE8C',
    warning: '#F5C97A',
    error: '#E05D4C',
    overlay: 'rgba(4,5,8,0.88)',
  },

  fonts: {
    regular: 'NunitoSans_400Regular',
    medium: 'NunitoSans_500Medium',
    semibold: 'NunitoSans_600SemiBold',
    bold: 'NunitoSans_700Bold',
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
      shadowOpacity: 0.28,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.38,
      shadowRadius: 8,
      elevation: 6,
    },
    glow: {
      shadowColor: '#FF4D4D',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 14,
      elevation: 10,
    },
  },
} as const;

export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
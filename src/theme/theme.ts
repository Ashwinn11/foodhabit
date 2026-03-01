export const theme = {
  colors: {
    /* =====================
       Backgrounds
       ===================== */
    background: '#0B1219',
    surface: 'rgba(255,255,255,0.035)',
    surfaceElevated: 'rgba(255,255,255,0.055)',
    surfaceHover: 'rgba(255,255,255,0.075)',
    surfaceProminent: 'rgba(255,255,255,0.12)',
    border: 'rgba(255,255,255,0.07)',
    borderSubtle: 'rgba(255,255,255,0.04)',
    borderProminent: 'rgba(255,255,255,0.16)',

    /* =====================
       Brand
       ===================== */
    primary: '#2EBD81',
    primaryForeground: '#0B1219',
    primaryMuted: 'rgba(46,189,129,0.15)',

    /* =====================
       Semantic
       ===================== */
    safe: '#5AAF7B',
    safeMuted: 'rgba(90,175,123,0.14)',
    caution: '#D4A95A',
    cautionMuted: 'rgba(212,169,90,0.14)',
    danger: '#C75050',
    dangerMuted: 'rgba(199,80,80,0.14)',

    /* =====================
       Text
       ===================== */
    text: '#E2E6ED',
    textSecondary: '#7E8A9A',
    textTertiary: 'rgba(126,138,154,0.7)',

    /* =====================
       Utility
       ===================== */
    success: '#5AAF7B',
    warning: '#D4A95A',
    error: '#C75050',
    overlay: 'rgba(8,14,20,0.88)',
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
      shadowOpacity: 0.32,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.42,
      shadowRadius: 8,
      elevation: 6,
    },
    glow: {
      shadowColor: '#2EBD81',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.22,
      shadowRadius: 14,
      elevation: 10,
    },
  },
} as const;

export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
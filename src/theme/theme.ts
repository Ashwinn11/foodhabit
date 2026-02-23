export const theme = {
  colors: {
    // Backgrounds
    background: '#080A09', // Deeper, more luxurious dark
    surface: '#121613',    // Soft surface
    surfaceElevated: '#1A201C',
    
    // Brand Colors
    primary: '#D4F870',    // Chartreuse (Safe/Primary)
    primaryMuted: 'rgba(212, 248, 112, 0.2)',
    secondary: '#E05D4C',  // Terracotta (Risky/Alert)
    accent: '#F5C97A',     // Warm Amber (Caution)
    
    // Interactive
    interactive: '#D4F870',
    disabled: 'rgba(255, 255, 255, 0.1)',
    
    // Status
    success: '#82E0AA',
    warning: '#F8C471',
    error: '#EC7063',
    info: '#85C1E9',

    // Text
    text: {
      primary: '#F5F5F0',   // Bone White
      secondary: '#A3A8A4', // Muted Pine
      tertiary: '#6B726E',  // Deeper Muted
      inverse: '#080A09',
      primaryMuted: 'rgba(245, 245, 240, 0.7)',
    },

    // Borders & Lines
    border: 'rgba(212, 248, 112, 0.12)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    divider: 'rgba(255, 255, 255, 0.03)',

    // Special
    glass: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
  },
  
  spacing: {
    none: 0,
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    giant: 48,
    massive: 64,
    colossal: 80,
    hero: 120,
  },

  radii: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },

  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 4,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 8,
    },
    glow: {
      shadowColor: '#D4F870',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
    },
    glowSmall: {
      shadowColor: '#D4F870',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 5,
    }
  },

  typography: {
    fonts: {
      display: 'Inter_700Bold',
      displayItalic: 'Inter_400Regular',
      body: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      bold: 'Inter_600SemiBold',
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.2,
      extraWide: 0.5,
      editorial: 1,
    }
  }
};

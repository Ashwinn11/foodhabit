/**
 * Playful & Cute Design System - Typography
 * Friendly, rounded, and accessible text styles
 * 
 * Design Goals:
 * - Playful: Uses rounded sans-serif (Nunito)
 * - Readable: Generous line height and spacing
 * - Soft: Avoids harsh hierarchies
 */

import { TextStyle } from 'react-native';

/**
 * Font families (Nunito for a rounded, friendly look)
 */
export const fontFamily = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  light: 'Nunito_300Light',
} as const;

/**
 * Font sizes
 */
export const fontSize = {
  11: 11,
  12: 12,
  13: 13,
  15: 15,
  16: 16,
  17: 17,
  20: 20,
  22: 22,
  28: 28,
  34: 34,
} as const;

/**
 * Line heights (Increased for a breezier, friendlier feel)
 */
export const lineHeight = {
  13: 16,   
  16: 19,   
  18: 22,   
  20: 24,   
  21: 25,   
  22: 26,   
  25: 30,   
  28: 34,   
  34: 40,   
  41: 46,   
} as const;

/**
 * Letter spacing (Wider for a more open, playful vibe)
 */
export const letterSpacing = {
  tight: 0,        // No negative tracking (too serious)
  normal: 0.2,     // Slight breathe
  wide: 0.5,       // Open and friendly
} as const;

/**
 * Semantic Text Styles
 */
export const typography = {
  /**
   * Large Title (34pt)
   * Hero text, main headers
   */
  largeTitle: {
    fontFamily: fontFamily.bold, // Bolder for cuteness
    fontSize: fontSize[34],
    lineHeight: lineHeight[41],
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  /**
   * Title 1 (28pt)
   */
  title1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize[28],
    lineHeight: lineHeight[34],
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  /**
   * Title 2 (22pt)
   */
  title2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize[22],
    lineHeight: lineHeight[28],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  /**
   * Title 3 (20pt)
   */
  title3: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize[20],
    lineHeight: lineHeight[25],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  /**
   * Headline (17pt)
   */
  headline: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize[17],
    lineHeight: lineHeight[22],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  /**
   * Body (17pt)
   */
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize[17],
    lineHeight: lineHeight[22],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  /**
   * Callout (16pt)
   */
  callout: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize[16],
    lineHeight: lineHeight[21],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  /**
   * Subheadline (15pt)
   */
  subheadline: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize[15],
    lineHeight: lineHeight[20],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  /**
   * Footnote (13pt)
   */
  footnote: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize[13],
    lineHeight: lineHeight[18],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  /**
   * Caption 1 (12pt)
   */
  caption1: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize[12],
    lineHeight: lineHeight[16],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  /**
   * Caption 2 (11pt)
   */
  caption2: {
    fontFamily: fontFamily.medium, // Bumped weight for legibility
    fontSize: fontSize[11],
    lineHeight: lineHeight[13],
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  // Additional semantic styles

  bodyEmphasized: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize[17],
    lineHeight: lineHeight[22],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  calloutEmphasized: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize[16],
    lineHeight: lineHeight[21],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  captionEmphasized: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize[12],
    lineHeight: lineHeight[16],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  buttonLarge: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize[17],
    lineHeight: lineHeight[22],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  buttonMedium: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize[15],
    lineHeight: lineHeight[20],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  buttonSmall: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize[13],
    lineHeight: lineHeight[18],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  labelSmall: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize[11],
    lineHeight: lineHeight[13],
    letterSpacing: letterSpacing.wide,
  } as TextStyle,
} as const;

/**
 * Legacy aliases
 */
export const legacyTypography = {
  h1: typography.largeTitle,
  h2: typography.title1,
  h3: typography.title2,
  h4: typography.title3,
  h5: typography.headline,
  h6: typography.headline,

  bodyLarge: typography.body,
  body: typography.callout,
  bodySmall: typography.subheadline,

  button: typography.buttonMedium,
  buttonLarge: typography.buttonLarge,
  buttonSmall: typography.buttonSmall,

  label: typography.callout,
  labelSmall: typography.labelSmall,

  caption: typography.caption1,

  subtitle1: typography.body,
  subtitle2: typography.callout,

  footnote: typography.footnote,
} as const;

export const allTypography = {
  ...typography,
  ...legacyTypography,
} as const;

export type Typography = typeof allTypography;
export type SemanticTextStyle = keyof typeof typography;
export type LegacyTextStyle = keyof typeof legacyTypography;
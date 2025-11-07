/**
 * Apple Design System - Typography
 * Following Apple Human Interface Guidelines text styles
 * Semantic approach with proper visual hierarchy
 *
 * Apple's typography system uses 11 semantic text styles:
 * - Large Title, Title 1-3, Headline, Body, Callout, Subheadline, Footnote, Caption 1-2
 *
 * Font Selection:
 * - SF Pro Display: 20pt or larger (we use Poppins SemiBold/Bold)
 * - SF Pro Text: Smaller than 20pt (we use Poppins Regular/Medium)
 */

import { TextStyle } from 'react-native';

/**
 * Font families (Poppins as SF Pro alternative)
 */
export const fontFamily = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  light: 'Poppins_300Light',
} as const;

/**
 * Font sizes based on Apple's iOS text styles
 */
export const fontSize = {
  11: 11,  // Caption 2
  12: 12,  // Caption 1
  13: 13,  // Footnote
  15: 15,  // Subheadline
  16: 16,  // Callout
  17: 17,  // Body, Headline
  20: 20,  // Title 3
  22: 22,  // Title 2
  28: 28,  // Title 1
  34: 34,  // Large Title
} as const;

/**
 * Line heights (leading) for optimal readability
 * Based on Apple's specifications
 */
export const lineHeight = {
  13: 13,   // Caption 2
  16: 16,   // Caption 1
  18: 18,   // Footnote
  20: 20,   // Subheadline
  21: 21,   // Callout
  22: 22,   // Body, Headline
  25: 25,   // Title 3
  28: 28,   // Title 2
  34: 34,   // Title 1
  41: 41,   // Large Title
} as const;

/**
 * Letter spacing (tracking) values
 * Apple uses specific tracking for different sizes
 */
export const letterSpacing = {
  tight: -0.41,    // Large sizes (tighter)
  normal: 0,       // Standard text
  wide: 0.38,      // Small sizes (wider for legibility)
} as const;

/**
 * Apple's Semantic Text Styles
 * Use these instead of raw h1, h2, etc. for semantic clarity
 */
export const typography = {
  /**
   * Large Title (34pt)
   * Use for: Main page headings, hero text
   * Weight: SemiBold (reduced from Bold for lighter appearance)
   * Example: "Settings", "Music"
   */
  largeTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize[34],
    lineHeight: lineHeight[41],
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  /**
   * Title 1 (28pt)
   * Use for: Primary section headings, important titles
   * Weight: SemiBold (reduced from Bold for lighter appearance)
   * Example: "Library", "For You"
   */
  title1: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize[28],
    lineHeight: lineHeight[34],
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  /**
   * Title 2 (22pt)
   * Use for: Secondary section headings
   * Weight: SemiBold (reduced from Bold for lighter appearance)
   * Example: Card titles, modal headers
   */
  title2: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize[22],
    lineHeight: lineHeight[28],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  /**
   * Title 3 (20pt)
   * Use for: Tertiary headings, subsection titles
   * Weight: Medium (reduced from SemiBold for lighter appearance)
   * Example: List section headers
   */
  title3: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize[20],
    lineHeight: lineHeight[25],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  /**
   * Headline (17pt)
   * Use for: Emphasizing primary content, list item titles
   * Weight: Medium (reduced from SemiBold for lighter appearance)
   * Example: Item names in lists, emphasized text
   */
  headline: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize[17],
    lineHeight: lineHeight[22],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  /**
   * Body (17pt)
   * Use for: Main body text, primary content
   * Weight: Regular
   * Example: Article text, descriptions, messages
   * Most commonly used text style
   */
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize[17],
    lineHeight: lineHeight[22],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  /**
   * Callout (16pt)
   * Use for: Supplementary text, secondary content
   * Weight: Regular
   * Example: Secondary descriptions, annotations
   */
  callout: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize[16],
    lineHeight: lineHeight[21],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  /**
   * Subheadline (15pt)
   * Use for: List item subtitles, additional details
   * Weight: Regular
   * Example: Secondary info in lists, metadata
   */
  subheadline: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize[15],
    lineHeight: lineHeight[20],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  /**
   * Footnote (13pt)
   * Use for: Small informational text, attributions
   * Weight: Regular
   * Example: Timestamps, bylines, legal text
   */
  footnote: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize[13],
    lineHeight: lineHeight[18],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  /**
   * Caption 1 (12pt)
   * Use for: Very small text, image captions
   * Weight: Regular
   * Example: Photo captions, tiny labels
   */
  caption1: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize[12],
    lineHeight: lineHeight[16],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  /**
   * Caption 2 (11pt)
   * Use for: The smallest readable text
   * Weight: Regular
   * Example: Fine print, minimum size labels
   * Minimum recommended size per Apple HIG
   */
  caption2: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize[11],
    lineHeight: lineHeight[13],
    letterSpacing: letterSpacing.wide,
  } as TextStyle,

  // Additional semantic styles for specific use cases

  /**
   * Body Emphasized
   * Use for: Emphasized body text without changing hierarchy
   * Weight: Medium
   */
  bodyEmphasized: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize[17],
    lineHeight: lineHeight[22],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  /**
   * Callout Emphasized
   * Use for: Emphasized callout text
   * Weight: Medium
   */
  calloutEmphasized: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize[16],
    lineHeight: lineHeight[21],
    letterSpacing: letterSpacing.normal,
  } as TextStyle,
} as const;

/**
 * Legacy aliases for backward compatibility
 * These map to Apple's semantic styles
 * Prefer using semantic names (largeTitle, body, etc.) over these
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

  button: typography.headline,
  buttonLarge: typography.headline,
  buttonSmall: typography.body,

  label: typography.callout,
  labelSmall: typography.subheadline,

  caption: typography.caption1,

  subtitle1: typography.body,
  subtitle2: typography.callout,

  footnote: typography.footnote,
} as const;

/**
 * Complete typography object (semantic + legacy)
 */
export const allTypography = {
  ...typography,
  ...legacyTypography,
} as const;

export type Typography = typeof allTypography;
export type SemanticTextStyle = keyof typeof typography;
export type LegacyTextStyle = keyof typeof legacyTypography;

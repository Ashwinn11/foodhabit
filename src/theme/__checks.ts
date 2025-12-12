/**
 * Design System Type Guards and Validators
 * This file helps catch design system violations at compile time
 */

import { theme } from './index';

/**
 * Enforce that only design system colors are used
 * Type-safe wrapper to prevent hardcoded hex values
 */
export type ValidColor =
  | typeof theme.colors.brand[keyof typeof theme.colors.brand]
  | typeof theme.colors.primary[keyof typeof theme.colors.primary]
  | typeof theme.colors.secondary[keyof typeof theme.colors.secondary]
  | typeof theme.colors.text[keyof typeof theme.colors.text]
  | typeof theme.colors.background[keyof typeof theme.colors.background]
  | typeof theme.colors.border[keyof typeof theme.colors.border]
  | typeof theme.colors.button[keyof typeof theme.colors.button];

/**
 * Use this to enforce color validation at compile time
 * Example: const myColor: StrictColor = theme.colors.brand.primary;
 */
export type StrictColor = ValidColor;

/**
 * Enforce that only design system typography is used
 * Type-safe wrapper to prevent hardcoded fontSize/fontFamily
 */
export type ValidTypography =
  | typeof theme.typography['largeTitle']
  | typeof theme.typography['title1']
  | typeof theme.typography['title2']
  | typeof theme.typography['title3']
  | typeof theme.typography['headline']
  | typeof theme.typography['body']
  | typeof theme.typography['callout']
  | typeof theme.typography['subheadline']
  | typeof theme.typography['footnote']
  | typeof theme.typography['caption1']
  | typeof theme.typography['caption2'];

/**
 * Enforce that only design system spacing is used
 * Type-safe wrapper to prevent hardcoded pixel values
 */
export type ValidSpacing =
  | typeof theme.spacing['xs']
  | typeof theme.spacing['sm']
  | typeof theme.spacing['md']
  | typeof theme.spacing['lg']
  | typeof theme.spacing['xl']
  | typeof theme.spacing['2xl']
  | typeof theme.spacing['3xl'];

/**
 * Enforce that only design system border radius is used
 */
export type ValidBorderRadius =
  | typeof theme.borderRadius['none']
  | typeof theme.borderRadius['xs']
  | typeof theme.borderRadius['sm']
  | typeof theme.borderRadius['md']
  | typeof theme.borderRadius['lg']
  | typeof theme.borderRadius['xl']
  | typeof theme.borderRadius['2xl']
  | typeof theme.borderRadius['3xl']
  | typeof theme.borderRadius['pill']
  | typeof theme.borderRadius['circle'];

/**
 * Enforce that only design system shadows are used
 */
export type ValidShadow =
  | typeof theme.shadows['sm']
  | typeof theme.shadows['md']
  | typeof theme.shadows['lg']
  | typeof theme.shadows['xl'];

/**
 * Helper to ensure color is from theme
 */
export const assertValidColor = (color: StrictColor): StrictColor => color;

/**
 * Helper to ensure typography is from theme
 */
export const assertValidTypography = (typography: ValidTypography): ValidTypography => typography;

/**
 * Helper to ensure spacing is from theme
 */
export const assertValidSpacing = (spacing: ValidSpacing): ValidSpacing => spacing;

/**
 * Helper to ensure border radius is from theme
 */
export const assertValidBorderRadius = (radius: ValidBorderRadius): ValidBorderRadius => radius;

/**
 * Helper to ensure shadow is from theme
 */
export const assertValidShadow = (shadow: ValidShadow): ValidShadow => shadow;

/**
 * Detect common hardcoded color patterns (hex codes)
 * This is a compile-time check to catch hardcoded colors
 */
export type NoHexColors<T extends string> = T extends `#${infer _}` ? never : T;

/**
 * Detect common hardcoded font size patterns
 * This is a compile-time check to catch hardcoded fontSize values
 */
export type NoDirectFontSize<T extends number> = T extends 12 | 14 | 16 | 18 | 20 | 24 | 28 | 32 | 36 ? never : T;

/**
 * Enforce that only reusable components are used for common patterns
 * Instead of inline styles, use Container, Text, Card, Input, Button components
 */
export const RequiredComponentUsage = {
  /**
   * Use <Text> component instead of <RNText>
   * with theme typography and colors
   */
  TEXT: 'Use <Text> component from ./components with typography variant',

  /**
   * Use <Container> component instead of raw <View>
   * with proper padding and background colors
   */
  CONTAINER: 'Use <Container> component from ./components with variant prop',

  /**
   * Use <Card> component instead of <View> with StyleSheet
   * for consistent card styling
   */
  CARD: 'Use <Card> component from ./components with padding and variant props',

  /**
   * Use <Button> component instead of custom buttons
   * with consistent touch feedback and styling
   */
  BUTTON: 'Use <Button> component from ./components',
} as const;

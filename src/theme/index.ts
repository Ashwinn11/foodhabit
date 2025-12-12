/**
 * Apple Design System - Theme Barrel Export
 * Complete design system following Apple Human Interface Guidelines
 */

export * from './colors';
export * from './spacing';
export * from './typography';
export * from './responsive';
export * from './animations';
export * from './haptics';

import { colors } from './colors';
import { spacing, borderRadius, shadows } from './spacing';
import { allTypography as typography, fontFamily, fontSize, lineHeight, letterSpacing } from './typography';
import {
  screen,
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  moderateScale,
  responsive,
  hp,
  vp,
  adaptiveSpacing,
  adaptiveFontSize,
  isTablet,
  isSmallDevice,
  getDeviceSize,
} from './responsive';
import { duration, easing, springConfig, animations, layoutAnimations } from './animations';
import { hapticFeedback, hapticPatterns } from './haptics';

/**
 * Complete theme object
 */
export const theme = {
  colors,
  spacing,
  borderRadius,
  shadows,

  typography,
  fontFamily,
  fontSize,
  lineHeight,
  letterSpacing,
  screen,
  isTablet: isTablet(),
  isSmallDevice: isSmallDevice(),
  deviceSize: getDeviceSize(),
  animations: {
    duration,
    easing,
    springConfig,
    animations,
    layoutAnimations,
  },
} as const;

/**
 * Responsive utilities
 */
export const r = {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  moderateScale,
  responsive,
  hp,
  vp,
  adaptiveSpacing,
  adaptiveFontSize,
} as const;

/**
 * Haptic feedback utilities
 */
export const haptics = {
  ...hapticFeedback,
  patterns: hapticPatterns,
} as const;

export type Theme = typeof theme;

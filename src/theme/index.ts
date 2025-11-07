/**
 * Theme system barrel export
 * Import everything you need from here
 */

export * from './colors';
export * from './spacing';
export * from './typography';
export * from './responsive';

import { colors } from './colors';
import { spacing, borderRadius, shadows } from './spacing';
import { typography, fontFamily, fontSize, lineHeight, letterSpacing } from './typography';
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

export type Theme = typeof theme;

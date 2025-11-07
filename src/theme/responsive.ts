/**
 * Responsive design utilities
 * Based on common iOS device dimensions
 */

import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Device breakpoints (based on common iOS devices)
 */
export const breakpoints = {
  small: 375,    // iPhone SE, iPhone 13 mini
  medium: 390,   // iPhone 13, iPhone 13 Pro
  large: 428,    // iPhone 13 Pro Max, iPhone 14 Plus
  tablet: 768,   // iPad mini
  desktop: 1024, // iPad Pro
} as const;

/**
 * Get current device size category
 */
export const getDeviceSize = (): 'small' | 'medium' | 'large' | 'tablet' | 'desktop' => {
  if (SCREEN_WIDTH >= breakpoints.desktop) return 'desktop';
  if (SCREEN_WIDTH >= breakpoints.tablet) return 'tablet';
  if (SCREEN_WIDTH >= breakpoints.large) return 'large';
  if (SCREEN_WIDTH >= breakpoints.medium) return 'medium';
  return 'small';
};

/**
 * Check if device is a tablet
 */
export const isTablet = (): boolean => {
  return SCREEN_WIDTH >= breakpoints.tablet;
};

/**
 * Check if device has a small screen
 */
export const isSmallDevice = (): boolean => {
  return SCREEN_WIDTH < breakpoints.medium;
};

/**
 * Get screen dimensions
 */
export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < breakpoints.medium,
  isMedium: SCREEN_WIDTH >= breakpoints.medium && SCREEN_WIDTH < breakpoints.large,
  isLarge: SCREEN_WIDTH >= breakpoints.large && SCREEN_WIDTH < breakpoints.tablet,
  isTablet: SCREEN_WIDTH >= breakpoints.tablet,
} as const;

/**
 * Scale value based on screen width (relative to iPhone 13: 390px)
 */
const baseWidth = 390;
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / baseWidth) * size;
};

/**
 * Scale value based on screen height (relative to iPhone 13: 844px)
 */
const baseHeight = 844;
export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / baseHeight) * size;
};

/**
 * Scale font size with pixel ratio (for crisp text on all devices)
 */
export const scaleFontSize = (size: number): number => {
  const scale = SCREEN_WIDTH / baseWidth;
  const newSize = size * scale;

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }

  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * Moderately scale (less aggressive scaling)
 * Good for spacing and padding
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scaleWidth(size) - size) * factor;
};

/**
 * Responsive value selector
 * Returns different values based on device size
 */
export const responsive = <T,>(values: {
  small?: T;
  medium?: T;
  large?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}): T => {
  const deviceSize = getDeviceSize();

  if (values[deviceSize] !== undefined) {
    return values[deviceSize] as T;
  }

  return values.default;
};

/**
 * Horizontal scale (for widths, horizontal margins/padding)
 */
export const hp = (percentage: number): number => {
  return (percentage / 100) * SCREEN_WIDTH;
};

/**
 * Vertical scale (for heights, vertical margins/padding)
 */
export const vp = (percentage: number): number => {
  return (percentage / 100) * SCREEN_HEIGHT;
};

/**
 * Minimum dimension scale
 * Useful for ensuring consistent sizing on both orientations
 */
export const minScale = (size: number): number => {
  const minDimension = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT);
  return (minDimension / baseWidth) * size;
};

/**
 * Maximum dimension scale
 */
export const maxScale = (size: number): number => {
  const maxDimension = Math.max(SCREEN_WIDTH, SCREEN_HEIGHT);
  return (maxDimension / baseHeight) * size;
};

/**
 * Get adaptive spacing based on screen size
 */
export const adaptiveSpacing = {
  xs: responsive({ small: 2, medium: 4, large: 4, default: 4 }),
  sm: responsive({ small: 6, medium: 8, large: 8, default: 8 }),
  md: responsive({ small: 12, medium: 16, large: 16, default: 16 }),
  lg: responsive({ small: 18, medium: 24, large: 24, default: 24 }),
  xl: responsive({ small: 24, medium: 32, large: 32, default: 32 }),
} as const;

/**
 * Get adaptive font sizes
 */
export const adaptiveFontSize = {
  xs: responsive({ small: 11, medium: 12, large: 12, default: 12 }),
  sm: responsive({ small: 13, medium: 14, large: 14, default: 14 }),
  md: responsive({ small: 15, medium: 16, large: 16, default: 16 }),
  lg: responsive({ small: 17, medium: 18, large: 18, default: 18 }),
  xl: responsive({ small: 19, medium: 20, large: 20, default: 20 }),
  '2xl': responsive({ small: 22, medium: 24, large: 24, default: 24 }),
  '3xl': responsive({ small: 28, medium: 30, large: 32, default: 30 }),
} as const;

export type DeviceSize = 'small' | 'medium' | 'large' | 'tablet' | 'desktop';

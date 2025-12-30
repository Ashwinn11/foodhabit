/**
 * Apple Design System - Haptic Feedback
 * Providing tactile feedback for user interactions
 * Using Expo Haptics API
 */

import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback types based on Apple's haptic engine
 */
export const hapticFeedback = {
  /**
   * Light impact - for subtle interactions
   * Use for: Toggle switches, picker selections
   */
  light: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /**
   * Medium impact - for standard interactions
   * Use for: Button taps, list item selections
   */
  medium: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /**
   * Heavy impact - for significant interactions
   * Use for: Confirmations, important actions
   */
  heavy: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  /**
   * Success notification - for successful operations
   * Use for: Successful form submissions, task completions
   */
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /**
   * Warning notification - for warnings
   * Use for: Validation errors, warnings
   */
  warning: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  /**
   * Error notification - for errors
   * Use for: Failed operations, critical errors
   */
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  /**
   * Selection feedback - for picker/selector changes
   * Use for: Scrolling through picker values, slider adjustments
   */
  selection: () => {
    Haptics.selectionAsync();
  },

  /**
   * Rigid impact - for precise, crisp feedback
   * iOS 13+ only
   */
  rigid: () => {
    if (Haptics.ImpactFeedbackStyle.Rigid) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    } else {
      // Fallback to medium for older iOS versions
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  /**
   * Soft impact - for gentle, smooth feedback
   * iOS 13+ only
   */
  soft: () => {
    if (Haptics.ImpactFeedbackStyle.Soft) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    } else {
      // Fallback to light for older iOS versions
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },
} as const;

/**
 * Contextual haptic helpers
 * Pre-configured haptic patterns for common UI interactions
 */
export const hapticPatterns = {
  // Button interactions
  buttonPress: hapticFeedback.medium,
  buttonPressLight: hapticFeedback.light,
  buttonPressHeavy: hapticFeedback.heavy,

  // Toggle/Switch
  toggle: hapticFeedback.light,

  // Card/List item tap
  cardTap: hapticFeedback.light,

  // Pull to refresh
  pullToRefresh: hapticFeedback.medium,

  // Navigation
  tabSwitch: hapticFeedback.selection,
  screenTransition: hapticFeedback.light,

  // Form interactions
  inputFocus: hapticFeedback.light,
  inputError: hapticFeedback.error,
  formSubmitSuccess: hapticFeedback.success,
  formSubmitError: hapticFeedback.error,

  // Confirmations
  confirm: hapticFeedback.success,
  cancel: hapticFeedback.light,
  delete: hapticFeedback.warning,

  // Gestures
  swipe: hapticFeedback.selection,
  longPress: hapticFeedback.medium,

  // Feedback
  success: hapticFeedback.success,
  error: hapticFeedback.error,
  warning: hapticFeedback.warning,
} as const;

/**
 * Utility to check if haptics are available
 */
export const isHapticsAvailable = async (): Promise<boolean> => {
  // Expo Haptics is available on iOS and some Android devices
  // This is a simple check - actual availability depends on device hardware
  return true;
};

export type HapticFeedback = typeof hapticFeedback;
export type HapticPatterns = typeof hapticPatterns;

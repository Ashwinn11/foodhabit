/**
 * Apple Design System - Animation Constants
 * Following Apple Human Interface Guidelines for smooth, natural motion
 * Based on iOS animation curves and durations
 */

/**
 * Animation durations (in milliseconds)
 * Apple prefers quick, snappy animations
 */
export const duration = {
  instant: 0,
  fast: 200, // Quick interactions
  normal: 300, // Standard animations
  slow: 400, // Page transitions
  slower: 500, // Modal presentations
} as const;

/**
 * Animation easing curves
 * Apple's signature curves for natural motion
 */
export const easing = {
  // Standard iOS ease curve
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',

  // Deceleration curve (ease-out) - Element entering
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',

  // Acceleration curve (ease-in) - Element exiting
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',

  // Sharp curve for quick transitions
  sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',

  // Spring-like bounce (iOS signature)
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',

  // Smooth ease in and out
  easeInOut: 'cubic-bezier(0.42, 0.0, 0.58, 1.0)',
} as const;

/**
 * Spring animation configurations
 * For React Native Animated.spring()
 */
export const springConfig = {
  // Gentle spring with minimal bounce
  gentle: {
    damping: 15,
    mass: 1,
    stiffness: 150,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },

  // Standard spring (Apple default)
  default: {
    damping: 20,
    mass: 1,
    stiffness: 200,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },

  // Bouncy spring for playful interactions
  bouncy: {
    damping: 10,
    mass: 1,
    stiffness: 100,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },

  // Stiff spring for quick, responsive feel
  stiff: {
    damping: 26,
    mass: 1,
    stiffness: 300,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
} as const;

/**
 * Common animation presets
 * Pre-configured animation settings for typical use cases
 */
export const animations = {
  // Button press animation
  buttonPress: {
    scale: 0.96,
    duration: duration.fast,
  },

  // Card press animation
  cardPress: {
    scale: 0.98,
    duration: duration.fast,
  },

  // Fade in animation
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: duration.normal,
  },

  // Fade out animation
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: duration.normal,
  },

  // Slide up animation (for modals)
  slideUp: {
    from: { translateY: 100 },
    to: { translateY: 0 },
    duration: duration.slow,
  },

  // Slide down animation
  slideDown: {
    from: { translateY: 0 },
    to: { translateY: 100 },
    duration: duration.slow,
  },

  // Scale in animation
  scaleIn: {
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: duration.normal,
  },

  // Scale out animation
  scaleOut: {
    from: { scale: 1, opacity: 1 },
    to: { scale: 0.9, opacity: 0 },
    duration: duration.normal,
  },
} as const;

/**
 * Layout animation presets for LayoutAnimation API
 */
export const layoutAnimations = {
  spring: {
    duration: duration.normal,
    create: {
      type: 'spring' as const,
      property: 'opacity' as const,
      springDamping: 0.7,
    },
    update: {
      type: 'spring' as const,
      springDamping: 0.7,
    },
    delete: {
      type: 'spring' as const,
      property: 'opacity' as const,
      springDamping: 0.7,
    },
  },
  easeInEaseOut: {
    duration: duration.normal,
    create: {
      type: 'easeInEaseOut' as const,
      property: 'opacity' as const,
    },
    update: {
      type: 'easeInEaseOut' as const,
    },
    delete: {
      type: 'easeInEaseOut' as const,
      property: 'opacity' as const,
    },
  },
  linear: {
    duration: duration.fast,
    create: {
      type: 'linear' as const,
      property: 'opacity' as const,
    },
    update: {
      type: 'linear' as const,
    },
    delete: {
      type: 'linear' as const,
      property: 'opacity' as const,
    },
  },
} as const;

export type Duration = typeof duration;
export type Easing = typeof easing;
export type SpringConfig = typeof springConfig;
export type Animations = typeof animations;

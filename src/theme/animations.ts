/**
 * Playful Design System - Animation Constants
 * Bouncy, fun, and responsive motion
 */

/**
 * Animation durations (in milliseconds)
 */
export const duration = {
  instant: 0,
  fast: 200, 
  normal: 350, // Slightly slower to show off the bounce
  slow: 500, 
  slower: 700, 
} as const;

/**
 * Animation easing curves
 */
export const easing = {
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  
  // Extra bouncy spring curve
  spring: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)', // Back-bow effect
  
  easeInOut: 'cubic-bezier(0.42, 0.0, 0.58, 1.0)',
} as const;

/**
 * Spring animation configurations
 * Tuned for maximum playfulness
 */
export const springConfig = {
  // Gentle wobble
  gentle: {
    damping: 12,
    mass: 1,
    stiffness: 120,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },

  // Standard Playful Bounce (New Default)
  default: {
    damping: 12, // Lower damping = more bounce
    mass: 1,
    stiffness: 150,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },

  // Super Bouncy (for success states/mascots)
  bouncy: {
    damping: 8,
    mass: 1,
    stiffness: 180,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },

  // Stiff but rubbery
  stiff: {
    damping: 20,
    mass: 1,
    stiffness: 250,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
} as const;

/**
 * Common animation presets
 */
export const animations = {
  buttonPress: {
    scale: 0.92, // Deeper press for cartoon feel
    duration: duration.fast,
  },

  cardPress: {
    scale: 0.96,
    duration: duration.fast,
  },

  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: duration.normal,
  },

  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: duration.normal,
  },

  slideUp: {
    from: { translateY: 150 },
    to: { translateY: 0 },
    duration: duration.slow,
  },

  slideDown: {
    from: { translateY: 0 },
    to: { translateY: 150 },
    duration: duration.slow,
  },

  // Pop in effect
  scaleIn: {
    from: { scale: 0.5, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: duration.normal,
  },

  scaleOut: {
    from: { scale: 1, opacity: 1 },
    to: { scale: 0.5, opacity: 0 },
    duration: duration.normal,
  },
} as const;

/**
 * Layout animation presets
 */
export const layoutAnimations = {
  spring: {
    duration: duration.normal,
    create: {
      type: 'spring' as const,
      property: 'scaleXY' as const,
      springDamping: 0.6, // Bouncy!
    },
    update: {
      type: 'spring' as const,
      springDamping: 0.6,
    },
    delete: {
      type: 'spring' as const,
      property: 'opacity' as const,
      springDamping: 0.6,
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
import {
    withTiming,
    withSpring,
    withRepeat,
    withSequence,
    withDelay,
    Easing,
} from 'react-native-reanimated';

// Card entrance: translateY 16→0, opacity 0→1, 0.3s
export const cardEntrance = {
    translateY: (delay = 0): number =>
        withDelay(delay, withTiming(0, { duration: 300, easing: Easing.bezier(0.34, 1.56, 0.64, 1) })),
    opacity: (delay = 0): number =>
        withDelay(delay, withTiming(1, { duration: 300 })),
    initialTranslateY: 16,
    initialOpacity: 0,
};

// Staggered list: 80ms delay per card
export const staggerDelay = (index: number): number => index * 80;

// Button press animation
export const buttonPress = {
    onPressIn: 0.95,
    onPressOut: (): number =>
        withSequence(
            withSpring(1.05, { damping: 12, stiffness: 200 }),
            withSpring(1.0, { damping: 12, stiffness: 200 })
        ),
};

// Badge pop: 0.5 → 1.1 → 1.0
export const badgePop = (): number =>
    withSequence(
        withTiming(1.1, { duration: 200, easing: Easing.out(Easing.ease) }),
        withSpring(1.0, { damping: 12, stiffness: 200 })
    );

// Gut score ring animation: 1.2s
export const scoreRingDuration = 1200;

// Streak flame oscillation
export const flameAnimation = (): number =>
    withRepeat(
        withSequence(
            withTiming(1.1, { duration: 500 }),
            withTiming(1.0, { duration: 500 })
        ),
        -1,
        true
    );

// Shimmer skeleton: opacity 0.4 → 0.8 → 0.4, 1.2s infinite
export const shimmerAnimation = (): number =>
    withRepeat(
        withSequence(
            withTiming(0.8, { duration: 600 }),
            withTiming(0.4, { duration: 600 })
        ),
        -1,
        true
    );

// Float animation for mascot: translateY 0→-8→0, rotation -1→1 deg, 3s
export const floatAnimation = {
    translateY: (): number =>
        withRepeat(
            withSequence(
                withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        ),
    rotation: (): number =>
        withRepeat(
            withSequence(
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(-1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        ),
};

// Progress bar width animation
export const progressBarAnimation = (finalWidth: number): number =>
    withTiming(finalWidth, { duration: 800, easing: Easing.out(Easing.ease) });

// Speech bubble spring scale-in
export const speechBubbleSpring = (): number =>
    withSpring(1, { damping: 14, stiffness: 160 });

import React, { useEffect } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { shadows, radii, colors } from '@/theme';

interface CardProps extends ViewProps {
    animated?: boolean;
    delay?: number;
    elevated?: boolean;
    /** Adds a fun colored left-accent stripe */
    accent?: string;
}

export function Card({ animated = true, delay = 0, elevated = false, accent, style, children, ...props }: CardProps): React.JSX.Element {
    const translateY = useSharedValue(animated ? 22 : 0);
    const opacity = useSharedValue(animated ? 0 : 1);
    const scale = useSharedValue(animated ? 0.97 : 1);

    useEffect(() => {
        if (animated) {
            // Spring overshoot → feels alive
            translateY.value = withDelay(
                delay,
                withSpring(0, { damping: 14, stiffness: 180, mass: 0.8 })
            );
            opacity.value = withDelay(delay, withTiming(1, { duration: 220 }));
            scale.value = withDelay(
                delay,
                withSpring(1, { damping: 14, stiffness: 200, mass: 0.8 })
            );
        }
    }, [animated, delay]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }, { scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    backgroundColor: colors.surface,
                    borderRadius: radii.card + 2,
                    padding: 16,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: colors.border,
                    ...(elevated ? shadows.elevated : shadows.card),
                    ...(accent ? {
                        borderLeftWidth: 4,
                        borderLeftColor: accent,
                    } : {}),
                },
                animatedStyle,
                style,
            ]}
            {...props}
        >
            {children}
        </Animated.View>
    );
}

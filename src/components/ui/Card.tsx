import React, { useEffect } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming, Easing } from 'react-native-reanimated';
import { shadows, radii, colors } from '@/theme';

interface CardProps extends ViewProps {
    animated?: boolean;
    delay?: number;
    elevated?: boolean;
}

export function Card({ animated = true, delay = 0, elevated = false, style, children, ...props }: CardProps): React.JSX.Element {
    const translateY = useSharedValue(animated ? 16 : 0);
    const opacity = useSharedValue(animated ? 0 : 1);

    useEffect(() => {
        if (animated) {
            translateY.value = withDelay(
                delay,
                withTiming(0, { duration: 300, easing: Easing.bezier(0.34, 1.56, 0.64, 1) })
            );
            opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
        }
    }, [animated, delay]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    backgroundColor: colors.surface,
                    borderRadius: radii.card,
                    padding: 16,
                    ...(elevated ? shadows.elevated : shadows.card),
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

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import AnimatedMascot, { MascotExpression } from '@/components/AnimatedMascot';
import { colors } from '@/theme';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    message: string;
    mascotExpression?: MascotExpression;
    action?: React.ReactNode;
}

export function EmptyState({ icon, title, message, mascotExpression = 'okay', action }: EmptyStateProps): React.JSX.Element {
    // Mascot bounces in from below
    const mascotY = useSharedValue(30);
    const mascotOpacity = useSharedValue(0);
    const mascotScale = useSharedValue(0.7);

    // Title slides up with delay
    const titleY = useSharedValue(16);
    const titleOpacity = useSharedValue(0);

    // Message fades in last
    const msgOpacity = useSharedValue(0);

    // Action bounces in
    const actionScale = useSharedValue(0.7);
    const actionOpacity = useSharedValue(0);

    useEffect(() => {
        mascotY.value = withSpring(0, { damping: 14, stiffness: 180 });
        mascotOpacity.value = withTiming(1, { duration: 300 });
        mascotScale.value = withSpring(1, { damping: 12, stiffness: 220 });

        titleY.value = withDelay(160, withSpring(0, { damping: 16, stiffness: 200 }));
        titleOpacity.value = withDelay(160, withTiming(1, { duration: 280 }));

        msgOpacity.value = withDelay(280, withTiming(1, { duration: 300 }));

        actionScale.value = withDelay(380, withSpring(1, { damping: 12, stiffness: 240 }));
        actionOpacity.value = withDelay(380, withTiming(1, { duration: 250 }));
    }, []);

    const mascotStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: mascotY.value }, { scale: mascotScale.value }],
        opacity: mascotOpacity.value,
    }));

    const titleStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: titleY.value }],
        opacity: titleOpacity.value,
    }));

    const msgStyle = useAnimatedStyle(() => ({ opacity: msgOpacity.value }));

    const actionStyle = useAnimatedStyle(() => ({
        transform: [{ scale: actionScale.value }],
        opacity: actionOpacity.value,
    }));

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 36, gap: 14 }}>
            <Animated.View style={mascotStyle}>
                <AnimatedMascot expression={mascotExpression} size={88} />
            </Animated.View>

            {icon && (
                <View style={{ marginTop: 4 }}>{icon}</View>
            )}

            <Animated.View style={titleStyle}>
                <Text variant="title" color={colors.text1} style={{ textAlign: 'center', fontSize: 18 }}>
                    {title}
                </Text>
            </Animated.View>

            <Animated.View style={msgStyle}>
                <Text variant="body" color={colors.text2} style={{ textAlign: 'center', lineHeight: 22 }}>
                    {message}
                </Text>
            </Animated.View>

            {action && (
                <Animated.View style={[{ marginTop: 8 }, actionStyle]}>
                    {action}
                </Animated.View>
            )}
        </View>
    );
}

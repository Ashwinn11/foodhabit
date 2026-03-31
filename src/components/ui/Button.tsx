import React, { useEffect } from 'react';
import { Pressable, type PressableProps, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withRepeat,
    withSequence,
    withSpring,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { colors, radii, shadows } from '@/theme';
import { haptics } from '@/theme/haptics';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'dark';

interface ButtonProps extends Omit<PressableProps, 'style'> {
    title: string;
    variant?: ButtonVariant;
    icon?: React.ReactNode;
    loading?: boolean;
    fullWidth?: boolean;
    style?: any;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const variantColors: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
    primary: { bg: colors.primary.DEFAULT, text: '#FFFFFF' },
    outline: { bg: 'transparent', text: colors.primary.DEFAULT, border: colors.primary.DEFAULT },
    ghost: { bg: 'transparent', text: colors.text2 },
    dark: { bg: colors.dark, text: '#FFFFFF' },
};

// Bouncing dot for playful loading indicator
function BounceDot({ delay, color }: { delay: number; color: string }) {
    const ty = useSharedValue(0);
    useEffect(() => {
        ty.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(-6, { duration: 280, easing: Easing.out(Easing.quad) }),
                    withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) }),
                    withTiming(0, { duration: 100 }) // small pause at bottom
                ),
                -1,
                false
            )
        );
    }, []);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }));
    return (
        <Animated.View
            style={[
                {
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: color,
                    marginHorizontal: 2.5,
                },
                animStyle,
            ]}
        />
    );
}

export function Button({ title, variant = 'primary', icon, loading, fullWidth, style, onPress, ...props }: ButtonProps): React.JSX.Element {
    const scale = useSharedValue(1);
    const variantColor = variantColors[variant];

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = (): void => {
        scale.value = withTiming(0.93, { duration: 80, easing: Easing.out(Easing.quad) });
    };

    const handlePressOut = (): void => {
        // Fun spring bounce-back
        scale.value = withSpring(1, { damping: 10, stiffness: 300, mass: 0.5 });
    };

    const handlePress = (e: any): void => {
        haptics.buttonTap();
        onPress?.(e);
    };

    const dotColor = variant === 'outline' || variant === 'ghost'
        ? colors.primary.DEFAULT
        : '#FFFFFF';

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            disabled={loading}
            style={[
                {
                    backgroundColor: variantColor.bg,
                    borderRadius: radii.btn + 6, // rounder = more fun
                    paddingVertical: 14,
                    paddingHorizontal: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    ...(variant === 'outline' ? { borderWidth: 2, borderColor: variantColor.border } : {}),
                    ...(variant === 'primary' ? shadows.button : {}),
                    ...(fullWidth ? { width: '100%' } : {}),
                },
                animatedStyle,
                style,
            ]}
            {...props}
        >
            {loading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', height: 22 }}>
                    <BounceDot delay={0} color={dotColor} />
                    <BounceDot delay={160} color={dotColor} />
                    <BounceDot delay={320} color={dotColor} />
                </View>
            ) : (
                <>
                    {icon}
                    <Text
                        variant={variant === 'ghost' ? 'label' : 'bodyBold'}
                        color={variantColor.text}
                    >
                        {title}
                    </Text>
                </>
            )}
        </AnimatedPressable>
    );
}

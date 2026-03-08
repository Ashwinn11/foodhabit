import React from 'react';
import { Pressable, type PressableProps, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence } from 'react-native-reanimated';
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

export function Button({ title, variant = 'primary', icon, loading, fullWidth, style, onPress, ...props }: ButtonProps): React.JSX.Element {
    const scale = useSharedValue(1);
    const variantColor = variantColors[variant];

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = (): void => {
        scale.value = withSpring(0.95, { damping: 12, stiffness: 200 });
    };

    const handlePressOut = (): void => {
        scale.value = withSequence(
            withSpring(1.05, { damping: 12, stiffness: 200 }),
            withSpring(1.0, { damping: 12, stiffness: 200 })
        );
    };

    const handlePress = (e: any): void => {
        haptics.buttonTap();
        onPress?.(e);
    };

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            disabled={loading}
            style={[
                {
                    backgroundColor: variantColor.bg,
                    borderRadius: radii.btn,
                    paddingVertical: 14,
                    paddingHorizontal: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    ...(variant === 'outline' ? { borderWidth: 1.5, borderColor: variantColor.border } : {}),
                    ...(variant === 'primary' ? shadows.button : {}),
                    ...(fullWidth ? { width: '100%' } : {}),
                    opacity: loading ? 0.7 : 1,
                },
                animatedStyle,
                style,
            ]}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variantColor.text} size="small" />
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

import React from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme';
import { haptics } from '@/theme/haptics';

interface ChipProps extends Omit<PressableProps, 'style'> {
    label: string;
    selected?: boolean;
    icon?: React.ReactNode;
    style?: any;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Chip({ label, selected = false, icon, style, onPress, ...props }: ChipProps): React.JSX.Element {
    const scale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = (): void => {
        scale.value = withTiming(0.92, { duration: 80, easing: Easing.out(Easing.quad) });
    };

    const handlePressOut = (): void => {
        // Springy bounce-back
        scale.value = withSpring(1, { damping: 8, stiffness: 300, mass: 0.5 });
    };

    const handlePress = (e: any): void => {
        haptics.buttonTap();
        // Quick little pulse on selection
        scale.value = withSequence(
            withTiming(1.08, { duration: 80 }),
            withSpring(1, { damping: 10, stiffness: 320 })
        );
        onPress?.(e);
    };

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={[
                {
                    backgroundColor: selected ? colors.primary.light : colors.surface,
                    borderWidth: selected ? 2 : 1.5,
                    borderColor: selected ? colors.primary.DEFAULT : colors.border,
                    borderRadius: 999, // full pill — max fun
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    // subtle inner shadow when selected
                    ...(selected ? {
                        shadowColor: colors.primary.DEFAULT,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                        elevation: 3,
                    } : {}),
                },
                animStyle,
                style,
            ]}
            {...props}
        >
            {icon}
            <Text
                variant="labelBold"
                color={selected ? colors.primary.DEFAULT : colors.text1}
            >
                {label}
            </Text>
        </AnimatedPressable>
    );
}

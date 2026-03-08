import React from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { colors, radii } from '@/theme';
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
        scale.value = withSpring(0.95, { damping: 12, stiffness: 200 });
    };

    const handlePressOut = (): void => {
        scale.value = withSpring(1.0, { damping: 12, stiffness: 200 });
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
            style={[
                {
                    backgroundColor: selected ? colors.primary.light : colors.surface,
                    borderWidth: 1.5,
                    borderColor: selected ? colors.primary.DEFAULT : colors.border,
                    borderRadius: radii.chip,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                },
                animStyle,
                style,
            ]}
            {...props}
        >
            {icon}
            <Text
                variant="label"
                color={selected ? colors.primary.DEFAULT : colors.text2}
            >
                {label}
            </Text>
        </AnimatedPressable>
    );
}

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { colors } from '@/theme';

interface ProgressDotsProps {
    total: number;
    current: number;
}

/** Individual animated progress dot */
function ProgressDot({ filled }: { filled: boolean }) {
    const width = useSharedValue(8);
    const opacity = useSharedValue(filled ? 1 : 0.4);

    useEffect(() => {
        if (filled) {
            // Active dot: expand into a wide capsule + pop
            width.value = withSpring(28, { damping: 14, stiffness: 220, mass: 0.6 });
            opacity.value = withTiming(1, { duration: 200 });
        } else {
            width.value = withSpring(8, { damping: 14, stiffness: 220 });
            opacity.value = withTiming(0.4, { duration: 200 });
        }
    }, [filled]);

    const dotStyle = useAnimatedStyle(() => ({
        width: width.value,
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.primary.DEFAULT,
                },
                dotStyle,
            ]}
        />
    );
}

export function ProgressDots({ total, current }: ProgressDotsProps): React.JSX.Element {
    return (
        <View style={{ paddingHorizontal: 24, paddingVertical: 12, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                {Array.from({ length: total }).map((_, i) => (
                    <ProgressDot key={i} filled={i === current} />
                ))}
            </View>
        </View>
    );
}

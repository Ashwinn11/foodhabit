import React, { useEffect } from 'react';
import { ViewStyle, ImageStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';

// Load the newly generated transparent background mascot
const MascotImage = require('../../assets/happy.webp');

interface AnimatedMascotProps {
    size?: number;
    style?: ImageStyle;
}

export default function AnimatedMascot({ size = 150, style }: AnimatedMascotProps) {
    // Shared values for creating a smooth floating / breathing effect
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const rotate = useSharedValue(0);

    useEffect(() => {
        // Initial "Hi" Waving Gesture
        rotate.value = withSequence(
            withTiming(15, { duration: 250, easing: Easing.inOut(Easing.ease) }),
            withTiming(-12, { duration: 250, easing: Easing.inOut(Easing.ease) }),
            withTiming(15, { duration: 250, easing: Easing.inOut(Easing.ease) }),
            withTiming(-8, { duration: 250, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 250, easing: Easing.inOut(Easing.ease) }) // returns to 0
        );

        // A smooth floating up and down animation 
        translateY.value = withRepeat(
            withSequence(
                withTiming(-8, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
            ),
            -1, // infinite loop
            true // reverse on callback (yo-yo effect)
        );

        // An extremely subtle expansion/contraction breathing effect
        scale.value = withRepeat(
            withSequence(
                withTiming(1.02, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.99, { duration: 1800, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: translateY.value },
                { scale: scale.value },
                { rotateZ: `${rotate.value}deg` }
            ],
            // Transform origin near the bottom center feels more natural for a full body wave
            transformOrigin: 'bottom center',
        };
    });

    return (
        <Animated.Image
            source={MascotImage}
            style={[
                { width: size, height: size, resizeMode: 'contain' },
                animatedStyle,
                style,
            ]}
        />
    );
}

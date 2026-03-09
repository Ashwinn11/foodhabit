import React, { useEffect } from 'react';
import { View, ImageStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme';

// Load assets
const HAPPY = require('../../assets/happy.webp');
const OKAY = require('../../assets/okay.webp');
const SAD = require('../../assets/sad.webp');

export type MascotExpression = 'happy' | 'okay' | 'sad';

interface AnimatedMascotProps {
    expression?: MascotExpression;
    size?: number;
    message?: string;
    showBubble?: boolean;
    style?: ImageStyle;
}

export default function AnimatedMascot({
    expression = 'happy',
    size = 150,
    message,
    showBubble = false,
    style
}: AnimatedMascotProps) {
    // Shared values for creating a smooth floating / breathing effect
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const rotate = useSharedValue(0);
    const bubbleScale = useSharedValue(0);

    const getMascotImage = () => {
        switch (expression) {
            case 'okay': return OKAY;
            case 'sad': return SAD;
            default: return HAPPY;
        }
    };

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

        if (showBubble && message) {
            bubbleScale.value = withTiming(1, { duration: 300 });
        } else {
            bubbleScale.value = withTiming(0);
        }
    }, [showBubble, message]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: translateY.value },
                { scale: scale.value },
                { rotateZ: `${rotate.value}deg` }
            ],
            transformOrigin: 'bottom center',
        };
    });

    const bubbleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: bubbleScale.value }],
    }));

    return (
        <View style={{ alignItems: 'center' }}>
            {showBubble && message && (
                <Animated.View
                    style={[
                        {
                            backgroundColor: colors.surface,
                            borderRadius: 14,
                            borderBottomRightRadius: 0,
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            marginBottom: 8,
                            maxWidth: 200,
                            shadowColor: 'rgba(44,120,70,0.08)',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 1,
                            shadowRadius: 8,
                            elevation: 2,
                        },
                        bubbleStyle,
                    ]}
                >
                    <Text variant="caption" color={colors.text2} style={{ lineHeight: 14 }}>
                        {message}
                    </Text>
                </Animated.View>
            )}
            <Animated.Image
                source={getMascotImage()}
                style={[
                    { width: size, height: size, resizeMode: 'contain' },
                    animatedStyle,
                    style,
                ]}
            />
        </View>
    );
}

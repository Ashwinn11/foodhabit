import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Ellipse, Circle, Path, G } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, withSpring, Easing } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors } from '@/theme';

type MascotExpression = 'happy' | 'neutral' | 'sad';

interface GutBuddyMascotProps {
    expression?: MascotExpression;
    size?: number;
    message?: string;
    showBubble?: boolean;
}

export function GutBuddyMascot({ expression = 'happy', size = 100, message, showBubble = false }: GutBuddyMascotProps): React.JSX.Element {
    const translateY = useSharedValue(0);
    const rotation = useSharedValue(0);
    const bubbleScale = useSharedValue(0);

    useEffect(() => {
        // Float animation
        translateY.value = withRepeat(
            withSequence(
                withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        rotation.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(-1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        if (showBubble && message) {
            bubbleScale.value = withSpring(1, { damping: 14, stiffness: 160 });
        }
    }, [showBubble, message]);

    const floatStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { rotate: `${rotation.value}deg` },
        ],
    }));

    const bubbleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: bubbleScale.value }],
    }));

    // Eye expression
    const getEyeProps = () => {
        switch (expression) {
            case 'happy':
                return { eyeHeight: 0.7, mouthCurve: 8 };
            case 'neutral':
                return { eyeHeight: 0.85, mouthCurve: 4 };
            case 'sad':
                return { eyeHeight: 1.0, mouthCurve: -4 };
        }
    };

    const { eyeHeight, mouthCurve } = getEyeProps();
    const svgSize = size;
    const cx = svgSize / 2;
    const cy = svgSize / 2;
    const bodyRx = svgSize * 0.38;
    const bodyRy = svgSize * 0.35;

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
            <Animated.View style={floatStyle}>
                <Svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                    {/* Body */}
                    <Ellipse
                        cx={cx}
                        cy={cy + 2}
                        rx={bodyRx}
                        ry={bodyRy}
                        fill="#A8E6C3"
                    />
                    <Ellipse
                        cx={cx}
                        cy={cy}
                        rx={bodyRx - 2}
                        ry={bodyRy - 2}
                        fill="#B8F0D0"
                    />

                    {/* Sprout */}
                    <Path
                        d={`M${cx} ${cy - bodyRy + 4} Q${cx - 6} ${cy - bodyRy - 12} ${cx - 2} ${cy - bodyRy - 16}`}
                        stroke="#6BBF8A"
                        strokeWidth={2}
                        fill="none"
                    />
                    <Ellipse
                        cx={cx - 5}
                        cy={cy - bodyRy - 16}
                        rx={5}
                        ry={4}
                        fill="#6BBF8A"
                    />
                    <Ellipse
                        cx={cx + 3}
                        cy={cy - bodyRy - 12}
                        rx={4}
                        ry={3}
                        fill="#82D4A0"
                    />

                    {/* Eyes */}
                    <Ellipse
                        cx={cx - svgSize * 0.12}
                        cy={cy - svgSize * 0.04}
                        rx={svgSize * 0.05}
                        ry={svgSize * 0.05 * eyeHeight}
                        fill="#1C2B20"
                    />
                    <Ellipse
                        cx={cx + svgSize * 0.12}
                        cy={cy - svgSize * 0.04}
                        rx={svgSize * 0.05}
                        ry={svgSize * 0.05 * eyeHeight}
                        fill="#1C2B20"
                    />

                    {/* Eye highlights */}
                    <Circle
                        cx={cx - svgSize * 0.10}
                        cy={cy - svgSize * 0.07}
                        r={svgSize * 0.018}
                        fill="#FFFFFF"
                    />
                    <Circle
                        cx={cx + svgSize * 0.14}
                        cy={cy - svgSize * 0.07}
                        r={svgSize * 0.018}
                        fill="#FFFFFF"
                    />

                    {/* Sparkle for happy */}
                    {expression === 'happy' && (
                        <Circle
                            cx={cx + svgSize * 0.22}
                            cy={cy - svgSize * 0.12}
                            r={svgSize * 0.015}
                            fill="#FFD93D"
                        />
                    )}

                    {/* Cheeks */}
                    <Ellipse
                        cx={cx - svgSize * 0.22}
                        cy={cy + svgSize * 0.06}
                        rx={svgSize * 0.06}
                        ry={svgSize * 0.04}
                        fill="rgba(255, 182, 193, 0.5)"
                    />
                    <Ellipse
                        cx={cx + svgSize * 0.22}
                        cy={cy + svgSize * 0.06}
                        rx={svgSize * 0.06}
                        ry={svgSize * 0.04}
                        fill="rgba(255, 182, 193, 0.5)"
                    />

                    {/* Mouth */}
                    <Path
                        d={`M${cx - svgSize * 0.08} ${cy + svgSize * 0.10} Q${cx} ${cy + svgSize * 0.10 + mouthCurve} ${cx + svgSize * 0.08} ${cy + svgSize * 0.10}`}
                        stroke="#1C2B20"
                        strokeWidth={2}
                        fill="none"
                        strokeLinecap="round"
                    />
                </Svg>
            </Animated.View>
        </View>
    );
}

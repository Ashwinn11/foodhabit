import React, { useState } from 'react';
import { TextInput, View, type TextInputProps, Pressable } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { colors, radii, typography } from '@/theme';

interface InputProps extends TextInputProps {
    icon?: React.ReactNode;
    label?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function Input({ icon, label, style, onFocus, onBlur, ...props }: InputProps): React.JSX.Element {
    const [focused, setFocused] = useState(false);

    // Scale the border slightly when focused → feels responsive
    const borderScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);

    const handleFocus = (e: any) => {
        setFocused(true);
        borderScale.value = withSpring(1.015, { damping: 12, stiffness: 200 });
        glowOpacity.value = withTiming(1, { duration: 200 });
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setFocused(false);
        borderScale.value = withSpring(1, { damping: 12, stiffness: 200 });
        glowOpacity.value = withTiming(0, { duration: 200 });
        onBlur?.(e);
    };

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: borderScale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const activeBorderColor = focused ? colors.primary.DEFAULT : colors.stone;

    return (
        <View style={{ gap: 8 }}>
            {label && (
                <Text
                    variant="labelBold"
                    color={focused ? colors.primary.DEFAULT : colors.text2}
                    style={{ textTransform: 'uppercase', letterSpacing: 1 }}
                >
                    {label}
                </Text>
            )}
            <AnimatedView style={containerStyle}>
                {/* Glow ring */}
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            inset: -3,
                            borderRadius: radii.input + 4,
                            backgroundColor: colors.primary.light,
                            zIndex: 0,
                        },
                        glowStyle,
                    ]}
                />
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.surface,
                        borderWidth: focused ? 2 : 1.5,
                        borderColor: activeBorderColor,
                        borderRadius: radii.input + 2,
                        paddingHorizontal: 14,
                        paddingVertical: 13,
                        gap: 10,
                        zIndex: 1,
                    }}
                >
                    {icon}
                    <TextInput
                        style={[
                            {
                                flex: 1,
                                fontFamily: typography.families.figtreeRegular,
                                fontSize: 15,
                                color: colors.text1,
                            },
                            style,
                        ]}
                        placeholderTextColor={colors.text3}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        {...props}
                    />
                </View>
            </AnimatedView>
        </View>
    );
}

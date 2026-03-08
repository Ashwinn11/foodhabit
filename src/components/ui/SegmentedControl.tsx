import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { colors, radii } from '@/theme';
import { haptics } from '@/theme/haptics';

interface SegmentedControlProps {
    segments: string[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}

export function SegmentedControl({ segments, selectedIndex, onSelect }: SegmentedControlProps): React.JSX.Element {
    return (
        <View
            style={{
                flexDirection: 'row',
                backgroundColor: colors.surface,
                borderRadius: radii.input,
                padding: 3,
                borderWidth: 1,
                borderColor: colors.border,
            }}
        >
            {segments.map((segment, index) => {
                const isSelected = index === selectedIndex;

                return (
                    <Pressable
                        key={segment}
                        onPress={() => {
                            haptics.buttonTap();
                            onSelect(index);
                        }}
                        style={{
                            flex: 1,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: radii.input - 3,
                            backgroundColor: isSelected ? colors.primary.DEFAULT : 'transparent',
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            variant="labelBold"
                            color={isSelected ? '#FFFFFF' : colors.text3}
                        >
                            {segment}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

import React, { useRef } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    useAnimatedRef,
    measure,
    runOnUI,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme';
import { haptics } from '@/theme/haptics';

interface SegmentedControlProps {
    segments: string[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}

export function SegmentedControl({ segments, selectedIndex, onSelect }: SegmentedControlProps): React.JSX.Element {
    // Animated sliding pill position
    const pillX = useSharedValue(0);
    const pillWidth = useSharedValue(0);
    const segmentCount = segments.length;

    const pillStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: pillX.value }],
        width: pillWidth.value,
    }));

    const handleSelect = (index: number, containerWidth: number) => {
        haptics.buttonTap();
        const segW = containerWidth / segmentCount;
        pillX.value = withSpring(index * segW, { damping: 18, stiffness: 260, mass: 0.7 });
        pillWidth.value = withSpring(segW, { damping: 18, stiffness: 260, mass: 0.7 });
        onSelect(index);
    };

    const containerRef = useRef<View>(null);
    const [containerWidth, setContainerWidth] = React.useState(0);

    // Initialize pill position once we know the container width
    React.useLayoutEffect(() => {
        if (containerWidth > 0) {
            const segW = containerWidth / segmentCount;
            pillX.value = selectedIndex * segW;
            pillWidth.value = segW;
        }
    }, [containerWidth, segmentCount]);

    // Animate pill when selectedIndex changes externally
    React.useEffect(() => {
        if (containerWidth > 0) {
            const segW = containerWidth / segmentCount;
            pillX.value = withSpring(selectedIndex * segW, { damping: 18, stiffness: 260 });
        }
    }, [selectedIndex]);

    return (
        <View
            ref={containerRef}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
            style={{
                flexDirection: 'row',
                backgroundColor: colors.primary.light,
                borderRadius: 999, // pill container
                padding: 4,
                position: 'relative',
            }}
        >
            {/* Sliding pill indicator */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        top: 4,
                        bottom: 4,
                        left: 4,
                        backgroundColor: colors.primary.DEFAULT,
                        borderRadius: 999,
                        shadowColor: colors.primary.DEFAULT,
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                    },
                    pillStyle,
                ]}
            />

            {segments.map((segment, index) => {
                const isSelected = index === selectedIndex;
                return (
                    <Pressable
                        key={segment}
                        onPress={() => handleSelect(index, containerWidth)}
                        style={{
                            flex: 1,
                            paddingVertical: 9,
                            paddingHorizontal: 12,
                            alignItems: 'center',
                            zIndex: 1, // sit above pill
                        }}
                    >
                        <Text
                            variant="labelBold"
                            color={isSelected ? '#FFFFFF' : colors.text2}
                            style={{ letterSpacing: 0.3 }}
                        >
                            {segment}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

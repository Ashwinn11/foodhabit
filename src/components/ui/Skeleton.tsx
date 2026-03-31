import React, { useEffect } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import { colors, radii } from '@/theme';

interface SkeletonProps extends ViewProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style, ...props }: SkeletonProps): React.JSX.Element {
    const translateX = useSharedValue(-1);

    useEffect(() => {
        // Wave shimmer: slide a lighter band across
        translateX.value = withRepeat(
            withSequence(
                withTiming(-1, { duration: 0 }),
                withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 200 }) // small gap before restart
            ),
            -1,
            false
        );
    }, []);

    // We fake a shimmer by animating opacity in a staggered way
    const opacity = useSharedValue(0.35);
    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 700, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.35, { duration: 700, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor: colors.primary.mid,
                    overflow: 'hidden',
                },
                animStyle,
                style,
            ]}
            {...props}
        />
    );
}

// Skeleton card for loading states
export function SkeletonCard({ style, ...props }: ViewProps): React.JSX.Element {
    return (
        <View
            style={[
                {
                    backgroundColor: colors.surface,
                    borderRadius: radii.card + 2,
                    padding: 16,
                    gap: 12,
                },
                style,
            ]}
            {...props}
        >
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <Skeleton width={44} height={44} borderRadius={999} />
                <View style={{ flex: 1, gap: 8, justifyContent: 'center' }}>
                    <Skeleton height={14} width="60%" borderRadius={7} />
                    <Skeleton height={10} width="35%" borderRadius={5} />
                </View>
            </View>
            <Skeleton height={12} width="90%" borderRadius={6} />
            <Skeleton height={12} width="72%" borderRadius={6} />
        </View>
    );
}

// Skeleton for food analysis loading
export function FoodSkeleton(): React.JSX.Element {
    return (
        <View
            style={{
                backgroundColor: colors.surface,
                borderRadius: 18,
                padding: 14,
                gap: 10,
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <Skeleton width={40} height={40} borderRadius={999} />
            <View style={{ flex: 1, gap: 7 }}>
                <Skeleton height={12} width="50%" borderRadius={6} />
                <View style={{ flexDirection: 'row', gap: 5 }}>
                    <Skeleton width={72} height={18} borderRadius={999} />
                    <Skeleton width={52} height={18} borderRadius={999} />
                </View>
            </View>
        </View>
    );
}

// Skeleton for insight loading
export function InsightSkeleton(): React.JSX.Element {
    return (
        <View
            style={{
                backgroundColor: colors.surface,
                borderRadius: radii.card + 2,
                padding: 16,
                gap: 10,
                borderLeftWidth: 4,
                borderLeftColor: colors.primary.mid,
            }}
        >
            <View style={{ flexDirection: 'row', gap: 6 }}>
                <Skeleton width={80} height={20} borderRadius={999} />
                <Skeleton width={60} height={20} borderRadius={999} />
            </View>
            <Skeleton height={14} width="80%" borderRadius={7} />
            <Skeleton height={10} width="100%" borderRadius={5} />
            <Skeleton height={10} width="88%" borderRadius={5} />
        </View>
    );
}

// Skeleton for recipe loading
export function RecipeSkeleton(): React.JSX.Element {
    return (
        <View
            style={{
                backgroundColor: colors.surface,
                borderRadius: radii.card + 2,
                padding: 16,
                gap: 12,
            }}
        >
            <View style={{ flexDirection: 'row', gap: 5 }}>
                <Skeleton width={64} height={22} borderRadius={999} />
                <Skeleton width={64} height={22} borderRadius={999} />
            </View>
            <Skeleton height={18} width="70%" borderRadius={9} />
            <Skeleton height={12} width="100%" borderRadius={6} />
            <Skeleton height={12} width="58%" borderRadius={6} />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <Skeleton width={80} height={14} borderRadius={7} />
                <Skeleton width={80} height={14} borderRadius={7} />
            </View>
        </View>
    );
}

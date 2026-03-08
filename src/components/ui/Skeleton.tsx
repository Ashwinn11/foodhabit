import React, { useEffect } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { colors, radii } from '@/theme';

interface SkeletonProps extends ViewProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style, ...props }: SkeletonProps): React.JSX.Element {
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: 600 }),
                withTiming(0.4, { duration: 600 })
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
                    borderRadius: radii.card,
                    padding: 16,
                    gap: 12,
                },
                style,
            ]}
            {...props}
        >
            <View style={{ flexDirection: 'row', gap: 8 }}>
                <Skeleton width={40} height={40} borderRadius={10} />
                <View style={{ flex: 1, gap: 6 }}>
                    <Skeleton height={14} width="60%" />
                    <Skeleton height={10} width="40%" />
                </View>
            </View>
            <Skeleton height={12} width="90%" />
            <Skeleton height={12} width="75%" />
        </View>
    );
}

// Skeleton for food analysis loading
export function FoodSkeleton(): React.JSX.Element {
    return (
        <View
            style={{
                backgroundColor: colors.surface,
                borderRadius: 14,
                padding: 14,
                gap: 10,
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <Skeleton width={36} height={36} borderRadius={10} />
            <View style={{ flex: 1, gap: 6 }}>
                <Skeleton height={12} width="50%" />
                <View style={{ flexDirection: 'row', gap: 4 }}>
                    <Skeleton width={70} height={16} borderRadius={6} />
                    <Skeleton width={50} height={16} borderRadius={6} />
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
                borderRadius: radii.card,
                padding: 16,
                gap: 10,
                borderLeftWidth: 3.5,
                borderLeftColor: colors.primary.mid,
            }}
        >
            <View style={{ flexDirection: 'row', gap: 6 }}>
                <Skeleton width={80} height={18} borderRadius={6} />
                <Skeleton width={60} height={18} borderRadius={6} />
            </View>
            <Skeleton height={14} width="80%" />
            <Skeleton height={10} width="100%" />
            <Skeleton height={10} width="90%" />
        </View>
    );
}

// Skeleton for recipe loading
export function RecipeSkeleton(): React.JSX.Element {
    return (
        <View
            style={{
                backgroundColor: colors.surface,
                borderRadius: radii.card,
                padding: 16,
                gap: 12,
            }}
        >
            <View style={{ flexDirection: 'row', gap: 4 }}>
                <Skeleton width={60} height={20} borderRadius={8} />
                <Skeleton width={60} height={20} borderRadius={8} />
            </View>
            <Skeleton height={18} width="70%" />
            <Skeleton height={12} width="100%" />
            <Skeleton height={12} width="60%" />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <Skeleton width={80} height={14} />
                <Skeleton width={80} height={14} />
            </View>
        </View>
    );
}

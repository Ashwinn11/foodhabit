import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { colors, typography } from '@/theme';
import type { FodmapRisk, Verdict } from '@/lib/database.types';

interface FodmapBadgeProps {
    risk: FodmapRisk;
    animated?: boolean;
}

interface VerdictBadgeProps {
    verdict: Verdict;
    cautionAction?: string;
    animated?: boolean;
}

interface DualBadgeProps {
    fodmapRisk: FodmapRisk;
    personalVerdict: Verdict;
    cautionAction?: string;
    animated?: boolean;
}

const fodmapColors: Record<FodmapRisk, { bg: string; text: string; label: string }> = {
    high: { bg: colors.red.light, text: colors.red.DEFAULT, label: 'HIGH FODMAP' },
    medium: { bg: colors.amber.light, text: colors.amber.DEFAULT, label: 'MED FODMAP' },
    low: { bg: colors.primary.light, text: colors.primary.DEFAULT, label: 'LOW FODMAP' },
};

const verdictColors: Record<Verdict, { bg: string; label: string }> = {
    avoid: { bg: colors.red.DEFAULT, label: 'AVOID' },
    caution: { bg: colors.amber.DEFAULT, label: 'CAUTION' },
    safest: { bg: colors.primary.DEFAULT, label: 'SAFEST' },
};

export function FodmapBadge({ risk, animated = true }: FodmapBadgeProps): React.JSX.Element {
    const scale = useSharedValue(animated ? 0.5 : 1);
    const style = fodmapColors[risk];

    useEffect(() => {
        if (animated) {
            scale.value = withSequence(
                withTiming(1.1, { duration: 200 }),
                withSpring(1.0, { damping: 12, stiffness: 200 })
            );
        }
    }, [animated]);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View
            style={[
                {
                    backgroundColor: style.bg,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                },
                animStyle,
            ]}
        >
            <Text variant="badge" color={style.text}>{style.label}</Text>
        </Animated.View>
    );
}

export function VerdictBadge({ verdict, cautionAction, animated = true }: VerdictBadgeProps): React.JSX.Element {
    const scale = useSharedValue(animated ? 0.5 : 1);
    const style = verdictColors[verdict] || verdictColors.caution;

    useEffect(() => {
        if (animated) {
            scale.value = withSequence(
                withTiming(1.1, { duration: 200 }),
                withSpring(1.0, { damping: 12, stiffness: 200 })
            );
        }
    }, [animated]);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const label = style.label;

    return (
        <Animated.View
            style={[
                {
                    backgroundColor: style.bg,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                },
                animStyle,
            ]}
        >
            <Text
                style={{
                    fontFamily: typography.families.figtreeBold,
                    fontSize: typography.sizes.badge,
                    color: '#FFFFFF'
                }}
            >
                {label}
            </Text>
        </Animated.View>
    );
}

export function DualBadge({ fodmapRisk, personalVerdict, cautionAction, animated = true, style }: DualBadgeProps & { style?: any }): React.JSX.Element {
    return (
        <View style={[{ flexDirection: 'row', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 1 }, style]}>
            <FodmapBadge risk={fodmapRisk} animated={animated} />
            <VerdictBadge verdict={personalVerdict} cautionAction={cautionAction} animated={animated} />
        </View>
    );
}

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
    Easing,
} from 'react-native-reanimated';
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

// Fun emoji prefixes for each FODMAP level — purely decorative text
const fodmapLabels: Record<FodmapRisk, { bg: string; text: string; label: string }> = {
    high: { bg: colors.red.light, text: colors.red.DEFAULT, label: '🔥 HIGH' },
    medium: { bg: colors.amber.light, text: colors.amber.DEFAULT, label: '⚡ MED' },
    low: { bg: colors.primary.light, text: colors.primary.DEFAULT, label: '✅ LOW' },
};

const verdictLabels: Record<Verdict, { bg: string; label: string }> = {
    avoid: { bg: colors.red.DEFAULT, label: '🚫 AVOID' },
    caution: { bg: colors.amber.DEFAULT, label: '⚠️ CAUTION' },
    safest: { bg: colors.primary.DEFAULT, label: '🌿 SAFEST' },
};

function usePop(animated: boolean) {
    const scale = useSharedValue(animated ? 0.4 : 1);
    const rotate = useSharedValue(animated ? -8 : 0);

    useEffect(() => {
        if (animated) {
            // Elastic pop with slight rotation wiggle
            scale.value = withSpring(1, { damping: 8, stiffness: 280, mass: 0.5 });
            rotate.value = withSequence(
                withTiming(6, { duration: 120, easing: Easing.out(Easing.quad) }),
                withSpring(0, { damping: 10, stiffness: 300 })
            );
        }
    }, [animated]);

    return useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { rotate: `${rotate.value}deg` },
        ],
    }));
}

export function FodmapBadge({ risk, animated = true }: FodmapBadgeProps): React.JSX.Element {
    const animStyle = usePop(animated);
    const style = fodmapLabels[risk] ?? fodmapLabels.medium;

    return (
        <Animated.View
            style={[
                {
                    backgroundColor: style.bg,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999, // pill shape = fun
                    borderWidth: 1.5,
                    borderColor: style.text + '40',
                },
                animStyle,
            ]}
        >
            <Text variant="badge" color={style.text}>{style.label}</Text>
        </Animated.View>
    );
}

export function VerdictBadge({ verdict, animated = true }: VerdictBadgeProps): React.JSX.Element {
    const animStyle = usePop(animated);
    const style = verdictLabels[verdict] || verdictLabels.caution;

    return (
        <Animated.View
            style={[
                {
                    backgroundColor: style.bg,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                },
                animStyle,
            ]}
        >
            <Text
                style={{
                    fontFamily: typography.families.figtreeBold,
                    fontSize: typography.sizes.badge,
                    color: '#FFFFFF',
                }}
            >
                {style.label}
            </Text>
        </Animated.View>
    );
}

export function DualBadge({ fodmapRisk, personalVerdict, cautionAction, animated = true, style }: DualBadgeProps & { style?: any }): React.JSX.Element {
    return (
        <View style={[{ flexDirection: 'row', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 1 }, style]}>
            <FodmapBadge risk={fodmapRisk} animated={animated} />
            <VerdictBadge verdict={personalVerdict} cautionAction={cautionAction} animated={animated} />
        </View>
    );
}

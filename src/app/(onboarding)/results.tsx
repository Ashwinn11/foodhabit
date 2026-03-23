import React, { useEffect } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Activity, AlertCircle } from 'lucide-react-native';
import * as StoreReview from 'expo-store-review';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';
import AnimatedMascot from '@/components/AnimatedMascot';
import { analytics } from '@/lib/posthog';

export default function ResultsScreen(): React.JSX.Element {
    const router = useRouter();
    const navigation = useNavigation();
    const { profile } = useAuthStore();
    const progress = useSharedValue(0);

    const triggers = profile?.known_triggers || [];
    const conditions = profile?.diagnosed_conditions || [];

    // Condition-specific weights — heavier for diagnosed GI conditions
    const conditionWeights: Record<string, number> = {
        'IBS-D': 22,
        'IBS-C': 22,
        'IBS-M': 24,        // Mixed is harder to manage
        'Crohn\'s': 28,
        'Colitis': 26,
        'SIBO': 20,
        'Chronic Bloating': 14,
        'Lactose Intolerance': 10,
        'Gluten Sensitivity': 10,
        'Not Diagnosed': 6,
        'Other': 8,
    };

    const conditionPenalty = conditions.reduce((sum, c) => sum + (conditionWeights[c] ?? 8), 0);
    const triggerPenalty = triggers.length * 5;
    const totalPenalty = Math.min(conditionPenalty + triggerPenalty, 55);
    const finalScore = Math.max(100 - totalPenalty, 38);

    useEffect(() => {
        progress.value = withDelay(500, withTiming(finalScore / 100, { duration: 2000, easing: Easing.out(Easing.exp) }));

        analytics.onboardingCompleted({
            conditions,
            plan: 'free',
        });

        // Strategic: Ask for review when they see their results
        const triggerReview = async () => {
            if (await StoreReview.isAvailableAsync()) {
                // Short delay to let the initial animation play
                setTimeout(() => {
                    StoreReview.requestReview();
                }, 3000);
            }
        };
        triggerReview();
    }, []);

    const animatedProgressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    return (
        <LinearGradient
            colors={[colors.gradient.start, colors.gradient.mid, colors.gradient.end]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ height: 56, flexDirection: 'row', alignItems: 'center' }}>
                    <Pressable
                        onPress={() => navigation.canGoBack() && router.back()}
                        style={{ padding: 16, position: 'absolute', left: 0, zIndex: 10 }}
                    >
                        <ChevronLeft size={24} color={colors.text1} />
                    </Pressable>
                    <View style={{ flex: 1, paddingHorizontal: 70 }}>
                        <ProgressDots total={7} current={3} />
                    </View>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 }}>
                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <AnimatedMascot expression="happy" size={120} />
                        <Text variant="heading" color={colors.text1} style={{ textAlign: 'center', marginTop: 16 }}>
                            Analysis Complete 🧠
                        </Text>
                        <Text variant="body" color={colors.text2} style={{ textAlign: 'center', marginTop: 8 }}>
                            Based on your profile, we've identified key patterns in your gut health.
                        </Text>
                    </View>

                    <Card style={{ marginTop: 32, padding: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text variant="bodyBold" color={colors.text1}>Gut Sensitivity Score</Text>
                            <Text variant="heading" color={colors.primary.DEFAULT}>{finalScore}/100</Text>
                        </View>
                        <View style={{ height: 8, backgroundColor: colors.primary.light, borderRadius: 4, marginTop: 12, overflow: 'hidden' }}>
                            <Animated.View style={[{ height: '100%', backgroundColor: colors.primary.DEFAULT }, animatedProgressStyle]} />
                        </View>
                        <Text variant="caption" color={colors.text3} style={{ marginTop: 8 }}>
                            {finalScore < 70 ? 'Your score indicates high sensitivity. We need a strict reset.' : 'Your score indicates moderate sensitivity.'}
                        </Text>
                    </Card>

                    <View style={{ marginTop: 24, gap: 16 }}>
                        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: colors.red.DEFAULT }}>
                            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.red.light, alignItems: 'center', justifyContent: 'center' }}>
                                <AlertCircle size={20} color={colors.red.DEFAULT} fill={colors.red.DEFAULT} fillOpacity={0.2} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text variant="bodyBold" color={colors.text1}>{triggers.length} Primary Triggers</Text>
                                <Text variant="caption" color={colors.text2}>{triggers.join(', ') || 'Identifying patterns...'}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: colors.primary.DEFAULT }}>
                            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary.light, alignItems: 'center', justifyContent: 'center' }}>
                                <Activity size={20} color={colors.primary.DEFAULT} fill={colors.primary.DEFAULT} fillOpacity={0.2} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text variant="bodyBold" color={colors.text1}>{conditions.length > 0 ? conditions[0] : 'Digestive'} Profile</Text>
                                <Text variant="caption" color={colors.text2}>Personalized plan generated for your gut.</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ flex: 1 }} />

                    <View style={{ marginTop: 40 }}>
                        <Button
                            title="See how we can help"
                            onPress={() => router.push('/(onboarding)/benefits')}
                            fullWidth
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

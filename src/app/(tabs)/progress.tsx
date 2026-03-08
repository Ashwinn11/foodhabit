import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AlertCircle, CheckCircle2, TrendingDown, TrendingUp,
    Eye, Target, Lock as LockIcon,
} from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { InsightSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { colors, radii } from '@/theme';
import { useSubscription } from '@/hooks/useSubscription';
import type { AiInsight, ProgressSnapshot } from '@/lib/database.types';

const insightBorderColors: Record<string, string> = {
    trigger_watching: colors.red.DEFAULT,
    trigger_likely: colors.red.DEFAULT,
    trigger_confirmed: colors.red.DEFAULT,
    pattern: colors.amber.DEFAULT,
    recommendation: colors.purple,
    weekly_summary: colors.primary.DEFAULT,
};

const insightTypeLabels: Record<string, string> = {
    trigger_watching: 'Watching',
    trigger_likely: 'Likely Trigger',
    trigger_confirmed: 'Confirmed',
    pattern: 'Pattern',
    recommendation: 'Tip',
    weekly_summary: 'Weekly',
};

function LockedFeature({ title, message, onUpgrade }: { title: string; message: string; onUpgrade: () => void }): React.JSX.Element {
    return (
        <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.amber.light, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <LockIcon size={32} color={colors.amber.DEFAULT} />
            </View>
            <Text variant="heading" color={colors.text1} style={{ textAlign: 'center' }}>{title}</Text>
            <Text variant="body" color={colors.text2} style={{ textAlign: 'center', marginTop: 12, lineHeight: 20 }}>
                {message}
            </Text>
            <Button
                title="Unlock Premium"
                onPress={onUpgrade}
                style={{ marginTop: 24 }}
                fullWidth
            />
        </View>
    );
}

// ========================== INSIGHTS SEGMENT ==========================
function InsightsSegment(): React.JSX.Element {
    const { user } = useAuthStore();
    const { isPremium, isLoading: subLoading } = useSubscription();
    const [insights, setInsights] = useState<AiInsight[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchInsights = useCallback(async () => {
        if (!user?.id) return;
        try {
            const { data, error } = await supabase
                .from('ai_insights')
                .select('*')
                .eq('user_id', user.id)
                .order('generated_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setInsights(data || []);
        } catch (error) {
            console.error('Fetch insights error:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const generateInsight = async (): Promise<void> => {
        if (!user?.id || !isPremium) return;
        try {
            await supabase.functions.invoke('generate-insight', {
                body: { user_id: user.id },
            });
            await fetchInsights();
        } catch (error) {
            console.error('Generate insight error:', error);
        }
    };

    useEffect(() => { fetchInsights(); }, [fetchInsights]);

    const onRefresh = async (): Promise<void> => {
        if (!isPremium) {
            import('react-native-purchases-ui').then(({ default: RevenueCatUI }) => RevenueCatUI.presentPaywall());
            return;
        }
        setRefreshing(true);
        await generateInsight();
        setRefreshing(false);
    };

    if (loading || subLoading) {
        return (
            <View style={{ padding: 20, gap: 12 }}>
                <InsightSkeleton />
                <InsightSkeleton />
                <InsightSkeleton />
            </View>
        );
    }

    if (insights.length === 0) {
        return (
            <EmptyState
                title="No insights yet"
                message="Log for a few more days to unlock your first insight. Every meal and symptom log helps."
                mascotExpression="neutral"
            />
        );
    }

    return (
        <ScrollView
            contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.DEFAULT} />}
        >
            {insights.map((insight, index) => {
                const borderColor = insightBorderColors[insight.insight_type] || colors.primary.DEFAULT;
                const typeLabel = insightTypeLabels[insight.insight_type] || insight.insight_type;

                return (
                    <Card key={insight.id} animated delay={index * 80} style={{ borderLeftWidth: 3.5, borderLeftColor: borderColor }}>
                        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
                            <View style={{ backgroundColor: borderColor + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                <Text variant="badge" color={borderColor}>{typeLabel}</Text>
                            </View>
                            <View style={{ backgroundColor: colors.primary.light, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                <Text variant="badge" color={colors.primary.DEFAULT}>{insight.confidence}</Text>
                            </View>
                        </View>
                        <Text variant="title" color={colors.text1} numberOfLines={2}>{insight.title}</Text>
                        <Text variant="caption" color={colors.text2} style={{ marginTop: 4, lineHeight: 15 }}>
                            {insight.body}
                        </Text>
                        {insight.related_foods && insight.related_foods.length > 0 && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                                {insight.related_foods.map(food => (
                                    <View key={food} style={{ backgroundColor: colors.cream, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                                        <Text variant="caption" color={colors.text2}>{food}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </Card>
                );
            })}
        </ScrollView>
    );
}

// ========================== PROGRESS SEGMENT ==========================
function ProgressSegment(): React.JSX.Element {
    const { user } = useAuthStore();
    const [snapshot, setSnapshot] = useState<ProgressSnapshot | null>(null);
    const [safeFoods, setSafeFoods] = useState<string[]>([]);
    const [topTriggers, setTopTriggers] = useState<AiInsight[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

    // Improvement animation
    const improvementWidth = useSharedValue(0);
    const improvementStyle = useAnimatedStyle(() => ({
        width: `${improvementWidth.value}%`,
    }));

    const fetchProgress = useCallback(async () => {
        if (!user?.id) return;
        try {
            // Calculate progress via edge function
            const { data: calcData } = await supabase.functions.invoke('calculate-progress', {
                body: { user_id: user.id },
            });

            // Fetch latest snapshot
            const { data: snapData } = await supabase
                .from('progress_snapshots')
                .select('*')
                .eq('user_id', user.id)
                .order('snapshot_date', { ascending: false })
                .limit(1)
                .single();

            if (snapData) {
                setSnapshot(snapData);
                const improvement = Math.max(0, Math.min(100, snapData.improvement_vs_baseline));
                improvementWidth.value = withTiming(improvement, { duration: 1200, easing: Easing.out(Easing.ease) });
            }

            // Fetch confirmed triggers
            const { data: triggers } = await supabase
                .from('ai_insights')
                .select('*')
                .eq('user_id', user.id)
                .in('insight_type', ['trigger_confirmed', 'trigger_likely'])
                .order('confidence', { ascending: false })
                .limit(10);

            if (triggers) setTopTriggers(triggers);

            // Derive safe foods from meal logs with no symptoms
            const { data: mealData } = await supabase
                .from('meal_logs')
                .select('foods')
                .eq('user_id', user.id)
                .eq('overall_meal_verdict', 'safest')
                .limit(50);

            if (mealData) {
                const allFoods = mealData.flatMap((ml: any) =>
                    (ml.foods as any[]).filter(f => f.personal_verdict === 'safest').map(f => f.name)
                );
                setSafeFoods([...new Set(allFoods)]);
            }
        } catch (error) {
            console.error('Progress fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => { fetchProgress(); }, [fetchProgress]);

    if (loading) {
        return (
            <View style={{ padding: 20, gap: 12 }}>
                <InsightSkeleton />
                <InsightSkeleton />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
            {/* Improvement Hero */}
            <LinearGradient colors={['#2D7A52', '#1A5C36']} style={{ borderRadius: radii.card, padding: 20 }}>
                {snapshot && snapshot.improvement_vs_baseline > 0 ? (
                    <>
                        <Text variant="labelBold" color="rgba(255,255,255,0.7)">Your Improvement</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                            <TrendingDown size={20} color="#FFFFFF" />
                            <Text variant="heading" color="#FFFFFF" style={{ fontSize: 40 }}>
                                {Math.round(snapshot.improvement_vs_baseline)}%
                            </Text>
                        </View>
                        <Text variant="body" color="rgba(255,255,255,0.8)" style={{ marginTop: 4 }}>
                            improvement since you started
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                                <Text variant="caption" color="#FFFFFF">Week 1 avg: {((snapshot.avg_bloating_7d + snapshot.avg_pain_7d) / 2 + 4).toFixed(1)}</Text>
                            </View>
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                                <Text variant="caption" color="#FFFFFF">This week: {((snapshot.avg_bloating_7d + snapshot.avg_pain_7d) / 2).toFixed(1)}</Text>
                            </View>
                        </View>
                    </>
                ) : (
                    <>
                        <Text variant="bodyBold" color="#FFFFFF">Keep logging</Text>
                        <Text variant="label" color="rgba(255,255,255,0.7)" style={{ marginTop: 4 }}>
                            Your data is building. Improvements will show here soon.
                        </Text>
                        <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 12 }}>
                            <Animated.View style={[{ height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' }, improvementStyle]} />
                        </View>
                    </>
                )}
            </LinearGradient>

            {/* Symptom Averages */}
            {snapshot && (
                <Card>
                    <Text variant="title" color={colors.text1} style={{ marginBottom: 12 }}>7-Day Symptom Averages</Text>
                    {[
                        { label: 'Bloating', value: snapshot.avg_bloating_7d },
                        { label: 'Pain', value: snapshot.avg_pain_7d },
                        { label: 'Urgency', value: snapshot.avg_urgency_7d },
                        { label: 'Fatigue', value: snapshot.avg_fatigue_7d },
                    ].map(s => (
                        <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
                            <Text variant="body" color={colors.text1}>{s.label}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <View style={{ width: 80, height: 6, borderRadius: 3, backgroundColor: colors.primary.light }}>
                                    <View style={{ width: `${Math.min(100, Number(s.value) * 10)}%`, height: 6, borderRadius: 3, backgroundColor: Number(s.value) > 6 ? colors.red.DEFAULT : Number(s.value) > 3 ? colors.amber.DEFAULT : colors.primary.DEFAULT }} />
                                </View>
                                <Text variant="labelBold" color={colors.text1}>{Number(s.value).toFixed(1)}</Text>
                            </View>
                        </View>
                    ))}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.stone }}>
                        <Text variant="caption" color={colors.primary.DEFAULT}>Good days: {snapshot.good_days_count}</Text>
                        <Text variant="caption" color={colors.red.DEFAULT}>Bad days: {snapshot.bad_days_count}</Text>
                    </View>
                </Card>
            )}

            {/* Top Triggers */}
            <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <AlertCircle size={18} color={colors.red.DEFAULT} />
                    <Text variant="title" color={colors.text1}>Top Triggers</Text>
                </View>
                {topTriggers.length > 0 ? (
                    topTriggers.map((trigger, i) => (
                        <View key={trigger.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: i < topTriggers.length - 1 ? 1 : 0, borderBottomColor: colors.stone }}>
                            <Text variant="labelBold" color={colors.text3}>{i + 1}</Text>
                            <View style={{ flex: 1 }}>
                                <Text variant="bodyBold" color={colors.text1}>{trigger.title}</Text>
                                <Text variant="caption" color={colors.text2} numberOfLines={1}>{trigger.body}</Text>
                            </View>
                            <View style={{ backgroundColor: trigger.insight_type === 'trigger_confirmed' ? colors.red.light : colors.amber.light, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Text variant="badge" color={trigger.insight_type === 'trigger_confirmed' ? colors.red.DEFAULT : colors.amber.DEFAULT}>
                                    {trigger.insight_type === 'trigger_confirmed' ? 'CONFIRMED' : 'LIKELY'}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text variant="label" color={colors.text3}>No triggers detected yet. Keep logging!</Text>
                )}
            </Card>

            {/* Safe Foods */}
            <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <CheckCircle2 size={18} color={colors.primary.DEFAULT} />
                    <Text variant="title" color={colors.text1}>Safe Foods</Text>
                </View>
                {safeFoods.length > 0 ? (
                    <>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                            {safeFoods.map(food => (
                                <View key={food} style={{ backgroundColor: colors.primary.light, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                                    <Text variant="caption" color={colors.primary.DEFAULT}>{food}</Text>
                                </View>
                            ))}
                        </View>
                        <Text variant="caption" color={colors.text3} style={{ marginTop: 8 }}>
                            {safeFoods.length} foods confirmed safe for your gut
                        </Text>
                    </>
                ) : (
                    <Text variant="label" color={colors.text3}>Your safe foods will appear here as you log meals.</Text>
                )}
            </Card>
        </ScrollView>
    );
}

// ========================== MAIN PROGRESS TAB ==========================
export default function ProgressScreen(): React.JSX.Element {
    const [segmentIndex, setSegmentIndex] = useState(0);

    return (
        <LinearGradient colors={[colors.gradient.start, colors.gradient.mid]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
                    <SegmentedControl
                        segments={['Insights', 'Progress']}
                        selectedIndex={segmentIndex}
                        onSelect={setSegmentIndex}
                    />
                </View>
                {segmentIndex === 0 ? <InsightsSegment /> : <ProgressSegment />}
            </SafeAreaView>
        </LinearGradient>
    );
}

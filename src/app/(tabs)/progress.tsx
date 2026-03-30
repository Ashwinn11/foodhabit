import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AlertCircle, CheckCircle2,
} from 'lucide-react-native';
import { LineChart } from "react-native-gifted-charts";
import { haptics } from '@/theme/haptics';

import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { useToast } from '@/components/ui/Toast';
import { InsightSkeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme';
import type { ProgressSnapshot } from '@/lib/database.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProgressScreen(): React.JSX.Element {
    const { user, profile } = useAuthStore();
    const { showToast } = useToast();
    const [snapshot, setSnapshot] = useState<ProgressSnapshot | null>(null);
    const [safeFoods, setSafeFoods] = useState<string[]>([]);
    const [topTriggers, setTopTriggers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [rawTrendData, setRawTrendData] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [activeSymptom, setActiveSymptom] = useState<string>('Pain');
    const [refreshing, setRefreshing] = useState(false);

    const fetchProgress = useCallback(async () => {
        if (!user?.id) return;
        try {
            // PROGRESSIVE FETCH: Request all data independently so the UI paints as soon as each piece arrives

            // 1. Snapshot
            supabase
                .from('progress_snapshots')
                .select('*')
                .eq('user_id', user.id)
                .order('snapshot_date', { ascending: false })
                .limit(1)
                .maybeSingle()
                .then(snapRes => {
                    if (snapRes.data) {
                        setSnapshot(snapRes.data);
                    }
                });

            // 2. Triggers (Manual + AI)
            supabase
                .from('ai_insights')
                .select('*')
                .eq('user_id', user.id)
                .in('insight_type', ['trigger_confirmed', 'trigger_likely'])
                .order('confidence', { ascending: false })
                .limit(10)
                .then(insightsRes => {
                    const manualTriggers = (profile?.known_triggers || []).map((t, i) => ({
                        id: `manual-${i}`,
                        title: t,
                        body: 'Identified during onboarding',
                        insight_type: 'manual',
                        confidence: 'high'
                    }));
                    setTopTriggers([...manualTriggers, ...(insightsRes.data || [])]);
                });

            // 3. Safe Foods
            supabase
                .from('meal_logs')
                .select('foods')
                .eq('user_id', user.id)
                .eq('overall_meal_verdict', 'safest')
                .limit(40)
                .then(mealRes => {
                    if (mealRes.data) {
                        const allFoods = mealRes.data.flatMap((ml: any) =>
                            (ml.foods as any[]).filter(f => f.personal_verdict === 'safest').map(f => f.name)
                        );
                        setSafeFoods([...new Set(allFoods)]);
                    }
                });

            // 4. Trends
            supabase
                .from('symptom_logs')
                .select('logged_at, pain, bloating, urgency')
                .eq('user_id', user.id)
                .order('logged_at', { ascending: false })
                .limit(7)
                .then(trendRes => {
                    if (trendRes.data) {
                        setRawTrendData(trendRes.data);
                    }
                });

            setLoading(false);

        } catch (error) {
            console.error('Progress fetch error:', error);
            setLoading(false);
        }
    }, [user?.id, profile?.known_triggers]);

    // Fast local re-render for symptom switching
    useEffect(() => {
        if (rawTrendData.length > 0) {
            const reversed = [...rawTrendData].reverse();
            setChartData(reversed.map(d => ({
                value: activeSymptom === 'Pain' ? d.pain : activeSymptom === 'Bloating' ? d.bloating : d.urgency,
                label: new Date(d.logged_at).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
            })));
        }
    }, [rawTrendData, activeSymptom]);

    // Trigger edge function manually for deep analysis
    const onRefresh = async (): Promise<void> => {
        if (!user?.id) return;
        setRefreshing(true);
        try {
            await supabase.functions.invoke('calculate-progress', {
                body: { user_id: user.id },
            });
            await fetchProgress();
        } catch (error) {
            console.error('Manual progress calc error:', error);
        } finally {
            setRefreshing(false);
        }
    };

    // Re-fetch fast local snapshot data every time user focuses on Progress tab
    useFocusEffect(
        useCallback(() => {
            fetchProgress();
        }, [fetchProgress])
    );

    // Only show skeleton on first load when NO data is present
    if (loading && !snapshot && chartData.length === 0) {
        return (
            <LinearGradient colors={[colors.gradient.start, colors.gradient.mid]} style={{ flex: 1 }}>
                <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                    <View style={{ padding: 20, gap: 12 }}>
                        <InsightSkeleton />
                        <InsightSkeleton />
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={[colors.gradient.start, colors.gradient.mid]} style={{ flex: 1 }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <ScrollView 
                    contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.DEFAULT} />}
                >
                    <Card>
                        <Text variant="title" color={colors.text1}>Your Gut Patterns</Text>
                        <Text variant="caption" color={colors.text2} style={{ marginTop: 6, lineHeight: 18 }}>
                            Track symptom trends, likely triggers, and foods that consistently feel safe. Pull down to refresh trigger analysis after you log new meals and symptoms.
                        </Text>
                    </Card>

                    {/* Symptom Chart */}
                    <Card>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text variant="title" color={colors.text1}>Trends</Text>
                            <View style={{ flexDirection: 'row', gap: 6 }}>
                                {['Pain', 'Bloating', 'Urgency'].map(s => (
                                    <Chip
                                        key={s}
                                        label={s}
                                        selected={activeSymptom === s}
                                        onPress={() => { setActiveSymptom(s); haptics.buttonTap(); }}
                                        style={{ paddingHorizontal: 10, paddingVertical: 4 }}
                                    />
                                ))}
                            </View>
                        </View>
                        {chartData.length > 1 ? (
                            <View style={{ paddingRight: 20 }}>
                                <LineChart
                                    areaChart
                                    data={chartData}
                                    width={SCREEN_WIDTH - 80}
                                    height={140}
                                    curvature={0.4}
                                    spacing={38}
                                    color={colors.primary.DEFAULT}
                                    thickness={3}
                                    startFillColor={colors.primary.DEFAULT}
                                    endFillColor={colors.primary.light}
                                    startOpacity={0.2}
                                    endOpacity={0.01}
                                    initialSpacing={20}
                                    noOfSections={2}
                                    maxValue={10}
                                    yAxisThickness={0}
                                    xAxisThickness={1}
                                    xAxisColor={colors.stone}
                                    yAxisColor="transparent"
                                    yAxisTextStyle={{ color: colors.text3, fontSize: 10 }}
                                    xAxisLabelTextStyle={{ color: colors.text3, fontSize: 10 }}
                                    dataPointsColor={colors.primary.DEFAULT}
                                    dataPointsRadius={4}
                                    showValuesAsDataPointsText={false}
                                    pointerConfig={{
                                        pointerStripColor: colors.primary.mid,
                                        pointerStripWidth: 2,
                                        pointerColor: colors.primary.DEFAULT,
                                        radius: 6,
                                        pointerLabelComponent: (items: any) => {
                                            return (
                                                <View style={{ backgroundColor: colors.dark, padding: 8, borderRadius: 8 }}>
                                                    <Text variant="badge" color="#FFFFFF">{activeSymptom}: {items[0].value}</Text>
                                                </View>
                                            );
                                        },
                                    }}
                                />
                            </View>
                        ) : (
                            <View style={{ height: 120, alignItems: 'center', justifyContent: 'center' }}>
                                <Text variant="caption" color={colors.text3}>Not enough data for at least 2 days</Text>
                            </View>
                        )}
                    </Card>

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
                            <Text variant="caption" color={colors.text3} style={{ textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
                                *Good days: all symptom severities ≤ 3. Bad days: ANY symptom ≥ 6.
                            </Text>
                            <Text variant="caption" color={colors.text2} style={{ marginTop: 10, lineHeight: 18 }}>
                                Use these averages to judge whether your symptoms are settling down over time, rather than relying on another score.
                            </Text>
                        </Card>
                    )}

                    {/* Likely Triggers */}
                    <Card>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: colors.red.light, alignItems: 'center', justifyContent: 'center' }}>
                                <AlertCircle size={16} color={colors.red.DEFAULT} fill={colors.red.DEFAULT} fillOpacity={0.2} />
                            </View>
                            <Text variant="title" color={colors.text1}>Likely Triggers</Text>
                        </View>
                        {topTriggers.length > 0 ? (
                            topTriggers.map((trigger, i) => (
                                <View key={trigger.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: i < topTriggers.length - 1 ? 1 : 0, borderBottomColor: colors.stone }}>
                                    <Text variant="labelBold" color={colors.text3}>{i + 1}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text variant="bodyBold" color={colors.text1}>{trigger.title}</Text>
                                        <Text variant="caption" color={colors.text2} numberOfLines={1}>{trigger.body}</Text>
                                    </View>
                                    <View style={{ backgroundColor: trigger.insight_type === 'manual' ? colors.primary.light : trigger.insight_type === 'trigger_confirmed' ? colors.red.light : colors.amber.light, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                        <Text variant="badge" color={trigger.insight_type === 'manual' ? colors.primary.DEFAULT : trigger.insight_type === 'trigger_confirmed' ? colors.red.DEFAULT : colors.amber.DEFAULT}>
                                            {trigger.insight_type === 'manual' ? 'SET BY YOU' : trigger.insight_type === 'trigger_confirmed' ? 'CONFIRMED' : 'LIKELY'}
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: colors.primary.light, alignItems: 'center', justifyContent: 'center' }}>
                                <CheckCircle2 size={16} color={colors.primary.DEFAULT} fill={colors.primary.DEFAULT} fillOpacity={0.2} />
                            </View>
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
            </SafeAreaView>
        </LinearGradient>
    );
}

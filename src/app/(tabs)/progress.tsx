import React, { useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Modal, Pressable } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AlertCircle, CheckCircle2, Moon, Sun, Sunrise, Apple, Sparkles, ChevronRight, X,
} from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { InsightSkeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme';

type SymptomSummary = {
    avg_bloating_7d: number;
    avg_pain_7d: number;
    avg_urgency_7d: number;
    avg_fatigue_7d: number;
    good_days_count: number;
    bad_days_count: number;
};

type SymptomSummaryLog = {
    bloating: number;
    pain: number;
    urgency: number;
    fatigue: number;
    nausea: number;
    logged_at: string;
    stool_type?: number | null;
    notes?: string | null;
};

type RecentMealLog = {
    id: string;
    meal_type: string;
    logged_at: string;
    overall_meal_verdict: string | null;
    foods: unknown;
};

function buildSymptomSummary(logs: SymptomSummaryLog[]): SymptomSummary | null {
    if (logs.length === 0) return null;

    const avgBloating = logs.reduce((sum, log) => sum + log.bloating, 0) / logs.length;
    const avgPain = logs.reduce((sum, log) => sum + log.pain, 0) / logs.length;
    const avgUrgency = logs.reduce((sum, log) => sum + log.urgency, 0) / logs.length;
    const avgFatigue = logs.reduce((sum, log) => sum + log.fatigue, 0) / logs.length;

    const dayMap = new Map<string, SymptomSummaryLog[]>();
    logs.forEach(log => {
        const day = log.logged_at.split('T')[0];
        const existing = dayMap.get(day) || [];
        existing.push(log);
        dayMap.set(day, existing);
    });

    let goodDays = 0;
    let badDays = 0;

    dayMap.forEach(dayLogs => {
        let maxSymptomOfDay = 0;
        dayLogs.forEach(log => {
            maxSymptomOfDay = Math.max(
                maxSymptomOfDay,
                log.bloating,
                log.pain,
                log.urgency,
                log.nausea,
                log.fatigue
            );
        });

        if (maxSymptomOfDay >= 6) badDays += 1;
        else if (maxSymptomOfDay <= 3) goodDays += 1;
    });

    return {
        avg_bloating_7d: Math.round(avgBloating * 10) / 10,
        avg_pain_7d: Math.round(avgPain * 10) / 10,
        avg_urgency_7d: Math.round(avgUrgency * 10) / 10,
        avg_fatigue_7d: Math.round(avgFatigue * 10) / 10,
        good_days_count: goodDays,
        bad_days_count: badDays,
    };
}

function getMealIcon(mealType: string): React.JSX.Element {
    const iconProps = { size: 14, color: colors.text1 };
    if (mealType === 'breakfast') return <Sunrise {...iconProps} />;
    if (mealType === 'lunch') return <Sun {...iconProps} />;
    if (mealType === 'dinner') return <Moon {...iconProps} />;
    return <Apple {...iconProps} />;
}

function getSymptomStatus(entry: SymptomSummaryLog): { title: string; color: string; bg: string; detail: string } {
    const symptomPairs = [
        { label: 'Pain', value: entry.pain },
        { label: 'Bloating', value: entry.bloating },
        { label: 'Urgency', value: entry.urgency },
        { label: 'Nausea', value: entry.nausea },
        { label: 'Fatigue', value: entry.fatigue },
    ].sort((a, b) => b.value - a.value);

    const strongest = symptomPairs[0];
    const detail = strongest && strongest.value > 0 ? `${strongest.label} was highest` : 'No symptoms recorded';

    if (!strongest || strongest.value <= 2) {
        return { title: 'Calm check-in', color: colors.primary.DEFAULT, bg: colors.primary.light, detail };
    }
    if (strongest.value <= 5) {
        return { title: 'Okay check-in', color: colors.amber.DEFAULT, bg: colors.amber.light, detail };
    }
    return { title: 'Rough check-in', color: colors.red.DEFAULT, bg: colors.red.light, detail };
}

export default function ProgressScreen(): React.JSX.Element {
    const { user, profile } = useAuthStore();
    const { showToast } = useToast();
    const [summary, setSummary] = useState<SymptomSummary | null>(null);
    const [safeFoods, setSafeFoods] = useState<string[]>([]);
    const [topTriggers, setTopTriggers] = useState<any[]>([]);
    const [recentMeals, setRecentMeals] = useState<RecentMealLog[]>([]);
    const [recentSymptoms, setRecentSymptoms] = useState<SymptomSummaryLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [historyModal, setHistoryModal] = useState<'meals' | 'symptoms' | null>(null);

    const fetchProgress = useCallback(async () => {
        if (!user?.id) return;
        try {
            // PROGRESSIVE FETCH: Request all data independently so the UI paints as soon as each piece arrives

            // 1. Triggers (Manual + AI)
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

            // 2. Safe Foods + recent meals
            supabase
                .from('meal_logs')
                .select('id, foods, meal_type, overall_meal_verdict, logged_at')
                .eq('user_id', user.id)
                .order('logged_at', { ascending: false })
                .limit(40)
                .then(mealRes => {
                    if (mealRes.data) {
                        setRecentMeals(mealRes.data.slice(0, 3) as RecentMealLog[]);
                        const allFoods = mealRes.data.flatMap((ml: any) =>
                            ml.overall_meal_verdict === 'safest'
                                ? (ml.foods as any[]).filter(f => f.personal_verdict === 'safest').map(f => f.name)
                                : []
                        );
                        setSafeFoods([...new Set(allFoods)]);
                    } else {
                        setRecentMeals([]);
                    }
                });

            // 3. Symptoms + summary
            supabase
                .from('symptom_logs')
                .select('logged_at, pain, bloating, urgency, fatigue, nausea, stool_type, notes')
                .eq('user_id', user.id)
                .order('logged_at', { ascending: false })
                .limit(20)
                .then(trendRes => {
                    if (trendRes.data) {
                        setRecentSymptoms(trendRes.data.slice(0, 3));
                        setSummary(buildSymptomSummary(trendRes.data));
                    } else {
                        setRecentSymptoms([]);
                        setSummary(null);
                    }
                    setLoading(false);
                });

        } catch (error) {
            console.error('Progress fetch error:', error);
            setLoading(false);
        }
    }, [user?.id, profile?.known_triggers]);

    const onRefresh = async (): Promise<void> => {
        if (!user?.id) return;
        setRefreshing(true);
        try {
            await fetchProgress();
        } catch (error) {
            console.error('Progress refresh error:', error);
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
    if (loading && !summary) {
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
                    <Text variant="heading" color={colors.text1}>Progress</Text>

                    <Card>
                        <Text variant="title" color={colors.text1} style={{ marginBottom: 12 }}>Recent Activity</Text>

                        <View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text variant="labelBold" color={colors.text2}>Recent Meals</Text>
                                <Pressable onPress={() => setHistoryModal('meals')} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                    <Text variant="caption" color={colors.text2}>See all</Text>
                                    <ChevronRight size={14} color={colors.text2} />
                                </Pressable>
                            </View>
                            {recentMeals.length > 0 ? (
                                <View style={{ marginTop: 8, gap: 8 }}>
                                    {recentMeals.slice(0, 2).map((meal) => {
                                        const foods = Array.isArray(meal.foods) ? meal.foods : [];
                                        const foodNames = foods
                                            .map(food => food?.name)
                                            .filter(Boolean)
                                            .slice(0, 2);

                                        return (
                                            <View
                                                key={meal.id}
                                                style={{
                                                    backgroundColor: '#FFFFFF',
                                                    borderWidth: 1,
                                                    borderColor: colors.border,
                                                    borderRadius: 16,
                                                    padding: 12,
                                                }}
                                            >
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' }}>
                                                            {getMealIcon(meal.meal_type)}
                                                        </View>
                                                        <Text variant="bodyBold" color={colors.text1}>
                                                            {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                                                        </Text>
                                                    </View>
                                                    <Text variant="caption" color={colors.text3}>
                                                        {new Date(meal.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date(meal.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                    </Text>
                                                </View>
                                                <Text variant="caption" color={colors.text2} style={{ marginTop: 4 }}>
                                                    {foodNames.join(', ') || 'Meal logged'}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            ) : (
                                <Text variant="caption" color={colors.text3} style={{ marginTop: 6 }}>No meals logged yet.</Text>
                            )}
                        </View>

                        <View style={{ marginTop: 16 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text variant="labelBold" color={colors.text2}>Recent Symptoms</Text>
                                <Pressable onPress={() => setHistoryModal('symptoms')} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                    <Text variant="caption" color={colors.text2}>See all</Text>
                                    <ChevronRight size={14} color={colors.text2} />
                                </Pressable>
                            </View>
                            {recentSymptoms.length > 0 ? (
                                <View style={{ marginTop: 8, gap: 8 }}>
                                    {recentSymptoms.slice(0, 2).map((entry, index) => {
                                        const status = getSymptomStatus(entry);

                                        return (
                                            <View
                                                key={`${entry.logged_at}-${index}`}
                                                style={{
                                                    backgroundColor: '#FFFFFF',
                                                    borderWidth: 1,
                                                    borderColor: colors.border,
                                                    borderRadius: 16,
                                                    padding: 12,
                                                }}
                                            >
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: status.bg, alignItems: 'center', justifyContent: 'center' }}>
                                                            <Sparkles size={14} color={status.color} />
                                                        </View>
                                                        <Text variant="bodyBold" color={colors.text1}>
                                                            {status.title}
                                                        </Text>
                                                    </View>
                                                    <Text variant="caption" color={colors.text3}>
                                                        {new Date(entry.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date(entry.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                    </Text>
                                                </View>
                                                <Text variant="caption" color={colors.text2} style={{ marginTop: 4 }}>
                                                    {status.detail}
                                                    {entry.stool_type ? ` • Stool ${entry.stool_type}` : ''}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            ) : (
                                <Text variant="caption" color={colors.text3} style={{ marginTop: 6 }}>No symptom check-ins yet.</Text>
                            )}
                        </View>
                    </Card>

                    {/* Symptom Averages */}
                    {summary && (
                        <Card>
                            <Text variant="title" color={colors.text1} style={{ marginBottom: 6 }}>7-Day Symptom Averages</Text>
                            <Text variant="caption" color={colors.text2} style={{ marginBottom: 12, lineHeight: 18 }}>
                                A quick read on your past week.
                            </Text>
                            {[
                                { label: 'Bloating', value: summary.avg_bloating_7d },
                                { label: 'Pain', value: summary.avg_pain_7d },
                                { label: 'Urgency', value: summary.avg_urgency_7d },
                                { label: 'Fatigue', value: summary.avg_fatigue_7d },
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
                                <Text variant="caption" color={colors.primary.DEFAULT}>Good days: {summary.good_days_count}</Text>
                                <Text variant="caption" color={colors.red.DEFAULT}>Bad days: {summary.bad_days_count}</Text>
                            </View>
                            <Text variant="caption" color={colors.text3} style={{ textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
                                *Good days: all symptom severities ≤ 3. Bad days: ANY symptom ≥ 6.
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
                        <Text variant="caption" color={colors.text2} style={{ marginBottom: 12, lineHeight: 18 }}>
                            Foods to watch.
                        </Text>
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
                        <Text variant="caption" color={colors.text2} style={{ marginBottom: 12, lineHeight: 18 }}>
                            Foods that usually feel safe.
                        </Text>
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

                <Modal visible={historyModal !== null} animationType="slide" presentationStyle="pageSheet">
                    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 8 }}>
                            <Text variant="heading" color={colors.text1}>
                                {historyModal === 'meals' ? 'Meal History' : 'Symptom History'}
                            </Text>
                            <Pressable onPress={() => setHistoryModal(null)} style={{ padding: 4 }}>
                                <X size={22} color={colors.text1} />
                            </Pressable>
                        </View>

                        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8, gap: 10, paddingBottom: 40 }}>
                            {historyModal === 'meals' && recentMeals.map((meal) => {
                                const foods = Array.isArray(meal.foods) ? meal.foods : [];
                                const foodNames = foods.map(food => food?.name).filter(Boolean).slice(0, 5);

                                return (
                                    <Card key={`meal-history-${meal.id}`} animated={false}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' }}>
                                                    {getMealIcon(meal.meal_type)}
                                                </View>
                                                <Text variant="bodyBold" color={colors.text1}>
                                                    {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                                                </Text>
                                            </View>
                                            <Text variant="caption" color={colors.text3}>
                                                {new Date(meal.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date(meal.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                        <Text variant="caption" color={colors.text2} style={{ marginTop: 6 }}>
                                            {foodNames.join(', ') || 'Meal logged'}
                                        </Text>
                                    </Card>
                                );
                            })}

                            {historyModal === 'symptoms' && recentSymptoms.map((entry, index) => {
                                const status = getSymptomStatus(entry);

                                return (
                                    <Card key={`symptom-history-${entry.logged_at}-${index}`} animated={false}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: status.bg, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Sparkles size={14} color={status.color} />
                                                </View>
                                                <Text variant="bodyBold" color={colors.text1}>
                                                    {status.title}
                                                </Text>
                                            </View>
                                            <Text variant="caption" color={colors.text3}>
                                                {new Date(entry.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date(entry.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                        <Text variant="caption" color={colors.text2} style={{ marginTop: 6 }}>
                                            {status.detail}{entry.stool_type ? ` • Stool ${entry.stool_type}` : ''}
                                        </Text>
                                    </Card>
                                );
                            })}
                        </ScrollView>
                    </SafeAreaView>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
}

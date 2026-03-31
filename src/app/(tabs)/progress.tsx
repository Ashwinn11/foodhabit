import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Modal, Pressable } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
} from 'react-native-reanimated';
import {
    AlertCircle, CheckCircle2, Moon, Sun, Sunrise, Apple, Sparkles,
    ChevronRight, X, Wind, Zap, Droplets, Brain, BatteryLow,
    ShieldAlert, ShieldCheck,
} from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { InsightSkeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { colors, shadows } from '@/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSymptomSummary(logs: SymptomSummaryLog[]): SymptomSummary | null {
    if (logs.length === 0) return null;

    const avgBloating = logs.reduce((sum, l) => sum + l.bloating, 0) / logs.length;
    const avgPain     = logs.reduce((sum, l) => sum + l.pain,     0) / logs.length;
    const avgUrgency  = logs.reduce((sum, l) => sum + l.urgency,  0) / logs.length;
    const avgFatigue  = logs.reduce((sum, l) => sum + l.fatigue,  0) / logs.length;

    const dayMap = new Map<string, SymptomSummaryLog[]>();
    logs.forEach(log => {
        const day = log.logged_at.split('T')[0];
        dayMap.set(day, [...(dayMap.get(day) || []), log]);
    });

    let goodDays = 0, badDays = 0;
    dayMap.forEach(dayLogs => {
        const max = Math.max(...dayLogs.flatMap(l => [l.bloating, l.pain, l.urgency, l.nausea, l.fatigue]));
        if (max >= 6) badDays++;
        else if (max <= 3) goodDays++;
    });

    return {
        avg_bloating_7d: Math.round(avgBloating * 10) / 10,
        avg_pain_7d:     Math.round(avgPain     * 10) / 10,
        avg_urgency_7d:  Math.round(avgUrgency  * 10) / 10,
        avg_fatigue_7d:  Math.round(avgFatigue  * 10) / 10,
        good_days_count: goodDays,
        bad_days_count:  badDays,
    };
}

function getMealIcon(mealType: string): React.JSX.Element {
    const p = { size: 14, color: colors.text2 };
    if (mealType === 'breakfast') return <Sunrise {...p} />;
    if (mealType === 'lunch')     return <Sun {...p} />;
    if (mealType === 'dinner')    return <Moon {...p} />;
    return <Apple {...p} />;
}

function getSymptomStatus(entry: SymptomSummaryLog): { title: string; color: string; bg: string; detail: string } {
    const pairs = [
        { label: 'Pain',     value: entry.pain     },
        { label: 'Bloating', value: entry.bloating  },
        { label: 'Urgency',  value: entry.urgency   },
        { label: 'Nausea',   value: entry.nausea    },
        { label: 'Fatigue',  value: entry.fatigue   },
    ].sort((a, b) => b.value - a.value);

    const top = pairs[0];
    const detail = top && top.value > 0 ? `${top.label} was highest` : 'No symptoms recorded';
    if (!top || top.value <= 2) return { title: 'Calm check-in',  color: colors.primary.DEFAULT, bg: colors.primary.light, detail };
    if (top.value <= 5)         return { title: 'Okay check-in',  color: colors.amber.DEFAULT,   bg: colors.amber.light,   detail };
    return                             { title: 'Rough check-in', color: colors.red.DEFAULT,     bg: colors.red.light,     detail };
}

function severityColor(v: number) {
    if (v >= 7) return colors.red.DEFAULT;
    if (v >= 4) return colors.amber.DEFAULT;
    return colors.primary.DEFAULT;
}

function fmtTime(iso: string) {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

const SYMPTOM_ICONS: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth?: number }>> = {
    Bloating: Wind,
    Pain:     Zap,
    Urgency:  Droplets,
    Fatigue:  BatteryLow,
};

function AnimatedBar({ value, delay = 0 }: { value: number | null; delay?: number }) {
    const fillPct = useSharedValue(0);
    const pct = value !== null ? Math.min(100, Number(value) * 10) : 0;

    useEffect(() => {
        fillPct.value = withDelay(delay, withSpring(pct, { damping: 20, stiffness: 200 }));
    }, [pct]);

    const barStyle = useAnimatedStyle(() => ({ width: `${fillPct.value}%` }));
    const color = value !== null ? severityColor(Number(value)) : 'transparent';

    return (
        <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.primary.light, overflow: 'hidden' }}>
            <Animated.View style={[{ height: 8, borderRadius: 4, backgroundColor: color }, barStyle]} />
        </View>
    );
}

export default function ProgressScreen(): React.JSX.Element {
    const { user, profile } = useAuthStore();
    const { showToast } = useToast();

    const [summary, setSummary]               = useState<SymptomSummary | null>(null);
    const [safeFoods, setSafeFoods]           = useState<string[]>([]);
    const [topTriggers, setTopTriggers]       = useState<any[]>([]);
    const [recentMeals, setRecentMeals]       = useState<RecentMealLog[]>([]);
    const [recentSymptoms, setRecentSymptoms] = useState<SymptomSummaryLog[]>([]);
    const [loading, setLoading]               = useState(true);
    const [refreshing, setRefreshing]         = useState(false);
    const [historyModal, setHistoryModal] = useState<'meals' | 'symptoms' | null>(null);
    const [selectedInsight, setSelectedInsight] = useState<any | null>(null);

    const fetchProgress = useCallback(async () => {
        if (!user?.id) return;
        try {
            const [insightsRes, mealsRes, symptomsRes] = await Promise.all([
                supabase.from('ai_insights').select('*').eq('user_id', user.id).order('generated_at', { ascending: false }).limit(30),
                supabase.from('meal_logs').select('id, foods, meal_type, overall_meal_verdict, logged_at').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(40),
                supabase.from('symptom_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(40)
            ]);

            setTopTriggers(insightsRes.data || []);
            
            if (mealsRes.data) {
                setRecentMeals(mealsRes.data as RecentMealLog[]);
                const allSafe = mealsRes.data.flatMap((ml: any) =>
                    ml.overall_meal_verdict === 'safest'
                        ? (ml.foods as any[]).filter(f => f.personal_verdict === 'safest').map(f => f.name)
                        : []
                );
                setSafeFoods([...new Set(allSafe)]);
            }

            if (symptomsRes.data) {
                setRecentSymptoms(symptomsRes.data);
                setSummary(buildSymptomSummary(symptomsRes.data.slice(0, 20)));
            }
            setLoading(false);
        } catch (e) {
            console.error('Progress fetch error:', e);
            setLoading(false);
        }
    }, [user?.id]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProgress();
        setRefreshing(false);
    };

    useFocusEffect(useCallback(() => { fetchProgress(); }, [fetchProgress]));

    if (loading && !summary) {
        return (
            <LinearGradient colors={[colors.gradient.start, colors.gradient.mid, colors.gradient.end]} locations={[0, 0.6, 1]} style={{ flex: 1 }}>
                <SafeAreaView edges={['top']} style={{ flex: 1 }}><View style={{ padding: 20 }}><InsightSkeleton /></View></SafeAreaView>
            </LinearGradient>
        );
    }

    const symptomRows = [
        { label: 'Bloating', value: summary?.avg_bloating_7d ?? null },
        { label: 'Pain',     value: summary?.avg_pain_7d ?? null     },
        { label: 'Urgency',  value: summary?.avg_urgency_7d ?? null  },
        { label: 'Fatigue',  value: summary?.avg_fatigue_7d ?? null  },
    ];

    return (
        <LinearGradient colors={[colors.gradient.start, colors.gradient.mid, colors.gradient.end]} locations={[0, 0.6, 1]} style={{ flex: 1 }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 48 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
                        <Text variant="heading" color={colors.text1}>Progress</Text>
                        <Text variant="caption" color={colors.text3}>Last 7 days</Text>
                    </View>

                    {summary && (
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ flex: 1, borderRadius: 18, padding: 16, backgroundColor: colors.primary.light, borderWidth: 1.5, borderColor: colors.primary.mid }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <ShieldCheck size={16} color={colors.primary.DEFAULT} />
                                    <Text variant="labelBold" color={colors.primary.DEFAULT}>Good days</Text>
                                </View>
                                <Text style={{ fontFamily: 'Figtree_800ExtraBold', fontSize: 36, color: colors.primary.DEFAULT }}>{summary.good_days_count}</Text>
                            </View>
                            <View style={{ flex: 1, borderRadius: 18, padding: 16, backgroundColor: colors.red.light, borderWidth: 1.5, borderColor: colors.red.DEFAULT + '40' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <ShieldAlert size={16} color={colors.red.DEFAULT} />
                                    <Text variant="labelBold" color={colors.red.DEFAULT}>Rough days</Text>
                                </View>
                                <Text style={{ fontFamily: 'Figtree_800ExtraBold', fontSize: 36, color: colors.red.DEFAULT }}>{summary.bad_days_count}</Text>
                            </View>
                        </View>
                    )}

                    <Card>
                        <Text variant="title">7-Day Averages</Text>
                        <View style={{ gap: 14, marginTop: 16 }}>
                            {symptomRows.map((s, i) => {
                                const Icon = SYMPTOM_ICONS[s.label] || Wind;
                                const color = severityColor(s.value || 0);
                                return (
                                    <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: color + '18', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon size={14} color={color} />
                                        </View>
                                        <Text variant="body" style={{ width: 60 }}>{s.label}</Text>
                                        <AnimatedBar value={s.value} delay={i * 80} />
                                        <Text style={{ fontFamily: 'Figtree_700Bold', width: 28, textAlign: 'right', color }}>{s.value?.toFixed(1) || '--'}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </Card>

                    <View style={{ gap: 24 }}>
                        <View>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                                <AlertCircle size={18} color={colors.red.DEFAULT} />
                                <Text variant="title">Trigger Analysis</Text>
                            </View>
                            {topTriggers.filter(t => ['trigger_confirmed', 'trigger_likely', 'manual'].includes(t.insight_type)).map(trigger => (
                                <Pressable key={trigger.id} onPress={() => setSelectedInsight(trigger)}>
                                    <Card style={{ borderLeftWidth: 4, borderLeftColor: colors.red.DEFAULT, marginBottom: 10 }}>
                                        <Text variant="bodyBold">{trigger.title}</Text>
                                        <Text variant="caption" numberOfLines={2}>{trigger.body}</Text>
                                    </Card>
                                </Pressable>
                            ))}
                        </View>

                        {topTriggers.filter(t => t.insight_type === 'trigger_watching').length > 0 && (
                            <View>
                                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                                    <Sparkles size={18} color={colors.amber.DEFAULT} />
                                    <Text variant="title">Under Review</Text>
                                </View>
                                {topTriggers.filter(t => t.insight_type === 'trigger_watching').map(trigger => (
                                    <Pressable key={trigger.id} onPress={() => setSelectedInsight(trigger)}>
                                        <Card style={{ marginBottom: 10 }}>
                                            <Text variant="bodyBold">{trigger.title}</Text>
                                            <Text variant="caption" numberOfLines={1}>{trigger.body}</Text>
                                        </Card>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>

                    <Card>
                        <Text variant="title">Safe Foods</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
                            {safeFoods.map(food => (
                                <View key={food} style={{ backgroundColor: colors.primary.light, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 }}>
                                    <Text variant="caption" color={colors.primary.DEFAULT}>{food}</Text>
                                </View>
                            ))}
                        </View>
                    </Card>

                    {/* RECENT MEALS */}
                    <Card>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                            <Text variant="title">Meal History</Text>
                            <Pressable onPress={() => setHistoryModal('meals')}><Text variant="caption" color={colors.primary.DEFAULT}>See all</Text></Pressable>
                        </View>
                        <View style={{ gap: 10 }}>
                            {recentMeals.slice(0, 3).map(meal => (
                                <View key={meal.id} style={{ flexDirection: 'row', gap: 12, backgroundColor: colors.bg, padding: 12, borderRadius: 14 }}>
                                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary.light, alignItems: 'center', justifyContent: 'center' }}>
                                        {getMealIcon(meal.meal_type)}
                                    </View>
                                    <Text variant="bodyBold" style={{ flex: 1 }}>{meal.meal_type}</Text>
                                    <Text variant="caption" color={colors.text3}>{fmtTime(meal.logged_at)}</Text>
                                </View>
                            ))}
                        </View>
                    </Card>

                    {/* RECENT SYMPTOMS */}
                    <Card>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                            <Text variant="title">Symptom History</Text>
                            <Pressable onPress={() => setHistoryModal('symptoms')}><Text variant="caption" color={colors.primary.DEFAULT}>See all</Text></Pressable>
                        </View>
                        <View style={{ gap: 10 }}>
                            {recentSymptoms.slice(0, 3).map((entry, index) => {
                                const status = getSymptomStatus(entry);
                                return (
                                    <View key={index} style={{ flexDirection: 'row', gap: 12, backgroundColor: colors.bg, padding: 12, borderRadius: 14 }}>
                                        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: status.bg, alignItems: 'center', justifyContent: 'center' }}>
                                            <Sparkles size={14} color={status.color} />
                                        </View>
                                        <Text variant="bodyBold" style={{ flex: 1 }}>{status.title}</Text>
                                        <Text variant="caption" color={colors.text3}>{fmtTime(entry.logged_at)}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </Card>
                </ScrollView>

                {/* HISTORY MODAL */}
                <Modal visible={historyModal !== null} animationType="slide" presentationStyle="pageSheet">
                    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.bg }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                            <Text variant="heading">{historyModal === 'meals' ? 'Meal Logs' : 'Symptom Logs'}</Text>
                            <Pressable onPress={() => setHistoryModal(null)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.stone, alignItems: 'center', justifyContent: 'center' }}>
                                <X size={20} color={colors.text1} />
                            </Pressable>
                        </View>
                        <ScrollView contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 40 }}>
                            {historyModal === 'meals' && recentMeals.map(meal => (
                                <Card key={meal.id} elevated={false} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary.light, alignItems: 'center', justifyContent: 'center' }}>
                                        {getMealIcon(meal.meal_type)}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text variant="bodyBold">{meal.meal_type}</Text>
                                        <Text variant="caption" color={colors.text3}>{fmtTime(meal.logged_at)}</Text>
                                    </View>
                                </Card>
                            ))}
                            {historyModal === 'symptoms' && recentSymptoms.map((entry, index) => {
                                const status = getSymptomStatus(entry);
                                return (
                                    <Card key={index} elevated={false} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: status.bg, alignItems: 'center', justifyContent: 'center' }}>
                                            <Sparkles size={14} color={status.color} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text variant="bodyBold">{status.title}</Text>
                                            <Text variant="caption" color={colors.text3}>{fmtTime(entry.logged_at)}</Text>
                                        </View>
                                    </Card>
                                );
                            })}
                        </ScrollView>
                    </SafeAreaView>
                </Modal>

                {/* INSIGHT DETAIL MODAL */}
                <Modal visible={selectedInsight !== null} animationType="slide" transparent>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
                        <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.bg, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: 0 }}>
                            <View style={{ padding: 24, paddingBottom: 40 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <View style={{ backgroundColor: colors.primary.light, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 }}>
                                        <Text variant="badge" color={colors.primary.DEFAULT}>INSIGHT</Text>
                                    </View>
                                    <Pressable onPress={() => setSelectedInsight(null)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.stone, alignItems: 'center', justifyContent: 'center' }}>
                                        <X size={20} color={colors.text1} />
                                    </Pressable>
                                </View>
                                <Text variant="title" style={{ fontSize: 24, marginBottom: 16 }}>{selectedInsight?.title}</Text>
                                <ScrollView style={{ maxHeight: 300 }}>
                                    <Text variant="body" style={{ lineHeight: 24, color: colors.text2 }}>{selectedInsight?.body}</Text>
                                </ScrollView>
                                <Pressable 
                                    onPress={() => setSelectedInsight(null)} 
                                    style={{ backgroundColor: colors.primary.DEFAULT, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 32, ...shadows.elevated }}
                                >
                                    <Text variant="bodyBold" color="#FFF">Got it</Text>
                                </Pressable>
                            </View>
                        </SafeAreaView>
                    </View>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
}

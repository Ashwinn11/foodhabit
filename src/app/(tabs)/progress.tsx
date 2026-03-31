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

// ─── AnimatedBar ──────────────────────────────────────────────────────────────

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

// ─── Main Screen ──────────────────────────────────────────────────────────────

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
    const [historyModal, setHistoryModal]     = useState<'meals' | 'symptoms' | null>(null);

    const fetchProgress = useCallback(async () => {
        if (!user?.id) return;
        try {
            supabase
                .from('ai_insights')
                .select('*')
                .eq('user_id', user.id)
                .in('insight_type', ['trigger_confirmed', 'trigger_likely'])
                .order('confidence', { ascending: false })
                .limit(10)
                .then(res => {
                    const manual = (profile?.known_triggers || []).map((t, i) => ({
                        id: `manual-${i}`, title: t,
                        body: 'Identified during onboarding',
                        insight_type: 'manual', confidence: 'high',
                    }));
                    setTopTriggers([...manual, ...(res.data || [])]);
                });

            supabase
                .from('meal_logs')
                .select('id, foods, meal_type, overall_meal_verdict, logged_at')
                .eq('user_id', user.id)
                .order('logged_at', { ascending: false })
                .limit(40)
                .then(res => {
                    if (res.data) {
                        setRecentMeals(res.data.slice(0, 3) as RecentMealLog[]);
                        const allSafe = res.data.flatMap((ml: any) =>
                            ml.overall_meal_verdict === 'safest'
                                ? (ml.foods as any[]).filter(f => f.personal_verdict === 'safest').map(f => f.name)
                                : []
                        );
                        setSafeFoods([...new Set(allSafe)]);
                    } else {
                        setRecentMeals([]);
                    }
                });

            supabase
                .from('symptom_logs')
                .select('logged_at, pain, bloating, urgency, fatigue, nausea, stool_type, notes')
                .eq('user_id', user.id)
                .order('logged_at', { ascending: false })
                .limit(20)
                .then(res => {
                    if (res.data) {
                        setRecentSymptoms(res.data.slice(0, 3));
                        setSummary(buildSymptomSummary(res.data));
                    } else {
                        setRecentSymptoms([]);
                        setSummary(null);
                    }
                    setLoading(false);
                });
        } catch (e) {
            console.error('Progress fetch error:', e);
            setLoading(false);
        }
    }, [user?.id, profile?.known_triggers]);

    const onRefresh = async () => {
        if (!user?.id) return;
        setRefreshing(true);
        try { await fetchProgress(); } catch (e) { console.error(e); } finally { setRefreshing(false); }
    };

    useFocusEffect(useCallback(() => { fetchProgress(); }, [fetchProgress]));

    // ── Skeleton ──────────────────────────────────────────────────────────────
    if (loading && !summary) {
        return (
            <LinearGradient colors={[colors.gradient.start, colors.gradient.mid, colors.gradient.end]} locations={[0, 0.6, 1]} style={{ flex: 1 }}>
                <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                    <View style={{ padding: 20, gap: 12 }}>
                        <InsightSkeleton />
                        <InsightSkeleton />
                        <InsightSkeleton />
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    const symptomRows = [
        { label: 'Bloating', value: summary?.avg_bloating_7d ?? null },
        { label: 'Pain',     value: summary?.avg_pain_7d ?? null     },
        { label: 'Urgency',  value: summary?.avg_urgency_7d ?? null  },
        { label: 'Fatigue',  value: summary?.avg_fatigue_7d ?? null  },
    ];

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <LinearGradient colors={[colors.gradient.start, colors.gradient.mid, colors.gradient.end]} locations={[0, 0.6, 1]} style={{ flex: 1 }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 48 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.DEFAULT} />}
                >
                    {/* ── Page title ────────────────────────────────── */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
                        <Text variant="heading" color={colors.text1}>Progress</Text>
                        <Text variant="caption" color={colors.text3}>Last 7 days</Text>
                    </View>

                    {/* ── Good / Bad day stat pills ─────────────────── */}
                    {summary && (
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            {/* Good days */}
                            <View style={{
                                flex: 1, borderRadius: 18, padding: 16,
                                backgroundColor: colors.primary.light,
                                borderWidth: 1.5, borderColor: colors.primary.mid,
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <ShieldCheck size={16} color={colors.primary.DEFAULT} strokeWidth={2} />
                                    <Text variant="labelBold" color={colors.primary.DEFAULT}>Good days</Text>
                                </View>
                                <Text style={{ fontFamily: 'Figtree_800ExtraBold', fontSize: 36, color: colors.primary.DEFAULT, lineHeight: 40 }}>
                                    {summary.good_days_count}
                                </Text>
                                <Text variant="caption" color={colors.primary.DEFAULT} style={{ opacity: 0.7, marginTop: 2 }}>
                                    all symptoms ≤ 3
                                </Text>
                            </View>

                            {/* Bad days */}
                            <View style={{
                                flex: 1, borderRadius: 18, padding: 16,
                                backgroundColor: colors.red.light,
                                borderWidth: 1.5, borderColor: colors.red.DEFAULT + '40',
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <ShieldAlert size={16} color={colors.red.DEFAULT} strokeWidth={2} />
                                    <Text variant="labelBold" color={colors.red.DEFAULT}>Rough days</Text>
                                </View>
                                <Text style={{ fontFamily: 'Figtree_800ExtraBold', fontSize: 36, color: colors.red.DEFAULT, lineHeight: 40 }}>
                                    {summary.bad_days_count}
                                </Text>
                                <Text variant="caption" color={colors.red.DEFAULT} style={{ opacity: 0.7, marginTop: 2 }}>
                                    any symptom ≥ 6
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* ── 7-Day symptom averages ────────────────────── */}
                    <Card animated delay={0}>
                        <Text variant="title" color={colors.text1} style={{ marginBottom: 4 }}>7-Day Averages</Text>
                        <Text variant="caption" color={colors.text3} style={{ marginBottom: 16 }}>
                            {summary ? 'Averaged across your recent check-ins.' : 'No check-ins yet — log your first symptoms.'}
                        </Text>

                        <View style={{ gap: 14 }}>
                            {symptomRows.map((s, i) => {
                                const Icon = SYMPTOM_ICONS[s.label] ?? Wind;
                                const color = s.value !== null ? severityColor(Number(s.value)) : colors.text3;
                                return (
                                    <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        {/* Icon */}
                                        <View style={{
                                            width: 30, height: 30, borderRadius: 15,
                                            backgroundColor: color + '18',
                                            alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Icon size={14} color={color} strokeWidth={2} />
                                        </View>

                                        {/* Label */}
                                        <Text variant="body" color={colors.text1} style={{ width: 58 }}>{s.label}</Text>

                                        {/* Bar */}
                                        <AnimatedBar value={s.value} delay={i * 80} />

                                        {/* Score */}
                                        <Text
                                            style={{
                                                fontFamily: 'Figtree_700Bold',
                                                fontSize: 14,
                                                color,
                                                width: 28,
                                                textAlign: 'right',
                                            }}
                                        >
                                            {s.value !== null ? Number(s.value).toFixed(1) : '--'}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </Card>

                    {/* ── Triggers ──────────────────────────────────── */}
                    <Card animated delay={60}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <AlertCircle size={16} color={colors.red.DEFAULT} strokeWidth={2} />
                            <Text variant="title" color={colors.text1}>Likely Triggers</Text>
                        </View>
                        <Text variant="caption" color={colors.text3} style={{ marginBottom: 14 }}>
                            Foods to watch based on your history.
                        </Text>

                        {topTriggers.length > 0 ? (
                            <View style={{ gap: 0 }}>
                                {topTriggers.map((trigger, i) => {
                                    const isManual    = trigger.insight_type === 'manual';
                                    const isConfirmed = trigger.insight_type === 'trigger_confirmed';
                                    const tagColor    = isManual ? colors.primary.DEFAULT : isConfirmed ? colors.red.DEFAULT : colors.amber.DEFAULT;
                                    const tagBg       = isManual ? colors.primary.light   : isConfirmed ? colors.red.light   : colors.amber.light;
                                    const tagLabel    = isManual ? 'YOU SET' : isConfirmed ? 'CONFIRMED' : 'LIKELY';

                                    return (
                                        <View
                                            key={trigger.id}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 12,
                                                paddingVertical: 11,
                                                borderBottomWidth: i < topTriggers.length - 1 ? 1 : 0,
                                                borderBottomColor: colors.stone,
                                                // colored left accent
                                                paddingLeft: 10,
                                                marginLeft: -10,
                                                borderLeftWidth: 3,
                                                borderLeftColor: tagColor,
                                            }}
                                        >
                                            {/* Index */}
                                            <Text style={{ fontFamily: 'Figtree_800ExtraBold', fontSize: 13, color: colors.text3, width: 18 }}>
                                                {i + 1}
                                            </Text>

                                            {/* Content */}
                                            <View style={{ flex: 1 }}>
                                                <Text variant="bodyBold" color={colors.text1}>{trigger.title}</Text>
                                                <Text variant="caption" color={colors.text2} numberOfLines={1}>{trigger.body}</Text>
                                            </View>

                                            {/* Tag */}
                                            <View style={{
                                                backgroundColor: tagBg,
                                                paddingHorizontal: 8,
                                                paddingVertical: 3,
                                                borderRadius: 999,
                                            }}>
                                                <Text variant="badge" color={tagColor}>{tagLabel}</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        ) : (
                            <Text variant="label" color={colors.text3}>No triggers detected yet. Keep logging!</Text>
                        )}
                    </Card>

                    {/* ── Safe Foods ────────────────────────────────── */}
                    <Card animated delay={120}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <CheckCircle2 size={16} color={colors.primary.DEFAULT} strokeWidth={2} />
                            <Text variant="title" color={colors.text1}>Safe Foods</Text>
                        </View>
                        <Text variant="caption" color={colors.text3} style={{ marginBottom: 14 }}>
                            Foods confirmed safe from your logged meals.
                        </Text>

                        {safeFoods.length > 0 ? (
                            <>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                                    {safeFoods.map(food => (
                                        <View
                                            key={food}
                                            style={{
                                                backgroundColor: colors.primary.light,
                                                borderWidth: 1,
                                                borderColor: colors.primary.mid,
                                                paddingHorizontal: 12,
                                                paddingVertical: 5,
                                                borderRadius: 999,
                                            }}
                                        >
                                            <Text variant="caption" color={colors.primary.DEFAULT}>{food}</Text>
                                        </View>
                                    ))}
                                </View>
                                <Text variant="caption" color={colors.text3} style={{ marginTop: 10 }}>
                                    {safeFoods.length} food{safeFoods.length !== 1 ? 's' : ''} confirmed safe
                                </Text>
                            </>
                        ) : (
                            <Text variant="label" color={colors.text3}>Your safe foods will appear here as you log meals.</Text>
                        )}
                    </Card>

                    {/* ── Recent Meals ──────────────────────────────── */}
                    <Card animated delay={180}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <Text variant="title" color={colors.text1}>Recent Meals</Text>
                            <Pressable onPress={() => setHistoryModal('meals')} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                <Text variant="caption" color={colors.primary.DEFAULT}>See all</Text>
                                <ChevronRight size={13} color={colors.primary.DEFAULT} />
                            </Pressable>
                        </View>

                        {recentMeals.length > 0 ? (
                            <View style={{ gap: 10 }}>
                                {recentMeals.slice(0, 2).map((meal) => {
                                    const foods = Array.isArray(meal.foods) ? meal.foods : [];
                                    const names = foods.map((f: any) => f?.name).filter(Boolean).slice(0, 3);
                                    const vColor = meal.overall_meal_verdict === 'avoid'   ? colors.red.DEFAULT
                                                 : meal.overall_meal_verdict === 'caution' ? colors.amber.DEFAULT
                                                 : colors.primary.DEFAULT;

                                    return (
                                        <View key={meal.id} style={{
                                            flexDirection: 'row', alignItems: 'center', gap: 12,
                                            backgroundColor: colors.bg,
                                            borderRadius: 14, padding: 12,
                                        }}>
                                            {/* Verdict dot + meal icon */}
                                            <View style={{
                                                width: 36, height: 36, borderRadius: 18,
                                                backgroundColor: vColor + '18',
                                                alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {getMealIcon(meal.meal_type)}
                                            </View>

                                            <View style={{ flex: 1 }}>
                                                <Text variant="bodyBold" color={colors.text1}>
                                                    {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                                                </Text>
                                                <Text variant="caption" color={colors.text2} numberOfLines={1}>
                                                    {names.join(', ') || 'Meal logged'}
                                                </Text>
                                            </View>

                                            <Text variant="caption" color={colors.text3}>{fmtTime(meal.logged_at)}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        ) : (
                            <Text variant="caption" color={colors.text3}>No meals logged yet.</Text>
                        )}
                    </Card>

                    {/* ── Recent Symptoms ───────────────────────────── */}
                    <Card animated delay={220}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <Text variant="title" color={colors.text1}>Recent Check-ins</Text>
                            <Pressable onPress={() => setHistoryModal('symptoms')} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                                <Text variant="caption" color={colors.primary.DEFAULT}>See all</Text>
                                <ChevronRight size={13} color={colors.primary.DEFAULT} />
                            </Pressable>
                        </View>

                        {recentSymptoms.length > 0 ? (
                            <View style={{ gap: 10 }}>
                                {recentSymptoms.slice(0, 2).map((entry, index) => {
                                    const status = getSymptomStatus(entry);
                                    return (
                                        <View key={`${entry.logged_at}-${index}`} style={{
                                            flexDirection: 'row', alignItems: 'center', gap: 12,
                                            backgroundColor: colors.bg,
                                            borderRadius: 14, padding: 12,
                                        }}>
                                            <View style={{
                                                width: 36, height: 36, borderRadius: 18,
                                                backgroundColor: status.bg,
                                                alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <Sparkles size={14} color={status.color} />
                                            </View>

                                            <View style={{ flex: 1 }}>
                                                <Text variant="bodyBold" color={colors.text1}>{status.title}</Text>
                                                <Text variant="caption" color={colors.text2}>
                                                    {status.detail}{entry.stool_type ? ` · Stool ${entry.stool_type}` : ''}
                                                </Text>
                                            </View>

                                            <Text variant="caption" color={colors.text3}>{fmtTime(entry.logged_at)}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        ) : (
                            <Text variant="caption" color={colors.text3}>No symptom check-ins yet.</Text>
                        )}
                    </Card>

                </ScrollView>

                {/* ── History Modal ─────────────────────────────────── */}
                <Modal visible={historyModal !== null} animationType="slide" presentationStyle="pageSheet">
                    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 8 }}>
                            <Text variant="heading" color={colors.text1}>
                                {historyModal === 'meals' ? 'Meal History' : 'Symptom History'}
                            </Text>
                            <Pressable onPress={() => setHistoryModal(null)} style={{
                                width: 32, height: 32, borderRadius: 16,
                                backgroundColor: colors.stone,
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <X size={16} color={colors.text1} />
                            </Pressable>
                        </View>

                        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 8, gap: 10, paddingBottom: 40 }}>

                            {historyModal === 'meals' && recentMeals.map((meal) => {
                                const foods = Array.isArray(meal.foods) ? meal.foods : [];
                                const names = foods.map((f: any) => f?.name).filter(Boolean).slice(0, 5);
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
                                            <Text variant="caption" color={colors.text3}>{fmtTime(meal.logged_at)}</Text>
                                        </View>
                                        <Text variant="caption" color={colors.text2} style={{ marginTop: 6 }}>
                                            {names.join(', ') || 'Meal logged'}
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
                                                <Text variant="bodyBold" color={colors.text1}>{status.title}</Text>
                                            </View>
                                            <Text variant="caption" color={colors.text3}>{fmtTime(entry.logged_at)}</Text>
                                        </View>
                                        <Text variant="caption" color={colors.text2} style={{ marginTop: 6 }}>
                                            {status.detail}{entry.stool_type ? ` · Stool ${entry.stool_type}` : ''}
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

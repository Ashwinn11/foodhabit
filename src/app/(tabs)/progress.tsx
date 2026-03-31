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
    const [historyModal, setHistoryModal] = useState<'meals' | 'symptoms' | null>(null);
    const [selectedInsight, setSelectedInsight] = useState<any | null>(null); // Detail view for Progress screen

    const fetchProgress = useCallback(async () => {
        if (!user?.id) return;
        try {
            supabase
                .from('ai_insights')
                .select('*')
                .eq('user_id', user.id)
                .order('generated_at', { ascending: false })
                .limit(30)
                .then(res => {
                    setTopTriggers(res.data || []);
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

                    {/* ── Triggers & Insights ──────────────────────────────────── */}
                    <View style={{ gap: 24 }}>
                        {/* 1. Confirmed / Likely Triggers */}
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <AlertCircle size={18} color={colors.red.DEFAULT} strokeWidth={2} />
                                <Text variant="title" color={colors.text1}>Trigger Analysis</Text>
                            </View>

                            {topTriggers.filter(t => ['trigger_confirmed', 'trigger_likely', 'manual'].includes(t.insight_type)).length > 0 ? (
                                <View style={{ gap: 12 }}>
                                    {topTriggers.filter(t => ['trigger_confirmed', 'trigger_likely', 'manual'].includes(t.insight_type)).map((trigger) => {
                                        const labels: Record<string, { title: string; color: string; bg: string }> = {
                                            trigger_confirmed: { title: 'Confirmed Trigger', color: colors.red.DEFAULT, bg: colors.red.light },
                                            trigger_likely: { title: 'Highly Likely', color: colors.red.DEFAULT, bg: colors.red.light },
                                            manual: { title: 'Manual Entry', color: colors.primary.DEFAULT, bg: colors.primary.light },
                                        };
                                        const meta = labels[trigger.insight_type] || { title: 'Confirmed Trigger', color: colors.red.DEFAULT, bg: colors.red.light };

                                        return (
                                            <Pressable key={trigger.id} onPress={() => setSelectedInsight(trigger)}>
                                                <Card style={{ 
                                                    borderLeftWidth: 4, 
                                                    borderLeftColor: meta.color,
                                                    padding: 16
                                                }}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                        <Text variant="bodyBold" color={colors.text1}>{trigger.title}</Text>
                                                        <View style={{ backgroundColor: meta.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                                                            <Text variant="badge" color={meta.color}>{meta.title.toUpperCase()}</Text>
                                                        </View>
                                                    </View>
                                                    <Text variant="caption" color={colors.text2} numberOfLines={2}>{trigger.body}</Text>
                                                    <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                        <Text variant="labelBold" color={colors.primary.DEFAULT}>Read Full Analysis</Text>
                                                        <ChevronRight size={14} color={colors.primary.DEFAULT} />
                                                    </View>
                                                </Card>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            ) : (
                                <Card style={{ padding: 20, alignItems: 'center', backgroundColor: colors.surface }}>
                                    <Text variant="caption" color={colors.text3}>Your confirmed triggers will appear here.</Text>
                                </Card>
                            )}
                        </View>

                        {/* 2. Foods to Watch */}
                        {topTriggers.filter(t => t.insight_type === 'trigger_watching').length > 0 && (
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <Sparkles size={18} color={colors.amber.DEFAULT} strokeWidth={2} />
                                    <Text variant="title" color={colors.text1}>Under Review</Text>
                                </View>
                                <Text variant="caption" color={colors.text3} style={{ marginBottom: 12, marginTop: -8 }}>
                                    Suspected foods that the AI is currently watching.
                                </Text>
                                <View style={{ gap: 10 }}>
                                    {topTriggers.filter(t => t.insight_type === 'trigger_watching').map((trigger) => (
                                        <Pressable key={trigger.id} onPress={() => setSelectedInsight(trigger)}>
                                            <Card style={{ padding: 14 }}>
                                                <Text variant="bodyBold" color={colors.text1}>{trigger.title}</Text>
                                                <Text variant="caption" color={colors.text2} numberOfLines={1} style={{ marginTop: 2 }}>{trigger.body}</Text>
                                            </Card>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        )}

                         {/* 3. AI Recommendations */}
                        {topTriggers.filter(t => t.insight_type === 'recommendation').length > 0 && (
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <Brain size={18} color={colors.purple.DEFAULT} strokeWidth={2} />
                                    <Text variant="title" color={colors.text1}>Health Recommendations</Text>
                                </View>
                                <View style={{ gap: 10 }}>
                                    {topTriggers.filter(t => t.insight_type === 'recommendation').map((trigger) => (
                                        <Pressable key={trigger.id} onPress={() => setSelectedInsight(trigger)}>
                                            <Card style={{ backgroundColor: colors.purple.light, borderColor: colors.purple.DEFAULT, borderWidth: 1 }}>
                                                <Text variant="bodyBold" color={colors.purple.DEFAULT}>{trigger.title}</Text>
                                                <Text variant="caption" color={colors.purple.DEFAULT} numberOfLines={2} style={{ marginTop: 2 }}>{trigger.body}</Text>
                                            </Card>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

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

                {/* ── Insight Detail Modal ───────────────────────── */}
                <Modal visible={selectedInsight !== null} animationType="slide" transparent={true}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                        <View style={{ backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '80%' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                {(() => {
                                    const labels: Record<string, { title: string; color: string; bg: string }> = {
                                        trigger_confirmed: { title: 'Confirmed Trigger', color: colors.red.DEFAULT, bg: colors.red.light },
                                        trigger_likely: { title: 'Highly Likely', color: colors.red.DEFAULT, bg: colors.red.light },
                                        trigger_watching: { title: 'Under Review', color: colors.amber.DEFAULT, bg: colors.amber.light },
                                        recommendation: { title: 'Buddy Tip', color: colors.purple.DEFAULT, bg: colors.purple.light },
                                        manual: { title: 'Manual Entry', color: colors.primary.DEFAULT, bg: colors.primary.light },
                                    };
                                    const meta = selectedInsight ? (labels[selectedInsight.insight_type] || { title: 'Insight', color: colors.primary.DEFAULT, bg: colors.primary.light }) : { title: 'Insight', color: colors.primary.DEFAULT, bg: colors.primary.light };
                                    return (
                                        <View style={{ backgroundColor: meta.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                                            <Text variant="badge" color={meta.color}>{meta.title.toUpperCase()}</Text>
                                        </View>
                                    );
                                })()}
                                <Pressable onPress={() => setSelectedInsight(null)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.stone, alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={18} color={colors.text1} />
                                </Pressable>
                            </View>
                            <Text variant="heading" color={colors.text1} style={{ marginBottom: 12 }}>{selectedInsight?.title}</Text>
                            <ScrollView>
                                <Text variant="body" color={colors.text1} style={{ lineHeight: 22 }}>{selectedInsight?.body}</Text>
                                {selectedInsight?.related_foods && (
                                    <View style={{ marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                        {selectedInsight.related_foods.map((f: string) => (
                                            <View key={f} style={{ backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
                                                <Text variant="caption" color={colors.text1}>{f}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </ScrollView>
                            <Pressable 
                                onPress={() => setSelectedInsight(null)}
                                style={{ backgroundColor: colors.primary.DEFAULT, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 20 }}
                            >
                                <Text variant="bodyBold" color="#FFF">Close</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>

            </SafeAreaView>
        </LinearGradient>
    );
}

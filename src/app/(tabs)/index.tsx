import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, ScrollView, Pressable, RefreshControl, Image, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Sunrise, Sun, Moon, Heart, CheckCircle2, ChevronRight,
    Zap, ArrowRight, TrendingDown, TrendingUp, Sparkles, X, ShieldCheck, Brain,
} from 'lucide-react-native';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import AnimatedMascot from '@/components/AnimatedMascot';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { calculateGutScore } from '@/lib/gutScore';
import { calculateOnboardingBaselineScore } from '@/lib/onboardingScore';
import { colors, radii, shadows } from '@/theme';
import type { Streak, AiInsight } from '@/lib/database.types';

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);

interface DayLog {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    symptoms: boolean;
}

function getLocalDayBounds(): { start: string; end: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return {
        start: start.toISOString(),
        end: end.toISOString(),
    };
}

export default function HomeScreen(): React.JSX.Element {
    const router = useRouter();
    const { profile, user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [todayLogs, setTodayLogs] = useState<DayLog>({ breakfast: false, lunch: false, dinner: false, symptoms: false });
    const [gutScore, setGutScore] = useState<number | null>(null);
    const [gutSeverity, setGutSeverity] = useState<'minimal' | 'mild' | 'moderate' | 'severe' | null>(null);
    const [streak, setStreak] = useState<Streak | null>(null);
    const [insights, setInsights] = useState<AiInsight[]>([]); // Changed from single latestInsight
    const [lastMeal, setLastMeal] = useState<any | null>(null);
    const [counts, setCounts] = useState({ meals: 0, symptoms: 0 });
    const [currentMealRecipe, setCurrentMealRecipe] = useState<any | null>(null);
    const [selectedInsight, setSelectedInsight] = useState<AiInsight | null>(null); // For detail view
    const fetchingRecipeRef = useRef(false);

    // Gut score ring animation
    const scoreProgress = useSharedValue(0);
    const circumference = 2 * Math.PI * 25;

    const animatedCircleProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference - (circumference * scoreProgress.value) / 100,
    }));

    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const firstName = profile?.full_name?.split(' ')[0] || 'there';

    const getCurrentMealType = (): 'breakfast' | 'lunch' | 'dinner' => {
        const hour = new Date().getHours();
        if (hour < 10) return 'breakfast';
        if (hour < 15) return 'lunch';
        return 'dinner';
    };

    const mealType = getCurrentMealType();

    const getMascotExpression = (): 'happy' | 'okay' | 'sad' => {
        if (gutScore === null) return 'okay';
        if (gutScore >= 70) return 'happy';
        if (gutScore >= 40) return 'okay';
        return 'sad';
    };

    const getMascotMessage = (): string => {
        if (gutScore === null) return 'Log your symptoms to see your score';
        if (gutScore >= 70) return 'Looking good today!';
        if (gutScore >= 40) return 'Decent day. Keep logging.';
        return "Tough day. I'm here.";
    };

    const fetchHomeData = useCallback(async () => {
        if (!user?.id) return;

        try {
            const { start: todayStart, end: todayEnd } = getLocalDayBounds();

            const [{ data: mealLogs }, { data: symptomLogs }] = await Promise.all([
                supabase
                    .from('meal_logs')
                    .select('meal_type')
                    .eq('user_id', user.id)
                    .gte('logged_at', todayStart)
                    .lte('logged_at', todayEnd),
                supabase
                    .from('symptom_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .gte('logged_at', todayStart)
                    .lte('logged_at', todayEnd)
                    .order('logged_at', { ascending: false })
                    .limit(1),
            ]);

            const mealTypes = (mealLogs || []).map(l => l.meal_type);
            const latestSymptomLog = symptomLogs?.[0] ?? null;
            const hasSymptomsLogged = Boolean(latestSymptomLog);

            setTodayLogs({
                breakfast: mealTypes.includes('breakfast'),
                lunch: mealTypes.includes('lunch'),
                dinner: mealTypes.includes('dinner'),
                symptoms: hasSymptomsLogged,
            });

            if (latestSymptomLog) {
                const log = latestSymptomLog;
                const { score, severity } = calculateGutScore({
                    bloating: log.bloating,
                    pain: log.pain,
                    urgency: log.urgency,
                    nausea: log.nausea,
                    fatigue: log.fatigue,
                    stoolType: log.stool_type,
                });

                setGutScore(score);
                setGutSeverity(severity);
                scoreProgress.value = withTiming(score, { duration: 1200, easing: Easing.out(Easing.ease) });
            } else if (profile) {
                const baselineScore = calculateOnboardingBaselineScore(
                    profile.diagnosed_conditions || [],
                    profile.known_triggers || []
                );

                setGutScore(baselineScore);
                setGutSeverity(null);
                scoreProgress.value = withTiming(baselineScore, { duration: 800, easing: Easing.out(Easing.ease) });
            } else {
                setGutScore(null);
                setGutSeverity(null);
                scoreProgress.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) });
            }

            // Fetch streak
            const { data: streakData } = await supabase
                .from('streaks')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (streakData) setStreak(streakData);

            // Fetch latest insights (last 5)
            const { data: insightData } = await supabase
                .from('ai_insights')
                .select('*')
                .eq('user_id', user.id)
                .order('generated_at', { ascending: false })
                .limit(5);

            setInsights(insightData || []);

            // Fetch last meal for window calculation
            const { data: lastMealData } = await supabase
                .from('meal_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('logged_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            setLastMeal(lastMealData);

            // Fetch counts for progress sync
            const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();
            const [{ count: mealCount }, { count: symptomCount }] = await Promise.all([
                supabase.from('meal_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gt('logged_at', fourteenDaysAgo),
                supabase.from('symptom_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gt('logged_at', fourteenDaysAgo)
            ]);
            setCounts({ meals: mealCount || 0, symptoms: symptomCount || 0 });

            // Fetch current meal recipe
            const currentMeal = getCurrentMealType();
            const { data: recipeData } = await supabase
                .from('recipes')
                .select('*')
                .eq('user_id', user.id)
                .eq('meal_type', currentMeal)
                .gte('generated_at', todayStart)
                .order('generated_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            setCurrentMealRecipe(recipeData);
            // Note: recipe generation is handled exclusively by recipes.tsx to prevent duplicates

        } catch (error) {
            console.error('Home data fetch error:', error);
        } finally {
            // Only set loading to false after the very first fetch
            setLoading(false);
        }
    }, [user?.id]);

    // Re-fetch data every time the user focuses on the Home tab. 
    // This provides the "realtime" feel of updated data (like Streaks)
    // without the massive performance cost of holding 3 persistent WebSocket connections open.
    useFocusEffect(
        useCallback(() => {
            fetchHomeData();
        }, [fetchHomeData])
    );

    const onRefresh = async (): Promise<void> => {
        setRefreshing(true);
        await fetchHomeData();
        setRefreshing(false);
    };

    const todayTiles = [
        { label: 'Breakfast', emoji: '🍳', done: todayLogs.breakfast, mealType: 'breakfast', color: colors.amber.DEFAULT, bgColor: '#FFF8E8' },
        { label: 'Lunch', emoji: '🥙', done: todayLogs.lunch, mealType: 'lunch', color: '#F59E0B', bgColor: '#FFF4E5' },
        { label: 'Dinner', emoji: '🍱', done: todayLogs.dinner, mealType: 'dinner', color: colors.purple.DEFAULT, bgColor: colors.purple.light },
        { label: 'Symptoms', emoji: '🤒', done: todayLogs.symptoms, mealType: 'symptoms', color: colors.red.DEFAULT, bgColor: '#FDE8E6' },
    ];

    // Only show skeleton if we have NO data at all
    if (loading && !streak && insights.length === 0 && gutScore === null) {
        return (
            <LinearGradient colors={[colors.gradient.start, colors.gradient.mid, colors.gradient.end]} style={{ flex: 1 }}>
                <SafeAreaView edges={['top']} style={{ flex: 1, paddingHorizontal: 20, gap: 16, paddingTop: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ gap: 4 }}>
                            <Skeleton width={120} height={12} />
                            <Skeleton width={160} height={22} />
                        </View>
                        <Skeleton width={40} height={40} borderRadius={20} />
                    </View>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </SafeAreaView>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={[colors.gradient.start, colors.gradient.mid, colors.gradient.end]}
            locations={[0, 0.6, 1]}
            style={{ flex: 1 }}
        >
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.DEFAULT} />}
                >
                    {/* Top Row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 }}>
                        <View style={{ flex: 1 }}>
                            <Text variant="label" color={colors.text2}>{getGreeting()}</Text>
                            <Text variant="heading" color={colors.text1} numberOfLines={1}>{firstName}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            {/* Streak Header Badge */}
                            <Pressable
                                onPress={() => router.push('/(tabs)/progress')}
                                style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 4,
                                    backgroundColor: '#FFF8E8', paddingHorizontal: 10, paddingVertical: 6,
                                    borderRadius: 16, borderWidth: 1, borderColor: '#FFEDD5'
                                }}
                            >
                                <Zap size={14} color="#EA580C" />
                                <Text variant="labelBold" color="#EA580C">{streak?.current_streak ?? 0}</Text>
                            </Pressable>
                            <Pressable onPress={() => router.push('/(tabs)/profile')}>
                                <Avatar name={profile?.full_name || user?.user_metadata?.full_name || user?.email} url={profile?.avatar_url} size={40} />
                            </Pressable>
                        </View>
                    </View>

                    {/* Mascot */}
                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <AnimatedMascot
                            expression={getMascotExpression()}
                            size={120}
                            message={getMascotMessage()}
                            showBubble={true}
                        />
                    </View>

                    {/* 1. Gut Score Card */}
                    <Card animated delay={0} style={{ marginTop: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                            <View style={{ width: 60, height: 60, alignItems: 'center', justifyContent: 'center' }}>
                                <Svg width={60} height={60}>
                                    <SvgCircle cx={30} cy={30} r={25} stroke={colors.border} strokeWidth={5} fill="none" />
                                    <AnimatedCircle
                                        cx={30} cy={30} r={25}
                                        stroke={colors.primary.DEFAULT}
                                        strokeWidth={5}
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        animatedProps={animatedCircleProps}
                                        rotation={-90}
                                        origin="30, 30"
                                    />
                                </Svg>
                                <View style={{ position: 'absolute', alignItems: 'center' }}>
                                    <Text variant="labelBold" color={colors.text1} style={{ fontSize: 16 }}>
                                        {gutScore ?? '--'}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text variant="title" color={colors.text1}>
                                    {todayLogs.symptoms
                                        ? gutSeverity === 'minimal'
                                            ? 'Minimal Symptoms'
                                            : gutSeverity === 'mild'
                                                ? 'Mild Symptoms'
                                                : gutSeverity === 'moderate'
                                                    ? 'Moderate Symptoms'
                                                    : 'Severe Symptoms'
                                        : 'Gut Sensitivity'}
                                </Text>
                                <Text variant="caption" color={colors.text2} style={{ marginTop: 2 }}>
                                    {todayLogs.symptoms ? 'Based on today\'s symptom burden' : 'Baseline from your onboarding profile'}
                                </Text>
                            </View>
                        </View>
                    </Card>



                    {/* 3. The SINGLE Most Important Insight Card */}
                    {insights.length > 0 && (
                        <View style={{ marginTop: 16 }}>
                             <Text variant="labelBold" color={colors.text2} style={{ marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Active Trigger Watch
                            </Text>
                            {(() => {
                                // Find the most critical insight (Confirmed/Likely first)
                                const insight = insights.find(i => ['trigger_confirmed', 'trigger_likely'].includes(i.insight_type)) || insights[0];
                                
                                const labels: Record<string, { title: string; color: string }> = {
                                    trigger_confirmed: { title: 'Confirmed Trigger', color: colors.red.DEFAULT },
                                    trigger_likely: { title: 'Highly Likely', color: colors.red.DEFAULT },
                                    trigger_watching: { title: 'Under Review', color: colors.amber.DEFAULT },
                                    recommendation: { title: 'Buddy Tip', color: colors.purple.DEFAULT },
                                    pattern: { title: 'Trend Alert', color: colors.amber.DEFAULT },
                                    weekly_summary: { title: 'Weekly Recap', color: colors.primary.DEFAULT },
                                };
                                const meta = labels[insight.insight_type] || { title: 'Insight', color: colors.primary.DEFAULT };

                                return (
                                    <Pressable key={insight.id} onPress={() => setSelectedInsight(insight)}>
                                        <Card 
                                            animated 
                                            delay={300} 
                                            style={{ 
                                                borderLeftWidth: 4, 
                                                borderLeftColor: meta.color,
                                                padding: 20
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                                <Sparkles size={14} color={meta.color} />
                                                <Text variant="badge" color={meta.color} style={{ textTransform: 'uppercase' }}>
                                                    {meta.title}
                                                </Text>
                                            </View>
                                            <Text variant="title" color={colors.text1} numberOfLines={2}>{insight.title}</Text>
                                            <Text variant="caption" color={colors.text2} numberOfLines={2} style={{ marginTop: 6, lineHeight: 15 }}>
                                                {insight.body}
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 14 }}>
                                                <Text variant="labelBold" color={colors.primary.DEFAULT}>Read Full Analysis</Text>
                                                <ArrowRight size={14} color={colors.primary.DEFAULT} />
                                            </View>
                                        </Card>
                                    </Pressable>
                                );
                            })()}
                        </View>
                    )}

                    {/* 3. Today's Log Grid */}
                    <View style={{ marginTop: 16 }}>
                        <Text variant="labelBold" color={colors.text2} style={{ marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Today
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                            {todayTiles.map((tile, index) => {
                                return (
                                    <Card
                                        key={tile.label}
                                        animated
                                        delay={400 + (index * 80)}
                                        style={{
                                            width: '48%',
                                            flexGrow: 1,
                                            padding: 14,
                                            borderWidth: 1,
                                            borderColor: tile.done ? tile.color : colors.border,
                                        }}
                                    >
                                        <Pressable
                                            onPress={() => {
                                                if (tile.mealType === 'symptoms') {
                                                    router.push('/(tabs)/log');
                                                } else {
                                                    router.push('/(tabs)/log');
                                                }
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <View style={{
                                                    width: 36, height: 36, borderRadius: 12,
                                                    backgroundColor: tile.done ? tile.color : tile.bgColor,
                                                    alignItems: 'center', justifyContent: 'center',
                                                    shadowColor: tile.color,
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: tile.done ? 0.3 : 0,
                                                    shadowRadius: 4,
                                                }}>
                                                    {tile.done ? (
                                                        <CheckCircle2 size={18} color="#FFF" />
                                                    ) : (
                                                        <Text style={{ fontSize: 20 }}>{tile.emoji}</Text>
                                                    )}
                                                </View>
                                                {tile.done && <CheckCircle2 size={16} color={colors.primary.DEFAULT} />}
                                            </View>
                                            <Text variant="foodName" color={colors.text1} style={{ marginTop: 8 }}>{tile.label}</Text>
                                            <Text variant="caption" color={tile.done ? tile.color : colors.text3} style={{ marginTop: 2 }}>
                                                {tile.done ? 'Logged' : 'Tap to log'}
                                            </Text>
                                        </Pressable>
                                    </Card>
                                );
                            })}
                        </View>
                    </View>

                    {/* 4. Daily Meal Plan */}
                    <Card animated delay={800} style={{ marginTop: 16, backgroundColor: colors.primary.light + '40', borderColor: colors.primary.DEFAULT, borderWidth: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    {mealType === 'breakfast' ? <Sunrise size={16} color={colors.primary.DEFAULT} /> :
                                        mealType === 'lunch' ? <Sun size={16} color={colors.primary.DEFAULT} /> :
                                            <Moon size={16} color={colors.primary.DEFAULT} />}
                                    <Text variant="labelBold" color={colors.primary.DEFAULT} style={{ textTransform: 'uppercase' }}>
                                        {mealType} Recommendation
                                    </Text>
                                </View>
                                <Text variant="title" color={colors.text1} style={{ marginTop: 4 }}>
                                    {currentMealRecipe ? currentMealRecipe.title : `No recipe for ${mealType}`}
                                </Text>
                                <Text variant="caption" color={colors.text2} style={{ marginTop: 2 }}>
                                    {currentMealRecipe
                                        ? currentMealRecipe.description.split('\n')[0]
                                        : `Tap to generate a gut-safe meal tailored to your triggers.`}
                                </Text>
                            </View>
                            <Pressable
                                onPress={() => router.push('/(tabs)/recipes')}
                                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary.DEFAULT, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <ChevronRight size={24} color="#FFF" />
                            </Pressable>
                        </View>
                    </Card>
                </ScrollView>
            </SafeAreaView>

            {/* ── Insight Detail Modal ────────────────────────────────────────────────── */}
            <Modal
                visible={selectedInsight !== null}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedInsight(null)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ 
                        backgroundColor: colors.bg, 
                        borderTopLeftRadius: 24, 
                        borderTopRightRadius: 24, 
                        maxHeight: '85%',
                        padding: 24,
                        paddingBottom: 40,
                        gap: 20
                    }}>
                        {/* Header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            {(() => {
                                 const labels: Record<string, { title: string; color: string; bg: string }> = {
                                    trigger_confirmed: { title: 'Confirmed Trigger', color: colors.red.DEFAULT, bg: colors.red.light },
                                    trigger_likely: { title: 'Highly Likely', color: colors.red.DEFAULT, bg: colors.red.light },
                                    trigger_watching: { title: 'Under Review', color: colors.amber.DEFAULT, bg: colors.amber.light },
                                    recommendation: { title: 'Buddy Tip', color: colors.purple.DEFAULT, bg: colors.purple.light },
                                    pattern: { title: 'Trend Alert', color: colors.amber.DEFAULT, bg: colors.amber.light },
                                    weekly_summary: { title: 'Weekly Recap', color: colors.primary.DEFAULT, bg: colors.primary.light },
                                };
                                const typeKey = selectedInsight?.insight_type || 'recommendation';
                                const meta = labels[typeKey] || { title: 'Insight', color: colors.primary.DEFAULT, bg: colors.primary.light };
                                
                                return (
                                    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: meta.bg }}>
                                        <Text variant="badge" color={meta.color}>{meta.title.toUpperCase()}</Text>
                                    </View>
                                );
                            })()}
                           <Pressable onPress={() => setSelectedInsight(null)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.stone, alignItems: 'center', justifyContent: 'center' }}>
                               <X size={18} color={colors.text1} />
                           </Pressable>
                        </View>

                        <View>
                            <Text variant="heading" color={colors.text1}>{selectedInsight?.title}</Text>
                            <Text variant="caption" color={colors.text3} style={{ marginTop: 4 }}>
                                Generated on {selectedInsight ? new Date(selectedInsight.generated_at).toLocaleDateString() : ''}
                            </Text>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text variant="body" color={colors.text1} style={{ lineHeight: 22 }}>
                                {selectedInsight?.body}
                            </Text>

                            {selectedInsight?.related_foods && selectedInsight.related_foods.length > 0 && (
                                <View style={{ marginTop: 24 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                        <Heart size={16} color={colors.text1} />
                                        <Text variant="labelBold" color={colors.text1}>Related Foods</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                        {selectedInsight.related_foods.map(food => (
                                            <View key={food} style={{ backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
                                                <Text variant="body" color={colors.text1}>{food}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            <Card style={{ marginTop: 24, backgroundColor: colors.primary.light, borderColor: colors.primary.mid }}>
                                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                                    <ShieldCheck size={20} color={colors.primary.DEFAULT} />
                                    <View style={{ flex: 1 }}>
                                        <Text variant="bodyBold" color={colors.primary.DEFAULT}>Confidence: {selectedInsight?.confidence?.toUpperCase() || 'LOW'}</Text>
                                        <Text variant="caption" color={colors.primary.DEFAULT} style={{ opacity: 0.8 }}>
                                            Analysis based on your last 14 days of personal logs and medical guidelines.
                                        </Text>
                                    </View>
                                </View>
                            </Card>
                        </ScrollView>

                        <Pressable 
                            onPress={() => setSelectedInsight(null)}
                            style={{ 
                                backgroundColor: colors.primary.DEFAULT, 
                                height: 54, 
                                borderRadius: 16, 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                marginTop: 10
                            }}
                        >
                            <Text variant="bodyBold" color="#FFF">Got it, thanks!</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
}

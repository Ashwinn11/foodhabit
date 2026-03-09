import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Pressable, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Sunrise, Sun, Moon, Heart, CheckCircle2, ChevronRight,
    Zap, ArrowRight, TrendingDown, TrendingUp,
} from 'lucide-react-native';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import AnimatedMascot from '@/components/AnimatedMascot';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { colors, radii, shadows } from '@/theme';
import type { MealLog, SymptomLog, Streak, AiInsight } from '@/lib/database.types';

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);

interface DayLog {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    symptoms: boolean;
}

export default function HomeScreen(): React.JSX.Element {
    const router = useRouter();
    const { profile, user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [todayLogs, setTodayLogs] = useState<DayLog>({ breakfast: false, lunch: false, dinner: false, symptoms: false });
    const [gutScore, setGutScore] = useState<number | null>(null);
    const [streak, setStreak] = useState<Streak | null>(null);
    const [latestInsight, setLatestInsight] = useState<AiInsight | null>(null);
    const [currentMealRecipe, setCurrentMealRecipe] = useState<any | null>(null);

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
            const today = new Date().toISOString().split('T')[0];
            const todayStart = `${today}T00:00:00`;
            const todayEnd = `${today}T23:59:59`;

            // Fetch today's meal logs
            const { data: mealLogs } = await supabase
                .from('meal_logs')
                .select('meal_type')
                .eq('user_id', user.id)
                .gte('logged_at', todayStart)
                .lte('logged_at', todayEnd);

            const mealTypes = (mealLogs || []).map(l => l.meal_type);
            setTodayLogs({
                breakfast: mealTypes.includes('breakfast'),
                lunch: mealTypes.includes('lunch'),
                dinner: mealTypes.includes('dinner'),
                symptoms: false,
            });

            // Fetch today's symptom logs
            const { data: symptomLogs } = await supabase
                .from('symptom_logs')
                .select('*')
                .eq('user_id', user.id)
                .gte('logged_at', todayStart)
                .lte('logged_at', todayEnd)
                .order('logged_at', { ascending: false })
                .limit(1);

            if (symptomLogs && symptomLogs.length > 0) {
                setTodayLogs(prev => ({ ...prev, symptoms: true }));
                const log = symptomLogs[0];
                const symptoms = [log.bloating, log.pain, log.urgency, log.nausea, log.fatigue];
                const avg = symptoms.reduce((a, b) => a + b, 0) / symptoms.length;
                const max = Math.max(...symptoms);

                const weightedAvg = (avg * 0.6) + (max * 0.4);
                const score = Math.max(0, Math.round(100 - weightedAvg * 10));

                setGutScore(score);
                scoreProgress.value = withTiming(score, { duration: 1200, easing: Easing.out(Easing.ease) });
            } else if (profile) {
                const triggers = profile.known_triggers || [];
                const conditions = profile.diagnosed_conditions || [];
                const baseScore = 92;
                const penalty = Math.min(triggers.length * 8 + conditions.length * 5, 40);
                const baselineScore = baseScore - penalty;

                setGutScore(baselineScore);
                scoreProgress.value = withTiming(baselineScore, { duration: 1200, easing: Easing.out(Easing.ease) });
            }

            // Fetch streak
            const { data: streakData } = await supabase
                .from('streaks')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (streakData) setStreak(streakData);

            // Fetch latest insight
            const { data: insights } = await supabase
                .from('ai_insights')
                .select('*')
                .eq('user_id', user.id)
                .order('generated_at', { ascending: false })
                .limit(1);

            if (insights && insights.length > 0) setLatestInsight(insights[0]);

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

            // PROACTIVE GENERATION: If no recipe exists for current slot, trigger it in background
            if (!recipeData) {
                supabase.functions.invoke('generate-recipe', {
                    body: { user_id: user.id, source: 'daily', meal_type: currentMeal },
                }).then(({ data: genData }) => {
                    if (genData && !genData.error) {
                        setCurrentMealRecipe(genData);
                    }
                }).catch(e => console.error('Proactive recipe generation failed:', e));
            }

        } catch (error) {
            console.error('Home data fetch error:', error);
        } finally {
            // Only set loading to false after the very first fetch
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchHomeData();

        // Subscribe to real-time updates
        const streakSubscription = supabase
            .channel('streak-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'streaks', filter: `user_id=eq.${user?.id}` }, () => {
                fetchHomeData();
            })
            .subscribe();

        const insightsSubscription = supabase
            .channel('insight-updates')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_insights', filter: `user_id=eq.${user?.id}` }, () => {
                fetchHomeData();
            })
            .subscribe();

        const logsSubscription = supabase
            .channel('log-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_logs', filter: `user_id=eq.${user?.id}` }, () => {
                fetchHomeData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(streakSubscription);
            supabase.removeChannel(insightsSubscription);
            supabase.removeChannel(logsSubscription);
        };
    }, [user?.id, fetchHomeData]);

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

    const insightBorderColor = latestInsight ? {
        trigger_watching: colors.red.DEFAULT,
        trigger_likely: colors.red.DEFAULT,
        trigger_confirmed: colors.red.DEFAULT,
        pattern: colors.amber.DEFAULT,
        recommendation: colors.purple.DEFAULT,
        weekly_summary: colors.primary.DEFAULT,
    }[latestInsight.insight_type] : colors.primary.DEFAULT;

    // Only show skeleton if we have NO data at all
    if (loading && !streak && !latestInsight && gutScore === null) {
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
                        <View>
                            <Text variant="label" color={colors.text2}>{getGreeting()}</Text>
                            <Text variant="heading" color={colors.text1}>{firstName}</Text>
                        </View>
                        <Avatar name={profile?.full_name} url={profile?.avatar_url} size={40} />
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

                    {/* Gut Score Card */}
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
                                    {todayLogs.symptoms ? (gutScore! >= 70 ? 'Great Day' : gutScore! >= 40 ? 'Decent Day' : 'Tough Day') : 'Baseline Score'}
                                </Text>
                                <Text variant="caption" color={colors.text2} style={{ marginTop: 2 }}>
                                    {todayLogs.symptoms ? 'Based on today\'s symptoms' : 'Initial score based on your profile'}
                                </Text>
                            </View>
                        </View>
                    </Card>

                    {/* Today's Log Grid */}
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
                                        delay={index * 80}
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

                    {/* Daily Meal Plan */}
                    <Card animated delay={360} style={{ marginTop: 16, backgroundColor: colors.primary.light + '40', borderColor: colors.primary.DEFAULT, borderWidth: 1 }}>
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
                                    {currentMealRecipe ? currentMealRecipe.title : `Preparing your ${mealType}...`}
                                </Text>
                                <Text variant="caption" color={colors.text2} style={{ marginTop: 2 }}>
                                    {currentMealRecipe
                                        ? currentMealRecipe.description.split('\n')[0]
                                        : `Our AI is tailoring a gut-safe ${mealType} based on your triggers.`}
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

                    {/* Streak Bar */}
                    <Card animated delay={320} style={{ marginTop: 16, backgroundColor: '#FFF8E8' }}>
                        <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{
                                width: 36, height: 36, borderRadius: 10,
                                backgroundColor: '#FFEDD5', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Zap size={18} color="#EA580C" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text variant="title" color={colors.text1}>
                                    {streak?.current_streak ?? 0} Day Streak
                                </Text>
                                <Text variant="caption" color={colors.text2}>
                                    {(streak?.current_streak ?? 0) > 0
                                        ? 'Keep it going! Every log counts.'
                                        : 'Start logging to build your streak!'}
                                </Text>
                            </View>
                            <ChevronRight size={18} color={colors.text3} />
                        </Pressable>
                    </Card>

                    {/* Latest Insight */}
                    {latestInsight ? (
                        <Card animated delay={400} style={{ marginTop: 16, borderLeftWidth: 3.5, borderLeftColor: insightBorderColor }}>
                            <Text variant="title" color={colors.text1} numberOfLines={1}>{latestInsight.title}</Text>
                            <Text variant="caption" color={colors.text2} numberOfLines={2} style={{ marginTop: 4, lineHeight: 14 }}>
                                {latestInsight.body}
                            </Text>
                            <Pressable
                                onPress={() => router.push('/(tabs)/progress')}
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}
                            >
                                <Text variant="labelBold" color={colors.primary.DEFAULT}>See all insights</Text>
                                <ArrowRight size={14} color={colors.primary.DEFAULT} />
                            </Pressable>
                        </Card>
                    ) : (
                        <Card animated delay={400} style={{ marginTop: 16 }}>
                            <Text variant="bodyBold" color={colors.text1}>Insights coming soon</Text>
                            <Text variant="caption" color={colors.text2} style={{ marginTop: 4 }}>
                                Log for a few more days to unlock your first insight.
                            </Text>
                            <View style={{ marginTop: 10, height: 6, borderRadius: 3, backgroundColor: colors.primary.light }}>
                                <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.primary.DEFAULT, width: '14%' }} />
                            </View>
                        </Card>
                    )}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

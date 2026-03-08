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
import { GutBuddyMascot } from '@/components/mascot/GutBuddy';
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

    const getMascotExpression = (): 'happy' | 'neutral' | 'sad' => {
        if (gutScore === null) return 'neutral';
        if (gutScore >= 70) return 'happy';
        if (gutScore >= 40) return 'neutral';
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

                // Weight the score more heavily toward the worst symptom
                // This ensures a 10/10 bloating doesn't get masked by other 0s
                const weightedAvg = (avg * 0.6) + (max * 0.4);
                const score = Math.max(0, Math.round(100 - weightedAvg * 10));

                setGutScore(score);
                scoreProgress.value = withTiming(score, { duration: 1200, easing: Easing.out(Easing.ease) });
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

        } catch (error) {
            console.error('Home data fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchHomeData();
    }, [fetchHomeData]);

    const onRefresh = async (): Promise<void> => {
        setRefreshing(true);
        await fetchHomeData();
        setRefreshing(false);
    };

    const todayTiles = [
        { label: 'Breakfast', icon: Sunrise, done: todayLogs.breakfast, mealType: 'breakfast' },
        { label: 'Lunch', icon: Sun, done: todayLogs.lunch, mealType: 'lunch' },
        { label: 'Dinner', icon: Moon, done: todayLogs.dinner, mealType: 'dinner' },
        { label: 'Symptoms', icon: Heart, done: todayLogs.symptoms, mealType: 'symptoms' },
    ];

    const insightBorderColor = latestInsight ? {
        trigger_watching: colors.red.DEFAULT,
        trigger_likely: colors.red.DEFAULT,
        trigger_confirmed: colors.red.DEFAULT,
        pattern: colors.amber.DEFAULT,
        recommendation: colors.purple,
        weekly_summary: colors.primary.DEFAULT,
    }[latestInsight.insight_type] : colors.primary.DEFAULT;

    if (loading) {
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
                        <GutBuddyMascot
                            expression={getMascotExpression()}
                            size={100}
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
                                    {gutScore === null ? 'No score yet' : gutScore >= 70 ? 'Great Day' : gutScore >= 40 ? 'Decent Day' : 'Tough Day'}
                                </Text>
                                <Text variant="caption" color={colors.text2} style={{ marginTop: 2 }}>
                                    {gutScore === null ? 'Log symptoms to see your score' : 'Based on today\'s symptoms'}
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
                                const Icon = tile.icon;
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
                                            borderColor: tile.done ? colors.primary.DEFAULT : colors.border,
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
                                                    width: 32, height: 32, borderRadius: 8,
                                                    backgroundColor: tile.done ? colors.primary.light : colors.cream,
                                                    alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <Icon size={16} color={tile.done ? colors.primary.DEFAULT : colors.text3} />
                                                </View>
                                                {tile.done && <CheckCircle2 size={16} color={colors.primary.DEFAULT} />}
                                            </View>
                                            <Text variant="foodName" color={colors.text1} style={{ marginTop: 8 }}>{tile.label}</Text>
                                            <Text variant="caption" color={tile.done ? colors.primary.DEFAULT : colors.text3} style={{ marginTop: 2 }}>
                                                {tile.done ? 'Logged' : 'Tap to log'}
                                            </Text>
                                        </Pressable>
                                    </Card>
                                );
                            })}
                        </View>
                    </View>

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

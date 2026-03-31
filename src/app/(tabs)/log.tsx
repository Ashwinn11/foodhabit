import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    ZoomIn,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Search, Camera, Sunrise, Sun, Moon, Apple, Utensils,
    AlertTriangle, CheckCircle, Clock, Check,
    Trash2, Wind, Zap, Droplets, Brain, BatteryLow,
} from 'lucide-react-native';
import * as Notifications from 'expo-notifications';

import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { DualBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { FoodSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { colors, radii } from '@/theme';
import { haptics } from '@/theme/haptics';
import type { FoodItem, MealType } from '@/lib/database.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ========================== MEAL SEGMENT ==========================
function MealSegment(): React.JSX.Element {
    const router = useRouter();
    const { showToast } = useToast();
    const { prefill, scannedData, autoLog } = useLocalSearchParams();
    const { user } = useAuthStore();

    const [mealType, setMealType] = useState<MealType>('breakfast');
    const [foodInput, setFoodInput] = useState((prefill as string) || '');
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [selectedFoods, setSelectedFoods] = useState<number[]>([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [notes, setNotes] = useState('');
    const [logging, setLogging] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (prefill && foodInput === prefill) {
            analyzeFood();
        }

        if (scannedData) {
            try {
                const parsed = JSON.parse(scannedData as string);
                if (Array.isArray(parsed)) {
                    setFoods(prev => [...prev, ...parsed]);

                    // Auto-select all newly added items
                    setSelectedFoods(prev => {
                        const newIndices = parsed.map((_, idx) => foods.length + idx);
                        return [...prev, ...newIndices];
                    });

                    // Clear params and input immediately
                    setFoodInput('');
                    router.setParams({ scannedData: undefined, autoLog: undefined, prefill: undefined });

                    if (autoLog === 'true') {
                        // Pass the parsed array and clear everything after
                        logMeal(parsed).then(() => {
                            setFoods([]);
                            setSelectedFoods([]);
                        });
                    }
                }
            } catch (e) {
                console.error('Failed to parse scannedData:', e);
            }
        }
    }, [prefill, scannedData]);

    const mealChips: { label: string; value: MealType; icon: any }[] = [
        { label: 'Breakfast', value: 'breakfast', icon: Sunrise },
        { label: 'Lunch', value: 'lunch', icon: Sun },
        { label: 'Dinner', value: 'dinner', icon: Moon },
        { label: 'Snack', value: 'snack', icon: Apple },
    ];

    const analyzeFood = async (): Promise<void> => {
        if (!foodInput.trim() || !user?.id) return;

        setAnalyzing(true);
        const itemsToScan = foodInput.split(',').map(i => i.trim()).filter(Boolean);
        setFoodInput(''); // Clear immediately for better UX

        try {
            // Process all comma-separated items in parallel
            const promises = itemsToScan.map(async (item) => {
                try {
                    const { data, error } = await supabase.functions.invoke('analyze-food', {
                        body: { mode: 'food', food_name: item, user_id: user.id },
                    });

                    if (error) throw error;

                    return {
                        name: data.name || item,
                        fodmap_risk: data.fodmap_risk || 'medium',
                        personal_verdict: data.personal_verdict || 'caution',
                        caution_action: data.caution_action,
                        trigger_reasons: data.why || [],
                        ingredients: data.ingredients || [],
                        contains_user_triggers: data.contains_user_triggers || [],
                        conflict_explanation: data.conflict_explanation,
                    } as FoodItem;
                } catch (error) {
                    console.error('Food analysis error for:', item, error);
                    return {
                        name: item,
                        fodmap_risk: 'medium',
                        personal_verdict: 'caution',
                        caution_action: "Couldn't analyse — try again",
                        trigger_reasons: [],
                    } as FoodItem;
                }
            });

            const results = await Promise.all(promises);

            setFoods(prev => {
                const nextFoods = [...prev, ...results];
                // Auto-select all newly added items
                const newIndices = results.map((_, idx) => prev.length + idx);
                setSelectedFoods(prevSel => [...prevSel, ...newIndices]);
                return nextFoods;
            });

            if (results.some(r => r.personal_verdict === 'avoid')) {
                haptics.triggerWarning();
            } else {
                haptics.badgeRevealed();
            }
        } catch (error) {
            console.error('Batch food analysis error:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    const toggleSelection = (index: number) => {
        setSelectedFoods(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
        haptics.buttonTap();
    };

    const getOverallVerdict = (items = foods): 'avoid' | 'caution' | 'safest' | null => {
        if (items.length === 0) return null;
        if (items.some(f => f.personal_verdict === 'avoid')) return 'avoid';
        if (items.some(f => f.personal_verdict === 'caution')) return 'caution';
        return 'safest';
    };

    const logMeal = async (overrideFoods?: FoodItem[]): Promise<void> => {
        const finalFoods = overrideFoods || foods;
        if (!user?.id || finalFoods.length === 0) return;
        setLogging(true);
        try {
            const overall = getOverallVerdict(finalFoods);
            const { error } = await supabase.from('meal_logs').insert({
                user_id: user.id,
                meal_type: mealType,
                foods: finalFoods as any,
                overall_meal_verdict: overall,
                notes: notes || null,
            });
            if (error) throw error;

            // Update streak
            const today = new Date().toISOString().split('T')[0];
            const { data: existingStreak } = await supabase
                .from('streaks')
                .select('*')
                .eq('user_id', user.id)
                .single();

            let finalStreak = 1;
            if (existingStreak) {
                const lastDate = existingStreak.last_logged_date;
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                const newStreak = lastDate === yesterday ? existingStreak.current_streak + 1
                    : lastDate === today ? existingStreak.current_streak
                        : 1;
                finalStreak = newStreak;
                await supabase.from('streaks').update({
                    current_streak: newStreak,
                    longest_streak: Math.max(newStreak, existingStreak.longest_streak),
                    last_logged_date: today,
                    updated_at: new Date().toISOString(),
                }).eq('user_id', user.id);
            } else {
                await supabase.from('streaks').insert({
                    user_id: user.id,
                    current_streak: 1,
                    longest_streak: 1,
                    last_logged_date: today,
                });
            }

            // Milestone haptics & notifications
            const milestones = [3, 7, 14, 30, 60, 90];
            if (milestones.includes(finalStreak)) {
                haptics.streakMilestone();
                Notifications.scheduleNotificationAsync({
                    content: {
                        title: `${finalStreak} Day Streak! 🔥`,
                        body: "You're consistently finding your triggers. That's how we fix the gut!",
                    },
                    trigger: null,
                });
            } else {
                haptics.mealLogged();
            }

            if (finalStreak > (existingStreak?.current_streak ?? 0)) {
                showToast({
                    title: 'Meal Logged! 🔥',
                    message: `Great job! You're now on a ${finalStreak} day streak.`,
                    type: 'success'
                });
            } else {
                showToast({
                    title: 'Meal Logged',
                    message: 'Your meal has been saved successfully.',
                    type: 'success'
                });
            }

            // Remove logged foods from the list
            if (overrideFoods) {
                // If override was used, we likely want to clear the whole temporary state
                setFoods([]);
                setSelectedFoods([]);
            } else {
                setFoods(prev => prev.filter((_, i) => !selectedFoods.includes(i)));
                setSelectedFoods([]);
            }
            setNotes('');
        } catch (error) {
            console.error('Log meal error:', error);
            showToast({
                title: 'Error',
                message: 'Failed to log meal. Please try again.',
                type: 'error'
            });
        } finally {
            setLogging(false);
        }
    };

    const activeFoods = foods.filter((_, i) => selectedFoods.includes(i));
    const overallVerdict = getOverallVerdict(activeFoods);
    const cautionItems = activeFoods.filter(f => f.personal_verdict === 'caution' && f.caution_action);
    const avoidItems = activeFoods.filter(f => f.personal_verdict === 'avoid');

    return (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
            <Text variant="heading" color={colors.text1} style={{ marginTop: 16 }}>Log a Meal</Text>
            <Text variant="label" color={colors.text2} style={{ marginTop: 4 }}>
                Every food is checked against your personal triggers
            </Text>

            {/* Meal Type Chips */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                {mealChips.map(chip => {
                    const Icon = chip.icon;
                    return (
                        <Chip
                            key={chip.value}
                            label={chip.label}
                            selected={mealType === chip.value}
                            icon={<Icon size={14} color={mealType === chip.value ? colors.primary.DEFAULT : colors.text3} />}
                            onPress={() => setMealType(chip.value)}
                        />
                    );
                })}
            </View>

            {/* Food Input */}
            <View style={{ marginTop: 20 }}>
                <Text variant="badge" color={colors.text3} style={{ textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    TYPE A FOOD OR SCAN A MENU
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                        <Input
                            icon={analyzing ? <ActivityIndicator size="small" color={colors.primary.DEFAULT} /> : <Search size={18} color={colors.text3} />}
                            placeholder="e.g. Greek yogurt, oat milk latte..."
                            value={foodInput}
                            onChangeText={setFoodInput}
                            onSubmitEditing={analyzeFood}
                            returnKeyType="go"
                        />
                    </View>
                    <Animated.View
                        entering={ZoomIn.duration(250)}
                        style={{
                            width: 48, height: 48, borderRadius: radii.input,
                            backgroundColor: colors.dark,
                            alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <Pressable
                            onPress={() => router.push('/scanner')}
                            style={{
                                width: '100%', height: '100%',
                                alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <Camera size={20} color="#FFFFFF" />
                        </Pressable>
                    </Animated.View>
                </View>
                <Text variant="caption" color={colors.text3} style={{ marginTop: 4 }}>
                    Both check every item against your gut profile
                </Text>
            </View>

            {/* Analyzing skeleton */}
            {analyzing && (
                <View style={{ marginTop: 12 }}>
                    <FoodSkeleton />
                </View>
            )}

            {/* Food Cards */}
            {foods.map((food, index) => {
                const isSelected = selectedFoods.includes(index);
                const dotColor = food.personal_verdict === 'avoid' ? colors.red.DEFAULT
                    : food.personal_verdict === 'caution' ? colors.amber.DEFAULT
                        : colors.primary.DEFAULT;

                return (
                    <Pressable key={`${food.name}-${index}`} onPress={() => toggleSelection(index)}>
                        <Card
                            animated
                            delay={0}
                            style={{
                                marginTop: 12,
                                borderWidth: 2,
                                borderColor: isSelected ? colors.primary.DEFAULT : 'transparent',
                                backgroundColor: isSelected ? colors.primary.light : colors.surface
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {isSelected ? <Check size={16} color={colors.primary.DEFAULT} /> : <Utensils size={16} color={colors.text2} />}
                                </View>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text variant="foodName" color={colors.text1} numberOfLines={2}>{food.name}</Text>
                                </View>
                                <DualBadge
                                    fodmapRisk={food.fodmap_risk}
                                    personalVerdict={food.personal_verdict}
                                    cautionAction={food.caution_action}
                                    style={{ maxWidth: '40%' }}
                                />
                            </View>

                            {food.trigger_reasons.length > 0 && (
                                <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.stone, gap: 6 }}>
                                    {food.personal_verdict === 'avoid' && food.contains_user_triggers && food.contains_user_triggers.length > 0 && (
                                        <View style={{ backgroundColor: colors.red.light, padding: 8, borderRadius: 8, marginBottom: 4 }}>
                                            <Text variant="caption" color={colors.red.DEFAULT} style={{ fontWeight: '700' }}>
                                                ⚠️ TRIGGER DETECTED: {food.contains_user_triggers.join(', ')}
                                            </Text>
                                        </View>
                                    )}
                                    {food.trigger_reasons.map((reason, i) => (
                                        <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: dotColor, marginTop: 5 }} />
                                            <Text variant="caption" color={colors.text2} style={{ flex: 1, lineHeight: 14 }}>{reason}</Text>
                                        </View>
                                    ))}
                                    {food.ingredients && food.ingredients.length > 0 && (
                                        <Text variant="caption" color={colors.text3} style={{ marginTop: 4, fontStyle: 'italic' }}>
                                            Ingredients: {food.ingredients.join(', ')}
                                        </Text>
                                    )}
                                </View>
                            )}

                            {food.conflict_explanation && (
                                <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary.DEFAULT, marginTop: 5 }} />
                                    <Text variant="caption" color={colors.primary.DEFAULT} style={{ flex: 1, lineHeight: 14 }}>
                                        {food.conflict_explanation}
                                    </Text>
                                </View>
                            )}
                        </Card>
                    </Pressable>
                );
            })}

            {/* Overall Meal Verdict */}
            {overallVerdict && activeFoods.length > 0 && (
                <Card animated delay={0} style={{
                    marginTop: 12,
                    backgroundColor: overallVerdict === 'avoid' ? colors.red.light
                        : overallVerdict === 'caution' ? colors.amber.light
                            : colors.primary.light,
                    borderWidth: 1,
                    borderColor: overallVerdict === 'avoid' ? colors.red.DEFAULT
                        : overallVerdict === 'caution' ? colors.amber.DEFAULT
                            : colors.primary.DEFAULT,
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        {overallVerdict === 'avoid' ? (
                            <AlertTriangle size={20} color={colors.red.DEFAULT} />
                        ) : (
                            <CheckCircle size={20} color={overallVerdict === 'caution' ? colors.amber.DEFAULT : colors.primary.DEFAULT} />
                        )}
                        <Text variant="bodyBold" color={colors.text1}>
                            {overallVerdict === 'avoid' ? 'Contains triggers — consider a swap'
                                : overallVerdict === 'caution' ? 'Proceed with caution'
                                    : 'Safe meal for you'}
                        </Text>
                    </View>

                    {overallVerdict === 'avoid' && avoidItems.length > 0 && (
                        <View style={{ marginTop: 8, paddingLeft: 30, gap: 4 }}>
                            {avoidItems.map((item, i) => (
                                <Text key={i} variant="caption" color={colors.red.DEFAULT} style={{ fontWeight: '700' }}>
                                    • {item.name}: Trigger detected
                                </Text>
                            ))}
                        </View>
                    )}

                    {overallVerdict === 'caution' && cautionItems.length > 0 && (
                        <View style={{ marginTop: 8, paddingLeft: 30, gap: 4 }}>
                            {cautionItems.map((item, i) => (
                                <Text key={i} variant="caption" color={colors.amber.DEFAULT} style={{ fontWeight: '600' }}>
                                    • {item.name}: {item.caution_action}
                                </Text>
                            ))}
                        </View>
                    )}
                </Card>
            )}

            {foods.length > 0 && (
                <>
                    <View style={{ marginTop: 20 }}>
                        <Input
                            label="Notes (optional)"
                            placeholder="Any additional notes..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                        />
                    </View>

                    <View style={{ marginTop: 20 }}>
                        <Button
                            title={selectedFoods.length > 0 ? `Log ${selectedFoods.length} Items` : 'Select items to log'}
                            icon={<Check size={18} color="#FFFFFF" />}
                            onPress={() => logMeal(activeFoods)}
                            disabled={selectedFoods.length === 0}
                            loading={logging}
                            fullWidth
                        />
                    </View>
                </>
            )}
        </ScrollView>
    );
}

// ========================== SYMPTOMS SEGMENT ==========================

// Severity color: green → amber → red
function getSeverityColor(value: number): string {
    if (value >= 7) return colors.red.DEFAULT;
    if (value >= 4) return colors.amber.DEFAULT;
    return colors.primary.DEFAULT;
}

// Bristol chart: 1–3 = hard (brown family), 4 = ideal (green), 5–7 = loose (desaturated blues)
const BRISTOL_COLORS = [
    '#7B4F2E', // 1 – very hard
    '#9B6B45', // 2
    '#B08060', // 3
    colors.primary.DEFAULT, // 4 – ideal
    '#8AACBF', // 5
    '#6B96B5', // 6
    '#517EA3', // 7 – watery
];
const BRISTOL_LABELS = ['Hard\nlumps', 'Lumpy', 'Cracked', 'Smooth\n(ideal)', 'Soft\nblobs', 'Mushy', 'Watery'];

// A single animated symptom bar row
function SymptomRow({
    label,
    icon: Icon,
    value,
    onSet,
}: {
    label: string;
    icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
    value: number;
    onSet: (v: number) => void;
}) {
    const scoreScale = useSharedValue(1);
    const barWidth = useSharedValue(0);
    const scoreColor = getSeverityColor(value);

    useEffect(() => {
        // Animate the fill bar width
        barWidth.value = withSpring(value / 10, { damping: 18, stiffness: 240, mass: 0.7 });
        // Pulse the score number on change
        scoreScale.value = withSequence(
            withSpring(1.35, { damping: 8, stiffness: 300 }),
            withSpring(1, { damping: 12, stiffness: 280 })
        );
    }, [value]);

    const barStyle = useAnimatedStyle(() => ({
        width: `${barWidth.value * 100}%`,
    }));
    const scoreStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scoreScale.value }],
    }));

    const SEGMENTS = 10;

    return (
        <View style={{ gap: 10 }}>
            {/* Header: icon + label + animated score */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {/* Icon circle */}
                <View style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: scoreColor + '18',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Icon size={16} color={scoreColor} strokeWidth={2} />
                </View>

                <Text variant="bodyBold" color={colors.text1} style={{ flex: 1 }}>{label}</Text>

                {/* Large animated score */}
                <Animated.View style={scoreStyle}>
                    <Text
                        style={{
                            fontFamily: 'Figtree_800ExtraBold',
                            fontSize: 22,
                            color: scoreColor,
                            minWidth: 28,
                            textAlign: 'right',
                        }}
                    >
                        {value}
                    </Text>
                </Animated.View>
                <Text variant="label" color={colors.text3} style={{ marginLeft: 1 }}>/10</Text>
            </View>

            {/* Segmented tap bar */}
            <View style={{ gap: 3 }}>
                {/* Background track */}
                <View style={{
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: colors.primary.light,
                    overflow: 'hidden',
                    position: 'relative',
                }}>
                    {/* Animated fill */}
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                borderRadius: 10,
                                backgroundColor: scoreColor,
                                opacity: 0.85,
                            },
                            barStyle,
                        ]}
                    />
                    {/* Invisible tap zones overlaid */}
                    <View style={{
                        position: 'absolute',
                        left: 0, right: 0, top: 0, bottom: 0,
                        flexDirection: 'row',
                    }}>
                        {Array.from({ length: SEGMENTS }).map((_, i) => (
                            <Pressable
                                key={i}
                                onPress={() => {
                                    // tapping segment i sets value to i+1; tapping active last segment → 0
                                    const next = value === i + 1 && i === 0 ? 0 : i + 1;
                                    onSet(next);
                                    haptics.sliderTick();
                                }}
                                style={{ flex: 1, height: '100%' }}
                            />
                        ))}
                    </View>
                </View>

                {/* Scale labels */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 }}>
                    <Text variant="caption" color={colors.text3}>None</Text>
                    <Text variant="caption" color={colors.text3}>Mild</Text>
                    <Text variant="caption" color={colors.text3}>Moderate</Text>
                    <Text variant="caption" color={colors.text3}>Severe</Text>
                </View>
            </View>
        </View>
    );
}

function SymptomsSegment(): React.JSX.Element {
    const { user } = useAuthStore();
    const { showToast } = useToast();
    const [bloating, setBloating] = useState(0);
    const [pain, setPain] = useState(0);
    const [urgency, setUrgency] = useState(0);
    const [nausea, setNausea] = useState(0);
    const [fatigue, setFatigue] = useState(0);
    const [stoolType, setStoolType] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [logging, setLogging] = useState(false);

    const symptoms: { label: string; icon: React.ComponentType<any>; value: number; setter: (v: number) => void }[] = [
        { label: 'Bloating',      icon: Wind,       value: bloating, setter: setBloating },
        { label: 'Stomach Pain',  icon: Zap,        value: pain,     setter: setPain     },
        { label: 'Urgency',       icon: Droplets,   value: urgency,  setter: setUrgency  },
        { label: 'Nausea',        icon: Brain,      value: nausea,   setter: setNausea   },
        { label: 'Fatigue',       icon: BatteryLow, value: fatigue,  setter: setFatigue  },
    ];

    // kept identical — only the bristolLabels const renaming for clarity
    const bristolLabels = BRISTOL_LABELS;

    const maybeGenerateInsight = useCallback(async (): Promise<void> => {
        if (!user?.id) return;

        try {
            const now = new Date();
            const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
            const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
            const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000).toISOString();
            const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();

            const [
                recentMealRes,
                mealCountRes,
                symptomCountRes,
                recentInsightRes,
            ] = await Promise.all([
                supabase
                    .from('meal_logs')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .gte('logged_at', sixHoursAgo)
                    .lte('logged_at', twoHoursAgo)
                    .limit(1),
                supabase
                    .from('meal_logs')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .gte('logged_at', fourteenDaysAgo),
                supabase
                    .from('symptom_logs')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .gte('logged_at', fourteenDaysAgo),
                supabase
                    .from('ai_insights')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .gte('generated_at', twelveHoursAgo),
            ]);

            const hasRecentMealWindow = (recentMealRes.count || 0) > 0;
            const hasEnoughMeals = (mealCountRes.count || 0) >= 3;
            const hasEnoughSymptoms = (symptomCountRes.count || 0) >= 2;
            const recentlyAnalyzed = (recentInsightRes.count || 0) > 0;

            if (!hasRecentMealWindow || !hasEnoughMeals || !hasEnoughSymptoms || recentlyAnalyzed) {
                return;
            }

            await supabase.functions.invoke('generate-insight', {
                body: { user_id: user.id },
            });
        } catch (error) {
            console.error('Background insight generation skipped:', error);
        }
    }, [user?.id]);

    const logSymptoms = async (): Promise<void> => {
        if (!user?.id) return;
        setLogging(true);
        try {
            const { error } = await supabase.from('symptom_logs').insert({
                user_id: user.id,
                bloating,
                pain,
                urgency,
                nausea,
                fatigue,
                stool_type: stoolType,
                notes: notes || null,
            });
            if (error) throw error;

            // Update streak (syncing with meal log logic)
            const today = new Date().toISOString().split('T')[0];
            const { data: existingStreak } = await supabase
                .from('streaks')
                .select('*')
                .eq('user_id', user.id)
                .single();

            let finalStreak = 1;
            if (existingStreak) {
                const lastDate = existingStreak.last_logged_date;
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                const newStreak = lastDate === yesterday ? existingStreak.current_streak + 1
                    : lastDate === today ? existingStreak.current_streak
                        : 1;
                finalStreak = newStreak;
                await supabase.from('streaks').update({
                    current_streak: newStreak,
                    longest_streak: Math.max(newStreak, existingStreak.longest_streak),
                    last_logged_date: today,
                    updated_at: new Date().toISOString(),
                }).eq('user_id', user.id);

                if (newStreak > existingStreak.current_streak) {
                    haptics.streakMilestone();
                    showToast({
                        title: 'Symptoms Logged! 🔥',
                        message: `Nicely done! You're on a ${finalStreak} day streak.`,
                        type: 'success'
                    });
                }
            } else {
                showToast({
                    title: 'Symptoms Logged',
                    message: 'Your health data has been recorded.',
                    type: 'success'
                });
            }

            setBloating(0);
            setPain(0);
            setUrgency(0);
            setNausea(0);
            setFatigue(0);
            setStoolType(null);
            setNotes('');

            void maybeGenerateInsight();
        } catch (error) {
            console.error('Log symptoms error:', error);
            showToast({
                title: 'Error',
                message: 'Failed to log symptoms. Please try again.',
                type: 'error'
            });
        } finally {
            setLogging(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>

            {/* Header */}
            <Text variant="heading" color={colors.text1} style={{ marginTop: 16 }}>How are you feeling?</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <Clock size={13} color={colors.text3} />
                <Text variant="label" color={colors.text3}>
                    {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </Text>
            </View>

            {/* ── Symptom rows ─────────────────────────────── */}
            <View style={{ marginTop: 24, gap: 24 }}>
                {symptoms.map(s => (
                    <SymptomRow
                        key={s.label}
                        label={s.label}
                        icon={s.icon}
                        value={s.value}
                        onSet={s.setter}
                    />
                ))}
            </View>

            {/* ── Bristol Stool Chart ───────────────────────── */}
            <View style={{ marginTop: 32 }}>
                <View style={{ marginBottom: 12 }}>
                    <Text variant="bodyBold" color={colors.text1}>Stool Type</Text>
                    <Text variant="caption" color={colors.text3} style={{ marginTop: 2 }}>
                        Bristol scale · 1 = hardest, 7 = loosest, 4 = ideal
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 5 }}>
                    {BRISTOL_LABELS.map((label, i) => {
                        const type = i + 1;
                        const isSelected = stoolType === type;
                        const chipColor = BRISTOL_COLORS[i];

                        return (
                            <Pressable
                                key={type}
                                onPress={() => {
                                    setStoolType(isSelected ? null : type);
                                    haptics.sliderTick();
                                }}
                                style={{
                                    flex: 1,
                                    borderRadius: 12,
                                    paddingVertical: 10,
                                    alignItems: 'center',
                                    gap: 6,
                                    backgroundColor: isSelected ? chipColor : colors.surface,
                                    borderWidth: isSelected ? 0 : 1.5,
                                    borderColor: colors.border,
                                    // colored top accent when not selected
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Colored top stripe when unselected */}
                                {!isSelected && (
                                    <View style={{
                                        position: 'absolute',
                                        top: 0, left: 0, right: 0,
                                        height: 4,
                                        backgroundColor: chipColor,
                                        borderTopLeftRadius: 10,
                                        borderTopRightRadius: 10,
                                    }} />
                                )}
                                <Text
                                    style={{
                                        fontFamily: 'Figtree_800ExtraBold',
                                        fontSize: 15,
                                        color: isSelected ? '#FFFFFF' : chipColor,
                                    }}
                                >
                                    {type}
                                </Text>
                                <Text
                                    variant="caption"
                                    color={isSelected ? 'rgba(255,255,255,0.85)' : colors.text3}
                                    style={{ fontSize: 7.5, textAlign: 'center', lineHeight: 10 }}
                                >
                                    {label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {/* ── Notes ────────────────────────────────────── */}
            <View style={{ marginTop: 24 }}>
                <Input
                    label="Notes (optional)"
                    placeholder="Anything else worth noting..."
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                />
            </View>

            {/* ── Log Button ───────────────────────────────── */}
            <View style={{ marginTop: 24 }}>
                <Button
                    title="Log Symptoms"
                    icon={<Check size={18} color="#FFFFFF" />}
                    onPress={logSymptoms}
                    loading={logging}
                    fullWidth
                />
            </View>

            <Text variant="caption" color={colors.text3} style={{ marginTop: 12, lineHeight: 18, textAlign: 'center' }}>
                AI trigger analysis runs after check-ins when enough recent meal data exists.
            </Text>

        </ScrollView>
    );
}

// ========================== MAIN LOG TAB ==========================
export default function LogScreen(): React.JSX.Element {
    const [segmentIndex, setSegmentIndex] = useState(0);

    return (
        <LinearGradient colors={[colors.gradient.start, colors.gradient.mid]} style={{ flex: 1 }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
                    <SegmentedControl
                        segments={['Meal', 'Symptoms']}
                        selectedIndex={segmentIndex}
                        onSelect={setSegmentIndex}
                    />
                </View>
                {segmentIndex === 0 && <MealSegment />}
                {segmentIndex === 1 && <SymptomsSegment />}
            </SafeAreaView>
        </LinearGradient>
    );
}

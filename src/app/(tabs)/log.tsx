import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Search, Camera, Sunrise, Sun, Moon, Apple, Utensils,
    AlertTriangle, CheckCircle, Clock, Check,
    Trash2,
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

    const symptoms = [
        { label: 'Bloating', value: bloating, setter: setBloating },
        { label: 'Stomach Pain', value: pain, setter: setPain },
        { label: 'Urgency', value: urgency, setter: setUrgency },
        { label: 'Nausea', value: nausea, setter: setNausea },
        { label: 'Fatigue', value: fatigue, setter: setFatigue },
    ];

    const bristolLabels = ['Hard lumps', 'Lumpy', 'Cracked', 'Smooth', 'Soft blobs', 'Mushy', 'Watery'];

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
            <Text variant="heading" color={colors.text1} style={{ marginTop: 16 }}>How are you feeling?</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <Clock size={14} color={colors.text2} />
                <Text variant="label" color={colors.text2}>
                    Now ({new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })})
                </Text>
            </View>

            {/* Symptom Sliders */}
            <View style={{ marginTop: 20, gap: 20 }}>
                {symptoms.map(symptom => (
                    <View key={symptom.label}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text variant="bodyBold" color={colors.text1}>{symptom.label}</Text>
                            <Text variant="labelBold" color={symptom.value > 6 ? colors.red.DEFAULT : symptom.value > 3 ? colors.amber.DEFAULT : colors.primary.DEFAULT}>
                                {symptom.value}/10
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                            {Array.from({ length: 11 }).map((_, i) => (
                                <Pressable
                                    key={i}
                                    onPress={() => { symptom.setter(i); haptics.sliderTick(); }}
                                    style={{
                                        flex: 1, height: 28, borderRadius: 6,
                                        backgroundColor: i <= symptom.value
                                            ? (symptom.value > 6 ? colors.red.DEFAULT : symptom.value > 3 ? colors.amber.DEFAULT : colors.primary.DEFAULT)
                                            : colors.primary.light,
                                    }}
                                />
                            ))}
                        </View>
                    </View>
                ))}
            </View>

            {/* Bristol Stool Chart */}
            <View style={{ marginTop: 24 }}>
                <Text variant="bodyBold" color={colors.text1} style={{ marginBottom: 10 }}>Bristol Stool Chart</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                    {bristolLabels.map((label, i) => {
                        const type = i + 1;
                        const isSelected = stoolType === type;
                        return (
                            <Pressable
                                key={type}
                                onPress={() => { setStoolType(type); haptics.sliderTick(); }}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderRadius: 8,
                                    backgroundColor: isSelected ? colors.primary.light : colors.surface,
                                    borderWidth: isSelected ? 1.5 : 1,
                                    borderColor: isSelected ? colors.primary.DEFAULT : colors.border,
                                    alignItems: 'center',
                                }}
                            >
                                <Text variant="bodyBold" color={isSelected ? colors.primary.DEFAULT : colors.text1}>{type}</Text>
                                <Text variant="caption" color={colors.text3} style={{ fontSize: 7, marginTop: 2, textAlign: 'center' }}>
                                    {label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <View style={{ marginTop: 16 }}>
                <Input label="Notes (optional)" placeholder="Any additional notes..." value={notes} onChangeText={setNotes} multiline />
            </View>

            <View style={{ marginTop: 20 }}>
                <Button title="Log Symptoms" icon={<Check size={18} color="#FFFFFF" />} onPress={logSymptoms} loading={logging} fullWidth />
            </View>
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

import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, Dimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Search, Camera, Sunrise, Sun, Moon, Apple, Utensils,
    AlertTriangle, CheckCircle, Smile, Frown, Clock, Check,
    Minus as MinusIcon, Plus as PlusIcon, Droplets, Activity as ActivityIcon,
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
    const { prefill, scannedData, autoLog } = useLocalSearchParams();
    const { user } = useAuthStore();

    const [mealType, setMealType] = useState<MealType>('breakfast');
    const [foodInput, setFoodInput] = useState((prefill as string) || '');
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [selectedFoods, setSelectedFoods] = useState<number[]>([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [stressLevel, setStressLevel] = useState(1);
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

                    // Clear params before logging
                    router.setParams({ scannedData: undefined, autoLog: undefined });

                    if (autoLog === 'true') {
                        // Pass the combined array or just the parsed array depending on desired behavior
                        // We'll pass the exact payload so it logs without needing state to update
                        logMeal(parsed);
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
        try {
            const { data, error } = await supabase.functions.invoke('analyze-food', {
                body: { mode: 'food', food_name: foodInput.trim(), user_id: user.id },
            });

            if (error) throw error;

            const foodItem: FoodItem = {
                name: data.name || foodInput.trim(),
                fodmap_risk: data.fodmap_risk || 'medium',
                personal_verdict: data.personal_verdict || 'caution',
                caution_action: data.caution_action,
                trigger_reasons: data.why || [],
                ingredients: data.ingredients || [],
                contains_user_triggers: data.contains_user_triggers || [],
                conflict_explanation: data.conflict_explanation,
            };

            setFoods(prev => [...prev, foodItem]);
            setSelectedFoods(prev => [...prev, foods.length]);
            setFoodInput('');

            if (foodItem.personal_verdict === 'avoid') {
                haptics.triggerWarning();
            } else {
                haptics.badgeRevealed();
            }
        } catch (error) {
            console.error('Food analysis error:', error);
            // Add food without analysis on failure
            const newIndex = foods.length;
            setFoods(prev => [...prev, {
                name: foodInput.trim(),
                fodmap_risk: 'medium',
                personal_verdict: 'caution',
                caution_action: "Couldn't analyse — try again",
                trigger_reasons: [],
            }]);
            setSelectedFoods(prev => [...prev, newIndex]);
            setFoodInput('');
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
                stress_level: stressLevel,
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

            Alert.alert('Meal Logged', 'Your meal has been logged successfully!');
            if (finalStreak > (existingStreak?.current_streak ?? 0)) {
                setShowConfetti(true);
            }
            // Remove logged foods from the list
            setFoods(prev => prev.filter((_, i) => !selectedFoods.includes(i)));
            setSelectedFoods([]);
            setNotes('');
            setStressLevel(1);
        } catch (error) {
            console.error('Log meal error:', error);
            Alert.alert('Error', 'Failed to log meal. Please try again.');
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
                    <Pressable
                        onPress={() => router.push('/scanner')}
                        style={{
                            width: 48, height: 48, borderRadius: radii.input,
                            backgroundColor: colors.dark,
                            alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <Camera size={20} color="#FFFFFF" />
                    </Pressable>
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

            {/* Stress Level */}
            {foods.length > 0 && (
                <>
                    <View style={{ marginTop: 20 }}>
                        <Text variant="labelBold" color={colors.text2} style={{ marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Stress Level
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Smile size={18} color={colors.primary.DEFAULT} />
                            <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
                                {[1, 2, 3, 4, 5].map(level => (
                                    <Pressable
                                        key={level}
                                        onPress={() => { setStressLevel(level); haptics.sliderTick(); }}
                                        style={{
                                            flex: 1, height: 36, borderRadius: 8,
                                            backgroundColor: stressLevel >= level ? colors.primary.DEFAULT : colors.primary.light,
                                            alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <Text variant="badge" color={stressLevel >= level ? '#FFFFFF' : colors.primary.DEFAULT}>
                                            {level}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                            <Frown size={18} color={colors.red.DEFAULT} />
                        </View>
                    </View>

                    <View style={{ marginTop: 16 }}>
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
            {showConfetti && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 1000 }}>
                    <ConfettiCannon
                        count={200}
                        origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
                        fadeOut={true}
                        autoStart={true}
                        onAnimationEnd={() => setShowConfetti(false)}
                    />
                </View>
            )}
        </ScrollView>
    );
}

// ========================== SYMPTOMS SEGMENT ==========================
function SymptomsSegment(): React.JSX.Element {
    const { user } = useAuthStore();
    const [bloating, setBloating] = useState(0);
    const [pain, setPain] = useState(0);
    const [urgency, setUrgency] = useState(0);
    const [nausea, setNausea] = useState(0);
    const [fatigue, setFatigue] = useState(0);
    const [stoolType, setStoolType] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [logging, setLogging] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

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
                    setShowConfetti(true);
                    haptics.streakMilestone();
                }
            } else {
                await supabase.from('streaks').insert({
                    user_id: user.id,
                    current_streak: 1,
                    longest_streak: 1,
                    last_logged_date: today,
                });
                setShowConfetti(true);
            }

            Alert.alert('Symptoms Logged', 'Your symptoms have been recorded.');
            setBloating(0);
            setPain(0);
            setUrgency(0);
            setNausea(0);
            setFatigue(0);
            setStoolType(null);
            setNotes('');
        } catch (error) {
            console.error('Log symptoms error:', error);
            Alert.alert('Error', 'Failed to log symptoms. Please try again.');
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
            {showConfetti && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 1000 }}>
                    <ConfettiCannon
                        count={200}
                        origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
                        fadeOut={true}
                        autoStart={true}
                        onAnimationEnd={() => setShowConfetti(false)}
                    />
                </View>
            )}
        </ScrollView>
    );
}

// ========================== TODAY SEGMENT ==========================
function TodaySegment(): React.JSX.Element {
    const { user, profile } = useAuthStore();
    const [sleepHours, setSleepHours] = useState(7);
    const [sleepQuality, setSleepQuality] = useState(3);
    const [stressLevel, setStressLevel] = useState(3);
    const [exercise, setExercise] = useState(false);
    const [exerciseType, setExerciseType] = useState('');
    const [waterIntake, setWaterIntake] = useState(4);
    const [menstrualPhase, setMenstrualPhase] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const showMenstrual = profile?.biological_sex === 'female';

    const saveDailyFactors = async (): Promise<void> => {
        if (!user?.id) return;
        setSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const { error } = await supabase.from('daily_factors').upsert({
                user_id: user.id,
                date: today,
                sleep_hours: sleepHours,
                sleep_quality: sleepQuality,
                stress_level: stressLevel,
                exercise,
                exercise_type: exercise ? exerciseType : null,
                water_intake: waterIntake,
                menstrual_phase: menstrualPhase,
            }, { onConflict: 'user_id,date' });

            if (error) throw error;
            haptics.mealLogged();
            Alert.alert('Saved', 'Daily factors recorded.');
        } catch (error) {
            console.error('Save daily factors error:', error);
            Alert.alert('Error', 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
            <Text variant="heading" color={colors.text1} style={{ marginTop: 16 }}>How was your day?</Text>
            <Text variant="label" color={colors.text2} style={{ marginTop: 4, lineHeight: 16 }}>
                Non-food factors affect your gut too. Logging them helps find hidden triggers.
            </Text>

            {/* Sleep */}
            <Card animated delay={0} style={{ marginTop: 20 }}>
                <Text variant="bodyBold" color={colors.text1} style={{ marginBottom: 10 }}>Sleep</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                    <Pressable onPress={() => { if (sleepHours > 0) setSleepHours(sleepHours - 0.5); haptics.sliderTick(); }}>
                        <MinusIcon size={20} color={colors.text2} />
                    </Pressable>
                    <Text variant="labelBold" color={colors.text1} style={{ fontSize: 24, minWidth: 60, textAlign: 'center' }}>
                        {sleepHours}h
                    </Text>
                    <Pressable onPress={() => { if (sleepHours < 14) setSleepHours(sleepHours + 0.5); haptics.sliderTick(); }}>
                        <PlusIcon size={20} color={colors.text2} />
                    </Pressable>
                </View>
                <Text variant="caption" color={colors.text2} style={{ textAlign: 'center', marginTop: 6 }}>Quality</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 6 }}>
                    {[1, 2, 3, 4, 5].map(q => (
                        <Pressable key={q} onPress={() => { setSleepQuality(q); haptics.sliderTick(); }}>
                            <Text style={{ fontSize: 22 }} color={q <= sleepQuality ? colors.primary.DEFAULT : colors.text3}>
                                {q <= sleepQuality ? '\u2605' : '\u2606'}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </Card>

            {/* Stress */}
            <Card animated delay={80} style={{ marginTop: 12 }}>
                <Text variant="bodyBold" color={colors.text1} style={{ marginBottom: 10 }}>Stress Level</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Smile size={18} color={colors.primary.DEFAULT} />
                    <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
                        {[1, 2, 3, 4, 5].map(level => (
                            <Pressable
                                key={level}
                                onPress={() => { setStressLevel(level); haptics.sliderTick(); }}
                                style={{
                                    flex: 1, height: 36, borderRadius: 8,
                                    backgroundColor: stressLevel >= level ? colors.amber.DEFAULT : colors.amber.light,
                                    alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <Text variant="badge" color={stressLevel >= level ? '#FFFFFF' : colors.amber.DEFAULT}>{level}</Text>
                            </Pressable>
                        ))}
                    </View>
                    <Frown size={18} color={colors.red.DEFAULT} />
                </View>
            </Card>

            {/* Exercise */}
            <Card animated delay={160} style={{ marginTop: 12 }}>
                <Pressable
                    onPress={() => setExercise(!exercise)}
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <ActivityIcon size={18} color={colors.text2} />
                        <Text variant="bodyBold" color={colors.text1}>Exercise</Text>
                    </View>
                    <View style={{
                        width: 44, height: 26, borderRadius: 13,
                        backgroundColor: exercise ? colors.primary.DEFAULT : colors.stone,
                        justifyContent: 'center', paddingHorizontal: 2,
                    }}>
                        <View style={{
                            width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF',
                            alignSelf: exercise ? 'flex-end' : 'flex-start',
                        }} />
                    </View>
                </Pressable>
                {exercise && (
                    <View style={{ marginTop: 10 }}>
                        <Input placeholder="Type of exercise..." value={exerciseType} onChangeText={setExerciseType} />
                    </View>
                )}
            </Card>

            {/* Water */}
            <Card animated delay={240} style={{ marginTop: 12 }}>
                <Text variant="bodyBold" color={colors.text1} style={{ marginBottom: 10 }}>Water Intake</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                    <Pressable onPress={() => { if (waterIntake > 0) setWaterIntake(waterIntake - 1); haptics.sliderTick(); }}>
                        <MinusIcon size={20} color={colors.text2} />
                    </Pressable>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Droplets size={18} color={colors.primary.DEFAULT} />
                        <Text variant="labelBold" color={colors.text1} style={{ fontSize: 24 }}>{waterIntake}</Text>
                        <Text variant="label" color={colors.text2}>glasses</Text>
                    </View>
                    <Pressable onPress={() => { setWaterIntake(waterIntake + 1); haptics.sliderTick(); }}>
                        <PlusIcon size={20} color={colors.text2} />
                    </Pressable>
                </View>
            </Card>

            {/* Menstrual Phase — only for female users */}
            {showMenstrual && (
                <Card animated delay={320} style={{ marginTop: 12 }}>
                    <Text variant="bodyBold" color={colors.text1} style={{ marginBottom: 10 }}>Menstrual Phase</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {['Menstrual', 'Follicular', 'Ovulation', 'Luteal'].map(phase => (
                            <Chip
                                key={phase}
                                label={phase}
                                selected={menstrualPhase === phase.toLowerCase()}
                                onPress={() => setMenstrualPhase(phase.toLowerCase())}
                            />
                        ))}
                    </View>
                </Card>
            )}

            <View style={{ marginTop: 20 }}>
                <Button title="Save" icon={<Check size={18} color="#FFFFFF" />} onPress={saveDailyFactors} loading={saving} fullWidth />
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
                        segments={['Meal', 'Symptoms', 'Today']}
                        selectedIndex={segmentIndex}
                        onSelect={setSegmentIndex}
                    />
                </View>
                {segmentIndex === 0 && <MealSegment />}
                {segmentIndex === 1 && <SymptomsSegment />}
                {segmentIndex === 2 && <TodaySegment />}
            </SafeAreaView>
        </LinearGradient>
    );
}

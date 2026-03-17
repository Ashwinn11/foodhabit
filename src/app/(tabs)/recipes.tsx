import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ScrollView, Pressable, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Clock, UtensilsCrossed, Heart, Check, X, Share2,
    RefreshCw, Sparkles,
} from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { RecipeSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { colors, radii } from '@/theme';
import type { Recipe, MealType } from '@/lib/database.types';

export default function RecipesScreen(): React.JSX.Element {
    const { user } = useAuthStore();
    const { showToast } = useToast();
    const [todayRecipe, setTodayRecipe] = useState<Recipe | null>(null);
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
    const [context, setContext] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [genMealType, setGenMealType] = useState<MealType>('dinner');
    const fetchingRef = useRef(false);
    const skipNextRealtimeFetch = useRef(false);

    const getCurrentMealType = (): MealType => {
        const hour = new Date().getHours();
        if (hour < 10) return 'breakfast';
        if (hour < 15) return 'lunch';
        return 'dinner';
    };

    const fetchRecipes = useCallback(async () => {
        if (!user?.id || fetchingRef.current) return;
        fetchingRef.current = true;

        try {
            const today = new Date().toISOString().split('T')[0];
            const [dailyRes, savedRes] = await Promise.all([
                supabase
                    .from('recipes')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('meal_type', getCurrentMealType())
                    .gte('generated_at', `${today}T00:00:00`)
                    .order('generated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle(),
                supabase
                    .from('recipes')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('is_saved', true)
                    .order('generated_at', { ascending: false })
            ]);

            if (savedRes.data) setSavedRecipes(savedRes.data);
            if (dailyRes.data) setTodayRecipe(dailyRes.data);
        } catch (error) {
            console.error('Fetch recipes error:', error);
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, [user?.id]);

    useEffect(() => {
        fetchRecipes();

        // Realtime Subscription
        const sub = supabase
            .channel('recipe-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes', filter: `user_id=eq.${user?.id}` }, () => {
                // Skip refetch if we just manually generated — prevents the insert event
                // from overriding the custom recipe we just set in state
                if (skipNextRealtimeFetch.current) {
                    skipNextRealtimeFetch.current = false;
                    return;
                }
                fetchRecipes();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(sub);
        };
    }, [fetchRecipes, user?.id]);

    const generateRecipe = async (): Promise<void> => {
        if (!user?.id || generating) return;
        setGenerating(true);
        try {
            const ingredientsList = ingredients.split(',').map(i => i.trim()).filter(Boolean);
            const { data: genData, error: genError } = await supabase.functions.invoke('generate-recipe', {
                body: {
                    user_id: user.id,
                    source: 'generate',
                    context: context || undefined,
                    available_ingredients: ingredientsList.length > 0 ? ingredientsList : undefined,
                    meal_type: genMealType,
                },
            });

            if (genError) throw genError;
            if (genData?.error) throw new Error(genData.error);

            if (genData) {
                setTodayRecipe(genData);
                skipNextRealtimeFetch.current = true;
                setContext('');
                setIngredients('');
                showToast({ title: 'Recipe Ready! 🍲', message: 'Your gut-safe meal is ready.', type: 'success' });
            }
        } catch (error) {
            console.error('Generate recipe error:', error);
            showToast({ title: 'Error', message: 'Failed to generate. Please try again.', type: 'error' });
        } finally {
            setGenerating(false);
        }
    };

    const toggleSave = async (recipe: Recipe): Promise<void> => {
        const nextSaved = !recipe.is_saved;

        // Optimistic UI updates
        if (todayRecipe?.id === recipe.id) {
            setTodayRecipe(prev => prev ? { ...prev, is_saved: nextSaved } : null);
        }

        if (detailRecipe?.id === recipe.id) {
            setDetailRecipe(prev => prev ? { ...prev, is_saved: nextSaved } : null);
        }

        if (nextSaved) {
            // Added to saved list
            setSavedRecipes(prev => {
                const alreadyHas = prev.some(r => r.id === recipe.id);
                if (alreadyHas) return prev;
                return [{ ...recipe, is_saved: true }, ...prev];
            });
        } else {
            // Removed from saved list
            setSavedRecipes(prev => prev.filter(r => r.id !== recipe.id));
        }

        try {
            await supabase
                .from('recipes')
                .update({ is_saved: nextSaved })
                .eq('id', recipe.id);
            // No need for a full re-fetch here, we updated state optimistically
        } catch (error) {
            console.error('Toggle save error:', error);
            // Rollback if needed (though usually not necessary for minor UI like favs)
            fetchRecipes();
        }
    };

    const refreshTodayRecipe = async (): Promise<void> => {
        if (!user?.id || generating) return;
        setGenerating(true);
        try {
            const currentSlot = getCurrentMealType();
            const { data: genData, error } = await supabase.functions.invoke('generate-recipe', {
                body: { user_id: user.id, source: 'daily', meal_type: currentSlot },
            });
            if (error) throw error;
            if (genData && !genData.error) {
                setTodayRecipe(genData);
                showToast({
                    title: 'Recipe Refreshed!',
                    message: "Here's a fresh meal idea for you.",
                    type: 'success'
                });
            }
        } catch (error) {
            console.error('Refresh recipe error:', error);
            showToast({
                title: 'Error',
                message: 'Failed to refresh. Please check your data.',
                type: 'error'
            });
        } finally {
            setGenerating(false);
        }
    };

    // Only show skeleton on first load when NO data is present
    if (loading && !todayRecipe && savedRecipes.length === 0) {
        return (
            <LinearGradient colors={['#FFFBF0', '#F0FDF5']} style={{ flex: 1 }}>
                <SafeAreaView edges={['top']} style={{ flex: 1, padding: 20, gap: 12 }}>
                    <RecipeSkeleton />
                    <RecipeSkeleton />
                </SafeAreaView>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#FFFBF0', '#F0FDF5']} locations={[0, 1]} style={{ flex: 1 }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <KeyboardAvoidingView 
                    style={{ flex: 1 }} 
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
                        <Text variant="heading" color={colors.text1}>Recipes</Text>

                    {/* Today's Recipe - Only show if not saved */}
                    {todayRecipe && !todayRecipe.is_saved ? (
                        <Card animated delay={0} style={{
                            marginTop: 16,
                            backgroundColor: todayRecipe.source === 'daily' ? '#FFFBF0' : '#F5F3FF',
                            borderWidth: 1.5,
                            borderColor: todayRecipe.source === 'daily' ? colors.amber.DEFAULT : colors.purple.DEFAULT,
                            shadowColor: todayRecipe.source === 'daily' ? colors.amber.DEFAULT : colors.purple.DEFAULT,
                            shadowOpacity: 0.1,
                        }}>
                            <View style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                backgroundColor: todayRecipe.source === 'daily' ? colors.amber.DEFAULT : colors.purple.DEFAULT,
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 6,
                                zIndex: 1,
                            }}>
                                <Text variant="badge" color="#FFFFFF">
                                    {todayRecipe.source === 'daily' ? 'GUTSY\'S PICK' : 'CUSTOM REQUEST'}
                                </Text>
                            </View>

                            <View style={{ marginTop: 2 }}>
                                <Text variant="labelBold" color={todayRecipe.source === 'daily' ? colors.amber.DEFAULT : colors.purple.DEFAULT}>
                                    {todayRecipe.source === 'daily' ? 'Your Daily Gut-Safe Meal' : 'Based on your preferences'}
                                </Text>
                            </View>

                            {todayRecipe.trigger_free?.length > 0 && (
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                                    {todayRecipe.trigger_free.map(t => (
                                        <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.primary.light, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
                                            <Check size={10} color={colors.primary.DEFAULT} />
                                            <Text variant="caption" color={colors.primary.DEFAULT}>{t}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <Text variant="title" color={colors.text1} style={{ fontSize: 15, marginTop: 4 }}>{todayRecipe.title}</Text>
                            <Text variant="caption" color={colors.text2} style={{ marginTop: 4, lineHeight: 14 }}>{todayRecipe.description}</Text>

                            <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Clock size={12} color={colors.text3} />
                                    <Text variant="caption" color={colors.text3}>{todayRecipe.prep_time_mins} min</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <UtensilsCrossed size={12} color={colors.text3} />
                                    <Text variant="caption" color={colors.text3}>{todayRecipe.meal_type}</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                                <Button
                                    title="See Recipe"
                                    onPress={() => setDetailRecipe(todayRecipe)}
                                    style={{ flex: 1, backgroundColor: todayRecipe.source === 'daily' ? colors.primary.DEFAULT : colors.purple.DEFAULT }}
                                />
                                <Pressable
                                    onPress={() => toggleSave(todayRecipe)}
                                    style={{
                                        width: 48, height: 48, borderRadius: radii.btn, borderWidth: 1.5,
                                        borderColor: todayRecipe.is_saved ? colors.red.DEFAULT : colors.border,
                                        alignItems: 'center', justifyContent: 'center',
                                        backgroundColor: todayRecipe.is_saved ? colors.red.light : 'transparent',
                                    }}
                                >
                                    <Heart size={18} color={todayRecipe.is_saved ? colors.red.DEFAULT : colors.text3} fill={todayRecipe.is_saved ? colors.red.DEFAULT : 'none'} />
                                </Pressable>
                            </View>

                            {todayRecipe.source === 'daily' ? (
                                <Pressable
                                    onPress={refreshTodayRecipe}
                                    disabled={generating}
                                    style={{ alignSelf: 'center', marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 4, opacity: generating ? 0.6 : 1 }}
                                >
                                    <RefreshCw size={12} color={colors.text3} />
                                    <Text variant="caption" color={colors.text3}>{generating ? 'Finding a new one...' : "This isn't for me"}</Text>
                                </Pressable>
                            ) : (
                                <View style={{ alignSelf: 'center', marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Text variant="caption" color={colors.text3}>Generated with your ingredients ✨</Text>
                                </View>
                            )}
                        </Card>
                    ) : generating ? (
                        <RecipeSkeleton />
                    ) : null}

                    {/* Saved Recipes */}
                    {savedRecipes.length > 0 && (
                        <View style={{ marginTop: 24 }}>
                            <Text variant="title" color={colors.text1}>Saved ({savedRecipes.length})</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                                {savedRecipes.map((recipe, i) => (
                                    <Pressable
                                        key={`saved-${recipe.id}-${i}`}
                                        onPress={() => setDetailRecipe(recipe)}
                                        style={{ width: '48%', flexGrow: 1 }}
                                    >
                                        <Card animated delay={i * 80} style={{ padding: 14 }}>
                                            <Text variant="foodName" color={colors.text1} numberOfLines={2}>{recipe.title}</Text>
                                            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                                                <Text variant="caption" color={colors.text3}>{recipe.prep_time_mins}m</Text>
                                                <Text variant="caption" color={colors.text3}>{recipe.meal_type}</Text>
                                            </View>
                                        </Card>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* No recipe yet — hint */}
                    {!todayRecipe && !generating && (
                        <Card animated delay={0} style={{ marginTop: 16, alignItems: 'center', padding: 20, gap: 8 }}>
                            <Sparkles size={24} color={colors.primary.DEFAULT} />
                            <Text variant="caption" color={colors.text2} style={{ textAlign: 'center' }}>
                                No recipe yet for {getCurrentMealType()}. Use the form below to generate one.
                            </Text>
                        </Card>
                    )}
                    {generating && <RecipeSkeleton />}

                    {/* Generate Recipe Form */}
                    <View style={{ marginTop: 24 }}>
                        <Text variant="title" color={colors.text1}>Generate a Recipe</Text>
                        <View style={{ marginTop: 12, gap: 12 }}>
                            <Input
                                placeholder="What do you feel like eating? (optional)"
                                value={context}
                                onChangeText={setContext}
                            />
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(mt => (
                                    <Chip key={mt} label={mt} selected={genMealType === mt} onPress={() => setGenMealType(mt)} />
                                ))}
                            </View>
                            <Input
                                placeholder="What's in your fridge? (optional, comma-separated)"
                                value={ingredients}
                                onChangeText={setIngredients}
                            />
                            <Button title="Generate Safe Recipe" onPress={generateRecipe} loading={generating} fullWidth />
                        </View>
                    </View>
                </ScrollView>
                </KeyboardAvoidingView>

                {/* Recipe Detail Modal */}
                <Modal visible={!!detailRecipe} animationType="slide" presentationStyle="pageSheet">
                    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
                        {detailRecipe && (
                            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <Pressable onPress={() => setDetailRecipe(null)} style={{ padding: 4 }}>
                                        <X size={24} color={colors.text1} />
                                    </Pressable>
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        <Pressable onPress={() => toggleSave(detailRecipe)} style={{ padding: 4 }}>
                                            <Heart size={22} color={detailRecipe.is_saved ? colors.red.DEFAULT : colors.text3} fill={detailRecipe.is_saved ? colors.red.DEFAULT : 'none'} />
                                        </Pressable>
                                        <Pressable style={{ padding: 4 }}>
                                            <Share2 size={22} color={colors.text2} />
                                        </Pressable>
                                    </View>
                                </View>

                                <Text variant="heading" color={colors.text1}>{detailRecipe.title}</Text>
                                <View style={{ backgroundColor: colors.primary.light, padding: 12, borderRadius: 12, marginTop: 12 }}>
                                    <Text variant="body" color={colors.text1} style={{ lineHeight: 20 }}>{detailRecipe.description}</Text>
                                </View>

                                {detailRecipe.trigger_free?.length > 0 && (
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
                                        {detailRecipe.trigger_free.map(t => (
                                            <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.primary.light, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
                                                <Check size={10} color={colors.primary.DEFAULT} />
                                                <Text variant="caption" color={colors.primary.DEFAULT}>{t}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Clock size={14} color={colors.text3} />
                                        <Text variant="label" color={colors.text3}>{detailRecipe.prep_time_mins} min</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <UtensilsCrossed size={14} color={colors.text3} />
                                        <Text variant="label" color={colors.text3}>{detailRecipe.meal_type}</Text>
                                    </View>
                                </View>

                                {/* Ingredients */}
                                <Text variant="title" color={colors.text1} style={{ marginTop: 24 }}>Ingredients</Text>
                                <View style={{ marginTop: 8, gap: 8 }}>
                                    {(detailRecipe.ingredients as any[] || []).map((ing, i) => (
                                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.stone }}>
                                            <View style={{ flex: 1, gap: 2 }}>
                                                <Text variant="body" color={colors.text1}>{ing.amount} {ing.unit} {ing.name}</Text>
                                                {ing.is_safe_substitute && (
                                                    <View style={{ alignSelf: 'flex-start', backgroundColor: colors.primary.DEFAULT, paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 4 }}>
                                                        <Text variant="badge" color="#FFFFFF" style={{ fontSize: 7 }}>SAFE SUBSTITUTE</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={{ backgroundColor: ing.fodmap_risk === 'high' ? colors.red.light : ing.fodmap_risk === 'medium' ? colors.amber.light : colors.primary.light, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                                <Text variant="badge" color={ing.fodmap_risk === 'high' ? colors.red.DEFAULT : ing.fodmap_risk === 'medium' ? colors.amber.DEFAULT : colors.primary.DEFAULT}>
                                                    {ing.fodmap_risk.toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Steps */}
                                <Text variant="title" color={colors.text1} style={{ marginTop: 24 }}>Steps</Text>
                                <View style={{ marginTop: 8, gap: 12 }}>
                                    {(detailRecipe.steps as any[] || []).map((step, i) => (
                                        <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                                            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary.light, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text variant="labelBold" color={colors.primary.DEFAULT}>{step.step_number}</Text>
                                            </View>
                                            <Text variant="body" color={colors.text1} style={{ flex: 1, lineHeight: 20 }}>{step.instruction}</Text>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        )}
                    </SafeAreaView>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
}

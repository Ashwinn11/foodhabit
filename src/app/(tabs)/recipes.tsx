import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Pressable, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Clock, UtensilsCrossed, Heart, Check, X, Share2,
    RefreshCw, Lock as LockIcon,
} from 'lucide-react-native';
import { useSubscription } from '@/hooks/useSubscription';

import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { DualBadge } from '@/components/ui/Badge';
import { RecipeSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { colors, radii, shadows } from '@/theme';
import type { Recipe, MealType } from '@/lib/database.types';

export default function RecipesScreen(): React.JSX.Element {
    const { user } = useAuthStore();
    const { isPremium, isLoading: subLoading } = useSubscription();
    const [todayRecipe, setTodayRecipe] = useState<Recipe | null>(null);
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);

    // Generate form
    const [context, setContext] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [genMealType, setGenMealType] = useState<MealType>('dinner');

    const fetchRecipes = useCallback(async () => {
        if (!user?.id) return;
        try {
            // Today's recipe
            const today = new Date().toISOString().split('T')[0];
            const { data: daily } = await supabase
                .from('recipes')
                .select('*')
                .eq('user_id', user.id)
                .eq('source', 'daily')
                .gte('generated_at', `${today}T00:00:00`)
                .limit(1)
                .single();

            if (daily) {
                setTodayRecipe(daily);
            } else if (isPremium) {
                // Generate today's recipe only if premium
                try {
                    const { data } = await supabase.functions.invoke('generate-recipe', {
                        body: { user_id: user.id, source: 'daily', meal_type: 'dinner' },
                    });
                    if (data) {
                        const { data: newRecipe } = await supabase
                            .from('recipes')
                            .select('*')
                            .eq('user_id', user.id)
                            .order('generated_at', { ascending: false })
                            .limit(1)
                            .single();
                        if (newRecipe) setTodayRecipe(newRecipe);
                    }
                } catch {
                    // Silently fail
                }
            }

            // Saved recipes
            const { data: saved } = await supabase
                .from('recipes')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_saved', true)
                .order('generated_at', { ascending: false });

            if (saved) setSavedRecipes(saved);
        } catch (error) {
            console.error('Fetch recipes error:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

    const generateRecipe = async (): Promise<void> => {
        if (!user?.id) return;
        setGenerating(true);
        try {
            const ingredientsList = ingredients.split(',').map(i => i.trim()).filter(Boolean);
            await supabase.functions.invoke('generate-recipe', {
                body: {
                    user_id: user.id,
                    source: 'generate',
                    context: context || undefined,
                    available_ingredients: ingredientsList.length > 0 ? ingredientsList : undefined,
                    meal_type: genMealType,
                },
            });

            // Fetch the generated recipe
            const { data: newRecipe } = await supabase
                .from('recipes')
                .select('*')
                .eq('user_id', user.id)
                .eq('source', 'generate')
                .order('generated_at', { ascending: false })
                .limit(1)
                .single();

            if (newRecipe) {
                setDetailRecipe(newRecipe);
            }

            setContext('');
            setIngredients('');
        } catch (error) {
            console.error('Generate recipe error:', error);
            Alert.alert('Error', 'Failed to generate recipe. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const toggleSave = async (recipe: Recipe): Promise<void> => {
        try {
            await supabase
                .from('recipes')
                .update({ is_saved: !recipe.is_saved })
                .eq('id', recipe.id);
            await fetchRecipes();
        } catch (error) {
            console.error('Toggle save error:', error);
        }
    };

    const refreshTodayRecipe = async (): Promise<void> => {
        if (!user?.id) return;
        setGenerating(true);
        try {
            await supabase.functions.invoke('generate-recipe', {
                body: { user_id: user.id, source: 'daily', meal_type: 'dinner' },
            });
            const { data: newRecipe } = await supabase
                .from('recipes')
                .select('*')
                .eq('user_id', user.id)
                .eq('source', 'daily')
                .order('generated_at', { ascending: false })
                .limit(1)
                .single();
            if (newRecipe) setTodayRecipe(newRecipe);
        } catch (error) {
            console.error('Refresh recipe error:', error);
        } finally {
            setGenerating(false);
        }
    };

    if (loading || subLoading) {
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
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                    <Text variant="heading" color={colors.text1}>Recipes</Text>

                    {/* Today's Recipe */}
                    {todayRecipe ? (
                        <Card animated delay={0} style={{ marginTop: 16, backgroundColor: '#FFFBF0', borderWidth: 1, borderColor: colors.amber.DEFAULT }}>
                            <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: colors.amber.DEFAULT, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                                <Text variant="badge" color="#FFFFFF">TODAY</Text>
                            </View>

                            {todayRecipe.trigger_free.length > 0 && (
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                                    {todayRecipe.trigger_free.map(t => (
                                        <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.primary.light, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
                                            <Check size={10} color={colors.primary.DEFAULT} />
                                            <Text variant="caption" color={colors.primary.DEFAULT}>{t}-free</Text>
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
                                <Button title="See Recipe" onPress={() => setDetailRecipe(todayRecipe)} style={{ flex: 1 }} />
                                <Pressable
                                    onPress={() => toggleSave(todayRecipe)}
                                    style={{
                                        width: 48, height: 48, borderRadius: radii.btn, borderWidth: 1.5,
                                        borderColor: todayRecipe.is_saved ? colors.red.DEFAULT : colors.border,
                                        alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <Heart size={18} color={todayRecipe.is_saved ? colors.red.DEFAULT : colors.text3} fill={todayRecipe.is_saved ? colors.red.DEFAULT : 'none'} />
                                </Pressable>
                            </View>

                            <Pressable onPress={refreshTodayRecipe} style={{ alignSelf: 'center', marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <RefreshCw size={12} color={colors.text3} />
                                <Text variant="caption" color={colors.text3}>This isn't for me</Text>
                            </Pressable>
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
                                        key={recipe.id}
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

                    {/* Generate Recipe */}
                    <View style={{ marginTop: 24 }}>
                        <Text variant="title" color={colors.text1}>Generate a Recipe</Text>

                        <View style={{ marginTop: 12, gap: 12 }}>
                            <Input
                                placeholder="What do you feel like eating?"
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
                                <Text variant="body" color={colors.text2} style={{ marginTop: 6 }}>{detailRecipe.description}</Text>

                                {detailRecipe.trigger_free.length > 0 && (
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
                                        {detailRecipe.trigger_free.map(t => (
                                            <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.primary.light, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
                                                <Check size={10} color={colors.primary.DEFAULT} />
                                                <Text variant="caption" color={colors.primary.DEFAULT}>{t}-free</Text>
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
                                    {(detailRecipe.ingredients as any[]).map((ing, i) => (
                                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.stone }}>
                                            <Text variant="body" color={colors.text1}>{ing.amount} {ing.unit} {ing.name}</Text>
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
                                    {(detailRecipe.steps as any[]).map((step, i) => (
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

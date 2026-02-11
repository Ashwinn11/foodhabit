import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radii, shadows, fontSizes, fonts } from '../theme/theme';
import {
  ScreenWrapper,
  Typography,
  BoxButton,
  Button,
  NutritionCard,
  FoodListItem
} from '../components';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { analyzeFoodWithPersonalization } from '../services/fodmapService';
import { supabase } from '../config/supabase';
import { useGutActions, useTriggers, useGutData } from '../presentation/hooks';
import { useUserCondition } from '../presentation/hooks/useUserCondition';
import { useAuth } from '../hooks/useAuth';
import { FODMAPTag } from '../types/fodmap';
import { getNutritionScoreColor } from '../utils/nutritionScore';

type ScanFoodScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const ScanFoodScreen: React.FC<ScanFoodScreenProps> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { condition } = useUserCondition(); // Get user's condition for personalization
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  // Get trigger and gut data for personalization
  const { triggers } = useTriggers(userId);
  const { moments } = useGutData();

  // State for onboarding data
  const [onboardingData, setOnboardingData] = useState<any>(null);

  const [searchText, setSearchText] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [selectedFoodItems, setSelectedFoodItems] = useState<Record<string, boolean>>({});
  const [aiResults, setAiResults] = useState<Record<string, (FODMAPTag & {
    normalizedName?: string;
    nutrition?: any;
    nutritionScore?: number;
    explanation?: string;
  }) | null>>({});
  const [loadingFoods, setLoadingFoods] = useState<string[]>([]);
  const [triggerWarnings, setTriggerWarnings] = useState<Record<string, any>>({});

  // Use new actions for logging
  const { logMeal } = useGutActions();

  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('snack');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Fetch onboarding data on mount
  useEffect(() => {
    if (userId) {
      const fetchOnboarding = async () => {
        try {
          const { data } = await supabase
            .from('users')
            .select('onboarding_data')
            .eq('id', userId)
            .maybeSingle();
          setOnboardingData(data?.onboarding_data);
        } catch (err) {
          console.error('Failed to fetch onboarding data:', err);
        }
      };
      fetchOnboarding();
    }
  }, [userId]);

  // Quick suggestions
  const SUGGESTIONS = ['Coffee', 'Pizza', 'Garlic', 'Onion', 'Apple', 'Milk', 'Bread', 'Pasta', 'Rice', 'Chicken'];

  // Helper: Calculate symptom co-occurrence patterns
  const calculateSymptomPatterns = useCallback(() => {
    if (!moments || moments.length === 0) return [];

    const patterns: Map<string, number> = new Map();
    moments.forEach(m => {
      const activeSymptoms = Object.keys(m.symptoms || {}).filter(s => m.symptoms?.[s as keyof typeof m.symptoms]);
      if (activeSymptoms.length > 0) {
        const key = activeSymptoms.sort().join(' + ');
        patterns.set(key, (patterns.get(key) || 0) + 1);
      }
    });

    const total = moments.length || 1;
    return Array.from(patterns.entries()).map(([symptoms, count]) => ({
      symptoms: symptoms.split(' + '),
      frequency: count / total
    }));
  }, [moments]);

  // Helper: Get recent Bristol pattern summary
  const getRecentBristolPattern = useCallback(() => {
    if (!moments || moments.length === 0) return null;

    const last7Days = moments.slice(0, 7);
    const types = last7Days.map((m: any) => m.bristolType).filter(Boolean);
    if (types.length === 0) return null;

    const avg = types.reduce((a: number, b: number) => a + b, 0) / types.length;
    return {
      avgType: Math.round(avg),
      isDiarrhea: avg >= 6,
      isConstipated: avg <= 2
    };
  }, [moments]);

  // Helper: Get user context for AI personalization
  const getUserContext = useCallback(() => {
    const personalTriggers = triggers.map(trigger => ({
      food: trigger.food,
      symptoms: trigger.symptoms,
      count: trigger.occurrences,
      latency: trigger.latencyDescription
    }));

    const symptomPatterns = calculateSymptomPatterns();
    const bristolPattern = getRecentBristolPattern();

    return {
      userCondition: condition?.getType(),
      personalTriggers,
      symptomPatterns,
      recentBristolPattern: bristolPattern,
      onboardingProfile: onboardingData?.answers
    };
  }, [triggers, condition, onboardingData, calculateSymptomPatterns, getRecentBristolPattern]);

  // Helper: Check if a food is a known trigger
  const checkForKnownTriggers = useCallback((foodName: string) => {
    const normalizedName = foodName.toLowerCase().trim();
    const knownTrigger = triggers.find(t =>
      t.food.toLowerCase().trim() === normalizedName
    );

    if (knownTrigger && knownTrigger.probability >= 0.5) {
      return {
        isKnownTrigger: true,
        confidence: knownTrigger.confidence,
        frequencyText: knownTrigger.frequencyText,
        symptoms: knownTrigger.symptoms,
        latency: knownTrigger.latencyDescription
      };
    }

    return { isKnownTrigger: false };
  }, [triggers]);

  // Handle adding a food item - always use AI for normalization and analysis
  const addFood = useCallback(async (food: string) => {
    const rawInput = food.trim();
    if (!rawInput || selectedFoods.includes(rawInput)) {
      setSearchText('');
      Keyboard.dismiss();
      return;
    }

    // Add to selected foods immediately for responsiveness (using raw input for now)
    setSelectedFoods(prev => [...prev, rawInput]);
    // Don't auto-select - let user choose
    setSelectedFoodItems(prev => ({ ...prev, [rawInput]: false }));
    setSearchText('');
    Keyboard.dismiss();

    // Always call AI for analysis and normalization
    setLoadingFoods(prev => [...prev, rawInput]);
    try {
      // Get user context for personalized analysis
      const userContext = getUserContext();

      // Use personalized AI analysis
      const aiResult = await analyzeFoodWithPersonalization(
        rawInput,
        userContext.userCondition,
        userContext.personalTriggers,
        userContext.symptomPatterns
      );

      if (aiResult?.normalizedName) {
        // AI found a canonical name (fixed spelling, standardized casing, etc.)
        const canonicalName = aiResult.normalizedName;

        setSelectedFoods(prev => {
          // If we already added this canonical name, just remove the raw input
          if (prev.filter(f => f !== rawInput).includes(canonicalName)) {
            return prev.filter(f => f !== rawInput);
          }
          // Otherwise, replace raw input with canonical name
          return prev.map(f => f === rawInput ? canonicalName : f);
        });

        // Update selection state to use canonical name
        setSelectedFoodItems(prev => {
          const newState = { ...prev };
          const wasSelected = newState[rawInput];
          delete newState[rawInput];
          newState[canonicalName] = wasSelected;
          return newState;
        });

        setAiResults(prev => {
          const newState = { ...prev };
          delete newState[rawInput];
          newState[canonicalName] = aiResult;
          return newState;
        });

        // Check for known triggers
        const triggerInfo = checkForKnownTriggers(canonicalName);
        if (triggerInfo.isKnownTrigger) {
          setTriggerWarnings(prev => ({ ...prev, [canonicalName]: triggerInfo }));
        }
      } else {
        // No normalization found, keep raw input
        setAiResults(prev => ({ ...prev, [rawInput]: aiResult }));

        // Check for known triggers
        const triggerInfo = checkForKnownTriggers(rawInput);
        if (triggerInfo.isKnownTrigger) {
          setTriggerWarnings(prev => ({ ...prev, [rawInput]: triggerInfo }));
        }
      }
    } catch (e) {
      console.error('AI lookup failed:', e);
      setAiResults(prev => ({ ...prev, [rawInput]: null }));
    } finally {
      setLoadingFoods(prev => prev.filter(f => f !== rawInput));
    }
  }, [selectedFoods, aiResults, getUserContext, checkForKnownTriggers]);

  /**
   * Handle menu/food image scanning - extract food items from photo
   */
  const handleImageScan = useCallback(async (base64: string) => {
    setIsProcessingImage(true);
    try {
      // Get Supabase session for auth
      const { data: { session } } = await supabase.auth.getSession();

      // Call edge function with image to extract food items
      const supabaseUrl = (supabase as any).supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/analyze-food`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify({
          imageBase64: base64,
          extractFoodsOnly: true, // Signal edge function to extract foods from menu
        }),
      });

      if (!response.ok) {
        throw new Error(`Edge function error: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract foods array from response
      const extractedFoods = data.foods || data.extractedFoods || [];

      if (extractedFoods.length === 0) {
        Alert.alert(
          'No foods found',
          'Could not extract any food items from the image. Try a clearer photo of the menu.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Add all extracted foods in parallel for speed
      await Promise.all(extractedFoods.map((food: string) => addFood(food)));

      Alert.alert(
        'Foods extracted!',
        `Found ${extractedFoods.length} items: ${extractedFoods.slice(0, 3).join(', ')}${extractedFoods.length > 3 ? '...' : ''}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Image scan error:', error);
      Alert.alert(
        'Scan failed',
        'Could not process the image. Try a clearer photo or type the food manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessingImage(false);
    }
  }, [addFood]);

  /**
   * Launch camera or image picker to scan menu
   */
  const pickImage = useCallback(async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Camera Access Needed',
          'Please allow camera access to scan food menus.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch camera - capture full image without forced cropping
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        await handleImageScan(asset.base64 || '');
      }
    } catch (error) {
      console.error('Camera pick error:', error);
      // Fallback to gallery - capture full image without forced cropping
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.8,
          base64: true,
        });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          await handleImageScan(asset.base64 || '');
        }
      } catch (galleryError) {
        console.error('Gallery pick error:', galleryError);
      }
    }
  }, [handleImageScan]);

  const removeFood = (foodToRemove: string) => {
    setSelectedFoods(prev => prev.filter(f => f !== foodToRemove));
    setSelectedFoodItems(prev => {
      const newState = { ...prev };
      delete newState[foodToRemove];
      return newState;
    });
    setAiResults(prev => {
      const newResults = { ...prev };
      delete newResults[foodToRemove];
      return newResults;
    });
    setTriggerWarnings(prev => {
      const newWarnings = { ...prev };
      delete newWarnings[foodToRemove];
      return newWarnings;
    });
  };

  const handleLogMeal = () => {
    // Get only selected foods
    const foodsToLog = selectedFoods.filter(food => selectedFoodItems[food]);

    if (foodsToLog.length === 0) return;

    // Use AI-normalized names for trigger detection
    const normalizedFoods = foodsToLog.map(food => {
      const aiResult = aiResults[food];
      return aiResult?.normalizedName ? aiResult.normalizedName.toLowerCase().trim() : food.toLowerCase().trim();
    });

    // Dedupe normalized foods
    const uniqueNormalizedFoods = [...new Set(normalizedFoods)];

    // Calculate total nutrition from ONLY selected foods
    const nutrition = foodsToLog.reduce(
      (acc, food) => {
        const foodNutrition = aiResults[food]?.nutrition || {};
        return {
          calories: acc.calories + (foodNutrition.calories || 0),
          protein: acc.protein + (foodNutrition.protein || 0),
          carbs: acc.carbs + (foodNutrition.carbs || 0),
          fat: acc.fat + (foodNutrition.fat || 0),
          fiber: acc.fiber + (foodNutrition.fiber || 0),
          sugar: acc.sugar + (foodNutrition.sugar || 0),
          sodium: acc.sodium + (foodNutrition.sodium || 0),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
    );

    // Use the logMeal action from our new architecture hooks
    logMeal({
      mealType,
      name: foodsToLog.join(', '),
      foods: foodsToLog,
      normalizedFoods: uniqueNormalizedFoods,
      portionSize: 'medium',
      nutrition, // Add nutrition data to meal
    });

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Main');
    }
  };

  // derived state for "Safe to Eat?" result
  return (
    <ScreenWrapper edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BoxButton 
          icon="close" 
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Main');
            }
          }}
          size={44}
          style={{ backgroundColor: colors.white }}
        />
        <Typography variant="h3">Safe to Eat?</Typography>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Instructions */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.instructionsContainer}>
          <Typography variant="bodySmall" color={colors.black + '80'}>
            <Ionicons name="camera" size={14} color={colors.black + '80'} /> Scan a menu or type a food name
          </Typography>
        </Animated.View>

        {/* Search Input with Camera Button */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={24} color={colors.black + '66'} style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Type a food (e.g. Garlic)..."
              placeholderTextColor={colors.black + '40'}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={() => searchText.trim() && addFood(searchText.trim())}
              autoFocus
            />
            <Pressable
              onPress={pickImage}
              disabled={isProcessingImage}
              style={[styles.cameraButton, isProcessingImage && { opacity: 0.5 }]}
            >
              {isProcessingImage ? (
                <ActivityIndicator size="small" color={colors.pink} />
              ) : (
                <Ionicons name="camera" size={24} color={colors.pink} />
              )}
            </Pressable>
            {searchText.length > 0 && (
              <Pressable onPress={() => addFood(searchText.trim())} style={styles.addButton}>
                 <Typography variant="bodyBold" color={colors.white}>Add</Typography>
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Selected Foods Chips */}
        <View style={styles.chipsContainer}>
          {selectedFoods.map((food, index) => (
            <Animated.View key={food} entering={FadeIn.delay(index * 50)}>
              <Pressable style={styles.chip} onPress={() => removeFood(food)}>
                 {triggerWarnings[food] && (
                   <Ionicons
                     name="warning"
                     size={14}
                     color={colors.pink}
                     style={{ marginRight: 4 }}
                   />
                 )}
                 <Typography variant="bodySmall" color={colors.black}>{food}</Typography>
                 {loadingFoods.includes(food) ? (
                   <ActivityIndicator size="small" color={colors.blue} style={{ marginLeft: 4 }} />
                 ) : (
                   <Ionicons name="close-circle" size={18} color={colors.black + '66'} />
                 )}
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Food Analysis Sections */}
        {selectedFoods.length > 0 ? (
          <Animated.View entering={FadeInDown.springify()} style={styles.resultSection}>
             {/* Enhanced Food Analysis - List View for Multiple Foods */}
             {selectedFoods.length > 1 && (() => {
                // Get nutrition scores from AI for all foods
                const foodScores = selectedFoods.map(food => ({
                  food,
                  score: aiResults[food]?.nutritionScore || 5,
                }));
                const bestFood = foodScores.reduce((best, current) =>
                  current.score > best.score ? current : best
                );
                const worstFood = foodScores.reduce((worst, current) =>
                  current.score < worst.score ? current : worst
                );

                return (
                  <>
                    {/* Comparison Summary */}
                    <View style={styles.comparisonSummary}>
                      <View style={styles.comparisonItem}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.green} />
                        <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                          <Typography variant="caption" color={colors.black + '60'}>Best Choice</Typography>
                          <Typography variant="bodySmall" color={colors.green}>{bestFood.food}</Typography>
                        </View>
                        <View style={[styles.scoreIndicator, { backgroundColor: getNutritionScoreColor(bestFood.score) + '20' }]}>
                          <Typography variant="caption" color={getNutritionScoreColor(bestFood.score)} style={{ fontWeight: '700' }}>
                            {bestFood.score}/10
                          </Typography>
                        </View>
                      </View>

                      <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.sm }} />

                      <View style={styles.comparisonItem}>
                        <Ionicons name="alert-circle" size={16} color={colors.pink} />
                        <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                          <Typography variant="caption" color={colors.black + '60'}>Watch Out</Typography>
                          <Typography variant="bodySmall" color={colors.pink}>{worstFood.food}</Typography>
                        </View>
                        <View style={[styles.scoreIndicator, { backgroundColor: getNutritionScoreColor(worstFood.score) + '20' }]}>
                          <Typography variant="caption" color={getNutritionScoreColor(worstFood.score)} style={{ fontWeight: '700' }}>
                            {worstFood.score}/10
                          </Typography>
                        </View>
                      </View>
                    </View>

                    <Typography variant="bodyBold" color={colors.black} style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
                      Foods to Log
                    </Typography>

                    {/* Food List Items */}
                    {selectedFoods.map((food) => (
                      <FoodListItem
                        key={food}
                        foodName={food}
                        analysis={aiResults[food]}
                        isSelected={selectedFoodItems[food] || false}
                        onToggle={() => {
                          setSelectedFoodItems(prev => ({
                            ...prev,
                            [food]: !prev[food]
                          }));
                        }}
                        isLoading={loadingFoods.includes(food)}
                        triggerWarning={triggerWarnings[food]}
                      />
                    ))}

                    {/* Aggregate Nutrition Card */}
                    {(() => {
                      const selectedCount = Object.values(selectedFoodItems).filter(Boolean).length;
                      if (selectedCount === 0) return null;

                      const aggregateNutrition = selectedFoods.reduce(
                        (acc, food) => {
                          if (!selectedFoodItems[food]) return acc;
                          const foodNutrition = aiResults[food]?.nutrition || {};
                          return {
                            calories: acc.calories + (foodNutrition.calories || 0),
                            protein: acc.protein + (foodNutrition.protein || 0),
                            carbs: acc.carbs + (foodNutrition.carbs || 0),
                            fat: acc.fat + (foodNutrition.fat || 0),
                            fiber: acc.fiber + (foodNutrition.fiber || 0),
                            sugar: acc.sugar + (foodNutrition.sugar || 0),
                            sodium: acc.sodium + (foodNutrition.sodium || 0),
                          };
                        },
                        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
                      );

                      return (
                        <>
                          <View style={{ marginBottom: spacing.md }}>
                            <Typography variant="caption" color={colors.black + '60'} style={{ textAlign: 'center', marginBottom: spacing.sm }}>
                              Total for {selectedCount} selected item{selectedCount === 1 ? '' : 's'}
                            </Typography>
                          </View>
                          <NutritionCard
                            calories={aggregateNutrition.calories}
                            protein={aggregateNutrition.protein}
                            carbs={aggregateNutrition.carbs}
                            fat={aggregateNutrition.fat}
                            fiber={aggregateNutrition.fiber}
                            sugar={aggregateNutrition.sugar}
                            sodium={aggregateNutrition.sodium}
                          />
                        </>
                      );
                    })()}
                  </>
                );
             })()}

             {/* Single Food Detailed View */}
             {selectedFoods.length === 1 && (() => {
                const firstFood = selectedFoods[0];
                const analysis = aiResults[firstFood];
                if (!analysis) return null;

                return (
                  <>
                    {/* Nutrition Breakdown */}
                    <NutritionCard
                      calories={analysis.nutrition?.calories || 0}
                      protein={analysis.nutrition?.protein || 0}
                      carbs={analysis.nutrition?.carbs || 0}
                      fat={analysis.nutrition?.fat || 0}
                      fiber={analysis.nutrition?.fiber || 0}
                      sugar={analysis.nutrition?.sugar || 0}
                      sodium={analysis.nutrition?.sodium || 0}
                    />

                    {/* Use FoodListItem for consistent display */}
                    <FoodListItem
                      foodName={firstFood}
                      analysis={analysis}
                      isSelected={selectedFoodItems[firstFood] || false}
                      onToggle={() => {
                        setSelectedFoodItems(prev => ({
                          ...prev,
                          [firstFood]: !prev[firstFood]
                        }));
                      }}
                      isLoading={loadingFoods.includes(firstFood)}
                      triggerWarning={triggerWarnings[firstFood]}
                    />
                  </>
                );
             })()}

             {/* Log It Button */}
             <View style={styles.logActionContainer}>
                {selectedFoods.length > 1 && (
                  <Typography variant="bodySmall" color={colors.black + '60'} style={{ textAlign: 'center', marginBottom: spacing.sm }}>
                     {Object.values(selectedFoodItems).filter(Boolean).length} item{Object.values(selectedFoodItems).filter(Boolean).length === 1 ? '' : 's'} selected
                  </Typography>
                )}

                <Typography variant="bodySmall" color={colors.black + '60'} style={{ textAlign: 'center', marginBottom: spacing.sm }}>
                   Eating it anyway?
                </Typography>

                {/* Meal Type Selector (Mini) */}
                <View style={styles.mealTypeRow}>
                   {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(t => (
                      <Pressable
                        key={t}
                        onPress={() => setMealType(t)}
                        style={[styles.mealTypeChip, mealType === t && styles.mealTypeChipActive]}
                      >
                         <Typography variant="bodyXS" color={mealType === t ? colors.white : colors.black}>{t}</Typography>
                      </Pressable>
                   ))}
                </View>

                <Button
                   title={selectedFoods.length > 1 ? "Log Selected Foods" : "Log This Meal"}
                   onPress={handleLogMeal}
                   variant="primary"
                   color={colors.black}
                   size="lg"
                   icon="restaurant"
                />
             </View>
          </Animated.View>

        ) : (
          /* Empty State - Suggestions & Help */
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.suggestions}>
             <View style={styles.emptyStateGuide}>
                <View style={styles.guideRow}>
                   <Ionicons name="camera" size={20} color={colors.pink} />
                   <View style={styles.guideText}>
                      <Typography variant="bodyBold" color={colors.black}>Scan Menu</Typography>
                      <Typography variant="bodySmall" color={colors.black + '60'}>Tap the camera icon above to extract foods from a menu photo</Typography>
                   </View>
                </View>
                <View style={styles.guideDivider} />
                <View style={styles.guideRow}>
                   <Ionicons name="search" size={20} color={colors.blue} />
                   <View style={styles.guideText}>
                      <Typography variant="bodyBold" color={colors.black}>Type a Food</Typography>
                      <Typography variant="bodySmall" color={colors.black + '60'}>Type any food name in the search box above</Typography>
                   </View>
                </View>
             </View>

             <Typography variant="bodyBold" color={colors.black + '60'} style={{ marginBottom: spacing.md, marginTop: spacing.lg }}>
                Quick Check:
             </Typography>
             <View style={styles.chipsContainer}>
                {SUGGESTIONS.map(s => (
                   <Pressable key={s} style={styles.suggestionChip} onPress={() => addFood(s)}>
                      <Typography variant="bodySmall" color={colors.black}>{s}</Typography>
                      <Ionicons name="add" size={16} color={colors.black + '60'} />
                   </Pressable>
                ))}
             </View>
          </Animated.View>
        )}

      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: colors.blue,
    borderRadius: radii.lg,
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: spacing['4xl'],
    paddingHorizontal: spacing.lg,
  },
  emptyStateGuide: {
    backgroundColor: colors.blue + '10',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  guideDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  guideRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  guideText: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  instructionsContainer: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  input: {
    color: colors.black,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    height: '100%',
  },
  logActionContainer: {
    marginTop: spacing.xl,
  },
  mealTypeChip: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mealTypeChipActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  mealTypeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  resultSection: {
    marginTop: spacing.xl,
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
    borderColor: colors.border,
    borderWidth: 2,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  cameraButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    marginRight: spacing.xs,
    padding: spacing.xs,
  },
  suggestionChip: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  suggestions: {
    marginTop: spacing.xl,
  },
  comparisonSummary: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
    borderColor: colors.border,
    borderWidth: 1,
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  scoreIndicator: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    alignItems: 'center',
    minWidth: 35,
    marginLeft: spacing.sm,
  },
});

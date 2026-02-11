import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import * as KeepAwake from 'expo-keep-awake';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radii, shadows, fontSizes, fonts } from '../theme/theme';
import {
  ScreenWrapper,
  Typography,
  BoxButton,
  Button,
  NutritionCard,
  FoodListItem,
  CustomModal,
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
    score?: number;
    explanation?: string;
  }) | null>>({});
  const [loadingFoods, setLoadingFoods] = useState<string[]>([]);
  const [triggerWarnings, setTriggerWarnings] = useState<Record<string, any>>({});

  // Use new actions for logging
  const { logMeal } = useGutActions();

  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('snack');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Modal state for custom dialogs
  const [modalState, setModalState] = useState<{
    visible: boolean;
    type: 'info' | 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ visible: false, type: 'info', title: '', message: '' });

  // Abort controller for canceling AI requests
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Keep device awake during image processing
  useEffect(() => {
    if (isProcessingImage) {
      try {
        (KeepAwake as any).activate?.();
      } catch {
        // Keep awake not available (simulator or dev)
      }
    } else {
      try {
        (KeepAwake as any).deactivate?.();
      } catch {
        // Keep awake not available
      }
    }
  }, [isProcessingImage]);

  // Cleanup on unmount: cancel pending requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      try {
        (KeepAwake as any).deactivate?.();
      } catch {
        // Keep awake not available
      }
    };
  }, []);

  // Quick suggestions
  const SUGGESTIONS = ['Coffee', 'Pizza', 'Garlic', 'Onion', 'Apple', 'Milk', 'Bread', 'Pasta', 'Rice', 'Chicken'];

  // Helper: Normalize food names for consistent lookups (case-insensitive)
  const normalizeFoodName = (food: string) => food.toLowerCase().trim();

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

    // Get condition type from getType() method, with fallback to onboarding data
    let userCondition = 'unknown';
    if (condition) {
      userCondition = condition.getType();
    } else if (onboardingData?.answers?.userCondition) {
      // Fallback to onboarding data if condition hook hasn't loaded yet
      userCondition = onboardingData.answers.userCondition;
    }

    return {
      userCondition,
      personalTriggers,
      symptomPatterns,
      recentBristolPattern: bristolPattern,
      onboardingProfile: onboardingData?.answers
    };
  }, [triggers, condition, onboardingData, calculateSymptomPatterns, getRecentBristolPattern]);

  // Helper: Check if a food is a known trigger
  const checkForKnownTriggers = useCallback((foodName: string) => {
    const normalizedName = normalizeFoodName(foodName);
    const knownTrigger = triggers.find(t =>
      normalizeFoodName(t.food) === normalizedName
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
          setTriggerWarnings(prev => ({ ...prev, [normalizeFoodName(canonicalName)]: triggerInfo }));
        }
      } else {
        // No normalization found, keep raw input
        setAiResults(prev => ({ ...prev, [rawInput]: aiResult }));

        // Check for known triggers
        const triggerInfo = checkForKnownTriggers(rawInput);
        if (triggerInfo.isKnownTrigger) {
          setTriggerWarnings(prev => ({ ...prev, [normalizeFoodName(rawInput)]: triggerInfo }));
        }
      }
    } catch (e) {
      console.error('AI lookup failed:', e);
      setAiResults(prev => ({ ...prev, [rawInput]: null }));
    } finally {
      setLoadingFoods(prev => prev.filter(f => f !== rawInput));
      // Add haptic feedback on completion
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
        // Haptics not available (e.g., in simulator)
      });
    }
  }, [selectedFoods, aiResults, getUserContext, checkForKnownTriggers]);

  /**
   * Handle menu/food image scanning - extract food items from photo
   */
  const handleImageScan = useCallback(async (base64: string) => {
    setIsProcessingImage(true);

    try {
      // Base64 might be too large - compress/resize if needed
      const maxSize = 5000000; // 5MB limit (base64 encoded)
      if (base64.length > maxSize) {
        setModalState({
          visible: true,
          type: 'error',
          title: 'Image too large',
          message: 'Please select a smaller image or take a clearer photo.',
        });
        setIsProcessingImage(false);
        return;
      }

      // Call edge function using Supabase SDK (same as manual input)
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: {
          imageBase64: base64,
          extractFoodsOnly: true, // Signal edge function to extract foods from menu
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to analyze image');
      }

      // Extract foods array from response
      const extractedFoods = data?.foods || data?.extractedFoods || [];

      if (extractedFoods.length === 0) {
        setModalState({
          visible: true,
          type: 'error',
          title: 'No foods found',
          message: 'Could not extract any food items from the image. Try a clearer photo of the menu.',
        });
      } else {
        // Add all extracted foods in parallel for speed
        // Don't wait for this - let skeleton loaders show while analyzing
        Promise.all(extractedFoods.map((food: string) => addFood(food))).then(() => {
          setModalState({
            visible: true,
            type: 'success',
            title: 'Foods extracted!',
            message: `Found ${extractedFoods.length} items: ${extractedFoods.slice(0, 3).join(', ')}${extractedFoods.length > 3 ? '...' : ''}`,
          });
        });
      }
    } catch (error: any) {
      // Check if error is due to abort
      if (error.name === 'AbortError') {
        console.log('Image scan cancelled');
        return;
      }

      console.error('Image scan error:', error);
      setModalState({
        visible: true,
        type: 'error',
        title: 'Scan failed',
        message: 'Could not process the image. Try a clearer photo or type the food manually.',
      });
    } finally {
      // Only set to false if we haven't already closed it in the success case
      setIsProcessingImage(false);
      abortControllerRef.current = null;
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
        setModalState({
          visible: true,
          type: 'error',
          title: 'Camera Access Needed',
          message: 'Please allow camera access to scan food menus.',
        });
        return;
      }

      // Launch camera - capture full image without forced cropping
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.3,
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
          quality: 0.3,
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
        <Typography variant="h3">Scan Food</Typography>
        <View style={{ width: 44 }} /> 
      </View>

      <View style={{ flex: 1, position: 'relative' }}>
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


        {/* Food Analysis Sections */}
        {selectedFoods.length > 0 ? (
          <Animated.View entering={FadeInDown.springify()} style={styles.resultSection}>
               {/* Enhanced Food Analysis - List View for Multiple Foods */}
             {selectedFoods.length > 1 && (() => {
                // Compare foods using AI's personalized score for this user
                const foodScores = selectedFoods.map(food => {
                  const analysis = aiResults[food];
                  return {
                    food,
                    score: analysis?.score || 5,
                  };
                });

                const bestFood = foodScores.reduce((best, current) =>
                  current.score > best.score ? current : best
                );
                const worstFood = foodScores.reduce((worst, current) =>
                  current.score < worst.score ? current : worst
                );

                return (
                  <>
                    {/* Comparison Summary */}
                    <View style={styles.comparisonContainer}>
                      {/* Healthiest Choice Card */}
                      <LinearGradient
                        colors={[colors.green + '18', colors.green + '05']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.comparisonCard, styles.bestChoiceCard]}
                      >
                        <View style={styles.comparisonCardIcon}>
                          <Ionicons name="checkmark-circle" size={24} color={colors.white} />
                        </View>
                        <View style={{ flex: 1, marginLeft: spacing.md }}>
                          <Typography variant="caption" color={colors.green} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' }}>
                            Healthiest Choice
                          </Typography>
                          <Typography variant="bodyBold" color={colors.black} style={{ marginTop: 2 }}>
                            {bestFood.food}
                          </Typography>
                        </View>
                        <View style={styles.scoreCard}>
                          <Typography variant="bodyBold" color={getNutritionScoreColor(bestFood.score)}>
                            {bestFood.score}
                          </Typography>
                          <Typography variant="caption" color={getNutritionScoreColor(bestFood.score)}>
                            /10
                          </Typography>
                        </View>
                      </LinearGradient>

                      {/* Watch Out Card */}
                      <LinearGradient
                        colors={[colors.pink + '18', colors.pink + '05']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.comparisonCard, styles.worstChoiceCard]}
                      >
                        <View style={styles.comparisonCardIconWarning}>
                          <Ionicons name="alert-circle" size={24} color={colors.white} />
                        </View>
                        <View style={{ flex: 1, marginLeft: spacing.md }}>
                          <Typography variant="caption" color={colors.pink} style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' }}>
                            Watch Out
                          </Typography>
                          <Typography variant="bodyBold" color={colors.black} style={{ marginTop: 2 }}>
                            {worstFood.food}
                          </Typography>
                        </View>
                        <View style={styles.scoreCard}>
                          <Typography variant="bodyBold" color={getNutritionScoreColor(worstFood.score)}>
                            {worstFood.score}
                          </Typography>
                          <Typography variant="caption" color={getNutritionScoreColor(worstFood.score)}>
                            /10
                          </Typography>
                        </View>
                      </LinearGradient>
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
                        triggerWarning={triggerWarnings[normalizeFoodName(food)]}
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
                const normalizedFood = normalizeFoodName(firstFood);
                const triggerInfo = triggerWarnings[normalizedFood];

                return (
                  <>
                    {/* Show FoodListItem for loading state and results */}
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
                      triggerWarning={triggerInfo}
                    />

                    {/* Nutrition Breakdown - only show when analysis is complete */}
                    {analysis && (
                      <View style={{ marginTop: spacing.lg }}>
                        <NutritionCard
                          calories={analysis.nutrition?.calories || 0}
                          protein={analysis.nutrition?.protein || 0}
                          carbs={analysis.nutrition?.carbs || 0}
                          fat={analysis.nutrition?.fat || 0}
                          fiber={analysis.nutrition?.fiber || 0}
                          sugar={analysis.nutrition?.sugar || 0}
                          sodium={analysis.nutrition?.sodium || 0}
                        />
                      </View>
                    )}
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

        {/* Processing overlay during image scan */}
        {isProcessingImage && (
          <Animated.View entering={FadeIn} style={styles.processingOverlay}>
            <View style={styles.processingCard}>
              <ActivityIndicator size="large" color={colors.pink} />
              <Typography variant="bodyBold" style={{ marginTop: spacing.md }}>
                Extracting Foods
              </Typography>
              <Typography variant="caption" color={colors.black + '60'}>
                Analyzing menu image...
              </Typography>
            </View>
          </Animated.View>
        )}

        {/* Custom Modal for dialogs */}
        <CustomModal
          visible={modalState.visible}
          onClose={() => setModalState({ ...modalState, visible: false })}
          type={modalState.type}
          title={modalState.title}
          message={modalState.message}
          primaryButtonText="OK"
          onPrimaryPress={() => {
            setModalState({ ...modalState, visible: false });
            if (modalState.onConfirm) {
              modalState.onConfirm();
            }
          }}
          cancelable={true}
        />
      </View>
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
  comparisonContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  comparisonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  bestChoiceCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.green,
  },
  worstChoiceCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.pink,
  },
  comparisonCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonCardIconWarning: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.black + '40',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  processingCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  batchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue + '10',
    borderRadius: radii.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
});

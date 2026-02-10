import React, { useState, useMemo, useCallback } from 'react';
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
  Card,
  IconContainer,
  BoxButton,
  Button,
  NutritionCard,
  PersonalizedExplanationCard,
  PersonalHistoryCard,
  PortionAdviceCard
} from '../components';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { analyzeFoodWithAI } from '../services/fodmapService';
import { supabase } from '../config/supabase';
import { useGutStore } from '../store';
import { useGutActions } from '../presentation/hooks';
import { useUserCondition } from '../presentation/hooks/useUserCondition';
import { FODMAPTag } from '../types/fodmap';
import { getSafetyMessage, getRandomMessage, ANALYZING_MESSAGES } from '../utils/funnyMessages';

type ScanFoodScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const ScanFoodScreen: React.FC<ScanFoodScreenProps> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { condition } = useUserCondition(); // Get user's condition for personalization
  const [searchText, setSearchText] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [aiResults, setAiResults] = useState<Record<string, (FODMAPTag & {
    alternatives?: string[];
    normalizedName?: string;
    baseIngredients?: string[];
    nutrition?: any;
    personalizedExplanation?: string;
    personalHistory?: any;
    portionAdvice?: string;
    compoundRiskWarning?: string;
  }) | null>>({});
  const [loadingFoods, setLoadingFoods] = useState<string[]>([]);

  // Use new actions for logging
  const { logMeal } = useGutActions();
  // Still need store for trigger feedback lookup
  const { triggerFeedback } = useGutStore();

  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('snack');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Quick suggestions
  const SUGGESTIONS = ['Coffee', 'Pizza', 'Garlic', 'Onion', 'Apple', 'Milk', 'Bread', 'Pasta', 'Rice', 'Chicken'];

  /**
   * Handle menu/food image scanning - extract food items from photo
   */
  const handleImageScan = useCallback(async (imageUri: string, base64: string) => {
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

      // Add each extracted food to selected foods
      for (const food of extractedFoods) {
        await addFood(food);
      }

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

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: [ImagePicker.MediaType.IMAGE],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        await handleImageScan(asset.uri, asset.base64 || '');
      }
    } catch (error) {
      console.error('Camera pick error:', error);
      // Fallback to gallery
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: [ImagePicker.MediaType.IMAGE],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: true,
        });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          await handleImageScan(asset.uri, asset.base64 || '');
        }
      } catch (galleryError) {
        console.error('Gallery pick error:', galleryError);
      }
    }
  }, [handleImageScan]);

  // AI-based analysis solely derived from AI results (no local DB lookup)
  const aiAnalysis = useMemo(() => {
    if (selectedFoods.length === 0) return null;
    
    // Get results for all selected foods that have been analyzed
    const results = selectedFoods
      .map(food => aiResults[food])
      .filter((r): r is NonNullable<typeof r> => r !== null && r !== undefined);
      
    if (results.length === 0) return null;

    let totalLoad = 0;
    const categoryCounts: Record<string, number> = {};
    const highFODMAPs: any[] = [];
    const moderateFODMAPs: any[] = [];
    
    results.forEach(res => {
      if (res.level === 'high') {
        totalLoad += 3;
        highFODMAPs.push(res);
      } else if (res.level === 'moderate') {
        totalLoad += 1.5;
        moderateFODMAPs.push(res);
      }
      
      res.categories?.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + (res.level === 'high' ? 1 : 0.5);
      });
    });
    
    const stackedCategories = Object.entries(categoryCounts)
      .filter(([_, count]) => count >= 2)
      .map(([cat]) => cat);
      
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    if (highFODMAPs.length > 0 || totalLoad >= 9 || stackedCategories.length >= 2) {
      riskLevel = 'high';
    } else if (moderateFODMAPs.length > 0 || totalLoad >= 4.5) {
      riskLevel = 'moderate';
    }
    
    return { riskLevel, totalLoad, stackedCategories, highFODMAPs, moderateFODMAPs };
  }, [selectedFoods, aiResults]); 


  // Use trigger feedback from store to check for personal triggers
  // Enhanced to check both the full food name AND its base ingredients
  const activeTriggers = useMemo(() => {
    const foundTriggers: string[] = [];
    
    selectedFoods.forEach(food => {
      const normalizedInput = food.toLowerCase().trim();
      const aiResult = aiResults[food];
      
      // 1. Check if the food itself is a confirmed trigger
      const directFeedback = triggerFeedback.find(f => 
        f.foodName.toLowerCase().trim() === normalizedInput && f.userConfirmed === true
      );
      
      if (directFeedback) {
        foundTriggers.push(food);
        return;
      }
      
      // 2. Check if any base ingredients are known triggers
      if (aiResult?.baseIngredients) {
        const matchingIngredient = aiResult.baseIngredients.find(ing => 
          triggerFeedback.some(f => 
            f.foodName.toLowerCase().trim() === ing.toLowerCase().trim() && f.userConfirmed === true
          )
        );
        
        if (matchingIngredient) {
          // If the ingredient is the trigger, flag it
          foundTriggers.push(`${food} (contains ${matchingIngredient})`);
        }
      }
    });
    
    return [...new Set(foundTriggers)];
  }, [selectedFoods, triggerFeedback, aiResults]);

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
    setSearchText('');
    Keyboard.dismiss();

    // Always call AI for analysis and normalization
    setLoadingFoods(prev => [...prev, rawInput]);
    try {
      const aiResult = await analyzeFoodWithAI(rawInput);
      
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
        
        setAiResults(prev => {
          const newState = { ...prev };
          delete newState[rawInput];
          newState[canonicalName] = aiResult;
          return newState;
        });
      } else {
        // No normalization found, keep raw input
        setAiResults(prev => ({ ...prev, [rawInput]: aiResult }));
      }
    } catch (e) {
      console.error('AI lookup failed:', e);
      setAiResults(prev => ({ ...prev, [rawInput]: null }));
    } finally {
      setLoadingFoods(prev => prev.filter(f => f !== rawInput));
    }
  }, [selectedFoods, aiResults]);

  const removeFood = (foodToRemove: string) => {
    setSelectedFoods(prev => prev.filter(f => f !== foodToRemove));
    setAiResults(prev => {
      const newResults = { ...prev };
      delete newResults[foodToRemove];
      return newResults;
    });
  };

  const handleLogMeal = () => {
    if (selectedFoods.length === 0) return;

    // Use AI-normalized names for trigger detection
    // Note: We no longer split compound foods like "garlic bread" into "garlic" and "bread"
    // as it creates false correlations. The AI handled normalization in addFood.
    const normalizedFoods = selectedFoods.map(food => {
      const aiResult = aiResults[food];
      return aiResult?.normalizedName ? aiResult.normalizedName.toLowerCase().trim() : food.toLowerCase().trim();
    });

    // Dedupe normalized foods
    const uniqueNormalizedFoods = [...new Set(normalizedFoods)];

    // Use the logMeal action from our new architecture hooks
    logMeal({
      mealType,
      name: selectedFoods.join(', '), // Already normalized by AI in addFood
      foods: selectedFoods,
      normalizedFoods: uniqueNormalizedFoods,
      portionSize: 'medium',
    });

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Main');
    }
  };

  // derived state for "Safe to Eat?" result
  const safetyStatus = useMemo(() => {
    if (selectedFoods.length === 0) return 'neutral';
    
    // 1. Personal Triggers (Highest Priority - RED)
    if (activeTriggers.length > 0) return 'danger';
    
    // 2. High FODMAP from AI (RED)
    if (aiAnalysis?.riskLevel === 'high') return 'danger';
    
    // 3. Moderate FODMAP (YELLOW)
    if (aiAnalysis?.riskLevel === 'moderate') return 'warning';
    
    // 4. Still loading AI? Show neutral until we know
    if (loadingFoods.length > 0) return 'neutral';
    
    // 5. Check if any foods are unrecognized (AI returned null)
    const hasUnrecognizedFoods = selectedFoods.some(food => {
      const aiInfo = aiResults[food];
      // If AI analyzed it but returned null = unrecognized (gibberish/non-food)
      return aiInfo === null;
    });
    if (hasUnrecognizedFoods) return 'unknown';
    
    // 6. Safe (GREEN)
    return 'safe';
  }, [selectedFoods, activeTriggers, aiAnalysis, aiResults, loadingFoods]);

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

        {/* Result Card (The Learning Moment) */}
        {selectedFoods.length > 0 ? (
          <Animated.View entering={FadeInDown.springify()} style={styles.resultSection}>
             {/* Traffic Light Visual */}
             <View style={styles.trafficLightContainer}>
                <View style={[styles.light, safetyStatus === 'safe' && { backgroundColor: colors.green }]} />
                <View style={[styles.light, safetyStatus === 'warning' && { backgroundColor: '#FFA500' }]} />
                <View style={[styles.light, safetyStatus === 'danger' && { backgroundColor: colors.pink }]} />
             </View>

             <Card 
               variant="colored" 
               color={
                 safetyStatus === 'safe' ? colors.green : 
                 safetyStatus === 'warning' ? colors.yellow : 
                 safetyStatus === 'unknown' ? colors.mediumGray :
                 safetyStatus === 'neutral' ? colors.mediumGray :
                 colors.pink
               } 
               padding="xl"
               style={styles.resultCard}
             >
               <View style={styles.resultHeader}>
                 <IconContainer 
                    name={
                      safetyStatus === 'safe' ? 'checkmark-circle' :
                      safetyStatus === 'warning' ? 'alert-circle' :
                      safetyStatus === 'unknown' ? 'help-circle' :
                      safetyStatus === 'neutral' ? 'hourglass' :
                      'warning'
                    }
                    size={48}
                    color={colors.black}
                    variant="solid"
                    backgroundColor={colors.white}
                 />
                 <View style={{ flex: 1 }}>
                   <Typography variant="h2" color={colors.black}>
                      {getSafetyMessage(safetyStatus, activeTriggers)}
                   </Typography>
                 </View>
               </View>

               {/* Explanation */}
               <View style={styles.explanationBox}>
                  {loadingFoods.length > 0 ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                       <ActivityIndicator size="small" color={colors.blue} />
                       <Typography variant="body" color={colors.black}>
                          {getRandomMessage(ANALYZING_MESSAGES)}
                       </Typography>
                    </View>
                   ) : safetyStatus === 'unknown' ? (
                    <Typography variant="body" color={colors.black}>
                       Is this even food? 🤔 Try typing it again or check for typos!
                    </Typography>
                  ) : activeTriggers.length > 0 ? (
                    <Typography variant="body" color={colors.black}>
                      You told us <Typography variant="bodyBold">{activeTriggers.join(', ')}</Typography> hurts you. Your past self was trying to protect you! 😤
                    </Typography>
                  ) : aiAnalysis ? (
                    <Typography variant="body" color={colors.black}>
                       {aiAnalysis.riskLevel === 'high' ? "This meal is packed with FODMAPs. Your gut is already drafting a complaint letter 📝" :
                        aiAnalysis.riskLevel === 'moderate' ? "Some iffy ingredients detected. Could go either way – roll the dice? 🎲" :
                        "Your gut just gave this a thumbs up! Low FODMAP vibes only ✌️"}
                    </Typography>
                  ) : null}
               </View>

               {/* Alternatives (if Danger/Warning AND we have alternatives to show) */}
               {(safetyStatus === 'danger' || safetyStatus === 'warning') && (() => {
                  // Get alternatives exclusively from AI results
                  const aiAlternatives = Object.values(aiResults)
                     .filter(r => r?.alternatives)
                     .flatMap(r => r?.alternatives || []);

                  // Dedupe
                  const allAlternatives = [...new Set(aiAlternatives)].slice(0, 6);

                  if (allAlternatives.length === 0) return null;
                  return (
                    <View style={styles.alternativesBox}>
                       <Typography variant="bodySmall" color={colors.black + '80'} style={{ marginBottom: 4 }}>
                          Try these instead:
                       </Typography>
                       <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                          {allAlternatives.map((alt, idx) => (
                             <View key={`${alt}-${idx}`} style={styles.altChip}>
                                <Typography variant="bodyXS" color={colors.black}>{alt}</Typography>
                             </View>
                          ))}
                       </View>
                    </View>
                  );
               })()}
             </Card>

             {/* NEW: Enhanced Food Analysis Components */}
             {selectedFoods.length > 0 && (() => {
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

                    {/* Personalized Explanation */}
                    <PersonalizedExplanationCard
                      explanation={analysis.personalizedExplanation || ''}
                      condition={condition?.getDisplayName()}
                      compoundRiskWarning={analysis.compoundRiskWarning}
                    />

                    {/* Personal History */}
                    {analysis.personalHistory && (
                      <PersonalHistoryCard
                        everEaten={analysis.personalHistory.everEaten}
                        symptoms={analysis.personalHistory.symptoms || []}
                        occurrenceCount={analysis.personalHistory.occurrenceCount || 0}
                        latency={analysis.personalHistory.latency}
                      />
                    )}

                    {/* Portion Advice */}
                    <PortionAdviceCard advice={analysis.portionAdvice} />
                  </>
                );
             })()}

             {/* Log It Button */}
             <View style={styles.logActionContainer}>
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
                   title="Log This Meal"
                   onPress={handleLogMeal}
                   variant="primary"
                   color={colors.black}
                   size="lg"
                   icon="restaurant"
                />
             </View>
          </Animated.View>

        ) : (
          /* Empty State - Suggestions */
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.suggestions}>
             <Typography variant="bodyBold" color={colors.black + '60'} style={{ marginBottom: spacing.md }}>
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
  altChip: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  alternativesBox: {
    marginTop: spacing.xs,
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
  explanationBox: {
    backgroundColor: colors.white + '60',
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  input: {
    color: colors.black,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    height: '100%',
  },
  light: {
    backgroundColor: '#E0E0E0',
    borderColor: '#D0D0D0',
    borderRadius: 6,
    borderWidth: 1, 
    height: 12,
    width: 12,
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
  resultCard: {
    width: '100%',
  },
  resultHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
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
  trafficLightContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
});

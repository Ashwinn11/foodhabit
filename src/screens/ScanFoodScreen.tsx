import React, { useState, useMemo, useCallback } from 'react';
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
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radii, shadows, fontSizes, fonts } from '../theme/theme';
import {
  ScreenWrapper,
  Typography,
  Card,
  IconContainer,
  BoxButton,
  Button
} from '../components';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { checkFODMAPStacking, getLowFODMAPAlternatives, analyzeFoodWithAI } from '../services/fodmapService';
import { useGutStore } from '../store';
import { FODMAPTag } from '../types/fodmap';

type ScanFoodScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const ScanFoodScreen: React.FC<ScanFoodScreenProps> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [searchText, setSearchText] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [aiResults, setAiResults] = useState<Record<string, (FODMAPTag & { alternatives?: string[] }) | null>>({});
  const [loadingFoods, setLoadingFoods] = useState<string[]>([]);
  const { addMeal, triggerFeedback } = useGutStore();
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('snack');

  // Quick suggestions
  const SUGGESTIONS = ['Coffee', 'Pizza', 'Garlic', 'Onion', 'Apple', 'Milk', 'Bread', 'Pasta', 'Rice', 'Chicken'];

  // Real-time analysis of selected foods (includes AI results)
  const analysis = useMemo(() => {
    if (selectedFoods.length === 0) return null;
    return checkFODMAPStacking(selectedFoods);
  }, [selectedFoods, aiResults]); // Re-run when AI results update

  const activeTriggers = useMemo(() => {
    return selectedFoods.filter(food => {
      const normalizedInput = food.toLowerCase().trim();
      const feedback = triggerFeedback.find(f => f.foodName.toLowerCase().trim() === normalizedInput);
      return feedback?.userConfirmed === true;
    });
  }, [selectedFoods, triggerFeedback]);

  // Handle adding a food item - always use AI
  const addFood = useCallback(async (food: string) => {
    const normalizedFood = food.trim();
    if (!normalizedFood || selectedFoods.includes(normalizedFood)) {
      setSearchText('');
      Keyboard.dismiss();
      return;
    }

    setSelectedFoods(prev => [...prev, normalizedFood]);
    setSearchText('');
    Keyboard.dismiss();

    // Always call AI for analysis
    setLoadingFoods(prev => [...prev, normalizedFood]);
    try {
      const aiResult = await analyzeFoodWithAI(normalizedFood);
      setAiResults(prev => ({ ...prev, [normalizedFood]: aiResult }));
    } catch (e) {
      console.error('AI lookup failed:', e);
      setAiResults(prev => ({ ...prev, [normalizedFood]: null }));
    } finally {
      setLoadingFoods(prev => prev.filter(f => f !== normalizedFood));
    }
  }, [selectedFoods]);

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

    // Extract normalized foods from AI results for trigger detection
    const normalizedFoods: string[] = [];
    selectedFoods.forEach(food => {
      const aiResult = aiResults[food] as any;
      if (aiResult?.baseIngredients?.length > 0) {
        // Use AI-extracted base ingredients (handles "chicken biryani" → ["chicken", "biryani"])
        normalizedFoods.push(...aiResult.baseIngredients);
      } else if (aiResult?.normalizedName) {
        // Use corrected spelling (handles "biiryani" → "biryani")
        normalizedFoods.push(aiResult.normalizedName);
      } else {
        // Fallback to original input
        normalizedFoods.push(food.toLowerCase().trim());
      }
    });

    // Dedupe normalized foods
    const uniqueNormalizedFoods = [...new Set(normalizedFoods)];

    addMeal({
      timestamp: new Date(),
      mealType,
      name: selectedFoods.join(', '),
      foods: selectedFoods,
      normalizedFoods: uniqueNormalizedFoods,
      portionSize: 'medium',
    });

    navigation.goBack();
  };

  // derived state for "Safe to Eat?" result
  const safetyStatus = useMemo(() => {
    if (selectedFoods.length === 0) return 'neutral';
    
    // 1. Personal Triggers (Highest Priority - RED)
    if (activeTriggers.length > 0) return 'danger';
    
    // 2. Check AI results for high-FODMAP unknowns
    const aiHighFodmap = Object.entries(aiResults).some(([_, result]) => result?.level === 'high');
    const aiModerateFodmap = Object.entries(aiResults).some(([_, result]) => result?.level === 'moderate');
    
    // 3. High FODMAP from local DB or AI (RED)
    if ((analysis && analysis.riskLevel === 'high') || aiHighFodmap) return 'danger';
    
    // 4. Moderate FODMAP (YELLOW)
    if ((analysis && analysis.riskLevel === 'moderate') || aiModerateFodmap) return 'warning';
    
    // 5. Still loading AI? Show neutral until we know
    if (loadingFoods.length > 0) return 'neutral';
    
    // 6. Check if any foods are unrecognized (AI returned null)
    const hasUnrecognizedFoods = selectedFoods.some(food => {
      const aiInfo = aiResults[food];
      // If AI analyzed it but returned null = unrecognized (gibberish/non-food)
      return aiInfo === null;
    });
    if (hasUnrecognizedFoods) return 'unknown';
    
    // 7. Safe (GREEN)
    return 'safe';
  }, [selectedFoods, activeTriggers, analysis, aiResults, loadingFoods]);

  return (
    <ScreenWrapper edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BoxButton 
          icon="close" 
          onPress={() => navigation.goBack()} 
          size={44}
          style={{ backgroundColor: colors.white }}
        />
        <Typography variant="h3">Safe to Eat?</Typography>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        {/* Search Input */}
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
                      {safetyStatus === 'safe' ? 'Safe to Eat! ✅' :
                       safetyStatus === 'warning' ? 'Proceed with Caution ⚠️' :
                       safetyStatus === 'unknown' ? 'Not Recognized 🤷' :
                       safetyStatus === 'neutral' ? 'Analyzing...' :
                       'Risk Detected 🚨'}
                   </Typography>
                 </View>
               </View>

               {/* Explanation */}
               <View style={styles.explanationBox}>
                  {loadingFoods.length > 0 ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                       <ActivityIndicator size="small" color={colors.blue} />
                       <Typography variant="body" color={colors.black}>
                          Analyzing unknown foods...
                       </Typography>
                    </View>
                  ) : safetyStatus === 'unknown' ? (
                    <Typography variant="body" color={colors.black}>
                       We couldn't recognize some items. Please check spelling or try a different term.
                    </Typography>
                  ) : activeTriggers.length > 0 ? (
                    <Typography variant="body" color={colors.black}>
                      You previously marked <Typography variant="bodyBold">{activeTriggers.join(', ')}</Typography> as a trigger.
                    </Typography>
                  ) : Object.keys(aiResults).length > 0 && Object.values(aiResults).some(r => r?.level === 'high' || r?.level === 'moderate') ? (
                    <Typography variant="body" color={colors.black}>
                       AI Analysis: {Object.entries(aiResults).filter(([_, r]) => r?.level === 'high' || r?.level === 'moderate').map(([food, r]) => 
                          `${food} is ${r?.level} FODMAP`
                       ).join(', ')}.
                    </Typography>
                  ) : analysis ? (
                    <Typography variant="body" color={colors.black}>
                       {analysis.explanation}
                    </Typography>
                  ) : null}
               </View>

               {/* Alternatives (if Danger/Warning AND we have alternatives to show) */}
               {(safetyStatus === 'danger' || safetyStatus === 'warning') && (() => {
                  // Get alternatives from local DB
                  const localAlternatives = selectedFoods.flatMap(food => getLowFODMAPAlternatives(food).slice(0, 3));
                  // Get alternatives from AI results
                  const aiAlternatives = Object.values(aiResults)
                     .filter(r => r?.alternatives)
                     .flatMap(r => r?.alternatives || []);
                  // Combine and dedupe
                  const allAlternatives = [...new Set([...localAlternatives, ...aiAlternatives])].slice(0, 6);
                  
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    height: 56,
    ...shadows.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.black,
  },
  addButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg,
    marginLeft: spacing.sm,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestions: {
    marginTop: spacing.xl,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  resultSection: {
    marginTop: spacing.xl,
  },
  trafficLightContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  light: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0', 
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  resultCard: {
    width: '100%',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  explanationBox: {
    backgroundColor: colors.white + '60',
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },
  alternativesBox: {
    marginTop: spacing.xs,
  },
  altChip: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  logActionContainer: {
    marginTop: spacing.xl,
  },
  mealTypeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  mealTypeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mealTypeChipActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
});

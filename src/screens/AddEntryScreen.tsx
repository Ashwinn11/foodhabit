import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadows, fontSizes, fonts } from '../theme/theme';
import { useGutStore, BristolType, MealType } from '../store';
import {
  BristolPicker,
  SymptomToggle,
  ScreenWrapper,
  BoxButton,
  IconContainer,
  Typography,
  Card,
  Button,
  SectionHeader,
} from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { analyzeFODMAPs, checkFODMAPStacking } from '../services/fodmapService';

type AddEntryScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type EntryMode = 'poop' | 'meal';

const MEAL_TYPES: { type: MealType; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { type: 'breakfast', label: 'Breakfast', icon: 'sunny', color: colors.blue },
  { type: 'lunch', label: 'Lunch', icon: 'leaf', color: colors.yellow },
  { type: 'dinner', label: 'Dinner', icon: 'moon', color: colors.green },
  { type: 'snack', label: 'Snack', icon: 'pizza', color: colors.pink },
];

export const AddEntryScreen: React.FC<AddEntryScreenProps> = ({ navigation }) => {
  const { addGutMoment, addMeal, triggerFeedback } = useGutStore();
  
  // Mode toggle
  const [mode, setMode] = useState<EntryMode>('poop');
  
  // Poop state
  const [bristolType, setBristolType] = useState<BristolType | undefined>(undefined);
  const [symptoms, setSymptoms] = useState({
    bloating: false,
    gas: false,
    cramping: false,
    nausea: false,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // New poop fields
  const [urgency, setUrgency] = useState<'none' | 'mild' | 'severe'>('none');
  const [painScore, setPainScore] = useState(0);
  const [incompleteEvacuation, setIncompleteEvacuation] = useState(false);
  
  // Meal state
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [mealName, setMealName] = useState('');
  const [foods, setFoods] = useState<string[]>([]);
  const [foodInput, setFoodInput] = useState('');
  // New meal field
  const [portionSize, setPortionSize] = useState<'small' | 'medium' | 'large'>('medium');
  
  // FODMAP analysis for current meal
  const fodmapAnalysis = useMemo(() => {
    if (foods.length === 0) return null;
    return analyzeFODMAPs(foods);
  }, [foods]);
  
  const fodmapStacking = useMemo(() => {
    if (foods.length === 0) return null;
    return checkFODMAPStacking(foods);
  }, [foods]);
  
  // Active Shield: Check for known confirmed triggers
  const activeTriggers = useMemo(() => {
    const allInputFoods = [...foods];
    if (foodInput.trim()) {
        allInputFoods.push(foodInput.trim());
    }

    if (allInputFoods.length === 0) return [];
    
    return allInputFoods.filter(food => {
        const normalizedInput = food.toLowerCase().trim();
        const feedback = triggerFeedback.find(f => f.foodName.toLowerCase().trim() === normalizedInput);
        return feedback?.userConfirmed === true;
    });
  }, [foods, foodInput, triggerFeedback]);

  // Debugging Active Shield
  React.useEffect(() => {
    // console.log('--- Active Shield Debug ---');
    // console.log('Current Foods List:', foods);
    // console.log('Current TextInput:', foodInput);
    // console.log('Confirmed Triggers in Store:', triggerFeedback.map(f => f.foodName));
    // console.log('Detected Active Triggers:', activeTriggers);
  }, [foods, foodInput, triggerFeedback, activeTriggers]);
  
  
  const handleSubmit = () => {
    if (mode === 'poop') {
      // Poop mode
      addGutMoment({
        timestamp: new Date(),
        bristolType,
        symptoms,
        tags: selectedTags as any,
        urgency,
        painScore: painScore > 0 ? painScore : undefined,
        incompleteEvacuation: incompleteEvacuation || undefined,
      });
    } else {
      // Meal mode - require at least one food item
      if (foods.length === 0) {
        Alert.alert('Missing Food Items', 'Please add at least one food item to track triggers properly');
        return;
      }
      
      addMeal({
        timestamp: new Date(),
        mealType,
        name: mealName || `${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`,
        foods: foods,
        portionSize,
      });
    }
    
    navigation.goBack();
  };
  
  const toggleSymptom = (symptom: keyof typeof symptoms) => {
    setSymptoms(prev => ({ ...prev, [symptom]: !prev[symptom] }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  
  const addFood = () => {
    if (foodInput.trim()) {
      setFoods(prev => [...prev, foodInput.trim()]);
      setFoodInput('');
    }
  };
  
  const removeFood = (index: number) => {
    setFoods(prev => prev.filter((_, i) => i !== index));
  };
  
  const isValid = mode === 'poop' ? bristolType !== undefined : true;
  
  return (
    <ScreenWrapper style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View 
        entering={FadeIn.delay(100)}
        style={styles.header}
      >
        <BoxButton 
          icon="arrow-back" 
          onPress={() => navigation.goBack()}
          size={44}
        />
        
        <View style={styles.titleContainer}>
          <Typography variant="bodyBold" color={colors.black + '99'}>New</Typography>
          <Typography variant="h3" color={colors.pink}>
            {mode === 'poop' ? 'Gut Moment' : 'Meal Log'}
          </Typography>
        </View>
        
        <BoxButton 
          icon="sparkles" 
          onPress={() => {}}
          size={44}
          color={colors.blue}
          style={{ backgroundColor: colors.white }} 
        />
      </Animated.View>
      
      {/* Mode Toggle */}
      <Animated.View 
        entering={FadeInDown.delay(150).springify()}
        style={styles.modeToggleContainer}
      >
        <View style={styles.modeToggle}>
          <Pressable
            style={[styles.modeButton, mode === 'poop' && styles.modeButtonActive]}
            onPress={() => setMode('poop')}
          >
            <IconContainer 
              name="happy" 
              size={32} 
              iconSize={20}
              color={colors.pink} 
              variant={mode === 'poop' ? 'solid' : 'transparent'}
              shadow={false}
            />
            <Typography variant="bodyBold" color={mode === 'poop' ? colors.white : colors.black}>
              Poop
            </Typography>
          </Pressable>
          <Pressable
            style={[styles.modeButton, mode === 'meal' && styles.modeButtonActive, mode === 'meal' && { backgroundColor: colors.blue }]}
            onPress={() => setMode('meal')}
          >
            <IconContainer 
              name="restaurant" 
              size={32} 
              iconSize={20}
              color={colors.blue} 
              variant={mode === 'meal' ? 'solid' : 'transparent'}
              shadow={false}
            />
            <Typography variant="bodyBold" color={mode === 'meal' ? colors.white : colors.black}>
              Meal
            </Typography>
          </Pressable>
        </View>
      </Animated.View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {mode === 'poop' ? (
          <>
            {/* Poop Type */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <BristolPicker selected={bristolType} onSelect={setBristolType} />
            </Animated.View>
            
            {/* Symptoms - Expanded Medical Section */}
            <Animated.View 
              entering={FadeInDown.delay(300).springify()}
              style={styles.symptomsSection}
            >
              <SectionHeader title="How did it feel?" icon="medical" iconColor={colors.pink} />
              <View style={styles.symptomsGrid}>
                <SymptomToggle
                  label="Bloating"
                  iconName="balloon-outline"
                  active={symptoms.bloating}
                  onToggle={() => toggleSymptom('bloating')}
                  color={colors.pink}
                />
                <SymptomToggle
                  label="Gas"
                  iconName="cloud-outline"
                  active={symptoms.gas}
                  onToggle={() => toggleSymptom('gas')}
                  color={colors.blue}
                />
                <SymptomToggle
                  label="Cramping"
                  iconName="flash-outline"
                  active={symptoms.cramping}
                  onToggle={() => toggleSymptom('cramping')}
                  color={colors.pink}
                />
                <SymptomToggle
                  label="Nausea"
                  iconName="medkit-outline"
                  active={symptoms.nausea}
                  onToggle={() => toggleSymptom('nausea')}
                  color={colors.yellow}
                />
              </View>

              {/* Medical Tags */}
              <Typography variant="bodyXS" color={colors.black + '66'} style={{ marginTop: spacing.md, marginBottom: spacing.xs }}>
                Additional indicators:
              </Typography>
              <View style={styles.foodTags}>
                {['strain', 'urgency', 'blood', 'mucus'].map((tag) => {
                   const isActive = selectedTags.includes(tag);
                   return (
                     <Pressable
                       key={tag}
                       style={[
                         styles.foodTag, 
                         { 
                           backgroundColor: isActive ? colors.pink : colors.pink + '05', 
                           borderColor: colors.pink + '20', 
                           borderWidth: 1 
                         }
                       ]}
                       onPress={() => toggleTag(tag)}
                     >
                       <Typography variant="bodyXS" color={isActive ? colors.white : colors.pink}>{tag}</Typography>
                     </Pressable>
                   );
                })}
               </View>
            </Animated.View>
            
            {/* Urgency Level */}
            <Animated.View 
              entering={FadeInDown.delay(400).springify()}
              style={styles.notesSection}
            >
              <Typography variant="bodyBold" style={styles.inputTitle}>Urgency level?</Typography>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {(['none', 'mild', 'severe'] as const).map((level) => (
                  <Pressable
                    key={level}
                    style={[
                      styles.urgencyButton,
                      urgency === level && styles.urgencyButtonActive,
                      urgency === level && level === 'severe' && { backgroundColor: colors.pink },
                      urgency === level && level === 'mild' && { backgroundColor: '#FFA500' },
                      urgency === level && level === 'none' && { backgroundColor: colors.blue },
                    ]}
                    onPress={() => setUrgency(level)}
                  >
                    <Typography 
                      variant="bodySmall" 
                      color={urgency === level ? colors.white : colors.black}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Typography>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
            
            {/* Pain Score */}
            <Animated.View 
              entering={FadeInDown.delay(500).springify()}
              style={styles.notesSection}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                <Typography variant="bodyBold" style={styles.inputTitle}>Pain level?</Typography>
                <Typography variant="h3" color={painScore > 7 ? colors.pink : painScore > 4 ? '#FFA500' : colors.blue}>
                  {painScore}/10
                </Typography>
              </View>
              <View style={styles.painSliderContainer}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <Pressable
                    key={score}
                    style={[
                      styles.painDot,
                      painScore >= score && styles.painDotActive,
                      painScore >= score && score > 7 && { backgroundColor: colors.pink },
                      painScore >= score && score > 4 && score <= 7 && { backgroundColor: '#FFA500' },
                      painScore >= score && score <= 4 && { backgroundColor: colors.blue },
                    ]}
                    onPress={() => setPainScore(score)}
                  />
                ))}
              </View>
            </Animated.View>
            
            {/* Incomplete Evacuation */}
            <Animated.View 
              entering={FadeInDown.delay(550).springify()}
              style={styles.notesSection}
            >
              <Pressable
                style={[
                  styles.checkboxRow,
                  incompleteEvacuation && styles.checkboxRowActive
                ]}
                onPress={() => setIncompleteEvacuation(!incompleteEvacuation)}
              >
                <View style={[
                  styles.checkbox,
                  incompleteEvacuation && styles.checkboxActive
                ]}>
                  {incompleteEvacuation && (
                    <IconContainer
                      name="checkmark"
                      size={20}
                      iconSize={14}
                      color={colors.white}
                      variant="transparent"
                      shadow={false}
                    />
                  )}
                </View>
                <Typography variant="bodySmall" color={colors.black}>
                  Felt incomplete evacuation
                </Typography>
              </Pressable>
            </Animated.View>
          </>
        ) : (
          <> 
            {/* Meal Type Selector */}
            <Animated.View 
              entering={FadeInDown.delay(300).springify()}
              style={styles.mealTypeSection}
            >
              <SectionHeader title="What meal?" />
              <View style={styles.mealTypeGrid}>
                {MEAL_TYPES.map((meal) => (
                  <Pressable
                    key={meal.type}
                    onPress={() => setMealType(meal.type)}
                    style={{ width: '48%' }}
                  >
                    <Card 
                      variant={mealType === meal.type ? 'colored' : 'white'} 
                      color={meal.color}
                      style={styles.mealTypeCard}
                      padding="md"
                    >
                      <IconContainer
                        name={meal.icon as any}
                        size={48}
                        color={meal.color}
                        variant="solid"
                        shape="circle"
                        style={{ marginBottom: spacing.sm }}
                      />
                      <Typography variant="bodyBold" color={colors.black}>
                        {meal.label}
                      </Typography>
                    </Card>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          
            
            {/* Foods */}
            <Animated.View 
              entering={FadeInDown.delay(400).springify()}
              style={styles.foodsSection}
            >
              <SectionHeader title="What did you eat?" />
              
              {/* Food input */}
              <View style={styles.foodInputRow}>
                <TextInput
                  style={styles.foodInput}
                  placeholder="Add food item..."
                  placeholderTextColor={colors.black + '40'}
                  value={foodInput}
                  onChangeText={setFoodInput}
                  onSubmitEditing={addFood}
                  returnKeyType="done"
                />
                <Pressable style={styles.addFoodButton} onPress={addFood}>
                  <IconContainer
                    name="add"
                    size={40}
                    iconSize={24}
                    color={colors.blue}
                    variant="solid"
                    shadow={false}
                  />
                </Pressable>
              </View>
              
              {/* Food tags */}
              <View style={styles.foodTags}>
                {foods.map((food, index) => (
                  <Pressable
                    key={index}
                    style={styles.foodTag}
                    onPress={() => removeFood(index)}
                  >
                    <Typography variant="bodySmall" color={colors.pink}>{food}</Typography>
                    <IconContainer
                      name="close"
                      size={20}
                      iconSize={16}
                      color={colors.pink}
                      variant="transparent"
                      shadow={false}
                    />
                  </Pressable>
                ))}
              </View>

              {/* Active Shield Warning */}
              {activeTriggers.length > 0 && (
                <Animated.View entering={FadeInDown.springify()}>
                  <Card 
                    variant="colored" 
                    color={colors.pink} 
                    padding="md"
                    style={{ marginBottom: spacing.md }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
                      <IconContainer
                        name="alert-circle"
                        size={24}
                        iconSize={18}
                        color={colors.pink}
                        backgroundColor="transparent"
                        borderWidth={0}
                        shadow={false}
                      />
                      <View style={{ flex: 1 }}>
                        <Typography variant="bodyBold" color={colors.black} style={{ marginBottom: 4 }}>
                          Known Trigger Detected!
                        </Typography>
                        <Typography variant="bodyXS" color={colors.black + '99'}>
                          You previously confirmed {activeTriggers.length === 1 ? 'this' : 'these'} as a trigger:
                        </Typography>
                        <Typography variant="bodyBold" color={colors.black} style={{ marginTop: 2 }}>
                          {activeTriggers.join(', ')}
                        </Typography>
                        <Typography variant="bodyXS" color={colors.black + '66'} style={{ marginTop: 4 }}>
                          Proceed with caution.
                        </Typography>
                      </View>
                    </View>
                  </Card>
                </Animated.View>
              )}
              
              {/* FODMAP Warning */}
              {fodmapStacking && fodmapStacking.riskLevel !== 'low' && (
                <Animated.View entering={FadeInDown.springify()}>
                  <Card 
                    variant="colored" 
                    color={fodmapStacking.riskLevel === 'high' ? colors.pink : colors.yellow}
                    padding="md"
                    style={{ marginBottom: spacing.md }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
                      <IconContainer
                        name={fodmapStacking.riskLevel === 'high' ? 'warning' : 'information-circle'}
                        size={24}
                        iconSize={18}
                        color={fodmapStacking.riskLevel === 'high' ? colors.pink : colors.yellow}
                        backgroundColor="transparent"
                        borderWidth={0}
                        shadow={false}
                      />
                      <View style={{ flex: 1 }}>
                        <Typography variant="bodyBold" color={colors.black} style={{ marginBottom: 4 }}>
                          {fodmapStacking.riskLevel === 'high' ? 'High FODMAP Load' : 'Moderate FODMAP Load'}
                        </Typography>
                        <Typography variant="bodyXS" color={colors.black + '99'}>
                          {fodmapStacking.explanation}
                        </Typography>
                        {fodmapAnalysis && fodmapAnalysis.highFODMAPs.length > 0 && (
                          <Typography variant="bodyXS" color={colors.black + '66'} style={{ marginTop: 4 }}>
                            High-FODMAP: {fodmapAnalysis.highFODMAPs.map(f => f.food).join(', ')}
                          </Typography>
                        )}
                      </View>
                    </View>
                  </Card>
                </Animated.View>
              )}
              
              {/* Quick food suggestions */}
              <Typography variant="bodyXS" color={colors.black + '66'} style={{ marginBottom: spacing.sm }}>
                Quick add:
              </Typography>
              <View style={styles.quickFoods}>
                {['Coffee', 'Bread', 'Eggs', 'Salad', 'Rice', 'Pasta', 'Fruit', 'Dairy', 'Pizza', 'Broccoli', 'Oats', 'Milk'].map((food) => (
                  <Pressable
                    key={food}
                    style={styles.quickFoodButton}
                    onPress={() => setFoods(prev => Array.from(new Set([...prev, food])))}
                  >
                    <Typography variant="bodySmall">{food}</Typography>
                  </Pressable>
                ))}
              </View>

              {/* Portion Size */}
              <Animated.View 
                entering={FadeInDown.delay(450).springify()}
                style={styles.notesSection}
              >
                <Typography variant="bodyBold" style={styles.inputTitle}>Portion size?</Typography>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <Pressable
                      key={size}
                      style={[
                        styles.urgencyButton,
                        portionSize === size && styles.urgencyButtonActive,
                        portionSize === size && { backgroundColor: colors.blue },
                      ]}
                      onPress={() => setPortionSize(size)}
                    >
                      <Typography 
                        variant="bodySmall" 
                        color={portionSize === size ? colors.white : colors.black}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </Typography>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>

              {/* Meal Name */}
            <Animated.View 
              entering={FadeInDown.delay(300).springify()}
              style={styles.notesSection}
            >
              <Typography variant="bodyBold" style={styles.inputTitle}>Meal name (optional)</Typography>
              <Card variant="white" style={styles.inputCard} padding="md">
                <TextInput
                  style={styles.notesInput}
                  placeholder="e.g., Morning Oatmeal"
                  placeholderTextColor={colors.black + '40'}
                  value={mealName}
                  onChangeText={setMealName}
                />
                    <BoxButton 
          icon="restaurant" 
          onPress={() => {}}
          size={44}
          color={colors.blue}
          style={{ backgroundColor: colors.white }} 
        />
              </Card>
            </Animated.View>
            </Animated.View>
          </>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Submit Button */}
      <Animated.View 
        entering={FadeInDown.delay(700).springify()}
        style={styles.submitContainer}
      >
        <Button
          title={mode === 'poop' ? 'Add My Moment' : 'Log Meal'}
          onPress={handleSubmit}
          variant="primary"
          color={colors.black}
          icon={mode === 'poop' ? 'happy' : 'restaurant'}
          disabled={!isValid}
          size="lg"
          style={{ width: '100%' }}
        />
      </Animated.View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  titleContainer: {
    alignItems: 'center',
  },
  modeToggleContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing.xs,
    ...shadows.sm,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    gap: spacing.xs,
  },
  modeButtonActive: {
    backgroundColor: colors.pink,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  symptomsSection: {
    marginVertical: spacing.lg,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  notesSection: {
    marginVertical: spacing.lg,
  },
  inputTitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.bodyBold,
    color: colors.black,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesInput: {
    flex: 1,
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.black,
    minHeight: 40,
  },
  mealTypeSection: {
    marginVertical: spacing.lg,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mealTypeCard: {
    alignItems: 'center',
  },
  foodsSection: {
    marginVertical: spacing.lg,
  },
  foodInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  foodInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.md,
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    borderWidth: 2,
    borderColor: colors.border,
  },
  addFoodButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  foodTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  foodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pink + '15',
    borderRadius: radii.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  quickFoods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  quickFoodButton: {
    backgroundColor: colors.white,
    borderRadius: radii.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bottomPadding: {
    height: 120,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    backgroundColor: 'transparent',
  },
  urgencyButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  urgencyButtonActive: {
    borderColor: 'transparent',
  },
  painSliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  painDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.border,
  },
  painDotActive: {
    borderColor: colors.white,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  checkboxRowActive: {
    borderColor: colors.blue,
    backgroundColor: colors.blue + '10',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
});

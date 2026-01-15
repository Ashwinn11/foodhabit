import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadows, fontSizes, fonts } from '../theme';
import { useGutStore, MoodType, BristolType, MealType } from '../store';
import {
  PhotoPlaceholder,
  MoodPicker,
  BristolPicker,
  SymptomToggle,
  ScreenWrapper,
  BoxButton,
  IconContainer,
} from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AddEntryScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type EntryMode = 'poop' | 'meal';

const MEAL_TYPES: { type: MealType; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { type: 'breakfast', label: 'Breakfast', icon: 'sunny', color: colors.blue },
  { type: 'lunch', label: 'Lunch', icon: 'leaf', color: colors.yellow },
  { type: 'dinner', label: 'Dinner', icon: 'moon', color: colors.pink },
  { type: 'snack', label: 'Snack', icon: 'pizza', color: colors.pink },
];

export const AddEntryScreen: React.FC<AddEntryScreenProps> = ({ navigation }) => {
  const { addGutMoment, addMeal, capturedPhotoUri, setCapturedPhotoUri } = useGutStore();
  
  // Mode toggle
  const [mode, setMode] = useState<EntryMode>('poop');
  
  // Poop state
  const [mood, setMood] = useState<MoodType | undefined>(undefined);
  const [bristolType, setBristolType] = useState<BristolType | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [symptoms, setSymptoms] = useState({
    bloating: false,
    gas: false,
    cramping: false,
    nausea: false,
  });
  
  // Meal state
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [mealName, setMealName] = useState('');
  const [foods, setFoods] = useState<string[]>([]);
  const [foodInput, setFoodInput] = useState('');
  
  // Photo state (synced from store when returning from camera)
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  
  // Sync photo from store when it changes (returning from Camera)
  useEffect(() => {
    if (capturedPhotoUri) {
      setPhotoUri(capturedPhotoUri);
      setCapturedPhotoUri(null); // Clear from store
    }
  }, [capturedPhotoUri, setCapturedPhotoUri]);
  
  const buttonScale = useSharedValue(1);
  
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));
  
  const handleSubmit = () => {
    if (mode === 'poop') {
      if (!mood) return;
      
      addGutMoment({
        timestamp: new Date(),
        mood,
        bristolType,
        notes: notes || undefined,
        symptoms,
        // No photo for poop - Bristol scale is the standard
      });
    } else {
      // Meal mode
      addMeal({
        timestamp: new Date(),
        mealType,
        name: mealName || `${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`,
        foods: foods.length > 0 ? foods : ['General meal'],
        mood: mood,
        photoUri, // Photo makes sense for meals
      });
    }
    
    navigation.goBack();
  };
  
  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };
  
  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };
  
  const toggleSymptom = (symptom: keyof typeof symptoms) => {
    setSymptoms(prev => ({ ...prev, [symptom]: !prev[symptom] }));
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
  
  const isValid = mode === 'poop' ? mood !== undefined : true;
  
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
          <Text style={styles.titleNew}>New</Text>
          <Text style={styles.titleMoment}>
            {mode === 'poop' ? 'Gut Moment' : 'Meal Log'}
          </Text>
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
              color={mode === 'poop' ? colors.white : colors.pink} 
              backgroundColor="transparent"
              borderWidth={0}
              shadow={false}
            />
            <Text style={[styles.modeButtonText, mode === 'poop' && styles.modeButtonTextActive]}>
              Poop
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeButton, mode === 'meal' && styles.modeButtonActive, mode === 'meal' && { backgroundColor: colors.blue }]}
            onPress={() => setMode('meal')}
          >
            <IconContainer 
              name="restaurant" 
              size={32} 
              iconSize={20}
              color={mode === 'meal' ? colors.white : colors.blue} 
              backgroundColor="transparent"
              borderWidth={0}
              shadow={false}
            />
            <Text style={[styles.modeButtonText, mode === 'meal' && styles.modeButtonTextActive]}>
              Meal
            </Text>
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
            {/* Mood Picker */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <MoodPicker selected={mood} onSelect={setMood} />
            </Animated.View>
            
            {/* Bristol Type Picker - THE medical standard for stool tracking */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <BristolPicker selected={bristolType} onSelect={setBristolType} />
            </Animated.View>
            
            {/* Symptoms */}
            <Animated.View 
              entering={FadeInDown.delay(500).springify()}
              style={styles.symptomsSection}
            >
              <Text style={styles.sectionTitle}>Any symptoms?</Text>
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
            </Animated.View>
            
            {/* Notes */}
            <Animated.View 
              entering={FadeInDown.delay(600).springify()}
              style={styles.notesSection}
            >
              <Text style={styles.inputTitle}>Any notes?</Text>
              <View style={styles.inputCard}>
                <TextInput
                  style={styles.notesInput}
                  placeholder="How are you feeling?"
                  placeholderTextColor={colors.black + '40'}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />
                <IconContainer
                  name="pencil"
                  size={36}
                  iconSize={18}
                  color={colors.pink}
                  backgroundColor={colors.pink + '15'}
                  borderWidth={0}
                  shadow={false}
                />
              </View>
            </Animated.View>
          </>
        ) : (
          <>
            {/* Photo Placeholder for Meal */}
            <Animated.View 
              entering={FadeInDown.delay(200).springify()}
              style={styles.photoSection}
            >
              <PhotoPlaceholder
                size={140}
                photoUri={photoUri}
                onPress={() => {
                  navigation.navigate('Camera');
                }}
              />
            </Animated.View>
            
            {/* Meal Type Selector */}
            <Animated.View 
              entering={FadeInDown.delay(300).springify()}
              style={styles.mealTypeSection}
            >
              <Text style={styles.sectionTitle}>What meal?</Text>
              <View style={styles.mealTypeGrid}>
                {MEAL_TYPES.map((meal) => (
                  <Pressable
                    key={meal.type}
                    style={[
                      styles.mealTypeButton,
                      mealType === meal.type && { backgroundColor: meal.color + '20', borderColor: meal.color },
                    ]}
                    onPress={() => setMealType(meal.type)}
                  >
                    <IconContainer
                      name={meal.icon as any}
                      size={48}
                      color={meal.color}
                      borderColor={meal.color}
                      shape="circle"
                      style={{ marginBottom: spacing.sm }}
                    />
                    <Text style={[
                      styles.mealTypeLabel,
                      mealType === meal.type && { color: meal.color },
                    ]}>
                      {meal.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
            
            {/* Meal Name */}
            <Animated.View 
              entering={FadeInDown.delay(300).springify()}
              style={styles.notesSection}
            >
              <Text style={styles.inputTitle}>Meal name (optional)</Text>
              <View style={styles.inputCard}>
                <TextInput
                  style={styles.notesInput}
                  placeholder="e.g., Morning Oatmeal"
                  placeholderTextColor={colors.black + '40'}
                  value={mealName}
                  onChangeText={setMealName}
                />
                <IconContainer
                  name="restaurant"
                  size={36}
                  iconSize={18}
                  color={colors.blue}
                  backgroundColor={colors.blue + '15'}
                  borderWidth={0}
                  shadow={false}
                />
              </View>
            </Animated.View>
            
            {/* Foods */}
            <Animated.View 
              entering={FadeInDown.delay(400).springify()}
              style={styles.foodsSection}
            >
              <Text style={styles.sectionTitle}>What did you eat?</Text>
              
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
                    color={colors.white}
                    backgroundColor="transparent"
                    borderWidth={0}
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
                    <Text style={styles.foodTagText}>{food}</Text>
                    <IconContainer
                      name="close"
                      size={20}
                      iconSize={16}
                      color={colors.pink}
                      backgroundColor="transparent"
                      borderWidth={0}
                      shadow={false}
                    />
                  </Pressable>
                ))}
              </View>
              
              {/* Quick food suggestions */}
              <Text style={styles.quickFoodsLabel}>Quick add:</Text>
              <View style={styles.quickFoods}>
                {['Coffee', 'Bread', 'Eggs', 'Salad', 'Rice', 'Pasta', 'Fruit', 'Dairy'].map((food) => (
                  <Pressable
                    key={food}
                    style={styles.quickFoodButton}
                    onPress={() => setFoods(prev => [...prev, food])}
                  >
                    <Text style={styles.quickFoodText}>{food}</Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          </>
        )}
        
        {/* Bottom padding for button */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Submit Button */}
      <Animated.View 
        entering={FadeInDown.delay(700).springify()}
        style={styles.submitContainer}
      >
        <Pressable
          onPress={handleSubmit}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!isValid}
        >
          <Animated.View
            style={[
              styles.submitButton,
              !isValid && styles.submitButtonDisabled,
              buttonAnimatedStyle,
            ]}
          >
            <Text style={styles.submitButtonText}>
              {mode === 'poop' ? 'Add My Moment' : 'Log Meal'}
            </Text>
            <IconContainer
              name={mode === 'poop' ? 'happy' : 'restaurant'}
              size={32}
              iconSize={20}
              color={colors.white}
              backgroundColor="transparent"
              borderWidth={0}
              shadow={false}
              style={{ marginLeft: 8 }}
            />
          </Animated.View>
        </Pressable>
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
  titleNew: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.bodyBold,
    color: colors.black + '99',
  },
  titleMoment: {
    fontSize: fontSizes['2xl'],
    fontFamily: fonts.heading,
    color: colors.pink,
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
  modeButtonText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.bodyBold,
    color: colors.black,
  },
  modeButtonTextActive: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  symptomsSection: {
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading,
    color: colors.black,
    marginBottom: spacing.md,
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
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  inputIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: colors.pink,
  },
  notesInput: {
    flex: 1,
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.black,
    minHeight: 40,
  },
  // Meal specific styles
  mealTypeSection: {
    marginVertical: spacing.lg,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mealTypeButton: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  mealTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mealTypeLabel: {
    fontSize: fontSizes.md,
    fontFamily: fonts.bodyBold,
    color: colors.black,
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
  foodTagText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.bodyBold,
    color: colors.pink,
  },
  quickFoodsLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.black + '66',
    marginBottom: spacing.sm,
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
  quickFoodText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.black,
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
  submitButton: {
    backgroundColor: colors.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radii['2xl'],
    ...shadows.md,
  },
  submitButtonDisabled: {
    backgroundColor: colors.black + '40',
  },
  submitButtonText: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.bodyBold,
    color: colors.white,
  },
});

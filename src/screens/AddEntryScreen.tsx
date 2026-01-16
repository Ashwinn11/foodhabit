import React, { useState, useEffect } from 'react';
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
  PhotoPlaceholder,
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
  const [bristolType, setBristolType] = useState<BristolType | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [symptoms, setSymptoms] = useState({
    bloating: false,
    gas: false,
    cramping: false,
    nausea: false,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
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
  
  const handleSubmit = () => {
    if (mode === 'poop') {
      // Poop mode
      addGutMoment({
        timestamp: new Date(),
        bristolType,
        notes: notes || undefined,
        symptoms,
        tags: selectedTags as any,
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
        photoUri,
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
              color={mode === 'poop' ? colors.white : colors.pink} 
              backgroundColor="transparent"
              borderWidth={0}
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
              color={mode === 'meal' ? colors.white : colors.blue} 
              backgroundColor="transparent"
              borderWidth={0}
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
            {/* Bristol Type Picker */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <BristolPicker selected={bristolType} onSelect={setBristolType} />
            </Animated.View>
            
            {/* Symptoms - Expanded Medical Section */}
            <Animated.View 
              entering={FadeInDown.delay(300).springify()}
              style={styles.symptomsSection}
            >
              <SectionHeader title="Symptoms & Details" icon="medical" iconColor={colors.pink} />
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
            
            {/* Notes */}
            <Animated.View 
              entering={FadeInDown.delay(600).springify()}
              style={styles.notesSection}
            >
              <Typography variant="bodyBold" style={styles.inputTitle}>Any notes?</Typography>
              <Card variant="white" style={styles.inputCard} padding="md">
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add notes (optional)"
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
              </Card>
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
                        color={meal.color === colors.yellow ? colors.black : meal.color}
                        backgroundColor={meal.color === colors.yellow ? colors.yellow : colors.white}
                        borderColor={meal.color}
                        shape="circle"
                        style={{ marginBottom: spacing.sm }}
                      />
                      <Typography variant="bodyBold" color={mealType === meal.type ? (meal.color === colors.yellow ? colors.black : meal.color) : colors.black}>
                        {meal.label}
                      </Typography>
                    </Card>
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
                <IconContainer
                  name="restaurant"
                  size={36}
                  iconSize={18}
                  color={colors.blue}
                  backgroundColor={colors.blue + '15'}
                  borderWidth={0}
                  shadow={false}
                />
              </Card>
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
                    <Typography variant="bodySmall" color={colors.pink}>{food}</Typography>
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
  photoSection: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
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
});

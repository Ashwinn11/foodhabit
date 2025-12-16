import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,

} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { entryService } from '../services/gutHarmony/entryService';
import { streakService } from '../services/gutHarmony/streakService';
import { moodService } from '../services/gutHarmony/moodService';
import { scoringService } from '../services/gutHarmony/scoringService';
import { challengeService } from '../services/gutHarmony/challengeService';
import { theme } from '../theme';
import Text from '../components/Text';
import MoodWheel from '../components/MoodWheel';
import FoodInput from '../components/FoodInput';
import LifestyleTracker from '../components/LifestyleTracker';
import { Ionicons } from '@expo/vector-icons';
import { STOOL_TYPES, SYMPTOMS, getEnergyIcon } from '../constants/stoolData';

interface QuickLogData {
  mood: string | null;
  stoolType: number | null;
  energyLevel: number;
  selectedSymptoms: string[];
  logTime: Date;
  meals: string[];
  mealInput: string;
  foodsWithPortions?: Array<{ name: string; portion?: number; unit?: string }>;
  // Lifestyle tracking
  stressLevel: number;
  sleepQuality: number;
  sleepHours: number;
  waterIntake: number;
  exerciseMinutes: number;
  exerciseType: string;
  medications: string[];
}

/**
 * Get frequently logged foods for quick suggestions
 */
const getRecentlyLoggedFoods = async (userId: string): Promise<string[]> => {
  try {
    const meals = await entryService.getMealEntries(userId, 20);
    const foodFrequency: Record<string, number> = {};

    for (const meal of meals) {
      const foods = meal.foods || [];
      for (const food of foods) {
        foodFrequency[food] = (foodFrequency[food] || 0) + 1;
      }
    }

    // Return top 5 most frequently logged foods
    return Object.entries(foodFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([food]) => food);
  } catch (error) {
    console.error('Error getting recently logged foods:', error);
    return [];
  }
};

export default function QuickLogScreen({
  onComplete,
  onCancel,
}: {
  onComplete: () => void;
  onCancel: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [recentFoods, setRecentFoods] = useState<string[]>([]);
  const [data, setData] = useState<QuickLogData>({
    mood: null,
    stoolType: null,
    energyLevel: 5,
    selectedSymptoms: [],
    logTime: new Date(),
    meals: [],
    mealInput: '',
    // Lifestyle defaults
    stressLevel: 5,
    sleepQuality: 7,
    sleepHours: 7.5,
    waterIntake: 2000,
    exerciseMinutes: 0,
    exerciseType: '',
    medications: [],
  });

  useEffect(() => {
    // Load today's mood and recently logged foods
    const loadInitialData = async () => {
      if (user?.id) {
        try {
          const [todayMood, recentlyLogged] = await Promise.all([
            moodService.getTodayMood(user.id),
            getRecentlyLoggedFoods(user.id),
          ]);
          if (todayMood) {
            setData((prev) => ({ ...prev, mood: todayMood.mood_type }));
          }
          setRecentFoods(recentlyLogged);
        } catch (error) {
          console.error('Error loading initial data:', error);
        }
      }
    };
    loadInitialData();
  }, [user?.id]);

  const isComplete = data.stoolType !== null;

  const toggleSymptom = (symptomId: string) => {
    setData((prev) => ({
      ...prev,
      selectedSymptoms: prev.selectedSymptoms.includes(symptomId)
        ? prev.selectedSymptoms.filter((s) => s !== symptomId)
        : [...prev.selectedSymptoms, symptomId],
    }));
  };


  const handleSubmit = async () => {
    if (!user?.id || !isComplete) return;

    setLoading(true);
    try {
      // Create symptoms object
      const symptomsObj = SYMPTOMS.reduce(
        (acc, symptom) => ({
          ...acc,
          [symptom.id]: data.selectedSymptoms.includes(symptom.id),
        }),
        {}
      );

      // Log mood if selected
      if (data.mood) {
        try {
          await moodService.logMoodEntry(user.id, {
            mood_type: data.mood,
          });
        } catch (error) {
          console.error('Error logging mood:', error);
        }
      }

      // Log entry with selected time and lifestyle data
      await entryService.logStoolEntry(user.id, {
        entry_time: data.logTime.toISOString(),
        stool_type: data.stoolType!,
        energy_level: data.energyLevel,
        symptoms: symptomsObj,
        notes: data.meals.length > 0 ? data.meals.join(', ') : undefined,
        // Lifestyle tracking
        stress_level: data.stressLevel,
        sleep_quality: data.sleepQuality,
        sleep_hours: data.sleepHours,
        water_intake: data.waterIntake,
        exercise_minutes: data.exerciseMinutes,
        exercise_type: data.exerciseType || undefined,
        medications: data.medications.length > 0 ? data.medications : undefined,
      });

      // Log meals if any
      if (data.meals.length > 0) {
        for (const meal of data.meals) {
          try {
            await entryService.logMealEntry(user.id, {
              meal_time: data.logTime.toISOString(),
              meal_name: meal,
              foods: [meal],
            });
          } catch (error) {
            console.error('Error logging meal:', error);
          }
        }
      }

      // Update streak
      await streakService.updateStreak(user.id);

      // Update scores (this will trigger all calculations)
      try {
        await scoringService.calculateAndUpdateScores(user.id);
      } catch (error) {
        console.error('Error updating scores:', error);
      }

      // Create or update weekly challenge if none exists
      try {
        const existingChallenge = await challengeService.getThisWeekChallenge(user.id);
        if (!existingChallenge) {
          // Create a default challenge for first-time users
          await challengeService.createWeeklyChallenge(user.id, {
            challenge_type: 'symptom_focus',
            challenge_description: 'Track your most common symptoms this week',
          });
        }
      } catch (error) {
        console.error('Error creating challenge:', error);
      }

      Alert.alert(
        'Great job!',
        'Your entry has been saved. Keep logging daily to discover your patterns!'
      );
      onComplete();
    } catch (error) {
      console.error('Error logging entry:', error);
      Alert.alert('Error', 'Failed to log entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateTime = (hours: number, minutes: number) => {
    const newTime = new Date(data.logTime);
    newTime.setHours(hours, minutes, 0, 0);
    setData((prev) => ({ ...prev, logTime: newTime }));
  };

  const selectedStoolType = STOOL_TYPES.find((t) => t.type === data.stoolType);

  const energyIcon = getEnergyIcon(data.energyLevel);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Ionicons name="close" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text variant="title2" weight="bold">
          Quick Log
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={styles.content}
      >
        {/* Time Picker */}
        <View style={styles.section}>
          <Text variant="caption" color="secondary" style={styles.sectionTitle}>
            When did this happen?
          </Text>

          {/* Time Display */}
          <View style={styles.timeDisplay}>
            <Text
              variant="title2"
              weight="bold"
              style={{ color: theme.colors.brand.primary }}
            >
              {data.logTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </Text>
            <Text
              variant="caption"
              style={{ marginTop: 4, color: theme.colors.brand.primary }}
            >
              {data.logTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          {/* Time Presets */}
          <View style={styles.timePresetsGrid}>
            {[
              { label: 'Morning', hours: 8, minutes: 0 },
              { label: 'Afternoon', hours: 14, minutes: 0 },
              { label: 'Evening', hours: 19, minutes: 0 },
              { label: 'Now', hours: new Date().getHours(), minutes: new Date().getMinutes() },
            ].map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={[
                  styles.timePreset,
                  data.logTime.getHours() === preset.hours &&
                    data.logTime.getMinutes() === preset.minutes &&
                    styles.timePresetSelected,
                ]}
                onPress={() => updateTime(preset.hours, preset.minutes)}
              >
                <Text
                  variant="caption"
                  weight="semiBold"
                  style={{
                    color:
                      data.logTime.getHours() === preset.hours &&
                      data.logTime.getMinutes() === preset.minutes
                        ? theme.colors.brand.black
                        : theme.colors.text.secondary,
                  }}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mood Wheel */}
        <View style={styles.section}>
          <Text variant="title3" weight="bold" style={styles.sectionTitle}>
            How are you feeling today?
          </Text>
          <Text
            variant="caption"
            color="secondary"
            style={{ marginBottom: theme.spacing.lg }}
          >
            Your mood helps explain your patterns
          </Text>
          <MoodWheel
            selectedMood={data.mood}
            onMoodSelect={(moodId) => setData((prev) => ({ ...prev, mood: moodId }))}
          />
        </View>

        {/* Stool Type - Bristol Scale with proper descriptions */}
        <View style={styles.section}>
          <Text variant="title3" weight="bold" style={styles.sectionTitle}>
            Bristol Stool Scale
          </Text>

          {/* Selected Type Display */}
          {selectedStoolType && (
            <View
              style={[
                styles.selectedTypeDisplay,
                { borderLeftColor: selectedStoolType.color },
              ]}
            >
              <View style={[styles.selectedTypeIconContainer, { backgroundColor: theme.colors.background.primary }]}>
                <selectedStoolType.iconLib 
                  name={selectedStoolType.icon as any} 
                  size={40} 
                  color={selectedStoolType.color} 
                />
              </View>
              <View style={{ flex: 1, marginLeft: theme.spacing.lg }}>
                <Text
                  variant="body"
                  weight="semiBold"
                  style={{ color: theme.colors.brand.black }}
                >
                  {selectedStoolType.label}
                </Text>
                <Text
                  variant="caption"
                  style={{ marginTop: 4, color: theme.colors.brand.black }}
                >
                  {selectedStoolType.description}
                </Text>
                <Text
                  variant="caption"
                  weight="semiBold"
                  style={{ 
                    marginTop: 2, 
                    color: selectedStoolType.color 
                  }}
                >
                  {selectedStoolType.subtext}
                </Text>
              </View>
            </View>
          )}

          {/* Type Selection Grid */}
          <View style={styles.typeGrid}>
            {STOOL_TYPES.map((item) => {
              const isSelected = data.stoolType === item.type;
              return (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.typeCard,
                  isSelected && styles.typeCardSelected,
                ]}
                onPress={() => setData((prev) => ({ ...prev, stoolType: item.type }))}
              >
                <View
                  style={[
                    styles.typeIcon,
                    { 
                      backgroundColor: isSelected 
                        ? theme.colors.background.primary 
                        : item.color + '20' 
                    },
                  ]}
                >
                  <item.iconLib 
                    name={item.icon as any} 
                    size={32} 
                    color={item.color} 
                  />
                </View>
                <Text
                  variant="caption"
                  weight="semiBold"
                  align="center"
                  style={{ 
                    marginTop: 8,
                    color: isSelected 
                      ? theme.colors.brand.black 
                      : theme.colors.text.primary
                  }}
                >
                  {item.label}
                </Text>
                <Text
                  variant="caption"
                  align="center"
                  style={{ 
                    marginTop: 2, 
                    fontSize: 10,
                    color: isSelected 
                      ? theme.colors.brand.black 
                      : theme.colors.text.secondary
                  }}
                >
                  {item.subtext}
                </Text>
              </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Energy Level - Slider */}
        <View style={styles.section}>
          <View style={styles.energyHeader}>
            <Text variant="title3" weight="bold">
              Energy Level
            </Text>
            <View
              style={[
                styles.energyBadge,
                {
                  backgroundColor:
                    data.energyLevel >= 7
                      ? theme.colors.brand.primary + '20' // Primary with opacity
                      : data.energyLevel >= 4
                        ? theme.colors.brand.cream + '20' // Cream with opacity
                        : theme.colors.brand.tertiary + '20', // Tertiary with opacity
                },
              ]}
            >
              <Text
                variant="title3"
                weight="bold"
                style={{
                  color:
                    data.energyLevel >= 7
                      ? theme.colors.brand.primary
                      : data.energyLevel >= 4
                        ? theme.colors.brand.cream
                        : theme.colors.brand.tertiary,
                }}
              >
                {data.energyLevel}/10
              </Text>
            </View>
          </View>

          {/* Slider with cream background like onboarding */}
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={data.energyLevel}
              onValueChange={(value) =>
                setData((prev) => ({ ...prev, energyLevel: value }))
              }
              minimumTrackTintColor={theme.colors.brand.primary}
              maximumTrackTintColor={theme.colors.border.light}
              thumbTintColor={theme.colors.brand.primary}
            />
            <View style={styles.sliderLabels}>
              <Text variant="caption" style={{ color: theme.colors.text.secondary }}>
                Low
              </Text>
              <Text variant="caption" style={{ color: theme.colors.text.secondary }}>
                High
              </Text>
            </View>
          </View>

          {/* Energy Description */}
          <View style={styles.energyDescriptionContainer}>
             <Ionicons name={energyIcon.name as any} size={24} color={energyIcon.color} />
             <Text
              variant="caption"
              color="secondary"
              align="center"
              style={{ marginLeft: 8 }}
            >
              {data.energyLevel >= 8
                ? 'Energized'
                : data.energyLevel >= 6
                  ? 'Good'
                  : data.energyLevel >= 4
                    ? 'Neutral'
                    : data.energyLevel >= 2
                      ? 'Low'
                      : 'Exhausted'}
            </Text>
          </View>
        </View>

        {/* Meals - Optional */}
        <View style={styles.section}>
          <Text variant="title3" weight="bold" style={styles.sectionTitle}>
            What did you eat?
          </Text>
          <Text
            variant="caption"
            color="secondary"
            style={{ marginBottom: theme.spacing.lg }}
          >
            Help us find food triggers (optional)
          </Text>

          <FoodInput
            onFoodsChange={(foods) => {
              setData((prev) => ({
                ...prev,
                meals: foods.map(f => f.name),
                foodsWithPortions: foods,
              }));
            }}
            recentFoods={recentFoods}
          />
        </View>

        {/* Lifestyle Tracking */}
        <LifestyleTracker
          stressLevel={data.stressLevel}
          sleepQuality={data.sleepQuality}
          sleepHours={data.sleepHours}
          waterIntake={data.waterIntake}
          exerciseMinutes={data.exerciseMinutes}
          exerciseType={data.exerciseType}
          medications={data.medications}
          onStressChange={(value) => setData(prev => ({ ...prev, stressLevel: value }))}
          onSleepQualityChange={(value) => setData(prev => ({ ...prev, sleepQuality: value }))}
          onSleepHoursChange={(value) => setData(prev => ({ ...prev, sleepHours: value }))}
          onWaterIntakeChange={(value) => setData(prev => ({ ...prev, waterIntake: value }))}
          onExerciseMinutesChange={(value) => setData(prev => ({ ...prev, exerciseMinutes: value }))}
          onExerciseTypeChange={(value) => setData(prev => ({ ...prev, exerciseType: value }))}
          onMedicationsChange={(value) => setData(prev => ({ ...prev, medications: value }))}
        />

        {/* Symptoms - Optional */}
        <View style={styles.section}>
          <Text variant="title3" weight="bold" style={styles.sectionTitle}>
            Symptoms
          </Text>
          <Text
            variant="caption"
            color="secondary"
            style={{ marginBottom: theme.spacing.lg }}
          >
            Select any that apply (optional)
          </Text>

          <View style={styles.symptomsGrid}>
            {SYMPTOMS.map((symptom) => (
              <TouchableOpacity
                key={symptom.id}
                style={[
                  styles.symptomCard,
                  data.selectedSymptoms.includes(symptom.id) &&
                    styles.symptomCardSelected,
                ]}
                onPress={() => toggleSymptom(symptom.id)}
              >
                <Ionicons
                  name={
                    (data.selectedSymptoms.includes(symptom.id)
                      ? symptom.icon.replace('-outline', '')
                      : symptom.icon) as any
                  }
                  size={24}
                  color={
                    data.selectedSymptoms.includes(symptom.id)
                      ? theme.colors.brand.primary
                      : theme.colors.text.secondary
                  }
                />
                <Text
                  variant="caption"
                  weight="semiBold"
                  style={{
                    marginTop: theme.spacing.sm,
                    color: data.selectedSymptoms.includes(symptom.id)
                      ? theme.colors.brand.black
                      : theme.colors.text.secondary,
                  }}
                >
                  {symptom.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer - Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isComplete || loading}
          style={[
            styles.submitButton,
            {
              opacity: isComplete ? 1 : 0.5,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.brand.white} size="small" />
          ) : (
            <Text variant="body" weight="semiBold" style={{ color: theme.colors.brand.white }}>
              Save Entry
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.separator,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing['3xl'],
  },
  sectionTitle: {
    marginBottom: theme.spacing.lg,
  },

  /* Time Picker */
  timeDisplay: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  timePresetsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  timePreset: {
    flex: 1,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border.light,
  },
  timePresetSelected: {
    borderColor: theme.colors.brand.black,
    backgroundColor: theme.colors.brand.cream,
  },

  /* Stool Type */
  selectedTypeDisplay: {
    backgroundColor: theme.colors.brand.cream,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '31%',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border.light,
  },
  typeCardSelected: {
    borderColor: theme.colors.brand.black,
    backgroundColor: theme.colors.brand.cream,
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Energy Level */
  energyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  energyBadge: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
  },
  sliderContainer: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },

  /* Symptoms */
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  symptomCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
  },
  symptomCardSelected: {
    borderColor: theme.colors.brand.black,
    backgroundColor: theme.colors.brand.cream,
  },

  /* Footer */
  footer: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  submitButton: {
    backgroundColor: theme.colors.brand.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTypeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
  },
  energyDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },

  /* Meal Section */
  recentFoodsContainer: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.brand.secondary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  recentFoodsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  recentFoodButton: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.brand.tertiary,
  },
  mealInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  mealInput: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text.primary,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
  },
  mealAddButton: {
    backgroundColor: theme.colors.brand.primary,
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  mealTag: {
    backgroundColor: theme.colors.brand.primary,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  mealRemoveButton: {
    marginLeft: theme.spacing.sm,
  },
});

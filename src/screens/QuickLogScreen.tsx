import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
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
import { IconButton, Chip, Card } from '../components';
import Button from '../components/Button';
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

  const energyIcon = getEnergyIcon(data.energyLevel);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, theme.spacing.md) }]}>
        <IconButton
          icon="close"
          onPress={onCancel}
          color={theme.colors.text.primary}
        />
        <Text variant="title3" weight="bold">
          Quick Log
        </Text>
        <IconButton
          icon="checkmark"
          onPress={handleSubmit}
          disabled={!isComplete || loading}
          color={isComplete ? theme.colors.brand.primary : theme.colors.text.tertiary}
        />
      </View>

      <ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Time Picker */}
        <View style={styles.section}>
          <Text variant="headline" weight="bold" style={styles.sectionTitle}>
            When did this happen?
          </Text>
          <Card 
            padding="medium" 
            backgroundColor={theme.colors.background.card} 
            borderRadius="xl" 
            elevation="flat"
            align="center"
          >
            <View style={styles.timeDisplay}>
              <Text
                variant="title1"
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
                color="secondary"
                style={{ marginTop: 4 }}
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
                { label: 'Now', hours: new Date().getHours(), minutes: new Date().getMinutes() },
              ].map((preset) => (
                <Chip
                  key={preset.label}
                  label={preset.label}
                  selected={
                    data.logTime.getHours() === preset.hours &&
                    data.logTime.getMinutes() === preset.minutes
                  }
                  onPress={() => updateTime(preset.hours, preset.minutes)}
                  style={{ flex: 1 }}
                />
              ))}
            </View>
          </Card>
        </View>

        {/* Mood Wheel */}
        <View style={styles.section}>
          <Text variant="headline" weight="bold" style={styles.sectionTitle}>
            How are you feeling?
          </Text>
          <MoodWheel
            selectedMood={data.mood}
            onMoodSelect={(moodId) => setData((prev) => ({ ...prev, mood: moodId }))}
          />
        </View>

        {/* Stool Type */}
        <View style={styles.section}>
          <Text variant="headline" weight="bold" style={styles.sectionTitle}>
            Bristol Stool Scale
          </Text>
          <View style={styles.typeGrid}>
            {STOOL_TYPES.map((item) => {
              const isSelected = data.stoolType === item.type;
              return (
                <View key={item.type} style={styles.moodCardWrapper}>
                  <Card 
                    padding="none" 
                    pressable 
                    onPress={() => setData((prev) => ({ ...prev, stoolType: item.type }))}
                    selected={isSelected}
                    style={styles.moodCard}
                    align="center"
                    justify="center"
                    borderRadius="xl"
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        { 
                          backgroundColor: isSelected 
                            ? item.color 
                            : theme.colors.background.primary 
                        },
                      ]}
                    >
                      <item.iconLib 
                        name={item.icon as any} 
                        size={22} 
                        color={isSelected ? theme.colors.brand.white : theme.colors.text.tertiary} 
                      />
                    </View>
                    <Text
                      variant="caption2"
                      weight="bold"
                      align="center"
                      style={{ 
                        marginTop: 6,
                        color: isSelected 
                          ? theme.colors.text.primary 
                          : theme.colors.text.secondary
                      }}
                    >
                      Type {item.type}
                    </Text>
                  </Card>
                </View>
              );
            })}
          </View>
        </View>

        {/* Energy Level */}
        <View style={styles.section}>
          <Text variant="headline" weight="bold" style={styles.sectionTitle}>
            Energy Level
          </Text>
          <Card 
            padding="medium" 
            backgroundColor={theme.colors.background.card} 
            borderRadius="xl" 
            elevation="flat"
          >
            <View style={styles.energyHeader}>
              <View style={[styles.energyIconContainer, { backgroundColor: energyIcon.color + '15' }]}>
                <Ionicons 
                  name={energyIcon.name as any} 
                  size={32} 
                  color={energyIcon.color} 
                />
              </View>
              <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <Text
                  variant="title3"
                  weight="bold"
                  style={{ color: energyIcon.color }}
                >
                  {data.energyLevel >= 8 ? 'Energized' : data.energyLevel >= 6 ? 'Good' : data.energyLevel >= 4 ? 'Neutral' : data.energyLevel >= 2 ? 'Low' : 'Exhausted'}
                </Text>
                <Text variant="caption" color="secondary">
                  How's your vitality right now?
                </Text>
              </View>
              <View style={[styles.energyBadge, { backgroundColor: energyIcon.color + '20' }]}>
                <Text variant="headline" weight="bold" style={{ color: energyIcon.color }}>
                  {data.energyLevel}
                </Text>
              </View>
            </View>
            
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={data.energyLevel}
              onValueChange={(val) => setData((prev) => ({ ...prev, energyLevel: val }))}
              minimumTrackTintColor={energyIcon.color}
              maximumTrackTintColor={theme.colors.border.light}
              thumbTintColor={energyIcon.color}
            />
          </Card>
        </View>

        {/* Meals */}
        <View style={styles.section}>
          <Text variant="headline" weight="bold" style={styles.sectionTitle}>
            What did you eat?
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

        {/* Symptoms */}
        <View style={styles.section}>
          <Text variant="headline" weight="bold" style={styles.sectionTitle}>
            Any Symptoms?
          </Text>
          <View style={styles.symptomsGrid}>
            {SYMPTOMS.map((symptom) => {
              const isSelected = data.selectedSymptoms.includes(symptom.id);
              return (
                <TouchableOpacity
                  key={symptom.id}
                  style={styles.moodCardWrapper}
                  onPress={() => toggleSymptom(symptom.id)}
                  activeOpacity={0.8}
                >
                  <Card
                    padding="none"
                    style={styles.moodCard}
                    backgroundColor={isSelected ? theme.colors.brand.primary + '15' : theme.colors.background.card}
                    elevation={isSelected ? 'flat' : 'none'}
                    borderRadius="lg"
                    align="center"
                    justify="center"
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        { 
                          backgroundColor: isSelected 
                            ? theme.colors.brand.primary 
                            : theme.colors.background.primary 
                        },
                      ]}
                    >
                      <Ionicons
                        name={(isSelected ? symptom.icon.replace('-outline', '') : symptom.icon) as any}
                        size={24}
                        color={isSelected ? theme.colors.brand.white : theme.colors.text.tertiary}
                      />
                    </View>
                    <Text
                      variant="caption2"
                      weight="bold"
                      align="center"
                      style={{
                        marginTop: 8,
                        color: isSelected 
                          ? theme.colors.text.primary 
                          : theme.colors.text.secondary,
                      }}
                    >
                      {symptom.label}
                    </Text>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer - Submit Button */}
      <View style={styles.footer}>
        <Button
          title="Save Entry"
          onPress={handleSubmit}
          disabled={!isComplete || loading}
          loading={loading}
          variant="primary"
          size="large"
          fullWidth
        />
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing['3xl'],
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  timeDisplay: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  timePresetsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'flex-start',
  },
  energyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  energyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  energyBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: theme.spacing.md,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'flex-start',
  },
  footer: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  moodCardWrapper: {
    width: '31%',
    aspectRatio: 0.95,
    marginBottom: theme.spacing.md,
  },
  moodCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

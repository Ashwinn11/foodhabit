/**
 * Lifestyle Tracking Component
 * Compact, beautiful UI for tracking stress, sleep, water, exercise, and medications
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import Text from './Text';
import {
  STRESS_LEVELS,
  SLEEP_QUALITY,
  EXERCISE_TYPES,
  COMMON_MEDICATIONS,
} from '../services/gutHarmony/lifestyleService';

interface LifestyleTrackerProps {
  stressLevel: number;
  sleepQuality: number;
  sleepHours: number;
  waterIntake: number;
  exerciseMinutes: number;
  exerciseType: string;
  medications: string[];
  onStressChange: (value: number) => void;
  onSleepQualityChange: (value: number) => void;
  onSleepHoursChange: (value: number) => void;
  onWaterIntakeChange: (value: number) => void;
  onExerciseMinutesChange: (value: number) => void;
  onExerciseTypeChange: (value: string) => void;
  onMedicationsChange: (value: string[]) => void;
}

export default function LifestyleTracker({
  stressLevel,
  sleepQuality,
  sleepHours,
  waterIntake,
  exerciseMinutes,
  exerciseType,
  medications,
  onStressChange,
  onSleepQualityChange,
  onSleepHoursChange,
  onWaterIntakeChange,
  onExerciseMinutesChange,
  onExerciseTypeChange,
  onMedicationsChange,
}: LifestyleTrackerProps) {
  const [expanded, setExpanded] = useState(false);

  const stressData = STRESS_LEVELS.find(s => s.value === stressLevel) || STRESS_LEVELS[4];
  const sleepData = SLEEP_QUALITY.find(s => s.value === sleepQuality) || SLEEP_QUALITY[6];

  const toggleMedication = (med: string) => {
    if (medications.includes(med)) {
      onMedicationsChange(medications.filter(m => m !== med));
    } else {
      onMedicationsChange([...medications, med]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header - Always Visible */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="fitness-outline" size={24} color={theme.colors.brand.primary} />
          <Text variant="title3" weight="bold" style={{ marginLeft: theme.spacing.md }}>
            Lifestyle Tracking
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={theme.colors.text.secondary}
        />
      </TouchableOpacity>

      {/* Quick Summary - Always Visible */}
      {!expanded && (
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Ionicons name={stressData.icon as any} size={16} color={stressData.color} />
            <Text variant="caption" color="secondary" style={{ marginLeft: 4 }}>
              Stress: {stressLevel}/10
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name={sleepData.icon as any} size={16} color={sleepData.color} />
            <Text variant="caption" color="secondary" style={{ marginLeft: 4 }}>
              Sleep: {sleepHours}h
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="water-outline" size={16} color={theme.colors.brand.secondary} />
            <Text variant="caption" color="secondary" style={{ marginLeft: 4 }}>
              {(waterIntake / 1000).toFixed(1)}L
            </Text>
          </View>
        </View>
      )}

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.content}>
          {/* Stress Level */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={stressData.icon as any} size={20} color={stressData.color} />
              <Text variant="body" weight="semiBold" style={{ marginLeft: theme.spacing.sm }}>
                Stress Level
              </Text>
            </View>
            <View style={styles.sliderContainer}>
              <Text variant="caption" color="secondary">Relaxed</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={stressLevel}
                onValueChange={onStressChange}
                minimumTrackTintColor={stressData.color}
                maximumTrackTintColor={theme.colors.border.light}
                thumbTintColor={stressData.color}
              />
              <Text variant="caption" color="secondary">Stressed</Text>
            </View>
            <Text variant="caption" style={{ color: stressData.color, textAlign: 'center' }}>
              {stressLevel}/10 - {stressData.label}
            </Text>
          </View>

          {/* Sleep Quality */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={sleepData.icon as any} size={20} color={sleepData.color} />
              <Text variant="body" weight="semiBold" style={{ marginLeft: theme.spacing.sm }}>
                Sleep Quality
              </Text>
            </View>
            <View style={styles.sliderContainer}>
              <Text variant="caption" color="secondary">Poor</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={sleepQuality}
                onValueChange={onSleepQualityChange}
                minimumTrackTintColor={sleepData.color}
                maximumTrackTintColor={theme.colors.border.light}
                thumbTintColor={sleepData.color}
              />
              <Text variant="caption" color="secondary">Excellent</Text>
            </View>
            <Text variant="caption" style={{ color: sleepData.color, textAlign: 'center' }}>
              {sleepQuality}/10 - {sleepData.label}
            </Text>

            {/* Sleep Hours */}
            <View style={styles.inputRow}>
              <Ionicons name="moon-outline" size={18} color={theme.colors.brand.tertiary} />
              <Text variant="body" style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
                Hours slept
              </Text>
              <View style={styles.numberInput}>
                <RNTextInput
                  value={sleepHours.toString()}
                  onChangeText={(text) => {
                    const num = parseFloat(text);
                    if (!isNaN(num) && num >= 0 && num <= 24) {
                      onSleepHoursChange(num);
                    }
                  }}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  placeholderTextColor={theme.colors.text.tertiary}
                />
                <Text variant="caption" color="secondary">hours</Text>
              </View>
            </View>
          </View>

          {/* Water Intake */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="water-outline" size={20} color={theme.colors.brand.secondary} />
              <Text variant="body" weight="semiBold" style={{ marginLeft: theme.spacing.sm }}>
                Water Intake
              </Text>
            </View>
            <View style={styles.inputRow}>
              <Text variant="body" style={{ flex: 1 }}>
                Amount
              </Text>
              <View style={styles.numberInput}>
                <RNTextInput
                  value={(waterIntake / 1000).toFixed(1)}
                  onChangeText={(text) => {
                    const num = parseFloat(text);
                    if (!isNaN(num) && num >= 0) {
                      onWaterIntakeChange(Math.round(num * 1000));
                    }
                  }}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  placeholderTextColor={theme.colors.text.tertiary}
                />
                <Text variant="caption" color="secondary">liters</Text>
              </View>
            </View>
          </View>

          {/* Exercise */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="fitness-outline" size={20} color={theme.colors.brand.primary} />
              <Text variant="body" weight="semiBold" style={{ marginLeft: theme.spacing.sm }}>
                Exercise
              </Text>
            </View>
            <View style={styles.inputRow}>
              <Text variant="body" style={{ flex: 1 }}>
                Duration
              </Text>
              <View style={styles.numberInput}>
                <RNTextInput
                  value={exerciseMinutes.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text);
                    if (!isNaN(num) && num >= 0) {
                      onExerciseMinutesChange(num);
                    }
                  }}
                  keyboardType="number-pad"
                  style={styles.input}
                  placeholderTextColor={theme.colors.text.tertiary}
                />
                <Text variant="caption" color="secondary">min</Text>
              </View>
            </View>

            {exerciseMinutes > 0 && (
              <View style={styles.exerciseTypes}>
                {EXERCISE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.exerciseChip,
                      exerciseType === type.value && styles.exerciseChipSelected,
                    ]}
                    onPress={() => onExerciseTypeChange(type.value)}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={16}
                      color={
                        exerciseType === type.value
                          ? theme.colors.brand.white
                          : theme.colors.text.secondary
                      }
                    />
                    <Text
                      variant="caption"
                      weight="semiBold"
                      style={{
                        marginLeft: 4,
                        color:
                          exerciseType === type.value
                            ? theme.colors.brand.white
                            : theme.colors.text.secondary,
                      }}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Medications */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical-outline" size={20} color={theme.colors.brand.tertiary} />
              <Text variant="body" weight="semiBold" style={{ marginLeft: theme.spacing.sm }}>
                Medications
              </Text>
            </View>
            <View style={styles.medicationsList}>
              {COMMON_MEDICATIONS.map((med) => (
                <TouchableOpacity
                  key={med}
                  style={[
                    styles.medicationChip,
                    medications.includes(med) && styles.medicationChipSelected,
                  ]}
                  onPress={() => toggleMedication(med)}
                >
                  <Text
                    variant="caption"
                    weight="semiBold"
                    style={{
                      color: medications.includes(med)
                        ? theme.colors.brand.white
                        : theme.colors.text.secondary,
                    }}
                  >
                    {med}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summary: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numberInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text.primary,
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
    minWidth: 60,
    textAlign: 'center',
  },
  exerciseTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  exerciseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  exerciseChipSelected: {
    backgroundColor: theme.colors.brand.primary,
    borderColor: theme.colors.brand.primary,
  },
  medicationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  medicationChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  medicationChipSelected: {
    backgroundColor: theme.colors.brand.tertiary,
    borderColor: theme.colors.brand.tertiary,
  },
});

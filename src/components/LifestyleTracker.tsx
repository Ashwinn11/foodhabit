import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import Text from './Text';
import Card from './Card';
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
    <Card 
      padding="none" 
      borderRadius="xl" 
      elevation="flat" 
      style={styles.container}
      backgroundColor={theme.colors.background.card}
    >
      {/* Header - Always Visible */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="fitness" size={18} color={theme.colors.brand.primary} />
          </View>
          <Text variant="title3" weight="bold" style={{ marginLeft: theme.spacing.md }}>
            Lifestyle Tracking
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.colors.text.tertiary}
        />
      </TouchableOpacity>

      {/* Quick Summary - Always Visible */}
      {!expanded && (
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Ionicons name={stressData.icon as any} size={14} color={stressData.color} />
            <Text variant="caption1" weight="bold" color="secondary" style={{ marginLeft: 4 }}>
              Stress: {stressLevel}/10
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name={sleepData.icon as any} size={14} color={sleepData.color} />
            <Text variant="caption1" weight="bold" color="secondary" style={{ marginLeft: 4 }}>
              Sleep: {sleepHours}h
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="water" size={14} color={theme.colors.brand.secondary} />
            <Text variant="caption1" weight="bold" color="secondary" style={{ marginLeft: 4 }}>
              {(waterIntake / 1000).toFixed(1)}L
            </Text>
          </View>
        </View>
      )}

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.content}>
          {/* Stress & Sleep Group */}
          <View style={styles.metricGroup}>
            {/* Stress Level Card */}
            <View style={[styles.metricCard, { backgroundColor: stressData.color + '10', borderColor: stressData.color + '30', borderWidth: 1 }]}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.titleRow}>
                  <Ionicons name={stressData.icon as any} size={20} color={stressData.color} />
                  <Text variant="headline" weight="bold" style={{ marginLeft: theme.spacing.sm, color: theme.colors.text.primary }}>
                    Stress
                  </Text>
                </View>
                <Text variant="title2" weight="bold" style={{ color: stressData.color }}>
                  {stressLevel}/10
                </Text>
              </View>
              
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={stressLevel}
                  onValueChange={onStressChange}
                  minimumTrackTintColor={stressData.color}
                  maximumTrackTintColor={theme.colors.background.field}
                  thumbTintColor={stressData.color}
                />
              </View>
              <Text variant="caption1" weight="bold" align="center" style={{ color: stressData.color, marginTop: 4 }}>
                {stressData.label}
              </Text>
            </View>

            {/* Sleep Quality Card */}
            <View style={[styles.metricCard, { backgroundColor: sleepData.color + '10', borderColor: sleepData.color + '30', borderWidth: 1 }]}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.titleRow}>
                  <Ionicons name={sleepData.icon as any} size={20} color={sleepData.color} />
                  <Text variant="headline" weight="bold" style={{ marginLeft: theme.spacing.sm, color: theme.colors.text.primary }}>
                    Sleep Quality
                  </Text>
                </View>
                <Text variant="title2" weight="bold" style={{ color: sleepData.color }}>
                  {sleepQuality}/10
                </Text>
              </View>

              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={sleepQuality}
                  onValueChange={onSleepQualityChange}
                  minimumTrackTintColor={sleepData.color}
                  maximumTrackTintColor={theme.colors.background.field}
                  thumbTintColor={sleepData.color}
                />
              </View>
              <Text variant="caption1" weight="bold" align="center" style={{ color: sleepData.color, marginTop: 4 }}>
                {sleepData.label}
              </Text>

              {/* Hours Input Integrated */}
              <View style={styles.divider} />
              <View style={styles.miniInputRow}>
                <Text variant="body" weight="semiBold" color="secondary">Duration</Text>
                <View style={styles.inlineInputWrapper}>
                  <RNTextInput
                    value={sleepHours === 0 ? '' : sleepHours.toString()}
                    onChangeText={(text) => {
                      if (text === '') {
                        onSleepHoursChange(0);
                        return;
                      }
                      const num = parseFloat(text);
                      if (!isNaN(num) && num >= 0 && num <= 24) onSleepHoursChange(num);
                    }}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                    placeholder="0"
                    style={styles.inlineInput}
                    placeholderTextColor={theme.colors.text.tertiary}
                  />
                  <Text variant="body" weight="bold" color="secondary">h</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Water & Exercise Row */}
          <View style={styles.rowGrid}>
            {/* Water Card */}
            <View style={[styles.gridCard, { backgroundColor: theme.colors.brand.secondary + '10', borderColor: theme.colors.brand.secondary + '30' }]}>
              <View style={styles.gridHeader}>
                <Ionicons name="water" size={24} color={theme.colors.brand.secondary} />
                <Text variant="headline" weight="bold" style={{ marginTop: 8 }}>Water</Text>
              </View>
              <View style={styles.gridInputWrapper}>
                <RNTextInput
                  value={waterIntake === 0 ? '' : (waterIntake / 1000).toString()}
                  onChangeText={(text) => {
                    if (text === '') {
                        onWaterIntakeChange(0);
                        return;
                    }
                    const num = parseFloat(text);
                    if (!isNaN(num) && num >= 0) onWaterIntakeChange(Math.round(num * 1000));
                  }}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                  placeholder="0"
                  style={styles.gridInput}
                  placeholderTextColor={theme.colors.text.tertiary}
                />
                <Text variant="body" weight="bold" color="secondary" style={{ marginTop: 4 }}>Liters</Text>
              </View>
            </View>

            {/* Exercise Card */}
            <View style={[styles.gridCard, { backgroundColor: theme.colors.brand.primary + '10', borderColor: theme.colors.brand.primary + '30' }]}>
              <View style={styles.gridHeader}>
                <Ionicons name="fitness" size={24} color={theme.colors.brand.primary} />
                <Text variant="headline" weight="bold" style={{ marginTop: 8 }}>Workout</Text>
              </View>
              <View style={styles.gridInputWrapper}>
                <RNTextInput
                  value={exerciseMinutes === 0 ? '' : exerciseMinutes.toString()}
                  onChangeText={(text) => {
                    if (text === '') {
                        onExerciseMinutesChange(0);
                        return;
                    }
                    const num = parseInt(text);
                    if (!isNaN(num) && num >= 0) onExerciseMinutesChange(num);
                  }}
                  keyboardType="number-pad"
                  selectTextOnFocus
                  placeholder="0"
                  style={styles.gridInput}
                  placeholderTextColor={theme.colors.text.tertiary}
                />
                <Text variant="body" weight="bold" color="secondary" style={{ marginTop: 4 }}>Mins</Text>
              </View>
            </View>
          </View>

          {/* Exercise Types Chips (Conditional) */}
          {exerciseMinutes > 0 && (
            <View style={styles.exerciseTypes}>
              {EXERCISE_TYPES.map((type) => {
                const isSelected = exerciseType === type.value;
                return (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.exerciseChip,
                      isSelected && { borderColor: theme.colors.brand.primary, backgroundColor: theme.colors.brand.primary + '20' },
                    ]}
                    onPress={() => onExerciseTypeChange(type.value)}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={16}
                      color={isSelected ? theme.colors.brand.primary : theme.colors.text.secondary}
                    />
                    <Text
                      variant="caption1"
                      weight="bold"
                      style={{
                        marginLeft: 6,
                        color: isSelected ? theme.colors.text.primary : theme.colors.text.secondary,
                      }}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Medications */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical" size={20} color={theme.colors.brand.tertiary} />
              <Text variant="headline" weight="bold" style={{ marginLeft: theme.spacing.sm }}>
                Medications
              </Text>
            </View>
            <View style={styles.medicationsList}>
              {COMMON_MEDICATIONS.map((med) => {
                const isSelected = medications.includes(med);
                return (
                  <TouchableOpacity
                    key={med}
                    style={[
                      styles.medicationChip,
                      isSelected && { borderColor: theme.colors.brand.tertiary, backgroundColor: theme.colors.brand.tertiary + '20' },
                    ]}
                    onPress={() => toggleMedication(med)}
                  >
                    <Text
                      variant="caption1"
                      weight="bold"
                      style={{
                        color: isSelected ? theme.colors.text.primary : theme.colors.text.secondary,
                      }}
                    >
                      {med}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.brand.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
  },
  summary: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  // Dashboard Styles
  metricGroup: {
    gap: theme.spacing.md,
  },
  metricCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderContainer: {
    flex: 1,
    marginBottom: theme.spacing.xs,
  },
  slider: {
    height: 40,
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginVertical: theme.spacing.md,
    opacity: 0.5,
  },
  miniInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inlineInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.field, // distinct field background
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  inlineInput: {
    fontSize: 16,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text.primary,
    width: 50,
    textAlign: 'center',
    padding: 0,
  },
  // Grid Row
  rowGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  gridCard: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  gridHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  gridInputWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  gridInput: {
    fontSize: 28, // Large number
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    width: '100%',
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.field, // clear input background
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginBottom: 4,
  },
  // Legacy & Shared
  section: {
    gap: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  exerciseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.background.field,
    borderWidth: 1,
    borderColor: 'transparent',
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
    backgroundColor: theme.colors.background.field,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  // Generic input style (legacy fallback)
  input: {
    backgroundColor: theme.colors.background.field,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text.primary,
    fontSize: 18,
    fontFamily: theme.fontFamily.bold,
    minWidth: 80,
    textAlign: 'center',
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
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

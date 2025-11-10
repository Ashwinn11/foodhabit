import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Text, Button, Input } from '../index';
import { UserProfile } from '../../types/profile';
import { profileService } from '../../services/profile/profileService';
import { metricsService } from '../../services/health/metricsService';

interface EditMyBodyModalProps {
  visible: boolean;
  profile: UserProfile | null;
  userId: string;
  onClose: () => void;
  onSave: () => void;
}

const CONDITIONS_OPTIONS = ['IBS', 'GERD', 'Crohn\'s', 'Celiac', 'Lactose Intolerance'];
const ALLERGIES_OPTIONS = ['Dairy', 'Gluten', 'Nuts', 'Shellfish', 'Soy', 'Eggs'];

/**
 * Section Header Component
 */
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text
    variant="h6"
    style={StyleSheet.flatten([
      styles.sectionHeader,
      { color: theme.colors.brand.primary, marginBottom: theme.spacing.md },
    ])}
  >
    {title}
  </Text>
);

/**
 * Chip Selector Component (for multi-select)
 */
interface ChipSelectorProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}

const ChipSelector: React.FC<ChipSelectorProps> = ({ label, options, selectedValues, onToggle }) => (
  <View style={styles.fieldGroup}>
    <Text variant="label" color="secondary" style={styles.fieldLabel}>
      {label}
    </Text>
    <View style={styles.chipContainer}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option);
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onToggle(option)}
            style={[
              styles.chip,
              isSelected && { backgroundColor: theme.colors.brand.primary },
            ]}
          >
            <Text
              variant="caption"
              style={{
                color: isSelected ? theme.colors.brand.white : theme.colors.text.primary,
              }}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

/**
 * Radio Group Component
 */
interface RadioGroupProps {
  label: string;
  options: { value: string; label: string }[];
  selectedValue: string | null | undefined;
  onSelect: (value: string | null) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ label, options, selectedValue, onSelect }) => (
  <View style={styles.fieldGroup}>
    <Text variant="label" color="secondary" style={styles.fieldLabel}>
      {label}
    </Text>
    <View style={styles.radioContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onSelect(option.value as any)}
          style={styles.radioOption}
        >
          <View
            style={[
              styles.radioButton,
              selectedValue === option.value && {
                borderColor: theme.colors.brand.primary,
                backgroundColor: theme.colors.brand.primary,
              },
            ]}
          >
            {selectedValue === option.value && (
              <Ionicons name="checkmark" size={12} color={theme.colors.brand.white} />
            )}
          </View>
          <Text variant="body" style={styles.radioLabel}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export const EditMyBodyModal: React.FC<EditMyBodyModalProps> = ({
  visible,
  profile,
  userId,
  onClose,
  onSave,
}) => {
  // Body Basics
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [weight, setWeight] = useState(profile?.weight?.toString() || '');
  const [height, setHeight] = useState(profile?.height?.toString() || '');

  // Lifestyle
  const [activityLevel, setActivityLevel] = useState(profile?.activity_level || null);
  const [sleepHours, setSleepHours] = useState(profile?.sleep_hours?.toString() || '');
  const [dietType, setDietType] = useState(profile?.diet_type || null);
  const [eatingWindowStart, setEatingWindowStart] = useState(profile?.eating_window_start || '');
  const [eatingWindowEnd, setEatingWindowEnd] = useState(profile?.eating_window_end || '');

  // Medical Context
  const [conditions, setConditions] = useState<string[]>(profile?.diagnosed_conditions || []);
  const [allergies, setAllergies] = useState<string[]>(profile?.food_allergies || []);

  // Goals
  const [focusArea, setFocusArea] = useState(profile?.focus_area || null);
  const [waterIntake, setWaterIntake] = useState(profile?.water_intake?.toString() || '');
  const [cookingRatio, setCookingRatio] = useState(profile?.cooking_ratio?.toString() || '');

  const [saving, setSaving] = useState(false);

  const validateForm = (): boolean => {
    if (!age || !weight || !height) {
      Alert.alert('Error', 'Please fill in age, weight, and height');
      return false;
    }

    const ageNum = parseInt(age);
    const weightNum = parseInt(weight);
    const heightNum = parseInt(height);

    if (ageNum < 1 || ageNum > 120) {
      Alert.alert('Error', 'Please enter a valid age (1-120)');
      return false;
    }

    if (weightNum < 20 || weightNum > 500) {
      Alert.alert('Error', 'Please enter a valid weight (20-500 kg)');
      return false;
    }

    if (heightNum < 100 || heightNum > 250) {
      Alert.alert('Error', 'Please enter a valid height (100-250 cm)');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const updateData = {
        // Body Basics
        age: parseInt(age),
        weight: parseInt(weight),
        height: parseInt(height),
        // Lifestyle
        activity_level: activityLevel as 'sedentary' | 'moderate' | 'active' | null,
        sleep_hours: sleepHours ? parseInt(sleepHours) : null,
        diet_type: dietType as 'veg' | 'non_veg' | 'vegan' | null,
        eating_window_start: eatingWindowStart || null,
        eating_window_end: eatingWindowEnd || null,
        // Medical Context
        diagnosed_conditions: conditions,
        food_allergies: allergies,
        // Goals
        focus_area: focusArea as 'sugar' | 'energy' | 'gut' | 'weight' | null,
        water_intake: waterIntake ? parseInt(waterIntake) : null,
        cooking_ratio: cookingRatio ? parseInt(cookingRatio) : null,
      } as any;

      // Update profile
      await profileService.updateProfile(userId, updateData);

      // Auto-recalculate metrics with updated data
      if (profile) {
        const updatedProfile = { ...profile, ...updateData };
        await metricsService.calculateAndSaveMetrics(userId, updatedProfile as any);
      }

      Alert.alert('Success', 'Your body data has been saved and metrics recalculated.');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save your data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Header */}
          <View style={styles.header}>
          <TouchableOpacity onPress={onClose} disabled={saving}>
            <Text variant="body" style={styles.closeButton}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text variant="h5" style={styles.headerTitle}>
            Edit My Body
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Body Basics */}
          <SectionHeader title="Body Basics" />
          <View style={styles.fieldGroup}>
            <Text variant="label" color="secondary" style={styles.fieldLabel}>
              Age
            </Text>
            <Input
              placeholder="Enter age"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              editable={!saving}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="label" color="secondary" style={styles.fieldLabel}>
              Weight (kg)
            </Text>
            <Input
              placeholder="Enter weight"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              editable={!saving}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="label" color="secondary" style={styles.fieldLabel}>
              Height (cm)
            </Text>
            <Input
              placeholder="Enter height"
              value={height}
              onChangeText={setHeight}
              keyboardType="number-pad"
              editable={!saving}
            />
          </View>

          {/* Lifestyle */}
          <SectionHeader title="Lifestyle" />

          <RadioGroup
            label="Activity Level"
            options={[
              { value: 'sedentary', label: 'Sedentary' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'active', label: 'Active' },
            ]}
            selectedValue={activityLevel}
            onSelect={(val) => setActivityLevel(val as any)}
          />

          <View style={styles.fieldGroup}>
            <Text variant="label" color="secondary" style={styles.fieldLabel}>
              Sleep Hours
            </Text>
            <Input
              placeholder="Enter sleep hours"
              value={sleepHours}
              onChangeText={setSleepHours}
              keyboardType="decimal-pad"
              editable={!saving}
            />
          </View>

          <RadioGroup
            label="Diet Type"
            options={[
              { value: 'veg', label: 'Vegetarian' },
              { value: 'non_veg', label: 'Non-Vegetarian' },
              { value: 'vegan', label: 'Vegan' },
            ]}
            selectedValue={dietType}
            onSelect={(val) => setDietType(val as any)}
          />

          <View style={styles.fieldGroup}>
            <Text variant="label" color="secondary" style={styles.fieldLabel}>
              Eating Window Start (HH:MM)
            </Text>
            <Input
              placeholder="08:00"
              value={eatingWindowStart}
              onChangeText={setEatingWindowStart}
              editable={!saving}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="label" color="secondary" style={styles.fieldLabel}>
              Eating Window End (HH:MM)
            </Text>
            <Input
              placeholder="20:00"
              value={eatingWindowEnd}
              onChangeText={setEatingWindowEnd}
              editable={!saving}
            />
          </View>

          {/* Medical Context */}
          <SectionHeader title="Medical Context" />

          <ChipSelector
            label="Conditions"
            options={CONDITIONS_OPTIONS}
            selectedValues={conditions}
            onToggle={(value) => {
              setConditions((prev) =>
                prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
              );
            }}
          />

          <ChipSelector
            label="Allergies"
            options={ALLERGIES_OPTIONS}
            selectedValues={allergies}
            onToggle={(value) => {
              setAllergies((prev) =>
                prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]
              );
            }}
          />

          {/* Goals */}
          <SectionHeader title="Goals" />

          <RadioGroup
            label="Focus Area"
            options={[
              { value: 'sugar', label: 'Reduce Sugar' },
              { value: 'energy', label: 'Boost Energy' },
              { value: 'gut', label: 'Gut Health' },
              { value: 'weight', label: 'Weight Management' },
            ]}
            selectedValue={focusArea}
            onSelect={(val) => setFocusArea(val as any)}
          />

          <View style={styles.fieldGroup}>
            <Text variant="label" color="secondary" style={styles.fieldLabel}>
              Daily Water Intake (glasses)
            </Text>
            <Input
              placeholder="Enter glasses per day"
              value={waterIntake}
              onChangeText={setWaterIntake}
              keyboardType="number-pad"
              editable={!saving}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text variant="label" color="secondary" style={styles.fieldLabel}>
              Home Cooking Ratio (%)
            </Text>
            <Input
              placeholder="Enter 0-100"
              value={cookingRatio}
              onChangeText={setCookingRatio}
              keyboardType="number-pad"
              editable={!saving}
            />
          </View>

          {/* Spacing */}
          <View style={{ height: theme.spacing.xl }} />
        </ScrollView>

        {/* Footer with Buttons */}
        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={onClose}
            disabled={saving}
            size="medium"
            style={styles.cancelButton}
          />
          <Button
            title={saving ? 'Saving...' : 'Save'}
            onPress={handleSave}
            disabled={saving}
            size="medium"
            style={styles.saveButton}
          />
        </View>

          {/* Loading Overlay */}
          {saving && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={theme.colors.brand.primary} />
              <Text variant="body" style={styles.savingText}>
                Saving your data...
              </Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.main,
  },
  headerTitle: {
    color: theme.colors.text.primary,
  },
  closeButton: {
    color: theme.colors.brand.primary,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  sectionHeader: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  fieldGroup: {
    marginBottom: theme.spacing.lg,
  },
  fieldLabel: {
    marginBottom: theme.spacing.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.main,
  },
  radioContainer: {
    gap: theme.spacing.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioLabel: {
    color: theme.colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.main,
    backgroundColor: theme.colors.background.primary,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingText: {
    marginTop: theme.spacing.lg,
    color: theme.colors.brand.white,
    textAlign: 'center',
  },
});

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button, Container, Input } from '../../components';
import { theme } from '../../theme';

interface FirstLogScreenProps {
  onContinue: (data: {
    stool_type: number;
    energy_level: number;
    symptoms: Record<string, boolean>;
    meals: string[];
  }) => Promise<void>;
}

const STOOL_TYPES = [
  { type: 1, emoji: '●●●', label: 'Hard' },
  { type: 2, emoji: '●●●', label: 'Lumpy' },
  { type: 3, emoji: '●●●', label: 'Normal' },
  { type: 4, emoji: '▐▐▐', label: 'Normal' },
  { type: 5, emoji: 'o', label: 'Soft' },
  { type: 6, emoji: '▲▲▲', label: 'Loose' },
  { type: 7, emoji: '▬▬▬', label: 'Liquid' },
];

const SYMPTOMS = ['Bloating', 'Gas', 'Cramping', 'Urgency', 'Burning'];
const ENERGY_LEVELS = [
  { value: 1, emoji: '😴', label: 'Low' },
  { value: 5, emoji: '😐', label: 'Okay' },
  { value: 8, emoji: '🙂', label: 'Good' },
  { value: 10, emoji: '😊', label: 'Great' },
];

export default function FirstLogScreen({ onContinue }: FirstLogScreenProps) {
  const [selectedStoolType, setSelectedStoolType] = useState<number | null>(3);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(8);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, boolean>>({});
  const [mealInput, setMealInput] = useState('');
  const [meals, setMeals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => ({
      ...prev,
      [symptom]: !prev[symptom],
    }));
  };

  const addMeal = () => {
    if (mealInput.trim()) {
      setMeals([...meals, mealInput.trim()]);
      setMealInput('');
    }
  };

  const removeMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    if (selectedStoolType === null) {
      alert('Please select a stool type');
      return;
    }

    setLoading(true);
    try {
      await onContinue({
        stool_type: selectedStoolType,
        energy_level: selectedEnergy,
        symptoms: selectedSymptoms,
        meals,
      });
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setLoading(false);
    }
  };

  return (
    <Container scrollable variant="grouped">
      <Text variant="h3" style={styles.title}>
        Log Your First Entry
      </Text>
      <Text variant="body" color="secondary" style={styles.subtitle}>
        Takes 60 seconds! 💛
      </Text>

      {/* Stool Type Selection */}
      <Text variant="label" style={styles.sectionLabel}>
        Stool Type (Bristol Scale)
      </Text>
      <View style={styles.stoolTypesContainer}>
        {STOOL_TYPES.map((item) => (
          <TouchableOpacity
            key={item.type}
            style={[
              styles.stoolTypeButton,
              selectedStoolType === item.type && styles.stoolTypeButtonSelected,
            ]}
            onPress={() => setSelectedStoolType(item.type)}
            disabled={loading}
          >
            <Text variant="h4">{item.emoji}</Text>
            <Text variant="caption" style={styles.stoolTypeLabel}>
              Type {item.type}
            </Text>
            <Text variant="caption" color="secondary">
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Energy Level */}
      <Text variant="label" style={styles.sectionLabel}>
        Energy Level
      </Text>
      <View style={styles.energyContainer}>
        {ENERGY_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.value}
            style={[
              styles.energyButton,
              selectedEnergy === level.value && styles.energyButtonSelected,
            ]}
            onPress={() => setSelectedEnergy(level.value)}
            disabled={loading}
          >
            <Text variant="h3">{level.emoji}</Text>
            <Text variant="caption">{level.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Symptoms */}
      <Text variant="label" style={styles.sectionLabel}>
        Any Symptoms?
      </Text>
      <View style={styles.symptomsContainer}>
        {SYMPTOMS.map((symptom) => (
          <TouchableOpacity
            key={symptom}
            style={[
              styles.symptomButton,
              selectedSymptoms[symptom] && styles.symptomButtonSelected,
            ]}
            onPress={() => toggleSymptom(symptom)}
            disabled={loading}
          >
            <Text
              variant="body"
              color={selectedSymptoms[symptom] ? 'primary' : 'secondary'}
            >
              {symptom}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Meals */}
      <Text variant="label" style={styles.sectionLabel}>
        What did you eat?
      </Text>
      <View style={styles.mealInputContainer}>
        <Input
          placeholder="e.g., Pizza, Coffee"
          value={mealInput}
          onChangeText={setMealInput}
          editable={!loading}
        />
        <Button
          title="+ Add"
          onPress={addMeal}
          variant="secondary"
          size="small"
          disabled={loading}
        />
      </View>

      {/* Added Meals */}
      {meals.length > 0 && (
        <View style={styles.mealsListContainer}>
          {meals.map((meal, index) => (
            <View key={index} style={styles.mealTag}>
              <Text variant="body">{meal}</Text>
              <TouchableOpacity
                onPress={() => removeMeal(index)}
                disabled={loading}
              >
                <Text style={styles.removeButton}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Continue Button */}
      <Button
        title={loading ? 'Saving...' : 'Save Entry'}
        onPress={handleContinue}
        variant="primary"
        size="large"
        fullWidth
        disabled={loading}
        style={styles.button}
      />

      {loading && <ActivityIndicator size="large" color={theme.colors.brand.primary} />}
    </Container>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  subtitle: {
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  stoolTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  stoolTypeButton: {
    flex: 1,
    minWidth: '30%',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stoolTypeButtonSelected: {
    backgroundColor: theme.colors.brand.primary + '20',
    borderColor: theme.colors.brand.primary,
  },
  stoolTypeLabel: {
    marginTop: theme.spacing.xs,
    color: theme.colors.text.secondary,
  },
  energyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  energyButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  energyButtonSelected: {
    backgroundColor: theme.colors.brand.primary + '20',
    borderColor: theme.colors.brand.primary,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  symptomButton: {
    flex: 1,
    minWidth: '45%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  symptomButtonSelected: {
    backgroundColor: theme.colors.brand.primary + '20',
    borderColor: theme.colors.brand.primary,
  },
  mealInputContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  mealsListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  mealTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.brand.primary + '20',
    borderRadius: theme.spacing.md,
  },
  removeButton: {
    fontSize: 16,
    color: theme.colors.brand.primary,
  },
  button: {
    marginTop: theme.spacing.lg,
  },
});

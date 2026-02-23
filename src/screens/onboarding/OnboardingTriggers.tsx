import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingLayout } from './OnboardingLayout';
import { theme } from '../../theme/theme';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Input } from '../../components/Input';
import { Icon } from '../../components/Icon';
import { SelectionCard } from '../../components/SelectionCard';
import { useAppStore } from '../../store/useAppStore';

// Suggested triggers by condition/symptom
const SUGGESTED_TRIGGERS: Record<string, string[]> = {
  'IBS-D': ['Garlic', 'Onion', 'Dairy', 'Caffeine', 'Spicy foods', 'Beans', 'Alcohol'],
  'IBS-C': ['Red meat', 'Processed foods', 'White bread', 'Bananas', 'Dairy'],
  'IBS-M': ['Garlic', 'Onion', 'Gluten', 'Dairy', 'Artificial sweeteners'],
  GERD: ['Coffee', 'Alcohol', 'Citrus', 'Tomatoes', 'Chocolate', 'Spicy foods'],
  'Celiac Disease': ['Gluten', 'Wheat', 'Barley', 'Rye', 'Oats'],
  "Crohn's Disease": ['Dairy', 'High-fiber foods', 'Alcohol', 'Spicy foods', 'Raw vegetables'],
  default: ['Garlic', 'Onion', 'Dairy', 'Gluten', 'Caffeine', 'Alcohol', 'Spicy foods'],
};

function getSuggestions(condition: string): string[] {
  for (const key of Object.keys(SUGGESTED_TRIGGERS)) {
    if (condition.includes(key)) return SUGGESTED_TRIGGERS[key];
  }
  return SUGGESTED_TRIGGERS.default;
}

export const OnboardingTriggers: React.FC = () => {
  const navigation = useNavigation<any>();
  const answers = useAppStore((s) => s.onboardingAnswers);
  const updateOnboardingAnswers = useAppStore((s) => s.updateOnboardingAnswers);

  const suggested = getSuggestions(answers.condition ?? '');
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');

  const toggleSuggested = (trigger: string) => {
    setSelected((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]
    );
  };

  const addCustom = () => {
    const trimmed = inputText.trim();
    if (trimmed && !custom.includes(trimmed) && !suggested.includes(trimmed)) {
      setCustom((prev) => [...prev, trimmed]);
      setInputText('');
    }
  };

  const removeCustom = (trigger: string) => {
    setCustom((prev) => prev.filter((t) => t !== trigger));
  };

  const handleNext = () => {
    const allTriggers = [...selected, ...custom];
    updateOnboardingAnswers({ knownTriggers: allTriggers });
    navigation.navigate('OnboardingHowItHelps');
  };

  return (
    <OnboardingLayout
      step={6}
      scroll
      icon="warning"
      title="Common Problem Foods"
      subtitle="Based on your profile, these often cause issues. Select any you suspect."
    >
      <View style={styles.container}>
        {/* Suggested */}
        <View style={styles.section}>
          <Text variant="label" color={theme.colors.textTertiary} style={styles.sectionLabel}>
            Suggested Triggers
          </Text>
          <View style={styles.list}>
            {suggested.map((trigger) => (
              <SelectionCard
                key={trigger}
                title={trigger}
                selected={selected.includes(trigger)}
                onPress={() => toggleSuggested(trigger)}
              />
            ))}
          </View>
        </View>

        {/* Custom triggers still use chips for compact display since they are added by user */}
        {custom.length > 0 && (
          <View style={styles.section}>
            <Text variant="label" color={theme.colors.textTertiary} style={styles.sectionLabel}>
              Your added triggers
            </Text>
            <View style={styles.chips}>
              {custom.map((trigger) => (
                <Chip
                  key={trigger}
                  label={trigger}
                  variant="dismissible"
                  size="md"
                  onDismiss={() => removeCustom(trigger)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Add custom input */}
        <View style={styles.addSection}>
          <Input
            placeholder="Add your own trigger food..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={addCustom}
            returnKeyType="done"
            rightIcon={
              <TouchableOpacity onPress={addCustom} disabled={!inputText.trim()} hitSlop={8}>
                <Icon
                  name="Plus"
                  size={20}
                  color={inputText.trim() ? theme.colors.primary : theme.colors.textTertiary}
                />
              </TouchableOpacity>
            }
          />
        </View>

        <View style={styles.footer}>
          <Button variant="primary" size="lg" onPress={handleNext} fullWidth>
            Next
          </Button>
          <Button variant="ghost" size="md" onPress={handleNext}>
            Skip for now
          </Button>
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.xl,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionLabel: {
    fontFamily: theme.fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  list: {
    gap: theme.spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  addSection: {},
  footer: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
    alignItems: 'center',
  },
});

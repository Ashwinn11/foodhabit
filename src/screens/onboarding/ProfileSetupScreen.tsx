import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button, Input, Container } from '../../components';
import { theme } from '../../theme';

interface ProfileSetupScreenProps {
  onContinue: (data: {
    name: string;
    condition: string;
    main_issue: string;
  }) => Promise<void>;
}

const CONDITIONS = ['IBS', "Crohn's", 'Colitis', 'Celiac', 'GERD', 'General'];
const MAIN_ISSUES = ['Bloating', 'Cramping', 'Diarrhea', 'Constipation', 'Energy', 'Multiple'];

export default function ProfileSetupScreen({ onContinue }: ProfileSetupScreenProps) {
  const [name, setName] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!name.trim() || !selectedCondition || !selectedIssue) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await onContinue({
        name: name.trim(),
        condition: selectedCondition,
        main_issue: selectedIssue,
      });
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setLoading(false);
    }
  };

  return (
    <Container scrollable variant="grouped">
      <Text variant="h2" style={styles.title}>
        Let's Set You Up
      </Text>

      {/* Name Input */}
      <Text variant="label" style={styles.sectionLabel}>
        Your Name
      </Text>
      <Input
        placeholder="John Doe"
        value={name}
        onChangeText={setName}
        editable={!loading}
      />

      {/* Condition Selection */}
      <Text variant="label" style={styles.sectionLabel}>
        What's your condition?
      </Text>
      <View style={styles.optionsContainer}>
        {CONDITIONS.map((condition) => (
          <TouchableOpacity
            key={condition}
            style={[
              styles.optionButton,
              selectedCondition === condition && styles.optionButtonSelected,
            ]}
            onPress={() => setSelectedCondition(condition)}
            disabled={loading}
          >
            <Text
              variant="body"
              color={selectedCondition === condition ? 'primary' : 'secondary'}
            >
              {condition}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Issue Selection */}
      <Text variant="label" style={styles.sectionLabel}>
        What's your main issue?
      </Text>
      <View style={styles.optionsContainer}>
        {MAIN_ISSUES.map((issue) => (
          <TouchableOpacity
            key={issue}
            style={[
              styles.optionButton,
              selectedIssue === issue && styles.optionButtonSelected,
            ]}
            onPress={() => setSelectedIssue(issue)}
            disabled={loading}
          >
            <Text
              variant="body"
              color={selectedIssue === issue ? 'primary' : 'secondary'}
            >
              {issue}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Continue Button */}
      <Button
        title={loading ? 'Setting up...' : 'Continue'}
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
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
  },
  sectionLabel: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    alignContent: 'flex-start',
  },
  optionButton: {
    width: '47%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: theme.colors.brand.primary + '20',
    borderColor: theme.colors.brand.primary,
  },
  button: {
    marginTop: theme.spacing.xl,
  },
});

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Input, Container } from '../../components';
import { theme, haptics } from '../../theme';
import { APP_TEXTS } from '../../constants/appText';

interface OnboardingProfileScreenProps {
  onContinue: (data: {
    name: string;
    condition: string;
    main_issue: string;
  }) => Promise<void>;
  onBack: () => void;
}

const CONDITIONS = APP_TEXTS.conditions;
const MAIN_ISSUES = APP_TEXTS.mainIssues;

export default function OnboardingProfileScreen({
  onContinue,
  onBack,
}: OnboardingProfileScreenProps) {
  const [name, setName] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canContinue = name.trim() && selectedCondition && selectedIssue;

  const handleContinue = async () => {
    if (!canContinue) return;

    setLoading(true);
    try {
      haptics.patterns.buttonPress();
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
    <View style={styles.container}>
      <Container
        scrollable
        variant="plain"
        keyboardAvoiding
        edges={['top', 'left', 'right']}
        padding={false}
      >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            haptics.patterns.buttonPress();
            onBack();
          }}
          disabled={loading}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text variant="largeTitle" style={styles.title}>
        {APP_TEXTS.onboardingProfile.title}
      </Text>
      <Text variant="body" style={styles.subtitle} color="secondary">
        {APP_TEXTS.onboardingProfile.subtitle}
      </Text>

      {/* Name Input */}
      <View style={styles.section}>
        <Text variant="headline" style={styles.sectionLabel}>
          {APP_TEXTS.onboardingProfile.nameLabel}
        </Text>
        <Input
          placeholder={APP_TEXTS.onboardingProfile.namePlaceholder}
          value={name}
          onChangeText={setName}
          editable={!loading}
          placeholderTextColor={theme.colors.text.tertiary}
          style={styles.input}
        />
      </View>

      {/* Condition Selection */}
      <View style={styles.section}>
        <Text variant="headline" style={styles.sectionLabel}>
          {APP_TEXTS.onboardingProfile.conditionLabel}
        </Text>
        <View style={styles.gridContainer}>
          {CONDITIONS.map((condition) => (
            <TouchableOpacity
              key={condition.id}
              style={[
                styles.gridItem,
                selectedCondition === condition.id &&
                  styles.gridItemSelected,
              ]}
              onPress={() => {
                haptics.patterns.buttonPress();
                setSelectedCondition(condition.id);
              }}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text
                variant="body"
                style={[
                  styles.gridItemText,
                  {
                    color:
                      selectedCondition === condition.id
                        ? theme.colors.brand.primary
                        : theme.colors.text.primary,
                  },
                ]}
              >
                {condition.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Issue Selection */}
      <View style={styles.section}>
        <Text variant="headline" style={styles.sectionLabel}>
          {APP_TEXTS.onboardingProfile.issueLabel}
        </Text>
        <View style={styles.gridContainer}>
          {MAIN_ISSUES.map((issue) => (
            <TouchableOpacity
              key={issue.id}
              style={[
                styles.gridItem,
                selectedIssue === issue.id && styles.gridItemSelected,
              ]}
              onPress={() => {
                haptics.patterns.buttonPress();
                setSelectedIssue(issue.id);
              }}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text
                variant="body"
                style={[
                  styles.gridItemText,
                  {
                    color:
                      selectedIssue === issue.id
                        ? theme.colors.brand.primary
                        : theme.colors.text.primary,
                  },
                ]}
              >
                {issue.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      </Container>

      {/* Continue Button - Fixed Footer */}
      <View style={styles.footer}>
        <Button
          title={loading ? 'Setting up...' : APP_TEXTS.onboardingProfile.continueButton}
          onPress={handleContinue}
          variant="primary"
          size="large"
          fullWidth
          disabled={!canContinue || loading}
        />

        {loading && (
          <ActivityIndicator
            size="large"
            color={theme.colors.brand.primary}
            style={{ marginTop: theme.spacing.lg }}
          />
        )}
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
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing['2xl'],
    marginTop: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing['2xl'],
    fontWeight: '700',
  },
  subtitle: {
    marginBottom: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing['2xl'],
  },
  section: {
    marginBottom: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing['2xl'],
  },
  sectionLabel: {
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
  },
  gridItem: {
    flex: 1,
    minWidth: '45%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.spacing.lg,
    // Removed transparency/border, solid background
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60,
  },
  gridItemText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  gridItemSelected: {
    backgroundColor: theme.colors.background.card,
    borderColor: theme.colors.brand.primary,
    borderWidth: 1,
  },
  footer: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
});
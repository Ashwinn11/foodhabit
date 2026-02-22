import React from 'react';
import { StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { theme } from '../theme/theme';

export const PrivacyPolicyScreen = () => {
  return (
    <Screen padding={true} scroll={true}>
      <Text variant="title" style={styles.title}>
        Privacy Policy
      </Text>
      
      <Text variant="body" style={styles.text}>
        Your data is stored securely. GutBuddy does not sell your personal data to third parties. We use your gut logging purely to identify your personal triggers and feed your personalized AI model.
      </Text>

      <Text variant="label" style={styles.sectionHeading}>
        1. Data Collection
      </Text>
      <Text variant="body" style={styles.text}>
        We collect your onboarding answers, your gut moments, and your foods scanned. This data is required to provide the core personalized experience.
      </Text>

      <Text variant="label" style={styles.sectionHeading}>
        2. Firebase Analytics
      </Text>
      <Text variant="body" style={styles.text}>
        We use Firebase to understand app usage. This tracking stringently strips personally identifiable markers.
      </Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: theme.spacing.xxxl,
    marginTop: theme.spacing.lg,
  },
  sectionHeading: {
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  text: {
    color: theme.colors.textSecondary,
    lineHeight: 24,
  }
});

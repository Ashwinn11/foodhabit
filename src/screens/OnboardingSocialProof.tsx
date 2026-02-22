import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { theme } from '../theme/theme';

export const OnboardingSocialProof = ({ navigation }: any) => {

  const handleContinue = () => {
    navigation.navigate('OnboardingCustomPlan');
  };

  return (
    <Screen padding={true}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: '85%' }]} />
        </View>
        <Text variant="caption" style={styles.step}>6 of 7</Text>
      </View>

      <Card elevated={true} style={styles.reviewCard}>
        <Text variant="title" style={styles.stars}>⭐⭐⭐⭐⭐</Text>
        <Text variant="body" style={styles.quote}>
          "Finally know what causes my bloating. Game changer. My doctor couldn't even figure this out."
        </Text>
        <Text variant="caption" style={styles.author}>— Sarah M., IBS-D</Text>
      </Card>

      <View style={styles.divider} />

      <View style={styles.featuresList}>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>📷</Text>
          <Text variant="body" style={styles.featureText}>Scan any food or menu instantly</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>🎯</Text>
          <Text variant="body" style={styles.featureText}>Detect your hidden triggers</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>✅</Text>
          <Text variant="body" style={styles.featureText}>Eat safely, every single time</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          label="Continue →" 
          onPress={handleContinue} 
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.giant,
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.full,
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.coral,
    borderRadius: theme.radii.full,
  },
  step: {
    color: theme.colors.textSecondary,
  },
  reviewCard: {
    marginBottom: theme.spacing.xxxl,
    backgroundColor: theme.colors.surfaceHigh,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  stars: {
    marginBottom: theme.spacing.md,
    fontSize: 20,
  },
  quote: {
    color: theme.colors.textPrimary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.md,
  },
  author: {
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.xxxl,
  },
  featuresList: {
    flex: 1,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: theme.spacing.lg,
  },
  featureText: {
    color: theme.colors.textPrimary,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: theme.spacing.xl,
  },
});

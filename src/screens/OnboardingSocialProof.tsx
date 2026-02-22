import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { theme } from '../theme/theme';

export const OnboardingSocialProof = ({ navigation }: any) => (
  <Screen padding={true}>
    <View style={styles.progressRow}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: '85%' }]} />
      </View>
      <Text variant="caption" style={styles.stepText}>6 of 7</Text>
    </View>

    {/* Stars */}
    <View style={styles.stars}>
      {[0,1,2,3,4].map(i => <Icon key={i} name="star" size={22} />)}
    </View>

    {/* Quote */}
    <Card elevated style={styles.quoteCard}>
      <Text variant="body" style={styles.quote}>
        "Finally know what causes my bloating. Game changer. My doctor couldn't even figure this out."
      </Text>
      <Text variant="caption" style={styles.author}>— Sarah M., IBS-D</Text>
    </Card>

    <View style={styles.divider} />

    {/* Features */}
    <View style={styles.features}>
      <View style={styles.featureRow}>
        <Icon name="camera" size={32} />
        <Text variant="body" style={styles.featureText}>Scan any food or menu</Text>
      </View>
      <View style={styles.featureRow}>
        <Icon name="triggers" size={32} />
        <Text variant="body" style={styles.featureText}>Detect your triggers</Text>
      </View>
      <View style={styles.featureRow}>
        <Icon name="check" size={32} />
        <Text variant="body" style={styles.featureText}>Eat safely, every time</Text>
      </View>
    </View>

    <View style={styles.footer}>
      <Button label="Continue →" onPress={() => navigation.navigate('OnboardingCustomPlan')} />
    </View>
  </Screen>
);

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.full,
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.coral,
    borderRadius: theme.radii.full,
  },
  stepText: { color: theme.colors.textSecondary },
  stars: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  quoteCard: {
    marginBottom: theme.spacing.xxxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quote: {
    color: theme.colors.textPrimary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.md,
    lineHeight: 26,
  },
  author: { color: theme.colors.textSecondary },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.xxxl,
  },
  features: { flex: 1, gap: theme.spacing.xxl },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  featureText: { color: theme.colors.textPrimary },
  footer: { paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.sm },
});

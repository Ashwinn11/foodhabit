import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Gigi } from '../../components';
import { theme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface PaywallStepProps {
  onComplete: () => void;
}

export const PaywallStep: React.FC<PaywallStepProps> = ({ onComplete }) => {
  const handleSubscribe = () => {
    // Fake purchase logic
    Alert.alert('Welcome Aboard!', 'Premium features unlocked.', [
      { text: 'Start Journey', onPress: onComplete }
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Gigi emotion="excited" size="lg" />
          <Text variant="title1" style={styles.title}>
            Unlock Full Potential
          </Text>
          <Text variant="body" style={styles.subtitle}>
            Get personalized insights and unlimited scans.
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem icon="infinite" text="Unlimited Food Scans" />
          <FeatureItem icon="stats-chart" text="Detailed Nutrient Breakdown" />
          <FeatureItem icon="medical" text="Trigger Identification" />
          <FeatureItem icon="chatbubbles" text="Chat with Gigi" />
        </View>

        <View style={styles.pricingCard}>
          <Text variant="title3" weight="bold" style={styles.price}>
            $4.99 <Text variant="body" style={styles.period}>/ month</Text>
          </Text>
          <Text variant="caption1" style={styles.trialText}>
            7-day free trial, cancel anytime.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Start Free Trial" 
          onPress={handleSubscribe} 
          variant="primary" 
          size="large" 
          fullWidth 
        />
        <Button 
          title="Restore Purchases" 
          onPress={() => {}} 
          variant="ghost" 
          size="small"
          style={{ marginTop: 8 }}
        />
      </View>
    </View>
  );
};

function FeatureItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={20} color={theme.colors.brand.coral} />
      </View>
      <Text variant="body" style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 100,
  },
  hero: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    color: theme.colors.text.white,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  features: {
    gap: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 118, 100, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  featureText: {
    color: theme.colors.text.white,
    fontWeight: '600',
  },
  pricingCard: {
    alignItems: 'center',
    marginTop: theme.spacing['2xl'],
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.brand.coral,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  price: {
    color: theme.colors.text.white,
  },
  period: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  trialText: {
    color: theme.colors.brand.coral,
    marginTop: theme.spacing.xs,
    fontWeight: 'bold',
  },
  footer: {
    padding: theme.spacing.xl,
    paddingBottom: 40,
  },
});

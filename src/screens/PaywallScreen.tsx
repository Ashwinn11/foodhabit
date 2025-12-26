import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Gigi } from '../components';
import { theme } from '../theme';

export default function PaywallScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const handleSubscribe = () => {
    // Fake purchase intent for MVP
    console.log('Purchase intent logged');
    Alert.alert('Coming Soon', 'Premium features are coming soon!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color={theme.colors.text.white} />
        </TouchableOpacity>

        {/* Hero Section */}
        <View style={styles.hero}>
          <Gigi emotion="excited" size="md" />
          <Text variant="title1" style={styles.title}>
            Unlock Full Potential
          </Text>
          <Text variant="body" style={styles.subtitle}>
            Get personalized insights and unlimited scans to master your gut health.
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.features}>
          <FeatureItem icon="infinite" text="Unlimited Food Scans" />
          <FeatureItem icon="stats-chart" text="Detailed Nutrient Breakdown" />
          <FeatureItem icon="medical" text="Personalized Trigger Warnings" />
          <FeatureItem icon="heart" text="Support & Chat with Gigi" />
        </View>

        {/* Pricing */}
        <View style={styles.pricingCard}>
          <Text variant="title3" weight="bold" style={styles.price}>
            $4.99 <Text variant="body" style={styles.period}>/ month</Text>
          </Text>
          <Text variant="caption1" style={styles.trialText}>
            7-day free trial, cancel anytime.
          </Text>
        </View>

      </ScrollView>

      {/* Footer Action */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Button 
          title="Start Free Trial" 
          onPress={handleSubscribe} 
          variant="primary" 
          size="large" 
          fullWidth 
        />
        <TouchableOpacity onPress={handleClose} style={styles.restoreButton}>
          <Text variant="caption1" style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={20} color={theme.colors.brand.coral} />
      </View>
      <Text variant="body" weight="medium" style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.brand.background,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 120,
  },
  closeButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    color: theme.colors.text.white,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: theme.spacing.md,
    color: theme.colors.brand.cream,
    paddingHorizontal: theme.spacing.lg,
    opacity: 0.8,
  },
  features: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  featureText: {
    color: theme.colors.text.white,
  },
  pricingCard: {
    alignItems: 'center',
    marginTop: theme.spacing['2xl'],
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.brand.coral,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  price: {
    color: theme.colors.text.white,
  },
  period: {
    color: theme.colors.brand.cream,
    opacity: 0.7,
  },
  trialText: {
    color: theme.colors.brand.coral,
    marginTop: theme.spacing.xs,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.brand.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: theme.spacing.lg,
  },
  restoreButton: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  restoreText: {
    color: theme.colors.brand.cream,
    opacity: 0.5,
  },
});

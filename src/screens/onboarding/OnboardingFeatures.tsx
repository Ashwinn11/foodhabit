import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { OnboardingLayout } from './OnboardingLayout';
import { theme } from '../../theme/theme';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';

const FEATURES = [
  {
    icon: 'Camera' as const,
    title: 'Menu Scanner',
    description: 'Aim. Capture. Know instantly what\'s safe to order.',
    color: theme.colors.primary,
  },
  {
    icon: 'ShieldCheck' as const,
    title: 'Safety Scores',
    description: 'Every dish rated: Safe, Caution, or Avoid. No guessing.',
    color: theme.colors.safe,
  },
  {
    icon: 'CalendarDays' as const,
    title: 'Gut Journal',
    description: 'Log meals and feelings. We find the patterns you miss.',
    color: theme.colors.caution,
  },
  {
    icon: 'Target' as const,
    title: 'Trigger Discovery',
    description: 'Your personal trigger foods, learned over time.',
    color: theme.colors.danger,
  },
];

const AnimatedFeature: React.FC<{
  feature: typeof FEATURES[number];
  index: number;
}> = ({ feature, index }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    const delay = index * 200;
    opacity.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.feature, animStyle]}>
      <View style={[styles.featureIcon, { backgroundColor: `${feature.color}18` }]}>
        <Icon name={feature.icon} size={24} color={feature.color} />
      </View>
      <View style={styles.featureText}>
        <Text variant="h3">{feature.title}</Text>
        <Text variant="bodySmall" color={theme.colors.textSecondary} style={styles.featureDesc}>
          {feature.description}
        </Text>
      </View>
    </Animated.View>
  );
};

export const OnboardingFeatures: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <OnboardingLayout step={9} scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h1">Everything your gut needs, in one place</Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((feature, i) => (
            <AnimatedFeature key={i} feature={feature} index={i} />
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            variant="primary"
            size="lg"
            onPress={() => navigation.navigate('OnboardingCustomPlan')}
            fullWidth
          >
            Build My Plan
          </Button>
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.xl,
  },
  header: {
    gap: theme.spacing.sm,
  },
  features: {
    gap: theme.spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    gap: 4,
    paddingTop: 4,
  },
  featureDesc: {
    lineHeight: 20,
  },
  footer: {
    paddingBottom: theme.spacing.xl,
    marginTop: 'auto',
  },
});

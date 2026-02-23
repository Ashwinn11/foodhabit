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
import { Card } from '../../components/Card';
import { LucideIconName } from '../../components/Icon';
import { IconContainer } from '../../components/IconContainer';

const FEATURES = [
  {
    icon: 'Search' as LucideIconName,
    color: '#4D94FF',
    title: 'Menu Scanner',
    description: 'Aim. Capture. Know what\'s safe to order in seconds.',
  },
  {
    icon: 'CheckCircle' as LucideIconName,
    color: '#6DBE8C',
    title: 'Safety Scores',
    description: 'Safe, Caution, or Avoid — for every dish, personalized to you.',
  },
  {
    icon: 'Calendar' as LucideIconName,
    color: '#FF9D4D',
    title: 'Gut Journal',
    description: 'Log meals and symptoms. We find the connections you\'d never catch.',
  },
  {
    icon: 'Target' as LucideIconName,
    color: '#FF4D4D',
    title: 'Trigger Discovery',
    description: 'Your personal food triggers, learned from your own data over time.',
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
    <Animated.View style={animStyle}>
      <Card variant="glass" style={styles.card}>
        <IconContainer name={feature.icon} color={feature.color} variant="solid" size={44} iconSize={22} />
        <View style={styles.cardContent}>
          <Text variant="h3" style={styles.title}>{feature.title}</Text>
          <Text variant="bodySmall" color={theme.colors.textSecondary} style={styles.description}>
            {feature.description}
          </Text>
        </View>
      </Card>
    </Animated.View>
  );
};

export const OnboardingFeatures: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <OnboardingLayout
      step={9}
      scroll
      icon="avocado_success"
      title="Know exactly what to order."
      titleIcon="Sparkles"
      titleIconColor="#A855F7"
    >
      <View style={styles.container}>
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
    gap: theme.spacing.lg,
  },
  features: {
    gap: theme.spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: theme.fonts.bold,
  },
  description: {
    lineHeight: 18,
  },
  footer: {
    paddingBottom: theme.spacing.xl,
    marginTop: 'auto',
  },
});

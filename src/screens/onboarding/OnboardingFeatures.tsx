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
    icon: 'Camera' as LucideIconName,
    color: '#5AAF7B',
    title: 'Scan any menu',
    description: 'Point your camera at a restaurant menu — safe items light up instantly.',
  },
  {
    icon: 'PenLine' as LucideIconName,
    color: '#C98A45',
    title: 'Type any dish',
    description: 'Ordering delivery? Type the dish name and we\'ll tell you if it\'s safe.',
  },
  {
    icon: 'TrendingUp' as LucideIconName,
    color: '#4A84D4',
    title: 'Track & discover triggers',
    description: 'Log what you eat. We find patterns and uncover triggers you didn\'t know about.',
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
      step={6}
      scroll
      icon="avocado_success"
      title="Here's how you'll use it"
      subtitle="Three powerful ways to know what's safe for you."
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
            onPress={() => navigation.navigate('OnboardingReviews')}
            fullWidth
          >
            Continue
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

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { OnboardingLayout } from './OnboardingLayout';
import { theme } from '../../theme/theme';
import { Text } from '../../components/Text';
import { Icon } from '../../components/Icon';
import { Icon3D } from '../../components/Icon3D';
import { useAppStore } from '../../store/useAppStore';

interface CheckItem {
  label: string;
  delay: number;
}

const AnimatedCheckItem: React.FC<{ item: CheckItem }> = ({ item }) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(
      item.delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );
    translateX.value = withDelay(
      item.delay,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.checkItem, animStyle]}>
      <View style={styles.checkIcon}>
        <Icon name="Check" size={14} color={theme.colors.primaryForeground} strokeWidth={2.5} />
      </View>
      <Text variant="body" color={theme.colors.textSecondary}>
        {item.label}
      </Text>
    </Animated.View>
  );
};

export const OnboardingAnalyzing: React.FC = () => {
  const navigation = useNavigation<any>();
  const answers = useAppStore((s) => s.onboardingAnswers);

  const conditionLabel = answers.condition || 'your condition';
  const symptomCount = answers.symptoms?.length ?? 0;

  const items: CheckItem[] = [
    { label: `Condition: ${conditionLabel} noted`, delay: 300 },
    { label: `${symptomCount} symptom${symptomCount !== 1 ? 's' : ''} mapped`, delay: 900 },
    { label: 'Searching our food database...', delay: 1500 },
    { label: 'Building your gut profile...', delay: 2100 },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('OnboardingTriggers');
    }, 3800);
    return () => clearTimeout(timer);
  }, []);

  const personalizedMessage = answers.condition?.includes('IBS')
    ? 'IBS affects 1 in 10 adults. We\'ve helped thousands find relief.'
    : 'Gut health affects millions. You\'re in the right place.';

  return (
    <OnboardingLayout step={5} showBack={false}>
      <View style={styles.container}>
        <View style={styles.iconSection}>
          <Icon3D name="thought_balloon" size={80} animated animationType="float" />
        </View>

        <View style={styles.textSection}>
          <Text variant="h2" align="center">
            Analyzing your profile...
          </Text>
          <Text
            variant="body"
            color={theme.colors.textSecondary}
            align="center"
            style={styles.sub}
          >
            {personalizedMessage}
          </Text>
        </View>

        <View style={styles.checklist}>
          {items.map((item, i) => (
            <AnimatedCheckItem key={i} item={item} />
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  iconSection: {
    alignItems: 'center',
  },
  textSection: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  sub: {
    maxWidth: 280,
    textAlign: 'center',
  },
  checklist: {
    width: '100%',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

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
        <Icon name="Check" size={14} color={theme.colors.primaryForeground} strokeWidth={3} />
      </View>
      <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }}>
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
    <OnboardingLayout 
      step={5} 
      showBack={false}
      icon="avocado_detective"
      title="Analyzing your profile..."
      titleIcon="Search"
      titleIconColor="#4D94FF"
      subtitle={personalizedMessage}
    >
      <View style={styles.container}>
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
    gap: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  checklist: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: theme.spacing.md,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

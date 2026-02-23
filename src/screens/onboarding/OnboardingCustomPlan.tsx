import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { OnboardingLayout } from './OnboardingLayout';
import { theme } from '../../theme/theme';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { IconContainer } from '../../components/IconContainer';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../config/supabase';

const LOADING_MESSAGES = [
  'Mapping your condition profile...',
  'Identifying your food triggers...',
  'Finding foods safe for you...',
  'Finalizing your plan...',
];

export const OnboardingCustomPlan: React.FC = () => {
  const navigation = useNavigation<any>();
  const answers = useAppStore((s) => s.onboardingAnswers);
  const updateOnboardingAnswers = useAppStore((s) => s.updateOnboardingAnswers);
  const variant = useAppStore((s) => s.onboardingVariant) ?? 'A';

  const [phase, setPhase] = useState<'loading' | 'reveal'>('loading');
  const [messageIndex, setMessageIndex] = useState(0);
  const [safeFoods, setSafeFoods] = useState<string[]>([]);

  const progressWidth = useSharedValue(0);
  const revealOpacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(100, { duration: 3000, easing: Easing.out(Easing.ease) });

    rotate.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );

    const interval = setInterval(() => {
      setMessageIndex((prev) => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, 750);

    // Derive safe foods from Edge Function while the loader plays
    const deriveSafeFoods = async () => {
      try {
        const testFoods = [
          ...(answers.knownTriggers ?? []),
          'Rice', 'Chicken breast', 'Oatmeal', 'Banana', 'Eggs',
          'Carrots', 'Spinach', 'Salmon', 'Blueberries', 'Almonds',
        ];
        const { data } = await supabase.functions.invoke('analyze-food', {
          body: {
            foods: testFoods,
            userCondition: answers.condition ?? '',
            userSymptoms: (answers.symptoms ?? []).join(', '),
            userTriggers: (answers.knownTriggers ?? []).join(', '),
          },
        });
        const results: any[] = data?.results ?? [];
        const triggerCount = (answers.knownTriggers ?? []).length;

        // First N results map 1:1 to knownTriggers — use normalizedName to fix typos
        const normalizedTriggers = results
          .slice(0, triggerCount)
          .map((r: any) => r.normalizedName as string)
          .filter(Boolean);

        const safe: string[] = results
          .filter((r: any) => r.level === 'safe')
          .map((r: any) => r.normalizedName as string)
          .slice(0, 5);

        setSafeFoods(safe);
        updateOnboardingAnswers({
          safeFoods: safe,
          knownTriggers: normalizedTriggers.length ? normalizedTriggers : (answers.knownTriggers ?? []),
          avoidFoods: normalizedTriggers.length ? normalizedTriggers : (answers.knownTriggers ?? []),
          _sfDerived: true,
        } as any);
      } catch {
        // silent — show reveal without safe foods if API fails
      }
    };

    // Show reveal when both minimum display time AND API call are done
    let timerDone = false;
    let apiFired = false;

    const tryReveal = () => {
      if (timerDone && apiFired) {
        clearInterval(interval);
        setPhase('reveal');
        revealOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
      }
    };

    const minTimer = setTimeout(() => {
      timerDone = true;
      tryReveal();
    }, 3000);

    deriveSafeFoods().finally(() => {
      apiFired = true;
      tryReveal();
    });

    return () => {
      clearInterval(interval);
      clearTimeout(minTimer);
    };
  }, []);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const revealStyle = useAnimatedStyle(() => ({
    opacity: revealOpacity.value,
    transform: [{ translateY: (1 - revealOpacity.value) * 16 }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const conditionDisplay = answers.condition?.split(',')[0]?.trim() || 'your gut';
  const triggersDisplay = answers.knownTriggers?.slice(0, 3).join(', ') || 'None yet';
  const goalLabels: Record<string, string> = {
    bloating: 'Stop feeling bloated',
    triggers: 'Find my triggers',
    eating_out: 'Eat out safely',
    condition: 'Manage my condition',
  };
  const goalDisplay = goalLabels[answers.goal ?? ''] ?? answers.goal ?? 'Feel better';

  const layoutProps = phase === 'loading'
    ? {
        icon: "avocado_thinking" as const, // Consistent icon during loading
        title: "Building your plan...",
        subtitle: "Applying GutBuddy intelligence to your profile.",
      }
    : {
        icon: "avocado_success" as const,
        title: "Your gut plan is ready",
        titleIcon: "Sparkles" as const,
        titleIconColor: "#A855F7",
        subtitle: "Here's a preview of how we'll help you feel better.",
      };

  return (
    <OnboardingLayout step={10} showBack={false} scroll {...layoutProps}>
      <View style={styles.container}>
        {phase === 'loading' ? (
          <View style={styles.loadingSection}>
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, progressStyle]} />
              </View>
              <Text variant="bodySmall" color={theme.colors.textSecondary} align="center" style={styles.loadingText}>
                {LOADING_MESSAGES[messageIndex]}
              </Text>
            </View>
          </View>
        ) : (
          <Animated.View style={[styles.revealSection, revealStyle]}>
            <View style={styles.summaryCards}>
              <Card variant="bordered" style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <IconContainer name="Activity" size={40} iconSize={20} color="#4D94FF" />
                  <View style={styles.summaryText}>
                    <Text variant="caption" color={theme.colors.textTertiary}>Your condition</Text>
                    <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }}>
                      {conditionDisplay}
                    </Text>
                  </View>
                </View>
              </Card>

              <Card variant="bordered" style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <IconContainer name="AlertTriangle" size={40} iconSize={20} color="#E05D4C" />
                  <View style={styles.summaryText}>
                    <Text variant="caption" color={theme.colors.textTertiary}>Foods to watch</Text>
                    <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }} numberOfLines={1}>
                      {triggersDisplay}
                    </Text>
                  </View>
                </View>
              </Card>

              {safeFoods.length > 0 && (
                <Card variant="bordered" style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <IconContainer name="Leaf" size={40} iconSize={20} color="#6DBE8C" />
                    <View style={styles.summaryText}>
                      <Text variant="caption" color={theme.colors.textTertiary}>Safe to eat</Text>
                      <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }} numberOfLines={1}>
                        {safeFoods.join(', ')}
                      </Text>
                    </View>
                  </View>
                </Card>
              )}

              <Card variant="bordered" style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <IconContainer name="Target" size={40} iconSize={20} color="#FF9D4D" />
                  <View style={styles.summaryText}>
                    <Text variant="caption" color={theme.colors.textTertiary}>Your goal</Text>
                    <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }}>
                      {goalDisplay}
                    </Text>
                  </View>
                </View>
              </Card>
            </View>

            <Text
              variant="body"
              color={theme.colors.textSecondary}
              align="center"
              style={styles.motivational}
            >
              You're 3 days away from feeling the difference.
            </Text>

            <Button
              variant="primary"
              size="lg"
              // Variant B: show Reviews right before paywall for social proof
              onPress={() => navigation.navigate(variant === 'B' ? 'OnboardingReviews' : 'OnboardingPaywall')}
              fullWidth
              style={styles.cta}
            >
              Start My Free Trial
            </Button>
          </Animated.View>
        )}
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingSection: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  progressContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.borderSubtle,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
  },
  loadingText: {
    fontFamily: theme.fonts.medium,
    letterSpacing: 0.2,
  },
  revealSection: {
    gap: theme.spacing.lg,
  },
  summaryCards: {
    gap: theme.spacing.sm,
  },
  summaryCard: {
    padding: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  summaryText: {
    flex: 1,
    gap: 2,
  },
  motivational: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cta: {
    marginTop: theme.spacing.sm,
  },
});

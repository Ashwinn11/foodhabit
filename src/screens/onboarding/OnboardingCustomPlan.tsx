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
import { Icon } from '../../components/Icon';
import { Icon3D } from '../../components/Icon3D';
import { useAppStore } from '../../store/useAppStore';

const LOADING_MESSAGES = [
  'Mapping your condition profile...',
  'Identifying your food triggers...',
  'Calibrating your gut score...',
  'Finalizing your plan...',
];

export const OnboardingCustomPlan: React.FC = () => {
  const navigation = useNavigation<any>();
  const answers = useAppStore((s) => s.onboardingAnswers);

  const [phase, setPhase] = useState<'loading' | 'reveal'>('loading');
  const [messageIndex, setMessageIndex] = useState(0);

  const progressWidth = useSharedValue(0);
  const revealOpacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    // Animate progress bar 0 → 100% over 2s
    progressWidth.value = withTiming(100, { duration: 2000, easing: Easing.out(Easing.ease) });

    // Rotate sparkles icon
    rotate.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );

    // Cycle messages
    const interval = setInterval(() => {
      setMessageIndex((prev) => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, 500);

    // Transition to reveal after 2.2s
    const revealTimer = setTimeout(() => {
      clearInterval(interval);
      setPhase('reveal');
      revealOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(revealTimer);
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
  const triggersDisplay = answers.knownTriggers?.slice(0, 3).join(', ') || 'Not set yet';
  const goalLabels: Record<string, string> = {
    bloating: 'Stop feeling bloated',
    triggers: 'Find my triggers',
    eating_out: 'Eat out safely',
    condition: 'Manage my condition',
  };
  const goalDisplay = goalLabels[answers.goal ?? ''] ?? answers.goal ?? 'Feel better';

  return (
    <OnboardingLayout step={10} showBack={false}>
      <View style={styles.container}>
        {phase === 'loading' ? (
          <View style={styles.loadingSection}>
            <Animated.View style={sparkleStyle}>
              <Icon3D name="sparkles" size={64} />
            </Animated.View>

            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, progressStyle]} />
            </View>

            <Text
              variant="body"
              color={theme.colors.textSecondary}
              align="center"
            >
              {LOADING_MESSAGES[messageIndex]}
            </Text>
          </View>
        ) : (
          <Animated.View style={[styles.revealSection, revealStyle]}>
            <View style={styles.revealHeader}>
              <Text variant="h1" align="center">
                Your gut plan is ready
              </Text>
            </View>

            <View style={styles.summaryCards}>
              <Card variant="bordered" style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={[styles.summaryIcon, { backgroundColor: theme.colors.safeMuted }]}>
                    <Icon name="Activity" size={18} color={theme.colors.safe} />
                  </View>
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
                  <View style={[styles.summaryIcon, { backgroundColor: theme.colors.cautionMuted }]}>
                    <Icon name="AlertTriangle" size={18} color={theme.colors.caution} />
                  </View>
                  <View style={styles.summaryText}>
                    <Text variant="caption" color={theme.colors.textTertiary}>Foods to watch</Text>
                    <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }} numberOfLines={1}>
                      {triggersDisplay}
                    </Text>
                  </View>
                </View>
              </Card>

              <Card variant="bordered" style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={[styles.summaryIcon, { backgroundColor: theme.colors.primaryMuted }]}>
                    <Icon name="Target" size={18} color={theme.colors.primary} />
                  </View>
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
              onPress={() => navigation.navigate('OnboardingPaywall')}
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
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingSection: {
    alignItems: 'center',
    gap: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
  },
  revealSection: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  revealHeader: {
    alignItems: 'center',
    gap: theme.spacing.xs,
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
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
  FadeInDown, 
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { ScanLine, ArrowRight } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Card } from '../components/Card';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../config/supabase';

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const HomeScreen = ({ navigation }: any) => {
  const { onboardingAnswers } = useAppStore();
  const [firstName, setFirstName] = useState('');
  const scrollY = useSharedValue(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const full = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
      setFirstName(full.split(' ')[0]);
    });
  }, []);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const avoids = onboardingAnswers.avoidFoods?.length > 0
    ? onboardingAnswers.avoidFoods
    : onboardingAnswers.knownTriggers ?? [];

  const safePicks = onboardingAnswers.safeFoods ?? [];

  const conditionLabel: Record<string, string> = {
    ibs_d: 'IBS-D', ibs_c: 'IBS-C', bloating: 'Bloating', unsure: 'Gut Sensitivity',
  };
  const condition = conditionLabel[onboardingAnswers.condition] ?? '';

  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 80], [1, 0], Extrapolate.CLAMP),
      transform: [
        { translateY: interpolate(scrollY.value, [0, 80], [0, -10], Extrapolate.CLAMP) }
      ]
    };
  });

  return (
    <Screen padding={false} backgroundColor={theme.colors.background}>
      <Animated.ScrollView 
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <Animated.View style={[styles.header, headerStyle]}>
          <Text variant="caption" color={theme.colors.text.secondary}>
            {getTimeOfDay()}
          </Text>
          <Text variant="display" style={styles.name}>
            {firstName ? `${firstName}.` : 'Welcome.'}
          </Text>
          {condition ? (
            <View style={styles.conditionBadge}>
              <View style={styles.conditionDot} />
              <Text variant="bodySmall" color={theme.colors.text.secondary}>
                {condition} personalized profile
              </Text>
            </View>
          ) : null}
        </Animated.View>

        {/* Scan Food CTA Card - Standardized spacing */}
        <Animated.View entering={FadeInDown.delay(200).duration(800)}>
          <Card variant="glass" padding="none" style={styles.ctaCard} glow>
            <View style={styles.ctaContent}>
              <View style={styles.ctaTextContainer}>
                <Text variant="subtitle" color={theme.colors.primary} weight="bold">
                  Know your food.
                </Text>
                <Text variant="bodySmall" color={theme.colors.text.secondary} style={{ marginTop: 2 }}>
                  Scan to check if a meal is safe.
                </Text>
              </View>
              <Button
                label="Scan"
                onPress={() => navigation.navigate('ScanFood')}
                variant="primary"
                size="sm"
                leftIcon={<ScanLine color={theme.colors.text.inverse} size={16} strokeWidth={2.5} />}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Daily Safety Brief - Standardized spacing */}
        <View style={styles.sectionHeader}>
          <Text variant="label" color={theme.colors.text.tertiary}>Daily Safety Brief</Text>
        </View>

        <View style={styles.cardsContainer}>
          {/* AVOID Card */}
          <Animated.View entering={FadeInDown.delay(400).duration(800)}>
            <Card variant="surface" style={styles.briefCard}>
              <View style={styles.briefHeader}>
                <View style={[styles.statusDot, { backgroundColor: theme.colors.secondary }]} />
                <Text variant="caption" color={theme.colors.secondary} weight="bold">Avoid Today</Text>
              </View>
              
              {avoids.length > 0 ? (
                <View style={styles.chipContainer}>
                  {avoids.slice(0, 6).map((item: string, i: number) => (
                    <Chip
                      key={i}
                      status="risky"
                      label={item.charAt(0).toUpperCase() + item.slice(1)}
                    />
                  ))}
                  {avoids.length > 6 && (
                    <Text variant="caption" color={theme.colors.text.tertiary}>
                      +{avoids.length - 6} more
                    </Text>
                  )}
                </View>
              ) : (
                <Text variant="bodySmall" color={theme.colors.text.tertiary}>
                  No specific triggers identified yet.
                </Text>
              )}
            </Card>
          </Animated.View>

          {/* SAFE Card */}
          <Animated.View entering={FadeInDown.delay(600).duration(800)}>
            <Card variant="surface" style={styles.briefCard}>
              <View style={styles.briefHeader}>
                <View style={[styles.statusDot, { backgroundColor: theme.colors.primary }]} />
                <Text variant="caption" color={theme.colors.primary} weight="bold">Safe Choices</Text>
              </View>
              
              {safePicks.length > 0 ? (
                <View style={styles.chipContainer}>
                  {safePicks.slice(0, 6).map((item, i) => (
                    <Chip key={i} status="safe" label={item} />
                  ))}
                </View>
              ) : (
                <Text variant="bodySmall" color={theme.colors.text.tertiary}>
                  Scan food to discover what's safe for you.
                </Text>
              )}
            </Card>
          </Animated.View>
        </View>

        {/* Log Feeling Footer - Refined spacing */}
        <Animated.View entering={FadeInDown.delay(800).duration(800)} style={styles.footer}>
          <TouchableOpacity 
            style={styles.logFeeling}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('MyGut')}
          >
            <View style={styles.logFeelingContent}>
              <Text variant="body" color={theme.colors.text.secondary}>
                Feeling different? <Text variant="body" color={theme.colors.primary} weight="medium">Log your gut health</Text>
              </Text>
              <ArrowRight color={theme.colors.primary} size={18} strokeWidth={2} />
            </View>
          </TouchableOpacity>
        </Animated.View>

      </Animated.ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg, // Reduced drastically to fit closely to the bottom tab bar
  },
  header: {
    marginBottom: theme.spacing.xl, // Reduced from giant/xxxl
    marginTop: theme.spacing.md,
  },
  name: {
    marginTop: theme.spacing.xs,
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.secondary,
  },
  ctaCard: {
    marginBottom: theme.spacing.xxxl,
    overflow: 'hidden',
  },
  ctaContent: {
    padding: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaTextContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  sectionHeader: {
    marginBottom: theme.spacing.lg,
  },
  cardsContainer: {
    gap: theme.spacing.lg,
  },
  briefCard: {
    minHeight: 120,
  },
  briefHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  footer: {
    marginTop: theme.spacing.colossal,
  },
  logFeeling: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.xl,
    borderRadius: theme.radii.lg,
  },
  logFeelingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }
});

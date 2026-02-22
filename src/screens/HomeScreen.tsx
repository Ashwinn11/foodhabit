import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ScanLine } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const full = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
      setFirstName(full.split(' ')[0]);
    });
  }, []);

  // avoidFoods = AI-confirmed from results screen (new users)
  //              falls back to knownTriggers (existing users / skip flow)
  const avoids = onboardingAnswers.avoidFoods?.length > 0
    ? onboardingAnswers.avoidFoods
    : onboardingAnswers.knownTriggers ?? [];

  const safePicks = onboardingAnswers.safeFoods ?? [];

  const conditionLabel: Record<string, string> = {
    ibs_d: 'IBS-D', ibs_c: 'IBS-C', bloating: 'Bloating', unsure: 'Gut Sensitivity',
  };
  const condition = conditionLabel[onboardingAnswers.condition] ?? '';

  return (
    <Screen padding scroll>
      {/* Greeting */}
      <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.greetingBlock}>
        <Text variant="caption" style={styles.timeOfDay}>{getTimeOfDay()}</Text>
        <Text variant="hero" style={[styles.name, { lineHeight: 64 }]}>
          {firstName ? `${firstName}.` : 'Welcome.'}
        </Text>
        {condition ? (
          <View style={styles.conditionBadge}>
            <View style={styles.conditionDot} />
            <Text style={styles.conditionText}>{condition} · personalized profile active</Text>
          </View>
        ) : null}
      </Animated.View>

      {/* AVOID + SAFE wrapped in one card — the daily safety brief */}
      <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
        <View style={styles.safetyCard}>

          {/* AVOID section */}
          <View style={styles.safetySection}>
            <View style={styles.safetySectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: theme.colors.coral }]} />
              <Text variant="caption" style={[styles.sectionLabel, { color: theme.colors.coral }]}>
                AVOID TODAY
              </Text>
              {avoids.length > 0 && (
                <Text style={styles.triggerCount}>{avoids.length} triggers</Text>
              )}
            </View>
            {avoids.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                <View style={styles.chipRow}>
                  {avoids.map((item: string, i: number) => (
                    <Chip
                      key={i}
                      status="risky"
                      label={item.charAt(0).toUpperCase() + item.slice(1)}
                    />
                  ))}
                </View>
              </ScrollView>
            ) : (
              <Text style={styles.safeNote}>No triggers set — tap Scan Food to analyse a meal</Text>
            )}
          </View>

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* SAFE section */}
          <View style={styles.safetySection}>
            <View style={styles.safetySectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: theme.colors.lime }]} />
              <Text variant="caption" style={[styles.sectionLabel, { color: theme.colors.lime }]}>
                SAFE CHOICES
              </Text>
              <Text style={styles.safeNote}>based on your profile</Text>
            </View>
            {safePicks.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                <View style={styles.chipRow}>
                  {safePicks.map((item, i) => (
                    <Chip key={i} status="safe" label={item} />
                  ))}
                </View>
              </ScrollView>
            ) : (
              <Text style={styles.safeNote}>Scan food to discover what's safe for you</Text>
            )}
          </View>
        </View>
      </Animated.View>

      {/* Primary CTA — the whole point of the app */}
      <Animated.View entering={FadeIn.delay(400).duration(700)} style={styles.actions}>
        <Button
          label="Scan Food"
          onPress={() => navigation.navigate('ScanFood')}
          variant="primary"
          leftIcon={<ScanLine color={theme.colors.bg} size={20} strokeWidth={2} />}
        />

        <TouchableOpacity
          style={styles.logBtn}
          onPress={() => navigation.navigate('MyGut')}
        >
          <Text style={styles.logBtnText}>Log how I feel →</Text>
        </TouchableOpacity>
      </Animated.View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  greetingBlock: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  timeOfDay: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  name: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.coral,
  },
  conditionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  safetyCard: {
    backgroundColor: 'rgba(21, 25, 22, 0.45)', // very subtle, letting Pine bleed through
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: theme.spacing.xxxl,
    ...theme.shadows.minimal,
  },
  safetySection: {
    padding: theme.spacing.lg,
  },
  safetySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  sectionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  sectionLabel: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  triggerCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  safeNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  chipScroll: { marginHorizontal: -2 },
  chipRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: theme.spacing.lg,
  },
  actions: {
    paddingBottom: theme.spacing.xl,
  },
  logBtn: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
  },
  logBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

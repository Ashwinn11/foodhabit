import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';

const SCREEN_W  = Dimensions.get('window').width;
const TRACK_W   = SCREEN_W - theme.spacing.xl * 2 - 56; // minus padding + step label
const PROGRESS  = TRACK_W * 0.14;

const GOALS = [
  { id: 'triggers',   iconName: 'triggers',   color: theme.colors.amber, label: 'Identify my triggers',  sub: "Find what's secretly wrecking you" },
  { id: 'bloating',   iconName: 'bloating',   color: theme.colors.coral, label: 'Reduce bloating',       sub: 'End the daily discomfort' },
  { id: 'fear',       iconName: 'fear',        color: theme.colors.lime,  label: 'Eat without fear',      sub: 'Reclaim your social life' },
  { id: 'understand', iconName: 'understand', color: theme.colors.lime,  label: 'Understand my gut',     sub: "Know your body's signals" },
];

export const OnboardingGoal = ({ navigation }: any) => {
  const { updateOnboardingAnswers, onboardingAnswers } = useAppStore();
  const [selected, setSelected] = useState<string>(onboardingAnswers.goal || '');

  const progressAnim = useSharedValue(0);
  useEffect(() => { progressAnim.value = withTiming(PROGRESS, { duration: 500 }); }, []);
  const progressStyle = useAnimatedStyle(() => ({ width: progressAnim.value }));

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
  };

  const handleContinue = () => {
    if (!selected) return;
    updateOnboardingAnswers({ goal: selected });
    navigation.navigate('OnboardingCondition');
  };

  return (
    <Screen padding>
      {/* Progress */}
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <Text variant="caption" style={styles.stepText}>1 of 7</Text>
      </View>

      {/* Header */}
      <Text variant="hero" style={styles.title}>What's{'\n'}holding{'\n'}you back?</Text>
      <Text variant="body" style={styles.sub}>We'll build your entire gut profile around this.</Text>

      {/* Options */}
      <View style={styles.options}>
        {GOALS.map((g) => {
          const active = selected === g.id;
          return (
            <TouchableOpacity
              key={g.id}
              activeOpacity={0.8}
              onPress={() => handleSelect(g.id)}
              style={[styles.card, active && styles.cardActive]}
            >
              <Icon name={g.iconName} size={26} color={active ? g.color : theme.colors.textSecondary} />
              <View style={styles.cardText}>
                <Text variant="label" style={[styles.cardLabel, active && { color: theme.colors.textPrimary }]}>
                  {g.label}
                </Text>
                <Text variant="caption" style={[styles.cardSub, active && { color: theme.colors.textSecondary }]}>
                  {g.sub}
                </Text>
              </View>
              {/* Radio indicator */}
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button label="Continue" onPress={handleContinue} disabled={!selected} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: theme.radii.full,
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.coral,
    borderRadius: theme.radii.full,
  },
  stepText: { color: theme.colors.textPrimary, fontFamily: 'Inter_700Bold' },
  title: { marginBottom: theme.spacing.md },
  sub: { color: theme.colors.textSecondary, marginBottom: theme.spacing.xxxl },
  options: { flex: 1, gap: theme.spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.lg,
    minHeight: 72,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  cardActive: {
    backgroundColor: 'rgba(224,93,76,0.08)',
    borderColor: theme.colors.coral,
    shadowColor: theme.colors.coral,
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  cardText: { flex: 1 },
  cardLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 3,
  },
  cardSub: {
    color: 'rgba(163,168,164,0.6)',
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 11,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    backgroundColor: theme.colors.coral,
    borderColor: theme.colors.coral,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.bg,
  },
  footer: { paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.sm },
});

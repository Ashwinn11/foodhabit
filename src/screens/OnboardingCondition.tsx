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

const SCREEN_W = Dimensions.get('window').width;
const TRACK_W  = SCREEN_W - theme.spacing.xl * 2 - 56;
const PROGRESS = TRACK_W * 0.28;

const CONDITIONS = [
  { id: 'ibs_d',    iconName: 'ibs_d',    color: theme.colors.secondary, label: 'Mostly diarrhea',     sub: 'Urgent runs, loose stools, cramping' },
  { id: 'ibs_c',    iconName: 'ibs_c',    color: theme.colors.accent, label: 'Mostly constipated',  sub: 'Straining, incomplete feeling, bloat' },
  { id: 'bloating', iconName: 'bloating', color: theme.colors.accent, label: 'Bloating & gas',      sub: 'Pressure, distension, discomfort' },
  { id: 'unsure',   iconName: 'unsure',   color: theme.colors.text.secondary, label: 'Not sure yet', sub: 'Gut issues but no clear pattern' },
];

export const OnboardingCondition = ({ navigation }: any) => {
  const { updateOnboardingAnswers, onboardingAnswers } = useAppStore();
  const [selected, setSelected] = useState<string>(onboardingAnswers.condition || '');

  const progressAnim = useSharedValue(0);
  useEffect(() => { progressAnim.value = withTiming(PROGRESS, { duration: 500 }); }, []);
  const progressStyle = useAnimatedStyle(() => ({ width: progressAnim.value }));

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
  };

  const handleContinue = () => {
    if (!selected) return;
    updateOnboardingAnswers({ condition: selected });
    navigation.navigate('OnboardingSymptoms');
  };

  return (
    <Screen padding>
      {/* Progress */}
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <Text variant="caption" style={styles.stepText}>2 of 7</Text>
      </View>

      {/* Header */}
      <Text variant="hero" style={styles.title}>What does{'\n'}your gut{'\n'}do to you?</Text>
      <Text variant="body" style={styles.sub}>This shapes your entire food safety algorithm.</Text>

      {/* Options */}
      <View style={styles.options}>
        {CONDITIONS.map((c) => {
          const active = selected === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              activeOpacity={0.8}
              onPress={() => handleSelect(c.id)}
              style={[styles.card, active && styles.cardActive]}
            >
              <Icon name={c.iconName} size={26} color={active ? c.color : theme.colors.text.secondary} />
              <View style={styles.cardText}>
                <Text variant="label" style={[styles.cardLabel, active && { color: theme.colors.text.primary }]}>
                  {c.label}
                </Text>
                <Text variant="caption" style={[styles.cardSub, active && { color: theme.colors.text.secondary }]}>
                  {c.sub}
                </Text>
              </View>
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
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radii.full,
  },
  stepText: { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' },
  title: { marginBottom: theme.spacing.md },
  sub: { color: theme.colors.text.secondary, marginBottom: theme.spacing.xxxl },
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
    borderColor: theme.colors.secondary,
    shadowColor: theme.colors.secondary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  cardText: { flex: 1 },
  cardLabel: { color: theme.colors.text.secondary, fontSize: 14, marginBottom: 3 },
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
    borderColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { backgroundColor: theme.colors.secondary },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.background },
  footer: { paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.sm },
});

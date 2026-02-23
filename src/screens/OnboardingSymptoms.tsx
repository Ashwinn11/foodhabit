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
const PROGRESS = TRACK_W * 0.42;

const SYMPTOMS = [
  { id: 'bloating',  iconName: 'bloating', color: theme.colors.accent, label: 'Bloating' },
  { id: 'gas',       iconName: 'gas',      color: theme.colors.accent, label: 'Gas' },
  { id: 'cramping',  iconName: 'cramping', color: theme.colors.secondary, label: 'Cramping' },
  { id: 'nausea',    iconName: 'nausea',   color: theme.colors.secondary, label: 'Nausea' },
  { id: 'ibs_d',     iconName: 'ibs_d',   color: theme.colors.secondary, label: 'Diarrhea' },
  { id: 'ibs_c',     iconName: 'ibs_c',   color: theme.colors.accent, label: 'Constipation' },
];

export const OnboardingSymptoms = ({ navigation }: any) => {
  const { updateOnboardingAnswers, onboardingAnswers } = useAppStore();
  const [selected, setSelected] = useState<string[]>(onboardingAnswers.symptoms || []);

  const progressAnim = useSharedValue(0);
  useEffect(() => { progressAnim.value = withTiming(PROGRESS, { duration: 500 }); }, []);
  const progressStyle = useAnimatedStyle(() => ({ width: progressAnim.value }));

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleContinue = () => {
    updateOnboardingAnswers({ symptoms: selected });
    navigation.navigate('OnboardingTriggers');
  };

  return (
    <Screen padding>
      {/* Progress */}
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <Text variant="caption" style={styles.stepText}>3 of 7</Text>
      </View>

      {/* Header */}
      <Text variant="hero" style={styles.title}>Your symptoms{'\n'}are data.</Text>
      <Text variant="body" style={styles.sub}>Select everything you experience — even if it feels embarrassing.</Text>

      {/* 2-col grid — bug fix: tint NOT solid fill so icons stay visible */}
      <View style={styles.grid}>
        {SYMPTOMS.map((s) => {
          const active = selected.includes(s.id);
          return (
            <TouchableOpacity
              key={s.id}
              activeOpacity={0.8}
              onPress={() => toggle(s.id)}
              style={[styles.card, active && styles.cardActive]}
            >
              <Icon name={s.iconName} size={26} color={active ? s.color : theme.colors.text.secondary} />
              <Text
                variant="label"
                style={[styles.cardLabel, active && { color: theme.colors.text.primary }]}
              >
                {s.label}
              </Text>
              {active && (
                <View style={styles.activePip} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button label="Continue" onPress={handleContinue} disabled={selected.length === 0} />
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    flex: 1,
  },
  card: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    height: 120,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  cardActive: {
    // Tint bg + coral border — icons stay fully visible
    backgroundColor: 'rgba(224,93,76,0.08)',
    borderColor: theme.colors.secondary,
    shadowColor: theme.colors.secondary,
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  cardLabel: { color: theme.colors.text.secondary, textAlign: 'center' },
  activePip: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.secondary,
  },
  footer: { paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.sm },
});

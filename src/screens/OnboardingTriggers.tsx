import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icon';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';
import { fodmapService } from '../services/fodmapService';

const SCREEN_W = Dimensions.get('window').width;
const TRACK_W  = SCREEN_W - theme.spacing.xl * 2 - 56;
const PROGRESS = TRACK_W * 0.56;

// Color-coded triggers — amber = common irritant, coral = strong trigger
const TRIGGERS = [
  { id: 'dairy',    iconName: 'dairy',    color: theme.colors.amber, label: 'Dairy' },
  { id: 'garlic',   iconName: 'garlic',   color: theme.colors.coral, label: 'Garlic' },
  { id: 'onion',    iconName: 'onion',    color: theme.colors.coral, label: 'Onion' },
  { id: 'gluten',   iconName: 'gluten',   color: theme.colors.amber, label: 'Gluten' },
  { id: 'caffeine', iconName: 'caffeine', color: theme.colors.amber, label: 'Caffeine' },
  { id: 'spicy',    iconName: 'spicy',    color: theme.colors.coral, label: 'Spicy food' },
  { id: 'alcohol',  iconName: 'alcohol',  color: theme.colors.coral, label: 'Alcohol' },
  { id: 'beans',    iconName: 'beans',    color: theme.colors.amber, label: 'Beans' },
];

export const OnboardingTriggers = ({ navigation }: any) => {
  const { updateOnboardingAnswers, onboardingAnswers } = useAppStore();
  const [selected, setSelected] = useState<string[]>(onboardingAnswers.knownTriggers || []);
  const [loading, setLoading]   = useState(false);

  const progressAnim = useSharedValue(0);
  useEffect(() => { progressAnim.value = withTiming(PROGRESS, { duration: 500 }); }, []);
  const progressStyle = useAnimatedStyle(() => ({ width: progressAnim.value }));

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleContinue = async () => {
    updateOnboardingAnswers({ knownTriggers: selected });
    setLoading(true);
    try {
      const testFoods = [...selected, 'Rice', 'Chicken breast', 'Oatmeal', 'Apples', 'Bread'].filter(Boolean);
      const results   = await fodmapService.analyzeFoods(testFoods);
      navigation.navigate('OnboardingResults', { analysisData: results });
    } catch {
      navigation.navigate('OnboardingResults', { analysisData: null });
    } finally { setLoading(false); }
  };

  return (
    <Screen padding scroll>
      {/* Progress */}
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <Text variant="caption" style={styles.stepText}>4 of 7</Text>
      </View>

      {/* Header */}
      <Text variant="hero" style={styles.title}>Start with{'\n'}what you{'\n'}already know.</Text>
      <Text variant="body" style={styles.sub}>
        Tap anything you suspect. Our AI will verify and expand your list from your scans.
      </Text>

      {/* Trigger chips with colored icons */}
      <View style={styles.chipGrid}>
        {TRIGGERS.map((t) => (
          <Chip
            key={t.id}
            label={t.label}
            icon={<Icon name={t.iconName} size={14} color={selected.includes(t.id) ? t.color : theme.colors.textSecondary} />}
            selected={selected.includes(t.id)}
            onPress={() => toggle(t.id)}
          />
        ))}
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={theme.colors.coral} size="small" />
          <Text variant="caption" style={styles.loadingText}>Building your gut model…</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          label={selected.length > 0 ? 'Analyze My Profile' : 'Skip for now'}
          onPress={handleContinue}
          disabled={loading}
          loading={loading}
        />
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
  sub: { color: theme.colors.textSecondary, marginBottom: theme.spacing.xxxl, lineHeight: 26 },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.giant,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  loadingText: { color: theme.colors.textSecondary },
  footer: { paddingBottom: theme.spacing.sm },
});

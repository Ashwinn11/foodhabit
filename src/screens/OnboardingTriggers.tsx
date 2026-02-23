import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Plus, X } from 'lucide-react-native';
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

const PRESET_TRIGGERS = [
  { id: 'dairy',    iconName: 'dairy',    color: theme.colors.accent, label: 'Dairy' },
  { id: 'garlic',   iconName: 'garlic',   color: theme.colors.secondary, label: 'Garlic' },
  { id: 'onion',    iconName: 'onion',    color: theme.colors.secondary, label: 'Onion' },
  { id: 'gluten',   iconName: 'gluten',   color: theme.colors.accent, label: 'Gluten' },
  { id: 'caffeine', iconName: 'caffeine', color: theme.colors.accent, label: 'Caffeine' },
  { id: 'spicy',    iconName: 'spicy',    color: theme.colors.secondary, label: 'Spicy food' },
  { id: 'alcohol',  iconName: 'alcohol',  color: theme.colors.secondary, label: 'Alcohol' },
  { id: 'beans',    iconName: 'beans',    color: theme.colors.accent, label: 'Beans' },
];

const PRESET_IDS = new Set(PRESET_TRIGGERS.map(t => t.id));

export const OnboardingTriggers = ({ navigation }: any) => {
  const { updateOnboardingAnswers, onboardingAnswers } = useAppStore();

  // Split stored knownTriggers into preset IDs vs custom strings
  const stored = onboardingAnswers.knownTriggers || [];
  const [selected, setSelected]         = useState<string[]>(stored.filter(t => PRESET_IDS.has(t)));
  const [customTriggers, setCustom]     = useState<string[]>(stored.filter(t => !PRESET_IDS.has(t)));
  const [customInput, setCustomInput]   = useState('');
  const [loading, setLoading]           = useState(false);
  const inputRef                         = useRef<TextInput>(null);

  const progressAnim = useSharedValue(0);
  useEffect(() => { progressAnim.value = withTiming(PROGRESS, { duration: 500 }); }, []);
  const progressStyle = useAnimatedStyle(() => ({ width: progressAnim.value }));

  const togglePreset = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const addCustom = () => {
    const val = customInput.trim().toLowerCase();
    if (!val || customTriggers.includes(val) || PRESET_IDS.has(val)) {
      setCustomInput('');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustom(prev => [...prev, val]);
    setCustomInput('');
  };

  const removeCustom = (val: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustom(prev => prev.filter(t => t !== val));
  };

  const allTriggers = [...selected, ...customTriggers];

  const handleContinue = async () => {
    // Flush any pending text input first
    const pending = customInput.trim().toLowerCase();
    const finalTriggers = pending && !allTriggers.includes(pending)
      ? [...allTriggers, pending]
      : allTriggers;

    updateOnboardingAnswers({ knownTriggers: finalTriggers });
    setLoading(true);
    try {
      const testFoods = [...finalTriggers, 'Rice', 'Chicken breast', 'Oatmeal', 'Apples', 'Bread'].filter(Boolean);
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

      {/* Preset chips */}
      <View style={styles.chipGrid}>
        {PRESET_TRIGGERS.map((t) => (
          <Chip
            key={t.id}
            label={t.label}
            icon={<Icon name={t.iconName} size={14} color={selected.includes(t.id) ? t.color : theme.colors.text.secondary} />}
            selected={selected.includes(t.id)}
            onPress={() => togglePreset(t.id)}
          />
        ))}
      </View>

      {/* Custom trigger input */}
      <Text variant="caption" style={styles.addLabel}>ADD YOUR OWN</Text>
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="e.g. lentils, fried food, red wine…"
          placeholderTextColor={theme.colors.text.secondary}
          value={customInput}
          onChangeText={setCustomInput}
          onSubmitEditing={addCustom}
          returnKeyType="done"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.addBtn, !customInput.trim() && styles.addBtnDisabled]}
          onPress={addCustom}
          activeOpacity={0.7}
          disabled={!customInput.trim()}
        >
          <Plus color={customInput.trim() ? theme.colors.background : theme.colors.text.secondary} size={16} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Custom trigger chips */}
      {customTriggers.length > 0 && (
        <View style={styles.customChips}>
          {customTriggers.map(val => (
            <TouchableOpacity
              key={val}
              style={styles.customChip}
              onPress={() => removeCustom(val)}
              activeOpacity={0.7}
            >
              <Text style={styles.customChipLabel}>
                {val.charAt(0).toUpperCase() + val.slice(1)}
              </Text>
              <X color={theme.colors.secondary} size={12} strokeWidth={2.5} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={theme.colors.secondary} size="small" />
          <Text variant="caption" style={styles.loadingText}>Building your gut model…</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          label={allTriggers.length > 0 ? 'Analyze My Profile' : 'Skip for now'}
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
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radii.full,
  },
  stepText: { color: theme.colors.text.primary, fontFamily: 'Inter_700Bold' },
  title: { marginBottom: theme.spacing.md },
  sub: { color: theme.colors.text.secondary, marginBottom: theme.spacing.xxxl, lineHeight: 26 },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xxxl,
  },

  addLabel: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    color: theme.colors.text.primary,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    paddingVertical: theme.spacing.sm,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: theme.colors.surfaceElevated,
  },

  customChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xxxl,
  },
  customChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: 'rgba(224,93,76,0.35)',
    backgroundColor: 'rgba(224,93,76,0.08)',
  },
  customChipLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: theme.colors.secondary,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  loadingText: { color: theme.colors.text.secondary },
  footer: { paddingBottom: theme.spacing.sm },
});

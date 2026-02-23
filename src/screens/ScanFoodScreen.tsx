import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { ScanLine, Camera, Image as ImageIcon, Check, Crown } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { theme } from '../theme/theme';
import { fodmapService, AnalysisResult } from '../services/fodmapService';
import { gutService } from '../services/gutService';
import { useAppStore } from '../store/useAppStore';

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  safe:    theme.colors.primary,
  caution: theme.colors.accent,
  avoid:   theme.colors.secondary,
};
const STATUS_LABEL: Record<string, string> = {
  safe:    'Safe',
  caution: 'Caution',
  avoid:   'Avoid',
};

const SCAN_PHASES = [
  { title: 'Reading your menu…',       sub: 'Identifying every item' },
  { title: 'Analysing ingredients…',   sub: 'Checking FODMAP levels' },
  { title: 'Matching your profile…',   sub: 'Personalising results' },
  { title: 'Almost ready…',            sub: 'Calculating gut impact' },
];

// ── ScanningLoader ─────────────────────────────────────────────────────────

const ScanningLoader = () => {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const textOpacity = useSharedValue(1);

  // Cycle text every 2.2 s
  useEffect(() => {
    const id = setInterval(() => {
      textOpacity.value = withSequence(
        withTiming(0, { duration: 250 }),
        withTiming(1, { duration: 250 }),
      );
      setPhaseIdx(i => (i + 1) % SCAN_PHASES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  // Three expanding rings at different speeds
  const r1Scale = useSharedValue(1);
  const r2Scale = useSharedValue(1);
  const r3Scale = useSharedValue(1);
  const r1Opacity = useSharedValue(0.55);
  const r2Opacity = useSharedValue(0.35);
  const r3Opacity = useSharedValue(0.18);

  useEffect(() => {
    const easing = Easing.out(Easing.ease);
    r1Scale.value = withRepeat(withTiming(1.55, { duration: 1400, easing }), -1, false);
    r2Scale.value = withRepeat(withTiming(1.9,  { duration: 1900, easing }), -1, false);
    r3Scale.value = withRepeat(withTiming(2.3,  { duration: 2400, easing }), -1, false);
    r1Opacity.value = withRepeat(withSequence(withTiming(0.55, { duration: 0 }), withTiming(0, { duration: 1400 })), -1, false);
    r2Opacity.value = withRepeat(withSequence(withTiming(0.35, { duration: 0 }), withTiming(0, { duration: 1900 })), -1, false);
    r3Opacity.value = withRepeat(withSequence(withTiming(0.18, { duration: 0 }), withTiming(0, { duration: 2400 })), -1, false);
  }, []);

  const s1 = useAnimatedStyle(() => ({ transform: [{ scale: r1Scale.value }], opacity: r1Opacity.value }));
  const s2 = useAnimatedStyle(() => ({ transform: [{ scale: r2Scale.value }], opacity: r2Opacity.value }));
  const s3 = useAnimatedStyle(() => ({ transform: [{ scale: r3Scale.value }], opacity: r3Opacity.value }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));

  const phase = SCAN_PHASES[phaseIdx];

  return (
    <View style={loaderStyles.container}>
      {/* Radar rings */}
      <View style={loaderStyles.ringContainer}>
        <Animated.View style={[loaderStyles.ring, s3]} />
        <Animated.View style={[loaderStyles.ring, s2]} />
        <Animated.View style={[loaderStyles.ring, s1]} />
        {/* Core dot */}
        <View style={loaderStyles.core}>
          <ScanLine color={theme.colors.primary} size={22} strokeWidth={1.5} />
        </View>
      </View>

      {/* Cycling text */}
      <Animated.View style={[loaderStyles.textBlock, textStyle]}>
        <Text style={loaderStyles.phaseTitle}>{phase.title}</Text>
        <Text style={loaderStyles.phaseSub}>{phase.sub}</Text>
      </Animated.View>
    </View>
  );
};

const loaderStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl * 1.5,
    gap: theme.spacing.xxxl,
  },
  ringContainer: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  core: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(212,248,112,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212,248,112,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { alignItems: 'center', gap: theme.spacing.xs },
  phaseTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  phaseSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
});

// ── Helpers ────────────────────────────────────────────────────────────────

function findHealthiest(results: AnalysisResult[]): AnalysisResult | null {
  if (results.length <= 1) return null;
  return (
    results.find(r => r.level === 'safe') ??
    results.find(r => r.level === 'caution') ??
    null
  );
}

type Mode  = 'text' | 'camera';
type Stage = 'input' | 'scanning' | 'results';

// ── ScanFoodScreen ─────────────────────────────────────────────────────────

export const ScanFoodScreen = () => {
  const { setRecentScanAvoidFoods } = useAppStore();

  const [mode, setMode]       = useState<Mode>('text');
  const [textInput, setTextInput] = useState('');
  const [stage, setStage]     = useState<Stage>('input');
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [error, setError]     = useState<string | null>(null);
  const [loggedFoods, setLoggedFoods] = useState<string[]>([]);
  const [mealLogged, setMealLogged]   = useState(false);

  const applyResults = (res: AnalysisResult[]) => {
    setResults(res);
    setRecentScanAvoidFoods(res.filter(r => r.level === 'avoid').map(r => r.normalizedName));
    setStage('results');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const resetAll = () => {
    setResults([]);
    setError(null);
    setLoggedFoods([]);
    setMealLogged(false);
    setTextInput('');
    setStage('input');
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    resetAll();
  };

  const analyzeText = async () => {
    const foods = textInput.split(',').map(f => f.trim()).filter(Boolean);
    if (!foods.length) return;
    setError(null);
    setStage('scanning');
    try {
      const res = await fodmapService.analyzeFoods(foods) as AnalysisResult[];
      applyResults(res);
    } catch {
      setError('Could not analyze foods. Check your connection and try again.');
      setStage('input');
    }
  };

  const scanAndAnalyze = async (base64: string) => {
    setStage('scanning');
    setError(null);
    try {
      const foods = await fodmapService.analyzeFoods([], base64, true) as string[];
      if (!foods.length) {
        setError("Couldn't find any food items. Try a clearer photo of a menu or plate.");
        setStage('input');
        return;
      }
      const res = await fodmapService.analyzeFoods(foods) as AnalysisResult[];
      applyResults(res);
    } catch {
      setError('Could not read menu. Try a clearer photo.');
      setStage('input');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true, quality: 0.7, mediaTypes: 'images',
    });
    if (!result.canceled && result.assets[0]) {
      resetAll();
      const b64 = result.assets[0].base64 ?? null;
      if (b64) scanAndAnalyze(b64);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      resetAll();
      const b64 = result.assets[0].base64 ?? null;
      if (b64) scanAndAnalyze(b64);
    }
  };

  const toggleLogFood = (name: string) =>
    setLoggedFoods(prev =>
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    );

  const logMeal = async () => {
    if (!loggedFoods.length) return;
    try {
      await gutService.logMeal({ foods: loggedFoods });
      setMealLogged(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('Error', 'Could not log meal. Please try again.');
    }
  };

  const healthiest = findHealthiest(results);

  const renderResultCard = (item: AnalysisResult, index: number) => {
    const color        = STATUS_COLOR[item.level];
    const isHealthiest = healthiest?.normalizedName === item.normalizedName;
    const isSelected   = loggedFoods.includes(item.normalizedName);

    return (
      <TouchableOpacity
        key={index}
        activeOpacity={0.85}
        onPress={() => toggleLogFood(item.normalizedName)}
        style={[styles.resultCard, isSelected && { borderColor: theme.colors.primary }]}
      >
        <Card variant={isSelected ? 'surface' : 'outline'} padding="lg" style={{ borderLeftWidth: 4, borderLeftColor: color }}>
          {isHealthiest && (
            <View style={styles.healthiestBadge}>
              <Crown color={theme.colors.accent} size={11} strokeWidth={2.5} />
              <Text variant="caption" color={theme.colors.accent} weight="bold">Healthiest Choice</Text>
            </View>
          )}
          <View style={styles.resultRow}>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight="bold">{item.normalizedName}</Text>
              <Text variant="bodySmall" color={theme.colors.text.secondary} style={{ marginTop: 2 }}>{item.explanation}</Text>
            </View>
            <View style={styles.resultRight}>
              <Text variant="caption" color={color} weight="bold">{STATUS_LABEL[item.level]}</Text>
              <View style={[styles.checkbox, isSelected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}>
                {isSelected && <Check color={theme.colors.text.inverse} size={12} strokeWidth={3} />}
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <Screen padding={false} scroll>
      <View style={styles.header}>
        <Text variant="display">Scan Food.</Text>
        <Text variant="body" color={theme.colors.text.secondary}>
          Analyse meals to check FODMAP compatibility.
        </Text>
      </View>

      <View style={styles.content}>
        {/* Mode switcher */}
        {stage !== 'scanning' && (
          <View style={styles.modeSwitcher}>
            {(['text', 'camera'] as Mode[]).map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => switchMode(m)}
                style={[styles.modeTab, mode === m && styles.modeTabActive]}
              >
                <Text variant="label" color={mode === m ? theme.colors.text.inverse : theme.colors.text.secondary}>
                  {m === 'text' ? 'Type foods' : 'Scan menu'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── TEXT MODE ── */}
        {mode === 'text' && stage === 'input' && (
          <View style={styles.section}>
            <Card variant="surface" padding="md" style={styles.textBox}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. garlic bread, pasta, caesar salad"
                placeholderTextColor={theme.colors.text.tertiary}
                value={textInput}
                onChangeText={setTextInput}
                multiline
              />
            </Card>
            <Button
              label="Analyse Meal"
              onPress={analyzeText}
              disabled={!textInput.trim()}
              variant="primary"
            />
            <Text variant="caption" color={theme.colors.text.tertiary} align="center" style={{ marginTop: 8 }}>
              Separate multiple items with commas
            </Text>
          </View>
        )}

        {/* ── CAMERA MODE ── */}
        {mode === 'camera' && stage === 'input' && (
          <View style={styles.section}>
            <View style={styles.cameraRow}>
              <Card variant="surface" padding="xl" style={styles.cameraCard}>
                <TouchableOpacity onPress={takePhoto} style={styles.cameraBtn}>
                  <Camera color={theme.colors.primary} size={32} />
                  <Text variant="body" weight="bold">Take Photo</Text>
                  <Text variant="caption" color={theme.colors.text.tertiary} align="center">Point at a menu or plate</Text>
                </TouchableOpacity>
              </Card>
              <Card variant="surface" padding="xl" style={styles.cameraCard}>
                <TouchableOpacity onPress={pickImage} style={styles.cameraBtn}>
                  <ImageIcon color={theme.colors.accent} size={32} />
                  <Text variant="body" weight="bold">Gallery</Text>
                  <Text variant="caption" color={theme.colors.text.tertiary} align="center">Pick an existing photo</Text>
                </TouchableOpacity>
              </Card>
            </View>
          </View>
        )}

        {/* ── SCANNING ── */}
        {stage === 'scanning' && <ScanningLoader />}

        {/* ── Error ── */}
        {!!error && (
          <Card variant="outline" padding="lg" style={styles.errorCard}>
            <Text variant="bodySmall" color={theme.colors.error}>{error}</Text>
          </Card>
        )}

        {/* ── RESULTS ── */}
        {results.length > 0 && stage === 'results' && (
          <View style={styles.results}>
            <View style={styles.resultsHeader}>
              <View style={styles.summaryRow}>
                {(['safe', 'caution', 'avoid'] as const).map(level => {
                  const count = results.filter(r => r.level === level).length;
                  if (!count) return null;
                  return (
                    <View key={level} style={styles.summaryItem}>
                      <View style={[styles.summaryDot, { backgroundColor: STATUS_COLOR[level] }]} />
                      <Text variant="caption" color={STATUS_COLOR[level]} weight="bold">{count}</Text>
                    </View>
                  );
                })}
              </View>
              <TouchableOpacity onPress={resetAll}>
                <Text variant="label" color={theme.colors.text.tertiary}>Scan again</Text>
              </TouchableOpacity>
            </View>

            {[...results]
              .sort((a, b) => ({ safe: 0, caution: 1, avoid: 2 }[a.level] - { safe: 0, caution: 1, avoid: 2 }[b.level]))
              .map((item, i) => renderResultCard(item, i))
            }

            {!mealLogged ? (
              <View style={styles.logAction}>
                <Text variant="caption" color={theme.colors.text.tertiary} align="center" style={{ marginBottom: 12 }}>
                  {loggedFoods.length > 0 ? `${loggedFoods.length} items selected` : 'Select items you are eating to log'}
                </Text>
                <Button
                  label={loggedFoods.length > 0 ? `Log ${loggedFoods.length} Items` : 'Log Meal'}
                  onPress={logMeal}
                  disabled={loggedFoods.length === 0}
                  variant="primary"
                />
              </View>
            ) : (
              <Card variant="glass" padding="lg" style={styles.loggedCard} glow>
                <View style={styles.loggedContent}>
                  <Check color={theme.colors.primary} size={20} strokeWidth={3} />
                  <View>
                    <Text variant="body" weight="bold">Meal Logged</Text>
                    <Text variant="caption" color={theme.colors.text.tertiary}>Check My Gut later to log symptoms.</Text>
                  </View>
                </View>
              </Card>
            )}
          </View>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.xl, // Reduced from giant
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.colossal,
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.full,
    padding: 4,
    marginBottom: theme.spacing.giant,
  },
  modeTab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.full,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: theme.colors.primary,
  },
  section: {
    marginBottom: theme.spacing.giant,
  },
  textBox: {
    minHeight: 120,
    marginBottom: theme.spacing.lg,
  },
  textInput: {
    flex: 1,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fonts.body,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  cameraRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cameraCard: {
    flex: 1,
  },
  cameraBtn: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  errorCard: {
    borderColor: theme.colors.error + '30',
    backgroundColor: theme.colors.error + '10',
    marginBottom: theme.spacing.lg,
  },
  results: {
    gap: theme.spacing.md,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  resultCard: {
    marginBottom: theme.spacing.xs,
  },
  healthiestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  resultRight: {
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logAction: {
    marginTop: theme.spacing.giant,
  },
  loggedCard: {
    marginTop: theme.spacing.giant,
  },
  loggedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
});
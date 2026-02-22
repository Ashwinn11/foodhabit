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
  safe:    theme.colors.lime,
  caution: theme.colors.amber,
  avoid:   theme.colors.coral,
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
          <ScanLine color={theme.colors.lime} size={22} strokeWidth={1.5} />
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
    borderColor: theme.colors.lime,
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
    color: theme.colors.textPrimary,
  },
  phaseSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: theme.colors.textSecondary,
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

  // ── Shared result/reset ───────────────────────────────────────────────────

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

  // ── Text mode ─────────────────────────────────────────────────────────────

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

  // ── Camera mode: extract + analyze in one shot ───────────────────────────

  const scanAndAnalyze = async (base64: string) => {
    setStage('scanning');
    setError(null);
    try {
      // Step 1: extract food names from image
      const foods = await fodmapService.analyzeFoods([], base64, true) as string[];
      if (!foods.length) {
        setError("Couldn't find any food items. Try a clearer photo of a menu or plate.");
        setStage('input');
        return;
      }
      // Step 2: immediately analyze — no confirm step
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

  // ── Meal logging ──────────────────────────────────────────────────────────

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

  // ── Result card ───────────────────────────────────────────────────────────

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
        style={[styles.resultCard, { borderLeftColor: color }, isSelected && styles.resultCardSelected]}
      >
        {isHealthiest && (
          <View style={styles.healthiestBadge}>
            <Crown color={theme.colors.amber} size={11} strokeWidth={2.5} />
            <Text style={styles.healthiestLabel}>HEALTHIEST CHOICE</Text>
          </View>
        )}
        <View style={styles.resultRow}>
          <View style={styles.resultMain}>
            <View style={[styles.statusDot, { backgroundColor: color }]} />
            <View style={{ flex: 1 }}>
              <Text variant="label" style={styles.resultName}>{item.normalizedName}</Text>
              <Text variant="caption" style={styles.resultExplanation}>{item.explanation}</Text>
            </View>
          </View>
          <View style={styles.resultRight}>
            <Text style={[styles.statusLabel, { color }]}>{STATUS_LABEL[item.level]}</Text>
            <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
              {isSelected && <Check color={theme.colors.bg} size={12} strokeWidth={3} />}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Screen padding scroll>
      <Text variant="hero" style={[styles.title, { lineHeight: 64 }]}>
        Scan Food.
      </Text>

      {/* Mode switcher — hidden while scanning */}
      {stage !== 'scanning' && (
        <View style={styles.modeSwitcher}>
          {(['text', 'camera'] as Mode[]).map(m => (
            <TouchableOpacity
              key={m}
              onPress={() => switchMode(m)}
              style={[styles.modeTab, mode === m && styles.modeTabActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.modeTabLabel, mode === m && styles.modeTabLabelActive]}>
                {m === 'text' ? 'Type Foods' : 'Scan Menu'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── TEXT MODE input ── */}
      {mode === 'text' && stage === 'input' && (
        <View style={styles.section}>
          <View style={styles.textBox}>
            <ScanLine color={theme.colors.textSecondary} size={18} strokeWidth={1.5} />
            <TextInput
              style={styles.textInput}
              placeholder="e.g. garlic bread, pasta, caesar salad"
              placeholderTextColor={theme.colors.textSecondary}
              value={textInput}
              onChangeText={setTextInput}
              multiline
            />
          </View>
          <Button
            label="Analyze"
            onPress={analyzeText}
            disabled={!textInput.trim()}
          />
        </View>
      )}

      {/* ── CAMERA MODE input ── */}
      {mode === 'camera' && stage === 'input' && (
        <View style={styles.section}>
          <View style={styles.cameraRow}>
            <TouchableOpacity style={styles.cameraCard} onPress={takePhoto} activeOpacity={0.8}>
              <Camera color={theme.colors.coral} size={28} strokeWidth={1.5} />
              <Text style={styles.cameraLabel}>Take Photo</Text>
              <Text variant="caption" style={styles.cameraSub}>Point at a menu or plate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraCard} onPress={pickImage} activeOpacity={0.8}>
              <ImageIcon color={theme.colors.amber} size={28} strokeWidth={1.5} />
              <Text style={styles.cameraLabel}>From Gallery</Text>
              <Text variant="caption" style={styles.cameraSub}>Pick an existing photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── SCANNING / loading ── */}
      {stage === 'scanning' && <ScanningLoader />}

      {/* ── Error ── */}
      {!!error && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      )}

      {/* ── RESULTS ── */}
      {results.length > 0 && stage === 'results' && (
        <View style={styles.results}>
          {/* Summary counts */}
          <View style={styles.summaryRow}>
            {(['safe', 'caution', 'avoid'] as const).map(level => {
              const count = results.filter(r => r.level === level).length;
              if (!count) return null;
              return (
                <View key={level} style={styles.summaryItem}>
                  <View style={[styles.summaryDot, { backgroundColor: STATUS_COLOR[level] }]} />
                  <Text style={[styles.summaryCount, { color: STATUS_COLOR[level] }]}>{count}</Text>
                  <Text style={styles.summaryLevel}>{STATUS_LABEL[level]}</Text>
                </View>
              );
            })}
            <TouchableOpacity onPress={resetAll} style={styles.scanAgain} activeOpacity={0.7}>
              <Text style={styles.scanAgainLabel}>Scan again</Text>
            </TouchableOpacity>
          </View>

          {/* Cards sorted: safe → caution → avoid */}
          {[...results]
            .sort((a, b) => ({ safe: 0, caution: 1, avoid: 2 }[a.level] - { safe: 0, caution: 1, avoid: 2 }[b.level]))
            .map((item, i) => renderResultCard(item, i))
          }

          {/* Log prompt */}
          {!mealLogged ? (
            <View style={styles.logSection}>
              <Text variant="caption" style={styles.logHint}>
                {loggedFoods.length
                  ? `${loggedFoods.length} selected — tap to toggle`
                  : "Tap foods above to select what you're eating"}
              </Text>
              {loggedFoods.length > 0 && (
                <Button
                  label={`Log ${loggedFoods.length} Food${loggedFoods.length > 1 ? 's' : ''}`}
                  onPress={logMeal}
                />
              )}
            </View>
          ) : (
            <Card style={styles.loggedCard}>
              <Check color={theme.colors.lime} size={18} strokeWidth={2.5} />
              <Text style={styles.loggedLabel}>Meal logged</Text>
              <Text variant="caption" style={styles.loggedSub}>
                Go to My Gut → Log How I Feel after eating.
              </Text>
            </Card>
          )}
        </View>
      )}

      {/* Empty hint */}
      {mode === 'text' && stage === 'input' && !error && (
        <Text variant="caption" style={styles.emptyHint}>
          Enter one food or a full meal — separate multiple items with commas
        </Text>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl },

  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.full,
    padding: 3,
    marginBottom: theme.spacing.xxxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.radii.full,
    alignItems: 'center',
  },
  modeTabActive: { backgroundColor: theme.colors.coral },
  modeTabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  modeTabLabelActive: { color: theme.colors.bg },

  section: { gap: theme.spacing.xl, marginBottom: theme.spacing.xl },

  textBox: {
    flexDirection: 'row',
    alignItems: 'center', // Changed from flex-start to vertically center icon and text
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    minHeight: 60,
  },
  textInput: {
    flex: 1,
    padding: 0,
    margin: 0,
    color: theme.colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },

  cameraRow: { flexDirection: 'row', gap: theme.spacing.md },
  cameraCard: {
    flex: 1,
    backgroundColor: 'rgba(21, 25, 22, 0.45)',
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.minimal,
  },
  cameraLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  cameraSub: { color: theme.colors.textSecondary, textAlign: 'center', fontSize: 11 },

  errorCard: {
    backgroundColor: 'rgba(224, 93, 76, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(224, 93, 76, 0.15)',
    marginTop: theme.spacing.xl,
  },
  errorText: { color: theme.colors.coral, fontFamily: 'Inter_400Regular', fontSize: 14 },

  results: { gap: theme.spacing.md },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryDot: { width: 8, height: 8, borderRadius: 4 },
  summaryCount: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  summaryLevel: { color: theme.colors.textSecondary, fontSize: 12, fontFamily: 'Inter_400Regular' },
  scanAgain: { marginLeft: 'auto' },
  scanAgainLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },

  resultCard: {
    backgroundColor: 'rgba(21, 25, 22, 0.45)',
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderLeftWidth: 4,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  resultCardSelected: {
    borderColor: theme.colors.coral,
    backgroundColor: 'rgba(224,93,76,0.06)',
  },
  healthiestBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  healthiestLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: theme.colors.amber,
    letterSpacing: 0.8,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  resultMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  resultName: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 3,
  },
  resultExplanation: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  resultRight: { alignItems: 'flex-end', gap: theme.spacing.sm },
  statusLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.5 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: theme.colors.coral,
    borderColor: theme.colors.coral,
  },

  logSection: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  logHint: { color: theme.colors.textSecondary, textAlign: 'center' },
  loggedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: 'rgba(21, 25, 22, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(212, 248, 112, 0.15)',
    padding: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    flexWrap: 'wrap',
  },
  loggedLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: theme.colors.lime,
  },
  loggedSub: { color: theme.colors.textSecondary, flex: 1 },

  emptyHint: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.giant,
  },
});

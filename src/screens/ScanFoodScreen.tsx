import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { ScanLine, Camera, Image as ImageIcon, Check, Crown } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { theme } from '../theme/theme';
import { fodmapService, AnalysisResult } from '../services/fodmapService';
import { gutService } from '../services/gutService';
import { useAppStore } from '../store/useAppStore';

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

function findHealthiest(results: AnalysisResult[]): AnalysisResult | null {
  if (results.length <= 1) return null;
  return (
    results.find(r => r.level === 'safe') ??
    results.find(r => r.level === 'caution') ??
    null
  );
}

type Mode  = 'text' | 'camera';
type Stage = 'input' | 'extracting' | 'confirm' | 'analyzing' | 'results';

export const ScanFoodScreen = () => {
  const { setRecentScanAvoidFoods } = useAppStore();

  const [mode, setMode]                     = useState<Mode>('text');
  const [textInput, setTextInput]           = useState('');
  const [stage, setStage]                   = useState<Stage>('input');
  const [imageUri, setImageUri]             = useState<string | null>(null);
  const [imageBase64, setImageBase64]       = useState<string | null>(null);
  const [extractedFoods, setExtractedFoods] = useState<string[]>([]);
  const [selectedExtracted, setSelectedExtracted] = useState<string[]>([]);
  const [results, setResults]               = useState<AnalysisResult[]>([]);
  const [error, setError]                   = useState<string | null>(null);
  const [loggedFoods, setLoggedFoods]       = useState<string[]>([]);
  const [mealLogged, setMealLogged]         = useState(false);

  // ── Input handlers ───────────────────────────────────────────────────────

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
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 ?? null);
      setStage('input');
      resetResults();
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
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 ?? null);
      setStage('input');
      resetResults();
    }
  };

  const resetResults = () => {
    setResults([]);
    setError(null);
    setExtractedFoods([]);
    setSelectedExtracted([]);
    setLoggedFoods([]);
    setMealLogged(false);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setStage('input');
    setTextInput('');
    setImageUri(null);
    setImageBase64(null);
    resetResults();
  };

  // ── Text mode ────────────────────────────────────────────────────────────

  const analyzeText = async () => {
    const foods = textInput.split(',').map(f => f.trim()).filter(Boolean);
    if (!foods.length) return;
    setError(null);
    setStage('analyzing');
    try {
      const res = await fodmapService.analyzeFoods(foods) as AnalysisResult[];
      setResults(res);
      setRecentScanAvoidFoods(res.filter(r => r.level === 'avoid').map(r => r.normalizedName));
      setStage('results');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setError('Could not analyze foods. Check your connection and try again.');
      setStage('input');
    }
  };

  // ── Camera mode (two-step) ───────────────────────────────────────────────

  const extractFromImage = async () => {
    if (!imageBase64) return;
    setStage('extracting');
    setError(null);
    try {
      const foods = await fodmapService.analyzeFoods([], imageBase64, true) as string[];
      setExtractedFoods(foods);
      setSelectedExtracted(foods);
      setStage('confirm');
    } catch {
      setError('Could not read foods from image. Try a clearer photo.');
      setStage('input');
    }
  };

  const analyzeExtracted = async () => {
    if (!selectedExtracted.length) return;
    setStage('analyzing');
    setError(null);
    try {
      const res = await fodmapService.analyzeFoods(selectedExtracted) as AnalysisResult[];
      setResults(res);
      setRecentScanAvoidFoods(res.filter(r => r.level === 'avoid').map(r => r.normalizedName));
      setStage('results');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setError('Could not analyze foods. Try again.');
      setStage('input');
    }
  };

  const toggleExtracted = (food: string) =>
    setSelectedExtracted(prev =>
      prev.includes(food) ? prev.filter(f => f !== food) : [...prev, food]
    );

  // ── Meal logging ─────────────────────────────────────────────────────────

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

  // ── Render ───────────────────────────────────────────────────────────────

  const healthiest  = findHealthiest(results);
  const isLoading   = stage === 'analyzing' || stage === 'extracting';

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

  return (
    <Screen padding scroll>
      <Text variant="title" style={styles.title}>Scan Food</Text>

      {/* Mode switcher */}
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

      {/* ── TEXT MODE ── */}
      {mode === 'text' && (
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
            label={stage === 'analyzing' ? 'Analyzing…' : 'Analyze'}
            onPress={analyzeText}
            loading={stage === 'analyzing'}
            disabled={!textInput.trim() || isLoading}
          />
        </View>
      )}

      {/* ── CAMERA MODE — pick image ── */}
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
          {imageUri && (
            <Button
              label="Identify Foods"
              onPress={extractFromImage}
              loading={isLoading}
            />
          )}
        </View>
      )}

      {/* ── CAMERA MODE — confirm extracted foods ── */}
      {mode === 'camera' && stage === 'confirm' && (
        <View style={styles.section}>
          <Text variant="body" style={styles.confirmCaption}>
            Found these foods — deselect any you're not eating:
          </Text>
          <View style={styles.chipRow}>
            {extractedFoods.map(f => (
              <Chip
                key={f}
                label={f}
                selected={selectedExtracted.includes(f)}
                onPress={() => toggleExtracted(f)}
              />
            ))}
          </View>
          <Button
            label={`Analyze ${selectedExtracted.length} Foods`}
            onPress={analyzeExtracted}
            disabled={!selectedExtracted.length || isLoading}
            loading={isLoading}
          />
        </View>
      )}

      {/* Loading */}
      {isLoading && (
        <Card style={styles.loadingCard}>
          <Text variant="body" style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
            {stage === 'extracting' ? 'Reading your menu…' : 'Checking against your gut profile…'}
          </Text>
        </Card>
      )}

      {/* Error */}
      {!!error && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      )}

      {/* ── RESULTS ── */}
      {results.length > 0 && (
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
      {mode === 'text' && stage === 'input' && results.length === 0 && !error && (
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
    alignItems: 'flex-start',
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
    color: theme.colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },

  cameraRow: { flexDirection: 'row', gap: theme.spacing.md },
  cameraCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  cameraLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  cameraSub: { color: theme.colors.textSecondary, textAlign: 'center', fontSize: 11 },

  confirmCaption: { color: theme.colors.textSecondary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },

  loadingCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
    marginTop: theme.spacing.xl,
  },
  errorCard: {
    backgroundColor: 'rgba(224,93,76,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(224,93,76,0.25)',
    marginTop: theme.spacing.xl,
  },
  errorText: { color: theme.colors.coral, fontFamily: 'Inter_400Regular', fontSize: 14 },

  results: { gap: theme.spacing.md },

  summaryRow: { flexDirection: 'row', gap: theme.spacing.xl, paddingBottom: theme.spacing.sm },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryDot: { width: 8, height: 8, borderRadius: 4 },
  summaryCount: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  summaryLevel: { color: theme.colors.textSecondary, fontSize: 12, fontFamily: 'Inter_400Regular' },

  resultCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    backgroundColor: 'rgba(212,248,112,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(212,248,112,0.2)',
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

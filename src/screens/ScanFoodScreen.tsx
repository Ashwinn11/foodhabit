import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ScanLine, Camera, Image as ImageIcon } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { theme } from '../theme/theme';
import { fodmapService, AnalysisResult } from '../services/fodmapService';

type Mode = 'text' | 'camera';
type Step = 'input' | 'extracted' | 'results';

const levelMeta = {
  safe:    { status: 'safe'    as const, label: 'Safe',         color: theme.colors.lime },
  caution: { status: 'caution' as const, label: 'Caution',      color: theme.colors.amber },
  avoid:   { status: 'risky'   as const, label: 'Avoid',        color: theme.colors.coral },
};

export const ScanFoodScreen = () => {
  const [mode, setMode]                   = useState<Mode>('text');
  const [step, setStep]                   = useState<Step>('input');
  const [input, setInput]                 = useState('');
  const [imageUri, setImageUri]           = useState<string | null>(null);
  const [imageBase64, setImageBase64]     = useState<string | null>(null);
  const [extractedFoods, setExtractedFoods] = useState<string[]>([]);
  const [selectedFoods, setSelectedFoods]   = useState<string[]>([]);
  const [isLoading, setLoading]           = useState(false);
  const [results, setResults]             = useState<AnalysisResult[] | null>(null);
  const [error, setError]                 = useState<string | null>(null);

  const resetState = () => {
    setStep('input');
    setResults(null);
    setError(null);
    setExtractedFoods([]);
    setSelectedFoods([]);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    resetState();
    setInput('');
    setImageUri(null);
    setImageBase64(null);
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to use this feature.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.7,
      mediaTypes: 'images',
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 ?? null);
      setStep('input');
      setResults(null);
      setError(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to use this feature.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 ?? null);
      setStep('input');
      setResults(null);
      setError(null);
    }
  };

  const handleExtractFoods = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setError(null);
    try {
      const foods = await fodmapService.analyzeFoods([], imageBase64, true) as unknown as string[];
      setExtractedFoods(foods);
      setSelectedFoods(foods);
      setStep('extracted');
    } catch (e: any) {
      setError(e?.message || 'Failed to extract foods from image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFood = (food: string) => {
    setSelectedFoods(prev =>
      prev.includes(food) ? prev.filter(f => f !== food) : [...prev, food]
    );
  };

  const handleAnalyzeFoods = async (foods: string[]) => {
    if (foods.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const analysisResults = await fodmapService.analyzeFoods(foods);
      setResults(analysisResults);
      setStep('results');
    } catch (e: any) {
      setError(e?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextAnalyze = () => {
    if (!input.trim()) return;
    const foods = input.split(',').map(f => f.trim()).filter(Boolean);
    handleAnalyzeFoods(foods);
  };

  const sorted = results
    ? [...results].sort((a, b) => {
        const order = { safe: 0, caution: 1, avoid: 2 };
        return order[a.level] - order[b.level];
      })
    : [];

  return (
    <Screen padding scroll>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="title">Scan Food</Text>
        <Text variant="caption" style={styles.subtitle}>Is this safe for your gut?</Text>
      </View>

      {/* Mode Switcher */}
      <View style={styles.modeSwitcher}>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'text' && styles.modeTabActive]}
          onPress={() => switchMode('text')}
          activeOpacity={0.8}
        >
          <ScanLine
            size={15}
            color={mode === 'text' ? theme.colors.bg : theme.colors.textSecondary}
            strokeWidth={2}
          />
          <Text
            variant="label"
            style={[
              styles.modeTabLabel,
              { color: mode === 'text' ? theme.colors.bg : theme.colors.textSecondary },
            ]}
          >
            Type
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'camera' && styles.modeTabActive]}
          onPress={() => switchMode('camera')}
          activeOpacity={0.8}
        >
          <Camera
            size={15}
            color={mode === 'camera' ? theme.colors.bg : theme.colors.textSecondary}
            strokeWidth={2}
          />
          <Text
            variant="label"
            style={[
              styles.modeTabLabel,
              { color: mode === 'camera' ? theme.colors.bg : theme.colors.textSecondary },
            ]}
          >
            Camera
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── TEXT MODE ── */}
      {mode === 'text' && step !== 'results' && (
        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <ScanLine size={20} color={theme.colors.textSecondary} strokeWidth={2} />
            <TextInput
              style={styles.textInput}
              placeholder="Garlic bread, Caesar salad, oat milk…"
              placeholderTextColor={theme.colors.textSecondary}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleTextAnalyze}
              returnKeyType="search"
              multiline={false}
            />
          </View>
          <View style={styles.analyzeBtn}>
            <Button
              label="Check These Foods"
              onPress={handleTextAnalyze}
              loading={isLoading}
              disabled={!input.trim() || isLoading}
            />
          </View>
        </View>
      )}

      {/* ── CAMERA MODE — INPUT STEP ── */}
      {mode === 'camera' && step === 'input' && (
        <View style={styles.cameraSection}>
          {!imageUri ? (
            /* No image yet — show two large cards */
            <View style={styles.cameraCards}>
              <TouchableOpacity
                style={styles.cameraCard}
                onPress={takePhoto}
                activeOpacity={0.75}
              >
                <Camera size={32} color={theme.colors.textPrimary} strokeWidth={1.5} />
                <Text variant="label" style={styles.cameraCardLabel}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cameraCard}
                onPress={pickFromGallery}
                activeOpacity={0.75}
              >
                <ImageIcon size={32} color={theme.colors.textPrimary} strokeWidth={1.5} />
                <Text variant="label" style={styles.cameraCardLabel}>From Gallery</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Image selected — show thumbnail */
            <View style={styles.imagePreviewSection}>
              <Image
                source={{ uri: imageUri }}
                style={styles.imageThumbnail}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.rescanBtn}
                onPress={() => { setImageUri(null); setImageBase64(null); }}
                activeOpacity={0.8}
              >
                <Text variant="label" style={styles.rescanLabel}>Re-scan</Text>
              </TouchableOpacity>
            </View>
          )}

          {imageUri && (
            <View style={styles.analyzeBtn}>
              <Button
                label="Extract Foods from Image"
                onPress={handleExtractFoods}
                loading={isLoading}
                disabled={isLoading}
                leftIcon={<Camera size={18} color={theme.colors.bg} strokeWidth={2} />}
              />
            </View>
          )}
        </View>
      )}

      {/* ── EXTRACTED FOODS STEP ── */}
      {step === 'extracted' && (
        <View style={styles.extractedSection}>
          <Text variant="caption" style={styles.foundLabel}>Found in image</Text>
          <View style={styles.chipRow}>
            {extractedFoods.map((food, i) => (
              <Chip
                key={i}
                label={food}
                status="neutral"
                selected={selectedFoods.includes(food)}
                onPress={() => toggleFood(food)}
              />
            ))}
          </View>
          <View style={styles.analyzeBtn}>
            <Button
              label="Analyze These Foods"
              onPress={() => handleAnalyzeFoods(selectedFoods)}
              loading={isLoading}
              disabled={selectedFoods.length === 0 || isLoading}
            />
          </View>
          <TouchableOpacity
            onPress={() => { switchMode('text'); }}
            style={styles.switchLink}
            activeOpacity={0.7}
          >
            <Text variant="label" style={styles.switchLinkText}>Type different foods →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── LOADING STATE ── */}
      {isLoading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={theme.colors.coral} />
          <Text variant="body" style={styles.loadingText}>
            {mode === 'camera' && step === 'input'
              ? 'Scanning image…'
              : 'Checking against your profile…'}
          </Text>
        </View>
      )}

      {/* ── ERROR STATE ── */}
      {!!error && !isLoading && (
        <View style={styles.errorCard}>
          <Text variant="label" style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* ── RESULTS ── */}
      {step === 'results' && !isLoading && sorted.length > 0 && (
        <View style={styles.results}>
          {sorted.map((r, i) => {
            const meta = levelMeta[r.level] ?? levelMeta.caution;
            return (
              <Card
                key={i}
                elevated
                style={[styles.resultCard, { borderLeftColor: meta.color }]}
              >
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
                  <Text variant="caption" style={[styles.statusLabel, { color: meta.color }]}>
                    {meta.label}
                  </Text>
                </View>
                <Text variant="title" style={styles.foodName}>{r.normalizedName}</Text>
                <Text variant="body" style={styles.explanation}>"{r.explanation}"</Text>
              </Card>
            );
          })}

          {/* New search link */}
          <TouchableOpacity
            onPress={() => { resetState(); setInput(''); }}
            style={styles.switchLink}
            activeOpacity={0.7}
          >
            <Text variant="label" style={styles.switchLinkText}>Check different foods →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── EMPTY STATE (no results, no loading, not in extracted step) ── */}
      {!isLoading && !error && step !== 'results' && step !== 'extracted' && (
        <View style={styles.emptyState}>
          <View style={styles.emptyDivider} />
          <Text variant="caption" style={styles.emptyLabel}>
            Your analysis will appear here
          </Text>
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
    gap: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.textSecondary,
  },

  // Mode switcher
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.full,
    padding: 4,
    marginBottom: theme.spacing.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.radii.full,
    gap: theme.spacing.xs,
  },
  modeTabActive: {
    backgroundColor: theme.colors.coral,
  },
  modeTabLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Text mode input
  inputSection: {
    gap: theme.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  textInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    paddingVertical: theme.spacing.lg,
  },

  // Camera mode
  cameraSection: {
    gap: theme.spacing.lg,
  },
  cameraCards: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cameraCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
  cameraCardLabel: {
    color: theme.colors.textPrimary,
  },
  imagePreviewSection: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  imageThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: theme.radii.xl,
  },
  rescanBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.full,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
  rescanLabel: {
    color: theme.colors.textPrimary,
  },

  // Extracted foods step
  extractedSection: {
    gap: theme.spacing.lg,
  },
  foundLabel: {
    color: theme.colors.textSecondary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },

  analyzeBtn: {
    marginTop: theme.spacing.sm,
  },

  switchLink: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  switchLinkText: {
    color: theme.colors.textSecondary,
  },

  // Loading
  loadingBox: {
    alignItems: 'center',
    paddingVertical: theme.spacing.giant,
    gap: theme.spacing.lg,
  },
  loadingText: {
    color: theme.colors.textSecondary,
  },

  // Error
  errorCard: {
    backgroundColor: 'rgba(224,93,76,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(224,93,76,0.30)',
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.coral,
  },

  // Results
  results: {
    gap: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  resultCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.lime, // overridden per-item
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  foodName: {
    marginBottom: theme.spacing.sm,
  },
  explanation: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
  emptyDivider: {
    width: 40,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  emptyLabel: {
    color: theme.colors.textSecondary,
  },
});

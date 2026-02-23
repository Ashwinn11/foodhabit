import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../theme/theme';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { FunLoader } from '../components/FunLoader';
import { Input } from '../components/Input';
import { useToast } from '../components/Toast';
import { fodmapService } from '../services/fodmapService';
import type { AnalysisResult } from '../services/fodmapService';
import { gutService } from '../services/gutService';

type Mode = 'camera' | 'type';
type CameraState = 'idle' | 'processing_extract' | 'processing_analyze' | 'error' | 'results';

function getLevelStyle(level: AnalysisResult['level']): { bg: string; text: string; label: string } {
  switch (level) {
    case 'safe':    return { bg: theme.colors.safeMuted,   text: theme.colors.safe,    label: 'SAFE' };
    case 'caution': return { bg: theme.colors.cautionMuted, text: theme.colors.caution, label: 'CAUTION' };
    case 'avoid':   return { bg: theme.colors.dangerMuted,  text: theme.colors.danger,  label: 'AVOID' };
  }
}

// Shared results list used by both camera and type mode
interface ResultsListProps {
  results: AnalysisResult[];
  selectedFoods: Set<string>;
  onToggle: (name: string) => void;
}

const ResultsList: React.FC<ResultsListProps> = ({ results, selectedFoods, onToggle }) => {
  const sorted = [...results].sort((a, b) => {
    const order = { safe: 0, caution: 1, avoid: 2 };
    return order[a.level] - order[b.level];
  });

  // Always pick the best available — safe first, then caution, then avoid
  const best = sorted[0];
  const rest = sorted.slice(1);

  if (!best) return null;

  const bestLvl = getLevelStyle(best.level);
  const bestChecked = selectedFoods.has(best.normalizedName);

  return (
    <View style={listStyles.container}>

      {/* ── Healthiest Pick — always visible, always prominent ── */}
      <TouchableOpacity activeOpacity={0.75} onPress={() => onToggle(best.normalizedName)}>
        <Card variant="glow" style={listStyles.bestCard}>
          <View style={listStyles.bestTopRow}>
            <View style={listStyles.bestBadge}>
              <Icon name="Star" size={11} color={theme.colors.primaryForeground} />
              <Text variant="caption" color={theme.colors.primaryForeground} style={listStyles.bestBadgeText}>
                Healthiest Pick
              </Text>
            </View>
            <Icon
              name={bestChecked ? 'CheckCircle2' : 'Circle'}
              size={22}
              color={bestChecked ? theme.colors.primary : theme.colors.textTertiary}
            />
          </View>
          <View style={listStyles.nameRow}>
            <Text variant="h3" style={listStyles.bestFoodName}>{best.normalizedName}</Text>
            <View style={[listStyles.levelBadge, { backgroundColor: bestLvl.bg }]}>
              <Text variant="caption" color={bestLvl.text} style={listStyles.levelText}>{bestLvl.label}</Text>
            </View>
          </View>
          {best.explanation && (
            <Text variant="caption" color={theme.colors.textSecondary} style={listStyles.explanation}>
              {best.explanation}
            </Text>
          )}
        </Card>
      </TouchableOpacity>

      {/* ── Rest of foods ── */}
      {rest.map((r) => {
        const lvl = getLevelStyle(r.level);
        const checked = selectedFoods.has(r.normalizedName);
        return (
          <TouchableOpacity
            key={r.normalizedName}
            activeOpacity={0.75}
            onPress={() => onToggle(r.normalizedName)}
            style={{ opacity: checked ? 1 : 0.5 }}
          >
            <Card variant="bordered" style={listStyles.card}>
              <View style={listStyles.topRow}>
                <View style={listStyles.nameRow}>
                  <Text variant="bodySmall" style={listStyles.foodName}>{r.normalizedName}</Text>
                  <View style={[listStyles.levelBadge, { backgroundColor: lvl.bg }]}>
                    <Text variant="caption" color={lvl.text} style={listStyles.levelText}>{lvl.label}</Text>
                  </View>
                </View>
                <Icon
                  name={checked ? 'CheckCircle2' : 'Circle'}
                  size={20}
                  color={checked ? theme.colors.primary : theme.colors.border}
                />
              </View>
              {r.explanation && (
                <Text variant="caption" color={theme.colors.textSecondary} style={listStyles.explanation}>
                  {r.explanation}
                </Text>
              )}
            </Card>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const listStyles = StyleSheet.create({
  container: { gap: theme.spacing.sm },
  // Best card
  bestCard: { gap: theme.spacing.xs },
  bestTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.xs },
  bestBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.sm, paddingVertical: 3,
  },
  bestBadgeText: { fontFamily: theme.fonts.semibold },
  bestFoodName: { flex: 1 },
  // Other cards
  card: { gap: theme.spacing.xs },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  nameRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  foodName: { flex: 1, fontFamily: theme.fonts.semibold },
  levelBadge: { borderRadius: theme.radius.full, paddingHorizontal: theme.spacing.sm, paddingVertical: 2 },
  levelText: { fontFamily: theme.fonts.bold, fontSize: 10, letterSpacing: 0.6 },
  explanation: { lineHeight: 18 },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export const ScanFoodScreen: React.FC = () => {
  const { showToast } = useToast();

  const [mode, setMode] = useState<Mode>('camera');
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [cameraPermission, requestPermission] = useCameraPermissions();

  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<Set<string>>(new Set());
  const [logging, setLogging] = useState(false);

  // Type mode
  const [typeInput, setTypeInput] = useState('');
  const [typeAnalyzing, setTypeAnalyzing] = useState(false);

  const cameraRef = useRef<any>(null);

  const applyResults = (newResults: AnalysisResult[]) => {
    setResults(newResults);
    setSelectedFoods(new Set()); // all unselected — user picks what to log
  };

  const toggleFood = (name: string) => {
    setSelectedFoods((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      setCameraState('processing_extract');

      const extractResult = await fodmapService.analyzeFoods([], photo.base64, true);
      const extracted: string[] = (extractResult as string[]) ?? [];
      if (!extracted.length) { setCameraState('error'); return; }

      setCameraState('processing_analyze');
      const analysisResult = await fodmapService.analyzeFoods(extracted);
      applyResults((analysisResult as AnalysisResult[]) ?? []);
      setCameraState('results');
    } catch {
      setCameraState('error');
    }
  };

  const handleAddFood = async () => {
    const trimmed = typeInput.trim();
    if (!trimmed) return;
    const newFoods = [...results.map((r) => r.normalizedName), trimmed];
    setTypeInput('');
    setTypeAnalyzing(true);
    try {
      const res = await fodmapService.analyzeFoods(newFoods);
      applyResults((res as AnalysisResult[]) ?? []);
    } catch {
      showToast('Analysis failed. Try again.', 'error');
    } finally {
      setTypeAnalyzing(false);
    }
  };

  const handleLogMeal = async () => {
    setLogging(true);
    try {
      const foods = Array.from(selectedFoods);
      const name = `Meal at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      await gutService.logMeal({ foods, name });
      showToast('Meal logged!', 'success');
      setResults([]);
      setSelectedFoods(new Set());
      setCameraState('idle');
    } catch {
      showToast('Could not log meal. Try again.', 'error');
    } finally {
      setLogging(false);
    }
  };

  const selectedCount = selectedFoods.size;

  // ── Camera permission gates ──────────────────────────────────────────────
  if (mode === 'camera') {
    if (!cameraPermission) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.center}>
            <Text variant="body" color={theme.colors.textSecondary}>Checking camera permissions...</Text>
          </View>
        </SafeAreaView>
      );
    }
    if (!cameraPermission.granted) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.center}>
            <Icon name="CameraOff" size={48} color={theme.colors.textTertiary} />
            <Text variant="h3" align="center">Camera Access Needed</Text>
            <Text variant="body" color={theme.colors.textSecondary} align="center">
              Enable camera access in Settings to scan menus.
            </Text>
            <Button
              variant="primary"
              size="md"
              onPress={() => cameraPermission.canAskAgain ? requestPermission() : Linking.openSettings()}
            >
              {cameraPermission.canAskAgain ? 'Enable Camera' : 'Open Settings'}
            </Button>
          </View>
        </SafeAreaView>
      );
    }
  }

  // ── Main layout ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text variant="h3">Analyze Foods</Text>
        <View style={styles.segmented}>
          {(['camera', 'type'] as Mode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.segBtn, mode === m && styles.segBtnActive]}
              onPress={() => { setMode(m); setResults([]); setSelectedFoods(new Set()); setCameraState('idle'); }}
            >
              <Icon
                name={m === 'camera' ? 'Camera' : 'PenLine'}
                size={14}
                color={mode === m ? theme.colors.primaryForeground : theme.colors.textSecondary}
              />
              <Text variant="caption" color={mode === m ? theme.colors.primaryForeground : theme.colors.textSecondary}>
                {m === 'camera' ? 'Camera' : 'Type'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Camera Mode ─────────────────────────────────────────────────── */}
      {mode === 'camera' && (
        <View style={styles.cameraContainer}>
          {cameraState === 'idle' && (
            <>
              <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
              <View style={styles.cornerGuides} pointerEvents="none">
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
              <View style={styles.cameraOverlay} pointerEvents="none">
                <Text variant="caption" color="rgba(255,255,255,0.7)" align="center">Point at a menu or meal</Text>
                <Text variant="caption" color="rgba(255,255,255,0.5)" align="center">Works with menus, receipts, or food photos</Text>
              </View>
              <TouchableOpacity style={styles.flipBtn} onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}>
                <Icon name="RefreshCw" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
                <View style={styles.captureInner} />
              </TouchableOpacity>
            </>
          )}

          {cameraState === 'processing_extract' && (
            <View style={styles.processingOverlay}>
              <FunLoader icon="magnifying_glass" animationType="float" message="Reading your menu..." />
            </View>
          )}

          {cameraState === 'processing_analyze' && (
            <View style={styles.processingOverlay}>
              <FunLoader icon="brain" animationType="pulse" message="Checking your gut profile..." />
            </View>
          )}

          {cameraState === 'error' && (
            <View style={styles.errorState}>
              <Icon name="AlertCircle" size={40} color={theme.colors.danger} />
              <Text variant="h3" align="center">Couldn't find foods in this image</Text>
              <Text variant="body" color={theme.colors.textSecondary} align="center">
                Try a clearer photo, or switch to typing
              </Text>
              <View style={styles.errorActions}>
                <Button variant="primary" size="md" onPress={() => setCameraState('idle')}>Try Again</Button>
                <Button variant="secondary" size="md" onPress={() => { setMode('type'); setCameraState('idle'); }}>Type Instead</Button>
              </View>
            </View>
          )}

          {cameraState === 'results' && (
            <ScrollView style={styles.resultsScroll} contentContainerStyle={styles.resultsContent}>
              <TouchableOpacity style={styles.retakeBtn} onPress={() => { setCameraState('idle'); setResults([]); setSelectedFoods(new Set()); }}>
                <Icon name="ChevronLeft" size={16} color={theme.colors.primary} />
                <Text variant="caption" color={theme.colors.primary}>Retake</Text>
              </TouchableOpacity>
              <ResultsList results={results} selectedFoods={selectedFoods} onToggle={toggleFood} />
            </ScrollView>
          )}
        </View>
      )}

      {/* ── Type Mode ───────────────────────────────────────────────────── */}
      {mode === 'type' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.typeContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.typeInputRow}>
            <Input
              placeholder="Type a food and press +"
              value={typeInput}
              onChangeText={setTypeInput}
              onSubmitEditing={handleAddFood}
              returnKeyType="done"
              style={styles.typeInputFlex}
              rightIcon={
                <TouchableOpacity onPress={handleAddFood} disabled={!typeInput.trim()} hitSlop={8}>
                  <Icon
                    name={typeAnalyzing ? 'Loader' : 'Plus'}
                    size={20}
                    color={typeInput.trim() ? theme.colors.primary : theme.colors.textTertiary}
                  />
                </TouchableOpacity>
              }
            />
          </View>

          {results.length > 0 ? (
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.typeScrollContent}
              keyboardShouldPersistTaps="always"
            >
              <ResultsList results={results} selectedFoods={selectedFoods} onToggle={toggleFood} />
              <TouchableOpacity onPress={() => { setResults([]); setSelectedFoods(new Set()); }} style={styles.clearAll}>
                <Text variant="caption" color={theme.colors.textTertiary}>Clear all</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={styles.typeEmpty}>
              <Text variant="body" color={theme.colors.textSecondary} align="center">
                Add foods to see if they're safe for your gut
              </Text>
            </View>
          )}
        </KeyboardAvoidingView>
      )}

      {/* ── Log FAB ─────────────────────────────────────────────────────── */}
      {(cameraState === 'results' || (mode === 'type' && results.length > 0)) && (
        <View style={styles.fab}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleLogMeal}
            loading={logging}
            disabled={selectedCount === 0}
            fullWidth
          >
            {selectedCount > 0 ? `Log ${selectedCount} Food${selectedCount > 1 ? 's' : ''}` : 'Tap foods to select'}
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.xl },
  flex: { flex: 1 },

  // Header
  header: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, gap: theme.spacing.md },
  segmented: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  segBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: theme.spacing.xs, paddingVertical: theme.spacing.xs + 2, borderRadius: theme.radius.sm,
  },
  segBtnActive: { backgroundColor: theme.colors.primary },

  // Camera
  cameraContainer: {
    flex: 1, backgroundColor: '#000', borderRadius: theme.radius.xl,
    overflow: 'hidden', margin: theme.spacing.md, marginTop: 0,
  },
  cornerGuides: { ...StyleSheet.absoluteFillObject, padding: 32 },
  corner: { width: 24, height: 24, borderColor: '#fff', borderWidth: 2, opacity: 0.6, position: 'absolute' },
  cornerTL: { top: 32, left: 32, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 32, right: 32, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 100, left: 32, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 100, right: 32, borderLeftWidth: 0, borderTopWidth: 0 },
  cameraOverlay: { position: 'absolute', bottom: 110, left: 0, right: 0, gap: 4 },
  flipBtn: {
    position: 'absolute', top: 16, right: 16, width: 40, height: 40,
    borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  captureBtn: {
    position: 'absolute', bottom: 28, alignSelf: 'center',
    width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.overlay,
    alignItems: 'center', justifyContent: 'center',
  },
  errorState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: theme.spacing.xl, gap: theme.spacing.md, backgroundColor: theme.colors.background,
  },
  errorActions: { flexDirection: 'row', gap: theme.spacing.sm },
  resultsScroll: { flex: 1, backgroundColor: theme.colors.background },
  resultsContent: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxl, gap: theme.spacing.md },
  retakeBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start' },

  // Type mode
  typeContainer: { flex: 1, paddingHorizontal: theme.spacing.md },
  typeInputRow: { marginBottom: theme.spacing.md },
  typeInputFlex: {},
  typeScrollContent: { gap: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  typeEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl },
  clearAll: { alignSelf: 'center', padding: theme.spacing.sm },

  // FAB
  fab: {
    paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.md, paddingTop: theme.spacing.sm,
    borderTopWidth: 1, borderTopColor: theme.colors.borderSubtle, backgroundColor: theme.colors.background,
  },

});

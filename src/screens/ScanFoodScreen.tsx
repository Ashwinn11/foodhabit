import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icon';
import { theme } from '../theme/theme';
import { fodmapService, AnalysisResult } from '../services/fodmapService';

const levelMeta = {
  safe:    { status: 'safe'    as const, label: '✓ Healthiest Choice', color: theme.colors.lime },
  caution: { status: 'caution' as const, label: '⚠ Watch Out',         color: theme.colors.amber },
  avoid:   { status: 'risky'   as const, label: '✕ Avoid',             color: theme.colors.coral },
};

export const ScanFoodScreen = ({ navigation }: any) => {
  const [input, setInput]           = useState('');
  const [isAnalyzing, setAnalyzing] = useState(false);
  const [results, setResults]       = useState<AnalysisResult[] | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setAnalyzing(true);
    setResults(null);
    try {
      const foods = input.split(',').map(f => f.trim()).filter(Boolean);
      setResults(await fodmapService.analyzeFoods(foods));
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const sorted = results
    ? [...results].sort((a, b) => {
        const order = { safe: 0, caution: 1, avoid: 2 };
        return order[a.level] - order[b.level];
      })
    : [];

  return (
    <Screen padding={true} scroll={true}>
      <Text variant="title" style={styles.heading}>Scan Food</Text>

      {/* Input */}
      <TextInput
        style={styles.input}
        placeholder="Garlic bread, Caesar salad…"
        placeholderTextColor={theme.colors.textSecondary}
        value={input}
        onChangeText={setInput}
        onSubmitEditing={handleAnalyze}
        returnKeyType="search"
      />
      <Button label="Analyze →" onPress={handleAnalyze} loading={isAnalyzing} disabled={!input.trim()} />

      {/* Loading */}
      {isAnalyzing && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={theme.colors.coral} />
          <Text variant="body" style={styles.loadingText}>Checking against your gut profile…</Text>
        </View>
      )}

      {/* Results */}
      {!isAnalyzing && sorted.length > 0 && (
        <View style={styles.results}>
          {sorted.map((r, i) => {
            const meta = levelMeta[r.level] ?? levelMeta.caution;
            return (
              <Card key={i} elevated style={styles.resultCard}>
                {/* Coloured header band */}
                <View style={[styles.cardHeader, { backgroundColor: `${meta.color}20` }]}>
                  <Chip status={meta.status} label={meta.label} />
                  {i === 0 && sorted.length > 1 && (
                    <Icon name="safe" size={16} style={{ marginLeft: theme.spacing.sm }} />
                  )}
                </View>
                <View style={styles.cardBody}>
                  <Text variant="title" style={styles.foodName}>{r.normalizedName}</Text>
                  <Text variant="body" style={styles.explanation}>"{r.explanation}"</Text>
                </View>
              </Card>
            );
          })}

          {/* Summary chips when multiple */}
          {sorted.length > 1 && (
            <View style={styles.summarySection}>
              <Text variant="caption" style={styles.summaryLabel}>ALL SCANNED ITEMS</Text>
              <View style={styles.summaryChips}>
                {sorted.map((r, i) => (
                  <Chip
                    key={i}
                    label={r.normalizedName}
                    status={(levelMeta[r.level] ?? levelMeta.caution).status}
                    icon={<Icon name={r.level === 'safe' ? 'safe' : r.level === 'caution' ? 'caution' : 'risky'} size={12} />}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  heading: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  input: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: theme.spacing.giant,
    gap: theme.spacing.lg,
  },
  loadingText: { color: theme.colors.textSecondary },
  results: { marginTop: theme.spacing.xxxl, gap: theme.spacing.lg },
  resultCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 0,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  cardBody: { padding: theme.spacing.xl },
  foodName: { marginBottom: theme.spacing.sm },
  explanation: { color: theme.colors.textSecondary, fontStyle: 'italic' },
  summarySection: { marginTop: theme.spacing.md },
  summaryLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    letterSpacing: 1,
  },
  summaryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
});

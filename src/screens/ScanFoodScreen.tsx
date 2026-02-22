import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { theme } from '../theme/theme';
import { fodmapService, AnalysisResult } from '../services/fodmapService';

export const ScanFoodScreen = ({ navigation }: any) => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[] | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    setResults(null);
    try {
      // Pass raw input (could be comma separated) as [input] array.
      // E.g., if user types "Garlic Bread, Caesar Salad"
      const foodsArray = input.split(',').map(f => f.trim()).filter(Boolean);
      const res = await fodmapService.analyzeFoods(foodsArray);
      setResults(res);
    } catch (e) {
      console.error(e);
      // Fallback manual error view
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openLogSheet = () => {
    // Open bottom sheet
  };

  const renderSingleResult = (r: AnalysisResult) => {
    const isAvoid = r.level === 'avoid';
    const isSafe = r.level === 'safe';
    
    return (
      <Card elevated={true} style={styles.resultCard}>
        <Chip 
          status={isAvoid ? 'risky' : isSafe ? 'safe' : 'caution'} 
          label={isAvoid ? 'AVOID' : isSafe ? 'SAFE' : 'CAUTION'} 
        />
        <Text variant="title" style={styles.foodName}>{r.normalizedName}</Text>
        <Text variant="body" style={styles.explanation}>"{r.explanation}"</Text>
      </Card>
    );
  };

  return (
    <Screen padding={true} scroll={true}>
      <View style={styles.header}>
        <Text variant="body" style={styles.closeBtn} onPress={() => navigation.goBack()}>✕</Text>
        <Text variant="label" style={styles.title}>Scan Food</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Garlic bread, Caesar salad..."
          placeholderTextColor={theme.colors.textSecondary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleAnalyze}
          returnKeyType="search"
        />
        <View style={styles.buttonWrapper}>
          <Button label="Analyze →" onPress={handleAnalyze} loading={isAnalyzing} disabled={!input} />
        </View>
      </View>

      {isAnalyzing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.coral} />
          <Text variant="body" style={styles.loadingText}>Checking against your gut profile...</Text>
        </View>
      )}

      {!isAnalyzing && results && results.length === 1 && (
        <View style={styles.resultsContainer}>
          {renderSingleResult(results[0])}
          <Button variant="ghost" label="Log My Reaction →" onPress={openLogSheet} />
        </View>
      )}

      {!isAnalyzing && results && results.length > 1 && (
        <View style={styles.resultsContainer}>
          <Text variant="label" style={styles.sectionTitle}>Multiple matches</Text>
          {results.map((r, i) => (
            <View key={i} style={styles.multiResultRow}>
              {renderSingleResult(r)}
            </View>
          ))}
          <View style={styles.spacer} />
          <Button variant="ghost" label="Log My Reaction →" onPress={openLogSheet} />
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  closeBtn: {
    fontSize: 24,
    color: theme.colors.textSecondary,
    width: 24,
  },
  title: {
    color: theme.colors.textPrimary,
  },
  inputContainer: {
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
  buttonWrapper: {
    alignItems: 'flex-end',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.giant,
  },
  loadingText: {
    marginTop: theme.spacing.lg,
    color: theme.colors.textSecondary,
  },
  resultsContainer: {
    flex: 1,
  },
  resultCard: {
    borderColor: theme.colors.border,
    borderWidth: 1,
    marginBottom: theme.spacing.xxxl,
  },
  foodName: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
  },
  explanation: {
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    marginBottom: theme.spacing.lg,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  multiResultRow: {
    marginBottom: theme.spacing.sm,
  },
  spacer: {
    height: theme.spacing.xl,
  },
});

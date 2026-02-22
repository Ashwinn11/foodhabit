import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Card } from '../components/Card';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';
import { gutService } from '../services/gutService';

export const MyGutScreen = () => {
  const { onboardingAnswers } = useAppStore();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const recent = await gutService.getRecentLogs(5);
      setLogs(recent || []);
    } catch (e) {
      console.warn('Could not load logs - requires auth');
    }
  };

  const confirmedTriggers = onboardingAnswers.knownTriggers || ['garlic', 'dairy', 'onion']; // Fallback for UI if empty

  return (
    <Screen padding={true} scroll={true}>
      <Text variant="title" style={styles.title}>
        My Gut
      </Text>

      <View style={styles.section}>
        <View style={styles.triggerHeader}>
          <Text variant="label" style={styles.sectionTitle}>
            🎯 {confirmedTriggers.length} Triggers Found
          </Text>
        </View>
        <View style={styles.chipStack}>
          {confirmedTriggers.map((t, i) => (
            <View key={i} style={styles.chipWrapper}>
              <Chip status="risky" label={`🔴 ${t.charAt(0).toUpperCase() + t.slice(1)}`} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="label" style={styles.sectionTitle}>Suspected → confirm:</Text>
        <View style={styles.suspectRow}>
          <Text variant="title" style={styles.suspectItem}>🟡 Broccoli</Text>
          <View style={styles.suspectActions}>
            <Button variant="ghost" label="Dismiss" onPress={() => {}} />
            <View style={{ width: 8 }} />
            <Button variant="primary" label="Confirm" onPress={() => {}} />
          </View>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <Button 
          label="Log How I Feel" 
          onPress={() => {}} 
          variant="primary" 
        />
      </View>

      <View style={styles.section}>
        <View style={styles.dividerRow}>
          <Text variant="caption" style={{ color: theme.colors.textSecondary }}>─── Recent </Text>
          <View style={styles.divider} />
        </View>
        
        {logs.length > 0 ? logs.map((log, i) => (
          <Card key={i} style={styles.logCard}>
            <Text variant="label" style={styles.logDate}>
              {new Date(log.timestamp).toLocaleDateString()}
            </Text>
            <Text variant="body" style={styles.logContent}>
              {log.emoji} · {log.symptoms?.join(', ') || 'No symptoms'}
            </Text>
          </Card>
        )) : (
          <>
            <Card style={styles.logCard}>
              <Text variant="label" style={styles.logDate}>Today</Text>
              <Text variant="body" style={styles.logContent}>😐 OK · Gas</Text>
            </Card>
            <Card style={styles.logCard}>
              <Text variant="label" style={styles.logDate}>Yesterday</Text>
              <Text variant="body" style={styles.logContent}>😖 Rough · Bloating</Text>
            </Card>
          </>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: theme.spacing.xxxl,
    marginTop: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xxxl,
  },
  triggerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  chipStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipWrapper: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  suspectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.lg,
  },
  suspectItem: {
    color: theme.colors.textPrimary,
  },
  suspectActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionContainer: {
    marginBottom: theme.spacing.giant,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: theme.spacing.sm,
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  logDate: {
    width: 80,
    color: theme.colors.textSecondary,
  },
  logContent: {
    flex: 1,
    color: theme.colors.textPrimary,
  }
});

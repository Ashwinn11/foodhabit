import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';
import { gutService } from '../services/gutService';

const SYMPTOM_CHIPS = ['Bloating', 'Gas', 'Nausea', 'Cramping', 'Constipation', 'Diarrhea'];

export const MyGutScreen = () => {
  const { onboardingAnswers } = useAppStore();
  const [logs, setLogs]             = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showLog, setShowLog]       = useState(false);
  const [mood, setMood]             = useState<'sad'|'neutral'|'happy'|null>(null);
  const [symptoms, setSymptoms]     = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setLogs(await gutService.getRecentLogs(5) || []);
    } catch { /* requires auth */ }
    finally { setLoading(false); }
  };

  const toggleSymptom = (s: string) =>
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = async () => {
    if (!mood) return;
    setSubmitting(true);
    try {
      await gutService.logMoment({ mood, symptoms });
      setShowLog(false);
      setMood(null);
      setSymptoms([]);
      await loadLogs();
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const triggers = onboardingAnswers?.knownTriggers || [];

  return (
    <Screen padding={true} scroll={true}>
      <Text variant="title" style={styles.title}>My Gut</Text>

      {/* Triggers */}
      <View style={styles.section}>
        <View style={styles.triggerHeader}>
          <Icon name="triggers" size={20} />
          <Text variant="label" style={styles.triggerCount}> {triggers.length} Triggers Found</Text>
        </View>
        <View style={styles.chipRow}>
          {triggers.length > 0 ? triggers.map((t: string, i: number) => (
            <Chip key={i} status="risky" label={t.charAt(0).toUpperCase() + t.slice(1)} icon={<Icon name="risky" size={14} />} />
          )) : (
            <Text variant="body" style={styles.emptyText}>No triggers identified yet.</Text>
          )}
        </View>
      </View>

      {/* Log button */}
      <View style={styles.logBtnContainer}>
        <Button label="Log How I Feel" onPress={() => setShowLog(true)} variant="primary" />
      </View>

      {/* Recent logs */}
      <View style={styles.section}>
        <View style={styles.recentRow}>
          <Text variant="caption" style={styles.recentLabel}>─── Recent </Text>
          <View style={styles.divider} />
        </View>

        {loading ? (
          <Text variant="body" style={styles.emptyText}>Loading…</Text>
        ) : logs.length > 0 ? logs.map((log, i) => (
          <Card key={i} style={styles.logCard}>
            <Text variant="label" style={styles.logDate}>
              {new Date(log.timestamp).toLocaleDateString()}
            </Text>
            <Icon name={log.emoji === 'sad' ? 'sad' : log.emoji === 'happy' ? 'happy' : 'neutral'} size={24} />
            <Text variant="body" style={styles.logSymptoms}>
              {log.symptoms?.join(', ') || 'No symptoms'}
            </Text>
          </Card>
        )) : (
          <View style={styles.emptyState}>
            <Icon name="unsure" size={48} />
            <Text variant="body" style={[styles.emptyText, { marginTop: theme.spacing.md }]}>
              No gut moments logged yet.{'\n'}Log how you feel to build your history.
            </Text>
          </View>
        )}
      </View>

      {/* Log Modal — per plan: mood icons + symptom chips */}
      <Modal visible={showLog} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text variant="title" style={styles.sheetTitle}>How did it go?</Text>

            {/* Mood row */}
            <View style={styles.moodRow}>
              {(['sad', 'neutral', 'happy'] as const).map(m => (
                <TouchableOpacity key={m} onPress={() => setMood(m)} style={styles.moodBtn}>
                  <Icon
                    name={m}
                    size={mood === m ? 60 : 44}
                    style={{ opacity: mood === m ? 1 : 0.35 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Symptom chips */}
            <Text variant="caption" style={styles.anyLabel}>Any of these?</Text>
            <View style={styles.symptomChips}>
              {SYMPTOM_CHIPS.map(s => (
                <Chip
                  key={s}
                  label={s}
                  selected={symptoms.includes(s)}
                  onPress={() => toggleSymptom(s)}
                />
              ))}
            </View>

            <Button label="Save" onPress={handleSave} loading={submitting} disabled={!mood} />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLog(false)}>
              <Text variant="label" style={{ color: theme.colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.xxxl },
  section: { marginBottom: theme.spacing.xxxl },
  triggerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
  triggerCount: { color: theme.colors.textPrimary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  logBtnContainer: { marginBottom: theme.spacing.giant },
  recentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.lg },
  recentLabel: { color: theme.colors.textSecondary },
  divider: { flex: 1, height: 1, backgroundColor: theme.colors.border, marginLeft: theme.spacing.sm },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logDate: { width: 80, color: theme.colors.textSecondary },
  logSymptoms: { flex: 1, color: theme.colors.textPrimary },
  emptyState: { alignItems: 'center', paddingVertical: theme.spacing.xxxl },
  emptyText: { color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    padding: theme.spacing.xxxl,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
  },
  sheetTitle: { marginBottom: theme.spacing.xxxl },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.xxxl,
  },
  moodBtn: { alignItems: 'center', justifyContent: 'center', height: 70 },
  anyLabel: { color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
  symptomChips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.xxxl },
  cancelBtn: { alignItems: 'center', marginTop: theme.spacing.lg, paddingVertical: theme.spacing.md },
});

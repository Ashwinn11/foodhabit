import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { AlertTriangle, Edit3 } from 'lucide-react-native';
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

const moodColors: Record<string, string> = {
  sad:     theme.colors.coral,
  neutral: theme.colors.amber,
  happy:   theme.colors.lime,
};

const moodLabels: Record<string, string> = {
  sad:     'Bad',
  neutral: 'Okay',
  happy:   'Good',
};

export const MyGutScreen = () => {
  const { onboardingAnswers } = useAppStore();
  const [logs, setLogs]             = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showLog, setShowLog]       = useState(false);
  const [mood, setMood]             = useState<'sad' | 'neutral' | 'happy' | null>(null);
  const [symptoms, setSymptoms]     = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setLogs(await gutService.getRecentLogs(5) || []);
    } catch {
      // requires auth — silently handle
    } finally {
      setLoading(false);
    }
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
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const openLog = () => {
    setMood(null);
    setSymptoms([]);
    setShowLog(true);
  };

  const triggers = onboardingAnswers?.knownTriggers || [];

  const formatDate = (timestamp: string) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Screen padding scroll>
      <Text variant="title" style={styles.title}>My Gut</Text>

      {/* ── Triggers Section ── */}
      <View style={styles.section}>
        <View style={styles.triggerHeader}>
          <AlertTriangle color={theme.colors.amber} size={18} strokeWidth={2} />
          <Text style={styles.triggerCountLabel}>
            {triggers.length} Trigger{triggers.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {triggers.length > 0 ? (
          <View style={styles.chipRow}>
            {triggers.map((t: string, i: number) => (
              <Chip
                key={i}
                status="risky"
                label={t.charAt(0).toUpperCase() + t.slice(1)}
              />
            ))}
          </View>
        ) : (
          <Card style={styles.emptyTriggersCard}>
            <Text variant="body" style={styles.emptyTriggersText}>
              No triggers yet — complete onboarding to personalize
            </Text>
          </Card>
        )}
      </View>

      {/* ── Log Button ── */}
      <View style={styles.logBtnContainer}>
        <Button
          label="Log How I Feel"
          onPress={openLog}
          variant="primary"
          leftIcon={<Edit3 color={theme.colors.bg} size={18} strokeWidth={2} />}
        />
      </View>

      {/* ── Recent Logs Section ── */}
      <View style={styles.section}>
        <View style={styles.recentRow}>
          <Text variant="caption" style={styles.recentLabel}>Recent Logs</Text>
          <View style={styles.divider} />
        </View>

        {loading ? (
          <View style={styles.centeredLoader}>
            <ActivityIndicator color={theme.colors.coral} />
          </View>
        ) : logs.length > 0 ? (
          logs.map((log, i) => (
            <Card key={i} elevated style={styles.logCard}>
              <View style={styles.logTopRow}>
                <Text variant="caption" style={styles.logDate}>
                  {formatDate(log.timestamp)}
                </Text>
                <Icon
                  name={log.emoji}
                  size={28}
                  color={moodColors[log.emoji] || theme.colors.textSecondary}
                />
              </View>
              {log.symptoms && log.symptoms.length > 0 && (
                <View style={styles.logChipRow}>
                  {log.symptoms.map((s: string, j: number) => (
                    <Chip key={j} label={s} status="neutral" />
                  ))}
                </View>
              )}
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="unsure" size={56} color={theme.colors.amber} />
            <Text variant="label" style={styles.emptyStateTitle}>Nothing logged yet.</Text>
            <Text variant="body" style={styles.emptyStateBody}>
              Log your first gut moment to start seeing patterns.
            </Text>
          </View>
        )}
      </View>

      {/* ── Log Bottom Sheet Modal ── */}
      <Modal visible={showLog} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {/* Drag handle */}
            <View style={styles.dragHandle} />

            <Text variant="title" style={styles.sheetTitle}>How did it go?</Text>

            {/* Mood Selector */}
            <View style={styles.moodRow}>
              {(['sad', 'neutral', 'happy'] as const).map(m => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMood(m)}
                  style={styles.moodBtn}
                  activeOpacity={0.8}
                >
                  <View style={{ opacity: mood === m ? 1 : 0.35 }}>
                    <Icon
                      name={m}
                      size={mood === m ? 56 : 44}
                      color={moodColors[m]}
                    />
                  </View>
                  <Text
                    variant="caption"
                    style={[
                      styles.moodBtnLabel,
                      { color: mood === m ? moodColors[m] : theme.colors.textSecondary },
                    ]}
                  >
                    {moodLabels[m]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Symptoms */}
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

            {/* Save */}
            <Button
              label="Save"
              onPress={handleSave}
              loading={submitting}
              disabled={!mood}
            />

            {/* Cancel */}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowLog(false)}
              activeOpacity={0.7}
            >
              <Text variant="label" style={{ color: theme.colors.textSecondary }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xxxl,
  },
  section: {
    marginBottom: theme.spacing.xxxl,
  },

  // Triggers
  triggerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  triggerCountLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  emptyTriggersCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  emptyTriggersText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },

  // Log button
  logBtnContainer: {
    marginBottom: theme.spacing.giant,
  },

  // Recent logs header
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  recentLabel: {
    color: theme.colors.textSecondary,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  centeredLoader: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },

  // Log cards
  logCard: {
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  logTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logDate: {
    color: theme.colors.textSecondary,
  },
  logChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.giant,
    gap: theme.spacing.md,
  },
  emptyStateTitle: {
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
  },
  emptyStateBody: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    padding: theme.spacing.xxxl,
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: theme.spacing.xxl,
  },
  sheetTitle: {
    marginBottom: theme.spacing.xxxl,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.xxxl,
    alignItems: 'flex-end',
  },
  moodBtn: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    minHeight: 80,
    justifyContent: 'flex-end',
  },
  moodBtnLabel: {
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 12,
  },
  anyLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  symptomChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xxxl,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
});

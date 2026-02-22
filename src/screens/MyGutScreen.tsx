import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { AlertTriangle, Edit3, CheckCircle, XCircle, Utensils } from 'lucide-react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Card } from '../components/Card';
import { theme } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';
import { gutService, TriggerFood } from '../services/gutService';

const SYMPTOM_CHIPS = ['Bloating', 'Gas', 'Nausea', 'Cramping', 'Constipation', 'Diarrhea'];

const MOOD_COLOR: Record<string, string> = {
  sad:     theme.colors.coral,
  neutral: theme.colors.amber,
  happy:   theme.colors.lime,
};
const MOOD_LABEL: Record<string, string> = {
  sad:     'Bad',
  neutral: 'Okay',
  happy:   'Good',
};

const formatDate = (ts: string) => {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const MyGutScreen = () => {
  const { onboardingAnswers, setLearnedTriggers } = useAppStore();

  const [timeline, setTimeline]           = useState<any[]>([]);
  const [triggerFoods, setTriggerFoods]   = useState<TriggerFood[]>([]);
  const [loading, setLoading]             = useState(true);
  const [showLog, setShowLog]             = useState(false);
  const [mood, setMood]                   = useState<'sad' | 'neutral' | 'happy' | null>(null);
  const [symptoms, setSymptoms]           = useState<string[]>([]);
  const [submitting, setSubmitting]       = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Run independently so a trigger_foods error never hides logs/meals
      const [logsResult, mealsResult, triggersResult] = await Promise.allSettled([
        gutService.getRecentLogs(10),
        gutService.getRecentMeals(10),
        gutService.getTriggerFoods(),
      ]);

      const logsData     = logsResult.status     === 'fulfilled' ? logsResult.value     : [];
      const mealsData    = mealsResult.status    === 'fulfilled' ? mealsResult.value    : [];
      const triggersData = triggersResult.status === 'fulfilled' ? triggersResult.value : [];

      if (triggersResult.status === 'rejected') {
        console.warn('getTriggerFoods failed:', triggersResult.reason);
      }

      // Merge gut logs + meals into a single chronological timeline
      const merged = [
        ...logsData.map((l: any)  => ({ ...l, _type: 'log'  })),
        ...mealsData.map((m: any) => ({ ...m, _type: 'meal' })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setTimeline(merged);
      setTriggerFoods(triggersData as TriggerFood[]);

      const confirmed = (triggersData as TriggerFood[])
        .filter(t => t.user_confirmed === true || t.confidence === 'High')
        .map(t => t.food_name);
      setLearnedTriggers(confirmed);
    } finally {
      setLoading(false);
    }
  }, [setLearnedTriggers]);

  useEffect(() => { loadData(); }, [loadData]);

  // Split triggers into confirmed and suspected
  const confirmedTriggers = triggerFoods.filter(
    t => t.user_confirmed === true || t.confidence === 'High'
  );
  // Suspected = has evidence (confidence not null) but not yet confirmed/high
  const suspectedTriggers = triggerFoods.filter(
    t => t.user_confirmed !== true && t.confidence !== null && t.confidence !== 'High'
  );

  // All confirmed trigger names including onboarding known triggers
  const allConfirmedNames = [
    ...onboardingAnswers.knownTriggers,
    ...confirmedTriggers.map(t => t.food_name),
  ].filter((v, i, a) => a.indexOf(v) === i); // dedupe

  // ── Log gut moment ───────────────────────────────────────────────────────

  const toggleSymptom = (s: string) =>
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const openLog = () => {
    setMood(null);
    setSymptoms([]);
    setShowLog(true);
  };

  const handleSave = async () => {
    if (!mood) return;
    setSubmitting(true);
    try {
      await gutService.logGutMoment({ mood, symptoms });
      setShowLog(false);
      setMood(null);
      setSymptoms([]);
      await loadData(); // reload — correlation may have added suspected triggers
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Trigger actions ──────────────────────────────────────────────────────

  const handleConfirm = async (foodName: string) => {
    await gutService.confirmTrigger(foodName);
    await loadData();
  };

  const handleDismiss = async (foodName: string) => {
    await gutService.dismissTrigger(foodName);
    await loadData();
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Screen padding scroll>
      <Text variant="hero" style={[styles.title, { lineHeight: 64 }]}>
        My Gut.
      </Text>

      {/* ── Confirmed Triggers ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AlertTriangle color={theme.colors.amber} size={18} strokeWidth={2} />
          <Text style={styles.sectionHeaderLabel}>
            {allConfirmedNames.length} Trigger{allConfirmedNames.length !== 1 ? 's' : ''} Found
          </Text>
        </View>

        {allConfirmedNames.length > 0 ? (
          <View style={styles.chipRow}>
            {allConfirmedNames.map((name, i) => (
              <Chip key={i} status="risky" label={name.charAt(0).toUpperCase() + name.slice(1)} />
            ))}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Text variant="body" style={styles.emptyCardText}>
              No triggers confirmed yet. Scan food, log meals, and log how you feel — we'll find them for you.
            </Text>
          </Card>
        )}
      </View>

      {/* ── Suspected Triggers ── */}
      {suspectedTriggers.length > 0 && (
        <View style={styles.section}>
          <Text variant="caption" style={styles.suspectedLabel}>Suspected — confirm or dismiss:</Text>
          {suspectedTriggers.map((t, i) => (
            <Card key={i} elevated style={styles.suspectedCard}>
              <View style={styles.suspectedRow}>
                <View style={[styles.confidenceDot, {
                  backgroundColor: t.confidence === 'Medium' ? theme.colors.amber : theme.colors.textSecondary
                }]} />
                <Text style={styles.suspectedName}>
                  {t.food_name.charAt(0).toUpperCase() + t.food_name.slice(1)}
                </Text>
                <Text style={styles.confidenceLabel}>
                  bad {t.bad_occurrences}× / good {t.good_occurrences}×
                </Text>
              </View>
              <View style={styles.suspectedActions}>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={() => handleConfirm(t.food_name)}
                  activeOpacity={0.8}
                >
                  <CheckCircle color={theme.colors.lime} size={16} strokeWidth={2} />
                  <Text style={[styles.actionLabel, { color: theme.colors.lime }]}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dismissBtn}
                  onPress={() => handleDismiss(t.food_name)}
                  activeOpacity={0.8}
                >
                  <XCircle color={theme.colors.textSecondary} size={16} strokeWidth={2} />
                  <Text style={[styles.actionLabel, { color: theme.colors.textSecondary }]}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* ── Log Button ── */}
      <View style={styles.logBtnContainer}>
        <Button
          label="Log How I Feel"
          onPress={openLog}
          variant="primary"
          leftIcon={<Edit3 color={theme.colors.bg} size={18} strokeWidth={2} />}
        />
      </View>

      {/* ── Recent Logs ── */}
      <View style={styles.section}>
        <View style={styles.dividerRow}>
          <Text variant="caption" style={styles.dividerLabel}>Recent Logs</Text>
          <View style={styles.divider} />
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={theme.colors.coral} />
          </View>
        ) : timeline.length > 0 ? (
          timeline.map((entry, i) => {
            if (entry._type === 'meal') {
              return (
                <Card key={`meal-${i}`} style={styles.timelineCard}>
                  <View style={styles.timelineRow}>
                    <View style={styles.mealIconWrap}>
                      <Utensils color={theme.colors.textSecondary} size={16} strokeWidth={1.5} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="caption" style={styles.timelineDate}>{formatDate(entry.timestamp)}</Text>
                      <Text style={styles.mealFoods} numberOfLines={2}>
                        {(entry.foods as string[]).join(', ')}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            }
            // gut log entry
            return (
              <Card key={`log-${i}`} elevated style={styles.timelineCard}>
                <View style={styles.timelineRow}>
                  <View style={[styles.moodDot, { backgroundColor: MOOD_COLOR[entry.mood ?? 'neutral'] ?? theme.colors.textSecondary }]} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.logTopRow}>
                      <Text variant="caption" style={styles.timelineDate}>{formatDate(entry.timestamp)}</Text>
                      <Text style={[styles.moodLabel, { color: MOOD_COLOR[entry.mood ?? 'neutral'] }]}>
                        {MOOD_LABEL[entry.mood ?? 'neutral']}
                      </Text>
                    </View>
                    {entry.tags && entry.tags.length > 0 && (
                      <View style={styles.logChipRow}>
                        {entry.tags.map((s: string, j: number) => (
                          <Chip key={j} label={s} status="neutral" />
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyCircle} />
            <Text variant="label" style={styles.emptyTitle}>Awaiting Data</Text>
            <Text variant="body" style={styles.emptyBody}>
              Log meals and how you feel to build your timeline.
            </Text>
          </View>
        )}
      </View>

      {/* ── Log Bottom Sheet Modal ── */}
      <Modal visible={showLog} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.dragHandle} />
            <Text variant="title" style={styles.sheetTitle}>
              How did it go?
            </Text>

            {/* Mood */}
            <View style={styles.moodRow}>
              {(['sad', 'neutral', 'happy'] as const).map(m => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMood(m)}
                  style={styles.moodBtn}
                  activeOpacity={0.8}
                >
                  <View style={{ opacity: mood === m ? 1 : 0.35 }}>
                    <View style={[styles.modalMoodDot, { backgroundColor: MOOD_COLOR[m], transform: [{ scale: mood === m ? 1.2 : 1 }] }]} />
                  </View>
                  <Text
                    variant="caption"
                    style={[styles.moodBtnLabel, { color: mood === m ? MOOD_COLOR[m] : theme.colors.textSecondary }]}
                  >
                    {MOOD_LABEL[m]}
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

            <Button label="Save" onPress={handleSave} loading={submitting} disabled={!mood} />

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLog(false)} activeOpacity={0.7}>
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

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionHeaderLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  emptyCard: { borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed' },
  emptyCardText: { color: theme.colors.textSecondary, lineHeight: 22 },

  // Suspected triggers
  suspectedLabel: { color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
  suspectedCard: {
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245,201,122,0.2)',
    gap: theme.spacing.md,
  },
  suspectedRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  confidenceDot: { width: 8, height: 8, borderRadius: 4 },
  suspectedName: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  confidenceLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  suspectedActions: { flexDirection: 'row', gap: theme.spacing.md },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
    backgroundColor: 'rgba(212,248,112,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212,248,112,0.2)',
  },
  dismissBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionLabel: { fontFamily: 'Inter_500Medium', fontSize: 12 },

  // Log button
  logBtnContainer: { marginBottom: theme.spacing.giant },

  // Recent logs
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  dividerLabel: { color: theme.colors.textSecondary },
  divider: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  loader: { alignItems: 'center', paddingVertical: theme.spacing.xxxl },

  timelineCard: {
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  timelineDate: { color: theme.colors.textSecondary, marginBottom: 3 },
  logTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  moodLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  logChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },

  mealIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  mealFoods: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: theme.spacing.giant, gap: theme.spacing.md },
  emptyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: theme.spacing.sm,
  },
  emptyTitle: { color: theme.colors.textPrimary, marginTop: theme.spacing.sm },
  emptyBody: { color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: theme.spacing.xxxl },

  // Timeline specific additions
  moodDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginTop: 4,
    ...theme.shadows.glow,
  },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
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
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center', marginBottom: theme.spacing.xxl,
  },
  sheetTitle: { marginBottom: theme.spacing.xxxl },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.xxxl,
    alignItems: 'flex-end',
  },
  moodBtn: { alignItems: 'center', gap: theme.spacing.sm, minHeight: 80, justifyContent: 'flex-end' },
  moodBtnLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  modalMoodDot: { width: 44, height: 44, borderRadius: 22 },
  anyLabel: { color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
  symptomChips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.xxxl },
  cancelBtn: { alignItems: 'center', marginTop: theme.spacing.lg, paddingVertical: theme.spacing.md },
});

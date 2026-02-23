import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { AlertTriangle, Edit3, Utensils } from 'lucide-react-native';
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
  sad:     theme.colors.secondary,
  neutral: theme.colors.accent,
  happy:   theme.colors.primary,
};
const MOOD_LABEL: Record<string, string> = {
  sad:     'Bad',
  neutral: 'Okay',
  happy:   'Good',
};

const DOT_COLOR: Record<string, string> = {
  happy:   '#D4F870',
  neutral: '#F5C97A',
  sad:     '#E05D4C',
  none:    '#2A322E',
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

// ── Data helpers ───────────────────────────────────────────────────────────

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

type MoodValue = 'sad' | 'neutral' | 'happy' | null;

function buildDayData(logs: any[]): { day: string; mood: MoodValue; isToday: boolean }[] {
  const byDay: Record<string, Record<string, number>> = {};
  for (const log of logs) {
    const key = toDateKey(new Date(log.timestamp));
    if (!byDay[key]) byDay[key] = { sad: 0, neutral: 0, happy: 0 };
    const m = log.mood as string;
    if (m in byDay[key]) byDay[key][m]++;
  }

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: { day: string; mood: MoodValue; isToday: boolean }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    const counts = byDay[key];
    let mood: MoodValue = null;

    if (counts) {
      if (counts.happy >= counts.sad && counts.happy >= counts.neutral) mood = 'happy';
      else if (counts.sad >= counts.neutral) mood = 'sad';
      else mood = 'neutral';
    }

    result.push({ day: DAY_NAMES[d.getDay()], mood, isToday: i === 0 });
  }

  return result;
}

function countSymptoms(logs: any[]): { name: string; count: number }[] {
  const freq: Record<string, number> = {};
  for (const log of logs) {
    for (const tag of (log.tags ?? []) as string[]) {
      freq[tag] = (freq[tag] ?? 0) + 1;
    }
  }
  return Object.entries(freq)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// ── MoodTrendChart ─────────────────────────────────────────────────────────

const AnimatedDot = ({
  mood,
  isToday,
  delay,
}: {
  mood: MoodValue;
  isToday: boolean;
  delay: number;
}) => {
  const scale = useSharedValue(0);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.4)) }),
    );
  }, []);

  const color = mood ? DOT_COLOR[mood] : DOT_COLOR.none;

  return (
    <Animated.View style={animStyle}>
      <View style={[chartStyles.dot, { backgroundColor: color }, isToday && chartStyles.dotToday]} />
    </Animated.View>
  );
};

const MoodTrendChart = ({ logHistory }: { logHistory: any[] }) => {
  const dayData = buildDayData(logHistory);
  const goodDays = dayData.filter(d => d.mood === 'happy').length;
  const hasAnyData = dayData.some(d => d.mood !== null);

  return (
    <Card variant="glass" padding="xl" style={chartStyles.trendCard} glow>
      <View style={chartStyles.trendHeader}>
        <Text variant="subtitle" weight="bold">7-Day Gut Trend</Text>
        <View style={chartStyles.scoreBadge}>
          <Text variant="caption" weight="bold" color={theme.colors.primary}>
            {hasAnyData ? `${goodDays}/7 good` : 'No logs yet'}
          </Text>
        </View>
      </View>

      <View style={chartStyles.columns}>
        {dayData.map((item, i) => (
          <View key={i} style={chartStyles.column}>
            <AnimatedDot mood={item.mood} isToday={item.isToday} delay={i * 60} />
            <Text
              variant="caption"
              color={item.isToday ? theme.colors.text.primary : theme.colors.text.tertiary}
              style={[chartStyles.dayLabel, item.isToday && chartStyles.dayLabelToday]}
            >
              {item.day}
            </Text>
          </View>
        ))}
      </View>

      <View style={chartStyles.legend}>
        {[
          { label: 'Good', color: DOT_COLOR.happy },
          { label: 'Okay', color: DOT_COLOR.neutral },
          { label: 'Bad',  color: DOT_COLOR.sad },
        ].map(item => (
          <View key={item.label} style={chartStyles.legendItem}>
            <View style={[chartStyles.legendDot, { backgroundColor: item.color }]} />
            <Text variant="caption" color={theme.colors.text.tertiary}>{item.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

const chartStyles = StyleSheet.create({
  trendCard: {
    marginBottom: theme.spacing.giant,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  scoreBadge: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  columns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  column: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  dotToday: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  dayLabel: {
    fontSize: 10,
  },
  dayLabelToday: {
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

// ── TriggerBar ─────────────────────────────────────────────────────────────

const TriggerBar = ({ bad, good }: { bad: number; good: number }) => {
  const total = bad + good;
  const badRatio = total > 0 ? bad / total : 0;

  const widthAnim = useSharedValue(0);

  const badBarStyle = useAnimatedStyle(() => ({ flex: widthAnim.value }));
  const goodBarStyle = useAnimatedStyle(() => ({ flex: Math.max(0, 1 - widthAnim.value) }));

  useEffect(() => {
    widthAnim.value = withTiming(badRatio, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [badRatio]);

  if (total === 0) return null;

  return (
    <View style={barStyles.wrapper}>
      <View style={barStyles.track}>
        <Animated.View style={[barStyles.barBad, badBarStyle]} />
        <Animated.View style={[barStyles.barGood, goodBarStyle]} />
      </View>
      <Text variant="caption" color={theme.colors.text.tertiary} style={{ marginTop: theme.spacing.xs }}>
        Bad {bad}× / Good {good}×
      </Text>
    </View>
  );
};

const barStyles = StyleSheet.create({
  wrapper: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  track: {
    height: 6,
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceElevated,
  },
  barBad: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 3,
  },
  barGood: {
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
});

// ── SymptomFrequency ───────────────────────────────────────────────────────

const SymptomFrequency = ({ logHistory }: { logHistory: any[] }) => {
  const symptoms = countSymptoms(logHistory);
  if (symptoms.length === 0) return null;

  const maxCount = symptoms[0].count;

  return (
    <View style={sympStyles.container}>
      <Text variant="label" color={theme.colors.text.tertiary} style={sympStyles.label}>
        Top Symptoms
      </Text>
      <Card variant="surface" padding="lg">
        {symptoms.map((item, i) => {
          const ratio = item.count / maxCount;
          const dotSize = 8 + ratio * 10;
          return (
            <View key={i} style={sympStyles.row}>
              <View
                style={[
                  sympStyles.dot,
                  {
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    opacity: 0.4 + ratio * 0.6,
                  },
                ]}
              />
              <Text variant="bodySmall" weight="medium" style={sympStyles.name}>
                {item.name}
              </Text>
              <Text variant="caption" color={theme.colors.text.tertiary}>
                {item.count}×
              </Text>
            </View>
          );
        })}
      </Card>
    </View>
  );
};

const sympStyles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.giant,
  },
  label: {
    marginBottom: theme.spacing.lg,
    letterSpacing: theme.typography.letterSpacing.extraWide,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  dot: {
    backgroundColor: theme.colors.accent,
  },
  name: {
    flex: 1,
  },
});

// ── Main Screen ────────────────────────────────────────────────────────────

export const MyGutScreen = () => {
  const { onboardingAnswers, setLearnedTriggers } = useAppStore();

  const [timeline, setTimeline]         = useState<any[]>([]);
  const [logHistory, setLogHistory]     = useState<any[]>([]);
  const [triggerFoods, setTriggerFoods] = useState<TriggerFood[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showLog, setShowLog]           = useState(false);
  const [mood, setMood]                 = useState<'sad' | 'neutral' | 'happy' | null>(null);
  const [symptoms, setSymptoms]         = useState<string[]>([]);
  const [submitting, setSubmitting]     = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [logsResult, mealsResult, triggersResult] = await Promise.allSettled([
        gutService.getRecentLogs(30),
        gutService.getRecentMeals(10),
        gutService.getTriggerFoods(),
      ]);

      const logsData     = logsResult.status     === 'fulfilled' ? logsResult.value     : [];
      const mealsData    = mealsResult.status    === 'fulfilled' ? mealsResult.value    : [];
      const triggersData = triggersResult.status === 'fulfilled' ? triggersResult.value : [];

      setLogHistory(logsData);

      const merged = [
        ...logsData.slice(0, 10).map((l: any)  => ({ ...l, _type: 'log'  })),
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

  const confirmedTriggers = triggerFoods.filter(
    t => t.user_confirmed === true || t.confidence === 'High'
  );
  const suspectedTriggers = triggerFoods.filter(
    t => t.user_confirmed !== true && t.confidence !== null && t.confidence !== 'High'
  );

  const allConfirmedNames = [
    ...onboardingAnswers.knownTriggers,
    ...confirmedTriggers.map(t => t.food_name),
  ].filter((v, i, a) => a.indexOf(v) === i);

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
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (foodName: string) => {
    await gutService.confirmTrigger(foodName);
    await loadData();
  };

  const handleDismiss = async (foodName: string) => {
    await gutService.dismissTrigger(foodName);
    await loadData();
  };

  return (
    <Screen scroll padding={false}>
      <View style={styles.header}>
        <Text variant="display">My Gut.</Text>
        <Text variant="body" color={theme.colors.text.secondary}>
          Track your triggers and decode your comfort.
        </Text>
      </View>

      <View style={styles.content}>
        {/* ── 7-Day Gut Trend ── */}
        <MoodTrendChart logHistory={logHistory} />

        {/* ── Trigger Summary Card ── */}
        <Card variant="glass" padding="xl" style={styles.summaryCard} glow>
          <View style={styles.sectionHeader}>
            <AlertTriangle color={theme.colors.accent} size={20} strokeWidth={2} />
            <Text variant="subtitle" weight="bold">
              {allConfirmedNames.length} Confirmed Triggers
            </Text>
          </View>

          {allConfirmedNames.length > 0 ? (
            <View style={styles.chipRow}>
              {allConfirmedNames.map((name, i) => (
                <Chip key={i} status="risky" label={name.charAt(0).toUpperCase() + name.slice(1)} />
              ))}
            </View>
          ) : (
            <Text variant="bodySmall" color={theme.colors.text.tertiary}>
              No triggers confirmed yet. Your profile evolves as you log meals.
            </Text>
          )}
        </Card>

        {/* ── Suspected Triggers ── */}
        {suspectedTriggers.length > 0 && (
          <View style={styles.section}>
            <Text variant="label" color={theme.colors.text.tertiary} style={styles.sectionLabel}>Suspected Triggers</Text>
            {suspectedTriggers.map((t, i) => (
              <Card key={i} variant="surface" padding="lg" style={styles.suspectedCard}>
                <View style={styles.suspectedHeader}>
                  <Text variant="body" weight="medium">{t.food_name.charAt(0).toUpperCase() + t.food_name.slice(1)}</Text>
                  <View style={[styles.confidencePill, { backgroundColor: t.confidence === 'Medium' ? theme.colors.accent + '20' : theme.colors.text.tertiary + '20' }]}>
                    <Text variant="caption" color={t.confidence === 'Medium' ? theme.colors.accent : theme.colors.text.tertiary}>
                      {t.confidence} Confidence
                    </Text>
                  </View>
                </View>

                {/* Animated risk bar */}
                <TriggerBar bad={t.bad_occurrences} good={t.good_occurrences} />

                <View style={styles.suspectedActions}>
                  <Button label="Confirm" onPress={() => handleConfirm(t.food_name)} variant="soft" size="sm" style={{ flex: 1 }} />
                  <Button label="Dismiss" onPress={() => handleDismiss(t.food_name)} variant="ghost" size="sm" style={{ flex: 1 }} />
                </View>
              </Card>
            ))}
          </View>
        )}

        <Button
          label="Log how you feel"
          onPress={openLog}
          variant="primary"
          style={styles.mainLogBtn}
          leftIcon={<Edit3 color={theme.colors.text.inverse} size={18} strokeWidth={2.5} />}
        />

        {/* ── Symptom Frequency ── */}
        {logHistory.length > 0 && <SymptomFrequency logHistory={logHistory} />}

        {/* ── Recent Timeline ── */}
        <View style={styles.section}>
          <Text variant="label" color={theme.colors.text.tertiary} style={styles.sectionLabel}>Recent Timeline</Text>

          {loading ? (
            <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
          ) : timeline.length > 0 ? (
            timeline.map((entry, i) => (
              <Card key={i} variant="outline" padding="md" style={styles.timelineCard}>
                <View style={styles.timelineRow}>
                  {entry._type === 'meal' ? (
                    <View style={styles.typeIcon}>
                      <Utensils color={theme.colors.text.secondary} size={16} />
                    </View>
                  ) : (
                    <View style={[styles.moodDot, { backgroundColor: MOOD_COLOR[entry.mood ?? 'neutral'] }]} />
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={styles.timelineTopRow}>
                      <Text variant="caption">{formatDate(entry.timestamp)}</Text>
                      {entry._type === 'log' && (
                        <Text variant="caption" color={MOOD_COLOR[entry.mood ?? 'neutral']} weight="bold">
                          {MOOD_LABEL[entry.mood ?? 'neutral']}
                        </Text>
                      )}
                    </View>
                    <Text variant="bodySmall" weight="medium" numberOfLines={1}>
                      {entry._type === 'meal'
                        ? (entry.foods as string[]).join(', ')
                        : (entry.tags ?? []).join(' · ')}
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Text variant="bodySmall" color={theme.colors.text.tertiary} align="center" style={{ marginTop: 20 }}>
              Your timeline is empty. Start logging to see insights.
            </Text>
          )}
        </View>
      </View>

      <Modal visible={showLog} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.dragHandle} />
            <Text variant="title">How are you feeling?</Text>
            <Text variant="bodySmall" color={theme.colors.text.secondary} style={{ marginBottom: theme.spacing.xxxl }}>
              Your mood and symptoms help us identify triggers.
            </Text>

            <View style={styles.moodRow}>
              {(['sad', 'neutral', 'happy'] as const).map(m => (
                <TouchableOpacity key={m} onPress={() => setMood(m)} style={styles.moodBtn}>
                  <View style={[styles.modalMoodDot, {
                    backgroundColor: MOOD_COLOR[m],
                    opacity: mood === m ? 1 : 0.3,
                    borderWidth: mood === m ? 2 : 0,
                    borderColor: theme.colors.text.primary,
                  }]} />
                  <Text variant="caption" color={mood === m ? theme.colors.text.primary : theme.colors.text.tertiary}>
                    {MOOD_LABEL[m]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text variant="label" style={{ marginBottom: theme.spacing.md }}>Symptoms</Text>
            <View style={styles.symptomChips}>
              {SYMPTOM_CHIPS.map(s => (
                <Chip key={s} label={s} selected={symptoms.includes(s)} onPress={() => toggleSymptom(s)} />
              ))}
            </View>

            <Button label="Save Entry" onPress={handleSave} loading={submitting} disabled={!mood} />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLog(false)}>
              <Text variant="label" color={theme.colors.text.tertiary}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.colossal,
  },
  summaryCard: {
    marginBottom: theme.spacing.giant,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.giant,
  },
  sectionLabel: {
    marginBottom: theme.spacing.lg,
    letterSpacing: theme.typography.letterSpacing.extraWide,
  },
  suspectedCard: {
    marginBottom: theme.spacing.md,
  },
  suspectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  confidencePill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radii.full,
  },
  suspectedActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  mainLogBtn: {
    marginBottom: theme.spacing.giant,
  },
  timelineCard: {
    marginBottom: theme.spacing.sm,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  timelineTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.xxl,
    borderTopRightRadius: theme.radii.xxl,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.giant,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing.xl,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.giant,
  },
  moodBtn: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  modalMoodDot: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  symptomChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.giant,
  },
  cancelBtn: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../theme/theme';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Icon3D } from '../components/Icon3D';
import { SkeletonCard } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { gutService } from '../services/gutService';
import { supabase } from '../config/supabase';
import { useAppStore } from '../store/useAppStore';
import { GutTrendChart, TrendDay } from '../components/GutTrendChart';
import { ScreenHeader } from '../components/ScreenHeader';

type Tab = 'calendar' | 'insights';

// Simple calendar month view
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function buildTrendData(logs: { mood: string; timestamp: string }[]): {
  days: TrendDay[];
  weekChange: number | null;
} {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;

  // Group by calendar day
  const dayMap: Record<string, { good: number; total: number }> = {};
  logs.forEach(log => {
    const key = new Date(log.timestamp).toDateString();
    if (!dayMap[key]) dayMap[key] = { good: 0, total: 0 };
    dayMap[key].total++;
    if (log.mood !== 'sad') dayMap[key].good++;
  });

  // Past 7 days array
  const days: TrendDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const key = date.toDateString();
    const data = dayMap[key];
    days.push({
      label: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
      score: data ? data.good / data.total : null,
      isToday: i === 0,
    });
  }

  // Week-over-week comparison
  const thisWeek = logs.filter(l => new Date(l.timestamp).getTime() >= sevenDaysAgo);
  const lastWeek = logs.filter(l => {
    const t = new Date(l.timestamp).getTime();
    return t >= fourteenDaysAgo && t < sevenDaysAgo;
  });
  const thisScore = thisWeek.length > 0
    ? thisWeek.filter(l => l.mood !== 'sad').length / thisWeek.length : null;
  const lastScore = lastWeek.length > 0
    ? lastWeek.filter(l => l.mood !== 'sad').length / lastWeek.length : null;
  const weekChange = thisScore !== null && lastScore !== null
    ? Math.round((thisScore - lastScore) * 100) : null;

  return { days, weekChange };
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

export const MyGutScreen: React.FC = () => {
  const { showToast } = useToast();
  const learnedTriggers = useAppStore((s) => s.learnedTriggers);
  const setLearnedTriggers = useAppStore((s) => s.setLearnedTriggers);
  const [tab, setTab] = useState<Tab>('calendar');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Calendar state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(today.toDateString());
  const [dateLogs, setDateLogs] = useState<{ meals: any[]; gutLogs: any[] }>({ meals: [], gutLogs: [] });
  const [dateLoading, setDateLoading] = useState(false);

  // Dot markers per date
  const [mealDates, setMealDates] = useState<Set<string>>(new Set());
  const [logDates, setLogDates] = useState<Set<string>>(new Set());

  // Insights state
  const [triggerFoods, setTriggerFoods] = useState<any[]>([]);
  const [mealCount, setMealCount] = useState(0);
  const [gutLogCount, setGutLogCount] = useState(0);
  const [trendDays, setTrendDays] = useState<TrendDay[]>([]);
  const [weekChange, setWeekChange] = useState<number | null>(null);
  const MEALS_REQUIRED = 5;
  const LOGS_FOR_TREND = 3;

  useEffect(() => {
    loadAll();
    loadDateLogs(today.toDateString());
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const [meals, logs, triggers, trendResult] = await Promise.all([
        gutService.getRecentMeals(50),
        gutService.getRecentLogs(50),
        gutService.getTriggerFoods(),
        supabase
          .from('gut_logs')
          .select('mood, timestamp')
          .eq('user_id', user.id)
          .gte('timestamp', fourteenDaysAgo)
          .order('timestamp', { ascending: true }),
      ]);

      setMealCount(meals.length);
      setGutLogCount(logs.length);
      setTriggerFoods(triggers);

      if (trendResult.data?.length) {
        const { days, weekChange: change } = buildTrendData(trendResult.data);
        setTrendDays(days);
        setWeekChange(change);
      }

      const mSet = new Set(meals.map((m: any) => new Date(m.timestamp).toDateString()));
      const lSet = new Set(logs.map((l: any) => new Date(l.timestamp).toDateString()));
      setMealDates(mSet);
      setLogDates(lSet);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAll();
  }, []);

  const loadDateLogs = async (dateStr: string) => {
    setDateLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const date = new Date(dateStr);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString();

      const [{ data: meals }, { data: logs }] = await Promise.all([
        supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .gte('timestamp', startOfDay)
          .lte('timestamp', endOfDay)
          .order('timestamp', { ascending: true }),
        supabase
          .from('gut_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('timestamp', startOfDay)
          .lte('timestamp', endOfDay)
          .order('timestamp', { ascending: true }),
      ]);

      setDateLogs({ meals: meals ?? [], gutLogs: logs ?? [] });
    } catch {
      // silent
    } finally {
      setDateLoading(false);
    }
  };

  const handleDayPress = (dateStr: string) => {
    setSelectedDate(dateStr);
    loadDateLogs(dateStr);
  };

  const handleConfirmTrigger = async (food: string) => {
    try {
      await gutService.confirmTrigger(food);
      setTriggerFoods((prev) =>
        prev.map((t) => t.food_name === food ? { ...t, user_confirmed: true } : t)
      );
      if (!learnedTriggers.includes(food)) {
        setLearnedTriggers([...learnedTriggers, food]);
      }
      showToast(`${food} confirmed as trigger`, 'success');
    } catch {
      showToast('Could not confirm trigger', 'error');
    }
  };

  const handleDismissTrigger = async (food: string) => {
    try {
      await gutService.dismissTrigger(food);
      setTriggerFoods((prev) => prev.filter((t) => t.food_name !== food));
      setLearnedTriggers(learnedTriggers.filter((f) => f !== food));
      showToast(`${food} removed`, 'info');
    } catch {
      showToast('Could not dismiss trigger', 'error');
    }
  };

  const { firstDay, daysInMonth } = getMonthDays(currentYear, currentMonth);

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const CONFIDENCE_COLORS: Record<string, string> = {
    High: theme.colors.danger,
    Medium: theme.colors.caution,
    Low: theme.colors.textTertiary,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header with segmented tabs */}
      <ScreenHeader
        title="My Gut Journal"
        below={
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'calendar' && styles.tabBtnActive]}
              onPress={() => setTab('calendar')}
            >
              <Icon name="CalendarDays" size={14} color={tab === 'calendar' ? theme.colors.primaryForeground : theme.colors.textSecondary} />
              <Text variant="caption" color={tab === 'calendar' ? theme.colors.primaryForeground : theme.colors.textSecondary}>
                Calendar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'insights' && styles.tabBtnActive]}
              onPress={() => setTab('insights')}
            >
              <Icon name="TrendingUp" size={14} color={tab === 'insights' ? theme.colors.primaryForeground : theme.colors.textSecondary} />
              <Text variant="caption" color={tab === 'insights' ? theme.colors.primaryForeground : theme.colors.textSecondary}>
                Insights
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {tab === 'calendar' ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
        >
          {/* Month nav */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} hitSlop={12}>
              <Icon name="ChevronLeft" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }}>{monthName}</Text>
            <TouchableOpacity onPress={nextMonth} hitSlop={12}>
              <Icon name="ChevronRight" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Day headers */}
          <View style={styles.calGrid}>
            {DAYS.map((d) => (
              <View key={d} style={styles.dayHeader}>
                <Text variant="caption" color={theme.colors.textTertiary} align="center">{d}</Text>
              </View>
            ))}

            {/* Empty cells for first day offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCellEmpty} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = new Date(currentYear, currentMonth, day).toDateString();
              const isToday = dateStr === today.toDateString();
              const isSelected = dateStr === selectedDate;
              const hasMeal = mealDates.has(dateStr);
              const hasLog = logDates.has(dateStr);

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    isToday && styles.dayCellToday,
                    isSelected && styles.dayCellSelected,
                  ]}
                  onPress={() => handleDayPress(dateStr)}
                >
                  <Text
                    variant="caption"
                    color={isSelected ? theme.colors.primaryForeground : isToday ? theme.colors.primary : theme.colors.text}
                    align="center"
                  >
                    {day}
                  </Text>
                  {(hasMeal || hasLog) && (
                    <View style={styles.dotRow}>
                      {hasMeal && <View style={[styles.dot, { backgroundColor: theme.colors.safe }]} />}
                      {hasLog && <View style={[styles.dot, { backgroundColor: theme.colors.caution }]} />}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected date logs */}
          <View style={styles.dateLogs}>
            <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }} color={theme.colors.textSecondary}>
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>

            {dateLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : dateLogs.meals.length === 0 && dateLogs.gutLogs.length === 0 ? (
              <View style={styles.noLogs}>
                <Icon3D name="spiral_calendar" size={56} animated animationType="float" />
                <Text variant="body" color={theme.colors.textTertiary} align="center">
                  Nothing logged on this day
                </Text>
              </View>
            ) : (
              <>
                {[
                  ...dateLogs.meals.map((m: any) => ({ type: 'meal' as const, ts: new Date(m.timestamp).getTime(), data: m })),
                  ...dateLogs.gutLogs.map((g: any) => ({ type: 'gut' as const, ts: new Date(g.timestamp).getTime(), data: g })),
                ]
                  .sort((a, b) => a.ts - b.ts)
                  .map((event) =>
                    event.type === 'meal' ? (
                      <Card key={`meal-${event.data.id}`} variant="bordered" style={styles.logCard}>
                        <View style={styles.logRow}>
                          <Icon3D name="pizza" size={24} />
                          <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }}>
                            {event.data.name || 'Meal'}
                          </Text>
                          <Text variant="caption" color={theme.colors.textTertiary} style={styles.logTime}>
                            {new Date(event.data.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </Text>
                        </View>
                        {event.data.foods?.length > 0 && (
                          <View style={styles.logChips}>
                            {event.data.foods.slice(0, 4).map((f: string) => (
                              <Chip key={f} label={f} size="sm" variant="selectable" />
                            ))}
                            {event.data.foods.length > 4 && (
                              <Text variant="caption" color={theme.colors.textTertiary}>+{event.data.foods.length - 4}</Text>
                            )}
                          </View>
                        )}
                      </Card>
                    ) : (
                      <Card key={`gut-${event.data.id}`} variant="bordered" style={styles.logCard}>
                        <View style={styles.logRow}>
                          <Icon3D
                            name={event.data.mood === 'happy' ? 'face_with_smile' : event.data.mood === 'neutral' ? 'neutral_face' : 'face_with_sad'}
                            size={24}
                          />
                          <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }}>
                            Gut moment
                          </Text>
                          <Text variant="caption" color={theme.colors.textTertiary} style={styles.logTime}>
                            {new Date(event.data.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </Text>
                        </View>
                        {event.data.tags?.length > 0 && (
                          <View style={styles.logChips}>
                            {event.data.tags.map((t: string) => (
                              <Chip key={t} label={t} size="sm" variant="selectable" />
                            ))}
                          </View>
                        )}
                      </Card>
                    )
                  )}
              </>
            )}
          </View>
        </ScrollView>
      ) : (
        /* Insights tab */
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
        >
          {loading ? (
            <View style={styles.skeletons}>
              <SkeletonCard lines={4} />
              <SkeletonCard lines={3} />
            </View>
          ) : (
            <>
              {/* ── Gut Trend ─────────────────────────────── */}
              {gutLogCount >= LOGS_FOR_TREND ? (
                <GutTrendChart days={trendDays} weekChange={weekChange} />
              ) : (
                <Card variant="bordered" style={styles.trendUnlock}>
                  <Icon name="TrendingUp" size={32} color={theme.colors.textSecondary} />
                  <View style={styles.trendUnlockText}>
                    <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }}>
                      Your gut trend chart
                    </Text>
                    <Text variant="caption" color={theme.colors.textSecondary}>
                      Log {LOGS_FOR_TREND - gutLogCount} more gut moment{LOGS_FOR_TREND - gutLogCount !== 1 ? 's' : ''} to see how your week looks
                    </Text>
                  </View>
                </Card>
              )}

              {/* ── Potential Triggers ────────────────────── */}
              <View style={styles.insightSection}>
                <View style={styles.sectionHeader}>
                  <Text variant="h3">Potential Triggers</Text>
                  {triggerFoods.length > 0 && (
                    <View style={styles.countBadge}>
                      <Text variant="caption" color={theme.colors.primaryForeground} style={styles.countText}>
                        {triggerFoods.length}
                      </Text>
                    </View>
                  )}
                </View>

                {mealCount < MEALS_REQUIRED ? (
                  <Card variant="bordered" style={styles.triggersUnlock}>
                    <View style={styles.unlockBar}>
                      <View style={[styles.unlockFill, { width: `${(mealCount / MEALS_REQUIRED) * 100}%` }]} />
                    </View>
                    <Text variant="caption" color={theme.colors.textSecondary}>
                      {mealCount} / {MEALS_REQUIRED} meals logged · log {MEALS_REQUIRED - mealCount} more to detect triggers
                    </Text>
                  </Card>
                ) : triggerFoods.length === 0 ? (
                  <Text variant="body" color={theme.colors.textTertiary}>
                    No triggers detected yet — keep logging!
                  </Text>
                ) : (
                  triggerFoods
                    .sort((a, b) => {
                      const order: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
                      return (order[a.confidence] ?? 3) - (order[b.confidence] ?? 3);
                    })
                    .map((trigger) => (
                      <Card key={trigger.food_name} variant="bordered" style={styles.triggerCard}>
                        <View style={styles.triggerHeader}>
                          <View style={styles.triggerInfo}>
                            <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }}>
                              {trigger.food_name}
                            </Text>
                            <Text variant="caption" color={theme.colors.textSecondary}>
                              {trigger.bad_occurrences}× linked to symptoms
                            </Text>
                            {trigger.symptoms && Object.keys(trigger.symptoms).length > 0 && (
                              <View style={styles.symptomChips}>
                                {Object.keys(trigger.symptoms).slice(0, 3).map((s) => (
                                  <View key={s} style={styles.symptomChip}>
                                    <Text variant="caption" color={theme.colors.textTertiary} style={styles.symptomText}>
                                      {s}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                          <View style={[styles.confidenceBadge, { backgroundColor: `${CONFIDENCE_COLORS[trigger.confidence] ?? theme.colors.textTertiary}18` }]}>
                            {trigger.confidence === 'High' && (
                              <Icon name="Flame" size={14} color={theme.colors.danger} />
                            )}
                            <Text variant="caption" color={CONFIDENCE_COLORS[trigger.confidence] ?? theme.colors.textTertiary} style={styles.confidenceText}>
                              {trigger.confidence}
                            </Text>
                          </View>
                        </View>
                        {!trigger.user_confirmed && (
                          <View style={styles.triggerActions}>
                            <Button
                              variant="secondary"
                              size="sm"
                              onPress={() => handleConfirmTrigger(trigger.food_name)}
                            >
                              Confirm Trigger
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onPress={() => handleDismissTrigger(trigger.food_name)}
                            >
                              Not a Trigger
                            </Button>
                          </View>
                        )}
                        {trigger.user_confirmed && (
                          <View style={styles.confirmedBadge}>
                            <Icon name="CheckCircle2" size={16} color={theme.colors.safe} />
                            <Text variant="caption" color={theme.colors.safe}>Confirmed by you</Text>
                          </View>
                        )}
                      </Card>
                    ))
                )}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  // header style now handled by ScreenHeader component
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.radius.full,
  },
  tabBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayHeader: {
    width: `${100 / 7}%`,
    paddingVertical: theme.spacing.xs,
    alignItems: 'center',
  },
  dayCellEmpty: {
    width: `${100 / 7}%`,
    height: 44,
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    gap: 2,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  dayCellSelected: {
    backgroundColor: theme.colors.primary,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dateLogs: {
    gap: theme.spacing.sm,
  },
  noLogs: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  logCard: {
    gap: theme.spacing.sm,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logTime: {
    marginLeft: 'auto',
  },
  logChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  skeletons: {
    gap: theme.spacing.sm,
  },
  trendUnlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  trendUnlockText: {
    flex: 1,
    gap: 4,
  },
  triggersUnlock: {
    gap: theme.spacing.sm,
  },
  unlockBar: {
    width: '100%',
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  unlockFill: {
    height: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
  },
  insightSection: {
    gap: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  countBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
  },
  triggerCard: {
    gap: theme.spacing.sm,
  },
  triggerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  triggerInfo: {
    gap: 4,
    flex: 1,
  },
  symptomChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  symptomChip: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  symptomText: {
    fontSize: 10,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  confidenceText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
  },
  triggerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

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

type Tab = 'calendar' | 'insights';

// Simple calendar month view
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

export const MyGutScreen: React.FC = () => {
  const { showToast } = useToast();
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
  const MEALS_REQUIRED = 5;

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [meals, logs, triggers] = await Promise.all([
        gutService.getRecentMeals(50),
        gutService.getRecentLogs(50),
        gutService.getTriggerFoods(),
      ]);

      setMealCount(meals.length);
      setTriggerFoods(triggers);

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
      showToast(`${food} confirmed as trigger`, 'success');
    } catch {
      showToast('Could not confirm trigger', 'error');
    }
  };

  const handleDismissTrigger = async (food: string) => {
    try {
      await gutService.dismissTrigger(food);
      setTriggerFoods((prev) => prev.filter((t) => t.food_name !== food));
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

      {/* Header */}
      <View style={styles.header}>
        <Text variant="h3">My Gut Journal</Text>
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
      </View>

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
                {dateLogs.meals.map((meal: any) => (
                  <Card key={meal.id} variant="bordered" style={styles.logCard}>
                    <View style={styles.logRow}>
                      <Icon3D name="pizza" size={24} />
                      <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }}>
                        {meal.name || 'Meal'}
                      </Text>
                      <Text variant="caption" color={theme.colors.textTertiary} style={styles.logTime}>
                        {new Date(meal.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </Text>
                    </View>
                    {meal.foods?.length > 0 && (
                      <View style={styles.logChips}>
                        {meal.foods.slice(0, 4).map((f: string) => (
                          <Chip key={f} label={f} size="sm" variant="selectable" />
                        ))}
                        {meal.foods.length > 4 && (
                          <Text variant="caption" color={theme.colors.textTertiary}>+{meal.foods.length - 4}</Text>
                        )}
                      </View>
                    )}
                  </Card>
                ))}
                {dateLogs.gutLogs.map((log: any) => {
                  return (
                    <Card key={log.id} variant="bordered" style={styles.logCard}>
                      <View style={styles.logRow}>
                        <Icon3D
                          name={log.mood === 'happy' ? 'face_with_smile' : log.mood === 'neutral' ? 'neutral_face' : 'face_with_head_bandage'}
                          size={24}
                        />
                        <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }}>
                          Gut moment
                        </Text>
                        <Text variant="caption" color={theme.colors.textTertiary} style={styles.logTime}>
                          {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </Text>
                      </View>
                      {log.tags?.length > 0 && (
                        <View style={styles.logChips}>
                          {log.tags.map((t: string) => (
                            <Chip key={t} label={t} size="sm" variant="selectable" />
                          ))}
                        </View>
                      )}
                    </Card>
                  );
                })}
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
          ) : mealCount < MEALS_REQUIRED ? (
            <View style={styles.unlockSection}>
              <Icon3D name="party_popper" size={64} animated animationType="pulse" />
              <Text variant="h3" align="center">Unlock Trigger Insights</Text>
              <Text variant="body" color={theme.colors.textSecondary} align="center">
                Log {MEALS_REQUIRED - mealCount} more meal{MEALS_REQUIRED - mealCount !== 1 ? 's' : ''} to unlock trigger insights
              </Text>
              <View style={styles.unlockBar}>
                <View style={[styles.unlockFill, { width: `${(mealCount / MEALS_REQUIRED) * 100}%` }]} />
              </View>
              <Text variant="caption" color={theme.colors.textTertiary}>
                {mealCount} / {MEALS_REQUIRED} meals tracked
              </Text>
              <Text variant="bodySmall" color={theme.colors.textTertiary} align="center">
                GutBuddy needs a few data points before patterns emerge
              </Text>
            </View>
          ) : (
            <>
              {/* Trigger Foods */}
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

                {triggerFoods.length === 0 ? (
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
                          </View>
                          <View style={[styles.confidenceBadge, { backgroundColor: `${CONFIDENCE_COLORS[trigger.confidence] ?? theme.colors.textTertiary}18` }]}>
                            {trigger.confidence === 'High' && (
                              <Icon3D name="fire" size={14} />
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
                            <Icon3D name="check_mark_button" size={18} />
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
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
  },
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
  unlockSection: {
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
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
    gap: 2,
    flex: 1,
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

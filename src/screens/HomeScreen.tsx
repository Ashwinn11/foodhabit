import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { Icon3D } from '../components/Icon3D';
import { EmptyState } from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { BottomSheet } from '../components/BottomSheet';
import { Chip } from '../components/Chip';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../config/supabase';
import { gutService } from '../services/gutService';
import * as Haptics from 'expo-haptics';

const MOODS = [
  { id: 'happy', icon: 'face_with_smile' as const, label: 'Good' },
  { id: 'neutral', icon: 'neutral_face' as const, label: 'OK' },
  { id: 'sad', icon: 'face_with_head_bandage' as const, label: 'Rough' },
] as const;

const SYMPTOMS = [
  'Bloating', 'Gas', 'Cramping', 'Nausea', 'Heartburn',
  'Brain Fog', 'Fatigue', 'Diarrhea', 'Constipation',
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [meals, setMeals] = useState<any[]>([]);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState<'happy' | 'neutral' | 'sad' | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [loggingMood, setLoggingMood] = useState(false);

  const [userName, setUserName] = useState('');
  const [triggerAlert, setTriggerAlert] = useState<{ food: string; count: number } | null>(null);

  useEffect(() => {
    loadData();
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', data.user.id)
        .maybeSingle();
      const name = profile?.full_name ?? data.user.email?.split('@')[0] ?? '';
      setUserName(name.split(' ')[0]);
    }
  };

  const loadData = async () => {
    try {
      const [mealData, triggerData] = await Promise.all([
        gutService.getRecentMeals(5),
        supabase
          .from('trigger_foods')
          .select('food_name, bad_occurrences, confidence')
          .eq('confidence', 'High')
          .order('bad_occurrences', { ascending: false })
          .limit(1),
      ]);

      // Filter to today's meals
      const today = new Date().toDateString();
      const todayMeals = mealData.filter(
        (m: any) => new Date(m.timestamp).toDateString() === today
      );
      setMeals(todayMeals);

      if (triggerData.data?.length) {
        const t = triggerData.data[0];
        setTriggerAlert({ food: t.food_name, count: t.bad_occurrences });
      }
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleMoodTap = (mood: 'happy' | 'neutral' | 'sad') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedMood(mood);
    setSheetVisible(true);
  };

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleLogMood = async () => {
    if (!selectedMood) return;
    setLoggingMood(true);
    try {
      await gutService.logGutMoment({ mood: selectedMood, symptoms: selectedSymptoms });
      setSheetVisible(false);
      setSelectedMood(null);
      setSelectedSymptoms([]);
      showToast('Gut moment logged!', 'success');
    } catch {
      showToast('Could not log. Try again.', 'error');
    } finally {
      setLoggingMood(false);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="bodySmall" style={styles.logoText} color={theme.colors.primary}>
            GutBuddy
          </Text>
          <TouchableOpacity hitSlop={12}>
            <Icon name="Bell" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text variant="h2">
            {greeting()}{userName ? `, ${userName}` : ''}
          </Text>
          <Text variant="caption" color={theme.colors.textSecondary}>
            {todayLabel}
          </Text>
        </View>

        {/* Trigger alert */}
        {triggerAlert && (
          <Card variant="bordered" style={styles.triggerAlert}>
            <View style={styles.triggerRow}>
              <Icon name="AlertTriangle" size={18} color={theme.colors.caution} />
              <Text variant="bodySmall" style={{ flex: 1 }}>
                <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }}>
                  {triggerAlert.food}
                </Text>{' '}
                has triggered symptoms{' '}
                <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }}>
                  {triggerAlert.count}×
                </Text>{' '}
                recently
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyGut')}>
                <Text variant="caption" color={theme.colors.primary}>
                  Review
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Mood card */}
        <Card variant="bordered" style={styles.moodCard}>
          <Text variant="bodySmall" color={theme.colors.textSecondary} style={styles.moodQuestion}>
            How's your gut feeling right now?
          </Text>
          <View style={styles.moodButtons}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.moodBtn,
                  selectedMood === m.id && styles.moodBtnSelected,
                ]}
                onPress={() => handleMoodTap(m.id)}
                activeOpacity={0.7}
              >
                <Icon3D name={m.icon} size={40} />
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Today's Meals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h3">Today's Meals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ScanFood')}>
              <Text variant="caption" color={theme.colors.primary}>
                Scan Menu
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.skeletons}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : meals.length === 0 ? (
            <EmptyState
              icon="fork_and_knife"
              title="Nothing logged yet today"
              subtitle="Scan a menu or log what you ate to start tracking"
              action={{
                label: 'Scan a Menu',
                onPress: () => navigation.navigate('ScanFood'),
              }}
            />
          ) : (
            <View style={styles.mealCards}>
              {meals.map((meal: any) => (
                <Card key={meal.id} variant="bordered" style={styles.mealCard}>
                  <View style={styles.mealRow}>
                    <View style={styles.mealInfo}>
                      <Text variant="bodySmall" style={{ fontFamily: theme.fonts.semibold }}>
                        {meal.name || 'Meal'}
                      </Text>
                      <Text variant="caption" color={theme.colors.textSecondary}>
                        {new Date(meal.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                  {meal.foods?.length > 0 && (
                    <View style={styles.mealFoods}>
                      {meal.foods.slice(0, 3).map((food: string, i: number) => (
                        <Chip key={i} label={food} size="sm" variant="selectable" />
                      ))}
                      {meal.foods.length > 3 && (
                        <Text variant="caption" color={theme.colors.textTertiary}>
                          +{meal.foods.length - 3} more
                        </Text>
                      )}
                    </View>
                  )}
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Mood log bottom sheet */}
      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} snapHeight="65%">
        <View style={styles.sheetContent}>
          <Text variant="h3">How are you feeling?</Text>
          <Text variant="bodySmall" color={theme.colors.textSecondary}>
            Any symptoms to note?
          </Text>

          <View style={styles.sheetMoods}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.sheetMoodBtn, selectedMood === m.id && styles.sheetMoodSelected]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedMood(m.id);
                }}
              >
                <Icon3D name={m.icon} size={36} />
                <Text variant="caption" color={selectedMood === m.id ? theme.colors.primary : theme.colors.textSecondary}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.symptomsGrid}>
            {SYMPTOMS.map((s) => (
              <Chip
                key={s}
                label={s}
                variant="selectable"
                size="sm"
                selected={selectedSymptoms.includes(s)}
                onPress={() => toggleSymptom(s)}
              />
            ))}
          </View>

          <Button
            variant="primary"
            size="lg"
            onPress={handleLogMood}
            loading={loggingMood}
            disabled={!selectedMood}
            fullWidth
          >
            Log This
          </Button>
        </View>
      </BottomSheet>
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
    flexGrow: 1,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  logoText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  greeting: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xxs,
    marginBottom: theme.spacing.lg,
  },
  triggerAlert: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderColor: theme.colors.caution,
    backgroundColor: theme.colors.cautionMuted,
  },
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  moodCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  moodQuestion: {
    textAlign: 'center',
  },
  moodButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  moodBtn: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodBtnSelected: {
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  section: {
    paddingHorizontal: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  skeletons: {
    gap: theme.spacing.sm,
  },
  mealCards: {
    gap: theme.spacing.sm,
  },
  mealCard: {},
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  mealInfo: {
    gap: 2,
  },
  mealFoods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  sheetContent: {
    flex: 1,
    gap: theme.spacing.md,
  },
  sheetMoods: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  sheetMoodBtn: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.lg,
  },
  sheetMoodSelected: {
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    flex: 1,
  },
});

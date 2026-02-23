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
import { Icon3D } from '../components/Icon3D';
import { SkeletonCard } from '../components/Skeleton';
import { BottomSheet } from '../components/BottomSheet';
import { Button } from '../components/Button';
import { SelectionCard } from '../components/SelectionCard';
import { LucideIconName } from '../components/Icon';
import { useToast } from '../components/Toast';
import { FluidMoodSlider } from '../components/fluid/FluidMoodSlider';
import { TimelineLog } from '../components/fluid/TimelineLog';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../config/supabase';
import { gutService } from '../services/gutService';
import { useAppStore } from '../store/useAppStore';
import * as Haptics from 'expo-haptics';

const MOODS = [
  { id: 'happy', icon: 'face_with_smile' as const, label: 'Good' },
  { id: 'neutral', icon: 'neutral_face' as const, label: 'OK' },
  { id: 'sad', icon: 'face_with_sad' as const, label: 'Rough' },
] as const;

const SYMPTOMS = [
  { id: 'Bloating', icon: 'Wind' as LucideIconName, color: '#F5C97A' },
  { id: 'Gas', icon: 'Cloud' as LucideIconName, color: '#8E96A3' },
  { id: 'Cramping', icon: 'RotateCcw' as LucideIconName, color: '#FF4D4D' },
  { id: 'Nausea', icon: 'Frown' as LucideIconName, color: '#6DBE8C' },
  { id: 'Heartburn', icon: 'Flame' as LucideIconName, color: '#FF9D4D' },
  { id: 'Brain Fog', icon: 'Cloud' as LucideIconName, color: '#A855F7' },
  { id: 'Fatigue', icon: 'BatteryLow' as LucideIconName, color: '#E05D4C' },
  { id: 'Diarrhea', icon: 'ArrowDown' as LucideIconName, color: '#E05D4C' },
  { id: 'Constipation', icon: 'Lock' as LucideIconName, color: '#8E96A3' },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const setLearnedSafeFoods = useAppStore((s) => s.setLearnedSafeFoods);

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
      // Refresh safe foods — good_occurrences may have just crossed the threshold
      gutService.getSafeFoods().then(setLearnedSafeFoods).catch(() => {});
    } catch {
      showToast('Could not log. Try again.', 'error');
    } finally {
      setLoggingMood(false);
    }
  };

  const handleReLog = async (meal: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const name = `Meal at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      await gutService.logMeal({ foods: meal.foods, name });
      showToast('Meal logged!', 'success');
      loadData();
    } catch {
      showToast('Could not log meal', 'error');
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
            <Icon3D name="bell" size={28} />
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
              <Icon name="AlertTriangle" size={20} color={theme.colors.caution} />
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

        {/* Mood slider */}
        <FluidMoodSlider onMoodSelect={handleMoodTap} />

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
          ) : (
            <TimelineLog logs={{ meals, gutLogs: [] }} onReLog={handleReLog} />
          )}
        </View>
      </ScrollView>

      {/* Mood log bottom sheet */}
      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} snapHeight="75%">
        <View style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text variant="h3">How are you feeling?</Text>
            <Text variant="bodySmall" color={theme.colors.textSecondary}>
              Select your mood and any active symptoms
            </Text>
          </View>

          <View style={styles.sheetMoods}>
            {MOODS.map((m) => (
              <Card
                key={m.id}
                variant={selectedMood === m.id ? 'glow' : 'bordered'}
                pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedMood(m.id);
                }}
                style={styles.sheetMoodCard}
              >
                <Icon3D name={m.icon} size={38} animated={selectedMood === m.id} animationType="float" />
                <Text variant="caption" color={selectedMood === m.id ? theme.colors.primary : theme.colors.textSecondary}>
                  {m.label}
                </Text>
              </Card>
            ))}
          </View>

          <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
            <View style={styles.sheetListInner}>
              <Text variant="label" color={theme.colors.textTertiary} style={styles.listLabel}>
                Symptoms
              </Text>
              <View style={styles.symptomsPillContainer}>
                {SYMPTOMS.map((s) => (
                  <SelectionCard
                    key={s.id}
                    layout="pill"
                    title={s.id}
                    lucideIcon={s.icon}
                    lucideColor={s.color}
                    selected={selectedSymptoms.includes(s.id)}
                    onPress={() => toggleSymptom(s.id)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.sheetFooter}>
            <Button
              variant="primary"
              size="lg"
              onPress={handleLogMood}
              loading={loggingMood}
              disabled={!selectedMood}
              fullWidth
            >
              Log This Moment
            </Button>
          </View>
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
  sheetContent: {
    flex: 1,
    gap: theme.spacing.md,
  },
  sheetHeader: {
    gap: 4,
    marginBottom: theme.spacing.xs,
  },
  sheetMoods: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  sheetMoodCard: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
  },
  sheetList: {
    flex: 1,
    marginHorizontal: -theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  sheetListInner: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.md,
  },
  symptomsPillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  listLabel: {
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
  },
  sheetFooter: {
    paddingTop: theme.spacing.sm,
  },
});

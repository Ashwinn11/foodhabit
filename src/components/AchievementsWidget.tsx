import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { streakService } from '../services/gutHarmony/streakService';
import { entryService } from '../services/gutHarmony/entryService';
import { theme } from '../theme';
import Text from './Text';
import Card from './Card';
import SectionHeader from './SectionHeader';
import { Ionicons } from '@expo/vector-icons';

interface Achievement {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  unlocked: boolean;
}

const AVAILABLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_entry',
    type: 'first_entry',
    name: 'First Step',
    description: 'Log your first entry',
    icon: 'checkmark-circle',
    iconColor: theme.colors.brand.primary,
    unlocked: false,
  },
  {
    id: 'streak_7',
    type: 'streak_7',
    name: 'Week Warrior',
    description: '7-day logging streak',
    icon: 'flame',
    iconColor: theme.colors.brand.primary,
    unlocked: false,
  },
  {
    id: 'streak_30',
    type: 'streak_30',
    name: 'Month Master',
    description: '30-day logging streak',
    icon: 'star',
    iconColor: theme.colors.brand.tertiary,
    unlocked: false,
  },
  {
    id: 'entries_10',
    type: 'entries_10',
    name: 'Data Seeker',
    description: '10 entries logged',
    icon: 'document-text',
    iconColor: theme.colors.brand.secondary,
    unlocked: false,
  },
  {
    id: 'entries_30',
    type: 'entries_30',
    name: 'Pattern Finder',
    description: '30 entries logged',
    icon: 'analytics',
    iconColor: theme.colors.brand.secondary,
    unlocked: false,
  },
  {
    id: 'consistent_week',
    type: 'consistent_week',
    name: 'Committed',
    description: 'Log 5+ days in one week',
    icon: 'checkmark-done-circle',
    iconColor: theme.colors.brand.primary,
    unlocked: false,
  },
];

interface AchievementsWidgetProps {
  compact?: boolean;
}

export default function AchievementsWidget({ compact = false }: AchievementsWidgetProps) {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>(AVAILABLE_ACHIEVEMENTS);
  const [isLoading, setIsLoading] = useState(true);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAchievements();
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [user?.id]);

  const loadAchievements = async () => {
    try {
      if (!user?.id) return;

      const streak = await streakService.getUserStreak(user.id);
      const entries = await entryService.getRecentEntries(user.id, 365);
      const entryCount = entries?.length || 0;

      const updatedAchievements = AVAILABLE_ACHIEVEMENTS.map((achievement) => {
        let unlocked = false;

        switch (achievement.type) {
          case 'first_entry':
            unlocked = entryCount >= 1;
            break;
          case 'streak_7':
            unlocked = streak?.current_streak ? streak.current_streak >= 7 : false;
            break;
          case 'streak_30':
            unlocked = streak?.current_streak ? streak.current_streak >= 30 : false;
            break;
          case 'entries_10':
            unlocked = entryCount >= 10;
            break;
          case 'entries_30':
            unlocked = entryCount >= 30;
            break;
          case 'consistent_week':
            // Check if user has 5+ entries in the last 7 days
            const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7));
            const recentEntries = entries?.filter(
              (e) => new Date(e.created_at) > oneWeekAgo
            ) || [];
            const daysLogged = new Set(
              recentEntries.map((e) =>
                new Date(e.created_at).toLocaleDateString()
              )
            ).size;
            unlocked = daysLogged >= 5;
            break;
        }

        return { ...achievement, unlocked };
      });

      setAchievements(updatedAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={theme.colors.brand.primary} size="small" />
      </View>
    );
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <SectionHeader 
          title="Achievements" 
          subtitle={`${unlockedCount} / ${achievements.length}`}
          variant="compact"
        />
        <View style={styles.compactGrid}>
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              padding="none"
              style={styles.compactCard}
              backgroundColor={achievement.unlocked ? theme.colors.glass.primary : theme.colors.background.card}
              elevation={achievement.unlocked ? 'flat' : 'none'}
              borderRadius="lg"
            >
              <Animated.View
                style={{
                  opacity: scaleAnim,
                  transform: [{ scale: scaleAnim }],
                  alignItems: 'center',
                  padding: theme.spacing.md,
                }}
              >
                <View
                  style={[
                    styles.achievementIconContainer,
                    {
                      backgroundColor: achievement.unlocked
                        ? achievement.iconColor + '20'
                        : theme.colors.background.primary,
                    },
                  ]}
                >
                  <Ionicons
                    name={achievement.icon as any}
                    size={20}
                    color={
                      achievement.unlocked
                        ? achievement.iconColor
                        : theme.colors.text.tertiary
                    }
                  />
                  {!achievement.unlocked && (
                    <View style={styles.lockOverlay}>
                      <Ionicons
                        name="lock-closed"
                        size={10}
                        color={theme.colors.text.tertiary}
                      />
                    </View>
                  )}
                </View>
                <Text
                  variant="caption2"
                  weight="bold"
                  align="center"
                  numberOfLines={1}
                  style={{
                    marginTop: theme.spacing.xs,
                    color: achievement.unlocked
                      ? theme.colors.text.primary
                      : theme.colors.text.tertiary,
                  }}
                >
                  {achievement.name}
                </Text>
              </Animated.View>
            </Card>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="title2" weight="bold">
          Your Achievements
        </Text>
        <Text variant="caption" color="secondary">
          {unlockedCount} / {achievements.length} unlocked
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View style={styles.grid}>
          {achievements.map((achievement) => (
            <Animated.View
              key={achievement.id}
              style={{
                opacity: scaleAnim,
                transform: [
                  {
                    translateY: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <Card
                padding="none"
                style={styles.badgeCard}
                backgroundColor={achievement.unlocked ? theme.colors.glass.primary : theme.colors.background.card}
                elevation={achievement.unlocked ? 'secondary' : 'none'}
              >
                <View style={styles.badgeCardInner}>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: achievement.unlocked
                          ? achievement.iconColor + '20'
                          : theme.colors.background.primary,
                      },
                    ]}
                  >
                    <Ionicons
                      name={achievement.icon as any}
                      size={32}
                      color={
                        achievement.unlocked
                          ? achievement.iconColor
                          : theme.colors.text.tertiary
                      }
                    />
                    {!achievement.unlocked && (
                      <View style={styles.lockBadge}>
                        <Ionicons
                          name="lock-closed"
                          size={12}
                          color={theme.colors.text.tertiary}
                        />
                      </View>
                    )}
                  </View>
                  <Text
                    variant="bodyEmphasized"
                    align="center"
                    style={{
                      color: achievement.unlocked
                        ? theme.colors.text.primary
                        : theme.colors.text.tertiary,
                    }}
                  >
                    {achievement.name}
                  </Text>
                  <Text
                    variant="caption2"
                    color="secondary"
                    align="center"
                    style={{ marginTop: 2 }}
                  >
                    {achievement.description}
                  </Text>
                </View>
              </Card>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing['2xl'],
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  badgeCard: {
    width: 140,
    marginRight: theme.spacing.md,
  },
  badgeCardInner: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background.primary,
  },
  compactContainer: {
    marginBottom: theme.spacing.xl,
  },
  compactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing['2xl'],
    gap: theme.spacing.md,
  },
  compactCard: {
    width: '30.5%',
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background.primary,
  },
});

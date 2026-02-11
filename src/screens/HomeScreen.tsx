import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radii, shadows } from '../theme';
import { useGutStore, useNotificationStore } from '../store';
import { useGutData, useTriggers } from '../presentation/hooks';
import { useAuth } from '../hooks/useAuth';
import {
  ScreenWrapper,
  BoxButton,
  IconContainer,
  Typography,
  GutAvatar,
  UserTriggersCard,
  DailyIntakeSummary,
} from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getFunGrade } from '../utils/scoreUtils';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  // Use new architecture for computed values
  const {
    healthScore,
    medicalAlerts,
    streak,
  } = useGutData();

  // Get user ID and triggers
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const { triggers } = useTriggers(userId);

  // Still use old store for data
  const { user, dismissAlert, meals } = useGutStore();
  const { unreadCount } = useNotificationStore();

  // Calculate today's meal totals
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysMeals = meals.filter(meal => {
    const mealDate = new Date(meal.timestamp);
    mealDate.setHours(0, 0, 0, 0);
    return mealDate.getTime() === today.getTime();
  });

  // Calculate totals from meal nutrition data
  const dailyTotals = todaysMeals.reduce(
    (acc, meal: any) => ({
      calories: acc.calories + (meal.nutrition?.calories || 0),
      protein: acc.protein + (meal.nutrition?.protein || 0),
      carbs: acc.carbs + (meal.nutrition?.carbs || 0),
      fat: acc.fat + (meal.nutrition?.fat || 0),
      fiber: acc.fiber + (meal.nutrition?.fiber || 0),
      sugar: acc.sugar + (meal.nutrition?.sugar || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  };
  
  return (
    <ScreenWrapper edges={['top']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Greeting */}
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <View>
            <View style={styles.greetingRow}>
              <IconContainer
                name="hand-right"
                size={28}
                iconSize={18}
                color={colors.black}
                backgroundColor={colors.yellow}
                borderWidth={0}
                shadow={false}
                style={styles.waveIcon}
              />
              <Typography variant="bodyBold" color={colors.black + '99'}>
                {getGreeting()}
              </Typography>
            </View>
            <Typography variant="h1">
              {user.name} <Typography variant="h1" color={colors.pink}>&amp; Co.</Typography>
            </Typography>
          </View>
          
          <BoxButton 
            icon="notifications" 
            onPress={() => navigation.navigate('Notifications')}
            size={44}
            color={colors.pink}
            badgeCount={unreadCount}
          />
        </Animated.View>
        
        {/* Medical Alerts Banner - Now using new architecture */}
        {medicalAlerts.hasAlerts && (
          <Animated.View 
            entering={FadeInDown.delay(150).springify()}
            style={styles.section}
          >
            {medicalAlerts.alerts.map((alert) => (
              <View
                key={alert.type}
                style={[
                  styles.alertCard,
                  {
                    borderLeftWidth: 4,
                    borderLeftColor: alert.severity === 'critical' ? colors.pink : '#FFA500',
                    padding: spacing.lg,
                    backgroundColor: colors.white,
                    borderRadius: radii.md,
                  }
                ]}
              >
                <View style={styles.alertContent}>
                  <IconContainer
                    name={alert.severity === 'critical' ? 'warning' : 'alert-circle'}
                    size={40}
                    iconSize={24}
                    color={alert.severity === 'critical' ? colors.pink : '#FFA500'}
                    variant="solid"
                    shadow={false}
                  />
                  <View style={styles.alertText}>
                    <Typography variant="bodyBold" color={colors.black}>
                      {alert.severity === 'critical' ? 'Medical Attention Recommended' : 'Health Notice'}
                    </Typography>
                    <Typography variant="bodySmall" color={colors.black + '99'} style={{ marginTop: 4 }}>
                      {alert.message}
                    </Typography>
                  </View>
                  <Pressable 
                    onPress={() => dismissAlert(alert.type)}
                    style={{ padding: 4 }}
                    hitSlop={8}
                  >
                    <IconContainer
                      name="close"
                      size={24}
                      iconSize={16}
                      color={colors.black + '40'}
                      backgroundColor="transparent"
                      borderWidth={0}
                      shadow={false}
                    />
                  </Pressable>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
        
        {/* HERO: Gut Health Score Ring - Now using new architecture */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.heroSection}
        >
          <LinearGradient
            colors={[colors.primary, colors.primary + '40', colors.white]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.heroCard,
              {
                padding: 1.5, // Border width
                borderRadius: radii.xl,
                ...shadows.sm,
              }
            ]}
          >
            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: radii.xl - 1.5,
                padding: spacing.xl,
                flex: 1,
              }}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroLeft}>
                  <GutAvatar score={healthScore.score} size={80} />
                  <View style={styles.heroScoreText}>
                    <Typography variant="bodyXS" color={colors.black + '60'} style={{ letterSpacing: 1 }}>
                      GUT SCORE
                    </Typography>
                    <Typography variant="h1" color={healthScore.color} style={{ fontSize: 48, lineHeight: 56 }}>
                      {healthScore.score}
                    </Typography>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name={getFunGrade(healthScore.score).icon as any} size={16} color={healthScore.color} />
                      <Typography variant="bodyBold" color={healthScore.color}>
                        {getFunGrade(healthScore.score).label}
                      </Typography>
                    </View>
                  </View>
                </View>

                {/* Stats / Streak Badge - Now using new architecture */}
                <View style={styles.streakBadge}>
                  <IconContainer name="flame" size={24} color={colors.pink} variant="transparent" shadow={false} />
                  <Typography variant="bodyBold" color={colors.black}>
                    {streak} Day{streak !== 1 ? 's' : ''} Streak
                  </Typography>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* PRIMARY ACTIONS: 2-Column Grid */}
        <Animated.View 
          entering={FadeInDown.delay(250).springify()}
          style={styles.actionGrid}
        >
           {/* Safe to Eat? (Scan Food) */}
           <Pressable 
              style={[styles.actionButton, { backgroundColor: colors.blue, borderWidth: 0 }]}
              onPress={() => navigation.navigate('ScanFood')}
           >
              <IconContainer name="fast-food" size={24} iconSize={24} color={colors.white} variant="transparent" shadow={false} />
              <Typography variant="bodyBold" color={colors.white}>Safe to Eat?</Typography>
           </Pressable>

           {/* I Just Pooped! */}
           <Pressable 
              style={[styles.actionButton, { backgroundColor: colors.pink, borderWidth: 0 }]}
              onPress={() => navigation.navigate('AddEntry')}
           >
              <IconContainer name="happy" size={24} iconSize={24} color={colors.white} variant="transparent" shadow={false} />
              <Typography variant="bodyBold" color={colors.white}>I Just Pooped!</Typography>
           </Pressable>
        </Animated.View>

        {/* Daily Intake Summary */}
        <Animated.View
          entering={FadeInDown.delay(250).springify()}
          style={styles.section}
        >
          <DailyIntakeSummary
            calories={dailyTotals.calories}
            calorieGoal={2000}
            protein={dailyTotals.protein}
            carbs={dailyTotals.carbs}
            fat={dailyTotals.fat}
            fiber={dailyTotals.fiber}
            sugar={dailyTotals.sugar}
          />
        </Animated.View>

        {/* NEW: User Triggers */}
        <Animated.View
          entering={FadeInDown.delay(270).springify()}
          style={styles.section}
        >
          <UserTriggersCard triggers={triggers} />
        </Animated.View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: radii.full,
    borderWidth: 2,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 60,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  alertCard: {
    marginBottom: spacing.sm,
  },
  alertContent: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  alertText: {
    flex: 1,
  },
  bottomPadding: {
    height: 100,
  },
  container: {
    flex: 1,
  },
  greetingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  heroCard: {
    overflow: 'hidden',
  },
  heroContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
  },
  heroScoreText: {
    justifyContent: 'center',
  },
  heroSection: {
    marginBottom: spacing.lg,
  },
  missionsContainer: {
    // Missions stack vertically
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.full,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    transform: [{ rotate: '3deg' }],
  },
  waveIcon: {
    marginRight: spacing.xs,
  },
});

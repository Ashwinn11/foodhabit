import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import { colors, spacing, radii } from '../theme';
import { useGutStore, useNotificationStore, useUIStore } from '../store';
import { useGutData } from '../presentation/hooks';
import {
  MissionCard,
  ScreenWrapper,
  BoxButton,
  IconContainer,
  Typography,
  Card,
  SectionHeader,
  GutAvatar,
} from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getFunGrade } from '../utils/funnyMessages';

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
  
  // Still use old store for actions (will migrate later)
  const { 
    user,
    getDynamicTasks, 
    addWater, 
    addFiber, 
    addProbiotic, 
    toggleTask, 
    dismissAlert 
  } = useGutStore();
  
  const { unreadCount } = useNotificationStore();
  
  const dynamicTasks = getDynamicTasks();
  const incompleteTasks = dynamicTasks.filter(t => !t.completed).length;

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
              <Card 
                key={alert.type}
                variant="white"
                padding="lg"
                style={[
                  styles.alertCard,
                  { borderLeftWidth: 4, borderLeftColor: alert.severity === 'critical' ? colors.pink : '#FFA500' }
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
                      {alert.severity === 'critical' ? '⚠️ Medical Attention Recommended' : '⚡ Health Notice'}
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
              </Card>
            ))}
          </Animated.View>
        )}
        
        {/* HERO: Gut Health Score Ring - Now using new architecture */}
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.heroSection}
        >
          <Card variant="colored" color={colors.blue} padding="xl" style={styles.heroCard}>
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
                    <Typography variant="bodyBold" color={healthScore.color}>
                      {getFunGrade(healthScore.score)}
                    </Typography>
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
          </Card>
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

        
        {/* Today's Missions */}
        <Animated.View 
          entering={FadeInDown.delay(300).springify()}
          style={styles.section}
        >
          <SectionHeader 
            title="Gut Action Plan" 
            icon="flash" 
            iconColor={colors.pink}
            count={incompleteTasks}
          />
          
          <View style={styles.missionsContainer}>
            {dynamicTasks.length === 1 && dynamicTasks[0].id === 'poop' && dynamicTasks[0].completed ? (
               /* ALL CLEAR STATE: Only Poop task exists and is done */
               <Card variant="white" padding="xl" style={{ alignItems: 'center' }}>
                  <IconContainer name="sparkles" size={48} color={colors.yellow} variant="transparent" shadow={false} />
                  <Typography variant="h3" color={colors.black} style={{ marginTop: spacing.sm }}>All Clear! ✨</Typography>
                  <Typography variant="body" color={colors.black + '60'} style={{ textAlign: 'center', marginTop: 4 }}>
                     Your gut is happy. No extra missions for today.
                  </Typography>
               </Card>
            ) : (
                dynamicTasks.map((task, index) => (
                  <Animated.View
                    key={task.id}
                    entering={FadeInDown.delay(400 + index * 100).springify()}
                  >
                    <MissionCard
                      title={task.title}
                      subtitle={task.subtitle}
                      completed={task.completed}
                      onToggle={() => {
                        // 1. Handle "Poop" Task (Navigation)
                        if (task.id === 'poop') {
                           navigation.navigate('AddEntry');
                           return;
                        }

                        // 2. Handle "Tea" (Custom Action)
                        if (task.id === 'tea') {
                           addWater(false); // Silent
                           useUIStore.getState().showToast({
                             message: 'Peppermint power! 🍵',
                             icon: 'water',
                             iconColor: colors.green
                           });
                           toggleTask(task.id);
                        } 
                        // 3. Handle "Kiwi" (Custom Action)
                        else if (task.id === 'kiwi') {
                           addFiber(5, false); // Silent
                           useUIStore.getState().showToast({
                             message: 'Kiwi yummy! 🥝',
                             icon: 'leaf',
                             iconColor: colors.green
                           });
                           toggleTask(task.id);
                        }
                        // 4. Handle BRAT (Custom Action)
                        else if (task.id === 'brat') {
                            navigation.navigate('ScanFood');
                        }
                        // 5. Handle Generic Fallsbacks
                        else if (task.type === 'water') {
                          addWater();
                        } else if (task.type === 'fiber') {
                          addFiber(5); 
                        } else if (task.type === 'probiotic') {
                          addProbiotic(); // Keeping for future if restored
                        }
                      }}
                      type={task.type}
                    />
                  </Animated.View>
                ))
            )}
          </View>
        </Animated.View>
        <View style={styles.bottomPadding} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing.md,
    marginBottom: spacing.xl,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  waveIcon: {
    marginRight: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  heroSection: {
    marginBottom: spacing.lg,
  },
  heroCard: {
    overflow: 'hidden',
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  heroScoreText: {
    justifyContent: 'center',
  },
  streakBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    transform: [{ rotate: '3deg' }],
  },
  actionGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    borderRadius: radii.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 60,
  },
  alertCard: {
    marginBottom: spacing.sm,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  alertText: {
    flex: 1,
  },
  missionsContainer: {
    // Missions stack vertically
  },
  bottomPadding: {
    height: 100,
  },
});

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import { colors, spacing, radii } from '../theme';
import { useGutStore } from '../store';
import {
  MissionCard,
  ScreenWrapper,
  BoxButton,
  IconContainer,
  Typography,
  Card,
  Button,
  SectionHeader,
  GutAvatar,
} from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, getStats, getDynamicTasks, addWater, addFiber, addProbiotic, addExercise, getGutHealthScore, checkMedicalAlerts } = useGutStore();
  
  const dynamicTasks = getDynamicTasks();
  const incompleteTasks = dynamicTasks.filter(t => !t.completed).length;
  const stats = getStats();
  const healthScore = getGutHealthScore();
  const medicalAlerts = checkMedicalAlerts();

  const lastPoopInfo = (() => {
    const lastTime = stats.lastPoopTime;
    if (!lastTime) return { time: 'Never', message: 'Log your first poop!', color: colors.pink, urgency: 'high' };
    
    const now = new Date();
    const last = new Date(lastTime);
    const diffHours = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60));
    
    const diffMinutes = Math.floor((now.getTime() - last.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return { time: 'Just now', message: 'Fresh!', color: colors.blue, urgency: 'low' };
    if (diffMinutes < 60) return { time: `${diffMinutes}m ago`, message: 'Fresh!', color: colors.blue, urgency: 'low' };
    if (diffHours < 24) return { time: `${diffHours}h ago`, message: 'All good', color: colors.blue, urgency: 'low' };
    if (diffHours < 48) return { time: '1 day ago', message: 'Time soon?', color: colors.yellow, urgency: 'medium' };
    
    const diffDays = Math.floor(diffHours / 24);
    return { 
      time: `${diffDays}d ago`, 
      message: diffDays > 3 ? 'Stalled!' : 'Check in!', 
      color: diffDays > 3 ? colors.pink : colors.yellow, 
      urgency: diffDays > 3 ? 'urgent' : 'warning' 
    };
  })();
  
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
              {user.name} <Typography variant="h1" color={colors.pink}>& Co.</Typography>
            </Typography>
          </View>
          
          <BoxButton 
            icon="notifications" 
            onPress={() => console.log('Notifications')}
            size={44}
            color={colors.pink}
            badgeCount={2}
          />
        </Animated.View>
        
        {/* Medical Alerts Banner */}
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
                    backgroundColor={alert.severity === 'critical' ? colors.pink + '15' : '#FFA50015'}
                    borderWidth={0}
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
                </View>
              </Card>
            ))}
          </Animated.View>
        )}
        
        {/* Consolidated: Gut Health Score + Last Poop */}
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.section}
        >
          <Card variant="colored" color={colors.blue} padding="xl">
            <View style={styles.healthCard}>
              {/* Left: Avatar + Score */}
              <View style={styles.healthLeft}>
                <GutAvatar score={healthScore.score} size={70} />
                <View style={styles.scoreInfo}>
                  <Typography variant="h1" color={colors.black} style={{ fontSize: 36 }}>
                    {healthScore.score}
                  </Typography>
                  <Typography variant="bodySmall" color={colors.black + 'CC'}>
                    {healthScore.grade}
                  </Typography>
                </View>
              </View>
              
              {/* Right: Last Poop Info */}
              <View style={styles.healthRight}>
                <Typography variant="caption" color={colors.black + '99'}>
                  LAST POOP
                </Typography>
                <Typography variant="h3" color={colors.black}>
                  {lastPoopInfo.time}
                </Typography>
                <Typography variant="bodySmall" color={colors.black + 'CC'}>
                  {lastPoopInfo.message}
                </Typography>
              </View>
            </View>
          </Card>
          
          <Button
            title="I just pooped!"
            onPress={() => navigation.navigate('AddEntry')}
            color={colors.pink}
            icon="happy"
            size="lg"
            style={{ marginTop: spacing.md }}
          />
        </Animated.View>

        
        {/* Today's Missions */}
        <Animated.View 
          entering={FadeInDown.delay(300).springify()}
          style={styles.section}
        >
          <SectionHeader 
            title="Today's Missions" 
            icon="list" 
            iconColor={colors.pink}
            count={incompleteTasks}
          />
          
          <View style={styles.missionsContainer}>
            {dynamicTasks.map((task, index) => (
              <Animated.View
                key={task.id}
                entering={FadeInDown.delay(400 + index * 100).springify()}
              >
                <MissionCard
                  title={task.title}
                  subtitle={task.subtitle}
                  completed={task.completed}
                  onToggle={() => {
                    if (task.type === 'water') {
                      addWater();
                    } else if (task.type === 'fiber') {
                      addFiber(5); // Add 5g per tap
                    } else if (task.type === 'probiotic') {
                      addProbiotic(); // Add 1 serving
                    } else if (task.type === 'exercise') {
                      addExercise(10); // Add 10 minutes per tap
                    } else {
                      // Poop and meal tasks navigate to Add screen
                      navigation.navigate('AddEntry');
                    }
                  }}
                  type={task.type}
                />
              </Animated.View>
            ))}
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
    marginBottom: spacing['2xl'],
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
  bristolScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  bristolScrollContent: {
    paddingRight: spacing.xl,
    paddingBottom: spacing.sm,
  },
  bristolItem: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 70,
  },
  bristolCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  healthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scoreInfo: {
    alignItems: 'flex-start',
  },
  healthRight: {
    alignItems: 'flex-end',
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  scoreDetails: {
    flex: 1,
    alignItems: 'flex-start',
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.lg,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginRight: spacing.xl,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  activeLabel: {
    marginTop: -10,
    backgroundColor: colors.blue,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 10,
  },
  addButtonMargin: {
    // marginBottom: spacing.sm,
  },
  missionsContainer: {
    // Missions stack vertically
  },
  mealsRow: {
    flexDirection: 'row',
    paddingRight: spacing.lg,
  },
  mealCardMargin: {
    marginRight: spacing.md,
  },
  quickStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickStatCard: {
    flex: 1,
    alignItems: 'center',
  },
  bottomPadding: {
    height: 100,
  },
  lastPoopCard: {
    marginBottom: spacing.md,
  },
  lastPoopPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastPoopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quickPoopButton: {
    // Style handled by component
  },
  addMealPrompt: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.blue,
    borderStyle: 'dashed',
    minWidth: 140,
    minHeight: 160,
    gap: spacing.sm,
  },
  emptyGutState: {
    alignItems: 'center',
    marginRight: spacing.md,
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
});

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { colors, spacing, radii } from '../theme/theme';
import { useGutStore } from '../store';
import {
  GutAvatar,
  MissionCard,
  FoodBlobCard,
  AddButton,
  ScreenWrapper,
  BoxButton,
  IconContainer,
  Typography,
  Card,
  Button,
  SectionHeader,
} from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, gutMoments, quickLogPoop, meals, getStats, getDynamicTasks, addWater, getTodayWater } = useGutStore();
  
  const dynamicTasks = getDynamicTasks();
  const incompleteTasks = dynamicTasks.filter(t => !t.completed).length;
  const stats = getStats();
  const todayWater = getTodayWater();
  
  const getLastPoopInfo = () => {
    if (!stats.lastPoopTime) {
      return { text: 'No logs yet', color: colors.pink, urgency: 'none' };
    }
    
    const now = new Date();
    const lastPoop = new Date(stats.lastPoopTime);
    const diffMs = now.getTime() - lastPoop.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;
    
    let text = '';
    let color: string = colors.blue;
    let urgency = 'good';
    
    if (diffHours < 1) {
      text = 'Just now! 🎉';
      color = colors.blue;
      urgency = 'great';
    } else if (diffHours < 24) {
      text = `${diffHours}h ago`;
      color = colors.blue;
      urgency = 'good';
    } else if (diffDays === 1) {
      text = `1 day ${remainingHours}h`;
      color = colors.yellow;
      urgency = 'warning';
    } else if (diffDays < 3) {
      text = `${diffDays} days ${remainingHours}h`;
      color = colors.yellow;
      urgency = 'warning';
    } else {
      text = `${diffDays} days! 😬`;
      color = colors.pink;
      urgency = 'urgent';
    }
    
    return { text, color, urgency };
  };
  
  const lastPoopInfo = getLastPoopInfo();
  
  const handleQuickPoop = () => {
    quickLogPoop(4);
  };
  
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
        {/* Header */}
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
                color={colors.yellow}
                backgroundColor="transparent"
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
        
        {/* THE VIRAL WIDGET: Last Poop Counter */}
        <Animated.View 
          entering={FadeInDown.delay(250).springify()}
          style={styles.section}
        >
          <Card
            variant="white"
            color={lastPoopInfo.color}
            style={styles.lastPoopCard}
            padding="lg"
          >
            <Pressable 
              style={styles.lastPoopPressable}
              onPress={() => navigation.navigate('AddEntry')}
            >
              <View style={styles.lastPoopLeft}>
                <IconContainer
                  name="time"
                  size={48}
                  iconSize={24}
                  color={lastPoopInfo.color}
                  borderColor={lastPoopInfo.color}
                  shape="circle"
                />
                <View>
                  <Typography variant="bodySmall" color={colors.black + '66'}>Last Poop</Typography>
                  <Typography variant="h3" color={lastPoopInfo.color}>
                    {lastPoopInfo.text}
                  </Typography>
                </View>
              </View>
              <IconContainer 
                name="chevron-forward" 
                size={24} 
                iconSize={20}
                color={lastPoopInfo.color}
                backgroundColor="transparent"
                borderWidth={0}
                shadow={false}
              />
            </Pressable>
          </Card>
          
          <Button
            title="I just pooped!"
            onPress={handleQuickPoop}
            color={colors.pink}
            icon="happy"
            size="lg"
            style={styles.quickPoopButton}
          />
        </Animated.View>
        
        {/* Gut Feelings (My Besties) */}
        <Animated.View 
          entering={FadeInDown.delay(300).springify()}
          style={styles.section}
        >
          <SectionHeader 
            title="Gut Feelings" 
            icon="happy" 
            iconColor={colors.blue}
            onActionPress={() => navigation.navigate('GutProfile')}
          />
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.avatarsRow}
          >
            {gutMoments.length === 0 && (
              <Animated.View entering={FadeInRight.delay(350).springify()} style={styles.emptyGutState}>
                <GutAvatar mood="okay" size={64} />
                <Typography variant="bodyXS" color={colors.black + '66'} style={{ marginTop: spacing.xs }}>
                  No logs yet
                </Typography>
              </Animated.View>
            )}
            
            {gutMoments.slice(0, 3).map((moment, index) => (
              <Animated.View key={moment.id} entering={FadeInRight.delay(350 + index * 50).springify()}>
                <Pressable
                  style={styles.avatarWrapper}
                  onPress={() => navigation.navigate('GutProfile')}
                >
                  <View style={styles.avatarContainer}>
                    <GutAvatar 
                        mood={moment.mood} 
                        size={64} 
                        ringColor={index === 0 ? colors.pink : colors.border}
                    />
                    <View style={[styles.activeLabel, index === 0 && { backgroundColor: colors.pink }]}>
                        <Typography variant="bodySmall" color={colors.white} style={{ fontSize: 10 }}>
                          {index === 0 ? 'Latest' : moment.mood}
                        </Typography>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))}

            <Animated.View entering={FadeInRight.delay(500).springify()}>
              <AddButton
                size={64}
                onPress={() => navigation.navigate('AddEntry')}
                style={styles.addButtonMargin}
                dotted
              />
            </Animated.View>
          </ScrollView>
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
                    if (task.type === 'poop') {
                      handleQuickPoop();
                    } else if (task.type === 'water') {
                      addWater();
                    } else if (task.type === 'meal') {
                      navigation.navigate('AddEntry');
                    }
                  }}
                  type={task.type}
                />
              </Animated.View>
            ))}
          </View>
        </Animated.View>
        
        {/* Yummy Time */}
        <Animated.View 
          entering={FadeInDown.delay(500).springify()}
          style={styles.section}
        >
          <SectionHeader 
            title="Yummy Time" 
            icon="restaurant" 
            iconColor={colors.blue}
            onActionPress={() => navigation.navigate('AddEntry')}
          />
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mealsRow}
          >
            {meals.length > 0 ? (
              meals.slice(0, 4).map((meal, index) => (
                <Animated.View key={meal.id} entering={FadeInRight.delay(600 + index * 100).springify()}>
                  <FoodBlobCard
                    mealType={meal.mealType}
                    name={meal.name}
                    time={new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    completed={true}
                    style={styles.mealCardMargin}
                    onPress={() => {}}
                  />
                </Animated.View>
              ))
            ) : (
              <Animated.View entering={FadeInRight.delay(600).springify()}>
                <Pressable 
                  style={styles.addMealPrompt}
                  onPress={() => navigation.navigate('AddEntry')}
                >
                  <IconContainer
                    name="add-circle-outline"
                    size={40}
                    iconSize={32}
                    color={colors.blue}
                    backgroundColor="transparent"
                    borderWidth={0}
                    shadow={false}
                  />
                  <Typography variant="bodySmall" color={colors.blue} align="center">
                    Log your first meal!
                  </Typography>
                </Pressable>
              </Animated.View>
            )}
          </ScrollView>
        </Animated.View>
        
        {/* Daily Stats */}
        <Animated.View 
          entering={FadeInDown.delay(600).springify()}
          style={styles.section}
        >
          <SectionHeader 
            title="Daily Stats" 
            icon="stats-chart" 
            iconColor={colors.yellow}
          />
          
          <View style={styles.quickStats}>
            <Card variant="colored" color={colors.pink} style={styles.quickStatCard} padding="md">
              <IconContainer
                name="happy-outline"
                size={36}
                iconSize={24}
                color={colors.pink}
                backgroundColor="transparent"
                borderWidth={0}
                shadow={false}
                style={{ marginBottom: spacing.sm }}
              />
              <Typography variant="h3">{stats.totalPoops}</Typography>
              <Typography variant="bodyXS" color={colors.black + '66'}>Poops</Typography>
            </Card>
            <Card variant="colored" color={colors.blue} style={styles.quickStatCard} padding="md">
              <IconContainer
                name="flame-outline"
                size={36}
                iconSize={24}
                color={colors.blue}
                backgroundColor="transparent"
                borderWidth={0}
                shadow={false}
                style={{ marginBottom: spacing.sm }}
              />
              <Typography variant="h3">{stats.longestStreak}</Typography>
              <Typography variant="bodyXS" color={colors.black + '66'}>Streak</Typography>
            </Card>
             <Card variant="colored" color={colors.yellow} style={styles.quickStatCard} padding="md">
              <IconContainer
                name="water-outline"
                size={36}
                iconSize={24}
                color={colors.yellow}
                backgroundColor="transparent"
                borderWidth={0}
                shadow={false}
                style={{ marginBottom: spacing.sm }}
              />
              <Typography variant="h3">{todayWater}</Typography>
              <Typography variant="bodyXS" color={colors.black + '66'}>Water</Typography>
            </Card>
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
    marginBottom: spacing['2xl'],
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
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { colors, spacing, radii, shadows, fontSizes, fonts } from '../theme';
import { useGutStore } from '../store';
import {
  GutAvatar,
  MissionCard,
  FoodBlobCard,
  AddButton,
  ScreenWrapper,
  BoxButton,
  IconContainer,
} from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, gutMoments, quickLogPoop, meals, getStats, getDynamicTasks, addWater, getTodayWater } = useGutStore();
  
  // Get dynamic tasks based on current state
  const dynamicTasks = getDynamicTasks();
  const incompleteTasks = dynamicTasks.filter(t => !t.completed).length;
  const stats = getStats();
  const todayWater = getTodayWater();
  
  // Calculate time since last poop
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
    let color: string = colors.blue; // Green = good
    let urgency = 'good';
    
    if (diffHours < 1) {
      text = 'Just now! 🎉';
      color = colors.blue;
      urgency = 'great';
    } else if (diffHours < 24) {
      text = `${diffHours}h ago`;
      color = colors.blue; // Today = green/blue
      urgency = 'good';
    } else if (diffDays === 1) {
      text = `1 day ${remainingHours}h`;
      color = colors.yellow; // 1-2 days = yellow
      urgency = 'warning';
    } else if (diffDays < 3) {
      text = `${diffDays} days ${remainingHours}h`;
      color = colors.yellow;
      urgency = 'warning';
    } else {
      text = `${diffDays} days! 😬`;
      color = colors.pink; // 3+ days = red/pink
      urgency = 'urgent';
    }
    
    return { text, color, urgency };
  };
  
  const lastPoopInfo = getLastPoopInfo();
  
  // Quick log poop (the <5 second habit loop)
  const handleQuickPoop = () => {
    quickLogPoop(4); // Default to healthy Bristol type 4
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
              <Text style={styles.greeting}>{getGreeting()}</Text>
            </View>
            <Text style={styles.userName}>
              {user.name} <Text style={styles.userNameAccent}>& Co.</Text>
            </Text>
          </View>
          
          {/* Notification bell */}
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
          <Pressable 
            style={[styles.lastPoopWidget, { borderColor: lastPoopInfo.color }]}
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
                style={{ marginRight: spacing.md }}
              />
              <View>
                <Text style={styles.lastPoopLabel}>Last Poop</Text>
                <Text style={[styles.lastPoopValue, { color: lastPoopInfo.color }]}>
                  {lastPoopInfo.text}
                </Text>
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
          
          {/* Quick Log Button - THE CORE HABIT LOOP */}
          <Pressable 
            style={styles.quickPoopButton}
            onPress={handleQuickPoop}
          >
            <IconContainer 
              name="happy" 
              size={36} 
              iconSize={28}
              color={colors.white}
              backgroundColor="transparent"
              borderWidth={0}
              shadow={false}
            />
            <Text style={styles.quickPoopText}>I just pooped!</Text>
          </Pressable>
        </Animated.View>
        
        {/* Gut Feelings (My Besties) */}
        <Animated.View 
          entering={FadeInDown.delay(300).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <IconContainer 
              name="happy" 
              size={32} 
              iconSize={18}
              color={colors.blue}
              borderColor={colors.blue}
              shape="circle"
              style={{ marginRight: spacing.sm }}
            />
            <Text style={styles.sectionTitle}>Gut Feelings</Text>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.avatarsRow}
          >
            {/* Show empty state if no moments */}
            {gutMoments.length === 0 && (
              <Animated.View entering={FadeInRight.delay(350).springify()} style={styles.emptyGutState}>
                <GutAvatar mood="okay" size={64} />
                <Text style={styles.emptyGutText}>No logs yet</Text>
              </Animated.View>
            )}
            
            {/* Show recent gut moments */}
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
                        <Text style={styles.activeLabelText}>
                          {index === 0 ? 'Latest' : moment.mood}
                        </Text>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))}

             {/* Add Button for new moment */}
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
          <View style={styles.sectionHeader}>
            <IconContainer 
              name="list" 
              size={32} 
              iconSize={18}
              color={colors.pink}
              borderColor={colors.pink}
              shape="circle"
              style={{ marginRight: spacing.sm }}
            />
            <Text style={styles.sectionTitle}>Today's Missions</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{incompleteTasks} Left</Text>
            </View>
          </View>
          
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
                      quickLogPoop();
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
          <View style={styles.sectionHeader}>
            <IconContainer 
              name="restaurant" 
              size={32} 
              iconSize={18}
              color={colors.blue}
              borderColor={colors.blue}
              shape="circle"
              style={{ marginRight: spacing.sm }}
            />
            <Text style={styles.sectionTitle}>Yummy Time</Text>
          </View>
          
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
                  <Text style={styles.addMealPromptText}>Log your first meal!</Text>
                </Pressable>
              </Animated.View>
            )}
          </ScrollView>
        </Animated.View>
        
        {/* Daily Stats (Vet Visits alternative) */}
        <Animated.View 
          entering={FadeInDown.delay(600).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <IconContainer 
              name="stats-chart" 
              size={32} 
              iconSize={18}
              color={colors.yellow}
              borderColor={colors.yellow}
              shape="circle"
              style={{ marginRight: spacing.sm }}
            />
            <Text style={styles.sectionTitle}>Daily Stats</Text>
          </View>
          
          <View style={styles.quickStats}>
            <View style={[styles.quickStatCard, { backgroundColor: colors.pink + '15' }]}>
              <IconContainer
                name="happy-outline"
                size={36}
                iconSize={24}
                color={colors.pink}
                backgroundColor="transparent"
                borderWidth={0}
                shadow={false}
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.quickStatValue}>{stats.totalPoops}</Text>
              <Text style={styles.quickStatLabel}>Poops</Text>
            </View>
            <View style={[styles.quickStatCard, { backgroundColor: colors.blue + '15' }]}>
              <IconContainer
                name="flame-outline"
                size={36}
                iconSize={24}
                color={colors.blue}
                backgroundColor="transparent"
                borderWidth={0}
                shadow={false}
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.quickStatValue}>{stats.longestStreak}</Text>
              <Text style={styles.quickStatLabel}>Streak</Text>
            </View>
             <View style={[styles.quickStatCard, { backgroundColor: colors.yellow + '15' }]}>
              <IconContainer
                name="water-outline"
                size={36}
                iconSize={24}
                color={colors.yellow}
                backgroundColor="transparent"
                borderWidth={0}
                shadow={false}
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.quickStatValue}>{todayWater}</Text>
              <Text style={styles.quickStatLabel}>Water</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Bottom padding */}
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
  greeting: {
    fontSize: fontSizes.md,
    fontFamily: fonts.bodyBold,
    color: colors.black + '99',
  },
  userName: {
    fontSize: fontSizes['4xl'],
    fontFamily: fonts.heading, // Chewy
    color: colors.black,
  },
  userNameAccent: {
    color: colors.pink,
  },
  // notificationButton removed
  // notificationDot removed
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading, // Chewy
    color: colors.black,
    flex: 1,
    marginLeft: spacing.sm,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    ...shadows.sm,
  },
  countBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.bodyBold,
    color: colors.black + '99',
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
  activeLabelText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: fonts.bodyBold,
  },
  addButtonMargin: {
    // marginTop: spacing.sm,
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
    borderRadius: radii['2xl'],
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.sm,
  },
  quickStatValue: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading,
    color: colors.black,
  },
  quickStatLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: colors.black + '66',
    marginTop: 2,
  },
  bottomPadding: {
    height: 100, // Space for floating tab bar
  },
  // Last Poop Widget Styles
  lastPoopWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    ...shadows.sm,
  },
  lastPoopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  lastPoopIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastPoopLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.black + '66',
  },
  lastPoopValue: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading,
  },
  // Quick Poop Button Styles
  quickPoopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pink,
    borderRadius: radii['2xl'],
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  quickPoopText: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.bodyBold,
    color: colors.white,
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
  addMealPromptText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.bodyBold,
    color: colors.blue,
    textAlign: 'center',
  },
  emptyGutState: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  emptyGutText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.body,
    color: colors.black + '66',
    marginTop: spacing.xs,
  },
});

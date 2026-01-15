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
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadows, fontSizes, fonts } from '../theme';
import { useGutStore } from '../store';
import {
  GutAvatar,
  MissionCard,
  FoodBlobCard,
  AddButton,
  ScreenWrapper,
  BoxButton,
} from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, gutMoments, dailyTasks, toggleTask } = useGutStore();
  
  const incompleteTasks = dailyTasks.filter(t => !t.completed).length;
  
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
              <Ionicons name="hand-right" size={18} color={colors.yellow} style={styles.waveIcon} />
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
        
        {/* Gut Feelings (My Besties) */}
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.blue + '15', borderColor: colors.blue }]}>
              <Ionicons name="paw" size={16} color={colors.blue} />
            </View>
            <Text style={styles.sectionTitle}>Gut Feelings</Text>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.avatarsRow}
          >
            {/* Show current gut mood as "Active Pet" */}
             <Animated.View entering={FadeInRight.delay(300).springify()}>
                <Pressable
                  style={styles.avatarWrapper}
                  onPress={() => navigation.navigate('GutProfile')}
                >
                  <View style={styles.avatarContainer}>
                    <GutAvatar 
                        mood={user.avatarMood} 
                        size={64} 
                        ringColor={colors.pink} // Active ring
                    />
                    <View style={styles.activeLabel}>
                        <Text style={styles.activeLabelText}>{user.avatarMood}</Text>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>

             {/* Add Button for new moment */}
            <Animated.View entering={FadeInRight.delay(400).springify()}>
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
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.pink + '15', borderColor: colors.pink }]}>
              <Ionicons name="list" size={16} color={colors.pink} />
            </View>
            <Text style={styles.sectionTitle}>Today's Missions</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{incompleteTasks} Left</Text>
            </View>
          </View>
          
          <View style={styles.missionsContainer}>
            {dailyTasks.map((task, index) => (
              <Animated.View
                key={task.id}
                entering={FadeInDown.delay(400 + index * 100).springify()}
              >
                <MissionCard
                  title={task.title}
                  subtitle={task.subtitle}
                  completed={task.completed}
                  onToggle={() => toggleTask(task.id)}
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
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.blue + '15', borderColor: colors.blue }]}>
              <Ionicons name="restaurant" size={16} color={colors.blue} />
            </View>
            <Text style={styles.sectionTitle}>Yummy Time</Text>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mealsRow}
          >
              {/* Force Breakfast and Dinner cards to match reference layout always */}
               <Animated.View entering={FadeInRight.delay(600).springify()}>
                  <FoodBlobCard
                    mealType="breakfast"
                    name="Breakfast"
                    time="8:00"
                    completed={true} // Example state
                    style={styles.mealCardMargin}
                    onPress={() => {}}
                  />
               </Animated.View>
               <Animated.View entering={FadeInRight.delay(700).springify()}>
                  <FoodBlobCard
                    mealType="dinner"
                    name="Dinner"
                    time="6:30"
                    style={styles.mealCardMargin}
                    onPress={() => {}}
                  />
               </Animated.View>
          </ScrollView>
        </Animated.View>
        
        {/* Daily Stats (Vet Visits alternative) */}
        <Animated.View 
          entering={FadeInDown.delay(600).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.yellow + '20', borderColor: colors.yellow }]}>
              <Ionicons name="stats-chart" size={16} color={colors.yellow} />
            </View>
            <Text style={styles.sectionTitle}>Daily Stats</Text>
          </View>
          
          <View style={styles.quickStats}>
            <View style={[styles.quickStatCard, { backgroundColor: colors.pink + '15' }]}>
              <Ionicons name="happy-outline" size={24} color={colors.pink} style={{marginBottom: 8}} />
              <Text style={styles.quickStatValue}>{gutMoments.length}</Text>
              <Text style={styles.quickStatLabel}>Poops</Text>
            </View>
            <View style={[styles.quickStatCard, { backgroundColor: colors.blue + '15' }]}>
              <Ionicons name="flame-outline" size={24} color={colors.blue} style={{marginBottom: 8}} />
              <Text style={styles.quickStatValue}>{user.streak}</Text>
              <Text style={styles.quickStatLabel}>Streak</Text>
            </View>
             <View style={[styles.quickStatCard, { backgroundColor: colors.yellow + '15' }]}>
              <Ionicons name="water-outline" size={24} color={colors.yellow} style={{marginBottom: 8}} />
              <Text style={styles.quickStatValue}>4</Text>
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
});

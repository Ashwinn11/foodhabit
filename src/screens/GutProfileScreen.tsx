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
  FadeIn,
} from 'react-native-reanimated';
import { colors, spacing, radii, shadows, fontSizes, fonts } from '../theme';
import { useGutStore } from '../store';
import {
  GutAvatar,
  StatCard,
TimelineEntry,
  ScreenWrapper,
  BoxButton,
  IconContainer,
} from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type GutProfileScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const GutProfileScreen: React.FC<GutProfileScreenProps> = ({ navigation }) => {
  const { user, meals, getStats } = useGutStore();
  const stats = getStats();
  
  // Get last poop time formatted
  const getLastPoopTime = () => {
    if (!stats.lastPoopTime) return 'No logs';
    const last = new Date(stats.lastPoopTime);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Now!';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };
  
  return (
    <ScreenWrapper edges={['top']} style={styles.container}>
      {/* Header */}
      <Animated.View 
        entering={FadeIn.delay(100)}
        style={styles.header}
      >
        <BoxButton 
          icon="arrow-back" 
          onPress={() => navigation.goBack()}
          size={44}
        />
        
        <Text style={styles.title}>GUT PROFILE</Text>
        
        <BoxButton 
          icon="pencil" 
          onPress={() => console.log('Edit Profile')}
          size={44}
          color={colors.black}
          style={{ backgroundColor: colors.yellow }} // Yellow edit button from reference
        />
      </Animated.View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Avatar */}
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.avatarSection}
        >
          <View style={styles.mainAvatarContainer}>
            <GutAvatar 
              mood={user.avatarMood} 
              size={140}
              showBadge
              badgeText="Happy"
              ringColor={colors.pink}
            />
          </View>
          
          <Text style={styles.profileName}>Gut Buddy</Text>
          <View style={styles.subtitleRow}>
            <IconContainer 
              name="star" 
              size={20} 
              iconSize={14} 
              color={colors.yellow} 
              backgroundColor="transparent"
              borderWidth={0}
              shadow={false}
              style={styles.starIcon} 
            />
            <Text style={styles.profileSubtitle}>Your Digestive Friend</Text>
          </View>
        </Animated.View>
        
        {/* Stats */}
        <Animated.View 
          entering={FadeInDown.delay(300).springify()}
          style={styles.statsSection}
        >
          <View style={styles.statsRow}>
            <StatCard
              label="AVG/DAY"
              value={stats.avgFrequency}
              unit="x"
              color={colors.yellow}
              style={[styles.statCard, { transform: [{ rotate: '-1.5deg' }] }]}
            />
            <StatCard
              label="STREAK"
              value={stats.longestStreak}
              unit="days"
              color={colors.pink}
              style={[styles.statCard, { transform: [{ rotate: '2deg' }], marginTop: 2 }]}
            />
            <StatCard
              label="LAST"
              value={getLastPoopTime()}
              color={colors.blue}
              icon="time"
              style={[styles.statCard, { transform: [{ rotate: '-1deg' }] }]}
            />
          </View>
        </Animated.View>
        
        {/* Yummy Timeline */}
        <Animated.View 
          entering={FadeInDown.delay(400).springify()}
          style={styles.timelineSection}
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
            <Text style={styles.sectionTitle}>Yummy Timeline</Text>
            <Pressable>
              <Text style={styles.editLink}>Edit</Text>
            </Pressable>
          </View>
          
          <View style={styles.timelineContainer}>
            {meals.length > 0 ? (
              meals.slice(0, 5).map((meal, index) => (
                <Animated.View
                  key={meal.id}
                  entering={FadeInDown.delay(500 + index * 100).springify()}
                >
                  <TimelineEntry entry={meal} />
                </Animated.View>
              ))
            ) : (
              <View style={styles.emptyTimeline}>
                <IconContainer
                  name="fast-food-outline"
                  size={72}
                  iconSize={48}
                  color={colors.black + '40'}
                  backgroundColor="transparent"
                  borderWidth={0}
                  shadow={false}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyText}>No meals logged yet!</Text>
                <Pressable 
                  style={styles.addMealButton}
                  onPress={() => navigation.navigate('AddEntry')}
                >
                  <Text style={styles.addMealButtonText}>+ Add Meal</Text>
                </Pressable>
              </View>
            )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  // backButton removed
  // editButton removed
  // editIcon removed
  title: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading, // Chewy
    color: colors.black,
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  mainAvatarContainer: {
    marginBottom: spacing.lg,
  },
  profileName: {
    fontSize: fontSizes['3xl'],
    fontFamily: fonts.heading, // Chewy
    color: colors.black,
    marginBottom: spacing.xs,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: spacing.xs,
  },
  profileSubtitle: {
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.black + '99',
  },
  statsSection: {
    marginBottom: spacing['2xl'],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
  },
  timelineSection: {
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
  editLink: {
    fontSize: fontSizes.md,
    fontFamily: fonts.bodyBold,
    color: colors.pink,
  },
  timelineContainer: {
    // Timeline entries
  },
  emptyTimeline: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    ...shadows.sm,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.black + '66',
    marginBottom: spacing.lg,
  },
  addMealButton: {
    backgroundColor: colors.pink,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
  },
  addMealButtonText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.bodyBold,
    color: colors.white,
  },
  bottomPadding: {
    height: spacing['4xl'],
  },
});

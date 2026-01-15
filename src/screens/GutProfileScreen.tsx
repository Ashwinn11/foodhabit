import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import { colors, spacing } from '../theme';
import { useGutStore } from '../store';
import {
  GutAvatar,
  StatCard,
  TimelineEntry,
  ScreenWrapper,
  BoxButton,
  IconContainer,
  Typography,
  SectionHeader,
  Button,
  Card,
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
        
        <Typography variant="bodyBold" style={{ letterSpacing: 2 }}>GUT PROFILE</Typography>
        
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
          
          <Typography variant="h2">Gut Buddy</Typography>
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
            <Typography variant="body" color={colors.black + '99'}>
              Your Digestive Friend
            </Typography>
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
          <SectionHeader 
            title="Yummy Timeline" 
            icon="restaurant" 
            iconColor={colors.blue}
            onActionPress={() => console.log('Edit')}
            actionLabel="Edit"
          />
          
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
              <Card variant="white" style={styles.emptyTimeline}>
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
                <Typography variant="body" color={colors.black + '66'} style={{ marginBottom: spacing.lg }}>
                  No meals logged yet!
                </Typography>
                <Button 
                  title="+ Add Meal"
                  variant="primary"
                  color={colors.pink}
                  onPress={() => navigation.navigate('AddEntry')}
                />
              </Card>
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
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: spacing.xs,
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
  timelineContainer: {
    // Timeline entries
  },
  emptyTimeline: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  bottomPadding: {
    height: spacing['4xl'],
  },
});

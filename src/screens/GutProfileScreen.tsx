import React, { useMemo } from 'react';
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
  const { gutMoments, meals, getStats, getGutHealthScore } = useGutStore();
  const stats = getStats();
  const healthScore = getGutHealthScore();
  
  // Combine and sort meals + gut moments for the "Memory Bank" job
  const combinedHistory = useMemo(() => {
    const combined = [
      ...meals.map(m => ({ ...m, type: 'meal' as const })),
      ...gutMoments.map(g => ({ ...g, type: 'poop' as const }))
    ];
    
    return combined.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [meals, gutMoments]);
  
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
      <Animated.View 
        entering={FadeIn.delay(100)}
        style={styles.header}
      >
        <Typography variant="h2">History Book</Typography>
        
        <BoxButton 
          icon="add-circle" 
          onPress={() => navigation.navigate('AddEntry')}
          size={44}
          color={colors.pink}
        />
      </Animated.View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Avatar Section - The "Mascot Job" */}
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.avatarSection}
        >
          <View style={styles.mainAvatarContainer}>
            <GutAvatar 
              score={healthScore.score} 
              size={120}
              showBadge
              badgeText={stats.totalPoops > 0 ? `${stats.totalPoops} Logs` : 'Newbie'}
              ringColor={colors.pink}
            />
          </View>
          
          <Typography variant="h2">Your Gut Journey</Typography>
          <Typography variant="body" color={colors.black + '66'}>
            The full story of your gut
          </Typography>
        </Animated.View>
        
        {/* Quick Review Stats */}
        <Animated.View 
          entering={FadeInDown.delay(300).springify()}
          style={styles.statsSection}
        >
          <View style={styles.statsRow}>
            <StatCard
              label="TOTAL"
              value={stats.totalPoops}
              unit="logs"
              color={colors.blue}
              style={[styles.statCard, { transform: [{ rotate: '-1.5deg' }] }]}
            />
            <StatCard
              label="STREAK"
              value={stats.longestStreak}
              unit="days"
              color={colors.pink}
              style={[styles.statCard, { transform: [{ rotate: '1deg' }] }]}
            />
            <StatCard
              label="LAST POOP"
              value={getLastPoopTime()}
              color={colors.yellow}
              icon="time"
              style={[styles.statCard, { transform: [{ rotate: '-1deg' }], marginTop: 2 }]}
            />
          </View>
        </Animated.View>
        
        {/* The Memory Bank - Combined Timeline */}
        <Animated.View 
          entering={FadeInDown.delay(400).springify()}
          style={styles.timelineSection}
        >
          <SectionHeader 
            title="Gut Timeline" 
            icon="book" 
            iconColor={colors.blue}
            onActionPress={() => navigation.navigate('AddEntry')}
            actionLabel="+ Log"
          />
          
          <View style={styles.timelineContainer}>
            {combinedHistory.length > 0 ? (
              combinedHistory.map((item, index) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInDown.delay(500 + index * 50).springify()}
                >
                  <TimelineEntry item={item} />
                </Animated.View>
              ))
            ) : (
              <Card variant="white" style={styles.emptyTimeline}>
                <IconContainer
                  name="calendar-outline"
                  size={72}
                  iconSize={48}
                  color={colors.black + '15'}
                  backgroundColor="transparent"
                  borderWidth={0}
                  shadow={false}
                  style={styles.emptyIcon}
                />
                <Typography variant="body" color={colors.black + '66'} align="center" style={{ marginBottom: spacing.lg }}>
                  Your history book is empty!{"\n"}Log a meal or a moment to start.
                </Typography>
                <Button 
                  title="Start Logging"
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
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  mainAvatarContainer: {
    marginBottom: spacing.md,
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
    paddingTop: spacing.md,
  },
  emptyTimeline: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  bottomPadding: {
    height: 120, // Enough room for tab bar
  },
});

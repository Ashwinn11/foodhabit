import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { entryService } from '../services/gutHarmony/entryService';
import { streakService } from '../services/gutHarmony/streakService';
import { challengeService, WeeklyChallenge } from '../services/gutHarmony/challengeService';
import { scoringService, ScoreBreakdown } from '../services/gutHarmony/scoringService';
import { patternService, PatternInsight } from '../services/gutHarmony/patternService';
import { getUserProfile } from '../services/gutHarmony/userService';
import { theme } from '../theme';
import { Text, Card, SectionHeader } from '../components';
import Button from '../components/Button';
import PetCharacter from '../components/PetCharacter';
import Avatar from '../components/Avatar';
import QuickLogScreen from './QuickLogScreen';
import { Ionicons } from '@expo/vector-icons';
import { STOOL_TYPES, getEnergyIcon } from '../constants/stoolData';

interface DashboardData {
  currentStreak: number;
  todayLogged: boolean;
  recentEntries: any[];
  isLoading: boolean;
  insights: string[];
  challenge: WeeklyChallenge | null;
  scores: ScoreBreakdown | null;
  patternInsights: PatternInsight[];
  userProfile: any;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    currentStreak: 0,
    todayLogged: false,
    recentEntries: [],
    isLoading: true,
    insights: [],
    challenge: null,
    scores: null,
    patternInsights: [],
    userProfile: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDashboardData();
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [user?.id]);

  const generateInsights = (entries: any[]): string[] => {
    const insights: string[] = [];
    const entryCount = entries.length;

    if (entryCount === 0) {
      insights.push('Start tracking now. Identify your enemies.');
    } else if (entryCount < 3) {
      insights.push(`${3 - entryCount} more logs to unlock trigger detection.`);
    } else {
      // Calculate trend
      const avgStoolType = entries.reduce((sum, e) => sum + (e.stool_type || 0), 0) / entryCount;
      const avgEnergy = entries.reduce((sum, e) => sum + (e.energy_level || 0), 0) / entryCount;

      if (avgStoolType > 5) {
        insights.push('Soft stools detected. Trigger foods likely present.');
      } else if (avgStoolType < 3) {
        insights.push('Hard stools detected. Hydration critical.');
      } else {
        insights.push('Optimal range maintained. Keep fighting.');
      }

      if (avgEnergy < 5) {
        insights.push('Energy levels depleted. Recovery needed.');
      } else if (avgEnergy > 8) {
        insights.push('Peak energy maintained. Winning strategy.');
      }
    }

    return insights;
  };

  const loadDashboardData = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID');
        return;
      }

      setDashboardData((prev) => ({ ...prev, isLoading: true }));

      const [
        streak,
        recentEntries,
        thisWeekChallenge,
        scores,
        patternInsights,
        userProfile,
      ] = await Promise.all([
        streakService.getStreakCount(user.id),
        entryService.getRecentEntries(user.id, 7),
        challengeService.getThisWeekChallenge(user.id),
        scoringService.getScoreBreakdown(user.id),
        patternService.getTopInsights(user.id),
        getUserProfile(user.id),
      ]);

      const insights = generateInsights(recentEntries || []);

      setDashboardData({
        currentStreak: streak || 0,
        todayLogged: false, // Always allow logging (multiple entries per day)
        recentEntries: recentEntries || [],
        isLoading: false,
        insights,
        challenge: thisWeekChallenge,
        scores: scores || null,
        patternInsights: patternInsights || [],
        userProfile: userProfile || null,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDashboardData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleQuickLogComplete = async () => {
    setShowQuickLog(false);
    // Reload dashboard data to show updated streak and today's logged status
    await loadDashboardData();
  };

  if (dashboardData.isLoading && dashboardData.recentEntries.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={theme.colors.brand.primary}
          style={styles.loader}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.brand.primary}
          />
        }
      >
        {/* ===== CLEAN & MINIMALISTIC LAYOUT ===== */}

        {/* Header - Avatar (with streak badge) + Greeting + Notification */}
        <View style={styles.headerWithAvatar}>
          {/* Left - Avatar */}
          <Avatar
            name={dashboardData.userProfile?.name || user?.user_metadata?.full_name || 'user'}
            size={72}
          />

          {/* Center - Greeting with Title & Subtitle */}
          <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <Text variant="body" weight="semiBold" color="secondary">
                Hey, {dashboardData.userProfile?.name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'there'}!
              </Text>
              <Ionicons
                name="sparkles"
                size={16}
                color={theme.colors.brand.tertiary}
              />
            </View>
            <Text variant="caption1" color="secondary" style={{ marginTop: 4 }}>
              Ready to crush your triggers?
            </Text>
          </View>

          {/* Right - Notification Icon */}
          <Ionicons
            name="notifications-outline"
            size={24}
            color={theme.colors.brand.primary}
          />
        </View>

        {/* Spacing after header */}
        <View style={{ height: theme.spacing.lg }} />

        {/* Stats Section - Gut Health & Bloating 2 Column */}
        {dashboardData.scores && (
          <View style={styles.quickStatsSection}>
            {/* Gut Health */}
            <Card
              padding="medium"
              style={styles.statCard}
              backgroundColor={theme.colors.background.card}
              borderRadius="xl"
              elevation="primary"
            >
              <Text variant="caption1" color="secondary" weight="bold">
                GUT HEALTH
              </Text>
              <Text variant="title1" weight="bold" style={{ color: theme.colors.brand.primary, marginTop: 4 }}>
                {Math.round(dashboardData.scores.gutHealthScore)}%
              </Text>
              <View style={[styles.inlineBadge, { backgroundColor: theme.colors.brand.primary + '15' }]}>
                <Ionicons name="trending-up" size={12} color={theme.colors.brand.primary} />
                <Text variant="caption2" style={{ color: theme.colors.brand.primary, marginLeft: 4 }}>
                  Optimal
                </Text>
              </View>
            </Card>

            {/* Bloating */}
            <Card
              padding="medium"
              style={styles.statCard}
              backgroundColor={theme.colors.background.card}
              borderRadius="xl"
              elevation="secondary"
            >
              <Text variant="caption1" color="secondary" weight="bold">
                BLOATING
              </Text>
              <Text variant="title1" weight="bold" style={{ color: theme.colors.brand.secondary, marginTop: 4 }}>
                {Math.round(dashboardData.scores.bloatingIndex)}%
              </Text>
              <View style={[styles.inlineBadge, { backgroundColor: theme.colors.brand.secondary + '15' }]}>
                <Ionicons name="water" size={12} color={theme.colors.brand.secondary} />
                <Text variant="caption2" style={{ color: theme.colors.brand.secondary, marginLeft: 4 }}>
                  Stable
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* Spacing before pet */}
        <View style={{ height: theme.spacing.md }} />

        {/* Pet Character - HERO SECTION (Center Stage) */}
        <Animated.View
          style={[
            styles.petSection,
            {
              transform: [
                {
                  scale: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
              opacity: scaleAnim,
            },
          ]}
        >
          {dashboardData.scores && (
            <PetCharacter
              healthScore={dashboardData.scores.gutHealthScore}
              size={220}
            />
          )}
        </Animated.View>

        {/* Spacing after pet */}
        <View style={{ height: theme.spacing.lg }} />

        {/* Weekly Challenge - Compact */}
        {dashboardData.challenge && (
          <View style={styles.compactChallengeSection}>
            <Card
              padding="medium"
              backgroundColor={theme.colors.brand.primary}
              borderRadius="xl"
              elevation="primary"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.challengeIconContainer}>
                   <Ionicons name="trophy" size={20} color={theme.colors.brand.white} />
                </View>
                <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                  <Text
                    variant="caption"
                    weight="bold"
                    style={{ color: theme.colors.brand.white + '80' }}
                  >
                    WEEKLY CHALLENGE
                  </Text>
                  <Text
                    variant="body"
                    weight="bold"
                    style={{
                      color: theme.colors.brand.white,
                      marginTop: 2,
                    }}
                  >
                    {dashboardData.challenge.challenge_description}
                  </Text>
                </View>
                <View style={styles.daysBadge}>
                 <Text variant="caption1" weight="bold" color="primary">
                     {challengeService.getDaysRemaining(dashboardData.challenge)}d left
                   </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Pattern Insights - Minimal Cards */}
        {dashboardData.patternInsights.length > 0 ? (
          <View style={styles.compactPatternsSection}>
            {dashboardData.patternInsights.slice(0, 2).map((insight, index) => (
              <Card
                key={index}
                padding="small"
                style={styles.compactPatternCard}
                backgroundColor={theme.colors.background.card}
                borderRadius="lg"
              >
                <Ionicons
                  name={insight.type === 'food_symptom' ? 'leaf' : 'heart'}
                  size={16}
                  color={theme.colors.brand.primary}
                  style={{ marginRight: theme.spacing.md }}
                />
                <View style={{ flex: 1 }}>
                   <Text variant="caption1" style={{ color: theme.colors.text.primary }}>
                     {insight.description}
                   </Text>
                </View>
              </Card>
            ))}
          </View>
        ) : null}

        {/* CTA Section - Log Entry */}
        <View style={styles.ctaSection}>
          <Button
            title="Log Attack Now"
            onPress={() => setShowQuickLog(true)}
            variant="primary"
            size="large"
            fullWidth
            icon="add-circle"
          />
        </View>

        {/* Recent Logs Section */}
        {dashboardData.recentEntries.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader 
               title="Recent Activity" 
               onActionPress={() => console.log('Navigate to history')} 
               actionIcon="arrow-forward"
            />

            {dashboardData.recentEntries.slice(0, 3).map((entry, index) => {
              const stoolType = STOOL_TYPES.find(t => t.type === entry.stool_type);
              const energyIcon = getEnergyIcon(entry.energy_level);
              
              return (
                <Card
                  key={index}
                  padding="medium"
                  style={{ marginBottom: theme.spacing.md }}
                  backgroundColor={theme.colors.background.card}
                  borderRadius="xl"
                  onPress={() => console.log('View entry')}
                >
                  <View style={styles.logItemRow}>
                    <View style={[styles.logIconContainer, { backgroundColor: stoolType?.color ? stoolType.color + '20' : theme.colors.background.card }]}>
                       {stoolType && (
                         <stoolType.iconLib 
                           name={stoolType.icon as any} 
                           size={20} 
                           color={stoolType.color} 
                         />
                       )}
                    </View>

                    <View style={styles.logContent}>
                      <Text variant="body" weight="bold">
                         {stoolType?.label || `Type ${entry.stool_type}`}
                      </Text>
                       <Text variant="caption1" color="secondary">
                         {new Date(entry.created_at).toLocaleDateString('en-US', {
                           month: 'short',
                           day: 'numeric',
                           hour: '2-digit',
                           minute: '2-digit',
                         })}
                       </Text>
                    </View>

                    <View style={styles.logMeta}>
                      <View style={[styles.energyIconSmall, { backgroundColor: energyIcon.color + '20' }]}>
                        <Ionicons
                          name={energyIcon.name as any}
                          size={14}
                          color={energyIcon.color}
                        />
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={theme.colors.text.tertiary}
                        style={{ marginLeft: theme.spacing.sm }}
                      />
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        ) : null}

        {/* Empty State */}
        {dashboardData.recentEntries.length === 0 && !dashboardData.isLoading && (
          <View style={styles.emptySection}>
            <Ionicons
              name="clipboard-outline"
              size={48}
              color={theme.colors.text.tertiary}
            />
            <Text
              variant="title3"
              weight="semiBold"
              style={{ marginTop: 16 }}
            >
              No entries yet
            </Text>
            <Text
              variant="body"
              color="secondary"
              align="center"
              style={{ marginTop: 8 }}
            >
              Start logging immediately to identify your enemies
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Quick Log Modal */}
      <Modal
        visible={showQuickLog}
        animationType="slide"
        onRequestClose={() => setShowQuickLog(false)}
        statusBarTranslucent
      >
        <QuickLogScreen
          onComplete={handleQuickLogComplete}
          onCancel={() => setShowQuickLog(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
    paddingTop: theme.spacing['2xl'],
  },
  headerWithAvatar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
    paddingTop: theme.spacing['2xl'],
    gap: theme.spacing.md,
  },

  /* Streak Section */
  streakSection: {
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing['3xl'],
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.brand.cream,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  streakIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.brand.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakContent: {
    flex: 1,
  },

  /* Challenge Section */
  challengeSection: {
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing['3xl'],
  },
  challengeCard: {
    backgroundColor: theme.colors.brand.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  daysRemainingBadge: {
    backgroundColor: theme.colors.brand.cream,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },

  /* Scores Section */
  scoresSection: {
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing['3xl'],
  },
  scoresGrid: {
    flexDirection: 'row',
    gap: theme.spacing['2xl'],
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  /* Pattern Section */
  patternsSection: {
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing['3xl'],
  },
  patternCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  patternIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.brand.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    flexShrink: 0,
  },
  confidenceBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },

  /* Insights Section */
  insightsSection: {
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing['3xl'],
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.brand.primary + '05',
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.brand.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  insightIconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.brand.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    flexShrink: 0,
  },

  /* CTA Section */
  ctaSection: {
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing['3xl'],
  },
  successSection: {
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing['3xl'],
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.brand.primary + '15',
  },

  /* Section */
  section: {
    marginBottom: theme.spacing['3xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing['2xl'],
  },

  /* Log Items - Minimal list */
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.separator,
  },
  logIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  logContent: {
    flex: 1,
    justifyContent: 'center',
  },
  logDate: {
    minWidth: 50,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* Pet Section */
  petSection: {
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Quick Stats - Minimal 2 Column */
  quickStatsSection: {
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing['2xl'],
    flexDirection: 'row',
    gap: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Compact Challenge */
  compactChallengeSection: {
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing['2xl'],
  },
  compactChallengeCard: {
    backgroundColor: theme.colors.brand.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* Compact Patterns */
  compactPatternsSection: {
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing['2xl'],
    gap: theme.spacing.md,
  },
  compactPatternCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },

  /* Empty State */
  emptySection: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing['3xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* New Modern Styles */
  inlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.md,
  },
  challengeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysBadge: {
    backgroundColor: theme.colors.brand.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
  },
  logItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  energyIconSmall: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

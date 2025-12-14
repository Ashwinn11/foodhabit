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
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { entryService } from '../services/gutHarmony/entryService';
import { streakService } from '../services/gutHarmony/streakService';
import { theme } from '../theme';
import Text from '../components/Text';
import Button from '../components/Button';
import QuickLogScreen from './QuickLogScreen';
import { Ionicons } from '@expo/vector-icons';
import { STOOL_TYPES, getEnergyIcon } from '../constants/stoolData';

interface DashboardData {
  currentStreak: number;
  todayLogged: boolean;
  recentEntries: any[];
  isLoading: boolean;
  insights: string[];
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
      insights.push('Start logging daily to discover your food triggers.');
    } else if (entryCount < 3) {
      insights.push(`Keep logging! ${3 - entryCount} more entries to find patterns.`);
    } else {
      // Calculate trend
      const avgStoolType = entries.reduce((sum, e) => sum + (e.stool_type || 0), 0) / entryCount;
      const avgEnergy = entries.reduce((sum, e) => sum + (e.energy_level || 0), 0) / entryCount;

      if (avgStoolType > 5) {
        insights.push('Your logs show softer stools recently. Watch for trigger foods.');
      } else if (avgStoolType < 3) {
        insights.push('Your logs show harder stools recently. Stay hydrated!');
      } else {
        insights.push('Your stools are trending healthy. Keep up the good work!');
      }

      if (avgEnergy < 5) {
        insights.push('Your energy levels have been low. Rest up!');
      } else if (avgEnergy > 8) {
        insights.push('Great energy levels! Keep doing what you\'re doing.');
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

      const streak = await streakService.getStreakCount(user.id);
      console.log('Streak:', streak);

      // Get recent entries - users can log multiple times per day
      const recentEntries = await entryService.getRecentEntries(user.id, 7);
      console.log('Recent entries:', recentEntries?.length || 0);

      const insights = generateInsights(recentEntries || []);

      setDashboardData({
        currentStreak: streak || 0,
        todayLogged: false, // Always allow logging (multiple entries per day)
        recentEntries: recentEntries || [],
        isLoading: false,
        insights,
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
        {/* Header - Minimal */}
        <View style={styles.header}>
          <View>
            <Text variant="caption" color="secondary">
              Welcome back
            </Text>
            <Text variant="largeTitle" weight="bold" style={{ marginTop: 4 }}>
              {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}
            </Text>
          </View>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={theme.colors.brand.primary}
          />
        </View>

        {/* Hero Stat - Streak */}
        <Animated.View
          style={[
            styles.streakSection,
            {
              transform: [
                {
                  scale: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
              opacity: scaleAnim,
            },
          ]}
        >
          <View style={styles.streakCard}>
            <View style={styles.streakIcon}>
              <Ionicons
                name="flame"
                size={28}
                color={theme.colors.brand.primary}
              />
            </View>
            <View style={styles.streakContent}>
              <Text
                variant="caption"
                style={{ color: theme.colors.brand.black }}
              >
                Current Streak
              </Text>
              <Text
                variant="title1"
                weight="bold"
                style={{ color: theme.colors.brand.primary, marginTop: 4 }}
              >
                {dashboardData.currentStreak} days
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Insights Section */}
        {dashboardData.insights.length > 0 && (
          <View style={styles.insightsSection}>
            <Text variant="title2" weight="bold" style={{ marginBottom: theme.spacing.md }}>
              Your Insights
            </Text>
            {dashboardData.insights.map((insight, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.insightCard,
                  {
                    opacity: Animated.add(
                      scaleAnim,
                      new Animated.Value(0.1 * index)
                    ),
                  },
                ]}
              >
                <View style={styles.insightIconContainer}>
                  <Ionicons
                    name="bulb-outline"
                    size={18}
                    color={theme.colors.brand.primary}
                  />
                </View>
                <Text
                  variant="body"
                  style={{ flex: 1, color: theme.colors.text.primary }}
                >
                  {insight}
                </Text>
              </Animated.View>
            ))}
          </View>
        )}

        {/* CTA Section - Log Entry (Multiple entries per day allowed) */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            onPress={() => setShowQuickLog(true)}
            style={{
              backgroundColor: theme.colors.brand.primary,
              paddingVertical: theme.spacing.lg,
              borderRadius: theme.borderRadius.pill,
              alignItems: 'center',
              shadowColor: theme.colors.brand.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text
              variant="body"
              weight="semiBold"
              style={{ color: theme.colors.brand.white }}
            >
              Log Today's Entry
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Logs Section */}
        {dashboardData.recentEntries.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="title2" weight="bold">
                Recent
              </Text>
              <Button
                title="All"
                variant="ghost"
                onPress={() => console.log('Navigate to history')}
              />
            </View>

            {dashboardData.recentEntries.slice(0, 3).map((entry, index) => {
              const stoolType = STOOL_TYPES.find(t => t.type === entry.stool_type);
              const energyIcon = getEnergyIcon(entry.energy_level);
              
              return (
                <View key={index} style={styles.logItem}>
                  {/* Left: Stool Icon */}
                  <View style={[styles.logIconContainer, { backgroundColor: stoolType?.color ? stoolType.color + '20' : theme.colors.background.card }]}>
                     {stoolType && (
                       <stoolType.iconLib 
                         name={stoolType.icon as any} 
                         size={20} 
                         color={stoolType.color} 
                       />
                     )}
                  </View>

                  {/* Middle: Info */}
                  <View style={styles.logContent}>
                    <Text variant="body" weight="semiBold">
                       {stoolType?.label || `Type ${entry.stool_type}`}
                    </Text>
                    <Text variant="caption" color="secondary">
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  {/* Right: Energy & Symptoms */}
                  <View style={styles.logMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name={energyIcon.name as any}
                        size={16}
                        color={energyIcon.color}
                      />
                    </View>
                    {entry.symptoms && entry.symptoms.length > 0 && (
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="alert-circle-outline"
                          size={16}
                          color={theme.colors.brand.tertiary}
                        />
                        <Text
                          variant="caption"
                          style={{ marginLeft: 2 }}
                          weight="semiBold"
                        >
                          {entry.symptoms.length}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

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
              Start logging daily patterns to discover your triggers
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
    backgroundColor: 'rgba(255, 118, 100, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakContent: {
    flex: 1,
  },

  /* Insights Section */
  insightsSection: {
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing['3xl'],
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 118, 100, 0.05)',
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
    backgroundColor: 'rgba(255, 118, 100, 0.1)',
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
    borderColor: 'rgba(255, 118, 100, 0.15)',
  },

  /* Section */
  section: {
    paddingHorizontal: theme.spacing['2xl'],
    marginBottom: theme.spacing['3xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },

  /* Log Items - Minimal list */
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
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

  /* Empty State */
  emptySection: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing['3xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
});

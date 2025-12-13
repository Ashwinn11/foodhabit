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

interface DashboardData {
  currentStreak: number;
  todayLogged: boolean;
  recentEntries: any[];
  isLoading: boolean;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    currentStreak: 0,
    todayLogged: false,
    recentEntries: [],
    isLoading: true,
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

      setDashboardData({
        currentStreak: streak || 0,
        todayLogged: false, // Always allow logging (multiple entries per day)
        recentEntries: recentEntries || [],
        isLoading: false,
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

        {/* CTA Section - Log Entry (Multiple entries per day allowed) */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            onPress={() => setShowQuickLog(true)}
            style={{
              backgroundColor: theme.colors.brand.primary,
              paddingVertical: theme.spacing.lg,
              borderRadius: theme.borderRadius.pill,
              alignItems: 'center',
            }}
          >
            <Text
              variant="body"
              weight="semiBold"
              style={{ color: theme.colors.brand.white }}
            >
              Log Stool Entry
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

            {dashboardData.recentEntries.slice(0, 3).map((entry, index) => (
              <View key={index} style={styles.logItem}>
                <View style={styles.logDate}>
                  <Text variant="caption" weight="semiBold">
                    {new Date(entry.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.logMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="fitness-outline"
                      size={14}
                      color={theme.colors.brand.primary}
                    />
                    <Text
                      variant="caption"
                      style={{ marginLeft: 4 }}
                      weight="semiBold"
                    >
                      {entry.energy_level}/10
                    </Text>
                  </View>
                  {entry.symptoms && entry.symptoms.length > 0 && (
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={14}
                        color={theme.colors.brand.tertiary}
                      />
                      <Text
                        variant="caption"
                        style={{ marginLeft: 4 }}
                        weight="semiBold"
                      >
                        {entry.symptoms.length}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
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
  logDate: {
    minWidth: 50,
  },
  logMeta: {
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginLeft: theme.spacing.lg,
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

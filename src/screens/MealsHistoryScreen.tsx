import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, BackgroundBlobs } from '../components';
import { theme } from '../theme';
import { FoodScan, getRecentScans } from '../services/databaseService';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

interface MealCardProps {
  scan: FoodScan;
  index: number;
  onPress: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ scan, index, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4ade80';
    if (score >= 60) return '#a5e1a6';
    if (score >= 40) return '#fbbf24';
    return '#ff7664';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "I'm thriving! 😍";
    if (score >= 60) return "I'm doing good! ✨";
    if (score >= 40) return "I'm okay, but... 😶";
    return "Ouch! Please no... 😵";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Get meal name from identified foods
  const mealName = scan.identified_foods
    .map(f => f.name)
    .join(', ');

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.cardContainer}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.card}
          >
            {/* Header with Score and Meal Name */}
            <View style={styles.cardHeader}>
              <View style={styles.mealInfo}>
                <Text variant="headline" weight="bold" numberOfLines={2}>
                  {mealName}
                </Text>
                <Text variant="caption1" color="secondary" style={styles.dateText}>
                  <Ionicons name="time-outline" size={12} color="rgba(255, 255, 255, 0.5)" />
                  {' '}{formatDate(scan.scanned_at)}
                </Text>
              </View>
              <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(scan.gut_health_score) }]}>
                <Text variant="title2" weight="bold" style={styles.scoreBadgeText}>{scan.gut_health_score}</Text>
                <Text variant="caption2" style={[styles.scoreMaxText, styles.scoreBadgeText]}>/100</Text>
              </View>
            </View>

            {/* Score Label */}
            <View style={styles.scoreLabelRow}>
              <Text variant="callout" weight="semiBold" style={{ color: getScoreColor(scan.gut_health_score) }}>
                {getScoreLabel(scan.gut_health_score)}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default function MealsHistoryScreen({ navigation }: any) {
  const [scans, setScans] = useState<FoodScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadScans = async () => {
    try {
      const data = await getRecentScans(50); // Load up to 50 meals
      setScans(data);
    } catch (error) {
      console.error('Error loading scans:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadScans();
  };

  const handleMealPress = (scan: FoodScan) => {
    navigation.navigate('MealDetail', { scan });
  };

  return (
    <LinearGradient
      colors={[theme.colors.brand.backgroundGradientStart, theme.colors.brand.backgroundGradientEnd]}
      style={styles.container}
    >
      <BackgroundBlobs />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="largeTitle" weight="bold">Meal History</Text>
              <Text variant="callout" color="secondary">
                {scans.length} {scans.length === 1 ? 'meal' : 'meals'} scanned
              </Text>
            </View>
            <View style={styles.iconContainer}>
              <Ionicons name="restaurant" size={32} color={theme.colors.brand.coral} />
            </View>
          </View>
        </Animated.View>

        {/* Meals List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.brand.coral}
              colors={[theme.colors.brand.coral]}
            />
          }
        >
          {loading ? (
            <Animated.View entering={FadeIn} style={styles.emptyContainer}>
              <Ionicons name="hourglass-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
              <Text variant="headline" weight="semiBold" style={styles.emptyText}>
                Loading your meals...
              </Text>
            </Animated.View>
          ) : scans.length === 0 ? (
            <Animated.View entering={FadeIn} style={styles.emptyContainer}>
              <Ionicons name="fast-food-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
              <Text variant="headline" weight="semiBold" style={styles.emptyText}>
                No meals scanned yet
              </Text>
              <Text variant="body" color="secondary" style={styles.emptySubtext}>
                Start scanning your meals to see them here!
              </Text>
            </Animated.View>
          ) : (
            scans.map((scan, index) => (
              <MealCard
                key={scan.id}
                scan={scan}
                index={index}
                onPress={() => handleMealPress(scan)}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  cardContainer: {
    marginBottom: theme.spacing.md,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  mealInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  scoreBadge: {
    minWidth: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scoreBadgeText: {
    color: '#000000',
  },
  scoreMaxText: {
    opacity: 0.7,
    marginTop: -2,
  },
  scoreLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 3,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: theme.spacing.lg,
  },
  emptySubtext: {
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});

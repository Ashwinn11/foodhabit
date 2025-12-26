import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../components';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { 
  getUserStreak, 
  getTodayScans, 
  getTodayAverageScore 
} from '../services/databaseService';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [todayScans, setTodayScans] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Fetch data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      // Fetch all data in parallel
      const [streakData, scans, avgScoreData] = await Promise.all([
        getUserStreak(),
        getTodayScans(),
        getTodayAverageScore(),
      ]);

      setStreak(streakData?.current_streak || 0);
      setTodayScans(scans.length);
      setAvgScore(avgScoreData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleScanMeal = () => {
    navigation.navigate('Camera');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="title1" weight="bold" style={styles.headerText}>
          GutScan
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Gigi Character Placeholder */}
        <View style={styles.gigiContainer}>
          <View style={styles.gigiPlaceholder}>
            <Text variant="largeTitle" style={styles.gigiEmoji}>
              🦠
            </Text>
          </View>
          <Text variant="title2" weight="semiBold" style={styles.gigiMessage}>
            Ready to scan your meal?
          </Text>
        </View>

        {/* Scan Button */}
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={handleScanMeal}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={32} color={theme.colors.brand.black} />
          <Text variant="title3" weight="bold" style={styles.scanButtonText}>
            Scan Meal
          </Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text variant="body" style={styles.statsText}>
            Today: {todayScans} scans | Avg: {avgScore}
          </Text>
          <Text variant="body" style={styles.statsText}>
            🔥 {streak} day streak
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.brand.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  headerText: {
    color: theme.colors.brand.cream,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  gigiContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['4xl'],
  },
  gigiPlaceholder: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: (width * 0.5) / 2,
    backgroundColor: theme.colors.brand.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  gigiEmoji: {
    fontSize: 100,
  },
  gigiMessage: {
    color: theme.colors.text.white,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: theme.colors.brand.cream,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing['3xl'],
    borderRadius: theme.borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing['3xl'],
    boxShadow: '0 4px 8px rgba(255, 118, 100, 0.3)',
    elevation: 8,
  },
  scanButtonText: {
    color: theme.colors.brand.black,
  },
  statsContainer: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statsText: {
    color: theme.colors.text.white,
    opacity: 0.7,
  },
});

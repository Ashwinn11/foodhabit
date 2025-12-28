import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Gigi } from '../components';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { 
  getUserStreak, 
  getTodayScans, 
  getTodayAverageScore,
  getUserProfile
} from '../services/databaseService';
import { useFocusEffect } from '@react-navigation/native';



const LEVELS = [50, 100, 500, 1000];

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [todayScans, setTodayScans] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
  const [level, setLevel] = useState(1);

  // Fetch data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      // Fetch all data in parallel
      const [streakData, scans, avgScoreData, profile] = await Promise.all([
        getUserStreak(),
        getTodayScans(),
        getTodayAverageScore(),
        getUserProfile(),
      ]);

      setStreak(streakData?.current_streak || 0);
      setTodayScans(scans.length);
      setAvgScore(avgScoreData);
      setTotalScans(profile?.total_scans || 0);
      setLevel(profile?.gigi_level || 1);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleScanMeal = () => {
    navigation.navigate('Camera');
  };

  const handlePremium = () => {
    navigation.navigate('Paywall');
  };

  // Calculate progress to next level
  const nextLevelTarget = LEVELS.find(l => l > totalScans) || LEVELS[LEVELS.length - 1];
  const progress = Math.min(totalScans / nextLevelTarget, 1);
  const scansNeeded = nextLevelTarget - totalScans;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="title1" weight="bold" style={styles.headerText}>
          GutScan
        </Text>
        <TouchableOpacity style={styles.premiumBadge} onPress={handlePremium}>
          <Text variant="caption1" weight="bold" style={styles.premiumText}>PRO</Text>
        </TouchableOpacity>
      </View>

      {/* Level Progress */}
      <View style={styles.levelContainer}>
        <View style={styles.levelInfo}>
          <Text variant="caption1" style={styles.levelLabel}>Level {level}</Text>
          <Text variant="caption1" style={styles.levelNext}>{scansNeeded} scans to next level</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        
        {/* Gigi Character */}
        <TouchableOpacity style={styles.gigiContainer} activeOpacity={0.9} onPress={() => {}}>
           <Gigi 
            emotion={
              avgScore >= 90 ? 'crown' :        // 90-100: Crown - Champion level!
              avgScore >= 80 ? 'balloon' :      // 80-89: Balloon - Celebrating
              avgScore >= 70 ? 'cute' :         // 70-79: Cute/Love - Very happy
              avgScore >= 60 ? 'clap' :         // 60-69: Clapping - Good job
              avgScore >= 50 ? 'shock' :        // 50-59: Shocked - Could be better
              avgScore >= 40 ? 'frustrate' :    // 40-49: Frustrated - Not ideal
              avgScore >= 30 ? 'sick' :         // 30-39: Sick - Unhealthy
              avgScore > 0 ? 'cry' :            // 0-29: Crying - Very unhealthy
              'clap'                            // No score yet - Neutral/ready
            } 
            size="lg"
            animated={true}
          />
           <View style={styles.messageBubble}>
            <Text variant="body" weight="medium" style={styles.gigiMessageText}>
              {avgScore >= 90 ? "You're a health champion! 👑" : 
               avgScore >= 80 ? "Amazing choices today! 🎈" : 
               avgScore >= 70 ? "Loving your healthy habits! 💕" : 
               avgScore >= 60 ? "Great work, keep it up! 👏" : 
               avgScore >= 50 ? "Hmm, could be healthier! 🤔" : 
               avgScore >= 40 ? "Let's aim higher next time! 😤" : 
               avgScore >= 30 ? "These choices aren't helping... 🤢" : 
               avgScore > 0 ? "We need to talk about this... 😢" : 
               "Ready to scan your meal?"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Scan Button */}
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={handleScanMeal}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={28} color={theme.colors.brand.black} />
          <Text variant="title3" weight="bold" style={styles.scanButtonText}>
            Scan Meal
          </Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsRow}>
            <View style={styles.statItem}>
                <Text variant="title3" weight="bold" style={styles.statValue}>{todayScans}</Text>
                <Text variant="caption1" style={styles.statLabel}>Today</Text>
            </View>
             <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text variant="title3" weight="bold" style={styles.statValue}>{streak}</Text>
                <Text variant="caption1" style={styles.statLabel}>Streak</Text>
            </View>
             <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text variant="title3" weight="bold" style={styles.statValue}>
                  {avgScore !== null && avgScore !== undefined ? avgScore : '-'}
                </Text>
                <Text variant="caption1" style={styles.statLabel}>Avg Score</Text>
            </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  headerText: {
    color: theme.colors.brand.cream,
  },
  premiumBadge: {
    backgroundColor: theme.colors.brand.coral,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  premiumText: {
    color: theme.colors.brand.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    overflow: 'visible', // Allow hearts to float out of this area
  },
  levelContainer: {
    width: '100%',
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  levelLabel: {
    color: theme.colors.brand.teal,
    fontWeight: 'bold',
  },
  levelNext: {
    color: theme.colors.text.white,
    opacity: 0.6,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.brand.teal,
    borderRadius: 3,
  },
  gigiContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['4xl'],
    overflow: 'visible', // Allow hearts to float out of the container
  },
  messageBubble: {
    marginTop: theme.spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  gigiMessageText: {
    color: theme.colors.text.white,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: theme.colors.brand.cream,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing['4xl'],
    borderRadius: theme.borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing['3xl'],
    boxShadow: `0 4px 8px ${theme.colors.brand.coral}4D`,
    elevation: 8,
  },
  scanButtonText: {
    color: theme.colors.brand.black,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: theme.colors.text.white,
    marginBottom: 2,
  },
  statLabel: {
    color: theme.colors.text.white,
    opacity: 0.6,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

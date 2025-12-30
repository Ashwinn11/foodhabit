import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text, Gigi, Container, GutFeelingModal, type GutFeeling } from '../components';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { 
  getUserStreak, 
  getTodayScans, 
  getTodayAverageScore,
  getUserProfile,
  getCurrentGutFeeling,
  saveGutFeeling,
} from '../services/databaseService';
import { useFocusEffect } from '@react-navigation/native';

const LEVELS = [50, 100, 500, 1000];

export default function HomeScreen({ navigation }: any) {
  const [todayScans, setTodayScans] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentGutFeeling, setCurrentGutFeeling] = useState<GutFeeling | undefined>(undefined);
  const [showGutFeelingModal, setShowGutFeelingModal] = useState(false);

  // Fetch data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      // Fetch all data in parallel
      const [streakData, scans, avgScoreData, profile, gutFeeling] = await Promise.all([
        getUserStreak(),
        getTodayScans(),
        getTodayAverageScore(),
        getUserProfile(),
        getCurrentGutFeeling(),
      ]);

      setStreak(streakData?.current_streak || 0);
      setTodayScans(scans.length);
      setAvgScore(avgScoreData);
      setTotalScans(profile?.total_scans || 0);
      setLevel(profile?.gigi_level || 1);
      setCurrentGutFeeling(gutFeeling?.feeling);
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

  const handleGigiTap = () => {
    setShowGutFeelingModal(true);
  };

  const handleGutFeelingSelect = async (feeling: GutFeeling) => {
    setCurrentGutFeeling(feeling);
    await saveGutFeeling(feeling);
  };

  // Determine Gigi's emotion based on gut feeling or avg score
  const getGigiEmotion = () => {
    if (currentGutFeeling) {
      switch (currentGutFeeling) {
        case 'great': return 'happy-crown';
        case 'okay': return 'happy-clap';
        case 'bloated': return 'sad-frustrate';
        case 'pain': return 'sad-sick';
        case 'nauseous': return 'sad-cry';
      }
    }
    // Fallback to score-based emotion
    if (avgScore >= 90) return 'happy-crown';
    if (avgScore >= 80) return 'happy-balloon';
    if (avgScore >= 70) return 'happy-cute';
    if (avgScore >= 60) return 'happy-clap';
    if (avgScore >= 50) return 'shock-awe';
    if (avgScore >= 40) return 'sad-frustrate';
    if (avgScore >= 30) return 'sad-sick';
    if (avgScore > 0) return 'sad-cry';
    return 'happy-clap';
  };

  // Get message based on gut feeling or avg score
  const getGigiMessage = () => {
    if (currentGutFeeling) {
      switch (currentGutFeeling) {
        case 'great': return "Your gut is feeling amazing! Let's keep it that way!";
        case 'okay': return "Not bad! Let's make your next meal count!";
        case 'bloated': return "Feeling bloated? I'll help you choose gut-friendly foods!";
        case 'pain': return "Ouch! Let's be extra careful with what we eat today.";
        case 'nauseous': return "Not feeling well? Stick to gentle, easy-to-digest foods.";
      }
    }
    // Fallback to score-based messages
    if (avgScore >= 90) return "You're a health champion!";
    if (avgScore >= 80) return "Amazing choices today!";
    if (avgScore >= 70) return "Loving your healthy habits!";
    if (avgScore >= 60) return "Great work, keep it up!";
    if (avgScore >= 50) return "Hmm, could be healthier!";
    if (avgScore >= 40) return "Let's aim higher next time!";
    if (avgScore >= 30) return "These choices aren't helping...";
    if (avgScore > 0) return "We need to talk about this...";
    return "Tap me to tell me how your gut feels!";
  };

  // Calculate progress to next level
  const nextLevelTarget = LEVELS.find(l => l > totalScans) || LEVELS[LEVELS.length - 1];
  const progress = Math.min(totalScans / nextLevelTarget, 1);
  const scansNeeded = nextLevelTarget - totalScans;

  return (
    <Container style={styles.container}>
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
        
        {/* Gigi Character Container */}
        <View style={styles.gigiContainer}>
          {/* Tappable Gigi with Indicator */}
          <TouchableOpacity style={styles.gigiTappable} activeOpacity={0.9} onPress={handleGigiTap}>
            {/* Tap Indicator */}
            <View style={styles.tapIndicator}>
              <Ionicons name="hand-left" size={16} color={theme.colors.brand.coral} />
              <Text variant="caption1" weight="bold" style={styles.tapText}>
                How's your gut?
              </Text>
            </View>
            
            <Gigi 
              emotion={getGigiEmotion()} 
              size="lg"
              animated={true}
            />
          </TouchableOpacity>

          {/* Message Bubble (not tappable) */}
          <View style={styles.messageBubble}>
            <Text variant="body" weight="medium" style={styles.gigiMessageText}>
              {getGigiMessage()}
            </Text>
          </View>
        </View>

        {/* Scan Button */}
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={handleScanMeal}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={28} color={theme.colors.brand.white} />
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
                <Text variant="caption1" style={styles.statLabel}>Today's Avg</Text>
            </View>
        </View>
      </View>

      {/* Gut Feeling Modal */}
      <GutFeelingModal
        visible={showGutFeelingModal}
        onClose={() => setShowGutFeelingModal(false)}
        onSelect={handleGutFeelingSelect}
        currentFeeling={currentGutFeeling}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  gigiTappable: {
    alignItems: 'center',
  },
  tapIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.brand.cream,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.brand.coral,
  },
  tapText: {
    color: theme.colors.brand.coral,
    fontSize: 12,
  },
  messageBubble: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.brand.cream,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderBottomLeftRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  gigiMessageText: {
    color: theme.colors.brand.black,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: theme.colors.brand.coral,
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
    color: theme.colors.brand.white,
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

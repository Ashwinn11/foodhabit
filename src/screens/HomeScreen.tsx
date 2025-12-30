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
import { checkSubscriptionStatus } from '../services/revenueCatService';
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
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [gutFeelingModalDismissed, setGutFeelingModalDismissed] = useState(false);

  // Fetch data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  // Auto-prompt for gut feeling check-in if not logged today
  React.useEffect(() => {
    // Only auto-prompt if:
    // 1. Data has been fetched (isDataLoaded is true)
    // 2. No gut feeling logged today (currentGutFeeling is undefined)
    // 3. Modal is not already showing
    // 4. User hasn't dismissed the modal today
    if (isDataLoaded && currentGutFeeling === undefined && !showGutFeelingModal && !gutFeelingModalDismissed) {
      // Small delay to let the screen render first
      const timer = setTimeout(() => {
        setShowGutFeelingModal(true);
      }, 800); // 800ms delay for smooth UX

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isDataLoaded, currentGutFeeling, showGutFeelingModal, gutFeelingModalDismissed]);

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
      
      // Only use gut feeling if it's from TODAY
      if (gutFeeling) {
        const feelingDate = new Date(gutFeeling.logged_at);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if feeling was logged today
        if (feelingDate >= today) {
          setCurrentGutFeeling(gutFeeling.feeling);
        } else {
          // Reset for new day - user needs to check in again
          setCurrentGutFeeling(undefined);
        }
       } else {
         setCurrentGutFeeling(undefined);
         setGutFeelingModalDismissed(false); // Reset dismissal for new day
       }
      
      // Mark data as loaded
      setIsDataLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsDataLoaded(true); // Set to true even on error to prevent infinite loading
    }
  };

  const handleScanMeal = () => {
    navigation.navigate('Camera');
  };

  const handlePremium = async () => {
    const hasSubscription = await checkSubscriptionStatus();
    if (!hasSubscription) {
      navigation.navigate('Paywall');
    }
    // If already subscribed, do nothing - user is already premium
  };

  const handleGigiTap = () => {
    setShowGutFeelingModal(true);
  };

  const handleGutFeelingSelect = async (feeling: GutFeeling) => {
    setCurrentGutFeeling(feeling);
    await saveGutFeeling(feeling);
  };

  const handleGutFeelingModalClose = () => {
    setShowGutFeelingModal(false);
    // If closing without selecting a feeling, mark as dismissed
    if (currentGutFeeling === undefined) {
      setGutFeelingModalDismissed(true);
    }
  };

  // Determine Gigi's emotion based on gut feeling or avg score
  const getGigiEmotion = () => {
    if (currentGutFeeling) {
      switch (currentGutFeeling) {
        case 'great': return 'happy-cute'; // Love/hearts - feeling amazing
        case 'okay': return 'happy-clap'; // Clapping - doing okay
        case 'bloated': return 'sad-frustrate'; // Frustrated - bloated and uncomfortable
        case 'pain': return 'sad-cry'; // Crying - in pain
        case 'nauseous': return 'sad-sick'; // Sick face - feeling nauseous
      }
    }
    // Fallback to score-based emotion
    if (avgScore >= 90) return 'happy-crown'; // Champion - excellent score
    if (avgScore >= 80) return 'happy-balloon'; // Celebrating - great score
    if (avgScore >= 70) return 'happy-cute'; // Love - very good score
    if (avgScore >= 60) return 'happy-clap'; // Clapping - good score
    if (avgScore >= 50) return 'shock-awe'; // Shocked - could be better
    if (avgScore >= 40) return 'sad-frustrate'; // Frustrated - not good
    if (avgScore >= 30) return 'sad-sick'; // Sick - unhealthy
    if (avgScore > 0) return 'sad-cry'; // Crying - very bad
    return 'happy-clap'; // Default - neutral/ready
  };

  // Get tap indicator text based on Gigi's current emotion
  const getTapIndicatorText = () => {
    const emotion = getGigiEmotion();
    
    // Map emotions to descriptive text
    switch (emotion) {
      case 'happy-cute': return "Gigi's happy!";
      case 'happy-crown': return "Gigi's thriving!";
      case 'happy-balloon': return "Gigi's celebrating!";
      case 'happy-clap': return "How's your gut?";
      case 'sad-frustrate': return "Gigi's frustrated";
      case 'sad-cry': return "Gigi's crying";
      case 'sad-sick': return "Gigi's sick";
      case 'shock-awe': return "Gigi's shocked";
      default: return "How's your gut?";
    }
  };

  // Get message based on gut feeling or avg score
  const getGigiMessage = () => {
    const hour = new Date().getHours();
    const timeOfDay = 
      hour < 12 ? 'morning' : 
      hour < 17 ? 'afternoon' : 
      hour < 21 ? 'evening' : 'night';

    // If user has logged gut feeling today
    if (currentGutFeeling) {
      switch (currentGutFeeling) {
        case 'great':
          if (timeOfDay === 'morning') return "Yay! I'm feeling super happy this morning! Let's have an amazing day together!";
          if (timeOfDay === 'afternoon') return "I'm so happy! You're taking such good care of me!";
          if (timeOfDay === 'evening') return "Still feeling wonderful! Best day ever! You're the best!";
          return "I'm feeling so good! Thanks for being so nice to me!";
        
        case 'okay':
          if (timeOfDay === 'morning') return "Morning! I'm okay... but I know we can make today even better!";
          if (timeOfDay === 'afternoon') return "I'm hanging in there... Some yummy healthy food would make me so happy!";
          return "I'm okay! Let's finish the day strong together!";
        
        case 'bloated':
          if (timeOfDay === 'morning') return "Oof... I'm feeling bloated and puffy... Please be gentle with me today!";
          if (timeOfDay === 'afternoon') return "Still feeling bloated... Light foods would help me feel better!";
          return "I'm so bloated... Can we have something gentle tonight?";
        
        case 'pain':
          if (timeOfDay === 'morning') return "Owww! I'm hurting... Please feed me only soft, gentle foods today!";
          if (timeOfDay === 'afternoon') return "I'm in pain... I need soothing foods to feel better!";
          return "Still hurting... Please be extra gentle with me tonight!";
        
        case 'nauseous':
          if (timeOfDay === 'morning') return "I don't feel good... Only bland, simple foods please!";
          if (timeOfDay === 'afternoon') return "Feeling icky... Gentle foods only, pretty please!";
          return "Still feeling yucky... Keep it super simple for me!";
      }
    }

    // If user has scanned meals today (has avg score)
    if (avgScore > 0) {
      if (avgScore >= 90) {
        if (timeOfDay === 'morning') return "Good morning! Yesterday was pawsome! Let's do it again!";
        return "I'm so happy! You're feeding me the best food!";
      }
      if (avgScore >= 80) return "Yay! I love what you're giving me! You're amazing!";
      if (avgScore >= 70) return "I'm happy! You're doing great! Keep it up!";
      if (avgScore >= 60) return "Not bad! I'm doing okay!";
      if (avgScore >= 50) return "Hmm... I could use yummier, healthier food...";
      if (avgScore >= 40) return "I'm struggling a little... Can we do better?";
      if (avgScore >= 30) return "I'm not feeling great about this food...";
      return "I really need better food... Help me feel better!";
    }

    // Default: Fresh start, no gut feeling, no scans yet
    if (timeOfDay === 'morning') {
      return "Good morning! How am I feeling today? Tap me and let me know!";
    }
    if (timeOfDay === 'afternoon') {
      return "Hey there! How am I doing? Tap me to check in!";
    }
    if (timeOfDay === 'evening') {
      return "Good evening! How's your gut feeling? Tap me!";
    }
    return "Hiii! How am I feeling? Tap me to tell me!";
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
                {getTapIndicatorText()}
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
            Feed me!
          </Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsRow}>
            <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="restaurant-outline" size={20} color={theme.colors.brand.teal} />
                </View>
                <Text variant="title3" weight="bold" style={styles.statValue}>{todayScans}</Text>
                <Text variant="caption1" style={styles.statLabel}>Scans Today</Text>
            </View>
             <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="flame-outline" size={20} color="#FFB84D" />
                </View>
                <Text variant="title3" weight="bold" style={styles.statValue}>{streak}</Text>
                <Text variant="caption1" style={styles.statLabel}>Day Streak</Text>
            </View>
             <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="analytics-outline" size={20} color={theme.colors.brand.coral} />
                </View>
                <Text variant="title3" weight="bold" style={styles.statValue}>
                  {avgScore !== null && avgScore !== undefined ? avgScore : '-'}
                </Text>
                <Text variant="caption1" style={styles.statLabel}>Gut Score</Text>
            </View>
        </View>
      </View>

      {/* Gut Feeling Modal */}
      <GutFeelingModal
        visible={showGutFeelingModal}
        onClose={handleGutFeelingModalClose}
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.xs,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    color: theme.colors.text.white,
  },
  statLabel: {
    color: theme.colors.text.white,
    opacity: 0.6,
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

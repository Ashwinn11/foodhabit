import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Gigi, GigiEmotion } from '../components';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { 
  calculateGutHealthScore, 
  getMockFoodData, 
  IdentifiedFood 
} from '../services/scoringService';
import { 
  saveFoodScan, 
  uploadScanImage,
  getUserProfile 
} from '../services/databaseService';

const { width } = Dimensions.get('window');

interface GigiReaction {
  emotion: GigiEmotion;
  message: string;
}

function getGigiReaction(score: number, message: string): GigiReaction {
  if (score >= 80) {
    return {
      emotion: 'happy',
      message,
    };
  } else if (score >= 60) {
    return {
      emotion: 'neutral',
      message,
    };
  } else {
    return {
      emotion: 'sad',
      message,
    };
  }
}

export default function ResultScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { photoUri } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [foods, setFoods] = useState<IdentifiedFood[]>([]);
  const [breakdown, setBreakdown] = useState({ fiber: 0, plants: 0, triggers: 0, processed: 0 });
  const [gigiMessage, setGigiMessage] = useState('');

  useEffect(() => {
    calculateScore();
  }, []);

  const calculateScore = async () => {
    try {
      // Get user profile for triggers
      const profile = await getUserProfile();
      const userTriggers = profile?.known_triggers || [];

      // Upload image first
      const imageUpload = await uploadScanImage(photoUri);
      if (!imageUpload.success) {
        throw new Error('Failed to upload image');
      }

      let identifiedFoods: IdentifiedFood[];
      
      try {
        // Try AI food recognition
        const { recognizeFood } = await import('../services/foodRecognitionService');
        identifiedFoods = await recognizeFood(imageUpload.url!);
        
        // If no foods identified, use mock data
        if (identifiedFoods.length === 0) {
          console.log('No foods identified, using mock data');
          identifiedFoods = getMockFoodData();
        }
      } catch (error) {
        console.log('AI recognition failed, using mock data:', error);
        // Fallback to mock data if AI fails
        identifiedFoods = getMockFoodData();
      }
      
      // Calculate score
      const result = calculateGutHealthScore(identifiedFoods, userTriggers);
      
      setScore(result.score);
      setFoods(identifiedFoods);
      setBreakdown(result.breakdown);
      setGigiMessage(result.message);
      setLoading(false);

      // Save scan to database
      await saveToDatabase(imageUpload.url!, identifiedFoods, result);
    } catch (error) {
      console.error('Error calculating score:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to analyze meal. Please try again.');
    }
  };

  const saveToDatabase = async (imageUrl: string, identifiedFoods: IdentifiedFood[], result: any) => {
    try {
      // Save scan (image already uploaded)
      await saveFoodScan(
        imageUrl,
        identifiedFoods,
        result.score,
        result.breakdown,
        result.emotion,
        result.message
      );
    } catch (error) {
      console.error('Error saving scan:', error);
    }
  };

  const gigi = getGigiReaction(score, gigiMessage);

  const handleScanAnother = () => {
    navigation.navigate('Camera');
  };

  const handleGoHome = () => {
    navigation.navigate('Main', { screen: 'HomeTab' });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.brand.cream} />
        <Text variant="body" style={styles.loadingText}>
          Analyzing your meal...
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoHome}>
            <Ionicons name="close" size={32} color={theme.colors.brand.cream} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="share-outline" size={28} color={theme.colors.brand.cream} />
          </TouchableOpacity>
        </View>

        {/* Food Photo */}
        <View style={styles.photoContainer}>
          <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
        </View>

        {/* Gigi Reaction */}
        <View style={styles.gigiContainer}>
          <Gigi emotion={gigi.emotion} size="xl" />
          <Text variant="title1" style={styles.reactionText}>
            {gigi.message}
          </Text>
        </View>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <Text weight="bold" style={styles.scoreText}>
            {Math.round(score)}
            <Text style={styles.scoreLabel}>/100</Text>
          </Text>
          <Text variant="body" style={styles.scoreSubtext}>
            Gut Health Score
          </Text>
        </View>

        {/* Score Label */}
        <View style={styles.scoreLabelContainer}>
          <Text variant="title3" weight="semiBold" style={styles.scoreLabelText}>
            {score >= 80 ? 'Excellent! ✅' : score >= 60 ? 'Good Choice! ✅' : 'Moderate ⚠️'}
          </Text>
        </View>

        {/* Identified Foods */}
        <View style={styles.foodsContainer}>
          <Text variant="title3" weight="semiBold" style={styles.sectionTitle}>
            What's in this meal?
          </Text>
          {foods
            .filter(f => {
              const name = f.name.toLowerCase();
              const excluded = [
                'food', 'tableware', 'ingredient', 'recipe', 'cuisine', 'dish', 'meal', 
                'cooking', 'produce', 'vegetable', 'dishware', 'serveware', 'cutlery'
              ];
              
              // Filter exact matches
              if (excluded.includes(name)) return false;
              
              // Filter "Cuisine" types (e.g., "Indian cuisine")
              if (name.includes('cuisine')) return false;

              // Filter generic "Food" suffix (optional, depends on preference)
              // if (name.endsWith(' food')) return false;

              return true;
            })
            .slice(0, 5) // Limit to top 5 real foods
            .map((food, index) => (
            <View key={index} style={styles.foodItem}>
              <Text variant="body" style={styles.foodText}>
                • {food.name.charAt(0).toUpperCase() + food.name.slice(1)}
              </Text>
            </View>
          ))}
          <TouchableOpacity>
            <Text style={styles.editFoodsText}>Edit foods</Text>
          </TouchableOpacity>
        </View>

        {/* Score Breakdown */}
        <View style={styles.section}>
          <Text variant="title3" weight="semiBold" style={styles.sectionTitle}>
            Score Breakdown
          </Text>
          
          <View style={styles.breakdownItem}>
            <Text variant="body" style={styles.breakdownLabel}>
              Fiber
            </Text>
            <Text variant="body" weight="semiBold" style={[styles.breakdownValue, { color: theme.colors.brand.teal }]}>
              +{breakdown.fiber}
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <Text variant="body" style={styles.breakdownLabel}>
              Plant Diversity
            </Text>
            <Text variant="body" weight="semiBold" style={[styles.breakdownValue, { color: theme.colors.brand.teal }]}>
              +{breakdown.plants}
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <Text variant="body" style={styles.breakdownLabel}>
              Trigger Risk
            </Text>
            <Text variant="body" weight="semiBold" style={[styles.breakdownValue, { color: theme.colors.brand.coral }]}>
              {breakdown.triggers}
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <Text variant="body" style={styles.breakdownLabel}>
              Processed
            </Text>
            <Text variant="body" weight="semiBold" style={styles.breakdownValue}>
              {breakdown.processed}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.actions, { paddingBottom: insets.bottom + theme.spacing.xl }]}>
          <TouchableOpacity style={styles.scanAnotherButton} onPress={handleScanAnother}>
            <Ionicons name="camera" size={24} color={theme.colors.brand.black} />
            <Text variant="body" weight="bold" style={styles.scanAnotherText}>
              Scan Another Meal
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.brand.background,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.text.white,
    marginTop: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  photoContainer: {
    width: width,
    height: width * 0.75,
    marginBottom: theme.spacing.xl,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  gigiContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  gigiCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  gigiEmoji: {
    fontSize: 40,
  },
  gigiMessage: {
    color: theme.colors.text.white,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  reactionText: {
    color: theme.colors.text.white,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xs,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  scoreText: {
    color: theme.colors.text.white,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    fontSize: 64,
    lineHeight: 72,
    includeFontPadding: false,
  },
  scoreLabel: {
    fontSize: 24,
    color: theme.colors.text.white,
    opacity: 0.7,
    fontWeight: 'normal',
  },
  scoreSubtext: {
    color: theme.colors.text.white,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  scoreLabelContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  scoreLabelText: {
    color: theme.colors.brand.teal,
  },
  foodsContainer: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing['2xl'],
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing['2xl'],
  },
  sectionTitle: {
    color: theme.colors.text.white,
    marginBottom: theme.spacing.md,
  },
  foodItem: {
    paddingVertical: theme.spacing.sm,
  },
  foodText: {
    color: theme.colors.text.white,
  },
  editFoodsText: {
    color: theme.colors.brand.cream,
    marginTop: theme.spacing.sm,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  breakdownLabel: {
    color: theme.colors.text.white,
  },
  breakdownValue: {
    color: theme.colors.text.white,
  },
  actions: {
    paddingHorizontal: theme.spacing.xl,
  },
  scanAnotherButton: {
    backgroundColor: theme.colors.brand.cream,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  scanAnotherText: {
    color: theme.colors.brand.black,
  },
});

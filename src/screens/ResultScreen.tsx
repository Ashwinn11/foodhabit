import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Modal, Container } from '../components';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { 
  calculateGutHealthScore,
  IdentifiedFood 
} from '../services/scoringService';
import { 
  saveFoodScan, 
  uploadScanImage,
  getUserProfile
} from '../services/databaseService';

const { width } = Dimensions.get('window');

// Icon Badge Component
const IconBadge = ({ name, color, backgroundColor, size = 32 }: any) => (
  <View style={[styles.iconBadge, { backgroundColor }]}>
    <Ionicons name={name} size={size} color={color} />
  </View>
);

// Helper to get score-based configuration
const getScoreConfig = (score: number) => {
  if (score >= 80) {
    return {
      icon: 'checkmark-circle' as const,
      color: '#4ade80',
      label: "I'm thriving! 😍",
      bgColor: 'rgba(74, 222, 128, 0.1)'
    };
  } else if (score >= 60) {
    return {
      icon: 'checkmark-circle-outline' as const,
      color: '#a5e1a6',
      label: "I'm doing good! ✨",
      bgColor: 'rgba(165, 225, 166, 0.1)'
    };
  } else if (score >= 40) {
    return {
      icon: 'alert-circle-outline' as const,
      color: '#fbbf24',
      label: "I'm okay, but... 😶",
      bgColor: 'rgba(251, 191, 36, 0.1)'
    };
  } else {
    return {
      icon: 'close-circle' as const,
      color: '#ff7664',
      label: "Ouch! Please no... 😵",
      bgColor: 'rgba(255, 118, 100, 0.1)'
    };
  }
};

export default function ResultScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { photoUri } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [foods, setFoods] = useState<IdentifiedFood[]>([]);
  const [breakdown, setBreakdown] = useState<any>({ fiber: 0, plants: 0, triggers: 0, processed: 0 });
  const [gigiMessage, setGigiMessage] = useState('');
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  });

  // Modal State
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Animation values
  const scanLinePosition = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const scanAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const glowAnimation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    calculateScore();
  }, []);

  // Start scanning animation when loading
  useEffect(() => {
    if (loading) {
      // Scan line animation - moves up and down
      scanAnimation.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLinePosition, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLinePosition, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      scanAnimation.current.start();

      // Glow pulse animation
      glowAnimation.current = Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      glowAnimation.current.start();
    } else {
      // Stop animations when loading is finished
      scanAnimation.current?.stop();
      glowAnimation.current?.stop();
    }

    return () => {
      scanAnimation.current?.stop();
      glowAnimation.current?.stop();
    };
  }, [loading]);

  const calculateScore = async () => {
    try {
      // Get user profile for triggers
      const profile = await getUserProfile();
      const userTriggers = profile?.known_triggers || [];

      // Upload image temporarily for AI recognition
      const imageUpload = await uploadScanImage(photoUri);
      if (!imageUpload.success) {
        throw new Error('Failed to upload image');
      }

      let identifiedFoods: IdentifiedFood[];
      
       try {
         // Try AI food recognition with uploaded URL
         const { recognizeFood } = await import('../services/foodRecognitionService');
         identifiedFoods = await recognizeFood(imageUpload.url!);

         console.log('AI identified foods:', identifiedFoods.map(f => f.name));

         // Check if Gemini failed to identify food
         if (identifiedFoods.length === 0 ||
             (identifiedFoods.length === 1 && identifiedFoods[0].name === "Unable to analyze")) {
           console.log('No foods identified by AI');
           setLoading(false);
           setErrorMessage('No food detected in the image. Please retake a clear photo of your meal.');
           setErrorModalVisible(true);
           return;
         }

         // Filter out generic/non-food items before proceeding
         const filteredFoods = identifiedFoods.filter(f => {
           const name = f.name.toLowerCase();
           const excluded = [
             'food', 'tableware', 'ingredient', 'recipe', 'cuisine', 'dish', 'meal',
             'cooking', 'produce', 'vegetable', 'dishware', 'serveware', 'cutlery',
             'plate', 'bowl', 'glass', 'cup', 'fork', 'knife', 'spoon', 'utensil',
             'table', 'chair', 'background', 'wall', 'floor', 'ceiling', 'surface',
             'container', 'packaging', 'wrapper', 'bag', 'box', 'bottle', 'can',
             'napkin', 'towel', 'cloth', 'fabric', 'wood', 'metal', 'plastic',
             'empty', 'blank', 'nothing', 'no food', 'no item', 'no food detected',
             'unable to analyze', 'unable to detect', 'no foods found', 'no meal detected'
           ];

           // Exclude if in the list or contains generic terms
           if (excluded.includes(name) ||
               name.includes('cuisine') ||
               name.includes('dishware') ||
               name.includes('serveware') ||
               name.includes('utensil') ||
               name.includes('container') ||
               name.includes('packaging') ||
               name.includes('empty') ||
               name.includes('blank') ||
               name.includes('nothing')) return false;

           // Also exclude foods that seem like false positives:
           // - No gut health verdict or verdict is 'neutral' with no benefits/warnings
           const hasGutData = f.gut_health_verdict &&
                             f.gut_health_verdict !== 'neutral' &&
                             ((f.gut_benefits && f.gut_benefits.length > 0) ||
                              (f.gut_warnings && f.gut_warnings.length > 0));

           if (!hasGutData) return false;

           return true;
         });

         console.log('Filtered foods:', filteredFoods.map(f => f.name));

         // If no meaningful foods remain after filtering, treat as no food detected
         if (filteredFoods.length === 0) {
           console.log('No meaningful foods identified after filtering out generic terms');
           setLoading(false);
           setErrorMessage('No food detected in the image. Please retake a clear photo of your meal.');
           setErrorModalVisible(true);
           return;
         }

         // Use filtered foods for scoring
         identifiedFoods = filteredFoods;
      } catch (error) {
        console.log('AI recognition failed:', error);
        setLoading(false);
        setErrorMessage('Failed to analyze the image. Please try again.');
        setErrorModalVisible(true);
        return;
      }

      // Delete the uploaded image immediately after AI analysis
      if (imageUpload.url) {
        try {
          const { deleteImage } = await import('../services/databaseService');
          await deleteImage(imageUpload.url);
          console.log('Temporary image deleted from storage');
        } catch (deleteError) {
          console.error('Failed to delete temporary image:', deleteError);
          // Continue anyway - not critical
        }
      }
      
      // Calculate score
      const result = calculateGutHealthScore(identifiedFoods, userTriggers);
      
      // Calculate nutrition totals
      const nutritionTotals = identifiedFoods.reduce((acc, food: any) => ({
        calories: acc.calories + (food.estimated_calories || 0),
        protein: acc.protein + (food.protein_grams || 0),
        carbs: acc.carbs + (food.carbs_grams || 0),
        fat: acc.fat + (food.fat_grams || 0),
        fiber: acc.fiber + (food.fiber_grams || 0)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
      
      setScore(result.score);
      setFoods(result.foodImpacts.map((i: any) => ({ name: i.food }))); 
      setBreakdown(result); // Store the entire result, so breakdown.breakdown works
      setGigiMessage(result.message);
      setNutrition(nutritionTotals);
      setLoading(false);

      // Save scan to database WITHOUT image URL
      await saveToDatabase(null, identifiedFoods, result);
    } catch (error) {
      console.error('Error calculating score:', error);
      setLoading(false);
      setErrorMessage('Failed to analyze meal. Please try again.');
      setErrorModalVisible(true);
    }
  };

  const saveToDatabase = async (imageUrl: string | null, identifiedFoods: IdentifiedFood[], result: any) => {
    try {
      // Save scan metadata only (no image URL)
      await saveFoodScan(
        imageUrl, // Will be null
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

  const handleScanAnother = () => {
    // Close the Result modal first (go back to Main), then navigate to Camera
    navigation.goBack();
    // Use setTimeout to ensure the modal closes before navigating
    setTimeout(() => {
      navigation.navigate('Camera');
    }, 100);
  };

  const handleGoHome = () => {
    navigation.goBack();
  };

  // Animated scan line position
  const scanLineTranslateY = scanLinePosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.75 - 4], // Height of photo container minus scan line height
  });

  if (loading) {
    return (
      <Container safeArea={true} edges={['top']}>
        <View style={styles.scanningContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoHome} style={styles.headerButton}>
              <Ionicons name="close" size={28} color={theme.colors.brand.cream} />
            </TouchableOpacity>
            <View style={styles.headerButton} />
          </View>

          {/* Food Photo with Scanning Effect */}
          <View style={styles.scanningPhotoContainer}>
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="contain" />
            
            {/* Dark overlay */}
            <View style={styles.scanningOverlay} />
            
            {/* Animated scanning line */}
            <Animated.View 
              style={[
                styles.scanLine,
                {
                  transform: [{ translateY: scanLineTranslateY }],
                  opacity: glowOpacity,
                }
              ]}
            >
              <LinearGradient
                colors={['transparent', theme.colors.brand.teal, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.scanLineGradient}
              />
            </Animated.View>

            {/* Glow effect */}
            <Animated.View 
              style={[
                styles.scanGlow,
                { opacity: glowOpacity }
              ]}
            >
              <LinearGradient
                colors={[
                  'transparent',
                  'rgba(165, 225, 166, 0.2)',
                  'rgba(165, 225, 166, 0.4)',
                  'rgba(165, 225, 166, 0.2)',
                  'transparent'
                ]}
                style={styles.scanGlowGradient}
              />
            </Animated.View>
          </View>

          {/* Loading Status */}
          <View style={styles.scanningStatus}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scanningStatusCard}
            >
              <View style={styles.scanningIconContainer}>
                <Animated.View style={{ opacity: glowOpacity }}>
                  <Ionicons name="scan" size={32} color={theme.colors.brand.teal} />
                </Animated.View>
              </View>
              
              <Text variant="title2" weight="bold" style={styles.scanningTitle}>
                Seeing what's for me...
              </Text>
              
              <Text variant="body" style={styles.scanningSubtitle}>
                Checking ingredients to see how they'll help me feel!
              </Text>

              <View style={styles.scanningDotsContainer}>
                <ActivityIndicator size="small" color={theme.colors.brand.teal} />
              </View>
            </LinearGradient>
          </View>
        </View>
      </Container>
    );
  }

  return (
    <Container safeArea={true} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoHome} style={styles.headerButton}>
            <Ionicons name="close" size={28} color={theme.colors.brand.cream} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={theme.colors.brand.cream} />
          </TouchableOpacity>
        </View>

        {/* Food Photo with Overlay */}
        <View style={styles.photoContainer}>
          <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="contain" />
          <LinearGradient
            colors={['transparent', 'rgba(18, 18, 18, 0.8)']}
            style={styles.photoGradient}
          />
        </View>

        {/* Score Section with Unified Card */}
        <View style={styles.scoreSection}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreCard}
          >
            <View style={styles.unifiedScoreHeader}>
              <View style={styles.scoreCircle}>
                <Text weight="bold" style={styles.scoreText}>
                  {Math.round(score)}
                </Text>
                <Text variant="caption1" style={styles.scoreMaxText}>
                  /100
                </Text>
              </View>

              <View style={styles.statusInfo}>
                <Text variant="title2" weight="bold" style={{ color: getScoreConfig(score).color }}>
                  {getScoreConfig(score).label}
                </Text>
              </View>
            </View>

            {/* Gigi Message inside the card */}
            <View style={[styles.unifiedMessageCard, { backgroundColor: getScoreConfig(score).bgColor }]}>
              <Ionicons 
                name="chatbubble-ellipses" 
                size={18} 
                color={getScoreConfig(score).color} 
                style={styles.messageIcon} 
              />
              <Text variant="body" style={styles.messageText}>
                {gigiMessage}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Identified Foods with Gut Health Impact */}
        <View style={styles.foodsContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant" size={20} color={theme.colors.brand.teal} />
            <Text variant="title3" weight="semiBold" style={styles.sectionTitle}>
              What are you feeding me?
            </Text>
          </View>
          
          {foods
            .filter(f => {
              const name = f.name.toLowerCase();
              const excluded = [
                'food', 'tableware', 'ingredient', 'recipe', 'cuisine', 'dish', 'meal', 
                'cooking', 'produce', 'vegetable', 'dishware', 'serveware', 'cutlery'
              ];
              if (excluded.includes(name) || name.includes('cuisine')) return false;
              return true;
            })
            .map((food, index) => {
              const impact = breakdown.foodImpacts?.find((fi: any) => 
                fi.food.toLowerCase() === food.name.toLowerCase()
              );
              
              let impactConfig = {
                icon: 'ellipse' as any,
                color: '#9ca3af',
                backgroundColor: 'rgba(156, 163, 175, 0.15)'
              };
              
              if (impact) {
                if (impact.impact === 'positive') {
                  impactConfig = {
                    icon: 'checkmark-circle',
                    color: '#4ade80',
                    backgroundColor: 'rgba(74, 222, 128, 0.15)'
                  };
                } else if (impact.impact === 'warning') {
                  impactConfig = {
                    icon: 'alert-circle',
                    color: '#fbbf24',
                    backgroundColor: 'rgba(251, 191, 36, 0.15)'
                  };
                }
              }
              
              return (
                <LinearGradient
                  key={index}
                  colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.02)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.foodCard}
                >
                  <View style={styles.foodHeader}>
                    <IconBadge 
                      name={impactConfig.icon} 
                      color={impactConfig.color} 
                      backgroundColor={impactConfig.backgroundColor}
                      size={20}
                    />
                    <Text variant="body" weight="bold" style={styles.foodName}>
                      {food.name.charAt(0).toUpperCase() + food.name.slice(1)}
                    </Text>
                  </View>
                  
                  {/* Pills Container */}
                  <View style={styles.pillsContainer}>
                    {/* Benefits Pills */}
                    {impact?.benefits?.map((benefit: string, idx: number) => (
                      <View key={`b-${idx}`} style={[styles.pill, styles.benefitPill]}>
                        <Ionicons name="add-circle" size={12} color={theme.colors.brand.teal} />
                        <Text variant="caption2" style={styles.benefitText}>
                          {benefit}
                        </Text>
                      </View>
                    ))}
                    
                    {/* Warnings Pills */}
                    {impact?.warnings?.map((warning: string, idx: number) => (
                      <View key={`w-${idx}`} style={[styles.pill, styles.warningPill]}>
                        <Ionicons name="warning" size={12} color={theme.colors.brand.coral} />
                        <Text variant="caption2" style={styles.warningText}>
                          {warning}
                        </Text>
                      </View>
                    ))}
                    
                    {/* Personalized Warning Pill */}
                    {impact?.personalizedWarning && (
                      <View style={[styles.pill, styles.personalizedPill]}>
                        <Ionicons name="alert" size={12} color="#ff5757" />
                        <Text variant="caption2" style={styles.personalizedText}>
                          {impact.personalizedWarning.replace('⚠️ ', '')}
                        </Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              );
            })}
        </View>

        {/* Nutrition Facts Card */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="nutrition" size={20} color={theme.colors.brand.teal} />
            <Text variant="title3" weight="semiBold" style={styles.sectionTitle}>
              What's in it for me?
            </Text>
          </View>
          
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.02)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.breakdownCard}
          >
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelContainer}>
                <IconBadge 
                  name="flame" 
                  color="#ff6b6b" 
                  backgroundColor="rgba(255, 107, 107, 0.15)"
                  size={16}
                />
                <Text variant="body" style={styles.breakdownLabel}>Calories</Text>
              </View>
              <Text variant="body" weight="bold" style={styles.breakdownValue}>
                {Math.round(nutrition.calories)} kcal
              </Text>
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelContainer}>
                <IconBadge 
                  name="fitness" 
                  color="#60a5fa" 
                  backgroundColor="rgba(96, 165, 250, 0.15)"
                  size={16}
                />
                <Text variant="body" style={styles.breakdownLabel}>Protein</Text>
              </View>
              <Text variant="body" weight="bold" style={styles.breakdownValue}>
                {Math.round(nutrition.protein)}g
              </Text>
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelContainer}>
                <IconBadge 
                  name="leaf" 
                  color="#fbbf24" 
                  backgroundColor="rgba(251, 191, 36, 0.15)"
                  size={16}
                />
                <Text variant="body" style={styles.breakdownLabel}>Carbs</Text>
              </View>
              <Text variant="body" weight="bold" style={styles.breakdownValue}>
                {Math.round(nutrition.carbs)}g
              </Text>
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabelContainer}>
                <IconBadge 
                  name="water" 
                  color="#a78bfa" 
                  backgroundColor="rgba(167, 139, 250, 0.15)"
                  size={16}
                />
                <Text variant="body" style={styles.breakdownLabel}>Fat</Text>
              </View>
              <Text variant="body" weight="bold" style={styles.breakdownValue}>
                {Math.round(nutrition.fat)}g
              </Text>
            </View>

            <View style={[styles.breakdownItem, { borderBottomWidth: 0 }]}>
              <View style={styles.breakdownLabelContainer}>
                <IconBadge 
                  name="flower" 
                  color="#4ade80" 
                  backgroundColor="rgba(74, 222, 128, 0.15)"
                  size={16}
                />
                <Text variant="body" style={styles.breakdownLabel}>Fiber</Text>
              </View>
              <Text variant="body" weight="bold" style={styles.breakdownValue}>
                {Math.round(nutrition.fiber)}g
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Actions */}
        <View style={[styles.actions, { paddingBottom: insets.bottom + theme.spacing.xl }]}>
          <TouchableOpacity style={styles.scanAnotherButton} onPress={handleScanAnother}>
            <Ionicons name="camera" size={24} color={theme.colors.brand.white} />
            <Text variant="body" weight="bold" style={styles.scanAnotherText}>
              Feed me again!
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

       {/* Error Modal */}
       <Modal
           visible={errorModalVisible}
           title="Error"
           message={errorMessage}
           primaryButtonText="Try Again"
           onPrimaryPress={() => {
             navigation.goBack();
             // Keep modal visible briefly during navigation to prevent flash
             setTimeout(() => setErrorModalVisible(false), 200);
           }}
           onClose={() => {
             navigation.goBack();
             // Keep modal visible briefly during navigation to prevent flash
             setTimeout(() => setErrorModalVisible(false), 200);
           }}
           variant="error"
       />

    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.brand.background,
  },
  // Scanning Animation Styles
  scanningContainer: {
    flex: 1,
  },
  scanningPhotoContainer: {
    width: width,
    height: width * 0.75,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: theme.borderRadius['2xl'],
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    zIndex: 2,
  },
  scanLineGradient: {
    flex: 1,
    height: 4,
  },
  scanGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  scanGlowGradient: {
    flex: 1,
  },
  scanningStatus: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing['2xl'],
    justifyContent: 'flex-start',
  },
  scanningStatusCard: {
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scanningIconContainer: {
    marginBottom: theme.spacing.lg,
  },
  scanningTitle: {
    color: theme.colors.text.white,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  scanningSubtitle: {
    color: theme.colors.text.white,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  scanningDotsContainer: {
    marginTop: theme.spacing.md,
  },
  // Original Styles
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
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  headerButton: {
    padding: theme.spacing.xs,
  },
  photoContainer: {
    width: width,
    height: width * 0.75,
    marginBottom: -theme.spacing['2xl'],
    position: 'relative',
    overflow: 'hidden',
    borderRadius: theme.borderRadius['2xl'],
    marginHorizontal: theme.spacing.lg,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius['2xl'],
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  // Score Section
  scoreSection: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing['2xl'],
    marginTop: -theme.spacing['3xl'], // Overlap with image
  },
  scoreCard: {
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: theme.spacing.lg,
    backgroundColor: 'rgba(26, 35, 50, 0.95)', // More opaque background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  scoreCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  unifiedScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  statusInfo: {
    flex: 1,
  },
  scoreText: {
    color: theme.colors.text.white,
    fontSize: 64,
    lineHeight: 70,
    fontWeight: 'bold',
  },
  scoreMaxText: {
    color: theme.colors.text.white,
    opacity: 0.5,
    marginTop: -theme.spacing.xs,
  },
  scoreSubtext: {
    color: theme.colors.text.white,
    opacity: 0.6,
  },
  unifiedMessageCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },

  // Icon Badge
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Message Card

  messageIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  messageText: {
    color: theme.colors.text.white,
    flex: 1,
    lineHeight: 20,
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
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
  },
  // Food Card Styles
  foodCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  foodName: {
    color: theme.colors.text.white,
    fontSize: 17,
    flex: 1,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    gap: 4,
  },
  benefitPill: {
    backgroundColor: 'rgba(165, 225, 166, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(165, 225, 166, 0.3)',
  },
  benefitText: {
    color: theme.colors.brand.teal,
    fontWeight: '600',
  },
  warningPill: {
    backgroundColor: 'rgba(255, 118, 100, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 118, 100, 0.3)',
  },
  warningText: {
    color: theme.colors.brand.coral,
    fontWeight: '600',
  },
  personalizedPill: {
    backgroundColor: 'rgba(255, 87, 87, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 87, 87, 0.4)',
  },
  personalizedText: {
    color: '#ff5757',
    fontWeight: 'bold',
  },
  // Breakdown Card
  breakdownCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  breakdownLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  breakdownLabel: {
    color: theme.colors.text.white,
    fontSize: 15,
  },
  breakdownValue: {
    color: theme.colors.text.white,
    fontSize: 15,
  },
  actions: {
    paddingHorizontal: theme.spacing.xl,
  },
  scanAnotherButton: {
    backgroundColor: theme.colors.brand.coral,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    shadowColor: theme.colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  scanAnotherText: {
    color: theme.colors.brand.white,
    fontSize: 16,
  },
});

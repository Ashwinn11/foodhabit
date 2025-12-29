import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Modal, Container } from '../components';
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

export default function ResultScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { photoUri } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [foods, setFoods] = useState<IdentifiedFood[]>([]);
  const [breakdown, setBreakdown] = useState<any>({ fiber: 0, plants: 0, triggers: 0, processed: 0 });
  const [gigiMessage, setGigiMessage] = useState('');

  // Modal State
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    calculateScore();
  }, []);

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
        
        // Check if Gemini failed to identify food
        if (identifiedFoods.length === 0 || 
            (identifiedFoods.length === 1 && identifiedFoods[0].name === "Unable to analyze")) {
          console.log('No foods identified by AI');
          setLoading(false);
          setErrorMessage('No food detected in the image. Please retake a clear photo of your meal.');
          setErrorModalVisible(true);
          return;
        }
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
      
      setScore(result.score);
      setFoods(result.foodImpacts.map((i: any) => ({ name: i.food }))); 
      setBreakdown(result); // Store the entire result, so breakdown.breakdown works
      setGigiMessage(result.message);
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

  if (loading) {
    return (
      <Container center>
        <ActivityIndicator size="large" color={theme.colors.brand.cream} />
        <Text variant="body" style={styles.loadingText}>
          Analyzing your meal...
        </Text>
      </Container>
    );
  };

  return (
    <Container safeArea={true} edges={['top']}>
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
          <Text variant="title1" style={styles.reactionText}>
            {gigiMessage}
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

        {/* Identified Foods with Gut Health Impact */}
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
              if (excluded.includes(name) || name.includes('cuisine')) return false;
              return true;
            })
            // No slice limit - show all recognized foods
            .map((food, index) => {
              const impact = breakdown.foodImpacts?.find((fi: any) => 
                fi.food.toLowerCase() === food.name.toLowerCase()
              );
              
              let impactIcon = '•';
              
              if (impact) {
                if (impact.impact === 'positive') {
                  impactIcon = '✅';
                } else if (impact.impact === 'warning') {
                  impactIcon = '⚠️';
                }
              }
              
              return (
                <View key={index} style={styles.foodCard}>
                  <View style={styles.foodHeader}>
                    <Text style={{fontSize: 16, marginRight: 8}}>{impactIcon}</Text>
                    <Text variant="body" weight="bold" style={styles.foodName}>
                      {food.name.charAt(0).toUpperCase() + food.name.slice(1)}
                    </Text>
                  </View>
                  
                  {/* Pills Container */}
                  <View style={styles.pillsContainer}>
                    {/* Benefits Pills */}
                    {impact?.benefits?.map((benefit: string, idx: number) => (
                      <View key={`b-${idx}`} style={[styles.pill, styles.benefitPill]}>
                        <Text variant="caption2" style={styles.benefitText}>
                          {benefit}
                        </Text>
                      </View>
                    ))}
                    
                    {/* Warnings Pills */}
                    {impact?.warnings?.map((warning: string, idx: number) => (
                      <View key={`w-${idx}`} style={[styles.pill, styles.warningPill]}>
                         <Text variant="caption2" style={styles.warningText}>
                          {warning}
                        </Text>
                      </View>
                    ))}
                    
                    {/* Personalized Warning Pill */}
                     {impact?.personalizedWarning && (
                      <View style={[styles.pill, styles.personalizedPill]}>
                        <Text variant="caption2" style={styles.personalizedText}>
                          {impact.personalizedWarning.replace('⚠️ ', '')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
        </View>

        {/* Score Breakdown Card */}
        <View style={styles.section}>
          <Text variant="title3" weight="semiBold" style={styles.sectionTitle}>
            Score Breakdown
          </Text>
          
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownItem}>
              <Text variant="body" style={styles.breakdownLabel}>Whole Foods</Text>
              <Text variant="body" weight="bold" style={[styles.breakdownValue, { color: theme.colors.brand.teal }]}>
                +{breakdown.breakdown?.wholeFoods || 0}
              </Text>
            </View>

            <View style={styles.breakdownItem}>
              <Text variant="body" style={styles.breakdownLabel}>Fiber</Text>
              <Text variant="body" weight="bold" style={[styles.breakdownValue, { color: theme.colors.brand.teal }]}>
                +{breakdown.breakdown?.fiber || 0}
              </Text>
            </View>

            <View style={styles.breakdownItem}>
              <Text variant="body" style={styles.breakdownLabel}>Plant Diversity</Text>
              <Text variant="body" weight="bold" style={[styles.breakdownValue, { color: theme.colors.brand.teal }]}>
                +{breakdown.breakdown?.plants || 0}
              </Text>
            </View>

            {(breakdown.breakdown?.prebiotics || 0) > 0 && (
              <View style={styles.breakdownItem}>
                <Text variant="body" style={styles.breakdownLabel}>Prebiotics</Text>
                <Text variant="body" weight="bold" style={[styles.breakdownValue, { color: theme.colors.brand.teal }]}>
                  +{breakdown.breakdown.prebiotics}
                </Text>
              </View>
            )}

            {(breakdown.breakdown?.antiInflammatory || 0) > 0 && (
               <View style={styles.breakdownItem}>
                <Text variant="body" style={styles.breakdownLabel}>Anti-Inflammatory</Text>
                <Text variant="body" weight="bold" style={[styles.breakdownValue, { color: theme.colors.brand.teal }]}>
                  +{breakdown.breakdown.antiInflammatory}
                </Text>
              </View>
            )}

            {(breakdown.breakdown?.goodVerdict || 0) > 0 && (
               <View style={styles.breakdownItem}>
                <Text variant="body" style={styles.breakdownLabel}>Beneficial Foods</Text>
                <Text variant="body" weight="bold" style={[styles.breakdownValue, { color: theme.colors.brand.teal }]}>
                  +{breakdown.breakdown.goodVerdict}
                </Text>
              </View>
            )}

            {(breakdown.breakdown?.probiotics || 0) > 0 && (
               <View style={styles.breakdownItem}>
                <Text variant="body" style={styles.breakdownLabel}>Probiotics</Text>
                <Text variant="body" weight="bold" style={[styles.breakdownValue, { color: theme.colors.brand.teal }]}>
                  +{breakdown.breakdown.probiotics}
                </Text>
              </View>
            )}

            <View style={styles.breakdownItem}>
              <Text variant="body" style={styles.breakdownLabel}>Trigger Risk</Text>
              <Text variant="body" weight="bold" style={[styles.breakdownValue, { color: (breakdown.breakdown?.triggers || 0) < 0 ? theme.colors.brand.coral : theme.colors.text.white }]}>
                {breakdown.breakdown?.triggers || 0}
              </Text>
            </View>

            <View style={styles.breakdownItem}>
              <Text variant="body" style={styles.breakdownLabel}>Processed</Text>
              <Text variant="body" weight="bold" style={[styles.breakdownValue, { color: (breakdown.breakdown?.processed || 0) < 0 ? theme.colors.brand.coral : theme.colors.text.white }]}>
                {breakdown.breakdown?.processed || 0}
              </Text>
            </View>

             <View style={[styles.breakdownItem, { borderBottomWidth: 0 }]}>
              <Text variant="body" style={styles.breakdownLabel}>Gut Warnings</Text>
              <Text variant="body" weight="bold" style={[styles.breakdownValue, { color: (breakdown.breakdown?.warnings || 0) < 0 ? theme.colors.brand.coral : theme.colors.text.white }]}>
                {breakdown.breakdown?.warnings || 0}
              </Text>
            </View>
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

      {/* Error Modal */}
      <Modal
          visible={errorModalVisible}
          title="Error"
          message={errorMessage}
          primaryButtonText="OK"
          onPrimaryPress={() => setErrorModalVisible(false)}
          onClose={() => setErrorModalVisible(false)}
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
    paddingBottom: theme.spacing.xs,
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
  // Improved Food Card Styles
  foodCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  foodName: {
    color: theme.colors.text.white,
    fontSize: 17,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  pill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  benefitPill: {
    backgroundColor: 'rgba(165, 225, 166, 0.15)', // Teal with low opacity
    borderWidth: 1,
    borderColor: 'rgba(165, 225, 166, 0.3)',
  },
  benefitText: {
    color: theme.colors.brand.teal,
    fontWeight: '600',
  },
  warningPill: {
    backgroundColor: 'rgba(255, 118, 100, 0.15)', // Coral with low opacity
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: theme.colors.brand.cream,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    shadowColor: theme.colors.brand.cream,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  scanAnotherText: {
    color: theme.colors.brand.black,
    fontSize: 16,
  },
  // Edit Foods Modal styles
  editFoodsContainer: {
    marginTop: theme.spacing.md,
  },
  noFoodsText: {
    color: theme.colors.text.white,
    textAlign: 'center',
    opacity: 0.7,
    marginVertical: theme.spacing.lg,
  },
  editFoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  editFoodName: {
    color: theme.colors.text.white,
    flex: 1,
  },
  removeFoodButton: {
    padding: theme.spacing.xs,
  },
  editModalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButtonText: {
    color: theme.colors.text.white,
  },
  saveButton: {
    backgroundColor: theme.colors.brand.teal,
  },
  saveButtonText: {
    color: theme.colors.brand.black,
  },
});

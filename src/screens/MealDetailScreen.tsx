import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text, Container } from '../components';
import { theme } from '../theme';
import { FoodScan } from '../services/databaseService';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// Icon Badge Component
const IconBadge = ({ name, color, backgroundColor, size = 16 }: any) => (
  <View style={[styles.iconBadge, { backgroundColor }]}>
    <Ionicons name={name} size={size} color={color} />
  </View>
);

export default function MealDetailScreen({ route, navigation }: any) {
  const { scan }: { scan: FoodScan } = route.params;

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
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get meal name from identified foods
  const mealName = scan.identified_foods
    .map(f => f.name)
    .join(', ');

  // Calculate nutrition totals from identified foods
  const nutrition = scan.identified_foods.reduce((acc, food: any) => ({
    calories: acc.calories + (food.estimated_calories || 0),
    protein: acc.protein + (food.protein_grams || 0),
    carbs: acc.carbs + (food.carbs_grams || 0),
    fat: acc.fat + (food.fat_grams || 0),
    fiber: acc.fiber + (food.fiber_grams || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  return (
    <Container safeArea={true} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={theme.colors.brand.cream} />
          </TouchableOpacity>
        </View>

        {/* Score Section */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.scoreSection}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreCard}
          >
            <View style={styles.scoreHeader}>
              <View style={styles.scoreCircle}>
                <Text variant="largeTitle" weight="bold" style={styles.scoreText}>
                  {Math.round(scan.gut_health_score)}
                </Text>
                <Text variant="caption1" style={styles.scoreMaxText}>
                  /100
                </Text>
              </View>

              <View style={styles.statusInfo}>
                <Text variant="title2" weight="bold" style={{ color: getScoreColor(scan.gut_health_score) }}>
                  {getScoreLabel(scan.gut_health_score)}
                </Text>
              </View>
            </View>

            {/* Gigi's Message */}
            <View style={[styles.messageCard, { backgroundColor: `${getScoreColor(scan.gut_health_score)}15` }]}>
              <Ionicons 
                name="chatbubble-ellipses" 
                size={18} 
                color={getScoreColor(scan.gut_health_score)} 
                style={styles.messageIcon} 
              />
              <Text variant="body" style={styles.messageText}>
                {scan.gigi_message}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Meal Info */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant" size={20} color={theme.colors.brand.teal} />
            <Text variant="title3" weight="semiBold" style={styles.sectionTitle}>
              What did I eat?
            </Text>
          </View>
          
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.02)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.infoCard}
          >
            <Text variant="headline" weight="bold" style={styles.mealName}>
              {mealName}
            </Text>
            <Text variant="caption1" color="secondary" style={styles.timestamp}>
              <Ionicons name="time-outline" size={14} color="rgba(255, 255, 255, 0.5)" />
              {' '}{formatDate(scan.scanned_at)}
            </Text>
          </LinearGradient>
        </Animated.View>


        {/* Nutrition Facts */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="nutrition" size={20} color={theme.colors.brand.teal} />
            <Text variant="title3" weight="semiBold" style={styles.sectionTitle}>
              Nutrition Breakdown
            </Text>
          </View>
          
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.02)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nutritionCard}
          >
            <View style={styles.nutritionItem}>
              <View style={styles.nutritionLabelContainer}>
                <IconBadge 
                  name="flame" 
                  color="#ff6b6b" 
                  backgroundColor="rgba(255, 107, 107, 0.15)"
                  size={16}
                />
                <Text variant="body" style={styles.nutritionLabel}>Calories</Text>
              </View>
              <Text variant="body" weight="bold" style={styles.nutritionValue}>
                {Math.round(nutrition.calories)} kcal
              </Text>
            </View>

            <View style={styles.nutritionItem}>
              <View style={styles.nutritionLabelContainer}>
                <IconBadge 
                  name="fitness" 
                  color="#60a5fa" 
                  backgroundColor="rgba(96, 165, 250, 0.15)"
                  size={16}
                />
                <Text variant="body" style={styles.nutritionLabel}>Protein</Text>
              </View>
              <Text variant="body" weight="bold" style={styles.nutritionValue}>
                {Math.round(nutrition.protein)}g
              </Text>
            </View>

            <View style={styles.nutritionItem}>
              <View style={styles.nutritionLabelContainer}>
                <IconBadge 
                  name="leaf" 
                  color="#fbbf24" 
                  backgroundColor="rgba(251, 191, 36, 0.15)"
                  size={16}
                />
                <Text variant="body" style={styles.nutritionLabel}>Carbs</Text>
              </View>
              <Text variant="body" weight="bold" style={styles.nutritionValue}>
                {Math.round(nutrition.carbs)}g
              </Text>
            </View>

            <View style={styles.nutritionItem}>
              <View style={styles.nutritionLabelContainer}>
                <IconBadge 
                  name="water" 
                  color="#a78bfa" 
                  backgroundColor="rgba(167, 139, 250, 0.15)"
                  size={16}
                />
                <Text variant="body" style={styles.nutritionLabel}>Fat</Text>
              </View>
              <Text variant="body" weight="bold" style={styles.nutritionValue}>
                {Math.round(nutrition.fat)}g
              </Text>
            </View>

            <View style={[styles.nutritionItem, { borderBottomWidth: 0 }]}>
              <View style={styles.nutritionLabelContainer}>
                <IconBadge 
                  name="flower" 
                  color="#4ade80" 
                  backgroundColor="rgba(74, 222, 128, 0.15)"
                  size={16}
                />
                <Text variant="body" style={styles.nutritionLabel}>Fiber</Text>
              </View>
              <Text variant="body" weight="bold" style={styles.nutritionValue}>
                {Math.round(nutrition.fiber)}g
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  scoreSection: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  scoreCard: {
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(26, 35, 50, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  scoreCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    color: theme.colors.text.white,
    lineHeight: 70,
  },
  scoreMaxText: {
    color: theme.colors.text.white,
    opacity: 0.5,
    marginTop: -theme.spacing.xs,
  },
  statusInfo: {
    flex: 1,
  },
  messageCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  messageIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  messageText: {
    flex: 1,
    color: theme.colors.text.white,
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  sectionTitle: {
    color: theme.colors.text.white,
  },
  infoCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mealName: {
    color: theme.colors.text.white,
    marginBottom: theme.spacing.xs,
  },
  timestamp: {
    marginTop: theme.spacing.xs,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: theme.spacing.sm,
  },
  foodName: {
    color: theme.colors.text.white,
    flex: 1,
  },
  nutritionCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  nutritionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  nutritionLabel: {
    color: theme.colors.text.white,
    opacity: 0.8,
  },
  nutritionValue: {
    color: theme.colors.text.white,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

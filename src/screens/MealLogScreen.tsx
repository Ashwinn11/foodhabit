import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { theme, r, haptics } from '../theme';
import { Container, Text, Card, Button } from '../components';
import { AddMealModal } from '../components/modals/AddMealModal';
import { mealService, MealLog } from '../services/meal/mealService';
import { UserProfile } from '../types/profile';
import { supabase } from '../config/supabase';

export default function MealLogScreen() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Load meals when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadMeals();
      loadUserProfile();
    }, [user?.id])
  );

  const loadUserProfile = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadMeals = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const todayMeals = await mealService.getTodayMeals(user.id);
      setMeals(todayMeals);
    } catch (error) {
      console.error('Error loading meals:', error);
      Alert.alert('Error', 'Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMeals();
    setRefreshing(false);
  };

  const handleAddMeal = async (meal: {
    name: string;
    size: 'small' | 'normal' | 'large';
    time: string;
    symptom: 'fine' | 'mild_discomfort' | 'bloating';
  }) => {
    if (!user?.id || !userProfile?.age) {
      Alert.alert('Error', 'User profile not found');
      return;
    }

    try {
      // Create timestamp for meal
      const [hours, minutes] = meal.time.split(':').map(Number);
      const mealDate = new Date();
      mealDate.setHours(hours, minutes, 0, 0);

      await mealService.logMeal(
        user.id,
        meal.name,
        meal.size,
        mealDate.toISOString(),
        meal.symptom,
        userProfile.age || 30
      );

      haptics.patterns.success();
      await loadMeals();
    } catch (error) {
      console.error('Error adding meal:', error);
      throw error;
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!user?.id || !userProfile?.age) return;

    Alert.alert('Delete Meal', 'Are you sure you want to delete this meal?', [
      {
        text: 'Cancel',
        onPress: () => haptics.patterns.buttonPress(),
      },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            haptics.patterns.buttonPress();
            await mealService.deleteMeal(mealId, user.id, userProfile.age || 30);
            await loadMeals();
            haptics.patterns.success();
          } catch (error) {
            console.error('Error deleting meal:', error);
            Alert.alert('Error', 'Failed to delete meal');
            haptics.patterns.error();
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const MealCard = ({ meal }: { meal: MealLog }) => {
    const mealTime = new Date(meal.meal_time);
    const timeString = mealTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const getSymptomColor = () => {
      switch (meal.symptom) {
        case 'fine':
          return theme.colors.brand.secondary; // Mint green
        case 'mild_discomfort':
          return theme.colors.brand.tertiary; // Lavender
        case 'bloating':
          return theme.colors.brand.primary; // Coral red
        default:
          return theme.colors.text.secondary;
      }
    };

    const getCategoryBadges = () => {
      const categories = [];
      if (meal.is_high_sugar) categories.push({ label: 'Sugar', color: theme.colors.brand.primary });
      if (meal.is_high_fat) categories.push({ label: 'Fat', color: theme.colors.brand.primary });
      if (meal.is_high_carb) categories.push({ label: 'Carbs', color: theme.colors.brand.tertiary });
      if (meal.is_high_fiber) categories.push({ label: 'Fiber', color: theme.colors.brand.secondary });
      if (meal.is_high_protein) categories.push({ label: 'Protein', color: theme.colors.brand.secondary });
      if (meal.is_processed) categories.push({ label: 'Processed', color: theme.colors.neutral[500] });
      return categories;
    };

    return (
      <TouchableOpacity
        onLongPress={() => handleDeleteMeal(meal.id)}
        delayLongPress={500}
      >
        <Card variant="elevated" padding="large" style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <View style={styles.mealTitle}>
              <Text variant="h5" numberOfLines={2}>
                {meal.meal_name}
              </Text>
              <Text variant="label" color="secondary" style={styles.mealTime}>
                {timeString} • {meal.meal_size.charAt(0).toUpperCase() + meal.meal_size.slice(1)}
              </Text>
            </View>
            <View
              style={[
                styles.symptomBadge,
                { backgroundColor: getSymptomColor() + '20', borderColor: getSymptomColor() },
              ]}
            >
              <Text
                variant="caption"
                style={{
                  color: getSymptomColor(),
                  fontWeight: '600',
                }}
              >
                {meal.symptom === 'fine' ? '✓' : meal.symptom === 'mild_discomfort' ? '~' : '!'}
              </Text>
            </View>
          </View>

          {/* Categories */}
          {getCategoryBadges().length > 0 && (
            <View style={styles.categoriesContainer}>
              {getCategoryBadges().map((cat, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: cat.color + '20', borderColor: cat.color },
                  ]}
                >
                  <Text
                    variant="caption"
                    style={{
                      color: cat.color,
                      fontWeight: '600',
                    }}
                  >
                    {cat.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Text variant="caption" color="tertiary" style={styles.deleteHint}>
            Long press to delete
          </Text>
        </Card>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="h4" style={styles.emptyTitle}>
        No meals logged yet
      </Text>
      <Text variant="body" color="secondary" style={styles.emptyText}>
        Start logging your meals to track your health and update your Body Age score.
      </Text>
    </View>
  );

  return (
    <Container variant="grouped" scrollable={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="h4">Today's Meals</Text>
            <Text variant="label" color="secondary" style={styles.mealCount}>
              {meals.length} meal{meals.length !== 1 ? 's' : ''} logged
            </Text>
          </View>
          <TouchableOpacity
            style={styles.quickLogButton}
            onPress={() => {
              haptics.patterns.buttonPress();
              setModalVisible(true);
            }}
          >
            <Text variant="button" style={styles.quickLogButtonText}>
              +
            </Text>
          </TouchableOpacity>
        </View>

        {/* Meals List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.brand.primary} />
          </View>
        ) : meals.length > 0 ? (
          <FlatList
            data={meals}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MealCard meal={item} />}
            scrollEnabled={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <FlatList
            data={[1]}
            keyExtractor={() => 'empty'}
            renderItem={() => <EmptyState />}
            scrollEnabled={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        )}

        {/* Main Log Button */}
        <View style={styles.footer}>
          <Button
            title="Log Your First Meal"
            onPress={() => {
              haptics.patterns.buttonPress();
              setModalVisible(true);
            }}
            fullWidth
            size="large"
          />
        </View>
      </View>

      {/* Add Meal Modal */}
      <AddMealModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddMeal}
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
    alignItems: 'flex-start',
    paddingBottom: r.adaptiveSpacing.lg,
    marginBottom: r.adaptiveSpacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.main,
  },
  mealCount: {
    marginTop: theme.spacing.xs,
  },
  quickLogButton: {
    width: r.scaleWidth(48),
    height: r.scaleWidth(48),
    borderRadius: r.scaleWidth(24),
    backgroundColor: theme.colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLogButtonText: {
    fontSize: r.scaleWidth(28),
    color: theme.colors.background.primary,
    fontWeight: '300',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealCard: {
    marginBottom: theme.spacing.md,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  mealTitle: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  mealTime: {
    marginTop: theme.spacing.xs,
  },
  symptomBadge: {
    width: r.scaleWidth(32),
    height: r.scaleWidth(32),
    borderRadius: r.scaleWidth(16),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  categoryBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 9999,
    borderWidth: 1,
  },
  deleteHint: {
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
  separator: {
    height: theme.spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: r.adaptiveSpacing['3xl'],
  },
  emptyTitle: {
    marginBottom: theme.spacing.md,
    color: theme.colors.text.secondary,
  },
  emptyText: {
    textAlign: 'center',
    marginHorizontal: theme.spacing.lg,
    lineHeight: theme.typography.body.lineHeight,
  },
  footer: {
    paddingVertical: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 94 : 76, // Clearance for floating tab bar
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.main,
  },
});


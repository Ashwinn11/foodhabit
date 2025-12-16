import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import Text from './Text';
import { searchUSDAFoods, normalizeUSDAFoodName, categorizeUSDAFood, USDAFood } from '../services/foodApi';

interface FoodInputProps {
  onFoodsChange: (foods: Array<{ name: string; portion?: number; unit?: string }>) => void;
  recentFoods?: string[];
}

const PORTION_UNITS = ['cup', 'tbsp', 'piece', 'slice', 'g', 'ml'];

// Helper to get icon color based on categories
const getFoodIconColor = (categories: string[]): string => {
  if (categories.includes('fodmap_lactose') || categories.includes('dairy')) return theme.colors.brand.secondary;
  if (categories.includes('fodmap_fructans') || categories.includes('gluten')) return theme.colors.brand.primary;
  if (categories.includes('fodmap_fructose')) return theme.colors.brand.tertiary;
  if (categories.includes('caffeine')) return theme.colors.brand.tertiary;
  return theme.colors.brand.cream;
};

// Helper to get icon based on food type
const getFoodIcon = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('milk') || lowerName.includes('dairy')) return 'water-outline';
  if (lowerName.includes('cheese')) return 'square-outline';
  if (lowerName.includes('bread') || lowerName.includes('wheat')) return 'fast-food-outline';
  if (lowerName.includes('pasta') || lowerName.includes('noodle')) return 'restaurant-outline';
  if (lowerName.includes('pizza')) return 'pizza-outline';
  if (lowerName.includes('coffee')) return 'cafe-outline';
  if (lowerName.includes('tea')) return 'cafe';
  if (lowerName.includes('beer')) return 'beer-outline';
  if (lowerName.includes('wine')) return 'wine-outline';
  if (lowerName.includes('fish')) return 'fish-outline';
  if (lowerName.includes('fruit') || lowerName.includes('apple') || lowerName.includes('banana')) return 'nutrition';
  if (lowerName.includes('vegetable') || lowerName.includes('salad')) return 'leaf';
  
  return 'restaurant-outline';
};

export default function FoodInput({ onFoodsChange }: FoodInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<Array<{ name: string; portion?: number; unit?: string }>>([]);
  const [suggestions, setSuggestions] = useState<USDAFood[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [portionInput, setPortionInput] = useState<{ food: string; amount: string; unit: string } | null>(null);
  
  // Animation values
  const suggestionAnim = React.useRef(new Animated.Value(0)).current;
  const foodChipAnims = React.useRef<{ [key: string]: Animated.Value }>({}).current;

  // Debounced API search
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsLoading(true);
        try {
          const results = await searchUSDAFoods(searchQuery, 8);
          setSuggestions(results);
          setShowSuggestions(true);
          
          // Animate suggestions in
          Animated.spring(suggestionAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
          }).start();
        } catch (error) {
          console.error('Food search error:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setShowSuggestions(false);
        Animated.timing(suggestionAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  useEffect(() => {
    onFoodsChange(selectedFoods);
  }, [selectedFoods]);

  const addFood = (usdaFood: USDAFood) => {
    const foodName = normalizeUSDAFoodName(usdaFood);
    const categories = categorizeUSDAFood(usdaFood);
    
    // Check if it's a common trigger (FODMAP foods)
    const isTrigger = categories.some(cat => cat.includes('fodmap'));
    
    if (isTrigger) {
      setPortionInput({ food: foodName, amount: '', unit: 'cup' });
    } else {
      addFoodWithPortion(foodName);
    }
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const addFoodWithPortion = (foodName: string, portion?: number, unit?: string) => {
    const newFood = { name: foodName, portion, unit };
    setSelectedFoods(prev => [...prev, newFood]);
    setPortionInput(null);
    
    // Animate chip in
    if (!foodChipAnims[foodName]) {
      foodChipAnims[foodName] = new Animated.Value(0);
    }
    Animated.spring(foodChipAnims[foodName], {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const removeFood = (index: number) => {
    const foodName = selectedFoods[index].name;
    
    // Animate out
    Animated.timing(foodChipAnims[foodName], {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedFoods(prev => prev.filter((_, i) => i !== index));
    });
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={theme.colors.text.secondary} />
        <TextInput
          placeholder="Search foods (e.g., milk, pizza, coffee)..."
          placeholderTextColor={theme.colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <Animated.View
          style={[
            styles.suggestionsContainer,
            {
              opacity: suggestionAnim,
              transform: [
                {
                  translateY: suggestionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.brand.primary} />
              <Text variant="caption" color="secondary" style={{ marginLeft: theme.spacing.md }}>
                Searching 900,000+ foods...
              </Text>
            </View>
          ) : suggestions.length > 0 ? (
            <ScrollView style={styles.suggestionsList} nestedScrollEnabled>
              {suggestions.map((food) => {
                const foodName = normalizeUSDAFoodName(food);
                const categories = categorizeUSDAFood(food);
                const iconColor = getFoodIconColor(categories);
                const icon = getFoodIcon(foodName);
                const isTrigger = categories.some(cat => cat.includes('fodmap'));
                
                return (
                  <TouchableOpacity
                    key={food.fdcId}
                    style={styles.suggestionItem}
                    onPress={() => addFood(food)}
                  >
                    <View style={[styles.foodIcon, { backgroundColor: iconColor + '20' }]}>
                      <Ionicons name={icon as any} size={20} color={iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="body" weight="semiBold">
                        {food.description}
                      </Text>
                      {categories.length > 0 && (
                        <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                          {categories.slice(0, 2).join(', ')}
                        </Text>
                      )}
                      {food.brandOwner && (
                        <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>
                          {food.brandOwner}
                        </Text>
                      )}
                    </View>
                    {isTrigger && (
                      <View style={styles.triggerBadge}>
                        <Ionicons name="warning-outline" size={12} color={theme.colors.brand.primary} />
                        <Text variant="caption" weight="semiBold" style={{ color: theme.colors.brand.primary, marginLeft: 4 }}>
                          FODMAP
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.loadingContainer}>
              <Text variant="caption" color="secondary">
                No foods found
              </Text>
            </View>
          )}
        </Animated.View>
      )}


      {/* Selected Foods */}
      {selectedFoods.length > 0 && (
        <View style={styles.selectedSection}>
          <Text variant="caption" weight="semiBold" color="secondary" style={{ marginBottom: theme.spacing.md }}>
            Added foods ({selectedFoods.length})
          </Text>
          <View style={styles.selectedFoodsList}>
            {selectedFoods.map((food, index) => {
              const animValue = foodChipAnims[food.name] || new Animated.Value(1);
              
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.selectedFoodChip,
                    {
                      opacity: animValue,
                      transform: [
                        {
                          scale: animValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          }),
                        },
                      ],
                    },
                  ]}>
                  <View style={[styles.foodIconSmall, { backgroundColor: theme.colors.brand.secondary + '20' }]}>
                    <Ionicons name="restaurant-outline" size={16} color={theme.colors.brand.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" weight="semiBold">
                      {food.name}
                    </Text>
                    {food.portion && (
                      <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                        {food.portion} {food.unit}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => removeFood(index)} style={styles.removeButton}>
                    <Ionicons name="close-circle" size={20} color={theme.colors.text.secondary} />
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>
      )}

      {/* Portion Input Modal */}
      {portionInput && (
        <View style={styles.portionModal}>
          <View style={styles.portionContent}>
            <Text variant="title3" weight="bold" style={{ marginBottom: theme.spacing.md }}>
              How much {portionInput.food}?
            </Text>
            <Text variant="caption" color="secondary" style={{ marginBottom: theme.spacing.lg }}>
              This helps us detect dose-dependent triggers
            </Text>
            
            <View style={styles.portionInputRow}>
              <TextInput
                placeholder="Amount"
                placeholderTextColor={theme.colors.text.tertiary}
                value={portionInput.amount}
                onChangeText={(text) => setPortionInput(prev => prev ? { ...prev, amount: text } : null)}
                keyboardType="numeric"
                style={styles.portionAmountInput}
              />
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitSelector}>
                {PORTION_UNITS.map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitButton,
                      portionInput.unit === unit && styles.unitButtonSelected,
                    ]}
                    onPress={() => setPortionInput(prev => prev ? { ...prev, unit } : null)}
                  >
                    <Text
                      variant="caption"
                      weight="semiBold"
                      style={{
                        color: portionInput.unit === unit
                          ? theme.colors.brand.white
                          : theme.colors.text.secondary,
                      }}
                    >
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.portionActions}>
              <TouchableOpacity
                style={[styles.portionButton, styles.portionButtonSecondary]}
                onPress={() => addFoodWithPortion(portionInput.food)}
              >
                <Text variant="body" weight="semiBold" style={{ color: theme.colors.text.primary }}>
                  Skip
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.portionButton, styles.portionButtonPrimary]}
                onPress={() => {
                  const amount = parseFloat(portionInput.amount);
                  if (!isNaN(amount) && amount > 0) {
                    addFoodWithPortion(portionInput.food, amount, portionInput.unit);
                  }
                }}
                disabled={!portionInput.amount || parseFloat(portionInput.amount) <= 0}
              >
                <Text variant="body" weight="semiBold" style={{ color: theme.colors.brand.white }}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
  },
  suggestionsContainer: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    maxHeight: 300,
    overflow: 'hidden',
  },
  suggestionsList: {
    maxHeight: 300,
  },
  loadingContainer: {
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    gap: theme.spacing.md,
  },
  foodIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodIconSmall: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triggerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.brand.primary + '1A',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  recentSection: {
    marginTop: theme.spacing.lg,
  },
  recentFoodsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  recentFoodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  selectedSection: {
    marginTop: theme.spacing.lg,
  },
  selectedFoodsList: {
    gap: theme.spacing.md,
  },
  selectedFoodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    gap: theme.spacing.md,
  },
  removeButton: {
    padding: theme.spacing.sm,
  },
  portionModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  portionContent: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing['2xl'],
    width: '90%',
    maxWidth: 400,
  },
  portionInputRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  portionAmountInput: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text.primary,
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
  },
  unitSelector: {
    flex: 1,
  },
  unitButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.primary,
    marginRight: theme.spacing.sm,
  },
  unitButtonSelected: {
    backgroundColor: theme.colors.brand.primary,
  },
  portionActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  portionButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  portionButtonSecondary: {
    backgroundColor: theme.colors.background.primary,
  },
  portionButtonPrimary: {
    backgroundColor: theme.colors.brand.primary,
  },
});

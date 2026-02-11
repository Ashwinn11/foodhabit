/**
 * Meal Data Mapper
 */
import { Meal, MealType, PortionSize } from '../../domain';

export interface MealRow {
    id: string;
    user_id: string;
    timestamp: string;
    meal_type: string;
    name: string;
    description?: string | null;
    foods: string[];
    portion_size?: string | null;
    food_tags?: string[] | null;
    normalized_foods?: string[] | null;
    nutrition?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
        fiber?: number;
        sugar?: number;
        sodium?: number;
    } | null;
}

export class MealMapper {
    static toDomain(row: MealRow): Meal {
        return Meal.reconstitute({
            id: row.id,
            timestamp: new Date(row.timestamp),
            mealType: MealType.create(row.meal_type),
            name: row.name,
            description: row.description || undefined,
            foods: row.foods || [],
            portionSize: row.portion_size ? PortionSize.create(row.portion_size) : undefined,
            foodTags: row.food_tags || undefined,
            normalizedFoods: row.normalized_foods || undefined,
            nutrition: row.nutrition || undefined,
        });
    }

    static toPersistence(userId: string, meal: Meal): Omit<MealRow, 'id'> & { id?: string } {
        return {
            id: meal.id,
            user_id: userId,
            timestamp: meal.timestamp.toISOString(),
            meal_type: meal.mealType.getValue(),
            name: meal.name,
            description: meal.description ?? null,
            foods: meal.foods,
            portion_size: meal.portionSize?.getValue() ?? null,
            food_tags: meal.foodTags.length > 0 ? meal.foodTags : null,
            normalized_foods: meal.normalizedFoods.length > 0 ? meal.normalizedFoods : null,
            nutrition: meal.nutrition ? {
                calories: meal.nutrition.calories,
                protein: meal.nutrition.protein,
                carbs: meal.nutrition.carbs,
                fat: meal.nutrition.fat,
                fiber: meal.nutrition.fiber,
                sugar: meal.nutrition.sugar,
                sodium: meal.nutrition.sodium,
            } : null,
        };
    }
}

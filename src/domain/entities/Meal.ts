/**
 * Meal Entity
 * Core domain entity representing a food/drink log
 */
import { MealType, PortionSize } from '../value-objects';

export interface MealProps {
    id: string;
    timestamp: Date;
    mealType: MealType;
    name: string;
    description?: string;
    foods: string[];
    portionSize?: PortionSize;
    foodTags?: string[];
    normalizedFoods?: string[];
    nutrition?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
        fiber?: number;
        sugar?: number;
        sodium?: number;
    };
}

export interface CreateMealInput {
    timestamp?: Date;
    mealType: string;
    name: string;
    description?: string;
    foods: string[];
    portionSize?: string;
    foodTags?: string[];
    normalizedFoods?: string[];
    nutrition?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
        fiber?: number;
        sugar?: number;
        sodium?: number;
    };
}

/**
 * Generate a unique ID
 */
function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * Meal Domain Entity
 * Encapsulates business logic for meal tracking
 */
export class Meal {
    private constructor(private readonly props: MealProps) {
        Object.freeze(this.props);
    }

    /**
     * Create a new Meal
     */
    static create(input: CreateMealInput): Meal {
        return new Meal({
            id: generateId(),
            timestamp: input.timestamp ?? new Date(),
            mealType: MealType.create(input.mealType),
            name: input.name.trim(),
            description: input.description?.trim(),
            foods: input.foods.map(f => f.trim()).filter(f => f.length > 0),
            portionSize: input.portionSize ? PortionSize.create(input.portionSize) : undefined,
            foodTags: input.foodTags,
            normalizedFoods: input.normalizedFoods,
            nutrition: input.nutrition,
        });
    }

    /**
     * Reconstitute an existing Meal from persistence
     */
    static reconstitute(props: MealProps): Meal {
        return new Meal(props);
    }

    // === Getters ===

    get id(): string {
        return this.props.id;
    }

    get timestamp(): Date {
        return this.props.timestamp;
    }

    get mealType(): MealType {
        return this.props.mealType;
    }

    get name(): string {
        return this.props.name;
    }

    get description(): string | undefined {
        return this.props.description;
    }

    get foods(): string[] {
        return [...this.props.foods];
    }

    get portionSize(): PortionSize | undefined {
        return this.props.portionSize;
    }

    get foodTags(): string[] {
        return this.props.foodTags ? [...this.props.foodTags] : [];
    }

    get normalizedFoods(): string[] {
        return this.props.normalizedFoods ? [...this.props.normalizedFoods] : [];
    }

    get nutrition() {
        return this.props.nutrition;
    }

    // === Computed Properties ===

    /**
     * Get foods for analysis (normalized if available, otherwise raw)
     */
    get foodsForAnalysis(): string[] {
        return this.props.normalizedFoods?.length
            ? this.props.normalizedFoods
            : this.props.foods;
    }

    /**
     * Check if meal contains a specific food (case-insensitive)
     */
    containsFood(food: string): boolean {
        const normalizedFood = food.toLowerCase().trim();
        return this.foodsForAnalysis.some(f =>
            f.toLowerCase().trim() === normalizedFood
        );
    }

    /**
     * Check if this is a main meal
     */
    get isMainMeal(): boolean {
        return this.props.mealType.isMainMeal;
    }

    /**
     * Check if meal occurred on a specific date
     */
    isOnDate(date: Date): boolean {
        const mealDate = new Date(this.props.timestamp);
        mealDate.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return mealDate.getTime() === checkDate.getTime();
    }

    /**
     * Check if meal occurred today
     */
    get isToday(): boolean {
        return this.isOnDate(new Date());
    }

    /**
     * Get the number of individual food items
     */
    get foodCount(): number {
        return this.props.foods.length;
    }

    /**
     * Check if meal has specific tag
     */
    hasTag(tag: string): boolean {
        return this.props.foodTags?.includes(tag) ?? false;
    }

    /**
     * Check if meal contains potential triggers
     */
    get hasPotentialTriggers(): boolean {
        const triggerTags = ['spicy', 'dairy', 'gluten', 'fried', 'caffeine', 'alcohol', 'high-fat'];
        return triggerTags.some(tag => this.hasTag(tag));
    }

    // === Update Methods ===

    /**
     * Create a new Meal with updated properties
     */
    update(updates: Partial<CreateMealInput>): Meal {
        return new Meal({
            ...this.props,
            timestamp: updates.timestamp ?? this.props.timestamp,
            mealType: updates.mealType
                ? MealType.create(updates.mealType)
                : this.props.mealType,
            name: updates.name?.trim() ?? this.props.name,
            description: updates.description !== undefined
                ? updates.description?.trim()
                : this.props.description,
            foods: updates.foods
                ? updates.foods.map(f => f.trim()).filter(f => f.length > 0)
                : this.props.foods,
            portionSize: updates.portionSize !== undefined
                ? (updates.portionSize ? PortionSize.create(updates.portionSize) : undefined)
                : this.props.portionSize,
            foodTags: updates.foodTags ?? this.props.foodTags,
            normalizedFoods: updates.normalizedFoods ?? this.props.normalizedFoods,
            nutrition: updates.nutrition ?? this.props.nutrition,
        });
    }

    // === Serialization ===

    /**
     * Convert to plain object for persistence
     */
    toJSON(): Record<string, unknown> {
        return {
            id: this.props.id,
            timestamp: this.props.timestamp.toISOString(),
            mealType: this.props.mealType.getValue(),
            name: this.props.name,
            description: this.props.description,
            foods: this.props.foods,
            portionSize: this.props.portionSize?.getValue(),
            foodTags: this.props.foodTags,
            normalizedFoods: this.props.normalizedFoods,
            nutrition: this.props.nutrition,
        };
    }

    /**
     * Equality check
     */
    equals(other: Meal): boolean {
        return this.props.id === other.props.id;
    }
}

/**
 * Collection of food-related tag constants
 */
export const FOOD_TAGS = [
    'spicy',
    'dairy',
    'gluten',
    'fried',
    'caffeine',
    'alcohol',
    'high-fat',
    'processed',
    'raw',
    'fermented',
] as const;

export type FoodTag = typeof FOOD_TAGS[number];

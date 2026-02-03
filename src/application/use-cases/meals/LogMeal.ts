/**
 * LogMealUseCase
 * Handles logging a new meal
 */
import { Meal, CreateMealInput } from '../../../domain';
import { IMealRepository } from '../../ports/repositories';
import { INotificationService } from '../../ports/services';

export interface LogMealResult {
    meal: Meal;
    isFirstOfType: boolean;
}

export class LogMealUseCase {
    constructor(
        private readonly mealRepo: IMealRepository,
        private readonly notificationService: INotificationService,
    ) { }

    async execute(userId: string, input: CreateMealInput): Promise<LogMealResult> {
        // 1. Create domain entity
        const meal = Meal.create(input);

        // 2. Check if first meal of this type today
        const todayMealsOfType = await this.mealRepo.findByTypeAndDate(
            userId,
            meal.mealType.getValue(),
            new Date()
        );
        const isFirstOfType = todayMealsOfType.length === 0;

        // 3. Persist
        await this.mealRepo.save(userId, meal);

        // 4. Show notification if first of type
        if (isFirstOfType) {
            this.notificationService.showToast({
                message: `${meal.mealType.getLabel()} logged!`,
                icon: 'restaurant',
            });
        }

        return {
            meal,
            isFirstOfType,
        };
    }
}

/**
 * GetMealsUseCase
 * Retrieves meals with various filters
 */
export class GetMealsUseCase {
    constructor(private readonly mealRepo: IMealRepository) { }

    async execute(userId: string): Promise<Meal[]> {
        return this.mealRepo.findByUserId(userId);
    }

    async getToday(userId: string): Promise<Meal[]> {
        return this.mealRepo.findToday(userId);
    }

    async getRecent(userId: string, days: number): Promise<Meal[]> {
        return this.mealRepo.findRecentDays(userId, days);
    }

    async getByDateRange(userId: string, start: Date, end: Date): Promise<Meal[]> {
        return this.mealRepo.findByDateRange(userId, start, end);
    }
}

/**
 * DeleteMealUseCase
 */
export class DeleteMealUseCase {
    constructor(private readonly mealRepo: IMealRepository) { }

    async execute(userId: string, mealId: string): Promise<void> {
        await this.mealRepo.delete(userId, mealId);
    }
}

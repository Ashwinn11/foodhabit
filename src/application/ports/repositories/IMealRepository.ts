/**
 * IMealRepository
 * Port for meal data access
 */
import { Meal } from '../../../domain';

export interface IMealRepository {
    /**
     * Save a new meal
     */
    save(userId: string, meal: Meal): Promise<void>;

    /**
     * Update an existing meal
     */
    update(userId: string, meal: Meal): Promise<void>;

    /**
     * Find a meal by ID
     */
    findById(userId: string, id: string): Promise<Meal | null>;

    /**
     * Find all meals for a user
     */
    findByUserId(userId: string): Promise<Meal[]>;

    /**
     * Find meals within a date range
     */
    findByDateRange(userId: string, start: Date, end: Date): Promise<Meal[]>;

    /**
     * Find meals from the last N days
     */
    findRecentDays(userId: string, days: number): Promise<Meal[]>;

    /**
     * Delete a meal
     */
    delete(userId: string, id: string): Promise<void>;

    /**
     * Get meals for today
     */
    findToday(userId: string): Promise<Meal[]>;

    /**
     * Find meals by meal type for a specific date
     */
    findByTypeAndDate(userId: string, mealType: string, date: Date): Promise<Meal[]>;
}

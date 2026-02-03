/**
 * IGutMomentRepository
 * Port for gut moment data access
 */
import { GutMoment } from '../../../domain';

export interface IGutMomentRepository {
    /**
     * Save a new gut moment
     */
    save(userId: string, moment: GutMoment): Promise<void>;

    /**
     * Update an existing gut moment
     */
    update(userId: string, moment: GutMoment): Promise<void>;

    /**
     * Find a gut moment by ID
     */
    findById(userId: string, id: string): Promise<GutMoment | null>;

    /**
     * Find all gut moments for a user
     */
    findByUserId(userId: string): Promise<GutMoment[]>;

    /**
     * Find gut moments within a date range
     */
    findByDateRange(userId: string, start: Date, end: Date): Promise<GutMoment[]>;

    /**
     * Find gut moments from the last N days
     */
    findRecentDays(userId: string, days: number): Promise<GutMoment[]>;

    /**
     * Delete a gut moment
     */
    delete(userId: string, id: string): Promise<void>;

    /**
     * Get count of gut moments for a user
     */
    count(userId: string): Promise<number>;

    /**
     * Get gut moments for today
     */
    findToday(userId: string): Promise<GutMoment[]>;
}

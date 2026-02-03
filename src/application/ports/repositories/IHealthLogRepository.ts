/**
 * IHealthLogRepository
 * Port for health log data access (water, fiber, probiotic, exercise)
 */
import { HealthLog, HealthLogType } from '../../../domain';

export interface IHealthLogRepository {
    /**
     * Save or update a health log for a specific date and type
     */
    upsert(userId: string, log: HealthLog): Promise<void>;

    /**
     * Find a health log by date and type
     */
    findByDateAndType(userId: string, date: string, type: HealthLogType): Promise<HealthLog | null>;

    /**
     * Find all health logs for a specific date
     */
    findByDate(userId: string, date: string): Promise<HealthLog[]>;

    /**
     * Find all health logs of a specific type
     */
    findByType(userId: string, type: HealthLogType): Promise<HealthLog[]>;

    /**
     * Find health logs within a date range
     */
    findByDateRange(userId: string, start: string, end: string): Promise<HealthLog[]>;

    /**
     * Get today's health logs
     */
    findToday(userId: string): Promise<HealthLog[]>;

    /**
     * Delete a health log
     */
    delete(userId: string, date: string, type: HealthLogType): Promise<void>;
}

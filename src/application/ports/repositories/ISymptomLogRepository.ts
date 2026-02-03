/**
 * ISymptomLogRepository
 * Port for standalone symptom log data access
 */
import { SymptomLog } from '../../../domain';

export interface ISymptomLogRepository {
    /**
     * Save a new symptom log
     */
    save(userId: string, log: SymptomLog): Promise<void>;

    /**
     * Find a symptom log by ID
     */
    findById(userId: string, id: string): Promise<SymptomLog | null>;

    /**
     * Find all symptom logs for a user
     */
    findByUserId(userId: string): Promise<SymptomLog[]>;

    /**
     * Find symptom logs within a date range
     */
    findByDateRange(userId: string, start: Date, end: Date): Promise<SymptomLog[]>;

    /**
     * Find symptom logs from the last N days
     */
    findRecentDays(userId: string, days: number): Promise<SymptomLog[]>;

    /**
     * Delete a symptom log
     */
    delete(userId: string, id: string): Promise<void>;

    /**
     * Find symptom logs for today
     */
    findToday(userId: string): Promise<SymptomLog[]>;
}

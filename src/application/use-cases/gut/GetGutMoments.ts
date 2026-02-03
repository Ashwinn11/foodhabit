/**
 * GetGutMomentsUseCase
 * Retrieves gut moments with various filters
 */
import { GutMoment } from '../../../domain';
import { IGutMomentRepository } from '../../ports/repositories';

export interface GetGutMomentsInput {
    userId: string;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    days?: number;
}

export class GetGutMomentsUseCase {
    constructor(private readonly gutMomentRepo: IGutMomentRepository) { }

    /**
     * Get all gut moments for a user
     */
    async execute(userId: string): Promise<GutMoment[]> {
        return this.gutMomentRepo.findByUserId(userId);
    }

    /**
     * Get recent gut moments (last N days)
     */
    async getRecent(userId: string, days: number): Promise<GutMoment[]> {
        return this.gutMomentRepo.findRecentDays(userId, days);
    }

    /**
     * Get gut moments for today
     */
    async getToday(userId: string): Promise<GutMoment[]> {
        return this.gutMomentRepo.findToday(userId);
    }

    /**
     * Get gut moments within a date range
     */
    async getByDateRange(userId: string, start: Date, end: Date): Promise<GutMoment[]> {
        return this.gutMomentRepo.findByDateRange(userId, start, end);
    }

    /**
     * Get count of gut moments
     */
    async getCount(userId: string): Promise<number> {
        return this.gutMomentRepo.count(userId);
    }
}

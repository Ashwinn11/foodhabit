/**
 * DeleteGutMomentUseCase
 * Handles deleting a gut moment
 */
import { IGutMomentRepository } from '../../ports/repositories';
import { StreakService } from '../../services';

export interface DeleteGutMomentResult {
    success: boolean;
    newStreak: number;
    newTotalLogs: number;
}

export class DeleteGutMomentUseCase {
    constructor(
        private readonly gutMomentRepo: IGutMomentRepository,
        private readonly streakService: StreakService,
    ) { }

    async execute(userId: string, momentId: string): Promise<DeleteGutMomentResult> {
        // Delete the moment
        await this.gutMomentRepo.delete(userId, momentId);

        // Recalculate streak
        const remainingMoments = await this.gutMomentRepo.findByUserId(userId);
        const newStreak = this.streakService.calculateCurrentStreak(remainingMoments);
        const newTotalLogs = remainingMoments.length;

        return {
            success: true,
            newStreak,
            newTotalLogs,
        };
    }
}

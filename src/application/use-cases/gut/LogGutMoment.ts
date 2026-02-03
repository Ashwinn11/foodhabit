/**
 * LogGutMomentUseCase
 * Handles logging a new gut moment with all side effects
 */
import { GutMoment, CreateGutMomentInput } from '../../../domain';
import { IGutMomentRepository } from '../../ports/repositories';
import { INotificationService, IWidgetService } from '../../ports/services';
import { StreakService } from '../../services';

export interface LogGutMomentResult {
    moment: GutMoment;
    isFirstToday: boolean;
    newStreak: number;
}

export class LogGutMomentUseCase {
    constructor(
        private readonly gutMomentRepo: IGutMomentRepository,
        private readonly notificationService: INotificationService,
        private readonly widgetService: IWidgetService,
        private readonly streakService: StreakService,
    ) { }

    async execute(userId: string, input: CreateGutMomentInput): Promise<LogGutMomentResult> {
        // 1. Create domain entity
        const moment = GutMoment.create(input);

        // 2. Check if first poop today (for achievements)
        const todayMoments = await this.gutMomentRepo.findToday(userId);
        const isFirstToday = todayMoments.length === 0;

        // 3. Persist
        await this.gutMomentRepo.save(userId, moment);

        // 4. Calculate new streak
        const allMoments = await this.gutMomentRepo.findByUserId(userId);
        const newStreak = this.streakService.calculateCurrentStreak(allMoments);

        // 5. Show notifications
        if (isFirstToday) {
            this.notificationService.showToast({
                message: 'Mission Plop-plete!',
                icon: 'sparkles',
            });
            this.notificationService.showAchievement(
                'Mission Plop-plete! 💩',
                "You've logged your first gut moment of the day. Keep it up!"
            );
        } else {
            this.notificationService.showToast({
                message: 'Poop logged!',
                icon: 'happy',
            });
        }

        // 6. Sync widget
        if (this.widgetService.isSupported()) {
            // Widget sync will be called by the presentation layer with full data
        }

        return {
            moment,
            isFirstToday,
            newStreak,
        };
    }
}

/**
 * QuickLogGutMomentUseCase
 * Simplified logging for quick actions
 */
export class QuickLogGutMomentUseCase {
    constructor(
        private readonly gutMomentRepo: IGutMomentRepository,
        private readonly notificationService: INotificationService,
        private readonly streakService: StreakService,
    ) { }

    async execute(userId: string, bristolType: number = 4): Promise<LogGutMomentResult> {
        const moment = GutMoment.quickLog(bristolType);

        const todayMoments = await this.gutMomentRepo.findToday(userId);
        const isFirstToday = todayMoments.length === 0;

        await this.gutMomentRepo.save(userId, moment);

        const allMoments = await this.gutMomentRepo.findByUserId(userId);
        const newStreak = this.streakService.calculateCurrentStreak(allMoments);

        if (isFirstToday) {
            this.notificationService.showToast({
                message: 'Mission Plop-plete!',
                icon: 'sparkles',
            });
        } else {
            this.notificationService.showToast({
                message: 'Quick plop logged!',
                icon: 'checkmark-circle',
            });
        }

        return {
            moment,
            isFirstToday,
            newStreak,
        };
    }
}

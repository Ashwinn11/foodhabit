/**
 * Health Log Use Cases
 * Water, Fiber, Probiotic, Exercise tracking
 */
import { HealthLog, HealthLogType } from '../../../domain';
import { IHealthLogRepository } from '../../ports/repositories';
import { INotificationService } from '../../ports/services';

export interface LogHealthResult {
    log: HealthLog;
    goalReached: boolean;
    isNewGoal: boolean; // Just reached goal with this log
}

/**
 * LogWaterUseCase
 */
export class LogWaterUseCase {
    constructor(
        private readonly healthLogRepo: IHealthLogRepository,
        private readonly notificationService: INotificationService,
    ) { }

    async execute(userId: string, showToast: boolean = true): Promise<LogHealthResult> {
        const todayStr = new Date().toISOString().split('T')[0];

        // Get existing log
        const existing = await this.healthLogRepo.findByDateAndType(userId, todayStr, 'water');

        // Create or increment
        const log = existing
            ? existing.increment(1)
            : HealthLog.create({ type: 'water', value: 1 });

        const wasUnderGoal = existing ? !existing.isGoalMet() : true;
        const goalReached = log.isGoalMet();
        const isNewGoal = wasUnderGoal && goalReached;

        // Save
        await this.healthLogRepo.upsert(userId, log);

        // Show toast
        if (showToast) {
            if (isNewGoal) {
                this.notificationService.showToast({
                    message: 'Goal reached! Hydrated!',
                    icon: 'trophy',
                });
                this.notificationService.showAchievement(
                    'Hydration Hero! 💧',
                    "You've reached your water goal for today. Your gut will thank you!"
                );
            } else if (!goalReached) {
                const goal = HealthLog.getGoal('water');
                this.notificationService.showToast({
                    message: `${log.value}/${goal} glasses. Gulp!`,
                    icon: 'water',
                });
            } else {
                this.notificationService.showToast({
                    message: 'Extra hydration logged!',
                    icon: 'water',
                });
            }
        }

        return { log, goalReached, isNewGoal };
    }
}

/**
 * LogFiberUseCase
 */
export class LogFiberUseCase {
    constructor(
        private readonly healthLogRepo: IHealthLogRepository,
        private readonly notificationService: INotificationService,
    ) { }

    async execute(userId: string, grams: number, showToast: boolean = true): Promise<LogHealthResult> {
        const todayStr = new Date().toISOString().split('T')[0];

        const existing = await this.healthLogRepo.findByDateAndType(userId, todayStr, 'fiber');

        const log = existing
            ? existing.increment(grams)
            : HealthLog.create({ type: 'fiber', value: grams });

        const wasUnderGoal = existing ? !existing.isGoalMet() : true;
        const goalReached = log.isGoalMet();
        const isNewGoal = wasUnderGoal && goalReached;

        await this.healthLogRepo.upsert(userId, log);

        if (showToast) {
            this.notificationService.showToast({
                message: `+${grams}g Fiber logged!`,
                icon: 'leaf',
            });

            if (isNewGoal) {
                this.notificationService.showToast({
                    message: 'Fiber goal met! Rockstar!',
                    icon: 'happy',
                });
                this.notificationService.showAchievement(
                    'Fiber Power! 🌾',
                    "Fiber goal reached! You're giving your gut the fuel it needs."
                );
            }
        }

        return { log, goalReached, isNewGoal };
    }
}

/**
 * LogProbioticUseCase
 */
export class LogProbioticUseCase {
    constructor(
        private readonly healthLogRepo: IHealthLogRepository,
        private readonly notificationService: INotificationService,
    ) { }

    async execute(userId: string): Promise<LogHealthResult> {
        const todayStr = new Date().toISOString().split('T')[0];

        const existing = await this.healthLogRepo.findByDateAndType(userId, todayStr, 'probiotic');

        const log = existing
            ? existing.increment(1)
            : HealthLog.create({ type: 'probiotic', value: 1 });

        const wasUnderGoal = existing ? !existing.isGoalMet() : true;
        const goalReached = log.isGoalMet();
        const isNewGoal = wasUnderGoal && goalReached;

        await this.healthLogRepo.upsert(userId, log);

        this.notificationService.showToast({
            message: log.value === 1 ? 'Probiotic logged!' : 'More probiotics logged!',
            icon: 'bug',
        });

        return { log, goalReached, isNewGoal };
    }
}

/**
 * LogExerciseUseCase
 */
export class LogExerciseUseCase {
    constructor(
        private readonly healthLogRepo: IHealthLogRepository,
        private readonly notificationService: INotificationService,
    ) { }

    async execute(userId: string, minutes: number): Promise<LogHealthResult> {
        const todayStr = new Date().toISOString().split('T')[0];

        const existing = await this.healthLogRepo.findByDateAndType(userId, todayStr, 'exercise');

        const log = existing
            ? existing.increment(minutes)
            : HealthLog.create({ type: 'exercise', value: minutes });

        const wasUnderGoal = existing ? !existing.isGoalMet() : true;
        const goalReached = log.isGoalMet();
        const isNewGoal = wasUnderGoal && goalReached;

        await this.healthLogRepo.upsert(userId, log);

        this.notificationService.showToast({
            message: `+${minutes}m Exercise logged!`,
            icon: 'fitness',
        });

        if (isNewGoal) {
            this.notificationService.showToast({
                message: 'Exercise goal reached!',
                icon: 'medal',
            });
            this.notificationService.showAchievement(
                'Active Gut! 🏃‍♂️',
                "Exercise goal reached! Movement is medicine for your digestion."
            );
        }

        return { log, goalReached, isNewGoal };
    }
}

/**
 * GetHealthLogsUseCase
 */
export class GetHealthLogsUseCase {
    constructor(private readonly healthLogRepo: IHealthLogRepository) { }

    async getToday(userId: string): Promise<HealthLog[]> {
        return this.healthLogRepo.findToday(userId);
    }

    async getByType(userId: string, type: HealthLogType): Promise<HealthLog[]> {
        return this.healthLogRepo.findByType(userId, type);
    }

    async getTodayByType(userId: string, type: HealthLogType): Promise<HealthLog | null> {
        const todayStr = new Date().toISOString().split('T')[0];
        return this.healthLogRepo.findByDateAndType(userId, todayStr, type);
    }

    async getByDateRange(userId: string, start: string, end: string): Promise<HealthLog[]> {
        return this.healthLogRepo.findByDateRange(userId, start, end);
    }
}

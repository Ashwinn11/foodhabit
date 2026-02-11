/**
 * Analytics Use Cases
 * Health score, trigger detection, medical alerts
 */
import { GutMoment, Meal, Trigger, CombinationTrigger, TriggerFeedback, HealthScore } from '../../../domain';
import { IGutMomentRepository, IMealRepository, ITriggerFeedbackRepository } from '../../ports/repositories';
import {
    HealthScoreService,
    TriggerDetectionService,
    MedicalAlertService,
    MedicalAlertResult,
    DismissedAlerts,
} from '../../services';

/**
 * CalculateHealthScoreUseCase
 */
export class CalculateHealthScoreUseCase {
    constructor(
        private readonly gutMomentRepo: IGutMomentRepository,
        private readonly healthScoreService: HealthScoreService,
    ) { }

    async execute(userId: string, baselineScore: number): Promise<HealthScore> {
        const moments = await this.gutMomentRepo.findByUserId(userId);

        // Fetch user's baseline regularity from onboarding data
        const baselineRegularity = await this.fetchBaselineRegularity(userId);

        return this.healthScoreService.calculateScore({
            moments,
            baselineScore,
            baselineRegularity,
        });
    }

    /**
     * Calculate score from provided moments (no DB call)
     */
    calculateFromMoments(moments: GutMoment[], baselineScore: number, baselineRegularity?: number): HealthScore {
        return this.healthScoreService.calculateScore({
            moments,
            baselineScore,
            baselineRegularity,
        });
    }

    /**
     * Fetch user's baseline bowel regularity from onboarding data
     * Returns 0-2 (0=Regular, 1=Somewhat, 2=Unpredictable)
     * Defaults to 1 if not found
     */
    private async fetchBaselineRegularity(userId: string): Promise<number> {
        try {
            // Import here to avoid circular dependencies
            const { supabase } = await import('../../../config/supabase');

            const { data } = await supabase
                .from('users')
                .select('onboarding_data')
                .eq('id', userId)
                .maybeSingle();

            if (data?.onboarding_data?.answers?.bowelRegularity !== undefined) {
                return data.onboarding_data.answers.bowelRegularity;
            }
        } catch (error) {
            console.warn('Failed to fetch baseline regularity:', error);
        }

        // Default to "somewhat regular" if not found
        return 1;
    }
}

/**
 * DetectTriggersUseCase
 */
export class DetectTriggersUseCase {
    constructor(
        private readonly gutMomentRepo: IGutMomentRepository,
        private readonly mealRepo: IMealRepository,
        private readonly feedbackRepo: ITriggerFeedbackRepository,
        private readonly triggerService: TriggerDetectionService,
    ) { }

    async execute(userId: string): Promise<Trigger[]> {
        const [moments, meals, feedback] = await Promise.all([
            this.gutMomentRepo.findByUserId(userId),
            this.mealRepo.findByUserId(userId),
            this.feedbackRepo.findByUserId(userId),
        ]);

        return this.triggerService.detectTriggers({
            moments,
            meals,
            feedback,
        });
    }

    /**
     * Detect from provided data (no DB call)
     */
    async detectFromData(
        moments: GutMoment[],
        meals: Meal[],
        feedback: TriggerFeedback[]
    ): Promise<Trigger[]> {
        return this.triggerService.detectTriggers({
            moments,
            meals,
            feedback,
        });
    }
}

/**
 * DetectCombinationTriggersUseCase
 */
export class DetectCombinationTriggersUseCase {
    constructor(
        private readonly gutMomentRepo: IGutMomentRepository,
        private readonly mealRepo: IMealRepository,
        private readonly triggerService: TriggerDetectionService,
    ) { }

    async execute(userId: string): Promise<CombinationTrigger[]> {
        const [moments, meals] = await Promise.all([
            this.gutMomentRepo.findByUserId(userId),
            this.mealRepo.findByUserId(userId),
        ]);

        return this.triggerService.detectCombinationTriggers(moments, meals);
    }
}

/**
 * CheckMedicalAlertsUseCase
 */
export class CheckMedicalAlertsUseCase {
    constructor(
        private readonly gutMomentRepo: IGutMomentRepository,
        private readonly medicalAlertService: MedicalAlertService,
    ) { }

    async execute(userId: string, dismissedAlerts: DismissedAlerts = {}): Promise<MedicalAlertResult> {
        const moments = await this.gutMomentRepo.findByUserId(userId);
        return this.medicalAlertService.checkAlerts(moments, dismissedAlerts);
    }

    /**
     * Check from provided moments (no DB call)
     */
    checkFromMoments(moments: GutMoment[], dismissedAlerts: DismissedAlerts = {}): MedicalAlertResult {
        return this.medicalAlertService.checkAlerts(moments, dismissedAlerts);
    }
}

/**
 * SaveTriggerFeedbackUseCase
 */
export class SaveTriggerFeedbackUseCase {
    constructor(private readonly feedbackRepo: ITriggerFeedbackRepository) { }

    async execute(
        userId: string,
        foodName: string,
        confirmed: boolean | null,
        notes?: string
    ): Promise<TriggerFeedback> {
        const feedback = TriggerFeedback.create({
            foodName,
            userConfirmed: confirmed,
            timestamp: new Date(),
            notes,
        });

        await this.feedbackRepo.upsert(userId, feedback);
        return feedback;
    }
}

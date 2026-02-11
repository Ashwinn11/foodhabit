/**
 * CompleteOnboardingUseCase
 * Handles completing the onboarding process
 */
import { OnboardingAnswers } from '../../../domain';
import { IUserRepository } from '../../ports/repositories';

export interface CompleteOnboardingResult {
    score: number;
    success: boolean;
}

export class CompleteOnboardingUseCase {
    constructor(
        private readonly userRepo: IUserRepository
    ) { }

    async execute(userId: string, answers: OnboardingAnswers): Promise<CompleteOnboardingResult> {
        // 1. Calculate score
        const score = answers.calculateScore();

        // 2. Persist to repository
        await this.userRepo.completeOnboarding(userId, {
            answers: answers.toJSON() as any,
            score
        });

        return {
            score,
            success: true
        };
    }
}

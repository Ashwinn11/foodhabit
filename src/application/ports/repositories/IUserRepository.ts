/**
 * IUserRepository
 * Port for user data access
 */
import { User } from '../../../domain';

export interface OnboardingData {
    answers: Record<string, unknown>;
    score: number;
}

export interface IUserRepository {
    /**
     * Find a user by ID
     */
    findById(userId: string): Promise<User | null>;

    /**
     * Save or update user profile
     */
    upsert(user: User & { id: string }): Promise<void>;

    /**
     * Update user name
     */
    updateName(userId: string, name: string): Promise<void>;

    /**
     * Check if onboarding is complete
     */
    isOnboardingComplete(userId: string): Promise<boolean>;

    /**
     * Mark onboarding as complete
     */
    completeOnboarding(userId: string, data: OnboardingData): Promise<void>;

    /**
     * Get onboarding data
     */
    getOnboardingData(userId: string): Promise<OnboardingData | null>;
}

/**
 * Onboarding Answers Value Object
 * Represents the answers provided during the onboarding quiz
 */
export interface OnboardingAnswersProps {
    selectedGoal?: string;
    stoolConsistency?: number; // 0-4
    symptomFrequency?: number; // 0-2
    bowelRegularity?: number;  // 0-2
    medicalFlags?: boolean;
    userCondition?: string;
}

export class OnboardingAnswers {
    private constructor(private readonly props: OnboardingAnswersProps) {
        Object.freeze(this.props);
    }

    static create(props: OnboardingAnswersProps): OnboardingAnswers {
        return new OnboardingAnswers(props);
    }

    get selectedGoal(): string | undefined { return this.props.selectedGoal; }
    get stoolConsistency(): number | undefined { return this.props.stoolConsistency; }
    get symptomFrequency(): number | undefined { return this.props.symptomFrequency; }
    get bowelRegularity(): number | undefined { return this.props.bowelRegularity; }
    get medicalFlags(): boolean | undefined { return this.props.medicalFlags; }
    get userCondition(): string | undefined { return this.props.userCondition; }

    /**
     * Calculate health score based on answers
     */
    calculateScore(): number {
        let totalScore = 100;

        // 1. Consistency Penalties
        const consistencyPenalties = [25, 10, 0, 15, 30];
        totalScore -= consistencyPenalties[this.props.stoolConsistency ?? 2] || 15;

        // 2. Frequency Penalties
        const frequencyPenalties = [0, 15, 30];
        totalScore -= frequencyPenalties[this.props.symptomFrequency ?? 1] || 15;

        // 3. Regularity Penalties
        const regularityPenalties = [0, 10, 20];
        totalScore -= regularityPenalties[this.props.bowelRegularity ?? 1] || 10;

        // 4. Medical Flags
        if (this.props.medicalFlags) {
            totalScore -= 60;
            if (this.props.stoolConsistency === 4 || this.props.stoolConsistency === 0) {
                totalScore -= 10;
            }
        }

        return Math.max(5, Math.min(100, totalScore));
    }

    toJSON(): OnboardingAnswersProps {
        return { ...this.props };
    }
}

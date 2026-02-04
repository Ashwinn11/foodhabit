/**
 * Health Score Value Object
 * Represents a gut health score with breakdown and grade
 */

export type HealthGrade = 'Excellent' | 'Good' | 'Fair' | 'Sus' | 'Poor';

export interface HealthScoreBreakdown {
    bristol: number;      // 0-40 points
    symptoms: number;     // 0-30 points
    regularity: number;   // 0-20 points
    medical: number;      // 0-10 points
}

export class HealthScore {
    private constructor(
        private readonly _value: number,
        private readonly _grade: HealthGrade,
        private readonly _breakdown?: HealthScoreBreakdown,
        private readonly _isBaseline: boolean = false,
    ) {
        Object.freeze(this);
    }

    /**
     * Create a HealthScore from calculated components
     */
    static create(value: number, breakdown?: HealthScoreBreakdown): HealthScore {
        const clampedValue = Math.max(0, Math.min(100, Math.round(value)));
        const grade = HealthScore.calculateGrade(clampedValue);
        return new HealthScore(clampedValue, grade, breakdown, false);
    }

    /**
     * Create a HealthScore from baseline (onboarding) score
     */
    static fromBaseline(baselineScore: number): HealthScore {
        const clampedValue = Math.max(0, Math.min(100, Math.round(baselineScore)));
        const grade = HealthScore.calculateGrade(clampedValue);
        return new HealthScore(clampedValue, grade, undefined, true);
    }

    /**
     * Create a blended score from baseline and calculated scores
     */
    static blend(
        calculatedScore: number,
        baselineScore: number,
        logCount: number,
        breakdown?: HealthScoreBreakdown
    ): HealthScore {
        // Weight shifts from baseline to calculated as data accumulates
        // 0 logs: 100% baseline (handled by fromBaseline)
        // 1-2 logs: 70% baseline, 30% calculated
        // 3-4 logs: 50% baseline, 50% calculated
        // 5-6 logs: 30% baseline, 70% calculated
        // 7+ logs: 10% baseline, 90% calculated
        let baselineWeight: number;

        if (logCount === 0) {
            return HealthScore.fromBaseline(baselineScore);
        } else if (logCount <= 2) {
            baselineWeight = 0.7;
        } else if (logCount <= 4) {
            baselineWeight = 0.5;
        } else if (logCount <= 6) {
            baselineWeight = 0.3;
        } else {
            baselineWeight = 0.1;
        }

        const blendedValue = (baselineScore * baselineWeight) + (calculatedScore * (1 - baselineWeight));
        return HealthScore.create(blendedValue, breakdown);
    }

    private static calculateGrade(score: number): HealthGrade {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Good';
        if (score >= 70) return 'Fair';
        if (score >= 50) return 'Sus';
        return 'Poor';
    }

    get value(): number {
        return this._value;
    }

    get grade(): HealthGrade {
        return this._grade;
    }

    get breakdown(): HealthScoreBreakdown | undefined {
        return this._breakdown;
    }

    get isBaseline(): boolean {
        return this._isBaseline;
    }

    /**
     * Check if score is in a healthy range
     */
    get isHealthy(): boolean {
        return this._value >= 70;
    }

    /**
     * Get color representation for UI
     */
    getColor(): string {
        switch (this._grade) {
            case 'Excellent': return '#22c55e'; // green (Thriving)
            case 'Good': return '#84cc16';      // lime (Vibing)
            case 'Fair': return '#D97706';      // darker amber
            case 'Sus': return '#EA580C';       // darker orange
            case 'Poor': return '#ef4444';      // red (SOS)
        }
    }

    /**
     * Get emoji representation
     */
    getEmoji(): string {
        switch (this._grade) {
            case 'Excellent': return '🌟';
            case 'Good': return '✨';
            case 'Fair': return '😐';
            case 'Sus': return '👀';
            case 'Poor': return '🆘';
        }
    }

    equals(other: HealthScore): boolean {
        return this._value === other._value && this._grade === other._grade;
    }

    toString(): string {
        return `${this._value}/100 (${this._grade})`;
    }

    toJSON(): { score: number; grade: HealthGrade; breakdown?: HealthScoreBreakdown } {
        return {
            score: this._value,
            grade: this._grade,
            breakdown: this._breakdown,
        };
    }
}

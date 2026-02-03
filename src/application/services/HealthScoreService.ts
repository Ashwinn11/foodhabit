/**
 * HealthScoreService
 * Calculates gut health score based on various health indicators
 */
import { GutMoment, HealthScore, HealthScoreBreakdown } from '../../domain';

export interface HealthScoreInput {
    moments: GutMoment[];
    baselineScore: number;
}

export class HealthScoreService {
    private static readonly BRISTOL_MAX_POINTS = 40;
    private static readonly SYMPTOM_MAX_POINTS = 30;
    private static readonly REGULARITY_MAX_POINTS = 20;
    private static readonly MEDICAL_MAX_POINTS = 10;

    /**
     * Calculate the gut health score
     */
    calculateScore(input: HealthScoreInput): HealthScore {
        const { moments, baselineScore } = input;

        // Get last 7 days of data
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentMoments = moments.filter(m =>
            m.timestamp >= sevenDaysAgo
        );

        // If no recent data, return baseline score from onboarding
        if (recentMoments.length === 0) {
            return HealthScore.fromBaseline(baselineScore);
        }

        // Calculate component scores
        const bristolScore = this.calculateBristolScore(recentMoments);
        const symptomScore = this.calculateSymptomScore(recentMoments);
        const regularityScore = this.calculateRegularityScore(recentMoments);
        const medicalScore = this.calculateMedicalScore(recentMoments);

        const calculatedScore = bristolScore + symptomScore + regularityScore + medicalScore;

        const breakdown: HealthScoreBreakdown = {
            bristol: Math.round(bristolScore),
            symptoms: symptomScore,
            regularity: regularityScore,
            medical: medicalScore,
        };

        // Use blended scoring
        return HealthScore.blend(
            calculatedScore,
            baselineScore,
            recentMoments.length,
            breakdown
        );
    }

    /**
     * Calculate Bristol scale score (40 points max)
     * Based on stool consistency - ideal is Type 3-4
     */
    private calculateBristolScore(moments: GutMoment[]): number {
        const momentsWithBristol = moments.filter(m => m.bristolType);

        if (momentsWithBristol.length === 0) {
            return HealthScoreService.BRISTOL_MAX_POINTS * 0.5; // Default 50%
        }

        const totalScore = momentsWithBristol.reduce((sum, m) => {
            return sum + m.bristolType!.getHealthScoreContribution(HealthScoreService.BRISTOL_MAX_POINTS);
        }, 0);

        return totalScore / momentsWithBristol.length;
    }

    /**
     * Calculate symptom frequency score (30 points max)
     * Lower symptom frequency = higher score
     */
    private calculateSymptomScore(moments: GutMoment[]): number {
        const symptomCount = moments.filter(m => m.hasSymptoms).length;

        if (symptomCount === 0) return HealthScoreService.SYMPTOM_MAX_POINTS;
        if (symptomCount <= 2) return 20;
        if (symptomCount <= 4) return 10;
        return 0;
    }

    /**
     * Calculate regularity score (20 points max)
     * Ideal is 1-3 bowel movements per day
     */
    private calculateRegularityScore(moments: GutMoment[]): number {
        const avgPerDay = moments.length / 7;

        if (avgPerDay >= 1 && avgPerDay <= 3) {
            return HealthScoreService.REGULARITY_MAX_POINTS; // Ideal
        }
        if (avgPerDay >= 0.5) {
            return 15; // Every 2 days
        }
        return 5; // Less frequent
    }

    /**
     * Calculate medical flags score (10 points max)
     * Presence of blood or mucus = 0 points
     */
    private calculateMedicalScore(moments: GutMoment[]): number {
        const hasRedFlags = moments.some(m => m.hasRedFlags);
        return hasRedFlags ? 0 : HealthScoreService.MEDICAL_MAX_POINTS;
    }

    /**
     * Get score breakdown for display
     */
    getScoreBreakdownLabels(): Record<keyof HealthScoreBreakdown, { label: string; maxPoints: number }> {
        return {
            bristol: { label: 'Stool Consistency', maxPoints: HealthScoreService.BRISTOL_MAX_POINTS },
            symptoms: { label: 'Symptom Frequency', maxPoints: HealthScoreService.SYMPTOM_MAX_POINTS },
            regularity: { label: 'Regularity', maxPoints: HealthScoreService.REGULARITY_MAX_POINTS },
            medical: { label: 'Medical Flags', maxPoints: HealthScoreService.MEDICAL_MAX_POINTS },
        };
    }
}

/**
 * HealthScoreService
 * Calculates gut health score based on various health indicators
 */
import { GutMoment, HealthScore, HealthScoreBreakdown, SymptomLog } from '../../domain';

export interface HealthScoreInput {
    moments: GutMoment[];
    symptomLogs?: SymptomLog[];
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
        const { moments, symptomLogs = [], baselineScore } = input;

        // Get last 7 days of data
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentMoments = moments.filter(m => m.timestamp >= sevenDaysAgo);
        const recentSymptomLogs = symptomLogs.filter(s => s.timestamp >= sevenDaysAgo);

        // If no recent data, return baseline score from onboarding
        if (recentMoments.length === 0 && recentSymptomLogs.length === 0) {
            return HealthScore.fromBaseline(baselineScore);
        }

        // --- Reductive System (Clinical Penalties) ---
        let calculatedScore = 100;

        // 1. Bristol Scale Penalties (40 points max impact)
        const bristolMoments = recentMoments.filter(m => m.bristolType);
        const bristolPenalties = bristolMoments.map(m => {
            const type = m.bristolType!.getValue();
            if (type === 3 || type === 4) return 0;   // Ideal
            if (type === 2 || type === 5) return 10;  // Acceptable
            return 30; // Concerning (1, 6, 7)
        });

        const avgBristolPenalty = bristolPenalties.length > 0
            ? (bristolPenalties as number[]).reduce((a, b) => a + b, 0) / bristolPenalties.length
            : 0; // Don't penalize poops if none tracked yet

        calculatedScore -= avgBristolPenalty;

        // 2. Symptom Frequency Penalties (30 points max impact)
        // Count symptoms from both stool logs and dedicated symptom logs
        const momentsWithSymptoms = recentMoments.filter(m => m.hasSymptoms).length;
        const totalSymptomEvents = momentsWithSymptoms + recentSymptomLogs.length;

        let symptomPenalty = 0;
        if (totalSymptomEvents === 0) symptomPenalty = 0;
        else if (totalSymptomEvents <= 2) symptomPenalty = 10;
        else if (totalSymptomEvents <= 4) symptomPenalty = 20;
        else symptomPenalty = 30;

        calculatedScore -= symptomPenalty;

        // 3. Regularity Penalties (20 points max impact)
        // SMART LOGIC: Don't penalize for an "empty week" if the user is active TODAY
        // This prevents the "Sudden Drop" from 92 to 72 when the 7-day window shifts.
        const logCount = recentMoments.length;
        let regularityPenalty = 0;

        if (logCount >= 4) {
            regularityPenalty = 0; // Solid consistency
        } else if (logCount >= 2) {
            regularityPenalty = 5; // Good enough for early logs
        } else if (logCount === 1) {
            // Check if this log is very recent (within 24h)
            const hoursSinceLog = (Date.now() - recentMoments[0].timestamp.getTime()) / (1000 * 60 * 60);
            regularityPenalty = hoursSinceLog < 24 ? 5 : 15; // Give grace to a fresh log
        } else {
            regularityPenalty = 20; // Sparse
        }

        calculatedScore -= regularityPenalty;

        // 4. THE RED FLAG (Medical Penalties)
        const hasRedFlags = recentMoments.some(m => m.hasRedFlags);
        if (hasRedFlags) {
            calculatedScore -= 60; // Major health penalty
        }

        // Final Floor/Ceiling
        calculatedScore = Math.max(5, Math.min(100, calculatedScore));

        const breakdown: HealthScoreBreakdown = {
            bristol: Math.round(40 - avgBristolPenalty),
            symptoms: Math.round(30 - symptomPenalty),
            regularity: Math.round(20 - regularityPenalty),
            medical: hasRedFlags ? 0 : 10,
        };

        // Use blended scoring
        return HealthScore.blend(
            calculatedScore,
            baselineScore,
            logCount + recentSymptomLogs.length,
            breakdown
        );
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

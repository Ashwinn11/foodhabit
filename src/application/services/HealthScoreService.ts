/**
 * HealthScoreService
 * Calculates gut health score based on various health indicators
 */
import { GutMoment, HealthScore, HealthScoreBreakdown, SymptomLog } from '../../domain';

export interface HealthScoreInput {
    moments: GutMoment[];
    symptomLogs?: SymptomLog[];
    baselineScore: number;
    baselineRegularity?: number; // 0=Regular (1-3x/day), 1=Somewhat (1x/day or every other), 2=Unpredictable
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
        const { moments, symptomLogs = [], baselineScore, baselineRegularity = 1 } = input;

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
        // Measures ACTUAL bowel movement frequency, not logging frequency
        // Compares recent 7-day pattern to user's baseline regularity
        let regularityPenalty = this.calculateRegularityPenalty(recentMoments, baselineRegularity);
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

        // Use blended scoring (based on number of actual bowel movements, not logs)
        return HealthScore.blend(
            calculatedScore,
            baselineScore,
            recentMoments.length + recentSymptomLogs.length,
            breakdown
        );
    }

    /**
     * Calculate regularity penalty based on actual bowel movement frequency
     * Compares user's recent pattern to their baseline regularity
     *
     * baselineRegularity:
     * 0 = Regular (1-3x daily expected)
     * 1 = Somewhat regular (1x daily or every other day expected)
     * 2 = Unpredictable (no clear pattern expected)
     */
    private calculateRegularityPenalty(moments: GutMoment[], baselineRegularity: number): number {
        if (moments.length === 0) {
            // No data yet - not enough to assess regularity
            return 0;
        }

        // Calculate actual bowel movements per day over last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Build a map of days to bowel movement count
        const dayMap = new Map<string, number>();
        moments.forEach(m => {
            const day = new Date(m.timestamp);
            day.setHours(0, 0, 0, 0);
            const dayKey = day.toISOString();
            dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + 1);
        });

        const totalBMs = moments.length;
        const daysWithBMs = dayMap.size;
        const avgBMsPerDay = totalBMs / 7; // Average over full 7-day period
        const daysWithoutBMs = 7 - daysWithBMs;

        let penalty = 0;

        if (baselineRegularity === 0) {
            // User expects 1-3x daily (regular)
            // Penalty for days with 0 BMs (constipation) or 4+ BMs (diarrhea)

            const daysWithZero = daysWithoutBMs;
            const daysWithMany = Array.from(dayMap.values()).filter(count => count >= 4).length;

            penalty += daysWithZero * 2; // -2 per day without BM
            penalty += daysWithMany * 1; // -1 per day with excess BMs
            penalty = Math.min(20, penalty); // Cap at 20 points

        } else if (baselineRegularity === 1) {
            // User expects 1x daily or every other day (somewhat regular)
            // Penalty for 3+ consecutive days without BM or 4+ BMs in one day

            const daysWithoutBMs = 7 - daysWithBMs;
            const daysWithMany = Array.from(dayMap.values()).filter(count => count >= 4).length;

            if (daysWithoutBMs >= 3) {
                penalty += 12; // Significant constipation
            } else if (daysWithoutBMs >= 2) {
                penalty += 6; // Mild constipation
            }

            penalty += daysWithMany * 2; // -2 per day with excess BMs
            penalty = Math.min(20, penalty); // Cap at 20 points

        } else {
            // baselineRegularity === 2 (unpredictable)
            // Only penalize for extreme deviations
            // More lenient since user's baseline is variable

            const avgExpected = 1.5; // Expect around 1-2 per day as average
            const deviation = Math.abs(avgBMsPerDay - avgExpected);

            if (deviation > 2) {
                penalty += 12; // Major deviation
            } else if (deviation > 1) {
                penalty += 6; // Moderate deviation
            }

            penalty = Math.min(20, penalty); // Cap at 20 points
        }

        return penalty;
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

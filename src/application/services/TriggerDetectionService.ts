/**
 * TriggerDetectionService
 * Detects food triggers based on meal and symptom correlations
 */
import { GutMoment, Meal, Trigger, CombinationTrigger, TriggerFeedback, TriggerProps } from '../../domain';
import { IFODMAPService, FODMAPInfo } from '../ports/services/IFODMAPService';

export interface FoodStatistics {
    total: number;
    symptomCount: number;
    weightedSymptomScore: number;
    latencies: number[];
    associatedSymptoms: Set<string>;
}

export interface TriggerDetectionInput {
    moments: GutMoment[];
    meals: Meal[];
    feedback: TriggerFeedback[];
}

export class TriggerDetectionService {
    private readonly SYMPTOM_WINDOW_MIN_HOURS = 2;
    private readonly SYMPTOM_WINDOW_MAX_HOURS = 24;
    private readonly PEAK_WINDOW_MAX_HOURS = 8;
    private readonly PEAK_WEIGHT = 1.5;
    private readonly MIN_OCCURRENCES = 3;
    private readonly MIN_SYMPTOM_OCCURRENCES = 2;

    constructor(private readonly fodmapService?: IFODMAPService) { }

    /**
     * Detect potential food triggers with enhanced analysis
     */
    async detectTriggers(input: TriggerDetectionInput): Promise<Trigger[]> {
        const { moments, meals, feedback } = input;
        const foodStats = this.buildFoodStatistics(moments, meals);

        const triggers = await Promise.all(
            Object.entries(foodStats)
                .map(([food, stats]) => this.createTrigger(food, stats, feedback))
        );

        return triggers
            .filter(t => t !== null)
            .filter(trigger =>
                trigger!.occurrences >= this.MIN_OCCURRENCES &&
                trigger!.symptomOccurrences >= this.MIN_SYMPTOM_OCCURRENCES
            )
            .sort((a, b) => {
                const aProb = a!.symptomOccurrences / a!.occurrences;
                const bProb = b!.symptomOccurrences / b!.occurrences;
                return bProb - aProb;
            })
            .slice(0, 5) as Trigger[];
    }

    /**
     * Detect combination triggers (when two foods together cause issues)
     */
    detectCombinationTriggers(moments: GutMoment[], meals: Meal[]): CombinationTrigger[] {
        const comboStats = this.buildCombinationStatistics(moments, meals);

        return Object.values(comboStats)
            .filter(stats =>
                stats.total >= this.MIN_OCCURRENCES &&
                stats.symptomOccurrences >= this.MIN_SYMPTOM_OCCURRENCES
            )
            .map(stats => CombinationTrigger.create({
                foods: stats.foods,
                occurrences: stats.total,
                symptomOccurrences: stats.symptomOccurrences,
            }))
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 3);
    }

    /**
     * Get simple potential triggers (legacy format)
     */
    getPotentialTriggers(moments: GutMoment[], meals: Meal[]): Array<{
        food: string;
        count: number;
        probability: number;
        symptoms: string[];
        frequencyText: string;
    }> {
        const foodStats = this.buildFoodStatisticsSimple(moments, meals);

        return Object.entries(foodStats)
            .map(([food, stats]) => ({
                food: food.charAt(0).toUpperCase() + food.slice(1),
                count: stats.total,
                probability: stats.total > 0 ? stats.weightedSymptomScore / stats.total : 0,
                symptoms: Array.from(stats.associatedSymptoms),
                frequencyText: `${stats.symptomCount} out of ${stats.total} times`,
            }))
            .filter(item => item.count >= 2 && item.probability > 0.1)
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 5);
    }

    /**
     * Build statistics for each food item
     */
    private buildFoodStatistics(
        moments: GutMoment[],
        meals: Meal[]
    ): Record<string, FoodStatistics> {
        const foodStats: Record<string, FoodStatistics> = {};

        meals.forEach(meal => {

            // Find symptomatic moments within the symptom window
            const symptomWindows = moments.filter(moment => {
                const diffHours = moment.getHoursDifference(meal.timestamp);
                const isSymptomatic = moment.hasSymptoms || moment.isUnhealthyStool || moment.hasRedFlags;
                return isSymptomatic && diffHours >= this.SYMPTOM_WINDOW_MIN_HOURS && diffHours <= this.SYMPTOM_WINDOW_MAX_HOURS;
            });

            // Use normalized foods if available
            const foodsToAnalyze = meal.foodsForAnalysis;

            foodsToAnalyze.forEach(food => {
                const normalizedFood = food.toLowerCase().trim();
                if (!foodStats[normalizedFood]) {
                    foodStats[normalizedFood] = {
                        total: 0,
                        symptomCount: 0,
                        weightedSymptomScore: 0,
                        latencies: [],
                        associatedSymptoms: new Set(),
                    };
                }

                foodStats[normalizedFood].total++;

                if (symptomWindows.length > 0) {
                    foodStats[normalizedFood].symptomCount++;

                    symptomWindows.forEach(moment => {
                        const diffHours = moment.getHoursDifference(meal.timestamp);

                        // Peak risk window (2-8h) gets higher weight
                        const weight = diffHours <= this.PEAK_WINDOW_MAX_HOURS ? this.PEAK_WEIGHT : 1.0;
                        foodStats[normalizedFood].weightedSymptomScore += weight;
                        foodStats[normalizedFood].latencies.push(diffHours);

                        // Record symptoms
                        this.recordSymptoms(moment, foodStats[normalizedFood].associatedSymptoms);
                    });
                }
            });
        });

        return foodStats;
    }

    /**
     * Build simplified statistics (for legacy format)
     */
    private buildFoodStatisticsSimple(
        moments: GutMoment[],
        meals: Meal[]
    ): Record<string, { total: number; symptomCount: number; weightedSymptomScore: number; associatedSymptoms: Set<string> }> {
        const stats = this.buildFoodStatistics(moments, meals);
        const simplified: Record<string, { total: number; symptomCount: number; weightedSymptomScore: number; associatedSymptoms: Set<string> }> = {};

        for (const [food, data] of Object.entries(stats)) {
            simplified[food] = {
                total: data.total,
                symptomCount: data.symptomCount,
                weightedSymptomScore: data.weightedSymptomScore,
                associatedSymptoms: data.associatedSymptoms,
            };
        }

        return simplified;
    }

    /**
     * Build statistics for food combinations
     */
    private buildCombinationStatistics(
        moments: GutMoment[],
        meals: Meal[]
    ): Record<string, { foods: string[]; total: number; symptomOccurrences: number }> {
        const comboStats: Record<string, { foods: string[]; total: number; symptomOccurrences: number }> = {};

        meals.forEach(meal => {
            if (meal.foods.length < 2) return;

            // Create combinations of 2 foods
            for (let i = 0; i < meal.foods.length; i++) {
                for (let j = i + 1; j < meal.foods.length; j++) {
                    const foods = [meal.foods[i], meal.foods[j]]
                        .map(f => f.toLowerCase().trim())
                        .sort();
                    const comboKey = foods.join(' + ');

                    if (!comboStats[comboKey]) {
                        comboStats[comboKey] = {
                            foods: foods.map(f => f.charAt(0).toUpperCase() + f.slice(1)),
                            total: 0,
                            symptomOccurrences: 0,
                        };
                    }

                    comboStats[comboKey].total++;

                    const symptomWindows = moments.filter(moment => {
                        const diffHours = moment.getHoursDifference(meal.timestamp);
                        const isSymptomatic = moment.hasSymptoms || moment.isUnhealthyStool;
                        return isSymptomatic && diffHours >= this.SYMPTOM_WINDOW_MIN_HOURS && diffHours <= this.SYMPTOM_WINDOW_MAX_HOURS;
                    });

                    if (symptomWindows.length > 0) {
                        comboStats[comboKey].symptomOccurrences++;
                    }
                }
            }
        });

        return comboStats;
    }

    /**
     * Create a Trigger entity from statistics
     */
    private async createTrigger(
        food: string,
        stats: FoodStatistics,
        feedback: TriggerFeedback[]
    ): Promise<Trigger | null> {
        if (stats.total === 0) return null;

        const userFeedback = feedback.find(f => f.foodName.toLowerCase() === food.toLowerCase());

        // Get FODMAP info from AI
        let fodmapInfo: FODMAPInfo | undefined;
        let alternatives: string[] | undefined;

        if (this.fodmapService) {
            // Use AI analysis through the service if available
            const aiResult = await this.fodmapService.analyzeFoodWithAI(food);
            if (aiResult && aiResult.level !== 'low') {
                fodmapInfo = {
                    level: aiResult.level,
                    categories: aiResult.categories,
                };
            }
            alternatives = this.fodmapService.getLowFODMAPAlternatives(food);
        }

        const avgLatency = stats.latencies.length > 0
            ? stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length
            : 0;

        const props: TriggerProps = {
            food,
            occurrences: stats.total,
            symptomOccurrences: stats.symptomCount,
            avgLatencyHours: Math.round(avgLatency * 10) / 10,
            symptoms: Array.from(stats.associatedSymptoms),
            userFeedback: userFeedback?.userConfirmed ?? null,
            fodmapIssues: fodmapInfo ? {
                level: fodmapInfo.level,
                categories: fodmapInfo.categories,
            } : undefined,
            alternatives: alternatives && alternatives.length > 0 ? alternatives : undefined,
        };

        return Trigger.create(props);
    }

    /**
     * Record symptoms from a gut moment
     */
    private recordSymptoms(moment: GutMoment, symptoms: Set<string>): void {
        // Manual symptoms
        if (moment.symptoms.bloating) symptoms.add('bloating');
        if (moment.symptoms.gas) symptoms.add('gas');
        if (moment.symptoms.cramping) symptoms.add('cramping');
        if (moment.symptoms.nausea) symptoms.add('nausea');

        // Bristol-based symptoms
        if (moment.isConstipated) symptoms.add('constipation');
        if (moment.isDiarrhea) symptoms.add('diarrhea');

        // Medical tags
        if (moment.tags.includes('blood')) symptoms.add('blood in stool');
        if (moment.tags.includes('mucus')) symptoms.add('mucus in stool');
    }
}

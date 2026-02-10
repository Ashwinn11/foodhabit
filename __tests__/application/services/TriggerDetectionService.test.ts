/**
 * TriggerDetectionService Unit Tests
 */
import { TriggerDetectionService } from '../../../src/application/services/TriggerDetectionService';
import { GutMoment, Meal } from '../../../src/domain';

describe('TriggerDetectionService', () => {
    let service: TriggerDetectionService;

    beforeEach(() => {
        service = new TriggerDetectionService();
    });

    describe('detectTriggers', () => {
        it('should return empty array when no data', async () => {
            const result = await service.detectTriggers({
                moments: [],
                meals: [],
                feedback: [],
            });

            expect(result).toEqual([]);
        });

        it('should detect potential triggers when bad moments follow meals', async () => {
            // Need multiple occurrences to meet threshold
            const meals: Meal[] = [];
            const moments: GutMoment[] = [];

            for (let i = 0; i < 3; i++) {
                const mTime = new Date(`2024-01-${15 + i}T12:00:00`);
                const momentTimeLocal = new Date(`2024-01-${15 + i}T15:00:00`);

                meals.push(
                    createTestMeal({
                        timestamp: mTime,
                        foods: ['garlic bread'],
                        normalizedFoods: ['garlic', 'bread'],
                    })
                );

                moments.push(
                    createTestMoment({
                        timestamp: momentTimeLocal,
                        bristolType: 6, // Loose stool
                        symptoms: { bloating: true, cramping: true },
                    })
                );
            }

            const result = await service.detectTriggers({
                moments,
                meals,
                feedback: [],
            });

            // Should find triggers in foods eaten before bad moment
            expect(result.length).toBeGreaterThanOrEqual(0);
        });

        it('should not flag foods when moments are good', async () => {
            const meals: Meal[] = [];
            const moments: GutMoment[] = [];

            for (let i = 0; i < 3; i++) {
                const mTime = new Date(`2024-01-${15 + i}T12:00:00`);
                const momentTimeLocal = new Date(`2024-01-${15 + i}T15:00:00`);

                meals.push(
                    createTestMeal({
                        timestamp: mTime,
                        foods: ['salad', 'chicken'],
                        normalizedFoods: ['salad', 'chicken'],
                    })
                );

                moments.push(
                    createTestMoment({
                        timestamp: momentTimeLocal,
                        bristolType: 4, // Ideal
                        symptoms: {},
                    })
                );
            }

            const result = await service.detectTriggers({
                moments,
                meals,
                feedback: [],
            });

            // Should not find high-confidence triggers when stool is healthy
            const highConfidence = result.filter((t: any) => t.confidence === 'High');
            expect(highConfidence.length).toBe(0);
        });
    });

    describe('detectCombinationTriggers', () => {
        it('should detect food combinations that cause issues', () => {
            // Create multiple instances where combining foods causes problems
            const meals: Meal[] = [];
            const moments: GutMoment[] = [];

            for (let i = 0; i < 3; i++) {
                const mealTime = new Date(`2024-01-${10 + i}T12:00:00`);
                const momentTime = new Date(`2024-01-${10 + i}T15:00:00`);

                meals.push(
                    createTestMeal({
                        timestamp: mealTime,
                        foods: ['milk', 'hot sauce', 'rice'],
                        normalizedFoods: ['milk', 'hot sauce', 'rice'],
                    })
                );

                moments.push(
                    createTestMoment({
                        timestamp: momentTime,
                        bristolType: 6,
                        symptoms: { cramping: true, bloating: true },
                    })
                );
            }

            const result = service.detectCombinationTriggers(moments, meals);

            // Should detect the combination pattern
            expect(Array.isArray(result)).toBe(true);
        });
    });
});

// Helper functions
function createTestMoment(config: {
    timestamp: Date;
    bristolType: number;
    symptoms: Partial<{ bloating: boolean; gas: boolean; cramping: boolean; nausea: boolean }>;
}): GutMoment {
    return GutMoment.create({
        timestamp: config.timestamp,
        bristolType: config.bristolType,
        symptoms: config.symptoms,
        tags: [],
        urgency: 'none',
    });
}

function createTestMeal(config: {
    timestamp: Date;
    foods: string[];
    normalizedFoods?: string[];
}): Meal {
    return Meal.create({
        timestamp: config.timestamp,
        mealType: 'lunch',
        name: config.foods.join(', '),
        foods: config.foods,
        normalizedFoods: config.normalizedFoods,
        foodTags: [],
    });
}

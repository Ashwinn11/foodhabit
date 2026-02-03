/**
 * HealthScoreService Unit Tests
 */
import { HealthScoreService } from '../../../src/application/services/HealthScoreService';
import { GutMoment } from '../../../src/domain';

describe('HealthScoreService', () => {
    let service: HealthScoreService;

    beforeEach(() => {
        service = new HealthScoreService();
    });

    describe('calculateScore', () => {
        it('should return baseline score when no moments provided', () => {
            const result = service.calculateScore({ moments: [], baselineScore: 70 });

            expect(result.value).toBe(70);
            expect(result.grade).toBe('Good');
        });

        it('should calculate score based on recent moments', () => {
            const moments = createTestMoments([
                { bristolType: 4, symptoms: {} }, // Ideal
                { bristolType: 4, symptoms: {} }, // Ideal
                { bristolType: 3, symptoms: {} }, // Good
            ]);

            const result = service.calculateScore({ moments, baselineScore: 70 });

            // With mostly ideal types, score should be reasonable
            expect(result.value).toBeGreaterThanOrEqual(0);
            expect(result.value).toBeLessThanOrEqual(100);
        });

        it('should penalize extreme bristol types', () => {
            const extremeMoments = createTestMoments([
                { bristolType: 1, symptoms: {} }, // Very constipated
                { bristolType: 7, symptoms: {} }, // Diarrhea
            ]);

            const idealMoments = createTestMoments([
                { bristolType: 4, symptoms: {} },
                { bristolType: 4, symptoms: {} },
            ]);

            const extremeResult = service.calculateScore({ moments: extremeMoments, baselineScore: 70 });
            const idealResult = service.calculateScore({ moments: idealMoments, baselineScore: 70 });

            expect(extremeResult.value).toBeLessThan(idealResult.value);
        });

        it('should penalize symptoms', () => {
            const withSymptoms = createTestMoments([
                { bristolType: 4, symptoms: { bloating: true, gas: true } },
            ]);

            const noSymptoms = createTestMoments([
                { bristolType: 4, symptoms: {} },
            ]);

            const symptomsResult = service.calculateScore({ moments: withSymptoms, baselineScore: 70 });
            const noSymptomsResult = service.calculateScore({ moments: noSymptoms, baselineScore: 70 });

            expect(symptomsResult.value).toBeLessThanOrEqual(noSymptomsResult.value);
        });

        it('should return correct grade for different scores', () => {
            // Test grade calculation by manipulating baseline
            const excellent = service.calculateScore({ moments: [], baselineScore: 90 });
            const good = service.calculateScore({ moments: [], baselineScore: 75 });
            const fair = service.calculateScore({ moments: [], baselineScore: 55 });
            const poor = service.calculateScore({ moments: [], baselineScore: 35 });

            expect(excellent.grade).toBe('Excellent');
            expect(good.grade).toBe('Good');
            expect(fair.grade).toBe('Fair');
            expect(poor.grade).toBe('Poor');
        });

        it('should clamp score between 0 and 100', () => {
            // Very high baseline
            const high = service.calculateScore({ moments: [], baselineScore: 150 });
            expect(high.value).toBeLessThanOrEqual(100);

            // Very low baseline with penalties
            const badMoments = createTestMoments([
                { bristolType: 1, symptoms: { bloating: true, gas: true, cramping: true, nausea: true } },
                { bristolType: 7, symptoms: { bloating: true, gas: true, cramping: true, nausea: true } },
            ]);
            const low = service.calculateScore({ moments: badMoments, baselineScore: 10 });
            expect(low.value).toBeGreaterThanOrEqual(0);
        });
    });
});

// Helper function to create test moments
function createTestMoments(configs: { bristolType: number; symptoms: Partial<{ bloating: boolean; gas: boolean; cramping: boolean; nausea: boolean }> }[]): GutMoment[] {
    return configs.map((config, index) =>
        GutMoment.create({
            timestamp: new Date(Date.now() - index * 3600000), // 1 hour apart
            bristolType: config.bristolType,
            symptoms: config.symptoms,
            tags: [],
            urgency: 'none',
        })
    );
}

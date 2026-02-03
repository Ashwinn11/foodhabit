/**
 * StreakService Unit Tests
 */
import { StreakService } from '../../../src/application/services/StreakService';
import { GutMoment } from '../../../src/domain';

describe('StreakService', () => {
    let service: StreakService;

    beforeEach(() => {
        service = new StreakService();
    });

    describe('calculateCurrentStreak', () => {
        it('should return 0 for empty moments array', () => {
            const result = service.calculateCurrentStreak([]);
            expect(result).toBe(0);
        });

        it('should return 1 for single moment today', () => {
            const moments = [createMomentOnDate(new Date())];
            const result = service.calculateCurrentStreak(moments);
            expect(result).toBe(1);
        });

        it('should count consecutive days correctly', () => {
            const moments = [
                createMomentOnDate(daysAgo(0)), // Today
                createMomentOnDate(daysAgo(1)), // Yesterday
                createMomentOnDate(daysAgo(2)), // 2 days ago
            ];

            const result = service.calculateCurrentStreak(moments);
            expect(result).toBe(3);
        });

        it('should break streak on missed day', () => {
            const moments = [
                createMomentOnDate(daysAgo(0)), // Today
                createMomentOnDate(daysAgo(1)), // Yesterday
                // Day 2 missing
                createMomentOnDate(daysAgo(3)), // 3 days ago
                createMomentOnDate(daysAgo(4)), // 4 days ago
            ];

            const result = service.calculateCurrentStreak(moments);
            // Should only count today and yesterday
            expect(result).toBe(2);
        });

        it('should count multiple moments on same day as 1', () => {
            const today = new Date();
            const moments = [
                createMomentOnDate(today),
                createMomentOnDate(today),
                createMomentOnDate(today),
            ];

            const result = service.calculateCurrentStreak(moments);
            expect(result).toBe(1);
        });

        it('should handle long streaks', () => {
            const moments = Array.from({ length: 30 }, (_, i) =>
                createMomentOnDate(daysAgo(i))
            );

            const result = service.calculateCurrentStreak(moments);
            expect(result).toBe(30);
        });

        it('should sort moments correctly regardless of input order', () => {
            const moments = [
                createMomentOnDate(daysAgo(2)),
                createMomentOnDate(daysAgo(0)), // Today
                createMomentOnDate(daysAgo(1)),
            ];

            const result = service.calculateCurrentStreak(moments);
            expect(result).toBe(3);
        });
    });

    describe('calculateLongestStreak', () => {
        it('should return 0 for empty array', () => {
            const result = service.calculateLongestStreak([]);
            expect(result).toBe(0);
        });

        it('should find longest streak in history', () => {
            const moments = [
                // Current streak: 2 days
                createMomentOnDate(daysAgo(0)),
                createMomentOnDate(daysAgo(1)),
                // Gap of 1 day
                // Past streak: 5 days
                createMomentOnDate(daysAgo(3)),
                createMomentOnDate(daysAgo(4)),
                createMomentOnDate(daysAgo(5)),
                createMomentOnDate(daysAgo(6)),
                createMomentOnDate(daysAgo(7)),
            ];

            const result = service.calculateLongestStreak(moments);
            expect(result).toBe(5);
        });
    });

    describe('getStreakResult', () => {
        it('should return complete streak result', () => {
            const moments = [
                createMomentOnDate(daysAgo(0)),
                createMomentOnDate(daysAgo(1)),
                createMomentOnDate(daysAgo(2)),
            ];

            const result = service.getStreakResult(moments);

            expect(result.currentStreak).toBe(3);
            expect(result.longestStreak).toBeGreaterThanOrEqual(3);
            expect(result.streakEmoji).toBeDefined();
        });
    });

    describe('getStreakEmoji', () => {
        it('should return correct emoji for different streak lengths', () => {
            expect(service.getStreakEmoji(30)).toBe('🏆');
            expect(service.getStreakEmoji(14)).toBe('🔥');
            expect(service.getStreakEmoji(7)).toBe('⭐');
            expect(service.getStreakEmoji(3)).toBe('✨');
            expect(service.getStreakEmoji(1)).toBe('💪');
        });
    });

    describe('getStreakMessage', () => {
        it('should return correct message for different streak lengths', () => {
            expect(service.getStreakMessage(30)).toContain('champion');
            expect(service.getStreakMessage(14)).toContain('fire');
            expect(service.getStreakMessage(7)).toContain('week');
            expect(service.getStreakMessage(3)).toContain('Three');
            expect(service.getStreakMessage(0)).toContain('Start');
        });
    });
});

// Helper functions
function createMomentOnDate(date: Date): GutMoment {
    // Set to noon to avoid timezone issues
    const normalizedDate = new Date(date);
    normalizedDate.setHours(12, 0, 0, 0);

    return GutMoment.create({
        timestamp: normalizedDate,
        bristolType: 4,
        symptoms: {},
        tags: [],
        urgency: 'none',
    });
}

function daysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(12, 0, 0, 0);
    return date;
}

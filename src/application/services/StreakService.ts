/**
 * StreakService
 * Calculates user streaks for consecutive logging
 */
import { GutMoment } from '../../domain';

export interface StreakResult {
    currentStreak: number;
    longestStreak: number;
    streakEmoji: string;
}

export class StreakService {
    private readonly MAX_LOOKBACK_DAYS = 365;

    /**
     * Calculate the current consecutive poop streak
     */
    calculateCurrentStreak(moments: GutMoment[]): number {
        if (moments.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < this.MAX_LOOKBACK_DAYS; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);

            const hasPoopOnDate = moments.some(m => m.isOnDate(checkDate));

            if (hasPoopOnDate) {
                streak++;
            } else if (i > 0) {
                // Allow today to be empty (user might not have pooped yet)
                break;
            }
        }

        return streak;
    }

    /**
     * Calculate the longest streak ever
     */
    calculateLongestStreak(moments: GutMoment[]): number {
        if (moments.length === 0) return 0;

        // Sort moments by date
        const sortedMoments = [...moments].sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        // Get unique dates with poops
        const datesWithPoops = new Set<string>();
        sortedMoments.forEach(m => {
            const dateStr = m.timestamp.toISOString().split('T')[0];
            datesWithPoops.add(dateStr);
        });

        const sortedDates = Array.from(datesWithPoops).sort();
        if (sortedDates.length === 0) return 0;

        let longestStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i - 1]);
            const currDate = new Date(sortedDates[i]);

            // Check if dates are consecutive
            const diffDays = Math.round(
                (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffDays === 1) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return longestStreak;
    }

    /**
     * Get streak emoji based on length
     */
    getStreakEmoji(streak: number): string {
        if (streak >= 30) return '🏆';
        if (streak >= 14) return '🔥';
        if (streak >= 7) return '⭐';
        if (streak >= 3) return '✨';
        return '💪';
    }

    /**
     * Get full streak results
     */
    getStreakResult(moments: GutMoment[]): StreakResult {
        const currentStreak = this.calculateCurrentStreak(moments);
        const longestStreak = this.calculateLongestStreak(moments);
        const streakEmoji = this.getStreakEmoji(currentStreak);

        return {
            currentStreak,
            longestStreak,
            streakEmoji,
        };
    }

    /**
     * Get streak message for display
     */
    getStreakMessage(streak: number): string {
        if (streak >= 30) return "Incredible! You're a gut health champion!";
        if (streak >= 14) return "On fire! Two weeks of consistency!";
        if (streak >= 7) return "One week strong! Keep it up!";
        if (streak >= 3) return "Great start! Three days in a row!";
        if (streak >= 1) return "Good job! Keep the streak going!";
        return "Start logging to build your streak!";
    }
}

/**
 * DailyTaskService
 * Generates personalized daily tasks/missions based on user state
 */
import { GutMoment, Meal, HealthLog, HealthLogType } from '../../domain';

export interface DailyTask {
    id: string;
    title: string;
    subtitle: string;
    completed: boolean;
    type: 'poop' | 'meal' | 'symptom' | 'water' | 'fiber' | 'probiotic' | 'exercise';
}

export interface DailyTaskInput {
    moments: GutMoment[];
    meals: Meal[];
    healthLogs: HealthLog[];
    healthScore: number;
    completedTaskIds: string[];
}

export class DailyTaskService {
    /**
     * Generate dynamic daily tasks based on current state
     */
    generateTasks(input: DailyTaskInput): DailyTask[] {
        const { moments, healthLogs, healthScore, completedTaskIds } = input;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get recent symptoms (last 24 hours)
        const recentMoments = moments.filter(m => {
            const diff = Date.now() - m.timestamp.getTime();
            return diff < 24 * 60 * 60 * 1000;
        });

        const isBloated = recentMoments.some(m => m.symptoms.bloating || m.symptoms.gas);
        const isConstipated = recentMoments.some(m => m.isConstipated);
        const isDiarrhea = recentMoments.some(m => m.isDiarrhea);
        const isLowScore = healthScore < 70;

        const hasPoopToday = recentMoments.some(m => m.isOnDate(today));

        const tasks: DailyTask[] = [];

        // --- PRIORITY 1: RECOVERY MISSIONS ---

        if (isBloated) {
            tasks.push({
                id: 'tea',
                title: 'Drink Peppermint Tea',
                subtitle: 'Soothe that bloat 🍵',
                completed: completedTaskIds.includes('tea'),
                type: 'water',
            });
        }

        if (isConstipated) {
            tasks.push({
                id: 'kiwi',
                title: 'Eat a Kiwi 🥝',
                subtitle: "Nature's laxative",
                completed: completedTaskIds.includes('kiwi'),
                type: 'fiber',
            });
        }

        if (isDiarrhea) {
            tasks.push({
                id: 'brat',
                title: 'Eat Plain Rice/Toast',
                subtitle: 'Go easy on the gut',
                completed: false,
                type: 'meal',
            });
        }

        // --- PRIORITY 2: CORE MAINTENANCE ---

        // Anchor habit: Log poop
        tasks.push({
            id: 'poop',
            title: 'Log Poop',
            subtitle: hasPoopToday ? 'Mission Accomplished!' : 'Track your gut',
            completed: hasPoopToday,
            type: 'poop',
        });

        // Hydration: Only if issues or low score
        if (isConstipated || isDiarrhea || isLowScore) {
            const todayWater = this.getTodayValue(healthLogs, 'water');
            const waterGoal = HealthLog.getGoal('water');

            tasks.push({
                id: 'water',
                title: 'Hydrate (Recovery)',
                subtitle: todayWater >= waterGoal ? 'Hydrated!' : `${todayWater}/${waterGoal} glasses`,
                completed: todayWater >= waterGoal,
                type: 'water',
            });
        }

        // Fiber: Only if constipated or low score
        if (isConstipated || isLowScore) {
            const todayFiber = this.getTodayValue(healthLogs, 'fiber');
            const fiberGoal = HealthLog.getGoal('fiber');

            tasks.push({
                id: 'fiber',
                title: 'Boost Fiber',
                subtitle: todayFiber >= fiberGoal ? 'Fiber Power!' : `${todayFiber}/${fiberGoal}g needed`,
                completed: todayFiber >= fiberGoal,
                type: 'fiber',
            });
        }

        return tasks;
    }

    /**
     * Get today's value for a health log type
     */
    private getTodayValue(logs: HealthLog[], type: HealthLogType): number {
        const todayStr = new Date().toISOString().split('T')[0];
        const log = logs.find(l => l.date === todayStr && l.type === type);
        return log?.value ?? 0;
    }

    /**
     * Get task completion percentage
     */
    getCompletionPercentage(tasks: DailyTask[]): number {
        if (tasks.length === 0) return 0;
        const completed = tasks.filter(t => t.completed).length;
        return Math.round((completed / tasks.length) * 100);
    }

    /**
     * Get encouragement message based on completion
     */
    getEncouragementMessage(completionPercentage: number): string {
        if (completionPercentage === 100) return "Perfect! All missions complete! 🌟";
        if (completionPercentage >= 75) return "Almost there! Keep going! 💪";
        if (completionPercentage >= 50) return "Halfway done! You got this! 🎯";
        if (completionPercentage >= 25) return "Good start! Keep it up! ✨";
        return "Ready to tackle your missions? 🚀";
    }
}

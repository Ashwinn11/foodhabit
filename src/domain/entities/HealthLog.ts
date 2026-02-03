/**
 * HealthLog Entity
 * Represents a daily health tracking log (water, fiber, probiotic, exercise)
 */

export type HealthLogType = 'water' | 'fiber' | 'probiotic' | 'exercise';

export interface HealthLogProps {
    date: string; // YYYY-MM-DD
    type: HealthLogType;
    value: number;
}

export interface CreateHealthLogInput {
    date?: string;
    type: HealthLogType;
    value: number;
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * HealthLog Domain Entity
 */
export class HealthLog {
    private constructor(private readonly props: HealthLogProps) {
        Object.freeze(this.props);
    }

    /**
     * Create a new HealthLog
     */
    static create(input: CreateHealthLogInput): HealthLog {
        return new HealthLog({
            date: input.date ?? getTodayString(),
            type: input.type,
            value: Math.max(0, input.value),
        });
    }

    /**
     * Reconstitute from persistence
     */
    static reconstitute(props: HealthLogProps): HealthLog {
        return new HealthLog(props);
    }

    // === Getters ===

    get date(): string {
        return this.props.date;
    }

    get type(): HealthLogType {
        return this.props.type;
    }

    get value(): number {
        return this.props.value;
    }

    // === Type-specific checks ===

    get isWater(): boolean {
        return this.props.type === 'water';
    }

    get isFiber(): boolean {
        return this.props.type === 'fiber';
    }

    get isProbiotic(): boolean {
        return this.props.type === 'probiotic';
    }

    get isExercise(): boolean {
        return this.props.type === 'exercise';
    }

    // === Goal checks ===

    /**
     * Check if goal is met for this type
     */
    isGoalMet(): boolean {
        return this.props.value >= HealthLog.getGoal(this.props.type);
    }

    /**
     * Get progress percentage towards goal (0-100+)
     */
    getProgress(): number {
        const goal = HealthLog.getGoal(this.props.type);
        return Math.round((this.props.value / goal) * 100);
    }

    /**
     * Get remaining to reach goal
     */
    getRemainingToGoal(): number {
        const goal = HealthLog.getGoal(this.props.type);
        return Math.max(0, goal - this.props.value);
    }

    // === Static goal helpers ===

    static getGoal(type: HealthLogType): number {
        const goals: Record<HealthLogType, number> = {
            water: 8,        // 8 glasses
            fiber: 25,       // 25 grams
            probiotic: 1,    // 1 serving
            exercise: 30,    // 30 minutes
        };
        return goals[type];
    }

    static getUnit(type: HealthLogType): string {
        const units: Record<HealthLogType, string> = {
            water: 'glasses',
            fiber: 'g',
            probiotic: 'servings',
            exercise: 'min',
        };
        return units[type];
    }

    static getLabel(type: HealthLogType): string {
        const labels: Record<HealthLogType, string> = {
            water: 'Water',
            fiber: 'Fiber',
            probiotic: 'Probiotic',
            exercise: 'Exercise',
        };
        return labels[type];
    }

    static getEmoji(type: HealthLogType): string {
        const emojis: Record<HealthLogType, string> = {
            water: '💧',
            fiber: '🌾',
            probiotic: '🦠',
            exercise: '🏃',
        };
        return emojis[type];
    }

    // === Update ===

    /**
     * Create a new log with incremented value
     */
    increment(amount: number = 1): HealthLog {
        return new HealthLog({
            ...this.props,
            value: this.props.value + amount,
        });
    }

    /**
     * Create a new log with new value
     */
    setValue(value: number): HealthLog {
        return new HealthLog({
            ...this.props,
            value: Math.max(0, value),
        });
    }

    // === Serialization ===

    toJSON(): HealthLogProps {
        return { ...this.props };
    }

    equals(other: HealthLog): boolean {
        return (
            this.props.date === other.props.date &&
            this.props.type === other.props.type
        );
    }
}

/**
 * Factory functions for convenience
 */
export const WaterLog = {
    create: (glasses: number, date?: string) =>
        HealthLog.create({ type: 'water', value: glasses, date }),
    empty: (date?: string) =>
        HealthLog.create({ type: 'water', value: 0, date }),
};

export const FiberLog = {
    create: (grams: number, date?: string) =>
        HealthLog.create({ type: 'fiber', value: grams, date }),
    empty: (date?: string) =>
        HealthLog.create({ type: 'fiber', value: 0, date }),
};

export const ProbioticLog = {
    create: (servings: number, date?: string) =>
        HealthLog.create({ type: 'probiotic', value: servings, date }),
    empty: (date?: string) =>
        HealthLog.create({ type: 'probiotic', value: 0, date }),
};

export const ExerciseLog = {
    create: (minutes: number, date?: string) =>
        HealthLog.create({ type: 'exercise', value: minutes, date }),
    empty: (date?: string) =>
        HealthLog.create({ type: 'exercise', value: 0, date }),
};

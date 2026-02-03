/**
 * User Entity
 * Core domain entity representing a user profile
 */

export interface UserProps {
    id?: string;
    name: string;
    streak: number;
    totalLogs: number;
    baselineScore: number;
}

export interface CreateUserInput {
    id?: string;
    name?: string;
    streak?: number;
    totalLogs?: number;
    baselineScore?: number;
}

/**
 * User Domain Entity
 */
export class User {
    private constructor(private readonly props: UserProps) {
        Object.freeze(this.props);
    }

    /**
     * Create a new User with defaults
     */
    static create(input: CreateUserInput = {}): User {
        return new User({
            id: input.id,
            name: input.name ?? 'Gut Buddy',
            streak: input.streak ?? 0,
            totalLogs: input.totalLogs ?? 0,
            baselineScore: input.baselineScore ?? 50,
        });
    }

    /**
     * Reconstitute from persistence
     */
    static reconstitute(props: UserProps): User {
        return new User(props);
    }

    // === Getters ===

    get id(): string | undefined {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get streak(): number {
        return this.props.streak;
    }

    get totalLogs(): number {
        return this.props.totalLogs;
    }

    get baselineScore(): number {
        return this.props.baselineScore;
    }

    // === Computed Properties ===

    /**
     * Get streak emoji based on length
     */
    get streakEmoji(): string {
        if (this.props.streak >= 30) return '🏆';
        if (this.props.streak >= 14) return '🔥';
        if (this.props.streak >= 7) return '⭐';
        if (this.props.streak >= 3) return '✨';
        return '💪';
    }

    /**
     * Get user level based on total logs
     */
    get level(): number {
        if (this.props.totalLogs >= 365) return 5;
        if (this.props.totalLogs >= 100) return 4;
        if (this.props.totalLogs >= 30) return 3;
        if (this.props.totalLogs >= 7) return 2;
        return 1;
    }

    /**
     * Get level title
     */
    get levelTitle(): string {
        const titles: Record<number, string> = {
            1: 'Gut Rookie',
            2: 'Gut Tracker',
            3: 'Gut Expert',
            4: 'Gut Master',
            5: 'Gut Legend',
        };
        return titles[this.level];
    }

    // === Update Methods ===

    /**
     * Update name
     */
    updateName(name: string): User {
        return new User({
            ...this.props,
            name: name.trim() || this.props.name,
        });
    }

    /**
     * Update streak
     */
    updateStreak(streak: number): User {
        return new User({
            ...this.props,
            streak: Math.max(0, streak),
        });
    }

    /**
     * Increment total logs
     */
    incrementLogs(count: number = 1): User {
        return new User({
            ...this.props,
            totalLogs: this.props.totalLogs + count,
        });
    }

    /**
     * Set baseline score
     */
    setBaselineScore(score: number): User {
        return new User({
            ...this.props,
            baselineScore: Math.max(0, Math.min(100, score)),
        });
    }

    /**
     * Update multiple properties
     */
    update(updates: Partial<CreateUserInput>): User {
        return new User({
            ...this.props,
            name: updates.name?.trim() ?? this.props.name,
            streak: updates.streak ?? this.props.streak,
            totalLogs: updates.totalLogs ?? this.props.totalLogs,
            baselineScore: updates.baselineScore ?? this.props.baselineScore,
        });
    }

    // === Serialization ===

    toJSON(): UserProps {
        return { ...this.props };
    }

    equals(other: User): boolean {
        return this.props.id === other.props.id;
    }
}

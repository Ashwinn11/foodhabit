/**
 * Severity Value Object
 * Represents severity levels for symptoms, pain, etc. (0-10 scale)
 */
export class Severity {
    private static readonly MIN = 0;
    private static readonly MAX = 10;

    private constructor(private readonly value: number) {
        Object.freeze(this);
    }

    /**
     * Create a Severity from a numeric value
     * @throws Error if value is not between 0 and 10
     */
    static create(value: number): Severity {
        if (value < Severity.MIN || value > Severity.MAX) {
            throw new Error(`Severity must be between ${Severity.MIN} and ${Severity.MAX}. Got: ${value}`);
        }
        return new Severity(Math.round(value));
    }

    /**
     * Safely create a Severity, clamping invalid values
     */
    static createClamped(value: number): Severity {
        const clamped = Math.max(Severity.MIN, Math.min(Severity.MAX, Math.round(value)));
        return new Severity(clamped);
    }

    /**
     * Create from a nullable value
     */
    static createOrNull(value: number | undefined | null): Severity | null {
        if (value === undefined || value === null) return null;
        try {
            return Severity.create(value);
        } catch {
            return null;
        }
    }

    /** No symptoms */
    static none(): Severity {
        return new Severity(0);
    }

    /** Mild severity (1-3) */
    get isMild(): boolean {
        return this.value >= 1 && this.value <= 3;
    }

    /** Moderate severity (4-6) */
    get isModerate(): boolean {
        return this.value >= 4 && this.value <= 6;
    }

    /** Severe (7-10) */
    get isSevere(): boolean {
        return this.value >= 7;
    }

    /** No symptoms */
    get isNone(): boolean {
        return this.value === 0;
    }

    getValue(): number {
        return this.value;
    }

    /**
     * Get human-readable label
     */
    getLabel(): string {
        if (this.isNone) return 'None';
        if (this.isMild) return 'Mild';
        if (this.isModerate) return 'Moderate';
        return 'Severe';
    }

    /**
     * Get color for UI representation
     */
    getColor(): string {
        if (this.isNone) return '#22c55e';      // green
        if (this.isMild) return '#84cc16';       // lime
        if (this.isModerate) return '#f59e0b';   // amber
        return '#ef4444';                         // red
    }

    equals(other: Severity): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return `${this.value}/10 (${this.getLabel()})`;
    }
}

/**
 * Urgency Level Value Object
 * Represents urgency of bowel movement
 */
export type UrgencyLevelValue = 'none' | 'mild' | 'severe';

export class UrgencyLevel {
    private static readonly VALID_LEVELS: UrgencyLevelValue[] = ['none', 'mild', 'severe'];

    private constructor(private readonly value: UrgencyLevelValue) {
        Object.freeze(this);
    }

    static create(value: string): UrgencyLevel {
        if (!UrgencyLevel.VALID_LEVELS.includes(value as UrgencyLevelValue)) {
            throw new Error(`Invalid urgency level: ${value}`);
        }
        return new UrgencyLevel(value as UrgencyLevelValue);
    }

    static createOrNull(value: string | undefined | null): UrgencyLevel | null {
        if (!value) return null;
        try {
            return UrgencyLevel.create(value);
        } catch {
            return null;
        }
    }

    static none(): UrgencyLevel {
        return new UrgencyLevel('none');
    }

    static mild(): UrgencyLevel {
        return new UrgencyLevel('mild');
    }

    static severe(): UrgencyLevel {
        return new UrgencyLevel('severe');
    }

    get isNone(): boolean {
        return this.value === 'none';
    }

    get isMild(): boolean {
        return this.value === 'mild';
    }

    get isSevere(): boolean {
        return this.value === 'severe';
    }

    getValue(): UrgencyLevelValue {
        return this.value;
    }

    equals(other: UrgencyLevel): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value.charAt(0).toUpperCase() + this.value.slice(1);
    }
}

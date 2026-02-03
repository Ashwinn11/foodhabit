/**
 * Bristol Stool Scale Value Object
 * Immutable representation of stool consistency (1-7 scale)
 */
export class BristolType {
    private static readonly VALID_TYPES = [1, 2, 3, 4, 5, 6, 7] as const;

    private constructor(private readonly value: 1 | 2 | 3 | 4 | 5 | 6 | 7) {
        Object.freeze(this);
    }

    /**
     * Factory method to create a BristolType from a numeric value
     * @throws Error if value is not between 1 and 7
     */
    static create(value: number): BristolType {
        if (!BristolType.VALID_TYPES.includes(value as any)) {
            throw new Error(`Invalid Bristol type: ${value}. Must be between 1 and 7.`);
        }
        return new BristolType(value as 1 | 2 | 3 | 4 | 5 | 6 | 7);
    }

    /**
     * Safely create a BristolType, returning null for invalid values
     */
    static createOrNull(value: number | undefined | null): BristolType | null {
        if (value === undefined || value === null) return null;
        try {
            return BristolType.create(value);
        } catch {
            return null;
        }
    }

    /** Type 3 or 4 - ideal stool consistency */
    get isHealthy(): boolean {
        return this.value === 3 || this.value === 4;
    }

    /** Type 1 or 2 - indicates constipation */
    get isConstipated(): boolean {
        return this.value === 1 || this.value === 2;
    }

    /** Type 6 or 7 - indicates diarrhea */
    get isDiarrhea(): boolean {
        return this.value === 6 || this.value === 7;
    }

    /** Type 2 or 5 - borderline/acceptable */
    get isAcceptable(): boolean {
        return this.value === 2 || this.value === 5;
    }

    /** Type 1, 6, or 7 - concerning consistency */
    get isConcerning(): boolean {
        return this.value === 1 || this.value === 6 || this.value === 7;
    }

    /**
     * Get the health score contribution for this Bristol type
     * Used in health score calculations
     */
    getHealthScoreContribution(maxPoints: number = 40): number {
        if (this.isHealthy) return maxPoints;           // Ideal: full points
        if (this.isAcceptable) return maxPoints * 0.75; // Acceptable: 75%
        return maxPoints * 0.25;                        // Concerning: 25%
    }

    getValue(): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
        return this.value;
    }

    equals(other: BristolType): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return `Bristol Type ${this.value}`;
    }

    /**
     * Get a human-readable description
     */
    getDescription(): string {
        const descriptions: Record<number, string> = {
            1: 'Separate hard lumps (severe constipation)',
            2: 'Lumpy sausage (mild constipation)',
            3: 'Sausage with cracks (normal)',
            4: 'Smooth soft sausage (ideal)',
            5: 'Soft blobs (lacking fiber)',
            6: 'Fluffy pieces (mild diarrhea)',
            7: 'Watery, no solid pieces (severe diarrhea)',
        };
        return descriptions[this.value];
    }
}

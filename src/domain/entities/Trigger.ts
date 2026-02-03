/**
 * Trigger Entity
 * Represents a food trigger with detection confidence
 */

export type TriggerConfidence = 'Low' | 'Medium' | 'High';

export interface TriggerProps {
    food: string;
    occurrences: number;
    symptomOccurrences: number;
    avgLatencyHours: number;
    symptoms: string[];
    userFeedback?: boolean | null;
    fodmapIssues?: {
        level: 'high' | 'moderate' | 'low';
        categories: string[];
    };
    alternatives?: string[];
}

/**
 * Trigger Domain Entity
 * Represents a detected food trigger
 */
export class Trigger {
    private constructor(private readonly props: TriggerProps) {
        Object.freeze(this.props);
    }

    /**
     * Create a Trigger from detection data
     */
    static create(props: TriggerProps): Trigger {
        return new Trigger({
            ...props,
            food: props.food.charAt(0).toUpperCase() + props.food.slice(1).toLowerCase(),
            symptoms: [...props.symptoms],
            alternatives: props.alternatives ? [...props.alternatives] : undefined,
        });
    }

    // === Getters ===

    get food(): string {
        return this.props.food;
    }

    get occurrences(): number {
        return this.props.occurrences;
    }

    get symptomOccurrences(): number {
        return this.props.symptomOccurrences;
    }

    get avgLatencyHours(): number {
        return this.props.avgLatencyHours;
    }

    get symptoms(): string[] {
        return [...this.props.symptoms];
    }

    get userFeedback(): boolean | null | undefined {
        return this.props.userFeedback;
    }

    get fodmapIssues(): TriggerProps['fodmapIssues'] {
        return this.props.fodmapIssues;
    }

    get alternatives(): string[] | undefined {
        return this.props.alternatives ? [...this.props.alternatives] : undefined;
    }

    // === Computed Properties ===

    /**
     * Calculate confidence based on occurrences
     * Aligned with clinical FODMAP reintroduction protocols
     */
    get confidence(): TriggerConfidence {
        // Clinical standard: 3 challenges minimum, well-tested at 5+
        if (this.props.occurrences >= 5) return 'High';
        if (this.props.occurrences >= 3) return 'Medium';
        return 'Low';
    }

    /**
     * Get probability (symptom occurrences / total occurrences)
     */
    get probability(): number {
        if (this.props.occurrences === 0) return 0;
        return this.props.symptomOccurrences / this.props.occurrences;
    }

    /**
     * Get formatted frequency text
     */
    get frequencyText(): string {
        return `${this.props.symptomOccurrences} out of ${this.props.occurrences} times`;
    }

    /**
     * Check if user has confirmed this trigger
     */
    get isUserConfirmed(): boolean {
        return this.props.userFeedback === true;
    }

    /**
     * Check if user has dismissed this trigger
     */
    get isUserDismissed(): boolean {
        return this.props.userFeedback === false;
    }

    /**
     * Check if this is a high FODMAP food
     */
    get isHighFODMAP(): boolean {
        return this.props.fodmapIssues?.level === 'high';
    }

    /**
     * Check if alternatives are available
     */
    get hasAlternatives(): boolean {
        return (this.props.alternatives?.length ?? 0) > 0;
    }

    /**
     * Get latency description
     */
    get latencyDescription(): string {
        const hours = this.props.avgLatencyHours;
        if (hours < 1) return 'Less than 1 hour';
        if (hours < 2) return 'About 1 hour';
        if (hours < 12) return `About ${Math.round(hours)} hours`;
        if (hours < 24) return 'Same day';
        return 'Next day';
    }

    // === Serialization ===

    toJSON(): TriggerProps & { confidence: TriggerConfidence; frequencyText: string; probability: number } {
        return {
            ...this.props,
            confidence: this.confidence,
            frequencyText: this.frequencyText,
            probability: this.probability,
        };
    }

    equals(other: Trigger): boolean {
        return this.props.food.toLowerCase() === other.props.food.toLowerCase();
    }
}

/**
 * Combination Trigger (when two foods together cause issues)
 */
export interface CombinationTriggerProps {
    foods: string[];
    occurrences: number;
    symptomOccurrences: number;
}

export class CombinationTrigger {
    private constructor(private readonly props: CombinationTriggerProps) {
        Object.freeze(this.props);
    }

    static create(props: CombinationTriggerProps): CombinationTrigger {
        return new CombinationTrigger({
            ...props,
            foods: props.foods.map(f => f.charAt(0).toUpperCase() + f.slice(1).toLowerCase()),
        });
    }

    get foods(): string[] {
        return [...this.props.foods];
    }

    get occurrences(): number {
        return this.props.occurrences;
    }

    get symptomOccurrences(): number {
        return this.props.symptomOccurrences;
    }

    get confidence(): TriggerConfidence {
        if (this.props.occurrences >= 5) return 'High';
        if (this.props.occurrences >= 3) return 'Medium';
        return 'Low';
    }

    get frequencyText(): string {
        return `${this.props.symptomOccurrences} out of ${this.props.occurrences} times`;
    }

    get probability(): number {
        if (this.props.occurrences === 0) return 0;
        return this.props.symptomOccurrences / this.props.occurrences;
    }

    get foodsLabel(): string {
        return this.props.foods.join(' + ');
    }

    toJSON(): CombinationTriggerProps & { confidence: TriggerConfidence; frequencyText: string } {
        return {
            ...this.props,
            confidence: this.confidence,
            frequencyText: this.frequencyText,
        };
    }
}

/**
 * Trigger Feedback (user confirmation)
 */
export interface TriggerFeedbackProps {
    foodName: string;
    userConfirmed: boolean | null;
    timestamp: Date;
    notes?: string;
}

export class TriggerFeedback {
    private constructor(private readonly props: TriggerFeedbackProps) {
        Object.freeze(this.props);
    }

    static create(props: TriggerFeedbackProps): TriggerFeedback {
        return new TriggerFeedback({
            ...props,
            foodName: props.foodName.toLowerCase().trim(),
        });
    }

    get foodName(): string {
        return this.props.foodName;
    }

    get userConfirmed(): boolean | null {
        return this.props.userConfirmed;
    }

    get timestamp(): Date {
        return this.props.timestamp;
    }

    get notes(): string | undefined {
        return this.props.notes;
    }

    get isConfirmed(): boolean {
        return this.props.userConfirmed === true;
    }

    get isDismissed(): boolean {
        return this.props.userConfirmed === false;
    }

    get isPending(): boolean {
        return this.props.userConfirmed === null;
    }

    toJSON(): TriggerFeedbackProps {
        return {
            ...this.props,
            timestamp: this.props.timestamp,
        };
    }
}

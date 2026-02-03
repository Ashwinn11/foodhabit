/**
 * GutMoment Entity
 * Core domain entity representing a bowel movement log
 */
import { BristolType, UrgencyLevel, Severity } from '../value-objects';
import { Symptoms, DEFAULT_SYMPTOMS, hasAnySymptom, createSymptoms } from './Symptoms';

export type GutMomentTag = 'strain' | 'blood' | 'mucus' | 'urgency';

export interface GutMomentProps {
    id: string;
    timestamp: Date;
    bristolType?: BristolType;
    symptoms: Symptoms;
    tags: GutMomentTag[];
    urgency?: UrgencyLevel;
    painScore?: Severity;
    notes?: string;
    duration?: number; // minutes
    incompleteEvacuation?: boolean;
}

export interface CreateGutMomentInput {
    timestamp?: Date;
    bristolType?: number;
    symptoms?: Partial<Symptoms>;
    tags?: GutMomentTag[];
    urgency?: string;
    painScore?: number;
    notes?: string;
    duration?: number;
    incompleteEvacuation?: boolean;
}

/**
 * Generate a unique ID
 */
function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * GutMoment Domain Entity
 * Encapsulates business logic for bowel movement tracking
 */
export class GutMoment {
    private constructor(private readonly props: GutMomentProps) {
        Object.freeze(this.props);
    }

    /**
     * Create a new GutMoment
     */
    static create(input: CreateGutMomentInput): GutMoment {
        return new GutMoment({
            id: generateId(),
            timestamp: input.timestamp ?? new Date(),
            bristolType: input.bristolType ? BristolType.create(input.bristolType) : undefined,
            symptoms: createSymptoms(input.symptoms),
            tags: input.tags ?? [],
            urgency: input.urgency ? UrgencyLevel.create(input.urgency) : undefined,
            painScore: input.painScore !== undefined ? Severity.create(input.painScore) : undefined,
            notes: input.notes,
            duration: input.duration,
            incompleteEvacuation: input.incompleteEvacuation,
        });
    }

    /**
     * Reconstitute an existing GutMoment from persistence
     */
    static reconstitute(props: GutMomentProps): GutMoment {
        return new GutMoment(props);
    }

    /**
     * Quick log with minimal data (for quick actions)
     */
    static quickLog(bristolType: number = 4): GutMoment {
        return GutMoment.create({
            bristolType,
            symptoms: DEFAULT_SYMPTOMS,
            tags: [],
        });
    }

    // === Getters ===

    get id(): string {
        return this.props.id;
    }

    get timestamp(): Date {
        return this.props.timestamp;
    }

    get bristolType(): BristolType | undefined {
        return this.props.bristolType;
    }

    get symptoms(): Symptoms {
        return this.props.symptoms;
    }

    get tags(): GutMomentTag[] {
        return [...this.props.tags];
    }

    get urgency(): UrgencyLevel | undefined {
        return this.props.urgency;
    }

    get painScore(): Severity | undefined {
        return this.props.painScore;
    }

    get notes(): string | undefined {
        return this.props.notes;
    }

    get duration(): number | undefined {
        return this.props.duration;
    }

    get incompleteEvacuation(): boolean {
        return this.props.incompleteEvacuation ?? false;
    }

    // === Computed Properties ===

    /**
     * Check if any symptoms are present
     */
    get hasSymptoms(): boolean {
        return hasAnySymptom(this.props.symptoms);
    }

    /**
     * Check for red flag symptoms (blood or mucus)
     */
    get hasRedFlags(): boolean {
        return this.props.tags.includes('blood') || this.props.tags.includes('mucus');
    }

    /**
     * Check if this is a healthy bowel movement
     */
    get isHealthy(): boolean {
        return (
            this.props.bristolType?.isHealthy === true &&
            !this.hasSymptoms &&
            !this.hasRedFlags
        );
    }

    /**
     * Check if this indicates constipation
     */
    get isConstipated(): boolean {
        return this.props.bristolType?.isConstipated === true;
    }

    /**
     * Check if this indicates diarrhea
     */
    get isDiarrhea(): boolean {
        return this.props.bristolType?.isDiarrhea === true;
    }

    /**
     * Check if this is an unhealthy stool (type 1, 2, 6, or 7)
     */
    get isUnhealthyStool(): boolean {
        return this.props.bristolType?.isConcerning === true;
    }

    /**
     * Check if this moment occurred on a specific date
     */
    isOnDate(date: Date): boolean {
        const momentDate = new Date(this.props.timestamp);
        momentDate.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return momentDate.getTime() === checkDate.getTime();
    }

    /**
     * Check if this moment is within a time range of another timestamp
     */
    isWithinHoursOf(timestamp: Date, minHours: number, maxHours: number): boolean {
        const diffMs = this.props.timestamp.getTime() - timestamp.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        return diffHours >= minHours && diffHours <= maxHours;
    }

    /**
     * Get hours difference from another timestamp
     */
    getHoursDifference(timestamp: Date): number {
        const diffMs = this.props.timestamp.getTime() - timestamp.getTime();
        return diffMs / (1000 * 60 * 60);
    }

    // === Update Methods (return new instance) ===

    /**
     * Create a new GutMoment with updated properties
     */
    update(updates: Partial<CreateGutMomentInput>): GutMoment {
        return new GutMoment({
            ...this.props,
            timestamp: updates.timestamp ?? this.props.timestamp,
            bristolType: updates.bristolType !== undefined
                ? BristolType.createOrNull(updates.bristolType) ?? this.props.bristolType
                : this.props.bristolType,
            symptoms: updates.symptoms
                ? createSymptoms({ ...this.props.symptoms, ...updates.symptoms })
                : this.props.symptoms,
            tags: updates.tags ?? this.props.tags,
            urgency: updates.urgency !== undefined
                ? UrgencyLevel.createOrNull(updates.urgency) ?? this.props.urgency
                : this.props.urgency,
            painScore: updates.painScore !== undefined
                ? Severity.createOrNull(updates.painScore) ?? this.props.painScore
                : this.props.painScore,
            notes: updates.notes !== undefined ? updates.notes : this.props.notes,
            duration: updates.duration !== undefined ? updates.duration : this.props.duration,
            incompleteEvacuation: updates.incompleteEvacuation !== undefined
                ? updates.incompleteEvacuation
                : this.props.incompleteEvacuation,
        });
    }

    // === Serialization ===

    /**
     * Convert to plain object for persistence
     */
    toJSON(): Record<string, unknown> {
        return {
            id: this.props.id,
            timestamp: this.props.timestamp.toISOString(),
            bristolType: this.props.bristolType?.getValue(),
            symptoms: this.props.symptoms,
            tags: this.props.tags,
            urgency: this.props.urgency?.getValue(),
            painScore: this.props.painScore?.getValue(),
            notes: this.props.notes,
            duration: this.props.duration,
            incompleteEvacuation: this.props.incompleteEvacuation,
        };
    }

    /**
     * Equality check
     */
    equals(other: GutMoment): boolean {
        return this.props.id === other.props.id;
    }
}

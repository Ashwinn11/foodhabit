/**
 * SymptomLog Entity
 * Standalone symptom logging (not tied to bowel movements)
 */
import { Severity } from '../value-objects';
import { SymptomType } from './Symptoms';

export interface SymptomLogProps {
    id: string;
    timestamp: Date;
    type: SymptomType;
    severity: Severity;
    duration?: number; // minutes
    notes?: string;
}

export interface CreateSymptomLogInput {
    timestamp?: Date;
    type: SymptomType;
    severity: number;
    duration?: number;
    notes?: string;
}

/**
 * Generate a unique ID
 */
function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * SymptomLog Domain Entity
 */
export class SymptomLog {
    private constructor(private readonly props: SymptomLogProps) {
        Object.freeze(this.props);
    }

    /**
     * Create a new SymptomLog
     */
    static create(input: CreateSymptomLogInput): SymptomLog {
        return new SymptomLog({
            id: generateId(),
            timestamp: input.timestamp ?? new Date(),
            type: input.type,
            severity: Severity.create(input.severity),
            duration: input.duration,
            notes: input.notes?.trim(),
        });
    }

    /**
     * Reconstitute from persistence
     */
    static reconstitute(props: SymptomLogProps): SymptomLog {
        return new SymptomLog(props);
    }

    // === Getters ===

    get id(): string {
        return this.props.id;
    }

    get timestamp(): Date {
        return this.props.timestamp;
    }

    get type(): SymptomType {
        return this.props.type;
    }

    get severity(): Severity {
        return this.props.severity;
    }

    get duration(): number | undefined {
        return this.props.duration;
    }

    get notes(): string | undefined {
        return this.props.notes;
    }

    // === Computed Properties ===

    get isSevere(): boolean {
        return this.props.severity.isSevere;
    }

    get isModerate(): boolean {
        return this.props.severity.isModerate;
    }

    get isMild(): boolean {
        return this.props.severity.isMild;
    }

    /**
     * Check if log occurred on a specific date
     */
    isOnDate(date: Date): boolean {
        const logDate = new Date(this.props.timestamp);
        logDate.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === checkDate.getTime();
    }

    // === Serialization ===

    toJSON(): Record<string, unknown> {
        return {
            id: this.props.id,
            timestamp: this.props.timestamp.toISOString(),
            type: this.props.type,
            severity: this.props.severity.getValue(),
            duration: this.props.duration,
            notes: this.props.notes,
        };
    }

    equals(other: SymptomLog): boolean {
        return this.props.id === other.props.id;
    }
}

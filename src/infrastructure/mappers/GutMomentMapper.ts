/**
 * GutMoment Data Mapper
 * Transforms between domain entities and persistence format
 */
import { GutMoment, BristolType, UrgencyLevel, Severity, DEFAULT_SYMPTOMS } from '../../domain';

export interface GutLogRow {
    id: string;
    user_id: string;
    timestamp: string;
    bristol_type?: number | null;
    symptoms?: Record<string, boolean> | null;
    tags?: string[] | null;
    urgency?: string | null;
    pain_score?: number | null;
    notes?: string | null;
    duration?: number | null;
    incomplete_evacuation?: boolean | null;
}

export class GutMomentMapper {
    /**
     * Map database row to domain entity
     */
    static toDomain(row: GutLogRow): GutMoment {
        return GutMoment.reconstitute({
            id: row.id,
            timestamp: new Date(row.timestamp),
            bristolType: row.bristol_type ? BristolType.create(row.bristol_type) : undefined,
            symptoms: row.symptoms ? {
                bloating: row.symptoms.bloating ?? false,
                gas: row.symptoms.gas ?? false,
                cramping: row.symptoms.cramping ?? false,
                nausea: row.symptoms.nausea ?? false,
            } : DEFAULT_SYMPTOMS,
            tags: (row.tags as any[]) || [],
            urgency: row.urgency ? UrgencyLevel.create(row.urgency) : undefined,
            painScore: row.pain_score !== null && row.pain_score !== undefined
                ? Severity.create(row.pain_score)
                : undefined,
            notes: row.notes || undefined,
            duration: row.duration || undefined,
            incompleteEvacuation: row.incomplete_evacuation || undefined,
        });
    }

    /**
     * Map domain entity to database insert format
     */
    static toPersistence(userId: string, moment: GutMoment): Omit<GutLogRow, 'id'> & { id?: string } {
        return {
            id: moment.id,
            user_id: userId,
            timestamp: moment.timestamp.toISOString(),
            bristol_type: moment.bristolType?.getValue() ?? null,
            symptoms: moment.symptoms,
            tags: moment.tags,
            urgency: moment.urgency?.getValue() ?? null,
            pain_score: moment.painScore?.getValue() ?? null,
            notes: moment.notes ?? null,
            duration: moment.duration ?? null,
            incomplete_evacuation: moment.incompleteEvacuation ?? null,
        };
    }
}

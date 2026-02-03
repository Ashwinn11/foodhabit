/**
 * Health Log Data Mapper
 */
import { HealthLog, HealthLogType } from '../../domain';

export interface HealthLogRow {
    id?: string;
    user_id: string;
    date: string;
    log_type: string;
    value: number;
}

export class HealthLogMapper {
    static toDomain(row: HealthLogRow): HealthLog {
        return HealthLog.reconstitute({
            date: row.date,
            type: row.log_type as HealthLogType,
            value: row.value,
        });
    }

    static toPersistence(userId: string, log: HealthLog): HealthLogRow {
        return {
            user_id: userId,
            date: log.date,
            log_type: log.type,
            value: log.value,
        };
    }
}

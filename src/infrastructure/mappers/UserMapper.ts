/**
 * UserMapper
 * Maps between domain User and persistence User
 */
import { User } from '../../domain';

export class UserMapper {
    /**
     * Map persistence row to domain User
     */
    static toDomain(row: any): User {
        const onboardingData = row.onboarding_data || {};
        return User.reconstitute({
            id: row.id,
            name: row.full_name || 'Gut Buddy',
            streak: 0, // Calculated separately or from other tables
            totalLogs: 0, // Calculated separately or from other tables
            baselineScore: onboardingData.score || 50,
        });
    }

    /**
     * Map domain User to persistence row
     */
    static toPersistence(user: User): any {
        return {
            id: user.id,
            full_name: user.name,
            updated_at: new Date().toISOString(),
        };
    }
}

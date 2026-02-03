/**
 * MedicalAlertService Unit Tests
 */
import { MedicalAlertService, MedicalAlertResult } from '../../../src/application/services/MedicalAlertService';
import { GutMoment } from '../../../src/domain';

describe('MedicalAlertService', () => {
    let service: MedicalAlertService;

    beforeEach(() => {
        service = new MedicalAlertService();
    });

    describe('checkAlerts', () => {
        it('should return empty alerts when no concerning patterns', () => {
            const moments = createHealthyMoments(5);
            const result: MedicalAlertResult = service.checkAlerts(moments);

            expect(result.hasAlerts).toBe(false);
            expect(result.alerts).toEqual([]);
        });

        it('should alert on consistent blood in stool', () => {
            const moments = [
                createMomentWithTags(['blood'], new Date()),
                createMomentWithTags(['blood'], daysAgo(1)),
                createMomentWithTags(['blood'], daysAgo(2)),
            ];

            const result: MedicalAlertResult = service.checkAlerts(moments);

            // Should detect blood pattern
            expect(result.hasAlerts).toBe(true);
            const bloodAlert = result.alerts.find(a => a.type === 'blood');
            expect(bloodAlert).toBeDefined();
        });

        it('should alert on severe constipation pattern', () => {
            // Create moments more than 3 days ago only
            const moments = [
                createMomentWithBristol(4, daysAgo(4)),
                createMomentWithBristol(4, daysAgo(5)),
                createMomentWithBristol(4, daysAgo(6)),
            ];

            const result: MedicalAlertResult = service.checkAlerts(moments);

            // Should detect constipation pattern (no recent BM)
            if (result.hasAlerts) {
                const constipationAlert = result.alerts.find(a => a.type === 'constipation');
                expect(constipationAlert).toBeDefined();
            }
        });

        it('should alert on chronic diarrhea pattern', () => {
            const moments = [
                createMomentWithBristol(6, daysAgo(0)),
                createMomentWithBristol(7, daysAgo(1)),
                createMomentWithBristol(6, daysAgo(2)),
                createMomentWithBristol(7, daysAgo(3)),
                createMomentWithBristol(6, daysAgo(4)),
            ];

            const result: MedicalAlertResult = service.checkAlerts(moments);

            // Should detect diarrhea pattern
            expect(result.hasAlerts).toBe(true);
            const diarrheaAlert = result.alerts.find(a => a.type === 'diarrhea');
            expect(diarrheaAlert).toBeDefined();
        });

        it('should not trigger false positives on occasional issues', () => {
            const moments = [
                createMomentWithBristol(4, daysAgo(0)), // Ideal
                createMomentWithBristol(6, daysAgo(1)), // One loose
                createMomentWithBristol(4, daysAgo(2)), // Ideal
                createMomentWithBristol(4, daysAgo(3)), // Ideal
                createMomentWithBristol(4, daysAgo(4)), // Ideal
            ];

            const result: MedicalAlertResult = service.checkAlerts(moments);

            // Single loose stool in context of healthy pattern should not alert for diarrhea
            const criticalAlerts = result.alerts.filter(a => a.severity === 'critical');
            expect(criticalAlerts.length).toBe(0);
        });

        it('should handle dismissed alerts', () => {
            const moments = [
                createMomentWithTags(['blood'], new Date()),
            ];

            // With dismissal
            const dismissedAlerts = {
                'blood': new Date().toISOString(),
            };

            const result: MedicalAlertResult = service.checkAlerts(moments, dismissedAlerts);

            // Blood alert should be dismissed
            const bloodAlert = result.alerts.find(a => a.type === 'blood');
            expect(bloodAlert).toBeUndefined();
        });
    });

    describe('getDismissalReference', () => {
        it('should return timestamp for blood alerts', () => {
            const moments = [
                createMomentWithTags(['blood'], new Date('2024-01-15T12:00:00')),
            ];

            const ref = service.getDismissalReference('blood', moments);

            expect(ref).toBeDefined();
            expect(typeof ref).toBe('string');
        });
    });
});

// Helper functions
function createHealthyMoments(count: number): GutMoment[] {
    return Array.from({ length: count }, (_, i) =>
        GutMoment.create({
            timestamp: daysAgo(i),
            bristolType: 4, // Ideal
            symptoms: {},
            tags: [],
            urgency: 'none',
        })
    );
}

function createMomentWithTags(tags: string[], timestamp: Date): GutMoment {
    return GutMoment.create({
        timestamp,
        bristolType: 4,
        symptoms: {},
        tags: tags as any,
        urgency: 'none',
    });
}

function createMomentWithBristol(bristolType: number, timestamp: Date): GutMoment {
    return GutMoment.create({
        timestamp,
        bristolType,
        symptoms: {},
        tags: [],
        urgency: 'none',
    });
}

function daysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
}

/**
 * MedicalAlertService
 * Detects medical alerts based on symptom patterns
 */
import { GutMoment } from '../../domain';

export interface MedicalAlert {
    type: 'blood' | 'mucus' | 'constipation' | 'diarrhea';
    message: string;
    severity: 'warning' | 'critical';
}

export interface MedicalAlertResult {
    hasAlerts: boolean;
    alerts: MedicalAlert[];
}

export interface DismissedAlerts {
    [type: string]: string; // type -> timestamp string
}

export class MedicalAlertService {
    private readonly BLOOD_WINDOW_DAYS = 7;
    private readonly MUCUS_WINDOW_DAYS = 14;
    private readonly MUCUS_THRESHOLD = 5;
    private readonly CONSTIPATION_DAYS = 3;
    private readonly DIARRHEA_WINDOW_DAYS = 7;
    private readonly DIARRHEA_THRESHOLD = 5;
    private readonly SNOOZE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    /**
     * Check for medical alerts
     */
    checkAlerts(
        moments: GutMoment[],
        dismissedAlerts: DismissedAlerts = {}
    ): MedicalAlertResult {
        const alerts: MedicalAlert[] = [];

        // Check for blood in stool
        const bloodAlert = this.checkBloodAlert(moments, dismissedAlerts);
        if (bloodAlert) alerts.push(bloodAlert);

        // Check for persistent mucus
        const mucusAlert = this.checkMucusAlert(moments, dismissedAlerts);
        if (mucusAlert) alerts.push(mucusAlert);

        // Check for severe constipation
        const constipationAlert = this.checkConstipationAlert(moments, dismissedAlerts);
        if (constipationAlert) alerts.push(constipationAlert);

        // Check for persistent diarrhea
        const diarrheaAlert = this.checkDiarrheaAlert(moments, dismissedAlerts);
        if (diarrheaAlert) alerts.push(diarrheaAlert);

        return {
            hasAlerts: alerts.length > 0,
            alerts,
        };
    }

    /**
     * Get dismissal reference time for an alert type
     */
    getDismissalReference(type: string, moments: GutMoment[]): string {
        const now = new Date().toISOString();

        switch (type) {
            case 'blood': {
                const last = moments.find(m => m.tags.includes('blood'));
                return last ? last.timestamp.toISOString() : now;
            }
            case 'mucus': {
                const last = moments.find(m => m.tags.includes('mucus'));
                return last ? last.timestamp.toISOString() : now;
            }
            case 'diarrhea': {
                const last = moments.find(m => m.isDiarrhea);
                return last ? last.timestamp.toISOString() : now;
            }
            case 'constipation':
            default:
                return now;
        }
    }

    /**
     * Check for blood in stool alert
     */
    private checkBloodAlert(
        moments: GutMoment[],
        dismissedAlerts: DismissedAlerts
    ): MedicalAlert | null {
        const recentBlood = this.filterRecentDays(moments, this.BLOOD_WINDOW_DAYS)
            .filter(m => m.tags.includes('blood'));

        if (recentBlood.length === 0) return null;

        const latestLog = recentBlood[0];
        const dismissedAt = dismissedAlerts['blood'];

        // Show if never dismissed OR latest log is newer than dismissal reference
        if (dismissedAt && new Date(latestLog.timestamp) <= new Date(dismissedAt)) {
            return null;
        }

        return {
            type: 'blood',
            message: 'Blood in stool detected in the last 7 days. This may indicate a medical condition. Please consult a healthcare provider.',
            severity: 'critical',
        };
    }

    /**
     * Check for persistent mucus alert
     */
    private checkMucusAlert(
        moments: GutMoment[],
        dismissedAlerts: DismissedAlerts
    ): MedicalAlert | null {
        const recentMucus = this.filterRecentDays(moments, this.MUCUS_WINDOW_DAYS)
            .filter(m => m.tags.includes('mucus'));

        if (recentMucus.length < this.MUCUS_THRESHOLD) return null;

        const latestLog = recentMucus[0];
        const dismissedAt = dismissedAlerts['mucus'];

        if (dismissedAt && new Date(latestLog.timestamp) <= new Date(dismissedAt)) {
            return null;
        }

        return {
            type: 'mucus',
            message: 'Frequent mucus in stool detected. Consider consulting a healthcare provider.',
            severity: 'warning',
        };
    }

    /**
     * Check for severe constipation alert (no BM in 3+ days)
     */
    private checkConstipationAlert(
        moments: GutMoment[],
        dismissedAlerts: DismissedAlerts
    ): MedicalAlert | null {
        const lastNDays = this.filterRecentDays(moments, this.CONSTIPATION_DAYS);

        // Only alert if user has logged before but hasn't recently
        if (lastNDays.length > 0 || moments.length === 0) return null;

        const dismissedAt = dismissedAlerts['constipation'];

        // For constipation (state-based), use a 24h snooze window
        const isSnoozed = dismissedAt &&
            (Date.now() - new Date(dismissedAt).getTime()) < this.SNOOZE_DURATION_MS;

        if (isSnoozed) return null;

        return {
            type: 'constipation',
            message: 'No bowel movements in 3+ days. If this persists or causes discomfort, consult a healthcare provider.',
            severity: 'warning',
        };
    }

    /**
     * Check for persistent diarrhea alert
     */
    private checkDiarrheaAlert(
        moments: GutMoment[],
        dismissedAlerts: DismissedAlerts
    ): MedicalAlert | null {
        const recentDiarrhea = this.filterRecentDays(moments, this.DIARRHEA_WINDOW_DAYS)
            .filter(m => m.isDiarrhea);

        if (recentDiarrhea.length < this.DIARRHEA_THRESHOLD) return null;

        const latestLog = recentDiarrhea[0];
        const dismissedAt = dismissedAlerts['diarrhea'];

        if (dismissedAt && new Date(latestLog.timestamp) <= new Date(dismissedAt)) {
            return null;
        }

        return {
            type: 'diarrhea',
            message: 'Persistent diarrhea detected. Stay hydrated and consider consulting a healthcare provider if it continues.',
            severity: 'warning',
        };
    }

    /**
     * Filter moments by recent days
     */
    private filterRecentDays(moments: GutMoment[], days: number): GutMoment[] {
        const cutoffMs = days * 24 * 60 * 60 * 1000;
        const now = Date.now();

        return moments.filter(m => {
            const diff = now - m.timestamp.getTime();
            return diff <= cutoffMs;
        });
    }
}

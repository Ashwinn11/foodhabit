/**
 * IWidgetService
 * Port for widget synchronization
 */

export interface WidgetData {
    score: number;
    grade: string;
    lastPoopTime: string;
    statusMessage: string;
    breakdown?: {
        bristol: number;
        symptoms: number;
        regularity: number;
        medical: number;
    };
    weeklyHistory: Array<{
        date: string;
        count: number;
        label: string;
    }>;
}

export interface IWidgetService {
    /**
     * Sync widget data
     */
    sync(data: WidgetData): Promise<void>;

    /**
     * Force widget refresh
     */
    refresh(): Promise<void>;

    /**
     * Check if widgets are supported
     */
    isSupported(): boolean;
}

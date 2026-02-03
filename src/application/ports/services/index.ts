/**
 * Service Interfaces (Ports)
 * Define contracts for external services
 */

export { type INotificationService, type ToastOptions, type NotificationOptions } from './INotificationService';
export { type IWidgetService, type WidgetData } from './IWidgetService';
export { type IStorageService } from './IStorageService';
export {
    type IFODMAPService,
    type FODMAPLevel,
    type FODMAPCategory,
    type FODMAPInfo,
    type FODMAPAnalysis,
    type FODMAPStackingResult,
    type FODMAPLatency,
    type AIFODMAPResult,
} from './IFODMAPService';

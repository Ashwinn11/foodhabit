/**
 * Dependency Injection Container
 * Manual DI without external libraries for simplicity
 */
import { supabase } from '../../config/supabase';

// Repositories
import {
    SupabaseGutMomentRepository,
    SupabaseMealRepository,
    SupabaseHealthLogRepository,
    SupabaseTriggerFeedbackRepository,
} from '../repositories';

// Services (Infrastructure)
import {
    NotificationServiceImpl,
    WidgetServiceImpl,
    AsyncStorageServiceImpl,
} from '../services';

// Services (Application)
import {
    HealthScoreService,
    TriggerDetectionService,
    MedicalAlertService,
    StreakService,
    DailyTaskService,
    StoreSyncService,
} from '../../application/services';

// Use Cases
import {
    LogGutMomentUseCase,
    QuickLogGutMomentUseCase,
    GetGutMomentsUseCase,
    DeleteGutMomentUseCase,
    LogMealUseCase,
    GetMealsUseCase,
    DeleteMealUseCase,
    CalculateHealthScoreUseCase,
    DetectTriggersUseCase,
    DetectCombinationTriggersUseCase,
    CheckMedicalAlertsUseCase,
    SaveTriggerFeedbackUseCase,
} from '../../application/use-cases';

// Ports (for type safety)
import type {
    IGutMomentRepository,
    IMealRepository,
    IHealthLogRepository,
    ITriggerFeedbackRepository,
    INotificationService,
    IWidgetService,
    IStorageService,
} from '../../application/ports';

/**
 * Container class for dependency injection
 * Uses singleton pattern with lazy initialization
 */
class Container {
    private static instance: Container;

    // Cached instances
    private _gutMomentRepo?: IGutMomentRepository;
    private _mealRepo?: IMealRepository;
    private _healthLogRepo?: IHealthLogRepository;
    private _triggerFeedbackRepo?: ITriggerFeedbackRepository;
    private _notificationService?: INotificationService;
    private _widgetService?: IWidgetService;
    private _storageService?: IStorageService;
    private _healthScoreService?: HealthScoreService;
    private _triggerDetectionService?: TriggerDetectionService;
    private _medicalAlertService?: MedicalAlertService;
    private _streakService?: StreakService;
    private _dailyTaskService?: DailyTaskService;
    private _storeSyncService?: StoreSyncService;

    private constructor() { }

    static getInstance(): Container {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    // === Repositories ===

    get gutMomentRepository(): IGutMomentRepository {
        if (!this._gutMomentRepo) {
            this._gutMomentRepo = new SupabaseGutMomentRepository(supabase);
        }
        return this._gutMomentRepo;
    }

    get mealRepository(): IMealRepository {
        if (!this._mealRepo) {
            this._mealRepo = new SupabaseMealRepository(supabase);
        }
        return this._mealRepo;
    }

    get healthLogRepository(): IHealthLogRepository {
        if (!this._healthLogRepo) {
            this._healthLogRepo = new SupabaseHealthLogRepository(supabase);
        }
        return this._healthLogRepo;
    }

    get triggerFeedbackRepository(): ITriggerFeedbackRepository {
        if (!this._triggerFeedbackRepo) {
            this._triggerFeedbackRepo = new SupabaseTriggerFeedbackRepository(supabase);
        }
        return this._triggerFeedbackRepo;
    }

    // === Infrastructure Services ===

    get notificationService(): INotificationService {
        if (!this._notificationService) {
            this._notificationService = new NotificationServiceImpl();
        }
        return this._notificationService;
    }

    get widgetService(): IWidgetService {
        if (!this._widgetService) {
            this._widgetService = new WidgetServiceImpl();
        }
        return this._widgetService;
    }

    get storageService(): IStorageService {
        if (!this._storageService) {
            this._storageService = new AsyncStorageServiceImpl();
        }
        return this._storageService;
    }

    // === Application Services ===

    get healthScoreService(): HealthScoreService {
        if (!this._healthScoreService) {
            this._healthScoreService = new HealthScoreService();
        }
        return this._healthScoreService;
    }

    get triggerDetectionService(): TriggerDetectionService {
        if (!this._triggerDetectionService) {
            this._triggerDetectionService = new TriggerDetectionService();
        }
        return this._triggerDetectionService;
    }

    get medicalAlertService(): MedicalAlertService {
        if (!this._medicalAlertService) {
            this._medicalAlertService = new MedicalAlertService();
        }
        return this._medicalAlertService;
    }

    get streakService(): StreakService {
        if (!this._streakService) {
            this._streakService = new StreakService();
        }
        return this._streakService;
    }

    get dailyTaskService(): DailyTaskService {
        if (!this._dailyTaskService) {
            this._dailyTaskService = new DailyTaskService();
        }
        return this._dailyTaskService;
    }

    get storeSyncService(): StoreSyncService {
        if (!this._storeSyncService) {
            this._storeSyncService = new StoreSyncService(
                this.gutMomentRepository,
                this.mealRepository
            );
        }
        return this._storeSyncService;
    }

    // === Use Cases ===

    get logGutMomentUseCase(): LogGutMomentUseCase {
        return new LogGutMomentUseCase(
            this.gutMomentRepository,
            this.notificationService,
            this.widgetService,
            this.streakService
        );
    }

    get quickLogGutMomentUseCase(): QuickLogGutMomentUseCase {
        return new QuickLogGutMomentUseCase(
            this.gutMomentRepository,
            this.notificationService,
            this.streakService
        );
    }

    get getGutMomentsUseCase(): GetGutMomentsUseCase {
        return new GetGutMomentsUseCase(this.gutMomentRepository);
    }

    get deleteGutMomentUseCase(): DeleteGutMomentUseCase {
        return new DeleteGutMomentUseCase(
            this.gutMomentRepository,
            this.streakService
        );
    }

    get logMealUseCase(): LogMealUseCase {
        return new LogMealUseCase(
            this.mealRepository,
            this.notificationService
        );
    }

    get getMealsUseCase(): GetMealsUseCase {
        return new GetMealsUseCase(this.mealRepository);
    }

    get deleteMealUseCase(): DeleteMealUseCase {
        return new DeleteMealUseCase(this.mealRepository);
    }

    get calculateHealthScoreUseCase(): CalculateHealthScoreUseCase {
        return new CalculateHealthScoreUseCase(
            this.gutMomentRepository,
            this.healthScoreService
        );
    }

    get detectTriggersUseCase(): DetectTriggersUseCase {
        return new DetectTriggersUseCase(
            this.gutMomentRepository,
            this.mealRepository,
            this.triggerFeedbackRepository,
            this.triggerDetectionService
        );
    }

    get detectCombinationTriggersUseCase(): DetectCombinationTriggersUseCase {
        return new DetectCombinationTriggersUseCase(
            this.gutMomentRepository,
            this.mealRepository,
            this.triggerDetectionService
        );
    }

    get checkMedicalAlertsUseCase(): CheckMedicalAlertsUseCase {
        return new CheckMedicalAlertsUseCase(
            this.gutMomentRepository,
            this.medicalAlertService
        );
    }

    get saveTriggerFeedbackUseCase(): SaveTriggerFeedbackUseCase {
        return new SaveTriggerFeedbackUseCase(this.triggerFeedbackRepository);
    }

    /**
     * Reset all cached instances (useful for testing)
     */
    reset(): void {
        this._gutMomentRepo = undefined;
        this._mealRepo = undefined;
        this._healthLogRepo = undefined;
        this._triggerFeedbackRepo = undefined;
        this._notificationService = undefined;
        this._widgetService = undefined;
        this._storageService = undefined;
        this._healthScoreService = undefined;
        this._triggerDetectionService = undefined;
        this._medicalAlertService = undefined;
        this._streakService = undefined;
        this._dailyTaskService = undefined;
        this._storeSyncService = undefined;
    }
}

/**
 * Export singleton container instance
 */
export const container = Container.getInstance();

/**
 * Convenience function to get the container
 */
export function getContainer(): Container {
    return Container.getInstance();
}

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
    SupabaseUserRepository,
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
    CompleteOnboardingUseCase,
} from '../../application/use-cases';

// Ports (for type safety)
import type {
    IGutMomentRepository,
    IMealRepository,
    IHealthLogRepository,
    IUserRepository,
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
    private _userRepo?: IUserRepository;
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

    // Cached use cases
    private _logGutMomentUseCase?: LogGutMomentUseCase;
    private _quickLogGutMomentUseCase?: QuickLogGutMomentUseCase;
    private _getGutMomentsUseCase?: GetGutMomentsUseCase;
    private _deleteGutMomentUseCase?: DeleteGutMomentUseCase;
    private _logMealUseCase?: LogMealUseCase;
    private _getMealsUseCase?: GetMealsUseCase;
    private _deleteMealUseCase?: DeleteMealUseCase;
    private _calculateHealthScoreUseCase?: CalculateHealthScoreUseCase;
    private _detectTriggersUseCase?: DetectTriggersUseCase;
    private _detectCombinationTriggersUseCase?: DetectCombinationTriggersUseCase;
    private _checkMedicalAlertsUseCase?: CheckMedicalAlertsUseCase;
    private _saveTriggerFeedbackUseCase?: SaveTriggerFeedbackUseCase;
    private _completeOnboardingUseCase?: CompleteOnboardingUseCase;

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

    get userRepository(): IUserRepository {
        if (!this._userRepo) {
            this._userRepo = new SupabaseUserRepository(supabase);
        }
        return this._userRepo;
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
        if (!this._logGutMomentUseCase) {
            this._logGutMomentUseCase = new LogGutMomentUseCase(
                this.gutMomentRepository,
                this.notificationService,
                this.widgetService,
                this.streakService
            );
        }
        return this._logGutMomentUseCase;
    }

    get quickLogGutMomentUseCase(): QuickLogGutMomentUseCase {
        if (!this._quickLogGutMomentUseCase) {
            this._quickLogGutMomentUseCase = new QuickLogGutMomentUseCase(
                this.gutMomentRepository,
                this.notificationService,
                this.streakService
            );
        }
        return this._quickLogGutMomentUseCase;
    }

    get getGutMomentsUseCase(): GetGutMomentsUseCase {
        if (!this._getGutMomentsUseCase) {
            this._getGutMomentsUseCase = new GetGutMomentsUseCase(this.gutMomentRepository);
        }
        return this._getGutMomentsUseCase;
    }

    get deleteGutMomentUseCase(): DeleteGutMomentUseCase {
        if (!this._deleteGutMomentUseCase) {
            this._deleteGutMomentUseCase = new DeleteGutMomentUseCase(
                this.gutMomentRepository,
                this.streakService
            );
        }
        return this._deleteGutMomentUseCase;
    }

    get logMealUseCase(): LogMealUseCase {
        if (!this._logMealUseCase) {
            this._logMealUseCase = new LogMealUseCase(
                this.mealRepository,
                this.notificationService
            );
        }
        return this._logMealUseCase;
    }

    get getMealsUseCase(): GetMealsUseCase {
        if (!this._getMealsUseCase) {
            this._getMealsUseCase = new GetMealsUseCase(this.mealRepository);
        }
        return this._getMealsUseCase;
    }

    get deleteMealUseCase(): DeleteMealUseCase {
        if (!this._deleteMealUseCase) {
            this._deleteMealUseCase = new DeleteMealUseCase(this.mealRepository);
        }
        return this._deleteMealUseCase;
    }

    get calculateHealthScoreUseCase(): CalculateHealthScoreUseCase {
        if (!this._calculateHealthScoreUseCase) {
            this._calculateHealthScoreUseCase = new CalculateHealthScoreUseCase(
                this.gutMomentRepository,
                this.healthScoreService
            );
        }
        return this._calculateHealthScoreUseCase;
    }

    get detectTriggersUseCase(): DetectTriggersUseCase {
        if (!this._detectTriggersUseCase) {
            this._detectTriggersUseCase = new DetectTriggersUseCase(
                this.gutMomentRepository,
                this.mealRepository,
                this.triggerFeedbackRepository,
                this.triggerDetectionService
            );
        }
        return this._detectTriggersUseCase;
    }

    get detectCombinationTriggersUseCase(): DetectCombinationTriggersUseCase {
        if (!this._detectCombinationTriggersUseCase) {
            this._detectCombinationTriggersUseCase = new DetectCombinationTriggersUseCase(
                this.gutMomentRepository,
                this.mealRepository,
                this.triggerDetectionService
            );
        }
        return this._detectCombinationTriggersUseCase;
    }

    get checkMedicalAlertsUseCase(): CheckMedicalAlertsUseCase {
        if (!this._checkMedicalAlertsUseCase) {
            this._checkMedicalAlertsUseCase = new CheckMedicalAlertsUseCase(
                this.gutMomentRepository,
                this.medicalAlertService
            );
        }
        return this._checkMedicalAlertsUseCase;
    }

    get saveTriggerFeedbackUseCase(): SaveTriggerFeedbackUseCase {
        if (!this._saveTriggerFeedbackUseCase) {
            this._saveTriggerFeedbackUseCase = new SaveTriggerFeedbackUseCase(this.triggerFeedbackRepository);
        }
        return this._saveTriggerFeedbackUseCase;
    }

    get completeOnboardingUseCase(): CompleteOnboardingUseCase {
        if (!this._completeOnboardingUseCase) {
            this._completeOnboardingUseCase = new CompleteOnboardingUseCase(this.userRepository);
        }
        return this._completeOnboardingUseCase;
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

        this._logGutMomentUseCase = undefined;
        this._quickLogGutMomentUseCase = undefined;
        this._getGutMomentsUseCase = undefined;
        this._deleteGutMomentUseCase = undefined;
        this._logMealUseCase = undefined;
        this._getMealsUseCase = undefined;
        this._deleteMealUseCase = undefined;
        this._calculateHealthScoreUseCase = undefined;
        this._detectTriggersUseCase = undefined;
        this._detectCombinationTriggersUseCase = undefined;
        this._checkMedicalAlertsUseCase = undefined;
        this._saveTriggerFeedbackUseCase = undefined;
        this._completeOnboardingUseCase = undefined;
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

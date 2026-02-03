/**
 * LogGutMomentUseCase Unit Tests
 */
import { LogGutMomentUseCase, QuickLogGutMomentUseCase } from '../../../src/application/use-cases/gut/LogGutMoment';
import { GutMoment } from '../../../src/domain';

describe('LogGutMomentUseCase', () => {
    let useCase: LogGutMomentUseCase;
    let mockRepo: any;
    let mockNotificationService: any;
    let mockWidgetService: any;
    let mockStreakService: any;

    beforeEach(() => {
        mockRepo = {
            save: jest.fn().mockResolvedValue(undefined),
            update: jest.fn().mockResolvedValue(undefined),
            findByUserId: jest.fn().mockResolvedValue([]),
            findToday: jest.fn().mockResolvedValue([]),
            findByDateRange: jest.fn().mockResolvedValue([]),
            findRecentDays: jest.fn().mockResolvedValue([]),
            findById: jest.fn().mockResolvedValue(null),
            delete: jest.fn().mockResolvedValue(undefined),
            count: jest.fn().mockResolvedValue(0),
        };

        mockNotificationService = {
            showToast: jest.fn(),
            showAchievement: jest.fn(),
            scheduleDailyReminder: jest.fn(),
            cancelAll: jest.fn(),
        };

        mockWidgetService = {
            isSupported: jest.fn().mockReturnValue(true),
            updateWidget: jest.fn().mockResolvedValue(undefined),
        };

        mockStreakService = {
            calculateCurrentStreak: jest.fn().mockReturnValue(1),
            getLongestStreak: jest.fn().mockReturnValue(1),
        } as any;

        useCase = new LogGutMomentUseCase(
            mockRepo,
            mockNotificationService,
            mockWidgetService,
            mockStreakService
        );
    });

    it('should create and save a gut moment', async () => {
        const result = await useCase.execute('user-123', {
            bristolType: 4,
            symptoms: { bloating: false, gas: false, cramping: false, nausea: false },
            tags: [],
            urgency: 'none',
        });

        expect(mockRepo.save).toHaveBeenCalled();
        expect(result.moment).toBeDefined();
        expect(result.moment.bristolType?.getValue()).toBe(4);
    });

    it('should detect first poop of the day', async () => {
        mockRepo.findToday.mockResolvedValue([]); // No previous moments

        const result = await useCase.execute('user-123', {
            bristolType: 4,
            symptoms: {},
            tags: [],
            urgency: 'none',
        });

        expect(result.isFirstToday).toBe(true);
        expect(mockNotificationService.showAchievement).toHaveBeenCalled();
    });

    it('should not show achievement for non-first poop', async () => {
        const existingMoment = GutMoment.create({
            bristolType: 4,
            symptoms: {},
            tags: [],
            urgency: 'none',
        });
        mockRepo.findToday.mockResolvedValue([existingMoment]);

        const result = await useCase.execute('user-123', {
            bristolType: 4,
            symptoms: {},
            tags: [],
            urgency: 'none',
        });

        expect(result.isFirstToday).toBe(false);
        expect(mockNotificationService.showAchievement).not.toHaveBeenCalled();
    });

    it('should calculate and return new streak', async () => {
        mockStreakService.calculateCurrentStreak.mockReturnValue(5);

        const result = await useCase.execute('user-123', {
            bristolType: 4,
            symptoms: {},
            tags: [],
            urgency: 'none',
        });

        expect(result.newStreak).toBe(5);
    });
});

describe('QuickLogGutMomentUseCase', () => {
    let useCase: QuickLogGutMomentUseCase;
    let mockRepo: any;
    let mockNotificationService: any;
    let mockStreakService: any;

    beforeEach(() => {
        mockRepo = {
            save: jest.fn().mockResolvedValue(undefined),
            update: jest.fn().mockResolvedValue(undefined),
            findByUserId: jest.fn().mockResolvedValue([]),
            findToday: jest.fn().mockResolvedValue([]),
            findByDateRange: jest.fn().mockResolvedValue([]),
            findRecentDays: jest.fn().mockResolvedValue([]),
            findById: jest.fn().mockResolvedValue(null),
            delete: jest.fn().mockResolvedValue(undefined),
            count: jest.fn().mockResolvedValue(0),
        };

        mockNotificationService = {
            showToast: jest.fn(),
            showAchievement: jest.fn(),
        };

        mockStreakService = {
            calculateCurrentStreak: jest.fn().mockReturnValue(1),
        } as any;

        useCase = new QuickLogGutMomentUseCase(
            mockRepo,
            mockNotificationService,
            mockStreakService
        );
    });

    it('should create moment with default bristol type 4', async () => {
        const result = await useCase.execute('user-123');

        expect(result.moment.bristolType?.getValue()).toBe(4);
    });

    it('should allow custom bristol type', async () => {
        const result = await useCase.execute('user-123', 5);

        expect(result.moment.bristolType?.getValue()).toBe(5);
    });

    it('should show toast notification', async () => {
        await useCase.execute('user-123');

        expect(mockNotificationService.showToast).toHaveBeenCalled();
    });
});

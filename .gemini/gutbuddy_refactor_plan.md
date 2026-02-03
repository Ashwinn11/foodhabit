# GutBuddy Complete Architecture Refactor

## 🎯 Vision
Transform GutBuddy from a monolithic store-centric architecture into a clean, modular, enterprise-grade codebase following **SOLID principles**, **Clean Architecture**, and **Domain-Driven Design (DDD)**.

---

## 📊 Current State Analysis

### Critical Issues
| Issue | File | Lines | Severity |
|-------|------|-------|----------|
| God Object Store | `useGutStore.ts` | 1,667 | 🔴 Critical |
| Business Logic in Store | `useGutStore.ts` | ~800 | 🔴 Critical |
| Direct DB Access in Actions | Multiple stores | N/A | 🟠 High |
| Missing Repository Layer | N/A | N/A | 🟠 High |
| Types in Store Files | `useGutStore.ts` | ~80 | 🟡 Medium |
| No Dependency Injection | Entire codebase | N/A | 🟡 Medium |

---

## 🏗️ Target Architecture

```
src/
├── domain/                    # 🔷 Enterprise Business Rules
│   ├── entities/              # Core domain models (pure TS classes)
│   │   ├── GutMoment.ts
│   │   ├── Meal.ts
│   │   ├── SymptomLog.ts
│   │   ├── HealthLog.ts
│   │   ├── Trigger.ts
│   │   └── User.ts
│   ├── value-objects/         # Immutable value types
│   │   ├── BristolType.ts
│   │   ├── HealthScore.ts
│   │   ├── MealType.ts
│   │   └── Severity.ts
│   ├── aggregates/            # Domain aggregates
│   │   └── DailyHealthRecord.ts
│   └── events/                # Domain events
│       ├── GutMomentLogged.ts
│       └── MealLogged.ts
│
├── application/               # 🔶 Application Business Rules
│   ├── use-cases/             # Single-purpose use case classes
│   │   ├── gut/
│   │   │   ├── LogGutMoment.ts
│   │   │   ├── GetGutMoments.ts
│   │   │   └── DeleteGutMoment.ts
│   │   ├── meals/
│   │   │   ├── LogMeal.ts
│   │   │   └── GetMeals.ts
│   │   ├── health/
│   │   │   ├── LogWater.ts
│   │   │   ├── LogFiber.ts
│   │   │   └── GetDailyHealth.ts
│   │   ├── analytics/
│   │   │   ├── CalculateHealthScore.ts
│   │   │   ├── DetectTriggers.ts
│   │   │   ├── DetectCombinationTriggers.ts
│   │   │   └── CheckMedicalAlerts.ts
│   │   └── data/
│   │       ├── ExportData.ts
│   │       └── SyncWidget.ts
│   ├── services/              # Application-level services
│   │   ├── HealthScoreService.ts
│   │   ├── TriggerDetectionService.ts
│   │   ├── MedicalAlertService.ts
│   │   └── NotificationOrchestrator.ts
│   └── ports/                 # Interfaces for infrastructure
│       ├── repositories/
│       │   ├── IGutMomentRepository.ts
│       │   ├── IMealRepository.ts
│       │   ├── IHealthLogRepository.ts
│       │   └── IUserRepository.ts
│       └── services/
│           ├── INotificationService.ts
│           ├── IStorageService.ts
│           └── IWidgetService.ts
│
├── infrastructure/            # 🟢 Frameworks & Drivers
│   ├── repositories/          # Concrete implementations
│   │   ├── SupabaseGutMomentRepository.ts
│   │   ├── SupabaseMealRepository.ts
│   │   ├── SupabaseHealthLogRepository.ts
│   │   └── SupabaseUserRepository.ts
│   ├── services/
│   │   ├── ExpoNotificationService.ts
│   │   ├── AsyncStorageService.ts
│   │   ├── WidgetSyncService.ts
│   │   └── FODMAPService.ts
│   ├── api/                   # External API integrations
│   │   └── SupabaseClient.ts
│   └── di/                    # Dependency Injection
│       └── container.ts
│
├── presentation/              # 🟣 UI Layer (React Native)
│   ├── screens/               # Screen components
│   ├── components/            # Presentational components
│   ├── hooks/                 # Custom hooks (use cases consumers)
│   │   ├── useGutMoments.ts
│   │   ├── useMeals.ts
│   │   ├── useHealthScore.ts
│   │   └── useTriggers.ts
│   ├── store/                 # Zustand stores (UI state ONLY)
│   │   ├── useUIStore.ts      # Toasts, modals, loading states
│   │   ├── useNavigationStore.ts
│   │   └── useSessionStore.ts # Auth session cache
│   └── view-models/           # Transform domain -> UI
│       ├── HomeViewModel.ts
│       └── InsightsViewModel.ts
│
└── shared/                    # Cross-cutting concerns
    ├── types/                 # Shared TypeScript types
    ├── utils/                 # Pure utility functions
    ├── constants/             # App constants
    └── errors/                # Custom error classes
```

---

## 📋 Implementation Phases

### Phase 1: Domain Layer Foundation (Week 1)
**Goal**: Create pure domain models and value objects

#### 1.1 Create Value Objects
```typescript
// src/domain/value-objects/BristolType.ts
export class BristolType {
  private constructor(private readonly value: 1 | 2 | 3 | 4 | 5 | 6 | 7) {}
  
  static create(value: number): BristolType {
    if (value < 1 || value > 7) {
      throw new Error('Bristol type must be between 1 and 7');
    }
    return new BristolType(value as 1 | 2 | 3 | 4 | 5 | 6 | 7);
  }
  
  get isHealthy(): boolean {
    return this.value === 3 || this.value === 4;
  }
  
  get isConstipated(): boolean {
    return this.value === 1 || this.value === 2;
  }
  
  get isDiarrhea(): boolean {
    return this.value === 6 || this.value === 7;
  }
  
  getValue(): number {
    return this.value;
  }
}
```

#### 1.2 Create Domain Entities
```typescript
// src/domain/entities/GutMoment.ts
export interface GutMomentProps {
  id: string;
  timestamp: Date;
  bristolType?: BristolType;
  symptoms: Symptoms;
  tags: GutMomentTag[];
  urgency?: UrgencyLevel;
  painScore?: number;
  notes?: string;
}

export class GutMoment {
  private constructor(private props: GutMomentProps) {}
  
  static create(props: Omit<GutMomentProps, 'id'>): GutMoment {
    return new GutMoment({
      ...props,
      id: generateId(),
    });
  }
  
  static reconstitute(props: GutMomentProps): GutMoment {
    return new GutMoment(props);
  }
  
  get id(): string { return this.props.id; }
  get timestamp(): Date { return this.props.timestamp; }
  get bristolType(): BristolType | undefined { return this.props.bristolType; }
  get hasSymptoms(): boolean {
    return Object.values(this.props.symptoms).some(v => v);
  }
  get hasRedFlags(): boolean {
    return this.props.tags.includes('blood') || this.props.tags.includes('mucus');
  }
}
```

### Phase 2: Application Layer - Use Cases (Week 2)
**Goal**: Extract business logic into single-responsibility use cases

#### 2.1 Create Repository Interfaces (Ports)
```typescript
// src/application/ports/repositories/IGutMomentRepository.ts
export interface IGutMomentRepository {
  save(moment: GutMoment): Promise<void>;
  findById(id: string): Promise<GutMoment | null>;
  findByUserId(userId: string): Promise<GutMoment[]>;
  findByDateRange(userId: string, start: Date, end: Date): Promise<GutMoment[]>;
  delete(id: string): Promise<void>;
}
```

#### 2.2 Create Use Cases
```typescript
// src/application/use-cases/gut/LogGutMoment.ts
export class LogGutMomentUseCase {
  constructor(
    private readonly gutMomentRepo: IGutMomentRepository,
    private readonly notificationService: INotificationService,
    private readonly widgetService: IWidgetService,
  ) {}
  
  async execute(input: LogGutMomentInput): Promise<GutMoment> {
    // 1. Create domain entity
    const moment = GutMoment.create({
      timestamp: input.timestamp,
      bristolType: input.bristolType ? BristolType.create(input.bristolType) : undefined,
      symptoms: input.symptoms,
      tags: input.tags,
      urgency: input.urgency,
      painScore: input.painScore,
      notes: input.notes,
    });
    
    // 2. Persist
    await this.gutMomentRepo.save(moment);
    
    // 3. Side effects
    await this.notificationService.showAchievementIfNeeded(moment);
    await this.widgetService.sync();
    
    return moment;
  }
}
```

#### 2.3 Extract Health Score Service
```typescript
// src/application/services/HealthScoreService.ts
export class HealthScoreService {
  calculateScore(
    moments: GutMoment[],
    baselineScore: number
  ): HealthScore {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentMoments = moments.filter(m => m.timestamp >= sevenDaysAgo);
    
    if (recentMoments.length === 0) {
      return HealthScore.fromBaseline(baselineScore);
    }
    
    const bristolScore = this.calculateBristolScore(recentMoments);
    const symptomScore = this.calculateSymptomScore(recentMoments);
    const regularityScore = this.calculateRegularityScore(recentMoments);
    const medicalScore = this.calculateMedicalScore(recentMoments);
    
    const rawScore = bristolScore + symptomScore + regularityScore + medicalScore;
    const blendedScore = this.blendWithBaseline(rawScore, baselineScore, recentMoments.length);
    
    return HealthScore.create(blendedScore, {
      bristol: bristolScore,
      symptoms: symptomScore,
      regularity: regularityScore,
      medical: medicalScore,
    });
  }
  
  private calculateBristolScore(moments: GutMoment[]): number {
    // Extract from current store logic
  }
  
  private blendWithBaseline(raw: number, baseline: number, logCount: number): number {
    const baselineWeight = logCount <= 2 ? 0.7 : logCount <= 4 ? 0.5 : logCount <= 6 ? 0.3 : 0.1;
    return (baseline * baselineWeight) + (raw * (1 - baselineWeight));
  }
}
```

#### 2.4 Extract Trigger Detection Service
```typescript
// src/application/services/TriggerDetectionService.ts
export class TriggerDetectionService {
  constructor(private readonly fodmapService: IFODMAPService) {}
  
  detectTriggers(
    moments: GutMoment[],
    meals: Meal[],
    userFeedback: TriggerFeedback[]
  ): EnhancedTrigger[] {
    const foodStats = this.buildFoodStatistics(moments, meals);
    
    return Object.entries(foodStats)
      .map(([food, stats]) => this.createTriggerResult(food, stats, userFeedback))
      .filter(item => item.occurrences >= 3 && item.symptomOccurrences >= 2)
      .sort((a, b) => (b.symptomOccurrences / b.occurrences) - (a.symptomOccurrences / a.occurrences))
      .slice(0, 5);
  }
  
  detectCombinationTriggers(moments: GutMoment[], meals: Meal[]): CombinationTrigger[] {
    // Extract from store
  }
}
```

### Phase 3: Infrastructure Layer (Week 3)
**Goal**: Implement repository pattern and external service adapters

#### 3.1 Implement Supabase Repositories
```typescript
// src/infrastructure/repositories/SupabaseGutMomentRepository.ts
export class SupabaseGutMomentRepository implements IGutMomentRepository {
  constructor(private readonly supabase: SupabaseClient) {}
  
  async save(moment: GutMoment): Promise<void> {
    const { error } = await this.supabase.from('gut_logs').insert({
      user_id: await this.getCurrentUserId(),
      timestamp: moment.timestamp.toISOString(),
      bristol_type: moment.bristolType?.getValue(),
      symptoms: moment.symptoms,
      tags: moment.tags,
      urgency: moment.urgency,
      pain_score: moment.painScore,
      notes: moment.notes,
    });
    
    if (error) throw new DatabaseError('Failed to save gut moment', error);
  }
  
  async findByUserId(userId: string): Promise<GutMoment[]> {
    const { data, error } = await this.supabase
      .from('gut_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (error) throw new DatabaseError('Failed to fetch gut moments', error);
    
    return data.map(row => GutMomentMapper.toDomain(row));
  }
}
```

#### 3.2 Create Data Mappers
```typescript
// src/infrastructure/mappers/GutMomentMapper.ts
export class GutMomentMapper {
  static toDomain(raw: GutLogRow): GutMoment {
    return GutMoment.reconstitute({
      id: raw.id,
      timestamp: new Date(raw.timestamp),
      bristolType: raw.bristol_type ? BristolType.create(raw.bristol_type) : undefined,
      symptoms: raw.symptoms || DEFAULT_SYMPTOMS,
      tags: raw.tags || [],
      urgency: raw.urgency,
      painScore: raw.pain_score,
      notes: raw.notes,
    });
  }
  
  static toPersistence(moment: GutMoment): Partial<GutLogRow> {
    return {
      timestamp: moment.timestamp.toISOString(),
      bristol_type: moment.bristolType?.getValue(),
      symptoms: moment.symptoms,
      tags: moment.tags,
      urgency: moment.urgency,
      pain_score: moment.painScore,
      notes: moment.notes,
    };
  }
}
```

### Phase 4: Dependency Injection Container (Week 3-4)
**Goal**: Wire up all dependencies

```typescript
// src/infrastructure/di/container.ts
import { Container } from 'inversify';

const container = new Container();

// Repositories
container.bind<IGutMomentRepository>(TYPES.GutMomentRepository)
  .to(SupabaseGutMomentRepository)
  .inSingletonScope();

container.bind<IMealRepository>(TYPES.MealRepository)
  .to(SupabaseMealRepository)
  .inSingletonScope();

// Services
container.bind<HealthScoreService>(TYPES.HealthScoreService)
  .to(HealthScoreService)
  .inSingletonScope();

container.bind<TriggerDetectionService>(TYPES.TriggerDetectionService)
  .to(TriggerDetectionService)
  .inSingletonScope();

// Use Cases
container.bind<LogGutMomentUseCase>(TYPES.LogGutMomentUseCase)
  .to(LogGutMomentUseCase)
  .inTransientScope();

export { container };
```

### Phase 5: Presentation Layer Refactor (Week 4-5)
**Goal**: Create thin Zustand stores and custom hooks

#### 5.1 Slim Down Zustand Stores
```typescript
// src/presentation/store/useUIStore.ts (Keep as-is, it's already focused)

// src/presentation/store/useSessionStore.ts
interface SessionState {
  userId: string | null;
  isAuthenticated: boolean;
  setSession: (session: Session | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  userId: null,
  isAuthenticated: false,
  setSession: (session) => set({
    userId: session?.user?.id ?? null,
    isAuthenticated: !!session,
  }),
}));
```

#### 5.2 Create React Hooks for Use Cases
```typescript
// src/presentation/hooks/useGutMoments.ts
export function useGutMoments() {
  const [moments, setMoments] = useState<GutMoment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userId = useSessionStore((s) => s.userId);
  
  // Get use case from DI container
  const logUseCase = container.get<LogGutMomentUseCase>(TYPES.LogGutMomentUseCase);
  const getUseCase = container.get<GetGutMomentsUseCase>(TYPES.GetGutMomentsUseCase);
  
  useEffect(() => {
    if (!userId) return;
    
    getUseCase.execute(userId).then(setMoments).finally(() => setLoading(false));
  }, [userId]);
  
  const logMoment = async (input: LogGutMomentInput) => {
    const moment = await logUseCase.execute(input);
    setMoments(prev => [moment, ...prev]);
    return moment;
  };
  
  return { moments, loading, logMoment };
}
```

#### 5.3 Create View Models
```typescript
// src/presentation/view-models/HomeViewModel.ts
export class HomeViewModel {
  constructor(
    private readonly healthScoreService: HealthScoreService,
    private readonly triggerService: TriggerDetectionService,
  ) {}
  
  getHealthScore(moments: GutMoment[], baseline: number): HealthScoreViewModel {
    const score = this.healthScoreService.calculateScore(moments, baseline);
    return {
      score: score.value,
      grade: score.grade,
      gradeColor: this.getGradeColor(score.grade),
      breakdown: score.breakdown,
    };
  }
  
  getLastPoopMessage(moments: GutMoment[]): string {
    if (moments.length === 0) return "Log your first poop!";
    // ... formatting logic
  }
}
```

---

## 🗂️ File Migration Map

| Current File | New Location(s) |
|--------------|-----------------|
| `useGutStore.ts` (Types) | `domain/entities/*.ts`, `domain/value-objects/*.ts` |
| `useGutStore.ts` (addGutMoment) | `application/use-cases/gut/LogGutMoment.ts` |
| `useGutStore.ts` (getGutHealthScore) | `application/services/HealthScoreService.ts` |
| `useGutStore.ts` (getPotentialTriggers) | `application/services/TriggerDetectionService.ts` |
| `useGutStore.ts` (checkMedicalAlerts) | `application/services/MedicalAlertService.ts` |
| `useGutStore.ts` (exportData) | `application/use-cases/data/ExportData.ts` |
| `useGutStore.ts` (syncWidget) | `infrastructure/services/WidgetSyncService.ts` |
| `useGutStore.ts` (Supabase calls) | `infrastructure/repositories/Supabase*.ts` |
| `fodmapService.ts` | `infrastructure/services/FODMAPService.ts` |

---

## ✅ SOLID Principles Checklist

### Single Responsibility Principle (SRP)
- [x] Each use case does ONE thing
- [x] Repositories handle data access only
- [x] Services contain domain logic only
- [x] Stores manage UI state only

### Open/Closed Principle (OCP)
- [x] New repositories without modifying use cases
- [x] New notification services via interface

### Liskov Substitution Principle (LSP)
- [x] InMemory repositories for testing
- [x] Mock services for testing

### Interface Segregation Principle (ISP)
- [x] Small, focused repository interfaces
- [x] Separate read/write interfaces if needed

### Dependency Inversion Principle (DIP)
- [x] Use cases depend on interfaces, not implementations
- [x] DI container wires concrete implementations

---

## 📦 Dependencies to Add

```json
{
  "dependencies": {
    "inversify": "^6.0.2",
    "reflect-metadata": "^0.2.1"
  },
  "devDependencies": {
    "@types/inversify": "^2.0.33"
  }
}
```

---

## 🧪 Testing Strategy

1. **Domain Layer**: Pure unit tests (no mocks needed)
2. **Use Cases**: Mock repository interfaces
3. **Repositories**: Integration tests with test database
4. **UI Hooks**: React Testing Library with mocked DI container

---

## 🚀 Migration Strategy

### Option A: Big Bang (Not Recommended)
Rewrite everything at once. High risk, long dev time.

### Option B: Strangler Fig Pattern (Recommended) ✅
1. Create new architecture alongside existing code
2. Migrate one feature at a time
3. New features use new architecture
4. Delete old code as features migrate

### Implementation Order:
1. ✅ Phase 1: Domain models (no breaking changes)
2. ✅ Phase 2: Create use cases (wrapper around existing store)
3. ✅ Phase 3: Create repositories (store calls repositories)
4. ✅ Phase 4: DI container
5. ✅ Phase 5: Migrate screens one-by-one to hooks
6. 🗑️ Delete old store methods as they become unused

---

## 📝 Next Steps

Ready to start? Say:
- **"Start Phase 1"** - Create domain layer foundation
- **"Start Phase 2"** - Create use cases (requires Phase 1)
- **"Full implementation"** - Complete all phases
- **"Show me the GutMoment entity"** - See a specific file

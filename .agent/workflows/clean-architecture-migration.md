---
description: Clean Architecture migration guide for GutBuddy codebase
---
# Clean Architecture Migration Guide

This workflow documents how to migrate GutBuddy screens and components to use the new clean architecture.

## Migration Status

### Completed Migrations ✅
- ✅ HomeScreen - Uses `useGutData` hook for health score, streak, and medical alerts
- ✅ InsightsScreen - Uses `useGutData` hook and trigger detection service
- ✅ ProfileScreen - Uses `useGutData` hook for health score and streak
- ✅ GutProfileScreen - Uses `useGutData` hook for health score
- ✅ ScanFoodScreen - Keeps store for simple actions (no complex computations needed)
- ✅ AddEntryScreen - Uses `useGutActions` hook for logging gut moments

## Available Hooks

| Hook | Purpose | Source |
|------|---------|--------|
| `useGutData` | Bridge hook for gradual migration - provides computed values | `/src/presentation/hooks/useGutData.ts` |
| `useGutActions` | Actions using use cases with optimistic updates | `/src/presentation/hooks/useGutActions.ts` |
| `useStoreSync` | Sync local store with cloud storage | `/src/presentation/hooks/useStoreSync.ts` |
| `useHealthScore` | Calculate health score from gut moments | `/src/presentation/hooks/useHealthScore.ts` |
| `useTriggers` | Detect food triggers | `/src/presentation/hooks/useTriggers.ts` |
| `useMedicalAlerts` | Check for medical alerts | `/src/presentation/hooks/useMedicalAlerts.ts` |
| `useGutMoments` | Fetch gut moments from repository | `/src/presentation/hooks/useGutMoments.ts` |
| `useMeals` | Fetch meals from repository | `/src/presentation/hooks/useMeals.ts` |
| `useHealthLogs` | Fetch health logs from repository | `/src/presentation/hooks/useHealthLogs.ts` |

## How to Migrate a Screen

### Step 1: Import the new hooks
```tsx
import { useGutData, useGutActions } from '../presentation/hooks';
```

### Step 2: Use new architecture for computed values
```tsx
// Replace this:
const { getGutHealthScore, checkMedicalAlerts } = useGutStore();
const healthScore = getGutHealthScore();
const alerts = checkMedicalAlerts();

// With this:
const { healthScore, medicalAlerts, streak } = useGutData();
// healthScore is now { value: number, grade: string, breakdown?: object }
```

### Step 3: Use `useGutActions` for mutations
```tsx
// Replace this:
const { addGutMoment, addWater, addMeal } = useGutStore();

// With this:
const { logGutMoment, logWater, logMeal, isLogging, error } = useGutActions();

// Usage:
await logGutMoment({
  bristolType: 4,
  symptoms: { bloating: false, gas: true },
  urgency: 'none',
});
```

### Step 4: Sync with cloud (optional)
```tsx
const { fullSync, isSyncing, lastSyncResult } = useStoreSync();

// Sync data when needed
await fullSync();
```

## Architecture Layers

```
src/
├── domain/           # Business entities and value objects
│   ├── entities/     # GutMoment, Meal, etc.
│   └── value-objects/# BristolType, HealthScore, etc.
├── application/      # Use cases and services  
│   ├── services/     # HealthScoreService, TriggerDetectionService
│   ├── use-cases/    # LogGutMoment, LogMeal, etc.
│   └── ports/        # Interfaces for repos/services
├── infrastructure/   # Supabase repos, DI container
│   ├── di/           # Dependency injection container
│   ├── repositories/ # Concrete repository implementations
│   └── mappers/      # Domain <-> persistence mappers
└── presentation/     # React hooks consuming use cases
    └── hooks/        # useGutData, useGutActions, etc.
```

## Key Files

| File | Purpose |
|------|---------|
| `src/presentation/hooks/useGutData.ts` | Bridge hook for gradual migration |
| `src/presentation/hooks/useGutActions.ts` | Actions with use cases + optimistic updates |
| `src/presentation/hooks/useStoreSync.ts` | Store sync with cloud |
| `src/infrastructure/di/container.ts` | Dependency injection container |
| `src/application/services/*` | Business logic services |
| `src/application/use-cases/*` | Single-purpose operations |

## Testing

### Run all tests:
// turbo
```bash
npm test
```

### Run tests in watch mode:
```bash
npm run test:watch
```

### Run tests with coverage:
```bash
npm run test:coverage
```

### Test files location:
```
__tests__/
├── setup.ts                          # Jest setup with mocks
└── application/
    ├── services/
    │   ├── HealthScoreService.test.ts
    │   ├── TriggerDetectionService.test.ts
    │   ├── MedicalAlertService.test.ts
    │   └── StreakService.test.ts
    └── use-cases/
        └── LogGutMomentUseCase.test.ts
```

## TypeScript Check

// turbo
```bash
npx tsc --noEmit --skipLibCheck
```

## Benefits of the New Architecture

1. **Testable** - Services and use cases can be unit tested independently
2. **Decoupled** - Business logic separated from UI and persistence
3. **Type Safe** - Full TypeScript types throughout all layers
4. **Optimistic Updates** - Local store updates immediately, persists in background
5. **Offline Support** - Local-first architecture with sync capability
6. **Bidirectional Sync** - Push/pull data between local and cloud

## Sync Service

The `StoreSyncService` enables bidirectional data synchronization:

```tsx
import { useStoreSync } from '../presentation/hooks';

function MyComponent() {
  const { 
    pushToCloud,    // Push local changes to Supabase
    pullFromCloud,  // Pull cloud changes to local store
    fullSync,       // Full bidirectional sync
    isSyncing,
    lastSyncTime,
    error 
  } = useStoreSync();

  // Auto-syncs when user authenticates
}
```

## Rollback

If issues arise, revert screens to use `useGutStore` directly instead of the new hooks.

## Completed Implementation Steps ✅

1. ✅ **Unit Tests Added** - Tests for HealthScoreService, TriggerDetectionService, MedicalAlertService, StreakService, LogGutMomentUseCase
2. ✅ **Repository Sync Connected** - StoreSyncService created for bidirectional sync
3. ✅ **Screen Migrations Complete** - All major screens migrated to new architecture
4. ✅ **Documentation Updated** - This workflow guide maintained

## Next Steps (Optional)

1. Add more integration tests
2. Implement conflict resolution in sync
3. Add retry logic for failed syncs
4. Add background sync capabilities

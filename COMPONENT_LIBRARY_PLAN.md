# Reusable Component Library - Implementation Plan

## 🎯 Goal
Create a comprehensive library of reusable components to eliminate custom inline styles and ensure consistency across the app.

## 📦 Component Categories

### 1. Layout Components ✅ (Already Done)
- `Container` - Main layout wrapper
- `Card` - Content card
- `GridCard` - 3-column grid item
- `Surface` - Base surface component

### 2. Typography Components ✅ (Already Done)
- `Text` - All text variants

### 3. Form Components ✅ (Already Done)
- `Input` - Text input
- `Button` - All button variants

### 4. New Components Needed

#### A. **SectionHeader** Component
**Usage:** Section titles with optional action button
```tsx
<SectionHeader 
  title="Achievements" 
  subtitle="1 / 6"
  onActionPress={() => {}}
  actionIcon="chevron-forward"
/>
```
**Locations:** ProfileScreen, HomeScreen, TriggerAnalysisScreen

#### B. **TabBar** Component
**Usage:** Horizontal tab navigation
```tsx
<TabBar
  tabs={['Overview', 'Health', 'Settings']}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```
**Locations:** ProfileScreen

#### C. **StatCard** Component (Specialized GridCard)
**Usage:** Stat display with icon, value, label
```tsx
<StatCard
  icon="flame"
  iconColor={theme.colors.brand.primary}
  value={currentStreak}
  label="Streak"
/>
```
**Locations:** ProfileScreen, HomeScreen

#### D. **InfoRow** Component
**Usage:** Label-value pairs
```tsx
<InfoRow
  label="Condition"
  value="IBS"
  icon="medical-outline"
/>
```
**Locations:** ProfileScreen, TriggerAnalysisScreen

#### E. **EmptyState** Component
**Usage:** Empty state with icon, title, description
```tsx
<EmptyState
  icon="document-text-outline"
  title="No Data Yet"
  description="Start logging to see insights"
  actionLabel="Log Now"
  onAction={() => {}}
/>
```
**Locations:** TriggerAnalysisScreen, HistoryScreen

#### F. **ProgressBar** Component
**Usage:** Progress indicator
```tsx
<ProgressBar
  progress={0.75}
  color={theme.colors.brand.primary}
  height={6}
/>
```
**Locations:** OnboardingCelebrationScreen

#### G. **IconBadge** Component
**Usage:** Icon in colored circle
```tsx
<IconBadge
  icon="checkmark"
  color={theme.colors.brand.primary}
  size="large"
/>
```
**Locations:** OnboardingCelebrationScreen, AchievementsWidget

#### H. **ListItem** Component
**Usage:** Reusable list item with icon, text, chevron
```tsx
<ListItem
  icon="settings-outline"
  iconColor={theme.colors.brand.primary}
  label="Settings"
  onPress={() => {}}
  showChevron
/>
```
**Locations:** ProfileScreen (SettingsRow), HomeScreen

#### I. **Chip** Component
**Usage:** Small pill-shaped button
```tsx
<Chip
  label="High FODMAP"
  selected={false}
  onPress={() => {}}
/>
```
**Locations:** FoodInput, LifestyleTracker

#### J. **Badge** Component
**Usage:** Small notification badge
```tsx
<Badge
  count={3}
  color={theme.colors.brand.primary}
/>
```
**Locations:** Future notifications

## 🔄 Migration Strategy

### Phase 1: Core UI Components (Priority 1)
1. ✅ GridCard (Done)
2. SectionHeader
3. TabBar
4. StatCard

### Phase 2: Content Components (Priority 2)
5. InfoRow
6. EmptyState
7. ProgressBar
8. IconBadge

### Phase 3: Interactive Components (Priority 3)
9. ListItem
10. Chip
11. Badge

## 📝 Implementation Checklist

For each component:
- [ ] Create component file in `/src/components/`
- [ ] Define TypeScript interface for props
- [ ] Use theme tokens (no hardcoded values)
- [ ] Add JSDoc comments
- [ ] Export from `/src/components/index.ts`
- [ ] Replace usage in screens
- [ ] Remove old custom styles

## 🎨 Design Tokens to Use

All components must use:
- `theme.colors.*` - Colors
- `theme.spacing.*` - Spacing
- `theme.borderRadius.*` - Border radius
- `theme.fontFamily.*` - Fonts
- `theme.fontSize.*` - Font sizes

## ✅ Success Criteria

1. **Zero inline StyleSheet.create in screens**
2. **All visual elements use components**
3. **100% theme token usage**
4. **Consistent spacing/sizing everywhere**
5. **Easy to maintain and extend**

## 📊 Current Status

- Existing Components: 15
- Components Needed: 11
- Screens to Refactor: 8
- Estimated Effort: 2-3 hours

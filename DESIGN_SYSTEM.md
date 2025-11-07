# Food Habit - Strict Design System

This document describes the **strict design system** for the Food Habit app with approved colors only and no deviations.

## Overview

The design system is built on strict principles:
- **Approved colors only**: `#ff7664`, `#9bcbab`, `#cda4e8`, `#dedfe2`, `#000000`, `#ffffff`
- **No opacity variations**: Icons and colors always solid
- **White or black text only**: No gray text colors
- **Colored icon containers**: Icons with colored backgrounds and white icons inside
- **8px grid** spacing system
- **Responsive scaling** for all iOS devices
- **Haptic feedback** for tactile interactions
- **Smooth animations** with spring physics

## Table of Contents

1. [Colors](#colors)
2. [Icons](#icons)
3. [Typography](#typography)
4. [Buttons](#buttons)
5. [Backgrounds](#backgrounds)
6. [Tab Bar](#tab-bar)
7. [Spacing & Border Radius](#spacing--border-radius)
8. [Best Practices](#best-practices)

---

## Colors

### Strict Brand Colors - ONLY THESE ALLOWED

```typescript
brand: {
  primary: '#ff7664',    // Coral/Red - Primary brand color
  secondary: '#9bcbab',  // Mint Green - Secondary color
  tertiary: '#cda4e8',   // Lavender Purple - Tertiary color
  background: '#dedfe2', // Light Gray - Main app background
  black: '#000000',      // Pure Black
  white: '#ffffff',      // Pure White
}
```

### Usage Rules

**Primary Color (#ff7664)**
- All primary buttons
- Primary icons
- Tab bar active state
- Avatar backgrounds
- Primary accents

**Secondary Color (#9bcbab)**
- Secondary buttons
- Secondary icon containers (e.g., subscription)
- Accent elements

**Tertiary Color (#cda4e8)**
- Tertiary buttons
- Tertiary icon containers (e.g., legal docs)
- Additional accent elements

**Background (#dedfe2)**
- Main app background
- Grouped backgrounds
- Container backgrounds

**Black (#000000)**
- All text (except on colored backgrounds)
- Inactive tab icons
- Borders

**White (#ffffff)**
- Text on colored backgrounds
- Icons inside colored containers
- Card backgrounds
- Tab bar background

### Text Colors - STRICT (Only Black or White)

```typescript
text: {
  primary: '#000000',   // Black text
  secondary: '#000000', // Black text (no opacity!)
  tertiary: '#000000',  // Black text (no opacity!)
  inverse: '#ffffff',   // White text (on colored backgrounds)
}
```

**NO opacity variations, NO gray colors for text!**

---

## Icons

### Icon System Rules

**Two scenarios for icons:**

#### 1. Icon WITHOUT Container (Direct Icon)
Use colored icon directly (no container):
```tsx
<Ionicons name="chevron-forward" size={20} color={theme.colors.brand.black} />
```

#### 2. Icon WITH Rounded Container ⭐ PRIMARY PATTERN
Container is colored, icon inside is WHITE:

```tsx
// Primary color container
<View style={{
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: theme.colors.brand.primary,
  alignItems: 'center',
  justifyContent: 'center'
}}>
  <Ionicons name="card-outline" size={20} color={theme.colors.brand.white} />
</View>

// Secondary color container
<View style={{
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: theme.colors.brand.secondary,
  alignItems: 'center',
  justifyContent: 'center'
}}>
  <Ionicons name="help" size={20} color={theme.colors.brand.white} />
</View>

// Tertiary color container
<View style={{
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: theme.colors.brand.tertiary,
  alignItems: 'center',
  justifyContent: 'center'
}}>
  <Ionicons name="document" size={20} color={theme.colors.brand.white} />
</View>
```

### Icon Color Assignments

```typescript
icon: {
  primary: '#ff7664',   // Help, Sign Out, Delete
  secondary: '#9bcbab', // Subscription
  tertiary: '#cda4e8',  // Terms, Privacy
  white: '#ffffff',     // Icon inside containers
  black: '#000000',     // Inactive icons, chevrons
}
```

### Rules

- **NO opacity on icons** - Always solid colors
- **Icons with containers** - Container colored, icon white
- **Icons without containers** - Icon colored directly
- **Only use approved colors**: `#ff7664`, `#9bcbab`, `#cda4e8`

---

## Typography

### Text Colors (Strict)

```typescript
// All text is either black or white
<Text style={{ color: theme.colors.brand.black }}>Black Text</Text>
<Text style={{ color: theme.colors.brand.white }}>White Text</Text>
```

**NO gray variations, NO opacity!**

### Font Sizes

Use theme typography:
```typescript
theme.typography.largeTitle  // 34pt
theme.typography.title1      // 28pt
theme.typography.title2      // 22pt
theme.typography.title3      // 20pt
theme.typography.headline    // 17pt semibold
theme.typography.body        // 17pt regular
theme.typography.callout     // 16pt
theme.typography.subheadline // 15pt
theme.typography.footnote    // 13pt
theme.typography.caption     // 12pt
```

---

## Buttons

### Button Colors - ALL USE PRIMARY

```typescript
button: {
  primary: '#ff7664',      // ALL buttons use this color
  primaryText: '#ffffff',  // White text on buttons
}
```

### Button Variants

```tsx
// Primary button - #ff7664 background, white text
<Button variant="primary" title="Continue" />

// Secondary button - #9bcbab background, white text
<Button variant="secondary" title="Maybe Later" />

// Tertiary button - #cda4e8 background, white text
<Button variant="tertiary" title="Info" />

// Ghost button - transparent background, black text
<Button variant="ghost" title="Cancel" />
```

### Rules

- **All buttons use #ff7664** (except secondary/tertiary variants)
- **Button text is always white** (except ghost variant)
- **OAuth buttons exception**: Apple (black bg/white text), Google (white bg/black text)

---

## Backgrounds

### Background Colors

```typescript
background: {
  primary: '#dedfe2',    // Main app background
  secondary: '#ffffff',  // Card backgrounds
  grouped: '#dedfe2',    // Grouped screens
  card: '#ffffff',       // Card/elevated surfaces
}
```

### Usage

```tsx
// Main app screens
<Container variant="grouped">  // Uses #dedfe2
  {children}
</Container>

// Cards
<Card variant="elevated">  // Uses #ffffff with shadow
  {children}
</Card>

// Auth screen
<LinearGradient colors={['#ffb5a7', '#ff9a8a', '#ff7664']}>  // Gradient with #ff7664
  {children}
</LinearGradient>
```

---

## Tab Bar

### Floating Tab Bar Design

```typescript
tabBarStyle: {
  position: 'absolute',              // Floating effect
  backgroundColor: '#ffffff',        // White background
  borderRadius: theme.borderRadius.xl,
  marginHorizontal: theme.spacing.lg,
  marginBottom: Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.md,
  ...theme.shadows.lg,
}
```

### Tab Icons

**Active State**: Icon with colored container (#ff7664 background, white icon)
```tsx
<View style={{
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: theme.colors.brand.primary,
  alignItems: 'center',
  justifyContent: 'center'
}}>
  <Ionicons name="home" size={24} color={theme.colors.brand.white} />
</View>
```

**Inactive State**: Direct black icon (no container)
```tsx
<Ionicons name="home-outline" size={24} color={theme.colors.brand.black} />
```

---

## Spacing & Border Radius

### Spacing Scale (8px grid)

```typescript
spacing: {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
}
```

### Border Radius

```typescript
borderRadius: {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  pill: 9999,    // Buttons
  circle: 9999,  // Icon containers, avatars
}
```

---

## Best Practices

### Colors

1. **Only use approved colors** - Never hardcode colors outside the approved palette
2. **Reference theme** - Always use `theme.colors.brand.*`
3. **No opacity** - Icons and elements use solid colors only
4. **Text is black or white** - No gray text colors

### Icons

1. **With container** - Colored container (32x32 rounded), white icon inside
2. **Without container** - Colored icon directly (e.g., chevrons)
3. **Never use opacity** - Icons always solid
4. **Color assignment** - Primary for main actions, secondary for subscriptions, tertiary for legal

### Buttons

1. **Primary color** - All main buttons use #ff7664
2. **White text** - All button text is white (except ghost)
3. **OAuth exception** - Keep Apple/Google branding

### Backgrounds

1. **Main app** - #dedfe2 for all screens
2. **Auth screen** - Linear gradient with #ff7664
3. **Cards** - White (#ffffff) with shadows
4. **Tab bar** - White, floating with rounded corners

### Typography

1. **Black or white only** - No gray text
2. **No opacity** - Text always solid
3. **Use theme typography** - Never hardcode font sizes

---

## Implementation Examples

### ProfileScreen Icon Row

```tsx
<View style={[styles.iconContainer, { backgroundColor: theme.colors.icon.primary }]}>
  <Ionicons name="help-circle-outline" size={20} color={theme.colors.brand.white} />
</View>
```

### Tab Bar Icon

```tsx
// Active
<View style={styles.activeIconContainer}>
  <Ionicons name="home" size={20} color={theme.colors.brand.white} />
</View>

// Inactive
<Ionicons name="home-outline" size={24} color={theme.colors.brand.black} />
```

### Button

```tsx
<Button
  title="Sign Out"
  variant="primary"  // Uses #ff7664
  onPress={handleSignOut}
/>
```

---

## Quick Reference

### Approved Colors

```
Primary:    #ff7664 (coral/red)
Secondary:  #9bcbab (mint green)
Tertiary:   #cda4e8 (lavender purple)
Background: #dedfe2 (light gray)
Black:      #000000
White:      #ffffff
```

### Icon Container Pattern

```tsx
<View style={{
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: theme.colors.brand.primary,
  alignItems: 'center',
  justifyContent: 'center'
}}>
  <Ionicons name="icon-name" size={20} color={theme.colors.brand.white} />
</View>
```

### Text Pattern

```tsx
// Black text (default)
<Text style={{ color: theme.colors.brand.black }}>Content</Text>

// White text (on colored backgrounds)
<Text style={{ color: theme.colors.brand.white }}>Content</Text>
```

---

**Design System Version**: 3.0 (Strict Color System)
**Last Updated**: 2025

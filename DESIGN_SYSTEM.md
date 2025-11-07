# Food Habit - Apple Design System

This document describes the **Apple Human Interface Guidelines (HIG) compliant** design system for the Food Habit app. The design system follows Apple's 2025 "Liquid Glass" design language with refined colors, typography, spacing, and interaction patterns.

## Overview

The design system is built on Apple's principles:
- **Poppins** font family (Apple-style typography)
- **8px grid** spacing system (Apple's preferred base)
- **Apple System Colors** with semantic variants
- **Responsive scaling** for all iOS devices
- **Haptic feedback** for tactile interactions
- **Smooth animations** with spring physics
- **Pill-shaped buttons** (Apple's signature)
- **Squircle-inspired rounded corners**

## Table of Contents

1. [Colors](#colors)
2. [Typography](#typography)
3. [Spacing & Border Radius](#spacing--border-radius)
4. [Shadows](#shadows)
5. [Animations](#animations)
6. [Haptic Feedback](#haptic-feedback)
7. [Components](#components)
8. [Responsive Design](#responsive-design)
9. [Usage Examples](#usage-examples)
10. [Best Practices](#best-practices)

---

## Colors

### Apple System Colors

Following Apple's official color palette for consistency across iOS.

#### Primary Colors (Apple Green)
Health and food-focused brand color using Apple System Green.

```typescript
primary: {
  50: '#E8F8E9',
  100: '#C8ECC9',
  200: '#A3DFA5',
  300: '#7ED181',
  400: '#62C665',
  500: '#34C759',  // Apple System Green ⭐
  600: '#2FB350',
  700: '#289E45',
  800: '#228A3B',
  900: '#1B6E2C',
}
```

**Usage**: Primary buttons, active states, success indicators, brand elements.

#### Secondary Colors (Apple Orange)
Vibrant accent color for secondary actions.

```typescript
secondary: {
  50: '#FFF4E6',
  100: '#FFE4BF',
  200: '#FFD299',
  300: '#FFC073',
  400: '#FFB357',
  500: '#FF9500',  // Apple System Orange ⭐
  600: '#F58800',
  700: '#E67B00',
  800: '#D66E00',
  900: '#BA5A00',
}
```

**Usage**: Secondary buttons, highlights, call-to-actions.

#### Neutral Colors (Apple Grays)
Refined neutral palette matching Apple's gray scale.

```typescript
neutral: {
  50: '#FAFAFA',
  100: '#F2F2F7',  // Apple System Gray 6
  200: '#E5E5EA',  // Apple System Gray 5
  300: '#D1D1D6',  // Apple System Gray 4
  400: '#C7C7CC',  // Apple System Gray 3
  500: '#AEAEB2',  // Apple System Gray 2
  600: '#8E8E93',  // Apple System Gray
  700: '#636366',  // Apple Label Secondary
  800: '#48484A',  // Apple Label Tertiary
  900: '#1C1C1E',  // Apple Label Primary
}
```

#### iOS System Colors

```typescript
ios: {
  blue: '#007AFF',    // Apple System Blue
  brown: '#A2845E',   // Apple System Brown
  cyan: '#32ADE6',    // Apple System Cyan
  green: '#34C759',   // Apple System Green
  indigo: '#5856D6',  // Apple System Indigo
  mint: '#00C7BE',    // Apple System Mint
  orange: '#FF9500',  // Apple System Orange
  pink: '#FF2D55',    // Apple System Pink
  purple: '#AF52DE',  // Apple System Purple
  red: '#FF3B30',     // Apple System Red
  teal: '#30B0C7',    // Apple System Teal
  yellow: '#FFCC00',  // Apple System Yellow
}
```

#### Semantic Colors

```typescript
success: { main: '#34C759' }  // Apple System Green
error: { main: '#FF3B30' }    // Apple System Red
warning: { main: '#FF9500' }  // Apple System Orange
info: { main: '#007AFF' }     // Apple System Blue
```

#### Text Colors (Label Hierarchy)

```typescript
text: {
  primary: '#000000',      // Label (primary text)
  secondary: '#3C3C43',    // Secondary Label (60% opacity)
  tertiary: '#3C3C4399',   // Tertiary Label (30% opacity)
  quaternary: '#3C3C432E', // Quaternary Label (18% opacity)
  disabled: '#3C3C432E',
  inverse: '#FFFFFF',
  placeholder: '#3C3C4399',
}
```

#### Background Colors

```typescript
background: {
  primary: '#FFFFFF',                    // System Background
  secondary: '#F2F2F7',                  // Secondary System Background
  tertiary: '#FFFFFF',                   // Tertiary System Background
  grouped: '#F2F2F7',                    // System Grouped Background
  card: '#FFFFFF',                       // Card/elevated surface
  blur: 'rgba(255, 255, 255, 0.72)',    // Frosted glass effect
}
```

#### Fill Colors

```typescript
fill: {
  primary: 'rgba(120, 120, 128, 0.20)',
  secondary: 'rgba(120, 120, 128, 0.16)',
  tertiary: 'rgba(118, 118, 128, 0.12)',
  quaternary: 'rgba(116, 116, 128, 0.08)',
}
```

---

## Typography

### Font Family: Poppins

Apple-style typography with natural case (no uppercase transforms).

```typescript
fontFamily: {
  light: 'Poppins_300Light',
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
}
```

### Typography Variants

#### Headings

```typescript
h1: 36px, bold, tight line height
h2: 30px, bold, tight line height
h3: 24px, semiBold, normal line height
h4: 20px, semiBold, normal line height
h5: 18px, semiBold, normal line height
h6: 16px, semiBold, normal line height
```

#### Body Text

```typescript
bodyLarge: 18px, regular, relaxed line height
body: 16px, regular, normal line height
bodySmall: 14px, regular, normal line height
```

#### Buttons (Natural Case - Apple Style)

```typescript
buttonLarge: 20px, semiBold, tight line height
button: 18px, semiBold, tight line height
buttonSmall: 16px, semiBold, tight line height
```

#### Labels & Captions

```typescript
label: 16px, medium
labelSmall: 14px, medium
caption: 12px, regular
footnote: 12px, regular
subtitle1: 18px, medium
subtitle2: 16px, medium
```

---

## Spacing & Border Radius

### Spacing Scale (8px grid)

```typescript
spacing: {
  xs: 4,
  sm: 8,
  md: 12,   // Apple's preferred base
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
}
```

### Border Radius (Squircle-inspired)

Apple uses continuous corner curves (squircles), approximated with standard border radius.

```typescript
borderRadius: {
  none: 0,
  xs: 4,      // Small elements
  sm: 8,      // Buttons, small cards
  md: 12,     // Standard cards, input fields
  lg: 16,     // Large cards
  xl: 20,     // Extra large cards
  '2xl': 24,  // Modals, sheets
  '3xl': 28,  // Extra large modals
  pill: 9999, // Pill-shaped buttons (Apple's signature) ⭐
  circle: 9999, // Circular elements
}
```

---

## Shadows

Apple-style shadows are **subtle and refined**, lighter than Material Design.

```typescript
shadows: {
  none: { shadowOpacity: 0 },
  xs: { shadowOpacity: 0.04, shadowRadius: 2, shadowOffset: { height: 1 } },
  sm: { shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { height: 2 } },
  md: { shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { height: 4 } },
  lg: { shadowOpacity: 0.10, shadowRadius: 16, shadowOffset: { height: 8 } },
  xl: { shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { height: 12 } },
  '2xl': { shadowOpacity: 0.15, shadowRadius: 32, shadowOffset: { height: 16 } },
}
```

---

## Animations

### Duration (milliseconds)

Apple prefers **quick, snappy animations**.

```typescript
duration: {
  instant: 0,
  fast: 200,    // Quick interactions
  normal: 300,  // Standard animations
  slow: 400,    // Page transitions
  slower: 500,  // Modal presentations
}
```

### Easing Curves

```typescript
easing: {
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',  // Element entering
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',    // Element exiting
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',  // iOS signature
}
```

### Spring Animations

Apple's signature spring physics for natural motion.

```typescript
springConfig: {
  default: { damping: 20, mass: 1, stiffness: 200 },
  gentle: { damping: 15, mass: 1, stiffness: 150 },
  bouncy: { damping: 10, mass: 1, stiffness: 100 },
  stiff: { damping: 26, mass: 1, stiffness: 300 },
}
```

---

## Haptic Feedback

Tactile feedback for user interactions using Expo Haptics.

### Haptic Types

```typescript
haptics.light()       // Subtle interactions (toggles, pickers)
haptics.medium()      // Standard interactions (button taps)
haptics.heavy()       // Significant interactions (confirmations)
haptics.success()     // Successful operations
haptics.warning()     // Validation errors
haptics.error()       // Failed operations
haptics.selection()   // Scrolling through picker values
```

### Pre-configured Patterns

```typescript
haptics.patterns.buttonPress()      // Medium impact
haptics.patterns.cardTap()          // Light impact
haptics.patterns.toggle()           // Light impact
haptics.patterns.formSubmitSuccess() // Success notification
haptics.patterns.inputError()       // Error notification
```

---

## Components

### Button Component

Pill-shaped buttons with haptic feedback and animations.

**Variants**: `primary` | `secondary` | `tertiary` | `ghost` | `destructive`
**Sizes**: `small` | `medium` | `large`

```tsx
import { Button } from '../components';

<Button
  title="Continue"
  onPress={handlePress}
  variant="primary"
  size="large"
  fullWidth
  hapticFeedback
/>
```

**Features**:
- Pill-shaped (borderRadius: 9999)
- Spring animation on press (scale: 0.96)
- Haptic feedback
- Loading state with spinner
- Icon support

### Card Component

Refined cards with Apple-style rounded corners.

**Variants**: `elevated` | `outlined` | `filled`
**Padding**: `none` | `small` | `medium` | `large`

```tsx
import { Card } from '../components';

<Card variant="elevated" padding="large" pressable onPress={handlePress}>
  <Text variant="h4">Card Title</Text>
  <Text variant="body">Card content</Text>
</Card>
```

**Features**:
- Rounded corners (borderRadius: 16)
- Subtle shadows
- Pressable with scale animation
- Haptic feedback

### Container Component

Safe area-aware container with Apple-style backgrounds.

**Variants**: `default` | `grouped` | `card`

```tsx
import { Container } from '../components';

<Container variant="grouped" scrollable safeArea>
  {children}
</Container>
```

**Features**:
- Safe area handling
- Keyboard avoidance
- Scrollable option
- Responsive padding

### Text Component

Typography component with Apple's label hierarchy.

**Variants**: `h1` | `h2` | `h3` | `body` | `button` | `label` | `caption`
**Colors**: `primary` | `secondary` | `tertiary` | `quaternary` | `inverse`

```tsx
import { Text } from '../components';

<Text variant="h1" color="primary" align="center">
  Welcome
</Text>
```

### Input Component

Text input with Apple-style design.

```tsx
import { Input } from '../components';

<Input
  label="Email"
  placeholder="Enter your email"
  error={errors.email}
  leftIcon={<Icon name="mail" />}
/>
```

**Features**:
- Focus state with border highlight
- Error state
- Helper text
- Icon support
- Haptic feedback on focus

---

## Responsive Design

### Device Breakpoints

```typescript
breakpoints: {
  small: 375,    // iPhone SE
  medium: 390,   // iPhone 13
  large: 428,    // iPhone 13 Pro Max
  tablet: 768,   // iPad mini
  desktop: 1024, // iPad Pro
}
```

### Responsive Utilities

```typescript
import { r } from '../theme';

// Scale based on screen dimensions
r.scaleWidth(320)
r.scaleHeight(50)
r.scaleFontSize(16)

// Percentage-based
r.hp(50)  // 50% of height
r.vp(80)  // 80% of width

// Adaptive values
r.adaptiveSpacing.lg
r.adaptiveFontSize.xl

// Conditional values
r.responsive({ small: 12, medium: 16, large: 20 })
```

---

## Usage Examples

### Screen with Apple Design

```tsx
import { Container, Text, Card, Button } from '../components';
import { theme, r, haptics } from '../theme';

export default function HomeScreen() {
  const handlePress = () => {
    haptics.patterns.buttonPress();
    // Handle action
  };

  return (
    <Container variant="grouped" scrollable>
      <Text variant="h1" style={{ marginBottom: r.adaptiveSpacing.lg }}>
        Welcome
      </Text>

      <Card variant="elevated" padding="large" pressable onPress={handlePress}>
        <Text variant="h4" weight="semiBold">
          Start Tracking
        </Text>
        <Text variant="body" color="secondary">
          Begin your healthy eating journey
        </Text>
      </Card>

      <Button
        title="Get Started"
        onPress={handlePress}
        variant="primary"
        size="large"
        fullWidth
      />
    </Container>
  );
}
```

### Custom Styles with Theme

```tsx
import { StyleSheet } from 'react-native';
import { theme, r } from '../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.grouped,
    padding: r.adaptiveSpacing.lg,
  },

  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: r.adaptiveSpacing.xl,
    ...theme.shadows.md,
  },

  heading: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
});
```

---

## Best Practices

### Apple Design Principles

1. **Clarity**: Use clear, readable text with proper hierarchy
2. **Deference**: Let content take center stage with subtle UI elements
3. **Depth**: Use shadows and layers to create visual hierarchy

### Button Guidelines

- Use **pill-shaped buttons** for primary actions
- Minimum touch target: **44x44 points** (iOS HIG requirement)
- Add **haptic feedback** for all interactive elements
- Use **natural case** (not uppercase) for button text
- Implement **spring animations** for press states

### Color Usage

- Use **Apple System Colors** for consistency
- Follow **label hierarchy** for text colors
- Use **semantic colors** for success/error/warning states
- Maintain **sufficient contrast** for accessibility (WCAG AA)

### Typography

- Use **left-aligned text** (Apple's default)
- Follow **Apple's text size guidelines**:
  - Large Title: 34pt
  - Title 1: 28pt
  - Headline: 17pt semibold
  - Body: 17pt regular
- Use **natural case** for all UI text (not uppercase)

### Spacing

- Follow **8px grid system**
- Use **12px as base spacing** (Apple's preference)
- Maintain **consistent padding** in cards and containers
- Use **adaptive spacing** for different device sizes

### Animations

- Keep animations **quick and snappy** (200-300ms)
- Use **spring animations** for natural feel
- Scale buttons to **0.96** on press
- Use **deceleration curve** for entering elements
- Use **acceleration curve** for exiting elements

### Haptics

- Add haptic feedback to all **interactive elements**
- Use **light impact** for subtle interactions
- Use **medium impact** for standard buttons
- Use **success/error notifications** for form submissions
- Don't overuse haptics (be intentional)

### Accessibility

- Ensure **44x44pt minimum touch targets**
- Maintain **4.5:1 contrast ratio** for text
- Support **Dynamic Type** (font scaling)
- Provide **VoiceOver labels**
- Test with **Accessibility Inspector**

---

## Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Apple Design Resources](https://developer.apple.com/design/resources/)
- [iOS Design Patterns](https://developer.apple.com/design/tips/)
- [Expo Haptics Documentation](https://docs.expo.dev/versions/latest/sdk/haptics/)

---

## Quick Reference

### Import Theme

```tsx
import { theme, r, haptics } from '../theme';
```

### Import Components

```tsx
import { Button, Card, Container, Text, Input } from '../components';
```

### Common Patterns

```tsx
// Pill button
<Button title="Continue" variant="primary" size="large" fullWidth />

// Elevated card
<Card variant="elevated" padding="large">...</Card>

// Scrollable container
<Container variant="grouped" scrollable>...</Container>

// Heading with color
<Text variant="h1" color="primary">Title</Text>

// Haptic feedback
haptics.patterns.buttonPress();

// Responsive spacing
style={{ marginBottom: r.adaptiveSpacing.xl }}

// Shadow
style={{ ...theme.shadows.md }}
```

---

**Last Updated**: 2025
**Design System Version**: 2.0 (Apple HIG Compliant)

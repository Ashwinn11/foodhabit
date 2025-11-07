# Food Habit Design System

This document describes the design system for the Food Habit iOS app, including colors, typography, spacing, and responsive utilities.

## Overview

The design system is built on:
- **Poppins** font family (300-700 weights)
- **8px grid** spacing system
- **Material Design** color palette
- **Responsive scaling** for all iOS devices
- **iOS design guidelines** compliance

## Table of Contents

1. [Colors](#colors)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Responsive Utilities](#responsive-utilities)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)

## Colors

### Primary Colors (Green)

Main brand color for primary actions, buttons, and highlights.

```typescript
primary: {
  50: '#E8F5E9',   // Lightest
  100: '#C8E6C9',
  200: '#A5D6A7',
  300: '#81C784',
  400: '#66BB6A',
  500: '#4CAF50',  // Main brand color ⭐
  600: '#43A047',
  700: '#388E3C',
  800: '#2E7D32',
  900: '#1B5E20',  // Darkest
}
```

**Usage**: Primary buttons, active states, success indicators, brand elements.

### Secondary Colors (Orange)

Accent color for secondary actions and highlights.

```typescript
secondary: {
  50: '#FFF3E0',
  500: '#FF9800',  // Main secondary color
  900: '#E65100',
}
```

**Usage**: Secondary buttons, badges, call-to-action elements.

### Neutral Colors (Gray Scale)

Used for backgrounds, borders, and text colors.

```typescript
neutral: {
  50: '#FAFAFA',   // Very light gray
  100: '#F5F5F5',  // Light gray
  200: '#EEEEEE',
  300: '#E0E0E0',  // Border light
  400: '#BDBDBD',  // Border dark
  500: '#9E9E9E',  // Disabled text
  600: '#757575',
  700: '#616161',  // Secondary text
  800: '#424242',
  900: '#212121',  // Primary text
}
```

### Semantic Colors

Pre-defined colors for specific UI states.

```typescript
colors: {
  background: {
    primary: '#FFFFFF',    // Main background
    secondary: '#F5F5F5',  // Card backgrounds
    tertiary: '#FAFAFA',   // Subtle backgrounds
  },
  text: {
    primary: '#212121',    // Main text
    secondary: '#616161',  // Subtitle, labels
    disabled: '#9E9E9E',   // Disabled text
    inverse: '#FFFFFF',    // Text on dark backgrounds
  },
  border: {
    light: '#EEEEEE',
    main: '#E0E0E0',
    dark: '#BDBDBD',
  },
  success: {
    light: '#81C784',
    main: '#4CAF50',
    dark: '#388E3C',
  },
  error: {
    light: '#E57373',
    main: '#F44336',
    dark: '#D32F2F',
  },
  warning: {
    light: '#FFB74D',
    main: '#FF9800',
    dark: '#F57C00',
  },
  info: {
    light: '#64B5F6',
    main: '#2196F3',
    dark: '#1976D2',
  },
}
```

### iOS System Colors

Native iOS colors for system-level consistency.

```typescript
ios: {
  blue: '#007AFF',
  green: '#34C759',
  indigo: '#5856D6',
  orange: '#FF9500',
  pink: '#FF2D55',
  purple: '#AF52DE',
  red: '#FF3B30',
  teal: '#5AC8FA',
  yellow: '#FFCC00',
}
```

## Typography

### Font Family: Poppins

All text uses the Poppins font family with the following weights:

```typescript
fontFamily: {
  light: 'Poppins_300Light',      // Captions, labels
  regular: 'Poppins_400Regular',  // Body text
  medium: 'Poppins_500Medium',    // Emphasized body
  semiBold: 'Poppins_600SemiBold',// Subheadings
  bold: 'Poppins_700Bold',        // Headings
}
```

### Typography Variants

Pre-defined text styles for consistent typography across the app.

#### Headings

```typescript
h1: {
  fontFamily: 'Poppins_700Bold',
  fontSize: 36,
  lineHeight: 43.2,
  letterSpacing: -0.5,
}

h2: {
  fontFamily: 'Poppins_700Bold',
  fontSize: 30,
  lineHeight: 36,
  letterSpacing: -0.5,
}

h3: {
  fontFamily: 'Poppins_600SemiBold',
  fontSize: 24,
  lineHeight: 28.8,
}

h4: {
  fontFamily: 'Poppins_600SemiBold',
  fontSize: 20,
  lineHeight: 24,
}

h5: {
  fontFamily: 'Poppins_600SemiBold',
  fontSize: 18,
  lineHeight: 21.6,
}

h6: {
  fontFamily: 'Poppins_600SemiBold',
  fontSize: 16,
  lineHeight: 19.2,
}
```

#### Body Text

```typescript
body: {
  fontFamily: 'Poppins_400Regular',
  fontSize: 16,
  lineHeight: 24,
}

bodyLarge: {
  fontFamily: 'Poppins_400Regular',
  fontSize: 18,
  lineHeight: 27,
}

bodySmall: {
  fontFamily: 'Poppins_400Regular',
  fontSize: 14,
  lineHeight: 21,
}
```

#### UI Elements

```typescript
button: {
  fontFamily: 'Poppins_600SemiBold',
  fontSize: 16,
  lineHeight: 24,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
}

label: {
  fontFamily: 'Poppins_500Medium',
  fontSize: 14,
  lineHeight: 20,
  letterSpacing: 0.15,
}

caption: {
  fontFamily: 'Poppins_400Regular',
  fontSize: 12,
  lineHeight: 18,
}

overline: {
  fontFamily: 'Poppins_500Medium',
  fontSize: 10,
  lineHeight: 16,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
}
```

## Spacing

### 8px Grid System

All spacing follows an 8px grid for consistency.

```typescript
spacing: {
  xs: 4,    // 0.5x
  sm: 8,    // 1x
  md: 16,   // 2x
  lg: 24,   // 3x
  xl: 32,   // 4x
  '2xl': 48, // 6x
  '3xl': 64, // 8x
}
```

**Usage**:
- `xs` (4px): Tight spacing, icon padding
- `sm` (8px): List item spacing, small gaps
- `md` (16px): Default spacing between elements
- `lg` (24px): Section spacing
- `xl` (32px): Large section spacing
- `2xl` (48px): Page section spacing
- `3xl` (64px): Major layout spacing

### Border Radius

```typescript
borderRadius: {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
}
```

**Usage**:
- `sm` (4px): Small buttons, chips
- `md` (8px): Default buttons, cards
- `lg` (12px): Large cards, modals
- `xl` (16px): Hero sections
- `full`: Circular elements (avatars, pills)

### Shadows

iOS-style shadow presets for depth and elevation.

```typescript
shadows: {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 3.84,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5.46,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 8.30,
    elevation: 6,
  },
}
```

**Usage**:
- `sm`: Floating buttons, chips
- `md`: Cards, list items
- `lg`: Modals, dialogs
- `xl`: Bottom sheets, major UI elements

## Responsive Utilities

### Device Breakpoints

Based on common iOS device screen widths:

```typescript
breakpoints: {
  small: 375,    // iPhone SE, iPhone 13 mini
  medium: 390,   // iPhone 13, iPhone 13 Pro (base)
  large: 428,    // iPhone 13 Pro Max, iPhone 14 Plus
  tablet: 768,   // iPad mini
  desktop: 1024, // iPad Pro
}
```

### Scaling Functions

#### Width Scaling
Scales values proportionally to screen width (base: iPhone 13 - 390px).

```typescript
r.scaleWidth(size: number): number
```

**Example**:
```typescript
width: r.scaleWidth(300) // 300px on iPhone 13, scales on other devices
```

#### Height Scaling
Scales values proportionally to screen height (base: iPhone 13 - 844px).

```typescript
r.scaleHeight(size: number): number
```

#### Font Size Scaling
Scales font sizes with pixel ratio for crisp text.

```typescript
r.scaleFontSize(size: number): number
```

#### Moderate Scaling
Less aggressive scaling (50% by default) - ideal for spacing and padding.

```typescript
r.moderateScale(size: number, factor?: number): number
```

**Example**:
```typescript
padding: r.moderateScale(20) // Less aggressive than scaleWidth
```

### Percentage-Based Scaling

```typescript
r.hp(percentage: number): number  // Horizontal percentage
r.vp(percentage: number): number  // Vertical percentage
```

**Example**:
```typescript
width: r.hp(80)  // 80% of screen width
height: r.vp(50) // 50% of screen height
```

### Responsive Value Selector

Choose different values based on device size.

```typescript
r.responsive<T>(values: {
  small?: T;
  medium?: T;
  large?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}): T
```

**Example**:
```typescript
fontSize: r.responsive({
  small: 14,
  medium: 16,
  large: 16,
  tablet: 18,
  default: 16,
})
```

### Adaptive Spacing

Pre-calculated responsive spacing values.

```typescript
r.adaptiveSpacing: {
  xs: 2-4,   // Device dependent
  sm: 6-8,
  md: 12-16,
  lg: 18-24,
  xl: 24-32,
}
```

**Example**:
```typescript
padding: r.adaptiveSpacing.md // Automatically adjusts to device
```

### Adaptive Font Sizes

Pre-calculated responsive font sizes.

```typescript
r.adaptiveFontSize: {
  xs: 11-12,
  sm: 13-14,
  md: 15-16,
  lg: 17-18,
  xl: 19-20,
  '2xl': 22-24,
  '3xl': 28-32,
}
```

### Device Detection

```typescript
theme.isTablet: boolean
theme.isSmallDevice: boolean
theme.deviceSize: 'small' | 'medium' | 'large' | 'tablet' | 'desktop'
```

## Usage Examples

### Basic Import

```typescript
import { theme, r } from './src/theme';
```

### Using Colors

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
  },
  text: {
    color: theme.colors.text.primary,
  },
  button: {
    backgroundColor: theme.colors.primary[500],
  },
  border: {
    borderColor: theme.colors.border.main,
    borderWidth: 1,
  },
});
```

### Using Typography

```typescript
const styles = StyleSheet.create({
  heading: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  button: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
  },
});
```

### Using Spacing

```typescript
const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.md,
  },
});
```

### Using Responsive Utilities

```typescript
const styles = StyleSheet.create({
  container: {
    width: r.scaleWidth(350),
    padding: r.adaptiveSpacing.lg,
  },
  heading: {
    ...theme.typography.h1,
    fontSize: r.adaptiveFontSize['2xl'],
  },
  image: {
    width: r.hp(80),  // 80% of screen width
    height: r.vp(30), // 30% of screen height
  },
  responsiveCard: {
    padding: r.responsive({
      small: 12,
      medium: 16,
      large: 20,
      tablet: 24,
      default: 16,
    }),
  },
});
```

### Complete Example

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme, r } from './src/theme';

export default function MyComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome</Text>
      <Text style={styles.body}>This is a sample component using the design system.</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    padding: r.adaptiveSpacing.lg,
    justifyContent: 'center',
  },
  heading: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
  },
  button: {
    backgroundColor: theme.colors.primary[500],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  buttonText: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
  },
});
```

## Best Practices

### Colors

1. **Always use semantic colors** for consistency:
   - ✅ `theme.colors.text.primary`
   - ❌ `theme.colors.neutral[900]`

2. **Use primary color for main actions**:
   - Primary buttons, active states, brand elements

3. **Use neutral colors for UI structure**:
   - Backgrounds, borders, dividers

4. **Use semantic colors for feedback**:
   - Success: Green
   - Error: Red
   - Warning: Orange
   - Info: Blue

### Typography

1. **Always use typography variants**:
   - ✅ `...theme.typography.h1`
   - ❌ `fontSize: 36, fontWeight: 'bold'`

2. **Match variant to purpose**:
   - Headings: h1-h6
   - Body text: body, bodyLarge, bodySmall
   - UI elements: button, label, caption

3. **Don't override font family** unless absolutely necessary

4. **Use letter spacing** from variants (don't override)

### Spacing

1. **Stick to the 8px grid**:
   - ✅ Use spacing values from theme
   - ❌ Don't use arbitrary values (7px, 13px, etc.)

2. **Use consistent spacing patterns**:
   - Small gaps: `spacing.sm`
   - Default spacing: `spacing.md`
   - Section spacing: `spacing.lg` or `spacing.xl`

3. **Apply shadows appropriately**:
   - Cards: `shadows.md`
   - Modals: `shadows.lg`
   - Floating buttons: `shadows.sm`

### Responsive Design

1. **Always use scaling for dimensions**:
   - ✅ `width: r.scaleWidth(300)`
   - ❌ `width: 300`

2. **Use adaptive spacing/fonts** when possible:
   - ✅ `padding: r.adaptiveSpacing.lg`
   - ✅ `fontSize: r.adaptiveFontSize.md`

3. **Use moderateScale for spacing** (less aggressive):
   - ✅ `padding: r.moderateScale(20)`

4. **Test on different device sizes**:
   - iPhone SE (small)
   - iPhone 13 (medium)
   - iPhone 13 Pro Max (large)
   - iPad mini (tablet)

5. **Use responsive values for complex layouts**:
   ```typescript
   columns: r.responsive({
     small: 1,
     medium: 2,
     tablet: 3,
     default: 2,
   })
   ```

### General Guidelines

1. **Import once at the top**:
   ```typescript
   import { theme, r } from './src/theme';
   ```

2. **Don't mix hardcoded values with theme values**

3. **Create custom variants** if needed:
   ```typescript
   const customHeading = {
     ...theme.typography.h2,
     color: theme.colors.primary[500],
   };
   ```

4. **Document any deviations** from the design system

5. **Keep the design system centralized** - don't create duplicate color/spacing definitions

## Updating the Design System

If you need to modify the design system:

1. **Update the source files** in `src/theme/`:
   - `colors.ts` - Color palette
   - `typography.ts` - Font family and variants
   - `spacing.ts` - Spacing, border radius, shadows
   - `responsive.ts` - Breakpoints and scaling

2. **Test changes** across all screen sizes

3. **Update this documentation**

4. **Communicate changes** to the team

## Resources

- [Poppins Font](https://fonts.google.com/specimen/Poppins)
- [Material Design Color System](https://material.io/design/color)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [8-Point Grid System](https://spec.fm/specifics/8-pt-grid)

## Support

For questions or suggestions about the design system, please reach out to the design team.

# Component Library - Usage Guide

Complete guide for using the Apple-designed component library in Food Habit.

## Table of Contents

1. [Button Component](#button-component)
2. [Card Component](#card-component)
3. [Container Component](#container-component)
4. [Text Component](#text-component)
5. [Input Component](#input-component)

---

## Button Component

### Import

```tsx
import { Button } from '../components';
```

### Basic Usage

```tsx
<Button
  title="Continue"
  onPress={() => console.log('Pressed')}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Button text content |
| `onPress` | `() => void` | required | Button press handler |
| `variant` | `'primary' \| 'secondary' \| 'tertiary' \| 'ghost' \| 'destructive'` | `'primary'` | Visual style variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state with spinner |
| `fullWidth` | `boolean` | `false` | Full width button |
| `icon` | `React.ReactNode` | `undefined` | Custom icon component |
| `style` | `ViewStyle` | `undefined` | Custom button style |
| `textStyle` | `TextStyle` | `undefined` | Custom text style |
| `hapticFeedback` | `boolean` | `true` | Enable haptic feedback |

### Variants

#### Primary Button
```tsx
<Button
  title="Get Started"
  onPress={handlePress}
  variant="primary"
  size="large"
  fullWidth
/>
```

#### Secondary Button
```tsx
<Button
  title="Learn More"
  onPress={handlePress}
  variant="secondary"
  size="medium"
/>
```

#### Tertiary Button (Subtle)
```tsx
<Button
  title="Maybe Later"
  onPress={handlePress}
  variant="tertiary"
/>
```

#### Ghost Button (Outlined)
```tsx
<Button
  title="Cancel"
  onPress={handlePress}
  variant="ghost"
/>
```

#### Destructive Button
```tsx
<Button
  title="Delete Account"
  onPress={handlePress}
  variant="destructive"
/>
```

### With Icon

```tsx
import { Ionicons } from '@expo/vector-icons';

<Button
  title="Add Item"
  onPress={handlePress}
  icon={<Ionicons name="add" size={20} color="#fff" />}
/>
```

### Loading State

```tsx
<Button
  title="Submitting..."
  onPress={handleSubmit}
  loading={isLoading}
  disabled={isLoading}
/>
```

---

## Card Component

### Import

```tsx
import { Card } from '../components';
```

### Basic Usage

```tsx
<Card variant="elevated" padding="large">
  <Text>Card content</Text>
</Card>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | required | Card content |
| `variant` | `'elevated' \| 'outlined' \| 'filled'` | `'elevated'` | Visual style variant |
| `padding` | `'none' \| 'small' \| 'medium' \| 'large'` | `'medium'` | Internal padding |
| `pressable` | `boolean` | `false` | Make card tappable |
| `onPress` | `() => void` | `undefined` | Press handler |
| `style` | `ViewStyle` | `undefined` | Custom card style |
| `hapticFeedback` | `boolean` | `true` | Enable haptic feedback |

### Variants

#### Elevated Card (with shadow)
```tsx
<Card variant="elevated" padding="large">
  <Text variant="h4">Meals Today</Text>
  <Text variant="h1" style={{ color: theme.colors.primary[500] }}>
    5
  </Text>
</Card>
```

#### Outlined Card
```tsx
<Card variant="outlined" padding="medium">
  <Text>Outlined card content</Text>
</Card>
```

#### Filled Card
```tsx
<Card variant="filled" padding="large">
  <Text>Filled card with background color</Text>
</Card>
```

### Pressable Card

```tsx
<Card
  variant="elevated"
  padding="large"
  pressable
  onPress={() => navigation.navigate('Details')}
>
  <Text variant="h4">Tap me</Text>
  <Text variant="body" color="secondary">
    This card is interactive
  </Text>
</Card>
```

### Stats Card Example

```tsx
<View style={{ flexDirection: 'row', gap: 16 }}>
  <Card variant="elevated" padding="large" style={{ flex: 1 }}>
    <Text variant="h1" style={{ color: theme.colors.primary[500] }}>
      0
    </Text>
    <Text variant="label" color="secondary">
      Meals Logged
    </Text>
  </Card>

  <Card variant="elevated" padding="large" style={{ flex: 1 }}>
    <Text variant="h1" style={{ color: theme.colors.primary[500] }}>
      0
    </Text>
    <Text variant="label" color="secondary">
      Days Tracked
    </Text>
  </Card>
</View>
```

---

## Container Component

### Import

```tsx
import { Container } from '../components';
```

### Basic Usage

```tsx
<Container variant="default">
  <Text>Content</Text>
</Container>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | required | Container content |
| `variant` | `'default' \| 'grouped' \| 'card'` | `'default'` | Background variant |
| `safeArea` | `boolean` | `true` | Enable safe area insets |
| `scrollable` | `boolean` | `false` | Enable scrolling |
| `padding` | `boolean` | `true` | Horizontal padding |
| `center` | `boolean` | `false` | Center content vertically |
| `keyboardAvoiding` | `boolean` | `false` | Enable keyboard avoiding |
| `style` | `ViewStyle` | `undefined` | Custom style |

### Screen Container

```tsx
export default function HomeScreen() {
  return (
    <Container variant="grouped" scrollable>
      <Text variant="h1">Home</Text>
      {/* Screen content */}
    </Container>
  );
}
```

### Centered Content

```tsx
<Container variant="default" center>
  <Text variant="h1">Welcome</Text>
  <Button title="Get Started" onPress={handlePress} />
</Container>
```

### With Keyboard Avoidance (for forms)

```tsx
<Container variant="default" scrollable keyboardAvoiding>
  <Input label="Name" placeholder="Enter your name" />
  <Input label="Email" placeholder="Enter your email" />
  <Button title="Submit" onPress={handleSubmit} />
</Container>
```

### Without Padding

```tsx
<Container variant="default" padding={false}>
  {/* Full-width content */}
</Container>
```

---

## Text Component

### Import

```tsx
import { Text } from '../components';
```

### Basic Usage

```tsx
<Text variant="body">Hello World</Text>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | required | Text content |
| `variant` | See variants below | `'body'` | Typography variant |
| `color` | `'primary' \| 'secondary' \| 'tertiary' \| 'quaternary' \| 'disabled' \| 'inverse' \| 'placeholder'` | `'primary'` | Text color |
| `align` | `'left' \| 'center' \| 'right' \| 'justify'` | `undefined` | Text alignment |
| `weight` | `'light' \| 'regular' \| 'medium' \| 'semiBold' \| 'bold'` | `undefined` | Font weight override |
| `numberOfLines` | `number` | `undefined` | Max lines to display |
| `style` | `TextStyle` | `undefined` | Custom style |
| `onPress` | `() => void` | `undefined` | Press handler |

### Typography Variants

- **Headings**: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- **Subtitles**: `subtitle1`, `subtitle2`
- **Body**: `bodyLarge`, `body`, `bodySmall`
- **Buttons**: `buttonLarge`, `button`, `buttonSmall`
- **Labels**: `label`, `labelSmall`
- **Other**: `caption`, `footnote`

### Examples

#### Headings
```tsx
<Text variant="h1">Large Heading</Text>
<Text variant="h2">Medium Heading</Text>
<Text variant="h3">Small Heading</Text>
```

#### Body Text with Colors
```tsx
<Text variant="body" color="primary">
  Primary text
</Text>
<Text variant="body" color="secondary">
  Secondary text
</Text>
<Text variant="body" color="tertiary">
  Tertiary text (subtle)
</Text>
```

#### Aligned Text
```tsx
<Text variant="h2" align="center">
  Centered Heading
</Text>
```

#### With Custom Weight
```tsx
<Text variant="body" weight="bold">
  Bold body text
</Text>
```

#### Truncated Text
```tsx
<Text variant="body" numberOfLines={2}>
  This is a long text that will be truncated after two lines...
</Text>
```

#### Tappable Text
```tsx
<Text
  variant="label"
  color="secondary"
  onPress={() => console.log('Tapped')}
>
  Tap me
</Text>
```

---

## Input Component

### Import

```tsx
import { Input } from '../components';
```

### Basic Usage

```tsx
<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Input label |
| `error` | `string` | `undefined` | Error message |
| `helperText` | `string` | `undefined` | Helper text |
| `leftIcon` | `React.ReactNode` | `undefined` | Left icon component |
| `rightIcon` | `React.ReactNode` | `undefined` | Right icon component |
| `disabled` | `boolean` | `false` | Disabled state |
| `containerStyle` | `ViewStyle` | `undefined` | Custom container style |
| `inputStyle` | `TextStyle` | `undefined` | Custom input style |
| `hapticFeedback` | `boolean` | `true` | Enable haptic on focus |
| All `TextInput` props | | | Supports all React Native TextInput props |

### Examples

#### Text Input with Label
```tsx
<Input
  label="Full Name"
  placeholder="Enter your full name"
  value={name}
  onChangeText={setName}
/>
```

#### Email Input
```tsx
<Input
  label="Email"
  placeholder="your@email.com"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  autoComplete="email"
/>
```

#### Password Input
```tsx
const [showPassword, setShowPassword] = useState(false);

<Input
  label="Password"
  placeholder="Enter your password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry={!showPassword}
  rightIcon={
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
      <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} />
    </TouchableOpacity>
  }
/>
```

#### Input with Icons
```tsx
import { Ionicons } from '@expo/vector-icons';

<Input
  label="Search"
  placeholder="Search foods..."
  value={search}
  onChangeText={setSearch}
  leftIcon={<Ionicons name="search" size={20} color="#8E8E93" />}
/>
```

#### Input with Error
```tsx
<Input
  label="Email"
  placeholder="your@email.com"
  value={email}
  onChangeText={setEmail}
  error={emailError}
/>
```

#### Input with Helper Text
```tsx
<Input
  label="Username"
  placeholder="Choose a username"
  value={username}
  onChangeText={setUsername}
  helperText="Username must be at least 3 characters"
/>
```

#### Disabled Input
```tsx
<Input
  label="User ID"
  value={userId}
  disabled
/>
```

#### Multiline Input
```tsx
<Input
  label="Notes"
  placeholder="Add your notes..."
  value={notes}
  onChangeText={setNotes}
  multiline
  numberOfLines={4}
  inputStyle={{ height: 100, textAlignVertical: 'top' }}
/>
```

---

## Complete Form Example

```tsx
import React, { useState } from 'react';
import { Container, Text, Input, Button } from '../components';
import { haptics } from '../theme';

export default function FormScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { name?: string; email?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      haptics.patterns.inputError();
      return;
    }

    setLoading(true);
    try {
      // Submit form
      await submitForm({ name, email });
      haptics.patterns.formSubmitSuccess();
    } catch (error) {
      haptics.patterns.error();
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container variant="default" scrollable keyboardAvoiding>
      <Text variant="h1" style={{ marginBottom: 24 }}>
        Create Profile
      </Text>

      <Input
        label="Full Name"
        placeholder="Enter your full name"
        value={name}
        onChangeText={setName}
        error={errors.name}
      />

      <Input
        label="Email"
        placeholder="your@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <Button
        title="Create Profile"
        onPress={handleSubmit}
        variant="primary"
        size="large"
        fullWidth
        loading={loading}
        disabled={loading}
        style={{ marginTop: 24 }}
      />
    </Container>
  );
}
```

---

## Complete Screen Example

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Container, Text, Card, Button } from '../components';
import { theme, r, haptics } from '../theme';

export default function DashboardScreen() {
  const handleAction = () => {
    haptics.patterns.buttonPress();
    // Handle action
  };

  return (
    <Container variant="grouped" scrollable>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h5" color="secondary">
          Good Morning
        </Text>
        <Text variant="h2">John Doe</Text>
      </View>

      {/* Welcome Card */}
      <Card variant="filled" padding="large" style={styles.welcomeCard}>
        <Text variant="h4" weight="semiBold" style={styles.welcomeTitle}>
          Welcome to Food Habit
        </Text>
        <Text variant="body" color="secondary">
          Track your eating habits and build healthier routines.
        </Text>
      </Card>

      {/* Stats */}
      <Text variant="h4" style={styles.sectionTitle}>
        Quick Stats
      </Text>

      <View style={styles.statsGrid}>
        <Card variant="elevated" padding="large" style={styles.statCard}>
          <Text variant="h1" style={styles.statValue}>5</Text>
          <Text variant="label" color="secondary" align="center">
            Meals Logged
          </Text>
        </Card>

        <Card variant="elevated" padding="large" style={styles.statCard}>
          <Text variant="h1" style={styles.statValue}>7</Text>
          <Text variant="label" color="secondary" align="center">
            Days Tracked
          </Text>
        </Card>
      </View>

      {/* Action Button */}
      <Button
        title="Log Today's Meal"
        onPress={handleAction}
        variant="primary"
        size="large"
        fullWidth
        style={styles.actionButton}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: r.adaptiveSpacing['2xl'],
  },
  welcomeCard: {
    marginBottom: r.adaptiveSpacing['2xl'],
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[500],
  },
  welcomeTitle: {
    color: theme.colors.primary[700],
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    marginBottom: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: r.adaptiveSpacing['2xl'],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.primary[500],
    marginBottom: theme.spacing.sm,
  },
  actionButton: {
    marginTop: theme.spacing.xl,
  },
});
```

---

## Tips & Best Practices

1. **Always use the theme**: Import `theme`, `r`, and `haptics` for consistency
2. **Haptic feedback**: Enable for all interactive elements
3. **Responsive sizing**: Use `r.adaptiveSpacing` and `r.scaleHeight/Width`
4. **Color hierarchy**: Use Apple's label hierarchy for text colors
5. **Pill buttons**: Use for primary actions to match Apple's design
6. **Natural case**: Never use uppercase transforms on buttons/text
7. **Safe areas**: Always use `Container` with `safeArea` for screens
8. **Animations**: Let the components handle animations automatically
9. **Accessibility**: Provide meaningful labels for screen readers
10. **Testing**: Test on different device sizes using responsive utilities

# Food Habit - Development Guidelines

**CRITICAL**: This document contains strict rules and guidelines for the Food Habit React Native Expo project. All development MUST follow these guidelines to ensure consistency, prevent Expo configuration issues, and maintain code quality.

---

## Table of Contents

1. [Expo Package Management](#expo-package-management)
2. [Design System Rules](#design-system-rules)
3. [Responsive Design Guidelines](#responsive-design-guidelines)
4. [Code Style and Conventions](#code-style-and-conventions)
5. [Authentication Flow](#authentication-flow)
6. [Testing and Debugging](#testing-and-debugging)

---

## Expo Package Management

### CRITICAL: Always Use Expo-Compatible Versions

**RULE**: NEVER install packages using `npm install` directly. ALWAYS use `npx expo install`.

#### Why Expo Install is Required

Expo manages package versions to ensure compatibility with the current SDK version. Using `npm install` can install incompatible versions that cause runtime errors or build failures.

**Official Documentation**: https://docs.expo.dev/more/expo-cli/#install

#### Correct Package Installation

```bash
# ✅ CORRECT - Use expo install
npx expo install react-native-reanimated
npx expo install expo-font
npx expo install @expo-google-fonts/poppins

# ❌ WRONG - Never use npm install directly for expo packages
npm install react-native-reanimated
npm install expo-font
```

#### Installing Multiple Packages

```bash
# Install multiple packages at once
npx expo install react-native-reanimated expo-font @expo-google-fonts/poppins
```

#### Checking Package Compatibility

```bash
# Check if packages are compatible with your Expo SDK version
npx expo install --check
```

**Documentation**: https://docs.expo.dev/workflow/using-libraries/

---

### Plugin Configuration

**RULE**: Only add packages to the `plugins` array in app.json if they explicitly require it in their documentation.

#### Checking if a Plugin is Required

Before adding a package to the plugins array:

1. Check the package's Expo documentation page
2. Look for "Configuration in app.json" or "Add to plugins" sections
3. Only add if explicitly stated

**Example: expo-apple-authentication**
- Documentation: https://docs.expo.dev/versions/latest/sdk/apple-authentication/
- Requires plugin: YES - explicitly stated in docs

**Example: react-native-reanimated**
- Documentation: https://docs.expo.dev/versions/latest/sdk/reanimated/
- For Expo SDK 51+: Plugin is automatically configured, DO NOT add manually
- For Expo SDK <51: Plugin may be required

#### Current Plugin Configuration

```json
{
  "plugins": [
    "expo-apple-authentication",
    "expo-web-browser"
  ]
}
```

**DO NOT ADD**:
- `react-native-reanimated` - Auto-configured in modern Expo versions
- `expo-font` - No plugin required
- `@react-native-async-storage/async-storage` - No plugin required

---

### Clearing Expo Cache

If you encounter build or configuration issues:

```bash
# Clear Expo cache
npx expo start --clear

# Clear all caches
rm -rf node_modules
rm -rf .expo
rm -rf ios/build
rm -rf android/build
npm install
npx expo start --clear
```

---

### Package Version Management

**Current Expo SDK**: 54

**RULE**: All packages must be compatible with Expo SDK 54.

#### Checking Current SDK Version

```bash
npx expo --version
```

#### Official Expo SDK Documentation

https://docs.expo.dev/versions/latest/

#### Installed Packages (Reference)

**Dependencies:**
```json
{
  "@expo-google-fonts/poppins": "^0.4.1",
  "@expo/vector-icons": "^15.0.3",
  "@react-native-async-storage/async-storage": "2.2.0",
  "@react-navigation/bottom-tabs": "^7.8.2",
  "@react-navigation/native": "^7.1.19",
  "@supabase/supabase-js": "^2.80.0",
  "expo": "~54.0.22",
  "expo-apple-authentication": "~8.0.7",
  "expo-auth-session": "~7.0.8",
  "expo-blur": "~15.0.7",
  "expo-constants": "~18.0.10",
  "expo-crypto": "~15.0.7",
  "expo-font": "~14.0.9",
  "expo-haptics": "~15.0.7",
  "expo-linear-gradient": "~15.0.7",
  "expo-store-review": "~9.0.8",
  "expo-web-browser": "~15.0.9",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-reanimated": "~4.1.1",
  "react-native-safe-area-context": "~5.6.0",
  "react-native-screens": "~4.16.0",
  "react-native-url-polyfill": "^3.0.0"
}
```

**DevDependencies (CRITICAL):**
```json
{
  "@types/react": "~19.1.0",
  "babel-preset-expo": "^54.0.6",
  "typescript": "~5.9.2"
}
```

**IMPORTANT**: `babel-preset-expo` is a REQUIRED devDependency. Without it, Metro bundler will fail with "Cannot find module 'babel-preset-expo'". Always ensure it's installed.

---

### Babel Configuration

**RULE**: `babel-preset-expo` MUST be installed as a devDependency.

#### Required Babel Setup

1. Install babel-preset-expo:
```bash
npm install --save-dev babel-preset-expo
```

2. Verify babel.config.js:
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // React Native Reanimated plugin must be listed last
      'react-native-reanimated/plugin',
    ],
  };
};
```

**Documentation**: https://docs.expo.dev/guides/customizing-metro/

#### Troubleshooting Babel Errors

If you see "Cannot find module 'babel-preset-expo'":

```bash
# Install babel-preset-expo
npm install --save-dev babel-preset-expo

# Clear Metro cache
rm -rf node_modules/.cache .expo

# Restart Metro
npx expo start --clear
```

---

## Design System Rules

### CRITICAL: Mandatory Design System Usage

**RULE**: ALL styles MUST use the design system. NO hardcoded values are allowed.

#### Import Statement

```typescript
import { theme, r } from './src/theme';
```

### Theme Structure

The theme is located in `src/theme/` and contains:
- `colors.ts` - Color palette
- `typography.ts` - Font family and text styles
- `spacing.ts` - Spacing, border radius, shadows
- `responsive.ts` - Responsive utilities
- `index.ts` - Unified exports

**Documentation**: See `/DESIGN_SYSTEM.md`

---

### Colors

**RULE**: ALWAYS use semantic colors. NEVER use hex codes or RGB values directly in components.

#### ✅ CORRECT

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
  },
});
```

#### ❌ WRONG

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',  // ❌ Never use hex codes
  },
  text: {
    color: '#212121',  // ❌ Never use hex codes
  },
  button: {
    backgroundColor: '#4CAF50',  // ❌ Never use hex codes
  },
});
```

#### Available Color Categories

```typescript
theme.colors.primary[50-900]     // Primary brand colors (green)
theme.colors.secondary[50-900]   // Secondary colors (orange)
theme.colors.neutral[50-900]     // Neutral grays
theme.colors.background.primary  // Main background
theme.colors.background.secondary // Card backgrounds
theme.colors.text.primary        // Main text
theme.colors.text.secondary      // Subtitle text
theme.colors.border.main         // Borders
theme.colors.success.main        // Success states
theme.colors.error.main          // Error states
theme.colors.warning.main        // Warning states
theme.colors.info.main           // Info states
theme.colors.ios.blue            // iOS system colors
```

**Reference**: `src/theme/colors.ts`

---

### Typography

**RULE**: ALWAYS use typography variants. NEVER set fontSize, fontFamily, or fontWeight directly.

#### ✅ CORRECT

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

#### ❌ WRONG

```typescript
const styles = StyleSheet.create({
  heading: {
    fontSize: 36,              // ❌ Never use direct fontSize
    fontWeight: 'bold',        // ❌ Never use direct fontWeight
    fontFamily: 'Poppins_700Bold', // ❌ Never use direct fontFamily
  },
  body: {
    fontSize: 16,              // ❌ Never use direct fontSize
  },
});
```

#### Available Typography Variants

```typescript
theme.typography.h1           // 36px, Bold - Page titles
theme.typography.h2           // 30px, Bold - Section titles
theme.typography.h3           // 24px, SemiBold - Subsection titles
theme.typography.h4           // 20px, SemiBold - Card titles
theme.typography.h5           // 18px, SemiBold - List headers
theme.typography.h6           // 16px, SemiBold - Small headers
theme.typography.body         // 16px, Regular - Body text
theme.typography.bodyLarge    // 18px, Regular - Large body text
theme.typography.bodySmall    // 14px, Regular - Small body text
theme.typography.button       // 16px, SemiBold, Uppercase - Buttons
theme.typography.label        // 14px, Medium - Form labels
theme.typography.caption      // 12px, Regular - Captions
theme.typography.overline     // 10px, Medium, Uppercase - Overlines
```

**Reference**: `src/theme/typography.ts`

---

### Spacing

**RULE**: ALWAYS use spacing from the theme. NEVER use arbitrary pixel values.

#### ✅ CORRECT

```typescript
const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
});
```

#### ❌ WRONG

```typescript
const styles = StyleSheet.create({
  container: {
    padding: 20,      // ❌ Never use arbitrary values
    gap: 15,          // ❌ Never use arbitrary values
  },
  card: {
    marginBottom: 13, // ❌ Never use arbitrary values
    borderRadius: 7,  // ❌ Never use arbitrary values
  },
});
```

#### Available Spacing Values

```typescript
theme.spacing.xs     // 4px  - Tight spacing
theme.spacing.sm     // 8px  - Small spacing
theme.spacing.md     // 16px - Default spacing
theme.spacing.lg     // 24px - Large spacing
theme.spacing.xl     // 32px - Extra large spacing
theme.spacing['2xl'] // 48px - Section spacing
theme.spacing['3xl'] // 64px - Major layout spacing

theme.borderRadius.sm   // 4px
theme.borderRadius.md   // 8px
theme.borderRadius.lg   // 12px
theme.borderRadius.xl   // 16px
theme.borderRadius.full // 9999px (circular)
```

**Reference**: `src/theme/spacing.ts`

---

### Shadows

**RULE**: Use shadow presets for elevation. NEVER create custom shadows.

#### ✅ CORRECT

```typescript
const styles = StyleSheet.create({
  card: {
    ...theme.shadows.md,
  },
  floatingButton: {
    ...theme.shadows.lg,
  },
});
```

#### Available Shadow Presets

```typescript
theme.shadows.sm  // Light elevation - chips, small buttons
theme.shadows.md  // Medium elevation - cards, list items
theme.shadows.lg  // Large elevation - modals, dialogs
theme.shadows.xl  // Extra large elevation - bottom sheets
```

---

## Responsive Design Guidelines

### CRITICAL: Mandatory Responsive Scaling

**RULE**: ALL dimensions MUST use responsive utilities. NEVER use fixed pixel values for widths, heights, or font sizes.

#### Import Responsive Utilities

```typescript
import { theme, r } from './src/theme';
```

The `r` object contains all responsive utilities.

---

### Width and Height Scaling

**RULE**: Use `r.scaleWidth()` and `r.scaleHeight()` for all dimensions.

#### ✅ CORRECT

```typescript
const styles = StyleSheet.create({
  container: {
    width: r.scaleWidth(350),
    height: r.scaleHeight(200),
    maxWidth: r.scaleWidth(400),
  },
  image: {
    width: r.hp(80),   // 80% of screen width
    height: r.vp(30),  // 30% of screen height
  },
});
```

#### ❌ WRONG

```typescript
const styles = StyleSheet.create({
  container: {
    width: 350,        // ❌ Never use fixed widths
    height: 200,       // ❌ Never use fixed heights
  },
  image: {
    width: 300,        // ❌ Never use fixed dimensions
    height: 200,       // ❌ Never use fixed dimensions
  },
});
```

---

### Adaptive Spacing and Fonts

**RULE**: Use adaptive values for spacing and fonts whenever possible.

#### ✅ CORRECT

```typescript
const styles = StyleSheet.create({
  container: {
    padding: r.adaptiveSpacing.lg,
  },
  text: {
    ...theme.typography.h1,
    fontSize: r.adaptiveFontSize['2xl'],
  },
});
```

#### Available Adaptive Values

```typescript
r.adaptiveSpacing.xs   // 2-4px (device dependent)
r.adaptiveSpacing.sm   // 6-8px
r.adaptiveSpacing.md   // 12-16px
r.adaptiveSpacing.lg   // 18-24px
r.adaptiveSpacing.xl   // 24-32px

r.adaptiveFontSize.xs   // 11-12px
r.adaptiveFontSize.sm   // 13-14px
r.adaptiveFontSize.md   // 15-16px
r.adaptiveFontSize.lg   // 17-18px
r.adaptiveFontSize.xl   // 19-20px
r.adaptiveFontSize['2xl'] // 22-24px
r.adaptiveFontSize['3xl'] // 28-32px
```

---

### Responsive Value Selection

**RULE**: Use `r.responsive()` for complex device-specific layouts.

#### ✅ CORRECT

```typescript
const styles = StyleSheet.create({
  container: {
    padding: r.responsive({
      small: 12,
      medium: 16,
      large: 20,
      tablet: 24,
      default: 16,
    }),
  },
  columns: r.responsive({
    small: 1,
    medium: 2,
    tablet: 3,
    default: 2,
  }),
});
```

---

### Device Detection

Use device detection for conditional rendering:

```typescript
if (theme.isSmallDevice) {
  // Render compact UI
}

if (theme.isTablet) {
  // Render tablet-optimized UI
}

switch (theme.deviceSize) {
  case 'small':
    // iPhone SE, iPhone 13 mini
    break;
  case 'medium':
    // iPhone 13, iPhone 13 Pro
    break;
  case 'large':
    // iPhone 13 Pro Max, iPhone 14 Plus
    break;
  case 'tablet':
    // iPad mini
    break;
}
```

**Reference**: `src/theme/responsive.ts`

---

### Testing Responsive Design

**RULE**: ALWAYS test on multiple device sizes before committing.

#### Minimum Device Test Matrix

- iPhone SE (375px width) - Small device
- iPhone 13 (390px width) - Medium device (base)
- iPhone 13 Pro Max (428px width) - Large device
- iPad mini (768px width) - Tablet

#### Testing in Expo

```bash
# Start Expo with device selection
npx expo start

# Press 'i' for iOS simulator
# Then select different devices from the simulator menu
```

---

## Code Style and Conventions

### NO EMOJIS

**RULE**: NEVER use emojis anywhere in the app - not in UI, not in code comments, not in commit messages.

#### ❌ WRONG

```typescript
<Text>Welcome! 👋</Text>
<Text>Success ✅</Text>
// TODO: Fix this bug 🐛
```

#### ✅ CORRECT

```typescript
<Text>Welcome!</Text>
<Text>Success</Text>
// TODO: Fix authentication bug
```

---

### File Structure

**RULE**: Follow the established file structure strictly.

```
foodhabit/
├── src/
│   ├── config/
│   │   └── supabase.ts
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── services/
│   │   └── auth/
│   │       ├── supabaseAuth.ts
│   │       └── index.ts
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   ├── responsive.ts
│   │   └── index.ts
│   ├── types/
│   │   └── auth.ts
│   ├── components/        (future)
│   ├── screens/           (future)
│   └── utils/             (future)
├── App.tsx
├── app.json
├── babel.config.js
└── package.json
```

---

### TypeScript Rules

**RULE**: ALWAYS use TypeScript with strict typing. NO `any` types allowed.

#### ✅ CORRECT

```typescript
interface User {
  id: string;
  email: string;
  name?: string;
}

const getUser = async (userId: string): Promise<User> => {
  // Implementation
};
```

#### ❌ WRONG

```typescript
const getUser = async (userId: any): Promise<any> => {  // ❌ Never use 'any'
  // Implementation
};
```

---

### Import Organization

**RULE**: Organize imports in the following order:

1. React / React Native core
2. Third-party libraries
3. Expo packages
4. Local imports (absolute paths)
5. Theme/styles

```typescript
// 1. React / React Native
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Third-party libraries
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 3. Expo packages
import * as AppleAuthentication from 'expo-apple-authentication';

// 4. Local imports
import { useAuth } from './src/hooks/useAuth';
import { supabase } from './src/config/supabase';

// 5. Theme/styles
import { theme, r } from './src/theme';
```

---

### Component Structure

**RULE**: Follow this component structure:

```typescript
import { /* imports */ } from 'react-native';
import { theme, r } from './src/theme';

interface ComponentProps {
  title: string;
  onPress: () => void;
}

export default function Component({ title, onPress }: ComponentProps) {
  // Hooks
  const [state, setState] = useState<string>('');

  useEffect(() => {
    // Effects
  }, []);

  // Event handlers
  const handlePress = () => {
    onPress();
  };

  // Render
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
  },
  text: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
});
```

---

## Security and Environment Variables

### CRITICAL: .gitignore Configuration

**RULE**: ALWAYS ensure sensitive files are in .gitignore. NEVER commit environment variables or credentials.

#### Comprehensive .gitignore

The project uses a comprehensive .gitignore that covers:

1. **Environment Variables (CRITICAL)**
   - .env
   - .env.local
   - .env.development
   - .env.production
   - .env.test
   - .env*.local

2. **Dependencies**
   - node_modules/
   - .pnp files

3. **Build Artifacts**
   - .expo/
   - dist/
   - web-build/
   - ios/
   - android/

4. **Cache Files**
   - .metro-cache/
   - .cache/
   - .parcel-cache/

5. **IDE Settings**
   - .vscode/
   - .idea/
   - *.sublime-*

6. **OS Files**
   - .DS_Store (macOS)
   - Thumbs.db (Windows)
   - *~ (Linux)

7. **Logs and Debug Files**
   - *.log
   - npm-debug.*
   - yarn-error.*

8. **Testing**
   - coverage/
   - .nyc_output

**Documentation**: See `.gitignore` in project root

---

### Environment Variables (.env)

**RULE**: NEVER commit .env files. ALWAYS use .env.example for documentation.

#### Required Environment Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**IMPORTANT**: Use `EXPO_PUBLIC_` prefix to expose variables to the app.

#### Setting Up Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase credentials:
   - Go to https://app.supabase.com
   - Select your project
   - Navigate to Settings > API
   - Copy Project URL and anon/public key

3. Update .env with your actual values:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. Verify .env is in .gitignore:
   ```bash
   git check-ignore .env
   # Should output: .env
   ```

#### Security Best Practices

1. **NEVER commit .env files**
   - Always verify with `git status` before committing
   - .env should never appear in git status

2. **Rotate keys if exposed**
   - If you accidentally commit .env, rotate keys immediately in Supabase
   - Go to Supabase Settings > API > Reset keys

3. **Use .env.example for team**
   - Commit .env.example with placeholder values
   - Document all required variables
   - Never include actual credentials

4. **Check commits before pushing**
   ```bash
   git diff HEAD~1 HEAD
   # Verify no .env content is included
   ```

5. **Use git hooks (optional)**
   - Add pre-commit hook to check for .env content
   - Use tools like git-secrets or husky

#### Accessing Environment Variables

In your code:
```typescript
import Constants from 'expo-constants';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
```

**Reference**: `src/config/supabase.ts`

---

## Authentication Flow

### Supabase Authentication

**RULE**: ALL authentication MUST go through Supabase. NEVER implement direct OAuth.

**Documentation**: https://supabase.com/docs/guides/auth

---

### CRITICAL: Google OAuth Redirect URLs

**⚠️  CRITICAL**: Google OAuth **DOES NOT** accept `exp://` URLs!

#### Required URL Formats

✅ **Expo Go (Development)**: `https://auth.expo.io/@username/slug/--/auth/callback`
✅ **Standalone (Production)**: `foodhabit://auth/callback`
❌ **NOT ALLOWED**: `exp://192.168.1.6:8081/--/auth/callback`

**RULE**: Always use explicit HTTPS or custom scheme URLs. NEVER use `exp://` for OAuth.

#### Current Implementation

```typescript
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

export const getSupabaseRedirectUrl = (): string => {
  if (isExpoGo) {
    // CRITICAL: Use HTTPS auth proxy (Google doesn't accept exp://)
    const expoUsername = Constants.expoConfig?.owner;
    const expoSlug = Constants.expoConfig?.slug || 'foodhabit';

    // Generate proper HTTPS URL that Google accepts
    return `https://auth.expo.io/@${expoUsername}/${expoSlug}/--/auth/callback`;
  }

  // Production: Custom scheme (accepted by Google OAuth)
  return 'foodhabit://auth/callback';
};
```

**Key Points**:
- ✅ Explicitly generates `https://auth.expo.io/...` URL for Expo Go
- ✅ Does NOT rely on `makeRedirectUri` which may generate `exp://`
- ✅ Requires Expo username: run `npx expo whoami` to verify
- ✅ Both URLs are compatible with Google OAuth

**Reference**: `src/config/supabase.ts`

#### Setup: Get Your Expo Username

```bash
# Check your Expo username
npx expo whoami

# If not logged in
npx expo login

# Your redirect URL will be
https://auth.expo.io/@YOUR_USERNAME/foodhabit/--/auth/callback
```

---

### Deep Linking Configuration

**RULE**: BOTH redirect URLs must be configured in Supabase dashboard.

#### Required Supabase Configuration

Navigate to: `Authentication > URL Configuration > Redirect URLs`

Add BOTH:
1. `https://auth.expo.io/@[your-username]/foodhabit/auth/callback` (Expo Go)
2. `foodhabit://auth/callback` (Standalone)

**Documentation**:
- Expo Deep Linking: https://docs.expo.dev/guides/deep-linking/
- Supabase Auth Deep Linking: https://supabase.com/docs/guides/auth/native-mobile-deep-linking

---

## Testing and Debugging

### Pre-Commit Checklist

Before committing ANY code, verify:

- [ ] All packages installed via `npx expo install`
- [ ] No hardcoded colors (all use `theme.colors.*`)
- [ ] No hardcoded typography (all use `theme.typography.*`)
- [ ] No hardcoded spacing (all use `theme.spacing.*`)
- [ ] No fixed dimensions (all use `r.scaleWidth()`, `r.scaleHeight()`, or adaptive values)
- [ ] No emojis in code, UI, or commit messages
- [ ] TypeScript has no errors (`npx tsc --noEmit`)
- [ ] Tested on multiple device sizes
- [ ] All imports properly organized
- [ ] No `any` types

---

### Running Type Checks

```bash
# Check TypeScript errors
npx tsc --noEmit
```

---

### Debugging Expo Configuration

```bash
# View resolved Expo configuration
npx expo config

# Check for plugin errors
npx expo config --type introspect

# Validate app.json
npx expo config --type public
```

---

### Common Issues and Solutions

#### Issue: "Unable to resolve a valid config plugin"

**Solution**: Remove the plugin from `app.json` plugins array. Most modern Expo packages auto-configure.

**Documentation**: https://docs.expo.dev/guides/config-plugins/

---

#### Issue: Package version mismatch

**Solution**:
```bash
npx expo install --fix
```

---

#### Issue: Metro bundler cache issues

**Solution**:
```bash
npx expo start --clear
```

---

#### Issue: Font not loading

**Solution**: Ensure fonts are loaded before rendering:
```typescript
const [fontsLoaded] = useFonts({ /* fonts */ });
if (!fontsLoaded) return <LoadingScreen />;
```

**Documentation**: https://docs.expo.dev/develop/user-interface/fonts/

---

## Git Workflow

### Branch Naming

```
claude/[feature-name]-[session-id]
```

### Commit Message Format

```
[Type] Short description

- Bullet point 1
- Bullet point 2
```

**Types**: Add, Update, Fix, Refactor, Remove, Document

**NO EMOJIS in commit messages.**

---

### Commit Message Examples

#### ✅ CORRECT

```
Add user profile screen

- Create ProfileScreen component using design system
- Implement avatar upload with expo-image-picker
- Add responsive layout for all device sizes
- Integrate with Supabase user data
```

#### ❌ WRONG

```
Add user profile screen 🎉

- Create ProfileScreen component 💻
- Avatar upload 📸
- Responsive! ✨
```

---

## Documentation References

### Official Expo Documentation

- Main Documentation: https://docs.expo.dev/
- Installation: https://docs.expo.dev/more/expo-cli/#install
- Config Plugins: https://docs.expo.dev/guides/config-plugins/
- Deep Linking: https://docs.expo.dev/guides/deep-linking/
- Fonts: https://docs.expo.dev/develop/user-interface/fonts/
- SDK Reference: https://docs.expo.dev/versions/latest/

### Expo SDK 54 Specific

- SDK 54 Release Notes: https://docs.expo.dev/versions/v54.0.0/
- React Native 0.81: https://reactnative.dev/blog/2024/07/22/release-0.81

### Supabase Documentation

- Auth Documentation: https://supabase.com/docs/guides/auth
- React Native Guide: https://supabase.com/docs/guides/getting-started/quickstarts/reactnative
- Deep Linking: https://supabase.com/docs/guides/auth/native-mobile-deep-linking

### Design System Resources

- Material Design: https://material.io/design
- iOS HIG: https://developer.apple.com/design/human-interface-guidelines/
- 8-Point Grid: https://spec.fm/specifics/8-pt-grid
- Poppins Font: https://fonts.google.com/specimen/Poppins

---

## Project-Specific Documentation

- Design System: `/DESIGN_SYSTEM.md`
- Supabase Setup: `/SUPABASE_SETUP.md`
- Deep Linking: `/DEEP_LINKING.md`
- Package Guide: `/PACKAGES.md`

---

## Summary: Critical Rules

1. **ALWAYS** use `npx expo install` for package installation
2. **ALWAYS** use design system - NO hardcoded values
3. **ALWAYS** use responsive utilities - NO fixed dimensions
4. **NEVER** use emojis anywhere
5. **NEVER** use `any` types in TypeScript
6. **ALWAYS** test on multiple device sizes
7. **ALWAYS** follow file structure conventions
8. **ALWAYS** use Supabase for authentication
9. **ALWAYS** check Expo documentation before adding plugins
10. **ALWAYS** use environment-aware redirect URLs

---

## Questions or Issues?

If you encounter an issue not covered in this document:

1. Check official Expo documentation
2. Check package-specific documentation
3. Search Expo forums: https://forums.expo.dev/
4. Check GitHub issues for the specific package

**Last Updated**: 2025-11-07

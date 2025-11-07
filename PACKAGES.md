# Installed Packages for iOS App

This document lists all the packages installed for the Food Habit iOS app and their purposes.

## Core Dependencies

### Authentication
- `@supabase/supabase-js` (v2.80.0) - Supabase client for authentication and backend
- `expo-apple-authentication` (v8.0.7) - Native Apple Sign In for iOS
- `expo-auth-session` (v7.0.8) - OAuth session management
- `expo-web-browser` (v15.0.9) - Opens OAuth URLs in web browser
- `expo-crypto` (v15.0.7) - Cryptographic functions for auth
- `react-native-url-polyfill` (v3.0.0) - URL polyfill required by Supabase

### Storage & State
- `@react-native-async-storage/async-storage` - Persistent key-value storage
  - **Purpose**: Session persistence, user preferences
  - **Used by**: Supabase auth to persist sessions across app restarts

### Safe Areas & Layout
- `react-native-safe-area-context` - Safe area handling for iOS notch/island
  - **Purpose**: Proper layout on all iOS devices
  - **Critical for**: iPhone X and newer with notch/Dynamic Island
  - **Components**: SafeAreaProvider, SafeAreaView, useSafeAreaInsets

### Icons & UI Elements
- `@expo/vector-icons` - Icon library (includes Ionicons, MaterialIcons, etc.)
  - **Purpose**: UI icons throughout the app
  - **Includes**: 10+ icon families
  - **Usage**: `<Ionicons name="person" size={24} />`

### Animations
- `react-native-reanimated` - Performant animations library
  - **Purpose**: Smooth 60fps animations
  - **Features**: Gesture-driven animations, layout animations
  - **Performance**: Runs on UI thread (not JS thread)

### Gestures
- `react-native-gesture-handler` - Advanced gesture recognition
  - **Purpose**: Swipes, pinches, pan gestures
  - **Works with**: React Native Reanimated
  - **Better than**: Default React Native gestures

### Visual Effects
- `expo-blur` - iOS-style blur effects
  - **Purpose**: Blur backgrounds, modals
  - **iOS native**: Uses UIVisualEffectView
  - **Types**: Light, dark, regular blur

- `expo-linear-gradient` - Gradient backgrounds
  - **Purpose**: Gradient buttons, backgrounds
  - **Performance**: Native implementation
  - **Supports**: Linear and radial gradients

### Haptics & Feedback
- `expo-haptics` - Haptic feedback for iOS
  - **Purpose**: Touch feedback, notifications
  - **Types**: Impact (light, medium, heavy), Selection, Notification
  - **Usage**: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)`

### Store Utilities
- `expo-store-review` - In-app review prompts
  - **Purpose**: Request App Store reviews
  - **Best practices**: Prompt after positive actions
  - **Usage**: `StoreReview.requestReview()`

### System
- `expo` (v54.0.22) - Expo SDK
- `expo-constants` (v18.0.10) - App constants, environment detection
- `expo-status-bar` (v3.0.8) - Status bar styling

### React
- `react` (v19.1.0) - React library
- `react-native` (v0.81.5) - React Native framework

## Dev Dependencies

- `@types/react` (v19.1.0) - TypeScript types for React
- `typescript` (v5.9.2) - TypeScript compiler

## Configuration

### app.json Plugins

```json
{
  "plugins": [
    "expo-apple-authentication",
    "expo-web-browser",
    ["react-native-reanimated", {
      "relativeSourceLocation": true
    }]
  ]
}
```

### Babel Configuration

For React Native Reanimated, add to babel.config.js:

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // Must be last!
  };
};
```

## Usage Examples

### Safe Area

```typescript
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        {/* Your content */}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
```

### AsyncStorage (Session Persistence)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Already configured in src/config/supabase.ts
export const supabase = createClient(URL, KEY, {
  auth: {
    storage: AsyncStorage, // ✅ Sessions persist across app restarts
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

### Haptics

```typescript
import * as Haptics from 'expo-haptics';

// Button press
const handlePress = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  // Your action
};

// Success
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Selection (like scrolling through options)
Haptics.selectionAsync();
```

### Store Review

```typescript
import * as StoreReview from 'expo-store-review';

// Request review (only works on real devices)
const requestReview = async () => {
  const isAvailable = await StoreReview.isAvailableAsync();
  if (isAvailable) {
    await StoreReview.requestReview();
  }
};
```

### Icons

```typescript
import { Ionicons } from '@expo/vector-icons';

<Ionicons name="person-outline" size={24} color="black" />
<Ionicons name="heart" size={32} color="red" />
```

### Blur

```typescript
import { BlurView } from 'expo-blur';

<BlurView intensity={80} style={StyleSheet.absoluteFill}>
  {/* Content on top of blur */}
</BlurView>
```

### Linear Gradient

```typescript
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={['#4c669f', '#3b5998', '#192f6a']}
  style={styles.button}
>
  <Text>Gradient Button</Text>
</LinearGradient>
```

### Animations

```typescript
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

function AnimatedComponent() {
  const offset = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const handlePress = () => {
    offset.value = withSpring(100);
  };

  return (
    <Animated.View style={animatedStyles}>
      {/* Your content */}
    </Animated.View>
  );
}
```

## Best Practices

### Safe Areas
- Always wrap root component with `SafeAreaProvider`
- Use `SafeAreaView` for screens with content
- Use `edges` prop to control which edges are safe
- Use `useSafeAreaInsets()` hook for custom layouts

### Haptics
- Use sparingly (don't overuse)
- Match feedback to action importance:
  - Light: Subtle interactions
  - Medium: Button presses
  - Heavy: Important actions
- Don't use for every tap

### Store Reviews
- Only request after positive user actions
- Don't request too frequently (iOS limits this automatically)
- Don't request on first app launch
- Good times: After completing a goal, successful checkout

### Animations
- Prefer Reanimated over Animated API
- Run animations on UI thread for 60fps
- Use `worklets` for complex animations
- Don't animate too many elements simultaneously

### AsyncStorage
- Limit data size (not for large files)
- Use for: Settings, tokens, small user data
- Don't use for: Images, large datasets
- Always handle errors

## Package Sizes

Approximate size impact:

- **Essential** (~5MB):
  - Supabase, Auth, Safe Area, AsyncStorage

- **UI/UX** (~8MB):
  - Icons, Reanimated, Gesture Handler

- **Effects** (~3MB):
  - Blur, Linear Gradient, Haptics

**Total**: ~16MB additional to base Expo

## Updates

To update all packages to latest compatible versions:

```bash
npx expo install --fix
```

Or update specific packages:

```bash
npx expo install react-native-reanimated@latest
```

## Troubleshooting

### Reanimated "Reanimated 2 failed to create a worklet"

Add Reanimated plugin to babel.config.js (must be last plugin).

### Safe Area not working

Ensure `SafeAreaProvider` wraps your app at the root level.

### Haptics not working

- Only works on real iOS devices
- Won't work in simulator
- Check device has Taptic Engine

### AsyncStorage quota exceeded

Clear old data or use a database instead for large datasets.

## Production Considerations

Before releasing:

1. **Remove dev dependencies** from production build
2. **Test haptics** on real devices
3. **Test safe areas** on all iPhone models
4. **Verify AsyncStorage** limits
5. **Test store review** prompts (timing and frequency)
6. **Optimize animations** for older devices

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [Gesture Handler Docs](https://docs.swmansion.com/react-native-gesture-handler/)
- [Supabase Docs](https://supabase.com/docs)

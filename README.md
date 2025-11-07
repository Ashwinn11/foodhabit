# Food Habit

A React Native Expo application with Apple Sign In (native) and Google OAuth (web) authentication.

## Bundle ID

- iOS: `com.foodhabit.com`
- Android: `com.foodhabit.com`

## Features

- **Apple Sign In**: Native iOS authentication with Apple ID
- **Google OAuth**: Web-based OAuth 2.0 authentication
- TypeScript support
- Custom authentication hook (`useAuth`)
- Organized service architecture

## Project Structure

```
foodhabit/
├── src/
│   ├── hooks/
│   │   └── useAuth.ts          # Main authentication hook
│   ├── services/
│   │   └── auth/
│   │       ├── appleAuth.ts    # Apple Sign In service
│   │       ├── googleAuth.ts   # Google OAuth service
│   │       └── index.ts        # Auth services barrel export
│   └── types/
│       └── auth.ts             # TypeScript types for auth
├── App.tsx                     # Main app with auth example
├── app.json                    # Expo configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Expo CLI
- iOS Simulator (for Apple Sign In testing) or physical iOS device
- Android Emulator or physical Android device (for Google OAuth testing)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure OAuth providers (see below)

3. Run the app:

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Authentication Setup

### Apple Sign In Setup

Apple Sign In is already configured in the app. To use it in production:

1. **Apple Developer Account**:
   - Log in to [Apple Developer](https://developer.apple.com)
   - Go to Certificates, Identifiers & Profiles
   - Create or edit your App ID (`com.foodhabit.com`)
   - Enable "Sign In with Apple" capability

2. **Expo Configuration**:
   - Already configured in `app.json`:
     - `ios.bundleIdentifier`: `com.foodhabit.com`
     - `ios.usesAppleSignIn`: `true`
     - Plugin: `expo-apple-authentication`

3. **Testing**:
   - Apple Sign In only works on physical iOS devices or iOS Simulator
   - Does not work on Android or Web

### Google OAuth Setup

1. **Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Google+ API or Google Identity Services

2. **Create OAuth Credentials**:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Select "Web application" as application type
   - Add authorized redirect URIs:
     - For Expo Go: `https://auth.expo.io/@YOUR_EXPO_USERNAME/foodhabit`
     - For standalone builds: Use the redirect URI from the app (see below)

3. **Get Redirect URI**:

   Run this in your app to get the correct redirect URI:

   ```typescript
   import { getGoogleRedirectUri } from './src/services/auth/googleAuth';
   console.log(getGoogleRedirectUri());
   ```

4. **Update App.tsx**:

   Replace `YOUR_GOOGLE_CLIENT_ID_HERE` in `App.tsx` with your Web Client ID:

   ```typescript
   const GOOGLE_CLIENT_ID = 'your-actual-client-id.apps.googleusercontent.com';
   ```

5. **Testing**:
   - Google OAuth works on iOS, Android, and Web
   - Test on physical devices for best results

## Usage

### Using the Authentication Hook

```typescript
import { useAuth } from './src/hooks/useAuth';

function MyComponent() {
  const {
    user,
    loading,
    error,
    signInWithApple,
    signInWithGoogle,
    signOut
  } = useAuth();

  // Sign in with Apple
  const handleAppleSignIn = async () => {
    await signInWithApple();
  };

  // Sign in with Google
  const handleGoogleSignIn = async () => {
    await signInWithGoogle({
      clientId: 'YOUR_GOOGLE_CLIENT_ID',
    });
  };

  if (user) {
    return <Text>Welcome {user.name}!</Text>;
  }

  return (
    <View>
      <Button title="Sign in with Apple" onPress={handleAppleSignIn} />
      <Button title="Sign in with Google" onPress={handleGoogleSignIn} />
    </View>
  );
}
```

### User Object

After successful authentication, the user object contains:

```typescript
{
  id: string;              // User ID from provider
  email: string | null;    // User email
  name?: string;           // Full name
  givenName?: string;      // First name
  familyName?: string;     // Last name
  photo?: string;          // Profile photo URL (Google only)
  provider: 'apple' | 'google';  // Auth provider
}
```

## Building for Production

### iOS

1. **App Store Connect**:
   - Create app with bundle ID `com.foodhabit.com`
   - Enable "Sign In with Apple" capability

2. **Build**:
   ```bash
   eas build --platform ios
   ```

### Android

1. **Google Play Console**:
   - Create app with package name `com.foodhabit.com`

2. **Build**:
   ```bash
   eas build --platform android
   ```

## Troubleshooting

### Apple Sign In

- **Error: "Apple Sign In not available"**
  - Apple Sign In only works on iOS 13+ devices
  - Ensure you're testing on a physical device or iOS Simulator

### Google OAuth

- **Error: "redirect_uri_mismatch"**
  - Verify the redirect URI in Google Cloud Console matches exactly
  - Use `getGoogleRedirectUri()` to get the correct URI

- **Error: "invalid_client"**
  - Check that your Google Client ID is correct
  - Ensure you're using the Web Client ID, not iOS or Android client ID

## Dependencies

- `expo`: Latest SDK
- `expo-apple-authentication`: Native Apple Sign In
- `expo-auth-session`: OAuth 2.0 authentication
- `expo-crypto`: Cryptographic functions for auth
- `expo-web-browser`: Web browser for OAuth flows
- `react-native`: React Native framework

## License

MIT

## Support

For issues and questions:
- Check the [Expo documentation](https://docs.expo.dev)
- Review [Apple Sign In docs](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- Review [Google OAuth docs](https://developers.google.com/identity/protocols/oauth2)

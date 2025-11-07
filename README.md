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

Google OAuth uses **deep linking** to redirect back to your app after authentication. The setup differs between development (Expo Go) and production (standalone builds).

#### Understanding Deep Links

- **Expo Go (Development)**: Uses Expo's auth proxy (`https://auth.expo.io/@username/slug`)
- **Standalone Builds (Production)**: Uses custom URL scheme (`foodhabit://redirect`)

The app automatically detects the environment and uses the correct redirect URI.

#### Step-by-Step Setup

1. **Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Google+ API or Google Identity Services

2. **Create OAuth Credentials**:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Select "Web application" as application type

3. **Get Your Redirect URIs**:

   The app automatically logs both redirect URIs when it starts. Check your console output for:

   ```
   === GOOGLE OAUTH REDIRECT URIs ===
   Development (Expo Go): https://auth.expo.io/@your-username/foodhabit
   Production (Standalone): foodhabit://redirect
   ===================================
   ```

   Or use the "Show Redirect URIs" button in development mode.

   You can also get them programmatically:

   ```typescript
   import { getAllRedirectUris } from './src/services/auth/googleAuth';
   const uris = getAllRedirectUris();
   console.log(uris.development);  // For Expo Go
   console.log(uris.production);   // For standalone builds
   ```

4. **Add Redirect URIs to Google Cloud Console**:
   - In your OAuth 2.0 Client ID settings
   - Under "Authorized redirect URIs", add **BOTH**:
     - `https://auth.expo.io/@your-username/foodhabit` (for development)
     - `foodhabit://redirect` (for production builds)
   - Click "Save"

5. **Update App.tsx**:

   Replace `YOUR_GOOGLE_CLIENT_ID_HERE` in `App.tsx` with your Web Client ID:

   ```typescript
   const GOOGLE_CLIENT_ID = 'your-actual-client-id.apps.googleusercontent.com';
   ```

6. **Deep Link Configuration**:

   Already configured in `app.json`:
   ```json
   {
     "scheme": "foodhabit",
     "plugins": ["expo-web-browser"]
   }
   ```

   This enables the `foodhabit://` URL scheme for production builds.

#### Testing

- **Development (Expo Go)**:
  ```bash
  npx expo start
  ```
  The app will automatically use Expo's auth proxy

- **Production (Standalone Build)**:
  ```bash
  # iOS
  eas build --platform ios --profile preview

  # Android
  eas build --platform android --profile preview
  ```
  The app will use the custom `foodhabit://` scheme

#### Troubleshooting Deep Links

- **"redirect_uri_mismatch" error**:
  - Verify BOTH redirect URIs are added to Google Cloud Console
  - Check the console logs to see which URI is being used
  - Make sure there are no typos in the URIs

- **Deep link not opening the app**:
  - Ensure `scheme` is set in `app.json`
  - For iOS: Check that `bundleIdentifier` matches
  - For Android: Check that `package` matches
  - Rebuild the app after changing the scheme

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

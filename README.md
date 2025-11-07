# Food Habit

A React Native Expo application with Apple Sign In and Google OAuth authentication using Supabase.

## Bundle ID

- iOS: `com.foodhabit.app`

## Features

- **Supabase Authentication**: Managed authentication with automatic token refresh
- **Apple Sign In**: Native iOS authentication with Apple ID
- **Google OAuth**: Seamless Google Sign In
- **TypeScript**: Full type safety
- **Session Management**: Automatic session persistence and refresh
- **Custom Auth Hook**: Easy-to-use `useAuth` hook
- **Deep Linking**: Proper redirect handling for OAuth flows

## Project Structure

```
foodhabit/
├── src/
│   ├── config/
│   │   └── supabase.ts         # Supabase client configuration
│   ├── hooks/
│   │   └── useAuth.ts          # Main authentication hook
│   ├── services/
│   │   └── auth/
│   │       ├── supabaseAuth.ts # Supabase auth service
│   │       └── index.ts        # Auth services barrel export
│   ├── types/
│   │   └── auth.ts             # TypeScript types for auth
│   └── utils/
│       └── showRedirectUris.ts # Helper for showing redirect URLs
├── App.tsx                      # Main app with auth example
├── app.json                     # Expo configuration
├── SUPABASE_SETUP.md           # Detailed Supabase setup guide
└── package.json
```

## Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Expo CLI
- Supabase account (free tier available)
- Apple Developer account (for Apple Sign In)
- Google Cloud account (for Google OAuth)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Project Settings > API
3. Copy your Project URL and anon/public key

### 3. Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Setup Auth Providers

Follow the detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to configure:
- Apple Sign In
- Google OAuth
- Redirect URLs

### 5. Run the App

```bash
# Start development server
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Authentication Setup

For detailed setup instructions, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

### Quick Overview

#### Apple Sign In

1. Enable "Sign in with Apple" in Apple Developer Portal for `com.foodhabit.app`
2. Create an auth key in Apple Developer Portal
3. Configure Apple provider in Supabase with Team ID, Key ID, and auth key

#### Google OAuth

1. Create OAuth client in Google Cloud Console
2. Configure Google provider in Supabase with Client ID and Secret
3. Add Supabase callback URL to Google OAuth client

#### Deep Links

1. Add `foodhabit://auth/callback` to Supabase Redirect URLs
2. App is pre-configured with `foodhabit` URL scheme

## Usage

### Basic Example

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

  if (loading) {
    return <ActivityIndicator />;
  }

  if (user) {
    return (
      <View>
        <Text>Welcome {user.name}!</Text>
        <Button title="Sign Out" onPress={signOut} />
      </View>
    );
  }

  return (
    <View>
      <Button title="Sign in with Apple" onPress={signInWithApple} />
      <Button title="Sign in with Google" onPress={signInWithGoogle} />
    </View>
  );
}
```

### User Object

After successful authentication:

```typescript
{
  id: string;                    // Supabase user ID
  email: string | null;          // User email
  name?: string;                 // Full name
  givenName?: string;            // First name
  familyName?: string;           // Last name
  photo?: string;                // Profile photo URL
  provider: 'apple' | 'google';  // Auth provider
  session?: Session;             // Supabase session
  supabaseUser?: User;           // Full Supabase user object
}
```

### useAuth Hook API

```typescript
const {
  user,                    // Current authenticated user or null
  loading,                 // Loading state (true during auth operations)
  error,                   // Error object if auth fails
  signInWithApple,        // () => Promise<void>
  signInWithGoogle,       // () => Promise<void>
  signOut,                // () => Promise<void>
  isAppleAuthAvailable    // () => Promise<boolean>
} = useAuth();
```

## How It Works

### Supabase Integration

1. **Native Apple Sign In** (iOS only):
   - Uses native Apple Authentication
   - Exchanges identity token with Supabase
   - Returns Supabase user with session

2. **Google OAuth**:
   - Opens browser with Supabase OAuth URL
   - User authenticates with Google
   - Supabase handles token exchange
   - Redirects back to app via deep link
   - Session automatically created

3. **Session Management**:
   - Supabase handles token refresh automatically
   - Sessions persist across app restarts (when storage configured)
   - Auth state changes trigger `useAuth` updates

### Deep Linking Flow

```
User taps "Sign in with Google"
    ↓
App opens browser with Supabase OAuth URL
    ↓
User authenticates with Google
    ↓
Google redirects to Supabase
    ↓
Supabase creates session
    ↓
Supabase redirects to: foodhabit://auth/callback
    ↓
App receives deep link
    ↓
Session extracted from URL
    ↓
User authenticated!
```

## Building for Production

### iOS

1. Configure in `app.json`:
   ```json
   {
     "ios": {
       "bundleIdentifier": "com.foodhabit.app",
       "usesAppleSignIn": true
     }
   }
   ```

2. Build with EAS:
   ```bash
   eas build --platform ios
   ```

## Troubleshooting

### Common Issues

#### Environment Variables Not Loading

- Restart Expo with: `npx expo start --clear`
- Verify `.env` file is in the root directory
- Check variable names start with `EXPO_PUBLIC_`

#### Apple Sign In Not Available

- Only works on iOS 13+
- Only available on physical devices or iOS Simulator
- Check Apple Developer Portal configuration

#### Google OAuth Fails

- Verify Supabase callback URL is in Google Cloud Console
- Check Client ID and Secret in Supabase
- Ensure Google+ API is enabled

#### Deep Link Not Working

- Verify `foodhabit://auth/callback` is in Supabase Redirect URLs
- For standalone builds, rebuild after changing scheme
- Check console logs for redirect URL issues

### Debug Tools

- **Development Mode**: Shows "Show Supabase Redirect URL" button
- **Console Logging**: All auth operations logged to console
- **Supabase Dashboard**: View auth logs and user sessions

## Security

- Environment variables are not committed (in `.gitignore`)
- Supabase handles token encryption and storage
- Anon key is safe for client-side use (RLS protects data)
- Consider implementing Row Level Security (RLS) for database access

## Dependencies

- `@supabase/supabase-js`: Supabase client library
- `expo-apple-authentication`: Native Apple Sign In
- `expo-auth-session`: OAuth session management
- `expo-web-browser`: OAuth browser flows
- `react-native-url-polyfill`: URL polyfill for React Native

## Resources

- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Detailed setup instructions
- [Supabase Documentation](https://supabase.com/docs)
- [Expo Authentication](https://docs.expo.dev/guides/authentication/)
- [Apple Sign In Docs](https://developer.apple.com/sign-in-with-apple/)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)

## License

MIT

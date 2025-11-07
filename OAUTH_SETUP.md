# OAuth Setup Guide for Food Habit

This guide walks you through setting up Apple Sign In and Google OAuth for the Food Habit app.

## Table of Contents

1. [Understanding Deep Links in Expo](#understanding-deep-links-in-expo)
2. [Apple Sign In Setup](#apple-sign-in-setup)
3. [Google OAuth Setup](#google-oauth-setup)
4. [Testing Your Setup](#testing-your-setup)
5. [Troubleshooting](#troubleshooting)

## Understanding Deep Links in Expo

OAuth flows require redirecting users back to your app after authentication. Expo handles this differently for development vs production:

### Development (Expo Go)

- **How it works**: Expo provides an auth proxy server
- **Redirect URI format**: `https://auth.expo.io/@YOUR_EXPO_USERNAME/foodhabit`
- **Pros**: Works immediately without configuration
- **Cons**: Requires Expo Go app

### Production (Standalone Builds)

- **How it works**: Uses a custom URL scheme
- **Redirect URI format**: `foodhabit://redirect`
- **Pros**: Works in production apps
- **Cons**: Requires rebuild if scheme changes

### Automatic Detection

The Food Habit app automatically detects which environment you're in and uses the correct redirect URI:

```typescript
// In App.tsx
const isExpoGo = Constants.appOwnership === 'expo';

await signInWithGoogle({
  clientId: GOOGLE_CLIENT_ID,
  useProxy: isExpoGo, // Auto-selects correct redirect URI
});
```

## Apple Sign In Setup

Apple Sign In works natively on iOS devices without deep link configuration.

### Prerequisites

- Active Apple Developer account ($99/year)
- iOS device or iOS Simulator (M1+ Mac)

### Steps

1. **Apple Developer Portal**:
   - Go to [Apple Developer](https://developer.apple.com)
   - Navigate to Certificates, Identifiers & Profiles
   - Find or create App ID: `com.foodhabit.com`
   - Enable "Sign In with Apple" capability
   - Save changes

2. **App Configuration**:
   Already configured in `app.json`:
   ```json
   {
     "ios": {
       "bundleIdentifier": "com.foodhabit.com",
       "usesAppleSignIn": true
     },
     "plugins": ["expo-apple-authentication"]
   }
   ```

3. **Testing**:
   ```bash
   npx expo run:ios
   ```

   Or build with EAS:
   ```bash
   eas build --platform ios --profile development
   ```

### Important Notes

- Apple Sign In **ONLY** works on iOS (not Android or Web)
- Requires iOS 13 or later
- Works in iOS Simulator on M1+ Macs
- Users can choose to hide their email (you'll get a relay email)

## Google OAuth Setup

Google OAuth requires more configuration due to deep linking requirements.

### Part 1: Google Cloud Console

1. **Create/Select Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Note your project name

2. **Enable APIs**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity Services"
   - Click "Enable"

3. **Create OAuth Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: External (for testing)
     - App name: Food Habit
     - User support email: your email
     - Developer contact: your email
   - Select "Web application" as type
   - Name it: "Food Habit Web Client"

### Part 2: Get Your Redirect URIs

The app provides multiple ways to get your redirect URIs:

#### Method 1: Automatic Logging (Easiest)

1. Start the app:
   ```bash
   npx expo start
   ```

2. Check the console output:
   ```
   === GOOGLE OAUTH REDIRECT URIs ===
   Development (Expo Go): https://auth.expo.io/@yourname/foodhabit
   Production (Standalone): foodhabit://redirect
   ===================================
   ```

#### Method 2: Button in Dev Mode

1. Run the app in development
2. You'll see a "Show Redirect URIs" button
3. Click it to see both URIs

#### Method 3: Programmatically

```typescript
import { getAllRedirectUris } from './src/services/auth/googleAuth';

const uris = getAllRedirectUris();
console.log('Dev URI:', uris.development);
console.log('Prod URI:', uris.production);
```

### Part 3: Configure Redirect URIs in Google

1. In Google Cloud Console, under your OAuth 2.0 Client ID
2. Find "Authorized redirect URIs" section
3. Add **BOTH** URIs (click "+ ADD URI" for each):
   ```
   https://auth.expo.io/@YOUR_EXPO_USERNAME/foodhabit
   foodhabit://redirect
   ```
4. Click "Save"

### Part 4: Add Client ID to App

1. Copy your "Client ID" from Google Cloud Console
   - It looks like: `123456789-abc123.apps.googleusercontent.com`

2. Open `App.tsx`

3. Replace the placeholder:
   ```typescript
   // Before
   const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';

   // After
   const GOOGLE_CLIENT_ID = '123456789-abc123.apps.googleusercontent.com';
   ```

### Part 5: Test

1. **In Expo Go**:
   ```bash
   npx expo start
   # Scan QR code with Expo Go app
   # Tap "Sign in with Google"
   ```

2. **In Standalone Build**:
   ```bash
   # Create development build
   eas build --platform ios --profile development
   eas build --platform android --profile development

   # Install and test
   ```

## Deep Link Configuration Checklist

The app is pre-configured with deep linking. Verify these settings:

### In `app.json`

```json
{
  "expo": {
    "scheme": "foodhabit",
    "plugins": [
      "expo-apple-authentication",
      "expo-web-browser"
    ],
    "ios": {
      "bundleIdentifier": "com.foodhabit.com"
    },
    "android": {
      "package": "com.foodhabit.com"
    }
  }
}
```

### What Each Setting Does

- `"scheme": "foodhabit"` - Enables `foodhabit://` URLs to open your app
- `"expo-web-browser"` - Plugin for OAuth browser flows
- `bundleIdentifier` & `package` - Must match across all platforms

## Testing Your Setup

### Quick Test Checklist

- [ ] App builds and runs
- [ ] Apple Sign In button appears on iOS
- [ ] Google Sign In button appears
- [ ] Clicking Google sign in opens browser
- [ ] After Google auth, redirects back to app
- [ ] User info displays correctly
- [ ] Sign out works

### Testing in Different Environments

1. **Expo Go (Development)**:
   ```bash
   npx expo start
   ```
   - Uses `https://auth.expo.io/...` redirect
   - Fast iteration
   - Perfect for development

2. **Development Build**:
   ```bash
   eas build --profile development --platform ios
   ```
   - Uses `foodhabit://` redirect
   - Tests production-like behavior
   - Requires rebuild for native changes

3. **Production Build**:
   ```bash
   eas build --profile production --platform ios
   ```
   - Same as development build but optimized
   - For App Store submission

## Troubleshooting

### Common Issues

#### "redirect_uri_mismatch" Error

**Cause**: Google doesn't recognize your redirect URI

**Solutions**:
1. Check both URIs are in Google Cloud Console
2. Verify no typos in the URIs
3. Check which URI the app is using:
   ```typescript
   console.log('Using redirect URI:', redirectUri);
   ```
4. Wait a few minutes after adding URIs (Google caching)
5. Make sure you're editing the correct OAuth client ID

#### Deep Link Not Opening App

**Cause**: URL scheme not properly configured

**Solutions**:
1. Verify `scheme` in `app.json`
2. Rebuild the app (native changes require rebuild):
   ```bash
   npx expo prebuild --clean
   npx expo run:ios
   ```
3. For iOS: Check bundle ID matches
4. For Android: Check package name matches

#### Apple Sign In Not Available

**Cause**: Not on iOS device or wrong iOS version

**Solutions**:
1. Only works on iOS 13+
2. Only works on physical iOS devices or iOS Simulator (M1+ Mac)
3. Check `isAppleAuthAvailable()` returns true

#### OAuth Flow Cancels Immediately

**Cause**: Browser session issues

**Solutions**:
1. Clear app data and try again
2. Ensure `WebBrowser.maybeCompleteAuthSession()` is called
3. Check no conflicting web browser is open

### Debug Mode

The app includes debug helpers in development mode:

1. **Environment indicator**: Bottom of screen shows "Expo Go" or "Standalone Build"
2. **Redirect URI button**: "Show Redirect URIs" button displays all URIs
3. **Console logging**: Redirect URIs logged on app start
4. **Error alerts**: OAuth errors shown in alerts

### Getting Help

1. **Check console logs**: Most issues are logged
2. **Enable verbose logging**:
   ```typescript
   console.log('OAuth Config:', { clientId, redirectUri, useProxy });
   ```
3. **Test redirect URIs**: Open them directly in a browser
4. **Verify Google OAuth client**: Double-check all settings

## Security Best Practices

1. **Never commit credentials**:
   - `.env` is in `.gitignore`
   - Use environment variables in production

2. **Use HTTPS only**:
   - Expo handles this automatically
   - Never use HTTP for OAuth

3. **Validate tokens server-side**:
   - This app gets user info directly
   - For production, verify tokens on your backend

4. **Limit OAuth scopes**:
   - Only request needed permissions
   - Current scopes: `openid`, `profile`, `email`

## Next Steps

After setting up OAuth:

1. **Add a backend**: Store user data securely
2. **Add refresh tokens**: For long-lived sessions
3. **Add more providers**: Facebook, GitHub, etc.
4. **Add error handling**: Better user experience
5. **Add analytics**: Track sign-in success rates

## Additional Resources

- [Expo Authentication](https://docs.expo.dev/guides/authentication/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Expo Deep Linking](https://docs.expo.dev/guides/linking/)

# Deep Linking Setup for Expo + Supabase OAuth

This document explains how deep linking is properly configured to work with both Expo Go and standalone builds.

## CRITICAL: Google OAuth URL Requirements

**⚠️  IMPORTANT**: Google OAuth **DOES NOT** accept `exp://` URLs!

### Accepted URL Formats

✅ **Expo Go (Development)**: `https://auth.expo.io/@username/slug/--/auth/callback`
✅ **Standalone (Production)**: `foodhabit://auth/callback`
❌ **NOT ALLOWED**: `exp://192.168.1.6:8081/--/auth/callback`

The `exp://` scheme is Expo's internal development URL and is **rejected by Google OAuth**. You MUST use the proper HTTPS auth proxy URL for development.

## The Problem

Expo has limitations with deep linking:

1. **Expo Go (Development)**: Custom URL schemes (`foodhabit://`) don't work properly
2. **Standalone Builds (Production)**: Custom URL schemes work, but Expo's proxy doesn't
3. **OAuth requires specific URL formats**: Google OAuth requires HTTPS or registered custom schemes
4. **No exp:// allowed**: The `exp://` development URL is NOT accepted by OAuth providers

## The Solution

We implement **environment-aware redirect URLs** that automatically detect and use the correct URL based on the runtime environment.

### Configuration Overview

```typescript
// src/config/supabase.ts

// Detect environment
const isExpoGo = Constants.appOwnership === 'expo';

// Return appropriate URL (CRITICAL: Google OAuth compatible)
export const getSupabaseRedirectUrl = (): string => {
  if (isExpoGo) {
    // Expo Go: MUST use https://auth.expo.io (Google doesn't accept exp://)
    const expoUsername = Constants.expoConfig?.owner;
    const expoSlug = Constants.expoConfig?.slug || 'foodhabit';

    // Generate proper HTTPS URL that Google accepts
    return `https://auth.expo.io/@${expoUsername}/${expoSlug}/--/auth/callback`;
  }

  // Standalone: Custom scheme (accepted by Google OAuth)
  return 'foodhabit://auth/callback';
};
```

**Key Changes from Default Expo Behavior:**
- ✅ Explicitly generates `https://auth.expo.io/...` URL
- ✅ Does NOT use `exp://` URLs
- ✅ Compatible with Google OAuth requirements
- ✅ Requires Expo username (run `npx expo whoami`)

## How It Works

### Development (Expo Go)

1. **Redirect URL**: `https://auth.expo.io/@username/foodhabit/auth/callback`
2. **Flow**:
   ```
   User taps "Sign in with Google"
   ↓
   App opens Supabase OAuth URL in browser
   ↓
   User authenticates
   ↓
   Supabase redirects to Expo's proxy: https://auth.expo.io/...
   ↓
   Expo proxy opens Expo Go app with deep link
   ↓
   App receives the session data
   ```

3. **Why it works**: Expo's auth proxy is a web server that:
   - Accepts the OAuth callback
   - Opens the Expo Go app
   - Passes the session data

### Production (Standalone Builds)

1. **Redirect URL**: `foodhabit://auth/callback`
2. **Flow**:
   ```
   User taps "Sign in with Google"
   ↓
   App opens Supabase OAuth URL in browser
   ↓
   User authenticates
   ↓
   Supabase redirects to: foodhabit://auth/callback
   ↓
   OS opens your app (based on URL scheme registration)
   ↓
   App receives the session data
   ```

3. **Why it works**: The OS knows to open your app when it sees `foodhabit://` because:
   - iOS: Configured in `scheme` + `bundleIdentifier`
   - Android: Configured in `intentFilters`

## App.json Configuration

### URL Scheme

```json
{
  "scheme": "foodhabit"
}
```

This registers `foodhabit://` as a custom URL scheme for your app.

### iOS: Associated Domains

```json
{
  "ios": {
    "associatedDomains": [
      "applinks:foodhabit.com"
    ]
  }
}
```

**Purpose**: Allows universal links (HTTPS links) to open your app
**Note**: Requires verification file on your domain (optional for OAuth)

### Android: Intent Filters

```json
{
  "android": {
    "intentFilters": [
      {
        "action": "VIEW",
        "autoVerify": true,
        "data": [
          {
            "scheme": "https",
            "host": "foodhabit.com",
            "pathPrefix": "/auth/callback"
          },
          {
            "scheme": "foodhabit"
          }
        ],
        "category": ["BROWSABLE", "DEFAULT"]
      }
    ]
  }
}
```

**Purpose**: Tells Android which URLs should open your app
- Custom scheme: `foodhabit://`
- Universal link: `https://foodhabit.com/auth/callback`

## Supabase Configuration

You need to add **BOTH** redirect URLs to Supabase:

### In Supabase Dashboard

1. Go to: **Authentication** > **URL Configuration**
2. Under "Redirect URLs", add:
   ```
   https://auth.expo.io/@your-username/foodhabit/auth/callback
   foodhabit://auth/callback
   ```

### Getting Your URLs

The app automatically logs both URLs on startup:

```
=== SUPABASE REDIRECT URLs ===
Current mode: Expo Go (Development)

Add BOTH URLs to your Supabase project settings:
1. Expo Go (Dev): https://auth.expo.io/@username/foodhabit/auth/callback
2. Standalone: foodhabit://auth/callback

Currently using: https://auth.expo.io/@username/foodhabit/auth/callback
===============================
```

Or tap "Show Supabase Redirect URL" in development mode.

## Testing Deep Links

### Test Expo Go (Development)

1. Start the dev server:
   ```bash
   npx expo start
   ```

2. Open in Expo Go app

3. Try signing in with Google:
   - Should open browser
   - After auth, should return to Expo Go
   - Check console logs for redirect URL

### Test Standalone Build

1. Create a development build:
   ```bash
   # iOS
   eas build --profile development --platform ios

   # Android
   eas build --profile development --platform android
   ```

2. Install on device

3. Try signing in with Google:
   - Should open browser
   - After auth, should return to your app
   - Check console logs for redirect URL

### Manual Deep Link Testing

#### iOS (Simulator)
```bash
xcrun simctl openurl booted "foodhabit://auth/callback"
```

#### Android (Emulator/Device)
```bash
adb shell am start -W -a android.intent.action.VIEW -d "foodhabit://auth/callback" com.foodhabit.com
```

## Troubleshooting

### "Redirect URI Mismatch" Error

**Cause**: Supabase doesn't recognize the redirect URL

**Solutions**:
1. Verify BOTH URLs are added to Supabase Redirect URLs
2. Check for typos in the URLs
3. Check console logs to see which URL is being used
4. Wait a few minutes (Supabase may cache settings)

### Deep Link Not Opening App

**Cause**: URL scheme not properly registered

**Solutions**:

For Expo Go:
- Restart Expo Go app
- Restart development server
- Check that project slug matches

For Standalone:
- Rebuild the app (native changes require rebuild)
- Verify `scheme` in `app.json`
- Check bundle ID (iOS) or package name (Android)
- Test with manual deep link command

### App Opens But No Session

**Cause**: Session data not extracted from URL

**Check**:
1. Console logs for errors
2. `supabase.auth.getSessionFromUrl()` call in `supabaseAuth.ts`
3. URL format in console logs

### Expo Go vs Standalone Confusion

**Issue**: Using wrong redirect URL for environment

**Solution**: The app auto-detects! But verify:
```typescript
// In console logs, check:
Current mode: Expo Go (Development)  // or "Standalone Build"
Currently using: [the URL being used]
```

## Advanced: Custom Domain Universal Links

If you want to use `https://foodhabit.com/auth/callback` instead of `foodhabit://`:

### 1. Set Up Domain Verification

iOS: Create `.well-known/apple-app-site-association`:
```json
{
  "applinks": {
    "apps": [],
    "details": [{
      "appID": "TEAM_ID.com.foodhabit.com",
      "paths": ["/auth/callback"]
    }]
  }
}
```

Android: Create `.well-known/assetlinks.json`:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.foodhabit.com",
    "sha256_cert_fingerprints": ["YOUR_APP_SHA256"]
  }
}]
```

### 2. Host Files

Place these files at:
```
https://foodhabit.com/.well-known/apple-app-site-association
https://foodhabit.com/.well-known/assetlinks.json
```

### 3. Update Redirect URL Function

```typescript
export const getSupabaseRedirectUrl = (): string => {
  if (isExpoGo) {
    return AuthSession.makeRedirectUri({
      useProxy: true,
      path: 'auth/callback',
    });
  }

  // Use universal link for standalone
  return 'https://foodhabit.com/auth/callback';
};
```

## Summary

✅ **Two redirect URLs configured**:
- Development: Expo's auth proxy
- Production: Custom URL scheme

✅ **Automatic detection**:
- App detects environment
- Uses correct URL automatically

✅ **Both URLs in Supabase**:
- Required for OAuth to work
- Covers all scenarios

✅ **Proper configuration**:
- `app.json` has scheme + intent filters
- Works on iOS and Android
- Compatible with Expo Go and standalone

The setup ensures OAuth works seamlessly across all environments without manual switching!

# Apple OAuth Configuration Guide

## Current Implementation Status ✅

The Apple OAuth implementation is **correctly configured** in the code. Here's what's in place:

### 1. App Configuration (`app.json`) ✅

```json
{
  "ios": {
    "bundleIdentifier": "com.foodhabit.com",
    "usesAppleSignIn": true
  },
  "plugins": [
    "expo-apple-authentication"
  ]
}
```

**Status**: ✅ Correct
- `usesAppleSignIn: true` enables Apple Sign In capability
- `expo-apple-authentication` plugin is configured
- Bundle ID is set (required for Apple Sign In)

### 2. Code Implementation (`src/services/auth/supabaseAuth.ts`) ✅

**Flow**:
1. Check iOS platform and availability
2. Request Apple credentials with `FULL_NAME` and `EMAIL` scopes
3. Get `identityToken` from Apple
4. Exchange with Supabase using `signInWithIdToken()`
5. Create session and return user

**Status**: ✅ Correct - Uses native Apple Sign In, no redirect URLs needed

### 3. Key Differences: Apple vs Google OAuth

| Aspect | Apple OAuth | Google OAuth |
|--------|-------------|--------------|
| Method | Native SDK | Web browser redirect |
| Redirect URL | ❌ Not needed | ✅ Required |
| Token Exchange | `signInWithIdToken()` | `exchangeCodeForSession()` |
| Works in Expo Go | ✅ Yes | ✅ Yes (with proxy URL) |
| Platform | iOS only | iOS + Android |

**Important**: Apple OAuth does NOT need redirect URLs because it uses the native iOS SDK directly!

---

## Required Supabase Configuration

### Step 1: Enable Apple Provider in Supabase

1. Go to **Supabase Dashboard** > **Authentication** > **Providers**
2. Find **Apple** provider
3. Click **Enable**

### Step 2: Configure Apple OAuth in Supabase

You need to set up **Sign in with Apple** in Apple Developer portal first:

#### A. Apple Developer Portal Setup

1. **Create an App ID**:
   - Go to https://developer.apple.com/account/resources/identifiers/list
   - Create new App ID
   - Bundle ID: `com.foodhabit.com` (must match app.json)
   - Enable "Sign In with Apple" capability

2. **Create a Services ID** (for Supabase):
   - Go to https://developer.apple.com/account/resources/identifiers/list/serviceId
   - Create new Services ID
   - Identifier: `com.foodhabit.com.service` (or similar)
   - Enable "Sign In with Apple"
   - Configure:
     - **Domains**: Your Supabase project domain
     - **Return URLs**: Your Supabase callback URL

3. **Create a Key**:
   - Go to https://developer.apple.com/account/resources/authkeys/list
   - Create new Key
   - Enable "Sign In with Apple"
   - Download the `.p8` key file (IMPORTANT: only shown once!)
   - Note the **Key ID**

4. **Get Team ID**:
   - Top right of Apple Developer portal
   - 10-character Team ID

#### B. Configure in Supabase

1. Go to **Supabase Dashboard** > **Authentication** > **Providers** > **Apple**

2. Enter the following:
   - **Enabled**: ON
   - **Services ID**: `com.foodhabit.com.service` (from Step 2)
   - **Team ID**: Your 10-character Team ID (from Step 4)
   - **Key ID**: Your Key ID (from Step 3)
   - **Private Key**: Paste contents of `.p8` file (from Step 3)

3. **Save**

---

## Testing Apple OAuth

### Prerequisites

- ✅ iOS device or simulator (iOS 13+)
- ✅ Logged into iCloud on device
- ✅ Apple Developer account configured
- ✅ Supabase Apple provider enabled and configured

### Test in Development (Expo Go)

1. Open app in Expo Go on iOS device
2. Tap "Sign in with Apple" button
3. Should see native Apple Sign In sheet
4. Authenticate with Face ID / Touch ID / Password
5. App should receive user data and sign in

### Test in Production (Standalone Build)

Requires:
- EAS Build or `npx expo prebuild`
- Proper code signing
- Apple Developer provisioning profile

```bash
# Create development build
eas build --profile development --platform ios

# Install on device and test
```

---

## Troubleshooting

### "Apple Sign In is not available"

**Cause**: Not running on iOS or not properly configured

**Fix**:
1. Ensure running on iOS device/simulator (not Android)
2. Check iOS version (13+)
3. Verify `usesAppleSignIn: true` in app.json
4. Rebuild: `npx expo start --clear`

### "No identity token received"

**Cause**: User canceled or authentication failed

**Fix**:
1. Ensure user is logged into iCloud
2. Try again
3. Check Apple Developer portal configuration

### "Supabase sign in failed"

**Cause**: Supabase Apple provider not configured

**Fix**:
1. Verify Apple provider is enabled in Supabase
2. Check Services ID, Team ID, Key ID are correct
3. Verify `.p8` private key is pasted correctly
4. Check Supabase logs for specific error

### "Invalid client_id"

**Cause**: Services ID mismatch

**Fix**:
1. Ensure Services ID in Supabase matches Apple Developer portal
2. Format: `com.foodhabit.com.service`
3. Must be enabled for "Sign In with Apple"

---

## Security Notes

### Apple Privacy Requirements

Apple Sign In has special requirements:
- Must be offered if offering other social logins
- User can choose to hide email (Apple provides relay email)
- Cannot require real email for sign up

### Handling Hidden Emails

```typescript
// Apple may provide privaterelay email
if (credential.email?.includes('privaterelay.appleid.com')) {
  // This is a relay email - Apple is hiding user's real email
  // Still valid and can receive emails
}
```

### Name Availability

**Important**: Apple only provides the user's name on the **first sign in**!

- First sign in: `fullName` is populated
- Subsequent sign ins: `fullName` is null

**Solution**: Store name in your database on first sign in:
```typescript
// Check if we have name
if (credential.fullName) {
  // First sign in - store this!
  const name = `${credential.fullName.givenName} ${credential.fullName.familyName}`;
  // Save to database
}
```

---

## Comparison: Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| App.json config | ✅ Ready | usesAppleSignIn enabled |
| Code implementation | ✅ Ready | Native SDK integration |
| Expo plugin | ✅ Installed | expo-apple-authentication |
| Bundle ID | ✅ Set | com.foodhabit.com |
| Supabase provider | ⚠️ Needs setup | Requires Apple Developer config |
| Apple Developer | ⚠️ Needs setup | App ID, Services ID, Key required |

---

## Next Steps

1. **Set up Apple Developer Account** (if not already):
   - Create App ID with Sign In with Apple
   - Create Services ID
   - Create Key and download `.p8` file

2. **Configure Supabase**:
   - Enable Apple provider
   - Enter Services ID, Team ID, Key ID, Private Key

3. **Test**:
   - Run on iOS device with iCloud signed in
   - Try Apple Sign In
   - Should work immediately after Supabase config

---

## Documentation References

- **Expo Apple Auth**: https://docs.expo.dev/versions/latest/sdk/apple-authentication/
- **Supabase Apple OAuth**: https://supabase.com/docs/guides/auth/social-login/auth-apple
- **Apple Sign In**: https://developer.apple.com/sign-in-with-apple/
- **Creating Keys**: https://developer.apple.com/help/account/manage-keys/create-a-private-key/

---

## Summary

**Apple OAuth Code**: ✅ **READY** - No changes needed

**What You Need**:
1. Apple Developer account setup (App ID, Services ID, Key)
2. Supabase Apple provider configuration
3. iOS device with iCloud for testing

Unlike Google OAuth which needed redirect URL fixes, Apple OAuth uses native SDK and **does not** require redirect URLs. The implementation is correct and will work once Supabase is configured with your Apple Developer credentials.

# Supabase OAuth Setup Guide

This guide walks you through setting up Supabase authentication with Apple Sign In and Google OAuth for the Food Habit app.

## Why Supabase?

Supabase simplifies OAuth implementation by:
- Handling token management and refresh automatically
- Providing a unified API for multiple auth providers
- Managing sessions and user data
- Handling deep links and redirects
- Offering built-in security features

## Table of Contents

1. [Create Supabase Project](#create-supabase-project)
2. [Configure Supabase in Your App](#configure-supabase-in-your-app)
3. [Setup Apple Sign In](#setup-apple-sign-in)
4. [Setup Google OAuth](#setup-google-oauth)
5. [Configure Deep Links](#configure-deep-links)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## Create Supabase Project

### Step 1: Sign Up for Supabase

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Create a new organization if needed

### Step 2: Create a New Project

1. Click "New Project"
2. Fill in the details:
   - **Name**: `foodhabit` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development
3. Click "Create new project"
4. Wait 2-3 minutes for provisioning

### Step 3: Get Your API Credentials

1. Go to Project Settings (gear icon in left sidebar)
2. Click on "API" in the Configuration section
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`

## Configure Supabase in Your App

### Step 1: Create .env File

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Restart your development server:
   ```bash
   npx expo start --clear
   ```

### Step 2: Verify Configuration

The app will log the redirect URL on startup. Check your console for:

```
=== SUPABASE REDIRECT URL ===
Add this to your Supabase project settings:
foodhabit://auth/callback
============================
```

Save this URL - you'll need it soon!

## Setup Apple Sign In

### Step 1: Apple Developer Configuration

1. Go to [Apple Developer](https://developer.apple.com)
2. Navigate to Certificates, Identifiers & Profiles
3. Find or create App ID: `com.foodhabit.com`
4. Enable "Sign In with Apple" capability
5. Save changes

### Step 2: Get Apple Credentials

1. In Apple Developer, go to Certificates, Identifiers & Profiles
2. Click on "Keys" in the left sidebar
3. Click the "+" button to create a new key
4. Name it "Supabase Auth Key"
5. Enable "Sign in with Apple"
6. Click "Configure" next to Sign in with Apple
7. Select your App ID (`com.foodhabit.com`) as the Primary App ID
8. Save and continue
9. Download the key file (.p8) - **you can only download this once!**
10. Note the Key ID shown

### Step 3: Get Additional Apple Info

1. Go to your Apple Developer account page
2. Click "Membership" in sidebar
3. Note your **Team ID** (10 characters, e.g., `AB12CD34EF`)

### Step 4: Configure in Supabase

1. Go to your Supabase project dashboard
2. Click "Authentication" in the left sidebar
3. Click "Providers" tab
4. Find "Apple" and click to expand
5. Toggle "Apple Enabled" to ON
6. Fill in the required fields:
   - **Services ID**: `com.foodhabit.com` (your bundle ID)
   - **Team ID**: Your Apple Team ID from step 3
   - **Key ID**: The Key ID from step 2
   - **Secret Key**: Open the .p8 file and paste its contents
7. Click "Save"

## Setup Google OAuth

### Step 1: Create Google OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API or Google Identity Services:
   - Click "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - If prompted, configure the OAuth consent screen:
     - User Type: External
     - App name: Food Habit
     - User support email: your email
     - Developer contact: your email
     - Save and continue through all steps

5. Create the OAuth client:
   - Application type: **Web application**
   - Name: "Food Habit Web Client"
   - Authorized redirect URIs: **Leave empty for now** (we'll get this from Supabase)
   - Click "Create"
   - Copy the **Client ID** and **Client Secret**

### Step 2: Configure in Supabase

1. Go to your Supabase project dashboard
2. Click "Authentication" in the left sidebar
3. Click "Providers" tab
4. Find "Google" and click to expand
5. Toggle "Google Enabled" to ON
6. Fill in the fields:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
7. **Copy the Callback URL** shown (e.g., `https://xxxxx.supabase.co/auth/v1/callback`)
8. Click "Save"

### Step 3: Add Callback URL to Google

1. Go back to Google Cloud Console
2. Go to "APIs & Services" > "Credentials"
3. Click on your OAuth 2.0 Client ID
4. Under "Authorized redirect URIs", click "ADD URI"
5. Paste the Supabase callback URL you copied
6. Click "Save"

## Configure Deep Links

### Step 1: Add Redirect URL to Supabase

1. In Supabase dashboard, go to "Authentication"
2. Click "URL Configuration" tab
3. Under "Redirect URLs", click "Add URL"
4. Add: `foodhabit://auth/callback`
5. Click "Save"

### Step 2: Verify Deep Link Configuration

The app is already configured with the correct scheme in `app.json`:

```json
{
  "scheme": "foodhabit",
  "plugins": [
    "expo-apple-authentication",
    "expo-web-browser"
  ]
}
```

This enables `foodhabit://` URLs to open your app.

### Step 3: Test Deep Link (Optional)

For iOS:
```bash
xcrun simctl openurl booted "foodhabit://auth/callback"
```

For Android:
```bash
adb shell am start -W -a android.intent.action.VIEW -d "foodhabit://auth/callback"
```

## Testing

### Development Testing (Expo Go)

1. Start the development server:
   ```bash
   npx expo start
   ```

2. Open in Expo Go app

3. Try signing in with Google:
   - Tap "Sign in with Google"
   - Browser opens with Google sign-in
   - After auth, should redirect back to app
   - User info should display

4. Try signing in with Apple (iOS only):
   - Tap "Sign in with Apple"
   - Native Apple Sign In dialog appears
   - After auth, user info should display

### Standalone Build Testing

1. Create a development build:
   ```bash
   # iOS
   eas build --profile development --platform ios

   # Android
   eas build --profile development --platform android
   ```

2. Install the build on your device

3. Test both auth providers

## Troubleshooting

### Common Issues

#### "Invalid API Key" Error

**Cause**: Supabase credentials not configured

**Solutions**:
1. Check `.env` file exists and has correct values
2. Restart Expo development server with `--clear` flag
3. Verify API key from Supabase dashboard matches `.env`

#### Apple Sign In Fails

**Cause**: Apple credentials not configured in Supabase

**Solutions**:
1. Verify Team ID, Key ID, and Services ID in Supabase
2. Check that .p8 key content is correctly pasted
3. Ensure "Sign in with Apple" is enabled for your App ID in Apple Developer
4. Make sure bundle ID matches Services ID

#### Google Sign In Fails

**Cause**: Google OAuth misconfiguration

**Solutions**:
1. Verify Client ID and Secret in Supabase
2. Check that Supabase callback URL is in Google Cloud Console
3. Ensure Google+ API is enabled
4. Try revoking and re-granting app permissions in Google account settings

#### "redirect_uri_mismatch" Error

**Cause**: Redirect URL not properly configured

**Solutions**:
1. Verify `foodhabit://auth/callback` is in Supabase Redirect URLs
2. Check that Supabase callback URL is in Google OAuth client
3. Wait a few minutes after adding URLs (caching)

#### Deep Link Not Opening App

**Cause**: URL scheme not configured

**Solutions**:
1. Verify `scheme` in `app.json` is `foodhabit`
2. For standalone builds, rebuild the app after changing scheme
3. Check bundle ID (iOS) and package name (Android) match

#### Session Not Persisting

**Cause**: Storage not configured

**Solutions**:
1. Current implementation uses in-memory storage
2. To persist sessions, implement custom storage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

Then install:
```bash
npx expo install @react-native-async-storage/async-storage
```

### Debug Mode

The app includes debug helpers:

1. **Show Redirect URL button**: Tap to see the Supabase redirect URL
2. **Console logging**: Check console for auth errors and redirect URLs
3. **Error alerts**: OAuth errors are shown in alerts

### Supabase Dashboard Debugging

1. Go to "Authentication" > "Users"
   - See all authenticated users
   - Check user metadata

2. Go to "Authentication" > "Logs"
   - View auth events
   - See errors and warnings

## Security Best Practices

### Environment Variables

1. **Never commit .env**: Already in `.gitignore`
2. **Use different keys for prod**: Create separate Supabase project for production
3. **Rotate keys regularly**: Supabase allows key rotation

### Row Level Security (RLS)

If you add database tables, enable RLS:

```sql
-- Enable RLS on a table
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own data
CREATE POLICY "Users can read own data"
ON your_table
FOR SELECT
USING (auth.uid() = user_id);
```

### Token Management

- Supabase handles token refresh automatically
- Sessions expire after 1 hour by default
- Refresh tokens are valid for 60 days

## Next Steps

After setting up auth:

1. **Add database tables**: Store user profiles, preferences, etc.
2. **Implement RLS policies**: Secure your data
3. **Add protected routes**: Guard sensitive screens
4. **Handle auth events**: Respond to sign in/out events
5. **Add social profiles**: Access user's social data

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase OAuth Providers](https://supabase.com/docs/guides/auth/social-login)
- [Expo Authentication Guide](https://docs.expo.dev/guides/authentication/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Support

- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)
- [Expo Forums](https://forums.expo.dev)

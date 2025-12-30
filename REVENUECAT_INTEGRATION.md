# RevenueCat Integration Summary

## What Was Done

### 1. Created RevenueCat Service (`src/services/revenueCatService.ts`)
- **iOS-only implementation** with dynamic imports to prevent NativeEventEmitter errors
- Handles SDK initialization with API key from environment variables
- Provides functions for:
  - Initializing RevenueCat
  - Getting offerings
  - Checking subscription status
  - Restoring purchases
  - Logging in/out users
- Uses conditional imports to avoid loading native modules on unsupported platforms

### 2. Created New RevenueCat Paywall Screen (`src/screens/RevenueCatPaywall.tsx`)
- Uses the native RevenueCat UI component (`react-native-purchases-ui`)
- Replaces the custom PaywallScreen
- Features:
  - Native RevenueCat paywall presentation
  - Automatic purchase handling
  - Restore purchases functionality
  - Error handling for missing offerings
  - Loading states

### 3. Updated Onboarding (`src/screens/onboarding/PaywallStep.tsx`)
- Now uses `RevenueCatPaywall` instead of custom `PaywallScreen`

### 4. Updated App.tsx
- Added RevenueCat initialization on app startup
- Logs in user to RevenueCat when authenticated
- Replaced `PaywallScreen` with `RevenueCatPaywall` in navigation

### 5. Updated app.config.js
- Converted from app.json to enable environment variable access
- Configured `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` from .env file
- **Removed web and Android configurations** (iOS-only app)

### 6. Created Helper Hook (`src/hooks/useSubscription.ts`)
- Easy way to check subscription status anywhere in the app

## What You Need to Do

### 1. Configure RevenueCat Dashboard
Before the paywall will work, you need to set up your RevenueCat account:

1. **Create Products in App Store Connect**
   - Go to App Store Connect
   - Create your subscription products (e.g., monthly subscription)
   - Note the product IDs

2. **Configure RevenueCat Dashboard**
   - Log in to [RevenueCat Dashboard](https://app.revenuecat.com)
   - Add your iOS app bundle ID: `com.foodhabit.app`
   - Add your App Store Connect API key
   - Create products matching your App Store Connect products
   - Create an Offering (e.g., "default")
   - Add packages to your offering

3. **Create an Entitlement**
   - In RevenueCat dashboard, create an entitlement called `premium`
   - Attach your products to this entitlement
   - This is what the app checks for subscription status

4. **Configure Paywall**
   - In RevenueCat dashboard, go to Paywalls
   - Create a paywall design
   - Attach it to your offering

### 2. Environment Variable
Make sure your `.env` file has:
```
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=your_actual_api_key_here
```

### 3. Test the Integration
```bash
# Clear cache and restart
npm start -- --clear

# Or for iOS
npm run ios
```

### 4. Optional: Delete Old PaywallScreen
Once everything is working, you can delete:
- `src/screens/PaywallScreen.tsx` (the old custom paywall)

And remove it from:
- `src/screens/index.ts` (remove the export line)

## How It Works

1. **App Startup**: RevenueCat SDK initializes with your API key
2. **User Login**: When user authenticates, they're logged into RevenueCat
3. **Paywall Display**: When paywall is shown, it fetches offerings from RevenueCat
4. **Purchase Flow**: Native RevenueCat UI handles the entire purchase flow
5. **Subscription Check**: App can check subscription status via `checkSubscriptionStatus()`

## Testing

### Test Purchases
1. Use a Sandbox Apple ID for testing
2. In iOS Settings > App Store > Sandbox Account, sign in with test account
3. Launch app and try purchasing
4. Verify subscription appears in RevenueCat dashboard

### Test Restore
1. Make a purchase with test account
2. Delete and reinstall app
3. Tap "Restore Purchase" button
4. Verify subscription is restored

## Troubleshooting

### "Offerings Unavailable" Error
- Check your internet connection
- Verify API key is correct in .env
- Ensure offerings are configured in RevenueCat dashboard
- Check console logs for specific errors

### Purchase Not Working
- Verify products are set up in App Store Connect
- Ensure products are added to RevenueCat
- Check that entitlement "premium" exists
- Verify bundle ID matches everywhere

### Subscription Status Not Updating
- Make sure you're using the same user ID in RevenueCat as in your app
- Check that entitlement name is exactly "premium"
- Verify purchase completed successfully in RevenueCat dashboard

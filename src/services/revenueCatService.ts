import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { PurchasesOffering } from 'react-native-purchases';

/**
 * RevenueCat Service
 * Handles subscription management and paywall presentation
 */

let isInitialized = false;
let Purchases: any = null;

// Only import Purchases on iOS to avoid NativeEventEmitter errors
const getPurchases = async () => {
    if (Platform.OS === 'ios' && !Purchases) {
        const module = await import('react-native-purchases');
        Purchases = module.default;
    }
    return Purchases;
};

/**
 * Initialize RevenueCat SDK
 * Should be called once at app startup
 */
export const initializeRevenueCat = async (userId?: string): Promise<void> => {
    // Only initialize on iOS
    if (Platform.OS !== 'ios') {
        console.log('RevenueCat is only supported on iOS');
        return;
    }

    if (isInitialized) {
        console.log('RevenueCat already initialized');
        return;
    }

    try {
        const PurchasesModule = await getPurchases();
        if (!PurchasesModule) {
            console.error('Failed to load Purchases module');
            return;
        }

        const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;

        if (!apiKey) {
            console.error('RevenueCat API key not found in environment variables');
            return;
        }

        // Configure RevenueCat
        const { LOG_LEVEL } = await import('react-native-purchases');
        PurchasesModule.setLogLevel(LOG_LEVEL.DEBUG);

        // Initialize with iOS API key
        await PurchasesModule.configure({ apiKey });

        // Set user ID if provided
        if (userId) {
            await PurchasesModule.logIn(userId);
        }

        isInitialized = true;
        console.log('RevenueCat initialized successfully');
    } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
        throw error;
    }
};

/**
 * Get current offerings from RevenueCat
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
    if (Platform.OS !== 'ios') {
        return null;
    }

    try {
        const PurchasesModule = await getPurchases();
        if (!PurchasesModule) return null;

        const offerings = await PurchasesModule.getOfferings();
        if (offerings.current !== null) {
            return offerings.current;
        }
        return null;
    } catch (error) {
        console.error('Error fetching offerings:', error);
        return null;
    }
};

/**
 * Check if user has active subscription
 */
export const checkSubscriptionStatus = async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') {
        return false;
    }

    try {
        const PurchasesModule = await getPurchases();
        if (!PurchasesModule) return false;

        const customerInfo = await PurchasesModule.getCustomerInfo();
        return typeof customerInfo.entitlements.active['premium'] !== 'undefined';
    } catch (error) {
        console.error('Error checking subscription status:', error);
        return false;
    }
};

/**
 * Restore purchases
 */
export const restorePurchases = async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') {
        return false;
    }

    try {
        const PurchasesModule = await getPurchases();
        if (!PurchasesModule) return false;

        const customerInfo = await PurchasesModule.restorePurchases();
        return typeof customerInfo.entitlements.active['premium'] !== 'undefined';
    } catch (error) {
        console.error('Error restoring purchases:', error);
        throw error;
    }
};

/**
 * Log in user to RevenueCat
 */
export const loginUser = async (userId: string): Promise<void> => {
    if (Platform.OS !== 'ios') {
        return;
    }

    try {
        const PurchasesModule = await getPurchases();
        if (!PurchasesModule) return;

        await PurchasesModule.logIn(userId);
        console.log('User logged in to RevenueCat:', userId);
    } catch (error) {
        console.error('Error logging in user to RevenueCat:', error);
        throw error;
    }
};

/**
 * Log out user from RevenueCat
 */
export const logoutUser = async (): Promise<void> => {
    if (Platform.OS !== 'ios') {
        return;
    }

    try {
        const PurchasesModule = await getPurchases();
        if (!PurchasesModule) return;

        await PurchasesModule.logOut();
        console.log('User logged out from RevenueCat');
    } catch (error) {
        console.error('Error logging out user from RevenueCat:', error);
        throw error;
    }
};

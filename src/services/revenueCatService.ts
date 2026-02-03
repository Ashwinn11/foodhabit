import { Platform, NativeModules } from 'react-native';

// Dynamically import to prevent crash in Expo Go if native modules are missing
let Purchases: any = null;
let PurchasesUI: any = null;

const checkNativeModules = () => {
    try {
        // The native module names for RevenueCat
        const hasRNPurchases = !!NativeModules.RNPurchases;

        if (!hasRNPurchases && Platform.OS !== 'web') {
            console.warn('RevenueCat: Native module RNPurchases not found in this build.');
            return false;
        }

        const PurchasesModule = require('react-native-purchases');
        const PurchasesUIModule = require('react-native-purchases-ui');

        Purchases = PurchasesModule.default || PurchasesModule;
        PurchasesUI = PurchasesUIModule.default || PurchasesUIModule;

        return true;
    } catch (e) {
        console.error('RevenueCat detection error:', e);
        return false;
    }
};

const isAvailable = checkNativeModules();

// User specified: Only Apple is used
const APPLE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;

// The user specified the paywall name as "GutScan Pro"
export const REVENUECAT_PAYWALL_ID = 'GutScan Pro';

export class RevenueCatService {
    private static initialized = false;
    private static configuring = false;

    static checkAvailability() {
        return isAvailable && !!Purchases && !!PurchasesUI;
    }

    static async initialize() {
        if (!this.checkAvailability() || this.initialized || this.configuring || !APPLE_API_KEY) {
            return;
        }

        this.configuring = true;
        try {
            // Check if native SDK is already configured (prevents warnings on reload)
            const isConfigured = await Purchases.isConfigured();
            if (isConfigured) {
                this.initialized = true;
                return;
            }

            if (Platform.OS === 'ios') {
                await Purchases.configure({ apiKey: APPLE_API_KEY });
                this.initialized = true;
                console.log('✅ RevenueCat initialized successfully');
            }
        } catch (e) {
            console.error('RevenueCat initialization failed', e);
        } finally {
            this.configuring = false;
        }
    }

    static async logIn(userId: string) {
        if (!this.checkAvailability() || !this.initialized) return;
        try {
            await Purchases.logIn(userId);

        } catch (e) {
            console.error('RevenueCat login failed', e);
        }
    }

    static async logOut() {
        if (!this.checkAvailability() || !this.initialized) return;
        try {
            await Purchases.logOut();

        } catch (e) {
            console.error('RevenueCat logout failed', e);
        }
    }

    static async presentPaywall() {
        if (!this.checkAvailability() || !this.initialized) {
            console.warn('Paywall skipped: RevenueCat not initialized or available.');
            return null;
        }

        try {
            const result = await PurchasesUI.presentPaywall({
                displayCloseButton: false, // Hard paywall - no close button
            });
            return result;
        } catch (e) {
            console.error('Error presenting RevenueCat paywall', e);
            return null;
        }
    }

    static async isPremium(forceRefresh: boolean = false) {
        if (!this.checkAvailability() || !this.initialized) return false;

        try {
            // Force refresh to get latest purchase status, bypassing cache
            const customerInfo = forceRefresh
                ? await Purchases.getCustomerInfo({ fetchPolicy: 'FETCH_POLICY_FETCH_CURRENT' })
                : await Purchases.getCustomerInfo();

            const hasPremium = customerInfo.entitlements.active[REVENUECAT_PAYWALL_ID] !== undefined;

            return hasPremium;
        } catch (e) {
            console.error('Error checking premium status', e);
            return false;
        }
    }

    static async manageSubscription() {
        if (!this.checkAvailability() || this.initialized) {
            if (Platform.OS === 'ios') return 'https://apps.apple.com/account/subscriptions';
            return null;
        }

        try {
            const customerInfo = await Purchases.getCustomerInfo();
            if (customerInfo.managementURL) {
                return customerInfo.managementURL;
            }

            if (Platform.OS === 'ios') {
                return 'https://apps.apple.com/account/subscriptions';
            }
            return null;
        } catch (e) {
            console.error('Error getting management URL', e);
            return null;
        }
    }

    static async purchasePackage(packageType: 'Monthly' | 'Yearly') {
        if (!this.checkAvailability() || !this.initialized) return false;

        try {
            const offerings = await Purchases.getOfferings();
            const currentOffering = offerings.current;
            if (!currentOffering) return false;

            const pkg = packageType === 'Yearly'
                ? currentOffering.annual
                : currentOffering.monthly;

            if (!pkg) return false;

            const { customerInfo } = await Purchases.purchasePackage(pkg);
            return customerInfo.entitlements.active[REVENUECAT_PAYWALL_ID] !== undefined;
        } catch (e: any) {
            if (!e.userCancelled) {
                console.error('Error purchasing package', e);
            }
            return false;
        }
    }

    static async restorePurchases() {
        if (!this.checkAvailability() || !this.initialized) return false;

        try {
            const customerInfo = await Purchases.restorePurchases();
            return customerInfo.entitlements.active[REVENUECAT_PAYWALL_ID] !== undefined;
        } catch (e) {
            console.error('Error restoring purchases', e);
            return false;
        }
    }

    static addCustomerInfoUpdateListener(callback: (customerInfo: any) => void) {
        if (!this.checkAvailability()) return () => { };

        const listenerToken = Purchases.addCustomerInfoUpdateListener(callback);

        return () => {
            // Cleanup: remove the listener
            // In modern react-native-purchases, the listenerToken is an object with a remove() method
            // or we use the specific removal method depending on the version.
            if (listenerToken && typeof listenerToken.remove === 'function') {
                listenerToken.remove();
            } else if (Purchases.removeCustomerInfoUpdateListener) {
                Purchases.removeCustomerInfoUpdateListener(listenerToken);
            }
        };
    }
}

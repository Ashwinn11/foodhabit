import { create } from 'zustand';
import Purchases, { type CustomerInfo } from 'react-native-purchases';

export interface PlanDetails {
    productIdentifier: string;
    latestPurchaseDate: string;
    expirationDate: string | null;
}

interface SubscriptionState {
    isPremium: boolean;
    isLoading: boolean;
    hasLoaded: boolean; // true after first sync attempt (success or fail)
    planDetails: PlanDetails | null;
    setPremium: (isPremium: boolean) => void;
    setLoading: (isLoading: boolean) => void;
    sync: () => Promise<void>;
    initializeListener: () => () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
    isPremium: false,
    isLoading: true,
    hasLoaded: false,
    planDetails: null,

    setPremium: (isPremium) => set({ isPremium }),
    setLoading: (isLoading) => set({ isLoading }),

    sync: async () => {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            const activeEntitlement = customerInfo.entitlements.active['GutScan Pro'];
            const hasPremium = !!activeEntitlement;

            const details: PlanDetails | null = activeEntitlement ? {
                productIdentifier: activeEntitlement.productIdentifier,
                latestPurchaseDate: activeEntitlement.latestPurchaseDate,
                expirationDate: activeEntitlement.expirationDate,
            } : null;

            set({ isPremium: hasPremium, planDetails: details, isLoading: false, hasLoaded: true });
        } catch (e) {
            console.error('Subscription sync error:', e);
            // Always mark as loaded so render guard doesn't block forever
            set({ isLoading: false, hasLoaded: true });
        }
    },

    initializeListener: () => {
        const listener = (info: CustomerInfo) => {
            const activeEntitlement = info.entitlements.active['GutScan Pro'];
            const hasPremium = !!activeEntitlement;
            const details: PlanDetails | null = activeEntitlement ? {
                productIdentifier: activeEntitlement.productIdentifier,
                latestPurchaseDate: activeEntitlement.latestPurchaseDate,
                expirationDate: activeEntitlement.expirationDate,
            } : null;

            set({ isPremium: hasPremium, planDetails: details, isLoading: false, hasLoaded: true });
        };

        Purchases.addCustomerInfoUpdateListener(listener);
        return () => { };
    }
}));

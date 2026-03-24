import { create } from 'zustand';
import Purchases, { type CustomerInfo } from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    markLoaded: () => void; // sets isLoading:false + hasLoaded:true atomically
    sync: () => Promise<void>;
    initializeListener: () => () => void;
    loadCachedState: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
    isPremium: false,
    isLoading: true,
    hasLoaded: false,
    planDetails: null,

    setPremium: (isPremium) => set({ isPremium }),
    setLoading: (isLoading) => set({ isLoading }),
    markLoaded: () => set({ isLoading: false, hasLoaded: true }),

    loadCachedState: async () => {
        try {
            const cached = await AsyncStorage.getItem('last_premium_state');
            if (cached === 'true') {
                set({ isPremium: true });
            }
        } catch (e) {
            // silent fail on cache read
        }
    },

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

            // Cache the result for next app launch
            AsyncStorage.setItem('last_premium_state', hasPremium ? 'true' : 'false').catch(() => {});

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

            AsyncStorage.setItem('last_premium_state', hasPremium ? 'true' : 'false').catch(() => {});
            set({ isPremium: hasPremium, planDetails: details, isLoading: false, hasLoaded: true });
        };

        Purchases.addCustomerInfoUpdateListener(listener);
        return () => { };
    }
}));

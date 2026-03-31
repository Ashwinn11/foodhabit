import { create } from 'zustand';
import Purchases, { type CustomerInfo } from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSubscriptionStateFromCustomerInfo, type PlanDetails } from '@/lib/subscription';

const SUBSCRIPTION_TIMEOUT_MS = 5000;

let customerInfoListener: ((info: CustomerInfo) => void) | null = null;

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
};

interface SubscriptionState {
    isPremium: boolean;
    isLoading: boolean;
    hasLoaded: boolean; // true after first sync attempt (success or fail)
    planDetails: PlanDetails | null;
    setPremium: (isPremium: boolean) => void;
    setLoading: (isLoading: boolean) => void;
    markLoaded: () => void; // sets isLoading:false + hasLoaded:true atomically
    hydrateCustomerInfo: (customerInfo: CustomerInfo) => void;
    reset: () => void;
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
    hydrateCustomerInfo: (customerInfo) => {
        const nextState = getSubscriptionStateFromCustomerInfo(customerInfo);
        AsyncStorage.setItem('last_premium_state', nextState.isPremium ? 'true' : 'false').catch(() => {});
        set({ ...nextState, isLoading: false, hasLoaded: true });
    },
    reset: () => {
        AsyncStorage.removeItem('last_premium_state').catch(() => {});
        set({ isPremium: false, isLoading: false, hasLoaded: true, planDetails: null });
    },

    loadCachedState: async () => {
        try {
            const cached = await AsyncStorage.getItem('last_premium_state');
            if (cached === 'true' || cached === 'false') {
                set({ isPremium: cached === 'true' });
            }
        } catch (e) {
            // silent fail on cache read
        }
    },

    sync: async () => {
        try {
            const customerInfo = await withTimeout(
                Purchases.getCustomerInfo(),
                SUBSCRIPTION_TIMEOUT_MS,
                'RevenueCat sync'
            );
            get().hydrateCustomerInfo(customerInfo);
        } catch (e) {
            console.error('Subscription sync error:', e);
            // Always mark as loaded so render guard doesn't block forever
            set({ isLoading: false, hasLoaded: true });
        }
    },

    initializeListener: () => {
        if (!customerInfoListener) {
            customerInfoListener = (info: CustomerInfo) => {
                get().hydrateCustomerInfo(info);
            };
            Purchases.addCustomerInfoUpdateListener(customerInfoListener);
        }

        return () => {
            if (customerInfoListener) {
                Purchases.removeCustomerInfoUpdateListener(customerInfoListener);
                customerInfoListener = null;
            }
        };
    }
}));

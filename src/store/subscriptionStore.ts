import { create } from 'zustand';
import Purchases, { type CustomerInfo } from 'react-native-purchases';

interface SubscriptionState {
    isPremium: boolean;
    isLoading: boolean;
    setPremium: (isPremium: boolean) => void;
    setLoading: (isLoading: boolean) => void;
    sync: () => Promise<void>;
    initializeListener: () => () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
    isPremium: false,
    isLoading: true,

    setPremium: (isPremium) => set({ isPremium }),
    setLoading: (isLoading) => set({ isLoading }),

    sync: async () => {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            const hasPremium = !!customerInfo.entitlements.active['GutScan Pro'];
            set({ isPremium: hasPremium, isLoading: false });
        } catch (e) {
            console.error('Subscription sync error:', e);
            set({ isPremium: false, isLoading: false });
        }
    },

    initializeListener: () => {
        const listener = (info: CustomerInfo) => {
            const hasPremium = !!info.entitlements.active['GutScan Pro'];
            set({ isPremium: hasPremium });
        };

        Purchases.addCustomerInfoUpdateListener(listener);

        // Return cleanup function
        return () => {
            // react-native-purchases currently doesn't have a specific removeListener for the global listener
            // but we can at least avoid triggering updates if we were to unmount this conceptual "manager"
        };
    }
}));

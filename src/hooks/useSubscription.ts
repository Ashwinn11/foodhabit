import { useState, useEffect } from 'react';
import Purchases, { type CustomerInfo } from 'react-native-purchases';
import { useAuthStore } from '@/store/authStore';

export function useSubscription() {
    const { profile, user } = useAuthStore();
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkSubscription = async () => {
            try {
                const customerInfo = await Purchases.getCustomerInfo();
                const hasPremium = !!customerInfo.entitlements.active['GutScan Pro'];
                setIsPremium(hasPremium);
            } catch (e) {
                console.error('Subscription check error:', e);
                setIsPremium(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkSubscription();

        // Listen for updates
        const listener = (info: CustomerInfo) => {
            const hasPremium = !!info.entitlements.active['GutScan Pro'];
            setIsPremium(hasPremium);
        };

        Purchases.addCustomerInfoUpdateListener(listener);
    }, [user?.id]);

    return { isPremium, isLoading };
}

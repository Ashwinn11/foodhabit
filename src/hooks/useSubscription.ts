import { useState, useEffect } from 'react';
import { checkSubscriptionStatus } from '../services/revenueCatService';

/**
 * Hook to check if user has an active premium subscription
 * @returns Object with isPremium status and loading state
 */
export const useSubscription = () => {
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            setLoading(true);
            const hasSubscription = await checkSubscriptionStatus();
            setIsPremium(hasSubscription);
        } catch (error) {
            console.error('Error checking subscription status:', error);
            setIsPremium(false);
        } finally {
            setLoading(false);
        }
    };

    const refresh = () => {
        checkStatus();
    };

    return { isPremium, loading, refresh };
};

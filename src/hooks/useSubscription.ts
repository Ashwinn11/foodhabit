import { useSubscriptionStore } from '@/store/subscriptionStore';

export function useSubscription() {
    const { isPremium, isLoading } = useSubscriptionStore();
    return { isPremium, isLoading };
}

import type { CustomerInfo } from 'react-native-purchases';

export interface PlanDetails {
    productIdentifier: string;
    latestPurchaseDate: string;
    expirationDate: string | null;
}

const PREMIUM_ENTITLEMENT_ID = 'GutScan Pro';

export const getSubscriptionStateFromCustomerInfo = (customerInfo: CustomerInfo): {
    isPremium: boolean;
    planDetails: PlanDetails | null;
} => {
    const activeEntitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
    const isPremium = !!activeEntitlement;

    return {
        isPremium,
        planDetails: activeEntitlement ? {
            productIdentifier: activeEntitlement.productIdentifier,
            latestPurchaseDate: activeEntitlement.latestPurchaseDate,
            expirationDate: activeEntitlement.expirationDate,
        } : null,
    };
};

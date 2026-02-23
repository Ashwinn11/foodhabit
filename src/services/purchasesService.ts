import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const RC_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '';

export const ENTITLEMENT_ID = 'GutScan Pro';

export const purchasesService = {
  configure: (userId?: string) => {
    try {
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }
      Purchases.configure({ apiKey: RC_API_KEY, appUserID: userId ?? null });
    } catch {
      // RC not available in this build
    }
  },

  setUserId: async (userId: string) => {
    try {
      await Purchases.logIn(userId);
    } catch {}
  },

  hasProAccess: async (): Promise<boolean> => {
    try {
      const info = await Purchases.getCustomerInfo();
      return ENTITLEMENT_ID in info.entitlements.active;
    } catch {
      return false;
    }
  },

  getSubscriptionInfo: async (): Promise<{ plan: string; renewal: string } | null> => {
    try {
      const info = await Purchases.getCustomerInfo();
      const entitlement = info.entitlements.active[ENTITLEMENT_ID];
      if (!entitlement) return null;
      return {
        plan: entitlement.productIdentifier?.includes('yearly') ? 'Pro Yearly' : 'Pro Monthly',
        renewal: entitlement.expirationDate
          ? new Date(entitlement.expirationDate).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })
          : 'Active',
      };
    } catch {
      return null;
    }
  },

  logOut: async () => {
    try {
      await Purchases.logOut();
    } catch {}
  },

  restorePurchases: async (): Promise<boolean> => {
    try {
      const info = await Purchases.restorePurchases();
      return ENTITLEMENT_ID in info.entitlements.active;
    } catch {
      return false;
    }
  },
};

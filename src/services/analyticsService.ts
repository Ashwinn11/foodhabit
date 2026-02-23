import {
  getAnalytics,
  logEvent,
  setUserId as rcSetUserId,
  setUserProperty,
} from '@react-native-firebase/analytics';

// Lazy-get the analytics instance — returns null if Firebase isn't ready yet
function ga() {
  try {
    return getAnalytics();
  } catch {
    return null;
  }
}

export const analyticsService = {
  setUserId: (id: string) => {
    const a = ga(); if (!a) return;
    rcSetUserId(a, id).catch(() => {});
  },

  setVariant: (variant: 'A' | 'B') => {
    const a = ga(); if (!a) return;
    setUserProperty(a, 'ob_variant', variant).catch(() => {});
  },

  logObStart: () => {
    const a = ga(); if (!a) return;
    logEvent(a, 'ob_start').catch(() => {});
  },

  logObGoal: (goal: string) => {
    const a = ga(); if (!a) return;
    logEvent(a, 'ob_goal', { goal }).catch(() => {});
  },

  logObCondition: (condition: string) => {
    const a = ga(); if (!a) return;
    logEvent(a, 'ob_condition', { condition }).catch(() => {});
  },

  logObPaywallView: (variant: 'A' | 'B') => {
    const a = ga(); if (!a) return;
    logEvent(a, 'ob_paywall_view', { variant }).catch(() => {});
  },

  logObPaywallDismiss: (variant: 'A' | 'B') => {
    const a = ga(); if (!a) return;
    logEvent(a, 'ob_paywall_dismiss', { variant }).catch(() => {});
  },

  logObPurchase: (variant: 'A' | 'B') => {
    const a = ga(); if (!a) return;
    logEvent(a, 'ob_purchase', { variant }).catch(() => {});
  },

  logObComplete: () => {
    const a = ga(); if (!a) return;
    logEvent(a, 'ob_complete').catch(() => {});
  },
};

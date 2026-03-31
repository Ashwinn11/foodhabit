import { getSubscriptionStateFromCustomerInfo } from '@/lib/subscription';

describe('getSubscriptionStateFromCustomerInfo', () => {
  it('returns premium details when GutScan Pro entitlement is active', () => {
    const customerInfo = {
      entitlements: {
        active: {
          'GutScan Pro': {
            productIdentifier: 'gutbuddy_premium_monthly',
            latestPurchaseDate: '2026-03-31T10:00:00Z',
            expirationDate: '2026-04-30T10:00:00Z',
          },
        },
      },
    } as any;

    expect(getSubscriptionStateFromCustomerInfo(customerInfo)).toEqual({
      isPremium: true,
      planDetails: {
        productIdentifier: 'gutbuddy_premium_monthly',
        latestPurchaseDate: '2026-03-31T10:00:00Z',
        expirationDate: '2026-04-30T10:00:00Z',
      },
    });
  });

  it('returns free state when no active entitlement exists', () => {
    const customerInfo = {
      entitlements: {
        active: {},
      },
    } as any;

    expect(getSubscriptionStateFromCustomerInfo(customerInfo)).toEqual({
      isPremium: false,
      planDetails: null,
    });
  });
});

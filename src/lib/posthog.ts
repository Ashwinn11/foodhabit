import PostHog from 'posthog-react-native';

export const posthog = new PostHog(
    process.env.EXPO_PUBLIC_POSTHOG_API_KEY!,
    { host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com' }
);

// ─── Typed event helpers ──────────────────────────────────────────────────────

export const analytics = {
    // ── Onboarding screen views (one unique name per screen) ──────────────────
    onboardingStarted: () =>
        posthog.capture('onboarding_started'),

    benefitsViewed: () =>
        posthog.capture('benefits_viewed'),

    profileViewed: () =>
        posthog.capture('profile_viewed'),

    conditionsViewed: () =>
        posthog.capture('conditions_viewed'),

    onboardingCompleted: (properties: { conditions: string[]; plan: string }) =>
        posthog.capture('onboarding_completed', properties),

    notificationsViewed: () =>
        posthog.capture('notifications_viewed'),

    planViewed: () =>
        posthog.capture('plan_viewed'),

    // ── Paywall ───────────────────────────────────────────────────────────────
    paywallViewed: (source: string) =>
        posthog.capture('paywall_viewed', { source }),

    paywallDismissed: () =>
        posthog.capture('paywall_dismissed'),

    paywallRestoreAttempted: () =>
        posthog.capture('paywall_restore_attempted'),

    subscriptionStarted: (plan: string, price: number) =>
        posthog.capture('subscription_started', { plan, price }),

    // ── Auth ──────────────────────────────────────────────────────────────────
    userIdentified: (userId: string, traits: { email?: string; name?: string; plan?: string }) =>
        posthog.identify(userId, traits),

    userSignedOut: () => posthog.reset(),

    // ── Core features ─────────────────────────────────────────────────────────
    foodLogged: (properties: { food_name: string; verdict: string; fodmap_risk: string; meal_type: string }) =>
        posthog.capture('food_logged', properties),

    menuScanned: (properties: { items_found: number; safe_count: number; avoid_count: number }) =>
        posthog.capture('menu_scanned', properties),

    recipeGenerated: (properties: { trigger_count: number; ingredients_count: number }) =>
        posthog.capture('recipe_generated', properties),

    triggerConfirmed: (trigger: string) =>
        posthog.capture('trigger_confirmed', { trigger }),
};


/**
 * App Text Content - Friendly & Empathetic Edition
 * Warm, encouraging, and relatable tone.
 * Medical topic but human and approachable.
 */

// Shared texts used across multiple screens
const SHARED_TEXTS = {
  appName: 'Gut Harmony',
  legalTerms: 'Terms',
  legalPrivacy: 'Privacy Policy',
  disclaimer: 'Not a substitute for medical advice. Always chat with your doctor about health concerns.',
  valueProps: [
    {
      title: 'Find Your Food Triggers',
      description: 'Discover which foods work for you in just 3 days',
      icons: {
        outline: 'search-outline',
        solid: 'search',
      },
    },
    {
      title: 'Track Your Progress',
      description: 'See the patterns in how you feel',
      icons: {
        outline: 'stats-chart-outline',
        solid: 'stats-chart',
      },
    },
    {
      title: 'Share with Your Doctor',
      description: 'Easy reports for your next check-up',
      icons: {
        outline: 'document-outline',
        solid: 'document',
      },
    },
  ],
};

export const APP_TEXTS = {
  // App branding
  appName: SHARED_TEXTS.appName,

  // Auth Screen
  auth: {
    title: SHARED_TEXTS.appName,
    subtitle: 'Understand your gut better in 7 days. Find what works for you.',
    valueProps: SHARED_TEXTS.valueProps.map((prop) => ({
      icon: prop.icons.outline,
      text: prop.title,
    })),
    legalPrefix: 'By signing in, you agree to our',
    termsLink: SHARED_TEXTS.legalTerms,
    privacyLink: SHARED_TEXTS.legalPrivacy,
  },

  // Onboarding Splash Screen
  onboardingSplash: {
    title: SHARED_TEXTS.appName,
    subtitle: 'Get to know your gut. One log at a time.',
    valueProps: SHARED_TEXTS.valueProps.map((prop) => ({
      icon: prop.icons.solid,
      title: prop.title,
      description: prop.description,
    })),
    cta: 'Let\'s Begin',
    disclaimer: SHARED_TEXTS.disclaimer,
  },

  // Onboarding Profile Screen
  onboardingProfile: {
    title: 'Tell us about you',
    subtitle: 'So we can give you personalized insights',
    nameLabel: 'Your Name',
    namePlaceholder: 'What\'s your name?',
    conditionLabel: 'Any digestive issues you\'ve been diagnosed with?',
    issueLabel: 'What bothers you most?',
    continueButton: 'Next',
  },

  // Onboarding First Log Screen (Stool Entry)
  onboardingFirstLog: {
    stoolStep: {
      title: 'How are things today?',
      subtitle: 'Select the stool type that matches yours',
    },
    energyStep: {
      title: 'How\'s your energy?',
      subtitle: 'Rate from tired to energized',
    },
    symptomsStep: {
      title: 'Any symptoms?',
      subtitle: 'Check anything you\'re experiencing',
    },
    mealsStep: {
      title: 'What did you eat?',
      subtitle: 'Tell us what you had (helps us find patterns)',
      mealPlaceholder: 'e.g., breakfast, lunch, snacks...',
      addButton: 'Add Meal',
    },
    nextButton: 'Next',
    completeButton: 'Done',
    savingButton: 'Saving...',
  },

  // Onboarding Celebration Screen
  onboardingCelebration: {
    heading: 'You\'re off to a great start!',
    progressText: (entryCount: number) => `${entryCount}/3 entries logged`,
    nextText: 'Log 2 more entries to unlock your personalized insights',
    buttonText: 'Back to Home',
  },

  // Conditions (for selection screens)
  conditions: [
    { id: 'IBS', label: 'IBS' },
    { id: 'crohns', label: 'Crohn\'s' },
    { id: 'colitis', label: 'Colitis' },
    { id: 'celiac', label: 'Celiac' },
    { id: 'gerd', label: 'GERD' },
    { id: 'general', label: 'Just figuring it out' },
  ],

  // Main issues
  mainIssues: [
    { id: 'bloating', label: 'Bloating' },
    { id: 'cramping', label: 'Cramping' },
    { id: 'diarrhea', label: 'Diarrhea' },
    { id: 'constipation', label: 'Constipation' },
    { id: 'energy', label: 'Low Energy' },
    { id: 'multiple', label: 'Multiple Issues' },
  ],

  // Stool types - Simplified and cuter
  stoolTypes: [
    { type: 1, label: 'Hard Pellets' },
    { type: 2, label: 'Lumpy Log' },
    { type: 3, label: 'Cracked Log' },
    { type: 4, label: 'Smooth Log' },
    { type: 5, label: 'Soft Blobs' },
    { type: 6, label: 'Mushy' },
    { type: 7, label: 'Liquid' },
  ],

  // Energy levels
  energyLevels: [
    { value: 1, icon: 'sad', label: 'Very Low' },
    { value: 5, icon: 'remove', label: 'Okay' },
    { value: 8, icon: 'happy', label: 'Good' },
    { value: 10, icon: 'flash', label: 'Great' },
  ],

  // Symptoms
  symptoms: [
    { id: 'bloating', label: 'Bloated' },
    { id: 'gas', label: 'Gassy' },
    { id: 'cramping', label: 'Crampy' },
    { id: 'urgency', label: 'Urgent' },
    { id: 'burning', label: 'Burning' },
  ],
} as const;
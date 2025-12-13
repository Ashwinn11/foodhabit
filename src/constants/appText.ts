/**
 * App Text Content - Single source of truth
 * ZERO duplication - every text string appears exactly once
 */

// Shared texts used across multiple screens
const SHARED_TEXTS = {
  appName: 'Gut Harmony',
  legalTerms: 'Terms',
  legalPrivacy: 'Privacy Policy',
  disclaimer: 'No medical advice. Always consult your doctor.',
  valueProps: [
    {
      title: 'Find Your Triggers',
      description: 'Identify food patterns in just 3 days',
      icons: {
        outline: 'checkmark-circle-outline',
        solid: 'checkmark-circle',
      },
    },
    {
      title: 'Track Progress',
      description: 'See patterns only you can understand',
      icons: {
        outline: 'trending-up-outline',
        solid: 'trending-up',
      },
    },
    {
      title: 'Share with Doctor',
      description: 'Export reports for your healthcare provider',
      icons: {
        outline: 'share-social-outline',
        solid: 'share-social',
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
    subtitle: 'Discover what\'s triggering your gut issues in 7 days',
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
    subtitle: 'Discover what\'s making your gut miserable',
    valueProps: SHARED_TEXTS.valueProps.map((prop) => ({
      icon: prop.icons.solid,
      title: prop.title,
      description: prop.description,
    })),
    cta: 'Get Started',
    disclaimer: SHARED_TEXTS.disclaimer,
  },

  // Onboarding Profile Screen
  onboardingProfile: {
    title: 'Let\'s Set You Up',
    subtitle: 'Help us understand your situation',
    nameLabel: 'Your Name',
    namePlaceholder: 'Enter your name',
    conditionLabel: 'Do you have a diagnosis?',
    issueLabel: 'What\'s your main concern?',
    continueButton: 'Continue',
  },

  // Onboarding First Log Screen (Stool Entry)
  onboardingFirstLog: {
    stoolStep: {
      title: 'Stool Type',
      subtitle: 'Bristol Stool Chart (1-7)',
    },
    energyStep: {
      title: 'Energy Level',
      subtitle: 'How do you feel right now?',
    },
    symptomsStep: {
      title: 'Symptoms',
      subtitle: 'Select any you experienced',
    },
    mealsStep: {
      title: 'What Did You Eat?',
      subtitle: 'Recently? (optional)',
      mealPlaceholder: 'e.g., Pizza, Coffee',
      addButton: 'Add',
    },
    nextButton: 'Next',
    completeButton: 'Complete',
    savingButton: 'Saving...',
  },

  // Onboarding Celebration Screen
  onboardingCelebration: {
    heading: 'You Did It!',
    progressText: (entryCount: number) => `${entryCount}/3 entries logged`,
    nextText: 'Log 2 more to unlock your analysis',
    buttonText: 'Next',
  },

  // Conditions (for selection screens)
  conditions: [
    { id: 'IBS', label: 'IBS' },
    { id: 'crohns', label: 'Crohn\'s' },
    { id: 'colitis', label: 'Colitis' },
    { id: 'celiac', label: 'Celiac' },
    { id: 'gerd', label: 'GERD' },
    { id: 'general', label: 'General' },
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

  // Stool types
  stoolTypes: [
    { type: 1, label: 'Hard' },
    { type: 2, label: 'Lumpy' },
    { type: 3, label: 'Normal' },
    { type: 4, label: 'Normal' },
    { type: 5, label: 'Soft' },
    { type: 6, label: 'Loose' },
    { type: 7, label: 'Liquid' },
  ],

  // Energy levels
  energyLevels: [
    { value: 1, icon: 'sad', label: 'Low' },
    { value: 5, icon: 'remove', label: 'Fair' },
    { value: 8, icon: 'happy', label: 'Good' },
    { value: 10, icon: 'flash', label: 'Great' },
  ],

  // Symptoms
  symptoms: [
    { id: 'bloating', label: 'Bloating' },
    { id: 'gas', label: 'Gas' },
    { id: 'cramping', label: 'Cramping' },
    { id: 'urgency', label: 'Urgency' },
    { id: 'burning', label: 'Burning' },
  ],
} as const;

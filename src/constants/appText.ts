/**
 * App Text Content - Friendly & Empathetic Edition
 * Warm, encouraging, and relatable tone.
 * Medical topic but human and approachable.
 */

// Shared texts used across multiple screens - CRUSH CRAVINGS EDITION
const SHARED_TEXTS = {
  appName: 'Gut Harmony',
  legalTerms: 'Terms',
  legalPrivacy: 'Privacy Policy',
  disclaimer: 'This app is not medical advice. Consult your doctor immediately for health concerns.',
  valueProps: [
    {
      title: 'Triggered?',
      description: 'When symptoms hit, track them immediately.',
      icons: {
        outline: 'flame-outline',
        solid: 'flame',
      },
    },
    {
      title: 'Action',
      description: 'Log your data. Fight back with knowledge.',
      icons: {
        outline: 'fitness-outline',
        solid: 'fitness',
      },
    },
    {
      title: 'Progress',
      description: 'Destroy your triggers and reclaim your life.',
      icons: {
        outline: 'trending-up-outline',
        solid: 'trending-up',
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
    subtitle: 'Turn your gut issues into physical strength with data-powered tracking.',
    valueProps: SHARED_TEXTS.valueProps.map((prop) => ({
      icon: prop.icons.outline,
      text: prop.description,
    })),
    legalPrefix: 'By signing in, you agree to our',
    termsLink: SHARED_TEXTS.legalTerms,
    privacyLink: SHARED_TEXTS.legalPrivacy,
  },

  // Onboarding Splash Screen
  onboardingSplash: {
    title: SHARED_TEXTS.appName,
    subtitle: 'Stop guessing. Start crushing your triggers.',
    valueProps: SHARED_TEXTS.valueProps.map((prop) => ({
      icon: prop.icons.solid,
      title: prop.title,
      description: prop.description,
    })),
    cta: 'Start Now',
    disclaimer: SHARED_TEXTS.disclaimer,
  },

  // Onboarding Profile Screen
  onboardingProfile: {
    title: 'Who are we fighting for?',
    subtitle: 'Tell us about yourself so we can help you win',
    nameLabel: 'Your Name',
    namePlaceholder: 'Enter your name',
    conditionLabel: 'What are you battling?',
    issueLabel: 'What\'s your biggest enemy?',
    continueButton: 'Lock In',
  },

  // Onboarding First Log Screen (Stool Entry)
  onboardingFirstLog: {
    stoolStep: {
      title: 'First Strike',
      subtitle: 'Log your current state immediately',
    },
    energyStep: {
      title: 'Energy Check',
      subtitle: 'How drained are you right now?',
    },
    symptomsStep: {
      title: 'What hit you today?',
      subtitle: 'Select every symptom attacking you',
    },
    mealsStep: {
      title: 'What triggered this?',
      subtitle: 'Log what you ate (we\'ll find the culprit)',
      mealPlaceholder: 'List everything you consumed...',
      addButton: 'Add Trigger',
    },
    nextButton: 'Next',
    completeButton: 'Complete Strike',
    savingButton: 'Logging...',
  },

  // Onboarding Celebration Screen
  onboardingCelebration: {
    heading: 'First Strike Complete!',
    progressText: (entryCount: number) => `${entryCount}/3 entries to unlock insights`,
    nextText: '2 more logs to identify your triggers. Keep pushing.',
    buttonText: 'Continue Fighting',
  },

  // Conditions (for selection screens)
  conditions: [
    { id: 'IBS', label: 'IBS' },
    { id: 'crohns', label: 'Crohn\'s Disease' },
    { id: 'colitis', label: 'Colitis' },
    { id: 'celiac', label: 'Celiac Disease' },
    { id: 'gerd', label: 'GERD/Acid Reflux' },
    { id: 'general', label: 'Fighting to figure it out' },
  ],

  // Main issues
  mainIssues: [
    { id: 'bloating', label: 'Bloating Attacks' },
    { id: 'cramping', label: 'Severe Cramping' },
    { id: 'diarrhea', label: 'Diarrhea Episodes' },
    { id: 'constipation', label: 'Constipation' },
    { id: 'energy', label: 'Energy Crashes' },
    { id: 'multiple', label: 'Multiple Enemies' },
  ],

  // Stool types - Bristol Scale (Direct \u0026 Clinical)
  stoolTypes: [
    { type: 1, label: 'Hard Lumps' },
    { type: 2, label: 'Lumpy Sausage' },
    { type: 3, label: 'Cracked Sausage' },
    { type: 4, label: 'Smooth Sausage' },
    { type: 5, label: 'Soft Blobs' },
    { type: 6, label: 'Mushy' },
    { type: 7, label: 'Liquid' },
  ],

  // Energy levels
  energyLevels: [
    { value: 1, icon: 'sad', label: 'Drained' },
    { value: 5, icon: 'remove', label: 'Surviving' },
    { value: 8, icon: 'happy', label: 'Strong' },
    { value: 10, icon: 'flash', label: 'Peak' },
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
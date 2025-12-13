/**
 * App Text Content - Playful & Cute Edition
 * Friendly, encouraging, and easy to understand.
 */

// Shared texts used across multiple screens
const SHARED_TEXTS = {
  appName: 'Gut Harmony',
  legalTerms: 'Terms',
  legalPrivacy: 'Privacy Policy',
  disclaimer: 'Just a friendly tool! Chat with your doc for medical advice.',
  valueProps: [
    {
      title: 'Find Food Friends',
      description: 'See what foods love you back in 3 days',
      icons: {
        outline: 'heart-outline',
        solid: 'heart',
      },
    },
    {
      title: 'Track Your Vibes',
      description: 'Spot patterns in your tummy\'s mood',
      icons: {
        outline: 'sparkles-outline',
        solid: 'sparkles',
      },
    },
    {
      title: 'Share the Scoop',
      description: 'Easy reports for your doctor visit',
      icons: {
        outline: 'chatbubbles-outline',
        solid: 'chatbubbles',
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
    subtitle: 'Let\'s make your tummy happy in 7 days!',
    valueProps: SHARED_TEXTS.valueProps.map((prop) => ({
      icon: prop.icons.outline,
      text: prop.title,
    })),
    legalPrefix: 'Joining the club means you agree to our',
    termsLink: SHARED_TEXTS.legalTerms,
    privacyLink: SHARED_TEXTS.legalPrivacy,
  },

  // Onboarding Splash Screen
  onboardingSplash: {
    title: SHARED_TEXTS.appName,
    subtitle: 'Figuring out your gut, one bite at a time.',
    valueProps: SHARED_TEXTS.valueProps.map((prop) => ({
      icon: prop.icons.solid,
      title: prop.title,
      description: prop.description,
    })),
    cta: 'Let\'s Go!',
    disclaimer: SHARED_TEXTS.disclaimer,
  },

  // Onboarding Profile Screen
  onboardingProfile: {
    title: 'Who\'s This?',
    subtitle: 'Tell us a bit about you!',
    nameLabel: 'Your Name',
    namePlaceholder: 'What should we call you?',
    conditionLabel: 'Any known tummy troubles?',
    issueLabel: 'What\'s bothering you most?',
    continueButton: 'Onward!',
  },

  // Onboarding First Log Screen (Stool Entry)
  onboardingFirstLog: {
    stoolStep: {
      title: 'The Scoop on Poop',
      subtitle: 'What did it look like?',
    },
    energyStep: {
      title: 'Vibe Check',
      subtitle: 'How are you feeling?',
    },
    symptomsStep: {
      title: 'Ouchies & Feels',
      subtitle: 'Anything else going on?',
    },
    mealsStep: {
      title: 'Yum! What did you eat?',
      subtitle: 'Any snacks or meals? (optional)',
      mealPlaceholder: 'e.g., Pizza, Yummy Salad',
      addButton: 'Add it!',
    },
    nextButton: 'Next Step',
    completeButton: 'All Done!',
    savingButton: 'Saving...',
  },

  // Onboarding Celebration Screen
  onboardingCelebration: {
    heading: 'Woohoo! Great Job!',
    progressText: (entryCount: number) => `${entryCount}/3 logs done!`,
    nextText: 'Just 2 more to unlock your magic insights',
    buttonText: 'Keep Going!',
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
    { id: 'cramping', label: 'Tummy Aches' },
    { id: 'diarrhea', label: 'The Runs' },
    { id: 'constipation', label: 'Backed Up' },
    { id: 'energy', label: 'Sleepy/Low Energy' },
    { id: 'multiple', label: 'A Mix of Things' },
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
    { value: 1, icon: 'sad', label: 'Meh' },
    { value: 5, icon: 'remove', label: 'Okay' },
    { value: 8, icon: 'happy', label: 'Good' },
    { value: 10, icon: 'flash', label: 'Super!' },
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
/**
 * Funny, TikTok-viral messages for GutBuddy
 * 
 * These are designed to be:
 * 1. Screenshottable - Users share "my app just roasted me"
 * 2. Personality-driven - Makes the app feel like a sassy friend
 * 3. Meme-worthy - "POV: my gut app called cheese my villain"
 */

// ============================================
// CENTRALIZED FUN GRADES (Used by App + Widget)
// ============================================

/**
 * Get a fun, TikTok-viral grade label based on score
 * This is the single source of truth - widget should mirror this
 */
export const getFunGrade = (score: number): string => {
    if (score >= 90) return 'Thriving 🌟';
    if (score >= 80) return 'Vibing ✨';
    if (score >= 70) return 'Mid 😐';
    if (score >= 50) return 'Sus 👀';
    return 'SOS 🆘';
};

/**
 * Get a fun insight message based on score
 * Used in widgets and potentially home screen
 */
export const getFunInsight = (score: number): string => {
    if (score >= 90) {
        const messages = [
            "Your gut is giving main character energy ✨",
            "Microbiome said: slay! 💅",
            "Your intestines deserve an award 🏆",
            "Gut health? More like gut WEALTH 💰"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    if (score >= 80) {
        const messages = [
            "Your gut is vibing fr fr 🎵",
            "Solid performance! (Literally) 🧻",
            "Your microbiome is in its happy era 🌈",
            "Keep this energy going! 🚀"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    if (score >= 70) {
        const messages = [
            "Not bad, not amazing. Very mid 😐",
            "Your gut is in its chill era 🧘",
            "Room for improvement, bestie 📈",
            "Average but make it digestive 🤷"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    if (score >= 50) {
        const messages = [
            "Something's sus in there 👀",
            "Your gut is plotting something...",
            "The vibes are... off today 😬",
            "Your colon is writing a complaint letter 📝"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    // SOS tier
    const messages = [
        "Houston, we have a problem 🚨",
        "Your gut is NOT having it today 😤",
        "Emergency vibes only! Code brown! 🆘",
        "Your intestines just rage quit 💀"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
};

// ============================================
// SCAN FOOD SCREEN MESSAGES
// ============================================

export const SAFE_FOOD_MESSAGES = [
    "Green light! 🟢 Munch away, bestie",
    "Your gut just said 'yes please!' 💚",
    "Safe to eat! Your stomach won't betray you today",
    "All clear! 🎉 Your intestines approve this message",
    "Go for it! Your gut is giving this a standing ovation",
    "✅ Certified gut-friendly. Eat without fear!",
    "This won't haunt you later. Enjoy! 🍽️",
];

export const WARNING_FOOD_MESSAGES = [
    "Ehhhh... proceed with caution ⚠️",
    "Your gut is side-eyeing this one 👀",
    "Could go either way. Feeling lucky? 🎲",
    "This might start a negotiation with your stomach",
    "Risky move, but we respect the hustle",
    "Your toilet might have opinions about this later",
    "50/50 chance this ends in regret. Your call 🤷",
];

export const DANGER_FOOD_MESSAGES = [
    "ABORT MISSION 🚨 This is THE villain",
    "Your gut remembers what this did to you 💀",
    "Hard pass. Last time was a disaster, remember?",
    "This food has a score to settle with your stomach",
    "Danger zone! 🚨 Your toilet is already nervous",
    "You've been hurt by this before. Think twice!",
    "Code red! Your gut is sending warning signals!",
    "Past trauma detected. This one's personal 😤",
];

export const TRIGGER_DETECTED_MESSAGES = [
    "🎯 Caught red-handed! You marked this as a trigger",
    "The villain returns! You said this one hurts you",
    "Memory unlocked: This food = bad times",
    "Your gut has PTSD from this one",
    "Nuh-uh! You literally marked this as your nemesis",
    "Back for revenge? You flagged this as a trigger!",
];

export const UNKNOWN_FOOD_MESSAGES = [
    "What even is this? 🤔 My AI brain is confused",
    "Is this food? I genuinely can't tell",
    "404: Food not found. Try spelling it different?",
    "My gut database is scratching its head rn",
    "Unknown entity detected. Proceed with mystery 🔮",
];

export const ANALYZING_MESSAGES = [
    "Consulting the gut gods... 🔮",
    "Asking your intestines for their opinion...",
    "Running this by our AI nutritionist...",
    "Scanning for tummy trouble potential...",
];

// ============================================
// INSIGHTS SCREEN - TRIGGER MESSAGES
// ============================================

export const TRIGGER_INSIGHT_MESSAGES = {
    // High confidence triggers
    highConfidence: [
        "Certified villain 🦹‍♀️ This food chose violence",
        "Enemy #1 detected. Your gut has receipts!",
        "This food and your stomach have beef 🥊",
        "The data is clear: this one hates you back",
        "Not a theory anymore. This is a FACT.",
    ],

    // Medium confidence triggers
    mediumConfidence: [
        "Looking sus 🔍 Keep an eye on this one",
        "Building a case against this suspect...",
        "The evidence is mounting. Proceed with caution",
        "This food is under investigation 🕵️",
        "Not proven guilty yet, but definitely sus",
    ],

    // Low confidence triggers
    lowConfidence: [
        "Mild side-eye only 👀 Needs more data",
        "On the watchlist, but not confirmed",
        "Maybe a coincidence? Log more to find out",
        "Can't tell yet. Keep tracking!",
    ],
};

export const TRIGGER_FREQUENCY_MESSAGES = {
    // 100% trigger rate
    always: [
        "triggers you EVERY. SINGLE. TIME. 💀",
        "has a 100% hit rate. It's personal.",
        "never misses. Your gut's sworn enemy.",
    ],

    // 75%+ trigger rate
    often: [
        "causes trouble more often than not",
        "is basically your kryptonite at this point",
        "seems to have it out for you",
    ],

    // 50%+ trigger rate
    sometimes: [
        "is 50/50 – feeling lucky?",
        "flips a coin with your comfort every time",
        "can't decide if it wants to hurt you or not",
    ],
};

export const COMBO_TRIGGER_MESSAGES = [
    "These two are PARTNERS IN CRIME 🦹‍♀️🦹‍♂️",
    "Separately? Fine. Together? Chaos.",
    "The toxic duo strikes again!",
    "These foods have a conspiracy against you",
    "Dynamic duo of destruction detected!",
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a random message from an array
 */
export const getRandomMessage = (messages: string[]): string => {
    return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Get safety message based on status
 */
export const getSafetyMessage = (
    status: 'safe' | 'warning' | 'danger' | 'unknown' | 'neutral',
    activeTriggers: string[]
): string => {
    if (activeTriggers.length > 0) {
        return getRandomMessage(TRIGGER_DETECTED_MESSAGES);
    }

    switch (status) {
        case 'safe':
            return getRandomMessage(SAFE_FOOD_MESSAGES);
        case 'warning':
            return getRandomMessage(WARNING_FOOD_MESSAGES);
        case 'danger':
            return getRandomMessage(DANGER_FOOD_MESSAGES);
        case 'unknown':
            return getRandomMessage(UNKNOWN_FOOD_MESSAGES);
        case 'neutral':
            return getRandomMessage(ANALYZING_MESSAGES);
        default:
            return 'Analyzing...';
    }
};

/**
 * Get a trigger insight message based on confidence level
 */
export const getTriggerInsightMessage = (confidence: 'High' | 'Medium' | 'Low'): string => {
    switch (confidence) {
        case 'High':
            return getRandomMessage(TRIGGER_INSIGHT_MESSAGES.highConfidence);
        case 'Medium':
            return getRandomMessage(TRIGGER_INSIGHT_MESSAGES.mediumConfidence);
        case 'Low':
            return getRandomMessage(TRIGGER_INSIGHT_MESSAGES.lowConfidence);
        default:
            return '';
    }
};

/**
 * Get frequency descriptor message
 */
export const getTriggerFrequencyMessage = (symptomOccurrences: number, totalOccurrences: number): string => {
    const rate = symptomOccurrences / totalOccurrences;

    if (rate >= 1) {
        return getRandomMessage(TRIGGER_FREQUENCY_MESSAGES.always);
    } else if (rate >= 0.75) {
        return getRandomMessage(TRIGGER_FREQUENCY_MESSAGES.often);
    } else {
        return getRandomMessage(TRIGGER_FREQUENCY_MESSAGES.sometimes);
    }
};

/**
 * Get combo trigger message
 */
export const getComboTriggerMessage = (): string => {
    return getRandomMessage(COMBO_TRIGGER_MESSAGES);
};

// ============================================
// POOP LOGGING MESSAGES (Bonus!)
// ============================================

export const POOP_LOGGED_MESSAGES = {
    perfect: [
        "PERFECT POOP! 💩✨ Your gut is thriving!",
        "That's a 10/10, bestie. Chef's kiss.",
        "Goldilocks poop! Not too hard, not too soft 👌",
        "Your microbiome is doing a happy dance 🕺",
    ],
    good: [
        "Nice one! Your gut is happy today 🎉",
        "Looking healthy! Keep up the fiber 💪",
        "Solid performance! Literally.",
    ],
    concerning: [
        "Hmm... your gut might be having a day 😕",
        "Not ideal, but logged! Let's track the pattern.",
        "Your intestines sent a message. We're listening.",
    ],
    urgent: [
        "Code brown! 🚨 Let's figure out what caused this",
        "Oof. Your gut has something to say!",
        "Emergency documented. We'll find the culprit! 🕵️",
    ],
};

export const getPoopLoggedMessage = (bristolType: number): string => {
    if (bristolType === 4) {
        return getRandomMessage(POOP_LOGGED_MESSAGES.perfect);
    } else if (bristolType === 3 || bristolType === 5) {
        return getRandomMessage(POOP_LOGGED_MESSAGES.good);
    } else if (bristolType === 1 || bristolType === 2 || bristolType === 6) {
        return getRandomMessage(POOP_LOGGED_MESSAGES.concerning);
    } else {
        return getRandomMessage(POOP_LOGGED_MESSAGES.urgent);
    }
};

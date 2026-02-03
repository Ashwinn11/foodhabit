/**
 * Symptoms Interface
 * Represents digestive symptoms that can be tracked
 */
export interface Symptoms {
    [key: string]: boolean; // Index signature for Record compatibility
    bloating: boolean;
    gas: boolean;
    cramping: boolean;
    nausea: boolean;
}

/**
 * Default symptoms state (all false)
 */
export const DEFAULT_SYMPTOMS: Symptoms = {
    bloating: false,
    gas: false,
    cramping: false,
    nausea: false,
};

/**
 * Create symptoms object with specified values
 */
export function createSymptoms(partial?: Partial<Symptoms>): Symptoms {
    return {
        bloating: partial?.bloating ?? false,
        gas: partial?.gas ?? false,
        cramping: partial?.cramping ?? false,
        nausea: partial?.nausea ?? false,
    };
}

/**
 * Check if any symptoms are present
 */
export function hasAnySymptom(symptoms: Symptoms): boolean {
    return Object.values(symptoms).some(v => v);
}

/**
 * Get list of active symptom names
 */
export function getActiveSymptoms(symptoms: Symptoms): string[] {
    return Object.entries(symptoms)
        .filter(([_, active]) => active)
        .map(([name]) => name);
}

/**
 * Count number of active symptoms
 */
export function countActiveSymptoms(symptoms: Symptoms): number {
    return Object.values(symptoms).filter(v => v).length;
}

/**
 * Symptom Type for standalone symptom logging
 */
export type SymptomType = 'bloating' | 'gas' | 'cramping' | 'nausea' | 'reflux' | 'diarrhea' | 'constipation';

export const SYMPTOM_TYPES: SymptomType[] = [
    'bloating',
    'gas',
    'cramping',
    'nausea',
    'reflux',
    'diarrhea',
    'constipation',
];

/**
 * Get emoji for symptom type
 */
export function getSymptomEmoji(type: SymptomType): string {
    const emojis: Record<SymptomType, string> = {
        bloating: '🎈',
        gas: '💨',
        cramping: '😣',
        nausea: '🤢',
        reflux: '🔥',
        diarrhea: '💧',
        constipation: '🧱',
    };
    return emojis[type];
}

/**
 * Get display label for symptom type
 */
export function getSymptomLabel(type: SymptomType): string {
    const labels: Record<SymptomType, string> = {
        bloating: 'Bloating',
        gas: 'Gas',
        cramping: 'Cramping',
        nausea: 'Nausea',
        reflux: 'Reflux',
        diarrhea: 'Diarrhea',
        constipation: 'Constipation',
    };
    return labels[type];
}

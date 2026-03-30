type SymptomInputs = {
    bloating: number;
    pain: number;
    urgency: number;
    nausea: number;
    fatigue: number;
    stoolType: number | null;
};

export type GutSeverity = 'minimal' | 'mild' | 'moderate' | 'severe';

function clampToTen(value: number): number {
    return Math.max(0, Math.min(10, value));
}

function getStoolPenalty(stoolType: number | null): number {
    if (stoolType == null) return 4;
    if (stoolType === 3 || stoolType === 4) return 0;
    if (stoolType === 2 || stoolType === 5) return 3;
    if (stoolType === 1 || stoolType === 6) return 6;
    if (stoolType === 7) return 8;
    return 4;
}

export function calculateGutScore({
    bloating,
    pain,
    urgency,
    nausea,
    fatigue,
    stoolType,
}: SymptomInputs): { score: number; burden: number; severity: GutSeverity } {
    // IBS-oriented weighting: abdominal symptoms dominate, nausea/fatigue are secondary,
    // and stool form adds a smaller bowel-pattern penalty.
    const burden =
        clampToTen(pain) * 0.32 +
        clampToTen(bloating) * 0.26 +
        clampToTen(urgency) * 0.22 +
        clampToTen(nausea) * 0.08 +
        clampToTen(fatigue) * 0.06 +
        getStoolPenalty(stoolType) * 0.06;

    const normalizedBurden = Math.round(burden * 10);
    const score = Math.max(20, Math.min(100, Math.round(100 - normalizedBurden * 0.8)));

    let severity: GutSeverity = 'minimal';
    if (normalizedBurden >= 65) {
        severity = 'severe';
    } else if (normalizedBurden >= 45) {
        severity = 'moderate';
    } else if (normalizedBurden >= 25) {
        severity = 'mild';
    }

    return { score, burden: normalizedBurden, severity };
}

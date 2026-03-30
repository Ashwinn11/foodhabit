export function calculateOnboardingBaselineScore(
    conditions: string[] = [],
    triggers: string[] = []
): number {
    const conditionWeights: Record<string, number> = {
        'IBS-D': 22,
        'IBS-C': 22,
        'IBS-M': 24,
        'Crohn\'s': 28,
        'Colitis': 26,
        'SIBO': 20,
        'Chronic Bloating': 14,
        'Lactose Intolerance': 10,
        'Gluten Sensitivity': 10,
        'Not Diagnosed': 6,
        'Other': 8,
    };

    const conditionPenalty = conditions.reduce((sum, condition) => sum + (conditionWeights[condition] ?? 8), 0);
    const triggerPenalty = triggers.length * 5;
    const totalPenalty = Math.min(conditionPenalty + triggerPenalty, 55);

    return Math.max(100 - totalPenalty, 38);
}

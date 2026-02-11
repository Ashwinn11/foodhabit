/**
 * Gut Health Score Utilities
 * Maps health score to user-friendly grade labels
 */

export const getFunGrade = (score: number): { label: string; icon: string } => {
    if (score >= 90) return { label: 'Optimal', icon: 'checkmark-circle' };
    if (score >= 80) return { label: 'Good', icon: 'happy' };
    if (score >= 70) return { label: 'Moderate', icon: 'alert-circle' };
    if (score >= 50) return { label: 'Concerning', icon: 'warning' };
    return { label: 'Critical', icon: 'close-circle' };
};

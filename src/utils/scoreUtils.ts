/**
 * Gut Health Score Utilities
 * Maps health score to user-friendly grade labels
 */

export const getFunGrade = (score: number): { label: string; icon: string } => {
    if (score >= 90) return { label: 'Thriving', icon: 'star' };
    if (score >= 80) return { label: 'Vibing', icon: 'sparkles' };
    if (score >= 70) return { label: 'Mid', icon: 'remove' }; // neutral
    if (score >= 50) return { label: 'Sus', icon: 'eye' };
    return { label: 'SOS', icon: 'warning' };
};

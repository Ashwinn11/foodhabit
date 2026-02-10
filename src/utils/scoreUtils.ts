/**
 * Gut Health Score Utilities
 * Maps health score to user-friendly grade labels
 */

export const getFunGrade = (score: number): string => {
    if (score >= 90) return 'Thriving 🌟';
    if (score >= 80) return 'Vibing ✨';
    if (score >= 70) return 'Mid 😐';
    if (score >= 50) return 'Sus 👀';
    return 'SOS 🆘';
};

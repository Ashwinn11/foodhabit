/**
 * Nutrition Score Calculator
 * Calculates a 1-10 health score for foods based on nutritional content
 *
 * Scoring logic:
 * - Protein: Higher is better (0-3 points)
 * - Fiber: Higher is better (0-3 points)
 * - Sugar: Lower is better (0-2 points)
 * - Sodium: Lower is better (0-2 points)
 */

interface Nutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

interface NutritionScoreResult {
  score: number; // 1-10
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    proteinScore: number;
    fiberScore: number;
    sugarScore: number;
    sodiumScore: number;
  };
}

export const calculateNutritionScore = (nutrition: Nutrition | undefined): NutritionScoreResult => {
  if (!nutrition) {
    return {
      score: 5,
      grade: 'C',
      breakdown: {
        proteinScore: 0,
        fiberScore: 0,
        sugarScore: 0,
        sodiumScore: 0,
      },
    };
  }

  // Protein Score (0-3): More protein is better
  // 0g = 0 pts, 10g = 1.5 pts, 20g+ = 3 pts
  const proteinScore = Math.min(3, (nutrition.protein || 0) / 7);

  // Fiber Score (0-3): More fiber is better
  // 0g = 0 pts, 3g = 1.5 pts, 6g+ = 3 pts
  const fiberScore = Math.min(3, (nutrition.fiber || 0) / 2);

  // Sugar Score (0-2): Less sugar is better
  // 0g = 2 pts, 10g = 1 pt, 20g+ = 0 pts
  const sugarScore = Math.max(0, 2 - (nutrition.sugar || 0) / 10);

  // Sodium Score (0-2): Less sodium is better
  // 0mg = 2 pts, 400mg = 1 pt, 800mg+ = 0 pts
  const sodiumScore = Math.max(0, 2 - (nutrition.sodium || 0) / 400);

  // Total score out of 10
  const totalScore = proteinScore + fiberScore + sugarScore + sodiumScore;
  const score = Math.round(Math.min(10, Math.max(1, totalScore)));

  // Grade letter
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 8) grade = 'A';
  else if (score >= 6) grade = 'B';
  else if (score >= 4) grade = 'C';
  else if (score >= 2) grade = 'D';
  else grade = 'F';

  return {
    score,
    grade,
    breakdown: {
      proteinScore: Math.round(proteinScore * 10) / 10,
      fiberScore: Math.round(fiberScore * 10) / 10,
      sugarScore: Math.round(sugarScore * 10) / 10,
      sodiumScore: Math.round(sodiumScore * 10) / 10,
    },
  };
};

export const getNutritionScoreColor = (score: number): string => {
  if (score >= 8) return '#10B981'; // Green - A
  if (score >= 6) return '#3B82F6'; // Blue - B
  if (score >= 4) return '#F59E0B'; // Amber - C
  if (score >= 2) return '#EF4444'; // Red - D
  return '#DC2626'; // Dark red - F
};

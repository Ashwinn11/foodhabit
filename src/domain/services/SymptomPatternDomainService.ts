/**
 * SymptomPatternDomainService
 * Domain Service - Analyzes user's symptom co-occurrence patterns
 *
 * Located in DOMAIN layer
 * Pure business logic: no dependencies on frameworks or infrastructure
 * Analyzes which symptoms appear together for a specific user
 */

export interface SymptomPattern {
  symptoms: string[];           // e.g., ['bloating', 'gas']
  frequency: number;            // 0-1, e.g., 0.85 = 85% of time
  occurrenceCount: number;      // How many times this pattern appeared
}

export interface SymptomPatternsAnalysis {
  patterns: SymptomPattern[];
  totalLogsAnalyzed: number;
  mostCommonPattern?: SymptomPattern;
}

/**
 * Domain Service for analyzing symptom patterns
 *
 * Business Logic:
 * - Analyzes which symptoms appear together in user's logs
 * - Identifies patterns that recur frequently
 * - Used to predict compound risk when scanning foods
 *
 * No I/O - input is raw data, output is analysis
 */
export class SymptomPatternDomainService {
  /**
   * Analyze symptom co-occurrence patterns from gut logs
   *
   * Input: Array of gut log entries with symptoms
   * Output: Identified patterns with frequencies
   */
  analyzePatterns(gutLogs: Array<{ symptoms: string[] }>): SymptomPatternsAnalysis {
    if (gutLogs.length === 0) {
      return {
        patterns: [],
        totalLogsAnalyzed: 0
      };
    }

    // Count symptom combinations
    const patternMap = new Map<string, number>();

    gutLogs.forEach(log => {
      if (!log.symptoms || log.symptoms.length === 0) return;

      // Only count combinations of 2+ symptoms (co-occurrence)
      if (log.symptoms.length >= 2) {
        // Sort symptoms to ensure consistent keys (e.g., ['bloating', 'gas'] = ['gas', 'bloating'])
        const sortedSymptoms = [...log.symptoms].sort();
        const patternKey = sortedSymptoms.join('|');

        patternMap.set(patternKey, (patternMap.get(patternKey) || 0) + 1);
      }
    });

    // Convert map to pattern objects with frequencies
    const patterns: SymptomPattern[] = Array.from(patternMap.entries())
      .map(([patternKey, count]) => ({
        symptoms: patternKey.split('|'),
        occurrenceCount: count,
        frequency: count / gutLogs.length
      }))
      .filter(p => p.frequency >= 0.3) // Only patterns that occur >= 30% of the time
      .sort((a, b) => b.frequency - a.frequency);

    // Get most common pattern
    const mostCommonPattern = patterns.length > 0 ? patterns[0] : undefined;

    return {
      patterns,
      totalLogsAnalyzed: gutLogs.length,
      mostCommonPattern
    };
  }

  /**
   * Predict compound risk for a food based on user's symptom patterns
   *
   * Business Logic:
   * If a food causes symptoms that typically appear together for this user,
   * it's MORE risky than if it causes just one symptom
   *
   * Example:
   * - User always gets bloating + gas together (85% frequency)
   * - Scanning "wheat bread" -> causes bloating
   * - Prediction: HIGH RISK because wheat typically causes both
   *   bloating AND gas for this user (their pattern)
   */
  predictCompoundRisk(
    foodSymptoms: string[],
    patterns: SymptomPattern[]
  ): { hasCompoundRisk: boolean; matchedPatterns: SymptomPattern[] } {
    if (foodSymptoms.length === 0 || patterns.length === 0) {
      return {
        hasCompoundRisk: false,
        matchedPatterns: []
      };
    }

    // Find patterns that match this food's symptoms
    const matchedPatterns = patterns.filter(pattern => {
      // Check if this food's symptoms match the pattern significantly
      const symptomSet = new Set(foodSymptoms);
      const patternSymptoms = pattern.symptoms;

      // Match if food causes at least 2 of the pattern symptoms
      const matchCount = patternSymptoms.filter(s => symptomSet.has(s)).length;
      return matchCount >= 2 && pattern.frequency >= 0.5; // >= 50% frequency
    });

    // Compound risk if we found matching patterns
    const hasCompoundRisk = matchedPatterns.length > 0;

    return {
      hasCompoundRisk,
      matchedPatterns
    };
  }

  /**
   * Get symptom severity indicator
   *
   * Business Logic:
   * Symptoms that appear with other symptoms are "worse" than isolated symptoms
   */
  getSymptomContext(
    symptom: string,
    patterns: SymptomPattern[]
  ): { appearsAlone: boolean; commonPartners: string[] } {
    const partnerCounts = new Map<string, number>();

    // Find all symptoms that appear with this one
    patterns.forEach(pattern => {
      if (pattern.symptoms.includes(symptom)) {
        const otherSymptoms = pattern.symptoms.filter(s => s !== symptom);
        otherSymptoms.forEach(other => {
          partnerCounts.set(other, (partnerCounts.get(other) || 0) + 1);
        });
      }
    });

    // Get common partners (sorted by frequency)
    const commonPartners = Array.from(partnerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([symptom]) => symptom);

    const appearsAlone = commonPartners.length === 0;

    return {
      appearsAlone,
      commonPartners
    };
  }

  /**
   * Generate human-readable explanation of a symptom pattern
   */
  explainPattern(pattern: SymptomPattern): string {
    const symptoms = pattern.symptoms.join(' + ');
    const percentage = Math.round(pattern.frequency * 100);
    return `${symptoms} (appears together ${percentage}% of the time)`;
  }
}

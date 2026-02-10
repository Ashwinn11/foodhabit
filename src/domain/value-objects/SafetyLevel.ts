/**
 * SafetyLevel Value Object
 * Represents food safety: Green (safe), Yellow (caution), Red (avoid)
 *
 * Value Object: Immutable, no identity, equality by value
 */

export type SafetyLevelType = 'green' | 'yellow' | 'red';

export interface ISafetyLevel {
  getLevel(): SafetyLevelType;
  isGreen(): boolean;
  isYellow(): boolean;
  isRed(): boolean;
  getColor(): string;
  equals(other: SafetyLevel): boolean;
}

export class SafetyLevel implements ISafetyLevel {
  private constructor(private readonly level: SafetyLevelType) {}

  /**
   * Factory methods
   */
  static green(): SafetyLevel {
    return new SafetyLevel('green');
  }

  static yellow(): SafetyLevel {
    return new SafetyLevel('yellow');
  }

  static red(): SafetyLevel {
    return new SafetyLevel('red');
  }

  /**
   * Determine safety level from FODMAP level and personal triggers
   *
   * Business logic: Trust personal triggers over FODMAP science
   * If user has logged symptoms after this food, it's RED regardless of FODMAP
   */
  static determineFrom(params: {
    fodmapLevel: 'high' | 'moderate' | 'low';
    personalTriggerCount?: number;
    hadCompoundSymptoms?: boolean;
  }): SafetyLevel {
    // Rule 1: Personal triggers override FODMAP science
    if (params.personalTriggerCount && params.personalTriggerCount >= 2) {
      return SafetyLevel.red();
    }

    // Rule 2: Compound symptoms (multiple at once) make it more dangerous
    if (params.hadCompoundSymptoms) {
      return SafetyLevel.red();
    }

    // Rule 3: FODMAP-based rules
    switch (params.fodmapLevel) {
      case 'high':
        return SafetyLevel.red();
      case 'moderate':
        return SafetyLevel.yellow();
      case 'low':
      default:
        return SafetyLevel.green();
    }
  }

  /**
   * Create from string (e.g., database)
   */
  static fromString(value: string): SafetyLevel {
    const normalized = value.toLowerCase() as SafetyLevelType;
    if (!this.isValidLevel(normalized)) {
      throw new Error(`Invalid safety level: ${value}`);
    }
    return new SafetyLevel(normalized);
  }

  /**
   * Get the safety level
   */
  getLevel(): SafetyLevelType {
    return this.level;
  }

  /**
   * Type guards
   */
  isGreen(): boolean {
    return this.level === 'green';
  }

  isYellow(): boolean {
    return this.level === 'yellow';
  }

  isRed(): boolean {
    return this.level === 'red';
  }

  /**
   * Get color code for UI
   */
  getColor(): string {
    const colorMap: Record<SafetyLevelType, string> = {
      'green': '#22c55e',
      'yellow': '#fbbf24',
      'red': '#ef4444'
    };
    return colorMap[this.level];
  }

  /**
   * Get emoji representation
   */
  getEmoji(): string {
    const emojiMap: Record<SafetyLevelType, string> = {
      'green': '🟢',
      'yellow': '🟡',
      'red': '🔴'
    };
    return emojiMap[this.level];
  }

  /**
   * Get human-readable label
   */
  getLabel(): string {
    const labelMap: Record<SafetyLevelType, string> = {
      'green': 'Safe',
      'yellow': 'Caution',
      'red': 'Avoid'
    };
    return labelMap[this.level];
  }

  /**
   * Value object equality
   */
  equals(other: SafetyLevel): boolean {
    if (!(other instanceof SafetyLevel)) {
      return false;
    }
    return this.level === other.level;
  }

  /**
   * Serialize to string
   */
  toString(): string {
    return this.level;
  }

  /**
   * Validation
   */
  private static isValidLevel(level: string): level is SafetyLevelType {
    return ['green', 'yellow', 'red'].includes(level.toLowerCase());
  }
}

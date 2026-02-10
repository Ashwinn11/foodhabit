/**
 * Condition Value Object
 * Represents a user's gut condition (IBS-D, IBS-C, bloating, etc.)
 *
 * Value Object: Immutable, no identity, equality by value
 */

export type ConditionType = 'ibs-d' | 'ibs-c' | 'ibs-m' | 'ibs-u' | 'bloating';

export interface ICondition {
  getType(): ConditionType;
  getDisplayName(): string;
  isBloatingRelated(): boolean;
  needsFiber(): boolean;
  canTolerateLactose(): boolean;
  canTolerateFructans(): boolean;
  canTolerateGOS(): boolean;
  equals(other: Condition): boolean;
}

/**
 * Domain rules:
 * - IBS-C (Constipation): Needs MORE fiber, fat slows transit
 * - IBS-D (Diarrhea): Needs SOLUBLE fiber only, lactose + fat triggers diarrhea
 * - IBS-M (Mixed): Both patterns
 * - IBS-U (Unsure): Treat conservatively
 * - Bloating: Avoid fermentation (FODMAP)
 */
export class Condition implements ICondition {
  private constructor(private readonly type: ConditionType) {
    if (!this.isValidType(type)) {
      throw new Error(`Invalid condition type: ${type}`);
    }
  }

  /**
   * Factory method with validation
   */
  static create(type: ConditionType): Condition {
    return new Condition(type);
  }

  /**
   * Create from string (e.g., from database)
   */
  static fromString(value: string): Condition {
    const normalized = value.toLowerCase() as ConditionType;
    if (!this.isValidCondition(normalized)) {
      throw new Error(`Invalid condition: ${value}`);
    }
    return new Condition(normalized);
  }

  /**
   * Get the condition type
   */
  getType(): ConditionType {
    return this.type;
  }

  /**
   * Get human-readable name
   */
  getDisplayName(): string {
    const displayMap: Record<ConditionType, string> = {
      'ibs-d': 'IBS-D (Diarrhea)',
      'ibs-c': 'IBS-C (Constipation)',
      'ibs-m': 'IBS-M (Mixed)',
      'ibs-u': 'IBS-U (Unsure)',
      'bloating': 'Bloating'
    };
    return displayMap[this.type];
  }

  /**
   * Business rule: Is this condition bloating-related?
   */
  isBloatingRelated(): boolean {
    return this.type === 'bloating' || this.type === 'ibs-m' || this.type === 'ibs-d';
  }

  /**
   * Business rule: Does this condition need more fiber?
   */
  needsFiber(): boolean {
    return this.type === 'ibs-c' || this.type === 'ibs-m' || this.type === 'ibs-u';
  }

  /**
   * Business rule: Should they avoid lactose?
   */
  canTolerateLactose(): boolean {
    // IBS-D and IBS-M are more likely to be lactose intolerant
    return this.type === 'ibs-c' || this.type === 'bloating';
  }

  /**
   * Business rule: Should they avoid fructans (wheat, onion, garlic)?
   */
  canTolerateFructans(): boolean {
    // All IBS types struggle with fructans
    return false;
  }

  /**
   * Business rule: Should they avoid GOS (legumes)?
   */
  canTolerateGOS(): boolean {
    return this.type === 'ibs-c'; // IBS-C can tolerate better
  }

  /**
   * Determine if food is risky for this condition
   */
  isRiskyFood(categories: string[]): boolean {
    if (this.type === 'ibs-d') {
      return categories.includes('lactose') ||
             categories.includes('fructans') ||
             categories.includes('excess-fructose');
    }
    if (this.type === 'ibs-c') {
      return categories.includes('low-fiber');
    }
    if (this.type === 'bloating') {
      return categories.includes('fructans') ||
             categories.includes('gos') ||
             categories.includes('polyols');
    }
    return categories.length > 0; // Conservative for IBS-U and IBS-M
  }

  /**
   * Value object equality
   */
  equals(other: Condition): boolean {
    if (!(other instanceof Condition)) {
      return false;
    }
    return this.type === other.type;
  }

  /**
   * Serialize to string
   */
  toString(): string {
    return this.type;
  }

  /**
   * Validation
   */
  private static isValidCondition(type: string): type is ConditionType {
    return ['ibs-d', 'ibs-c', 'ibs-m', 'ibs-u', 'bloating'].includes(type.toLowerCase());
  }

  private isValidType(type: ConditionType): boolean {
    return ['ibs-d', 'ibs-c', 'ibs-m', 'ibs-u', 'bloating'].includes(type);
  }
}

/**
 * Nutrition Value Object
 * Represents nutritional content: calories, macros, fiber, sugar, etc.
 *
 * Value Object: Immutable, encapsulates nutrition data
 */

export interface INutrition {
  getCalories(): number;
  getProtein(): number;
  getCarbs(): number;
  getFat(): number;
  getFiber(): number;
  getSugar(): number;
  getSodium(): number;
  isFiberRich(): boolean;
  isHighSugar(): boolean;
  isHighSodium(): boolean;
  equals(other: Nutrition): boolean;
}

export class Nutrition implements INutrition {
  private constructor(
    private readonly calories: number,
    private readonly protein: number,
    private readonly carbs: number,
    private readonly fat: number,
    private readonly fiber: number,
    private readonly sugar: number,
    private readonly sodium: number
  ) {
    this.validate();
  }

  /**
   * Factory method
   */
  static create(params: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  }): Nutrition {
    return new Nutrition(
      params.calories,
      params.protein,
      params.carbs,
      params.fat,
      params.fiber,
      params.sugar,
      params.sodium
    );
  }

  /**
   * Create from Gemini API response
   */
  static fromGemini(data: any): Nutrition {
    return new Nutrition(
      data.calories || 0,
      data.protein || 0,
      data.carbs || 0,
      data.fat || 0,
      data.fiber || 0,
      data.sugar || 0,
      data.sodium || 0
    );
  }

  /**
   * Create empty/zero nutrition
   */
  static empty(): Nutrition {
    return new Nutrition(0, 0, 0, 0, 0, 0, 0);
  }

  // Getters
  getCalories(): number {
    return this.calories;
  }

  getProtein(): number {
    return this.protein;
  }

  getCarbs(): number {
    return this.carbs;
  }

  getFat(): number {
    return this.fat;
  }

  getFiber(): number {
    return this.fiber;
  }

  getSugar(): number {
    return this.sugar;
  }

  getSodium(): number {
    return this.sodium;
  }

  /**
   * Business rule: Is this fiber-rich?
   * Guidelines: >3g per serving is good
   */
  isFiberRich(): boolean {
    return this.fiber >= 3;
  }

  /**
   * Business rule: Is sugar too high?
   * Guidelines: >10g per serving is high
   */
  isHighSugar(): boolean {
    return this.sugar > 10;
  }

  /**
   * Business rule: Is sodium too high?
   * Guidelines: >400mg per serving is high
   */
  isHighSodium(): boolean {
    return this.sodium > 400;
  }

  /**
   * Get sugar-to-carbs ratio
   * High ratio means high fructose content (fermentation risk)
   */
  getSugarToCarbs(): number {
    if (this.carbs === 0) return 0;
    return this.sugar / this.carbs;
  }

  /**
   * Is this high fat? (risk factor for IBS-D)
   */
  isHighFat(): boolean {
    return this.fat > 10;
  }

  /**
   * Get macro breakdown as percentages
   */
  getMacroBreakdown(): { protein: number; carbs: number; fat: number } {
    const totalCalories = (this.protein * 4) + (this.carbs * 4) + (this.fat * 9);
    if (totalCalories === 0) {
      return { protein: 0, carbs: 0, fat: 0 };
    }

    return {
      protein: Math.round(((this.protein * 4) / totalCalories) * 100),
      carbs: Math.round(((this.carbs * 4) / totalCalories) * 100),
      fat: Math.round(((this.fat * 9) / totalCalories) * 100)
    };
  }

  /**
   * Get summary for display
   */
  getSummary(): string {
    return `${this.calories}cal | P:${this.protein}g C:${this.carbs}g F:${this.fat}g | Fiber:${this.fiber}g Sugar:${this.sugar}g`;
  }

  /**
   * Value object equality
   */
  equals(other: Nutrition): boolean {
    if (!(other instanceof Nutrition)) {
      return false;
    }
    return (
      this.calories === other.calories &&
      this.protein === other.protein &&
      this.carbs === other.carbs &&
      this.fat === other.fat &&
      this.fiber === other.fiber &&
      this.sugar === other.sugar &&
      this.sodium === other.sodium
    );
  }

  /**
   * Serialize to object
   */
  toJSON() {
    return {
      calories: this.calories,
      protein: this.protein,
      carbs: this.carbs,
      fat: this.fat,
      fiber: this.fiber,
      sugar: this.sugar,
      sodium: this.sodium
    };
  }

  /**
   * Validation
   */
  private validate(): void {
    if (this.calories < 0) throw new Error('Calories cannot be negative');
    if (this.protein < 0) throw new Error('Protein cannot be negative');
    if (this.carbs < 0) throw new Error('Carbs cannot be negative');
    if (this.fat < 0) throw new Error('Fat cannot be negative');
    if (this.fiber < 0) throw new Error('Fiber cannot be negative');
    if (this.sugar < 0) throw new Error('Sugar cannot be negative');
    if (this.sodium < 0) throw new Error('Sodium cannot be negative');
  }
}

/**
 * Meal Type Value Object
 * Represents the type/timing of a meal
 */
export type MealTypeValue = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';

export class MealType {
    private static readonly VALID_TYPES: MealTypeValue[] = ['breakfast', 'lunch', 'dinner', 'snack', 'drink'];

    private constructor(private readonly value: MealTypeValue) {
        Object.freeze(this);
    }

    static create(value: string): MealType {
        const normalized = value.toLowerCase().trim();
        if (!MealType.VALID_TYPES.includes(normalized as MealTypeValue)) {
            throw new Error(`Invalid meal type: ${value}. Valid types: ${MealType.VALID_TYPES.join(', ')}`);
        }
        return new MealType(normalized as MealTypeValue);
    }

    static createOrNull(value: string | undefined | null): MealType | null {
        if (!value) return null;
        try {
            return MealType.create(value);
        } catch {
            return null;
        }
    }

    static breakfast(): MealType {
        return new MealType('breakfast');
    }

    static lunch(): MealType {
        return new MealType('lunch');
    }

    static dinner(): MealType {
        return new MealType('dinner');
    }

    static snack(): MealType {
        return new MealType('snack');
    }

    static drink(): MealType {
        return new MealType('drink');
    }

    /** Check if this is a main meal (breakfast, lunch, dinner) */
    get isMainMeal(): boolean {
        return ['breakfast', 'lunch', 'dinner'].includes(this.value);
    }

    /** Check if this is a snack or drink */
    get isSnackOrDrink(): boolean {
        return this.value === 'snack' || this.value === 'drink';
    }

    getValue(): MealTypeValue {
        return this.value;
    }

    /**
     * Get display label (capitalized)
     */
    getLabel(): string {
        return this.value.charAt(0).toUpperCase() + this.value.slice(1);
    }

    /**
     * Get emoji for UI
     */
    getEmoji(): string {
        const emojis: Record<MealTypeValue, string> = {
            breakfast: '🍳',
            lunch: '🥗',
            dinner: '🍽️',
            snack: '🍿',
            drink: '🥤',
        };
        return emojis[this.value];
    }

    /**
     * Get icon name for Ionicons
     */
    getIconName(): string {
        const icons: Record<MealTypeValue, string> = {
            breakfast: 'sunny-outline',
            lunch: 'restaurant-outline',
            dinner: 'moon-outline',
            snack: 'cafe-outline',
            drink: 'water-outline',
        };
        return icons[this.value];
    }

    equals(other: MealType): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.getLabel();
    }
}

/**
 * Portion Size Value Object
 */
export type PortionSizeValue = 'small' | 'medium' | 'large';

export class PortionSize {
    private static readonly VALID_SIZES: PortionSizeValue[] = ['small', 'medium', 'large'];

    private constructor(private readonly value: PortionSizeValue) {
        Object.freeze(this);
    }

    static create(value: string): PortionSize {
        const normalized = value.toLowerCase().trim();
        if (!PortionSize.VALID_SIZES.includes(normalized as PortionSizeValue)) {
            throw new Error(`Invalid portion size: ${value}`);
        }
        return new PortionSize(normalized as PortionSizeValue);
    }

    static createOrNull(value: string | undefined | null): PortionSize | null {
        if (!value) return null;
        try {
            return PortionSize.create(value);
        } catch {
            return null;
        }
    }

    static small(): PortionSize {
        return new PortionSize('small');
    }

    static medium(): PortionSize {
        return new PortionSize('medium');
    }

    static large(): PortionSize {
        return new PortionSize('large');
    }

    getValue(): PortionSizeValue {
        return this.value;
    }

    getLabel(): string {
        return this.value.charAt(0).toUpperCase() + this.value.slice(1);
    }

    /**
     * Get multiplier for portion size (useful for calculations)
     */
    getMultiplier(): number {
        const multipliers: Record<PortionSizeValue, number> = {
            small: 0.5,
            medium: 1.0,
            large: 1.5,
        };
        return multipliers[this.value];
    }

    equals(other: PortionSize): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.getLabel();
    }
}

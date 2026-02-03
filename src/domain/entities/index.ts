/**
 * Domain Entities
 * Core business objects with encapsulated logic
 */

export { GutMoment, type GutMomentProps, type CreateGutMomentInput, type GutMomentTag } from './GutMoment';
export { Meal, type MealProps, type CreateMealInput, FOOD_TAGS, type FoodTag } from './Meal';
export { SymptomLog, type SymptomLogProps, type CreateSymptomLogInput } from './SymptomLog';
export { HealthLog, type HealthLogProps, type CreateHealthLogInput, type HealthLogType, WaterLog, FiberLog, ProbioticLog, ExerciseLog } from './HealthLog';
export { User, type UserProps, type CreateUserInput } from './User';
export { Trigger, CombinationTrigger, TriggerFeedback, type TriggerProps, type TriggerConfidence, type CombinationTriggerProps, type TriggerFeedbackProps } from './Trigger';
export { type Symptoms, type SymptomType, DEFAULT_SYMPTOMS, createSymptoms, hasAnySymptom, getActiveSymptoms, countActiveSymptoms, SYMPTOM_TYPES, getSymptomEmoji, getSymptomLabel } from './Symptoms';

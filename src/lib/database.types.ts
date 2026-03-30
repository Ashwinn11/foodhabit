// Auto-generated database types matching Supabase schema

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type FoodItem = {
    name: string;
    portion?: string;
    fodmap_risk: 'low' | 'medium' | 'high';
    personal_verdict: 'avoid' | 'caution' | 'safest';
    caution_action?: string;
    trigger_reasons: string[];
    ingredients?: string[];
    contains_user_triggers?: string[];
    conflict_explanation?: string | null;
};

export type RecipeIngredient = {
    name: string;
    amount: string;
    unit: string;
    fodmap_risk: 'low' | 'medium' | 'high';
};

export type RecipeStep = {
    step_number: number;
    instruction: string;
};

export type InsightType =
    | 'trigger_watching'
    | 'trigger_likely'
    | 'trigger_confirmed'
    | 'pattern'
    | 'recommendation'
    | 'weekly_summary';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type BiologicalSex = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'low-fodmap';
export type Verdict = 'avoid' | 'caution' | 'safest';
export type FodmapRisk = 'low' | 'medium' | 'high';
export type Confidence = 'low' | 'medium' | 'high';

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    age: number | null;
                    biological_sex: string | null;
                    diagnosed_conditions: string[];
                    known_triggers: string[];
                    diet_type: string | null;
                    notifications_enabled: boolean;
                    onboarding_complete: boolean;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    age?: number | null;
                    biological_sex?: string | null;
                    diagnosed_conditions?: string[];
                    known_triggers?: string[];
                    diet_type?: string | null;
                    notifications_enabled?: boolean;
                    onboarding_complete?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    age?: number | null;
                    biological_sex?: string | null;
                    diagnosed_conditions?: string[];
                    known_triggers?: string[];
                    diet_type?: string | null;
                    notifications_enabled?: boolean;
                    onboarding_complete?: boolean;
                    created_at?: string;
                };
                Relationships: [];
            };
            meal_logs: {
                Row: {
                    id: string;
                    user_id: string;
                    logged_at: string;
                    meal_type: string;
                    foods: Json;
                    overall_meal_verdict: string | null;
                    meal_swap_suggestion: string | null;
                    notes: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    logged_at?: string;
                    meal_type: string;
                    foods: Json;
                    overall_meal_verdict?: string | null;
                    meal_swap_suggestion?: string | null;
                    notes?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    logged_at?: string;
                    meal_type?: string;
                    foods?: Json;
                    overall_meal_verdict?: string | null;
                    meal_swap_suggestion?: string | null;
                    notes?: string | null;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "meal_logs_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            symptom_logs: {
                Row: {
                    id: string;
                    user_id: string;
                    logged_at: string;
                    bloating: number;
                    pain: number;
                    urgency: number;
                    nausea: number;
                    fatigue: number;
                    stool_type: number | null;
                    notes: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    logged_at?: string;
                    bloating?: number;
                    pain?: number;
                    urgency?: number;
                    nausea?: number;
                    fatigue?: number;
                    stool_type?: number | null;
                    notes?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    logged_at?: string;
                    bloating?: number;
                    pain?: number;
                    urgency?: number;
                    nausea?: number;
                    fatigue?: number;
                    stool_type?: number | null;
                    notes?: string | null;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "symptom_logs_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            ai_insights: {
                Row: {
                    id: string;
                    user_id: string;
                    generated_at: string;
                    insight_type: string;
                    title: string;
                    body: string;
                    related_foods: string[] | null;
                    confidence: string;
                    is_read: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    generated_at?: string;
                    insight_type: string;
                    title: string;
                    body: string;
                    related_foods?: string[] | null;
                    confidence?: string;
                    is_read?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    generated_at?: string;
                    insight_type?: string;
                    title?: string;
                    body?: string;
                    related_foods?: string[] | null;
                    confidence?: string;
                    is_read?: boolean;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "ai_insights_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            recipes: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    description: string;
                    ingredients: Json;
                    steps: Json;
                    prep_time_mins: number;
                    meal_type: string;
                    trigger_free: string[];
                    is_saved: boolean;
                    source: string;
                    generated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    description: string;
                    ingredients: Json;
                    steps: Json;
                    prep_time_mins: number;
                    meal_type: string;
                    trigger_free?: string[];
                    is_saved?: boolean;
                    source: string;
                    generated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    description?: string;
                    ingredients?: Json;
                    steps?: Json;
                    prep_time_mins?: number;
                    meal_type?: string;
                    trigger_free?: string[];
                    is_saved?: boolean;
                    source?: string;
                    generated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "recipes_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            progress_snapshots: {
                Row: {
                    id: string;
                    user_id: string;
                    snapshot_date: string;
                    avg_bloating_7d: number;
                    avg_pain_7d: number;
                    avg_urgency_7d: number;
                    avg_fatigue_7d: number;
                    good_days_count: number;
                    bad_days_count: number;
                    top_triggers: string[];
                    improvement_vs_baseline: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    snapshot_date: string;
                    avg_bloating_7d?: number;
                    avg_pain_7d?: number;
                    avg_urgency_7d?: number;
                    avg_fatigue_7d?: number;
                    good_days_count?: number;
                    bad_days_count?: number;
                    top_triggers?: string[];
                    improvement_vs_baseline?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    snapshot_date?: string;
                    avg_bloating_7d?: number;
                    avg_pain_7d?: number;
                    avg_urgency_7d?: number;
                    avg_fatigue_7d?: number;
                    good_days_count?: number;
                    bad_days_count?: number;
                    top_triggers?: string[];
                    improvement_vs_baseline?: number;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "progress_snapshots_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            streaks: {
                Row: {
                    id: string;
                    user_id: string;
                    current_streak: number;
                    longest_streak: number;
                    last_logged_date: string | null;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    current_streak?: number;
                    longest_streak?: number;
                    last_logged_date?: string | null;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    current_streak?: number;
                    longest_streak?: number;
                    last_logged_date?: string | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "streaks_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: true;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type Profile = Tables<'profiles'>;
export type MealLog = Tables<'meal_logs'>;
export type SymptomLog = Tables<'symptom_logs'>;
export type AiInsight = Tables<'ai_insights'>;
export type Recipe = Tables<'recipes'>;
export type ProgressSnapshot = Tables<'progress_snapshots'>;
export type Streak = Tables<'streaks'>;

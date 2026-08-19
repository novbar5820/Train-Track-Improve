// ==== Domain types ====

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "legs"
  | "glutes"
  | "calves"
  | "abs"
  | "cardio"
  | "fullbody";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "machine"
  | "cable"
  | "bodyweight"
  | "kettlebell"
  | "band";

export interface ExerciseDef {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
}

// ---- Workout plans ----

export interface PlanExercise {
  id: string; // unique within plan day
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
}

export interface PlanDay {
  id: string;
  name: string; // e.g. "פלג גוף עליון", "רגליים"
  exercises: PlanExercise[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  days: PlanDay[];
  createdAt: number;
}

// ---- Workout sessions (performed) ----

export interface SetEntry {
  weight: number;
  reps: number;
  done: boolean;
  isPR?: boolean;
}

export interface SessionExercise {
  exerciseId: string;
  sets: SetEntry[];
}

export interface WorkoutSession {
  id: string;
  planId: string;
  dayId: string;
  dayName: string;
  startedAt: number;
  finishedAt?: number;
  exercises: SessionExercise[];
}

// ---- Nutrition ----

export type FoodUnit = {
  id: string; // e.g. "cup", "tbsp", "piece"
  label: string; // Hebrew label
  grams: number; // grams per 1 unit
};

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  per100g: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  units: FoodUnit[]; // always includes "gram"
}

export interface FoodLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  foodId: string;
  quantity: number;
  unitId: string;
  createdAt: number;
}

// ---- Weight journal ----

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
}

// ---- Settings ----

export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday ... 1=Monday

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type Goal = "lose" | "maintain" | "gain";

export interface NutritionGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface AppSettings {
  id: "singleton";
  weekStartDay: WeekStartDay;
  nutritionGoals: NutritionGoals;
  calcProfile?: {
    age: number;
    gender: "male" | "female";
    heightCm: number;
    weightKg: number;
    activity: ActivityLevel;
    goal: Goal;
  };
}

import type { ActivityLevel, Goal, NutritionGoals } from "../types";

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "יושבני (מעט מאוד תנועה)",
  light: "פעילות קלה (1-3 אימונים בשבוע)",
  moderate: "פעילות בינונית (3-5 אימונים בשבוע)",
  active: "פעילות גבוהה (6-7 אימונים בשבוע)",
  very_active: "פעילות גבוהה מאוד (אימונים יומיים / עבודה פיזית)",
};

export const GOAL_LABELS: Record<Goal, string> = {
  lose: "ירידה במשקל",
  maintain: "שמירה על משקל",
  gain: "עלייה במסה",
};

export interface CalcProfileInput {
  age: number;
  gender: "male" | "female";
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
}

/** נוסחת מיפלין-סנט ג'אור לחישוב BMR */
export function calcBMR(p: CalcProfileInput): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return p.gender === "male" ? base + 5 : base - 161;
}

export function calcNutritionGoals(p: CalcProfileInput): NutritionGoals {
  const bmr = calcBMR(p);
  const tdee = bmr * ACTIVITY_FACTORS[p.activity];

  let calories = tdee;
  if (p.goal === "lose") calories = tdee * 0.8;
  if (p.goal === "gain") calories = tdee * 1.12;

  const proteinPerKg = p.goal === "lose" ? 2.0 : 1.8;
  const protein = proteinPerKg * p.weightKg;
  const fat = (calories * 0.27) / 9;
  const proteinCals = protein * 4;
  const fatCals = fat * 9;
  const carbs = Math.max(0, (calories - proteinCals - fatCals) / 4);

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
  };
}

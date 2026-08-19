import type { FoodItem, FoodLogEntry } from "../types";
import { getFoodById } from "../data/foods";

export interface Macros {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export function gramsForEntry(food: FoodItem, quantity: number, unitId: string): number {
  const unit = food.units.find((u) => u.id === unitId) ?? food.units[0];
  return quantity * unit.grams;
}

export function macrosFor(food: FoodItem, quantity: number, unitId: string): Macros {
  const grams = gramsForEntry(food, quantity, unitId);
  const factor = grams / 100;
  return {
    calories: food.per100g.calories * factor,
    protein: food.per100g.protein * factor,
    fat: food.per100g.fat * factor,
    carbs: food.per100g.carbs * factor,
  };
}

export function macrosForLogEntry(entry: FoodLogEntry): Macros {
  const food = getFoodById(entry.foodId);
  if (!food) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
  return macrosFor(food, entry.quantity, entry.unitId);
}

export function sumMacros(list: Macros[]): Macros {
  return list.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      fat: acc.fat + m.fat,
      carbs: acc.carbs + m.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );
}

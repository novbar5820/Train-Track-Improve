import Dexie, { type Table } from "dexie";
import type {
  WorkoutPlan,
  WorkoutSession,
  FoodLogEntry,
  WeightEntry,
  AppSettings,
} from "../types";

export class FitJourneyDB extends Dexie {
  plans!: Table<WorkoutPlan, string>;
  sessions!: Table<WorkoutSession, string>;
  foodLog!: Table<FoodLogEntry, string>;
  weightLog!: Table<WeightEntry, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super("fitjourney-db");
    this.version(1).stores({
      plans: "id, createdAt",
      sessions: "id, planId, startedAt",
      foodLog: "id, date, foodId",
      weightLog: "id, date",
      settings: "id",
    });
  }
}

export const db = new FitJourneyDB();

export const DEFAULT_SETTINGS: AppSettings = {
  id: "singleton",
  weekStartDay: 1, // Monday
  nutritionGoals: {
    calories: 2200,
    protein: 150,
    fat: 70,
    carbs: 230,
  },
};

export async function getSettings(): Promise<AppSettings> {
  const s = await db.settings.get("singleton");
  if (s) return s;
  await db.settings.put(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

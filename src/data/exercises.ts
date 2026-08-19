import type { ExerciseDef } from "../types";

// ספריית תרגילים מצומצמת ואיכותית - התרגילים הנפוצים ביותר בחדר כושר
export const EXERCISES: ExerciseDef[] = [
  // חזה
  { id: "bench-press-barbell", name: "לחיצת חזה במוט", muscleGroup: "chest", equipment: "barbell" },
  { id: "incline-bench-press-barbell", name: "לחיצת חזה בשיפוע במוט", muscleGroup: "chest", equipment: "barbell" },
  { id: "bench-press-dumbbell", name: "לחיצת חזה בשתי משקולות", muscleGroup: "chest", equipment: "dumbbell" },
  { id: "incline-bench-press-dumbbell", name: "לחיצת חזה בשיפוע במשקולות", muscleGroup: "chest", equipment: "dumbbell" },
  { id: "chest-fly-dumbbell", name: "פרפר משקולות", muscleGroup: "chest", equipment: "dumbbell" },
  { id: "chest-press-machine", name: "לחיצת חזה במכונה", muscleGroup: "chest", equipment: "machine" },
  { id: "pec-deck", name: "פרפר במכונה (פק דק)", muscleGroup: "chest", equipment: "machine" },
  { id: "cable-crossover", name: "פרפר בכבלים", muscleGroup: "chest", equipment: "cable" },
  { id: "push-up", name: "שכיבות סמיכה", muscleGroup: "chest", equipment: "bodyweight" },
  { id: "dips-chest", name: "מקבילים לחזה", muscleGroup: "chest", equipment: "bodyweight" },

  // גב
  { id: "deadlift", name: "דדליפט", muscleGroup: "back", equipment: "barbell" },
  { id: "pull-up", name: "מתח אחיזה רחבה", muscleGroup: "back", equipment: "bodyweight" },
  { id: "pull-up-weighted", name: "מתח עם משקל נוסף", muscleGroup: "back", equipment: "bodyweight" },
  { id: "lat-pulldown", name: "משיכת פולי עליון", muscleGroup: "back", equipment: "cable" },
  { id: "seated-row-cable", name: "חתירה בכבל בישיבה", muscleGroup: "back", equipment: "cable" },
  { id: "bent-over-row-barbell", name: "חתירה עם מוט רכון", muscleGroup: "back", equipment: "barbell" },
  { id: "one-arm-row-dumbbell", name: "חתירה ביד אחת עם משקולת", muscleGroup: "back", equipment: "dumbbell" },
  { id: "t-bar-row", name: "חתירת טי-בר", muscleGroup: "back", equipment: "machine" },
  { id: "back-extension", name: "הרמת גב תחתון", muscleGroup: "back", equipment: "bodyweight" },
  { id: "assisted-pull-up-machine", name: "מתח במכונה מסייעת", muscleGroup: "back", equipment: "machine" },

  // כתפיים
  { id: "shoulder-press-barbell", name: "לחיצת כתפיים במוט", muscleGroup: "shoulders", equipment: "barbell" },
  { id: "shoulder-press-dumbbell", name: "לחיצת כתפיים במשקולות", muscleGroup: "shoulders", equipment: "dumbbell" },
  { id: "shoulder-press-machine", name: "לחיצת כתפיים במכונה", muscleGroup: "shoulders", equipment: "machine" },
  { id: "lateral-raise-dumbbell", name: "הרחקת כתפיים צידית", muscleGroup: "shoulders", equipment: "dumbbell" },
  { id: "front-raise-dumbbell", name: "הרמת כתפיים קדמית", muscleGroup: "shoulders", equipment: "dumbbell" },
  { id: "rear-delt-fly-machine", name: "פרפר אחורי במכונה", muscleGroup: "shoulders", equipment: "machine" },
  { id: "face-pull", name: "פייס פול בכבל", muscleGroup: "shoulders", equipment: "cable" },
  { id: "upright-row-barbell", name: "חתירה זקופה במוט", muscleGroup: "shoulders", equipment: "barbell" },
  { id: "shrug-dumbbell", name: "משיכת כתפיים (שראגס)", muscleGroup: "shoulders", equipment: "dumbbell" },

  // יד קדמית - ביצפס
  { id: "bicep-curl-barbell", name: "כפיפת מרפקים במוט", muscleGroup: "biceps", equipment: "barbell" },
  { id: "bicep-curl-dumbbell", name: "כפיפת מרפקים במשקולות", muscleGroup: "biceps", equipment: "dumbbell" },
  { id: "hammer-curl-dumbbell", name: "כפיפת פטיש", muscleGroup: "biceps", equipment: "dumbbell" },
  { id: "incline-hammer-curl-dumbbell", name: "כפיפת פטיש בשיפוע", muscleGroup: "biceps", equipment: "dumbbell" },
  { id: "preacher-curl", name: "כפיפת מרפקים בספסל סקוט", muscleGroup: "biceps", equipment: "barbell" },
  { id: "cable-curl", name: "כפיפת מרפקים בכבל", muscleGroup: "biceps", equipment: "cable" },
  { id: "concentration-curl", name: "כפיפת ריכוז", muscleGroup: "biceps", equipment: "dumbbell" },

  // יד אחורית - טריצפס
  { id: "triceps-pushdown", name: "פשיטת מרפקים בכבל", muscleGroup: "triceps", equipment: "cable" },
  { id: "skull-crusher", name: "פשיטת מרפקים שוכב", muscleGroup: "triceps", equipment: "barbell" },
  { id: "overhead-triceps-extension", name: "פשיטת מרפקים מעל הראש", muscleGroup: "triceps", equipment: "dumbbell" },
  { id: "dips-triceps", name: "מקבילים לטריצפס", muscleGroup: "triceps", equipment: "bodyweight" },
  { id: "close-grip-bench-press", name: "לחיצת חזה אחיזה צרה", muscleGroup: "triceps", equipment: "barbell" },
  { id: "triceps-kickback", name: "קיקבק טריצפס", muscleGroup: "triceps", equipment: "dumbbell" },

  // רגליים
  { id: "back-squat-barbell", name: "סקוואט גב עם מוט", muscleGroup: "legs", equipment: "barbell" },
  { id: "front-squat-barbell", name: "סקוואט קדמי עם מוט", muscleGroup: "legs", equipment: "barbell" },
  { id: "leg-press", name: "לחיצת רגליים", muscleGroup: "legs", equipment: "machine" },
  { id: "leg-extension", name: "פשיטת ברכיים", muscleGroup: "legs", equipment: "machine" },
  { id: "seated-leg-curl", name: "כפיפת ברכיים בישיבה", muscleGroup: "legs", equipment: "machine" },
  { id: "lying-leg-curl", name: "כפיפת ברכיים בשכיבה", muscleGroup: "legs", equipment: "machine" },
  { id: "bulgarian-split-squat", name: "מכרעים בולגריים", muscleGroup: "legs", equipment: "dumbbell" },
  { id: "smith-bulgarian-split-squat", name: "מכרעים בולגריים בסמית'", muscleGroup: "legs", equipment: "machine" },
  { id: "lunges-dumbbell", name: "מכרעים הליכה במשקולות", muscleGroup: "legs", equipment: "dumbbell" },
  { id: "romanian-deadlift", name: "דדליפט רומני", muscleGroup: "legs", equipment: "barbell" },
  { id: "adduction-machine", name: "מכונת קירוב ירכיים", muscleGroup: "legs", equipment: "machine" },
  { id: "abduction-machine", name: "מכונת הרחקת ירכיים", muscleGroup: "glutes", equipment: "machine" },

  // ישבן
  { id: "hip-thrust", name: "היפ תראסט", muscleGroup: "glutes", equipment: "barbell" },
  { id: "glute-bridge", name: "גשר ישבן", muscleGroup: "glutes", equipment: "bodyweight" },
  { id: "cable-kickback", name: "בעיטת ישבן בכבל", muscleGroup: "glutes", equipment: "cable" },

  // תאומים
  { id: "standing-calf-raise", name: "עמידה על קצות אצבעות בעמידה", muscleGroup: "calves", equipment: "machine" },
  { id: "smith-standing-calf-raise", name: "עליה לקצות אצבעות בסמית'", muscleGroup: "calves", equipment: "machine" },
  { id: "seated-calf-raise", name: "עליה לקצות אצבעות בישיבה", muscleGroup: "calves", equipment: "machine" },

  // בטן
  { id: "crunch", name: "כפיפות בטן", muscleGroup: "abs", equipment: "bodyweight" },
  { id: "hanging-leg-raise", name: "הרמת רגליים בתלייה", muscleGroup: "abs", equipment: "bodyweight" },
  { id: "cable-crunch", name: "כפיפות בטן בכבל", muscleGroup: "abs", equipment: "cable" },
  { id: "plank", name: "פלאנק", muscleGroup: "abs", equipment: "bodyweight" },
  { id: "russian-twist", name: "רוסיאן טוויסט", muscleGroup: "abs", equipment: "bodyweight" },
  { id: "ab-wheel", name: "גלגלת בטן", muscleGroup: "abs", equipment: "bodyweight" },

  // קרדיו
  { id: "treadmill-run", name: "ריצה על הליכון", muscleGroup: "cardio", equipment: "machine" },
  { id: "rowing-machine", name: "חתירה (רואינג)", muscleGroup: "cardio", equipment: "machine" },
  { id: "stationary-bike", name: "אופני כושר", muscleGroup: "cardio", equipment: "machine" },
  { id: "jump-rope", name: "קפיצות חבל", muscleGroup: "cardio", equipment: "bodyweight" },

  // גוף מלא
  { id: "kettlebell-swing", name: "סווינג קטלבל", muscleGroup: "fullbody", equipment: "kettlebell" },
  { id: "burpee", name: "בורפי", muscleGroup: "fullbody", equipment: "bodyweight" },
  { id: "clean-and-press", name: "קלין אנד פרס", muscleGroup: "fullbody", equipment: "barbell" },
];

export const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: "חזה",
  back: "גב",
  shoulders: "כתפיים",
  biceps: "יד קדמית",
  triceps: "יד אחורית",
  legs: "רגליים",
  glutes: "ישבן",
  calves: "תאומים",
  abs: "בטן",
  cardio: "קרדיו",
  fullbody: "גוף מלא",
};

export const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: "מוט",
  dumbbell: "משקולות יד",
  machine: "מכונה",
  cable: "כבל",
  bodyweight: "משקל גוף",
  kettlebell: "קטלבל",
  band: "גומייה",
};

export function getExerciseById(id: string): ExerciseDef | undefined {
  return EXERCISES.find((e) => e.id === id);
}

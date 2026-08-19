import type { FoodItem, FoodUnit } from "../types";

const tbsp = (grams: number): FoodUnit => ({ id: "tbsp", label: "כף", grams });
const tsp = (grams: number): FoodUnit => ({ id: "tsp", label: "כפית", grams });
const cup = (grams: number): FoodUnit => ({ id: "cup", label: "כוס", grams });
const piece = (grams: number, label = "יחידה"): FoodUnit => ({
  id: "piece",
  label,
  grams,
});
const slice = (grams: number): FoodUnit => ({ id: "slice", label: "פרוסה", grams });

interface RawFood {
  name: string;
  category: string;
  cal: number;
  protein: number;
  fat: number;
  carbs: number;
  units?: FoodUnit[];
}

const RAW: RawFood[] = [
  // ===== חלבונים מן החי =====
  { name: "חזה עוף מבושל", category: "חלבון", cal: 165, protein: 31, fat: 3.6, carbs: 0, units: [piece(120, "חזה בינוני")] },
  { name: "שוק עוף מבושל", category: "חלבון", cal: 209, protein: 26, fat: 11, carbs: 0, units: [piece(90, "שוק")] },
  { name: "כרעיים עוף אפויות", category: "חלבון", cal: 190, protein: 25, fat: 9, carbs: 0 },
  { name: "הודו טחון מבושל", category: "חלבון", cal: 170, protein: 27, fat: 6, carbs: 0 },
  { name: "בשר בקר טחון 10%", category: "חלבון", cal: 217, protein: 26, fat: 12, carbs: 0 },
  { name: "סטייק אנטריקוט", category: "חלבון", cal: 271, protein: 25, fat: 19, carbs: 0 },
  { name: "פילה בקר", category: "חלבון", cal: 187, protein: 27, fat: 8, carbs: 0 },
  { name: "כבש צלוי", category: "חלבון", cal: 250, protein: 25, fat: 16, carbs: 0 },
  { name: "סלמון מבושל", category: "חלבון", cal: 208, protein: 22, fat: 13, carbs: 0, units: [piece(150, "פילה")] },
  { name: "טונה בשמן מסונן", category: "חלבון", cal: 128, protein: 24, fat: 3, carbs: 0, units: [piece(90, "קופסה מסוננת")] },
  { name: "טונה במים מסונן", category: "חלבון", cal: 100, protein: 23, fat: 0.8, carbs: 0, units: [piece(90, "קופסה מסוננת")] },
  { name: "דניס / לברק אפוי", category: "חלבון", cal: 150, protein: 21, fat: 7, carbs: 0 },
  { name: "ביצת עוף שלמה", category: "חלבון", cal: 155, protein: 13, fat: 11, carbs: 1.1, units: [piece(50, "ביצה")] },
  { name: "חלבון ביצה", category: "חלבון", cal: 52, protein: 11, fat: 0.2, carbs: 0.7, units: [piece(33, "חלבון ביצה")] },
  { name: "גבינה לבנה 5%", category: "חלבון", cal: 96, protein: 9, fat: 5, carbs: 3.5, units: [cup(225)] },
  { name: "קוטג' 5%", category: "חלבון", cal: 98, protein: 11, fat: 5, carbs: 3, units: [piece(250, "גביע")] },
  { name: "יוגורת טבעי 3%", category: "חלבון", cal: 61, protein: 3.5, fat: 3, carbs: 4.7, units: [piece(150, "גביע")] },
  { name: "יוגורת יווני 5%", category: "חלבון", cal: 97, protein: 9, fat: 5, carbs: 4, units: [piece(150, "גביע")] },
  { name: "גבינה צהובה 28%", category: "חלבון", cal: 350, protein: 25, fat: 28, carbs: 1.3, units: [slice(20)] },
  { name: "גבינת פטה", category: "חלבון", cal: 264, protein: 14, fat: 21, carbs: 4 },
  { name: "טופו", category: "חלבון", cal: 76, protein: 8, fat: 4.5, carbs: 1.9 },
  { name: "אבקת חלבון מי גבינה (וואי)", category: "חלבון", cal: 380, protein: 80, fat: 5, carbs: 8, units: [piece(30, "מנה - כף גדולה")] },
  { name: "נקניקיות הודו", category: "חלבון", cal: 180, protein: 16, fat: 12, carbs: 2, units: [piece(50, "נקניקיה")] },

  // ===== פחמימות =====
  { name: "אורז לבן מבושל", category: "פחמימה", cal: 130, protein: 2.7, fat: 0.3, carbs: 28, units: [cup(158)] },
  { name: "אורז מלא מבושל", category: "פחמימה", cal: 123, protein: 2.6, fat: 1, carbs: 26, units: [cup(195)] },
  { name: "אורז בסמטי מבושל", category: "פחמימה", cal: 121, protein: 2.5, fat: 0.4, carbs: 25, units: [cup(163)] },
  { name: "פסטה מבושלת", category: "פחמימה", cal: 158, protein: 5.8, fat: 0.9, carbs: 31, units: [cup(140)] },
  { name: "פסטה מקמח מלא מבושלת", category: "פחמימה", cal: 149, protein: 6.3, fat: 1.3, carbs: 30, units: [cup(140)] },
  { name: "קינואה מבושלת", category: "פחמימה", cal: 120, protein: 4.4, fat: 1.9, carbs: 21, units: [cup(185)] },
  { name: "בורגול מבושל", category: "פחמימה", cal: 83, protein: 3, fat: 0.2, carbs: 18.5, units: [cup(182)] },
  { name: "קוסקוס מבושל", category: "פחמימה", cal: 112, protein: 3.8, fat: 0.2, carbs: 23, units: [cup(157)] },
  { name: "תפוח אדמה אפוי", category: "פחמימה", cal: 93, protein: 2.5, fat: 0.1, carbs: 21, units: [piece(170, "תפוח אדמה בינוני")] },
  { name: "בטטה אפויה", category: "פחמימה", cal: 90, protein: 2, fat: 0.2, carbs: 21, units: [piece(150, "בטטה בינונית")] },
  { name: "פירה תפוחי אדמה", category: "פחמימה", cal: 105, protein: 2, fat: 4, carbs: 16, units: [cup(210)] },
  { name: "לחם לבן", category: "פחמימה", cal: 265, protein: 9, fat: 3.2, carbs: 49, units: [slice(30)] },
  { name: "לחם מלא", category: "פחמימה", cal: 247, protein: 13, fat: 3.4, carbs: 41, units: [slice(30)] },
  { name: "פיתה", category: "פחמימה", cal: 275, protein: 9, fat: 1.2, carbs: 56, units: [piece(80, "פיתה")] },
  { name: "לחמנייה", category: "פחמימה", cal: 280, protein: 9, fat: 4, carbs: 52, units: [piece(60, "לחמנייה")] },
  { name: "טורטייה", category: "פחמימה", cal: 300, protein: 8, fat: 7.5, carbs: 51, units: [piece(50, "טורטייה")] },
  { name: "קרקר / פריכיות אורז", category: "פחמימה", cal: 387, protein: 8, fat: 2.8, carbs: 82, units: [piece(9, "פריכית")] },
  { name: "שיבולת שועל (קוואקר יבש)", category: "פחמימה", cal: 379, protein: 13.5, fat: 6.5, carbs: 67, units: [cup(90)] },
  { name: "גרנולה", category: "פחמימה", cal: 471, protein: 10, fat: 20, carbs: 64, units: [cup(120)] },
  { name: "קורנפלקס", category: "פחמימה", cal: 357, protein: 7, fat: 0.9, carbs: 84, units: [cup(30)] },

  // ===== קטניות =====
  { name: "חומוס מבושל", category: "קטניות", cal: 164, protein: 8.9, fat: 2.6, carbs: 27, units: [cup(164)] },
  { name: "עדשים מבושלות", category: "קטניות", cal: 116, protein: 9, fat: 0.4, carbs: 20, units: [cup(198)] },
  { name: "שעועית אדומה מבושלת", category: "קטניות", cal: 127, protein: 8.7, fat: 0.5, carbs: 22.8, units: [cup(177)] },
  { name: "שעועית לבנה מבושלת", category: "קטניות", cal: 139, protein: 9.7, fat: 0.4, carbs: 25, units: [cup(179)] },
  { name: "אפונה ירוקה", category: "קטניות", cal: 81, protein: 5.4, fat: 0.4, carbs: 14, units: [cup(160)] },
  { name: "פול מבושל", category: "קטניות", cal: 110, protein: 7.6, fat: 0.4, carbs: 19.7, units: [cup(170)] },
  { name: "אדממה", category: "קטניות", cal: 121, protein: 12, fat: 5, carbs: 8.9, units: [cup(155)] },
  { name: "חומוס טחינה (סלט)", category: "קטניות", cal: 220, protein: 7, fat: 14, carbs: 17, units: [cup(250)] },

  // ===== ירקות =====
  { name: "עגבנייה", category: "ירקות", cal: 18, protein: 0.9, fat: 0.2, carbs: 3.9, units: [piece(120, "עגבנייה בינונית")] },
  { name: "מלפפון", category: "ירקות", cal: 15, protein: 0.7, fat: 0.1, carbs: 3.6, units: [piece(150, "מלפפון בינוני")] },
  { name: "פלפל אדום", category: "ירקות", cal: 31, protein: 1, fat: 0.3, carbs: 6, units: [piece(120, "פלפל")] },
  { name: "בצל", category: "ירקות", cal: 40, protein: 1.1, fat: 0.1, carbs: 9.3, units: [piece(110, "בצל בינוני")] },
  { name: "גזר", category: "ירקות", cal: 41, protein: 0.9, fat: 0.2, carbs: 10, units: [piece(60, "גזר בינוני")] },
  { name: "חסה", category: "ירקות", cal: 15, protein: 1.4, fat: 0.2, carbs: 2.9, units: [cup(36)] },
  { name: "כרוב לבן", category: "ירקות", cal: 25, protein: 1.3, fat: 0.1, carbs: 5.8, units: [cup(89)] },
  { name: "ברוקולי מבושל", category: "ירקות", cal: 35, protein: 2.4, fat: 0.4, carbs: 7.2, units: [cup(156)] },
  { name: "כרובית מבושלת", category: "ירקות", cal: 25, protein: 1.8, fat: 0.5, carbs: 5, units: [cup(124)] },
  { name: "קישוא מבושל", category: "ירקות", cal: 17, protein: 1.2, fat: 0.3, carbs: 3.1, units: [cup(180)] },
  { name: "חציל אפוי", category: "ירקות", cal: 35, protein: 0.8, fat: 0.2, carbs: 8.6, units: [piece(300, "חציל בינוני")] },
  { name: "תירס מתוק", category: "ירקות", cal: 96, protein: 3.4, fat: 1.5, carbs: 21, units: [piece(90, "קלח")] },
  { name: "פטריות", category: "ירקות", cal: 22, protein: 3.1, fat: 0.3, carbs: 3.3, units: [cup(70)] },
  { name: "אבוקדו", category: "ירקות", cal: 160, protein: 2, fat: 15, carbs: 8.5, units: [piece(200, "אבוקדו בינוני")] },
  { name: "תרד", category: "ירקות", cal: 23, protein: 2.9, fat: 0.4, carbs: 3.6, units: [cup(30)] },
  { name: "צנונית", category: "ירקות", cal: 16, protein: 0.7, fat: 0.1, carbs: 3.4 },
  { name: "סלק מבושל", category: "ירקות", cal: 44, protein: 1.7, fat: 0.2, carbs: 10, units: [piece(80, "סלק בינוני")] },
  { name: "שום", category: "ירקות", cal: 149, protein: 6.4, fat: 0.5, carbs: 33, units: [piece(3, "שן שום")] },

  // ===== פירות =====
  { name: "תפוח", category: "פירות", cal: 52, protein: 0.3, fat: 0.2, carbs: 14, units: [piece(180, "תפוח בינוני")] },
  { name: "בננה", category: "פירות", cal: 89, protein: 1.1, fat: 0.3, carbs: 23, units: [piece(120, "בננה בינונית")] },
  { name: "תפוז", category: "פירות", cal: 47, protein: 0.9, fat: 0.1, carbs: 12, units: [piece(150, "תפוז בינוני")] },
  { name: "ענבים", category: "פירות", cal: 69, protein: 0.7, fat: 0.2, carbs: 18, units: [cup(151)] },
  { name: "תות שדה", category: "פירות", cal: 32, protein: 0.7, fat: 0.3, carbs: 7.7, units: [cup(150)] },
  { name: "אבטיח", category: "פירות", cal: 30, protein: 0.6, fat: 0.2, carbs: 7.6, units: [cup(150)] },
  { name: "מלון", category: "פירות", cal: 34, protein: 0.8, fat: 0.2, carbs: 8.2, units: [cup(160)] },
  { name: "אננס", category: "פירות", cal: 50, protein: 0.5, fat: 0.1, carbs: 13, units: [cup(165)] },
  { name: "מנגו", category: "פירות", cal: 60, protein: 0.8, fat: 0.4, carbs: 15, units: [piece(200, "מנגו בינוני")] },
  { name: "קיווי", category: "פירות", cal: 61, protein: 1.1, fat: 0.5, carbs: 15, units: [piece(75, "קיווי")] },
  { name: "אפרסק", category: "פירות", cal: 39, protein: 0.9, fat: 0.3, carbs: 9.5, units: [piece(150, "אפרסק")] },
  { name: "אגס", category: "פירות", cal: 57, protein: 0.4, fat: 0.1, carbs: 15, units: [piece(180, "אגס")] },
  { name: "רימון", category: "פירות", cal: 83, protein: 1.7, fat: 1.2, carbs: 19, units: [piece(280, "רימון")] },
  { name: "תמר מג'הול", category: "פירות", cal: 277, protein: 1.8, fat: 0.2, carbs: 75, units: [piece(24, "תמר")] },
  { name: "צימוקים", category: "פירות", cal: 299, protein: 3.1, fat: 0.5, carbs: 79, units: [tbsp(10)] },
  { name: "לימון", category: "פירות", cal: 29, protein: 1.1, fat: 0.3, carbs: 9.3, units: [piece(60, "לימון")] },

  // ===== אגוזים וזרעים =====
  { name: "שקדים", category: "אגוזים", cal: 579, protein: 21, fat: 50, carbs: 22, units: [tbsp(9)] },
  { name: "אגוזי מלך", category: "אגוזים", cal: 654, protein: 15, fat: 65, carbs: 14, units: [tbsp(8)] },
  { name: "בוטנים", category: "אגוזים", cal: 567, protein: 26, fat: 49, carbs: 16, units: [tbsp(9)] },
  { name: "קשיו", category: "אגוזים", cal: 553, protein: 18, fat: 44, carbs: 30, units: [tbsp(9)] },
  { name: "פיסטוקים", category: "אגוזים", cal: 560, protein: 20, fat: 45, carbs: 28, units: [tbsp(8)] },
  { name: "חמאת בוטנים", category: "אגוזים", cal: 588, protein: 25, fat: 50, carbs: 20, units: [tbsp(16)] },
  { name: "טחינה גולמית", category: "אגוזים", cal: 595, protein: 17, fat: 54, carbs: 21, units: [tbsp(15)] },
  { name: "גרעיני חמנייה", category: "אגוזים", cal: 584, protein: 21, fat: 51, carbs: 20, units: [tbsp(8)] },
  { name: "גרעיני דלעת", category: "אגוזים", cal: 559, protein: 30, fat: 49, carbs: 11, units: [tbsp(8)] },
  { name: "זרעי צ'יה", category: "אגוזים", cal: 486, protein: 17, fat: 31, carbs: 42, units: [tbsp(12)] },
  { name: "זרעי פשתן", category: "אגוזים", cal: 534, protein: 18, fat: 42, carbs: 29, units: [tbsp(10)] },

  // ===== שומנים =====
  { name: "שמן זית", category: "שומן", cal: 884, protein: 0, fat: 100, carbs: 0, units: [tbsp(14), tsp(4.5)] },
  { name: "שמן קנולה", category: "שומן", cal: 884, protein: 0, fat: 100, carbs: 0, units: [tbsp(14)] },
  { name: "חמאה", category: "שומן", cal: 717, protein: 0.9, fat: 81, carbs: 0.1, units: [tbsp(14), tsp(5)] },
  { name: "מרגרינה", category: "שומן", cal: 717, protein: 0.2, fat: 80, carbs: 0.7, units: [tbsp(14)] },
  { name: "מיונז", category: "שומן", cal: 680, protein: 1, fat: 75, carbs: 0.6, units: [tbsp(14)] },

  // ===== חלב ומוצריו =====
  { name: "חלב 3%", category: "חלב", cal: 61, protein: 3.2, fat: 3.3, carbs: 4.8, units: [cup(244)] },
  { name: "חלב 1%", category: "חלב", cal: 42, protein: 3.4, fat: 1, carbs: 5, units: [cup(244)] },
  { name: "חלב סויה", category: "חלב", cal: 33, protein: 2.9, fat: 1.6, carbs: 1.6, units: [cup(244)] },
  { name: "חלב שקדים לא ממותק", category: "חלב", cal: 13, protein: 0.4, fat: 1.1, carbs: 0.6, units: [cup(240)] },
  { name: "שמנת מתוקה 38%", category: "חלב", cal: 340, protein: 2.2, fat: 36, carbs: 3, units: [tbsp(15)] },
  { name: "לבן / לבנייה", category: "חלב", cal: 62, protein: 3.3, fat: 3, carbs: 5.5, units: [cup(245)] },
  { name: "גבינת שמנת", category: "חלב", cal: 342, protein: 6, fat: 34, carbs: 4, units: [tbsp(15)] },
  { name: "מוצרלה", category: "חלב", cal: 280, protein: 22, fat: 21, carbs: 2.2, units: [slice(20)] },
  { name: "פרמזן מגורר", category: "חלב", cal: 431, protein: 38, fat: 29, carbs: 4, units: [tbsp(5)] },

  // ===== ממתקים וחטיפים =====
  { name: "שוקולד מריר 70%", category: "ממתקים", cal: 598, protein: 7.8, fat: 43, carbs: 46, units: [piece(10, "קוביה")] },
  { name: "שוקולד חלב", category: "ממתקים", cal: 535, protein: 7.6, fat: 30, carbs: 59, units: [piece(10, "קוביה")] },
  { name: "עוגיות שוקולד צ'יפס", category: "ממתקים", cal: 488, protein: 5.5, fat: 24, carbs: 63, units: [piece(15, "עוגייה")] },
  { name: "גלידה וניל", category: "ממתקים", cal: 207, protein: 3.5, fat: 11, carbs: 24, units: [cup(132)] },
  { name: "חטיף אנרגיה (בר)", category: "ממתקים", cal: 400, protein: 10, fat: 15, carbs: 55, units: [piece(45, "בר")] },
  { name: "צ'יפס תפוחי אדמה", category: "ממתקים", cal: 536, protein: 6.6, fat: 34, carbs: 53, units: [cup(28)] },
  { name: "במבה", category: "ממתקים", cal: 536, protein: 11, fat: 33, carbs: 51, units: [piece(25, "שקית קטנה")] },
  { name: "ביסלי", category: "ממתקים", cal: 470, protein: 8, fat: 20, carbs: 63, units: [piece(30, "שקית קטנה")] },
  { name: "פופקורן", category: "ממתקים", cal: 387, protein: 12, fat: 4.5, carbs: 78, units: [cup(8)] },
  { name: "דבש", category: "ממתקים", cal: 304, protein: 0.3, fat: 0, carbs: 82, units: [tbsp(21)] },
  { name: "ריבה", category: "ממתקים", cal: 250, protein: 0.4, fat: 0, carbs: 62, units: [tbsp(20)] },
  { name: "סוכר לבן", category: "ממתקים", cal: 387, protein: 0, fat: 0, carbs: 100, units: [tbsp(12.5), tsp(4)] },
  { name: "וופל בציפוי שוקולד", category: "ממתקים", cal: 500, protein: 6, fat: 27, carbs: 58, units: [piece(30, "וופל")] },
  { name: "בייגלה", category: "ממתקים", cal: 400, protein: 10, fat: 8, carbs: 70, units: [piece(30, "בייגלה")] },
  { name: "קרם שוקולד ממרח (נוטלה)", category: "ממתקים", cal: 539, protein: 6, fat: 31, carbs: 58, units: [tbsp(20)] },

  // ===== משקאות =====
  { name: "מים", category: "משקאות", cal: 0, protein: 0, fat: 0, carbs: 0, units: [cup(240), piece(500, "בקבוק")] },
  { name: "קולה רגילה", category: "משקאות", cal: 42, protein: 0, fat: 0, carbs: 10.6, units: [piece(330, "פחית")] },
  { name: "קולה זירו", category: "משקאות", cal: 0.3, protein: 0, fat: 0, carbs: 0, units: [piece(330, "פחית")] },
  { name: "מיץ תפוזים סחוט", category: "משקאות", cal: 45, protein: 0.7, fat: 0.2, carbs: 10.4, units: [cup(248)] },
  { name: "בירה", category: "משקאות", cal: 43, protein: 0.5, fat: 0, carbs: 3.6, units: [piece(330, "בקבוק")] },
  { name: "יין אדום", category: "משקאות", cal: 85, protein: 0.1, fat: 0, carbs: 2.6, units: [piece(150, "כוס יין")] },
  { name: "קפה שחור", category: "משקאות", cal: 2, protein: 0.3, fat: 0, carbs: 0, units: [cup(240)] },
  { name: "קפה הפוך (חלב 3%)", category: "משקאות", cal: 40, protein: 2, fat: 2, carbs: 3, units: [piece(200, "כוס")] },
  { name: "משקה איזוטוני", category: "משקאות", cal: 24, protein: 0, fat: 0, carbs: 6, units: [piece(500, "בקבוק")] },

  // ===== מוכן / מסעדות =====
  { name: "פיצה מרגריטה (פרוסה)", category: "מוכן", cal: 266, protein: 11, fat: 10, carbs: 33, units: [piece(107, "פרוסה")] },
  { name: "המבורגר בלחמנייה", category: "מוכן", cal: 295, protein: 17, fat: 14, carbs: 25, units: [piece(220, "המבורגר")] },
  { name: "שווארמה בפיתה", category: "מוכן", cal: 280, protein: 18, fat: 15, carbs: 20, units: [piece(350, "מנה בפיתה")] },
  { name: "פלאפל (כדור)", category: "מוכן", cal: 333, protein: 13, fat: 18, carbs: 32, units: [piece(17, "כדור")] },
  { name: "סושי - רול קליפורניה", category: "מוכן", cal: 145, protein: 5, fat: 4, carbs: 22, units: [piece(30, "יחידה")] },
  { name: "סלט קיסר עם עוף", category: "מוכן", cal: 158, protein: 14, fat: 9, carbs: 5 },
  { name: "מרק עדשים", category: "מוכן", cal: 90, protein: 6, fat: 1.5, carbs: 14, units: [cup(250)] },
  { name: "שקשוקה", category: "מוכן", cal: 130, protein: 7, fat: 9, carbs: 5, units: [cup(250)] },
  { name: "סושי - סלמון ניגירי", category: "מוכן", cal: 48, protein: 4, fat: 1.5, carbs: 5, units: [piece(25, "יחידה")] },
  { name: "פסטה ברוטב עגבניות", category: "מוכן", cal: 145, protein: 4.5, fat: 3, carbs: 24, units: [cup(250)] },

  // ===== תוספי אימון =====
  { name: "קריאטין מונוהידראט", category: "תוספים", cal: 0, protein: 0, fat: 0, carbs: 0, units: [piece(5, "מנה")] },
  { name: "אבקת חלבון סויה", category: "תוספים", cal: 360, protein: 75, fat: 3, carbs: 12, units: [piece(30, "מנה")] },
  { name: "BCAA אבקה", category: "תוספים", cal: 8, protein: 2, fat: 0, carbs: 0, units: [piece(7, "מנה")] },
];

function buildFoods(): FoodItem[] {
  return RAW.map((f, idx) => ({
    id: `food-${idx + 1}`,
    name: f.name,
    category: f.category,
    per100g: { calories: f.cal, protein: f.protein, fat: f.fat, carbs: f.carbs },
    units: [{ id: "gram", label: 'גרם', grams: 1 }, ...(f.units ?? [])],
  }));
}

export const FOODS: FoodItem[] = buildFoods();

export const FOOD_CATEGORIES: string[] = Array.from(
  new Set(FOODS.map((f) => f.category))
);

export function getFoodById(id: string): FoodItem | undefined {
  return FOODS.find((f) => f.id === id);
}

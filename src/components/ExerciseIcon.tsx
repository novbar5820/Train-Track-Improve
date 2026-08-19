import type { ReactElement } from "react";
import type { MuscleGroup } from "../types";

// אייקון מאויר פשוט לכל קבוצת שרירים - קו זהב על רקע עור בהיר
const PATHS: Record<MuscleGroup, ReactElement> = {
  chest: (
    <path d="M8 15c2-3 6-3 8 0 2-3 6-3 8 0v3c0 4-4 6-8 6s-8-2-8-6v-3z" />
  ),
  back: (
    <path d="M12 6l4 3 4-3v6l-3 2 3 2v6l-4-3-4 3v-6l3-2-3-2V6z" />
  ),
  shoulders: (
    <path d="M6 16c0-4 3-7 6-7s6 3 6 7M4 17a3 3 0 116 0v3H4v-3zM14 17a3 3 0 116 0v3h-6v-3z" />
  ),
  biceps: (
    <path d="M8 8c4-2 8 0 9 4 1 3-1 6-4 7l-2-3c2-1 3-2 2-4-1-2-3-2-5-1V8z" />
  ),
  triceps: (
    <path d="M9 6c3 0 6 2 6 6 0 3-1 5-3 7l-2-2c1-1 2-3 2-5 0-2-1-4-3-4V6z" />
  ),
  legs: (
    <path d="M9 4h6l1 8-2 9h-2l-1-7-1 7H8l-2-9 3-8z" />
  ),
  glutes: (
    <path d="M6 8c0-3 3-4 6-4s6 1 6 4v4c0 4-3 7-6 7s-6-3-6-7V8z" />
  ),
  calves: (
    <path d="M10 4h4l1 9c1 2 1 5-1 7l-2 2v-4c-2 0-3-2-3-4l1-10z" />
  ),
  abs: (
    <path d="M8 5h8v14H8V5zm0 3.5h8M8 12h8M8 15.5h8M12 5v14" />
  ),
  cardio: (
    <path d="M4 13h3l2-5 3 9 2-6 2 2h4M12 4c2-2 6-1 6 2 0 3-6 7-6 7s-6-4-6-7c0-3 4-4 6-2z" />
  ),
  fullbody: (
    <path d="M12 3a2 2 0 110 4 2 2 0 010-4zM9 9h6l2 5-3 1-1-3-1 8h-2l-1-8-1 3-3-1 2-5z" />
  ),
};

export function ExerciseIcon({
  muscleGroup,
  size = 44,
}: {
  muscleGroup: MuscleGroup;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#gold-grad)"
      strokeWidth="1.4"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <defs>
        <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d9ad4e" />
          <stop offset="100%" stopColor="#8c5a35" />
        </linearGradient>
      </defs>
      {PATHS[muscleGroup] ?? PATHS.fullbody}
    </svg>
  );
}

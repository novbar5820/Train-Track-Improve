import type { ReactNode } from "react";

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

function StrokeIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 2.8,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function IconClose(p: IconProps) {
  return (
    <StrokeIcon {...p} strokeWidth={p.strokeWidth ?? 3}>
      <path d="M6 6l12 12M18 6L6 18" />
    </StrokeIcon>
  );
}

export function IconChevronBack(p: IconProps) {
  // points toward the past / previous (opens rightward in RTL)
  return (
    <StrokeIcon {...p} strokeWidth={p.strokeWidth ?? 3}>
      <path d="M10 6l6 6-6 6" />
    </StrokeIcon>
  );
}

export function IconChevronForward(p: IconProps) {
  return (
    <StrokeIcon {...p} strokeWidth={p.strokeWidth ?? 3}>
      <path d="M14 6l-6 6 6 6" />
    </StrokeIcon>
  );
}

export function IconChevronDown(p: IconProps) {
  return (
    <StrokeIcon {...p} strokeWidth={p.strokeWidth ?? 3}>
      <path d="M6 10l6 6 6-6" />
    </StrokeIcon>
  );
}

export function IconCheck(p: IconProps) {
  return (
    <StrokeIcon {...p} strokeWidth={p.strokeWidth ?? 3.2}>
      <path d="M4 12.5l5 5L20 6.5" />
    </StrokeIcon>
  );
}

export function IconPlus(p: IconProps) {
  return (
    <StrokeIcon {...p} strokeWidth={p.strokeWidth ?? 3}>
      <path d="M12 5v14M5 12h14" />
    </StrokeIcon>
  );
}

export function IconClock(p: IconProps) {
  return (
    <StrokeIcon {...p}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9.5V13l2.5 1.5M9 2h6" />
    </StrokeIcon>
  );
}

export function IconPlay(p: IconProps) {
  return (
    <svg width={p.size ?? 24} height={p.size ?? 24} viewBox="0 0 24 24" fill={p.color ?? "currentColor"} stroke="none">
      <path d="M7 4.5l13 7.5-13 7.5z" />
    </svg>
  );
}

export function IconTrophy(p: IconProps) {
  return (
    <StrokeIcon {...p}>
      <path d="M7 4h10v4.5a5 5 0 01-10 0V4zM7 5.5H4.2a3 3 0 003 3M17 5.5h2.8a3 3 0 01-3 3M12 13.5V17M8 20.5h8" />
    </StrokeIcon>
  );
}

export function IconSearch(p: IconProps) {
  return (
    <StrokeIcon {...p} strokeWidth={p.strokeWidth ?? 2.9}>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
    </StrokeIcon>
  );
}

export function IconTrash(p: IconProps) {
  return (
    <StrokeIcon {...p}>
      <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6" />
    </StrokeIcon>
  );
}

export function IconWarningTriangle(p: IconProps) {
  return (
    <StrokeIcon {...p} strokeWidth={p.strokeWidth ?? 2.9}>
      <path d="M12 4.5l8.5 15H3.5l8.5-15zM12 10v4.5M12 17.5v.01" />
    </StrokeIcon>
  );
}

export function IconArrowUp(p: IconProps) {
  return (
    <StrokeIcon {...p} strokeWidth={p.strokeWidth ?? 3.2}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </StrokeIcon>
  );
}

export function IconArrowDown(p: IconProps) {
  return (
    <StrokeIcon {...p} strokeWidth={p.strokeWidth ?? 3.2}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </StrokeIcon>
  );
}

export function IconDumbbell(p: IconProps) {
  return (
    <StrokeIcon {...p}>
      <path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10" />
    </StrokeIcon>
  );
}

export function IconFire(p: IconProps) {
  return (
    <StrokeIcon {...p}>
      <path d="M12 3c3 4 5 6 5 9a5 5 0 01-10 0c0-1.6.7-3 2-4.5" />
    </StrokeIcon>
  );
}

export function IconScale(p: IconProps) {
  return (
    <StrokeIcon {...p}>
      <path d="M12 3a3 3 0 013 3H9a3 3 0 013-3zM4 8h16l1 12a1 1 0 01-1 1H4a1 1 0 01-1-1L4 8zM9 13a3 3 0 006 0" />
    </StrokeIcon>
  );
}

export function IconSliders(p: IconProps) {
  return (
    <StrokeIcon {...p} strokeWidth={p.strokeWidth ?? 2.9}>
      <path d="M6 4v5M6 15v5M12 4v9M12 19v1M18 4v1M18 11v9" />
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="12" cy="16" r="2.4" />
      <circle cx="18" cy="8" r="2.4" />
    </StrokeIcon>
  );
}

export function IconFork(p: IconProps) {
  return (
    <StrokeIcon {...p}>
      <path d="M5 3v7a3 3 0 003 3v8M8 3v7M18 3c-2 1.5-3 3.5-3 6 0 2 1 3 3 3v9" />
    </StrokeIcon>
  );
}

export function IconCalendarWeek(p: IconProps) {
  return (
    <StrokeIcon {...p}>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </StrokeIcon>
  );
}

export function IconGoalFlag(p: IconProps) {
  return (
    <StrokeIcon {...p}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.5" fill={p.color ?? "currentColor"} />
    </StrokeIcon>
  );
}

export function IconCalculator(p: IconProps) {
  return (
    <StrokeIcon {...p}>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M8 7.5h8M8 12h1M11.5 12h1M15 12h1M8 15.5h1M11.5 15.5h1M15 15.5h1M8 19h1M11.5 19h1M15 19h1" />
    </StrokeIcon>
  );
}

export function IconRuler(p: IconProps) {
  return (
    <StrokeIcon {...p}>
      <rect x="3" y="9" width="18" height="6" rx="1.5" transform="rotate(0 12 12)" />
      <path d="M6 9v2.5M9.5 9v3M13 9v2.5M16.5 9v3" />
    </StrokeIcon>
  );
}


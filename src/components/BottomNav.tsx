import { NavLink, useLocation } from "react-router-dom";
import { IconScale, IconSliders } from "./Icons";

const FILLED_PATHS: Record<string, string> = {
  home: "M4 11.5 12 4l8 7.5V20a1 1 0 01-1 1h-4.5v-6h-5v6H5a1 1 0 01-1-1v-8.5z",
  plans: "M6 3h8l4 4v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1zm3 9h6v2H9v-2zm0 4h6v2H9v-2z",
  nutrition: "M5 2h2v7h1V2h2v7a3 3 0 01-2 2.8V22H6V11.8A3 3 0 014 9V2h1zm12 0h2v20h-3v-9.2A3 3 0 0114 10c0-3.2 1.4-6.4 3-8z",
};

const ITEMS = [
  { to: "/", label: "בית", icon: "home" as const },
  { to: "/plans", label: "תוכניות", icon: "plans" as const },
  { to: "/nutrition", label: "תזונה", icon: "nutrition" as const },
  { to: "/weight", label: "משקל", icon: "weight" as const },
  { to: "/settings", label: "הגדרות", icon: "settings" as const },
];

function NavIcon({ name, active }: { name: (typeof ITEMS)[number]["icon"]; active: boolean }) {
  const color = active ? "#ffffff" : "var(--muted)";
  if (name === "weight") return <IconScale size={28} color={color} strokeWidth={2.8} />;
  if (name === "settings") return <IconSliders size={28} color={color} strokeWidth={2.9} />;
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={color} stroke="none">
      <path d={FILLED_PATHS[name]} />
    </svg>
  );
}

export function BottomNav() {
  const location = useLocation();
  const activeIndex = ITEMS.findIndex((item) =>
    item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to)
  );
  const idx = activeIndex === -1 ? 0 : activeIndex;
  // RTL: item 0 (בית) is rightmost, item 4 (הגדרות) is leftmost
  const posFromLeft = ITEMS.length - 1 - idx;

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav__rail">
        <span
          className="bottom-nav__pill"
          style={{
            width: `calc((100% - 12px) / ${ITEMS.length})`,
            left: `calc(6px + (100% - 12px) * ${posFromLeft} / ${ITEMS.length})`,
          }}
        />
        {ITEMS.map((item, i) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <NavIcon name={item.icon} active={i === idx} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

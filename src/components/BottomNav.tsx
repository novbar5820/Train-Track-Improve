import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";

const ICONS: Record<string, ReactElement> = {
  home: (
    <path d="M4 11.5 12 4l8 7.5V20a1 1 0 01-1 1h-4.5v-6h-5v6H5a1 1 0 01-1-1v-8.5z" />
  ),
  plans: (
    <path d="M6 4h9l3 3v13a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1zM9 12h6M9 16h6M9 8h3" />
  ),
  nutrition: (
    <path d="M6 3v6a3 3 0 003 3v9M6 3v6M9 3v6M6 9h3M18 3c-2 1-3 3-3 6 0 2 1 3 3 3v9" />
  ),
  weight: (
    <path d="M12 3a3 3 0 013 3H9a3 3 0 013-3zM4 8h16l1 12a1 1 0 01-1 1H4a1 1 0 01-1-1L4 8zM9 13a3 3 0 006 0" />
  ),
  settings: (
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 00-2-1.2L14 3h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1c.6.5 1.3.9 2 1.2L10 21h4l.5-2.6c.7-.3 1.4-.7 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z" />
  ),
};

function Icon({ name }: { name: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

const ITEMS = [
  { to: "/", label: "בית", icon: "home" },
  { to: "/plans", label: "תוכניות", icon: "plans" },
  { to: "/nutrition", label: "תזונה", icon: "nutrition" },
  { to: "/weight", label: "משקל", icon: "weight" },
  { to: "/settings", label: "הגדרות", icon: "settings" },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

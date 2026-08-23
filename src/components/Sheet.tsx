import type { ReactNode } from "react";

export function Sheet({
  open,
  onClose,
  tall = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  tall?: boolean;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className={`sheet ${tall ? "sheet--tall" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        {children}
      </div>
    </div>
  );
}

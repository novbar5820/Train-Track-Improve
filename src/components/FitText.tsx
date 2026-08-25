import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

export function FitText({
  children,
  maxSize,
  minSize = 13,
  style,
}: {
  children: ReactNode;
  maxSize: number;
  minSize?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState(maxSize);

  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    let s = maxSize;
    el.style.fontSize = `${s}px`;
    while (el.scrollWidth > parent.clientWidth && s > minSize) {
      s -= 1;
      el.style.fontSize = `${s}px`;
    }
    setSize(s);
  }, [children, maxSize, minSize]);

  return (
    <span ref={ref} style={{ ...style, fontSize: size, whiteSpace: "nowrap", maxWidth: "100%" }}>
      {children}
    </span>
  );
}

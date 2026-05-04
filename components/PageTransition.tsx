"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Class-toggle based page transition.
 *
 * The flash ("chóp") problem: when the incoming page is at opacity < 1,
 * its transparent portion reveals whatever is behind. If that's the cream
 * <body> background it reads as a bright flash against our dark hero
 * sections. Fix: give `.page-transition-host` a solid `--ink-900` bg (see
 * globals.css) so the fade always blends dark-over-dark on the hero and
 * never exposes cream body bg.
 *
 *   1. When pathname changes, the inner div remounts (key={pathname}) and
 *      `is-entering` is applied BEFORE first paint via useLayoutEffect.
 *      First frame renders at opacity 0.6 (content dimmed on dark bg).
 *   2. A double requestAnimationFrame later the class is removed, so the
 *      CSS `transition` on `.page-transition` smoothly animates opacity
 *      0.6 → 1 over 550ms.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [entering, setEntering] = useState(false);
  const firstRef = useRef(true);

  useIsoLayoutEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }
    setEntering(true);
  }, [pathname]);

  useEffect(() => {
    if (!entering) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setEntering(false));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [entering]);

  return (
    <div className="page-transition-host">
      <div
        key={pathname}
        className={`page-transition${entering ? " is-entering" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

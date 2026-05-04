"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function RouteProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const isFirstRef = useRef(true);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    if (isFirstRef.current) {
      isFirstRef.current = false;
      return;
    }
    clearTimers();
    setVisible(true);
    setProgress(8);
    timersRef.current.push(setTimeout(() => setProgress(45), 80));
    timersRef.current.push(setTimeout(() => setProgress(72), 240));
    timersRef.current.push(setTimeout(() => setProgress(88), 600));
    timersRef.current.push(
      setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 220);
      }, 850)
    );
    return clearTimers;
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 1000,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity .25s ease",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background:
            "linear-gradient(90deg, var(--gold-400), var(--gold-600) 60%, var(--gold-300))",
          boxShadow: "0 0 12px rgba(193, 154, 100, 0.55)",
          transition: "width .35s cubic-bezier(.2,.7,.2,1)",
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
}

export default function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <RouteProgressInner />
    </Suspense>
  );
}

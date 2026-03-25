"use client";
import { useEffect, useState, useRef } from "react";

interface Props {
  duration: number; // ms
  onTimeout: () => void;
  running: boolean;
  key: string | number;
}

export default function CountdownBar({ duration, onTimeout, running, key: _key }: Props) {
  const [progress, setProgress] = useState(100);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const calledRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    calledRef.current = false;
    startRef.current = null;
    setProgress(100);

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const remaining = Math.max(0, 1 - elapsed / duration);
      setProgress(remaining * 100);

      if (elapsed >= duration) {
        if (!calledRef.current) {
          calledRef.current = true;
          onTimeout();
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [duration, onTimeout, running, _key]);

  const color =
    progress > 60
      ? "bg-green-400"
      : progress > 30
      ? "bg-yellow-400"
      : "bg-red-500";

  return (
    <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-none ${color}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

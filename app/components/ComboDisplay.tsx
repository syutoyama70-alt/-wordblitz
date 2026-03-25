"use client";
import { useEffect, useState } from "react";

interface Props {
  combo: number;
}

export default function ComboDisplay({ combo }: Props) {
  const [visible, setVisible] = useState(false);
  const [displayCombo, setDisplayCombo] = useState(combo);

  useEffect(() => {
    if (combo >= 2) {
      setDisplayCombo(combo);
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 800);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [combo]);

  if (!visible) return null;

  const size =
    displayCombo >= 10
      ? "text-5xl"
      : displayCombo >= 5
      ? "text-4xl"
      : "text-3xl";

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
      <div
        className={`${size} font-black text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.9)] select-none`}
      >
        {displayCombo} COMBO!
      </div>
    </div>
  );
}

"use client";
import { useCallback } from "react";

type SoundType = "correct" | "wrong" | "timeout" | "combo" | "levelUp";

export function useSound() {
  const play = useCallback((type: SoundType) => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      const tone = (freq: number, start: number, dur: number, vol: number, shape: OscillatorType = "sine") => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = shape;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur + 0.05);
      };

      if (type === "correct") {
        tone(880, 0, 0.12, 0.25);
        tone(1320, 0.08, 0.15, 0.2);
      } else if (type === "wrong") {
        tone(220, 0, 0.25, 0.3, "sawtooth");
        tone(180, 0.1, 0.2, 0.2, "sawtooth");
      } else if (type === "timeout") {
        tone(440, 0, 0.08, 0.2);
        tone(330, 0.08, 0.08, 0.2);
        tone(220, 0.16, 0.2, 0.2);
      } else if (type === "combo") {
        tone(660, 0, 0.08, 0.2);
        tone(880, 0.08, 0.08, 0.2);
        tone(1100, 0.16, 0.12, 0.25);
      } else if (type === "levelUp") {
        tone(440, 0, 0.08, 0.3);
        tone(550, 0.09, 0.08, 0.3);
        tone(660, 0.18, 0.08, 0.3);
        tone(880, 0.27, 0.35, 0.4);
      }

      setTimeout(() => ctx.close(), 2000);
    } catch {
      // Web Audio API not available
    }
  }, []);

  return { play };
}

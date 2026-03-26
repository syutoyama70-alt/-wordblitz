"use client";

export interface TierData {
  tier: number;
  name: string;
  minXp: number;
  nextXp: number;
}

export const TIER_DATA: TierData[] = [
  { tier: 0, name: "ストーン",     minXp: 0,   nextXp: 30  },
  { tier: 1, name: "アイアン",     minXp: 30,  nextXp: 80  },
  { tier: 2, name: "ブロンズ",     minXp: 80,  nextXp: 160 },
  { tier: 3, name: "シルバー",     minXp: 160, nextXp: 280 },
  { tier: 4, name: "ゴールド",     minXp: 280, nextXp: 450 },
  { tier: 5, name: "プラチナ",     minXp: 450, nextXp: 700 },
  { tier: 6, name: "ダイヤモンド", minXp: 700, nextXp: Infinity },
];

export function getTierData(xp: number): TierData {
  for (let i = TIER_DATA.length - 1; i >= 0; i--) {
    if (xp >= TIER_DATA[i].minXp) return TIER_DATA[i];
  }
  return TIER_DATA[0];
}

const TIER_STYLES = [
  // 0: Stone
  {
    gradient: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
    glow: "none",
    border: "2px solid #4b5563",
    letterColor: "#9ca3af",
    sub: null,
    ring: false,
    spin: false,
    orbits: false,
  },
  // 1: Iron
  {
    gradient: "linear-gradient(135deg, #4b5563 0%, #1e293b 100%)",
    glow: "0 0 12px #64748b44",
    border: "2px solid #64748b",
    letterColor: "#e2e8f0",
    sub: null,
    ring: false,
    spin: false,
    orbits: false,
  },
  // 2: Bronze
  {
    gradient: "linear-gradient(135deg, #92400e 0%, #78350f 100%)",
    glow: "0 0 20px #f59e0b55, 0 0 40px #f59e0b22",
    border: "2px solid #f59e0b",
    letterColor: "#fcd34d",
    sub: null,
    ring: true,
    spin: false,
    orbits: false,
  },
  // 3: Silver
  {
    gradient: "linear-gradient(135deg, #334155 0%, #1e3a5f 100%)",
    glow: "0 0 28px #93c5fd66, 0 0 56px #93c5fd22",
    border: "2px solid #93c5fd",
    letterColor: "#e0f2fe",
    sub: null,
    ring: true,
    spin: false,
    orbits: false,
  },
  // 4: Gold
  {
    gradient: "linear-gradient(135deg, #d97706 0%, #92400e 50%, #7c3aed 100%)",
    glow: "0 0 36px #fbbf2477, 0 0 72px #fbbf2433",
    border: "2px solid #fbbf24",
    letterColor: "#fef9c3",
    sub: "★★★",
    ring: true,
    spin: true,
    orbits: false,
  },
  // 5: Platinum
  {
    gradient: "linear-gradient(135deg, #0891b2 0%, #7c3aed 50%, #0e7490 100%)",
    glow: "0 0 44px #22d3ee88, 0 0 88px #7c3aed44",
    border: "2px solid #22d3ee",
    letterColor: "#cffafe",
    sub: "◆◆◆",
    ring: true,
    spin: true,
    orbits: true,
  },
  // 6: Diamond
  {
    gradient: "linear-gradient(135deg, #f472b6 0%, #818cf8 33%, #22d3ee 66%, #f472b6 100%)",
    glow: "0 0 60px #f472b699, 0 0 30px #818cf888, 0 0 120px #22d3ee44",
    border: "2px solid rgba(255,255,255,0.85)",
    letterColor: "#ffffff",
    sub: "💎",
    ring: true,
    spin: true,
    orbits: true,
  },
];

const ORBIT_COLORS = [
  ["#22d3ee", "#7c3aed", "#0891b2"],   // platinum
  ["#f472b6", "#818cf8", "#22d3ee"],   // diamond
];

interface Props {
  xp: number;
  size?: "sm" | "md" | "lg";
}

export default function PlayerCrest({ xp, size = "lg" }: Props) {
  const tierData = getTierData(xp);
  const { tier } = tierData;
  const s = TIER_STYLES[tier];

  const hex = size === "lg" ? 128 : size === "md" ? 84 : 52;
  const containerSize = hex + 48;
  const fontSize = size === "lg" ? "2.8rem" : size === "md" ? "1.8rem" : "1.1rem";
  const subSize = size === "lg" ? "0.85rem" : "0.55rem";
  const orbitR = size === "lg" ? 76 : 54;
  const orbitColors = tier >= 6 ? ORBIT_COLORS[1] : ORBIT_COLORS[0];

  const hexClip = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

  return (
    <div style={{
      position: "relative",
      width: containerSize,
      height: containerSize,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Pulsing glow ring (tier 2+) */}
      {s.ring && (
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `1px solid ${s.border.replace("2px solid ", "")}44`,
          animation: "crest-pulse 2.2s ease-in-out infinite",
          boxShadow: s.glow,
        }} />
      )}

      {/* Spinning dashed ring (tier 4+) */}
      {s.spin && (
        <div style={{
          position: "absolute",
          inset: -10,
          borderRadius: "50%",
          border: `1.5px dashed ${s.border.replace("2px solid ", "")}66`,
          animation: tier >= 6 ? "crest-spin 4s linear infinite" : "crest-spin 7s linear infinite",
        }} />
      )}

      {/* Main hexagon */}
      <div style={{
        width: hex,
        height: hex,
        clipPath: hexClip,
        background: s.gradient,
        boxShadow: s.glow,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 2,
        animation: tier >= 6 ? "rainbow-shift 3s linear infinite" : undefined,
      }}>
        <span style={{
          fontSize,
          fontWeight: 900,
          color: s.letterColor,
          lineHeight: 1,
          letterSpacing: "-0.05em",
          textShadow: tier >= 3 ? `0 0 16px ${s.letterColor}` : undefined,
        }}>W</span>
        {s.sub && (
          <span style={{ fontSize: subSize, marginTop: 2, color: s.letterColor, opacity: 0.9, letterSpacing: "0.1em" }}>
            {s.sub}
          </span>
        )}
      </div>

      {/* Orbiting particles (tier 5+, lg only) */}
      {s.orbits && size === "lg" && (
        <>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: i === 0 ? 10 : 7,
              height: i === 0 ? 10 : 7,
              marginTop: i === 0 ? -5 : -3.5,
              marginLeft: i === 0 ? -5 : -3.5,
              borderRadius: "50%",
              background: orbitColors[i],
              boxShadow: `0 0 10px ${orbitColors[i]}`,
              animation: `orbit-${i + 1} ${2.8 + i * 0.4}s linear infinite`,
              animationDelay: `${-i * (3 / 3)}s`,
              zIndex: 3,
              // Override orbit radius via CSS variable workaround: use separate keyframe per radius
              // The radius is baked into the keyframes in globals.css (orbit-1/2/3 use 76px)
            }} />
          ))}
        </>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect, useCallback } from "react";
import { Word } from "@/app/types";
import PlayerCrest, { getTierData, TIER_DATA } from "./PlayerCrest";

export interface QuizSettings {
  numQuestions: number;
  direction: "en-ja" | "ja-en";
  hardMode: boolean;
  difficulty: 1 | 2 | 3;
}

interface Props {
  xp: number;
  level: number;
  wrongWords: Word[];
  bestScore: number;
  streak: number;
  onStartQuiz: (settings: QuizSettings) => void;
  onStartBattle: () => void;
  onStartReview: () => void;
  onShowRanking: () => void;
  onMasterWord: (id: number) => void;
}

const LEVEL_LABELS: Record<number, string> = { 1: "中学英語", 2: "高校英語", 3: "TOEIC" };

export default function HomeScreen({
  xp, level, wrongWords, bestScore, streak,
  onStartQuiz, onStartBattle, onStartReview, onShowRanking, onMasterWord,
}: Props) {
  const [showWrongWords, setShowWrongWords] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10);
  const [direction, setDirection] = useState<"en-ja" | "ja-en">("en-ja");
  const [hardMode, setHardMode] = useState(false);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>((level as 1 | 2 | 3) ?? 1);

  const tierData = getTierData(xp);
  const { tier, name: tierName, nextXp } = tierData;
  const tierMinXp = TIER_DATA[tier].minXp;
  const isMaxTier = tier >= TIER_DATA.length - 1;
  const tierProgress = isMaxTier ? 1 : (xp - tierMinXp) / (nextXp - tierMinXp);
  const tierXpLeft = isMaxTier ? 0 : nextXp - xp;

  // ネオン電撃スパーク
  const [bolts, setBolts] = useState<number[]>([]);
  const spawnBolt = useCallback(() => {
    const id = Date.now();
    setBolts((prev) => [...prev, id]);
    setTimeout(() => setBolts((prev) => prev.filter((b) => b !== id)), 420);
  }, []);
  useEffect(() => {
    spawnBolt();
    const interval = setInterval(spawnBolt, 3500);
    return () => clearInterval(interval);
  }, [spawnBolt]);

  const bgClass = `bg-tier-${tier}`;

  // Tier color for accents
  const tierAccentColor = [
    "#6b7280", // stone
    "#94a3b8", // iron
    "#f59e0b", // bronze
    "#93c5fd", // silver
    "#fbbf24", // gold
    "#22d3ee", // platinum
    "#f472b6", // diamond
  ][tier];

  return (
    <div className={`min-h-screen ${bgClass} text-white flex flex-col items-center px-4 py-8 transition-all duration-1000`}>

      {/* ── Title ── */}
      <div className="mb-5 text-center relative">
        {bolts.map((id) => (
          <span key={id} className="animate-bolt absolute text-yellow-300 text-2xl select-none pointer-events-none"
            style={{ top: `${Math.random() * 40 - 10}px`, left: `${20 + Math.random() * 60}%` }}>
            ⚡
          </span>
        ))}
        <h1 className="animate-neon-logo text-5xl font-black tracking-tight">WordBlitz</h1>
        <p className="text-gray-500 mt-1 text-xs tracking-widest uppercase">Speed Word Quiz</p>
      </div>

      {/* ── Streak ── */}
      {streak >= 2 && (
        <div className="w-full max-w-sm mb-4 bg-orange-950/80 border border-orange-700 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <div className="font-black text-orange-300 text-lg">{streak}日連続プレイ中！</div>
            <div className="text-xs text-orange-500">今日もやってストリークを維持しよう</div>
          </div>
        </div>
      )}

      {/* ── Player Crest Card (HERO) ── */}
      <div className="w-full max-w-sm mb-5 rounded-3xl overflow-hidden relative"
        style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${tierAccentColor}22` }}>

        {/* 上部グロー */}
        <div className="absolute inset-x-0 top-0 h-24 opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${tierAccentColor}, transparent 70%)` }} />

        <div className="flex flex-col items-center pt-6 pb-5 px-5 relative z-10">

          {/* 紋章 */}
          <PlayerCrest xp={xp} size="lg" />

          {/* ティア名 */}
          <div className="mt-3 text-center">
            <div className="text-2xl font-black tracking-wider" style={{ color: tierAccentColor }}>
              {tierName}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Lv.{level}　<span className="text-gray-400">{LEVEL_LABELS[level]}</span>
            </div>
          </div>

          {/* ティアXPバー */}
          <div className="w-full mt-4">
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <span className="text-gray-500">
                {isMaxTier ? "MAX TIER" : `次のティアまで`}
              </span>
              <span style={{ color: tierAccentColor }} className="font-semibold">
                {isMaxTier ? "✦ 頂点 ✦" : `あと ${tierXpLeft} XP`}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, tierProgress * 100)}%`,
                  background: isMaxTier
                    ? "linear-gradient(90deg, #f472b6, #818cf8, #22d3ee)"
                    : `linear-gradient(90deg, ${tierAccentColor}cc, ${tierAccentColor})`,
                  boxShadow: `0 0 8px ${tierAccentColor}88`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{tierMinXp} XP</span>
              <span>{isMaxTier ? "∞" : `${nextXp} XP`}</span>
            </div>
          </div>

          {/* 累計XP & ベストスコア */}
          <div className="w-full mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl px-3 py-2 text-center" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="text-xs text-gray-500">累計XP</div>
              <div className="font-bold text-purple-300 text-base">{xp} XP</div>
            </div>
            {bestScore > 0 && (
              <div className="rounded-xl px-3 py-2 text-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="text-xs text-gray-500">ベストスコア</div>
                <div className="font-bold text-yellow-300 text-base">{bestScore.toLocaleString()} pt</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quiz Settings ── */}
      <div className="w-full max-w-sm rounded-2xl p-4 mb-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-xs text-gray-500 mb-3 font-semibold tracking-wider">クイズ設定</div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-400 w-16 shrink-0">問題数</span>
          <div className="flex gap-2 flex-1">
            {[5, 10, 20].map((n) => (
              <button key={n} onClick={() => setNumQuestions(n)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${numQuestions === n ? "bg-indigo-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                {n}問
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-400 w-16 shrink-0">出題</span>
          <div className="flex gap-2 flex-1">
            {(["en-ja", "ja-en"] as const).map((d) => (
              <button key={d} onClick={() => setDirection(d)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${direction === d ? "bg-indigo-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                {d === "en-ja" ? "英 → 日" : "日 → 英"}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-sm text-gray-400 mb-2">難易度</div>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 1, label: "初級", sub: "中学英語", active: "from-green-600 to-emerald-500" },
              { value: 2, label: "中級", sub: "高校英語", active: "from-blue-600 to-indigo-500" },
              { value: 3, label: "上級", sub: "TOEIC",   active: "from-purple-600 to-pink-500" },
            ] as const).map((d) => (
              <button key={d.value} onClick={() => setDifficulty(d.value)}
                className={`py-2 px-1 rounded-xl text-center transition-all ${difficulty === d.value ? `bg-gradient-to-b ${d.active} text-white ring-2 ring-white/20 scale-105` : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                <div className="font-black text-base">{d.label}</div>
                <div className="text-xs opacity-80">{d.sub}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 w-16 shrink-0">モード</span>
          <button onClick={() => setHardMode((v) => !v)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${hardMode ? "bg-red-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
            {hardMode ? "❤️❤️❤️ ハード ON" : "ノーマル"}
          </button>
        </div>
        {hardMode && <p className="text-xs text-red-400 mt-2 text-center">3ミスでゲームオーバー！</p>}
      </div>

      {/* ── Menu Buttons ── */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => onStartQuiz({ numQuestions, direction, hardMode, difficulty })}
          className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all"
          style={{ boxShadow: "0 0 24px rgba(99,102,241,0.4)" }}>
          ⚡ クイズモード
        </button>

        <button onClick={onStartBattle}
          className="w-full py-5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all">
          ⚔️ 対戦モード
        </button>

        <button onClick={onShowRanking}
          className="w-full py-4 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all">
          🏆 ランキング
        </button>

        {wrongWords.length > 0 && (
          <div className="w-full">
            <button onClick={onStartReview}
              className="w-full py-4 bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-500 hover:to-green-500 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all">
              📚 復習モード
              <span className="ml-2 text-sm font-normal opacity-80">({wrongWords.length}単語)</span>
            </button>
            <button onClick={() => setShowWrongWords((v) => !v)}
              className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-300 transition">
              {showWrongWords ? "▲ リストを閉じる" : "▼ 単語リストを管理"}
            </button>
            {showWrongWords && (
              <div className="rounded-xl p-3 space-y-2 max-h-60 overflow-y-auto" style={{ background: "rgba(255,255,255,0.04)" }}>
                {wrongWords.map((w) => (
                  <div key={w.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-white font-semibold">{w.english}</span>
                      <span className="text-gray-400 ml-2">{w.japanese}</span>
                    </div>
                    <button onClick={() => onMasterWord(w.id)}
                      className="ml-2 px-2 py-1 text-xs bg-green-800 hover:bg-green-700 rounded-lg text-green-300 transition shrink-0">
                      習得済み ✓
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {wrongWords.length === 0 && (
        <p className="text-gray-700 text-sm mt-4 text-center">
          間違えた単語がたまると復習モードが解放されます
        </p>
      )}

      <div className="w-full max-w-sm rounded-2xl p-4 mt-6 text-sm text-gray-500 space-y-1"
        style={{ background: "rgba(255,255,255,0.03)" }}>
        <div className="font-semibold text-gray-400 mb-2">遊び方</div>
        <div>⚡ 2秒以内に正しい意味を4択から選択</div>
        <div>🔥 連続正解でコンボボーナス獲得</div>
        <div>⬆️ XPを貯めてティアアップ</div>
        <div>❤️ ハードモードは3ミスで終了</div>
      </div>
    </div>
  );
}

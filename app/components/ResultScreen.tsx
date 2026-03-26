"use client";
import { useState } from "react";
import { Word } from "@/app/types";

interface Props {
  score: number;
  xp: number;
  level: number;
  maxCombo: number;
  correctCount: number;
  wrongCount: number;
  wrongWords: Word[];
  bestScore: number;
  isNewRecord: boolean;
  difficulty?: 1 | 2 | 3;
  onRestart: () => void;
  onReview: () => void;
  onHome: () => void;
  onMasterWord: (id: number) => void;
}

function getEigoRank(accuracy: number) {
  if (accuracy >= 95) return { title: "神", sub: "英語の神様レベル", percentile: 3, bg: "from-yellow-500 via-orange-500 to-red-500", glow: "drop-shadow-[0_0_24px_rgba(251,191,36,0.8)]" };
  if (accuracy >= 85) return { title: "天才", sub: "ネイティブ級の実力", percentile: 8, bg: "from-purple-500 via-pink-500 to-fuchsia-500", glow: "drop-shadow-[0_0_24px_rgba(168,85,247,0.8)]" };
  if (accuracy >= 75) return { title: "秀才", sub: "かなりの実力者", percentile: 20, bg: "from-blue-500 via-cyan-500 to-sky-500", glow: "drop-shadow-[0_0_24px_rgba(59,130,246,0.8)]" };
  if (accuracy >= 60) return { title: "実力者", sub: "平均を大きく超える", percentile: 40, bg: "from-green-500 via-emerald-500 to-teal-500", glow: "drop-shadow-[0_0_24px_rgba(34,197,94,0.8)]" };
  if (accuracy >= 45) return { title: "修行中", sub: "まだまだ伸びしろあり！", percentile: 62, bg: "from-slate-500 via-gray-500 to-zinc-600", glow: "" };
  return { title: "ビギナー", sub: "ここから始まる英語の旅", percentile: 82, bg: "from-gray-600 via-gray-700 to-gray-800", glow: "" };
}

function getComparisons(accuracy: number, difficulty: 1 | 2 | 3) {
  const jh = accuracy >= 90 ? "上位2%" : accuracy >= 75 ? "上位10%" : accuracy >= 60 ? "上位30%" : accuracy >= 45 ? "上位55%" : "下位40%";
  const hs = accuracy >= 90 ? "上位8%" : accuracy >= 75 ? "上位22%" : accuracy >= 60 ? "上位45%" : accuracy >= 45 ? "平均くらい" : "下位35%";
  const uni = accuracy >= 90 ? "上位15%" : accuracy >= 75 ? "上位35%" : accuracy >= 60 ? "上位55%" : "平均以下";
  const work = accuracy >= 85 ? "上位15%" : accuracy >= 70 ? "上位35%" : "平均くらい";

  if (difficulty === 1) return [
    { emoji: "🏫", label: "中学生の中では", value: jh },
    { emoji: "🎓", label: "高校生の中では", value: hs },
  ];
  if (difficulty === 2) return [
    { emoji: "🎓", label: "高校生の中では", value: hs },
    { emoji: "🏛️", label: "大学生の中では", value: uni },
  ];
  return [
    { emoji: "🏛️", label: "大学生の中では", value: uni },
    { emoji: "💼", label: "社会人の中では", value: work },
  ];
}

export default function ResultScreen({
  score, xp, level, maxCombo, correctCount, wrongCount, wrongWords,
  bestScore, isNewRecord, difficulty = 1,
  onRestart, onReview, onHome, onMasterWord,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [showWrongWords, setShowWrongWords] = useState(false);

  const total = correctCount + wrongCount;
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const rank = getEigoRank(accuracy);
  const comparisons = getComparisons(accuracy, difficulty);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareText = `WordBlitzで英語力テストしたら「${rank.title}」判定だった！✨\n上位${rank.percentile}%らしい🔥\n\n正解率: ${accuracy}%\nスコア: ${score.toLocaleString()}pt\n\nあなたも挑戦してみて👇\n${appUrl}\n#WordBlitz #英語`;
  const challengeText = `【挑戦状】\nWordBlitzで英語力テストしてみて！\n俺は「${rank.title}」判定（上位${rank.percentile}%）だったけど、お前は超えられる？🔥\n${appUrl}`;

  const handleShare = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleChallenge = async () => {
    try {
      await navigator.clipboard.writeText(challengeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-8">

      {/* NEW RECORD */}
      {isNewRecord && (
        <div className="mb-5 px-6 py-2 bg-yellow-400 text-gray-900 rounded-full font-black text-lg animate-bounce shadow-lg">
          🎉 NEW RECORD!
        </div>
      )}

      {/* ── メイン判定カード ── */}
      <div className={`w-full max-w-sm bg-gradient-to-br ${rank.bg} rounded-3xl p-6 mb-4 text-center shadow-2xl relative overflow-hidden`}>
        {/* 背景装飾 */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_0%,white,transparent_70%)]" />

        <div className="text-sm font-semibold text-white/70 mb-1 tracking-wider">あなたの英語力</div>
        <div className={`text-8xl font-black text-white mb-1 ${rank.glow}`}>
          {rank.title}
        </div>
        <div className="text-white/80 text-sm mb-4">{rank.sub}</div>

        <div className="inline-flex items-center gap-2 bg-black/30 rounded-full px-5 py-2.5 backdrop-blur-sm">
          <span className="text-xl">🏆</span>
          <span className="text-2xl font-black text-white">上位 {rank.percentile}%</span>
        </div>
      </div>

      {/* ── 比較カード ── */}
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-4 mb-4">
        <div className="text-xs text-gray-400 font-semibold mb-3 text-center tracking-wider">他の人と比べると...</div>
        <div className="space-y-2">
          {comparisons.map((c) => (
            <div key={c.label} className="flex items-center justify-between bg-gray-700/60 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{c.emoji}</span>
                <span className="text-sm text-gray-300">{c.label}</span>
              </div>
              <span className="font-black text-yellow-300 text-base">{c.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── シェアボタン ── */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={handleShare}
          className="py-4 bg-black hover:bg-gray-900 border border-gray-600 hover:border-gray-400 rounded-2xl font-bold text-sm transition active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="text-lg font-black">𝕏</span>
          <span>でシェア</span>
        </button>
        <button
          onClick={handleChallenge}
          className={`py-4 rounded-2xl font-bold text-sm transition active:scale-95 flex items-center justify-center gap-1.5 ${
            copied
              ? "bg-green-600 text-white"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
          }`}
        >
          {copied ? (
            <><span>✓</span><span>コピーしました!</span></>
          ) : (
            <><span>👥</span><span>友達に挑戦</span></>
          )}
        </button>
      </div>
      {copied && (
        <p className="text-xs text-gray-400 mb-3 -mt-1">挑戦状をクリップボードにコピーしました</p>
      )}

      {/* ── スタッツ ── */}
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-700/50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">スコア</div>
            <div className="font-black text-yellow-300 text-xl">{score.toLocaleString()}<span className="text-xs font-normal">pt</span></div>
            {!isNewRecord && bestScore > 0 && <div className="text-xs text-gray-500 mt-0.5">ベスト {bestScore.toLocaleString()}</div>}
          </div>
          <div className="bg-gray-700/50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">正解率</div>
            <div className="font-black text-white text-xl">{accuracy}<span className="text-xs font-normal">%</span></div>
            <div className="text-xs text-gray-500 mt-0.5">{correctCount}/{total}問</div>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">最大コンボ</div>
            <div className="font-black text-orange-400 text-xl">{maxCombo}<span className="text-xs font-normal">連続</span></div>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">累計XP</div>
            <div className="font-black text-purple-300 text-xl">{xp}<span className="text-xs font-normal">XP</span></div>
          </div>
        </div>
      </div>

      {/* ── 間違えた単語 ── */}
      {wrongWords.length > 0 && (
        <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-4 mb-4">
          <button
            onClick={() => setShowWrongWords((v) => !v)}
            className="w-full flex justify-between items-center text-sm font-semibold text-red-400"
          >
            <span>間違えた単語 ({wrongWords.length}個)</span>
            <span>{showWrongWords ? "▲" : "▼"}</span>
          </button>
          {showWrongWords && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {wrongWords.map((w) => (
                <div key={w.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-white font-semibold">{w.english}</span>
                    <span className="text-gray-400 ml-2">{w.japanese}</span>
                  </div>
                  <button
                    onClick={() => onMasterWord(w.id)}
                    className="ml-2 px-2 py-1 text-xs bg-green-700 hover:bg-green-600 rounded-lg text-green-200 transition shrink-0"
                  >
                    習得済み ✓
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── アクションボタン ── */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={onRestart}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold text-lg transition active:scale-95"
        >
          ⚡ もう一度プレイ
        </button>
        {wrongWords.length > 0 && (
          <button
            onClick={onReview}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 rounded-xl font-bold text-lg transition active:scale-95"
          >
            📚 間違えた単語を復習
          </button>
        )}
        <button
          onClick={onHome}
          className="w-full py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-lg transition active:scale-95"
        >
          ホームへ
        </button>
      </div>
    </div>
  );
}

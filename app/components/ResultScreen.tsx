"use client";
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
  onRestart: () => void;
  onReview: () => void;
  onHome: () => void;
  onMasterWord: (id: number) => void;
}

export default function ResultScreen({
  score,
  xp,
  level,
  maxCombo,
  correctCount,
  wrongCount,
  wrongWords,
  bestScore,
  isNewRecord,
  onRestart,
  onReview,
  onHome,
  onMasterWord,
}: Props) {
  const total = correctCount + wrongCount;
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const rank =
    accuracy >= 90 ? "S" : accuracy >= 70 ? "A" : accuracy >= 50 ? "B" : "C";
  const rankColor =
    rank === "S"
      ? "text-yellow-300"
      : rank === "A"
      ? "text-green-400"
      : rank === "B"
      ? "text-blue-400"
      : "text-gray-400";

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4 py-10">
      <h1 className="text-3xl font-black mb-4">結果</h1>

      {/* NEW RECORD */}
      {isNewRecord && (
        <div className="mb-4 px-6 py-2 bg-yellow-400 text-gray-900 rounded-full font-black text-lg animate-bounce shadow-lg">
          🎉 NEW RECORD!
        </div>
      )}

      {/* Rank */}
      <div className={`text-8xl font-black mb-4 drop-shadow-lg ${rankColor}`}>{rank}</div>

      {/* Stats */}
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-6 mb-6 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">スコア</span>
          <div className="text-right">
            <span className="font-bold text-yellow-300">{score.toLocaleString()} pt</span>
            {!isNewRecord && bestScore > 0 && (
              <div className="text-xs text-gray-500">ベスト: {bestScore.toLocaleString()} pt</div>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">正解率</span>
          <span className="font-bold">{accuracy}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">正解 / 問題数</span>
          <span className="font-bold">{correctCount} / {total}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">最大コンボ</span>
          <span className="font-bold text-orange-400">{maxCombo} COMBO</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">現在のレベル</span>
          <span className="font-bold text-purple-400">Lv.{level}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">累計XP</span>
          <span className="font-bold text-purple-300">{xp} XP</span>
        </div>
      </div>

      {/* Wrong words with mastered button */}
      {wrongWords.length > 0 && (
        <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-4 mb-6">
          <div className="text-sm text-red-400 font-semibold mb-3">
            間違えた単語 ({wrongWords.length}個)
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
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
        </div>
      )}

      {/* Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={onRestart}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg transition"
        >
          もう一度プレイ
        </button>
        {wrongWords.length > 0 && (
          <button
            onClick={onReview}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 rounded-xl font-bold text-lg transition"
          >
            間違えた単語を復習
          </button>
        )}
        <button
          onClick={onHome}
          className="w-full py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-lg transition"
        >
          ホームへ
        </button>
      </div>
    </div>
  );
}

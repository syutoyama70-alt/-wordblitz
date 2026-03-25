"use client";
import { useState } from "react";
import { Word } from "@/app/types";

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

const XP_PER_LEVEL = 100;
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
  const xpInLevel = xp % XP_PER_LEVEL;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-10">
      {/* Title */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          WordBlitz
        </h1>
        <p className="text-gray-400 mt-1 text-sm">1秒英単語クイズ</p>
      </div>

      {/* Streak バナー */}
      {streak >= 2 && (
        <div className="w-full max-w-sm mb-4 bg-orange-950 border border-orange-600 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <div className="font-black text-orange-300 text-lg">{streak}日連続プレイ中！</div>
            <div className="text-xs text-orange-400">今日もやってストリークを維持しよう</div>
          </div>
        </div>
      )}

      {/* Level Card */}
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-5 mb-5 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-xs text-gray-400">現在のレベル</div>
            <div className="text-2xl font-black">
              Lv.{level}
              <span className="text-purple-400 text-base font-semibold ml-2">{LEVEL_LABELS[level]}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">累計XP</div>
            <div className="text-lg font-bold text-purple-300">{xp} XP</div>
          </div>
        </div>
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-500"
            style={{ width: `${xpInLevel}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1 text-right">{xpInLevel}/{XP_PER_LEVEL} XP</div>
        {bestScore > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
            <span className="text-xs text-gray-400">ベストスコア</span>
            <span className="text-yellow-300 font-bold">{bestScore.toLocaleString()} pt</span>
          </div>
        )}
      </div>

      {/* Quiz Settings */}
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-4 mb-5">
        <div className="text-xs text-gray-400 mb-3 font-semibold">クイズ設定</div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-300 w-16 shrink-0">問題数</span>
          <div className="flex gap-2 flex-1">
            {[5, 10, 20].map((n) => (
              <button key={n} onClick={() => setNumQuestions(n)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${numQuestions === n ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-400 hover:bg-gray-600"}`}>
                {n}問
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-300 w-16 shrink-0">出題</span>
          <div className="flex gap-2 flex-1">
            {(["en-ja", "ja-en"] as const).map((d) => (
              <button key={d} onClick={() => setDirection(d)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${direction === d ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-400 hover:bg-gray-600"}`}>
                {d === "en-ja" ? "英 → 日" : "日 → 英"}
              </button>
            ))}
          </div>
        </div>

        {/* 難易度 */}
        <div className="mb-3">
          <div className="text-sm text-gray-300 mb-2">難易度</div>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 1, label: "初級", sub: "中学英語", color: "from-green-600 to-emerald-500", activeColor: "from-green-500 to-emerald-400" },
              { value: 2, label: "中級", sub: "高校英語", color: "from-blue-600 to-indigo-500", activeColor: "from-blue-500 to-indigo-400" },
              { value: 3, label: "上級", sub: "TOEIC", color: "from-purple-600 to-pink-500", activeColor: "from-purple-500 to-pink-400" },
            ] as const).map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`py-2 px-1 rounded-xl text-center transition-all ${
                  difficulty === d.value
                    ? `bg-gradient-to-b ${d.activeColor} text-white ring-2 ring-white/30 scale-105`
                    : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                }`}
              >
                <div className="font-black text-base">{d.label}</div>
                <div className="text-xs opacity-80">{d.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ハードモード */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300 w-16 shrink-0">モード</span>
          <button
            onClick={() => setHardMode((v) => !v)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${hardMode ? "bg-red-600 text-white" : "bg-gray-700 text-gray-400 hover:bg-gray-600"}`}
          >
            {hardMode ? "❤️❤️❤️ ハード ON" : "ノーマル"}
          </button>
        </div>
        {hardMode && (
          <p className="text-xs text-red-400 mt-2 text-center">3ミスでゲームオーバー！</p>
        )}
      </div>

      {/* Menu Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => onStartQuiz({ numQuestions, direction, hardMode, difficulty })}
          className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all"
        >
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
              className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-200 transition">
              {showWrongWords ? "▲ リストを閉じる" : "▼ 単語リストを管理"}
            </button>
            {showWrongWords && (
              <div className="bg-gray-800 rounded-xl p-3 space-y-2 max-h-60 overflow-y-auto">
                {wrongWords.map((w) => (
                  <div key={w.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-white font-semibold">{w.english}</span>
                      <span className="text-gray-400 ml-2">{w.japanese}</span>
                    </div>
                    <button onClick={() => onMasterWord(w.id)}
                      className="ml-2 px-2 py-1 text-xs bg-green-700 hover:bg-green-600 rounded-lg text-green-200 transition shrink-0">
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
        <p className="text-gray-600 text-sm mt-4 text-center">
          間違えた単語がたまると復習モードが解放されます
        </p>
      )}

      <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-4 mt-6 text-sm text-gray-400 space-y-1">
        <div className="font-semibold text-gray-300 mb-2">遊び方</div>
        <div>⚡ 1秒以内に正しい意味を4択から選択</div>
        <div>🔥 連続正解でコンボボーナス獲得</div>
        <div>⬆️ XPを貯めてレベルアップ</div>
        <div>❤️ ハードモードは3ミスで終了</div>
      </div>
    </div>
  );
}

"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { Word, QuizResult } from "@/app/types";
import { getWordsByLevel, getRandomWrongOptions } from "@/app/data/words";
import { useSound } from "@/app/hooks/useSound";
import CountdownBar from "./CountdownBar";

const BATTLE_DURATION = 1500;
const CPU_NAMES = ["TanakaTOEIC", "HanakoChan", "Eigo_Master", "QuizKing99"];
const CPU_ACCURACY = [0.6, 0.7, 0.8, 0.9];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface Props {
  level: number;
  initialXp: number;
  onEnd: (won: boolean, score: number, xpGained: number) => void;
  onHome: () => void;
}

export default function BattleGame({ level, initialXp, onEnd, onHome }: Props) {
  const { play } = useSound();
  const [phase, setPhase] = useState<"matching" | "playing" | "result">("matching");
  const [cpuName] = useState(CPU_NAMES[Math.floor(Math.random() * CPU_NAMES.length)]);
  const [cpuAccuracy] = useState(CPU_ACCURACY[Math.floor(Math.random() * CPU_ACCURACY.length)]);

  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [options, setOptions] = useState<Word[]>([]);
  const [result, setResult] = useState<QuizResult>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [timerKey, setTimerKey] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [playerCorrect, setPlayerCorrect] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [cpuAnswered, setCpuAnswered] = useState(false);
  const [cpuCorrect, setCpuCorrect] = useState<boolean | null>(null);

  const TOTAL_Q = 5;
  const questionStartRef = useRef(Date.now());
  // Refs to read latest score/correct in result phase (avoid stale closure)
  const playerScoreRef = useRef(0);
  const playerCorrectRef = useRef(0);

  // Suppress unused warning — initialXp is passed for future use
  void initialXp;

  const nextQuestion = useCallback(() => {
    const pool = getWordsByLevel(level);
    const word = pool[Math.floor(Math.random() * pool.length)];
    const wrong = getRandomWrongOptions(word, pool);
    setCurrentWord(word);
    setOptions(shuffle([word, ...wrong]));
    setResult(null);
    setSelectedId(null);
    setCpuAnswered(false);
    setCpuCorrect(null);
    questionStartRef.current = Date.now();
    setTimerKey((k) => k + 1);
    setTimerRunning(true);
  }, [level]);

  useEffect(() => {
    // マッチング演出
    setTimeout(() => {
      setPhase("playing");
      nextQuestion();
    }, 2000);
  }, []); // eslint-disable-line

  // CPU が独自にタイミングで回答
  useEffect(() => {
    if (phase !== "playing" || result !== null || !currentWord) return;
    const delay = 300 + Math.random() * 1000;
    const t = setTimeout(() => {
      const correct = Math.random() < cpuAccuracy;
      setCpuAnswered(true);
      setCpuCorrect(correct);
      if (correct) setCpuScore((s) => s + 100);
    }, delay);
    return () => clearTimeout(t);
  }, [currentWord, phase, result, cpuAccuracy]);

  const proceed = useCallback(
    (isCorrect: boolean) => {
      const elapsed = Date.now() - questionStartRef.current;
      const ratio = Math.max(0, 1 - elapsed / BATTLE_DURATION);
      if (isCorrect) {
        const gained = Math.floor(100 + ratio * 100);
        setPlayerScore((s) => { playerScoreRef.current = s + gained; return s + gained; });
        setPlayerCorrect((c) => { playerCorrectRef.current = c + 1; return c + 1; });
      }

      const nextQ = questionCount + 1;
      setQuestionCount(nextQ);

      setTimeout(() => {
        if (nextQ >= TOTAL_Q) {
          setPhase("result");
          setTimerRunning(false);
        } else {
          nextQuestion();
        }
      }, 900);
    },
    [questionCount, nextQuestion]
  );

  const handleAnswer = useCallback(
    (word: Word | null, isTimeout = false) => {
      if (result !== null || !currentWord) return;
      setTimerRunning(false);
      const isCorrect = !isTimeout && word?.id === currentWord.id;
      setResult(isTimeout ? "timeout" : isCorrect ? "correct" : "wrong");
      setSelectedId(word?.id ?? null);
      play(isTimeout ? "timeout" : isCorrect ? "correct" : "wrong");
      proceed(isCorrect);
    },
    [result, currentWord, proceed, play]
  );

  const handleTimeout = useCallback(() => handleAnswer(null, true), [handleAnswer]);

  // Phase: matching
  if (phase === "matching") {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <div className="text-2xl font-bold mb-8 animate-pulse">対戦相手を探しています...</div>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-black">
              YOU
            </div>
            <div className="text-sm mt-2 text-gray-400">あなた</div>
          </div>
          <div className="text-3xl font-black text-yellow-300 animate-bounce">VS</div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-2xl animate-spin">
              ?
            </div>
            <div className="text-sm mt-2 text-gray-400">マッチング中</div>
          </div>
        </div>
      </div>
    );
  }

  // Phase: result
  if (phase === "result") {
    const won = playerScoreRef.current > cpuScore;
    const xpGained = playerCorrectRef.current * 10;
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4">
        <div className={`text-5xl font-black mb-6 ${won ? "text-yellow-300" : "text-red-400"}`}>
          {won ? "🏆 勝利!" : "😢 敗北..."}
        </div>
        <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-6 mb-4 space-y-3">
          <div className="flex justify-between">
            <span>あなた</span>
            <span className="font-bold text-yellow-300">{playerScoreRef.current} pt</span>
          </div>
          <div className="flex justify-between">
            <span>{cpuName}</span>
            <span className="font-bold text-red-400">{cpuScore} pt</span>
          </div>
        </div>
        <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-4 mb-6 text-center">
          <div className="text-sm text-gray-400">獲得XP</div>
          <div className="text-2xl font-bold text-purple-300">+{xpGained} XP</div>
        </div>
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => onEnd(won, playerScoreRef.current, xpGained)}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg transition"
          >
            もう一度対戦
          </button>
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

  // Phase: playing
  if (!currentWord) return null;
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-6">
      {/* Scoreboard */}
      <div className="w-full max-w-md flex justify-between items-center mb-4">
        <div className="text-center">
          <div className="text-xs text-gray-400">あなた</div>
          <div className="font-bold text-yellow-300">{playerScore}</div>
        </div>
        <div className="text-gray-500 text-sm">{questionCount + 1}/{TOTAL_Q}</div>
        <div className="text-center">
          <div className="text-xs text-gray-400">{cpuName}</div>
          <div className="font-bold text-red-400">{cpuScore}</div>
          <div className="text-xs text-gray-500">
            {cpuAnswered ? (cpuCorrect ? "✓ 回答済" : "✗ 誤答") : "考え中..."}
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="w-full max-w-md mb-6">
        <CountdownBar key={timerKey} duration={BATTLE_DURATION} onTimeout={handleTimeout} running={timerRunning} />
      </div>

      {/* Question */}
      <div
        className={`w-full max-w-md bg-gray-800 rounded-2xl p-8 mb-6 text-center shadow-xl
          ${result === "correct" ? "ring-4 ring-green-400" : ""}
          ${result === "wrong" || result === "timeout" ? "ring-4 ring-red-500" : ""}
        `}
      >
        {result === "correct" && <div className="text-green-400 font-bold mb-2">✓ 正解!</div>}
        {(result === "wrong" || result === "timeout") && (
          <div className="text-red-400 font-bold mb-2">
            {result === "timeout" ? "⏱ タイムオーバー!" : "✗ 不正解"}
          </div>
        )}
        <div className="text-4xl font-black">{currentWord.english}</div>
        {result !== null && (
          <div className="mt-3 text-green-300 font-semibold">正解: {currentWord.japanese}</div>
        )}
      </div>

      {/* Options */}
      <div className="w-full max-w-md grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isCorrect = opt.id === currentWord.id;
          const isSelected = opt.id === selectedId;
          let cls = "w-full py-4 px-3 rounded-xl font-semibold text-base transition-all duration-200 ";
          if (result === null) {
            cls += "bg-gray-700 hover:bg-gray-600 active:scale-95 cursor-pointer";
          } else if (isCorrect) {
            cls += "bg-green-500 text-white scale-105";
          } else if (isSelected) {
            cls += "bg-red-500 text-white";
          } else {
            cls += "bg-gray-700 opacity-40";
          }
          return (
            <button key={opt.id} className={cls} onClick={() => result === null && handleAnswer(opt)} disabled={result !== null}>
              {opt.japanese}
            </button>
          );
        })}
      </div>
    </div>
  );
}

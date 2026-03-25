"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { Word, QuizResult } from "@/app/types";
import { getWordsByLevel, getWordsByDifficulty, getRandomWrongOptions } from "@/app/data/words";
import { useSound } from "@/app/hooks/useSound";
import CountdownBar from "./CountdownBar";
import ComboDisplay from "./ComboDisplay";

const QUIZ_DURATION = 2000;
const REVEAL_DURATION = 1500;
const XP_PER_LEVEL = 100;
const MAX_LIVES = 3;

function calcXpForAnswer(timeRatio: number, combo: number): number {
  return 10 + Math.floor(timeRatio * 10) + (combo >= 2 ? combo * 2 : 0);
}

function calcScore(timeRatio: number, combo: number): number {
  return 100 + Math.floor(timeRatio * 100) + (combo >= 2 ? combo * 50 : 0);
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface FloatingScore { id: number; value: number; }

interface Props {
  onGameEnd: (state: {
    score: number; xp: number; level: number; maxCombo: number;
    wrongWords: Word[]; correctCount: number; wrongCount: number;
  }) => void;
  initialLevel?: number;
  initialXp?: number;
  reviewWords?: Word[];
  numQuestions?: number;
  direction?: "en-ja" | "ja-en";
  hardMode?: boolean;
  boostedWords?: Word[];
  difficulty?: 1 | 2 | 3;
}

export default function QuizGame({
  onGameEnd, initialLevel = 1, initialXp = 0,
  reviewWords, numQuestions = 10, direction = "en-ja",
  hardMode = false, boostedWords = [], difficulty,
}: Props) {
  const { play } = useSound();

  const [level, setLevel] = useState(initialLevel);
  const [xp, setXp] = useState(initialXp);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [lives, setLives] = useState(hardMode ? MAX_LIVES : Infinity);

  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [options, setOptions] = useState<Word[]>([]);
  const [result, setResult] = useState<QuizResult>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [timerKey, setTimerKey] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [levelUpAnim, setLevelUpAnim] = useState(false);
  const [gameOverAnim, setGameOverAnim] = useState(false);

  const [flashColor, setFlashColor] = useState<"green" | "red" | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [shakeQuestion, setShakeQuestion] = useState(false);
  const floatingIdRef = useRef(0);

  // Reveal phase progress bar
  const [revealProgress, setRevealProgress] = useState(0); // 0→1
  const revealRafRef = useRef<number | null>(null);
  const revealStartRef = useRef<number>(0);

  const questionStartRef = useRef<number>(Date.now());
  const latestRef = useRef({ level, xp, score, combo, maxCombo, wrongWords, correctCount, wrongCount, lives });
  latestRef.current = { level, xp, score, combo, maxCombo, wrongWords, correctCount, wrongCount, lives };

  const totalQuestions = reviewWords ? reviewWords.length : numQuestions;

  const startRevealCountdown = useCallback(() => {
    if (revealRafRef.current) cancelAnimationFrame(revealRafRef.current);
    revealStartRef.current = Date.now();
    setRevealProgress(0);
    const tick = () => {
      const elapsed = Date.now() - revealStartRef.current;
      const p = Math.min(1, elapsed / REVEAL_DURATION);
      setRevealProgress(p);
      if (p < 1) revealRafRef.current = requestAnimationFrame(tick);
    };
    revealRafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => () => { if (revealRafRef.current) cancelAnimationFrame(revealRafRef.current); }, []);

  const nextQuestion = useCallback((count: number, lvl: number) => {
    setRevealProgress(0);
    if (revealRafRef.current) { cancelAnimationFrame(revealRafRef.current); revealRafRef.current = null; }

    const poolLevel = difficulty ?? lvl;
    let pool: Word[];
    if (difficulty) {
      pool = reviewWords ?? getWordsByDifficulty(difficulty);
    } else {
      pool = reviewWords ?? getWordsByLevel(poolLevel);
    }

    if (!reviewWords && boostedWords.length > 0) {
      const valid = boostedWords.filter((w) => pool.find((p) => p.id === w.id));
      if (valid.length > 0) pool = [...pool, ...valid, ...valid];
    }
    const word = pool[Math.floor(Math.random() * pool.length)];
    const wrongPool = difficulty ? getWordsByDifficulty(difficulty) : getWordsByLevel(Math.max(lvl, 1));
    const wrongOptions = getRandomWrongOptions(word, wrongPool);
    setCurrentWord(word);
    setOptions(shuffle([word, ...wrongOptions]));
    setResult(null);
    setSelectedId(null);
    questionStartRef.current = Date.now();
    setTimerKey((k) => k + 1);
    setTimerRunning(true);
  }, [reviewWords, boostedWords, difficulty]);

  useEffect(() => { nextQuestion(0, initialLevel); }, []); // eslint-disable-line

  const triggerFlash = useCallback((color: "green" | "red") => {
    setFlashColor(color);
    setTimeout(() => setFlashColor(null), 250);
  }, []);

  const addFloatingScore = useCallback((value: number) => {
    const id = ++floatingIdRef.current;
    setFloatingScores((prev) => [...prev, { id, value }]);
    setTimeout(() => setFloatingScores((prev) => prev.filter((s) => s.id !== id)), 900);
  }, []);

  const handleAnswer = useCallback(
    (word: Word | null, isTimeout = false) => {
      if (result !== null || !currentWord) return;
      setTimerRunning(false);

      const elapsed = Date.now() - questionStartRef.current;
      const ratio = Math.max(0, 1 - elapsed / QUIZ_DURATION);
      const isCorrect = !isTimeout && word?.id === currentWord.id;

      setResult(isTimeout ? "timeout" : isCorrect ? "correct" : "wrong");
      setSelectedId(word?.id ?? null);

      const cur = latestRef.current;
      let newLevel = cur.level, newXp = cur.xp, newScore = cur.score;
      let newCombo = cur.combo, newMaxCombo = cur.maxCombo;
      let newWrongWords = cur.wrongWords, newCorrect = cur.correctCount, newWrong = cur.wrongCount;
      let newLives = cur.lives;

      if (isCorrect) {
        newCombo = cur.combo + 1;
        newMaxCombo = Math.max(cur.maxCombo, newCombo);
        const gainedXp = calcXpForAnswer(ratio, newCombo);
        const gainedScore = calcScore(ratio, newCombo);
        newXp = cur.xp + gainedXp;
        newScore = cur.score + gainedScore;
        newLevel = Math.min(3, Math.floor(newXp / XP_PER_LEVEL) + 1) as 1 | 2 | 3;
        newCorrect = cur.correctCount + 1;

        setCombo(newCombo); setMaxCombo(newMaxCombo);
        setXp(newXp); setScore(newScore); setCorrectCount(newCorrect);
        triggerFlash("green");
        addFloatingScore(gainedScore);
        play(newCombo >= 2 ? "combo" : "correct");

        if (newLevel > cur.level) {
          setLevel(newLevel);
          setLevelUpAnim(true);
          play("levelUp");
          setTimeout(() => setLevelUpAnim(false), 1500);
        }
      } else {
        newCombo = 0;
        newWrong = cur.wrongCount + 1;
        if (!cur.wrongWords.find((x) => x.id === currentWord.id)) {
          newWrongWords = [...cur.wrongWords, currentWord];
        }
        if (hardMode) newLives = cur.lives - 1;
        setCombo(0); setWrongCount(newWrong); setWrongWords(newWrongWords);
        if (hardMode) setLives(newLives);
        triggerFlash("red");
        setShakeQuestion(true);
        setTimeout(() => setShakeQuestion(false), 450);
        play(isTimeout ? "timeout" : "wrong");
      }

      startRevealCountdown();

      const nextCount = questionCount + 1;
      setQuestionCount(nextCount);

      const isGameOver = hardMode && newLives <= 0;

      if (isGameOver) {
        setGameOverAnim(true);
        setTimeout(() => {
          onGameEnd({ score: newScore, xp: newXp, level: newLevel, maxCombo: newMaxCombo, wrongWords: newWrongWords, correctCount: newCorrect, wrongCount: newWrong });
        }, 1200);
      } else {
        setTimeout(() => {
          if (nextCount >= totalQuestions) {
            onGameEnd({ score: newScore, xp: newXp, level: newLevel, maxCombo: newMaxCombo, wrongWords: newWrongWords, correctCount: newCorrect, wrongCount: newWrong });
          } else {
            nextQuestion(nextCount, newLevel);
          }
        }, REVEAL_DURATION);
      }
    },
    [result, currentWord, questionCount, totalQuestions, hardMode, nextQuestion, onGameEnd, play, triggerFlash, addFloatingScore, startRevealCountdown]
  );

  const handleTimeout = useCallback(() => handleAnswer(null, true), [handleAnswer]);

  if (!currentWord) return null;

  const levelLabels: Record<number, string> = { 1: "中学英語", 2: "高校英語", 3: "TOEIC" };
  const questionText = direction === "en-ja" ? currentWord.english : currentWord.japanese;
  const correctAnswerText = direction === "en-ja" ? currentWord.japanese : currentWord.english;
  const questionHint = direction === "en-ja" ? "この単語の意味は？" : "英語にすると？";
  const optionLabel = (w: Word) => direction === "en-ja" ? w.japanese : w.english;

  const livesLeft = hardMode ? Math.max(0, lives === Infinity ? MAX_LIVES : lives) : 0;

  const bgClass = xp >= 200 ? "bg-level-max" : xp >= 100 ? "bg-level-3" : xp >= 50 ? "bg-level-2" : "bg-level-1";

  return (
    <div className={`min-h-screen ${bgClass} text-white flex flex-col items-center px-4 py-6 relative overflow-hidden transition-all duration-1000`}>

      {/* フラッシュ */}
      {flashColor && (
        <div className="fixed inset-0 pointer-events-none z-40"
          style={{ backgroundColor: flashColor === "green" ? "rgba(74,222,128,0.25)" : "rgba(239,68,68,0.3)" }} />
      )}

      {/* ゲームオーバー */}
      {gameOverAnim && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none bg-black/60">
          <div className="text-7xl font-black text-red-400 animate-bounce drop-shadow-[0_0_30px_rgba(239,68,68,1)]">
            GAME OVER
          </div>
        </div>
      )}

      {/* 浮上スコア */}
      {floatingScores.map((fs) => (
        <div key={fs.id} className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-float-up">
          <span className="text-3xl font-black text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]">+{fs.value}</span>
        </div>
      ))}

      <ComboDisplay combo={combo} />

      {levelUpAnim && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-6xl font-black text-yellow-300 animate-ping drop-shadow-[0_0_20px_rgba(253,224,71,1)]">LEVEL UP!</div>
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-md mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-400">
            Lv.{level} <span className="text-purple-400">{levelLabels[level]}</span>
          </div>
          <div className="flex items-center gap-2">
            {hardMode && (
              <div className="flex gap-1">
                {[...Array(MAX_LIVES)].map((_, i) => (
                  <span key={i} className={`text-lg ${i < livesLeft ? "text-red-400" : "text-gray-700"}`}>❤️</span>
                ))}
              </div>
            )}
            <div className="text-sm text-gray-400">{questionCount}/{totalQuestions}</div>
          </div>
          <div className="text-yellow-300 font-bold">{score.toLocaleString()} pt</div>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-1">
          <div className="h-full bg-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${xp % XP_PER_LEVEL}%` }} />
        </div>
        <div className="text-xs text-gray-500 text-right">{xp % XP_PER_LEVEL}/{XP_PER_LEVEL} XP</div>
      </div>

      {/* Countdown bar (answer phase) or reveal bar */}
      <div className="w-full max-w-md mb-6">
        {result === null ? (
          <CountdownBar key={timerKey} duration={QUIZ_DURATION} onTimeout={handleTimeout} running={timerRunning} />
        ) : (
          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>次の問題まで...</span>
              <span>{Math.ceil((1 - revealProgress) * REVEAL_DURATION / 1000 * 10) / 10}s</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-none ${result === "correct" ? "bg-green-400" : "bg-red-400"}`}
                style={{ width: `${(1 - revealProgress) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Question / Result card */}
      {result === null ? (
        // ── 解答フェーズ ──
        <div className={`w-full max-w-md bg-gray-800 rounded-2xl p-8 mb-6 text-center shadow-xl transition-all duration-300 ${shakeQuestion ? "animate-shake" : ""}`}>
          <div className="text-xs text-gray-500 mb-3">{questionHint}</div>
          <div className="text-4xl font-black tracking-wide">{questionText}</div>
        </div>
      ) : (
        // ── 正解発表フェーズ ──
        <div className={`w-full max-w-md rounded-2xl p-6 mb-6 text-center shadow-xl transition-all duration-300 ${
          result === "correct" ? "bg-green-950 ring-4 ring-green-400" : "bg-red-950 ring-4 ring-red-500"
        }`}>
          {/* 結果ラベル */}
          <div className={`text-2xl font-black mb-4 ${result === "correct" ? "text-green-300" : "text-red-300"}`}>
            {result === "correct" && "✓ 正解！"}
            {result === "wrong" && "✗ 不正解"}
            {result === "timeout" && "⏱ タイムオーバー！"}
            {hardMode && result !== "correct" && livesLeft > 0 && (
              <span className="ml-2 text-base font-normal">残り❤️{livesLeft}</span>
            )}
          </div>

          {/* 問題と答えを大きく表示 */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-3xl font-black text-white">{questionText}</span>
            <span className="text-2xl text-gray-400">→</span>
            <span className={`text-3xl font-black ${result === "correct" ? "text-green-300" : "text-yellow-300"}`}>
              {correctAnswerText}
            </span>
          </div>

          {/* 選んだ答えが間違いの場合に表示 */}
          {result === "wrong" && selectedId !== null && (
            <div className="mt-3 text-sm text-red-400">
              あなたの答え: <span className="font-semibold">{optionLabel(options.find(o => o.id === selectedId)!)}</span>
            </div>
          )}
        </div>
      )}

      {/* Options */}
      <div className="w-full max-w-md grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isCorrect = opt.id === currentWord.id;
          const isSelected = opt.id === selectedId;
          let btnClass = "w-full py-4 px-3 rounded-xl font-semibold text-base transition-all duration-200 ";
          if (result === null) btnClass += "bg-gray-700 hover:bg-gray-600 active:scale-95 cursor-pointer";
          else if (isCorrect) btnClass += "bg-green-500 text-white scale-105 shadow-[0_0_16px_rgba(74,222,128,0.6)]";
          else if (isSelected) btnClass += "bg-red-500 text-white";
          else btnClass += "bg-gray-700 opacity-40";
          return (
            <button key={opt.id} className={btnClass}
              onClick={() => result === null && handleAnswer(opt)} disabled={result !== null}>
              {optionLabel(opt)}
            </button>
          );
        })}
      </div>

      {combo >= 2 && (
        <div className="mt-6 text-yellow-300 font-bold text-xl animate-pulse">🔥 {combo} COMBO</div>
      )}
    </div>
  );
}

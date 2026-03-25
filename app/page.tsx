"use client";
import { useState, useCallback, useEffect } from "react";
import { Word } from "@/app/types";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import HomeScreen, { QuizSettings } from "@/app/components/HomeScreen";
import QuizGame from "@/app/components/QuizGame";
import ResultScreen from "@/app/components/ResultScreen";
import BattleGame from "@/app/components/BattleGame";
import RankingScreen from "@/app/components/RankingScreen";

type Screen = "home" | "quiz" | "result" | "battle" | "review" | "ranking";

interface SavedState {
  xp: number;
  level: 1 | 2 | 3;
  wrongWords: Word[];
  bestScore: number;
  streak: number;
  lastPlayDate: string;
}

const XP_PER_LEVEL = 100;
const defaultSaved: SavedState = {
  xp: 0, level: 1, wrongWords: [], bestScore: 0, streak: 0, lastPlayDate: "",
};

type GameResult = {
  score: number; xp: number; level: number; maxCombo: number;
  wrongWords: Word[]; correctCount: number; wrongCount: number;
};

function updateStreak(saved: SavedState): { streak: number; lastPlayDate: string } {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (saved.lastPlayDate === today) return { streak: saved.streak, lastPlayDate: today };
  if (saved.lastPlayDate === yesterday) return { streak: saved.streak + 1, lastPlayDate: today };
  return { streak: 1, lastPlayDate: today };
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [saved, setSaved] = useLocalStorage<SavedState>("wordblitz_state_v2", defaultSaved);
  const [lastResult, setLastResult] = useState<GameResult & { isNewRecord: boolean } | null>(null);
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({ numQuestions: 10, direction: "en-ja", hardMode: false, difficulty: 1 });

  // 起動時にストリークを確認（プレイしていない日のチェック）
  useEffect(() => {
    if (!saved.lastPlayDate) return;
    const today = new Date().toDateString();
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toDateString();
    if (saved.lastPlayDate <= twoDaysAgo && saved.streak > 0) {
      setSaved({ ...saved, streak: 0 });
    }
  }, []); // eslint-disable-line

  const handleGameEnd = useCallback(
    (result: GameResult) => {
      const merged = [...saved.wrongWords];
      result.wrongWords.forEach((w) => { if (!merged.find((x) => x.id === w.id)) merged.push(w); });
      const isNewRecord = result.score > (saved.bestScore ?? 0);
      const newBestScore = isNewRecord ? result.score : (saved.bestScore ?? 0);
      const { streak, lastPlayDate } = updateStreak(saved);
      setSaved({ xp: result.xp, level: result.level as 1 | 2 | 3, wrongWords: merged, bestScore: newBestScore, streak, lastPlayDate });
      setLastResult({ ...result, isNewRecord });
      setScreen("result");
    },
    [saved, setSaved]
  );

  const handleReviewEnd = useCallback(
    (result: GameResult) => {
      const isNewRecord = result.score > (saved.bestScore ?? 0);
      const newBestScore = isNewRecord ? result.score : (saved.bestScore ?? 0);
      const { streak, lastPlayDate } = updateStreak(saved);
      setSaved({ ...saved, xp: result.xp, level: result.level as 1 | 2 | 3, wrongWords: result.wrongWords, bestScore: newBestScore, streak, lastPlayDate });
      setLastResult({ ...result, isNewRecord });
      setScreen("result");
    },
    [saved, setSaved]
  );

  const handleBattleEnd = useCallback(
    (_won: boolean, _score: number, xpGained: number) => {
      const newXp = saved.xp + xpGained;
      const newLevel = Math.min(3, Math.floor(newXp / XP_PER_LEVEL) + 1) as 1 | 2 | 3;
      const { streak, lastPlayDate } = updateStreak(saved);
      setSaved({ ...saved, xp: newXp, level: newLevel, streak, lastPlayDate });
      setScreen("home");
    },
    [saved, setSaved]
  );

  const handleMasterWord = useCallback(
    (id: number) => {
      setSaved({ ...saved, wrongWords: saved.wrongWords.filter((w) => w.id !== id) });
      if (lastResult) setLastResult({ ...lastResult, wrongWords: lastResult.wrongWords.filter((w) => w.id !== id) });
    },
    [saved, setSaved, lastResult]
  );

  return (
    <>
      {screen === "home" && (
        <HomeScreen
          xp={saved.xp} level={saved.level} wrongWords={saved.wrongWords}
          bestScore={saved.bestScore ?? 0} streak={saved.streak ?? 0}
          onStartQuiz={(settings) => { setQuizSettings(settings); setScreen("quiz"); }}
          onStartBattle={() => setScreen("battle")}
          onStartReview={() => setScreen("review")}
          onShowRanking={() => setScreen("ranking")}
          onMasterWord={handleMasterWord}
        />
      )}

      {screen === "quiz" && (
        <QuizGame
          onGameEnd={handleGameEnd} initialLevel={saved.level} initialXp={saved.xp}
          numQuestions={quizSettings.numQuestions} direction={quizSettings.direction}
          hardMode={quizSettings.hardMode} boostedWords={saved.wrongWords}
          difficulty={quizSettings.difficulty}
        />
      )}

      {screen === "review" && saved.wrongWords.length > 0 && (
        <QuizGame
          onGameEnd={handleReviewEnd} initialLevel={saved.level} initialXp={saved.xp}
          reviewWords={saved.wrongWords} direction={quizSettings.direction}
        />
      )}

      {screen === "result" && lastResult && (
        <ResultScreen
          score={lastResult.score} xp={lastResult.xp} level={lastResult.level}
          maxCombo={lastResult.maxCombo} correctCount={lastResult.correctCount}
          wrongCount={lastResult.wrongCount} wrongWords={lastResult.wrongWords}
          bestScore={saved.bestScore ?? 0} isNewRecord={lastResult.isNewRecord}
          onRestart={() => setScreen("quiz")}
          onReview={() => setScreen("review")}
          onHome={() => setScreen("home")}
          onMasterWord={handleMasterWord}
        />
      )}

      {screen === "battle" && (
        <BattleGame level={saved.level} initialXp={saved.xp} onEnd={handleBattleEnd} onHome={() => setScreen("home")} />
      )}

      {screen === "ranking" && (
        <RankingScreen bestScore={saved.bestScore ?? 0} onHome={() => setScreen("home")} />
      )}
    </>
  );
}

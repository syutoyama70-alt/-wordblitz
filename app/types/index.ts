export type WordLevel = 1 | 2 | 3;

export interface Word {
  id: number;
  english: string;
  japanese: string;
  level: WordLevel;
}

export interface GameState {
  score: number;
  combo: number;
  maxCombo: number;
  xp: number;
  level: number;
  wrongWords: Word[];
  correctCount: number;
  wrongCount: number;
}

export type QuizResult = "correct" | "wrong" | "timeout" | null;

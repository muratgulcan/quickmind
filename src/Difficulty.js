/** Mirrors Difficulty.swift */
export const Difficulty = Object.freeze({
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
});

const TIME_LIMIT = { easy: 8, medium: 5, hard: 3 };
const MEMORY_TURNS = { easy: 1, medium: 2, hard: 3 };
const SCORE_PER = { easy: 10, medium: 20, hard: 30 };

export function timeLimit(difficulty) {
  return TIME_LIMIT[difficulty] ?? 5;
}

export function memoryTurnsBack(difficulty) {
  return MEMORY_TURNS[difficulty] ?? 1;
}

export function scorePerCorrectAnswer(difficulty) {
  return SCORE_PER[difficulty] ?? 20;
}

export function difficultyName(difficulty) {
  return difficulty;
}

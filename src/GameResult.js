/** Mirrors GameResult.swift */
export function createGameResult({ score, rounds, difficulty, date = Date.now() }) {
  return {
    score,
    rounds,
    difficulty,
    date: typeof date === 'number' ? date : new Date(date).getTime(),
  };
}

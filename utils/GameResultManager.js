/** GameResultManager — matches ViewController: keep last 3 played, display by score */
import { Storage } from './Storage.js';
import { createGameResult } from '../src/GameResult.js';

const RESULTS_KEY = 'gameResults';
const MAX_RESULTS = 3;

export class GameResultManager {
  loadGameResults() {
    try {
      const raw = Storage.getItem(RESULTS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      let results = parsed.map((r) => createGameResult(r));
      if (results.length > MAX_RESULTS) {
        results = results.slice(-MAX_RESULTS);
      }
      return results;
    } catch {
      return [];
    }
  }

  saveGameResult(result) {
    let results = this.loadGameResults();
    results.push(createGameResult(result));
    if (results.length > MAX_RESULTS) {
      results = results.slice(-MAX_RESULTS);
    }
    Storage.setItem(RESULTS_KEY, JSON.stringify(results));
    return results;
  }
}

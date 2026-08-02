/** Round timer — ports CADisplayLink + Timer from ViewController */
import { timeLimit } from '../src/Difficulty.js';

export class GameTimer {
  constructor({ onTick, onExpire }) {
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.rafId = null;
    this.intervalId = null;
    this.timerStartTime = null;
    this.initialTimeLimit = 5;
    this.timeRemaining = 5;
    this.running = false;
  }

  start(difficulty) {
    this.stop();
    this.initialTimeLimit = timeLimit(difficulty);
    this.timeRemaining = this.initialTimeLimit;
    this.timerStartTime = performance.now();
    this.running = true;

    this.onTick?.({
      timeRemaining: this.timeRemaining,
      progress: 1,
      initialTimeLimit: this.initialTimeLimit,
    });

    const frame = () => {
      if (!this.running || this.timerStartTime == null) return;
      const elapsed = (performance.now() - this.timerStartTime) / 1000;
      const remaining = Math.max(0, this.initialTimeLimit - elapsed);
      const progress = remaining / this.initialTimeLimit;
      this.timeRemaining = Math.ceil(remaining);
      this.onTick?.({
        timeRemaining: this.timeRemaining,
        progress,
        initialTimeLimit: this.initialTimeLimit,
      });
      this.rafId = requestAnimationFrame(frame);
    };
    this.rafId = requestAnimationFrame(frame);

    this.intervalId = setInterval(() => {
      if (!this.running || this.timerStartTime == null) return;
      const elapsed = (performance.now() - this.timerStartTime) / 1000;
      const remaining = Math.max(0, this.initialTimeLimit - elapsed);
      this.timeRemaining = Math.ceil(remaining);
      if (this.timeRemaining <= 0) {
        this.stop();
        this.onExpire?.();
      }
    }, 250);
  }

  stop() {
    this.running = false;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.timerStartTime = null;
  }
}

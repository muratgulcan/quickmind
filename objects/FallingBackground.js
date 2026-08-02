/** Falling menu background — ports createFallingElement */
import { GameConstants } from '../src/GameConstants.js';
import { randomInt, randomFloat, pickRandom } from '../utils/helpers.js';

const OPERATORS = ['+', '-', '×', '÷'];

export class FallingBackground {
  constructor(container) {
    this.container = container;
    this.timerId = null;
    this.active = false;
  }

  start() {
    this.stop();
    this.active = true;
    this.timerId = setInterval(() => this.spawn(), 600);
  }

  stop() {
    this.active = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.container.replaceChildren();
  }

  spawn() {
    if (!this.active) return;

    const size = randomInt(30, 50);
    const type = randomInt(0, 3);
    const node = document.createElement('div');
    node.className = 'falling-el';
    node.style.left = `${randomFloat(5, 90)}%`;
    node.style.width = `${size}px`;
    node.style.height = `${size}px`;
    node.style.fontSize = `${randomInt(24, 36)}px`;
    node.style.animationDuration = `${randomFloat(4, 6)}s`;
    node.style.display = 'flex';
    node.style.alignItems = 'center';
    node.style.justifyContent = 'center';

    if (type === 0) {
      node.textContent = String(randomInt(1, 50));
      node.style.color = 'rgba(0,0,0,0.5)';
    } else if (type === 1) {
      node.textContent = pickRandom(OPERATORS);
      node.style.color = 'rgba(255,149,0,0.65)';
      node.style.fontWeight = '700';
    } else if (type === 2) {
      node.textContent = pickRandom(GameConstants.emojis)[0];
    } else {
      node.classList.add('color-box');
      node.style.background = pickRandom(GameConstants.colors)[1];
      node.textContent = '';
    }

    node.addEventListener('animationend', () => node.remove());
    this.container.appendChild(node);

    // Cap DOM nodes for low-memory devices
    while (this.container.childElementCount > 24) {
      this.container.firstElementChild?.remove();
    }
  }
}

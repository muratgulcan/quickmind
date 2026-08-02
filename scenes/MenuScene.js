/** Menu scene — difficulty select + start / scoreboard / settings */
import { Difficulty } from '../src/Difficulty.js';
import { FallingBackground } from '../objects/FallingBackground.js';
import { el } from '../utils/helpers.js';

export class MenuScene {
  constructor(root, app) {
    this.root = root;
    this.app = app;
    this.el = null;
    this.falling = null;
    this.difficultySelected = false;
    this.selectedDifficulty = Difficulty.medium;
    this.refs = {};
  }

  mount() {
    this.el = el('section', { className: 'scene', id: 'menu-scene' });
    const bg = el('div', { className: 'menu-bg' });
    const content = el('div', { className: 'menu-content' });

    this.refs.title = el('h1', {
      className: 'title',
      text: this.app.localization.localizedString('title'),
    });

    this.refs.easy = this.makeDiffBtn('easy', 'btn-green', Difficulty.easy);
    this.refs.medium = this.makeDiffBtn('medium', 'btn-yellow', Difficulty.medium);
    this.refs.hard = this.makeDiffBtn('hard', 'btn-red', Difficulty.hard);

    this.refs.start = el('button', {
      className: 'btn btn-teal',
      type: 'button',
      text: this.app.localization.localizedString('start'),
      style: { display: 'none' },
      onClick: () => {
        if (!this.difficultySelected) return;
        this.app.startGame(this.selectedDifficulty);
      },
    });

    this.refs.scoreboard = el('button', {
      className: 'btn btn-teal',
      type: 'button',
      text: this.app.localization.localizedString('scoreboard'),
      onClick: () => this.app.openScoreboard(),
    });

    this.refs.settings = el('button', {
      className: 'btn btn-teal',
      type: 'button',
      text: this.app.localization.localizedString('settings'),
      onClick: () => this.app.openSettings(),
    });

    const stack = el('div', { className: 'stack' }, [
      this.refs.easy,
      this.refs.medium,
      this.refs.hard,
      this.refs.start,
      this.refs.scoreboard,
      this.refs.settings,
    ]);

    content.append(this.refs.title, stack);
    this.el.append(bg, content);
    this.root.appendChild(this.el);

    this.falling = new FallingBackground(bg);
    this.reset();
  }

  makeDiffBtn(key, colorClass, difficulty) {
    return el('button', {
      className: `btn ${colorClass} dim`,
      type: 'button',
      text: this.app.localization.localizedString(key),
      onClick: () => this.selectDifficulty(difficulty),
    });
  }

  selectDifficulty(difficulty) {
    this.selectedDifficulty = difficulty;
    this.difficultySelected = true;
    this.refs.start.style.display = '';

    const map = {
      [Difficulty.easy]: this.refs.easy,
      [Difficulty.medium]: this.refs.medium,
      [Difficulty.hard]: this.refs.hard,
    };
    for (const [diff, btn] of Object.entries(map)) {
      const selected = diff === difficulty;
      btn.classList.toggle('dim', !selected);
      btn.classList.toggle('selected', selected);
    }
  }

  reset() {
    this.difficultySelected = false;
    this.selectedDifficulty = Difficulty.medium;
    this.refs.start.style.display = 'none';
    [this.refs.easy, this.refs.medium, this.refs.hard].forEach((b) => {
      b.classList.add('dim');
      b.classList.remove('selected');
    });
    this.refreshLabels();
    this.show();
    this.falling?.start();
    this.app.adManager.showBanner();
  }

  refreshLabels() {
    const L = this.app.localization;
    this.refs.title.textContent = L.localizedString('title');
    this.refs.easy.textContent = L.localizedString('easy');
    this.refs.medium.textContent = L.localizedString('medium');
    this.refs.hard.textContent = L.localizedString('hard');
    this.refs.start.textContent = L.localizedString('start');
    this.refs.scoreboard.textContent = L.localizedString('scoreboard');
    this.refs.settings.textContent = L.localizedString('settings');
  }

  show() {
    this.el.classList.remove('hidden');
  }

  hide() {
    this.falling?.stop();
    this.el.classList.add('hidden');
  }
}

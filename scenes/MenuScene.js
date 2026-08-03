/** Menu scene — redesigned home + falling background items */
import { Difficulty } from '../src/Difficulty.js';
import { FallingBackground } from '../objects/FallingBackground.js';
import { el } from '../utils/helpers.js';

export class MenuScene {
  constructor(root, app) {
    this.root = root;
    this.app = app;
    this.el = null;
    this.falling = null;
    this.refs = {};
  }

  mount() {
    this.el = el('section', { className: 'scene menu-scene', id: 'menu-scene' });
    const bg = el('div', { className: 'menu-bg' });

    const topBar = el('div', { className: 'menu-topbar' }, [
      el('button', {
        className: 'menu-dots',
        type: 'button',
        'aria-label': 'menu',
        text: '···',
        onClick: () => this.app.openSettings(),
      }),
    ]);

    const content = el('div', { className: 'menu-content' });

    this.refs.title = el('h1', {
      className: 'title menu-title',
      text: this.app.localization.localizedString('title'),
    });

    this.refs.subtitle = el('p', {
      className: 'menu-subtitle',
      text: this.app.localization.localizedString('menuSubtitle'),
    });

    this.refs.easy = this.makeDiffBtn('easy', 'diff-easy', Difficulty.easy);
    this.refs.medium = this.makeDiffBtn('medium', 'diff-medium', Difficulty.medium);
    this.refs.hard = this.makeDiffBtn('hard', 'diff-hard', Difficulty.hard);

    const card = el('div', { className: 'menu-card' }, [
      this.refs.easy,
      this.refs.medium,
      this.refs.hard,
    ]);

    this.refs.scoreboard = el('button', {
      className: 'btn btn-teal menu-action',
      type: 'button',
      text: this.app.localization.localizedString('scoreboard'),
      onClick: () => this.app.openScoreboard(),
    });

    this.refs.settings = el('button', {
      className: 'btn btn-teal menu-action',
      type: 'button',
      text: this.app.localization.localizedString('settings'),
      onClick: () => this.app.openSettings(),
    });

    const actions = el('div', { className: 'menu-actions' }, [
      this.refs.scoreboard,
      this.refs.settings,
    ]);

    this.refs.footer = el('p', {
      className: 'menu-footer',
      text: this.app.localization.localizedString('menuFooter'),
    });

    content.append(
      this.refs.title,
      this.refs.subtitle,
      card,
      actions,
      this.refs.footer,
    );

    this.el.append(bg, topBar, content);
    this.root.appendChild(this.el);

    this.falling = new FallingBackground(bg);
    this.reset();
  }

  makeDiffBtn(key, colorClass, difficulty) {
    return el('button', {
      className: `btn menu-diff ${colorClass}`,
      type: 'button',
      text: this.app.localization.localizedString(key),
      onClick: () => this.app.startGame(difficulty),
    });
  }

  reset() {
    this.refreshLabels();
    this.show();
    this.falling?.start();
    this.app.adManager.showBanner();
  }

  refreshLabels() {
    const L = this.app.localization;
    this.refs.title.textContent = L.localizedString('title');
    this.refs.subtitle.textContent = L.localizedString('menuSubtitle');
    this.refs.easy.textContent = L.localizedString('easy');
    this.refs.medium.textContent = L.localizedString('medium');
    this.refs.hard.textContent = L.localizedString('hard');
    this.refs.scoreboard.textContent = L.localizedString('scoreboard');
    this.refs.settings.textContent = L.localizedString('settings');
    this.refs.footer.textContent = L.localizedString('menuFooter');
  }

  show() {
    this.el.classList.remove('hidden');
  }

  hide() {
    this.falling?.stop();
    this.el.classList.add('hidden');
  }
}

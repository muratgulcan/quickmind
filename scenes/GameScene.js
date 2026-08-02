/** Game scene — ports in-round ViewController UI + flow */
import { GameMode } from '../src/GameMode.js';
import { scorePerCorrectAnswer } from '../src/Difficulty.js';
import { AnswerGrid } from '../objects/AnswerGrid.js';
import { GameTimer } from '../objects/GameTimer.js';
import {
  chooseGameMode,
  buildEmojiRound,
  buildMathRound,
  buildMinMaxRound,
  buildColorRound,
  buildMemoryRound,
} from '../utils/RoundBuilder.js';
import { createGameResult } from '../src/GameResult.js';
import { el } from '../utils/helpers.js';

export class GameScene {
  constructor(root, app) {
    this.root = root;
    this.app = app;
    this.el = null;
    this.refs = {};
    this.grid = null;
    this.timer = null;

    this.gameStarted = false;
    this.currentRound = 0;
    this.currentScore = 0;
    this.answerHistory = [];
    this.selectedDifficulty = null;
    this.currentGameMode = GameMode.shapes;
    this.targetItemIndex = 0;
    this.mathQuestion = null;
    this.targetColorName = '';
    this.shuffledItems = [];
    this.timeRemaining = 0;
    this.awaitingInput = false;
  }

  mount() {
    this.el = el('section', { className: 'scene hidden', id: 'game-scene' });
    const content = el('div', { className: 'game-content' });

    this.refs.title = el('h1', {
      className: 'title',
      text: this.app.localization.localizedString('title'),
    });
    this.refs.score = el('p', { className: 'score-line' });
    this.refs.timer = el('p', { className: 'timer-line' });
    this.refs.timerBar = el('div', { className: 'timer-bar' }, [el('span')]);
    this.refs.instruction = el('p', { className: 'instruction' });
    this.refs.gridWrap = el('div', { className: 'grid-wrap' });

    this.refs.restart = el('button', {
      className: 'btn btn-teal',
      type: 'button',
      text: this.app.localization.localizedString('restart'),
      onClick: () => this.restart(),
    });
    this.refs.mainMenu = el('button', {
      className: 'btn btn-gray',
      type: 'button',
      text: this.app.localization.localizedString('mainMenu'),
      onClick: () => this.toMenu(),
    });
    this.refs.overlay = el('div', {
      className: 'overlay-actions',
      style: { display: 'none' },
    }, [this.refs.restart, this.refs.mainMenu]);

    content.append(
      this.refs.title,
      el('div', { className: 'hud' }, [
        this.refs.score,
        this.refs.timer,
        this.refs.timerBar,
        this.refs.instruction,
      ]),
      this.refs.gridWrap,
    );
    this.el.append(content, this.refs.overlay);
    this.root.appendChild(this.el);

    this.grid = new AnswerGrid(this.refs.gridWrap, (index) => this.handleSelect(index));
    this.timer = new GameTimer({
      onTick: (state) => this.onTimerTick(state),
      onExpire: () => this.onTimeUp(),
    });
  }

  start(difficulty) {
    this.app.settingsManager.loadSettings();
    this.app.localization.currentLanguage = this.app.settingsManager.currentLanguage;
    this.refreshLabels();

    this.selectedDifficulty = difficulty;
    this.gameStarted = true;
    this.currentRound = 0;
    this.currentScore = 0;
    this.answerHistory = [];
    this.awaitingInput = false;

    this.app.adManager.hideBanner();
    this.refs.overlay.style.display = 'none';
    this.grid.setDimmed(false);
    this.refs.instruction.classList.remove('ok', 'bad');
    this.show();
    this.nextRound();
  }

  restart() {
    this.gameStarted = false;
    this.currentRound = 0;
    this.currentScore = 0;
    this.answerHistory = [];
    this.timer.stop();
    this.grid.clear();
    this.refs.overlay.style.display = 'none';
    this.grid.setDimmed(false);
    this.start(this.selectedDifficulty);
  }

  toMenu() {
    this.gameStarted = false;
    this.timer.stop();
    this.grid.clear();
    this.hide();
    this.app.showMenu();
  }

  nextRound() {
    this.app.settingsManager.loadSettings();
    this.currentRound += 1;
    this.updateScoreLabel();
    this.timer.stop();
    this.grid.clear();
    this.refs.instruction.classList.remove('ok', 'bad');

    const settings = this.app.settingsManager;
    this.currentGameMode = chooseGameMode({
      currentRound: this.currentRound,
      selectedGameModes: settings.selectedGameModes,
      selectedMathOperations: settings.selectedMathOperations,
      hasSavedSettings: settings.hasSavedGameModes(),
      answerHistory: this.answerHistory,
      selectedDifficulty: this.selectedDifficulty,
    });

    let round;
    if (this.currentGameMode === GameMode.math) {
      round = buildMathRound({
        currentRound: this.currentRound,
        selectedMathOperations: settings.selectedMathOperations,
      });
      this.mathQuestion = round.mathQuestion;
      this.refs.instruction.textContent = round.mathQuestion.questionText;
    } else if (this.currentGameMode === GameMode.memory) {
      round = buildMemoryRound({
        selectedDifficulty: this.selectedDifficulty,
        answerHistory: this.answerHistory,
        localization: this.app.localization,
      });
      this.refs.instruction.textContent = this.app.localization.format(
        'memoryQuestion',
        round.turnsBack,
      );
    } else if (this.currentGameMode === GameMode.minMax) {
      round = buildMinMaxRound(this.currentRound);
      this.mathQuestion = round.mathQuestion;
      this.refs.instruction.textContent = this.app.localization.localizedString(
        round.isAskingForMin ? 'selectMin' : 'selectMax',
      );
    } else if (this.currentGameMode === GameMode.color) {
      round = buildColorRound();
      this.targetColorName = round.targetColorName;
      this.refs.instruction.textContent = this.app.localization.format(
        'tapColor',
        this.app.localization.localizedString(round.targetColorName),
      );
    } else {
      round = buildEmojiRound();
      this.shuffledItems = round.shuffledItems;
      const target = round.shuffledItems[round.targetItemIndex];
      this.refs.instruction.textContent = this.app.localization.format(
        'tapEmoji',
        this.app.localization.localizedString(target.displayName),
      );
    }

    // If memory fell back inside chooseGameMode to shapes/math, mode already matches.
    // If buildMemory was skipped because history was short, chooseGameMode already swapped.
    if (round.mode !== this.currentGameMode) {
      this.currentGameMode = round.mode;
    }

    this.targetItemIndex = round.targetItemIndex;
    this.grid.render(round.cells);
    this.awaitingInput = true;
    this.timer.start(this.selectedDifficulty);
  }

  handleSelect(index) {
    if (!this.gameStarted || !this.awaitingInput) return;
    this.awaitingInput = false;
    this.grid.setEnabled(false);

    if (index === this.targetItemIndex) {
      this.recordAnswer();
      this.showCorrectFeedback();
      this.timer.stop();
      setTimeout(() => {
        if (this.gameStarted) this.nextRound();
      }, 500);
    } else {
      this.showWrongFeedback();
      this.timer.stop();
      this.endGame();
    }
  }

  recordAnswer() {
    if (this.currentGameMode === GameMode.shapes) {
      const item = this.shuffledItems[this.targetItemIndex];
      if (item) this.answerHistory.push(item.displayName);
    } else if (this.currentGameMode === GameMode.math || this.currentGameMode === GameMode.minMax) {
      if (this.mathQuestion) {
        this.answerHistory.push(String(this.mathQuestion.correctAnswer));
      }
    } else if (this.currentGameMode === GameMode.color) {
      this.answerHistory.push(this.targetColorName);
    }
    // Memory: answer already in history from a prior round
  }

  showCorrectFeedback() {
    let scoreToAdd = scorePerCorrectAnswer(this.selectedDifficulty);
    const timeBonus = this.timeRemaining * 2;
    scoreToAdd += timeBonus;
    this.currentScore += scoreToAdd;

    this.refs.instruction.textContent =
      `${this.app.localization.localizedString('correct')} +${scoreToAdd} ${this.app.localization.localizedString('points')}`;
    this.refs.instruction.classList.add('ok');
    this.refs.instruction.classList.remove('bad');
    this.updateScoreLabel();

    setTimeout(() => {
      this.refs.instruction.classList.remove('ok');
    }, 500);
  }

  showWrongFeedback() {
    this.refs.instruction.textContent = this.app.localization.localizedString('wrong');
    this.refs.instruction.classList.add('bad');
    this.refs.instruction.classList.remove('ok');
  }

  onTimeUp() {
    if (!this.gameStarted || !this.awaitingInput) return;
    this.awaitingInput = false;
    this.grid.setEnabled(false);
    this.refs.instruction.textContent = this.app.localization.localizedString('timeUp');
    this.refs.instruction.classList.add('bad');
    this.endGame();
  }

  onTimerTick({ timeRemaining, progress }) {
    this.timeRemaining = timeRemaining;
    const L = this.app.localization;
    this.refs.timer.textContent = `⏱ ${timeRemaining} ${L.localizedString('seconds')}`;

    let color = 'var(--green)';
    if (timeRemaining <= 2) color = 'var(--red)';
    else if (timeRemaining <= 3) color = 'var(--orange)';

    this.refs.timer.style.color = color;
    const bar = this.refs.timerBar.firstElementChild;
    if (bar) {
      bar.style.transform = `scaleX(${Math.max(0, progress)})`;
      bar.style.background = color;
    }
  }

  updateScoreLabel() {
    const L = this.app.localization;
    this.refs.score.textContent =
      `${L.localizedString('round')}: ${this.currentRound} | ${L.localizedString('score')}: ${this.currentScore}`;
  }

  endGame() {
    this.gameStarted = false;
    this.timer.stop();
    this.saveGameResult();
    this.app.adManager.showInterstitialAd(0.25);

    setTimeout(() => {
      this.refs.overlay.style.display = 'flex';
      this.grid.setDimmed(true);
    }, 500);
  }

  saveGameResult() {
    const difficultyLabel = this.app.localization.localizedString(this.selectedDifficulty);
    const result = createGameResult({
      score: this.currentScore,
      rounds: this.currentRound,
      difficulty: difficultyLabel,
      date: Date.now(),
    });
    this.app.gameResults = this.app.gameResultManager.saveGameResult(result);
  }

  refreshLabels() {
    const L = this.app.localization;
    this.refs.title.textContent = L.localizedString('title');
    this.refs.restart.textContent = L.localizedString('restart');
    this.refs.mainMenu.textContent = L.localizedString('mainMenu');
  }

  show() {
    this.el.classList.remove('hidden');
  }

  hide() {
    this.el.classList.add('hidden');
  }
}

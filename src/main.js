/**
 * QuickMind web entry — HTML5 remake of the iOS TestGameApp.
 * Plain ES modules (no Phaser) to keep bundle small for UI-centric gameplay.
 */
import { LocalizationManager } from '../utils/LocalizationManager.js';
import { SettingsManager } from '../utils/SettingsManager.js';
import { GameResultManager } from '../utils/GameResultManager.js';
import { adManager } from '../utils/MonetizationStub.js';
import { applyTheme } from '../utils/theme.js';
import { MenuScene } from '../scenes/MenuScene.js';
import { GameScene } from '../scenes/GameScene.js';
import { openSettingsModal } from '../ui/SettingsModal.js';
import { openScoreboardModal } from '../ui/ScoreboardModal.js';

class QuickMindApp {
  constructor(root) {
    this.root = root;
    this.localization = new LocalizationManager();
    this.settingsManager = new SettingsManager();
    this.gameResultManager = new GameResultManager();
    this.adManager = adManager;

    this.settingsManager.loadSettings();
    this.localization.currentLanguage = this.settingsManager.currentLanguage;
    applyTheme(this.settingsManager.currentTheme);
    this.gameResults = this.gameResultManager.loadGameResults();

    this.menuScene = new MenuScene(root, this);
    this.gameScene = new GameScene(root, this);
  }

  async boot() {
    await Promise.resolve();
    this.adManager.initialize();
    this.menuScene.mount();
    this.gameScene.mount();
    this.menuScene.reset();
  }

  startGame(difficulty) {
    this.menuScene.hide();
    this.gameScene.start(difficulty);
  }

  showMenu() {
    this.gameScene.hide();
    this.menuScene.reset();
  }

  openScoreboard() {
    this.gameResults = this.gameResultManager.loadGameResults();
    openScoreboardModal(this.root, {
      localization: this.localization,
      gameResults: this.gameResults,
    });
  }

  openSettings() {
    openSettingsModal(this.root, {
      localization: this.localization,
      settingsManager: this.settingsManager,
      onLanguageChange: () => {
        this.menuScene.refreshLabels();
        this.gameScene.refreshLabels();
      },
      onThemeChange: (theme) => {
        this.settingsManager.currentTheme = theme;
        applyTheme(theme);
      },
      onClose: () => {
        applyTheme(this.settingsManager.currentTheme);
        this.menuScene.refreshLabels();
      },
    });
  }
}

const root = document.getElementById('scene-root');
const app = new QuickMindApp(root);
app.boot();

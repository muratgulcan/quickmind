/** SettingsManager — language, modes, ops, theme */
import { ALL_GAME_MODES } from '../src/GameMode.js';
import { ALL_MATH_OPERATIONS } from '../src/MathOperation.js';
import { Language } from '../src/Language.js';
import { Theme, ALL_THEMES } from '../src/Theme.js';
import { Storage } from './Storage.js';

const KEY_LANGUAGE = 'selectedLanguage';
const KEY_MODES = 'selectedGameModes';
const KEY_OPS = 'selectedMathOperations';
const KEY_THEME = 'selectedTheme';

export class SettingsManager {
  constructor() {
    this.selectedGameModes = new Set();
    this.selectedMathOperations = new Set();
    this.currentLanguage = Language.english;
    this.currentTheme = Theme.system;
  }

  loadSettings() {
    const languageString = Storage.getItem(KEY_LANGUAGE);
    if (languageString === Language.english || languageString === Language.turkish) {
      this.currentLanguage = languageString;
    } else {
      this.currentLanguage = Language.english;
    }

    const themeString = Storage.getItem(KEY_THEME);
    if (ALL_THEMES.includes(themeString)) {
      this.currentTheme = themeString;
    } else {
      this.currentTheme = Theme.system;
    }

    if (Storage.hasKey(KEY_MODES)) {
      this.selectedGameModes.clear();
      try {
        const modeStrings = JSON.parse(Storage.getItem(KEY_MODES) || '[]');
        if (Array.isArray(modeStrings) && modeStrings.length > 0) {
          for (const modeString of modeStrings) {
            if (ALL_GAME_MODES.includes(modeString)) {
              this.selectedGameModes.add(modeString);
            }
          }
        }
      } catch {
        this.selectedGameModes = new Set(ALL_GAME_MODES);
      }
    } else {
      this.selectedGameModes = new Set(ALL_GAME_MODES);
    }

    if (Storage.hasKey(KEY_OPS)) {
      this.selectedMathOperations.clear();
      try {
        const opStrings = JSON.parse(Storage.getItem(KEY_OPS) || '[]');
        if (Array.isArray(opStrings) && opStrings.length > 0) {
          for (const opString of opStrings) {
            if (ALL_MATH_OPERATIONS.includes(opString)) {
              this.selectedMathOperations.add(opString);
            }
          }
        }
      } catch {
        this.selectedMathOperations = new Set(ALL_MATH_OPERATIONS);
      }
    } else {
      this.selectedMathOperations = new Set(ALL_MATH_OPERATIONS);
    }
  }

  hasSavedGameModes() {
    return Storage.hasKey(KEY_MODES);
  }

  saveSettings(gameModes, mathOperations, language, theme = this.currentTheme) {
    this.selectedGameModes = new Set(gameModes);
    this.selectedMathOperations = new Set(mathOperations);
    this.currentLanguage = language;
    this.currentTheme = theme;

    Storage.setItem(KEY_MODES, JSON.stringify([...this.selectedGameModes]));
    Storage.setItem(KEY_OPS, JSON.stringify([...this.selectedMathOperations]));
    Storage.setItem(KEY_LANGUAGE, language);
    Storage.setItem(KEY_THEME, theme);
  }
}

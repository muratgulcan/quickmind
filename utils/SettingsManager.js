/** SettingsManager.swift — persists via Storage adapter */
import { GameMode, ALL_GAME_MODES } from '../src/GameMode.js';
import { ALL_MATH_OPERATIONS } from '../src/MathOperation.js';
import { Language } from '../src/Language.js';
import { Storage } from './Storage.js';

const KEY_LANGUAGE = 'selectedLanguage';
const KEY_MODES = 'selectedGameModes';
const KEY_OPS = 'selectedMathOperations';

export class SettingsManager {
  constructor() {
    this.selectedGameModes = new Set();
    this.selectedMathOperations = new Set();
    this.currentLanguage = Language.english;
  }

  loadSettings() {
    const languageString = Storage.getItem(KEY_LANGUAGE);
    if (languageString === Language.english || languageString === Language.turkish) {
      this.currentLanguage = languageString;
    } else {
      this.currentLanguage = Language.english;
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

  saveSettings(gameModes, mathOperations, language) {
    this.selectedGameModes = new Set(gameModes);
    this.selectedMathOperations = new Set(mathOperations);
    this.currentLanguage = language;

    Storage.setItem(KEY_MODES, JSON.stringify([...this.selectedGameModes]));
    Storage.setItem(KEY_OPS, JSON.stringify([...this.selectedMathOperations]));
    Storage.setItem(KEY_LANGUAGE, language);
  }
}

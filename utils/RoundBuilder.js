/**
 * Core round generators — ports ViewController math/emoji/memory/minMax/color setup.
 */
import { GameConstants } from '../src/GameConstants.js';
import { GameMode } from '../src/GameMode.js';
import { MathOperation, calculate } from '../src/MathOperation.js';
import { createMathQuestion } from '../src/MathQuestion.js';
import { createEmojiItem } from '../src/GameItem.js';
import { memoryTurnsBack } from '../src/Difficulty.js';
import { randomInt, shuffle, pickRandom } from './helpers.js';

const ITEM_COUNT = GameConstants.numberOfItems;

function difficultyMultiplier(currentRound) {
  if (currentRound <= 5) return 1.0;
  return 1.0 + (currentRound - 5) * 0.1;
}

export function chooseGameMode({
  currentRound,
  selectedGameModes,
  selectedMathOperations,
  hasSavedSettings,
  answerHistory,
  selectedDifficulty,
}) {
  let availableModes = [];

  if (hasSavedSettings && selectedGameModes.size > 0) {
    if (selectedGameModes.has(GameMode.shapes)) availableModes.push(GameMode.shapes);
    if (selectedGameModes.has(GameMode.math) && selectedMathOperations.size > 0) {
      availableModes.push(GameMode.math);
    }
    if (selectedGameModes.has(GameMode.memory)) availableModes.push(GameMode.memory);
    if (selectedGameModes.has(GameMode.minMax)) availableModes.push(GameMode.minMax);
    if (selectedGameModes.has(GameMode.color)) availableModes.push(GameMode.color);
  } else if (currentRound > 5) {
    availableModes = [
      GameMode.shapes,
      GameMode.math,
      GameMode.memory,
      GameMode.minMax,
      GameMode.color,
    ];
  } else {
    availableModes = [GameMode.shapes, GameMode.math];
  }

  let mode = pickRandom(availableModes) || GameMode.shapes;

  if (mode === GameMode.memory) {
    const turnsBack = memoryTurnsBack(selectedDifficulty);
    if (answerHistory.length < turnsBack) {
      mode = Math.random() < 0.5 ? GameMode.shapes : GameMode.math;
    }
  }

  return mode;
}

export function buildEmojiRound() {
  const used = new Set();
  const items = [];
  let pool = shuffle(GameConstants.emojis);

  while (items.length < ITEM_COUNT) {
    let foundNew = false;
    for (const [emoji, name] of pool) {
      if (items.length >= ITEM_COUNT) break;
      if (!used.has(name)) {
        items.push(createEmojiItem(emoji, name));
        used.add(name);
        foundNew = true;
      }
    }
    if (!foundNew) {
      if (used.size >= GameConstants.emojis.length) break;
      pool = shuffle(GameConstants.emojis);
    }
  }

  const shuffledItems = shuffle(items);
  const targetItemIndex = randomInt(0, shuffledItems.length - 1);

  return {
    mode: GameMode.shapes,
    shuffledItems,
    targetItemIndex,
    cells: shuffledItems.map((item, index) => ({
      index,
      kind: 'emoji',
      label: item.displayValue,
      value: item.displayName,
    })),
  };
}

export function buildMathRound({ currentRound, selectedMathOperations }) {
  const ops = selectedMathOperations.size > 0
    ? [...selectedMathOperations]
    : [MathOperation.addition];
  const operation = pickRandom(ops);
  return buildMathRoundWithOperation(operation, currentRound);
}

function buildMathRoundWithOperation(operation, currentRound) {
  const mult = difficultyMultiplier(currentRound);
  let num1 = 1;
  let num2 = 1;
  let correctAnswer = null;

  do {
    switch (operation) {
      case MathOperation.addition: {
        const maxNum = Math.min(Math.floor(20 * mult), 100);
        num1 = randomInt(1, maxNum);
        num2 = randomInt(1, maxNum);
        correctAnswer = calculate(operation, num1, num2);
        break;
      }
      case MathOperation.subtraction: {
        const maxNum = Math.min(Math.floor(30 * mult), 200);
        num1 = randomInt(10, maxNum);
        num2 = randomInt(1, num1);
        correctAnswer = calculate(operation, num1, num2);
        break;
      }
      case MathOperation.multiplication: {
        const maxNum = Math.min(Math.floor(10 * mult), 20);
        num1 = randomInt(2, maxNum);
        num2 = randomInt(2, maxNum);
        correctAnswer = calculate(operation, num1, num2);
        break;
      }
      case MathOperation.division: {
        const maxNum = Math.min(Math.floor(10 * mult), 20);
        num2 = randomInt(2, maxNum);
        const quotient = randomInt(2, maxNum);
        num1 = num2 * quotient;
        correctAnswer = calculate(operation, num1, num2);
        break;
      }
      default:
        correctAnswer = null;
    }
  } while (correctAnswer == null || correctAnswer < 0);

  const wrongAnswers = [];
  const minVal = Math.max(0, correctAnswer - 40);
  const maxVal = correctAnswer + 40;
  let attempts = 0;
  while (wrongAnswers.length < 14 && attempts < 500) {
    const wrong = randomInt(minVal, maxVal);
    if (wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
      wrongAnswers.push(wrong);
    }
    attempts += 1;
  }
  while (wrongAnswers.length < 14) {
    const wrong = randomInt(0, 200);
    if (wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
      wrongAnswers.push(wrong);
    }
  }

  const mathQuestion = createMathQuestion(num1, num2, operation, correctAnswer, wrongAnswers);
  const allAnswers = buildAnswerList(correctAnswer, wrongAnswers);

  return {
    mode: GameMode.math,
    mathQuestion,
    targetItemIndex: 0,
    cells: allAnswers.map((answer, index) => ({
      index,
      kind: 'number',
      label: String(answer),
      value: String(answer),
    })),
  };
}

function buildAnswerList(correctAnswer, wrongAnswers) {
  let uniqueWrong = [];
  for (const answer of wrongAnswers) {
    if (answer !== correctAnswer && !uniqueWrong.includes(answer)) {
      uniqueWrong.push(answer);
    }
  }
  while (uniqueWrong.length < 14) {
    const next = randomInt(0, 200);
    if (next !== correctAnswer && !uniqueWrong.includes(next)) {
      uniqueWrong.push(next);
    }
  }
  uniqueWrong = shuffle(uniqueWrong).slice(0, 14);
  return [correctAnswer, ...uniqueWrong];
}

export function buildMinMaxRound(currentRound) {
  const mult = difficultyMultiplier(currentRound);
  const maxNum = Math.min(Math.floor(50 * mult), 200);
  const numbers = new Set();
  while (numbers.size < ITEM_COUNT) {
    numbers.add(randomInt(1, maxNum));
  }
  const minMaxNumbers = [...numbers];
  const isAskingForMin = Math.random() < 0.5;
  const minMaxTarget = isAskingForMin
    ? Math.min(...minMaxNumbers)
    : Math.max(...minMaxNumbers);

  const wrongAnswers = minMaxNumbers.filter((n) => n !== minMaxTarget);
  const mathQuestion = createMathQuestion(0, 0, MathOperation.addition, minMaxTarget, wrongAnswers);
  const allAnswers = buildAnswerList(minMaxTarget, wrongAnswers);

  return {
    mode: GameMode.minMax,
    isAskingForMin,
    minMaxTarget,
    minMaxNumbers,
    mathQuestion,
    targetItemIndex: 0,
    cells: allAnswers.map((answer, index) => ({
      index,
      kind: 'number',
      label: String(answer),
      value: String(answer),
    })),
  };
}

export function buildColorRound() {
  let selectedColors = shuffle(GameConstants.colors);
  if (selectedColors.length > ITEM_COUNT) {
    selectedColors = selectedColors.slice(0, ITEM_COUNT);
  }

  selectedColors = shuffle(selectedColors);
  const targetItemIndex = randomInt(0, selectedColors.length - 1);
  const targetColorName = selectedColors[targetItemIndex][0];

  return {
    mode: GameMode.color,
    targetColorName,
    targetItemIndex,
    cells: selectedColors.map(([name, hex], index) => ({
      index,
      kind: 'color',
      label: '',
      value: name,
      color: hex,
    })),
  };
}

export function buildMemoryRound({ selectedDifficulty, answerHistory, localization }) {
  const turnsBack = memoryTurnsBack(selectedDifficulty);
  const targetAnswer = answerHistory[answerHistory.length - turnsBack];
  const allAnswers = [targetAnswer];

  while (allAnswers.length < ITEM_COUNT) {
    let randomAnswer;
    const answerType = randomInt(0, 2);
    if (answerType === 0) {
      randomAnswer = pickRandom(GameConstants.emojis)[1];
    } else if (answerType === 1) {
      randomAnswer = pickRandom(GameConstants.colors)[0];
    } else {
      randomAnswer = String(randomInt(1, 50));
    }
    if (randomAnswer !== targetAnswer && !allAnswers.includes(randomAnswer)) {
      allAnswers.push(randomAnswer);
    }
  }

  const shuffled = shuffle(allAnswers);
  const targetIndex = shuffled.indexOf(targetAnswer);
  if (targetIndex > 0) {
    [shuffled[0], shuffled[targetIndex]] = [shuffled[targetIndex], shuffled[0]];
  }

  return {
    mode: GameMode.memory,
    turnsBack,
    targetItemIndex: 0,
    cells: shuffled.map((answer, index) => {
      const isKey = answer.startsWith('emoji_') || answer.startsWith('color_');
      return {
        index,
        kind: 'memory',
        label: isKey ? localization.localizedString(answer) : answer,
        value: answer,
      };
    }),
  };
}

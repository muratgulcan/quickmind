/** Mirrors MathQuestion.swift */
import { operationSymbol } from './MathOperation.js';

export function createMathQuestion(num1, num2, operation, correctAnswer, wrongAnswers) {
  return {
    num1,
    num2,
    operation,
    correctAnswer,
    wrongAnswers,
    get questionText() {
      return `${num1} ${operationSymbol(operation)} ${num2} = ?`;
    },
  };
}

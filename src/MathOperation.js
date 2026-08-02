/** Mirrors MathOperation.swift */
export const MathOperation = Object.freeze({
  addition: 'addition',
  subtraction: 'subtraction',
  multiplication: 'multiplication',
  division: 'division',
});

export const ALL_MATH_OPERATIONS = Object.values(MathOperation);

export function operationSymbol(operation) {
  switch (operation) {
    case MathOperation.addition: return '+';
    case MathOperation.subtraction: return '-';
    case MathOperation.multiplication: return '×';
    case MathOperation.division: return '÷';
    default: return '?';
  }
}

export function calculate(operation, num1, num2) {
  switch (operation) {
    case MathOperation.addition:
      return num1 + num2;
    case MathOperation.subtraction:
      return num1 - num2;
    case MathOperation.multiplication:
      return num1 * num2;
    case MathOperation.division:
      if (num2 === 0 || num1 % num2 !== 0) return null;
      return num1 / num2;
    default:
      return null;
  }
}

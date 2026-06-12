/**
 * User-facing messages displayed in the calculator UI.
 *
 * Centralized here so message text can be changed in one place
 * (mirrors the backend's Messages.java pattern).
 */
export const messages = {
    // Calculator (Calculate button) validation
    emptyNumbers: 'Please enter valid numbers in both fields',
    emptyNumbersDidYouMeanSolve: 'The number fields are empty. Did you mean to click Solve?',

    // Smart input (Solve button) validation
    emptyExpression: 'Please enter an expression',
    emptyExpressionDidYouMeanCalculate: 'The expression field is empty. Did you mean to click Calculate?',

    // Generic fallback for unknown errors caught in handlers
    unknownError: 'Unknown error',
} as const
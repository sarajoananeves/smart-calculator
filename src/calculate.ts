export type Operator = '+' | '-' | '*' | '/'

// Local pure-TS implementation of calculate(a, b, op).
// Kept for learning comparison; the UI now uses calculateRemote (api.ts) which delegates to the Spring Boot backend.
// The tests in calculate.test.ts continue to verify this implementation.
export function calculate(a: number, b: number, op: Operator): number {
    switch (op) {
        case '+':
            return a + b
        case '-':
            return a - b
        case '*':
            return a * b
        case '/':
            if (b === 0) {
                throw new Error('Cannot divide by zero')
            }
            return a / b
    }
}
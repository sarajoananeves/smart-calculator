// Operator is the live part of this module — App.tsx and api.ts import this type.
export type Operator = '+' | '-' | '*' | '/'

// calculate() below is a DELIBERATE LEARNING ARTIFACT, intentionally retained — not dead code.
// It is the original local, pure-TS implementation. The shipping UI no longer calls it; the app
// now uses calculateRemote (api.ts), which delegates to the Spring Boot backend. We keep it (and
// its tests in calculate.test.ts) as a side-by-side reference for the local-vs-remote comparison.
// Its 100% coverage is expected and is NOT evidence of the live calculate path being tested.
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
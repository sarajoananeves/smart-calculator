export type Operator = '+' | '-' | '*' | '/'

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
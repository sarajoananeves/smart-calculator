// Tests for calculate() — a deliberate learning artifact (see calculate.ts).
// calculate() is no longer called by the shipping UI (which uses calculateRemote in api.ts),
// so these tests intentionally guard a reference implementation, not production behavior.
// Kept on purpose; do not read their coverage as coverage of the live calculate path.
import { describe, it, expect } from 'vitest'
import { calculate } from './calculate'

describe('calculate', () => {
    describe('addition', () => {
        it('[CALC-100] adds two positive numbers', () => {
            expect(calculate(2, 3, '+')).toBe(5)
        })

        it('[CALC-101] adds with a negative number', () => {
            expect(calculate(-5, 3, '+')).toBe(-2)
        })

        it('[CALC-102] adds two decimals', () => {
            expect(calculate(1.5, 2.5, '+')).toBe(4)
        })
    })

    describe('subtraction', () => {
        it('[CALC-103] subtracts two positive numbers', () => {
            expect(calculate(10, 4, '-')).toBe(6)
        })

        it('[CALC-104] subtracts with negative numbers', () => {
            expect(calculate(-5, -3, '-')).toBe(-2)
        })

        it('[CALC-105] subtracts two decimals', () => {
            expect(calculate(5.5, 2.5, '-')).toBe(3)
        })
    })

    describe('multiplication', () => {
        it('[CALC-106] multiplies two positive numbers', () => {
            expect(calculate(4, 3, '*')).toBe(12)
        })

        it('[CALC-107] multiplies with a negative number', () => {
            expect(calculate(-4, 3, '*')).toBe(-12)
        })

        it('[CALC-108] multiplies two decimals', () => {
            expect(calculate(2.5, 4, '*')).toBe(10)
        })
    })

    describe('division', () => {
        it('[CALC-109] divides two positive numbers', () => {
            expect(calculate(10, 2, '/')).toBe(5)
        })

        it('[CALC-110] divides with a negative number', () => {
            expect(calculate(-10, 2, '/')).toBe(-5)
        })

        it('[CALC-111] divides two decimals', () => {
            expect(calculate(7.5, 2.5, '/')).toBe(3)
        })

        it('[CALC-112] throws when dividing by zero', () => {
            expect(() => calculate(5, 0, '/')).toThrow('Cannot divide by zero')
        })
    })

    describe('floating-point behavior', () => {
        it('[CALC-113] demonstrates JS imprecision: 0.1 + 0.2 is not exactly 0.3', () => {
            expect(calculate(0.1, 0.2, '+')).not.toBe(0.3)
        })

        it('[CALC-114] but is close enough using toBeCloseTo', () => {
            expect(calculate(0.1, 0.2, '+')).toBeCloseTo(0.3)
        })
    })
})
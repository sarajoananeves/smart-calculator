import { describe, it, expect } from 'vitest'
import { calculate } from './calculate'

describe('calculate', () => {
    describe('addition', () => {
        it('adds two positive numbers', () => {
            expect(calculate(2, 3, '+')).toBe(5)
        })

        it('adds with a negative number', () => {
            expect(calculate(-5, 3, '+')).toBe(-2)
        })

        it('adds two decimals', () => {
            expect(calculate(1.5, 2.5, '+')).toBe(4)
        })
    })

    describe('subtraction', () => {
        it('subtracts two positive numbers', () => {
            expect(calculate(10, 4, '-')).toBe(6)
        })

        it('subtracts with negative numbers', () => {
            expect(calculate(-5, -3, '-')).toBe(-2)
        })

        it('subtracts two decimals', () => {
            expect(calculate(5.5, 2.5, '-')).toBe(3)
        })
    })

    describe('multiplication', () => {
        it('multiplies two positive numbers', () => {
            expect(calculate(4, 3, '*')).toBe(12)
        })

        it('multiplies with a negative number', () => {
            expect(calculate(-4, 3, '*')).toBe(-12)
        })

        it('multiplies two decimals', () => {
            expect(calculate(2.5, 4, '*')).toBe(10)
        })
    })

    describe('division', () => {
        it('divides two positive numbers', () => {
            expect(calculate(10, 2, '/')).toBe(5)
        })

        it('divides with a negative number', () => {
            expect(calculate(-10, 2, '/')).toBe(-5)
        })

        it('divides two decimals', () => {
            expect(calculate(7.5, 2.5, '/')).toBe(3)
        })

        it('throws when dividing by zero', () => {
            expect(() => calculate(5, 0, '/')).toThrow('Cannot divide by zero')
        })
    })

    describe('floating-point behavior', () => {
        it('demonstrates JS imprecision: 0.1 + 0.2 is not exactly 0.3', () => {
            expect(calculate(0.1, 0.2, '+')).not.toBe(0.3)
        })

        it('but is close enough using toBeCloseTo', () => {
            expect(calculate(0.1, 0.2, '+')).toBeCloseTo(0.3)
        })
    })
})
import { describe, it, expect, vi, afterEach } from 'vitest'
import { calculateRemote, parseExpression } from './api'

const CALC_URL = 'http://localhost:8081/api/calculate'
const PARSE_URL = 'http://localhost:8081/api/parse'
const UNREACHABLE = 'Cannot reach the calculator service. Is it running?'

/** Build a minimal Response-like object whose .json() resolves to `body`. */
function jsonResponse(body: unknown, ok = true): Response {
    return { ok, json: async () => body } as unknown as Response
}

/** Stub global.fetch with the given implementation and return the mock. */
function stubFetch(impl: (...args: unknown[]) => Promise<Response>) {
    const fn = vi.fn(impl)
    vi.stubGlobal('fetch', fn)
    return fn
}

describe('api', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    describe('calculateRemote', () => {
        it('[CALC-900] POSTs to the calculate endpoint and returns the result', async () => {
            const fetchMock = stubFetch(() => Promise.resolve(jsonResponse({ result: 10 })))

            await expect(calculateRemote(7, 3, '+')).resolves.toBe(10)
            expect(fetchMock).toHaveBeenCalledWith(CALC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ a: 7, b: 3, op: '+' }),
            })
        })

        it('[CALC-901] throws the unreachable message when fetch rejects', async () => {
            stubFetch(() => Promise.reject(new TypeError('Failed to fetch')))

            await expect(calculateRemote(7, 3, '+')).rejects.toThrow(UNREACHABLE)
        })

        it('[CALC-902] throws the server error message on a non-ok response', async () => {
            stubFetch(() =>
                Promise.resolve(jsonResponse({ error: 'Cannot divide by zero' }, false)),
            )

            await expect(calculateRemote(5, 0, '/')).rejects.toThrow('Cannot divide by zero')
        })

        it('[CALC-903] falls back to "Calculation failed" when a non-ok body has no error field', async () => {
            stubFetch(() => Promise.resolve(jsonResponse({}, false)))

            await expect(calculateRemote(7, 3, '+')).rejects.toThrow('Calculation failed')
        })
    })

    describe('parseExpression', () => {
        it('[CALC-904] POSTs to the parse endpoint and returns the parsed expression', async () => {
            const parsed = { a: 7, b: 3, op: '+' as const }
            const fetchMock = stubFetch(() => Promise.resolve(jsonResponse(parsed)))

            await expect(parseExpression('7 plus 3')).resolves.toEqual(parsed)
            expect(fetchMock).toHaveBeenCalledWith(PARSE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expression: '7 plus 3' }),
            })
        })

        it('[CALC-905] throws the unreachable message when fetch rejects', async () => {
            stubFetch(() => Promise.reject(new TypeError('Failed to fetch')))

            await expect(parseExpression('7 plus 3')).rejects.toThrow(UNREACHABLE)
        })

        it('[CALC-906] throws the server error message on a non-ok response', async () => {
            stubFetch(() =>
                Promise.resolve(
                    jsonResponse({ error: "Sorry, I couldn't understand that." }, false),
                ),
            )

            await expect(parseExpression('7plus3')).rejects.toThrow(
                "Sorry, I couldn't understand that.",
            )
        })

        it('[CALC-907] falls back to "Could not parse expression" when a non-ok body has no error field', async () => {
            stubFetch(() => Promise.resolve(jsonResponse({}, false)))

            await expect(parseExpression('7plus3')).rejects.toThrow('Could not parse expression')
        })
    })
})

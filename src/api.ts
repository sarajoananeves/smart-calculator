import type { Operator } from './calculate'

const API_URL = 'http://localhost:8081/api/calculate'
const PARSE_URL = 'http://localhost:8081/api/parse'

type SuccessResponse = { result: number }
type ErrorBody = { error?: string }
type ParseResponse = { a: number; b: number; op: Operator }

export async function calculateRemote(
    a: number,
    b: number,
    op: Operator,
): Promise<number> {
    let response: Response
    try {
        response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ a, b, op }),
        })
    } catch {
        throw new Error('Cannot reach the calculator service. Is it running?')
    }

    const body: unknown = await response.json()

    if (!response.ok) {
        const message = (body as ErrorBody).error ?? 'Calculation failed'
        throw new Error(message)
    }

    return (body as SuccessResponse).result
}

export async function parseExpression(expression: string): Promise<ParseResponse> {
    let response: Response
    try {
        response = await fetch(PARSE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expression }),
        })
    } catch {
        throw new Error('Cannot reach the calculator service. Is it running?')
    }

    const body: unknown = await response.json()

    if (!response.ok) {
        const message = (body as ErrorBody).error ?? 'Could not parse expression'
        throw new Error(message)
    }

    return body as ParseResponse
}
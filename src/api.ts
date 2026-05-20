import type { Operator } from './calculate'

const API_URL = 'http://localhost:8081/api/calculate'

type SuccessResponse = { result: number }
type ErrorBody = { error?: string }

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
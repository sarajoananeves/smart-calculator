import { useState } from 'react'
import { calculateRemote, parseExpression } from './api'
import type { Operator } from './calculate'
import './App.css'
import { messages } from './messages'

function App() {
    const [numA, setNumA] = useState('')
    const [numB, setNumB] = useState('')
    const [op, setOp] = useState<Operator>('+')
    const [result, setResult] = useState('—')
    const [isLoading, setIsLoading] = useState(false)
    const [expression, setExpression] = useState('')
    const [isParsing, setIsParsing] = useState(false)

    function formatResult(value: number): string {
        return parseFloat(value.toFixed(10)).toString()
    }

    async function handleCalculate() {
        const a = Number(numA)
        const b = Number(numB)

        if (numA === '' || numB === '' || Number.isNaN(a) || Number.isNaN(b)) {
            if (expression.trim() !== '') {
                setResult(messages.emptyNumbersDidYouMeanSolve)
            } else {
                setResult(messages.emptyNumbers)
            }
            return
        }

        setIsLoading(true)
        try {
            const value = await calculateRemote(a, b, op)
            setResult(formatResult(value))
        } catch (error) {
            if (error instanceof Error) {
                setResult(error.message)
            } else {
                setResult(messages.unknownError)
            }
        } finally {
            setIsLoading(false)
        }
    }

    async function handleParse() {
        if (expression.trim() === '') {
            const hasAnyNumberValue = numA !== '' || numB !== ''

            if (hasAnyNumberValue) {
                setResult(messages.emptyExpressionDidYouMeanCalculate)
            } else {
                setResult(messages.emptyExpression)
            }
            return
        }

        setIsParsing(true)
        try {
            const parsed = await parseExpression(expression)
            const value = await calculateRemote(parsed.a, parsed.b, parsed.op)
            setResult(formatResult(value))
        } catch (error) {
            if (error instanceof Error) {
                setResult(error.message)
            } else {
                setResult(messages.unknownError)
            }
        } finally {
            setIsParsing(false)
        }
    }

    return (
        <main className="calculator">
            <h1>My Smart Calculator  🧮</h1>

            <form className="calculator-form">
                <div>
                    <label htmlFor="numA">First number</label>
                    <input
                        id="numA"
                        type="number"
                        value={numA}
                        onChange={(e) => {
                            setNumA(e.target.value)
                            setResult('—')
                            setExpression('')
                        }}
                    />
                </div>

                <div>
                    <label htmlFor="op">Operator</label>
                    <select
                        id="op"
                        value={op}
                        onChange={(e) => {
                            setOp(e.target.value as Operator)
                            setResult('—')
                            setExpression('')
                        }}
                    >
                        <option value="+">+</option>
                        <option value="-">-</option>
                        <option value="*">*</option>
                        <option value="/">/</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="numB">Second number</label>
                    <input
                        id="numB"
                        type="number"
                        value={numB}
                        onChange={(e) => {
                            setNumB(e.target.value)
                            setResult('—')
                            setExpression('')
                        }}
                    />
                </div>

                <button
                    type="button"
                    onClick={handleCalculate}
                    disabled={isLoading || isParsing}
                >
                    {isLoading ? 'Calculating…' : 'Calculate'}
                </button>
            </form>

            <h2>Or try natural language</h2>

            <form className="parser-form">
                <div>
                    <label htmlFor="expression">Expression</label>
                    <input
                        id="expression"
                        type="text"
                        value={expression}
                        placeholder="e.g. 7 plus 3 or 15% of 80"
                        onChange={(e) => {
                            setExpression(e.target.value)
                            setResult('—')
                            setNumA('')
                            setNumB('')
                            setOp('+')
                        }}
                    />
                </div>

                <button
                    type="button"
                    onClick={handleParse}
                    disabled={isLoading || isParsing}
                >
                    {isParsing ? 'Solving…' : 'Solve'}
                </button>
            </form>

            <p aria-live="polite">Result: {result}</p>
        </main>
    )
}

export default App
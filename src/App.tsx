import { useState } from 'react'
import { calculate, type Operator } from './calculate'
import './App.css'

function App() {
    const [numA, setNumA] = useState('')
    const [numB, setNumB] = useState('')
    const [op, setOp] = useState<Operator>('+')
    const [result, setResult] = useState('—')

    function handleCalculate() {
        const a = Number(numA)
        const b = Number(numB)

        if (numA === '' || numB === '' || Number.isNaN(a) || Number.isNaN(b)) {
            setResult('Please enter valid numbers in both fields')
            return
        }

        try {
            const value = calculate(a, b, op)
            setResult(String(value))
        } catch (error) {
            if (error instanceof Error) {
                setResult(error.message)
            } else {
                setResult('Unknown error')
            }
        }
    }

    return (
        <>
            <h1>My Smart Calculator  🧮</h1>

            <form>
                <div>
                    <label htmlFor="numA">First number</label>
                    <input
                        id="numA"
                        type="number"
                        value={numA}
                        onChange={(e) => {
                            setNumA(e.target.value)
                            setResult('—')
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
                        }}
                    />
                </div>

                <button type="button" onClick={handleCalculate}>Calculate</button>
            </form>

            <p aria-live="polite">Result: {result}</p>
        </>
    )
}

export default App
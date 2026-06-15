import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { beforeEach, vi } from 'vitest'
import App from './App'
import { calculateRemote, parseExpression } from './api'
import type { Operator } from './calculate'
import { messages } from './messages'

vi.mock('./api')

describe('App', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('[CALC-001] renders the calculator heading', () => {
        render(<App />)
        expect(
            screen.getByRole('heading', { name: /smart calculator/i })
        ).toBeInTheDocument()
    })

    it('[CALC-002] shows the result returned by the API', async () => {
        vi.mocked(calculateRemote).mockResolvedValue(10)
        const user = userEvent.setup()
        render(<App />)

        await user.type(screen.getByLabelText(/first number/i), '7')
        await user.type(screen.getByLabelText(/second number/i), '3')
        await user.click(screen.getByRole('button', { name: /calculate/i }))

        expect(await screen.findByText(/result:\s*10/i)).toBeInTheDocument()
    })

    it.each([
        { a: '7',   op: '+', b: '0'   },
        { a: '-5',  op: '+', b: '5.5' },
        { a: '7',   op: '-', b: '0'   },
        { a: '-5',  op: '-', b: '2.5' },
        { a: '7',   op: '*', b: '0'   },
        { a: '-2',  op: '*', b: '2.5' },
        { a: '0',   op: '/', b: '5'   },
        { a: '-10', op: '/', b: '2.5' },
    ])('[CALC-003] passes correct args to calculateRemote for $a $op $b', async ({ a, op, b }) => {
        vi.mocked(calculateRemote).mockResolvedValue(0)
        const user = userEvent.setup()
        render(<App />)

        await user.type(screen.getByLabelText(/first number/i), a)
        await user.selectOptions(screen.getByLabelText(/operator/i), op)
        await user.type(screen.getByLabelText(/second number/i), b)
        await user.click(screen.getByRole('button', { name: /calculate/i }))

        expect(calculateRemote).toHaveBeenCalledWith(Number(a), Number(b), op)
    })

    it('[CALC-004] shows error message when API rejects with divide by zero', async () => {
        vi.mocked(calculateRemote).mockRejectedValue(new Error('Cannot divide by zero'))
        const user = userEvent.setup()
        render(<App />)

        await user.type(screen.getByLabelText(/first number/i), '10')
        await user.selectOptions(screen.getByLabelText(/operator/i), '/')
        await user.type(screen.getByLabelText(/second number/i), '0')
        await user.click(screen.getByRole('button', { name: /calculate/i }))

        expect(await screen.findByText(/cannot divide by zero/i)).toBeInTheDocument()
    })

    it('[CALC-005] handles a sequence of chained calculations', async () => {
        vi.mocked(calculateRemote)
            .mockResolvedValueOnce(2)
            .mockResolvedValueOnce(7)
            .mockResolvedValueOnce(30)
            .mockRejectedValueOnce(new Error('Cannot divide by zero'))
            .mockResolvedValueOnce(5)
            .mockResolvedValueOnce(12)

        const user = userEvent.setup()
        render(<App />)

        const numA = screen.getByLabelText(/first number/i)
        const numB = screen.getByLabelText(/second number/i)
        const opSelect = screen.getByLabelText(/operator/i)
        const calculateBtn = screen.getByRole('button', { name: /calculate/i })

        // 5 - 3 = 2
        await user.type(numA, '5')
        await user.selectOptions(opSelect, '-')
        await user.type(numB, '3')
        await user.click(calculateBtn)
        expect(await screen.findByText(/result:\s*2/i)).toBeInTheDocument()

        // Change numA to 10 — result clears
        await user.clear(numA)
        await user.type(numA, '10')
        expect(screen.getByText(/result:\s*—/i)).toBeInTheDocument()

        // 10 - 3 = 7
        await user.click(calculateBtn)
        expect(await screen.findByText(/result:\s*7/i)).toBeInTheDocument()

        // 10 * 3 = 30
        await user.selectOptions(opSelect, '*')
        await user.click(calculateBtn)
        expect(await screen.findByText(/result:\s*30/i)).toBeInTheDocument()

        // Change numB to 0 — result clears
        await user.clear(numB)
        await user.type(numB, '0')
        expect(screen.getByText(/result:\s*—/i)).toBeInTheDocument()

        // 10 / 0 = error
        await user.selectOptions(opSelect, '/')
        await user.click(calculateBtn)
        expect(await screen.findByText(/cannot divide by zero/i)).toBeInTheDocument()

        // Change numB to 2 — result clears
        await user.clear(numB)
        await user.type(numB, '2')
        expect(screen.getByText(/result:\s*—/i)).toBeInTheDocument()

        // 10 / 2 = 5
        await user.click(calculateBtn)
        expect(await screen.findByText(/result:\s*5/i)).toBeInTheDocument()

        // 10 + 2 = 12 (manual test had typo: said 7)
        await user.selectOptions(opSelect, '+')
        await user.click(calculateBtn)
        expect(await screen.findByText(/result:\s*12/i)).toBeInTheDocument()

        expect(calculateRemote).toHaveBeenCalledTimes(6)
    })

    it('[CALC-006] shows error message when API is unreachable', async () => {
        vi.mocked(calculateRemote).mockRejectedValue(
            new Error('Cannot reach the calculator service. Is it running?')
        )
        const user = userEvent.setup()
        render(<App />)

        await user.type(screen.getByLabelText(/first number/i), '7')
        await user.type(screen.getByLabelText(/second number/i), '3')
        await user.click(screen.getByRole('button', { name: /calculate/i }))

        expect(
            await screen.findByText(/cannot reach the calculator service/i)
        ).toBeInTheDocument()
    })

    it('[CALC-007] disables the Calculate button while a request is pending', async () => {
        // A Promise that never resolves — keeps the button in loading state
        vi.mocked(calculateRemote).mockReturnValue(new Promise(() => {}))
        const user = userEvent.setup()
        render(<App />)

        await user.type(screen.getByLabelText(/first number/i), '7')
        await user.type(screen.getByLabelText(/second number/i), '3')
        await user.click(screen.getByRole('button', { name: /calculate/i }))

        const calculatingButton = await screen.findByRole('button', { name: /calculating/i })
        expect(calculatingButton).toBeDisabled()
    })

    it.each([
        { a: '',  b: '',  op: '+', label: 'both fields are empty' },
        { a: '5', b: '',  op: '+', label: 'only the second field is empty' },
        { a: '',  b: '5', op: '+', label: 'only the first field is empty' },
        { a: '',  b: '',  op: '*', label: 'both fields are empty with a non-default operator' },
    ])('[CALC-008] shows validation when $label', async ({ a, b, op }) => {
        const user = userEvent.setup()
        render(<App />)

        if (a) await user.type(screen.getByLabelText(/first number/i), a)
        if (b) await user.type(screen.getByLabelText(/second number/i), b)
        await user.selectOptions(screen.getByLabelText(/operator/i), op)
        await user.click(screen.getByRole('button', { name: /calculate/i }))

        expect(
            screen.getByText(/please enter valid numbers in both fields/i)
        ).toBeInTheDocument()
        expect(calculateRemote).not.toHaveBeenCalled()
    })

    it('[CALC-009] resets the result when the user types after a calculation', async () => {
        vi.mocked(calculateRemote).mockResolvedValue(10)
        const user = userEvent.setup()
        render(<App />)

        await user.type(screen.getByLabelText(/first number/i), '7')
        await user.type(screen.getByLabelText(/second number/i), '3')
        await user.click(screen.getByRole('button', { name: /calculate/i }))
        expect(await screen.findByText(/result:\s*10/i)).toBeInTheDocument()

        await user.type(screen.getByLabelText(/first number/i), '5')
        expect(screen.getByText(/result:\s*—/i)).toBeInTheDocument()
    })

    it('[CALC-010] validation reappears in chained context after clearing inputs', async () => {
        vi.mocked(calculateRemote)
            .mockResolvedValueOnce(50)
            .mockResolvedValueOnce(10)
            .mockResolvedValueOnce(7)

        const user = userEvent.setup()
        render(<App />)

        const numA = screen.getByLabelText(/first number/i)
        const numB = screen.getByLabelText(/second number/i)
        const opSelect = screen.getByLabelText(/operator/i)
        const calculateBtn = screen.getByRole('button', { name: /calculate/i })

        // numA=5, numB empty, op=* → validation
        await user.type(numA, '5')
        await user.selectOptions(opSelect, '*')
        await user.click(calculateBtn)
        expect(screen.getByText(/please enter valid numbers in both fields/i)).toBeInTheDocument()

        // fill numB → 5 * 10 = 50
        await user.type(numB, '10')
        await user.click(calculateBtn)
        expect(await screen.findByText(/result:\s*50/i)).toBeInTheDocument()

        // clear numA → validation
        await user.clear(numA)
        await user.click(calculateBtn)
        expect(screen.getByText(/please enter valid numbers in both fields/i)).toBeInTheDocument()

        // change op to + → validation (numA still empty)
        await user.selectOptions(opSelect, '+')
        await user.click(calculateBtn)
        expect(screen.getByText(/please enter valid numbers in both fields/i)).toBeInTheDocument()

        // fill numA = 0 → 0 + 10 = 10
        await user.type(numA, '0')
        await user.click(calculateBtn)
        expect(await screen.findByText(/result:\s*10/i)).toBeInTheDocument()

        // clear both → validation
        await user.clear(numA)
        await user.clear(numB)
        await user.click(calculateBtn)
        expect(screen.getByText(/please enter valid numbers in both fields/i)).toBeInTheDocument()

        // change op to / → validation
        await user.selectOptions(opSelect, '/')
        await user.click(calculateBtn)
        expect(screen.getByText(/please enter valid numbers in both fields/i)).toBeInTheDocument()

        // fill both → 21 / 3 = 7
        await user.type(numA, '21')
        await user.type(numB, '3')
        await user.click(calculateBtn)
        expect(await screen.findByText(/result:\s*7/i)).toBeInTheDocument()

        expect(calculateRemote).toHaveBeenCalledTimes(3)
    })

    it.each([
        { expression: '7 plus 3',          parsedA: 7,    parsedB: 3,   parsedOp: '+', result: 10,  expectedDisplay: '10' },
        { expression: '10 minus 4',        parsedA: 10,   parsedB: 4,   parsedOp: '-', result: 6,   expectedDisplay: '6'  },
        { expression: '6 times 5',         parsedA: 6,    parsedB: 5,   parsedOp: '*', result: 30,  expectedDisplay: '30' },
        { expression: '20 divided by 4',   parsedA: 20,   parsedB: 4,   parsedOp: '/', result: 5,   expectedDisplay: '5'  },
        { expression: 'tip 10% of 230',    parsedA: 0.1,  parsedB: 230, parsedOp: '*', result: 23,  expectedDisplay: '23' },
    ])('[CALC-011] parses "$expression" and shows result $expectedDisplay', async ({ expression, parsedA, parsedB, parsedOp, result, expectedDisplay }) => {
        vi.mocked(parseExpression).mockResolvedValue({ a: parsedA, b: parsedB, op: parsedOp as Operator })
        vi.mocked(calculateRemote).mockResolvedValue(result)
        const user = userEvent.setup()
        render(<App />)

        await user.type(screen.getByLabelText(/expression/i), expression)
        await user.click(screen.getByRole('button', { name: /solve/i }))

        expect(await screen.findByText(new RegExp(`result:\\s*${expectedDisplay}`, 'i'))).toBeInTheDocument()
        expect(parseExpression).toHaveBeenCalledWith(expression)
        expect(calculateRemote).toHaveBeenCalledWith(parsedA, parsedB, parsedOp)
    })

    it.each([
        '7plus3',
        '15% discount on 200',
        '7*3',
    ])('[CALC-012] shows error when parser rejects "%s"', async (expression) => {
        vi.mocked(parseExpression).mockRejectedValue(
            new Error("Sorry, I couldn't understand that. Try '7 plus 3' or '15% of 80'.")
        )
        const user = userEvent.setup()
        render(<App />)

        await user.type(screen.getByLabelText(/expression/i), expression)
        await user.click(screen.getByRole('button', { name: /solve/i }))

        expect(await screen.findByText(/sorry, i couldn't understand/i)).toBeInTheDocument()
        expect(calculateRemote).not.toHaveBeenCalled()
    })

    it('[CALC-013] shows validation when expression is empty', async () => {
        const user = userEvent.setup()
        render(<App />)

        await user.click(screen.getByRole('button', { name: /solve/i }))

        expect(screen.getByText(/please enter an expression/i)).toBeInTheDocument()
        expect(parseExpression).not.toHaveBeenCalled()
        expect(calculateRemote).not.toHaveBeenCalled()
    })

    it('[CALC-014] disables the Solve button while parsing is pending', async () => {
        vi.mocked(parseExpression).mockReturnValue(new Promise(() => {}))
        const user = userEvent.setup()
        render(<App />)

        await user.type(screen.getByLabelText(/expression/i), '7 plus 3')
        await user.click(screen.getByRole('button', { name: /solve/i }))

        const solvingButton = await screen.findByRole('button', { name: /solving/i })
        expect(solvingButton).toBeDisabled()
    })

    it.each<{
        action: string
        perform: (user: ReturnType<typeof userEvent.setup>) => Promise<void>
    }>([
        {
            action: 'typing in first number',
            perform: (user) => user.type(screen.getByLabelText(/first number/i), '5'),
        },
        {
            action: 'typing in second number',
            perform: (user) => user.type(screen.getByLabelText(/second number/i), '5'),
        },
        {
            action: 'changing the operator',
            perform: (user) => user.selectOptions(screen.getByLabelText(/operator/i), '*'),
        },
    ])('[CALC-015] clears expression when $action', async ({ perform }) => {
        const user = userEvent.setup()
        render(<App />)

        const expressionInput = screen.getByLabelText(/expression/i) as HTMLInputElement
        await user.type(expressionInput, '7 plus 3')
        expect(expressionInput.value).toBe('7 plus 3')

        await perform(user)
        expect(expressionInput.value).toBe('')
    })

    it('[CALC-016] clears number inputs and resets operator when typing in expression', async () => {
        const user = userEvent.setup()
        render(<App />)

        const numA = screen.getByLabelText(/first number/i) as HTMLInputElement
        const numB = screen.getByLabelText(/second number/i) as HTMLInputElement
        const opSelect = screen.getByLabelText(/operator/i) as HTMLSelectElement

        await user.type(numA, '5')
        await user.type(numB, '3')
        await user.selectOptions(opSelect, '*')

        expect(numA.value).toBe('5')
        expect(numB.value).toBe('3')
        expect(opSelect.value).toBe('*')

        await user.type(screen.getByLabelText(/expression/i), 'x')

        expect(numA.value).toBe('')
        expect(numB.value).toBe('')
        expect(opSelect.value).toBe('+')
    })

    it('[CALC-017] rejects pasted non-numeric text in number inputs', async () => {
        const user = userEvent.setup()
        render(<App />)

        const numA = screen.getByLabelText(/first number/i) as HTMLInputElement

        await user.click(numA)
        await user.paste('abc')

        // Production browsers reject non-numeric paste in type=number inputs.
        // JSDOM mimics this; if a future JSDOM version doesn't, this assertion
        // would alert us to the divergence.
        expect(numA.value).toBe('')

        await user.click(screen.getByRole('button', { name: /calculate/i }))

        // User-facing outcome: validation appears (Number('abc') is NaN, or field stayed empty)
        expect(screen.getByText(/please enter valid numbers in both fields/i)).toBeInTheDocument()
        expect(calculateRemote).not.toHaveBeenCalled()
    })

    it('[CALC-018] accepts pasted valid numbers', async () => {
        vi.mocked(calculateRemote).mockResolvedValue(10)
        const user = userEvent.setup()
        render(<App />)

        await user.click(screen.getByLabelText(/first number/i))
        await user.paste('5')
        await user.click(screen.getByLabelText(/second number/i))
        await user.paste('5')
        await user.click(screen.getByRole('button', { name: /calculate/i }))

        expect(await screen.findByText(/result:\s*10/i)).toBeInTheDocument()
        expect(calculateRemote).toHaveBeenCalledWith(5, 5, '+')
    })

    it('[CALC-019] does not process duplicate requests on rapid double-click', async () => {
        let resolveFn!: (value: number) => void
        vi.mocked(calculateRemote).mockReturnValueOnce(
            new Promise<number>((resolve) => { resolveFn = resolve })
        )

        const user = userEvent.setup()
        render(<App />)

        await user.type(screen.getByLabelText(/first number/i), '5')
        await user.type(screen.getByLabelText(/second number/i), '3')
        const calculateBtn = screen.getByRole('button', { name: /calculate/i })

        await user.click(calculateBtn)
        await user.click(calculateBtn)

        expect(calculateRemote).toHaveBeenCalledTimes(1)

        resolveFn(8)
        expect(await screen.findByText(/result:\s*8/i)).toBeInTheDocument()
    })

    it('[CALC-020] has no accessibility violations', async () => {
        const { container } = render(<App />)
        const results = await axe(container)
        expect(results).toHaveNoViolations()
    })

    it('[CALC-021] hints "did you mean Solve?" when numbers are empty but the expression has text', async () => {
        const user = userEvent.setup()
        render(<App />)

        // Typing in the expression field clears both number inputs (see CALC-016),
        // so this naturally produces "both numbers empty + expression filled".
        await user.type(screen.getByLabelText(/expression/i), '7 plus 3')
        await user.click(screen.getByRole('button', { name: /calculate/i }))

        expect(
            screen.getByText(/the number fields are empty\. did you mean to click solve\?/i)
        ).toBeInTheDocument()
        expect(calculateRemote).not.toHaveBeenCalled()
    })

    it('[CALC-022] hints "did you mean Calculate?" when the expression is empty but a number is filled', async () => {
        const user = userEvent.setup()
        render(<App />)

        // Typing in a number field clears the expression (see CALC-015),
        // so this naturally produces "expression empty + a number filled".
        await user.type(screen.getByLabelText(/first number/i), '5')
        await user.click(screen.getByRole('button', { name: /solve/i }))

        expect(
            screen.getByText(/the expression field is empty\. did you mean to click calculate\?/i)
        ).toBeInTheDocument()
        expect(parseExpression).not.toHaveBeenCalled()
        expect(calculateRemote).not.toHaveBeenCalled()
    })

    it('[CALC-023] shows the unknown-error fallback when Calculate rejects with a non-Error', async () => {
        // A thrown value that is not an Error instance (e.g. a string) must fall
        // through to the generic fallback rather than surfacing as "[object …]".
        vi.mocked(calculateRemote).mockRejectedValue('boom')
        const user = userEvent.setup()
        render(<App />)

        await user.type(screen.getByLabelText(/first number/i), '7')
        await user.type(screen.getByLabelText(/second number/i), '3')
        await user.click(screen.getByRole('button', { name: /calculate/i }))

        expect(
            await screen.findByText(new RegExp(`result:\\s*${messages.unknownError}`, 'i'))
        ).toBeInTheDocument()
    })

    it('[CALC-024] shows the unknown-error fallback when Solve rejects with a non-Error', async () => {
        vi.mocked(parseExpression).mockRejectedValue('boom')
        const user = userEvent.setup()
        render(<App />)

        await user.type(screen.getByLabelText(/expression/i), '7 plus 3')
        await user.click(screen.getByRole('button', { name: /solve/i }))

        expect(
            await screen.findByText(new RegExp(`result:\\s*${messages.unknownError}`, 'i'))
        ).toBeInTheDocument()
        expect(calculateRemote).not.toHaveBeenCalled()
    })
})

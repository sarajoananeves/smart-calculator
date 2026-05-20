import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { beforeEach, vi } from 'vitest'
import App from './App'
import { calculateRemote } from './api'

vi.mock('./api')

describe('App', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the calculator heading', () => {
        render(<App />)
        expect(
            screen.getByRole('heading', { name: /smart calculator/i })
        ).toBeInTheDocument()
    })

    it('shows the result returned by the API', async () => {
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
    ])('passes correct args to calculateRemote for $a $op $b', async ({ a, op, b }) => {
        vi.mocked(calculateRemote).mockResolvedValue(0)
        const user = userEvent.setup()
        render(<App />)

        await user.type(screen.getByLabelText(/first number/i), a)
        await user.selectOptions(screen.getByLabelText(/operator/i), op)
        await user.type(screen.getByLabelText(/second number/i), b)
        await user.click(screen.getByRole('button', { name: /calculate/i }))

        expect(calculateRemote).toHaveBeenCalledWith(Number(a), Number(b), op)
    })

    it('shows error message when API rejects with divide by zero', async () => {
        vi.mocked(calculateRemote).mockRejectedValue(new Error('Cannot divide by zero'))
        const user = userEvent.setup()
        render(<App />)

        await user.type(screen.getByLabelText(/first number/i), '10')
        await user.selectOptions(screen.getByLabelText(/operator/i), '/')
        await user.type(screen.getByLabelText(/second number/i), '0')
        await user.click(screen.getByRole('button', { name: /calculate/i }))

        expect(await screen.findByText(/cannot divide by zero/i)).toBeInTheDocument()
    })

    it('shows error message when API is unreachable', async () => {
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

    it('disables the Calculate button while a request is pending', async () => {
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
    ])('shows validation when $label', async ({ a, b, op }) => {
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

    it('resets the result when the user types after a calculation', async () => {
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

    it('has no accessibility violations', async () => {
        const { container } = render(<App />)
        const results = await axe(container)
        expect(results).toHaveNoViolations()
    })
})
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import App from './App'

describe('App', () => {
    it('renders the calculator heading', () => {
        render(<App />)
        expect(
            screen.getByRole('heading', { name: /smart calculator/i })
        ).toBeInTheDocument()
    })

    it.each([
        { a: '7',   op: '+', b: '3',   expected: '10' },
        { a: '7',   op: '-', b: '3',   expected: '4'  },
        { a: '7',   op: '*', b: '3',   expected: '21' },
        { a: '8',   op: '/', b: '2',   expected: '4'  },
        { a: '5.5', op: '+', b: '2.5', expected: '8'  },
        { a: '-5',  op: '+', b: '3',   expected: '-2' },
        { a: '1.5', op: '*', b: '2',   expected: '3'  },
        { a: '-10', op: '/', b: '2',   expected: '-5' },
        { a: '0',   op: '+', b: '5',   expected: '5'  },
        { a: '0',   op: '*', b: '5',   expected: '0'  },
        { a: '0',   op: '/', b: '5',   expected: '0'  },
        { a: '5',   op: '-', b: '5',   expected: '0'  },
    ])('calculates $a $op $b = $expected', async ({ a, op, b, expected }) => {
        const user = userEvent.setup()
        render(<App />)

        await user.type(screen.getByLabelText(/first number/i), a)
        await user.selectOptions(screen.getByLabelText(/operator/i), op)
        await user.type(screen.getByLabelText(/second number/i), b)
        await user.click(screen.getByRole('button', { name: /calculate/i }))

        expect(
            screen.getByText(new RegExp(`result:\\s*${expected}`, 'i'))
        ).toBeInTheDocument()
    })

    it('shows error message when dividing by zero', async () => {
        const user = userEvent.setup()
        render(<App />)

        await user.type(screen.getByLabelText(/first number/i), '10')
        await user.selectOptions(screen.getByLabelText(/operator/i), '/')
        await user.type(screen.getByLabelText(/second number/i), '0')
        await user.click(screen.getByRole('button', { name: /calculate/i }))

        expect(screen.getByText(/cannot divide by zero/i)).toBeInTheDocument()
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
    })

    it('resets the result when the user types after a calculation', async () => {
        const user = userEvent.setup()
        render(<App />)

        // Step 1: calculate something to set a real result
        await user.type(screen.getByLabelText(/first number/i), '7')
        await user.type(screen.getByLabelText(/second number/i), '3')
        await user.click(screen.getByRole('button', { name: /calculate/i }))
        expect(screen.getByText(/result:\s*10/i)).toBeInTheDocument()

        // Step 2: type in an input and confirm the result resets
        await user.type(screen.getByLabelText(/first number/i), '5')
        expect(screen.getByText(/result:\s*—/i)).toBeInTheDocument()
    })

    it('has no accessibility violations', async () => {
        const { container } = render(<App />)
        const results = await axe(container)
        expect(results).toHaveNoViolations()
    })
})
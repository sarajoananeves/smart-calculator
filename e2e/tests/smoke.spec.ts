import { test, expect } from '@playwright/test'

const WEBKIT_SKIP_REASON = 'WebKit/Safari skips buttons in default tab navigation — a documented platform behavior, not an app bug'

test.describe('Smart Calculator — smoke', () => {

    test('[CALC-710] core flows work in this browser', async ({ page }) => {
        // Track console errors throughout the test
        const consoleErrors: string[] = []
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                const text = msg.text()
                // Expected: 422 from divide-by-zero is part of the test flow
                if (text.includes('status of 422')) return
                consoleErrors.push(text)
            }
        })

        // Step 1: Open the app
        await page.goto('/')
        await expect(page.getByRole('heading', { name: /smart calculator/i })).toBeVisible()

        // Step 2: 7 + 3 = 10
        await page.getByLabel(/first number/i).fill('7')
        await page.getByLabel(/second number/i).fill('3')
        await page.getByRole('button', { name: /calculate/i }).click()
        await expect(page.getByText(/result:\s*10/i)).toBeVisible()

        // Step 3: 10 / 0 → "Cannot divide by zero"
        await page.getByLabel(/first number/i).fill('10')
        await page.getByLabel(/operator/i).selectOption('/')
        await page.getByLabel(/second number/i).fill('0')
        await page.getByRole('button', { name: /calculate/i }).click()
        await expect(page.getByText(/cannot divide by zero/i)).toBeVisible()

        // Step 4: Click Calculate with empty fields → validation
        await page.getByLabel(/first number/i).fill('')
        await page.getByLabel(/second number/i).fill('')
        await page.getByRole('button', { name: /calculate/i }).click()
        await expect(page.getByText(/please enter valid numbers in both fields/i)).toBeVisible()

        // Step 5: No JavaScript errors throughout the test
        expect(consoleErrors).toEqual([])
    })

    test('[CALC-701] tab navigation works in this browser', async ({ page, browserName }) => {
        test.skip(browserName === 'webkit', WEBKIT_SKIP_REASON)

        // Fresh page load — focus state is clean
        await page.goto('/')

        await page.keyboard.press('Tab')
        await expect(page.getByLabel(/first number/i)).toBeFocused()

        await page.keyboard.press('Tab')
        await expect(page.getByLabel(/operator/i)).toBeFocused()

        await page.keyboard.press('Tab')
        await expect(page.getByLabel(/second number/i)).toBeFocused()

        await page.keyboard.press('Tab')
        await expect(page.getByRole('button', { name: /calculate/i })).toBeFocused()

        await page.keyboard.press('Tab')
        await expect(page.getByLabel(/expression/i)).toBeFocused()

        await page.keyboard.press('Tab')
        await expect(page.getByRole('button', { name: /solve/i })).toBeFocused()
    })

    test('[CALC-704] full smart-input calculation via keyboard only', async ({ page, browserName }) => {
        test.skip(browserName === 'webkit', WEBKIT_SKIP_REASON,)

        await page.goto('/')

        // Tab past calculator-form controls to reach Expression input
        await page.keyboard.press('Tab')  // First number
        await page.keyboard.press('Tab')  // Operator
        await page.keyboard.press('Tab')  // Second number
        await page.keyboard.press('Tab')  // Calculate button
        await page.keyboard.press('Tab')  // Expression input
        await expect(page.getByLabel(/expression/i)).toBeFocused()

        // Type the expression
        await page.keyboard.type('7 plus 3')

        // Tab to Solve, press Enter
        await page.keyboard.press('Tab')
        await expect(page.getByRole('button', { name: /solve/i })).toBeFocused()
        await page.keyboard.press('Enter')

        // Expect Result: 10
        await expect(page.getByText(/result:\s*10/i)).toBeVisible()
    })
})
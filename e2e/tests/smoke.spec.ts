import { test, expect } from '@playwright/test'

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

    test('[CALC-711] tab navigation works in this browser', async ({ page, browserName }) => {
        test.skip(browserName === 'webkit', 'WebKit skips buttons in tab navigation by default — known Safari behavior')

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
})
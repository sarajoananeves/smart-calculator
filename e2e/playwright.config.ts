import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 1,
    reporter: 'list',

    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],

    webServer: [
        {
            command: 'cd ../backend && ./mvnw spring-boot:run',
            url: 'http://localhost:8081/api/health',
            reuseExistingServer: !process.env.CI,
            timeout: 300_000,
            stdout: 'pipe',
            stderr: 'pipe',
        },
        {
            command: 'cd .. && npm run dev',
            url: 'http://localhost:5173',
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
            stdout: 'ignore',
            stderr: 'pipe',
        },
    ],
})
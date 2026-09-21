import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/browser',
    testMatch: '*.spec.ts',
    workers: 1,
    timeout: 60_000,
    use: {
        baseURL: 'http://127.0.0.1:8017',
        channel: process.env.PLAYWRIGHT_CHANNEL ?? 'msedge',
        headless: true,
    },
    webServer: {
        command: 'node tests/browser/server.mjs',
        url: 'http://127.0.0.1:8017/login',
        timeout: 60_000,
        reuseExistingServer: false,
        stderr: 'ignore',
    },
});

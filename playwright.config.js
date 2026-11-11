import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.js',

  fullyParallel: false,
  workers: 1,
  reporter: 'list',

  use: {
    browserName: 'chromium',
    headless: false,

    baseURL: 'http://127.0.0.1:5173/todo-hyperframes/',

    viewport: {
      width: 1400,
      height: 900,
    },

    launchOptions: {
      slowMo: 500,
    },

    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
    url: 'http://127.0.0.1:5173/todo-hyperframes/',
    reuseExistingServer: true,
    timeout: 30000,
  },
});

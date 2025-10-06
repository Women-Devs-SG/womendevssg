import type { PlaywrightTestConfig } from '@playwright/test';
import 'dotenv/config';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4321';

const config: PlaywrightTestConfig = {
  timeout: 120_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results', open: 'never' }],
  ],
  use: {
    baseURL: BASE_URL,
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
};

export default config;

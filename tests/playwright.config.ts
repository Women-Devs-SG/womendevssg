import type { PlaywrightTestConfig } from '@playwright/test';
import 'dotenv/config';
import * as path from 'path';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4321';

const config: PlaywrightTestConfig = {
  // e2e specs only; unit specs have their own config in tests/unit
  testDir: 'e2e',
  // screenshots, traces and the HTML report all go to tests/test-results (git-ignored)
  outputDir: path.join(__dirname, 'test-results', 'artifacts'),
  timeout: 120_000,
  retries: process.env.CI ? 2 : 0,
  // run tests sequentially to prevent e2e tests from failing
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(__dirname, 'test-results', 'report'), open: 'never' }],
  ],
  use: {
    baseURL: BASE_URL,
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    cwd: path.resolve(__dirname, '..'), // run the dev server from the project root
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
};

export default config;

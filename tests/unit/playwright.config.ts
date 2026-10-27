import type { PlaywrightTestConfig } from '@playwright/test';
import * as path from 'path';

// Unit tests only: no browser and no dev server (unlike tests/playwright.config.ts)
const config: PlaywrightTestConfig = {
  testDir: '.',
  outputDir: path.join(__dirname, '..', 'test-results', 'unit-artifacts'),
  timeout: 30_000,
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(__dirname, '..', 'test-results', 'unit-report'), open: 'never' }],
  ],
};

export default config;

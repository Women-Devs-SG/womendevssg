import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const MEMBERS_DIR = path.join(process.cwd(), 'src', 'content', 'members');
const SOCIAL_ICONS_FILE = path.join(process.cwd(), 'src', 'assets', 'socialIcons.ts');
const TEMP_MEMBER_FILE = path.join(MEMBERS_DIR, 'e2e-temp-member.md');

function extractIconKeys(source: string): string[] {
  // crude parse: capture keys like `KeyName: `<svg ...` on start of line
  const keys: string[] = [];
  const re = /^\s*([A-Za-z0-9_]+):\s*`<svg/mg;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    const k = m[1];
    if (k && !keys.includes(k)) keys.push(k);
  }
  return keys;
}

async function writeTempMember(keys: string[], name = 'E2E Temp Member') {
  const socialsBlock = keys
    .map((k) => `  - name: "${k}"\n    href: "https://example.com/${encodeURIComponent(k.toLowerCase())}"`)
    .join('\n');

  const content = `---\nname: "${name}"\nbio: "E2E test member for social icon rendering"\ncore: false\nsocials:\n${socialsBlock}\n---\n`;
  await fs.promises.writeFile(TEMP_MEMBER_FILE, content, 'utf8');
}

async function cleanupTempMember() {
  try { await fs.promises.unlink(TEMP_MEMBER_FILE); } catch {}
}

test.describe('Member social icons rendering', () => {
  test.beforeEach(async () => {
    // ensure dir exists
    await fs.promises.mkdir(MEMBERS_DIR, { recursive: true });

    const src = await fs.promises.readFile(SOCIAL_ICONS_FILE, 'utf8');
    const keys = extractIconKeys(src);

    // Ensure keys exists and include a couple expected ones
    expect(keys.length).toBeGreaterThan(0);

    await writeTempMember(keys);
  });

  test.afterEach(async () => {
    await cleanupTempMember();
  });

  test('all available social icons render as clickable links on member card', async ({ page }) => {
    await page.goto('/members');

    // Find our temp member card by name heading
    const card = page.locator('.member-profile', { has: page.getByRole('heading', { name: 'E2E Temp Member' }) });
    await expect(card).toBeVisible();

    // Fetch the keys again (from file) to assert links on the rendered page
    const src = await fs.promises.readFile(SOCIAL_ICONS_FILE, 'utf8');
    const keys = extractIconKeys(src);

    for (const key of keys) {
      const url = `https://example.com/${encodeURIComponent(key.toLowerCase())}`;
      const link = card.locator(`a[title="${key}"]`);
      await expect(link, `Missing link for ${key}`).toHaveAttribute('href', url);
      // Also ensure an SVG is present inside link
      await expect(link.locator('svg')).toHaveCount(1);
    }
  });
});

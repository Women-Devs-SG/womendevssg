import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

type MockPost = { file: string; title: string; description: string; draft?: boolean };

// Unusual words so the fuzzy search (Fuse, threshold 0.5) can't match real posts by accident
const MOCK_POSTS: MockPost[] = [
  {
    file: 'e2e-mock-zebrafish.md',
    title: 'Zebrafish Quantum Gardening',
    description: 'A mock post about zebrafish gardening for e2e search tests',
  },
  {
    file: 'e2e-mock-pineapple.md',
    title: 'Pineapple Telescope Handbook',
    description: 'A mock post about pineapple telescopes for e2e search tests',
  },
  {
    file: 'e2e-mock-draft.md',
    title: 'Narwhal Origami Secrets',
    description: 'A mock draft post that must never be searchable',
    draft: true,
  },
];

const postPath = (p: MockPost) => path.join(BLOG_DIR, p.file);

async function writeMockPost(p: MockPost) {
  const content = [
    '---',
    'author: E2E Tester',
    'pubDatetime: 2024-01-01T00:00:00Z',
    `title: "${p.title}"`,
    `draft: ${p.draft ? 'true' : 'false'}`,
    'tags:',
    '  - e2e',
    `description: "${p.description}"`,
    '---',
    '',
    'Mock content for e2e tests.',
    '',
  ].join('\n');
  await fs.promises.writeFile(postPath(p), content, 'utf8');
}

async function removeMockPosts() {
  await Promise.all(MOCK_POSTS.map((p) => fs.promises.rm(postPath(p), { force: true })));
}

// The dev server needs a moment to pick up new/removed content files,
// so reload the search page until the expectation holds.
async function searchFor(page: Page, query: string, expectation: () => Promise<void>) {
  await expect(async () => {
    await page.goto('/search');
    await page.getByPlaceholder('Search for anything...').fill(query);
    await expectation();
  }).toPass({ timeout: 30_000 });
}

// Open /search and wait until React has hydrated, so typing is not wiped by hydration
async function openSearchHydrated(page: Page, url = '/search') {
  await expect(async () => {
    await page.goto(url);
    await expect(page.locator('astro-island[client="load"]:not([ssr])').first()).toBeAttached({ timeout: 2000 });
  }).toPass({ timeout: 30_000 });
  // Search.tsx moves the caret to the end of the box 50ms after mount (setTimeout);
  // typing before that makes characters land at the start, so let it settle first.
  await page.waitForTimeout(150);
  return page.getByPlaceholder('Search for anything...');
}

// Tests share the same mock files, so run them one after another
test.describe.configure({ mode: 'serial' });

test.describe('Search page', () => {
  test.beforeEach(async () => {
    await fs.promises.mkdir(BLOG_DIR, { recursive: true });
    await removeMockPosts(); // clear leftovers from an interrupted run
    await Promise.all(MOCK_POSTS.map(writeMockPost));
  });

  test.afterEach(async () => {
    await removeMockPosts();
  });

  test.afterAll(async () => {
    await removeMockPosts();
  });

  test('loads with an empty search box and no results', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByPlaceholder('Search for anything...')).toBeVisible();
    await expect(page.getByText(/^Found \d+/)).toHaveCount(0);
  });

  test('returns a result for an existing page title', async ({ page }) => {
    await searchFor(page, 'Zebrafish Quantum', async () => {
      await expect(page.getByRole('heading', { name: 'Zebrafish Quantum Gardening' })).toBeVisible({ timeout: 2000 });
    });
    await expect(page.getByText(/Found \d+ results? for 'Zebrafish Quantum'/)).toBeVisible();
  });

  test('returns a result when searching by description', async ({ page }) => {
    await searchFor(page, 'pineapple telescopes', async () => {
      await expect(page.getByRole('heading', { name: 'Pineapple Telescope Handbook' })).toBeVisible({ timeout: 2000 });
    });
  });

  test('result links to the blog post', async ({ page }) => {
    await searchFor(page, 'Pineapple Telescope', async () => {
      await expect(page.getByRole('link', { name: 'Pineapple Telescope Handbook' })).toBeVisible({ timeout: 2000 });
    });
    await expect(page.getByRole('link', { name: 'Pineapple Telescope Handbook' })).toHaveAttribute(
      'href',
      '/blog/e2e-mock-pineapple/'
    );
  });

  test('search term in the URL (?q=) is pre-filled and searched', async ({ page }) => {
    await expect(async () => {
      await page.goto('/search?q=Zebrafish%20Quantum');
      await expect(page.getByPlaceholder('Search for anything...')).toHaveValue('Zebrafish Quantum');
      await expect(page.getByRole('heading', { name: 'Zebrafish Quantum Gardening' })).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 30_000 });
  });

  test('shows no results for a term that matches no page', async ({ page }) => {
    const query = 'kjhgfdsapoiuytrewqmnbvcxz';
    // searchFor retries, because filling the box before React hydrates (client:load) gets overwritten
    await searchFor(page, query, async () => {
      await expect(page.getByText(`Found 0 results for '${query}'`)).toBeVisible({ timeout: 2000 });
    });
    await expect(page.locator('main ul li')).toHaveCount(0);
  });

  test('does not show a draft page in search results', async ({ page }) => {
    // First wait until the published mock posts are searchable (proves content was synced)...
    await searchFor(page, 'Zebrafish Quantum', async () => {
      await expect(page.getByRole('heading', { name: 'Zebrafish Quantum Gardening' })).toBeVisible({ timeout: 2000 });
    });
    // ...then the draft must be absent
    await page.getByPlaceholder('Search for anything...').fill('Narwhal Origami Secrets');
    await expect(page.getByRole('heading', { name: 'Narwhal Origami Secrets' })).toHaveCount(0);
  });

  test('does not show a page that has been removed', async ({ page }) => {
    // Present first
    await searchFor(page, 'Pineapple Telescope', async () => {
      await expect(page.getByRole('heading', { name: 'Pineapple Telescope Handbook' })).toBeVisible({ timeout: 2000 });
    });

    // Remove the page, then reload until the site no longer lists it
    await fs.promises.rm(postPath(MOCK_POSTS[1]), { force: true });
    await searchFor(page, 'Pineapple Telescope', async () => {
      await expect(page.getByRole('heading', { name: 'Pineapple Telescope Handbook' })).toHaveCount(0, { timeout: 2000 });
    });

    // The other page is still searchable
    await searchFor(page, 'Zebrafish Quantum', async () => {
      await expect(page.getByRole('heading', { name: 'Zebrafish Quantum Gardening' })).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('While the user types character by character', () => {
    const ZEBRA = 'Zebrafish Quantum Gardening';
    const resultHeading = (page: Page) => page.getByRole('heading', { name: ZEBRA });

    test('results appear as the user types a matching term', async ({ page }) => {
      // make sure the mock post has been picked up by the dev server
      await searchFor(page, 'Zebrafish', async () => {
        await expect(resultHeading(page)).toBeVisible({ timeout: 2000 });
      });

      const input = await openSearchHydrated(page);
      await input.click();

      // 1 character: search does not start yet
      await input.pressSequentially('Z');
      await expect(page.getByText(/^Found \d+/)).toHaveCount(0);
      await expect(resultHeading(page)).toHaveCount(0);

      // keep typing: results show up
      await input.pressSequentially('ebrafish Quantum', { delay: 50 });
      await expect(page.getByText(/Found \d+ results? for 'Zebrafish Quantum'/)).toBeVisible();
      await expect(resultHeading(page)).toBeVisible();
      await expect(page).toHaveURL(/\/search\?q=Zebrafish\+Quantum$/);
    });

    test('results disappear when the user changes the text to a term that matches nothing', async ({ page }) => {
      await searchFor(page, 'Zebrafish', async () => {
        await expect(resultHeading(page)).toBeVisible({ timeout: 2000 });
      });

      const input = await openSearchHydrated(page);
      await input.click();
      await input.pressSequentially('Zebrafish Quantum', { delay: 30 });
      await expect(resultHeading(page)).toBeVisible();

      // replace it with something that matches nothing
      // (appending text would still fuzzy-match, because Fuse allows partial matches)
      await input.press('ControlOrMeta+A');
      await input.pressSequentially('kjhgfdsapoiuytrewqmnbvcxz', { delay: 30 });
      await expect(page.getByText(/Found 0 results for/)).toBeVisible();
      await expect(resultHeading(page)).toHaveCount(0);
    });

    test('results disappear when the user clears the box', async ({ page }) => {
      await searchFor(page, 'Zebrafish', async () => {
        await expect(resultHeading(page)).toBeVisible({ timeout: 2000 });
      });

      const input = await openSearchHydrated(page);
      await input.click();
      await input.pressSequentially('Zebrafish', { delay: 30 });
      await expect(resultHeading(page)).toBeVisible();

      // delete characters one by one down to a single character
      const backspaces = Array.from({ length: 'Zebrafish'.length - 1 }, () => 'Backspace');
      await backspaces.reduce(
        (previous, key) => previous.then(() => input.press(key)),
        Promise.resolve()
      );
      await expect(input).toHaveValue('Z');
      await expect(page.getByText(/^Found \d+/)).toHaveCount(0);
      await expect(resultHeading(page)).toHaveCount(0);

      // clearing completely also removes the ?q= from the URL
      await input.press('Backspace');
      await expect(page).toHaveURL(/\/search$/);
    });
  });
});

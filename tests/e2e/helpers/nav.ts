import { expect, type Page } from '@playwright/test';

/**
 * Starts on the home page and clicks a link in the header nav, retrying until the URL changes.
 * The dev server can reload the page (e.g. while it optimises dependencies or compiles a page
 * for the first time), which swallows the click; trying again fixes that.
 */
export async function clickNavLink(page: Page, href: string) {
  const urlPattern = new RegExp(`${href.replace(/\/$/, '')}/?$`);
  await expect(async () => {
    await page.goto('/');
    await page.locator(`header a[href="${href}"]`).first().click();
    await expect(page).toHaveURL(urlPattern, { timeout: 10_000 });
  }).toPass({ timeout: 60_000 });
}

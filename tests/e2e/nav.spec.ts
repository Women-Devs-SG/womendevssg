import { test, expect } from '@playwright/test';

// Links in the header (logo + nav menu) (src/components/Header.astro)
const navLinks = ['/','/blog/', '/members/', '/about/', '/sponsors/'];

test.describe('Nav bar links', () => {
  navLinks.forEach((href) => {
    test(`nav link ${href} is not 404 or blank`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto('/');
      const link = page.locator(`header a[href="${href}"]`).first();
      await expect(link, `Nav link ${href} not visible`).toBeVisible();

      await link.click();
      // The site uses Astro <ClientRouter />, so there is no full page load:
      // use a retrying URL assertion instead of waitForURL / waitForResponse.
      await expect(page).toHaveURL(new RegExp(`${href.replace(/\/$/, '')}/?$`));

      // Not an error / 404 (checked with a direct request, not the click's response)
      const response = await page.request.get(href);
      expect(response.status(), `${href} returned ${response.status()}`).toBeLessThan(400);

      // Not blank
      await expect(page.locator('main, #main-content').first(), `${href} rendered blank`).not.toBeEmpty();
      await expect(page.getByRole('heading', { name: /404|not found/i })).toHaveCount(0);
      expect(errors, `JS errors on ${href}`).toEqual([]);
    });
  });
});

import { test, expect } from '@playwright/test';
import { astroVersion, fetchReport } from './helpers/collections-report';
import { clickNavLink } from './helpers/nav';

/**
 * Guards against breaking changes in Astro's content collections API
 * (https://docs.astro.build/en/reference/modules/astro-content/) when the Astro version changes.
 *
 * 1. The API is called on its own through the dev-only endpoint src/pages/e2e/[name].json.ts
 *    and its contract is checked.
 * 2. The Blog and Members pages are opened by clicking the nav bar, and what they show is
 *    compared with what the API returned.
 */

test.describe(`Astro content collections API (astro ${astroVersion})`, () => {
  test('API contract: expected exports exist and return the expected shape', async ({ request }) => {
    const report = await fetchReport(request);
    const why = `Astro ${astroVersion} changed the content collections API`;

    // functions the site imports from "astro:content"
    for (const name of ['getCollection', 'getEntry', 'render', 'defineCollection']) {
      expect(report.astroContentExports, `${why}: "${name}" is no longer exported`).toContain(name);
    }

    // getCollection returns entries
    expect(report.blog.total, `${why}: getCollection("blog") returned nothing`).toBeGreaterThan(0);
    expect(report.members.total, `${why}: getCollection("members") returned nothing`).toBeGreaterThan(0);

    // filter callback still works
    expect(report.blog.filterExcludesDrafts, `${why}: getCollection filter callback`).toBe(true);
    expect(report.blog.published).toBeLessThanOrEqual(report.blog.total);

    // entry shape: id is the slug without a file extension, dates are Date objects
    expect(report.blog.idHasFileExtension, `${why}: blog entry ids now include ".md"`).toBe(false);
    expect(report.members.idHasFileExtension, `${why}: member entry ids now include ".md"`).toBe(false);
    expect(report.blog.pubDatetimeIsDate, `${why}: z.date() no longer gives Date objects`).toBe(true);

    // getEntry returns the same entry
    expect(report.blog.getEntry?.id, `${why}: getEntry("blog", id)`).toBe(report.blog.ids[0]);
    expect(report.members.getEntry?.id, `${why}: getEntry("members", id)`).toBe(report.members.ids[0]);

    // render(entry) returns { Content, headings }
    expect(report.blog.render, `${why}: render(entry) returned nothing`).not.toBeNull();
    expect(['function', 'object'], `${why}: render(entry).Content`).toContain(report.blog.render!.contentType);
    expect(report.blog.render!.headingsIsArray, `${why}: render(entry).headings`).toBe(true);
  });
});

test.describe(`Blog content is loaded from the collection (astro ${astroVersion})`, () => {
  test('clicking Blog in the nav lists the posts returned by getCollection', async ({ page, request }) => {
    const report = await fetchReport(request);

    await clickNavLink(page, '/blog/');

    const titles = page.locator('#main-content ul li h2');
    const expectedOnPage = Math.min(report.site.postPerPage, report.blog.published);
    expect(expectedOnPage, 'API returned no published blog posts').toBeGreaterThan(0);

    await expect(titles, 'Blog page shows a different number of posts than getCollection returned').toHaveCount(
      expectedOnPage
    );

    // every post shown on the page comes from the API result
    const shown = await titles.allInnerTexts();
    for (const title of shown) {
      expect(report.blog.titles, `"${title}" is on the Blog page but not in getCollection("blog")`).toContain(
        title.trim()
      );
    }
  });

  test('opening a post renders its title and markdown body (render())', async ({ page, request }) => {
    const report = await fetchReport(request);

    await clickNavLink(page, '/blog/');

    const firstLink = page.locator('#main-content ul li a').first();
    const title = (await firstLink.locator('h2').innerText()).trim();
    expect(report.blog.titles).toContain(title);

    await firstLink.click();
    await expect(page).toHaveURL(/\/blog\/[^/]+\/?$/, { timeout: 30_000 });
    await expect(page.locator('h1.post-title')).toHaveText(title);
    await expect(page.locator('#article'), 'post body rendered empty').not.toBeEmpty();
  });
});

test.describe(`Members content is loaded from the collection (astro ${astroVersion})`, () => {
  test('clicking Members in the nav lists every member returned by getCollection', async ({ page, request }) => {
    const report = await fetchReport(request);

    await clickNavLink(page, '/members/');

    const cards = page.locator('.profile');
    expect(report.members.total, 'API returned no members').toBeGreaterThan(0);
    await expect(cards, 'Members page shows a different number of members than getCollection returned').toHaveCount(
      report.members.total
    );

    // every member name from the API is on the page
    const shown = (await cards.locator('h2').allInnerTexts()).map(n => n.trim());
    for (const name of report.members.names) {
      expect(shown, `Member "${name}" is in getCollection("members") but missing from the page`).toContain(name);
    }
  });
});

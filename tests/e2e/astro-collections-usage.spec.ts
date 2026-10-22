import { test, expect } from '@playwright/test';
import { astroVersion, fetchReport } from './helpers/collections-report';

/**
 * One group of tests per Astro content API this project uses (found with a search for "astro:content"):
 *
 *   defineCollection + glob() loader + z schema  ->  src/content.config.ts
 *   getCollection("blog" | "members" | "speakers", filter?)  ->  pages and layouts
 *   render(entry)                                ->  src/layouts/PostDetails.astro
 *   CollectionEntry<...> (type only)             ->  checked by `npx astro check`, not at runtime
 *
 * The API result comes from the dev-only endpoint src/pages/e2e/[name].json.ts.
 * Each test compares it with what the page that depends on it shows.
 */

const v = `astro ${astroVersion}`;

test.describe(`defineCollection + glob loader + schema (${v})`, () => {
  test('all three collections are registered and load entries', async ({ request }) => {
    const report = await fetchReport(request);
    expect(report.blog.total, 'blog collection is empty').toBeGreaterThan(0);
    expect(report.members.total, 'members collection is empty').toBeGreaterThan(0);
    expect(report.speakers.total, 'speakers collection is empty').toBeGreaterThan(0);
  });

  test('glob loader: ids come from generateId and exclusion patterns are respected', async ({ request }) => {
    const report = await fetchReport(request);

    // generateId strips ".md"
    [...report.blog.ids, ...report.members.ids, ...report.speakers.ids].forEach(id => {
      expect(id, `entry id "${id}" still has a file extension`).not.toMatch(/\.mdx?$/);
    });

    // pattern: ["**/*.md", "!member.md"]  and  ["**/*.md", "!speaker-tags.md"]
    expect(report.members.ids, 'members: "!member.md" exclusion no longer works').not.toContain('member');
    expect(report.speakers.ids, 'speakers: "!speaker-tags.md" exclusion no longer works').not.toContain('speaker-tags');
  });

  test('z schema: defaults and types are applied', async ({ request }) => {
    const report = await fetchReport(request);
    expect(report.blog.allHaveAuthor, 'schema default for author (SITE.author) is not applied').toBe(true);
    expect(report.blog.allHaveTags, 'schema default for tags (["others"]) is not applied').toBe(true);
    expect(report.blog.pubDatetimeIsDate, 'z.date() no longer returns Date objects').toBe(true);
  });
});

test.describe(`getCollection("blog") (${v})`, () => {
  test('home page (/) shows posts from the collection', async ({ page, request }) => {
    const report = await fetchReport(request);
    // retry: the dev server can reload the page while it optimises dependencies
    let titles: string[] = [];
    await expect(async () => {
      await page.goto('/');
      titles = (await page.locator('#main-content li h2, #main-content li h3').allInnerTexts()).map(t => t.trim());
      expect(titles.length, 'home page shows no posts').toBeGreaterThan(0);
    }).toPass({ timeout: 30_000 });
    titles.forEach(title => {
      expect(report.blog.titles, `"${title}" is on / but not in getCollection("blog")`).toContain(title);
    });
  });

  test('archives page (/archives) lists every published post', async ({ page, request }) => {
    const report = await fetchReport(request);
    await page.goto('/archives');
    await expect(
      page.locator('#main-content li h2, #main-content li h3'),
      'getCollection("blog", filter) result differs from the Archives page'
    ).toHaveCount(report.blog.published);
  });

  test('tags page (/tags) lists every tag used by published posts', async ({ page, request }) => {
    const report = await fetchReport(request);
    await page.goto('/tags');
    const expectedTags = Object.keys(report.blog.tagCounts);
    expect(expectedTags.length).toBeGreaterThan(0);
    await expect(page.locator('#main-content a[href^="/tags/"]')).toHaveCount(expectedTags.length);
  });

  test('a tag page (/tags/<tag>) lists the posts that have that tag', async ({ page, request }) => {
    const report = await fetchReport(request);
    const [tag, count] = Object.entries(report.blog.tagCounts)[0];
    await page.goto(`/tags/${tag}`);
    await expect(
      page.locator('#main-content li h2, #main-content li h3'),
      `tag page for "${tag}"`
    ).toHaveCount(Math.min(count, report.site.postPerPage));
  });

  test('search page (/search?q=) searches titles from the collection', async ({ page, request }) => {
    const report = await fetchReport(request);
    const title = report.blog.titles[0];
    // retry: the search box is a React island, so reload if it failed to hydrate
    await expect(async () => {
      await page.goto(`/search?q=${encodeURIComponent(title)}`);
      await expect(page.getByRole('heading', { name: title, exact: true }).first()).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 30_000 });
  });

  test('about page (/about) shows the featured posts', async ({ page, request }) => {
    const report = await fetchReport(request);
    test.skip(report.blog.featuredTitles.length === 0, 'no featured posts in the collection');
    await page.goto('/about');
    for (const title of report.blog.featuredTitles) {
      await expect(page.getByRole('heading', { name: title, exact: true }).first(), `featured post "${title}"`).toBeVisible();
    }
  });

  test('RSS feed (/rss.xml) has one item per published post', async ({ request }) => {
    const report = await fetchReport(request);
    const response = await request.get('/rss.xml');
    expect(response.ok(), `/rss.xml returned ${response.status()}`).toBe(true);
    const xml = await response.text();
    expect((xml.match(/<item>/g) ?? []).length).toBe(report.blog.published);
    report.blog.titles.forEach(title => {
      // titles are XML-escaped in the feed, so only check ones without special characters
      if (!/[&<>"']/.test(title)) expect(xml, `"${title}" missing from the RSS feed`).toContain(title);
    });
  });

  // Note: this route downloads Google Fonts (src/utils/loadGoogleFont.ts), so it needs internet access.
  test('generated OG image route works for a post without an ogImage', async ({ request }) => {
    const report = await fetchReport(request);
    test.skip(report.blog.generatedOgImageSlugs.length === 0, 'every post defines its own ogImage');
    const response = await request.get(`/blog/${report.blog.generatedOgImageSlugs[0]}/index.png`);
    expect(response.status(), 'OG image route failed (getStaticPaths + getCollection)').toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');
  });
});

test.describe(`render(entry) (${v})`, () => {
  test('every published post page renders its title and a non-empty body', async ({ page, request }) => {
    const report = await fetchReport(request);
    test.setTimeout(180_000);

    for (const [index, id] of report.blog.ids.entries()) {
      await page.goto(`/blog/${id}/`);
      await expect.soft(page.locator('h1.post-title'), `/blog/${id}/ title`).toHaveText(report.blog.titles[index]);
      await expect.soft(page.locator('#article'), `/blog/${id}/ body rendered empty`).not.toBeEmpty();
    }
  });
});

test.describe(`getCollection("members") (${v})`, () => {
  test('members page splits members into leaders and volunteers', async ({ page, request }) => {
    const report = await fetchReport(request);
    await page.goto('/members');

    const leaders = page.locator('h2:has-text("Our leaders") + ul > li');
    const volunteers = page.locator('h2:has-text("Our volunteers") + ul > li');

    await expect(leaders, 'leaders (core members) differ from getCollection("members")').toHaveCount(
      report.members.leaderNames.length
    );
    await expect(volunteers, 'volunteers differ from getCollection("members")').toHaveCount(
      report.members.volunteerNames.length
    );

    const leaderNames = (await leaders.locator('h2').allInnerTexts()).map(n => n.trim());
    report.members.leaderNames.forEach(name => expect(leaderNames, `leader "${name}"`).toContain(name));
  });
});

test.describe(`getCollection("speakers") (${v})`, () => {
  test('speakers page lists the speakers returned by the collection', async ({ page, request }) => {
    const report = await fetchReport(request);
    await page.goto('/speakers');
    await expect(
      page.locator('#main-content ul li.speaker-card-container'),
      'speakers differ from getCollection("speakers")'
    ).toHaveCount(report.speakers.listedNames.length);
  });
});

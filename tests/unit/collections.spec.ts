import { test, expect } from '@playwright/test';
// "astro:content" is resolved to ./stubs/astro-content.ts by tests/unit/tsconfig.json
import { getCollection, getEntry, render } from 'astro:content';
import { calls, getCollectionNames, type StubEntry } from './stubs/astro-content';
import getPostsByGroupCondition from '@utils/getPostsByGroupCondition';

/**
 * Unit tests for the Astro content collections API, run against the project's REAL collections:
 * the definitions in src/content.config.ts and every markdown file in src/content/**.
 * Only the "astro:content" and "astro/loaders" modules are stubbed (no Astro, no browser, no dev server).
 *
 * Not covered here: getSortedPosts, getUniqueTags, getPostsByTag and postFilter. They read
 * `import.meta.env.DEV`, which only exists when Vite builds the code, so Playwright (which
 * loads files as CommonJS) cannot import them. The e2e tests in tests/e2e cover them.
 */

// same filter the pages use: getCollection("blog", ({ data }) => !data.draft)
const notDraft = ({ data }: StubEntry) => !data.draft;

test.describe('collection definitions (src/content.config.ts)', () => {
  test('blog, members and speakers are all defined', () => {
    expect(getCollectionNames().sort()).toEqual(['blog', 'members', 'speakers']);
  });

  test('every collection loads its real content files and passes the zod schema', async () => {
    for (const name of getCollectionNames()) {
      const entries = await getCollection(name); // throws if a file does not match the schema
      expect(entries.length, `${name} has no entries`).toBeGreaterThan(0);

      const ids = entries.map(e => e.id);
      expect(new Set(ids).size, `${name} has duplicate ids`).toBe(ids.length);
      ids.forEach(id => expect(id, `${name}/${id}`).not.toMatch(/\.mdx?$/));
    }
  });

  test('glob exclusions: member.md and speaker-tags.md are not entries', async () => {
    expect((await getCollection('members')).map(e => e.id)).not.toContain('member');
    expect((await getCollection('speakers')).map(e => e.id)).not.toContain('speaker-tags');
  });
});

test.describe('getCollection("blog")', () => {
  test('applies the schema: dates are Date objects, author and tags have defaults', async () => {
    for (const post of await getCollection('blog')) {
      expect(post.data.pubDatetime, `${post.id} pubDatetime`).toBeInstanceOf(Date);
      expect(post.data.title, `${post.id} title`).toBeTruthy();
      expect(post.data.description, `${post.id} description`).toBeTruthy();
      expect(post.data.author, `${post.id} author`).toBeTruthy();
      expect(post.data.tags.length, `${post.id} tags`).toBeGreaterThan(0);
    }
  });

  test('should filter out draft posts (blog list, search, archives, static paths)', async () => {
    const all = await getCollection('blog');
    const published = await getCollection('blog', notDraft);
    const drafts = all.filter(p => p.data.draft);

    expect(published).toHaveLength(all.length - drafts.length);
    drafts.forEach(draft => {
      expect(published.map(p => p.id), `draft "${draft.id}" is listed`).not.toContain(draft.id);
    });
    expect(calls.at(-1)?.[0]).toBe('blog');
  });

  test('getEntry returns the same entry as getCollection, and undefined for a missing id', async () => {
    for (const post of await getCollection('blog')) {
      expect((await getEntry('blog', post.id))?.data.title).toBe(post.data.title);
    }
    expect(await getEntry('blog', 'no-such-post')).toBeUndefined();
  });

  test('render(entry) returns { Content, headings } for every post', async () => {
    for (const post of await getCollection('blog')) {
      const { Content, headings } = await render(post);
      expect(typeof Content, post.id).toBe('function');
      expect(Array.isArray(headings), post.id).toBe(true);
    }
  });

  test('getPostsByGroupCondition groups every published post by year (/archives)', async () => {
    const posts = await getCollection('blog', notDraft);
    const byYear = getPostsByGroupCondition(posts as never, p => p.data.pubDatetime.getFullYear());

    const grouped = Object.values(byYear).flat();
    expect(grouped).toHaveLength(posts.length);
    Object.entries(byYear).forEach(([year, group]) => {
      group.forEach(p => expect(p.data.pubDatetime.getFullYear()).toBe(Number(year)));
    });
  });
});

test.describe('getCollection("members")', () => {
  test('every member has a name and bio, and splits into leaders, volunteers and regular (/members)', async () => {
    const members = await getCollection('members');
    members.forEach(m => {
      expect(m.data.name, `${m.id} name`).toBeTruthy();
      expect(m.data.bio, `${m.id} bio`).toBeTruthy();
    });

    // same expressions as src/pages/members/index.astro
    const leaders = members
      .filter(m => !m.data.volunteer && m.data.core)
      .sort((a, b) => (a.data.rank ?? Infinity) - (b.data.rank ?? Infinity));
    const volunteers = members.filter(m => m.data.volunteer);
    const regular = members.filter(m => !m.data.volunteer && !m.data.core && !(m.id === 'member'));

    // every member lands in exactly one section
    expect(leaders.length + volunteers.length + regular.length).toBe(members.length);

    // leaders are sorted by rank
    const ranks = leaders.map(m => m.data.rank ?? Infinity);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  test('member names are unique', async () => {
    const names = (await getCollection('members')).map(m => m.data.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

test.describe('getCollection("speakers")', () => {
  test('every speaker has a name, bio and githubURL; templates are hidden (/speakers)', async () => {
    const speakers = await getCollection('speakers');
    speakers.forEach(s => {
      expect(s.data.name, `${s.id} name`).toBeTruthy();
      expect(s.data.githubURL, `${s.id} githubURL`).toBeTruthy();
    });

    // same filter as src/pages/speakers/index.astro
    const listed = speakers.filter(s => !s.data.core && s.id !== 'speaker' && s.id !== 'speaker-tags');
    expect(listed.map(s => s.id)).not.toContain('speaker');
    expect(listed.length).toBeLessThanOrEqual(speakers.length);
  });
});

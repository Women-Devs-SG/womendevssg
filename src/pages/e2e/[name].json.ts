/**
 * DEV-ONLY test endpoint: GET /e2e/collections.json
 *
 * Calls the Astro content collections API (https://docs.astro.build/en/reference/modules/astro-content/)
 * on its own, with no page or layout involved, and reports what it returned.
 * The e2e tests read this to (1) check the API contract after an Astro upgrade and
 * (2) compare what the API returns with what the Blog / Members pages show.
 *
 * It is not generated in production builds: getStaticPaths returns no paths outside dev.
 */
import type { APIRoute, GetStaticPaths } from "astro";
import * as astroContent from "astro:content";
import { getCollection, getEntry, render } from "astro:content";
import { SITE } from "@config";
import { slugifyStr } from "@utils/slugify";

export const getStaticPaths = (() =>
  import.meta.env.DEV
    ? [{ params: { name: "collections" } }]
    : []) satisfies GetStaticPaths;

export const GET: APIRoute = async () => {
  // --- blog: getCollection (with and without a filter), getEntry, render ---
  const allPosts = await getCollection("blog");
  const publishedPosts = await getCollection("blog", ({ data }) => !data.draft);
  const firstPost = publishedPosts[0];
  const postById = firstPost ? await getEntry("blog", firstPost.id) : undefined;
  const rendered = firstPost ? await render(firstPost) : undefined;

  // --- members ---
  const members = await getCollection("members");
  const firstMember = members[0];
  const memberById = firstMember
    ? await getEntry("members", firstMember.id)
    : undefined;

  // --- speakers ---
  const speakers = await getCollection("speakers");

  // --- derived data the pages are built from ---
  const tagCounts: Record<string, number> = {};
  publishedPosts.forEach(post => {
    new Set(post.data.tags.map(slugifyStr)).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    });
  });

  const body = {
    // every export of `astro:content`, so a removed/renamed API shows up in the test
    astroContentExports: Object.keys(astroContent).sort(),
    site: { postPerPage: SITE.postPerPage },
    blog: {
      total: allPosts.length,
      published: publishedPosts.length,
      filterExcludesDrafts: publishedPosts.every(p => p.data.draft !== true),
      ids: publishedPosts.map(p => p.id),
      titles: publishedPosts.map(p => p.data.title),
      pubDatetimeIsDate: publishedPosts.every(
        p => p.data.pubDatetime instanceof Date
      ),
      idHasFileExtension: allPosts.some(p => /\.mdx?$/.test(p.id)),
      // schema defaults from content.config.ts (author, tags)
      allHaveAuthor: allPosts.every(p => typeof p.data.author === "string" && p.data.author.length > 0),
      allHaveTags: allPosts.every(p => Array.isArray(p.data.tags) && p.data.tags.length > 0),
      tagCounts,
      featuredTitles: publishedPosts.filter(p => p.data.featured).map(p => p.data.title),
      // posts that get a generated OG image (src/pages/blog/[slug]/index.png.ts)
      generatedOgImageSlugs: publishedPosts
        .filter(p => !p.data.ogImage)
        .map(p => slugifyStr(p.data.title)),
      getEntry: postById
        ? { id: postById.id, title: postById.data.title }
        : null,
      render: rendered
        ? {
            contentType: typeof rendered.Content,
            headingsIsArray: Array.isArray(rendered.headings),
          }
        : null,
    },
    members: {
      total: members.length,
      ids: members.map(m => m.id),
      names: members.map(m => m.data.name),
      leaderNames: members
        .filter(m => !m.data.volunteer && m.data.core)
        .map(m => m.data.name),
      volunteerNames: members.filter(m => m.data.volunteer).map(m => m.data.name),
      idHasFileExtension: members.some(m => /\.mdx?$/.test(m.id)),
      getEntry: memberById
        ? { id: memberById.id, name: memberById.data.name }
        : null,
    },
    speakers: {
      total: speakers.length,
      ids: speakers.map(sp => sp.id),
      // what /speakers shows: not core, and not the template files
      listedNames: speakers
        .filter(sp => !sp.data.core && sp.id !== "speaker" && sp.id !== "speaker-tags")
        .map(sp => sp.data.name),
    },
  };

  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });
};

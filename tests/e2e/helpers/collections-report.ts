import { expect, type APIRequestContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/** Installed Astro version, shown in test titles and failure messages. */
export const astroVersion = (() => {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'node_modules', 'astro', 'package.json'), 'utf8')
    ).version as string;
  } catch {
    return 'unknown';
  }
})();

/** Shape of GET /e2e/collections.json (src/pages/e2e/[name].json.ts). */
export type CollectionsReport = {
  astroContentExports: string[];
  site: { postPerPage: number };
  blog: {
    total: number;
    published: number;
    filterExcludesDrafts: boolean;
    ids: string[];
    titles: string[];
    pubDatetimeIsDate: boolean;
    idHasFileExtension: boolean;
    allHaveAuthor: boolean;
    allHaveTags: boolean;
    tagCounts: Record<string, number>;
    featuredTitles: string[];
    generatedOgImageSlugs: string[];
    getEntry: { id: string; title: string } | null;
    render: { contentType: string; headingsIsArray: boolean } | null;
  };
  members: {
    total: number;
    ids: string[];
    names: string[];
    leaderNames: string[];
    volunteerNames: string[];
    idHasFileExtension: boolean;
    getEntry: { id: string; name: string } | null;
  };
  speakers: { total: number; ids: string[]; listedNames: string[] };
};

/** Calls the Astro content collections API on its own, through the dev-only endpoint. */
export async function fetchReport(request: APIRequestContext) {
  const response = await request.get('/e2e/collections.json');
  expect(
    response.ok(),
    `GET /e2e/collections.json returned ${response.status()}. Astro ${astroVersion}: the content API call may be failing (check the dev server log).`
  ).toBe(true);
  return (await response.json()) as CollectionsReport;
}

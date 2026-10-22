/**
 * Stand-in for the "astro:content" module in unit tests (mapped in tests/unit/tsconfig.json).
 *
 * It does NOT use made-up data. It reads your real collections:
 *   - the collection definitions come from src/content.config.ts (defineCollection, glob(), z schema)
 *   - the entries come from the real markdown files in src/content/**
 *   - frontmatter is parsed with @astrojs/markdown-remark and validated with the real zod schema,
 *     so schema defaults are applied and invalid content throws, like in Astro.
 *
 * Limitation: only the glob patterns this project uses are supported ("**\/*.md" and "!file.md").
 * Anything else throws, so a new pattern in content.config.ts shows up as a failing test.
 */
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'astro/zod';
import { parseFrontmatter } from '@astrojs/markdown-remark';
import type { GlobOptions } from './astro-loaders';
// must stay above the content.config import: it redirects "astro:content" and "astro/loaders" to the stubs
import './redirect-astro-imports';
import { collections } from '../../../src/content.config';

export type StubEntry = {
  id: string;
  // frontmatter fields differ per collection, so tests read them without a fixed type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  body: string;
  filePath: string;
  collection: string;
};

type CollectionConfig = {
  loader: { name: string; options: GlobOptions };
  schema?: unknown;
};

// ---- API used by src/content.config.ts ----
export function defineCollection<T extends CollectionConfig>(config: T): T {
  return config;
}

// ---- helpers ----
function listMarkdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => {
    const full = path.join(dir, item.name);
    return item.isDirectory() ? listMarkdownFiles(full) : item.name.endsWith('.md') ? [full] : [];
  });
}

function matchesPatterns(relativePath: string, patterns: string[]) {
  const include = patterns.filter(p => !p.startsWith('!'));
  const exclude = patterns.filter(p => p.startsWith('!')).map(p => p.slice(1));
  [...include, ...exclude].forEach(p => {
    if (p !== '**/*.md' && !/^[\w.-]+\.md$/.test(p)) {
      throw new Error(`Unit-test stub does not support the glob pattern "${p}". Extend tests/unit/stubs/astro-content.ts.`);
    }
  });
  return include.some(p => p === '**/*.md') && !exclude.includes(relativePath);
}

type Schema = { parse: (value: unknown) => StubEntry['data'] };

function resolveSchema(schema: unknown): Schema {
  // schema can be a zod object or a function ({ image }) => zod object
  const resolved = typeof schema === 'function' ? (schema as (helpers: { image: () => unknown }) => unknown)({ image: () => z.any() }) : schema;
  if (!resolved) return { parse: (value: unknown) => value as StubEntry['data'] };
  return resolved as Schema;
}

const loaded = new Map<string, StubEntry[]>();

function loadCollection(name: string): StubEntry[] {
  const config = (collections as unknown as Record<string, CollectionConfig>)[name];
  if (!config) return []; // unknown collection: the real API logs a warning and returns []
  if (loaded.has(name)) return loaded.get(name)!;

  const { pattern, base = '.', generateId } = config.loader.options;
  const baseDir = path.resolve(process.cwd(), base);
  const schema = resolveSchema(config.schema);

  const entries = listMarkdownFiles(baseDir)
    .map(file => path.relative(baseDir, file).split(path.sep).join('/'))
    .filter(relativePath => matchesPatterns(relativePath, Array.isArray(pattern) ? pattern : [pattern]))
    .sort()
    .map(relativePath => {
      const filePath = path.join(baseDir, relativePath);
      const { frontmatter, content } = parseFrontmatter(fs.readFileSync(filePath, 'utf8'));
      let data;
      try {
        data = schema.parse(frontmatter);
      } catch (error) {
        throw new Error(`${name}/${relativePath} does not match the collection schema:\n${error}`);
      }
      const id = generateId
        ? generateId({ entry: relativePath, base: baseDir, data })
        : relativePath.replace(/\.md$/, '');
      return { id, data, body: content, filePath, collection: name };
    });

  loaded.set(name, entries);
  return entries;
}

// ---- API used by pages and layouts ----
/** every getCollection call as [collectionName, filterCallback], for assertions */
export const calls: [string, ((entry: StubEntry) => boolean) | undefined][] = [];

export async function getCollection(name: string, filter?: (entry: StubEntry) => boolean) {
  calls.push([name, filter]);
  const entries = loadCollection(name);
  // always a new array, so a test that sorts the result cannot change the cache
  return filter ? entries.filter(filter) : [...entries];
}

/** supports getEntry("blog", "id") and getEntry({ collection: "blog", id: "id" }), like Astro */
export async function getEntry(nameOrRef: string | { collection: string; id: string }, id?: string) {
  const ref = typeof nameOrRef === 'string' ? { collection: nameOrRef, id } : nameOrRef;
  return loadCollection(ref.collection).find(entry => entry.id === ref.id);
}

/** clears recorded getCollection calls; use in test.beforeEach */
export function resetCalls() {
  calls.length = 0;
}

export async function render(entry: StubEntry) {
  void entry; // the real render() takes the entry; the stub does not need it
  return { Content: () => null, headings: [] as unknown[] };
}

/** the collection definitions from the real src/content.config.ts */
export function getCollectionNames() {
  return Object.keys(collections);
}

export { z };

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

export type StubEntry = {
  id: string;
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

function resolveSchema(schema: unknown): { parse: (value: unknown) => any } {
  // schema can be a zod object or a function ({ image }) => zod object
  const resolved = typeof schema === 'function' ? (schema as any)({ image: () => z.any() }) : schema;
  if (!resolved) return { parse: (value: unknown) => value };
  return resolved as any;
}

/**
 * src/content.config.ts imports "astro:content" and "astro/loaders". Playwright only applies the
 * path mappings of tests/unit/tsconfig.json to files inside tests/unit, so redirect those two
 * imports to the stubs here before loading the real config.
 */
function redirectAstroImportsToStubs() {
  const Module = require('module');
  const original = Module._resolveFilename;
  const redirects: Record<string, string> = {
    'astro:content': path.join(__dirname, 'astro-content.ts'),
    'astro/loaders': path.join(__dirname, 'astro-loaders.ts'),
  };
  Module._resolveFilename = function (request: string, ...rest: unknown[]) {
    return original.call(this, redirects[request] ?? request, ...rest);
  };
}

let cachedCollections: Record<string, CollectionConfig> | undefined;
function getConfig(): Record<string, CollectionConfig> {
  if (!cachedCollections) {
    // loaded lazily because src/content.config.ts itself imports this file
    redirectAstroImportsToStubs();
    cachedCollections = require('../../../src/content.config').collections;
  }
  return cachedCollections!;
}

const loaded = new Map<string, StubEntry[]>();

function loadCollection(name: string): StubEntry[] {
  const config = getConfig()[name];
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
  return filter ? entries.filter(filter) : entries;
}

export async function getEntry(name: string, id: string) {
  return loadCollection(name).find(entry => entry.id === id);
}

export async function render(_entry: StubEntry) {
  return { Content: () => null, headings: [] as unknown[] };
}

/** the collection definitions from the real src/content.config.ts */
export function getCollectionNames() {
  return Object.keys(getConfig());
}

export { z };

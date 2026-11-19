/**
 * Stand-in for "astro/loaders" in unit tests (mapped in tests/unit/tsconfig.json).
 * glob() only records its options; astro-content.ts reads the real files with them.
 */
export type GlobOptions = {
  pattern: string | string[];
  base?: string;
  generateId?: (options: { entry: string; base: URL | string; data: Record<string, unknown> }) => string;
};

export function glob(options: GlobOptions) {
  return { name: 'glob-loader', options };
}

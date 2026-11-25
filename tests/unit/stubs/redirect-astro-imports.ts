import Module from 'module';
import * as path from 'path';

/**
 * src/content.config.ts imports "astro:content" and "astro/loaders". Playwright only applies the
 * path mappings of tests/unit/tsconfig.json to files inside tests/unit, so redirect those two
 * imports to the stubs here before loading the real config.
 */
{
  const internals = Module as unknown as { _resolveFilename: (...args: unknown[]) => string };
  const original = internals._resolveFilename;
  const redirects: Record<string, string> = {
    'astro:content': path.join(__dirname, 'astro-content.ts'),
    'astro/loaders': path.join(__dirname, 'astro-loaders.ts'),
  };
  internals._resolveFilename = function (this: unknown, request: string, ...rest: unknown[]) {
    return original.call(this, redirects[request] ?? request, ...rest);
  };
}

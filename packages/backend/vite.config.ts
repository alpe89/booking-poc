import { transform } from '@swc/core';
import type { Plugin, TransformResult } from 'vite';
import { defineConfig } from 'vite';

const swcTsPlugin = (): Plugin => ({
  name: 'swc-typescript-metadata',
  enforce: 'pre',
  async transform(code: string, id: string): Promise<TransformResult | null> {
    const [filepath] = id.split('?');

    if (
      !filepath.endsWith('.ts') ||
      filepath.endsWith('.d.ts') ||
      filepath.includes('node_modules')
    ) {
      return null;
    }

    const result = await transform(code, {
      filename: filepath,
      sourceMaps: true,
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
          dynamicImport: true,
        },
        target: 'es2022',
        transform: {
          decoratorMetadata: true,
        },
      },
      module: {
        type: 'es6',
      },
    });

    let map: TransformResult['map'] = null;
    if (result.map) {
      try {
        const parsed = JSON.parse(result.map) as TransformResult['map'];
        if (parsed && typeof parsed === 'object') {
          map = parsed;
        }
      } catch {
        // ignore invalid source map
        map = null;
      }
    }

    return {
      code: result.code,
      map,
    };
  },
});

export default defineConfig({
  plugins: [swcTsPlugin()],
  esbuild: false,
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'test/'],
    },
  },
});

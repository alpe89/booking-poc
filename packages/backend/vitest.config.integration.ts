import swc from 'unplugin-swc';
import { defineConfig } from 'vite';
import type { PluginOption } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [swc.vite() as PluginOption],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './src/shared'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@database': path.resolve(__dirname, './generated/prisma'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup-integration.ts'],

    // Only run integration tests
    include: ['**/*.integration.spec.ts'],
    exclude: ['node_modules/**', 'dist/**'],
    // Run tests sequentially to avoid database conflicts
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Longer timeout for integration tests
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'test/'],
    },
  },
});

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
    include: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'test/'],
    },
  },
});

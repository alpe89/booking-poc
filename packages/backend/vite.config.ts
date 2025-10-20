import swc from 'unplugin-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [swc.vite()],
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

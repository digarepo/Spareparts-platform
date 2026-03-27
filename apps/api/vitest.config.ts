import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// Set test environment variables
process.env.JWT_ACCESS_SECRET = 'test-secret-123';
process.env.JWT_REFRESH_SECRET = 'test-refresh-456';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.spec.ts',
        '**/*.config.ts',
        '**/index.ts',
      ],
    },
    setupFiles: ['./test/setup.ts'],
  },
  resolve: {
    alias: {
      '@spareparts/contracts': resolve(__dirname, '../../packages/contracts/src'),
      '@spareparts/db': resolve(__dirname, '../../packages/db/src'),
      '@': resolve(__dirname, 'src'),
    },
  },
});

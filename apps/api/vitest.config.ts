import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from project root
config({ path: resolve(__dirname, '../../.env') });

// Override AI_PROVIDER to use mock in tests
process.env.AI_PROVIDER = 'mock';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
  },
});

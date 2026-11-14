import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // Builds the pronunciation table from data/cmudict/ when it is missing or out of date.
    globalSetup: ['tests/setup-dict.ts'],
  },
});

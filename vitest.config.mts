/// <reference types='vitest' />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    reporters: ['junit', 'default'],
    outputFile: 'js-junit.xml',
    browser: {
      provider: 'playwright',
      enabled: true,
      name: 'chromium',
      headless: true,
    },
  },
});

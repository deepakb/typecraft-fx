import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    fakeTimers: {
      enable: true,
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
    },
    coverage: {
      exclude: ['stories/**', '**/*.stories.{js,jsx,ts,tsx}'],
      include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    },
  },
});

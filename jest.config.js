module.exports = {
  jest: {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: ['<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}'],
  },
};

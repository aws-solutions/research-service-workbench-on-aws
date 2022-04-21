const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: '../'
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom'
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = {
  extends: '@rushstack/heft-node-rig/profiles/default/config/jest.config.json',
  collectCoverage: true,
  collectCoverageFrom: ['!./**/*.d.ts', './src/**/*.spec.ts', './src/**/*.test.ts', './src/setup/**'],
  moduleDirectories: ['node_modules', 'src'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  coverageReporters: ['json-summary', 'json'],
  setupFilesAfterEnv: ['<rootDir>/setup/jestTests.js'],

  ...createJestConfig(customJestConfig)
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['!./**/*.d.ts', './src/**/*.spec.ts', './src/**/*.test.ts', './src/setup/**/*'],
  coverageDirectory: 'temp/coverage',
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  coverageReporters: ['json-summary', 'json'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/context/(.*)$': '<rootDir>/context/$1',
    '^@/models/(.*)$': '<rootDir>/models/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/styles/(.*)$': '<rootDir>/styles/$1'
  },
  testEnvironment: 'jest-environment-jsdom'
};

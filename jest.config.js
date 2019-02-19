module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js'],
  modulePathIgnorePatterns: ['/build'],
  reporters: ['default'],
  testEnvironment: 'node',
  setupFiles: [
    '<rootDir>/src/test/global.js'
  ]
};

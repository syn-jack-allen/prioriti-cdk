module.exports = {
  setupFiles: ['./setupJest.js'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  clearMocks: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!' + ['serialize-error'].join('|') + ')'
  ]
};

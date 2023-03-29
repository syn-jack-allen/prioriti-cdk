module.exports = {
  setupFiles: ['./setupJest.js'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/*.test.ts'],
  clearMocks: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!' + ['serialize-error'].join('|') + ')'
  ]
};

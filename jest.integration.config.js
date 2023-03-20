const config = require('./jest.config');

module.exports = {
  ...config,
  setupFiles: ['./setupJest.js'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/integration/*.test.ts']

};

export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    'lib/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/coverage/**',
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
};
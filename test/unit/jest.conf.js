const path = require('path');
const common = require('../../config/common');

const target = process.env.TARGET_ENV;

module.exports = {
  rootDir: path.resolve(__dirname, '../../'),
  moduleFileExtensions: [
    'js',
  ],
  transform: {
    '.*\\.(js)$': 'babel-jest',
  },
  transformIgnorePatterns: common.ignorePaths.map(regExp => regExp.source),
  coverageDirectory: `<rootDir>/test/unit/coverage_${target}`,
  collectCoverageFrom: [
    'lib/**/*.js',
    '!**/node_modules/**',
    '!<rootDir>/test/**',
  ],
  testEnvironment: target === 'web' ? 'jsdom' : 'node',
  roots: [
    '<rootDir>/test/unit/base',
    `<rootDir>/test/unit/${target}`,
  ],
  globals: {
    BASE_URL: 'https://api.kloudless.com',
    DEBUG: false,
  },
};

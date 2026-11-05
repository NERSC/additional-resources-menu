const jestJupyterLab = require('@jupyterlab/testutils/lib/jest-config');

const esModules = [
  '@jupyter',
  '@jupyterlab',
  '@lumino',
  'lib0',
  'yjs',
  'y-protocols',
  'nanoid'
].join('|');

const baseConfig = jestJupyterLab(__dirname);
delete baseConfig.testRegex;

module.exports = {
  ...baseConfig,
  automock: false,
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/ui-tests/',
    '<rootDir>/additional_resources_menu/labextension/'
  ],
  transformIgnorePatterns: [`/node_modules/(?!(${esModules})).+`]
};

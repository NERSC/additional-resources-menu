const baseConfig = require('@jupyterlab/galata/lib/playwright-config');

module.exports = {
  ...baseConfig,
  testDir: './ui-tests/tests',
  timeout: 60000,
  webServer: {
    command: 'jupyter lab --port=8888 --no-browser --ServerApp.token=""',
    url: 'http://localhost:8888/lab',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI
  }
};

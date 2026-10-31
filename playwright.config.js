const { defineConfig, devices } = require('@playwright/test');
const os = require('node:os');
const path = require('node:path');

const port = Number(process.env.E2E_PORT || 4173);
const baseURL = `http://127.0.0.1:${port}`;
const dataDirectory = path.join(os.tmpdir(), `raven-llama-e2e-${process.pid}`);
process.env.RAVEN_TEST_DATA_DIR = dataDirectory;

module.exports = defineConfig({
  testDir: './tests/e2e',
  globalTeardown: './tests/e2e/global-teardown.js',
  workers: 1,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [{
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] }
  }],
  webServer: {
    command: 'node server.js',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30000,
    env: { PORT: String(port), DATA_DIR: dataDirectory }
  }
});
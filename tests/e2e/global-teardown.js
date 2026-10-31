const fs = require('node:fs');

module.exports = async function globalTeardown() {
  const dataDirectory = process.env.RAVEN_TEST_DATA_DIR;
  if (!dataDirectory) return;

  process.on('exit', () => {
    try {
      fs.rmSync(dataDirectory, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    } catch {}
  });
};
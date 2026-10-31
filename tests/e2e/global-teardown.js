const fs = require('node:fs');

module.exports = async function globalTeardown() {
  const dataDirectory = process.env.RAVEN_TEST_DATA_DIR;
  if (dataDirectory) fs.rmSync(dataDirectory, { recursive: true, force: true });
};
const fs = require('node:fs');
const path = require('node:path');

const packageEntry = require.resolve('canvas-confetti');
const sourcePath = path.resolve(path.dirname(packageEntry), '../dist/confetti.browser.js');
const destinationDirectory = path.resolve(__dirname, '../public/js/vendor');
const destinationPath = path.join(destinationDirectory, 'confetti.js');

fs.mkdirSync(destinationDirectory, { recursive: true });
fs.copyFileSync(sourcePath, destinationPath);
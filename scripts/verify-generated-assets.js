const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'raven-generated-assets-'));
const cssOutput = path.join(temporaryDirectory, 'tailwind.css');
const confettiOutput = path.join(temporaryDirectory, 'confetti.js');
const tailwindCli = path.join(projectRoot, 'node_modules', 'tailwindcss', 'lib', 'cli.js');

try {
  const build = spawnSync(process.execPath, [
    tailwindCli,
    '--config', path.join(projectRoot, 'tailwind.config.js'),
    '--input', path.join(projectRoot, 'tailwind.input.css'),
    '--output', cssOutput,
    '--minify'
  ], { cwd: projectRoot, encoding: 'utf8' });

  if (build.status !== 0) {
    process.stderr.write(build.stdout || '');
    process.stderr.write(build.stderr || 'Tailwind build failed.\n');
    process.exitCode = build.status || 1;
  } else {
    const packageEntry = require.resolve('canvas-confetti');
    const confettiSource = path.resolve(path.dirname(packageEntry), '../dist/confetti.browser.js');
    fs.copyFileSync(confettiSource, confettiOutput);

    const generatedAssets = [
      [cssOutput, path.join(projectRoot, 'public', 'css', 'tailwind.css')],
      [confettiOutput, path.join(projectRoot, 'public', 'js', 'vendor', 'confetti.js')]
    ];
    for (const [expectedPath, committedPath] of generatedAssets) {
      if (!fs.existsSync(committedPath) || !fs.readFileSync(expectedPath).equals(fs.readFileSync(committedPath))) {
        process.stderr.write(`Generated asset is missing or stale: ${path.relative(projectRoot, committedPath)}\n`);
        process.exitCode = 1;
      }
    }
  }
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
}
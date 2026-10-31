const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const projectRoot = path.resolve(__dirname, '..', '..');
let temporaryRoot;
let serverProcess;
let baseUrl;

async function findAvailablePort() {
  const probe = http.createServer();
  await new Promise((resolve, reject) => {
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', resolve);
  });
  const { port } = probe.address();
  await new Promise((resolve, reject) => probe.close(error => error ? reject(error) : resolve()));
  return port;
}

async function waitForServer() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Server exited early with code ${serverProcess.exitCode}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/profiles`);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Server did not become ready within 10 seconds');
}

test.before(async () => {
  temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'raven-llama-test-'));
  fs.copyFileSync(path.join(projectRoot, 'server.js'), path.join(temporaryRoot, 'server.js'));
  for (const directory of ['assets', 'css', 'js']) {
    fs.cpSync(path.join(projectRoot, directory), path.join(temporaryRoot, directory), { recursive: true });
  }
  fs.copyFileSync(path.join(projectRoot, 'index.html'), path.join(temporaryRoot, 'index.html'));

  const port = await findAvailablePort();
  baseUrl = `http://127.0.0.1:${port}`;
  serverProcess = spawn(process.execPath, [path.join(temporaryRoot, 'server.js')], {
    cwd: temporaryRoot,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'ignore', 'pipe']
  });
  let serverErrors = '';
  serverProcess.stderr.setEncoding('utf8');
  serverProcess.stderr.on('data', chunk => { serverErrors += chunk; });
  serverProcess.on('error', error => { serverErrors += error.message; });
  try {
    await waitForServer();
  } catch (error) {
    error.message += `\n${serverErrors}`;
    throw error;
  }
});

test.after(async () => {
  if (serverProcess && serverProcess.exitCode === null) {
    serverProcess.kill();
    await new Promise(resolve => serverProcess.once('exit', resolve));
  }
  if (temporaryRoot) fs.rmSync(temporaryRoot, { recursive: true, force: true });
});

test('static app and profiles API behave correctly without touching local learner data', async t => {
  const home = await fetch(`${baseUrl}/`);
  assert.equal(home.status, 200);
  assert.match(home.headers.get('content-type'), /text\/html/);
  assert.match(await home.text(), /Raven &amp; Llama Learning/);

  const script = await fetch(`${baseUrl}/js/generators.js`);
  assert.equal(script.status, 200);
  assert.match(script.headers.get('content-type'), /javascript/);

  const initial = await fetch(`${baseUrl}/api/profiles`);
  assert.deepEqual(await initial.json(), { profiles: [] });

  const saveProfile = profile => fetch(`${baseUrl}/api/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile })
  });
  assert.equal((await saveProfile({ id: 'learner-a', name: 'Avery' })).status, 200);
  assert.equal((await saveProfile({ id: 'learner-a', name: 'Avery Updated' })).status, 200);
  assert.equal((await saveProfile({ id: 'learner-b', name: 'Riley' })).status, 200);

  let stored = await (await fetch(`${baseUrl}/api/profiles`)).json();
  assert.deepEqual(stored.profiles.map(profile => profile.name), ['Avery Updated', 'Riley']);

  const deletion = await fetch(`${baseUrl}/api/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deleteProfileId: 'learner-a' })
  });
  assert.equal(deletion.status, 200);
  stored = await (await fetch(`${baseUrl}/api/profiles`)).json();
  assert.deepEqual(stored.profiles.map(profile => profile.id), ['learner-b']);

  const replacement = await fetch(`${baseUrl}/api/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profiles: [{ id: 'learner-c', name: 'Casey' }] })
  });
  assert.equal(replacement.status, 200);
  stored = await (await fetch(`${baseUrl}/api/profiles`)).json();
  assert.deepEqual(stored.profiles, [{ id: 'learner-c', name: 'Casey' }]);

  const malformed = await fetch(`${baseUrl}/api/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{'
  });
  assert.equal(malformed.status, 400);

  const preflight = await fetch(`${baseUrl}/api/profiles`, { method: 'OPTIONS' });
  assert.equal(preflight.status, 200);
  assert.match(preflight.headers.get('access-control-allow-methods'), /POST/);
});
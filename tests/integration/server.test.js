const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const projectRoot = path.resolve(__dirname, '..', '..');
let temporaryRoot;
let dataDirectory;
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
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Server did not become ready within 10 seconds');
}

test.before(async () => {
  temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'raven-llama-test-'));
  dataDirectory = path.join(temporaryRoot, 'data');

  const port = await findAvailablePort();
  baseUrl = `http://127.0.0.1:${port}`;
  serverProcess = spawn(process.execPath, [path.join(projectRoot, 'server.js')], {
    cwd: projectRoot,
    env: { ...process.env, PORT: String(port), DATA_DIR: dataDirectory },
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

test('accounts persist securely and progress stays private to the authenticated user', async () => {
  const home = await fetch(`${baseUrl}/`);
  assert.equal(home.status, 200);
  assert.match(home.headers.get('content-type'), /text\/html/);
  assert.match(await home.text(), /Raven &amp; Llama Learning/);

  const favicon = await fetch(`${baseUrl}/assets/raven-llama-logo.svg`);
  assert.equal(favicon.status, 200);
  assert.match(favicon.headers.get('content-type'), /image\/svg\+xml/);

  assert.equal((await fetch(`${baseUrl}/api/auth/session`)).status, 401);
  assert.equal((await fetch(`${baseUrl}/api/progress`)).status, 401);
  assert.equal((await fetch(`${baseUrl}/api/profiles`)).status, 404);

  const postJson = (url, body, cookie) => fetch(`${baseUrl}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: baseUrl,
      ...(cookie ? { Cookie: cookie } : {})
    },
    body: JSON.stringify(body)
  });
  const register = async username => {
    const response = await postJson('/api/auth/register', { username, password: 'a secure password 123' });
    return { response, body: await response.json(), cookie: response.headers.get('set-cookie')?.split(';', 1)[0] };
  };

  const first = await register('Avery_1');
  assert.equal(first.response.status, 201);
  assert.equal(first.body.user.username, 'avery_1');
  assert.equal(first.body.profile.stars, 0);
  assert.match(first.response.headers.get('set-cookie'), /HttpOnly/);
  assert.match(first.response.headers.get('set-cookie'), /SameSite=Lax/);
  assert.equal(JSON.stringify(first.body).includes('passwordHash'), false);

  const duplicate = await postJson('/api/auth/register', { username: 'AVERY_1', password: 'a secure password 123' });
  assert.equal(duplicate.status, 409);
  assert.equal((await fetch(`${baseUrl}/data/accounts.json`)).status, 404);

  const privateProgress = { ...first.body.profile, stars: 17, passedBelts: ['white'] };
  const update = await fetch(`${baseUrl}/api/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Origin: baseUrl, Cookie: first.cookie },
    body: JSON.stringify({ profile: privateProgress })
  });
  assert.equal(update.status, 200);

  const second = await register('Riley_2');
  assert.equal(second.response.status, 201);
  const firstRead = await fetch(`${baseUrl}/api/progress`, { headers: { Cookie: first.cookie } });
  const secondRead = await fetch(`${baseUrl}/api/progress`, { headers: { Cookie: second.cookie } });
  assert.equal((await firstRead.json()).profile.stars, 17);
  assert.equal((await secondRead.json()).profile.stars, 0);

  const wrongLogin = await postJson('/api/auth/login', { username: 'avery_1', password: 'wrong password' });
  assert.equal(wrongLogin.status, 401);
  const login = await postJson('/api/auth/login', { username: 'AVERY_1', password: 'a secure password 123' });
  assert.equal(login.status, 200);

  const logout = await postJson('/api/auth/logout', {}, first.cookie);
  assert.equal(logout.status, 200);
  assert.equal((await fetch(`${baseUrl}/api/auth/session`, { headers: { Cookie: first.cookie } })).status, 401);

  const crossOrigin = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://attacker.example' },
    body: JSON.stringify({ username: 'origin_test', password: 'origin test password 12' })
  });
  assert.equal(crossOrigin.status, 403);
});
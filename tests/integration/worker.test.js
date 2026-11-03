const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const projectRoot = path.resolve(__dirname, '..', '..');
const wranglerCli = path.join(projectRoot, 'node_modules', 'wrangler', 'bin', 'wrangler.js');

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

async function waitForWorker(workerProcess, baseUrl, getOutput) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (workerProcess.exitCode !== null) {
      throw new Error(`Wrangler exited early with code ${workerProcess.exitCode}\n${getOutput()}`);
    }
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`Worker did not become ready within 30 seconds\n${getOutput()}`);
}

async function stopWorker(workerProcess) {
  if (!workerProcess || workerProcess.exitCode !== null || workerProcess.signalCode !== null) return;

  if (process.platform === 'win32') {
    const result = spawnSync('taskkill.exe', ['/PID', String(workerProcess.pid), '/T', '/F'], { stdio: 'ignore' });
    if (result.error || result.status !== 0) workerProcess.kill();
  } else {
    try {
      process.kill(-workerProcess.pid, 'SIGTERM');
    } catch {
      workerProcess.kill('SIGTERM');
    }
  }

  if (workerProcess.exitCode === null && workerProcess.signalCode === null) {
    await new Promise(resolve => workerProcess.once('exit', resolve));
  }
}

test('local Worker enforces account boundaries, rate limits, and security headers', { timeout: 90000 }, async t => {
  const persistenceDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'raven-worker-integration-'));
  const port = await findAvailablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  let workerProcess;
  let output = '';

  t.after(async () => {
    await stopWorker(workerProcess);
    fs.rmSync(persistenceDirectory, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 100
    });
  });

  const migrations = spawnSync(process.execPath, [
    wranglerCli,
    'd1', 'migrations', 'apply', 'raven-llama-accounts',
    '--local', '--persist-to', persistenceDirectory
  ], {
    cwd: projectRoot,
    env: { ...process.env, CI: 'true' },
    encoding: 'utf8'
  });
  assert.equal(migrations.status, 0, `${migrations.stdout}\n${migrations.stderr}`);

  workerProcess = spawn(process.execPath, [
    wranglerCli,
    'dev', '--local', '--ip', '127.0.0.1', '--port', String(port),
    '--persist-to', persistenceDirectory, '--compatibility-date', '2026-10-30',
    '--log-level', 'error'
  ], {
    cwd: projectRoot,
    env: { ...process.env, CI: 'true' },
    detached: process.platform !== 'win32',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  workerProcess.stdout.setEncoding('utf8');
  workerProcess.stderr.setEncoding('utf8');
  workerProcess.stdout.on('data', chunk => { output += chunk; });
  workerProcess.stderr.on('data', chunk => { output += chunk; });

  await waitForWorker(workerProcess, baseUrl, () => output);

  const home = await fetch(baseUrl);
  assert.equal(home.status, 200);
  assert.match(home.headers.get('cache-control'), /max-age=0, must-revalidate/);
  assert.equal(home.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(home.headers.get('x-frame-options'), 'DENY');
  const contentSecurityPolicy = home.headers.get('content-security-policy');
  assert.match(contentSecurityPolicy, /frame-ancestors 'none'/);
  assert.match(contentSecurityPolicy, /script-src 'self'/);
  assert.doesNotMatch(contentSecurityPolicy, /script-src[^;]*unsafe-inline/);
  assert.doesNotMatch(contentSecurityPolicy, /style-src[^;]*unsafe-inline/);

  const username = `worker_${Date.now().toString(36)}`;
  const register = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { Origin: baseUrl, 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'a secure worker password 123' })
  });
  assert.equal(register.status, 201);
  const cookie = register.headers.get('set-cookie').split(';', 1)[0];

  const session = await fetch(`${baseUrl}/api/auth/session`, { headers: { Cookie: cookie } });
  assert.equal(session.status, 200);
  assert.equal((await session.json()).user.username, username);

  const dailyChallengeDayKey = new Date().toISOString().slice(0, 10);
  const update = await fetch(`${baseUrl}/api/progress`, {
    method: 'PUT',
    headers: { Origin: baseUrl, Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile: {
        stars: 9,
        certificates: [],
        passedBelts: ['white'],
        earnedBadges: ['activity-explorer', 'unknown-badge'],
        skillsProgress: { science_virtual_lab: { bestScore: 10, timesTrained: 1 } },
        schoolYear: 5,
        subjectYears: { science: 2 },
        spellingLists: [{ id: 'week-one', name: 'Week One', words: ['quokka'] }],
        activeSpellingListId: 'week-one',
        dailyChallenges: {
          days: {
            [dailyChallengeDayKey]: {
              activityIds: ['science-solar-system-order', 'brain-power-pattern-recognition'],
              completedActivityIds: ['science-solar-system-order'],
              bonusAwarded: false
            }
          }
        },
        activityProgress: {
          'science-virtual-lab': {
            title: 'Virtual Laboratory',
            subject: 'Science Lab',
            skillId: 'science_virtual_lab',
            kind: 'quiz',
            scoreUnit: 'points',
            bestScore: 2,
            bestTotal: 2,
            correct: 2,
            total: 2,
            correctAnswers: 1,
            totalAnswers: 1,
            timesPlayed: 1
          }
        }
      }
    })
  });
  assert.equal(update.status, 200);
  const progress = await fetch(`${baseUrl}/api/progress`, { headers: { Cookie: cookie } });
  const savedProgress = (await progress.json()).profile;
  assert.equal(savedProgress.stars, 9);
  assert.equal(savedProgress.schoolYear, 5);
  assert.deepEqual(savedProgress.subjectYears, { science: 2 });
  assert.deepEqual(savedProgress.spellingLists, [
    { id: 'week-one', name: 'Week One', words: ['quokka'] }
  ]);
  assert.equal(savedProgress.activeSpellingListId, 'week-one');
  assert.equal(savedProgress.activityProgress['science-virtual-lab'].skillId, 'science_virtual_lab');
  assert.equal(savedProgress.activityProgress['science-virtual-lab'].correctAnswers, 1);
  assert.equal(savedProgress.activityProgress['science-virtual-lab'].totalAnswers, 1);
  assert.deepEqual(savedProgress.earnedBadges, ['first-steps', 'skill-master', 'curriculum-graduate']);
  assert.equal(savedProgress.dailyChallenges.days[dailyChallengeDayKey].completedActivityIds[0], 'science-solar-system-order');

  const cosmeticPurchase = await fetch(`${baseUrl}/api/cosmetics/purchase`, {
    method: 'POST',
    headers: { Origin: baseUrl, Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ cosmeticId: 'sunrise-frame' })
  });
  assert.equal(cosmeticPurchase.status, 200);
  const cosmeticResult = await cosmeticPurchase.json();
  assert.equal(cosmeticResult.profile.stars, 4);
  assert.deepEqual(cosmeticResult.profile.ownedCosmetics, ['sunrise-frame']);
  const restoredCosmetics = await fetch(`${baseUrl}/api/progress`, { headers: { Cookie: cookie } });
  const restoredProfile = (await restoredCosmetics.json()).profile;
  assert.equal(restoredProfile.stars, 4);
  assert.deepEqual(restoredProfile.ownedCosmetics, ['sunrise-frame']);

  const otherRegister = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { Origin: baseUrl, 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `${username}_other`, password: 'a secure worker password 123' })
  });
  assert.equal(otherRegister.status, 201);
  const otherCookie = otherRegister.headers.get('set-cookie').split(';', 1)[0];
  const otherProgress = await fetch(`${baseUrl}/api/progress`, { headers: { Cookie: otherCookie } });
  const otherProfile = (await otherProgress.json()).profile;
  assert.deepEqual(otherProfile.spellingLists, []);
  assert.equal(otherProfile.activeSpellingListId, null);
  assert.deepEqual(otherProfile.activityProgress, {});
  assert.deepEqual(otherProfile.earnedBadges, []);
  assert.deepEqual(otherProfile.ownedCosmetics, []);
  assert.deepEqual(otherProfile.dailyChallenges, { days: {} });

  const crossOrigin = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { Origin: 'https://attacker.example', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `${username}_blocked`, password: 'a secure worker password 123' })
  });
  assert.equal(crossOrigin.status, 403);

  let limitedLogin;
  for (let attempt = 0; attempt < 11; attempt++) {
    limitedLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { Origin: baseUrl, 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `${username}_unknown`, password: 'incorrect password' })
    });
    if (limitedLogin.status === 429) break;
  }
  assert.equal(limitedLogin.status, 429);
  assert.equal(limitedLogin.headers.get('retry-after'), '60');
});
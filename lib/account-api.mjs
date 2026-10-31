const PASSWORD_ITERATIONS = 100000;
const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_LENGTH = 128;
const SESSION_TTL = 30 * 24 * 60 * 60;
const SESSION_COOKIE = 'raven_llama_session';
const MAX_BODY_BYTES = 65536;
const AVATAR_IDS = new Set(['raven', 'llama', 'hippo', 'owl', 'fire', 'ice', 'lightning', 'shadow', 'nature', 'panda', 'golden', 'fox']);
const BELT_IDS = new Set(['white', 'yellow', 'green', 'blue', 'brown', 'black', 'platinum']);
const THEME_IDS = new Set(['dark', 'light']);
const encoder = new TextEncoder();

function encodeBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64(value) {
  return Uint8Array.from(atob(value), character => character.charCodeAt(0));
}

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers
    }
  });
}

function errorResponse(message, status) {
  return jsonResponse({ error: message }, status);
}

function cookieHeader(value, requestUrl, maxAge = SESSION_TTL) {
  const secure = new URL(requestUrl).protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function getCookie(request, name) {
  const cookieHeaderValue = request.headers.get('cookie') || '';
  const prefix = `${name}=`;
  const match = cookieHeaderValue.split(';').map(part => part.trim()).find(part => part.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

function validUsername(value) {
  if (typeof value !== 'string') return null;
  const username = value.trim();
  if (username.length < 3 || username.length > 32 || !/^[a-zA-Z0-9_]+$/.test(username)) return null;
  return username.toLowerCase();
}

function validPassword(value) {
  return typeof value === 'string' && value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH;
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PASSWORD_ITERATIONS }, key, 256);
  return `pbkdf2-sha256$${PASSWORD_ITERATIONS}$${encodeBase64(salt)}$${encodeBase64(new Uint8Array(bits))}`;
}

async function verifyPassword(password, storedHash) {
  if (typeof password !== 'string' || typeof storedHash !== 'string') return false;
  const [algorithm, iterationsValue, saltValue, expectedValue] = storedHash.split('$');
  const iterations = Number(iterationsValue);
  if (algorithm !== 'pbkdf2-sha256' || !Number.isInteger(iterations) || iterations < 100000 || iterations > 1000000) return false;

  try {
    const salt = decodeBase64(saltValue);
    const expected = decodeBase64(expectedValue);
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, expected.length * 8);
    const actual = new Uint8Array(bits);
    let difference = actual.length ^ expected.length;
    for (let index = 0; index < Math.min(actual.length, expected.length); index++) difference |= actual[index] ^ expected[index];
    return difference === 0;
  } catch {
    return false;
  }
}

async function hashToken(token) {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(token)));
  return Array.from(digest, byte => byte.toString(16).padStart(2, '0')).join('');
}

function emptyProgress(user) {
  const now = new Date().toISOString();
  return {
    id: user.id,
    name: user.username,
    avatar: 'raven',
    theme: 'dark',
    currentBelt: 'white',
    stage1PassedBelts: [],
    stage2PassedBelts: [],
    stage3PassedBelts: [],
    passedBelts: [],
    stars: 0,
    skillsProgress: {},
    certificates: [],
    createdAt: now,
    updatedAt: now
  };
}

function sanitizeProgress(input, user, previous) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const base = previous || emptyProgress(user);
  const stringArray = value => Array.isArray(value)
    ? value.filter(item => typeof item === 'string' && item.length <= 64).slice(0, 32)
    : [];
  const rawSkills = input.skillsProgress && typeof input.skillsProgress === 'object' && !Array.isArray(input.skillsProgress)
    ? input.skillsProgress
    : {};
  const skillsProgress = {};

  for (const [skillId, rawStat] of Object.entries(rawSkills).slice(0, 100)) {
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(skillId) || !rawStat || typeof rawStat !== 'object') continue;
    const integer = key => Number.isFinite(rawStat[key]) ? Math.max(0, Math.min(1000000000, Math.floor(rawStat[key]))) : 0;
    skillsProgress[skillId] = {
      correct: integer('correct'),
      total: integer('total'),
      bestScore: integer('bestScore'),
      timesTrained: integer('timesTrained'),
      stars: integer('stars')
    };
  }

  const certificates = Array.isArray(input.certificates)
    ? input.certificates.slice(0, 100).map(certificate => ({
      id: typeof certificate?.id === 'string' ? certificate.id.slice(0, 80) : '',
      beltId: typeof certificate?.beltId === 'string' ? certificate.beltId.slice(0, 32) : '',
      beltName: typeof certificate?.beltName === 'string' ? certificate.beltName.slice(0, 80) : '',
      stage: typeof certificate?.stage === 'string' ? certificate.stage.slice(0, 80) : '',
      score: typeof certificate?.score === 'string' ? certificate.score.slice(0, 32) : '',
      date: typeof certificate?.date === 'string' ? certificate.date.slice(0, 40) : ''
    }))
    : [];
  const avatarValue = typeof input.avatar === 'string' ? input.avatar : input.avatar?.id;

  return {
    ...base,
    id: user.id,
    name: user.username,
    avatar: AVATAR_IDS.has(avatarValue) ? avatarValue : 'raven',
    theme: THEME_IDS.has(input.theme) ? input.theme : (THEME_IDS.has(base.theme) ? base.theme : 'dark'),
    currentBelt: BELT_IDS.has(input.currentBelt) ? input.currentBelt : base.currentBelt,
    stage1PassedBelts: stringArray(input.stage1PassedBelts),
    stage2PassedBelts: stringArray(input.stage2PassedBelts),
    stage3PassedBelts: stringArray(input.stage3PassedBelts),
    passedBelts: stringArray(input.passedBelts),
    stars: Number.isFinite(input.stars) ? Math.max(0, Math.min(1000000000, Math.floor(input.stars))) : 0,
    skillsProgress,
    certificates,
    createdAt: base.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

async function readJson(request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) return null;
  const text = await request.text();
  if (encoder.encode(text).length > MAX_BODY_BYTES) return null;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function originIsAllowed(request) {
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).origin !== new URL(request.url).origin) return false;
  return request.headers.get('sec-fetch-site') !== 'cross-site';
}

async function getAuthenticatedUser(request, store) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;
  return store.findSession(await hashToken(token), Date.now());
}

async function startSession(request, store, user, profile, status = 200) {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
  const expiresAt = Date.now() + SESSION_TTL * 1000;
  await store.createSession({ tokenHash: await hashToken(token), userId: user.id, expiresAt });
  return jsonResponse({ user: { id: user.id, username: user.username }, profile }, status, {
    'Set-Cookie': cookieHeader(token, request.url)
  });
}

export async function handleAccountRequest(request, store) {
  const { pathname } = new URL(request.url);
  if (pathname === '/api/profiles') return errorResponse('Not found', 404);

  const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);
  if (isMutation && !originIsAllowed(request)) return errorResponse('Request origin is not allowed', 403);

  if (pathname === '/api/auth/session' && request.method === 'GET') {
    const user = await getAuthenticatedUser(request, store);
    if (!user) return errorResponse('Not signed in', 401);
    const profile = await store.getProgress(user.id) || emptyProgress(user);
    return jsonResponse({ user: { id: user.id, username: user.username }, profile });
  }

  if (pathname === '/api/auth/register' && request.method === 'POST') {
    const body = await readJson(request);
    if (body === null) return errorResponse('Request is too large', 413);
    if (!body || typeof body !== 'object') return errorResponse('Invalid request body', 400);
    const username = validUsername(body.username);
    if (!username) return errorResponse('Username must be 3-32 letters, numbers, or underscores', 400);
    if (!validPassword(body.password)) return errorResponse('Password must be 12-128 characters', 400);

    const user = {
      id: crypto.randomUUID(),
      username,
      passwordHash: await hashPassword(body.password),
      createdAt: new Date().toISOString()
    };
    try {
      await store.createUser(user);
    } catch (error) {
      if (error?.code === 'USERNAME_TAKEN') return errorResponse('That username is already taken', 409);
      throw error;
    }
    const profile = emptyProgress(user);
    await store.saveProgress(user.id, profile);
    return startSession(request, store, user, profile, 201);
  }

  if (pathname === '/api/auth/login' && request.method === 'POST') {
    const body = await readJson(request);
    if (body === null) return errorResponse('Request is too large', 413);
    if (!body || typeof body !== 'object' || typeof body.password !== 'string' || body.password.length > PASSWORD_MAX_LENGTH) {
      return errorResponse('Invalid username or password', 401);
    }
    const username = validUsername(body.username);
    const user = username ? await store.findUserByUsername(username) : null;
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return errorResponse('Invalid username or password', 401);
    }
    const profile = await store.getProgress(user.id) || emptyProgress(user);
    return startSession(request, store, user, profile);
  }

  if (pathname === '/api/auth/logout' && request.method === 'POST') {
    const token = getCookie(request, SESSION_COOKIE);
    if (token) await store.deleteSession(await hashToken(token));
    return jsonResponse({ ok: true }, 200, { 'Set-Cookie': cookieHeader('', request.url, 0) });
  }

  if (pathname === '/api/auth/password' && request.method === 'POST') {
    const user = await getAuthenticatedUser(request, store);
    if (!user) return errorResponse('Not signed in', 401);
    const body = await readJson(request);
    if (body === null) return errorResponse('Request is too large', 413);
    if (!body || typeof body !== 'object' || typeof body.currentPassword !== 'string' || !validPassword(body.newPassword)) {
      return errorResponse('New password must be 12-128 characters', 400);
    }
    const storedUser = await store.findUserById(user.id);
    if (!(await verifyPassword(body.currentPassword, storedUser.passwordHash))) return errorResponse('Current password is incorrect', 401);
    await store.updatePassword(user.id, await hashPassword(body.newPassword));
    await store.deleteSessionsForUser(user.id);
    return startSession(request, store, user, await store.getProgress(user.id));
  }

  if (pathname === '/api/auth/account' && request.method === 'DELETE') {
    const user = await getAuthenticatedUser(request, store);
    if (!user) return errorResponse('Not signed in', 401);
    const body = await readJson(request);
    if (body === null) return errorResponse('Request is too large', 413);
    const storedUser = await store.findUserById(user.id);
    if (!body || typeof body.password !== 'string' || !(await verifyPassword(body.password, storedUser.passwordHash))) {
      return errorResponse('Password is incorrect', 401);
    }
    await store.deleteAccount(user.id);
    return jsonResponse({ ok: true }, 200, { 'Set-Cookie': cookieHeader('', request.url, 0) });
  }

  if (pathname === '/api/progress' && request.method === 'GET') {
    const user = await getAuthenticatedUser(request, store);
    if (!user) return errorResponse('Not signed in', 401);
    return jsonResponse({ profile: await store.getProgress(user.id) || emptyProgress(user) });
  }

  if (pathname === '/api/progress' && request.method === 'PUT') {
    const user = await getAuthenticatedUser(request, store);
    if (!user) return errorResponse('Not signed in', 401);
    const body = await readJson(request);
    if (body === null) return errorResponse('Request is too large', 413);
    if (!body || typeof body !== 'object' || !body.profile || typeof body.profile !== 'object') {
      return errorResponse('Invalid progress payload', 400);
    }
    const progress = sanitizeProgress(body.profile, user, await store.getProgress(user.id));
    if (!progress) return errorResponse('Invalid progress payload', 400);
    await store.saveProgress(user.id, progress);
    return jsonResponse({ profile: progress });
  }

  return errorResponse('Not found', 404);
}

export { hashPassword, verifyPassword };
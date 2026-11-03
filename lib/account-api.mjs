const PASSWORD_ITERATIONS = 100000;
const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_LENGTH = 128;
const SESSION_TTL = 30 * 24 * 60 * 60;
const SESSION_COOKIE = 'raven_llama_session';
const MAX_BODY_BYTES = 131072;
const MAX_SPELLING_LISTS = 10;
const MAX_SPELLING_WORDS_PER_LIST = 50;
const MAX_SPELLING_WORD_LENGTH = 100;
const MAX_SPELLING_LIST_NAME_LENGTH = 50;
const MAX_DAILY_CHALLENGE_DAYS = 31;
const BADGE_IDS = new Set(['first-steps', 'activity-explorer', 'skill-master', 'curriculum-graduate']);
const DAILY_CHALLENGE_ACTIVITY_IDS = new Set([
  'fraction-pizza',
  'maths-number-builder',
  'maths-missing-number',
  'spelling-spelling-sprint',
  'spelling-phonics-trail',
  'spelling-word-explorer',
  'spelling-jungle-jumble',
  'science-solar-system-order',
  'science-plant-life-cycle-order',
  'brain-power-pattern-recognition',
  'brain-power-memory-match',
  'brain-power-code-breaker'
]);
const AVATAR_IDS = new Set(['raven', 'llama', 'hippo', 'owl', 'fire', 'ice', 'lightning', 'shadow', 'nature', 'panda', 'golden', 'fox']);
const BELT_IDS = new Set(['white', 'yellow', 'green', 'blue', 'brown', 'black', 'platinum']);
const BELT_SKILL_PREFIX = /^(white|yellow|green|blue|brown|black|platinum)_/;
const THEME_IDS = new Set(['dark', 'light']);
const LAST_MODULE_IDS = new Set(['learning', 'dojo', 'timetables', 'spelling']);
const SUBJECT_YEAR_IDS = new Set(['maths', 'science', 'english']);
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

function rateLimitResponse() {
  return jsonResponse({ error: 'Too many requests. Please try again later.' }, 429, {
    'Retry-After': '60'
  });
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
    theme: 'light',
    schoolYear: 3,
    subjectYears: {},
    lastModule: null,
    currentBelt: 'white',
    stage1PassedBelts: [],
    stage2PassedBelts: [],
    stage3PassedBelts: [],
    passedBelts: [],
    stars: 0,
    skillsProgress: {},
    activityProgress: {},
    earnedBadges: [],
    dailyChallenges: { days: {} },
    endlessHighScores: {},
    spellingLists: [],
    activeSpellingListId: null,
    certificates: [],
    createdAt: now,
    updatedAt: now
  };
}

function sanitizeSpellingLists(value) {
  if (!Array.isArray(value) || value.length > MAX_SPELLING_LISTS) return null;
  const ids = new Set();
  const names = new Set();
  const lists = [];

  for (const list of value) {
    if (!list || typeof list !== 'object' || Array.isArray(list) ||
      typeof list.id !== 'string' || !/^[a-zA-Z0-9_-]{1,36}$/.test(list.id) ||
      typeof list.name !== 'string' || !Array.isArray(list.words) ||
      list.words.length > MAX_SPELLING_WORDS_PER_LIST) return null;

    const id = list.id;
    const name = list.name.trim();
    const normalizedName = name.toLowerCase();
    if (!name || name.length > MAX_SPELLING_LIST_NAME_LENGTH || ids.has(id) || names.has(normalizedName)) return null;
    ids.add(id);
    names.add(normalizedName);

    const words = [];
    const normalizedWords = new Set();
    for (const rawWord of list.words) {
      if (typeof rawWord !== 'string') return null;
      const word = rawWord.trim();
      const normalizedWord = word.toLowerCase();
      if (!word || word.length > MAX_SPELLING_WORD_LENGTH || normalizedWords.has(normalizedWord)) return null;
      normalizedWords.add(normalizedWord);
      words.push(word);
    }

    lists.push({ id, name, words });
  }

  return lists;
}

function sanitizeDailyChallenges(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
    !value.days || typeof value.days !== 'object' || Array.isArray(value.days)) return null;

  const entries = Object.entries(value.days);
  if (entries.length > MAX_DAILY_CHALLENGE_DAYS) return null;
  const days = {};
  for (const [dayKey, rawDay] of entries) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) return null;
    const [year, month, day] = dayKey.split('-').map(Number);
    if (year < 1970 || month < 1 || month > 12 || day < 1 || day > 31) return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day) return null;
    if (!rawDay || typeof rawDay !== 'object' || Array.isArray(rawDay) ||
      !Array.isArray(rawDay.activityIds) || rawDay.activityIds.length > 4 ||
      !Array.isArray(rawDay.completedActivityIds) || rawDay.completedActivityIds.length > 4 ||
      typeof rawDay.bonusAwarded !== 'boolean') return null;

    const { activityIds, completedActivityIds, bonusAwarded } = rawDay;
    const completedAll = activityIds.length > 0 &&
      completedActivityIds.length === activityIds.length;
    if (activityIds.some(id => typeof id !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(id)) ||
      activityIds.some(id => !DAILY_CHALLENGE_ACTIVITY_IDS.has(id)) ||
      new Set(activityIds).size !== activityIds.length ||
      completedActivityIds.some(id => !activityIds.includes(id)) ||
      new Set(completedActivityIds).size !== completedActivityIds.length ||
      bonusAwarded !== completedAll) return null;

    days[dayKey] = {
      activityIds: [...activityIds],
      completedActivityIds: [...completedActivityIds],
      bonusAwarded
    };
  }
  return { days };
}

function sanitizeProgress(input, user, previous) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const base = previous || emptyProgress(user);
  const spellingLists = sanitizeSpellingLists(
    Object.hasOwn(input, 'spellingLists') ? input.spellingLists : (base.spellingLists || [])
  );
  if (!spellingLists) return null;
  const dailyChallenges = sanitizeDailyChallenges(
    Object.hasOwn(input, 'dailyChallenges') ? input.dailyChallenges : (base.dailyChallenges || { days: {} })
  );
  if (!dailyChallenges) return null;
  const spellingListIds = new Set(spellingLists.map(list => list.id));
  const requestedActiveListId = Object.hasOwn(input, 'activeSpellingListId')
    ? input.activeSpellingListId
    : (base.activeSpellingListId || null);
  if (requestedActiveListId !== null && typeof requestedActiveListId !== 'string') return null;
  if (Object.hasOwn(input, 'activeSpellingListId') &&
    requestedActiveListId !== null && !spellingListIds.has(requestedActiveListId)) {
    return null;
  }
  const activeSpellingListId = spellingListIds.has(requestedActiveListId) ? requestedActiveListId : null;
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

  const rawActivities = input.activityProgress && typeof input.activityProgress === 'object' && !Array.isArray(input.activityProgress)
    ? input.activityProgress
    : {};
  const activityProgress = {};
  for (const [activityId, rawStat] of Object.entries(rawActivities).slice(0, 100)) {
    if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(activityId) || !rawStat || typeof rawStat !== 'object' || Array.isArray(rawStat)) continue;
    if (!['quiz', 'game'].includes(rawStat.kind) || typeof rawStat.title !== 'string' || typeof rawStat.subject !== 'string') continue;
    const number = key => Number.isFinite(rawStat[key])
      ? Math.max(0, Math.min(1000000000, Math.floor(rawStat[key] * 100) / 100))
      : 0;
    const answerCount = key => Number.isSafeInteger(rawStat[key])
      ? Math.max(0, Math.min(1000000000, rawStat[key]))
      : 0;
    const totalAnswers = answerCount('totalAnswers');
    activityProgress[activityId] = {
      title: rawStat.title.slice(0, 100),
      subject: rawStat.subject.slice(0, 50),
      skillId: typeof rawStat.skillId === 'string' && /^[a-z0-9][a-z0-9_-]{0,63}$/.test(rawStat.skillId)
        ? rawStat.skillId
        : null,
      kind: rawStat.kind,
      scoreUnit: ['questions', 'points', 'rounds', 'time'].includes(rawStat.scoreUnit) ? rawStat.scoreUnit : 'points',
      bestScore: number('bestScore'),
      bestTotal: Number.isFinite(rawStat.bestTotal) && rawStat.bestTotal > 0
        ? Math.min(1000000000, Math.floor(rawStat.bestTotal * 100) / 100)
        : null,
      correct: number('correct'),
      total: number('total'),
      correctAnswers: Math.min(answerCount('correctAnswers'), totalAnswers),
      totalAnswers,
      timesPlayed: Number.isFinite(rawStat.timesPlayed)
        ? Math.max(0, Math.min(1000000000, Math.floor(rawStat.timesPlayed)))
        : 0
    };
  }

  const rawEndlessHighScores = input.endlessHighScores && typeof input.endlessHighScores === 'object' && !Array.isArray(input.endlessHighScores)
    ? input.endlessHighScores
    : {};
  const endlessHighScores = Object.fromEntries(Object.entries(rawEndlessHighScores)
    .filter(([id, score]) => (id === 'timetables' || BELT_IDS.has(id)) && Number.isFinite(score) && score >= 0)
    .map(([id, score]) => [id, Math.min(1000000000, Math.floor(score))]));

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
  const passedBelts = stringArray(input.passedBelts);
  const earnedBadges = new Set(
    (Array.isArray(base.earnedBadges) ? base.earnedBadges : []).filter(id => BADGE_IDS.has(id))
  );
  const playedActivityCount = Object.values(activityProgress).filter(stat => stat.timesPlayed > 0).length;
  const masteredSkillCount = Object.values(skillsProgress)
    .filter(stat => stat.timesTrained > 0 && stat.bestScore >= 10).length;
  const graduatedBeltCount = new Set(passedBelts.filter(id => BELT_IDS.has(id))).size;
  if (playedActivityCount >= 1) earnedBadges.add('first-steps');
  if (playedActivityCount >= 5) earnedBadges.add('activity-explorer');
  if (masteredSkillCount >= 1) earnedBadges.add('skill-master');
  if (graduatedBeltCount >= 1) earnedBadges.add('curriculum-graduate');
  const avatarValue = typeof input.avatar === 'string' ? input.avatar : input.avatar?.id;
  const schoolYear = Number.isInteger(input.schoolYear) && input.schoolYear >= 0 && input.schoolYear <= 12
    ? input.schoolYear
    : Number.isInteger(base.schoolYear) && base.schoolYear >= 0 && base.schoolYear <= 12
      ? base.schoolYear
      : 3;
  const rawSubjectYears = input.subjectYears && typeof input.subjectYears === 'object' && !Array.isArray(input.subjectYears)
    ? input.subjectYears
    : base.subjectYears;
  const subjectYears = Object.fromEntries(Object.entries(rawSubjectYears || {}).filter(([subject, year]) =>
    SUBJECT_YEAR_IDS.has(subject) && Number.isInteger(year) && year >= 0 && year <= 12
  ));

  return {
    ...base,
    id: user.id,
    name: user.username,
    avatar: AVATAR_IDS.has(avatarValue) ? avatarValue : 'raven',
    theme: THEME_IDS.has(input.theme) ? input.theme : (THEME_IDS.has(base.theme) ? base.theme : 'light'),
    schoolYear,
    subjectYears,
    lastModule: LAST_MODULE_IDS.has(input.lastModule) ? input.lastModule : (LAST_MODULE_IDS.has(base.lastModule) ? base.lastModule : null),
    currentBelt: BELT_IDS.has(input.currentBelt) ? input.currentBelt : base.currentBelt,
    stage1PassedBelts: stringArray(input.stage1PassedBelts),
    stage2PassedBelts: stringArray(input.stage2PassedBelts),
    stage3PassedBelts: stringArray(input.stage3PassedBelts),
    passedBelts,
    stars: Number.isFinite(input.stars) ? Math.max(0, Math.min(1000000000, Math.floor(input.stars))) : 0,
    skillsProgress,
    activityProgress,
    earnedBadges: [...earnedBadges],
    dailyChallenges,
    endlessHighScores,
    spellingLists,
    activeSpellingListId,
    certificates,
    createdAt: base.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function getLeaderboardScore(scope, profile) {
  const skills = profile?.skillsProgress && typeof profile.skillsProgress === 'object'
    ? profile.skillsProgress
    : {};
  if (scope === 'all' || scope === 'learning') {
    return Number.isFinite(profile?.stars) ? Math.max(0, Math.floor(profile.stars)) : 0;
  }
  if (scope === 'maths') {
    return Object.entries(skills).reduce((total, [skillId, stat]) => {
      if (!BELT_SKILL_PREFIX.test(skillId)) return total;
      return total + Math.max(0, Math.min(10, Math.floor(Number(stat?.bestScore) || 0)));
    }, 0);
  }
  if (scope === 'times_tables') {
    return Math.max(0, Math.min(33, Math.floor(Number(skills.timetable_practice?.bestScore) || 0)));
  }
  const beltId = scope.slice('belt:'.length);
  return Object.entries(skills).reduce((total, [skillId, stat]) => {
    if (!skillId.startsWith(`${beltId}_`)) return total;
    return total + Math.max(0, Math.min(10, Math.floor(Number(stat?.bestScore) || 0)));
  }, 0);
}

async function readJson(request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) return null;
  const reader = request.body?.getReader();
  if (!reader) return undefined;
  const chunks = [];
  let size = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        try {
          await reader.cancel();
        } catch {}
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const text = new TextDecoder().decode(bytes);
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function originIsAllowed(request) {
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) return false;
    } catch {
      return false;
    }
  }
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

export async function handleAccountRequest(request, store, options = {}) {
  const { pathname, searchParams } = new URL(request.url);
  const { rateLimit } = options;
  if (pathname === '/api/profiles') return errorResponse('Not found', 404);

  if (pathname === '/api/leaderboards' && request.method === 'GET') {
    const scope = searchParams.get('scope');
    const beltId = scope?.startsWith('belt:') ? scope.slice('belt:'.length) : null;
    if (!scope || !['all', 'learning', 'maths', 'times_tables'].includes(scope) && !BELT_IDS.has(beltId)) {
      return errorResponse('Invalid leaderboard scope', 400);
    }
    const entries = (await store.getLeaderboardProfiles())
      .map(({ username, profile }) => ({ username, score: getLeaderboardScore(scope, profile) }))
      .filter(entry => entry.score > 0)
      .sort((first, second) => second.score - first.score || first.username.localeCompare(second.username))
      .slice(0, 10);
    return jsonResponse({ entries });
  }

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
    if (rateLimit && !(await rateLimit({ action: 'register', username }))) return rateLimitResponse();

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
    if (username && rateLimit && !(await rateLimit({ action: 'login', username }))) return rateLimitResponse();
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
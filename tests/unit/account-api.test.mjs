import assert from 'node:assert/strict';
import test from 'node:test';
import { handleAccountRequest } from '../../functions/_shared/account-api.mjs';

class MemoryAccountStore {
  users = [];
  sessions = [];
  progress = new Map();

  async createUser(user) {
    if (this.users.some(candidate => candidate.username === user.username)) {
      const error = new Error('Duplicate username');
      error.code = 'USERNAME_TAKEN';
      throw error;
    }
    this.users.push({ ...user });
  }

  async findUserByUsername(username) {
    return this.users.find(user => user.username === username) || null;
  }

  async findUserById(id) {
    return this.users.find(user => user.id === id) || null;
  }

  async createSession(session) {
    this.sessions.push({ ...session });
  }

  async findSession(tokenHash, now) {
    const session = this.sessions.find(item => item.tokenHash === tokenHash && item.expiresAt > now);
    return session ? this.findUserById(session.userId) : null;
  }

  async deleteSession(tokenHash) {
    this.sessions = this.sessions.filter(session => session.tokenHash !== tokenHash);
  }

  async deleteSessionsForUser(userId) {
    this.sessions = this.sessions.filter(session => session.userId !== userId);
  }

  async updatePassword(userId, passwordHash) {
    const user = await this.findUserById(userId);
    user.passwordHash = passwordHash;
  }

  async deleteAccount(userId) {
    this.users = this.users.filter(user => user.id !== userId);
    this.progress.delete(userId);
    await this.deleteSessionsForUser(userId);
  }

  async getProgress(userId) {
    return this.progress.get(userId) || null;
  }

  async saveProgress(userId, value) {
    this.progress.set(userId, structuredClone(value));
  }
}

async function request(store, path, method = 'GET', body, cookie, origin = 'https://dojo.example') {
  const headers = { Origin: origin };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (cookie) headers.Cookie = cookie;
  return handleAccountRequest(new Request(`https://dojo.example${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  }), store);
}

function sessionCookie(response) {
  return response.headers.get('set-cookie').split(';', 1)[0];
}

test('registration validates input, creates a private account, and issues a secure session', async () => {
  const store = new MemoryAccountStore();
  const invalid = await request(store, '/api/auth/register', 'POST', {
    username: 'ab',
    password: 'short'
  });
  assert.equal(invalid.status, 400);

  const response = await request(store, '/api/auth/register', 'POST', {
    username: 'Jordan_1',
    password: 'long password 123'
  });
  const result = await response.json();

  assert.equal(response.status, 201);
  assert.equal(result.user.username, 'jordan_1');
  assert.equal(result.profile.name, 'jordan_1');
  assert.equal(JSON.stringify(result).includes('passwordHash'), false);
  assert.match(response.headers.get('set-cookie'), /HttpOnly/);
  assert.match(response.headers.get('set-cookie'), /SameSite=Lax/);
  assert.match(response.headers.get('set-cookie'), /Secure/);
  assert.notEqual(store.users[0].passwordHash, 'long password 123');

  const duplicate = await request(store, '/api/auth/register', 'POST', {
    username: 'JORDAN_1',
    password: 'long password 123'
  });
  assert.equal(duplicate.status, 409);
});

test('accounts can only read and update their own progress', async () => {
  const store = new MemoryAccountStore();
  const first = await request(store, '/api/auth/register', 'POST', { username: 'learner_one', password: 'a secure password 123' });
  const second = await request(store, '/api/auth/register', 'POST', { username: 'learner_two', password: 'another secure pass 123' });
  const firstCookie = sessionCookie(first);
  const secondCookie = sessionCookie(second);
  const firstData = await first.json();

  const save = await request(store, '/api/progress', 'PUT', {
    profile: { ...firstData.profile, stars: 15, passedBelts: ['white'] }
  }, firstCookie);
  assert.equal(save.status, 200);

  const firstRead = await request(store, '/api/progress', 'GET', undefined, firstCookie);
  const secondRead = await request(store, '/api/progress', 'GET', undefined, secondCookie);
  assert.equal((await firstRead.json()).profile.stars, 15);
  assert.equal((await secondRead.json()).profile.stars, 0);

  const anonymousRead = await request(store, '/api/progress');
  assert.equal(anonymousRead.status, 401);
  const oldList = await request(store, '/api/profiles');
  assert.equal(oldList.status, 404);
});

test('login uses a generic credential error and logout revokes the session', async () => {
  const store = new MemoryAccountStore();
  const registered = await request(store, '/api/auth/register', 'POST', { username: 'learner', password: 'correct horse battery 42' });
  const wrongPassword = await request(store, '/api/auth/login', 'POST', { username: 'learner', password: 'incorrect password' });
  const unknownUser = await request(store, '/api/auth/login', 'POST', { username: 'nobody', password: 'incorrect password' });
  assert.equal(wrongPassword.status, 401);
  assert.equal(unknownUser.status, 401);
  assert.deepEqual(await wrongPassword.json(), await unknownUser.json());

  const cookie = sessionCookie(registered);
  const session = await request(store, '/api/auth/session', 'GET', undefined, cookie);
  assert.equal(session.status, 200);
  assert.equal((await session.json()).user.username, 'learner');

  const logout = await request(store, '/api/auth/logout', 'POST', {}, cookie);
  assert.equal(logout.status, 200);
  assert.equal((await request(store, '/api/auth/session', 'GET', undefined, cookie)).status, 401);
});

test('password changes rotate sessions and account deletion removes private data', async () => {
  const store = new MemoryAccountStore();
  const registered = await request(store, '/api/auth/register', 'POST', { username: 'delete_me', password: 'current password 123' });
  const cookie = sessionCookie(registered);

  const changed = await request(store, '/api/auth/password', 'POST', {
    currentPassword: 'current password 123',
    newPassword: 'replacement password 456'
  }, cookie);
  assert.equal(changed.status, 200);
  assert.equal((await request(store, '/api/auth/session', 'GET', undefined, cookie)).status, 401);
  const newCookie = sessionCookie(changed);
  const login = await request(store, '/api/auth/login', 'POST', { username: 'delete_me', password: 'replacement password 456' });
  assert.equal(login.status, 200);

  const deleted = await request(store, '/api/auth/account', 'DELETE', { password: 'replacement password 456' }, sessionCookie(login));
  assert.equal(deleted.status, 200);
  assert.equal(store.users.length, 0);
  assert.equal(store.progress.size, 0);
  assert.equal((await request(store, '/api/auth/session', 'GET', undefined, newCookie)).status, 401);
});

test('cross-origin state-changing requests are rejected', async () => {
  const store = new MemoryAccountStore();
  const response = await request(store, '/api/auth/register', 'POST', {
    username: 'origin_test',
    password: 'origin test password 12'
  }, undefined, 'https://attacker.example');
  assert.equal(response.status, 403);
  assert.equal(store.users.length, 0);
});
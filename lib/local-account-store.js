const fs = require('node:fs');
const path = require('node:path');

class LocalAccountStore {
  constructor(dataDirectory) {
    this.filePath = path.join(dataDirectory, 'accounts.json');
    fs.mkdirSync(dataDirectory, { recursive: true });
    if (!fs.existsSync(this.filePath)) this.write(this.emptyStore());
  }

  emptyStore() {
    return { users: [], sessions: [], progress: {} };
  }

  read() {
    try {
      const store = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      return {
        users: Array.isArray(store.users) ? store.users : [],
        sessions: Array.isArray(store.sessions) ? store.sessions : [],
        progress: store.progress && typeof store.progress === 'object' ? store.progress : {}
      };
    } catch (error) {
      if (error.code === 'ENOENT') return this.emptyStore();
      throw error;
    }
  }

  write(store) {
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
    fs.writeFileSync(temporaryPath, JSON.stringify(store), { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(temporaryPath, this.filePath);
  }

  findUserByUsername(username) {
    return this.read().users.find(user => user.username === username) || null;
  }

  findUserById(id) {
    return this.read().users.find(user => user.id === id) || null;
  }

  createUser(user) {
    const store = this.read();
    if (store.users.some(existing => existing.username === user.username)) {
      const error = new Error('Username is already taken');
      error.code = 'USERNAME_TAKEN';
      throw error;
    }
    store.users.push(user);
    this.write(store);
  }

  createSession(session) {
    const store = this.read();
    store.sessions = store.sessions.filter(existing => existing.tokenHash !== session.tokenHash);
    store.sessions.push(session);
    this.write(store);
  }

  findSession(tokenHash, now) {
    const store = this.read();
    const session = store.sessions.find(item => item.tokenHash === tokenHash && item.expiresAt > now);
    if (!session) return null;
    const user = store.users.find(item => item.id === session.userId);
    return user ? { id: user.id, username: user.username } : null;
  }

  deleteSession(tokenHash) {
    const store = this.read();
    store.sessions = store.sessions.filter(session => session.tokenHash !== tokenHash);
    this.write(store);
  }

  deleteSessionsForUser(userId) {
    const store = this.read();
    store.sessions = store.sessions.filter(session => session.userId !== userId);
    this.write(store);
  }

  updatePassword(userId, passwordHash) {
    const store = this.read();
    const user = store.users.find(item => item.id === userId);
    if (user) user.passwordHash = passwordHash;
    this.write(store);
  }

  deleteAccount(userId) {
    const store = this.read();
    store.users = store.users.filter(user => user.id !== userId);
    store.sessions = store.sessions.filter(session => session.userId !== userId);
    delete store.progress[userId];
    this.write(store);
  }

  getProgress(userId) {
    return this.read().progress[userId] || null;
  }

  getLeaderboardProfiles() {
    const store = this.read();
    return store.users
      .filter(user => store.progress[user.id])
      .map(user => ({ username: user.username, profile: store.progress[user.id] }));
  }

  saveProgress(userId, profile) {
    const store = this.read();
    store.progress[userId] = profile;
    this.write(store);
  }
}

module.exports = { LocalAccountStore };
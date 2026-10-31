const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

class LocalAccountStore {
  constructor(dataDirectory) {
    fs.mkdirSync(dataDirectory, { recursive: true });
    this.filePath = path.join(dataDirectory, 'accounts.sqlite');
    this.legacyFilePath = path.join(dataDirectory, 'accounts.json');
    this.ensureDatabaseFile();
    this.database = new DatabaseSync(this.filePath, { timeout: 5000 });
    this.database.exec('PRAGMA foreign_keys = ON;');
    const journalMode = this.database.prepare('PRAGMA journal_mode').get().journal_mode;
    if (journalMode !== 'wal') this.database.exec('PRAGMA journal_mode = WAL');
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS account_sessions (
        token_hash TEXT PRIMARY KEY NOT NULL,
        account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        expires_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS account_sessions_account_id_idx
        ON account_sessions(account_id);
      CREATE TABLE IF NOT EXISTS account_progress (
        account_id TEXT PRIMARY KEY NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        progress_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS local_store_migrations (
        name TEXT PRIMARY KEY NOT NULL,
        completed_at TEXT NOT NULL
      );
    `);
    this.importLegacyJson();
  }

  ensureDatabaseFile() {
    try {
      const descriptor = fs.openSync(this.filePath, 'wx', 0o600);
      fs.closeSync(descriptor);
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
    if (process.platform !== 'win32') fs.chmodSync(this.filePath, 0o600);
  }

  importLegacyJson() {
    const migrationName = 'accounts-json-to-sqlite-v1';
    const isComplete = () => this.database.prepare(
      'SELECT 1 AS complete FROM local_store_migrations WHERE name = ?'
    ).get(migrationName);
    if (isComplete()) return;

    const legacy = { users: [], sessions: [], progress: {} };

    if (fs.existsSync(this.legacyFilePath)) {
      const stored = JSON.parse(fs.readFileSync(this.legacyFilePath, 'utf8'));
      legacy.users = Array.isArray(stored.users) ? stored.users : [];
      legacy.sessions = Array.isArray(stored.sessions) ? stored.sessions : [];
      legacy.progress = stored.progress && typeof stored.progress === 'object' ? stored.progress : {};
    }

    this.database.exec('BEGIN IMMEDIATE');
    try {
      if (!isComplete()) {
        const insertUser = this.database.prepare(
          'INSERT INTO accounts (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)'
        );
        const knownUsers = new Set();
        for (const user of legacy.users) {
          if (!user?.id || !user.username || !user.passwordHash) {
            throw new Error('Legacy account data is invalid; the JSON file was left unchanged');
          }
          insertUser.run(user.id, user.username, user.passwordHash, user.createdAt || new Date().toISOString());
          knownUsers.add(user.id);
        }

        const insertSession = this.database.prepare(
          'INSERT INTO account_sessions (token_hash, account_id, expires_at) VALUES (?, ?, ?)'
        );
        for (const session of legacy.sessions) {
          if (knownUsers.has(session?.userId) && session.tokenHash && Number.isFinite(session.expiresAt)) {
            insertSession.run(session.tokenHash, session.userId, session.expiresAt);
          }
        }

        const insertProgress = this.database.prepare(
          'INSERT INTO account_progress (account_id, progress_json, updated_at) VALUES (?, ?, ?)'
        );
        for (const [accountId, progress] of Object.entries(legacy.progress)) {
          if (!knownUsers.has(accountId)) continue;
          insertProgress.run(accountId, JSON.stringify(progress), progress?.updatedAt || new Date().toISOString());
        }

        this.database.prepare(
          'INSERT INTO local_store_migrations (name, completed_at) VALUES (?, ?)'
        ).run(migrationName, new Date().toISOString());
      }
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  findUserByUsername(username) {
    return this.database.prepare(
      'SELECT id, username, password_hash AS passwordHash, created_at AS createdAt FROM accounts WHERE username = ?'
    ).get(username) || null;
  }

  findUserById(id) {
    return this.database.prepare(
      'SELECT id, username, password_hash AS passwordHash, created_at AS createdAt FROM accounts WHERE id = ?'
    ).get(id) || null;
  }

  createUser(user) {
    try {
      this.database.prepare(
        'INSERT INTO accounts (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)'
      ).run(user.id, user.username, user.passwordHash, user.createdAt);
    } catch (error) {
      if (/UNIQUE constraint failed: accounts\.username/i.test(error.message)) {
        const duplicate = new Error('Username is already taken');
        duplicate.code = 'USERNAME_TAKEN';
        throw duplicate;
      }
      throw error;
    }
  }

  createSession(session) {
    this.database.prepare(
      `INSERT INTO account_sessions (token_hash, account_id, expires_at) VALUES (?, ?, ?)
       ON CONFLICT(token_hash) DO UPDATE SET account_id = excluded.account_id, expires_at = excluded.expires_at`
    ).run(session.tokenHash, session.userId, session.expiresAt);
  }

  findSession(tokenHash, now) {
    const user = this.database.prepare(
      `SELECT accounts.id, accounts.username
       FROM account_sessions
       JOIN accounts ON accounts.id = account_sessions.account_id
       WHERE account_sessions.token_hash = ? AND account_sessions.expires_at > ?`
    ).get(tokenHash, now);
    return user ? { id: user.id, username: user.username } : null;
  }

  deleteSession(tokenHash) {
    this.database.prepare('DELETE FROM account_sessions WHERE token_hash = ?').run(tokenHash);
  }

  deleteSessionsForUser(userId) {
    this.database.prepare('DELETE FROM account_sessions WHERE account_id = ?').run(userId);
  }

  updatePassword(userId, passwordHash) {
    this.database.prepare('UPDATE accounts SET password_hash = ? WHERE id = ?').run(passwordHash, userId);
  }

  deleteAccount(userId) {
    this.database.prepare('DELETE FROM accounts WHERE id = ?').run(userId);
  }

  getProgress(userId) {
    const row = this.database.prepare(
      'SELECT progress_json AS progressJson FROM account_progress WHERE account_id = ?'
    ).get(userId);
    return row ? JSON.parse(row.progressJson) : null;
  }

  getLeaderboardProfiles() {
    return this.database.prepare(
      `SELECT accounts.username, account_progress.progress_json AS progressJson
       FROM accounts
       JOIN account_progress ON account_progress.account_id = accounts.id`
    ).all().map(row => ({ username: row.username, profile: JSON.parse(row.progressJson) }));
  }

  saveProgress(userId, profile) {
    this.database.prepare(
      `INSERT INTO account_progress (account_id, progress_json, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(account_id) DO UPDATE SET progress_json = excluded.progress_json, updated_at = excluded.updated_at`
    ).run(userId, JSON.stringify(profile), profile.updatedAt || new Date().toISOString());
  }

  close() {
    this.database.close();
  }
}

module.exports = { LocalAccountStore };
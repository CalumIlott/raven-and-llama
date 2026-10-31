export class D1AccountStore {
  constructor(database) {
    if (!database) throw new Error('Cloudflare D1 binding DB is not configured');
    this.database = database;
  }

  async findUserByUsername(username) {
    const row = await this.database.prepare(
      'SELECT id, username, password_hash AS passwordHash, created_at AS createdAt FROM accounts WHERE username = ?'
    ).bind(username).first();
    return row || null;
  }

  async findUserById(id) {
    const row = await this.database.prepare(
      'SELECT id, username, password_hash AS passwordHash, created_at AS createdAt FROM accounts WHERE id = ?'
    ).bind(id).first();
    return row || null;
  }

  async createUser(user) {
    try {
      await this.database.prepare(
        'INSERT INTO accounts (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)'
      ).bind(user.id, user.username, user.passwordHash, user.createdAt).run();
    } catch (error) {
      if (/unique|constraint/i.test(error.message)) {
        const duplicate = new Error('Username is already taken');
        duplicate.code = 'USERNAME_TAKEN';
        throw duplicate;
      }
      throw error;
    }
  }

  async createSession(session) {
    await this.database.prepare(
      'INSERT INTO account_sessions (token_hash, account_id, expires_at) VALUES (?, ?, ?)'
    ).bind(session.tokenHash, session.userId, session.expiresAt).run();
  }

  async findSession(tokenHash, now) {
    const row = await this.database.prepare(
      `SELECT a.id, a.username
       FROM account_sessions s
       JOIN accounts a ON a.id = s.account_id
       WHERE s.token_hash = ? AND s.expires_at > ?`
    ).bind(tokenHash, now).first();
    return row || null;
  }

  async deleteSession(tokenHash) {
    await this.database.prepare('DELETE FROM account_sessions WHERE token_hash = ?').bind(tokenHash).run();
  }

  async deleteSessionsForUser(userId) {
    await this.database.prepare('DELETE FROM account_sessions WHERE account_id = ?').bind(userId).run();
  }

  async updatePassword(userId, passwordHash) {
    await this.database.prepare('UPDATE accounts SET password_hash = ? WHERE id = ?').bind(passwordHash, userId).run();
  }

  async deleteAccount(userId) {
    await this.database.batch([
      this.database.prepare('DELETE FROM account_sessions WHERE account_id = ?').bind(userId),
      this.database.prepare('DELETE FROM account_progress WHERE account_id = ?').bind(userId),
      this.database.prepare('DELETE FROM accounts WHERE id = ?').bind(userId)
    ]);
  }

  async getProgress(userId) {
    const row = await this.database.prepare(
      'SELECT progress_json AS progressJson FROM account_progress WHERE account_id = ?'
    ).bind(userId).first();
    return row ? JSON.parse(row.progressJson) : null;
  }

  async saveProgress(userId, profile) {
    await this.database.prepare(
      `INSERT INTO account_progress (account_id, progress_json, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(account_id) DO UPDATE SET progress_json = excluded.progress_json, updated_at = excluded.updated_at`
    ).bind(userId, JSON.stringify(profile), profile.updatedAt).run();
  }
}
class ProfileManager {
  static account = null;
  static currentProfile = null;
  static accountServiceAvailable = true;
  static lastSaveError = '';
  static saveQueue = Promise.resolve();

  static AVATARS = [
    { id: 'raven', name: 'Black Feather Raven', emoji: '🪶', color: 'bg-black text-white border-2 border-zinc-700 shadow-md', icon: 'feather' },
    { id: 'llama', name: 'Llama', emoji: '🦙', color: 'bg-amber-100 text-amber-950 border border-amber-400', icon: 'smile' },
    { id: 'hippo', name: 'Hippo', emoji: '🦛', color: 'bg-teal-900 text-teal-200 border border-teal-400/50', icon: 'shield' },
    { id: 'owl', name: 'Owl', emoji: '🦉', color: 'bg-amber-900 text-amber-100 border border-amber-400/50', icon: 'book' },
    { id: 'fire', name: 'Fire Ninja', emoji: '🔥', color: 'bg-red-500 text-white', icon: 'flame' },
    { id: 'ice', name: 'Frost Ninja', emoji: '❄️', color: 'bg-cyan-500 text-white', icon: 'snowflake' },
    { id: 'lightning', name: 'Thunder Ninja', emoji: '⚡', color: 'bg-amber-400 text-slate-900', icon: 'zap' },
    { id: 'shadow', name: 'Shadow Ninja', emoji: '🌑', color: 'bg-purple-600 text-white', icon: 'moon' },
    { id: 'nature', name: 'Forest Ninja', emoji: '🍃', color: 'bg-emerald-500 text-white', icon: 'leaf' },
    { id: 'panda', name: 'Panda Master', emoji: '🐼', color: 'bg-slate-200 text-slate-900', icon: 'smile' },
    { id: 'golden', name: 'Golden Master', emoji: '⭐', color: 'bg-yellow-400 text-slate-900', icon: 'star' },
    { id: 'fox', name: 'Swift Fox', emoji: '🦊', color: 'bg-orange-500 text-white', icon: 'zap' }
  ];

  static getAvatar(avatarId) {
    return ProfileManager.AVATARS.find(avatar => avatar.id === avatarId) || ProfileManager.AVATARS[0];
  }

  static createGuestProfile() {
    const now = new Date().toISOString();
    return {
      id: 'guest',
      name: 'Guest',
      avatar: ProfileManager.getAvatar('raven'),
      currentBelt: 'white',
      stage1PassedBelts: [],
      stage2PassedBelts: [],
      stage3PassedBelts: [],
      passedBelts: [],
      stars: 0,
      skillsProgress: {},
      endlessHighScores: {},
      certificates: [],
      createdAt: now,
      updatedAt: now
    };
  }

  static normalizeProfile(profile, account = ProfileManager.account) {
    const source = profile && typeof profile === 'object' ? profile : {};
    const avatarId = typeof source.avatar === 'string' ? source.avatar : source.avatar?.id || 'raven';
    const now = new Date().toISOString();
    const beltIds = (window.BELTS_DATA || []).map(belt => belt.id);
    const endlessHighScores = source.endlessHighScores && typeof source.endlessHighScores === 'object' && !Array.isArray(source.endlessHighScores)
      ? Object.fromEntries(Object.entries(source.endlessHighScores).filter(([id, score]) =>
        (id === 'timetables' || beltIds.includes(id)) && Number.isSafeInteger(score) && score >= 0
      ))
      : {};
    return {
      id: account?.id || 'guest',
      name: account?.username || 'Guest',
      avatar: ProfileManager.getAvatar(avatarId),
      currentBelt: source.currentBelt || 'white',
      stage1PassedBelts: Array.isArray(source.stage1PassedBelts) ? source.stage1PassedBelts : [],
      stage2PassedBelts: Array.isArray(source.stage2PassedBelts) ? source.stage2PassedBelts : [],
      stage3PassedBelts: Array.isArray(source.stage3PassedBelts) ? source.stage3PassedBelts : [],
      passedBelts: Array.isArray(source.passedBelts) ? source.passedBelts : [],
      stars: typeof source.stars === 'number' ? source.stars : 0,
      skillsProgress: source.skillsProgress && typeof source.skillsProgress === 'object' ? source.skillsProgress : {},
      endlessHighScores,
      certificates: Array.isArray(source.certificates) ? source.certificates : [],
      createdAt: source.createdAt || now,
      updatedAt: source.updatedAt || now
    };
  }

  static setGuest() {
    ProfileManager.account = null;
    ProfileManager.currentProfile = ProfileManager.createGuestProfile();
    ProfileManager.lastSaveError = '';
  }

  static acceptSession(data) {
    ProfileManager.account = data.user;
    ProfileManager.currentProfile = ProfileManager.normalizeProfile(data.profile, data.user);
    ProfileManager.accountServiceAvailable = true;
    ProfileManager.lastSaveError = '';
  }

  static async requestApi(url, method = 'GET', body) {
    const options = {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    };
    if (body !== undefined) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || 'Account request failed');
      error.status = response.status;
      throw error;
    }
    return data;
  }

  static async initialize() {
    try {
      const data = await ProfileManager.requestApi('/api/auth/session');
      ProfileManager.acceptSession(data);
      return true;
    } catch (error) {
      ProfileManager.setGuest();
      ProfileManager.accountServiceAvailable = error.status !== 503;
      return false;
    }
  }

  static async registerAccount(username, password) {
    const data = await ProfileManager.requestApi('/api/auth/register', 'POST', { username, password });
    ProfileManager.acceptSession(data);
    return data.user;
  }

  static async login(username, password) {
    const data = await ProfileManager.requestApi('/api/auth/login', 'POST', { username, password });
    ProfileManager.acceptSession(data);
    return data.user;
  }

  static async logout() {
    await ProfileManager.flush();
    try {
      if (ProfileManager.account) await ProfileManager.requestApi('/api/auth/logout', 'POST');
    } finally {
      ProfileManager.setGuest();
      ProfileManager.accountServiceAvailable = true;
    }
  }

  static async changePassword(currentPassword, newPassword) {
    const data = await ProfileManager.requestApi('/api/auth/password', 'POST', { currentPassword, newPassword });
    ProfileManager.acceptSession(data);
  }

  static async deleteAccount(password) {
    await ProfileManager.requestApi('/api/auth/account', 'DELETE', { password });
    ProfileManager.setGuest();
  }

  static async refreshSession() {
    if (!ProfileManager.account) return false;
    await ProfileManager.flush();
    try {
      const data = await ProfileManager.requestApi('/api/auth/session');
      ProfileManager.acceptSession(data);
      return true;
    } catch (error) {
      if (error.status === 401) ProfileManager.setGuest();
      else ProfileManager.lastSaveError = 'Unable to sync progress. Check your connection.';
      return false;
    } finally {
      window.app?.updateHeader();
      window.app?.refreshCurrentView();
    }
  }

  static getActiveProfile() {
    if (!ProfileManager.currentProfile) ProfileManager.setGuest();
    return ProfileManager.currentProfile;
  }

  static loadProfiles() {
    return [ProfileManager.getActiveProfile()];
  }

  static isAuthenticated() {
    return Boolean(ProfileManager.account);
  }

  static updateProfile(updatedProfile) {
    const account = ProfileManager.account;
    const normalized = ProfileManager.normalizeProfile(updatedProfile, account);
    normalized.updatedAt = new Date().toISOString();
    ProfileManager.currentProfile = normalized;

    if (!account) {
      window.app?.updateHeader();
      return Promise.resolve(false);
    }

    const accountId = account.id;
    const snapshot = JSON.parse(JSON.stringify(normalized));
    ProfileManager.saveQueue = ProfileManager.saveQueue.catch(() => false).then(async () => {
      if (!ProfileManager.account || ProfileManager.account.id !== accountId) return false;
      const data = await ProfileManager.requestApi('/api/progress', 'PUT', { profile: snapshot });
      if (ProfileManager.account?.id === accountId) {
        ProfileManager.currentProfile = ProfileManager.normalizeProfile(data.profile, ProfileManager.account);
        ProfileManager.lastSaveError = '';
      }
      window.app?.updateHeader();
      return true;
    }).catch(error => {
      ProfileManager.lastSaveError = error.message || 'Unable to sync progress.';
      window.app?.updateHeader();
      return false;
    });
    window.app?.updateHeader();
    return ProfileManager.saveQueue;
  }

  static flush() {
    return ProfileManager.saveQueue;
  }

  static recordTrainingScore(skillId, score, total = 10) {
    const profile = ProfileManager.getActiveProfile();
    if (!profile.skillsProgress[skillId]) {
      profile.skillsProgress[skillId] = { correct: 0, total: 0, bestScore: 0, timesTrained: 0, stars: 0 };
    }
    const stat = profile.skillsProgress[skillId];
    stat.total += total;
    stat.correct += score;
    stat.timesTrained += 1;
    stat.bestScore = Math.max(stat.bestScore || 0, score);
    if (score >= 10) stat.stars = 3;
    else if (score >= 8) stat.stars = Math.max(stat.stars || 0, 2);
    else if (score >= 5) stat.stars = Math.max(stat.stars || 0, 1);
    profile.stars += score;
    ProfileManager.updateProfile(profile);
    return profile;
  }

  static recordEndlessHighScore(scoreId, score) {
    const profile = ProfileManager.getActiveProfile();
    const validBeltIds = (window.BELTS_DATA || []).map(belt => belt.id);
    if (scoreId !== 'timetables' && !validBeltIds.includes(scoreId)) return profile;
    if (!Number.isFinite(score) || score < 0) return profile;
    if (!profile.endlessHighScores) profile.endlessHighScores = {};
    const bestScore = Number.isSafeInteger(profile.endlessHighScores[scoreId]) ? profile.endlessHighScores[scoreId] : 0;
    profile.endlessHighScores[scoreId] = Math.max(bestScore, Math.floor(score));
    ProfileManager.updateProfile(profile);
    return profile;
  }

  static hasAllSkillsTrainedWith10(beltId) {
    const profile = ProfileManager.getActiveProfile();
    const belt = (window.BELTS_DATA || []).find(item => item.id === beltId);
    if (!belt) return false;
    return belt.skills.every(skill => {
      const stat = profile.skillsProgress?.[skill.id];
      return stat && (stat.timesTrained || 0) > 0 && (stat.bestScore || 0) >= 10;
    });
  }

  static getSkillsTrainingStatus(beltId) {
    const profile = ProfileManager.getActiveProfile();
    const belt = (window.BELTS_DATA || []).find(item => item.id === beltId);
    if (!belt) return { trainedCount: 0, masterCount: 0, total: 0, skills: [] };

    let trainedCount = 0;
    let masterCount = 0;
    const skills = belt.skills.map(skill => {
      const stat = profile.skillsProgress?.[skill.id];
      const isTrained = Boolean(stat && (stat.timesTrained || 0) > 0);
      const isMaster10 = Boolean(stat && (stat.bestScore || 0) >= 10);
      if (isTrained) trainedCount++;
      if (isMaster10) masterCount++;
      return { id: skill.id, name: skill.name, isTrained, bestScore: stat?.bestScore || 0, isMaster10 };
    });

    return { trainedCount, masterCount, total: belt.skills.length, skills };
  }

  static canTakeFinalTest(beltId) {
    const profile = ProfileManager.getActiveProfile();
    return (profile.stage2PassedBelts || []).includes(beltId) && ProfileManager.hasAllSkillsTrainedWith10(beltId);
  }

  static recordTestPass(beltId, stage = 1, score, total = 10) {
    const profile = ProfileManager.getActiveProfile();
    if (!profile.stage1PassedBelts) profile.stage1PassedBelts = [];
    if (!profile.stage2PassedBelts) profile.stage2PassedBelts = [];
    if (!profile.stage3PassedBelts) profile.stage3PassedBelts = [];
    if (!profile.passedBelts) profile.passedBelts = [];

    const beltsData = window.BELTS_DATA || [];
    if (stage === 1) {
      if (!profile.stage1PassedBelts.includes(beltId)) profile.stage1PassedBelts.push(beltId);
      profile.stars += 25;
    } else if (stage === 2) {
      if (!profile.stage2PassedBelts.includes(beltId)) profile.stage2PassedBelts.push(beltId);
      profile.stars += 25;
    } else {
      if (!profile.stage3PassedBelts.includes(beltId)) profile.stage3PassedBelts.push(beltId);
      if (!profile.stage2PassedBelts.includes(beltId)) profile.stage2PassedBelts.push(beltId);
      if (!profile.passedBelts.includes(beltId)) profile.passedBelts.push(beltId);
      profile.stars += 50;
      if (!profile.certificates) profile.certificates = [];
      profile.certificates.push({
        id: 'cert_' + Date.now(),
        beltId,
        beltName: beltsData.find(belt => belt.id === beltId)?.name || beltId,
        stage: 'Grand Master Grade',
        score: `${score}/${total}`,
        date: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
      });

      const beltIndex = beltsData.findIndex(belt => belt.id === beltId);
      if (beltIndex !== -1 && beltIndex < beltsData.length - 1) profile.currentBelt = beltsData[beltIndex + 1].id;
    }

    ProfileManager.updateProfile(profile);
  }
}

window.ProfileManager = ProfileManager;
window.addEventListener('focus', () => ProfileManager.refreshSession());
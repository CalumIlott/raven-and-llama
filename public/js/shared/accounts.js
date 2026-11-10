class ProfileManager {
  static account = null;
  static currentProfile = null;
  static accountServiceAvailable = true;
  static lastSaveError = '';
  static saveQueue = Promise.resolve();
  static cosmeticPurchaseQueue = Promise.resolve();
  static GUEST_THEME_KEY = 'raven_llama_guest_theme';
  static MAX_SPELLING_LISTS = 10;
  static MAX_SPELLING_WORDS_PER_LIST = 50;
  static MAX_SPELLING_WORD_LENGTH = 100;
  static MAX_SPELLING_LIST_NAME_LENGTH = 50;
  static LAST_MODULES = new Set(['learning', 'dojo', 'timetables', 'spelling']);
  static SCHOOL_YEAR_LEVELS = [
    { value: 0, label: 'Foundation' },
    ...Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: `Year ${index + 1}` }))
  ];
  static SUBJECTS = [
    { id: 'maths', label: 'Maths' },
    { id: 'science', label: 'Science' },
    { id: 'english', label: 'English & Spelling' }
  ];

  static AVATARS = [
    { id: 'raven', name: 'Raven', emoji: '🐦‍⬛', image: 'assets/Raven%26Llama_Profile_Raven.jpg', color: 'bg-black text-white border-2 border-zinc-700 shadow-md', icon: 'feather' },
    { id: 'llama', name: 'Llama', emoji: '🦙', image: 'assets/Raven%26Llama_Profile_Llama.jpg', color: 'bg-amber-100 text-amber-950 border border-amber-400', icon: 'smile' },
    { id: 'hippo', name: 'Hippo', emoji: '🦛', image: 'assets/Raven%26Llama_Profile_Hippo.jpg', color: 'bg-teal-900 text-teal-200 border border-teal-400/50', icon: 'shield' },
    { id: 'owl', name: 'Owl', emoji: '🦉', image: 'assets/Raven%26Llama_Profile_Owl.jpg', color: 'bg-amber-900 text-amber-100 border border-amber-400', icon: 'book' }
  ];

  static LEGACY_AVATARS = [
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
    return [...ProfileManager.AVATARS, ...ProfileManager.LEGACY_AVATARS].find(avatar => avatar.id === avatarId)
      || ProfileManager.AVATARS[0];
  }

  static createGuestProfile() {
    const now = new Date().toISOString();
    return {
      id: 'guest',
      name: 'Guest',
      avatar: ProfileManager.getAvatar('raven'),
      theme: 'light',
      schoolYear: 3,
      subjectYears: {},
      soundEnabled: true,
      currentBelt: 'white',
      stage1PassedBelts: [],
      stage2PassedBelts: [],
      stage3PassedBelts: [],
      passedBelts: [],
      stars: 0,
      skillsProgress: {},
      activityProgress: {},
      activityHistory: [],
      questProgress: {},
      earnedBadges: [],
      ownedCosmetics: [],
      equippedCosmetic: null,
      dailyChallenges: { days: {} },
      endlessHighScores: {},
      spellingLists: [],
      activeSpellingListId: null,
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
    const spellingLists = ProfileManager.normalizeSpellingLists(source.spellingLists);
    const activeSpellingListId = spellingLists.some(list => list.id === source.activeSpellingListId)
      ? source.activeSpellingListId
      : null;
    const activityProgress = ProfileManager.normalizeActivityProgress(source.activityProgress);
    const activityHistory = ProfileManager.normalizeActivityHistory(source.activityHistory);
    const questProgress = window.LearningQuests
      ? window.LearningQuests.normalizeProgress(source.questProgress)
      : {};
    const skillsProgress = source.skillsProgress && typeof source.skillsProgress === 'object' && !Array.isArray(source.skillsProgress)
      ? source.skillsProgress
      : {};
    const passedBelts = Array.isArray(source.passedBelts) ? source.passedBelts : [];
    const earnedBadges = window.AchievementBadges
      ? window.AchievementBadges.normalizeEarnedIds(source.earnedBadges, {
        activityProgress,
        skillsProgress,
        passedBelts,
        questProgress
      })
      : [];
    const ownedCosmetics = window.CosmeticShop
      ? window.CosmeticShop.normalizeOwned(source.ownedCosmetics)
      : [];
    const equippedCosmetic = ownedCosmetics.includes(source.equippedCosmetic)
      ? source.equippedCosmetic
      : null;
    return {
      id: account?.id || 'guest',
      name: account?.username || 'Guest',
      avatar: ProfileManager.getAvatar(avatarId),
      theme: source.theme === 'dark' ? 'dark' : 'light',
      schoolYear: ProfileManager.isValidSchoolYear(source.schoolYear) ? source.schoolYear : 3,
      subjectYears: ProfileManager.normalizeSubjectYears(source.subjectYears),
      soundEnabled: source.soundEnabled !== false,
      lastModule: ProfileManager.LAST_MODULES.has(source.lastModule) ? source.lastModule : null,
      currentBelt: source.currentBelt || 'white',
      stage1PassedBelts: Array.isArray(source.stage1PassedBelts) ? source.stage1PassedBelts : [],
      stage2PassedBelts: Array.isArray(source.stage2PassedBelts) ? source.stage2PassedBelts : [],
      stage3PassedBelts: Array.isArray(source.stage3PassedBelts) ? source.stage3PassedBelts : [],
      passedBelts,
      stars: typeof source.stars === 'number' ? source.stars : 0,
      skillsProgress,
      activityProgress,
      activityHistory,
      questProgress,
      earnedBadges,
      ownedCosmetics,
      equippedCosmetic,
      dailyChallenges: ProfileManager.normalizeDailyChallenges(source.dailyChallenges),
      endlessHighScores,
      spellingLists,
      activeSpellingListId,
      certificates: Array.isArray(source.certificates) ? source.certificates : [],
      createdAt: source.createdAt || now,
      updatedAt: source.updatedAt || now
    };
  }

  static setGuest() {
    const previousAccountId = ProfileManager.account?.id || (ProfileManager.currentProfile ? 'guest' : null);
    ProfileManager.account = null;
    ProfileManager.currentProfile = ProfileManager.createGuestProfile();
    ProfileManager.currentProfile.theme = ProfileManager.readGuestThemePreference();
    ProfileManager.applyTheme(ProfileManager.currentProfile.theme);
    window.soundFX?.setMuted(!ProfileManager.currentProfile.soundEnabled);
    ProfileManager.lastSaveError = '';
    if (previousAccountId && previousAccountId !== 'guest') {
      window.gameEngine?.discardSessionForAccountChange();
    }
  }

  static readGuestThemePreference() {
    try {
      return localStorage.getItem(ProfileManager.GUEST_THEME_KEY) === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  static acceptSession(data) {
    const previousAccountId = ProfileManager.account?.id || (ProfileManager.currentProfile ? 'guest' : null);
    ProfileManager.account = data.user;
    ProfileManager.currentProfile = ProfileManager.normalizeProfile(data.profile, data.user);
    ProfileManager.applyTheme(ProfileManager.currentProfile.theme);
    window.soundFX?.setMuted(!ProfileManager.currentProfile.soundEnabled);
    ProfileManager.accountServiceAvailable = true;
    ProfileManager.lastSaveError = '';
    if (previousAccountId && previousAccountId !== data.user.id) {
      window.gameEngine?.discardSessionForAccountChange();
    }
  }

  static applyTheme(theme) {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme !== 'light');
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

  static validateSpellingLists(lists) {
    if (!Array.isArray(lists)) return 'Spelling lists must be a list.';
    if (lists.length > ProfileManager.MAX_SPELLING_LISTS) {
      return `Keep no more than ${ProfileManager.MAX_SPELLING_LISTS} spelling lists.`;
    }

    const ids = new Set();
    const names = new Set();
    for (const list of lists) {
      if (!list || typeof list !== 'object' || Array.isArray(list) ||
        typeof list.id !== 'string' || !/^[a-zA-Z0-9_-]{1,36}$/.test(list.id)) {
        return 'Each spelling list needs a valid ID.';
      }
      if (typeof list.name !== 'string' || !list.name.trim() ||
        list.name.trim().length > ProfileManager.MAX_SPELLING_LIST_NAME_LENGTH) {
        return `List names must be 1 to ${ProfileManager.MAX_SPELLING_LIST_NAME_LENGTH} characters.`;
      }
      if (!Array.isArray(list.words) || list.words.length > ProfileManager.MAX_SPELLING_WORDS_PER_LIST) {
        return `Each list can contain no more than ${ProfileManager.MAX_SPELLING_WORDS_PER_LIST} words.`;
      }

      const normalizedName = list.name.trim().toLowerCase();
      if (ids.has(list.id)) return 'Each spelling list must have a unique ID.';
      if (names.has(normalizedName)) return 'List names must be unique.';
      ids.add(list.id);
      names.add(normalizedName);

      const words = new Set();
      for (const rawWord of list.words) {
        if (typeof rawWord !== 'string' || !rawWord.trim()) return 'Remove blank words from the list.';
        const word = rawWord.trim();
        if (word.length > ProfileManager.MAX_SPELLING_WORD_LENGTH) {
          return `Each word must be no more than ${ProfileManager.MAX_SPELLING_WORD_LENGTH} characters.`;
        }
        const normalizedWord = word.toLowerCase();
        if (words.has(normalizedWord)) return 'Words in a list must be unique.';
        words.add(normalizedWord);
      }
    }

    return null;
  }

  static normalizeSpellingLists(value) {
    if (!Array.isArray(value)) return [];
    const lists = [];
    for (const rawList of value.slice(0, ProfileManager.MAX_SPELLING_LISTS)) {
      if (!rawList || typeof rawList !== 'object' || Array.isArray(rawList) || !Array.isArray(rawList.words)) continue;
      const list = {
        id: rawList.id,
        name: typeof rawList.name === 'string' ? rawList.name.trim() : '',
        words: rawList.words.map(word => typeof word === 'string' ? word.trim() : word)
      };
      if (!ProfileManager.validateSpellingLists([...lists, list])) lists.push(list);
    }
    return lists;
  }

  static isValidSchoolYear(value) {
    return Number.isInteger(value) && value >= 0 && value <= 12;
  }

  static normalizeSubjectYears(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const subjects = new Set(ProfileManager.SUBJECTS.map(subject => subject.id));
    return Object.fromEntries(Object.entries(value).filter(([subject, year]) =>
      subjects.has(subject) && ProfileManager.isValidSchoolYear(year)
    ));
  }

  static isValidDailyChallengeDayKey(dayKey) {
    if (typeof dayKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) return false;
    const [year, month, day] = dayKey.split('-').map(Number);
    if (year < 1970 || month < 1 || month > 12 || day < 1 || day > 31) return false;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day;
  }

  static normalizeDailyChallenges(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
      !value.days || typeof value.days !== 'object' || Array.isArray(value.days)) {
      return { days: {} };
    }

    const days = {};
    for (const [dayKey, rawDay] of Object.entries(value.days)
      .filter(([dayKey]) => ProfileManager.isValidDailyChallengeDayKey(dayKey))
      .sort(([first], [second]) => first.localeCompare(second))
      .slice(-31)) {
      if (!rawDay || typeof rawDay !== 'object' || Array.isArray(rawDay) ||
        !Array.isArray(rawDay.activityIds) || rawDay.activityIds.length > 4 ||
        !Array.isArray(rawDay.completedActivityIds) || rawDay.completedActivityIds.length > 4 ||
        typeof rawDay.bonusAwarded !== 'boolean') continue;

      const activityIds = rawDay.activityIds;
      const completedActivityIds = rawDay.completedActivityIds;
      const completedAll = activityIds.length > 0 &&
        completedActivityIds.length === activityIds.length;
      if (activityIds.some(id => typeof id !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(id)) ||
        new Set(activityIds).size !== activityIds.length ||
        completedActivityIds.some(id => !activityIds.includes(id)) ||
        new Set(completedActivityIds).size !== completedActivityIds.length ||
        rawDay.bonusAwarded !== completedAll) continue;

      days[dayKey] = {
        activityIds: [...activityIds],
        completedActivityIds: [...completedActivityIds],
        bonusAwarded: rawDay.bonusAwarded
      };
    }
    return { days };
  }

  static getSchoolYearLabel(year) {
    return ProfileManager.SCHOOL_YEAR_LEVELS.find(level => level.value === year)?.label || 'Year 3';
  }

  static getSubjectYear(subjectId) {
    const profile = ProfileManager.getActiveProfile();
    return profile.subjectYears[subjectId] ?? profile.schoolYear;
  }

  static getSubjectDifficulty(subjectId) {
    const year = ProfileManager.getSubjectYear(subjectId);
    if (year <= 2) return 'easy';
    if (year <= 6) return 'medium';
    return 'hard';
  }

  static setTheme(theme, options = {}) {
    if (theme !== 'dark' && theme !== 'light') return Promise.resolve(false);
    const profile = ProfileManager.getActiveProfile();
    profile.theme = theme;
    ProfileManager.applyTheme(theme);
    if (!ProfileManager.account) {
      if (options.persistGuest === false) {
        window.app?.updateHeader();
        return Promise.resolve(true);
      }
      try {
        localStorage.setItem(ProfileManager.GUEST_THEME_KEY, theme);
      } catch {
        return Promise.resolve(false);
      }
      window.app?.updateHeader();
      return Promise.resolve(true);
    }
    return ProfileManager.updateProfile(profile);
  }

  static updateProfile(updatedProfile) {
    const account = ProfileManager.account;
    const normalized = ProfileManager.normalizeProfile(updatedProfile, account);
    normalized.updatedAt = new Date().toISOString();
    ProfileManager.currentProfile = normalized;
    ProfileManager.applyTheme(normalized.theme);

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

  static async resetLearningProgress() {
    const account = ProfileManager.account;
    if (!account) throw new Error('Sign in to reset saved learning progress.');
    await ProfileManager.flush();
    if (ProfileManager.account?.id !== account.id) throw new Error('The active account changed before progress could be reset.');
    const data = await ProfileManager.requestApi('/api/progress/reset', 'POST', { confirmation: 'RESET PROGRESS' });
    if (ProfileManager.account?.id !== account.id) throw new Error('The active account changed before progress could be reset.');
    ProfileManager.currentProfile = ProfileManager.normalizeProfile(data.profile, account);
    window.soundFX?.setMuted(!ProfileManager.currentProfile.soundEnabled);
    window.app?.updateHeader();
    return ProfileManager.currentProfile;
  }

  static purchaseCosmetic(cosmeticId) {
    const operation = ProfileManager.cosmeticPurchaseQueue.catch(() => false).then(async () => {
      const cosmetic = window.CosmeticShop?.get(cosmeticId);
      if (!cosmetic || !cosmetic.available) return { success: false, reason: 'unavailable' };
      const profile = ProfileManager.getActiveProfile();
      if (profile.ownedCosmetics.includes(cosmeticId)) return { success: false, reason: 'already-owned' };
      if (profile.stars < cosmetic.price) return { success: false, reason: 'insufficient-stars' };

      if (ProfileManager.account) {
        const accountId = ProfileManager.account.id;
        const data = await ProfileManager.requestApi('/api/cosmetics/purchase', 'POST', { cosmeticId });
        if (ProfileManager.account?.id !== accountId) return { success: false, reason: 'account-changed' };
        ProfileManager.currentProfile = ProfileManager.normalizeProfile(data.profile, ProfileManager.account);
        ProfileManager.lastSaveError = '';
        window.app?.updateHeader();
        return {
          success: data.purchased === true,
          reason: data.reason || (data.purchased ? null : 'already-owned')
        };
      }

      ProfileManager.currentProfile = ProfileManager.normalizeProfile({
        ...profile,
        stars: profile.stars - cosmetic.price,
        ownedCosmetics: [...profile.ownedCosmetics, cosmeticId]
      }, null);
      window.app?.updateHeader();
      return { success: true, reason: null };
    });
    ProfileManager.cosmeticPurchaseQueue = operation.catch(() => false);
    return operation;
  }

  static async equipCosmetic(cosmeticId) {
    const profile = ProfileManager.getActiveProfile();
    if (cosmeticId !== null &&
      (!window.CosmeticShop?.get(cosmeticId) || !profile.ownedCosmetics.includes(cosmeticId))) {
      return { success: false, reason: 'not-owned' };
    }
    if (profile.equippedCosmetic === cosmeticId) return { success: false, reason: 'already-equipped' };

    const updatedProfile = { ...profile, equippedCosmetic: cosmeticId };
    if (!ProfileManager.account) {
      ProfileManager.currentProfile = ProfileManager.normalizeProfile(updatedProfile, null);
      window.app?.updateHeader();
      return { success: true, reason: null };
    }

    const saved = await ProfileManager.updateProfile(updatedProfile);
    return { success: saved, reason: saved ? null : 'save-failed' };
  }

  static flush() {
    return ProfileManager.saveQueue;
  }

  static renderLeaderboard(scope, title, accessibleTitle = title, surfaceClass = '') {
    const id = `leaderboard-${scope.replace(/[^a-z0-9-]/gi, '-')}`;
    const surface = surfaceClass || 'bg-slate-950/70 border border-slate-800';
    return `
      <section class="${surface} rounded-2xl p-4" aria-label="${accessibleTitle}">
        <h3 class="leaderboard-title font-ninja text-lg text-yellow-400 font-bold mb-3">
          <span class="leaderboard-trophy" aria-hidden="true">
            <span class="leaderboard-trophy__cup"></span>
            <span class="leaderboard-trophy__stem"></span>
            <span class="leaderboard-trophy__base"></span>
            <span class="leaderboard-trophy__spark"></span>
          </span>
          <span>${title}</span>
        </h3>
        <ol id="${id}" class="space-y-2 text-sm text-slate-300" aria-live="polite">
          <li class="text-slate-500">Loading scores…</li>
        </ol>
      </section>
    `;
  }

  static async loadLeaderboard(scope) {
    const id = `leaderboard-${scope.replace(/[^a-z0-9-]/gi, '-')}`;
    const list = document.getElementById(id);
    if (!list) return;

    try {
      const { entries } = await ProfileManager.requestApi(`/api/leaderboards?scope=${encodeURIComponent(scope)}`);
      const currentList = document.getElementById(id);
      if (!currentList) return;
      currentList.replaceChildren();
      if (!entries.length) {
        currentList.textContent = 'No scores yet—be the first to train!';
        return;
      }
      entries.forEach((entry, index) => {
        const row = document.createElement('li');
        row.className = `flex items-center justify-between gap-3${index === 0 ? ' leaderboard__top-score' : ''}`;
        const username = document.createElement('span');
        username.className = 'truncate';
        username.textContent = `${index + 1}. ${entry.username}`;
        const score = document.createElement('strong');
        score.className = 'text-amber-300 whitespace-nowrap';
        score.textContent = `${entry.score} points`;
        row.append(username, score);
        currentList.append(row);
      });
    } catch {
      const currentList = document.getElementById(id);
      if (currentList) currentList.textContent = 'Leaderboard is currently unavailable.';
    }
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

  static normalizeActivityProgress(progress) {
    if (!progress || typeof progress !== 'object' || Array.isArray(progress)) return {};
    return Object.fromEntries(Object.entries(progress).filter(([id, stat]) =>
      /^[a-z0-9][a-z0-9_-]{0,63}$/.test(id) &&
      stat && typeof stat === 'object' && !Array.isArray(stat) &&
      typeof stat.title === 'string' && typeof stat.subject === 'string' &&
      ['quiz', 'game'].includes(stat.kind) &&
      Number.isFinite(stat.bestScore) && stat.bestScore >= 0 &&
      Number.isSafeInteger(stat.timesPlayed) && stat.timesPlayed >= 0
    ).map(([id, stat]) => {
      const totalAnswers = Number.isSafeInteger(stat.totalAnswers) && stat.totalAnswers >= 0
        ? Math.min(stat.totalAnswers, 1000000000)
        : 0;
      return [id, {
        title: stat.title.slice(0, 100),
        subject: stat.subject.slice(0, 50),
        skillId: typeof stat.skillId === 'string' && /^[a-z0-9][a-z0-9_-]{0,63}$/.test(stat.skillId)
          ? stat.skillId
          : null,
        kind: stat.kind,
        scoreUnit: typeof stat.scoreUnit === 'string' ? stat.scoreUnit.slice(0, 20) : 'points',
        bestScore: stat.bestScore,
        bestTotal: Number.isFinite(stat.bestTotal) && stat.bestTotal > 0 ? stat.bestTotal : null,
        correct: Number.isFinite(stat.correct) && stat.correct >= 0 ? stat.correct : 0,
        total: Number.isFinite(stat.total) && stat.total >= 0 ? stat.total : 0,
        correctAnswers: Number.isSafeInteger(stat.correctAnswers) && stat.correctAnswers >= 0
          ? Math.min(stat.correctAnswers, totalAnswers)
          : 0,
        totalAnswers,
        timesPlayed: stat.timesPlayed
      }];
    }));
  }

  static normalizeActivityHistory(history) {
    return window.ProgressAnalytics
      ? window.ProgressAnalytics.normalizeActivityHistory(history)
      : [];
  }

  static recordActivityScore(activity, score, total = null, answerMetrics = null) {
    if (!activity || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(activity.id || '') ||
      typeof activity.title !== 'string' || typeof activity.subject !== 'string' ||
      !['quiz', 'game'].includes(activity.kind) || !Number.isFinite(score) || score < 0 ||
      (total !== null && (!Number.isFinite(total) || total <= 0 || score > total)) ||
      (activity.skillId !== undefined && activity.skillId !== null &&
        (typeof activity.skillId !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(activity.skillId))) ||
      (answerMetrics !== null && (activity.kind !== 'quiz' ||
        !Number.isSafeInteger(answerMetrics.correctAnswers) || answerMetrics.correctAnswers < 0 ||
        !Number.isSafeInteger(answerMetrics.totalAnswers) || answerMetrics.totalAnswers <= 0 ||
        answerMetrics.correctAnswers > answerMetrics.totalAnswers))) {
      throw new TypeError('Invalid activity score.');
    }

    const profile = ProfileManager.getActiveProfile();
    const progress = profile.activityProgress || (profile.activityProgress = {});
    const stat = progress[activity.id] || (progress[activity.id] = {
      title: activity.title.slice(0, 100),
      subject: activity.subject.slice(0, 50),
      skillId: activity.skillId || null,
      kind: activity.kind,
      scoreUnit: activity.kind === 'game'
        ? activity.game.scoreUnit || 'points'
        : (activity.settings.pointsPerCorrect ?? 1) === 1 ? 'questions' : 'points',
      bestScore: 0,
      bestTotal: null,
      correct: 0,
      total: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      timesPlayed: 0
    });
    if (!stat.skillId && activity.skillId) stat.skillId = activity.skillId;
    stat.timesPlayed++;
    if (total !== null) {
      stat.correct += score;
      stat.total += total;
    }
    if (answerMetrics) {
      stat.correctAnswers += answerMetrics.correctAnswers;
      stat.totalAnswers += answerMetrics.totalAnswers;
    }
    if (score > stat.bestScore) {
      stat.bestScore = score;
      stat.bestTotal = total;
    }
    if (activity.settings.awardStars) profile.stars += Math.floor(score);
    const activityHistory = ProfileManager.normalizeActivityHistory(profile.activityHistory);
    activityHistory.push({
      date: new Date().toISOString().slice(0, 10),
      activityId: activity.id,
      title: activity.title,
      subject: activity.subject,
      skillId: activity.skillId || null,
      kind: activity.kind,
      score,
      total,
      correctAnswers: answerMetrics?.correctAnswers ?? null,
      totalAnswers: answerMetrics?.totalAnswers ?? null
    });
    profile.activityHistory = activityHistory.slice(-window.ProgressAnalytics.MAX_ACTIVITY_HISTORY_ENTRIES);
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

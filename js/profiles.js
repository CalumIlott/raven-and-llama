// Raven & Llama Learning: Cross-Device Synchronized Learner Profiles
class ProfileManager {
  static STORAGE_KEY = 'raven_llama_profiles_cache_v5';
  static ACTIVE_DEVICE_KEY = 'raven_llama_device_active_id_v5';

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
    return ProfileManager.AVATARS.find(a => a.id === avatarId) || ProfileManager.AVATARS[0];
  }

  static normalizeProfile(p) {
    if (!p) return null;
    const avId = typeof p.avatar === 'string' ? p.avatar : p.avatar?.id || 'raven';
    return {
      id: p.id || 'profile_' + Date.now(),
      name: p.name || 'Profile',
      avatar: ProfileManager.getAvatar(avId),
      currentBelt: p.currentBelt || 'white',
      stage1PassedBelts: Array.isArray(p.stage1PassedBelts) ? p.stage1PassedBelts : [],
      stage2PassedBelts: Array.isArray(p.stage2PassedBelts) ? p.stage2PassedBelts : [],
      stage3PassedBelts: Array.isArray(p.stage3PassedBelts) ? p.stage3PassedBelts : [],
      passedBelts: Array.isArray(p.passedBelts) ? p.passedBelts : [],
      stars: typeof p.stars === 'number' ? p.stars : 0,
      skillsProgress: p.skillsProgress || {},
      certificates: Array.isArray(p.certificates) ? p.certificates : [],
      updatedAt: p.updatedAt || new Date().toISOString(),
      createdAt: p.createdAt || new Date().toISOString()
    };
  }

  static getProfilesCache() {
    try {
      const data = localStorage.getItem(ProfileManager.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(p => ProfileManager.normalizeProfile(p));
        }
      }
    } catch (e) {
      console.warn('Failed to parse local profile cache:', e);
    }

    const defaultProfile = {
      id: 'profile_default',
      name: 'Profile 1',
      avatar: ProfileManager.getAvatar('raven'),
      currentBelt: 'white',
      stage1PassedBelts: [],
      stage2PassedBelts: [],
      stage3PassedBelts: [],
      passedBelts: [],
      stars: 0,
      skillsProgress: {},
      certificates: [],
      createdAt: new Date().toISOString()
    };
    return [defaultProfile];
  }

  static saveProfilesCache(profiles) {
    try {
      localStorage.setItem(ProfileManager.STORAGE_KEY, JSON.stringify(profiles));
    } catch (e) {
      console.error('Failed to save local profiles cache:', e);
    }
  }

  static getActiveProfileId() {
    return localStorage.getItem(ProfileManager.ACTIVE_DEVICE_KEY) || null;
  }

  static setActiveProfileId(profileId) {
    if (profileId) {
      localStorage.setItem(ProfileManager.ACTIVE_DEVICE_KEY, profileId);
    } else {
      localStorage.removeItem(ProfileManager.ACTIVE_DEVICE_KEY);
    }
  }

  static loadProfiles() {
    return ProfileManager.getProfilesCache();
  }

  static getActiveProfile() {
    const profiles = ProfileManager.loadProfiles();
    const activeId = ProfileManager.getActiveProfileId();
    if (activeId) {
      const match = profiles.find(p => p.id === activeId);
      if (match) return match;
    }
    // Default to first profile if none selected
    if (profiles.length > 0) {
      ProfileManager.setActiveProfileId(profiles[0].id);
      return profiles[0];
    }
    return null;
  }

  static setActiveProfile(profileId) {
    const profiles = ProfileManager.loadProfiles();
    if (profiles.some(p => p.id === profileId)) {
      ProfileManager.setActiveProfileId(profileId);
      if (window.app) {
        window.app.updateHeader();
        window.app.refreshCurrentView();
      }
    }
  }

  // --- CROSS-DEVICE SERVER SYNCHRONIZATION ---
  static async initSync() {
    try {
      const resp = await fetch('/api/profiles', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (resp.ok) {
        const data = await resp.json();
        const serverProfiles = Array.isArray(data) ? data : data.profiles;
        if (Array.isArray(serverProfiles) && serverProfiles.length > 0) {
          const normalized = serverProfiles.map(p => ProfileManager.normalizeProfile(p));
          ProfileManager.saveProfilesCache(normalized);

          // If current device active profile doesn't exist on server, pick the first
          const currentActive = ProfileManager.getActiveProfileId();
          if (!currentActive || !normalized.some(p => p.id === currentActive)) {
            ProfileManager.setActiveProfileId(normalized[0].id);
          }

          if (window.app) {
            window.app.updateHeader();
            window.app.refreshCurrentView();
          }
        } else {
          // If server is empty, push default profile to server
          const current = ProfileManager.getProfilesCache();
          ProfileManager.syncAllToServer(current);
        }
      }
    } catch (e) {
      console.warn('Network sync offline or failed, using local cache:', e);
    }
  }

  static async syncProfileToServer(profile) {
    try {
      await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ profile: profile })
      });
    } catch (e) {
      console.warn('Async server sync postponed (offline):', e);
    }
  }

  static async syncAllToServer(profiles) {
    try {
      await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ profiles: profiles })
      });
    } catch (e) {
      console.warn('Async full sync postponed (offline):', e);
    }
  }

  static createProfile(name, avatarId) {
    const profiles = ProfileManager.loadProfiles();
    const avatar = ProfileManager.getAvatar(avatarId);
    const newProfile = {
      id: 'profile_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: name.trim() || 'Profile',
      avatar: avatar,
      currentBelt: 'white',
      stage1PassedBelts: [],
      stage2PassedBelts: [],
      stage3PassedBelts: [],
      passedBelts: [],
      stars: 0,
      skillsProgress: {},
      certificates: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    profiles.push(newProfile);
    ProfileManager.saveProfilesCache(profiles);
    ProfileManager.setActiveProfileId(newProfile.id);

    // Sync to server
    ProfileManager.syncProfileToServer(newProfile);

    return newProfile;
  }

  static deleteProfile(profileId) {
    let profiles = ProfileManager.loadProfiles();
    profiles = profiles.filter(p => p.id !== profileId);
    if (profiles.length === 0) {
      const defaultProfile = {
        id: 'profile_' + Date.now(),
        name: 'Profile 1',
        avatar: ProfileManager.getAvatar('raven'),
        currentBelt: 'white',
        stage1PassedBelts: [],
        stage2PassedBelts: [],
        stage3PassedBelts: [],
        passedBelts: [],
        stars: 0,
        skillsProgress: {},
        certificates: [],
        createdAt: new Date().toISOString()
      };
      profiles = [defaultProfile];
    }

    ProfileManager.saveProfilesCache(profiles);

    const activeId = ProfileManager.getActiveProfileId();
    if (activeId === profileId || !profiles.some(p => p.id === activeId)) {
      ProfileManager.setActiveProfileId(profiles[0].id);
    }

    // Inform server of deletion
    fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ deleteProfileId: profileId })
    }).catch(() => {});
  }

  static updateProfile(updatedProfile) {
    const profiles = ProfileManager.loadProfiles();
    const idx = profiles.findIndex(p => p.id === updatedProfile.id);
    updatedProfile.updatedAt = new Date().toISOString();
    const normalized = ProfileManager.normalizeProfile(updatedProfile);

    if (idx !== -1) {
      profiles[idx] = normalized;
    } else {
      profiles.push(normalized);
    }

    ProfileManager.saveProfilesCache(profiles);
    ProfileManager.syncProfileToServer(normalized);
  }

  static recordTrainingScore(skillId, score, total = 10) {
    const profile = ProfileManager.getActiveProfile();
    if (!profile) return null;
    if (!profile.skillsProgress) profile.skillsProgress = {};
    if (!profile.skillsProgress[skillId]) {
      profile.skillsProgress[skillId] = { correct: 0, total: 0, bestScore: 0, timesTrained: 0, stars: 0 };
    }
    const stat = profile.skillsProgress[skillId];
    stat.total += total;
    stat.correct += score;
    stat.timesTrained = (stat.timesTrained || 0) + 1;
    if (score > (stat.bestScore || 0)) {
      stat.bestScore = score;
    }
    if (score >= 10) stat.stars = 3;
    else if (score >= 8) stat.stars = Math.max(stat.stars || 0, 2);
    else if (score >= 5) stat.stars = Math.max(stat.stars || 0, 1);

    profile.stars += score;
    ProfileManager.updateProfile(profile);
    return profile;
  }

  static hasAllSkillsTrainedWith10(beltId) {
    const profile = ProfileManager.getActiveProfile();
    const belt = (window.BELTS_DATA || []).find(b => b.id === beltId);
    if (!belt || !profile) return false;
    return belt.skills.every(s => {
      const stat = profile.skillsProgress?.[s.id];
      return stat && (stat.timesTrained || 0) > 0 && (stat.bestScore || 0) >= 10;
    });
  }

  static getSkillsTrainingStatus(beltId) {
    const profile = ProfileManager.getActiveProfile();
    const belt = (window.BELTS_DATA || []).find(b => b.id === beltId);
    if (!belt || !profile) return { trainedCount: 0, masterCount: 0, total: 0, skills: [] };

    let trainedCount = 0;
    let masterCount = 0;
    const skillsStatus = belt.skills.map(s => {
      const stat = profile.skillsProgress?.[s.id];
      const isTrained = stat && (stat.timesTrained || 0) > 0;
      const isMaster10 = stat && (stat.bestScore || 0) >= 10;
      if (isTrained) trainedCount++;
      if (isMaster10) masterCount++;
      return {
        id: s.id,
        name: s.name,
        isTrained: isTrained,
        bestScore: stat?.bestScore || 0,
        isMaster10: isMaster10
      };
    });

    return {
      trainedCount: trainedCount,
      masterCount: masterCount,
      total: belt.skills.length,
      skills: skillsStatus
    };
  }

  static canTakeFinalTest(beltId) {
    const profile = ProfileManager.getActiveProfile();
    if (!profile) return false;
    const stage2Passed = (profile.stage2PassedBelts || []).includes(beltId);
    const allSkillsMastered = ProfileManager.hasAllSkillsTrainedWith10(beltId);
    return stage2Passed && allSkillsMastered;
  }

  static recordTestPass(beltId, stage = 1, score, total = 10) {
    const profile = ProfileManager.getActiveProfile();
    if (!profile) return;
    if (!profile.stage1PassedBelts) profile.stage1PassedBelts = [];
    if (!profile.stage2PassedBelts) profile.stage2PassedBelts = [];
    if (!profile.stage3PassedBelts) profile.stage3PassedBelts = [];
    if (!profile.passedBelts) profile.passedBelts = [];

    const beltsData = window.BELTS_DATA || [];

    if (stage === 1) {
      if (!profile.stage1PassedBelts.includes(beltId)) {
        profile.stage1PassedBelts.push(beltId);
      }
      profile.stars += 25;
    } else if (stage === 2) {
      if (!profile.stage2PassedBelts.includes(beltId)) {
        profile.stage2PassedBelts.push(beltId);
      }
      profile.stars += 25;
    } else {
      if (!profile.stage3PassedBelts.includes(beltId)) profile.stage3PassedBelts.push(beltId);
      if (!profile.stage2PassedBelts.includes(beltId)) profile.stage2PassedBelts.push(beltId);
      if (!profile.passedBelts.includes(beltId)) profile.passedBelts.push(beltId);
      profile.stars += 50;

      const cert = {
        id: 'cert_' + Date.now(),
        beltId: beltId,
        beltName: beltsData.find(b => b.id === beltId)?.name || beltId,
        stage: 'Grand Master Grade',
        score: `${score}/${total}`,
        date: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      if (!profile.certificates) profile.certificates = [];
      profile.certificates.push(cert);

      const beltIndex = beltsData.findIndex(b => b.id === beltId);
      if (beltIndex !== -1 && beltIndex < beltsData.length - 1) {
        profile.currentBelt = beltsData[beltIndex + 1].id;
      }
    }

    ProfileManager.updateProfile(profile);
  }
}

window.ProfileManager = ProfileManager;

// Sync immediately and on window focus (so picking up another device automatically pulls latest stars/progress)
ProfileManager.initSync();
window.addEventListener('focus', () => {
  ProfileManager.initSync();
});

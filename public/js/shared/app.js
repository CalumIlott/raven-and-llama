// Raven & Llama: Multi-Tiered Educational Platform Controller
class App {
  constructor() {
    this.currentView = 'home';
    this.selectedBeltId = null;
  }

  async init() {
    await ProfileManager.initialize();
    this.updateHeader();
    const module = this.moduleForPath();
    const profileModule = this.isHomePage() && ProfileManager.isAuthenticated()
      ? ProfileManager.getActiveProfile().lastModule
      : null;
    this.showModule(module || profileModule);
    this.attachEventListeners();
  }

  moduleForPath() {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    return {
      '/learning': 'learning',
      '/dojo': 'dojo',
      '/timetables': 'timetables',
      '/spelling': 'spelling'
    }[path] || null;
  }

  isHomePage() {
    const { pathname, search, hash } = window.location;
    return (pathname === '/' || pathname === '/index.html') && !search && !hash;
  }

  showModule(module) {
    const views = {
      learning: () => this.showLearningHub(),
      dojo: () => this.showDojoHub(),
      timetables: () => this.showTimesTables(),
      spelling: () => this.showSpellingSafari()
    };
    (views[module] || (() => this.showRavenAndLlamaHome()))();
  }

  rememberModule(module) {
    const profile = ProfileManager.getActiveProfile();
    if (window.location.pathname !== `/${module}`) window.history.replaceState(null, '', `/${module}`);
    if (ProfileManager.isAuthenticated() && profile.lastModule !== module) {
      void ProfileManager.updateProfile({ ...profile, lastModule: module });
    }
  }

  showHomeRoute() {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (['/learning', '/dojo', '/timetables', '/spelling'].includes(path)) {
      window.history.replaceState(null, '', '/');
    }
  }

  attachEventListeners() {
    const initAudio = () => {
      window.soundFX?.init();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
  }

  updateHeader() {
    const profile = ProfileManager.getActiveProfile();
    const nameEl = document.getElementById('header-profile-name');
    const avatarEl = document.getElementById('header-profile-avatar');
    const starsEl = document.getElementById('header-stars-count');
    const soundBtn = document.getElementById('header-sound-btn');
    const accountButton = document.querySelector('header button[title="Account"]');
    const statusBanner = document.getElementById('account-status-banner');
    const statusMessage = document.getElementById('account-status-message');
    const statusAction = document.getElementById('account-status-action');
    const subBadge = document.getElementById('header-sub-badge');
    const homeBtn = document.getElementById('nav-btn-home');
    const learningBtn = document.getElementById('nav-btn-learning');

    if (nameEl) nameEl.textContent = ProfileManager.account?.username || 'Guest';
    if (accountButton) accountButton.title = ProfileManager.isAuthenticated() ? 'Account settings' : 'Sign in or create an account';
    if (avatarEl) {
      avatarEl.innerHTML = profile?.avatar?.emoji || '🪶';
      avatarEl.className = `w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm shadow ${profile?.avatar?.color || 'bg-black text-white border border-zinc-700'}`;
    }
    if (starsEl) starsEl.textContent = profile?.stars || 0;
    if (statusBanner && statusMessage) {
      const notice = ProfileManager.lastSaveError || (!ProfileManager.isAuthenticated()
        ? ProfileManager.accountServiceAvailable
          ? 'Guest mode: progress will not be saved after this visit.'
          : 'Account service is unavailable. Guest progress will not be saved.'
        : '');
      statusMessage.textContent = notice;
      statusBanner.classList.toggle('hidden', !notice);
      if (statusAction) statusAction.textContent = ProfileManager.isAuthenticated() ? 'Account settings' : 'Sign in';
    }
    if (soundBtn) {
      const isMuted = window.soundFX?.isMuted();
      soundBtn.innerHTML = isMuted ? '🔇' : '🔊';
    }

    // Dynamic header subtitle: Only show badge when within learning or dojo!
    if (subBadge) {
      if (this.currentView === 'home') {
        subBadge.classList.add('hidden');
      } else if (this.currentView === 'learning') {
        subBadge.textContent = 'Learning';
        subBadge.classList.remove('hidden');
      } else if (this.currentView === 'dojo' || this.currentView === 'belt_detail') {
        subBadge.textContent = 'Maths Dojo';
        subBadge.classList.remove('hidden');
      } else if (this.currentView === 'timetables') {
        subBadge.textContent = 'Times Tables';
        subBadge.classList.remove('hidden');
      } else if (this.currentView === 'spelling') {
        subBadge.textContent = 'Spelling Safari';
        subBadge.classList.remove('hidden');
      } else {
        subBadge.classList.add('hidden');
      }
    }

    if (homeBtn && learningBtn) {
      if (this.currentView === 'home') {
        homeBtn.className = 'px-3 py-1 rounded-lg text-xs font-semibold text-white bg-zinc-800 transition';
        learningBtn.className = 'px-3 py-1 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition flex items-center gap-1';
      } else {
        homeBtn.className = 'px-3 py-1 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition';
        learningBtn.className = 'px-3 py-1 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 transition flex items-center gap-1';
      }
    }
  }

  toggleSound() {
    const isMuted = window.soundFX?.toggleMute();
    const soundBtn = document.getElementById('header-sound-btn');
    if (soundBtn) soundBtn.innerHTML = isMuted ? '🔇' : '🔊';
  }

  setTheme(theme) {
    return ProfileManager.setTheme(theme);
  }

  refreshCurrentView() {
    this.updateHeader();
    if (this.currentView === 'home') {
      this.showRavenAndLlamaHome();
    } else if (this.currentView === 'learning') {
      this.showLearningHub();
    } else if (this.currentView === 'dojo') {
      this.showDojoHub();
    } else if (this.currentView === 'belt_detail' && this.selectedBeltId) {
      this.showBeltDetails(this.selectedBeltId);
    } else if (this.currentView === 'timetables') {
      this.showTimesTables();
    } else if (this.currentView === 'trophy') {
      this.showTrophyRoom();
    } else if (this.currentView === 'spelling') {
      this.showSpellingSafari();
    }
  }

  showPortal() {
    return this.showRavenAndLlamaHome();
  }

  // =========================================================================
  // LEVEL 1: OVERARCHING "RAVEN & LLAMA" PAGE (THE MAIN FLAGSHIP HOME)
  // =========================================================================


  // =========================================================================
  // LEVEL 2: "RAVEN & LLAMA LEARNING" SUB-PAGE
  // =========================================================================


  // =========================================================================
  // LEVEL 3: MATHS MASTERS DOJO (BELT HUB)
  // =========================================================================


  // =========================================================================
  // LEVEL 3: BELT DETAILS & EXAMS
  // =========================================================================




  // =========================================================================
  // LEVEL 3: TIMES TABLES DOJO
  // =========================================================================










  // =========================================================================
  // ARCADE & TRAINING QUIZ RUNNERS
  // =========================================================================






  // =========================================================================
  // TROPHY ROOM
  // =========================================================================
  showTrophyRoom() {
    this.currentView = 'trophy';
    const main = document.getElementById('app-main');
    if (!main) return;

    const profile = ProfileManager.getActiveProfile();
    const passedBelts = profile?.passedBelts || [];
    const certificates = profile?.certificates || [];

    let certificatesHtml = certificates.length === 0
      ? `<div class="text-center p-8 bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
           <div class="text-3xl mb-2">📜</div>
           <p class="text-sm">No Grand Master certificates earned yet.</p>
           <p class="text-xs text-slate-500 mt-1">Master all component skills to 10/10 and pass all three belt quizzes to earn certificates!</p>
         </div>`
      : certificates.map(c => `
        <div class="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl">
              📜
            </div>
            <div>
              <h4 class="font-ninja text-lg text-yellow-300 font-bold">${c.beltName} Mastery</h4>
              <div class="text-xs text-slate-400">Awarded on ${c.date} • Score: ${c.score}</div>
            </div>
          </div>
          <span class="text-xs bg-emerald-950 text-emerald-300 border border-emerald-600 px-3 py-1 rounded-full font-bold">
            GRADUATED 🏆
          </span>
        </div>
      `).join('');

    main.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between mb-6">
          <button onclick="window.app.showLearningHub()" class="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition font-bold group">
            <span class="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Raven &amp; Llama Learning</span>
          </button>
          <button onclick="window.app.showRavenAndLlamaHome()" class="text-xs text-slate-400 hover:text-white">
            🏠 Raven &amp; Llama Home
          </button>
        </div>

        <div class="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-lg">
              🏆
            </div>
            <div>
              <h1 class="font-ninja text-3xl text-white font-bold">${profile?.name || 'Explorer'}'s Trophy Hall</h1>
              <p class="text-slate-400 text-sm">Total Stars: <span class="text-yellow-400 font-bold">${profile?.stars || 0} ⭐</span> • Belts Graduated: <span class="text-emerald-400 font-bold">${passedBelts.length} / 7</span></p>
            </div>
          </div>

          <h3 class="font-ninja text-lg text-yellow-400 font-bold mb-3">Belt Graduation Shelf:</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            ${BELTS_DATA.map(belt => {
              const hasPassed = passedBelts.includes(belt.id);
              return `
                <div class="p-3 rounded-2xl text-center border ${hasPassed ? 'border-amber-400 bg-slate-800' : 'border-slate-800 bg-slate-950/40 opacity-40'}">
                  <div class="w-10 h-10 mx-auto rounded-xl ${belt.ribbonClass} flex items-center justify-center text-xl shadow mb-2">
                    🥋
                  </div>
                  <div class="font-ninja text-xs font-bold text-white truncate">${belt.name.replace(' Belt', '')}</div>
                  <div class="text-[10px] mt-1 ${hasPassed ? 'text-emerald-400 font-bold' : 'text-slate-500'}">
                    ${hasPassed ? 'PASSED 🏆' : 'LOCKED'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <h3 class="font-ninja text-lg text-yellow-400 font-bold mb-3">Earned Certificates:</h3>
          <div class="flex flex-col gap-3">
            ${certificatesHtml}
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // CROSS-DEVICE LEARNER SELECTOR / CREATOR
  // =========================================================================
  openProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (!modal) return;
    const authenticated = ProfileManager.isAuthenticated();
    const guestPanel = document.getElementById('account-guest-panel');
    const signedInPanel = document.getElementById('account-signed-in-panel');
    const description = document.getElementById('account-modal-description');
    const username = document.getElementById('account-username-display');
    const serviceWarning = document.getElementById('account-service-warning');
    const message = document.getElementById('account-message');
    const themeSelect = document.getElementById('account-theme');
    if (guestPanel) guestPanel.classList.toggle('hidden', authenticated);
    if (signedInPanel) signedInPanel.classList.toggle('hidden', !authenticated);
    if (description) description.textContent = authenticated
      ? 'Manage your password or sign out of this account.'
      : 'Sign in to save progress across your devices.';
    if (username) username.textContent = ProfileManager.account?.username || '';
    if (themeSelect) themeSelect.value = ProfileManager.getActiveProfile().theme;
    if (serviceWarning) serviceWarning.classList.toggle('hidden', ProfileManager.accountServiceAvailable);
    if (message) {
      message.textContent = '';
      message.classList.add('hidden');
    }
    if (authenticated) this.renderAvatarOptions();
    else this.setAccountMode('login');
    modal.classList.remove('hidden');
  }

  renderAvatarOptions() {
    const options = document.getElementById('account-avatar-options');
    if (!options) return;
    const selectedAvatar = ProfileManager.getActiveProfile()?.avatar?.id;
    options.innerHTML = ProfileManager.AVATARS.map(avatar => `
      <label class="flex flex-col items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-center text-[11px] text-zinc-300 cursor-pointer hover:border-cyan-500 has-[:checked]:border-cyan-400 has-[:checked]:bg-cyan-950/50">
        <input class="sr-only" type="radio" name="account_avatar" value="${avatar.id}" aria-label="${avatar.name}" ${avatar.id === selectedAvatar ? 'checked' : ''}>
        <span aria-hidden="true" class="w-9 h-9 rounded-full flex items-center justify-center text-xl ${avatar.color}">${avatar.emoji}</span>
        <span>${avatar.name}</span>
      </label>
    `).join('');
  }

  setAccountMode(mode) {
    this.accountMode = mode === 'register' ? 'register' : 'login';
    const register = this.accountMode === 'register';
    const loginTab = document.getElementById('account-login-tab');
    const registerTab = document.getElementById('account-register-tab');
    const confirmField = document.getElementById('account-confirm-field');
    const passwordInput = document.getElementById('account-password');
    const passwordLabel = document.getElementById('account-password-label');
    const submitButton = document.getElementById('account-submit-button');
    const message = document.getElementById('account-message');
    if (loginTab) {
      loginTab.setAttribute('aria-pressed', String(!register));
      loginTab.className = `px-3 py-2 rounded-md text-sm font-semibold ${register ? 'text-zinc-400 hover:text-white' : 'bg-zinc-700 text-white'}`;
    }
    if (registerTab) {
      registerTab.setAttribute('aria-pressed', String(register));
      registerTab.className = `px-3 py-2 rounded-md text-sm font-semibold ${register ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`;
    }
    if (confirmField) confirmField.classList.toggle('hidden', !register);
    if (passwordInput) passwordInput.autocomplete = register ? 'new-password' : 'current-password';
    if (passwordLabel) passwordLabel.textContent = register ? 'Password (12 characters minimum)' : 'Password';
    if (submitButton) submitButton.textContent = register ? 'Create account' : 'Sign in';
    if (message) message.classList.add('hidden');
  }

  setAccountMessage(text, isError = true) {
    const message = document.getElementById('account-message');
    if (!message) return;
    message.textContent = text;
    message.className = `mb-4 p-3 rounded-lg text-sm ${isError ? 'bg-rose-950/70 text-rose-200 border border-rose-800' : 'bg-emerald-950/70 text-emerald-200 border border-emerald-800'}`;
  }

  async submitAccountForm(event) {
    event.preventDefault();
    const username = document.getElementById('account-username')?.value.trim() || '';
    const password = document.getElementById('account-password')?.value || '';
    const confirmPassword = document.getElementById('account-confirm-password')?.value || '';
    const submitButton = document.getElementById('account-submit-button');
    if (this.accountMode === 'register' && password !== confirmPassword) {
      this.setAccountMessage('Passwords do not match.');
      return;
    }

    if (submitButton) submitButton.disabled = true;
    try {
      if (this.accountMode === 'register') await ProfileManager.registerAccount(username, password);
      else await ProfileManager.login(username, password);
      this.closeProfileModal();
      this.updateHeader();
      this.refreshCurrentView();
    } catch (error) {
      this.setAccountMessage(error.message || 'Unable to access this account.');
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  }

  async changePasswordSubmit(event) {
    event.preventDefault();
    const currentPassword = document.getElementById('account-current-password')?.value || '';
    const newPassword = document.getElementById('account-new-password')?.value || '';
    const confirmPassword = document.getElementById('account-new-password-confirm')?.value || '';
    if (newPassword !== confirmPassword) {
      this.setAccountMessage('New passwords do not match.');
      return;
    }
    try {
      await ProfileManager.changePassword(currentPassword, newPassword);
      document.getElementById('account-password-form')?.reset();
      this.setAccountMessage('Password updated.', false);
    } catch (error) {
      this.setAccountMessage(error.message || 'Unable to update password.');
    }
  }

  async changeAvatarSubmit(event) {
    event.preventDefault();
    const selectedAvatar = document.querySelector('input[name="account_avatar"]:checked');
    if (!selectedAvatar) return;
    const profile = ProfileManager.getActiveProfile();
    const saved = await ProfileManager.updateProfile({ ...profile, avatar: selectedAvatar.value });
    if (saved) this.setAccountMessage('Avatar updated.', false);
    else this.setAccountMessage(ProfileManager.lastSaveError || 'Unable to save your avatar.');
  }

  async logoutAccount() {
    try {
      await ProfileManager.logout();
    } catch (error) {
      this.setAccountMessage(error.message || 'Unable to sign out.');
    }
    this.closeProfileModal();
    this.updateHeader();
    this.refreshCurrentView();
  }

  async deleteAccount(event) {
    event?.preventDefault();
    const form = document.getElementById('delete-account-confirmation');
    if (!form) return;
    if (!form.reportValidity()) return;
    const password = document.getElementById('delete-account-password')?.value || '';
    try {
      await ProfileManager.deleteAccount(password);
      this.closeProfileModal();
      this.updateHeader();
      this.refreshCurrentView();
    } catch (error) {
      this.setAccountMessage(error.message || 'Unable to delete account.');
    }
  }

  showDeleteAccountConfirmation() {
    document.getElementById('delete-account-toggle')?.classList.add('hidden');
    document.getElementById('delete-account-confirmation')?.classList.remove('hidden');
    document.getElementById('delete-account-password')?.focus();
  }

  cancelDeleteAccount() {
    document.getElementById('delete-account-confirmation')?.classList.add('hidden');
    document.getElementById('delete-account-toggle')?.classList.remove('hidden');
    document.getElementById('delete-account-confirmation')?.reset();
  }

  closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.add('hidden');
  }

  selectProfile(profileId) {
    ProfileManager.setActiveProfile(profileId);
    this.closeProfileModal();
    this.updateHeader();
    this.refreshCurrentView();
  }

  confirmDeleteProfile(profileId, profileName) {
    if (confirm(`Are you sure you want to delete ${profileName}'s profile and progress across devices?`)) {
      ProfileManager.deleteProfile(profileId);
      this.openProfileModal();
      this.updateHeader();
      this.refreshCurrentView();
    }
  }

  createNewProfileSubmit(event) {
    event.preventDefault();
    const nameInput = document.getElementById('new-profile-name');
    const selectedAvatar = document.querySelector('input[name="new_avatar"]:checked');
    const name = nameInput ? nameInput.value.trim() : '';
    const avatarId = selectedAvatar ? selectedAvatar.value : 'raven';

    if (name) {
      ProfileManager.createProfile(name, avatarId);
      if (nameInput) nameInput.value = '';
      this.closeProfileModal();
      this.updateHeader();
      this.refreshCurrentView();
    }
  }

  // =========================================================================
  // PARENT / TEACHER PROGRESS REPORT
  // =========================================================================
  showParentOverview() {
    const modal = document.getElementById('parent-modal');
    if (!modal) return;

    const profile = ProfileManager.getActiveProfile();
    const progress = profile?.skillsProgress || {};

    let tableRows = '';
    BELTS_DATA.forEach(belt => {
      belt.skills.forEach(skill => {
        const stat = progress[skill.id] || { correct: 0, total: 0, bestScore: 0, timesTrained: 0, stars: 0 };
        const is10 = (stat.bestScore || 0) >= 10;
        tableRows += `
          <tr class="border-b border-slate-800 text-xs sm:text-sm">
            <td class="py-2.5 px-3 font-ninja text-white">${belt.name.replace(' Belt', '')}</td>
            <td class="py-2.5 px-3 text-slate-300 font-medium">${skill.name}</td>
            <td class="py-2.5 px-3 text-center text-slate-400">${stat.timesTrained || 0}</td>
            <td class="py-2.5 px-3 text-center font-bold ${is10 ? 'text-yellow-400' : 'text-slate-300'}">${stat.bestScore || 0} / 10</td>
            <td class="py-2.5 px-3 text-center font-bold ${is10 ? 'text-yellow-400' : 'text-slate-500'}">${is10 ? '🌟 10/10 MASTER' : (stat.timesTrained > 0 ? 'Trained' : 'Untrained')}</td>
          </tr>
        `;
      });
    });

    const tbody = document.getElementById('parent-stats-tbody');
    if (tbody) tbody.innerHTML = tableRows;

    const studentNameEl = document.getElementById('parent-student-name');
    if (studentNameEl) studentNameEl.textContent = profile ? profile.name : 'Learner';

    modal.classList.remove('hidden');
  }

  closeParentModal() {
    const modal = document.getElementById('parent-modal');
    if (modal) modal.classList.add('hidden');
  }
}

window.app = new App();
window.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});

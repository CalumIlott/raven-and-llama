function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function renderAvatarArtwork(avatar) {
  return avatar?.image
    ? `<img class="profile-avatar-art" src="${avatar.image}" alt="">`
    : avatar?.emoji || '';
}

window.brandWordmark = () => '<span class="brand-wordmark"><span>Raven</span> <span class="brand-wordmark__amp">&amp;</span> <span>Llama</span></span>';

// Raven & Llama: Multi-Tiered Educational Platform Controller
class App {
  constructor() {
    this.currentView = 'home';
    this.selectedBeltId = null;
    this.dialogFocusReturn = new Map();
  }

  async init() {
    await ProfileManager.initialize();
    this.updateHeader();
    const module = this.moduleForPath();
    const profileModule = this.isHomePage() && ProfileManager.isAuthenticated()
      ? ProfileManager.getActiveProfile().lastModule
      : null;
    if (!window.gameEngine.restoreSession()) this.showModule(module || profileModule);
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
    document.addEventListener('keydown', event => this.handleDialogKeydown(event));
    document.addEventListener('click', event => this.handleClickAction(event));
    document.addEventListener('submit', event => this.handleSubmitAction(event));
    document.addEventListener('change', event => this.handleChangeAction(event));
  }

  handleClickAction(event) {
    const target = event.target.closest?.('[data-action]');
    if (!target) return;
    if (target instanceof HTMLAnchorElement) event.preventDefault();

    switch (target.dataset.action) {
      case 'home': this.showRavenAndLlamaHome(); break;
      case 'learning': this.showLearningHub(); break;
      case 'games-hub': this.showGamesHub(); break;
      case 'critter-open': this.showCritterCatch(); break;
      case 'account-open': this.openProfileModal(); break;
      case 'parent-report': this.showParentOverview(); break;
      case 'dojo': this.showDojoHub(); break;
      case 'times-tables': this.showTimesTables(); break;
      case 'trophy-room': this.showTrophyRoom(); break;
      case 'account-close': this.closeProfileModal(); break;
      case 'account-avatar-open': this.showAvatarPicker(); break;
      case 'account-avatar-cancel': this.showAccountSettings(); break;
      case 'account-mode': this.setAccountMode(target.dataset.mode); break;
      case 'sound-toggle': this.toggleSound(); break;
      case 'account-logout': this.logoutAccount(); break;
      case 'account-delete-show': this.showDeleteAccountConfirmation(); break;
      case 'account-delete-cancel': this.cancelDeleteAccount(); break;
      case 'parent-close': this.closeParentModal(); break;
      case 'belt-detail': this.showBeltDetails(target.dataset.beltId); break;
      case 'skill-start': this.startSkillGame(target.dataset.beltId, target.dataset.skillId); break;
      case 'arcade-start': this.launchArcade(target.dataset.beltId); break;
      case 'belt-test': this.startBeltTestGame(target.dataset.beltId, Number(target.dataset.stage)); break;
      case 'prerequisites': this.showPrerequisiteChecklist(target.dataset.beltId); break;
      case 'times-table-start': this.startTimesTable(Number(target.dataset.table)); break;
      case 'times-table-quiz': this.startTimesTableQuiz(target.dataset.allTables === 'true'); break;
      case 'times-table-arcade': this.startTimetableArcade(); break;
      case 'endless-timetables': this.startEndlessTimetables(); break;
      case 'times-table-pick': this.ttPick(Number(target.dataset.id), Number(target.dataset.value)); break;
      case 'game-answer': window.gameEngine.submitAnswer(decodeURIComponent(target.dataset.answer)); break;
      case 'game-order-pick': window.gameEngine.pickOrderItem(Number(target.dataset.index), decodeURIComponent(target.dataset.value)); break;
      case 'game-exit':
        window.gameEngine.exitGame();
        break;
      case 'endless-retry': window.gameEngine.restartEndless(); break;
      case 'endless-return':
        if (target.dataset.beltId) this.showBeltDetails(target.dataset.beltId);
        else this.showTimesTables();
        break;
      case 'critter-start': this.startCritterCatch(); break;
      case 'critter-hole': this.selectCritterHole(Number(target.dataset.holeIndex)); break;
      case 'science-home': this.showScienceExplorers(); break;
      case 'science-start': this.startScienceMission(target.dataset.missionId); break;
      case 'science-answer': this.answerScienceQuestion(Number(target.dataset.index)); break;
      case 'science-continue': this.continueScienceMission(); break;
      case 'spelling-home': this.showSpellingSafari(); break;
      case 'spelling-start': this.startSpellingSafari(target.dataset.activityId, target.dataset.difficulty); break;
      case 'spelling-letter': this.pickSpellingSafariLetter(Number(target.dataset.index)); break;
      case 'spelling-clear': this.clearSpellingSafariLetters(); break;
      case 'spelling-answer': this.submitSpellingSafariAnswer(decodeURIComponent(target.dataset.answer)); break;
      case 'spelling-next': this.nextSpellingSafariQuestion(); break;
      case 'science-home': this.showScienceExplorers(); break;
      case 'science-start': this.startScienceMission(target.dataset.missionId); break;
      case 'science-answer': this.answerScienceQuestion(Number(target.dataset.index)); break;
      case 'science-continue': this.continueScienceMission(); break;
      case 'spelling-home': this.showSpellingSafari(); break;
      case 'spelling-start': this.startSpellingSafari(target.dataset.activityId); break;
      case 'spelling-letter': this.pickSpellingSafariLetter(Number(target.dataset.index)); break;
      case 'spelling-clear': this.clearSpellingSafariLetters(); break;
      case 'spelling-answer': this.submitSpellingSafariAnswer(decodeURIComponent(target.dataset.answer)); break;
      case 'spelling-next': this.nextSpellingSafariQuestion(); break;
      case 'endless-belt-test': this.startEndlessBeltTest(target.dataset.beltId); break;
      case 'training-retry': window.gameEngine.startTraining(target.dataset.beltId, target.dataset.skillId); break;
      case 'training-return': this.showBeltDetails(target.dataset.beltId); break;
      case 'quiz-retry': window.gameEngine.startBeltTest(target.dataset.beltId, Number(target.dataset.stage)); break;
      case 'quiz-return': this.showBeltDetails(target.dataset.beltId); break;
      case 'quiz-next-belt': this.showDojoHub(); break;
      case 'print-certificate': window.print(); break;
      case 'arcade-exit':
        window.arcadeEngine.stopGame();
        this.showBeltDetails(target.dataset.beltId);
        break;
      case 'arcade-potion': window.arcadeEngine.tapPotion(Number(target.dataset.id)); break;
      case 'arcade-jump': window.arcadeEngine.triggerJump(); break;
      case 'arcade-move-left': window.arcadeEngine.moveShipLeft(); break;
      case 'arcade-fire': window.arcadeEngine.fireBullet(); break;
      case 'arcade-move-right': window.arcadeEngine.moveShipRight(); break;
      case 'arcade-gem': window.arcadeEngine.tapGem(Number(target.dataset.index)); break;
      case 'arcade-turret': window.arcadeEngine.fireTurret(Number(target.dataset.value)); break;
      case 'arcade-retry': window.arcadeEngine[target.dataset.game](target.dataset.container); break;
      case 'arcade-return': this.showBeltDetails(target.dataset.beltId); break;
      case 'timetable-exit': this.showTimesTables(); break;
    }
  }

  handleSubmitAction(event) {
    switch (event.target.dataset.submitAction) {
      case 'account-auth': this.submitAccountForm(event); break;
      case 'account-avatar': this.changeAvatarSubmit(event); break;
      case 'account-password': this.changePasswordSubmit(event); break;
      case 'account-delete': this.deleteAccount(event); break;
    }
  }

  handleChangeAction(event) {
    if (event.target.dataset.action === 'theme-select') this.setTheme(event.target.value);
    if (event.target.name === 'account_avatar') this.updateAvatarSaveButton();
  }

  getDialogFocusableElements(dialog) {
    return Array.from(dialog.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(element => element.getClientRects().length > 0);
  }

  openDialog(modal) {
    this.dialogFocusReturn.set(modal, document.activeElement);
    modal.classList.remove('hidden');
    const dialog = modal.querySelector('[role="dialog"]') || modal;
    const focusable = this.getDialogFocusableElements(dialog);
    (focusable[0] || dialog).focus();
  }

  closeDialog(modal) {
    modal.classList.add('hidden');
    const previousFocus = this.dialogFocusReturn.get(modal);
    this.dialogFocusReturn.delete(modal);
    if (previousFocus?.isConnected && !previousFocus.closest('.hidden')) previousFocus.focus();
  }

  handleDialogKeydown(event) {
    const dialogs = Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"]'))
      .filter(dialog => !dialog.closest('.hidden'));
    const dialog = dialogs[dialogs.length - 1];
    if (!dialog) return;

    const modal = dialog.closest('#profile-modal, #parent-modal');
    if (event.key === 'Escape') {
      event.preventDefault();
      if (modal?.id === 'profile-modal') this.closeProfileModal();
      else if (modal?.id === 'parent-modal') this.closeParentModal();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = this.getDialogFocusableElements(dialog);
    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  }

  updateHeader() {
    const profile = ProfileManager.getActiveProfile();
    const brandLogoEl = document.getElementById('header-brand-logo');
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
    const gamesBtn = document.getElementById('nav-btn-games');

    if (nameEl) nameEl.textContent = ProfileManager.account?.username || 'Guest';
    if (accountButton) accountButton.title = ProfileManager.isAuthenticated() ? 'Account settings' : 'Sign in or create an account';
    if (brandLogoEl) {
      const brandLogos = {
        home: 'assets/raven-llama-home-logo.png',
        learning: 'assets/Raven%26Llama_Learning%20Centre.jpg',
        games: 'assets/Raven%26Llama_Gaming%20Hub.jpg',
        'critter-catch': 'assets/Raven%26Llama_Gaming%20Hub.jpg',
        creative: 'assets/Raven%26Llama_Creative%20Hub.jpg'
      };
      brandLogoEl.src = brandLogos[this.currentView] || brandLogos.learning;
      brandLogoEl.classList.toggle('is-hub-mark', this.currentView !== 'home');
    }
    if (avatarEl) {
      const avatar = profile?.avatar || ProfileManager.getAvatar('raven');
      avatarEl.innerHTML = renderAvatarArtwork(avatar);
      avatarEl.className = `site-account-button__avatar w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm shadow ${avatar.image ? '' : avatar.color}`;
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
      } else if (this.currentView === 'games' || this.currentView === 'critter-catch') {
        subBadge.textContent = 'Games';
        subBadge.classList.remove('hidden');
      } else if (this.currentView === 'dojo' || this.currentView === 'belt_detail') {
        subBadge.textContent = 'Maths Dojo';
        subBadge.classList.remove('hidden');
      } else if (this.currentView === 'timetables') {
        subBadge.textContent = 'Times Tables';
        subBadge.classList.remove('hidden');
      } else if (this.currentView === 'science') {
        subBadge.textContent = 'Science Explorers';
      } else if (this.currentView === 'spelling') {
        subBadge.textContent = 'Spelling Safari';
        subBadge.classList.remove('hidden');
      } else {
        subBadge.classList.add('hidden');
      }
    }

    if (homeBtn && learningBtn && gamesBtn) {
      const activeView = this.currentView === 'games' || this.currentView === 'critter-catch'
        ? gamesBtn
        : this.currentView === 'home'
          ? homeBtn
          : learningBtn;
      [homeBtn, learningBtn, gamesBtn].forEach(button => {
        const isActive = button === activeView;
        button.classList.toggle('is-active', isActive);
        if (isActive) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
      });
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
    } else if (this.currentView === 'games') {
      this.showGamesHub();
    } else if (this.currentView === 'critter-catch') {
      this.showCritterCatch();
    } else if (this.currentView === 'dojo') {
      this.showDojoHub();
    } else if (this.currentView === 'belt_detail' && this.selectedBeltId) {
      this.showBeltDetails(this.selectedBeltId);
    } else if (this.currentView === 'timetables') {
      this.showTimesTables();
    } else if (this.currentView === 'science') {
      this.showScienceExplorers();
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
    main.dataset.page = 'trophy';

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
              <h4 class="font-ninja text-lg text-yellow-300 font-bold">${escapeHtml(c.beltName)} Mastery</h4>
              <div class="text-xs text-slate-400">Awarded on ${escapeHtml(c.date)} • Score: ${escapeHtml(c.score)}</div>
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
          <button data-action="learning" class="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition font-bold group">
            <span class="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to ${window.brandWordmark()} Learning</span>
          </button>
          <button data-action="home" class="text-xs text-slate-400 hover:text-white">
            🏠 ${window.brandWordmark()} Home
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
    const guestThemeSelect = document.getElementById('guest-theme');
    const profile = ProfileManager.getActiveProfile();
    const avatarPicker = document.getElementById('account-avatar-picker');
    const settingsView = document.getElementById('account-settings-view');
    if (guestPanel) guestPanel.classList.toggle('hidden', authenticated);
    if (signedInPanel) signedInPanel.classList.toggle('hidden', !authenticated);
    if (description) description.textContent = authenticated
      ? 'Manage your password or sign out of this account.'
      : 'Sign in to save progress across your devices.';
    if (username) username.textContent = ProfileManager.account?.username || '';
    if (themeSelect) themeSelect.value = profile.theme;
    if (guestThemeSelect) guestThemeSelect.value = profile.theme;
    if (avatarPicker) avatarPicker.classList.add('hidden');
    if (settingsView) settingsView.classList.remove('hidden');
    if (serviceWarning) serviceWarning.classList.toggle('hidden', ProfileManager.accountServiceAvailable);
    if (message) {
      message.textContent = '';
      message.classList.add('hidden');
    }
    if (authenticated) this.renderAvatarOptions();
    else {
      this.setAccountMode('login');
      document.getElementById('account-avatar-form')?.reset();
    }
    this.openDialog(modal);
  }

  renderAvatarOptions() {
    const options = document.getElementById('account-avatar-options');
    const activeAvatar = ProfileManager.getActiveProfile()?.avatar || ProfileManager.getAvatar('raven');
    if (options) options.innerHTML = ProfileManager.AVATARS.map(avatar => `
      <label class="flex flex-col items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-center text-[11px] text-zinc-300 cursor-pointer hover:border-cyan-500 has-[:checked]:border-cyan-400 has-[:checked]:bg-cyan-950/50">
        <input class="sr-only" type="radio" name="account_avatar" value="${avatar.id}" aria-label="${avatar.name}" ${avatar.id === activeAvatar.id ? 'checked' : ''}>
        <span aria-hidden="true" class="w-9 h-9 rounded-full flex items-center justify-center text-xl ${avatar.image ? '' : avatar.color}">${renderAvatarArtwork(avatar)}</span>
      </label>
    `).join('');
    this.updateAvatarSaveButton();
    const currentAvatarIcon = document.getElementById('account-avatar-current-icon');
    const pickerCurrentAvatarIcon = document.getElementById('account-avatar-picker-current-icon');
    const currentAvatarName = document.getElementById('account-avatar-current-name');
    if (currentAvatarIcon) {
      currentAvatarIcon.innerHTML = renderAvatarArtwork(activeAvatar);
      currentAvatarIcon.className = `account-avatar-current__icon ${activeAvatar.image ? '' : activeAvatar.color}`;
    }
    if (pickerCurrentAvatarIcon) pickerCurrentAvatarIcon.innerHTML = renderAvatarArtwork(activeAvatar);
    if (currentAvatarName) currentAvatarName.textContent = activeAvatar.name;
  }

  updateAvatarSaveButton() {
    const selectedAvatar = document.querySelector('input[name="account_avatar"]:checked');
    const activeAvatar = ProfileManager.getActiveProfile()?.avatar || ProfileManager.getAvatar('raven');
    const saveButton = document.querySelector('#account-avatar-form [type="submit"]');
    if (saveButton) saveButton.disabled = !selectedAvatar || selectedAvatar.value === activeAvatar.id;
  }

  showAvatarPicker() {
    const settingsView = document.getElementById('account-settings-view');
    const avatarPicker = document.getElementById('account-avatar-picker');
    const title = document.getElementById('account-modal-title');
    const description = document.getElementById('account-modal-description');
    if (!settingsView || !avatarPicker) return;
    this.renderAvatarOptions();
    settingsView.classList.add('hidden');
    avatarPicker.classList.remove('hidden');
    if (title) title.textContent = 'Choose an avatar';
    if (description) description.textContent = 'Select the avatar shown on your profile.';
    document.querySelector('#account-avatar-options input:checked')?.focus();
  }

  showAccountSettings() {
    const settingsView = document.getElementById('account-settings-view');
    const avatarPicker = document.getElementById('account-avatar-picker');
    const title = document.getElementById('account-modal-title');
    const description = document.getElementById('account-modal-description');
    if (!settingsView || !avatarPicker) return;
    this.renderAvatarOptions();
    avatarPicker.classList.add('hidden');
    settingsView.classList.remove('hidden');
    if (title) title.textContent = 'Account';
    if (description) description.textContent = 'Manage your password or sign out of this account.';
    document.getElementById('account-avatar-open')?.focus();
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
    if (selectedAvatar.value === profile.avatar.id) return;
    const saved = await ProfileManager.updateProfile({ ...profile, avatar: selectedAvatar.value });
    if (saved) {
      this.setAccountMessage('Avatar updated.', false);
      this.showAccountSettings();
    }
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
    if (modal) this.closeDialog(modal);
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

    this.openDialog(modal);
  }

  closeParentModal() {
    const modal = document.getElementById('parent-modal');
    if (modal) this.closeDialog(modal);
  }
}

window.app = new App();
window.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});

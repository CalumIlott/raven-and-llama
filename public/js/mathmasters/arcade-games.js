// 7 Dojo Arcade Mini-Games with Exit Headers and Point Deductions
class ArcadeEngine {
  constructor() {
    this.activeGame = null;
    this.animationFrame = null;
    this.score = 0;
    this.canvas = null;
    this.ctx = null;
    this.eventListeners = [];
    this.gameInterval = null;
  }

  stopGame() {
    if (this.gameInterval) { clearInterval(this.gameInterval); this.gameInterval = null; }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.eventListeners.forEach(({ target, type, handler }) => {
      target.removeEventListener(type, handler);
    });
    this.eventListeners = [];
    this.activeGame = null;
  }

  addListener(target, type, handler) {
    target.addEventListener(type, handler);
    this.eventListeners.push({ target, type, handler });
  }

  renderArcadeShell(beltId, title, scoreId, scoreIcon, instructions, content) {
    return `
      <section class="arcade-game arcade-game--${beltId}">
        <header class="arcade-game__header">
          <button type="button" data-action="arcade-exit" data-belt-id="${beltId}" class="arcade-game__exit btn-ninja">← Exit Arcade</button>
          <h2 class="arcade-game__title font-ninja">${title}</h2>
          <div class="arcade-game__score">Score: <span id="${scoreId}">0</span> ${scoreIcon}</div>
        </header>
        <p id="arcade-instructions" class="arcade-game__instructions">${instructions}</p>
        ${content}
        <span id="arcade-keyboard-status" class="sr-only" aria-live="polite" aria-atomic="true"></span>
      </section>
    `;
  }

  announceKeyboardAction(message) {
    const status = document.getElementById('arcade-keyboard-status');
    if (status) status.textContent = message;
  }

  deductScore(points, elementId) {
    this.score = Math.max(0, this.score - points);
    window.soundFX?.playWrong();
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = this.score;
      el.classList.add('text-rose-500', 'animate-shake');
      setTimeout(() => el.classList.remove('text-rose-500', 'animate-shake'), 400);
    }
  }

  addScore(points, elementId, confettiOrigin = null) {
    this.score += points;
    window.soundFX?.playCorrect();
    if (confettiOrigin && window.confetti) {
      window.confetti({ particleCount: 25, origin: confettiOrigin });
    }
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = this.score;
      el.classList.add('text-yellow-300', 'scale-125');
      setTimeout(() => el.classList.remove('text-yellow-300', 'scale-125'), 300);
    }
  }

  // --- 1. WHITE BELT: BALLOON POP ---
  startBalloonPop(containerId) {
    this.stopGame();
    const container = document.getElementById(containerId);
    if (!container) return;

    this.score = 0;
    let target = QuestionGenerator.randomInt(1, 6);
    let balloons = [];
    let lastSpawn = 0;
    let nextBalloonId = 0;
    let selectedBalloonId = null;
    let keyboardMode = false;

    container.innerHTML = this.renderArcadeShell(
      'white',
      `Target: <span id="bp-target">${target} Dots</span>`,
      'bp-score',
      '🎈',
      'Tap a matching balloon, or focus the play area and use ← / → to select and Space or Enter to pop it. Wrong balloon: −5 points.',
      '<canvas id="arcade-canvas" width="460" height="380" tabindex="0" aria-label="Balloon Pop play area" aria-describedby="arcade-instructions arcade-keyboard-status" class="arcade-game__canvas w-full rounded-2xl cursor-pointer touch-none"></canvas>'
    );

    this.canvas = document.getElementById('arcade-canvas');
    this.ctx = this.canvas.getContext('2d');

    const spawnBalloon = () => {
      const isTarget = Math.random() > 0.45;
      const count = isTarget ? target : QuestionGenerator.randomInt(1, 6);
      const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
      balloons.push({
        id: nextBalloonId++,
        x: QuestionGenerator.randomInt(45, this.canvas.width - 45),
        y: this.canvas.height + 30,
        radius: 32,
        speed: 1.1 + Math.random() * 0.7,
        count: count,
        color: colors[QuestionGenerator.randomInt(0, colors.length - 1)],
        popped: false
      });
      if (keyboardMode && selectedBalloonId === null) selectBalloon(1);
    };

    const selectBalloon = (direction) => {
      keyboardMode = true;
      const available = balloons.filter(balloon => !balloon.popped);
      if (!available.length) {
        selectedBalloonId = null;
        this.announceKeyboardAction('Waiting for a balloon to appear.');
        return;
      }
      const currentIndex = available.findIndex(balloon => balloon.id === selectedBalloonId);
      const nextIndex = currentIndex < 0
        ? direction < 0 ? available.length - 1 : 0
        : (currentIndex + direction + available.length) % available.length;
      const selected = available[nextIndex];
      selectedBalloonId = selected.id;
      this.announceKeyboardAction(`Selected balloon with ${selected.count} dots. Press Space or Enter to pop it.`);
    };

    const popBalloon = (balloon, x = balloon.x, y = balloon.y) => {
      if (balloon.popped) return;
      balloon.popped = true;
      selectedBalloonId = null;
      if (balloon.count === target) {
        this.addScore(10, 'bp-score', { x: x / this.canvas.width, y: y / this.canvas.height });
        target = QuestionGenerator.randomInt(1, 6);
        document.getElementById('bp-target').textContent = `${target} Dots`;
      } else {
        this.deductScore(5, 'bp-score');
      }
      this.announceKeyboardAction(`Popped balloon with ${balloon.count} dots.`);
    };

    const handleClick = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const mx = (clientX - rect.left) * scaleX;
      const my = (clientY - rect.top) * scaleY;

      for (let i = balloons.length - 1; i >= 0; i--) {
        const b = balloons[i];
        if (Math.hypot(mx - b.x, my - b.y) <= b.radius && !b.popped) {
          popBalloon(b, mx, my);
          break;
        }
      }
    };

    this.addListener(this.canvas, 'mousedown', handleClick);
    this.addListener(this.canvas, 'touchstart', handleClick);
    this.addListener(this.canvas, 'keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Space', 'Enter'].includes(event.code)) return;
      event.preventDefault();
      if (event.code === 'ArrowLeft') return selectBalloon(-1);
      if (event.code === 'ArrowRight') return selectBalloon(1);
      const selected = balloons.find(balloon => balloon.id === selectedBalloonId && !balloon.popped);
      if (selected) popBalloon(selected);
      else selectBalloon(1);
    });

    const loop = (timestamp) => {
      if (timestamp - lastSpawn > 1400) {
        spawnBalloon();
        lastSpawn = timestamp;
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = balloons.length - 1; i >= 0; i--) {
        const b = balloons[i];
        b.y -= b.speed;

        if (!b.popped) {
          this.ctx.beginPath();
          this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          this.ctx.fillStyle = b.color;
          this.ctx.fill();
          this.ctx.strokeStyle = '#ffffff';
          this.ctx.lineWidth = 2;
          this.ctx.stroke();

          this.ctx.beginPath();
          this.ctx.moveTo(b.x, b.y + b.radius);
          this.ctx.lineTo(b.x, b.y + b.radius + 14);
          this.ctx.strokeStyle = 'rgba(255,255,255,0.6)';
          this.ctx.stroke();

          if (b.id === selectedBalloonId) {
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.radius + 6, 0, Math.PI * 2);
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
          }

          this.drawDots(b.x, b.y, b.count);
        }

        if (b.y < -50 || b.popped) {
          balloons.splice(i, 1);
        }
      }

      this.animationFrame = requestAnimationFrame(loop);
    };

    this.animationFrame = requestAnimationFrame(loop);
  }

  drawDots(cx, cy, count) {
    this.ctx.fillStyle = '#ffffff';
    const r = 4;
    const offsets = {
      1: [[0, 0]],
      2: [[-8, -8], [8, 8]],
      3: [[-8, -8], [0, 0], [8, 8]],
      4: [[-8, -8], [8, -8], [-8, 8], [8, 8]],
      5: [[-8, -8], [8, -8], [0, 0], [-8, 8], [8, 8]],
      6: [[-8, -10], [8, -10], [-8, 0], [8, 0], [-8, 10], [8, 10]]
    };
    const pts = offsets[count] || [[0, 0]];
    pts.forEach(([dx, dy]) => {
      this.ctx.beginPath();
      this.ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
  // --- 2. YELLOW BELT: POTION MATCH ---
  startPotionMatch(containerId) {
    this.stopGame();
    const container = document.getElementById(containerId);
    if (!container) return;

    this.score = 0;
    // Six guaranteed pairs of 1–9 mates: every tile is solvable and the board ends cleanly.
    let values = [];
    for (let i = 0; i < 6; i++) {
      const value = QuestionGenerator.randomInt(1, 9);
      values.push(value, 10 - value);
    }
    values = QuestionGenerator.shuffle(values);
    const potions = values.map((val, id) => ({ id, val, matched: false }));

    container.innerHTML = this.renderArcadeShell(
      'yellow',
      'Match Sum to 10!',
      'pm-score',
      '🧪',
      'Choose two potions that add up to 10. A non-10 pair costs 5 points.',
      `<div id="potions-grid" class="arcade-game__tile-grid grid grid-cols-4 gap-3 my-4">
        ${potions.map(p => `
          <button data-action="arcade-potion" data-id="${p.id}" id="potion-btn-${p.id}"
                  aria-label="Potion ${p.val}" class="arcade-game__tile btn-ninja aspect-square flex flex-col items-center justify-center shadow-lg transition">
            <span class="text-2xl" aria-hidden="true">🧪</span>
            <span class="font-ninja text-xl font-bold mt-1">${p.val}</span>
          </button>
        `).join('')}
      </div>`
    );

    this.potions = potions;
    this.selectedPotion = null;
  }

  tapPotion(id) {
    const p = this.potions.find(item => item.id === id);
    if (!p || p.matched) return;

    window.soundFX?.playClick();
    const btn = document.getElementById(`potion-btn-${id}`);

    if (this.selectedPotion === null) {
      this.selectedPotion = p;
      if (btn) btn.classList.add('ring-4', 'ring-yellow-400', 'scale-105');
    } else if (this.selectedPotion.id === p.id) {
      this.selectedPotion = null;
      if (btn) btn.classList.remove('ring-4', 'ring-yellow-400', 'scale-105');
    } else {
      const prev = this.selectedPotion;
      const prevBtn = document.getElementById(`potion-btn-${prev.id}`);
      if (prev.val + p.val === 10) {
        p.matched = true;
        prev.matched = true;
        this.addScore(20, 'pm-score');
        if (btn) { btn.innerHTML = '<span class="text-3xl">✨</span>'; btn.classList.add('opacity-30'); }
        if (prevBtn) { prevBtn.innerHTML = '<span class="text-3xl">✨</span>'; prevBtn.classList.add('opacity-30'); }
      } else {
        this.deductScore(5, 'pm-score');
        if (btn) btn.classList.remove('ring-4', 'ring-yellow-400', 'scale-105');
        if (prevBtn) prevBtn.classList.remove('ring-4', 'ring-yellow-400', 'scale-105');
      }
      this.selectedPotion = null;

      if (this.potions.every(item => item.matched)) {
        setTimeout(() => this.startPotionMatch('game-arena'), 800);
      }
    }
  }

  // --- 3. GREEN BELT: PLATFORM RUNNER ---
  startPlatformRunner(containerId) {
    this.stopGame();
    const container = document.getElementById(containerId);
    if (!container) return;

    this.score = 0;
    const step = 5;
    let player = { x: 60, y: 250, vy: 0, isJumping: false, radius: 18 };
    let platforms = [
      { x: 20, y: 280, w: 100, val: 5, valid: true },
      { x: 180, y: 270, w: 90, val: 10, valid: true },
      { x: 320, y: 260, w: 90, val: 15, valid: true }
    ];
    let nextVal = 20;

    container.innerHTML = this.renderArcadeShell(
      'green',
      'Skip Count by 5s!',
      'pr-score',
      '🏃',
      'Jump with Space or ↑, or select JUMP. Avoid falling into the water.',
      `<canvas id="runner-canvas" width="460" height="300" tabindex="0" aria-label="Platform Runner play area" aria-describedby="arcade-instructions arcade-keyboard-status" class="arcade-game__canvas rounded-2xl cursor-pointer"></canvas>
       <div class="arcade-game__controls mt-3 flex justify-center">
         <button data-action="arcade-jump" class="arcade-game__control btn-ninja px-10 py-3 font-ninja font-bold text-lg">JUMP! ⬆️</button>
       </div>`
    );

    this.canvas = document.getElementById('runner-canvas');
    this.ctx = this.canvas.getContext('2d');
    let announcedGrounded = false;

    const jump = (e) => {
      if (e?.type === 'keydown') {
        if (e.repeat || !['Space', 'ArrowUp'].includes(e.code)) return;
        e.preventDefault();
      }
      if (!player.isJumping) {
        player.vy = -12;
        player.isJumping = true;
        announcedGrounded = false;
        window.soundFX?.playJump();
        this.announceKeyboardAction('Jumped.');
      }
    };

    this.triggerJump = jump;
    this.addListener(this.canvas, 'click', jump);
    const keyHandler = (e) => { if (e.code === 'Space' || e.code === 'ArrowUp') jump(e); };
    this.addListener(this.canvas, 'keydown', keyHandler);

    let lastFrame = 0;
    const loop = (timestamp) => {
      if (!this.canvas?.isConnected) return;
      const dt = Math.min((timestamp - (lastFrame || timestamp)) / 16.667, 2);
      lastFrame = timestamp;
      const previousBottom = player.y + player.radius;
      player.vy += 0.6 * dt;
      player.y += player.vy * dt;

      platforms.forEach(p => p.x -= 2 * dt);

      if (platforms[0] && platforms[0].x + platforms[0].w < 0) {
        platforms.shift();
        const lastP = platforms[platforms.length - 1];
        platforms.push({
          x: lastP.x + QuestionGenerator.randomInt(115, 135),
          y: QuestionGenerator.randomInt(245, 275),
          w: QuestionGenerator.randomInt(80, 100),
          val: nextVal
        });
        nextVal += step;
        this.addScore(5, 'pr-score');
      }

      player.isJumping = true;
      platforms.forEach(p => {
        if (player.x + player.radius > p.x && player.x - player.radius < p.x + p.w && previousBottom <= p.y && player.y + player.radius >= p.y && player.vy >= 0) {
          player.y = p.y - player.radius;
          player.vy = 0;
          player.isJumping = false;
        }
      });

      if (!player.isJumping && !announcedGrounded) {
        announcedGrounded = true;
        this.announceKeyboardAction('Ready to jump.');
      }

      if (player.y - player.radius > this.canvas.height) {
        player.y = 250;
        player.vy = 0;
        player.isJumping = false;
        this.deductScore(10, 'pr-score');
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      platforms.forEach(p => {
        this.ctx.fillStyle = '#059669';
        this.ctx.fillRect(p.x, p.y, p.w, 18);
        this.ctx.strokeStyle = '#34d399';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(p.x, p.y, p.w, 18);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Fredoka, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(p.val, p.x + p.w / 2, p.y + 14);
      });

      this.ctx.fillStyle = '#facc15';
      this.ctx.beginPath();
      this.ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#0f172a';
      this.ctx.font = '16px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('🥋', player.x, player.y + 6);

      this.animationFrame = requestAnimationFrame(loop);
    };

    this.animationFrame = requestAnimationFrame(loop);
  }
  // --- 4. BLUE BELT: SHURIKEN TARGET GALLERY ---
  startShurikenGallery(containerId) {
    this.stopGame();
    const container = document.getElementById(containerId);
    if (!container) return;

    this.score = 0;
    let targetSum = 15;
    let targets = [];
    let lastSpawn = 0;
    let nextTargetId = 0;
    let selectedTargetId = null;
    let keyboardMode = false;

    container.innerHTML = this.renderArcadeShell(
      'blue',
      'Target Balance: <span id="sg-target">= 15</span>',
      'sg-score',
      '🎯',
      'Hit boards that sum to 15. Focus the play area and use ← / → to select; Space or Enter shoots. Wrong board: −5 points.',
      '<canvas id="target-canvas" width="460" height="340" tabindex="0" aria-label="Shuriken Gallery play area" aria-describedby="arcade-instructions arcade-keyboard-status" class="arcade-game__canvas rounded-2xl cursor-crosshair touch-none"></canvas>'
    );

    this.canvas = document.getElementById('target-canvas');
    this.ctx = this.canvas.getContext('2d');

    const spawnTarget = () => {
      const isCorrect = Math.random() > 0.45;
      const a = QuestionGenerator.randomInt(3, 12);
      const b = isCorrect ? (targetSum - a) : QuestionGenerator.randomInt(2, 10);
      targets.push({
        id: nextTargetId++,
        x: -80,
        y: QuestionGenerator.randomInt(40, 260),
        w: 90,
        h: 46,
        vx: 1.5 + Math.random() * 1.5,
        text: `${a} + ${b}`,
        isCorrect: (a + b) === targetSum,
        hit: false
      });
      if (keyboardMode && selectedTargetId === null) selectTarget(1);
    };

    const selectTarget = (direction) => {
      keyboardMode = true;
      const available = targets.filter(target => !target.hit);
      if (!available.length) {
        selectedTargetId = null;
        this.announceKeyboardAction('Waiting for a target to appear.');
        return;
      }
      const currentIndex = available.findIndex(target => target.id === selectedTargetId);
      const nextIndex = currentIndex < 0
        ? direction < 0 ? available.length - 1 : 0
        : (currentIndex + direction + available.length) % available.length;
      const selected = available[nextIndex];
      selectedTargetId = selected.id;
      this.announceKeyboardAction(`Selected target ${selected.text}. Press Space or Enter to shoot.`);
    };

    const shootTarget = (target, confettiOrigin = null) => {
      if (!target || target.hit) return;
      target.hit = true;
      selectedTargetId = null;
      if (target.isCorrect) {
        this.addScore(20, 'sg-score', confettiOrigin);
      } else {
        this.deductScore(5, 'sg-score');
      }
      this.announceKeyboardAction(`Hit target ${target.text}.`);
    };

    const shoot = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const mx = (clientX - rect.left) * scaleX;
      const my = (clientY - rect.top) * scaleY;

      window.soundFX?.playLaser();

      for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];
        if (mx >= t.x && mx <= t.x + t.w && my >= t.y && my <= t.y + t.h && !t.hit) {
          shootTarget(t, { x: mx / this.canvas.width, y: my / this.canvas.height });
          break;
        }
      }
    };

    this.addListener(this.canvas, 'mousedown', shoot);
    this.addListener(this.canvas, 'touchstart', shoot);
    this.addListener(this.canvas, 'keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Space', 'Enter'].includes(event.code)) return;
      event.preventDefault();
      if (event.code === 'ArrowLeft') return selectTarget(-1);
      if (event.code === 'ArrowRight') return selectTarget(1);
      const selected = targets.find(target => target.id === selectedTargetId && !target.hit);
      if (selected) shootTarget(selected);
      else selectTarget(1);
    });

    const loop = (timestamp) => {
      if (timestamp - lastSpawn > 1300) {
        spawnTarget();
        lastSpawn = timestamp;
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];
        t.x += t.vx;

        if (!t.hit) {
          this.ctx.fillStyle = '#b45309';
          this.ctx.fillRect(t.x, t.y, t.w, t.h);
          this.ctx.strokeStyle = '#fde047';
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(t.x, t.y, t.w, t.h);

          if (t.id === selectedTargetId) {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(t.x - 4, t.y - 4, t.w + 8, t.h + 8);
          }

          this.ctx.fillStyle = '#ffffff';
          this.ctx.font = 'bold 16px Fredoka, sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(t.text, t.x + t.w / 2, t.y + 28);
        }

        if (t.x > this.canvas.width + 100 || t.hit) {
          targets.splice(i, 1);
        }
      }

      this.animationFrame = requestAnimationFrame(loop);
    };

    this.animationFrame = requestAnimationFrame(loop);
  }

  // --- 5. BROWN BELT: ASTEROID BLASTER ---
  startAsteroidBlaster(containerId) {
    this.stopGame();
    const container = document.getElementById(containerId);
    if (!container) return;

    this.score = 0;
    const timesBase = 6;
    let ship = { x: 230, y: 330, speed: 6 };
    let bullets = [];
    let asteroids = [];
    let lastSpawn = 0;
    let keys = {};

    container.innerHTML = this.renderArcadeShell(
      'brown',
      `Blast Multiples of ${timesBase}!`,
      'ab-score',
      '🚀',
      `Move with ← / → or A / D; fire with Space. Blast multiples of ${timesBase}, and avoid non-multiples.`,
      `<canvas id="space-canvas" width="460" height="340" tabindex="0" aria-label="Asteroid Blaster play area" aria-describedby="arcade-instructions arcade-keyboard-status" class="arcade-game__canvas rounded-2xl"></canvas>
       <div class="arcade-game__controls mt-3 flex justify-between">
         <button data-action="arcade-move-left" class="arcade-game__control btn-ninja flex-1 py-3 font-bold">⬅️ Move</button>
         <button data-action="arcade-fire" class="arcade-game__control btn-ninja flex-1 py-3 font-ninja font-bold">🔥 FIRE</button>
         <button data-action="arcade-move-right" class="arcade-game__control btn-ninja flex-1 py-3 font-bold">Move ➡️</button>
       </div>`
    );

    this.canvas = document.getElementById('space-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.spaceShip = ship;

    const spawnAsteroid = () => {
      const isMultiple = Math.random() > 0.45;
      const val = isMultiple ? (timesBase * QuestionGenerator.randomInt(1, 10)) : QuestionGenerator.randomInt(10, 60);
      asteroids.push({
        x: QuestionGenerator.randomInt(40, this.canvas.width - 40),
        y: -30,
        radius: 26,
        vy: 1.1 + Math.random() * 1.0,
        val: val,
        isMultiple: (val % timesBase === 0)
      });
    };

    const fire = () => {
      bullets.push({ x: ship.x, y: ship.y - 20, vy: -7 });
      window.soundFX?.playLaser();
      this.announceKeyboardAction('Fired a shot.');
    };

    this.fireBullet = fire;
    this.moveShipLeft = () => { ship.x = Math.max(30, ship.x - 40); this.announceKeyboardAction('Ship moved left.'); };
    this.moveShipRight = () => { ship.x = Math.min(this.canvas.width - 30, ship.x + 40); this.announceKeyboardAction('Ship moved right.'); };

    const keyDown = (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space'].includes(e.code)) return;
      e.preventDefault();
      if (e.repeat && e.code === 'Space') return;
      keys[e.code] = true;
      if (e.code === 'Space') fire();
      else this.announceKeyboardAction(e.code === 'ArrowLeft' || e.code === 'KeyA' ? 'Ship moved left.' : 'Ship moved right.');
    };
    const keyUp = (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space'].includes(e.code)) return;
      e.preventDefault();
      keys[e.code] = false;
    };
    this.addListener(this.canvas, 'keydown', keyDown);
    this.addListener(window, 'keyup', keyUp);

    const loop = (timestamp) => {
      if (keys['ArrowLeft'] || keys['KeyA']) ship.x = Math.max(30, ship.x - ship.speed);
      if (keys['ArrowRight'] || keys['KeyD']) ship.x = Math.min(this.canvas.width - 30, ship.x + ship.speed);

      if (timestamp - lastSpawn > 1300) {
        spawnAsteroid();
        lastSpawn = timestamp;
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y += b.vy;
        this.ctx.fillStyle = '#38bdf8';
        this.ctx.fillRect(b.x - 2, b.y, 4, 12);
        if (b.y < -20) bullets.splice(i, 1);
      }

      for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        a.y += a.vy;

        this.ctx.beginPath();
        this.ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = a.isMultiple ? '#b45309' : '#475569';
        this.ctx.fill();
        this.ctx.strokeStyle = '#f59e0b';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 15px Fredoka, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(a.val, a.x, a.y + 5);

        for (let j = bullets.length - 1; j >= 0; j--) {
          const b = bullets[j];
          if (Math.hypot(b.x - a.x, b.y - a.y) < a.radius) {
            bullets.splice(j, 1);
            if (a.isMultiple) {
              this.addScore(25, 'ab-score');
            } else {
              this.deductScore(10, 'ab-score');
            }
            asteroids.splice(i, 1);
            break;
          }
        }

        if (a.y > this.canvas.height + 40) asteroids.splice(i, 1);
      }

      this.ctx.fillStyle = '#38bdf8';
      this.ctx.beginPath();
      this.ctx.moveTo(ship.x, ship.y - 18);
      this.ctx.lineTo(ship.x - 18, ship.y + 18);
      this.ctx.lineTo(ship.x + 18, ship.y + 18);
      this.ctx.closePath();
      this.ctx.fill();

      this.animationFrame = requestAnimationFrame(loop);
    };

    this.animationFrame = requestAnimationFrame(loop);
  }

  // --- 6. BLACK BELT: GEM SORTER ---
  startGemSorter(containerId) {
    this.stopGame();
    const container = document.getElementById(containerId);
    if (!container) return;

    this.score = 0;
    this.gemRound = 0;
    this.gemScoreId = 'gs-score';
    container.innerHTML = this.renderArcadeShell(
      'black',
      'Match Equivalences! 💎',
      'gs-score',
      '💎',
      'Select every fraction, decimal, and percentage equal to the target. Complete five rounds before time runs out.',
      `<div class="arcade-game__stats"><span>Round <b id="gs-round">1 / 5</b></span><span>Time <b id="gs-time">45</b>s</span></div>
       <div class="arcade-game__target my-3"><span>Target value</span><div id="gs-target" class="font-ninja text-3xl font-bold"></div></div>
       <div id="gs-gems" class="arcade-game__tile-grid grid grid-cols-2 sm:grid-cols-3 gap-3"></div>`
    );
    this.nextGemRound();
    let timeLeft = 45;
    this.gameInterval = setInterval(() => {
      timeLeft--;
      const timer = document.getElementById('gs-time');
      if (timer) timer.textContent = timeLeft;
      if (timeLeft <= 0) this.finishGemSorter(false);
    }, 1000);
  }

  nextGemRound() {
    const targets = [
      { label: '1/2 (one half)', forms: ['1/2', '2/4', '0.5', '50%'] },
      { label: '1/4 (one quarter)', forms: ['1/4', '2/8', '0.25', '25%'] },
      { label: '3/4 (three quarters)', forms: ['3/4', '6/8', '0.75', '75%'] },
      { label: '1/5 (one fifth)', forms: ['1/5', '2/10', '0.2', '20%'] },
      { label: '1/10 (one tenth)', forms: ['1/10', '0.1', '10%', '2/20'] }
    ];
    const round = targets[this.gemRound];
    if (!round) return this.finishGemSorter(true);
    document.getElementById('gs-round').textContent = `${this.gemRound + 1} / ${targets.length}`;
    document.getElementById('gs-target').textContent = round.label;
    this.gemExpected = new Set(round.forms);
    const decoys = ['1/3', '0.4', '60%', '3/5', '0.125', '40%', '2/3', '0.8', '90%', '5/8'];
    const values = QuestionGenerator.shuffle([...round.forms, ...QuestionGenerator.shuffle(decoys).slice(0, 5)]);
    document.getElementById('gs-gems').innerHTML = values.map((value, index) => `<button id="gem-${index}" data-action="arcade-gem" data-index="${index}" class="arcade-game__tile btn-ninja p-4 min-h-16 font-ninja text-lg font-bold">💎 ${value}</button>`).join('');
  }

  tapGem(index) {
    const btn = document.getElementById(`gem-${index}`);
    if (!btn || btn.disabled) return;
    const value = btn.textContent.replace('💎 ', '').trim();
    btn.disabled = true;
    if (this.gemExpected.has(value)) {
      btn.classList.add('is-correct', 'opacity-60');
      this.gemExpected.delete(value);
      this.addScore(10, 'gs-score');
      if (this.gemExpected.size === 0) {
        this.gemRound++;
        setTimeout(() => { if (this.gemRound >= 5) this.finishGemSorter(true); else this.nextGemRound(); }, 500);
      }
    } else {
      btn.classList.add('is-wrong', 'opacity-50');
      this.deductScore(5, 'gs-score');
    }
  }

  finishGemSorter(won) {
    if (this.gameInterval) { clearInterval(this.gameInterval); this.gameInterval = null; }
    const arena = document.getElementById('game-arena');
    if (!arena) return;
    arena.innerHTML = `<div class="max-w-md mx-auto text-center p-8 bg-slate-900 border-2 ${won ? 'border-emerald-500' : 'border-rose-700'} rounded-3xl"><div class="text-5xl mb-3">${won ? '💎' : '⏱️'}</div><h2 class="font-ninja text-2xl text-white font-bold">${won ? 'Gem Master!' : 'Time’s Up!'}</h2><p class="text-slate-300 my-3">Score: <b class="text-yellow-400">${this.score}</b> · Rounds cleared: ${Math.min(this.gemRound + (won ? 0 : 0), 5)} / 5</p><button data-action="arcade-retry" data-game="startGemSorter" data-container="game-arena" class="btn-ninja px-5 py-3 bg-purple-700 rounded-xl text-white font-bold">Play Again</button><button data-action="arcade-return" data-belt-id="black" class="btn-ninja px-5 py-3 ml-2 bg-slate-700 rounded-xl text-white">Dojo Skills</button></div>`;
  }

  // --- 7. PLATINUM BELT: BODMAS CYBER TURRET ---
  startCyberDefense(containerId) {
    this.stopGame();
    const container = document.getElementById(containerId);
    if (!container) return;

    this.score = 0;
    this.defenseRound = 0;
    this.defenseLives = 3;
    this.bossHealth = 8;
    container.innerHTML = this.renderArcadeShell(
      'platinum',
      'BODMAS Boss Defense 🛡️',
      'cd-score',
      '🛡️',
      'Answer BODMAS problems to hit the boss. Three shields; solve eight before time runs out.',
      `<div class="arcade-game__stats"><span>Shields <b id="cd-lives">3</b> ❤️</span><span>Time <b id="cd-time">60</b>s</span><span>Boss <b id="cd-health">8</b> 🛡️</span></div>
       <progress id="cd-healthbar" class="boss-health-progress w-full my-2" max="8" value="8" aria-label="Boss health"></progress>
       <div class="arcade-game__target my-4"><div class="text-xs text-rose-400 font-bold uppercase tracking-wider mb-2">Incoming attack · solve to fire</div><div id="cd-question" class="font-ninja text-3xl font-bold mb-4"></div><div id="cd-choices" class="arcade-game__tile-grid grid grid-cols-2 gap-3"></div></div>`
    );
    this.nextDefenseQuestion();
    let timeLeft = 60;
    this.gameInterval = setInterval(() => { timeLeft--; const el = document.getElementById('cd-time'); if(el) el.textContent=timeLeft; if(timeLeft<=0) this.finishCyberDefense(false); }, 1000);
  }

  nextDefenseQuestion() {
    this.defenseAnswered = false;
    const a = QuestionGenerator.randomInt(2, 9), b = QuestionGenerator.randomInt(2, 9), c = QuestionGenerator.randomInt(2, 6);
    if (Math.random() < 0.5) {
      this.defenseAnswer = a + b * c;
      this.defensePrompt = `${a} + ${b} × ${c} = ?`;
    } else {
      this.defenseAnswer = (a + b) * c;
      this.defensePrompt = `(${a} + ${b}) × ${c} = ?`;
    }
    document.getElementById('cd-question').textContent = this.defensePrompt;
    const options = QuestionGenerator.generateChoices(this.defenseAnswer, 4, 12);
    document.getElementById('cd-choices').innerHTML = options.map(value => `<button data-action="arcade-turret" data-value="${value}" class="arcade-game__tile btn-ninja p-4 font-ninja text-2xl font-bold">${value}</button>`).join('');
  }

  fireTurret(value) {
    if (!document.getElementById('cd-question') || this.defenseAnswered) return;
    this.defenseAnswered = true;
    if (Number(value) === this.defenseAnswer) {
      this.addScore(30, 'cd-score');
      window.soundFX?.playExplode();
      this.bossHealth--;
      this.defenseRound++;
      const health = document.getElementById('cd-health');
      const bar = document.getElementById('cd-healthbar');
      if(health) health.textContent=this.bossHealth;
      if(bar) bar.value = this.bossHealth;
    } else {
      this.deductScore(10, 'cd-score');
      this.defenseLives--;
      const lives = document.getElementById('cd-lives');
      if(lives) lives.textContent=this.defenseLives;
    }
    if (this.bossHealth <= 0) return this.finishCyberDefense(true);
    if (this.defenseLives <= 0) return this.finishCyberDefense(false);
    this.nextDefenseQuestion();
  }

  finishCyberDefense(won) {
    if (this.gameInterval) { clearInterval(this.gameInterval); this.gameInterval = null; }
    const arena = document.getElementById('game-arena');
    if (!arena) return;
    arena.innerHTML = `<div class="max-w-md mx-auto text-center p-8 bg-slate-900 border-2 ${won ? 'border-emerald-500' : 'border-rose-700'} rounded-3xl"><div class="text-5xl mb-3">${won ? '🛡️' : '💥'}</div><h2 class="font-ninja text-2xl text-white font-bold">${won ? 'Dojo Defended!' : 'Defense Overrun'}</h2><p class="text-slate-300 my-3">Score: <b class="text-yellow-400">${this.score}</b> · Correct: ${this.defenseRound} / 8</p><button data-action="arcade-retry" data-game="startCyberDefense" data-container="game-arena" class="btn-ninja px-5 py-3 bg-sky-700 rounded-xl text-white font-bold">Play Again</button><button data-action="arcade-return" data-belt-id="platinum" class="btn-ninja px-5 py-3 ml-2 bg-slate-700 rounded-xl text-white">Dojo Skills</button></div>`;
  }
}

window.arcadeEngine = new ArcadeEngine();

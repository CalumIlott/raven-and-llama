// Audio Synthesis Engine for Maths Masters Dojo using Web Audio API
class SoundFX {
  constructor() {
    this.audioCtx = null;
    this.muted = localStorage.getItem('math_masters_muted') === 'true';
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('math_masters_muted', this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  playTone(freq, type, duration, startTime = 0, gainLevel = 0.15) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + startTime);

      gain.gain.setValueAtTime(gainLevel, this.audioCtx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + startTime);
      osc.stop(this.audioCtx.currentTime + startTime + duration);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // Cheerful correct answer chime
  playCorrect() {
    if (this.muted) return;
    this.playTone(523.25, 'triangle', 0.1, 0, 0.15); // C5
    this.playTone(659.25, 'triangle', 0.1, 0.08, 0.15); // E5
    this.playTone(783.99, 'triangle', 0.25, 0.16, 0.2); // G5
  }

  // Gentle buzz for incorrect attempt
  playWrong() {
    if (this.muted) return;
    this.playTone(180, 'sawtooth', 0.15, 0, 0.15);
    this.playTone(140, 'sawtooth', 0.25, 0.12, 0.15);
  }

  // Tap button click sound
  playClick() {
    if (this.muted) return;
    this.playTone(800, 'sine', 0.04, 0, 0.05);
  }

  // Timer tick sound
  playTick() {
    if (this.muted) return;
    this.playTone(900, 'sine', 0.03, 0, 0.08);
  }

  // Arcade jump sound
  playJump() {
    if (this.muted) return;
    this.playTone(300, 'sine', 0.1, 0, 0.1);
    this.playTone(600, 'sine', 0.1, 0.05, 0.1);
  }

  // Arcade laser / shoot sound
  playLaser() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
    } catch (e) {}
  }

  // Arcade explosion sound
  playExplode() {
    if (this.muted) return;
    this.playTone(120, 'sawtooth', 0.25, 0, 0.2);
    this.playTone(80, 'sawtooth', 0.35, 0.08, 0.2);
  }

  // Streak combo sound - pitch increases with streak
  playStreak(streak = 1) {
    if (this.muted) return;
    const baseFreq = 440;
    const step = Math.min(streak, 10);
    const freq = baseFreq * Math.pow(1.08, step);
    this.playTone(freq, 'sine', 0.15, 0, 0.15);
    this.playTone(freq * 1.5, 'triangle', 0.2, 0.06, 0.12);
  }

  // Belt unlock / Grand Victory Fanfare
  playFanfare() {
    if (this.muted) return;
    const notes = [
      { f: 523.25, d: 0.15, t: 0 },    // C5
      { f: 523.25, d: 0.15, t: 0.15 }, // C5
      { f: 523.25, d: 0.15, t: 0.30 }, // C5
      { f: 659.25, d: 0.35, t: 0.45 }, // E5
      { f: 783.99, d: 0.35, t: 0.70 }, // G5
      { f: 1046.50, d: 0.60, t: 0.95 } // C6
    ];
    notes.forEach(n => {
      this.playTone(n.f, 'triangle', n.d, n.t, 0.2);
    });
  }

  // Star pop
  playStar() {
    if (this.muted) return;
    this.playTone(880, 'sine', 0.12, 0, 0.15);
    this.playTone(1320, 'sine', 0.2, 0.08, 0.15);
  }
}

window.soundFX = new SoundFX();

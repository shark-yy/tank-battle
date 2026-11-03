/* =========================================================
   STEEL SIEGE · 钢铁围城
   Pure Canvas 2D arcade tank survival game.
   ========================================================= */

(() => {
  "use strict";

  // ---------- Core constants ----------

  const WORLD = { w: 1440, h: 900 };
  const BOUNDS = { left: 58, top: 58, right: 1382, bottom: 842 };
  const TAU = Math.PI * 2;
  const SAVE_KEY = "steel-siege-save-v1";

  const PLAYER = {
    radius: 25,
    maxHp: 100,
    speed: 252,
    fireDelay: 0.235,
    dashCooldown: 3.1,
    dashDuration: 0.18,
    invulnAfterHit: 0.42
  };

  const SPAWN_POINTS = [
    { x: 142, y: 142 },
    { x: 1298, y: 142 },
    { x: 142, y: 758 },
    { x: 1298, y: 758 },
    { x: 720, y: 116 }
  ];

  const WALL_LAYOUT = [
    { x: 306, y: 242, w: 64, h: 176 },
    { x: 1070, y: 242, w: 64, h: 176 },
    { x: 306, y: 520, w: 64, h: 152 },
    { x: 1070, y: 520, w: 64, h: 152 },
    { x: 588, y: 248, w: 264, h: 52 },
    { x: 588, y: 600, w: 264, h: 52 },
    { x: 692, y: 390, w: 56, h: 120 },
    { x: 112, y: 430, w: 140, h: 50 },
    { x: 1188, y: 430, w: 140, h: 50 }
  ];

  const CRATE_LAYOUT = [
    { x: 470, y: 340, w: 58, h: 58 },
    { x: 912, y: 340, w: 58, h: 58 },
    { x: 470, y: 566, w: 58, h: 58 },
    { x: 912, y: 566, w: 58, h: 58 },
    { x: 380, y: 716, w: 58, h: 58 },
    { x: 1002, y: 716, w: 58, h: 58 },
    { x: 172, y: 252, w: 58, h: 58 },
    { x: 1210, y: 252, w: 58, h: 58 }
  ];

  const ENEMY_TYPES = {
    raider: {
      name: "RS-01 掠袭者",
      hp: 40,
      speed: 174,
      radius: 20,
      damage: 8,
      fireDelay: 1.75,
      range: 540,
      bulletSpeed: 326,
      preferred: 210,
      chargeTime: 0.2,
      tolerance: 0.15,
      spread: 0.065,
      turnRate: 3.4,
      circleBias: 0.72,
      leadFactor: 0.7,
      score: 120,
      dropChance: 0.12,
      accent: "#ff7653",
      body: "#3b241c",
      bulletColor: "#ffad72"
    },
    gunner: {
      name: "GN-04 突击者",
      hp: 88,
      speed: 108,
      radius: 25,
      damage: 13,
      fireDelay: 1.95,
      range: 640,
      bulletSpeed: 386,
      preferred: 335,
      chargeTime: 0.3,
      tolerance: 0.1,
      spread: 0.045,
      turnRate: 2.6,
      circleBias: 0.58,
      leadFactor: 0.82,
      score: 200,
      dropChance: 0.2,
      accent: "#ff9855",
      body: "#3a2a1b",
      bulletColor: "#ffc16e"
    },
    heavy: {
      name: "HV-09 重装者",
      hp: 196,
      speed: 66,
      radius: 31,
      damage: 20,
      fireDelay: 2.6,
      range: 570,
      bulletSpeed: 294,
      preferred: 250,
      chargeTime: 0.45,
      tolerance: 0.12,
      spread: 0.055,
      turnRate: 1.65,
      circleBias: 0.3,
      leadFactor: 0.58,
      score: 340,
      dropChance: 0.42,
      accent: "#f25547",
      body: "#3a1d1b",
      bulletColor: "#ff8262"
    },
    sniper: {
      name: "SN-07 猎杀者",
      hp: 68,
      speed: 82,
      radius: 22,
      damage: 26,
      fireDelay: 3.35,
      range: 900,
      bulletSpeed: 720,
      preferred: 590,
      chargeTime: 0.78,
      tolerance: 0.045,
      spread: 0.008,
      turnRate: 2.1,
      circleBias: 0.4,
      leadFactor: 0.92,
      score: 280,
      dropChance: 0.24,
      accent: "#d7a2ff",
      body: "#2d2238",
      bulletColor: "#f0c6ff"
    },
    boss: {
      name: "TITAN-CLASS “IRON JAW”",
      hp: 820,
      speed: 57,
      radius: 47,
      damage: 22,
      fireDelay: 1.85,
      range: 780,
      bulletSpeed: 338,
      preferred: 365,
      chargeTime: 0.36,
      tolerance: 0.09,
      spread: 0.032,
      turnRate: 1.25,
      circleBias: 0.22,
      leadFactor: 0.6,
      score: 4000,
      dropChance: 1,
      accent: "#ff5742",
      body: "#301713",
      bulletColor: "#ff9d62"
    }
  };

  const BOSS_NAMES = [
    "“IRON JAW” 铁颚",
    "“WAR HOUND” 战犬",
    "“BLACK ANVIL” 黑砧",
    "“LAST JUDGE” 终审"
  ];

  const PICKUPS = {
    repair: {
      color: "#b9ff69",
      glow: "rgba(185, 255, 105, 0.55)",
      label: "装甲修复"
    },
    shield: {
      color: "#79e8e0",
      glow: "rgba(121, 232, 224, 0.5)",
      label: "能量护盾"
    },
    overdrive: {
      color: "#ff8a58",
      glow: "rgba(255, 138, 88, 0.55)",
      label: "火力过载"
    }
  };

  const WAVE_SUBTITLES = [
    "敌方装甲单位正在接近",
    "热信号确认 · 保持机动",
    "东侧阵线出现敌情",
    "侦测到履带震动",
    "敌方集群正在越过边界",
    "火炮已装填 · 准备接敌"
  ];

  // ---------- Utilities ----------

  const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, rate, dt) => b + (a - b) * Math.exp(-rate * dt);
  const rand = (min, max) => min + Math.random() * (max - min);
  const randInt = (min, max) => Math.floor(rand(min, max + 1));
  const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
  const normalizeAngle = (a) => {
    a = (a + Math.PI) % TAU;
    if (a < 0) a += TAU;
    return a - Math.PI;
  };
  const angleDelta = (a, b) => normalizeAngle(b - a);
  const turnToward = (angle, target, amount) => {
    const diff = normalizeAngle(target - angle);
    if (Math.abs(diff) <= amount) return target;
    return angle + Math.sign(diff) * amount;
  };
  const formatScore = (score) => String(Math.max(0, Math.floor(score))).padStart(6, "0");
  const padWave = (wave) => String(wave).padStart(2, "0");
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  function mulberry32(seed) {
    return function random() {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash(n) {
    const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return v - Math.floor(v);
  }

  function roundRectPath(c, x, y, w, h, radius) {
    const r = Math.min(radius, Math.abs(w) * 0.5, Math.abs(h) * 0.5);
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }

  function circleRectOverlap(x, y, radius, r) {
    const cx = clamp(x, r.x, r.x + r.w);
    const cy = clamp(y, r.y, r.y + r.h);
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= radius * radius;
  }

  function segmentRectT(x1, y1, x2, y2, rect) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    let tmin = 0;
    let tmax = 1;

    if (Math.abs(dx) < 1e-9) {
      if (x1 < rect.x || x1 > rect.x + rect.w) return null;
    } else {
      let t1 = (rect.x - x1) / dx;
      let t2 = (rect.x + rect.w - x1) / dx;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }

    if (Math.abs(dy) < 1e-9) {
      if (y1 < rect.y || y1 > rect.y + rect.h) return null;
    } else {
      let t1 = (rect.y - y1) / dy;
      let t2 = (rect.y + rect.h - y1) / dy;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }

    return tmin;
  }

  function segmentCircleT(x1, y1, x2, y2, cx, cy, radius) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const fx = x1 - cx;
    const fy = y1 - cy;
    const a = dx * dx + dy * dy;
    const c = fx * fx + fy * fy - radius * radius;

    if (a < 1e-9) return c <= 0 ? 0 : null;
    if (c <= 0) return 0;

    const b = 2 * (fx * dx + fy * dy);
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return null;

    const root = Math.sqrt(discriminant);
    const t1 = (-b - root) / (2 * a);
    const t2 = (-b + root) / (2 * a);
    if (t1 >= 0 && t1 <= 1) return t1;
    if (t2 >= 0 && t2 <= 1) return t2;
    return null;
  }

  function segmentBlocked(x1, y1, x2, y2, obstacles) {
    for (const obstacle of obstacles) {
      if (obstacle.hp <= 0) continue;
      if (segmentRectT(x1, y1, x2, y2, obstacle) !== null) return true;
    }
    return false;
  }

  // ---------- Save data ----------

  function loadSave() {
    const defaults = { bestScore: 0, bestWave: 0, muted: false };
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) return defaults;
      const data = JSON.parse(raw);
      return {
        bestScore: Number.isFinite(data.bestScore) ? Math.max(0, data.bestScore) : 0,
        bestWave: Number.isFinite(data.bestWave) ? Math.max(0, data.bestWave) : 0,
        muted: Boolean(data.muted)
      };
    } catch (error) {
      return defaults;
    }
  }

  let records = loadSave();

  function persistSave() {
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(records));
    } catch (error) {
      // Storage can be unavailable in private browsing contexts.
    }
  }

  // ---------- Audio ----------

  class SoundEngine {
    constructor(muted) {
      this.ctx = null;
      this.master = null;
      this.compressor = null;
      this.noiseBuffer = null;
      this.muted = muted;
    }

    ensure() {
      if (this.muted) return false;
      if (!this.ctx) {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) return false;
        this.ctx = new AudioCtor();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.34;
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -18;
        this.compressor.knee.value = 22;
        this.compressor.ratio.value = 6;
        this.compressor.attack.value = 0.004;
        this.compressor.release.value = 0.24;
        this.master.connect(this.compressor);
        this.compressor.connect(this.ctx.destination);

        const length = this.ctx.sampleRate;
        this.noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
      }
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
      return true;
    }

    setMuted(muted) {
      this.muted = muted;
      if (this.master && this.ctx) {
        this.master.gain.setTargetAtTime(muted ? 0 : 0.34, this.ctx.currentTime, 0.025);
      }
    }

    tone(type, from, to, duration, volume, delay = 0) {
      if (!this.ensure()) return;
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, from), now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), now + duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(now);
      osc.stop(now + duration + 0.03);
    }

    noise(duration, volume, from, to, type = "lowpass", q = 0.7, delay = 0) {
      if (!this.ensure()) return;
      const now = this.ctx.currentTime + delay;
      const source = this.ctx.createBufferSource();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      source.buffer = this.noiseBuffer;
      source.loop = true;
      filter.type = type;
      filter.Q.value = q;
      filter.frequency.setValueAtTime(Math.max(30, from), now);
      filter.frequency.exponentialRampToValueAtTime(Math.max(30, to), now + duration);
      gain.gain.setValueAtTime(Math.max(0.0002, volume), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);
      source.start(now);
      source.stop(now + duration + 0.03);
    }

    playerShot() {
      this.noise(0.075, 0.13, 2400, 540, "bandpass", 0.9);
      this.tone("triangle", 128, 55, 0.11, 0.1);
    }

    enemyShot(type) {
      if (type === "sniper") {
        this.noise(0.14, 0.1, 2400, 300, "bandpass", 1.2);
        this.tone("sawtooth", 155, 68, 0.17, 0.06);
        return;
      }
      const ratio = type === "boss" ? 0.65 : 1;
      this.noise(0.09, 0.07 * ratio, 1200, 280, "lowpass", 0.8);
      this.tone("square", 92, 46, 0.14, 0.045 * ratio);
    }

    impact() {
      this.tone("triangle", 510, 220, 0.055, 0.045);
      this.noise(0.04, 0.035, 3200, 1200, "highpass", 0.8);
    }

    shieldHit() {
      this.tone("sine", 520, 880, 0.13, 0.055);
      this.noise(0.09, 0.035, 1600, 5200, "highpass", 1);
    }

    explosion(scale = 1) {
      const s = clamp(scale, 0.5, 2.5);
      this.noise(0.36 * s, 0.2 * s, 1100, 65, "lowpass", 0.7);
      this.tone("sine", 92, 29, 0.42 * s, 0.13 * s);
    }

    pickup() {
      this.tone("sine", 620, 780, 0.1, 0.08);
      this.tone("sine", 930, 1180, 0.14, 0.055, 0.07);
    }

    dash() {
      this.noise(0.22, 0.11, 280, 1900, "bandpass", 1.8);
      this.tone("sine", 120, 75, 0.14, 0.05);
    }

    crateBreak() {
      this.noise(0.18, 0.1, 800, 180, "lowpass", 0.8);
      this.tone("triangle", 170, 85, 0.12, 0.05);
    }

    waveStart(isBoss) {
      this.tone("sine", isBoss ? 92 : 190, isBoss ? 72 : 220, 0.35, 0.06);
      this.tone("sine", isBoss ? 120 : 290, isBoss ? 88 : 320, 0.4, 0.045, 0.18);
      if (isBoss) {
        this.tone("sawtooth", 55, 42, 0.8, 0.05, 0.28);
      }
    }

    waveClear() {
      [520, 660, 880].forEach((freq, i) => {
        this.tone("sine", freq, freq * 1.03, 0.22, 0.055, i * 0.1);
      });
    }

    bossBurst() {
      this.noise(0.28, 0.16, 750, 120, "lowpass", 0.8);
      this.tone("sine", 78, 35, 0.35, 0.13);
    }

    spawnWarn(isBoss) {
      this.tone("sine", isBoss ? 58 : 115, isBoss ? 48 : 88, isBoss ? 0.55 : 0.14, isBoss ? 0.07 : 0.028);
    }

    ui() {
      this.tone("sine", 710, 880, 0.055, 0.035);
    }

    gameOver() {
      [260, 196, 146, 98].forEach((freq, index) => {
        this.tone("triangle", freq, freq * 0.88, 0.36, 0.07, index * 0.16);
      });
      this.noise(0.8, 0.09, 600, 55, "lowpass", 0.7);
    }
  }

  const audio = new SoundEngine(records.muted);

  // ---------- DOM references ----------

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const el = {
    damageFlash: document.getElementById("damageFlash"),
    lowHealthFx: document.getElementById("lowHealthFx"),
    hud: document.getElementById("hud"),
    waveValue: document.getElementById("waveValue"),
    enemyCount: document.getElementById("enemyCount"),
    scoreValue: document.getElementById("scoreValue"),
    pauseButton: document.getElementById("pauseButton"),
    bossHud: document.getElementById("bossHud"),
    bossHpText: document.getElementById("bossHpText"),
    bossBar: document.getElementById("bossBar"),
    bossName: document.getElementById("bossName"),
    comboHud: document.getElementById("comboHud"),
    comboValue: document.getElementById("comboValue"),
    comboTimer: document.getElementById("comboTimer"),
    hpText: document.getElementById("hpText"),
    healthBar: document.getElementById("healthBar"),
    shieldBar: document.getElementById("shieldBar"),
    dashMeter: document.getElementById("dashMeter"),
    dashBar: document.getElementById("dashBar"),
    buffLabel: document.getElementById("buffLabel"),
    waveBanner: document.getElementById("waveBanner"),
    bannerKicker: document.getElementById("bannerKicker"),
    bannerTitle: document.getElementById("bannerTitle"),
    bannerSub: document.getElementById("bannerSub"),
    startHint: document.getElementById("startHint"),
    menuScreen: document.getElementById("menuScreen"),
    pauseScreen: document.getElementById("pauseScreen"),
    gameOverScreen: document.getElementById("gameOverScreen"),
    startButton: document.getElementById("startButton"),
    resumeButton: document.getElementById("resumeButton"),
    pauseRestartButton: document.getElementById("pauseRestartButton"),
    pauseMenuButton: document.getElementById("pauseMenuButton"),
    restartButton: document.getElementById("restartButton"),
    menuButton: document.getElementById("menuButton"),
    recordTag: document.getElementById("recordTag"),
    finalScore: document.getElementById("finalScore"),
    finalWave: document.getElementById("finalWave"),
    finalKills: document.getElementById("finalKills"),
    finalCombo: document.getElementById("finalCombo"),
    finalBest: document.getElementById("finalBest"),
    pauseWave: document.getElementById("pauseWave"),
    pauseScore: document.getElementById("pauseScore"),
    bestScoreMenu: document.getElementById("bestScoreMenu"),
    bestWaveMenu: document.getElementById("bestWaveMenu"),
    touchDash: document.getElementById("touchDash"),
    touchDashLabel: document.getElementById("touchDashLabel"),
    moveStick: document.getElementById("moveStick"),
    aimStick: document.getElementById("aimStick"),
    soundToggles: Array.from(document.querySelectorAll(".js-sound-toggle"))
  };

  // ---------- Runtime state ----------

  let state = "menu";
  let game = null;
  let player = null;
  let menuClock = 0;
  let lastFrame = performance.now();
  let hintTimeout = null;

  const view = {
    w: window.innerWidth,
    h: window.innerHeight,
    dpr: 1,
    scale: 1,
    x: 0,
    y: 0
  };

  const input = {
    keys: new Set(),
    mouse: {
      active: false,
      down: false,
      inside: false,
      worldX: WORLD.w * 0.5,
      worldY: WORLD.h * 0.35
    },
    touch: {
      moveX: 0,
      moveY: 0,
      moveActive: false,
      aimAngle: -Math.PI / 2,
      aimActive: false,
      firing: false
    }
  };

  const menuHero = {
    x: 990,
    y: 480,
    r: 27,
    hullAngle: -0.48,
    turretAngle: -1.3,
    recoil: 0,
    trackPhase: 0,
    spawnAnim: 1
  };

  const menuWrecks = [
    { x: 520, y: 690, hullAngle: 0.4, turretAngle: 0.8, r: 22 },
    { x: 830, y: 350, hullAngle: -1.8, turretAngle: -2.2, r: 25 }
  ];

  let menuObstacles = [];
  let groundCanvas = null;

  // ---------- Resize / viewport ----------

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width || window.innerWidth);
    const height = Math.max(1, rect.height || window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    view.w = width;
    view.h = height;
    view.dpr = dpr;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    view.scale = Math.min(width / WORLD.w, height / WORLD.h) * 0.985;
    view.x = (width - WORLD.w * view.scale) * 0.5;
    view.y = (height - WORLD.h * view.scale) * 0.5;
  }

  // ---------- Input helpers ----------

  function isTouchDevice() {
    return document.body.dataset.touch === "true";
  }

  function updateMouseWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    input.mouse.worldX = (clientX - rect.left - view.x) / view.scale;
    input.mouse.worldY = (clientY - rect.top - view.y) / view.scale;
  }

  function getMoveVector() {
    let x = 0;
    let y = 0;

    if (input.keys.has("KeyW") || input.keys.has("ArrowUp")) y -= 1;
    if (input.keys.has("KeyS") || input.keys.has("ArrowDown")) y += 1;
    if (input.keys.has("KeyA") || input.keys.has("ArrowLeft")) x -= 1;
    if (input.keys.has("KeyD") || input.keys.has("ArrowRight")) x += 1;

    if (input.touch.moveActive) {
      x += input.touch.moveX;
      y += input.touch.moveY;
    }

    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    return { x, y, length: Math.min(1, length) };
  }

  function getAimPoint() {
    if (!player) return { x: WORLD.w * 0.5, y: WORLD.h * 0.3 };
    if (isTouchDevice()) {
      return {
        x: player.x + Math.cos(input.touch.aimAngle) * 280,
        y: player.y + Math.sin(input.touch.aimAngle) * 280
      };
    }
    if (input.mouse.active) {
      return { x: input.mouse.worldX, y: input.mouse.worldY };
    }
    return {
      x: player.x + Math.cos(player.turretAngle) * 280,
      y: player.y + Math.sin(player.turretAngle) * 280
    };
  }

  function isFiring() {
    if (state !== "playing" || !player || !player.alive) return false;
    return input.mouse.down || input.keys.has("Space") || input.touch.firing;
  }

  function triggerDash() {
    if (state !== "playing" || !player || !player.alive) return;
    if (player.dashCooldown > 0 || player.dashTime > 0) return;

    const move = getMoveVector();
    const angle = move.length > 0.08 ? Math.atan2(move.y, move.x) : player.hullAngle;
    player.dashAngle = angle;
    player.dashTime = PLAYER.dashDuration;
    player.dashCooldown = PLAYER.dashCooldown;
    player.invuln = Math.max(player.invuln, 0.24);
    game.shake = Math.max(game.shake, 5);

    for (let i = 0; i < 16; i += 1) {
      const a = angle + Math.PI + rand(-0.65, 0.65);
      const speed = rand(35, 170);
      addParticle({
        x: player.x + Math.cos(angle) * rand(-15, 15),
        y: player.y + Math.sin(angle) * rand(-15, 15),
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: rand(0.25, 0.58),
        size: rand(1, 3.5),
        color: "#d8ff58",
        type: "spark",
        drag: 0.9
      });
    }

    audio.dash();
  }

  // ---------- Game model ----------

  function createPlayer() {
    return {
      x: 720,
      y: 760,
      r: PLAYER.radius,
      vx: 0,
      vy: 0,
      maxHp: PLAYER.maxHp,
      hp: PLAYER.maxHp,
      shield: 0,
      hullAngle: -Math.PI / 2,
      turretAngle: -Math.PI / 2,
      fireCooldown: 0,
      fireDelay: PLAYER.fireDelay,
      recoil: 0,
      dashTime: 0,
      dashCooldown: 0,
      dashAngle: -Math.PI / 2,
      invuln: 1.6,
      overdrive: 0,
      trackPhase: 0,
      alive: true,
      hitFlash: 0,
      dustTimer: 0
    };
  }

  function createObstacleList() {
    const list = [];
    WALL_LAYOUT.forEach((wall, index) => {
      list.push({
        ...wall,
        kind: "concrete",
        seed: index + 1,
        hp: Infinity,
        maxHp: Infinity
      });
    });
    CRATE_LAYOUT.forEach((crate, index) => {
      list.push({
        ...crate,
        kind: "crate",
        seed: index + 33,
        hp: 35,
        maxHp: 35
      });
    });
    return list;
  }

  function getEnemyStats(type, wave) {
    const base = ENEMY_TYPES[type];
    const hpScale = 1 + Math.max(0, wave - 1) * 0.12;
    const damageScale = 1 + Math.max(0, wave - 1) * 0.045;
    const speedScale = 1 + Math.min(0.24, Math.max(0, wave - 1) * 0.012);
    return {
      ...base,
      hp: Math.round(base.hp * hpScale),
      damage: Math.round(base.damage * damageScale),
      speed: base.speed * speedScale,
      score: Math.round(base.score * (1 + Math.max(0, wave - 1) * 0.045))
    };
  }

  function createEnemy(type, x, y, wave) {
    const stats = getEnemyStats(type, wave);
    const angleToPlayer = player
      ? Math.atan2(player.y - y, player.x - x)
      : Math.PI / 2;

    return {
      type,
      name: type === "boss"
        ? `TITAN-CLASS ${BOSS_NAMES[Math.floor(wave / 5 - 1) % BOSS_NAMES.length]}`
        : stats.name,
      x,
      y,
      r: stats.radius,
      vx: 0,
      vy: 0,
      hp: stats.hp,
      maxHp: stats.hp,
      speed: stats.speed,
      damage: stats.damage,
      fireDelay: stats.fireDelay,
      fireRange: stats.range,
      bulletSpeed: stats.bulletSpeed,
      preferred: stats.preferred,
      chargeTime: stats.chargeTime,
      tolerance: stats.tolerance,
      spread: stats.spread,
      turnRate: stats.turnRate,
      circleBias: stats.circleBias,
      leadFactor: stats.leadFactor,
      score: stats.score,
      dropChance: stats.dropChance,
      accent: stats.accent,
      body: stats.body,
      bulletColor: stats.bulletColor,
      isBoss: type === "boss",
      hullAngle: angleToPlayer,
      turretAngle: angleToPlayer,
      strafe: Math.random() < 0.5 ? -1 : 1,
      strafeTimer: rand(1, 2.5),
      fireTimer: rand(0.9, 1.8),
      charge: 0,
      hitFlash: 0,
      trackPhase: Math.random(),
      spawnAnim: 0,
      dead: false,
      specialTimer: type === "boss" ? 4.2 : Infinity,
      specialWindup: 0,
      stuckTimer: 0,
      lastX: x,
      lastY: y
    };
  }

  function buildWaveQueue(wave) {
    const queue = [];
    const isBossWave = wave % 5 === 0;

    if (isBossWave) {
      queue.push("boss");
      const adds = Math.min(4, 2 + Math.floor(wave / 10));
      for (let i = 0; i < adds; i += 1) {
        queue.push(i % 3 === 2 ? "gunner" : "raider");
      }
      return queue;
    }

    let raiders = 2 + Math.floor((wave + 1) / 2);
    let gunners = wave >= 2 ? 1 + Math.floor((wave - 2) / 2) : 0;
    let heavies = wave >= 3 ? 1 + Math.floor((wave - 3) / 3) : 0;
    let snipers = wave >= 4 ? 1 + Math.floor((wave - 4) / 3) : 0;

    raiders = Math.min(raiders, 7);
    gunners = Math.min(gunners, 4);
    heavies = Math.min(heavies, 3);
    snipers = Math.min(snipers, 2);

    for (let i = 0; i < raiders; i += 1) queue.push("raider");
    for (let i = 0; i < gunners; i += 1) queue.push("gunner");
    for (let i = 0; i < heavies; i += 1) queue.push("heavy");
    for (let i = 0; i < snipers; i += 1) queue.push("sniper");

    while (queue.length > 12) queue.pop();

    // Fisher-Yates keeps every wave composition a little unpredictable.
    for (let i = queue.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }

    return queue;
  }

  function newGame() {
    player = createPlayer();
    game = {
      time: 0,
      score: 0,
      wave: 1,
      phase: "deploy",
      phaseTimer: 1.2,
      waveQueue: [],
      spawnTimer: 0,
      maxAlive: 5,
      enemies: [],
      spawnEffects: [],
      bullets: [],
      particles: [],
      decals: [],
      pickups: [],
      wrecks: [],
      obstacles: createObstacleList(),
      combo: 0,
      comboTimer: 0,
      maxCombo: 0,
      kills: 0,
      shake: 0,
      hitFlash: 0,
      hitMarker: 0,
      deathTimer: 0,
      spawnSerial: 0
    };
    document.body.classList.remove("low-health");
    el.damageFlash.style.opacity = "0";
    beginWave(1);
    updateHud();
  }

  function beginWave(wave) {
    if (!game) return;
    const isBossWave = wave % 5 === 0;
    game.wave = wave;
    game.phase = "deploy";
    game.phaseTimer = isBossWave ? 1.55 : 1.2;
    game.waveQueue = buildWaveQueue(wave);
    game.maxAlive = isBossWave ? 4 : wave >= 6 ? 6 : 5;
    game.spawnTimer = 0.2;

    el.waveValue.textContent = padWave(wave);

    const subtitle = isBossWave
      ? "TITAN 级重装单位正在进入战区"
      : WAVE_SUBTITLES[Math.floor(Math.random() * WAVE_SUBTITLES.length)];

    showBanner(
      isBossWave ? "HEAVY SIGNATURE / 重装信号" : "INCOMING HOSTILES / 敌袭警报",
      `WAVE ${padWave(wave)}`,
      subtitle,
      isBossWave
    );
    audio.waveStart(isBossWave);
  }

  function completeWave() {
    if (!game || game.phase !== "combat") return;
    const bonus = game.wave * 100;
    game.phase = "clear";
    game.phaseTimer = 3.35;
    game.score += bonus;

    showBanner(
      "SECTOR SECURED / 区域肃清",
      `WAVE ${padWave(game.wave)} CLEAR`,
      `+${bonus} FIELD BONUS · 补给已投放，下一波正在接近`,
      false
    );
    spawnPickupNearPlayer();
    audio.waveClear();
    updateHud();
  }

  function spawnPickupNearPlayer() {
    if (!player) return;
    const angle = rand(0, TAU);
    const distance = rand(100, 210);
    let x = player.x + Math.cos(angle) * distance;
    let y = player.y + Math.sin(angle) * distance;
    x = clamp(x, BOUNDS.left + 35, BOUNDS.right - 35);
    y = clamp(y, BOUNDS.top + 35, BOUNDS.bottom - 35);

    for (let attempt = 0; attempt < 16; attempt += 1) {
      if (!positionBlocked(x, y, 16)) break;
      const a = rand(0, TAU);
      const d = rand(110, 260);
      x = clamp(player.x + Math.cos(a) * d, BOUNDS.left + 40, BOUNDS.right - 40);
      y = clamp(player.y + Math.sin(a) * d, BOUNDS.top + 40, BOUNDS.bottom - 40);
    }

    spawnPickup(x, y, choosePickupType());
  }

  function choosePickupType() {
    const roll = Math.random();
    if (player && player.hp < 45 && roll < 0.55) return "repair";
    if (roll < 0.36) return "repair";
    if (roll < 0.7) return "shield";
    return "overdrive";
  }

  function spawnPickup(x, y, type) {
    if (!game) return;
    game.pickups.push({
      x,
      y,
      type,
      life: 17,
      phase: rand(0, TAU),
      radius: 16
    });
  }

  function scheduleEnemySpawn(type) {
    if (!game) return;
    const isBoss = type === "boss";
    let candidates = SPAWN_POINTS.filter((point) => {
      if (!player) return true;
      return dist(point.x, point.y, player.x, player.y) > (isBoss ? 430 : 300);
    });
    if (!candidates.length) candidates = SPAWN_POINTS;

    let point = candidates[Math.floor(Math.random() * candidates.length)];
    for (let attempt = 0; attempt < 7; attempt += 1) {
      const test = candidates[Math.floor(Math.random() * candidates.length)];
      const occupied = game.spawnEffects.some(
        (effect) => dist(effect.x, effect.y, test.x, test.y) < 120
      );
      if (!occupied) {
        point = test;
        break;
      }
    }

    game.spawnEffects.push({
      x: point.x,
      y: point.y,
      type,
      timer: isBoss ? 1.65 : 1.05,
      max: isBoss ? 1.65 : 1.05,
      seed: Math.random() * 100
    });
    game.spawnSerial += 1;
    audio.spawnWarn(isBoss);
  }

  function spawnEnemyFromEffect(effect) {
    if (!game || !player) return;
    const enemy = createEnemy(effect.type, effect.x, effect.y, game.wave);
    game.enemies.push(enemy);
    game.shake = Math.max(game.shake, effect.type === "boss" ? 10 : 2.5);

    for (let i = 0; i < (effect.type === "boss" ? 32 : 12); i += 1) {
      const angle = rand(0, TAU);
      const speed = rand(20, 130);
      addParticle({
        x: effect.x,
        y: effect.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(0.25, 0.8),
        size: rand(1, 3.5),
        color: enemy.accent,
        type: "spark",
        drag: 0.9
      });
    }

    if (effect.type === "boss") {
      el.bossName.textContent = enemy.name;
      showBanner("TITAN SIGNATURE / 重装单位", "IRON JAW", "击穿装甲核心，摧毁重装单位", true);
    }
  }

  // ---------- Player physics ----------

  function positionBlocked(x, y, radius) {
    if (!game) return false;
    if (x - radius < BOUNDS.left || x + radius > BOUNDS.right) return true;
    if (y - radius < BOUNDS.top || y + radius > BOUNDS.bottom) return true;
    for (const obstacle of game.obstacles) {
      if (obstacle.hp <= 0) continue;
      if (circleRectOverlap(x, y, radius, obstacle)) return true;
    }
    return false;
  }

  function moveTankEntity(entity, dt) {
    const nextX = entity.x + entity.vx * dt;
    if (!positionBlocked(nextX, entity.y, entity.r)) {
      entity.x = nextX;
    } else {
      entity.x = clamp(entity.x, BOUNDS.left + entity.r, BOUNDS.right - entity.r);
      entity.vx *= -0.08;
    }

    const nextY = entity.y + entity.vy * dt;
    if (!positionBlocked(entity.x, nextY, entity.r)) {
      entity.y = nextY;
    } else {
      entity.y = clamp(entity.y, BOUNDS.top + entity.r, BOUNDS.bottom - entity.r);
      entity.vy *= -0.08;
    }
  }

  function updatePlayer(dt) {
    if (!player || !player.alive) return;

    player.fireCooldown = Math.max(0, player.fireCooldown - dt);
    player.dashCooldown = Math.max(0, player.dashCooldown - dt);
    player.invuln = Math.max(0, player.invuln - dt);
    player.overdrive = Math.max(0, player.overdrive - dt);
    player.fireDelay = player.overdrive > 0 ? 0.092 : PLAYER.fireDelay;
    player.recoil = Math.max(0, player.recoil - dt * 8.5);
    player.hitFlash = Math.max(0, player.hitFlash - dt);

    const move = getMoveVector();
    const isDashing = player.dashTime > 0;

    if (isDashing) {
      player.dashTime = Math.max(0, player.dashTime - dt);
      const strength = 0.58 + (player.dashTime / PLAYER.dashDuration) * 0.42;
      player.vx = Math.cos(player.dashAngle) * 620 * strength;
      player.vy = Math.sin(player.dashAngle) * 620 * strength;
      player.dustTimer -= dt;
      if (player.dustTimer <= 0) {
        player.dustTimer = 0.025;
        addParticle({
          x: player.x - Math.cos(player.dashAngle) * 17 + rand(-8, 8),
          y: player.y - Math.sin(player.dashAngle) * 17 + rand(-8, 8),
          vx: rand(-18, 18),
          vy: rand(-18, 18),
          life: rand(0.25, 0.5),
          size: rand(3, 7),
          color: "rgba(160, 174, 136, 0.34)",
          type: "smoke",
          drag: 0.9
        });
      }
    } else {
      const speed = PLAYER.speed * (player.overdrive > 0 ? 1.05 : 1);
      const targetVx = move.x * speed;
      const targetVy = move.y * speed;
      const responsiveness = move.length > 0.05 ? 9.5 : 6.2;
      player.vx = damp(player.vx, targetVx, responsiveness, dt);
      player.vy = damp(player.vy, targetVy, responsiveness, dt);
    }

    moveTankEntity(player, dt);

    const movementSpeed = Math.hypot(player.vx, player.vy);
    if (movementSpeed > 14) {
      player.hullAngle = turnToward(player.hullAngle, Math.atan2(player.vy, player.vx), dt * 10);
      player.trackPhase += dt * movementSpeed * 0.032;
    }

    const aim = getAimPoint();
    player.turretAngle = Math.atan2(aim.y - player.y, aim.x - player.x);

    if (isFiring() && player.fireCooldown <= 0) {
      firePlayer();
    }

    if (!isDashing && movementSpeed > 45) {
      player.dustTimer -= dt;
      if (player.dustTimer <= 0) {
        player.dustTimer = 0.11;
        addParticle({
          x: player.x - Math.cos(player.hullAngle) * 17 + rand(-4, 4),
          y: player.y - Math.sin(player.hullAngle) * 17 + rand(-4, 4),
          vx: rand(-8, 8),
          vy: rand(-8, 8),
          life: rand(0.3, 0.6),
          size: rand(2.5, 6),
          color: "rgba(168, 180, 143, 0.22)",
          type: "smoke",
          drag: 0.9
        });
      }
    }
  }

  function firePlayer() {
    if (!player || !player.alive || !game) return;
    const overdrive = player.overdrive > 0;
    const angle = player.turretAngle + rand(-0.012, 0.012);
    const muzzleDistance = player.r * 1.65;
    const muzzleX = player.x + Math.cos(angle) * muzzleDistance;
    const muzzleY = player.y + Math.sin(angle) * muzzleDistance;

    game.bullets.push({
      owner: "player",
      x: muzzleX,
      y: muzzleY,
      prevX: muzzleX,
      prevY: muzzleY,
      vx: Math.cos(angle) * 880,
      vy: Math.sin(angle) * 880,
      radius: overdrive ? 5 : 4.2,
      damage: 32,
      life: 1.9,
      color: overdrive ? "#fff3a8" : "#e8ff94",
      coreColor: "#fffbe3",
      tailLength: overdrive ? 25 : 18,
      impact: "player"
    });

    player.fireCooldown = overdrive ? 0.092 : PLAYER.fireDelay;
    player.fireDelay = overdrive ? 0.092 : PLAYER.fireDelay;
    player.recoil = 1;
    game.hitMarker = 0;
    game.shake = Math.max(game.shake, 1.6);

    for (let i = 0; i < 7; i += 1) {
      const a = angle + rand(-0.35, 0.35);
      const speed = rand(45, 210);
      addParticle({
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(a) * speed + player.vx * 0.2,
        vy: Math.sin(a) * speed + player.vy * 0.2,
        life: rand(0.08, 0.24),
        size: rand(1, 3),
        color: i < 3 ? "#fffbd4" : "#d8ff58",
        type: "spark",
        drag: 0.88
      });
    }
    addParticle({
      x: muzzleX,
      y: muzzleY,
      vx: Math.cos(angle) * 20,
      vy: Math.sin(angle) * 20,
      life: 0.16,
      size: 19,
      color: "rgba(255, 246, 188, 0.32)",
      type: "smoke",
      drag: 0.85
    });

    audio.playerShot();
  }

  // ---------- Wave management ----------

  function updateSpawnEffects(dt) {
    if (!game) return;
    for (const effect of game.spawnEffects) {
      effect.timer -= dt;
    }

    const completed = game.spawnEffects.filter((effect) => effect.timer <= 0);
    if (completed.length) {
      game.spawnEffects = game.spawnEffects.filter((effect) => effect.timer > 0);
      for (const effect of completed) spawnEnemyFromEffect(effect);
    }
  }

  function updateWave(dt) {
    if (!game) return;

    updateSpawnEffects(dt);

    if (game.phase === "deploy") {
      game.phaseTimer -= dt;
      if (game.phaseTimer <= 0) {
        game.phase = "combat";
        game.spawnTimer = 0.25;
      }
      return;
    }

    if (game.phase === "combat") {
      game.spawnTimer -= dt;
      const pendingCount = game.enemies.length + game.spawnEffects.length;
      if (
        game.waveQueue.length > 0 &&
        game.spawnTimer <= 0 &&
        pendingCount < game.maxAlive
      ) {
        const type = game.waveQueue.shift();
        scheduleEnemySpawn(type);
        const baseGap = Math.max(0.62, 1.08 - game.wave * 0.025);
        game.spawnTimer = baseGap * rand(0.8, 1.25);
      }

      if (
        game.waveQueue.length === 0 &&
        game.spawnEffects.length === 0 &&
        game.enemies.length === 0
      ) {
        completeWave();
      }
      return;
    }

    if (game.phase === "clear") {
      game.phaseTimer -= dt;
      if (game.phaseTimer <= 0) {
        beginWave(game.wave + 1);
      }
    }
  }

  // ---------- Enemy AI ----------

  function avoidObstacles(enemy) {
    let avoidX = 0;
    let avoidY = 0;
    const influence = enemy.r + 84;

    for (const obstacle of game.obstacles) {
      if (obstacle.hp <= 0) continue;
      const closestX = clamp(enemy.x, obstacle.x, obstacle.x + obstacle.w);
      const closestY = clamp(enemy.y, obstacle.y, obstacle.y + obstacle.h);
      const dx = enemy.x - closestX;
      const dy = enemy.y - closestY;
      const distance = Math.hypot(dx, dy);
      if (distance > 0.001 && distance < influence) {
        const strength = 1 - distance / influence;
        avoidX += (dx / distance) * strength * 2.3;
        avoidY += (dy / distance) * strength * 2.3;
      }
    }

    const margin = 105;
    if (enemy.x < BOUNDS.left + margin) avoidX += (1 - (enemy.x - BOUNDS.left) / margin) * 2;
    if (enemy.x > BOUNDS.right - margin) avoidX -= (1 - (BOUNDS.right - enemy.x) / margin) * 2;
    if (enemy.y < BOUNDS.top + margin) avoidY += (1 - (enemy.y - BOUNDS.top) / margin) * 2;
    if (enemy.y > BOUNDS.bottom - margin) avoidY -= (1 - (BOUNDS.bottom - enemy.y) / margin) * 2;

    return { x: avoidX, y: avoidY };
  }

  function updateEnemy(enemy, dt) {
    if (enemy.dead || !player) return;

    enemy.spawnAnim = Math.min(1, enemy.spawnAnim + dt * 4.2);
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
    enemy.fireTimer -= dt;
    enemy.strafeTimer -= dt;
    if (enemy.strafeTimer <= 0) {
      enemy.strafe *= -1;
      enemy.strafeTimer = rand(1.2, 3);
    }

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const towardX = dx / distance;
    const towardY = dy / distance;

    let desiredX = 0;
    let desiredY = 0;
    if (distance > enemy.preferred + 65) {
      desiredX += towardX;
      desiredY += towardY;
    } else if (distance < enemy.preferred - 55) {
      desiredX -= towardX * 0.85;
      desiredY -= towardY * 0.85;
    }

    const tangentX = -towardY * enemy.strafe;
    const tangentY = towardX * enemy.strafe;
    desiredX += tangentX * enemy.circleBias;
    desiredY += tangentY * enemy.circleBias;

    const hasSight = !segmentBlocked(enemy.x, enemy.y, player.x, player.y, game.obstacles);
    if (!hasSight && distance > 180) {
      desiredX += towardX * 0.8;
      desiredY += towardY * 0.8;
    }

    const avoid = avoidObstacles(enemy);
    desiredX += avoid.x;
    desiredY += avoid.y;

    const desiredLength = Math.hypot(desiredX, desiredY);
    if (desiredLength > 0.001) {
      desiredX /= desiredLength;
      desiredY /= desiredLength;
    }

    const speedFactor = enemy.spawnAnim < 0.7 ? enemy.spawnAnim / 0.7 : 1;
    const targetVx = desiredX * enemy.speed * speedFactor;
    const targetVy = desiredY * enemy.speed * speedFactor;
    enemy.vx = damp(enemy.vx, targetVx, 4.2, dt);
    enemy.vy = damp(enemy.vy, targetVy, 4.2, dt);

    const beforeX = enemy.x;
    const beforeY = enemy.y;
    moveTankEntity(enemy, dt);
    const moved = Math.hypot(enemy.x - beforeX, enemy.y - beforeY);

    if (desiredLength > 0.2 && moved < 0.15) {
      enemy.stuckTimer += dt;
      if (enemy.stuckTimer > 0.55) {
        enemy.strafe *= -1;
        enemy.strafeTimer = rand(1.4, 2.8);
        enemy.stuckTimer = 0;
      }
    } else {
      enemy.stuckTimer = Math.max(0, enemy.stuckTimer - dt);
    }

    const enemySpeed = Math.hypot(enemy.vx, enemy.vy);
    if (enemySpeed > 9) {
      enemy.hullAngle = turnToward(enemy.hullAngle, Math.atan2(enemy.vy, enemy.vx), dt * 4.2);
      enemy.trackPhase += dt * enemySpeed * 0.026;
    }

    const lead = clamp(distance / enemy.bulletSpeed, 0, 1.2);
    const predictedX = player.x + player.vx * lead * enemy.leadFactor;
    const predictedY = player.y + player.vy * lead * enemy.leadFactor;
    const targetAngle = Math.atan2(predictedY - enemy.y, predictedX - enemy.x);
    enemy.turretAngle = turnToward(enemy.turretAngle, targetAngle, dt * enemy.turnRate);

    const aimError = Math.abs(angleDelta(enemy.turretAngle, targetAngle));
    const canCharge = (
      enemy.spawnAnim > 0.72 &&
      enemy.fireTimer <= 0 &&
      distance < enemy.fireRange &&
      hasSight &&
      aimError < enemy.tolerance
    );

    if (canCharge) {
      enemy.charge += dt;
      if (enemy.charge >= enemy.chargeTime) {
        fireEnemy(enemy);
        enemy.charge = 0;
        enemy.fireTimer = enemy.fireDelay * rand(0.84, 1.22);
      }
    } else {
      enemy.charge = Math.max(0, enemy.charge - dt * 2.4);
    }

    if (enemy.isBoss) {
      enemy.specialTimer -= dt;
      if (enemy.specialWindup > 0) {
        enemy.specialWindup -= dt;
        if (enemy.specialWindup <= 0 && player.alive) {
          fireBossBurst(enemy);
          enemy.specialTimer = rand(4.5, 6);
        }
      } else if (enemy.specialTimer <= 0 && enemy.spawnAnim > 0.8) {
        enemy.specialWindup = 0.9;
      }
    }
  }

  function fireEnemy(enemy) {
    if (!player || !game || enemy.dead) return;
    const angle = enemy.turretAngle + rand(-enemy.spread, enemy.spread);
    const muzzleDistance = enemy.r * (enemy.isBoss ? 1.65 : 1.55);
    const x = enemy.x + Math.cos(angle) * muzzleDistance;
    const y = enemy.y + Math.sin(angle) * muzzleDistance;

    game.bullets.push({
      owner: "enemy",
      x,
      y,
      prevX: x,
      prevY: y,
      vx: Math.cos(angle) * enemy.bulletSpeed,
      vy: Math.sin(angle) * enemy.bulletSpeed,
      radius: enemy.type === "sniper" ? 3.4 : enemy.isBoss ? 6 : 4.6,
      damage: enemy.damage,
      life: 3,
      color: enemy.bulletColor,
      coreColor: "#ffe9c7",
      tailLength: enemy.type === "sniper" ? 32 : enemy.isBoss ? 24 : 13,
      impact: "enemy",
      heavy: enemy.isBoss || enemy.type === "heavy"
    });

    for (let i = 0; i < (enemy.isBoss ? 10 : 4); i += 1) {
      const a = angle + rand(-0.3, 0.3);
      const speed = rand(30, 130);
      addParticle({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: rand(0.08, 0.25),
        size: rand(1, 3),
        color: enemy.bulletColor,
        type: "spark",
        drag: 0.9
      });
    }

    audio.enemyShot(enemy.type);
  }

  function fireBossBurst(enemy) {
    if (!game || !player) return;
    const count = 14;
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * TAU + 0.12;
      const x = enemy.x + Math.cos(angle) * enemy.r * 1.25;
      const y = enemy.y + Math.sin(angle) * enemy.r * 1.25;
      game.bullets.push({
        owner: "enemy",
        x,
        y,
        prevX: x,
        prevY: y,
        vx: Math.cos(angle) * 242,
        vy: Math.sin(angle) * 242,
        radius: 5,
        damage: 14,
        life: 3.2,
        color: "#ff9f62",
        coreColor: "#ffe5b5",
        tailLength: 18,
        impact: "enemy",
        heavy: true
      });
    }

    for (let i = 0; i < 24; i += 1) {
      const angle = rand(0, TAU);
      const speed = rand(40, 220);
      addParticle({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(0.18, 0.55),
        size: rand(1.2, 4),
        color: "#ff9c5d",
        type: "spark",
        drag: 0.87
      });
    }
    game.shake = Math.max(game.shake, 12);
    audio.bossBurst();
  }

  function separateTanks() {
    if (!game || !player) return;
    const tanks = game.enemies;

    for (let i = 0; i < tanks.length; i += 1) {
      const a = tanks[i];
      if (a.dead) continue;

      // Keep enemies from stacking on top of each other.
      for (let j = i + 1; j < tanks.length; j += 1) {
        const b = tanks[j];
        if (b.dead) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        const min = a.r + b.r + 2;
        if (d > 0.001 && d < min) {
          const overlap = (min - d) * 0.5;
          const nx = dx / d;
          const ny = dy / d;
          if (!positionBlocked(a.x - nx * overlap, a.y - ny * overlap, a.r)) {
            a.x -= nx * overlap;
            a.y -= ny * overlap;
          }
          if (!positionBlocked(b.x + nx * overlap, b.y + ny * overlap, b.r)) {
            b.x += nx * overlap;
            b.y += ny * overlap;
          }
        }
      }

      // The player is heavier and can body-block enemies.
      const dx = a.x - player.x;
      const dy = a.y - player.y;
      const d = Math.hypot(dx, dy);
      const min = a.r + player.r + 1;
      if (d > 0.001 && d < min) {
        const overlap = min - d;
        const nx = dx / d;
        const ny = dy / d;
        const enemyShare = a.isBoss ? 0.25 : 0.7;
        const playerShare = 1 - enemyShare;
        if (!positionBlocked(a.x + nx * overlap * enemyShare, a.y + ny * overlap * enemyShare, a.r)) {
          a.x += nx * overlap * enemyShare;
          a.y += ny * overlap * enemyShare;
        }
        if (!positionBlocked(player.x - nx * overlap * playerShare, player.y - ny * overlap * playerShare, player.r)) {
          player.x -= nx * overlap * playerShare;
          player.y -= ny * overlap * playerShare;
        }
      }
    }
  }

  // ---------- Bullets & damage ----------

  function updateBullets(dt) {
    if (!game || !player) return;

    for (const bullet of game.bullets) {
      if (bullet.dead) continue;
      bullet.prevX = bullet.x;
      bullet.prevY = bullet.y;
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      bullet.life -= dt;

      if (
        bullet.life <= 0 ||
        bullet.x < -100 ||
        bullet.x > WORLD.w + 100 ||
        bullet.y < -100 ||
        bullet.y > WORLD.h + 100
      ) {
        bullet.dead = true;
        continue;
      }

      let closestT = 2;
      let obstacleHit = null;
      let enemyHit = null;
      let hitPlayer = false;

      for (const obstacle of game.obstacles) {
        if (obstacle.hp <= 0) continue;
        const t = segmentRectT(
          bullet.prevX,
          bullet.prevY,
          bullet.x,
          bullet.y,
          obstacle
        );
        if (t !== null && t < closestT) {
          closestT = t;
          obstacleHit = obstacle;
          enemyHit = null;
          hitPlayer = false;
        }
      }

      if (bullet.owner === "player") {
        for (const enemy of game.enemies) {
          if (enemy.dead) continue;
          const t = segmentCircleT(
            bullet.prevX,
            bullet.prevY,
            bullet.x,
            bullet.y,
            enemy.x,
            enemy.y,
            enemy.r + 1
          );
          if (t !== null && t < closestT) {
            closestT = t;
            enemyHit = enemy;
            obstacleHit = null;
            hitPlayer = false;
          }
        }
      } else if (player.alive && player.invuln <= 0) {
        const t = segmentCircleT(
          bullet.prevX,
          bullet.prevY,
          bullet.x,
          bullet.y,
          player.x,
          player.y,
          player.r * 0.88
        );
        if (t !== null && t < closestT) {
          closestT = t;
          hitPlayer = true;
          enemyHit = null;
          obstacleHit = null;
        }
      }

      if (closestT > 1) continue;

      const hitX = lerp(bullet.prevX, bullet.x, clamp(closestT, 0, 1));
      const hitY = lerp(bullet.prevY, bullet.y, clamp(closestT, 0, 1));

      if (obstacleHit) {
        bullet.dead = true;
        if (obstacleHit.kind === "crate") {
          damageCrate(obstacleHit, bullet.owner === "player" ? 35 : 20, hitX, hitY);
        } else {
          spawnSparks(hitX, hitY, "#ffe1a3", 7, 150);
          addParticle({
            x: hitX,
            y: hitY,
            vx: rand(-20, 20),
            vy: rand(-20, 20),
            life: 0.2,
            size: 5,
            color: "rgba(206, 187, 148, 0.28)",
            type: "smoke",
            drag: 0.85
          });
          audio.impact();
        }
        continue;
      }

      if (enemyHit) {
        bullet.dead = true;
        damageEnemy(enemyHit, bullet.damage, hitX, hitY);
        game.hitMarker = 0.11;
        continue;
      }

      if (hitPlayer) {
        bullet.dead = true;
        damagePlayer(bullet.damage);
      }
    }

    game.bullets = game.bullets.filter((bullet) => !bullet.dead);
    game.enemies = game.enemies.filter((enemy) => !enemy.dead);
    game.spawnEffects = game.spawnEffects.filter((effect) => effect.timer > 0);
  }

  function damageEnemy(enemy, amount, x, y) {
    if (!game || enemy.dead) return;
    enemy.hp -= amount;
    enemy.hitFlash = 0.11;
    game.shake = Math.max(game.shake, enemy.isBoss ? 4.5 : 2.2);
    spawnSparks(x, y, enemy.accent, enemy.isBoss ? 12 : 6, 170);
    audio.impact();

    if (enemy.hp <= 0) killEnemy(enemy);
  }

  function killEnemy(enemy) {
    if (!game || enemy.dead) return;
    enemy.dead = true;

    game.comboTimer = 3.05;
    game.combo += 1;
    game.maxCombo = Math.max(game.maxCombo, game.combo);
    game.kills += 1;

    const multiplier = getComboMultiplier();
    const gained = Math.round(enemy.score * multiplier);
    game.score += gained;

    addWreck(enemy.x, enemy.y, enemy.hullAngle, enemy.r, enemy.type);
    addExplosion(enemy.x, enemy.y, enemy.isBoss ? 2.6 : 1.15, enemy.accent);
    addFloatingText(enemy.x, enemy.y - enemy.r - 14, `+${gained}`, "#e8ff9c");
    addDecal(enemy.x, enemy.y, enemy.isBoss ? 95 : rand(30, 46));

    if (enemy.isBoss) {
      game.shake = 28;
      game.hitFlash = 0.42;
      for (let i = 0; i < 4; i += 1) {
        addExplosion(
          enemy.x + rand(-66, 66),
          enemy.y + rand(-66, 66),
          rand(1, 1.8),
          "#ff9258"
        );
      }
      const drops = 3;
      for (let i = 0; i < drops; i += 1) {
        const a = rand(0, TAU);
        spawnPickup(
          clamp(enemy.x + Math.cos(a) * rand(45, 105), BOUNDS.left + 30, BOUNDS.right - 30),
          clamp(enemy.y + Math.sin(a) * rand(45, 105), BOUNDS.top + 30, BOUNDS.bottom - 30),
          i === 0 ? "repair" : choosePickupType()
        );
      }
      showBanner("TARGET DESTROYED / 目标击毁", "IRON JAW DOWN", "重装单位已瘫痪 · 战区清扫中", false);
      audio.explosion(2.4);
    } else {
      game.shake = Math.max(game.shake, 8);
      audio.explosion(1.15);
      if (Math.random() < enemy.dropChance) {
        spawnPickup(enemy.x, enemy.y, choosePickupType());
      }
    }

    if (game.enemies.length > 0) updateHud();
  }

  function getComboMultiplier() {
    if (!game || game.combo <= 1) return 1;
    return Math.min(4, 1 + (game.combo - 1) * 0.25);
  }

  function damageCrate(crate, amount, x, y) {
    if (!game || crate.hp <= 0) return;
    crate.hp -= amount;
    spawnSparks(x, y, "#ffc477", 9, 160);

    if (crate.hp <= 0) {
      const index = game.obstacles.indexOf(crate);
      if (index !== -1) game.obstacles.splice(index, 1);
      for (let i = 0; i < 14; i += 1) {
        addParticle({
          x: crate.x + crate.w / 2 + rand(-20, 20),
          y: crate.y + crate.h / 2 + rand(-20, 20),
          vx: rand(-150, 150),
          vy: rand(-170, 80),
          life: rand(0.35, 0.9),
          size: rand(3, 8),
          color: i % 3 === 0 ? "#ffbd67" : "#5d4428",
          type: "debris",
          drag: 0.92,
          rotation: rand(0, TAU),
          spin: rand(-8, 8)
        });
      }
      addParticle({
        x: crate.x + crate.w / 2,
        y: crate.y + crate.h / 2,
        life: 0.32,
        size: 55,
        color: "rgba(255, 178, 91, 0.18)",
        type: "flash"
      });
      addParticle({
        x: crate.x + crate.w / 2,
        y: crate.y + crate.h / 2,
        life: 0.42,
        size: 10,
        color: "#ffd28e",
        type: "ring",
        ringSize: 58
      });
      addDecal(crate.x + crate.w / 2, crate.y + crate.h / 2, 30);
      audio.crateBreak();
      game.shake = Math.max(game.shake, 4);
      if (Math.random() < 0.48) {
        spawnPickup(crate.x + crate.w / 2, crate.y + crate.h / 2, choosePickupType());
      }
    }
  }

  function damagePlayer(amount) {
    if (!game || !player || !player.alive) return;
    if (player.invuln > 0 || player.dashTime > 0) return;

    let remaining = amount;
    if (player.shield > 0) {
      const absorbed = Math.min(player.shield, remaining);
      player.shield -= absorbed;
      remaining -= absorbed;
      addParticle({
        x: player.x,
        y: player.y,
        life: 0.32,
        size: player.r,
        color: "rgba(116, 232, 224, 0.5)",
        type: "ring",
        ringSize: player.r * 2.4
      });
      spawnSparks(player.x, player.y, "#74e8e0", 12, 150);
      audio.shieldHit();
    }

    if (remaining > 0) {
      player.hp = Math.max(0, player.hp - remaining);
      player.invuln = PLAYER.invulnAfterHit;
      player.hitFlash = 0.2;
      game.hitFlash = 1;
      game.shake = Math.max(game.shake, 14);
      spawnSparks(player.x, player.y, "#ff8d63", 15, 220);
      addExplosion(player.x, player.y, 0.55, "#ff7a4f");
      audio.impact();
    }

    updateHud();

    if (player.hp <= 0) beginPlayerDeath();
  }

  function beginPlayerDeath() {
    if (state !== "playing" || !player) return;
    player.alive = false;
    player.hp = 0;
    setState("dying");
    game.deathTimer = 2.05;
    game.shake = 28;
    game.hitFlash = 1;
    addExplosion(player.x, player.y, 2.6, "#ffc161");
    addExplosion(player.x + rand(-30, 30), player.y + rand(-30, 30), 1.8, "#ff6942");
    addWreck(player.x, player.y, player.hullAngle, player.r, "player");
    addDecal(player.x, player.y, 105);
    audio.explosion(2.2);
    audio.gameOver();
  }

  function updateBulletParticles(dt) {
    // Kept separate so the death sequence can reuse the same visual update.
    updateParticles(dt);
  }

  // ---------- Pickups, particles, decals ----------

  function updatePickups(dt) {
    if (!game || !player) return;

    for (const pickup of game.pickups) {
      pickup.life -= dt;
      pickup.phase += dt;

      const dx = player.x - pickup.x;
      const dy = player.y - pickup.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 118 && player.alive) {
        const pull = (1 - distance / 118) * 580;
        pickup.x += (dx / Math.max(1, distance)) * pull * dt;
        pickup.y += (dy / Math.max(1, distance)) * pull * dt;
      }

      if (distance < player.r + pickup.radius && player.alive) {
        applyPickup(pickup);
        pickup.dead = true;
      }
    }

    game.pickups = game.pickups.filter((pickup) => !pickup.dead && pickup.life > 0);
  }

  function applyPickup(pickup) {
    if (!player || !game) return;
    const info = PICKUPS[pickup.type];

    if (pickup.type === "repair") {
      const amount = Math.min(40, player.maxHp - player.hp);
      player.hp = Math.min(player.maxHp, player.hp + 40);
      addFloatingText(player.x, player.y - 38, amount > 0 ? `+${amount} HULL` : "HULL FULL", "#c8ff8d");
    } else if (pickup.type === "shield") {
      player.shield = Math.min(60, player.shield + 35);
      addFloatingText(player.x, player.y - 38, "+35 SHIELD", "#8cf4ed");
    } else {
      player.overdrive = Math.max(player.overdrive, 0) + 8;
      addFloatingText(player.x, player.y - 38, "OVERDRIVE", "#ff9e76");
    }

    addParticle({
      x: player.x,
      y: player.y,
      life: 0.5,
      size: player.r,
      color: info.color,
      type: "ring",
      ringSize: 86
    });
    for (let i = 0; i < 16; i += 1) {
      const angle = rand(0, TAU);
      const speed = rand(35, 160);
      addParticle({
        x: pickup.x,
        y: pickup.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(0.2, 0.55),
        size: rand(1, 3.2),
        color: info.color,
        type: "spark",
        drag: 0.88
      });
    }
    game.shake = Math.max(game.shake, 3);
    audio.pickup();
    updateHud();
  }

  function addParticle(options) {
    if (!game) return;
    if (game.particles.length > 520) game.particles.shift();
    game.particles.push({
      x: options.x,
      y: options.y,
      vx: options.vx || 0,
      vy: options.vy || 0,
      life: options.life || 0.4,
      maxLife: options.life || 0.4,
      size: options.size || 2,
      color: options.color || "#ffffff",
      type: options.type || "spark",
      drag: options.drag === undefined ? 0.92 : options.drag,
      rotation: options.rotation || 0,
      spin: options.spin || 0,
      text: options.text || "",
      ringSize: options.ringSize || 30
    });
  }

  function addFloatingText(x, y, text, color) {
    addParticle({
      x,
      y,
      vx: rand(-4, 4),
      vy: -28,
      life: 0.95,
      size: 10,
      color,
      type: "text",
      text,
      drag: 1
    });
  }

  function spawnSparks(x, y, color, count, speed) {
    for (let i = 0; i < count; i += 1) {
      const angle = rand(0, TAU);
      const velocity = rand(speed * 0.25, speed);
      addParticle({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: rand(0.1, 0.4),
        size: rand(1, 3),
        color,
        type: "spark",
        drag: 0.9
      });
    }
  }

  function addExplosion(x, y, scale = 1, color = "#ff9a5e") {
    if (!game) return;
    const count = Math.round(24 * scale);
    for (let i = 0; i < count; i += 1) {
      const angle = rand(0, TAU);
      const speed = rand(60, 370) * scale;
      addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(0.18, 0.72) * Math.min(1.5, scale),
        size: rand(1.2, 4.5),
        color: i % 5 === 0 ? "#fff1bd" : color,
        type: "spark",
        drag: 0.9
      });
    }

    for (let i = 0; i < Math.round(13 * scale); i += 1) {
      addParticle({
        x: x + rand(-12, 12),
        y: y + rand(-12, 12),
        vx: rand(-50, 50) * scale,
        vy: rand(-70, 25) * scale,
        life: rand(0.35, 1.35) * Math.min(1.6, scale),
        size: rand(7, 22) * Math.sqrt(scale),
        color: i % 3 === 0 ? "rgba(255, 172, 90, 0.2)" : "rgba(92, 99, 79, 0.2)",
        type: "smoke",
        drag: 0.93
      });
    }

    addParticle({
      x,
      y,
      life: 0.42,
      size: 15 * scale,
      color: "rgba(255, 220, 160, 0.5)",
      type: "flash"
    });
    addParticle({
      x,
      y,
      life: 0.5 * Math.min(1.4, scale),
      size: 8,
      color,
      type: "ring",
      ringSize: 90 * scale
    });
    addParticle({
      x,
      y,
      life: 0.7,
      size: 1,
      color: "rgba(40, 37, 30, 0.45)",
      type: "smoke",
      drag: 0.98
    });

    game.shake = Math.max(game.shake, 7 * scale);
  }

  function updateParticles(dt) {
    if (!game) return;
    const particles = game.particles;
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.life -= dt;
      if (particle.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= Math.pow(particle.drag, dt * 60);
      particle.vy *= Math.pow(particle.drag, dt * 60);
      particle.rotation += particle.spin * dt;

      if (particle.type === "smoke") {
        particle.vy -= dt * 3;
        particle.size += dt * 3.2;
      } else if (particle.type === "text") {
        particle.vy *= 0.965;
      }
    }
  }

  function addDecal(x, y, radius) {
    if (!game) return;
    game.decals.push({
      x: x + rand(-6, 6),
      y: y + rand(-6, 6),
      radius,
      alpha: rand(0.25, 0.55),
      seed: Math.random() * 20
    });
    if (game.decals.length > 48) game.decals.shift();
  }

  function addWreck(x, y, hullAngle, radius, type) {
    if (!game) return;
    game.wrecks.push({
      x,
      y,
      hullAngle,
      turretAngle: hullAngle + rand(-0.5, 0.5),
      radius,
      type,
      age: 0,
      life: 13,
      smokeTimer: rand(0.2, 0.9),
      phase: rand(0, TAU)
    });
    if (game.wrecks.length > 7) game.wrecks.shift();
  }

  function updateWrecks(dt) {
    if (!game) return;
    for (const wreck of game.wrecks) {
      wreck.age += dt;
      wreck.smokeTimer -= dt;
      if (wreck.age < 10 && wreck.smokeTimer <= 0) {
        wreck.smokeTimer = rand(0.3, 0.75);
        addParticle({
          x: wreck.x + rand(-wreck.radius * 0.5, wreck.radius * 0.5),
          y: wreck.y + rand(-wreck.radius * 0.3, wreck.radius * 0.3),
          vx: rand(-8, 15),
          vy: rand(-30, -8),
          life: rand(0.6, 1.6),
          size: rand(4, 12),
          color: "rgba(34, 38, 31, 0.37)",
          type: "smoke",
          drag: 0.96
        });
      }
      if (Math.random() < dt * 2.5 && wreck.age < 6) {
        addParticle({
          x: wreck.x + rand(-wreck.radius * 0.25, wreck.radius * 0.25),
          y: wreck.y + rand(-wreck.radius * 0.25, wreck.radius * 0.25),
          vx: rand(-4, 10),
          vy: rand(-30, -10),
          life: rand(0.2, 0.5),
          size: rand(1, 2.5),
          color: "#ffb45f",
          type: "spark",
          drag: 0.94
        });
      }
    }
    game.wrecks = game.wrecks.filter((wreck) => wreck.age < wreck.life);
  }

  // ---------- Game update ----------

  function updateGame(dt) {
    if (!game || !player) return;
    if (state !== "playing" || !player.alive) return;

    game.time += dt;

    updatePlayer(dt);
    if (!player.alive) return;

    updateWave(dt);

    for (const enemy of game.enemies) {
      updateEnemy(enemy, dt);
    }
    separateTanks();

    updateBullets(dt);
    if (state !== "playing") return;

    updatePickups(dt);
    updateParticles(dt);
    updateWrecks(dt);

    game.shake *= Math.exp(-9 * dt);
    if (game.shake < 0.08) game.shake = 0;
    game.hitFlash = Math.max(0, game.hitFlash - dt * 3.3);
    game.hitMarker = Math.max(0, game.hitMarker - dt);

    if (game.combo > 0) {
      game.comboTimer = Math.max(0, game.comboTimer - dt);
      if (game.comboTimer <= 0) {
        game.combo = 0;
      }
    }

    updateHud();

    // Phases can end after a bullet kills the last enemy this frame.
    if (
      game.phase === "combat" &&
      game.waveQueue.length === 0 &&
      game.spawnEffects.length === 0 &&
      game.enemies.length === 0
    ) {
      completeWave();
    }
  }

  function updateDying(dt) {
    if (!game) return;
    game.time += dt;
    game.deathTimer -= dt;
    game.hitFlash = Math.max(0, game.hitFlash - dt * 2.4);
    game.shake *= Math.exp(-6.5 * dt);
    updateParticles(dt);
    updateWrecks(dt);
    el.damageFlash.style.opacity = String(game.hitFlash * 0.45);

    if (game.deathTimer <= 0) {
      showGameOver();
    }
  }

  function updateMenu(dt) {
    const targetX = input.mouse.active ? input.mouse.worldX : menuHero.x + Math.cos(menuHero.turretAngle) * 200;
    const targetY = input.mouse.active ? input.mouse.worldY : menuHero.y - 200;
    const target = Math.atan2(targetY - menuHero.y, targetX - menuHero.x);
    menuHero.turretAngle = turnToward(menuHero.turretAngle, target, dt * 0.72);
    menuHero.trackPhase += dt * 0.06;
  }

  // ---------- State transitions ----------

  function setState(nextState) {
    state = nextState;
    document.body.dataset.state = nextState;

    el.menuScreen.classList.toggle("is-active", nextState === "menu");
    el.pauseScreen.classList.toggle("is-active", nextState === "paused");
    el.gameOverScreen.classList.toggle("is-active", nextState === "gameover");

    if (nextState !== "playing") {
      input.keys.clear();
      input.mouse.down = false;
      input.touch.firing = false;
      input.touch.moveActive = false;
      input.touch.aimActive = false;
      resetStick(el.moveStick);
      resetStick(el.aimStick);
    }

    if (nextState !== "playing" && nextState !== "paused" && nextState !== "dying") {
      el.damageFlash.style.opacity = "0";
    }

    if (nextState === "menu") {
      document.body.classList.remove("low-health");
      el.bossHud.classList.remove("is-active");
      el.comboHud.classList.remove("is-active");
    }
  }

  function startGame() {
    audio.ensure();
    audio.ui();
    newGame();
    setState("playing");
    showStartHint();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    input.mouse.down = false;
  }

  function pauseGame() {
    if (state !== "playing") return;
    setState("paused");
    input.mouse.down = false;
    el.pauseWave.textContent = padWave(game.wave);
    el.pauseScore.textContent = formatScore(game.score);
    audio.ui();
  }

  function resumeGame() {
    if (state !== "paused") return;
    setState("playing");
    audio.ensure();
    audio.ui();
    input.mouse.down = false;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }

  function togglePause() {
    if (state === "playing") pauseGame();
    else if (state === "paused") resumeGame();
  }

  function returnToMenu() {
    game = null;
    player = null;
    setState("menu");
    updateBestUi();
    el.damageFlash.style.opacity = "0";
    document.body.classList.remove("low-health");
    el.bossHud.classList.remove("is-active");
    el.comboHud.classList.remove("is-active");
    audio.ui();
  }

  function showGameOver() {
    if (!game) return;
    const oldBest = records.bestScore;
    const isRecord = game.score > oldBest && game.score > 0;

    records.bestScore = Math.max(records.bestScore, game.score);
    records.bestWave = Math.max(records.bestWave, game.wave);
    persistSave();

    el.recordTag.classList.toggle("is-visible", isRecord);
    el.finalScore.textContent = formatScore(game.score);
    el.finalWave.textContent = padWave(game.wave);
    el.finalKills.textContent = String(game.kills);
    el.finalCombo.textContent = String(game.maxCombo);
    el.finalBest.textContent = formatScore(records.bestScore);

    document.body.classList.remove("low-health");
    setState("gameover");
    updateBestUi();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }

  function showBanner(kicker, title, sub, danger = false) {
    el.bannerKicker.textContent = kicker;
    el.bannerTitle.textContent = title;
    el.bannerSub.textContent = sub;
    el.waveBanner.classList.remove("is-active", "is-danger");
    void el.waveBanner.offsetWidth;
    if (danger) el.waveBanner.classList.add("is-danger");
    el.waveBanner.classList.add("is-active");
  }

  function showStartHint() {
    clearTimeout(hintTimeout);
    if (isTouchDevice()) {
      el.startHint.innerHTML =
        '<span><kbd>左侧摇杆</kbd> 移动</span>' +
        '<span class="hint-dot"></span>' +
        '<span><kbd>右侧摇杆</kbd> 瞄准并自动开火</span>' +
        '<span class="hint-dot"></span>' +
        '<span><kbd>冲刺键</kbd> 闪避</span>';
    }
    el.startHint.classList.add("is-active");
    hintTimeout = setTimeout(() => {
      el.startHint.classList.remove("is-active");
    }, 8000);
  }

  // ---------- HUD ----------

  let lastHudSignature = "";

  function updateHud() {
    if (!game || !player) return;

    const remaining = game.enemies.length + game.spawnEffects.length + game.waveQueue.length;
    const multiplier = getComboMultiplier();
    const hpPct = clamp((player.hp / player.maxHp) * 100, 0, 100);
    const shieldPct = clamp((player.shield / 60) * 100, 0, 100);
    const dashRatio = 1 - clamp(player.dashCooldown / PLAYER.dashCooldown, 0, 1);

    el.scoreValue.textContent = formatScore(game.score);
    el.hpText.textContent = String(Math.ceil(player.hp));
    el.healthBar.style.width = `${hpPct}%`;
    el.healthBar.classList.toggle("critical", player.hp <= 30);
    el.shieldBar.style.width = `${shieldPct}%`;
    el.dashBar.style.transform = `scaleX(${dashRatio})`;
    el.dashMeter.classList.toggle("is-ready", player.dashCooldown <= 0);
    el.enemyCount.textContent = `${String(remaining).padStart(2, "0")} HOSTILES`;

    if (game.wave % 5 === 0) {
      el.enemyCount.textContent = `${String(remaining).padStart(2, "0")} HOSTILES · TITAN`;
    }

    if (player.overdrive > 0) {
      el.buffLabel.textContent = `OVERDRIVE ${player.overdrive.toFixed(1)}s`;
      el.buffLabel.className = "buff-label is-active is-overdrive";
    } else if (player.shield > 0) {
      el.buffLabel.textContent = `SHIELD +${Math.ceil(player.shield)}`;
      el.buffLabel.className = "buff-label is-active";
    } else {
      el.buffLabel.textContent = "SYSTEMS NOMINAL";
      el.buffLabel.className = "buff-label";
    }

    const comboActive = game.combo >= 2 && game.comboTimer > 0;
    el.comboHud.classList.toggle("is-active", comboActive);
    if (comboActive) {
      el.comboValue.textContent = `×${multiplier.toFixed(1)}`;
      el.comboTimer.style.transform = `scaleX(${clamp(game.comboTimer / 3.05, 0, 1)})`;
    }

    document.body.classList.toggle(
      "low-health",
      player.alive && player.hp > 0 && player.hp <= 30 && state === "playing"
    );

    el.damageFlash.style.opacity = String(game.hitFlash * 0.5);

    const boss = game.enemies.find((enemy) => enemy.isBoss && !enemy.dead);
    if (boss) {
      el.bossHud.classList.add("is-active");
      const bossPct = clamp((boss.hp / boss.maxHp) * 100, 0, 100);
      el.bossBar.style.transform = `scaleX(${bossPct / 100})`;
      el.bossHpText.textContent = `${Math.ceil(bossPct)}%`;
      el.bossName.textContent = boss.name;
    } else {
      el.bossHud.classList.remove("is-active");
    }

    const touchDashCooling = player.dashCooldown > 0;
    el.touchDash.classList.toggle("is-cooling", touchDashCooling);
    el.touchDashLabel.textContent = touchDashCooling
      ? `${Math.ceil(player.dashCooldown)}S`
      : "就绪";

    const signature = `${game.wave}-${remaining}-${game.score}-${Math.ceil(player.hp)}`;
    lastHudSignature = signature;
  }

  function updateBestUi() {
    el.bestScoreMenu.textContent = formatScore(records.bestScore);
    el.bestWaveMenu.textContent = records.bestWave > 0 ? padWave(records.bestWave) : "--";
  }

  function refreshSoundButtons() {
    document.body.dataset.muted = String(audio.muted);
    for (const button of el.soundToggles) {
      button.setAttribute("aria-label", audio.muted ? "开启声音" : "关闭声音");
      button.title = audio.muted ? "开启声音（M）" : "静音（M）";
    }
  }

  function toggleMute() {
    audio.setMuted(!audio.muted);
    records.muted = audio.muted;
    persistSave();
    refreshSoundButtons();
    if (!audio.muted) {
      audio.ensure();
      audio.ui();
    }
  }

  // ---------- Canvas ground ----------

  function createGroundCanvas() {
    const surface = document.createElement("canvas");
    surface.width = WORLD.w;
    surface.height = WORLD.h;
    const g = surface.getContext("2d");
    const random = mulberry32(0x5eed07);

    const base = g.createRadialGradient(730, 430, 80, 720, 450, 920);
    base.addColorStop(0, "#161b12");
    base.addColorStop(0.55, "#11160f");
    base.addColorStop(1, "#0b0f0b");
    g.fillStyle = base;
    g.fillRect(0, 0, WORLD.w, WORLD.h);

    // Soft patches of compacted earth.
    for (let i = 0; i < 44; i += 1) {
      const x = random() * WORLD.w;
      const y = random() * WORLD.h;
      const rx = 40 + random() * 160;
      const ry = 24 + random() * 100;
      g.save();
      g.translate(x, y);
      g.rotate(random() * TAU);
      const patch = g.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry));
      patch.addColorStop(0, random() > 0.5 ? "rgba(63, 71, 49, 0.085)" : "rgba(0, 0, 0, 0.085)");
      patch.addColorStop(1, "rgba(0, 0, 0, 0)");
      g.fillStyle = patch;
      g.beginPath();
      g.ellipse(0, 0, rx, ry, 0, 0, TAU);
      g.fill();
      g.restore();
    }

    // Faint survey grid.
    g.lineWidth = 1;
    for (let x = 80; x < WORLD.w; x += 72) {
      g.strokeStyle = x % 288 === 0
        ? "rgba(203, 224, 178, 0.048)"
        : "rgba(203, 224, 178, 0.022)";
      g.beginPath();
      g.moveTo(x + 0.5, 54);
      g.lineTo(x + 0.5, WORLD.h - 54);
      g.stroke();
    }
    for (let y = 80; y < WORLD.h; y += 72) {
      g.strokeStyle = y % 288 === 0
        ? "rgba(203, 224, 178, 0.048)"
        : "rgba(203, 224, 178, 0.022)";
      g.beginPath();
      g.moveTo(54, y + 0.5);
      g.lineTo(WORLD.w - 54, y + 0.5);
      g.stroke();
    }

    // Vehicle tracks crossing the basin.
    const tracks = [
      [[-60, 720], [270, 610], [600, 670], [920, 520], [1480, 580]],
      [[250, 950], [380, 690], [530, 430], [760, 310], [1040, -40]],
      [[-20, 330], [330, 360], [710, 520], [1130, 470], [1480, 300]]
    ];
    for (const points of tracks) {
      g.save();
      g.lineCap = "round";
      g.lineJoin = "round";
      g.strokeStyle = "rgba(0, 0, 0, 0.12)";
      g.lineWidth = 30;
      g.beginPath();
      g.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length - 1; i += 1) {
        const midX = (points[i][0] + points[i + 1][0]) * 0.5;
        const midY = (points[i][1] + points[i + 1][1]) * 0.5;
        g.quadraticCurveTo(points[i][0], points[i][1], midX, midY);
      }
      g.lineTo(points[points.length - 1][0], points[points.length - 1][1]);
      g.stroke();
      g.strokeStyle = "rgba(171, 183, 146, 0.035)";
      g.lineWidth = 2;
      g.setLineDash([8, 12]);
      g.stroke();
      g.restore();
    }

    // Central targeting circle and stenciled sector number.
    g.save();
    g.translate(WORLD.w / 2, WORLD.h / 2);
    g.strokeStyle = "rgba(200, 220, 174, 0.075)";
    g.lineWidth = 1;
    g.setLineDash([3, 14]);
    g.beginPath();
    g.arc(0, 0, 258, 0, TAU);
    g.stroke();
    g.setLineDash([]);
    g.strokeStyle = "rgba(200, 220, 174, 0.045)";
    g.beginPath();
    g.arc(0, 0, 197, 0, TAU);
    g.stroke();
    for (let i = 0; i < 8; i += 1) {
      g.save();
      g.rotate((i / 8) * TAU);
      g.strokeStyle = "rgba(216, 255, 88, 0.06)";
      g.beginPath();
      g.moveTo(0, -272);
      g.lineTo(0, -285);
      g.stroke();
      g.restore();
    }
    g.font = "700 310px Bahnschrift, 'Arial Narrow', sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "rgba(202, 223, 174, 0.026)";
    g.fillText("07", 0, 8);
    g.restore();

    // Ground cracks.
    for (let i = 0; i < 26; i += 1) {
      const startX = 100 + random() * (WORLD.w - 200);
      const startY = 100 + random() * (WORLD.h - 200);
      g.strokeStyle = "rgba(0, 0, 0, 0.18)";
      g.lineWidth = random() * 1.4 + 0.4;
      g.beginPath();
      g.moveTo(startX, startY);
      let x = startX;
      let y = startY;
      for (let j = 0; j < 4; j += 1) {
        x += (random() - 0.5) * 38;
        y += (random() - 0.5) * 26 + 6;
        g.lineTo(x, y);
      }
      g.stroke();
    }

    // Tiny gravel, bolt heads and ash flecks.
    for (let i = 0; i < 700; i += 1) {
      const x = random() * WORLD.w;
      const y = random() * WORLD.h;
      const bright = random() > 0.82;
      g.fillStyle = bright
        ? `rgba(198, 211, 174, ${0.035 + random() * 0.07})`
        : `rgba(0, 0, 0, ${0.04 + random() * 0.12})`;
      g.fillRect(x, y, random() > 0.86 ? 2 : 1, random() > 0.9 ? 2 : 1);
    }

    // Faded tactical annotations.
    g.save();
    g.fillStyle = "rgba(208, 226, 182, 0.08)";
    g.font = "600 10px 'Cascadia Mono', Consolas, monospace";
    g.textAlign = "center";
    g.fillText("S E C T O R   0 7   //   A S H   B A S I N", WORLD.w / 2, 86);

    g.textAlign = "left";
    g.fillStyle = "rgba(208, 226, 182, 0.065)";
    g.fillText("GRID 07-A", 82, 462);
    g.fillText("GRID 07-B", 1262, 462);

    g.translate(58, WORLD.h - 76);
    g.rotate(-Math.PI / 2);
    g.fillStyle = "rgba(208, 226, 182, 0.04)";
    g.font = "600 9px 'Cascadia Mono', Consolas, monospace";
    g.fillText("EASTERN FRONT // RESTRICTED // 34°07′ N", 0, 0);
    g.restore();

    // Dark perimeter and a worn caution band.
    g.fillStyle = "rgba(3, 6, 3, 0.7)";
    g.fillRect(0, 0, WORLD.w, 28);
    g.fillRect(0, WORLD.h - 28, WORLD.w, 28);
    g.fillRect(0, 28, 28, WORLD.h - 56);
    g.fillRect(WORLD.w - 28, 28, 28, WORLD.h - 56);

    const drawHazardBand = (x, y, w, h, horizontal) => {
      g.save();
      g.beginPath();
      g.rect(x, y, w, h);
      g.clip();
      g.fillStyle = "rgba(216, 255, 88, 0.04)";
      g.fillRect(x, y, w, h);
      g.strokeStyle = "rgba(216, 255, 88, 0.12)";
      g.lineWidth = 7;
      const step = 26;
      if (horizontal) {
        for (let lineX = x - h; lineX < x + w + h; lineX += step) {
          g.beginPath();
          g.moveTo(lineX, y + h);
          g.lineTo(lineX + h, y);
          g.stroke();
        }
      } else {
        for (let lineY = y - w; lineY < y + h + w; lineY += step) {
          g.beginPath();
          g.moveTo(x, lineY);
          g.lineTo(x + w, lineY + w);
          g.stroke();
        }
      }
      g.restore();
    };

    drawHazardBand(28, 28, WORLD.w - 56, 17, true);
    drawHazardBand(28, WORLD.h - 45, WORLD.w - 56, 17, true);
    drawHazardBand(28, 45, 17, WORLD.h - 90, false);
    drawHazardBand(WORLD.w - 45, 45, 17, WORLD.h - 90, false);

    g.strokeStyle = "rgba(185, 201, 160, 0.19)";
    g.lineWidth = 1.5;
    g.strokeRect(52.5, 52.5, WORLD.w - 105, WORLD.h - 105);
    g.strokeStyle = "rgba(216, 255, 88, 0.07)";
    g.lineWidth = 1;
    g.strokeRect(58.5, 58.5, WORLD.w - 117, WORLD.h - 117);

    // Corner brackets.
    const bracket = 24;
    for (const [cx, cy, sx, sy] of [
      [54, 54, 1, 1],
      [WORLD.w - 54, 54, -1, 1],
      [54, WORLD.h - 54, 1, -1],
      [WORLD.w - 54, WORLD.h - 54, -1, -1]
    ]) {
      g.strokeStyle = "rgba(216, 255, 88, 0.32)";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(cx + sx * bracket, cy);
      g.lineTo(cx, cy);
      g.lineTo(cx, cy + sy * bracket);
      g.stroke();
    }

    // Static spawn pads are intentionally faded; live pads pulse in-game.
    for (const point of SPAWN_POINTS) {
      g.strokeStyle = "rgba(255, 105, 74, 0.07)";
      g.lineWidth = 1;
      g.setLineDash([4, 9]);
      g.beginPath();
      g.arc(point.x, point.y, 31, 0, TAU);
      g.stroke();
      g.setLineDash([]);
      g.beginPath();
      g.arc(point.x, point.y, 17, 0, TAU);
      g.stroke();
    }

    return surface;
  }

  // ---------- Drawing: environment ----------

  function drawGround() {
    if (groundCanvas) ctx.drawImage(groundCanvas, 0, 0);
  }

  function drawDecals() {
    if (!game) return;
    for (const decal of game.decals) {
      const gradient = ctx.createRadialGradient(
        decal.x,
        decal.y,
        0,
        decal.x,
        decal.y,
        decal.radius
      );
      gradient.addColorStop(0, `rgba(4, 5, 3, ${decal.alpha})`);
      gradient.addColorStop(0.55, `rgba(8, 9, 6, ${decal.alpha * 0.58})`);
      gradient.addColorStop(1, "rgba(8, 9, 6, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(
        decal.x,
        decal.y,
        decal.radius,
        decal.radius * 0.72,
        decal.seed,
        0,
        TAU
      );
      ctx.fill();
    }
  }

  function drawObstacle(obstacle) {
    const x = obstacle.x;
    const y = obstacle.y;
    const w = obstacle.w;
    const h = obstacle.h;

    ctx.save();

    if (obstacle.kind === "concrete") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
      ctx.fillRect(x + 7, y + 9, w, h);

      const bodyGradient = ctx.createLinearGradient(x, y, x, y + h);
      bodyGradient.addColorStop(0, "#3a4234");
      bodyGradient.addColorStop(0.18, "#2d352a");
      bodyGradient.addColorStop(1, "#1b211a");

      ctx.fillStyle = bodyGradient;
      ctx.strokeStyle = "rgba(169, 186, 143, 0.21)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 5, y);
      ctx.lineTo(x + w - 5, y);
      ctx.lineTo(x + w, y + 5);
      ctx.lineTo(x + w, y + h - 5);
      ctx.lineTo(x + w - 5, y + h);
      ctx.lineTo(x + 5, y + h);
      ctx.lineTo(x, y + h - 5);
      ctx.lineTo(x, y + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      roundRectPath(ctx, x + 5, y + 5, w - 10, h - 10, 2);
      ctx.fillStyle = "rgba(116, 132, 98, 0.11)";
      ctx.fill();
      ctx.strokeStyle = "rgba(8, 11, 8, 0.55)";
      ctx.stroke();

      // A narrow warning plate on longer barricades.
      if (w > h * 1.5 || h > w * 1.3) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + 9, y + 9, w > h ? w - 18 : 8, w > h ? 7 : h - 18);
        ctx.clip();
        ctx.strokeStyle = "rgba(216, 255, 88, 0.19)";
        ctx.lineWidth = 4;
        if (w > h) {
          for (let lx = x - h; lx < x + w + h; lx += 16) {
            ctx.beginPath();
            ctx.moveTo(lx, y + 16);
            ctx.lineTo(lx + 16, y + 9);
            ctx.stroke();
          }
        } else {
          for (let ly = y - w; ly < y + h + w; ly += 16) {
            ctx.beginPath();
            ctx.moveTo(x + 9, ly);
            ctx.lineTo(x + 17, ly + 8);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // Cracks and corner bolts.
      const seed = obstacle.seed;
      ctx.strokeStyle = "rgba(5, 7, 5, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.24, y + 11);
      ctx.lineTo(x + w * 0.3, y + h * 0.3);
      ctx.lineTo(x + w * 0.24, y + h * 0.48);
      ctx.moveTo(x + w * 0.73, y + h * 0.58);
      ctx.lineTo(x + w * 0.67, y + h * 0.82);
      ctx.stroke();

      ctx.fillStyle = "rgba(181, 199, 155, 0.2)";
      const bolts = [
        [x + 6, y + 6],
        [x + w - 6, y + 6],
        [x + 6, y + h - 6],
        [x + w - 6, y + h - 6]
      ];
      for (const [bx, by] of bolts) {
        ctx.beginPath();
        ctx.arc(bx, by, 1.2 + (seed % 2) * 0.4, 0, TAU);
        ctx.fill();
      }

      ctx.fillStyle = "rgba(223, 236, 202, 0.1)";
      ctx.font = "600 6px 'Cascadia Mono', Consolas, monospace";
      ctx.textAlign = "center";
      if (w > 100) ctx.fillText("B-07", x + w / 2, y + h / 2 + 2);
    } else {
      const health = obstacle.hp / obstacle.maxHp;
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(x + 6, y + 8, w, h);

      const wood = ctx.createLinearGradient(x, y, x + w, y + h);
      wood.addColorStop(0, "#594326");
      wood.addColorStop(0.5, "#49351e");
      wood.addColorStop(1, "#322416");
      ctx.fillStyle = wood;
      ctx.strokeStyle = "rgba(226, 174, 100, 0.27)";
      ctx.lineWidth = 1;
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

      // Planks and nails.
      ctx.strokeStyle = "rgba(22, 14, 8, 0.55)";
      ctx.beginPath();
      ctx.moveTo(x + 4, y + h * 0.33);
      ctx.lineTo(x + w - 4, y + h * 0.33);
      ctx.moveTo(x + 4, y + h * 0.66);
      ctx.lineTo(x + w - 4, y + h * 0.66);
      ctx.stroke();

      ctx.strokeStyle = "rgba(211, 162, 89, 0.22)";
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 4.5, y + 4.5, w - 9, h - 9);
      ctx.strokeStyle = "rgba(17, 11, 7, 0.65)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + 7, y + 7);
      ctx.lineTo(x + w - 7, y + h - 7);
      ctx.moveTo(x + w - 7, y + 7);
      ctx.lineTo(x + 7, y + h - 7);
      ctx.stroke();

      ctx.fillStyle = "rgba(250, 212, 143, 0.44)";
      ctx.font = "700 7px 'Cascadia Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.fillText("07", x + w / 2, y + h / 2 + 2.5);

      if (health < 0.8) {
        ctx.strokeStyle = `rgba(8, 6, 4, ${0.4 + (1 - health) * 0.35})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.65, y + 8);
        ctx.lineTo(x + w * 0.58, y + h * 0.38);
        ctx.lineTo(x + w * 0.72, y + h * 0.55);
        ctx.lineTo(x + w * 0.66, y + h * 0.82);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // ---------- Drawing: tanks ----------

  function drawTank(tank, options = {}) {
    const isPlayer = options.isPlayer === true;
    const isWreck = options.isWreck === true;
    const alpha = options.alpha === undefined ? 1 : options.alpha;
    const spawnScale = tank.spawnAnim === undefined ? 1 : easeOutCubic(clamp(tank.spawnAnim, 0, 1));
    const scale = isWreck ? 1 : 0.58 + spawnScale * 0.42;
    const radius = tank.r;
    const accent = isWreck ? "#5d5b4c" : isPlayer ? "#d8ff58" : tank.accent || "#ff7a55";
    const bodyColor = isWreck ? "#20221e" : isPlayer ? "#435438" : tank.body || "#3a241b";
    const bodyHighlight = isWreck ? "#30312b" : isPlayer ? "#73865f" : "#674332";
    const trackColor = isWreck ? "#131511" : "#0d110c";
    const barrelColor = isWreck ? "#1b1d19" : isPlayer ? "#1d271a" : "#1a1310";

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(tank.x, tank.y);

    if (!isWreck) {
      ctx.save();
      ctx.translate(6, 9);
      ctx.rotate(tank.hullAngle + Math.PI / 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
      ctx.beginPath();
      ctx.ellipse(0, 2, radius * 1.08, radius * 1.28, 0, 0, TAU);
      ctx.fill();
      ctx.restore();

      // Player ground marker.
      if (isPlayer) {
        ctx.strokeStyle = "rgba(216, 255, 88, 0.2)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 8]);
        ctx.beginPath();
        ctx.arc(0, 0, radius + 10 + Math.sin(menuClock * 3) * 1.5, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    ctx.scale(scale, scale);

    // Hull and tracks.
    ctx.save();
    ctx.rotate(tank.hullAngle + Math.PI / 2);

    const trackOffset = radius * 0.9;
    const trackW = radius * 0.36;
    const trackH = radius * 2.0;

    for (const side of [-1, 1]) {
      const tx = side * trackOffset - (side < 0 ? trackW : 0);
      roundRectPath(ctx, tx, -trackH * 0.5, trackW, trackH, radius * 0.12);
      ctx.fillStyle = trackColor;
      ctx.fill();
      ctx.strokeStyle = isWreck ? "rgba(75, 76, 67, 0.25)" : "rgba(0, 0, 0, 0.65)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.strokeStyle = isWreck ? "rgba(105, 103, 87, 0.14)" : "rgba(196, 214, 171, 0.13)";
      ctx.lineWidth = 1;
      const treadCount = 6;
      for (let i = 0; i < treadCount; i += 1) {
        const yy = -trackH * 0.42 + ((i + (tank.trackPhase || 0)) % treadCount) * (trackH * 0.84 / treadCount);
        ctx.beginPath();
        ctx.moveTo(tx + 3, yy);
        ctx.lineTo(tx + trackW - 3, yy);
        ctx.stroke();
      }
    }

    const hullW = radius * 1.38;
    const hullH = radius * 1.88;
    const hullGradient = ctx.createLinearGradient(0, -hullH / 2, 0, hullH / 2);
    hullGradient.addColorStop(0, bodyHighlight);
    hullGradient.addColorStop(0.45, bodyColor);
    hullGradient.addColorStop(1, isWreck ? "#151612" : "#141b12");

    roundRectPath(ctx, -hullW / 2, -hullH / 2, hullW, hullH, radius * 0.15);
    ctx.fillStyle = hullGradient;
    ctx.fill();
    ctx.strokeStyle = isWreck ? "rgba(97, 95, 80, 0.18)" : "rgba(212, 232, 185, 0.2)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Front armor wedge.
    ctx.beginPath();
    ctx.moveTo(-hullW * 0.4, -hullH * 0.24);
    ctx.lineTo(0, -hullH * 0.5);
    ctx.lineTo(hullW * 0.4, -hullH * 0.24);
    ctx.lineTo(hullW * 0.32, -hullH * 0.07);
    ctx.lineTo(-hullW * 0.32, -hullH * 0.07);
    ctx.closePath();
    ctx.fillStyle = isWreck ? "rgba(57, 57, 48, 0.35)" : "rgba(190, 212, 159, 0.1)";
    ctx.fill();

    if (!isWreck) {
      ctx.strokeStyle = `${accent}55`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-hullW * 0.36, -hullH * 0.08);
      ctx.lineTo(hullW * 0.36, -hullH * 0.08);
      ctx.stroke();

      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.82;
      ctx.fillRect(-hullW * 0.45, hullH * 0.18, hullW * 0.2, 2.5);
      ctx.fillRect(hullW * 0.25, hullH * 0.18, hullW * 0.2, 2.5);
      ctx.globalAlpha = alpha;

      // Small unit marking.
      ctx.fillStyle = "rgba(7, 10, 6, 0.42)";
      ctx.fillRect(-hullW * 0.14, hullH * 0.22, hullW * 0.28, hullH * 0.12);
      ctx.fillStyle = "rgba(225, 239, 205, 0.48)";
      ctx.font = "600 6px 'Cascadia Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(isPlayer ? "07" : "X", 0, hullH * 0.28);
    } else {
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.fillRect(-hullW * 0.3, -hullH * 0.15, hullW * 0.6, hullH * 0.36);
    }

    ctx.restore();

    // Independent turret.
    ctx.save();
    ctx.rotate((tank.turretAngle || 0) + Math.PI / 2);

    const recoil = isWreck ? 0 : (tank.recoil || 0) * radius * 0.14;
    const barrelLength = radius * (tank.isBoss ? 1.95 : 1.72);
    const barrelWidth = radius * (tank.isBoss ? 0.25 : 0.19);

    // Main gun.
    ctx.save();
    ctx.translate(0, recoil);
    if (tank.isBoss) {
      for (const side of [-1, 1]) {
        const bx = side * radius * 0.23;
        roundRectPath(ctx, bx - barrelWidth * 0.5, -barrelLength, barrelWidth, barrelLength * 0.83, 2);
        ctx.fillStyle = barrelColor;
        ctx.fill();
        ctx.strokeStyle = isWreck ? "rgba(90, 89, 76, 0.22)" : "rgba(239, 156, 111, 0.22)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = isWreck ? "#292a25" : "#2a211b";
        ctx.fillRect(bx - barrelWidth * 0.72, -barrelLength + 4, barrelWidth * 1.44, 5);
      }
    } else {
      roundRectPath(ctx, -barrelWidth * 0.5, -barrelLength, barrelWidth, barrelLength * 0.86, 2);
      ctx.fillStyle = barrelColor;
      ctx.fill();
      ctx.strokeStyle = isWreck ? "rgba(90, 89, 76, 0.22)" : "rgba(217, 232, 195, 0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = isWreck ? "#292a25" : "#2a211b";
      ctx.fillRect(-barrelWidth * 0.72, -barrelLength + 5, barrelWidth * 1.44, 5);
    }
    ctx.restore();

    // Turret body.
    const turretRadius = radius * (tank.isBoss ? 0.69 : 0.55);
    const turretGradient = ctx.createRadialGradient(
      -turretRadius * 0.35,
      -turretRadius * 0.5,
      turretRadius * 0.15,
      0,
      0,
      turretRadius
    );
    turretGradient.addColorStop(0, isWreck ? "#37382f" : bodyHighlight);
    turretGradient.addColorStop(1, isWreck ? "#1b1c18" : bodyColor);

    ctx.beginPath();
    ctx.arc(0, 0, turretRadius, 0, TAU);
    ctx.fillStyle = turretGradient;
    ctx.fill();
    ctx.strokeStyle = isWreck ? "rgba(97, 95, 80, 0.18)" : `${accent}55`;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Hatch, bolts and team accent.
    ctx.beginPath();
    ctx.arc(0, -turretRadius * 0.12, turretRadius * 0.34, 0, TAU);
    ctx.fillStyle = isWreck ? "#24251f" : "rgba(9, 13, 8, 0.45)";
    ctx.fill();
    ctx.strokeStyle = isWreck ? "rgba(116, 112, 95, 0.16)" : "rgba(217, 235, 190, 0.16)";
    ctx.lineWidth = 1;
    ctx.stroke();

    if (!isWreck) {
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, turretRadius * 0.68, -Math.PI * 0.15, Math.PI * 0.35);
      ctx.stroke();
      ctx.globalAlpha = alpha;
    }

    ctx.restore();

    // Hit flash on top of the whole tank.
    if (!isWreck && (tank.hitFlash || 0) > 0) {
      ctx.globalAlpha = clamp(tank.hitFlash * 5, 0, 0.65) * alpha;
      ctx.fillStyle = "#fff9df";
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.92, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = alpha;
    }

    // Turret charge glow and laser sights.
    if (!isWreck && (tank.type === "sniper" || tank.isBoss) && tank.charge > 0) {
      const ratio = clamp(tank.charge / tank.chargeTime, 0, 1);
      ctx.save();
      ctx.rotate((tank.turretAngle || 0) + Math.PI / 2);
      const muzzleY = -radius * (tank.isBoss ? 1.85 : 1.72);
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = `rgba(255, 157, 107, ${0.22 + ratio * 0.45})`;
      ctx.beginPath();
      ctx.arc(0, muzzleY, 2.5 + ratio * 5, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();

    if (!isWreck) {
      drawEnemyTelegraph(tank);
      drawTankStatus(tank, isPlayer);
      drawTankEffects(tank, isPlayer);
    }
  }

  function drawEnemyTelegraph(enemy) {
    if (!enemy || !player || enemy.charge <= 0 || enemy.isBoss) return;
    const ratio = clamp(enemy.charge / enemy.chargeTime, 0, 1);
    if (enemy.type !== "sniper" || ratio < 0.15) return;

    const muzzleX = enemy.x + Math.cos(enemy.turretAngle) * enemy.r * 1.55;
    const muzzleY = enemy.y + Math.sin(enemy.turretAngle) * enemy.r * 1.55;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `rgba(220, 157, 255, ${0.12 + ratio * 0.35})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 7]);
    ctx.beginPath();
    ctx.moveTo(muzzleX, muzzleY);
    ctx.lineTo(
      muzzleX + Math.cos(enemy.turretAngle) * 860,
      muzzleY + Math.sin(enemy.turretAngle) * 860
    );
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawTankStatus(tank, isPlayer) {
    if (isPlayer || tank.hp >= tank.maxHp || tank.isBoss) return;
    const ratio = clamp(tank.hp / tank.maxHp, 0, 1);
    const barWidth = Math.max(30, tank.r * 1.7);
    const barY = tank.y - tank.r - 17;

    ctx.save();
    ctx.fillStyle = "rgba(5, 8, 5, 0.7)";
    ctx.fillRect(tank.x - barWidth / 2, barY, barWidth, 3);
    ctx.fillStyle = ratio > 0.5 ? tank.accent : ratio > 0.25 ? "#ffb25f" : "#ff5848";
    ctx.fillRect(tank.x - barWidth / 2, barY, barWidth * ratio, 3);
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "rgba(228, 239, 211, 0.24)";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(tank.x - barWidth / 2, barY, barWidth, 3);
    ctx.restore();
  }

  function drawTankEffects(tank, isPlayer) {
    const time = game ? game.time : menuClock;

    if (tank.isBoss && tank.specialWindup > 0) {
      const ratio = clamp(1 - tank.specialWindup / 0.9, 0, 1);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `rgba(255, 104, 69, ${0.24 + ratio * 0.52})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tank.x, tank.y, tank.r + 16 + (1 - ratio) * 22, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 174, 105, ${0.18 + ratio * 0.4})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(tank.x, tank.y, tank.r + 38 + ratio * 8, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    if (!isPlayer) return;

    if (tank.shield > 0) {
      const alpha = 0.36 + Math.sin(time * 3.5) * 0.08;
      ctx.save();
      ctx.translate(tank.x, tank.y);
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `rgba(116, 232, 224, ${alpha})`;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([14, 7]);
      ctx.beginPath();
      ctx.arc(0, 0, tank.r + 12, -time * 0.8, TAU - time * 0.8);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = `rgba(116, 232, 224, ${alpha * 0.45})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, tank.r + 15, time * 0.4, time * 0.4 + Math.PI * 0.55);
      ctx.stroke();
      ctx.restore();
    }

    if (tank.overdrive > 0) {
      ctx.save();
      ctx.translate(tank.x, tank.y);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 3; i += 1) {
        const offset = time * 2 + (i / 3) * TAU;
        ctx.strokeStyle = `rgba(255, 126, 69, ${0.16 + i * 0.05})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, tank.r + 7 + i * 4, offset, offset + 1.2);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (tank.invuln > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(216, 255, 88, 0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(tank.x, tank.y, tank.r + 7, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawWreck(wreck) {
    const fade = clamp((wreck.life - wreck.age) / 2.5, 0, 1);
    if (fade <= 0) return;
    const tank = {
      x: wreck.x,
      y: wreck.y,
      r: wreck.radius,
      hullAngle: wreck.hullAngle,
      turretAngle: wreck.turretAngle,
      recoil: 0,
      isBoss: wreck.type === "boss",
      spawnAnim: 1
    };
    drawTank(tank, { isWreck: true, alpha: fade * 0.86 });

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = fade * (0.12 + Math.sin(wreck.age * 4 + wreck.phase) * 0.04);
    ctx.fillStyle = "#ff9b56";
    ctx.beginPath();
    ctx.arc(wreck.x + 4, wreck.y + 3, wreck.radius * 0.2, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // ---------- Drawing: projectiles, pickups, particles ----------

  function drawBullet(bullet) {
    const speed = Math.hypot(bullet.vx, bullet.vy) || 1;
    const nx = bullet.vx / speed;
    const ny = bullet.vy / speed;
    const tail = bullet.tailLength || 16;
    const tailX = bullet.x - nx * tail;
    const tailY = bullet.y - ny * tail;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const gradient = ctx.createLinearGradient(tailX, tailY, bullet.x, bullet.y);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(0.45, bullet.color);
    gradient.addColorStop(1, bullet.coreColor);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = bullet.radius * (bullet.owner === "player" ? 0.9 : 1.1);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(bullet.x, bullet.y);
    ctx.stroke();

    const glow = ctx.createRadialGradient(
      bullet.x,
      bullet.y,
      0,
      bullet.x,
      bullet.y,
      bullet.radius * 4
    );
    glow.addColorStop(0, bullet.coreColor);
    glow.addColorStop(0.25, bullet.color);
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius * 4, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawPickup(pickup) {
    const info = PICKUPS[pickup.type];
    const bob = Math.sin(menuClock * 3.6 + pickup.phase) * 4;
    const blink = pickup.life < 3.5 ? 0.45 + Math.abs(Math.sin(pickup.life * 8)) * 0.55 : 1;

    ctx.save();
    ctx.globalAlpha = blink;
    ctx.translate(pickup.x, pickup.y + bob);

    ctx.globalCompositeOperation = "lighter";
    const groundGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, 38);
    groundGlow.addColorStop(0, info.glow);
    groundGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = groundGlow;
    ctx.beginPath();
    ctx.ellipse(0, 14, 30, 12, 0, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    ctx.strokeStyle = `${info.color}66`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 14, 22, 8, 0, 0, TAU);
    ctx.stroke();

    ctx.rotate(menuClock * 0.8 + pickup.phase);
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const angle = (i / 6) * TAU;
      const px = Math.cos(angle) * 17;
      const py = Math.sin(angle) * 17;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(10, 16, 9, 0.86)";
    ctx.fill();
    ctx.strokeStyle = info.color;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.rotate(-(menuClock * 0.8 + pickup.phase));

    ctx.fillStyle = info.color;
    ctx.strokeStyle = info.color;
    ctx.lineWidth = 2;
    if (pickup.type === "repair") {
      ctx.fillRect(-6, -2, 12, 4);
      ctx.fillRect(-2, -6, 4, 12);
    } else if (pickup.type === "shield") {
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(7, -4);
      ctx.lineTo(6, 4);
      ctx.lineTo(0, 8);
      ctx.lineTo(-6, 4);
      ctx.lineTo(-7, -4);
      ctx.closePath();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(2, -9);
      ctx.lineTo(-5, 1);
      ctx.lineTo(0, 1);
      ctx.lineTo(-2, 9);
      ctx.lineTo(6, -2);
      ctx.lineTo(1, -2);
      ctx.closePath();
      ctx.fill();
    }

    ctx.globalAlpha = blink * 0.45;
    ctx.fillStyle = info.color;
    ctx.font = "600 6px 'Cascadia Mono', Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText(info.label, 0, 31);
    ctx.restore();
  }

  function drawParticle(particle) {
    const progress = 1 - particle.life / particle.maxLife;
    const alpha = clamp(1 - progress, 0, 1);

    if (particle.type === "text") {
      ctx.save();
      ctx.globalAlpha = alpha * 0.9;
      ctx.fillStyle = particle.color;
      ctx.font = "600 9px 'Cascadia Mono', Consolas, monospace";
      ctx.textAlign = "center";
      ctx.fillText(particle.text, particle.x, particle.y);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    if (particle.type === "smoke") {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * (0.65 + progress * 0.8), 0, TAU);
      ctx.fill();
    } else if (particle.type === "debris") {
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.fillStyle = particle.color;
      ctx.fillRect(-particle.size / 2, -particle.size / 3, particle.size, particle.size * 0.66);
    } else if (particle.type === "ring") {
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = particle.color;
      ctx.globalAlpha = alpha * 0.55;
      ctx.lineWidth = Math.max(1, 2.2 * alpha);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, Math.max(2, particle.ringSize * progress), 0, TAU);
      ctx.stroke();
    } else if (particle.type === "flash") {
      ctx.globalCompositeOperation = "lighter";
      const radius = particle.size * (0.4 + progress * 1.2);
      const glow = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        radius
      );
      glow.addColorStop(0, particle.color);
      glow.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, radius, 0, TAU);
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = particle.color;
      const speed = Math.hypot(particle.vx, particle.vy);
      if (speed > 45) {
        ctx.lineWidth = particle.size;
        ctx.strokeStyle = particle.color;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(
          particle.x - particle.vx * 0.025,
          particle.y - particle.vy * 0.025
        );
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, Math.max(0.5, particle.size * alpha), 0, TAU);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function drawSpawnEffect(effect) {
    const progress = clamp(1 - effect.timer / effect.max, 0, 1);
    const config = ENEMY_TYPES[effect.type];
    const color = config ? config.accent : "#ff7a55";
    const radius = effect.type === "boss" ? 74 : 38;
    const pulse = 0.65 + Math.sin(menuClock * 16) * 0.12;

    ctx.save();
    ctx.translate(effect.x, effect.y);
    ctx.globalCompositeOperation = "lighter";

    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 1.6);
    glow.addColorStop(0, `rgba(255, 88, 61, ${0.14 + progress * 0.22})`);
    glow.addColorStop(0.55, "rgba(255, 88, 61, 0.08)");
    glow.addColorStop(1, "rgba(255, 88, 61, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.6, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.26 + progress * 0.5;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.arc(0, 0, radius * (1.4 - progress * 0.45), menuClock * 1.4, TAU + menuClock * 1.4);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.globalAlpha = 0.2 + progress * 0.45;
    for (let i = 0; i < 4; i += 1) {
      const angle = (i / 4) * TAU + progress * 0.4;
      const bx = Math.cos(angle) * radius * (1.25 - progress * 0.3);
      const by = Math.sin(angle) * radius * (1.25 - progress * 0.3);
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(angle);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, -6);
      ctx.lineTo(0, 0);
      ctx.lineTo(-6, 6);
      ctx.stroke();
      ctx.restore();
    }

    if (effect.type === "boss") {
      ctx.globalAlpha = pulse * (0.35 + progress * 0.3);
      ctx.strokeStyle = "#ff5b46";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius * (1 + (1 - progress) * 0.3), 0, TAU);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ---------- Drawing: HUD-world elements & reticle ----------

  function drawCrosshair() {
    if (state !== "playing" || !player || !player.alive) return;
    const aim = getAimPoint();
    const touch = isTouchDevice();
    const pulse = 1 + Math.sin(menuClock * 5) * 0.04;
    const reloadRatio = clamp(player.fireCooldown / Math.max(0.001, player.fireDelay), 0, 1);
    const size = touch ? 14 : 12;
    const color = player.overdrive > 0 ? "#ffe584" : "#d8ff58";

    ctx.save();
    ctx.translate(aim.x, aim.y);
    ctx.scale(pulse, pulse);
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.9;

    // Brackets.
    for (let i = 0; i < 4; i += 1) {
      ctx.save();
      ctx.rotate((i / 4) * TAU);
      ctx.beginPath();
      ctx.moveTo(size + 7, 0);
      ctx.lineTo(size + 15, 0);
      ctx.stroke();
      ctx.restore();
    }

    ctx.globalAlpha = 0.38;
    ctx.beginPath();
    ctx.arc(0, 0, size + 2, 0, TAU);
    ctx.stroke();

    // Reload arc.
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, size + 6, -Math.PI / 2, -Math.PI / 2 + (1 - reloadRatio) * TAU);
    ctx.stroke();

    ctx.globalAlpha = 0.95;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 1.7, 0, TAU);
    ctx.fill();

    if (game && game.hitMarker > 0) {
      ctx.globalAlpha = game.hitMarker / 0.11;
      ctx.strokeStyle = "#fff9df";
      ctx.lineWidth = 2;
      const d = 7;
      ctx.beginPath();
      ctx.moveTo(-d, -d);
      ctx.lineTo(d, d);
      ctx.moveTo(d, -d);
      ctx.lineTo(-d, d);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawWorldFurniture() {
    if (!game) return;

    for (const effect of game.spawnEffects) drawSpawnEffect(effect);

    for (const obstacle of game.obstacles) drawObstacle(obstacle);

    for (const pickup of game.pickups) drawPickup(pickup);
  }

  function drawMenuDust(time) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 34; i += 1) {
      const seedX = hash(i + 2);
      const seedY = hash(i + 47);
      const speed = 3 + (i % 4) * 1.2;
      const x = (seedX * WORLD.w + time * speed) % WORLD.w;
      const y = (seedY * WORLD.h - time * speed * 0.38 + WORLD.h) % WORLD.h;
      const alpha = 0.035 + (i % 5) * 0.012;
      ctx.fillStyle = `rgba(224, 190, 120, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.8 + (i % 3) * 0.55, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // ---------- Render pipeline ----------

  function render(now) {
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    ctx.clearRect(0, 0, view.w, view.h);

    if (state === "menu" || !game) {
      renderMenu(now / 1000);
      return;
    }

    let shakeX = 0;
    let shakeY = 0;
    if (state === "playing" || state === "dying") {
      const amount = game.shake;
      if (amount > 0.05) {
        shakeX = Math.sin(game.time * 117) * amount;
        shakeY = Math.cos(game.time * 93) * amount * 0.7;
      }
    }

    ctx.save();
    ctx.translate(view.x + shakeX, view.y + shakeY);
    ctx.scale(view.scale, view.scale);
    ctx.beginPath();
    ctx.rect(0, 0, WORLD.w, WORLD.h);
    ctx.clip();

    drawGround();
    drawDecals();

    for (const wreck of game.wrecks) drawWreck(wreck);

    drawWorldFurniture();

    for (const enemy of game.enemies) drawTank(enemy);

    if (player && player.alive) {
      drawTank(player, { isPlayer: true });
    }

    for (const bullet of game.bullets) drawBullet(bullet);

    for (const particle of game.particles) drawParticle(particle);

    drawCrosshair();

    ctx.restore();
  }

  function renderMenu(now) {
    const shake = 0;
    ctx.save();
    ctx.translate(view.x + shake, view.y);
    ctx.scale(view.scale, view.scale);
    ctx.beginPath();
    ctx.rect(0, 0, WORLD.w, WORLD.h);
    ctx.clip();

    drawGround();

    // A little atmosphere around the hero tank.
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const glow = ctx.createRadialGradient(
      menuHero.x,
      menuHero.y,
      20,
      menuHero.x,
      menuHero.y,
      280
    );
    glow.addColorStop(0, "rgba(216, 255, 88, 0.16)");
    glow.addColorStop(0.45, "rgba(216, 255, 88, 0.055)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(menuHero.x - 300, menuHero.y - 300, 600, 600);

    const pool = ctx.createRadialGradient(
      menuHero.x,
      menuHero.y + 18,
      4,
      menuHero.x,
      menuHero.y + 18,
      120
    );
    pool.addColorStop(0, "rgba(216, 255, 88, 0.09)");
    pool.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = pool;
    ctx.beginPath();
    ctx.ellipse(menuHero.x, menuHero.y + 18, 120, 62, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    for (const obstacle of menuObstacles) drawObstacle(obstacle);

    for (const wreck of menuWrecks) {
      drawTank(
        {
          x: wreck.x,
          y: wreck.y,
          r: wreck.r,
          hullAngle: wreck.hullAngle,
          turretAngle: wreck.turretAngle,
          recoil: 0,
          isBoss: false,
          spawnAnim: 1
        },
        { isWreck: true, alpha: 0.76 }
      );
      const smokeAlpha = 0.12 + Math.sin(now * 0.7 + wreck.x) * 0.04;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = `rgba(255, 142, 79, ${smokeAlpha})`;
      ctx.beginPath();
      ctx.arc(wreck.x + 3, wreck.y - 4, wreck.r * 0.23, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    drawTank(menuHero, { isPlayer: true });
    drawMenuDust(now);

    // Fine registration lines at the edges of the battlefield.
    ctx.strokeStyle = "rgba(216, 255, 88, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(58, WORLD.h / 2);
    ctx.lineTo(82, WORLD.h / 2);
    ctx.moveTo(WORLD.w - 58, WORLD.h / 2);
    ctx.lineTo(WORLD.w - 82, WORLD.h / 2);
    ctx.stroke();

    ctx.restore();
  }

  // ---------- Touch sticks ----------

  function setupStick(zone, onMove, onEnd) {
    if (!zone) return;
    const knob = zone.querySelector(".stick-knob");
    const base = zone.querySelector(".stick-base");
    let pointerId = null;

    const update = (event) => {
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const maxRadius = rect.width * 0.3;
      let dx = event.clientX - cx;
      let dy = event.clientY - cy;
      const length = Math.hypot(dx, dy);
      if (length > maxRadius) {
        dx = (dx / length) * maxRadius;
        dy = (dy / length) * maxRadius;
      }
      knob.style.setProperty("--knob-x", `${dx}px`);
      knob.style.setProperty("--knob-y", `${dy}px`);
      zone.classList.add("is-active");
      onMove(dx / maxRadius, dy / maxRadius, Math.hypot(dx, dy) / maxRadius);
    };

    const end = () => {
      if (pointerId === null) return;
      pointerId = null;
      zone.classList.remove("is-active");
      knob.style.setProperty("--knob-x", "0px");
      knob.style.setProperty("--knob-y", "0px");
      onEnd();
    };

    zone.addEventListener("pointerdown", (event) => {
      if (pointerId !== null) return;
      pointerId = event.pointerId;
      zone.setPointerCapture(pointerId);
      event.preventDefault();
      audio.ensure();
      update(event);
    });

    zone.addEventListener("pointermove", (event) => {
      if (event.pointerId !== pointerId) return;
      event.preventDefault();
      update(event);
    });

    zone.addEventListener("pointerup", (event) => {
      if (event.pointerId !== pointerId) return;
      event.preventDefault();
      end();
    });

    zone.addEventListener("pointercancel", (event) => {
      if (event.pointerId !== pointerId) return;
      end();
    });

    zone.addEventListener("lostpointercapture", () => {
      if (pointerId !== null) end();
    });
  }

  function resetStick(zone) {
    if (!zone) return;
    const knob = zone.querySelector(".stick-knob");
    zone.classList.remove("is-active");
    if (knob) {
      knob.style.setProperty("--knob-x", "0px");
      knob.style.setProperty("--knob-y", "0px");
    }
  }

  // ---------- Event binding ----------

  function handleViewportChange() {
    resizeCanvas();
    if (isTouchDevice() && window.innerHeight > window.innerWidth && state === "playing") {
      pauseGame();
    }
  }

  function bindEvents() {
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("orientationchange", () => {
      setTimeout(handleViewportChange, 140);
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", resizeCanvas);
    }

    document.addEventListener("pointerdown", () => {
      audio.ensure();
    }, { once: true });

    window.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      updateMouseWorld(event.clientX, event.clientY);
      input.mouse.active = true;
      input.mouse.inside = true;
    }, { passive: true });

    document.addEventListener("touchstart", () => {
      if (document.body.dataset.touch === "true") return;
      document.body.dataset.touch = "true";
      if (el.startHint.classList.contains("is-active")) showStartHint();
    }, { passive: true, once: true });

    canvas.addEventListener("pointerleave", () => {
      input.mouse.inside = false;
      if (input.mouse.down) input.mouse.down = false;
    });

    canvas.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch") return;
      if (event.button !== 0) return;
      if (state !== "playing") return;
      event.preventDefault();
      input.mouse.down = true;
      updateMouseWorld(event.clientX, event.clientY);
      input.mouse.active = true;
      input.mouse.inside = true;
      audio.ensure();
    });

    window.addEventListener("pointerup", (event) => {
      if (event.pointerType === "touch") return;
      if (event.button === 0) input.mouse.down = false;
    });

    window.addEventListener("blur", () => {
      input.mouse.down = false;
      if (state === "playing") pauseGame();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && state === "playing") {
        pauseGame();
      }
    });

    canvas.addEventListener("contextmenu", (event) => event.preventDefault());

    document.addEventListener("keydown", (event) => {
      const code = event.code;
      if (
        code === "Space" ||
        code === "ArrowUp" ||
        code === "ArrowDown" ||
        code === "ArrowLeft" ||
        code === "ArrowRight"
      ) {
        event.preventDefault();
      }

      if (event.repeat) return;

      if (code === "KeyM") {
        toggleMute();
        return;
      }

      if (code === "Escape" || code === "KeyP") {
        if (state === "playing" || state === "paused") {
          event.preventDefault();
          togglePause();
        }
        return;
      }

      if (code === "Enter") {
        if (state === "menu" || state === "gameover") {
          event.preventDefault();
          startGame();
        } else if (state === "paused") {
          event.preventDefault();
          resumeGame();
        }
        return;
      }

      if (state !== "playing") return;

      if (code === "ShiftLeft" || code === "ShiftRight") {
        triggerDash();
        return;
      }

      input.keys.add(code);
    });

    document.addEventListener("keyup", (event) => {
      input.keys.delete(event.code);
    });

    el.startButton.addEventListener("click", () => {
      if (state === "menu") startGame();
    });

    el.pauseButton.addEventListener("click", () => {
      if (state === "playing") pauseGame();
    });

    el.resumeButton.addEventListener("click", () => {
      if (state === "paused") resumeGame();
    });

    el.pauseRestartButton.addEventListener("click", () => {
      if (state === "paused") startGame();
    });

    el.pauseMenuButton.addEventListener("click", () => {
      if (state === "paused") returnToMenu();
    });

    el.restartButton.addEventListener("click", () => {
      if (state === "gameover") startGame();
    });

    el.menuButton.addEventListener("click", () => {
      if (state === "gameover") returnToMenu();
    });

    for (const button of el.soundToggles) {
      button.addEventListener("click", () => {
        toggleMute();
      });
    }

    el.touchDash.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      triggerDash();
    });

    setupStick(
      el.moveStick,
      (x, y, magnitude) => {
        input.touch.moveActive = magnitude > 0.1;
        input.touch.moveX = x;
        input.touch.moveY = y;
      },
      () => {
        input.touch.moveActive = false;
        input.touch.moveX = 0;
        input.touch.moveY = 0;
      }
    );

    setupStick(
      el.aimStick,
      (x, y, magnitude) => {
        if (magnitude > 0.16) {
          input.touch.aimAngle = Math.atan2(y, x);
          input.touch.aimActive = true;
          input.touch.firing = true;
        } else {
          input.touch.aimActive = false;
          input.touch.firing = false;
        }
      },
      () => {
        input.touch.aimActive = false;
        input.touch.firing = false;
      }
    );
  }

  // ---------- Main loop ----------

  function loop(now) {
    const dt = clamp((now - lastFrame) / 1000, 0, 0.04);
    lastFrame = now;
    menuClock += dt;

    if (state === "playing") {
      updateGame(dt);
    } else if (state === "dying") {
      updateDying(dt);
    } else if (state === "menu") {
      updateMenu(dt);
    }

    render(now);
    requestAnimationFrame(loop);
  }

  // ---------- Boot ----------

  function init() {
    document.body.dataset.muted = String(audio.muted);
    document.body.dataset.touch = String(window.matchMedia("(pointer: coarse)").matches);

    menuObstacles = createObstacleList();
    groundCanvas = createGroundCanvas();
    resizeCanvas();
    updateBestUi();
    refreshSoundButtons();
    bindEvents();
    setState("menu");
    requestAnimationFrame(loop);
  }

  init();
})();

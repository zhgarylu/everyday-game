(() => {
  'use strict';

  /* ============================================================================
     1. GAME CONSTANTS, 10 MARTIAL FORMS & 6 EVOLVING WORLD ZONES
     ============================================================================ */
  const TAU = Math.PI * 2;
  const BPM = 132.0;
  const BEAT_SEC = 60 / BPM;

  const START_X = 360;
  const WORLD_LEN = 11200;
  const BOSS_ARENA_LEFT = 9050;
  const BOSS_ARENA_RIGHT = 10180;
  const BOSS_X = 9780;
  const FLAG_X = 10480;
  const CASTLE_X = 10760;

  const FORMS = [
    {
      id: 0, key: '1', short: '拳', cn: '烈火铁拳', en: 'BLAZING FIST',
      primary: '#E63946', secondary: '#FFD166', accent: '#FF6B2B', aura: '255, 120, 45',
      ultCn: '烈焰冲天拳', ultEn: 'SKYFIRE RISING FIST',
      moves: ['爆炎寸拳', '烈焰勾拳', '冲天破'], range: 78, dmg: 18
    },
    {
      id: 1, key: '2', short: '龙', cn: '双棍猛龙', en: 'TWIN-STAFF DRAGON',
      primary: '#F4D35E', secondary: '#111827', accent: '#FF9F1C', aura: '255, 180, 35',
      ultCn: '狂龙百裂脚', ultEn: 'HUNDRED-KICK GOLDEN DRAGON',
      moves: ['音速扫腿', '双截棍旋风', '猛龙飞踢'], range: 86, dmg: 17
    },
    {
      id: 2, key: '3', short: '剑', cn: '水墨剑圣', en: 'INK-WASH SWORDMASTER',
      primary: '#E2E8F0', secondary: '#0F172A', accent: '#38BDF8', aura: '56, 189, 248',
      ultCn: '青莲万剑归宗', ultEn: 'LOTUS TEN THOUSAND SWORDS',
      moves: ['青莲拔刀', '水墨剑气', '孤影居合'], range: 102, dmg: 20
    },
    {
      id: 3, key: '4', short: '极', cn: '太极宗师', en: 'TAI CHI GRANDMASTER',
      primary: '#F8FAFC', secondary: '#090D16', accent: '#CBD5E1', aura: '226, 232, 240',
      ultCn: '两仪八卦乾坤阵', ultEn: 'YIN-YANG BAGUA SINGULARITY',
      moves: ['云手推掌', '四两拨千斤', '阴阳震劲'], range: 92, dmg: 18
    },
    {
      id: 4, key: '5', short: '佛', cn: '金刚武圣', en: 'GOLDEN PALM GRANDMASTER',
      primary: '#F59E0B', secondary: '#B91C1C', accent: '#FEF08A', aura: '245, 158, 11',
      ultCn: '天降金刚神掌', ultEn: 'CELESTIAL GOLDEN PALM',
      moves: ['金刚推掌', '降龙气浪', '佛光裂地'], range: 96, dmg: 22
    },
    {
      id: 5, key: '6', short: '雷', cn: '雷影刺客', en: 'THUNDER SHADOW',
      primary: '#6366F1', secondary: '#22D3EE', accent: '#F43F5E', aura: '34, 211, 238',
      ultCn: '紫电·瞬身九连斩', ultEn: 'THUNDERCLAP NINE-FOLD FLASH',
      moves: ['雷电苦无', '影步连切', '紫电突刺'], range: 90, dmg: 19
    },
    {
      id: 6, key: '7', short: '枪', cn: '风火枪圣', en: 'WIND-FIRE SPEAR SAINT',
      primary: '#EF4444', secondary: '#FBBF24', accent: '#FF5722', aura: '255, 87, 34',
      ultCn: '风火轮·百鸟朝凤枪', ultEn: 'PHOENIX SPEAR SOVEREIGN',
      moves: ['火尖直刺', '风火横扫', '回马挑枪'], range: 118, dmg: 21
    },
    {
      id: 7, key: '8', short: '冰', cn: '寒冰拳尊', en: 'FROST FIST',
      primary: '#67E8F9', secondary: '#0F172A', accent: '#E0F2FE', aura: '103, 232, 249',
      ultCn: '绝对零度·冰河碎星', ultEn: 'ABSOLUTE ZERO GLACIER SHATTER',
      moves: ['霜晶直拳', '极寒冻气', '冰河升龙'], range: 86, dmg: 19
    },
    {
      id: 8, key: '9', short: '甲', cn: '赛博机甲武士', en: 'CYBER MECHA RONIN',
      primary: '#EC4899', secondary: '#09090B', accent: '#00F5D4', aura: '236, 72, 153',
      ultCn: '次元斩·霓虹超载', ultEn: 'DIMENSIONAL NEON OVERDRIVE',
      moves: ['等离子斩', '霓虹弧光', '超载居合'], range: 106, dmg: 22
    },
    {
      id: 9, key: '0', short: '神', cn: '混元武神', en: 'PRIMORDIAL MARTIAL GOD',
      primary: '#F8FAFC', secondary: '#38BDF8', accent: '#A855F7', aura: '168, 85, 247',
      ultCn: '混元·破空拳', ultEn: 'COSMIC SUPERNOVA ANNIHILATION',
      moves: ['星辰连拳', '混元弹反', '宇宙虹光'], range: 112, dmg: 25
    }
  ];

  const ZONES = [
    { id: 0, start: 0,    name: '第一关 · 青竹镇',   skyTop: [96, 150, 200], skyBot: [214, 226, 228], ground: '#3a3a3e', trim: '#e8c060' },
    { id: 1, start: 1800, name: '第二关 · 落日关',   skyTop: [52, 20, 60],   skyBot: [230, 110, 70],  ground: '#2e1e22', trim: '#f4a63a' },
    { id: 2, start: 3600, name: '第三关 · 水墨竹林', skyTop: [28, 44, 52],   skyBot: [120, 150, 154], ground: '#1a2428', trim: '#9fd8d0' },
    { id: 3, start: 5400, name: '第四关 · 金顶寺',   skyTop: [90, 50, 20],   skyBot: [230, 170, 90],  ground: '#3a2416', trim: '#f5c04a' },
    { id: 4, start: 7200, name: '第五关 · 霓虹夜市', skyTop: [8, 6, 26],     skyBot: [50, 22, 82],    ground: '#141024', trim: '#ec4899' },
    { id: 5, start: 9000, name: '第六关 · 赤鬼擂台', skyTop: [30, 4, 8],     skyBot: [120, 24, 20],   ground: '#1e0c0e', trim: '#ef4444' }
  ];

  /* ============================================================================
     2. MATH HELPERS & DETERMINISTIC PRNG
     ============================================================================ */
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (e0, e1, x) => {
    const t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(t, 0, 1)));

  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function lerpRGB(a, b, t) {
    return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;
  }

  function getRankInfo(combo, score) {
    const val = combo * 2.5 + score / 1500;
    if (combo >= 36 || val >= 115) return { letter: 'SSS', label: '武神降世', col: '#a855f7' };
    if (combo >= 24 || val >= 80)  return { letter: 'SS',  label: '无双宗师', col: '#38bdf8' };
    if (combo >= 15 || val >= 50)  return { letter: 'S',   label: '登峰造极', col: '#ffd166' };
    if (combo >= 10 || val >= 30)  return { letter: 'A',   label: '行云流水', col: '#ff6b2b' };
    if (combo >= 6  || val >= 18)  return { letter: 'B',   label: '势如破竹', col: '#22c55e' };
    if (combo >= 3  || val >= 8)   return { letter: 'C',   label: '初露锋芒', col: '#94a3b8' };
    return { letter: 'D', label: '蓄势待发', col: '#64748b' };
  }

  /* ============================================================================
     3. WEB AUDIO API — 132 BPM CHIPTUNE × GUOFENG PENTATONIC SYNTH + SFX
     ============================================================================ */
  const audio = {
    ctx: null, comp: null, master: null, delayBus: null, pulse25: null, noiseBuf: null, lastStep: -1,

    init() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();

      this.comp = this.ctx.createDynamicsCompressor();
      this.comp.threshold.value = -13;
      this.comp.ratio.value = 4.5;

      this.master = this.ctx.createGain();
      this.master.gain.value = 0.32;
      this.comp.connect(this.master);
      this.master.connect(this.ctx.destination);

      const real = new Float32Array(28);
      const imag = new Float32Array(28);
      for (let n = 1; n < 28; n++) imag[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * 0.25);
      this.pulse25 = this.ctx.createPeriodicWave(real, imag);

      this.delayBus = this.ctx.createGain();
      this.delayBus.gain.value = 0.25;
      const d1 = this.ctx.createDelay(1.0);
      d1.delayTime.value = BEAT_SEC * 0.75;
      const fb = this.ctx.createGain();
      fb.gain.value = 0.26;
      this.delayBus.connect(d1);
      d1.connect(fb);
      fb.connect(d1);
      d1.connect(this.comp);

      const len = Math.floor(this.ctx.sampleRate * 0.7);
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const ch = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
    },

    resume() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },

    tone(freq, dur, vol = 0.09, type = 'pulse', slideTo = null, delayOff = 0) {
      if (!state.soundOn || !this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime + delayOff;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      if (type === 'pulse' && this.pulse25) osc.setPeriodicWave(this.pulse25);
      else osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(22, slideTo), now + dur);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0008, now + dur);
      osc.connect(g); g.connect(this.comp); g.connect(this.delayBus);
      osc.start(now); osc.stop(now + dur + 0.02);
    },

    noise(dur, vol = 0.14, hpFreq = 400, lpFreq = 5000, delayOff = 0) {
      if (!state.soundOn || !this.ctx || this.ctx.state !== 'running' || !this.noiseBuf) return;
      const now = this.ctx.currentTime + delayOff;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const hp = this.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.setValueAtTime(hpFreq, now);
      const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(lpFreq, now);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(this.comp);
      src.start(now); src.stop(now + dur + 0.02);
    },

    sfx(type) {
      if (!state.soundOn || !this.ctx || this.ctx.state !== 'running') return;
      switch (type) {
        case 'jump': this.tone(300, 0.12, 0.08, 'pulse', 740); break;
        case 'doubleJump': this.tone(440, 0.13, 0.08, 'pulse', 980); break;
        case 'dash': this.noise(0.11, 0.12, 1800, 9500); this.tone(520, 0.09, 0.06, 'sine', 180); break;
        case 'coin':
          this.tone(987.77, 0.07, 0.09, 'pulse', null, 0);
          this.tone(1318.51, 0.22, 0.09, 'pulse', null, 0.068);
          break;
        case 'heal':
          [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 0.14, 0.08, 'triangle', null, i * 0.055));
          break;
        case 'brick': this.noise(0.14, 0.15, 180, 2200); this.tone(160, 0.11, 0.12, 'triangle', 50); break;
        case 'punch': this.noise(0.08, 0.16, 220, 2800); this.tone(195, 0.09, 0.15, 'triangle', 48); break;
        case 'heavy': this.noise(0.13, 0.20, 120, 2200); this.tone(135, 0.14, 0.19, 'sawtooth', 38); break;
        case 'slash': this.noise(0.11, 0.15, 2800, 12000); this.tone(1360, 0.10, 0.08, 'sawtooth', 360); break;
        case 'hurt': this.tone(190, 0.22, 0.16, 'sawtooth', 55); this.noise(0.18, 0.16, 100, 1400); break;
        case 'thunder': this.noise(0.36, 0.22, 800, 9000); this.tone(860, 0.26, 0.11, 'sawtooth', 110); break;
        case 'ice':
          [1760, 2349, 2793, 3520].forEach((f, i) => this.tone(f, 0.16, 0.06, 'sine', f * 0.88, i * 0.03));
          this.noise(0.22, 0.16, 3800, 14000, 0.04);
          break;
        case 'laser': this.tone(1480, 0.18, 0.10, 'sawtooth', 180); this.tone(740, 0.22, 0.09, 'pulse', 90, 0.04); break;
        case 'phoenix': this.tone(660, 0.34, 0.11, 'sawtooth', 1420); this.noise(0.35, 0.18, 600, 5200); break;
        case 'palm': this.tone(105, 0.48, 0.25, 'sine', 26); this.noise(0.30, 0.20, 80, 1400); break;
        case 'transform':
          [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => this.tone(f, 0.18, 0.08, 'pulse', null, i * 0.05));
          break;
        case 'ult':
          this.tone(190, 0.38, 0.15, 'sawtooth', 940);
          this.tone(95, 0.45, 0.20, 'sine', 34, 0.08);
          this.noise(0.38, 0.17, 450, 7500);
          break;
        case 'roar': this.tone(130, 0.45, 0.18, 'sawtooth', 52); this.noise(0.42, 0.18, 120, 950); break;
        case 'victory':
          [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5, 1567.98].forEach((f, i) =>
            this.tone(f, i === 7 ? 0.6 : 0.13, 0.10, 'pulse', null, i * 0.095)
          );
          break;
      }
    },

    updateBGM(totalTime) {
      if (!state.soundOn || state.mode !== 'playing' || !this.ctx || this.ctx.state !== 'running') return;
      const step16 = Math.floor((totalTime / BEAT_SEC) * 4);
      if (step16 === this.lastStep) return;
      this.lastStep = step16;
      const pos = step16 % 16;
      const bar = Math.floor(step16 / 16);

      if (pos === 0 || pos === 6 || pos === 10) this.tone(148, 0.19, 0.20, 'sine', 36);
      if (pos === 4 || pos === 12) this.noise(0.085, 0.10, 950, 6800);
      if (pos % 2 === 1) this.noise(0.022, 0.024, 9200, 15000);

      const roots = state.bossLocked ? [110.00, 116.54, 130.81, 123.47] : [130.81, 146.83, 164.81, 196.00];
      const root = roots[bar % roots.length];
      if (pos % 2 === 0) this.tone(pos % 4 === 2 ? root * 1.5 : root, BEAT_SEC * 0.42, 0.11, 'triangle');

      const penta = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.5, 1174.66, 1318.51];
      const arpMask = [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1];
      if (arpMask[pos]) this.tone(penta[(pos + bar * 3) % penta.length], 0.14, 0.04, 'triangle');
      if (pos === 0 || pos === 3 || pos === 8 || pos === 11) this.tone(penta[(pos * 2 + bar) % 6], 0.13, 0.032, 'pulse');
    }
  };

  /* ============================================================================
     4. INPUT SYSTEM (KEYBOARD + TOUCH + JUMP BUFFERING)
     ============================================================================ */
  const input = {
    left: false, right: false, jumpHeld: false,
    jumpBuffer: 0, attackBuffer: 0, dashBuffer: 0, ultBuffer: 0
  };

  function clearInputs() {
    input.left = false; input.right = false; input.jumpHeld = false;
    input.jumpBuffer = 0; input.attackBuffer = 0; input.dashBuffer = 0; input.ultBuffer = 0;
  }

  /* ============================================================================
     5. GAME STATE, CAMERA & SAKUGA JUICE
     ============================================================================ */
  const state = {
    mode: 'title', // 'title' | 'playing' | 'paused' | 'gameover' | 'clear'
    bloomOn: true,
    soundOn: true, // Auto-arms cleanly on first click/key!
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    totalTime: 0,
    playTime: 0,
    frame: 0,
    lastTs: 0,

    // Centered Spring Camera (42%-49% with facing look-ahead)
    camX: 0,
    camVelX: 0,
    heroRatio: 0.44,
    camZoom: 1.0,
    targetZoom: 1.0,
    shakeMag: 0,
    shakeDirX: 0,
    shakeDirY: 0,
    shakeX: 0,
    shakeY: 0,

    // Sakuga Combat Juice
    hitStop: 0,
    impactFrame: 0,
    chromaPulse: 0,
    domainAlpha: 0,
    domainForm: 0,
    hurtFlash: 0,

    // Score, Rank, Chi & Progression
    score: 0,
    coins: 0,
    combo: 0,
    maxCombo: 0,
    comboTimer: 0,
    chi: 120,      // 0..300 (starts with 1 bar ready!)
    maxChi: 300,
    bossLocked: false,
    bossDefeated: false,
    flagSliding: false,
    flagTimer: 0,
    moveLog: [],
    best: 0,

    cutIn: { active: false, timer: 0, dur: 1.2, cn: '', en: '', color: '#ffd166', secondary: '#e63946', formId: 0 }
  };

  function saveBest() {
    if (state.score > state.best) { state.best = state.score; try { localStorage.setItem('echo_wushu_best', '' + state.best); } catch (e) { /* 存不了就算了 */ } }
  }
  try { state.best = +localStorage.getItem('echo_wushu_best') || 0; } catch (e) { /* 忽略 */ }
  function logMove(text) {
    if (state.moveLog[state.moveLog.length - 1] === text) return;
    state.moveLog.push(text);
    if (state.moveLog.length > 3) state.moveLog.shift();
  }

  function addScore(pts, x, y, label = null, col = '#ffd166', crit = false) {
    state.score += pts;
    state.combo++;
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;
    state.comboTimer = 3.2;
    state.chi = Math.min(state.maxChi, state.chi + (crit ? 20 : 12));
    world.popups.push({ x, y, text: label || `+${pts}`, col, life: 1.0, vy: -85, big: !!label || crit });
  }

  function triggerShake(mag, dx = 0, dy = 0) {
    state.shakeMag = Math.max(state.shakeMag, mag);
    state.shakeDirX = dx;
    state.shakeDirY = dy;
  }

  /* ============================================================================
     6. PLAYABLE HERO ENTITY (PHYSICS, COMBOS, DASH, 10 FORMS)
     ============================================================================ */
  const hero = {
    x: START_X, y: 0, vx: 0, vy: 0,
    w: 28, h: 54,
    facing: 1,
    onGround: true,
    coyote: 0,
    jumpsLeft: 2,

    hp: 5, maxHp: 5,
    invuln: 0,

    // Combat & Combo State
    form: 0,
    pose: 'idle',
    poseTimer: 0,
    comboStep: 0,      // 0, 1, 2 (3-hit chain)
    comboWindow: 0,
    attackTimer: 0,
    attackCd: 0,

    // Dash / Shunpo
    dashTimer: 0,
    dashCd: 0,

    // Animation & Rig
    runCycle: 0,
    spinAng: 0,
    scarf: Array.from({ length: 10 }, () => ({ x: START_X, y: 42 })),
    weaponTrail: [],
    ghosts: [],
    transformFlash: 0,
    ult: { active: false, form: 0, timer: 0, dur: 0, phase: 0, data: {} },
    pending: [], wasGround: true,

    reset() {
      this.pending = []; this.wasGround = true;
      this.x = START_X; this.y = 0; this.vx = 0; this.vy = 0;
      this.facing = 1; this.onGround = true; this.coyote = 0; this.jumpsLeft = 2;
      this.hp = 5; this.maxHp = 5; this.invuln = 0;
      this.form = 0; this.pose = 'idle'; this.poseTimer = 0;
      this.comboStep = 0; this.comboWindow = 0; this.attackTimer = 0; this.attackCd = 0;
      this.dashTimer = 0; this.dashCd = 0;
      this.runCycle = 0; this.spinAng = 0;
      this.weaponTrail = []; this.ghosts = []; this.transformFlash = 0;
      this.ult = { active: false, form: 0, timer: 0, dur: 0, phase: 0, data: {} };
      for (const n of this.scarf) { n.x = this.x; n.y = 42; }
    },

    setForm(newForm, bonusRefill = false) {
      this.form = (newForm + FORMS.length) % FORMS.length;
      this.transformFlash = 1.0;
      const f = FORMS[this.form];
      audio.sfx('transform');
      triggerShake(9);
      state.chromaPulse = Math.max(state.chromaPulse, 0.45);
      if (bonusRefill) {
        state.chi = Math.min(state.maxChi, state.chi + 100);
        this.hp = Math.min(this.maxHp, this.hp + 1);
      }
      logMove(`> [形态切换] ${String(this.form + 1).padStart(2, '0')} · ${f.cn} (${f.en})`);
      world.shockwaves.push({ x: this.x, y: this.y + 30, r: 10, maxR: 180, col: f.primary, life: 0.9, lw: 6 });
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * TAU, sp = 140 + Math.random() * 240;
        world.particles.push({
          x: this.x, y: this.y + 30, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          col: i % 2 ? f.primary : f.accent, size: 3.5, life: 0.85, grav: 0
        });
      }
      world.popups.push({ x: this.x, y: this.y + 82, text: `${f.cn}!`, col: f.primary, life: 1.15, vy: -45, big: true });
      updateUI();
    },

    takeDamage(dmg, knockDir) {
      if (this.invuln > 0 || this.dashTimer > 0 || this.ult.active || state.flagSliding) return;
      this.hp = Math.max(0, this.hp - dmg);
      this.invuln = 1.35;
      this.vx = knockDir * 290;
      this.vy = 320;
      this.onGround = false;
      state.hurtFlash = 0.85;
      state.combo = 0;
      state.hitStop = 0.055;
      triggerShake(16, knockDir, 0);
      audio.sfx('hurt');
      world.popups.push({ x: this.x, y: this.y + 62, text: `-${dmg} HP`, col: '#ef4444', life: 1.0, vy: -60, big: true });
      if (this.hp <= 0) {
        state.mode = 'gameover';
        saveBest();
        updateUI();
      }
    }
  };

  /* ============================================================================
     7. LEVEL GENERATION (PLATFORMS, PIPES, BRICKS, COINS, ENEMIES, BOSS)
     ============================================================================ */
  const world = {
    blocks: [], pipes: [], platforms: [], coins: [], mushrooms: [],
    enemies: [], projectiles: [],
    particles: [], slashes: [], shockwaves: [], popups: [], debris: [],
    boss: null,

    reset() {
      this.blocks = []; this.pipes = []; this.platforms = [];
      this.coins = []; this.mushrooms = [];
      this.enemies = []; this.projectiles = [];
      this.particles = []; this.slashes = []; this.shockwaves = [];
      this.popups = []; this.debris = [];

      const rng = mulberry32(20260777);

      const addCluster = (startX, y, pattern) => {
        for (let i = 0; i < pattern.length; i++) {
          const ch = pattern[i];
          if (ch === ' ') continue;
          let scrollForm = -1;
          if (ch >= '2' && ch <= '9') scrollForm = parseInt(ch, 10) - 1;
          else if (ch === '0') scrollForm = 9;
          this.blocks.push({
            x: startX + i * 36, y, w: 36, h: 36,
            type: scrollForm >= 0 ? 'S' : ch,
            hit: false, alive: true, bump: 0, scrollForm,
            hasMushroom: ch === 'M'
          });
        }
      };

      // Opening warm-up blocks & coins
      addCluster(540, 128, 'B?MB');
      for (let i = 0; i < 4; i++) this.coins.push({ x: 560 + i * 36, y: 196, got: false });

      const scrollKeys = ['', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
      const segEnemies = [
        ['lantern', 'lantern', 'terra'],
        ['lantern', 'terra', 'kite'],
        ['kite', 'lantern', 'arrow'],
        ['terra', 'monk', 'lantern'],
        ['monk', 'lantern', 'lantern'],
        ['arrow', 'kite', 'terra'],
        ['monk', 'terra', 'lantern'],
        ['kite', 'arrow', 'lantern'],
        ['arrow', 'monk', 'terra'],
        ['kite', 'monk', 'lantern']
      ];

      // 9 Action Segments spanning x = 800..8900 before Boss Arena
      for (let seg = 0; seg < 9; seg++) {
        const base = 820 + seg * 900;

        // Glowing 「武」 Martial Scroll Block
        addCluster(base, 126, scrollKeys[seg + 1]);

        // Classic bricks + Mushroom ? block + Floating platform with coin arc
        addCluster(base + 230, 130, seg % 2 === 0 ? 'B?BB' : 'BBMB');
        this.platforms.push({ x: base + 440, y: 135 + (seg % 2) * 30, w: 150 });
        for (let c = 0; c < 4; c++) {
          this.coins.push({ x: base + 462 + c * 34, y: 175 + (seg % 2) * 30, got: false });
        }

        // Warp Pipe with coin jump arc
        const ph = 74 + (seg % 3) * 14;
        this.pipes.push({ x: base + 690, w: 48, h: ph, piranha: seg % 2 === 1, piranhaAlive: true });
        this.coins.push(
          { x: base + 668, y: ph + 56, got: false },
          { x: base + 714, y: ph + 78, got: false },
          { x: base + 760, y: ph + 56, got: false }
        );

        // Varied Enemies
        const types = segEnemies[seg];
        for (let k = 0; k < 9; k++) {          // 怪多一点，打起来更爽
          const ex = base + 130 + k * 82 + rng() * 30;
          const et = types[k % types.length];
          const isAir = et === 'kite' || et === 'arrow';
          this.enemies.push({
            type: et, x: ex, y: isAir ? 95 + rng() * 80 : 0,
            vx: et === 'arrow' ? -230 : -52 - seg * 3, vy: 0,
            hp: et === 'monk' ? 45 : et === 'terra' ? 30 : 18,
            maxHp: et === 'monk' ? 45 : et === 'terra' ? 30 : 18, squash: 0,
            alive: true, launched: false, rot: 0, cd: 0.8 + rng(),
            marked: false, frozen: 0, flash: 0, seed: rng() * 10
          });
        }
      }

      // Pre-Boss Supply: Ultra Martial God Scroll + Health Mushroom!
      addCluster(8880, 126, '0M');

      // Boss Arena Floating Platforms (擂台两侧的浮台，躲火球用)
      this.platforms.push(
        { x: 9220, y: 135, w: 140 },
        { x: 9840, y: 135, w: 140 }
      );

      // 首领：赤鬼王
      this.boss = {
        x: BOSS_X, y: 0, vx: 0, vy: 0, facing: -1,
        hp: 420, maxHp: 420,
        alive: true, defeated: false, enraged: false,
        rot: 0, state: 'idle', stateTimer: 1.0,
        fireCd: 1.4, hopCd: 2.2, flash: 0
      };
    }
  };

  /* ============================================================================
     8. COMBAT ENGINE: 3-HIT COMBOS, FORM PROJECTILES & 10 DOMAIN ULTIMATES
     ============================================================================ */
  function launchEnemy(e, vx, vy, kanji = '破!', col = '#ffd166', crit = false) {
    if (!e.alive) return;
    e.alive = false;
    e.launched = true;
    e.vx = vx;
    e.vy = vy;
    e.flyT = 0;
    addScore(crit ? 600 : 350, e.x, e.y + 32, kanji, col, crit);
    world.slashes.push({ type: 'burst', x: e.x, y: e.y + 20, r: crit ? 58 : 44, col, life: 0.3, rot: Math.random() * 3 });
    for (let i = 0; i < 20; i++) {
      const a = Math.random() * TAU, sp = 200 + Math.random() * 420;
      world.particles.push({ x: e.x, y: e.y + 20, vx: Math.cos(a) * sp + vx * 0.3, vy: Math.sin(a) * sp, col: i % 4 ? col : '#ffffff', size: 3.5, life: 0.8, grav: 420 });
    }
    // 碎块：按敌人种类掉不同颜色的碎片
    const dc = e.type === 'lantern' ? '#d92c22' : e.type === 'terra' ? '#a66a42' : e.type === 'kite' ? '#f3e6c8' : e.type === 'monk' ? '#d9772b' : '#9a6a3a';
    for (let i = 0; i < 5; i++) world.debris.push({ x: e.x, y: e.y + 20, vx: (Math.random() - 0.5) * 420 + vx * 0.3, vy: 200 + Math.random() * 340, rot: 0, vrot: (Math.random() - 0.5) * 24, life: 1.0, col: dc, s: 4 + Math.random() * 4 });
  }

  function hitEnemy(e, dmg, knockX, knockY, col, kanji, freeze = false) {
    if (!e.alive) return;
    e.hp -= dmg;
    e.flash = 0.2; e.squash = 1;
    if (freeze) e.frozen = 2.4;
    world.slashes.push({ type: 'burst', x: e.x, y: e.y + 22, r: 22 + Math.min(20, dmg), col, life: 0.22, rot: Math.random() * 3 });
    if (e.hp <= 0) {
      launchEnemy(e, knockX, knockY, kanji, col, dmg >= 25);
    } else {
      e.x += Math.sign(knockX) * 16;
      addScore(120, e.x, e.y + 34, `${dmg}`, col);
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * TAU, sp = 180 + Math.random() * 320;
        world.particles.push({ x: e.x, y: e.y + 22, vx: Math.cos(a) * sp + Math.sign(knockX) * 120, vy: Math.sin(a) * sp, col: i % 3 ? col : '#ffffff', size: 3, life: 0.45, grav: 260 });
      }
    }
  }

  function hitBoss(dmg, col, label = null) {
    const b = world.boss;
    if (!b || !b.alive || !state.bossLocked) return;
    b.hp = Math.max(0, b.hp - dmg);
    b.flash = 0.25;
    addScore(dmg * 8, b.x, b.y + 92, label || `-${dmg}`, col, dmg >= 35);
    if (!b.enraged && b.hp <= b.maxHp * 0.5 && b.hp > 0) {
      b.enraged = true;
      audio.sfx('roar');
      triggerShake(18);
      world.shockwaves.push({ x: b.x, y: b.y + 56, r: 15, maxR: 280, col: '#ef4444', life: 0.9, lw: 8 });
      world.popups.push({ x: b.x, y: b.y + 135, text: '赤鬼王 · 暴怒!', col: '#ef4444', life: 1.5, vy: -45, big: true });
      
    }
    if (b.hp <= 0) {
      b.alive = false;
      b.defeated = true;
      b.vx = 520;
      b.vy = 640;
      state.bossDefeated = true;
      state.bossLocked = false;
      state.hitStop = 0.12;
      state.impactFrame = 0.075;
      state.chromaPulse = 1.0;
      triggerShake(32, 1, 0);
      audio.sfx('roar');
      audio.sfx('palm');
      addScore(5000, b.x, b.y + 95, '赤鬼王 倒下!', '#ffd166', true);
      
    }
  }

  function shatterBlock(b) {
    if (!b.alive) return;
    b.alive = false;
    audio.sfx('brick');
    addScore(100, b.x + 18, b.y + 18);
    for (let i = 0; i < 9; i++) {
      world.debris.push({ x: b.x + 18, y: b.y + 18, vx: (Math.random() - 0.5) * 420, vy: 180 + Math.random() * 300, rot: Math.random() * 3, vrot: (Math.random() - 0.5) * 22, life: 1.2, col: i % 2 ? '#9a6234' : '#7a4a24', s: 4 + Math.random() * 6 });
    }
    world.slashes.push({ type: 'burst', x: b.x + 18, y: b.y + 18, r: 40, col: '#ffcf8a', life: 0.25, rot: 1 });
  }

  // 十种拳路 × 三段：每一段有自己的姿势、特效和打击手感
  //   reach 攻击距离倍数 / lunge 前冲 / kx、ky 击飞力度 / proj 附带飞行道具 / multi 多段 / freeze 冰冻
  const MOVES = [
    [{ pose: 'punch', fx: 'jab' }, { pose: 'hook', fx: 'arc', tilt: 0.55 }, { pose: 'uppercut', fx: 'rise', ky: 600, kx: 140, reach: 1.15 }],
    [{ pose: 'sweep', fx: 'arc', tilt: 1.15, reach: 1.15, ky: 430, kx: 80 }, { pose: 'flurry', fx: 'spin', multi: 3 }, { pose: 'kick', fx: 'dragonKick', lunge: 430, reach: 1.35, kx: 560 }],
    [{ pose: 'iaido', fx: 'streak', reach: 1.35 }, { pose: 'slash', fx: 'arc', tilt: -0.9, reach: 1.2 }, { pose: 'iaido', fx: 'dash', lunge: 640, reach: 1.6, proj: 'wave' }],
    [{ pose: 'palm', fx: 'push', kx: 540, ky: 160 }, { pose: 'palm', fx: 'pull', kx: -220, ky: 240, reach: 1.6 }, { pose: 'uppercut', fx: 'yinyang', reach: 1.35, ky: 460 }],
    [{ pose: 'palm', fx: 'palmShot', proj: 'palm' }, { pose: 'uppercut', fx: 'arc', tilt: -0.8 }, { pose: 'palm', fx: 'quake', reach: 1.55, proj: 'palm' }],
    [{ pose: 'ninja', fx: 'kunai', proj: 'kunai' }, { pose: 'slash', fx: 'streak', lunge: 380 }, { pose: 'iaido', fx: 'thunder', reach: 1.3, kx: 300, ky: 460 }],
    [{ pose: 'spear', fx: 'thrust', reach: 1.4 }, { pose: 'spear', fx: 'arc', tilt: 0, reach: 1.45 }, { pose: 'uppercut', fx: 'rise', ky: 580, reach: 1.25 }],
    [{ pose: 'punch', fx: 'jab', freeze: true }, { pose: 'palm', fx: 'breath', reach: 1.45, freeze: true }, { pose: 'uppercut', fx: 'spike', reach: 1.45, ky: 540, proj: 'wave' }],
    [{ pose: 'iaido', fx: 'streak' }, { pose: 'slash', fx: 'arc', tilt: -0.7 }, { pose: 'iaido', fx: 'dash', lunge: 640, proj: 'wave', reach: 1.5 }],
    [{ pose: 'flurry', fx: 'spin', multi: 3 }, { pose: 'palm', fx: 'push', kx: 500 }, { pose: 'kick', fx: 'beam', proj: 'wave', reach: 1.45 }],
  ];
  function moveFx(m, x, y, dir, f, R, step) {
    const S = world.slashes, ax = x + dir * R * 0.5;
    switch (m.fx) {
      case 'jab': S.push({ type: 'burst', x: x + dir * R * 0.55, y, r: 30, col: m.freeze ? '#67e8f9' : f.accent, life: 0.3, rot: Math.random() * 3 }); S.push({ type: 'arc', x: ax, y, r: R * 0.45, col: f.primary, life: 0.22, dir, tilt: 0.1 }); break;
      case 'arc': S.push({ type: 'arc', x: ax, y, r: R * 0.72, col: step === 2 ? f.primary : f.accent, life: 0.3, dir, tilt: m.tilt || 0 }); break;
      case 'rise':
        S.push({ type: 'arc', x: x + dir * 24, y: y + 30, r: R * 0.7, col: f.primary, life: 0.35, dir, tilt: -1.25 });
        S.push({ type: 'streak', x: x + dir * 34, y: y + 70, ang: -Math.PI / 2, len: 170, th: 16, col: f.accent, life: 0.4 });
        if (hero.form === 0) for (let i = 0; i < 16; i++) world.particles.push({ x: x + dir * 30 + (Math.random() - 0.5) * 30, y: y + Math.random() * 40, vx: (Math.random() - 0.5) * 80, vy: 260 + Math.random() * 260, col: i % 2 ? '#ff7a2b' : '#ffd166', size: 5, life: 0.6, grav: -80 });
        break;
      case 'spin': S.push({ type: 'ring', x, y, r: R * 0.6, col: f.accent, life: 0.4 }); S.push({ type: 'arc', x, y, r: R * 0.62, col: f.primary, life: 0.3, dir, tilt: 0 }); S.push({ type: 'arc', x, y, r: R * 0.62, col: f.accent, life: 0.3, dir: -dir, tilt: 0 }); break;
      case 'dragonKick': S.push({ type: 'streak', x: x + dir * R * 0.4, y, ang: 0, len: R * 2.2, th: 22, col: '#f4d35e', life: 0.45 }); S.push({ type: 'burst', x: x + dir * R, y, r: 46, col: '#ff9f1c', life: 0.35, rot: 1 }); break;
      case 'streak': S.push({ type: 'streak', x: x + dir * R * 0.6, y: y + 4, ang: dir * -0.12, len: R * 1.7, th: 12, col: f.accent, life: 0.32 }); break;
      case 'dash': S.push({ type: 'streak', x: x + dir * R * 0.3, y, ang: 0, len: R * 2.6, th: 8, col: f.accent, life: 0.45 }); S.push({ type: 'arc', x: x + dir * R * 0.9, y, r: R * 0.8, col: f.primary, life: 0.32, dir, tilt: -0.4 }); break;
      case 'push': world.shockwaves.push({ x: x + dir * R * 0.5, y, r: 10, maxR: R * 0.9, col: f.accent, life: 0.5, lw: 7 }); S.push({ type: 'arc', x: ax, y, r: R * 0.6, col: f.primary, life: 0.28, dir, tilt: 0 }); break;
      case 'pull': world.shockwaves.push({ x: x + dir * R * 0.8, y, r: R, maxR: 8, col: '#e2e8f0', life: 0.5, lw: 4 }); S.push({ type: 'ring', x: x + dir * R * 0.8, y, r: 30, col: '#ffffff', life: 0.4 }); break;
      case 'yinyang': S.push({ type: 'burst', x: x + dir * R * 0.5, y: y + 10, r: 60, col: '#e2e8f0', life: 0.4, rot: 0.5 }); world.shockwaves.push({ x: x + dir * R * 0.5, y: y + 10, r: 10, maxR: R, col: '#38bdf8', life: 0.6, lw: 6 }); break;
      case 'palmShot': S.push({ type: 'burst', x: x + dir * 30, y, r: 34, col: '#f5c04a', life: 0.3, rot: 0 }); break;
      case 'quake': world.shockwaves.push({ x: x + dir * R * 0.6, y: 4, r: 10, maxR: R * 1.2, col: '#f5c04a', life: 0.6, lw: 9, flat: true }); triggerShake(12, 0, 1);
        for (let i = 0; i < 14; i++) world.particles.push({ x: x + dir * (R * 0.3 + Math.random() * R), y: 2, vx: (Math.random() - 0.5) * 120, vy: 120 + Math.random() * 200, col: '#c9a066', size: 6, life: 0.8, grav: 500, dust: true });
        break;
      case 'kunai': S.push({ type: 'arc', x: ax, y, r: R * 0.5, col: '#22d3ee', life: 0.2, dir, tilt: 0.3 }); break;
      case 'thunder': S.push({ type: 'lightningPillar', x: x + dir * R * 0.7, y: 0, life: 0.55, col: '#7dd3fc' }); S.push({ type: 'burst', x: x + dir * R * 0.7, y: 8, r: 50, col: '#22d3ee', life: 0.35, rot: 2 }); audio.sfx('thunder'); break;
      case 'thrust': S.push({ type: 'spearThrust', x: x + dir * 20, y: y + 2, ang: dir > 0 ? 0 : Math.PI, len: R * 1.5, life: 0.3 }); break;
      case 'breath':
        for (let i = 0; i < 26; i++) { const a = (Math.random() - 0.5) * 0.5; world.particles.push({ x: x + dir * 24, y: y + 8, vx: dir * Math.cos(a) * (380 + Math.random() * 260), vy: Math.sin(a) * 300, col: i % 2 ? '#bff4ff' : '#67e8f9', size: 5, life: 0.55, grav: 0 }); }
        break;
      case 'spike': S.push({ type: 'iceSpike', x: x + dir * R * 0.75, y: 0, life: 0.7 }); S.push({ type: 'arc', x: x + dir * 24, y: y + 30, r: R * 0.6, col: '#bff4ff', life: 0.3, dir, tilt: -1.2 }); break;
      case 'beam': S.push({ type: 'streak', x: x + dir * R, y, ang: 0, len: R * 2.4, th: 26, col: '#a855f7', life: 0.45 }); S.push({ type: 'streak', x: x + dir * R, y, ang: 0, len: R * 2.2, th: 12, col: '#38bdf8', life: 0.45 }); break;
    }
  }

  function performNormalAttack() {
    if (hero.ult.active || hero.attackCd > 0) return;
    const f = FORMS[hero.form], dir = hero.facing;
    const step = hero.comboWindow > 0 ? (hero.comboStep + 1) % 3 : 0;
    hero.comboStep = step; hero.comboWindow = 0.46; hero.attackTimer = 0.22;
    hero.attackCd = step === 2 ? 0.24 : 0.14;
    const isAir = !hero.onGround, m = MOVES[hero.form][step];
    hero.pose = isAir && step < 2 ? (hero.form === 2 || hero.form === 8 ? 'iaido' : 'kick') : m.pose;
    hero.poseTimer = 0.24;
    hero.vx += dir * (m.lunge || (step === 2 ? 170 : 85));
    if (m.lunge && m.lunge > 500) { hero.ghosts.push({ x: hero.x, y: hero.y, pose: 'ninja', form: hero.form, alpha: 0.8, spin: 0, facing: dir }); }
    if (isAir && hero.vy < 80) hero.vy = Math.max(hero.vy, 110);

    const isSlash = hero.form === 2 || hero.form === 5 || hero.form === 6 || hero.form === 8;
    audio.sfx(step === 2 ? 'heavy' : isSlash ? 'slash' : hero.form === 7 ? 'ice' : 'punch');

    const R = f.range * (m.reach || 1) + (step === 2 ? 24 : 0);
    moveFx(m, hero.x, hero.y + 30, dir, f, R, step);

    // 附带的飞行道具
    if (m.proj === 'wave') world.projectiles.push({ type: 'playerWave', x: hero.x + dir * 28, y: hero.y + 32, vx: dir * 640, vy: 0, col: hero.form === 7 ? '#67e8f9' : f.accent, dmg: f.dmg + 4, life: 0.6, freeze: !!m.freeze });
    else if (m.proj === 'palm') world.projectiles.push({ type: 'palm', x: hero.x + dir * 30, y: hero.y + 32, vx: dir * 560, vy: 0, col: '#f5c04a', dmg: f.dmg + 4, life: 0.6, freeze: false });
    else if (m.proj === 'kunai') for (const vy of [-90, 0, 90]) world.projectiles.push({ type: 'playerKunai', x: hero.x + dir * 24, y: hero.y + 34, vx: dir * 780, vy, col: '#22d3ee', dmg: 14, life: 0.5, freeze: false });

    const hx = hero.x + dir * (R * 0.52), hy = hero.y + 30;
    const dmg = Math.round(f.dmg * (step === 2 ? 1.45 : 1.0));
    const kanji = f.moves[step];
    const kx = m.kx !== undefined ? m.kx : (step === 2 ? 390 : 250), ky = m.ky !== undefined ? m.ky : (step === 2 ? 380 : 260);
    let hitSomething = false;
    const hits = m.multi || 1;
    const doHit = (k) => {
      let any = false;
      for (const e of world.enemies) {
        if (!e.alive) continue;
        if (Math.abs(e.x - hx) < R * 0.65 + 20 && Math.abs((e.y + 20) - hy) < 62) {
          hitEnemy(e, k === hits - 1 ? dmg : Math.round(dmg * 0.5), dir * kx, ky, f.primary, kanji, !!m.freeze);
          any = true;
        }
      }
      if (world.boss && world.boss.alive && Math.abs(world.boss.x - hx) < R * 0.68 + 56 && Math.abs((world.boss.y + 56) - hy) < 92) {
        hitBoss(k === hits - 1 ? dmg : Math.round(dmg * 0.5), f.primary); any = true;
      }
      if (any && k > 0) { state.hitStop = 0.02; triggerShake(5, dir, 0); audio.sfx('punch'); }
      return any;
    };
    hitSomething = doHit(0);
    for (let k = 1; k < hits; k++) hero.pending.push({ t: k * 0.07, fn: () => doHit(k) });

    for (const p of world.pipes) {
      if (p.piranha && p.piranhaAlive && Math.abs((p.x + 24) - hx) < R * 0.65 && Math.abs((p.h + 18) - hy) < 58) {
        p.piranhaAlive = false;
        addScore(300, p.x + 24, p.h + 30, '斩蛇!', f.primary);
        hitSomething = true;
      }
    }
    for (const b of world.blocks) {
      if (b.alive && b.type === 'B' && Math.abs((b.x + 18) - hx) < R * 0.65 && Math.abs((b.y + 18) - hy) < 50) {
        shatterBlock(b); hitSomething = true;
      }
    }
    // 弹反：打中飞来的火球、酒坛
    for (const pr of world.projectiles) {
      if ((pr.type === 'fireball' || pr.type === 'jar') && Math.abs(pr.x - hx) < R * 0.72 && Math.abs(pr.y - hy) < 64) {
        pr.vx = dir * 600; pr.vy = pr.type === 'jar' ? 140 : 0; pr.type = 'reflected'; pr.life = 1.6;
        audio.sfx('slash');
        world.shockwaves.push({ x: pr.x, y: pr.y, r: 8, maxR: 95, col: f.accent, life: 0.45, lw: 4 });
        addScore(350, pr.x, pr.y + 26, '弹反!', '#38bdf8', true);
        hitSomething = true;
      }
    }
    if (hitSomething) {
      state.hitStop = step === 2 ? 0.06 : 0.032;
      triggerShake(step === 2 ? 12 : 5, dir, 0);
      if (step === 2) state.targetZoom = 1.06;
    }
  }


  function performDash() {
    if (hero.ult.active || hero.dashCd > 0) return;
    hero.dashTimer = 0.17;
    hero.dashCd = 0.42;
    hero.attackTimer = 0; // Attack-cancel!
    hero.attackCd = 0;
    hero.vx = hero.facing * 720;
    hero.vy = 0;
    hero.pose = 'ninja';
    hero.poseTimer = 0.2;
    audio.sfx('dash');
    const f = FORMS[hero.form];
    world.shockwaves.push({ x: hero.x, y: hero.y + 28, r: 6, maxR: 68, col: f.accent, life: 0.35, lw: 3 });
  }

  function triggerUltimate() {
    if (hero.ult.active || state.flagSliding) return;
    if (state.chi < 100) {
      world.popups.push({ x: hero.x, y: hero.y + 72, text: '气劲不足!', col: '#94a3b8', life: 0.7, vy: -40, big: false });
      return;
    }

    state.chi -= 100;
    const fIdx = hero.form;
    const f = FORMS[fIdx];
    state.domainForm = fIdx;
    audio.sfx('ult');
    state.hitStop = 0.068;
    state.impactFrame = 0.052;
    state.chromaPulse = 0.95;
    state.targetZoom = 1.20;
    triggerShake(18);

    state.cutIn = {
      active: true, timer: 0, dur: 0.95,
      cn: f.ultCn, en: f.ultEn, color: f.primary, secondary: f.accent, formId: fIdx
    };

    const durations = [1.55, 1.75, 2.05, 1.95, 1.85, 1.95, 1.95, 1.95, 1.95, 2.25];
    hero.ult = {
      active: true, form: fIdx, timer: 0, dur: durations[fIdx], phase: 0,
      data: { swords: [], bolts: [], marked: [], spires: [], snapped: false, exploded: false }
    };

    logMove(`> [领域展开] 《${f.ultCn}》 // ${f.ultEn}`);
    world.shockwaves.push({ x: hero.x, y: hero.y + 34, r: 12, maxR: 320, col: f.primary, life: 1.0, lw: 9 });
    updateUI();
  }

  function damageEnemiesInRadius(cx, cy, radius, vxBase, vyBase, kanji, col, bossDmg = 72) {
    for (const e of world.enemies) {
      if (e.alive && Math.hypot(e.x - cx, e.y - cy) < radius) {
        launchEnemy(e, (e.x >= cx ? 1 : -1) * vxBase + (Math.random() - 0.5) * 120, vyBase + Math.random() * 120, kanji, col, true);
      }
    }
    if (world.boss && world.boss.alive && Math.hypot(world.boss.x - cx, (world.boss.y + 50) - cy) < radius + 120) {
      hitBoss(bossDmg, col, `${kanji} -${bossDmg}`);
    }
  }

  function updateUltimate(dt) {
    const u = hero.ult;
    u.timer += dt;
    const p = clamp(u.timer / u.dur, 0, 1);
    const dir = hero.facing;
    state.domainAlpha = p < 0.82 ? lerp(state.domainAlpha, 0.90, dt * 7.5) : lerp(state.domainAlpha, 0, dt * 7.5);

    if (state.frame % 2 === 0) {
      hero.ghosts.push({ x: hero.x, y: hero.y, pose: hero.pose, form: hero.form, alpha: 0.72, spin: hero.spinAng, facing: hero.facing });
    }

    // Clamp Hero inside arena if locked
    const clampArena = () => {
      if (state.bossLocked) hero.x = clamp(hero.x, BOSS_ARENA_LEFT + 32, BOSS_ARENA_RIGHT - 32);
      else hero.x = clamp(hero.x, 40, FLAG_X - 20);
    };

    switch (u.form) {
      case 0: {
        // 1. 烈焰升龙破
        hero.pose = 'uppercut';
        hero.x += dir * 130 * dt;
        hero.y = Math.sin(Math.min(1, p * 1.15) * Math.PI) * 220;
        if (u.phase < 1 && p > 0.25) {
          u.phase = 1; state.targetZoom = 0.94; state.chromaPulse = 0.85;
          audio.sfx('palm'); triggerShake(24, 0, -1);
          world.slashes.push({ type: 'flamePillar', x: hero.x, y: 0, life: 1.25 });
          for (const b of world.blocks) if (b.alive && b.type === 'B' && Math.abs(b.x - hero.x) < 280) shatterBlock(b);
          damageEnemiesInRadius(hero.x, 80, 390, 320, 480, '烈焰破!', '#ff6b2b', 82);
        }
        for (let i = 0; i < 4; i++) {
          world.particles.push({
            x: hero.x + (Math.random() - 0.5) * 70, y: hero.y + Math.random() * 50,
            vx: (Math.random() - 0.5) * 90, vy: 220 + Math.random() * 240,
            col: i % 2 ? '#ff6b2b' : '#ffd166', size: 5, life: 0.55, grav: -60
          });
        }
        break;
      }
      case 1: {
        // 2. 双截狂龙百裂脚
        if (p < 0.45) {
          hero.pose = 'flurry';
          hero.x += dir * 240 * dt;
          hero.y = lerp(hero.y, 78 + Math.sin(u.timer * 28) * 24, dt * 12);
          if (state.frame % 3 === 0) {
            audio.sfx('punch'); triggerShake(8, dir, 0);
            world.slashes.push({ type: 'ring', x: hero.x + dir * 36, y: hero.y + 32, r: 52, col: '#f4d35e', life: 0.34 });
            damageEnemiesInRadius(hero.x + dir * 50, hero.y, 170, 360, 320, '百裂!', '#ff9f1c', 18);
          }
        } else {
          hero.pose = 'kick';
          hero.y = lerp(hero.y, 72, dt * 8);
          if (u.phase < 1) {
            u.phase = 1; state.hitStop = 0.08; state.impactFrame = 0.055; state.chromaPulse = 0.9; state.targetZoom = 0.94;
            triggerShake(24, dir, 0); audio.sfx('palm');
            world.slashes.push({ type: 'dragon', x: hero.x + dir * 24, y: hero.y + 36, len: 920, dir, life: 1.05, col: '#f4d35e' });
            damageEnemiesInRadius(hero.x + dir * 360, hero.y + 36, 480, 560, 380, '狂龙!', '#f4d35e', 76);
          }
        }
        break;
      }
      case 2: {
        // 3. 青莲万剑归宗 (36 Flying Swords)
        hero.pose = 'iaido';
        hero.y = lerp(hero.y, 170, dt * 7);
        if (u.phase < 1) {
          u.phase = 1;
          for (let i = 0; i < 36; i++) {
            const ang = (i / 36) * TAU;
            const ring = i < 18 ? 86 : 142;
            u.data.swords.push({
              ang, ring, x: hero.x + Math.cos(ang) * ring, y: hero.y + 36 + Math.sin(ang) * ring,
              fired: false, delay: 0.45 + i * 0.022, vx: dir * 840, vy: -500
            });
          }
        }
        for (const sw of u.data.swords) {
          if (u.timer < sw.delay) {
            sw.ang += dt * 2.5;
            sw.x = hero.x + Math.cos(sw.ang) * sw.ring;
            sw.y = hero.y + 36 + Math.sin(sw.ang) * sw.ring;
          } else {
            if (!sw.fired) {
              sw.fired = true;
              if (Math.random() < 0.35) audio.sfx('slash');
              triggerShake(4);
              world.slashes.push({ type: 'inkArc', x: sw.x + dir * 110, y: sw.y - 68, ang: dir > 0 ? -0.54 : 0.54, len: 250, col: '#38bdf8', life: 0.52 });
            }
            sw.x += sw.vx * dt; sw.y += sw.vy * dt;
            if (sw.y <= 10) { world.shockwaves.push({ x: sw.x, y: 6, r: 6, maxR: 72, col: '#38bdf8', life: 0.42, lw: 3 }); sw.y = -999; }
            for (const e of world.enemies) {
              if (e.alive && Math.abs(e.x - sw.x) < 110 && Math.abs(e.y + 24 - sw.y) < 110) launchEnemy(e, dir * 260, 400, '剑斩!', '#38bdf8', true);
            }
            if (world.boss && world.boss.alive && Math.abs(world.boss.x - sw.x) < 90 && Math.abs(world.boss.y + 56 - sw.y) < 90) {
              sw.y = -999; hitBoss(8, '#38bdf8', '剑雨!');
            }
          }
        }
        break;
      }
      case 3: {
        // 4. 两仪八卦乾坤阵
        hero.pose = 'palm';
        hero.y = lerp(hero.y, 118, dt * 6);
        const cx = hero.x + dir * 95;
        if (u.phase < 1) {
          u.phase = 1;
          world.slashes.push({ type: 'taichiArray', x: cx, y: 112, life: 1.85 });
        }
        if (p < 0.62) {
          for (const e of world.enemies) {
            if (e.alive && Math.abs(e.x - cx) < 520) { e.x = lerp(e.x, cx, dt * 3.0); e.y = lerp(e.y, 108, dt * 2.5); }
          }
        } else if (!u.data.exploded) {
          u.data.exploded = true; state.hitStop = 0.09; state.impactFrame = 0.06; state.chromaPulse = 1.0; state.targetZoom = 0.94;
          audio.sfx('palm'); triggerShake(28);
          world.shockwaves.push({ x: cx, y: 108, r: 15, maxR: 540, col: '#f8fafc', life: 1.0, lw: 11 });
          damageEnemiesInRadius(cx, 108, 560, 480, 500, '乾坤破!', '#f8fafc', 88);
        }
        break;
      }
      case 4: {
        // 5. 天降金刚神掌
        hero.pose = 'palm';
        hero.y = lerp(hero.y, 112, dt * 6);
        if (u.phase < 1 && p > 0.32) {
          u.phase = 1; state.hitStop = 0.095; state.impactFrame = 0.065; state.chromaPulse = 0.95; state.targetZoom = 0.94;
          triggerShake(30, 0, 1); audio.sfx('palm');
          const slamX = hero.x + dir * 165;
          world.slashes.push({ type: 'goldenPalm', x: slamX, y: 16, life: 1.25 });
          world.shockwaves.push({ x: slamX, y: 8, r: 22, maxR: 560, col: '#f59e0b', life: 1.0, lw: 12 });
          for (const b of world.blocks) if (b.alive && b.type === 'B' && Math.abs(b.x - slamX) < 380) shatterBlock(b);
          damageEnemiesInRadius(slamX, 40, 540, 440, 540, '金刚神掌!', '#fef08a', 96);
        }
        break;
      }
      case 5: {
        // 6. 紫电·瞬身九连斩
        if (p < 0.56) {
          hero.pose = 'ninja';
          if (u.phase < 1) {
            u.phase = 1;
            const pts = [{ x: hero.x, y: hero.y + 30 }];
            for (let k = 0; k < 9; k++) {
              pts.push({ x: hero.x + dir * (-100 + k * 58) + (Math.random() - 0.5) * 40, y: 35 + ((k % 3) * 80) });
            }
            u.data.bolts = pts;
            for (const e of world.enemies) {
              if (e.alive && Math.abs(e.x - hero.x) < 580) { e.marked = true; u.data.marked.push(e); }
            }
            audio.sfx('thunder'); triggerShake(16);
          }
          const idx = Math.min(u.data.bolts.length - 1, Math.floor((p / 0.56) * u.data.bolts.length));
          const pt = u.data.bolts[idx];
          if (pt) { hero.x = lerp(hero.x, pt.x, dt * 24); hero.y = lerp(hero.y, Math.max(0, pt.y - 24), dt * 24); }
        } else {
          hero.pose = 'iaido';
          hero.y = lerp(hero.y, 0, dt * 16);
          if (!u.data.snapped && p > 0.72) {
            u.data.snapped = true; state.hitStop = 0.09; state.impactFrame = 0.06; state.chromaPulse = 1.0; state.targetZoom = 0.94;
            triggerShake(26); audio.sfx('thunder');
            for (let k = 1; k < u.data.bolts.length; k++) {
              world.slashes.push({ type: 'lightningPillar', x: u.data.bolts[k].x, y: 0, life: 0.9, col: k % 2 ? '#22d3ee' : '#a855f7' });
            }
            for (const e of u.data.marked) if (e.alive) launchEnemy(e, dir * 180, 500, '雷绝!', '#22d3ee', true);
            if (world.boss && world.boss.alive && Math.abs(world.boss.x - hero.x) < 620) hitBoss(92, '#22d3ee', '雷绝 -92');
          }
        }
        break;
      }
      case 6: {
        // 7. 风火轮·百鸟朝凤枪
        hero.pose = 'spear';
        hero.y = lerp(hero.y, 120, dt * 6);
        if (p < 0.55) {
          if (state.frame % 3 === 0) {
            audio.sfx('slash'); triggerShake(6);
            world.slashes.push({ type: 'spearThrust', x: hero.x + dir * 24, y: hero.y + 32, ang: (dir > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.65, len: 420, life: 0.4 });
            damageEnemiesInRadius(hero.x + dir * 170, hero.y, 250, 380, 340, '朝凤!', '#fbbf24', 12);
          }
        } else if (u.phase < 1) {
          u.phase = 1; state.hitStop = 0.085; state.impactFrame = 0.055; state.chromaPulse = 0.95; state.targetZoom = 0.94;
          audio.sfx('phoenix'); triggerShake(26);
          world.slashes.push({ type: 'phoenixDive', x: hero.x - dir * 50, y: 230, dir, life: 1.1 });
          damageEnemiesInRadius(hero.x + dir * 220, 60, 560, 500, 480, '凤鸣九天!', '#ff5722', 84);
        }
        break;
      }
      case 7: {
        // 8. 绝对零度·冰河碎星
        hero.pose = 'uppercut';
        hero.y = lerp(hero.y, 82, dt * 7);
        if (u.phase < 1 && p > 0.22) {
          u.phase = 1; audio.sfx('ice'); triggerShake(16);
          for (let i = -4; i <= 5; i++) {
            u.data.spires.push({ x: hero.x + i * 95, h: 125 + Math.abs(Math.sin(i * 1.7)) * 145, w: 34 + (i % 2) * 14 });
          }
          world.slashes.push({ type: 'iceSpires', spires: u.data.spires, shattered: false, life: 1.6 });
          for (const e of world.enemies) if (e.alive && Math.abs(e.x - hero.x) < 540) e.frozen = 2.0;
        }
        if (!u.data.exploded && p > 0.65) {
          u.data.exploded = true; state.hitStop = 0.095; state.impactFrame = 0.06; state.chromaPulse = 0.9; state.targetZoom = 0.94;
          audio.sfx('ice'); audio.sfx('palm'); triggerShake(26);
          for (const sl of world.slashes) if (sl.type === 'iceSpires') sl.shattered = true;
          for (const sp of u.data.spires) {
            for (let k = 0; k < 7; k++) {
              const a = Math.random() * TAU, v = 140 + Math.random() * 320;
              world.particles.push({ x: sp.x, y: sp.h * 0.5, vx: Math.cos(a) * v, vy: Math.sin(a) * v, col: k % 2 ? '#e0f2fe' : '#67e8f9', size: 4.5, life: 0.95, grav: 280 });
            }
          }
          damageEnemiesInRadius(hero.x, 80, 580, 420, 500, '碎星!', '#67e8f9', 90);
        }
        break;
      }
      case 8: {
        // 9. 次元斩·霓虹超载
        hero.pose = 'iaido';
        hero.y = lerp(hero.y, 102, dt * 7);
        if (u.phase < 1 && p > 0.22) {
          u.phase = 1; audio.sfx('laser'); triggerShake(14); state.chromaPulse = 1.0;
          const fracs = [];
          for (let i = 0; i < 14; i++) {
            fracs.push({
              x1: hero.x - 420 + Math.random() * 880, y1: Math.random() * 310,
              ang: (Math.random() - 0.5) * 2.4, len: 240 + Math.random() * 340,
              col: i % 2 ? '#ec4899' : '#00f5d4'
            });
          }
          world.slashes.push({ type: 'dimFractures', fracs, shattered: false, life: 1.6 });
        }
        if (!u.data.exploded && p > 0.66) {
          u.data.exploded = true; state.hitStop = 0.095; state.impactFrame = 0.065; state.chromaPulse = 1.0; state.targetZoom = 0.94;
          audio.sfx('laser'); audio.sfx('palm'); triggerShake(28);
          for (const sl of world.slashes) if (sl.type === 'dimFractures') sl.shattered = true;
          damageEnemiesInRadius(hero.x + dir * 40, 90, 620, 480, 480, '次元断!', '#00f5d4', 94);
        }
        break;
      }
      case 9: {
        // 10. 混元·破空拳
        hero.pose = 'float';
        if (p < 0.35) {
          hero.y = lerp(hero.y, 138, dt * 7);
          for (let i = 0; i < 5; i++) {
            const a = Math.random() * TAU, d = 105 + Math.random() * 65;
            world.particles.push({
              x: hero.x + Math.cos(a) * d, y: hero.y + 36 + Math.sin(a) * d,
              vx: -Math.cos(a) * 320, vy: -Math.sin(a) * 320,
              col: i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#a855f7' : '#ffd166', size: 4.5, life: 0.45, grav: 0
            });
          }
        } else {
          hero.pose = 'kick';
          if (!u.data.exploded) {
            u.data.exploded = true; state.hitStop = 0.11; state.impactFrame = 0.075; state.chromaPulse = 1.0; state.targetZoom = 0.94;
            triggerShake(34, dir, 0); audio.sfx('palm'); audio.sfx('thunder');
            world.slashes.push({ type: 'celestialBeam', x: hero.x, y: hero.y + 34, dir, life: 1.35 });
            damageEnemiesInRadius(hero.x + dir * 280, 90, 780, 620, 440, '破空!', '#a855f7', 115);
          }
        }
        break;
      }
    }

    clampArena();
    if (u.timer >= u.dur) {
      u.active = false;
      state.targetZoom = 1.0;
      hero.pose = hero.onGround ? 'idle' : 'somersault';
      hero.invuln = 0.45;
    }
  }

  /* ============================================================================
     9. PLAYER PHYSICS, COLLISIONS, BOSS AI & WORLD SIMULATION
     ============================================================================ */
  function updateGame(dt) {
    state.playTime += dt;
    state.chromaPulse = Math.max(0, state.chromaPulse - dt * 2.8);
    state.hurtFlash = Math.max(0, state.hurtFlash - dt * 2.8);
    state.camZoom = lerp(state.camZoom, state.targetZoom, Math.min(1, dt * 6));
    if (!hero.ult.active) state.domainAlpha = lerp(state.domainAlpha, 0, Math.min(1, dt * 4.5));

    if (state.comboTimer > 0) {
      state.comboTimer -= dt;
      if (state.comboTimer <= 0) state.combo = 0;
    }
    if (state.cutIn.active) {
      state.cutIn.timer += dt;
      if (state.cutIn.timer >= state.cutIn.dur) state.cutIn.active = false;
    }

    // Input Buffers Countdown
    input.jumpBuffer = Math.max(0, input.jumpBuffer - dt);
    input.attackBuffer = Math.max(0, input.attackBuffer - dt);
    input.dashBuffer = Math.max(0, input.dashBuffer - dt);
    input.ultBuffer = Math.max(0, input.ultBuffer - dt);

    hero.invuln = Math.max(0, hero.invuln - dt);
    hero.transformFlash = Math.max(0, hero.transformFlash - dt * 2.4);
    hero.attackCd = Math.max(0, hero.attackCd - dt);
    hero.attackTimer = Math.max(0, hero.attackTimer - dt);
    hero.comboWindow = Math.max(0, hero.comboWindow - dt);
    hero.dashCd = Math.max(0, hero.dashCd - dt);
    hero.poseTimer = Math.max(0, hero.poseTimer - dt);
    for (let i = hero.pending.length - 1; i >= 0; i--) { const p = hero.pending[i]; p.t -= dt; if (p.t <= 0) { hero.pending.splice(i, 1); p.fn(); } }
    if (hero.onGround && !hero.wasGround) {           // 落地扬尘
      for (let i = 0; i < 8; i++) world.particles.push({ x: hero.x + (Math.random() - 0.5) * 20, y: hero.y + 2, vx: (i % 2 ? 1 : -1) * (60 + Math.random() * 120), vy: 20 + Math.random() * 50, col: '#c8bca8', size: 5, life: 0.6, grav: 0, dust: true });
    }
    hero.wasGround = hero.onGround;
    if (hero.onGround && Math.abs(hero.vx) > 200 && state.frame % 6 === 0) world.particles.push({ x: hero.x - hero.facing * 8, y: 2, vx: -hero.facing * 40, vy: 30, col: '#c8bca8', size: 4, life: 0.5, grav: 0, dust: true });
    state.targetZoom = hero.ult.active ? state.targetZoom : lerp(state.targetZoom, 1.0, Math.min(1, dt * 4));

    // 1. Victory Flagpole Slide & Celebration
    if (state.flagSliding) {
      state.flagTimer += dt;
      hero.facing = 1;
      hero.pose = 'victory';
      hero.y = Math.max(0, hero.y - 220 * dt);
      if (hero.y <= 0 && hero.x < CASTLE_X - 42) {
        hero.x += 160 * dt;
        hero.pose = 'run';
        hero.runCycle += dt * 13;
      }
      if (Math.random() < dt * 5) {
        const fx = FLAG_X + (Math.random() - 0.3) * 420;
        const fy = 180 + Math.random() * 210;
        const cols = ['#ffd166', '#38bdf8', '#e63946', '#a855f7', '#00f5d4'];
        const col = cols[(Math.random() * cols.length) | 0];
        for (let i = 0; i < 20; i++) {
          const a = (i / 20) * TAU, sp = 90 + Math.random() * 170;
          world.particles.push({ x: fx, y: fy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, col, size: 3.6, life: 1.0, grav: 150 });
        }
      }
      if (state.flagTimer > 3.2) {
        state.mode = 'clear';
        updateUI();
      }
    } else if (hero.ult.active) {
      updateUltimate(dt);
    } else {
      // 2. Player Controls: Ultimate / Dash / Attack / Move / Jump
      if (input.ultBuffer > 0 && state.chi >= 100) {
        input.ultBuffer = 0;
        triggerUltimate();
      }
      if (!hero.ult.active) {
        if (input.dashBuffer > 0 && hero.dashCd <= 0) {
          input.dashBuffer = 0;
          performDash();
        }
        if (input.attackBuffer > 0 && hero.attackCd <= 0 && hero.dashTimer <= 0) {
          input.attackBuffer = 0;
          performNormalAttack();
        }

        // Horizontal Movement
        if (hero.dashTimer > 0) {
          hero.dashTimer -= dt;
          hero.vy = 0;
          if (state.frame % 2 === 0) {
            hero.ghosts.push({ x: hero.x, y: hero.y, pose: 'ninja', form: hero.form, alpha: 0.65, spin: 0, facing: hero.facing });
          }
        } else {
          const moveDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
          const maxSpd = hero.form === 1 || hero.form === 5 ? 360 : 325;
          const accel = hero.onGround ? 2400 : 1650;
          const fric = hero.onGround ? 1900 : 420;
          if (moveDir !== 0) {
            hero.facing = moveDir;
            hero.vx = clamp(hero.vx + moveDir * accel * dt, -maxSpd, maxSpd);
          } else {
            if (Math.abs(hero.vx) < fric * dt) hero.vx = 0;
            else hero.vx -= Math.sign(hero.vx) * fric * dt;
          }

          // Coyote Time & Jump Buffering + Double Jump
          if (hero.onGround) { hero.coyote = 0.11; hero.jumpsLeft = 2; }
          else hero.coyote = Math.max(0, hero.coyote - dt);

          if (input.jumpBuffer > 0) {
            if (hero.coyote > 0) {
              input.jumpBuffer = 0;
              hero.coyote = 0;
              hero.onGround = false;
              hero.jumpsLeft = 1;
              hero.vy = 575;
              hero.pose = 'somersault';
              audio.sfx('jump');
            } else if (hero.jumpsLeft > 0) {
              input.jumpBuffer = 0;
              hero.jumpsLeft = 0;
              hero.vy = 535;
              hero.pose = 'somersault';
              hero.spinAng = 0;
              audio.sfx('doubleJump');
              world.shockwaves.push({ x: hero.x, y: hero.y + 4, r: 6, maxR: 48, col: FORMS[hero.form].accent, life: 0.35, lw: 3 });
            }
          }

          // Variable Jump Height (release jump early to hop shorter)
          if (!input.jumpHeld && hero.vy > 210) {
            hero.vy *= Math.pow(0.06, dt);
          }

          const grav = hero.form === 9 ? 1120 : 1460;
          hero.vy -= grav * dt;
        }

        const prevX = hero.x, prevY = hero.y;
        hero.x += hero.vx * dt;
        hero.y += hero.vy * dt;

        // World & Boss Arena Horizontal Bounds
        const minX = state.bossLocked ? BOSS_ARENA_LEFT + 24 : 36;
        const maxX = state.bossLocked ? BOSS_ARENA_RIGHT - 24 : FLAG_X + 20;
        hero.x = clamp(hero.x, minX, maxX);

        // Ground Collision
        hero.onGround = false;
        if (hero.y <= 0) {
          hero.y = 0; hero.vy = 0; hero.onGround = true;
        }

        // Solid Pipe Collisions (Top & Sides)
        for (const p of world.pipes) {
          const pL = p.x, pR = p.x + p.w;
          if (hero.x + 14 > pL && hero.x - 14 < pR) {
            if (prevY >= p.h - 4 && hero.y <= p.h && hero.vy <= 0) {
              hero.y = p.h; hero.vy = 0; hero.onGround = true;
            } else if (hero.y < p.h - 4) {
              if (prevX <= pL) hero.x = pL - 14;
              else if (prevX >= pR) hero.x = pR + 14;
              hero.vx = 0;
            }
          }
        }

        // One-Way Floating Platforms
        for (const pl of world.platforms) {
          if (hero.x + 12 > pl.x && hero.x - 12 < pl.x + pl.w) {
            if (prevY >= pl.y - 4 && hero.y <= pl.y && hero.vy <= 0) {
              hero.y = pl.y; hero.vy = 0; hero.onGround = true;
            }
          }
        }

        // Solid Bricks, ? Blocks & 「武」 Martial Scroll Blocks
        for (const b of world.blocks) {
          b.bump *= Math.pow(0.0005, dt);
          if (!b.alive) continue;
          const bL = b.x, bR = b.x + b.w, bBot = b.y, bTop = b.y + b.h;
          if (hero.x + 13 > bL && hero.x - 13 < bR) {
            // Land on top
            if (prevY >= bTop - 4 && hero.y <= bTop && hero.vy <= 0) {
              hero.y = bTop; hero.vy = 0; hero.onGround = true;
            }
            // Headbutt from below
            else if (prevY + hero.h <= bBot + 10 && hero.y + hero.h >= bBot && hero.vy > 0) {
              hero.y = bBot - hero.h;
              hero.vy = -80;
              b.bump = 14;
              if (b.scrollForm >= 0 && !b.hit) {
                b.hit = true;
                hero.setForm(b.scrollForm, true);
              } else if ((b.type === '?' || b.hasMushroom) && !b.hit) {
                b.hit = true;
                if (b.hasMushroom) {
                  audio.sfx('transform');
                  world.mushrooms.push({ x: b.x + 18, y: bTop + 2, vx: 88, vy: 180, alive: true });
                } else {
                  state.coins++;
                  audio.sfx('coin');
                  addScore(200, b.x + 18, bTop + 18, '+200', '#ffd166');
                  world.particles.push({ x: b.x + 18, y: bTop + 12, vx: 0, vy: 280, col: '#ffd166', size: 7, life: 0.7, grav: 750, isCoin: true });
                }
              } else if (b.type === 'B') {
                shatterBlock(b);
              }
            }
          }
        }

        // Pose & Run Cycle Update
        if (hero.poseTimer <= 0) {
          if (!hero.onGround) {
            hero.pose = 'somersault';
            hero.spinAng += dt * 14;
          } else if (Math.abs(hero.vx) > 25) {
            hero.pose = 'run';
            hero.runCycle += dt * (Math.abs(hero.vx) * 0.056);
          } else {
            hero.pose = 'idle';
          }
        }

        // Trigger Boss Arena Lock when entering Castle Courtyard
        if (!state.bossLocked && !state.bossDefeated && world.boss && world.boss.alive && hero.x > BOSS_ARENA_LEFT + 140) {
          state.bossLocked = true;
          audio.sfx('roar');
          triggerShake(16);
          world.popups.push({ x: world.boss.x, y: 260, text: '赤鬼王 降临', col: '#ef4444', life: 1.6, vy: -20, big: true });
        }

        // Reach Victory Flagpole!
        if (!state.bossLocked && hero.x >= FLAG_X - 14) {
          state.flagSliding = true;
          state.flagTimer = 0;
          hero.x = FLAG_X;
          hero.y = Math.max(hero.y, 175);
          hero.vx = 0; hero.vy = 0;
          audio.sfx('victory');
          addScore(5000, FLAG_X, 240, '鸣锣! 武道登峰', '#ffd166', true);
          saveBest();
        }
      }
    }

    // 3. Collect Coins & Healing Mushrooms
    for (const c of world.coins) {
      if (!c.got && Math.abs(hero.x - c.x) < 26 && Math.abs((hero.y + 28) - c.y) < 32) {
        c.got = true;
        state.coins++;
        audio.sfx('coin');
        addScore(100, c.x, c.y + 18, '+100', '#ffd166');
      }
    }
    for (const m of world.mushrooms) {
      if (!m.alive) continue;
      m.vy -= 1200 * dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.y <= 0) { m.y = 0; m.vy = 0; }
      for (const b of world.blocks) {
        if (b.alive && m.x > b.x && m.x < b.x + b.w && m.y >= b.y + b.h - 10 && m.y <= b.y + b.h + 8 && m.vy <= 0) {
          m.y = b.y + b.h; m.vy = 0;
        }
      }
      if (Math.abs(hero.x - m.x) < 30 && Math.abs((hero.y + 24) - (m.y + 14)) < 34) {
        m.alive = false;
        hero.hp = Math.min(hero.maxHp, hero.hp + 2);
        state.chi = Math.min(state.maxChi, state.chi + 50);
        audio.sfx('heal');
        addScore(500, m.x, m.y + 34, '包子 · 回血', '#22c55e', true);
      }
    }

    // 4. Update Enemies, Hero Stomp & Player Contact Damage
    for (const e of world.enemies) {
      e.flash = Math.max(0, e.flash - dt);
      if (e.alive) {
        if (e.frozen > 0) { e.frozen = Math.max(0, e.frozen - dt); continue; }
        if (Math.abs(e.x - hero.x) < 880) {
          e.x += e.vx * dt;
          if (e.type === 'kite') e.y = 100 + Math.sin(state.totalTime * 3.5 + e.seed) * 44;
          if (e.type === 'monk') {
            e.cd -= dt;
            if (e.cd <= 0 && Math.abs(e.x - hero.x) < 420) {
              e.cd = 1.6;
              world.projectiles.push({ type: 'jar', x: e.x, y: e.y + 32, vx: e.x > hero.x ? -175 : 175, vy: 360, rot: 0, life: 2.2 });
            }
          }
          // Hero Stomp vs Contact Damage
          if (!hero.ult.active && Math.abs(hero.x - e.x) < 28 && Math.abs((hero.y + 22) - (e.y + 18)) < 34) {
            if (hero.vy < -40 && hero.y >= e.y + 12) {
              // 踩头
              hero.vy = 470;
              hero.jumpsLeft = 1;
              audio.sfx('punch');
              state.hitStop = 0.035;
              triggerShake(8, 0, 1);
              launchEnemy(e, hero.facing * 200, 320, '踏!', '#ffd166');
            } else {
              hero.takeDamage(1, hero.x < e.x ? -1 : 1);
            }
          }
        }
      } else if (e.launched) {
        e.x += e.vx * dt; e.y += e.vy * dt; e.vy -= 1050 * dt; e.rot += dt * 15; e.flyT = (e.flyT || 0) + dt;
        if (e.flyT < 0.9 && Math.abs(e.vx) > 200) {
          for (const o of world.enemies) {
            if (o.alive && Math.abs(o.x - e.x) < 34 && Math.abs(o.y - e.y) < 40) {
              launchEnemy(o, e.vx * 0.85, 300 + Math.random() * 200, '连环!', '#ffd166', true);
              state.hitStop = Math.max(state.hitStop, 0.02); triggerShake(6, Math.sign(e.vx), 0);
            }
          }
        }
      }
      e.squash = Math.max(0, (e.squash || 0) - dt * 6);
    }

    // 5. 首领赤鬼王的行为
    if (world.boss && world.boss.alive && state.bossLocked) {
      const b = world.boss;
      b.flash = Math.max(0, b.flash - dt);
      b.facing = hero.x < b.x ? -1 : 1;
      b.stateTimer -= dt;

      // Gravity
      b.vy -= 1220 * dt;
      b.y += b.vy * dt;
      if (b.y <= 0) {
        if (b.vy < -280) {
          // Ground-Pound Shockwave!
          audio.sfx('palm');
          triggerShake(14, 0, 1);
          world.shockwaves.push({ x: b.x, y: 8, r: 15, maxR: 220, col: '#ef4444', life: 0.65, lw: 6 });
          if (hero.y < 24 && Math.abs(hero.x - b.x) < 175) hero.takeDamage(1, hero.x < b.x ? -1 : 1);
        }
        b.y = 0; b.vy = 0;
      }

      if (b.state === 'charge') {
        b.x += b.vx * dt;
        if (b.x < BOSS_ARENA_LEFT + 75 || b.x > BOSS_ARENA_RIGHT - 75 || b.stateTimer <= 0) {
          b.state = 'idle'; b.vx = 0; b.stateTimer = b.enraged ? 0.85 : 1.25;
        }
      } else {
        b.x = clamp(b.x + b.facing * (b.enraged ? 68 : 42) * dt, BOSS_ARENA_LEFT + 70, BOSS_ARENA_RIGHT - 70);
        if (b.stateTimer <= 0) {
          const r = Math.random();
          if (r < 0.42) {
            // 3-Way Fireball Barrage
            audio.sfx('roar');
            const dirs = b.enraged ? [-20, 0, 22, 46] : [-12, 16, 44];
            for (const vy of dirs) {
              world.projectiles.push({ type: 'fireball', x: b.x + b.facing * 54, y: b.y + 68, vx: b.facing * (b.enraged ? 340 : 285), vy, life: 3.0 });
            }
            b.stateTimer = b.enraged ? 1.15 : 1.65;
          } else if (r < 0.74) {
            // Heavy Ground-Pound Leap
            b.vy = 520;
            b.vx = b.facing * 120;
            b.stateTimer = b.enraged ? 1.25 : 1.75;
          } else {
            // Enraged Flame Charge
            audio.sfx('roar');
            b.state = 'charge';
            b.vx = b.facing * (b.enraged ? 380 : 290);
            b.stateTimer = 1.1;
          }
        }
      }

      // Boss Body Contact
      if (!hero.ult.active && Math.abs(hero.x - b.x) < 58 && Math.abs((hero.y + 28) - (b.y + 56)) < 68) {
        if (hero.vy < -50 && hero.y > b.y + 84) {
          hero.vy = 520; hero.jumpsLeft = 1;
          hitBoss(22, '#ffd166', '踩头 -22');
          audio.sfx('heavy');
        } else {
          hero.takeDamage(1, hero.x < b.x ? -1 : 1);
        }
      }
    } else if (world.boss && world.boss.defeated) {
      world.boss.x += world.boss.vx * dt;
      world.boss.y += world.boss.vy * dt;
      world.boss.rot += dt * 11;
    }

    // 6. Projectiles (Player Waves, Kunai, Enemy Fireballs, Hammers & Reflected Shots)
    for (let i = world.projectiles.length - 1; i >= 0; i--) {
      const pr = world.projectiles[i];
      pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.life -= dt;
      if (pr.type === 'jar') { pr.vy -= 920 * dt; pr.rot += dt * 16; }

      let dead = pr.life <= 0 || pr.y < -30;
      if (!dead && (pr.type === 'playerWave' || pr.type === 'playerKunai' || pr.type === 'reflected')) {
        for (const e of world.enemies) {
          if (e.alive && Math.abs(e.x - pr.x) < 34 && Math.abs((e.y + 22) - pr.y) < 38) {
            hitEnemy(e, pr.dmg || 28, Math.sign(pr.vx) * 320, 320, pr.col || '#38bdf8', '气劲!', pr.freeze);
            if (pr.type !== 'playerWave') dead = true;
            break;
          }
        }
        if (!dead && world.boss && world.boss.alive && Math.abs(world.boss.x - pr.x) < 62 && Math.abs((world.boss.y + 56) - pr.y) < 76) {
          hitBoss(pr.type === 'reflected' ? 45 : (pr.dmg || 20), pr.col || '#38bdf8', pr.type === 'reflected' ? '弹反 -45!' : null);
          dead = true;
        }
      } else if (!dead && (pr.type === 'fireball' || pr.type === 'jar')) {
        if (Math.abs(hero.x - pr.x) < 24 && Math.abs((hero.y + 28) - pr.y) < 32) {
          hero.takeDamage(1, Math.sign(pr.vx) || -1);
          dead = true;
        }
      }
      if (dead) world.projectiles.splice(i, 1);
    }

    // 7. Flowing Scarf, Weapon Ribbon, Particles, Slashes & Shockwaves
    hero.scarf[0].x = hero.x - hero.facing * 7;
    hero.scarf[0].y = hero.y + 48;
    for (let i = 1; i < hero.scarf.length; i++) {
      const prev = hero.scarf[i - 1], cur = hero.scarf[i];
      cur.x = lerp(cur.x, prev.x - hero.facing * 5.5, Math.min(1, dt * 24));
      cur.y = lerp(cur.y, prev.y + Math.sin(state.totalTime * 16 - i * 0.72) * 4.5 - 1.0, Math.min(1, dt * 24));
    }

    const tipX = hero.x + hero.facing * (hero.attackTimer > 0 ? 44 : 16);
    const tipY = hero.y + (hero.pose === 'uppercut' ? 68 : hero.pose === 'kick' ? 28 : 40);
    hero.weaponTrail.push({ x: tipX, y: tipY, life: hero.attackTimer > 0 || hero.ult.active ? 1.0 : 0.45 });
    if (hero.weaponTrail.length > 16) hero.weaponTrail.shift();
    for (const wt of hero.weaponTrail) wt.life = Math.max(0, wt.life - dt * 4.5);

    for (let i = hero.ghosts.length - 1; i >= 0; i--) {
      hero.ghosts[i].alpha -= dt * 2.8;
      if (hero.ghosts[i].alpha <= 0) hero.ghosts.splice(i, 1);
    }
    for (let i = world.particles.length - 1; i >= 0; i--) {
      const pt = world.particles[i];
      pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy -= (pt.grav || 0) * dt; pt.life -= dt * 1.45;
      if (pt.life <= 0) world.particles.splice(i, 1);
    }
    for (let i = world.debris.length - 1; i >= 0; i--) {
      const d = world.debris[i];
      d.x += d.vx * dt; d.y += d.vy * dt; d.vy -= 1150 * dt; d.rot += d.vrot * dt; d.life -= dt;
      if (d.life <= 0) world.debris.splice(i, 1);
    }
    for (let i = world.slashes.length - 1; i >= 0; i--) {
      world.slashes[i].life -= dt * 1.3;
      if (world.slashes[i].life <= 0) world.slashes.splice(i, 1);
    }
    for (let i = world.shockwaves.length - 1; i >= 0; i--) {
      const sw = world.shockwaves[i];
      sw.r = lerp(sw.r, sw.maxR, Math.min(1, dt * 10)); sw.life -= dt * 1.75;
      if (sw.life <= 0) world.shockwaves.splice(i, 1);
    }
    for (let i = world.popups.length - 1; i >= 0; i--) {
      const pop = world.popups[i];
      pop.y -= pop.vy * dt * 0.7; pop.life -= dt * 1.1;
      if (pop.life <= 0) world.popups.splice(i, 1);
    }

    // 8. Golden Centered Spring Camera (42%-49% + Facing Look-Ahead)
    const targetRatio = hero.ult.active ? 0.49 : (hero.facing > 0 ? 0.43 : 0.54);
    state.heroRatio = lerp(state.heroRatio, targetRatio, Math.min(1, dt * 3.8));
    let targetCamX = clamp(hero.x - state.width * state.heroRatio, 0, WORLD_LEN - state.width);
    if (state.bossLocked) {
      const arenaCenter = (BOSS_ARENA_LEFT + BOSS_ARENA_RIGHT) * 0.5 - state.width * 0.5;
      targetCamX = lerp(targetCamX, clamp(arenaCenter, BOSS_ARENA_LEFT - 40, WORLD_LEN - state.width), 0.65);
    }
    const acc = (targetCamX - state.camX) * 38 - state.camVelX * 10;
    state.camVelX += acc * dt;
    state.camX += state.camVelX * dt;
  }

  /* ============================================================================
     10. 渲染：场景、领域、角色、敌人与特效（全部用路径实时绘制）
     ============================================================================ */
  const RGB = {};
  function rgb(hex) {
    if (RGB[hex]) return RGB[hex];
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return (RGB[hex] = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`);
  }
  const rgba = (hex, a) => `rgba(${rgb(hex)},${a})`;
  // 发光贴图缓存：径向渐变画一次，之后 drawImage 缩放叠加
  const GLOW = {};
  function glowTex(hex) {
    if (GLOW[hex]) return GLOW[hex];
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), rg = g.createRadialGradient(32, 32, 0, 32, 32, 32), k = rgb(hex);
    rg.addColorStop(0, `rgba(255,255,255,1)`); rg.addColorStop(0.12, `rgba(${k},0.95)`); rg.addColorStop(0.4, `rgba(${k},0.35)`); rg.addColorStop(1, `rgba(${k},0)`);
    g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
    return (GLOW[hex] = c);
  }
  function glow(ctx, x, y, r, hex, a = 1) {
    if (a <= 0.01 || r <= 0.5) return;
    const old = ctx.globalAlpha; ctx.globalAlpha = old * a;
    ctx.drawImage(glowTex(hex), x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = old;
  }
  const hash = (i, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
  const KAI = '"Kaiti SC", "STKaiti", "KaiTi", "PingFang SC", serif';
  const SANS = '"PingFang SC", "Noto Sans SC", "Helvetica Neue", sans-serif';

  function getZoneBlend(x) {
    let idx = 0;
    for (let i = ZONES.length - 1; i >= 0; i--) {
      if (x >= ZONES[i].start) { idx = i; break; }
    }
    const cur = ZONES[idx];
    const next = ZONES[Math.min(ZONES.length - 1, idx + 1)];
    const blend = idx < ZONES.length - 1 ? smoothstep(next.start - 260, next.start + 140, x) : 0;
    return { idx, cur, next, blend };
  }

  // 一条山脊：par 视差系数，base 离地高度，amp 起伏
  function ridge(ctx, w, gy, par, base, amp, col, seed, sharp = 0) {
    const off = state.camX * par;
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, gy);
    for (let x = 0; x <= w + 16; x += 16) {
      const u = (x + off) * 0.004;
      let y = Math.sin(u + seed) * 0.5 + Math.sin(u * 2.3 + seed * 2) * 0.28 + Math.sin(u * 5.1 + seed * 3) * 0.12;
      if (sharp) y = 1 - Math.abs(Math.sin(u * 1.3 + seed)) * 1.6 + Math.sin(u * 4.7) * 0.2;
      ctx.lineTo(x, gy - base - y * amp);
    }
    ctx.lineTo(w + 16, gy); ctx.closePath(); ctx.fill();
  }
  // 按世界坐标平铺物件：每隔 gap 放一个，par 视差
  function tiles(w, par, gap, fn) {
    const off = state.camX * par, i0 = Math.floor((off - 200) / gap), i1 = Math.ceil((off + w + 200) / gap);
    for (let i = i0; i <= i1; i++) fn(i * gap - off, i);
  }
  function roofHouse(ctx, x, gy, ww, hh, wall, roof, lantern) {
    ctx.fillStyle = wall; ctx.fillRect(x - ww / 2, gy - hh, ww, hh);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let k = -1; k <= 1; k++) ctx.fillRect(x + k * ww * 0.3 - 7, gy - hh * 0.72, 14, 18);
    ctx.fillStyle = roof; ctx.beginPath();
    ctx.moveTo(x - ww * 0.66, gy - hh + 2); ctx.quadraticCurveTo(x - ww * 0.45, gy - hh - 6, x - ww * 0.38, gy - hh - 20);
    ctx.lineTo(x + ww * 0.38, gy - hh - 20); ctx.quadraticCurveTo(x + ww * 0.45, gy - hh - 6, x + ww * 0.66, gy - hh + 2); ctx.closePath(); ctx.fill();
    if (lantern) { glow(ctx, x - ww * 0.4, gy - hh + 12, 20, '#ff5a36', 0.8); ctx.fillStyle = '#e0362a'; ctx.beginPath(); ctx.ellipse(x - ww * 0.4, gy - hh + 12, 5, 7, 0, 0, TAU); ctx.fill(); }
  }
  function pagoda(ctx, x, gy, s, col, glowCol) {
    let y = gy, ww = 70 * s;
    for (let k = 0; k < 5; k++) {
      const hh = 26 * s * (1 - k * 0.08);
      ctx.fillStyle = col; ctx.fillRect(x - ww * 0.36, y - hh, ww * 0.72, hh);
      if (glowCol && k % 2 === 0) glow(ctx, x, y - hh * 0.5, ww * 0.28, glowCol, 0.35);
      y -= hh; ctx.beginPath(); ctx.moveTo(x - ww * 0.62, y + 4); ctx.quadraticCurveTo(x - ww * 0.4, y - 4, x - ww * 0.3, y - 10 * s);
      ctx.lineTo(x + ww * 0.3, y - 10 * s); ctx.quadraticCurveTo(x + ww * 0.4, y - 4, x + ww * 0.62, y + 4); ctx.closePath(); ctx.fill();
      y -= 10 * s; ww *= 0.84;
    }
    ctx.fillRect(x - 2 * s, y - 30 * s, 4 * s, 30 * s);
  }
  function bamboo(ctx, x, gy, hh, col, leaf, seed) {
    ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.beginPath(); const sway = Math.sin(state.totalTime * 0.8 + seed) * 6;
    ctx.moveTo(x, gy); ctx.quadraticCurveTo(x, gy - hh * 0.5, x + sway, gy - hh); ctx.stroke();
    ctx.fillStyle = col; for (let k = 1; k < 7; k++) ctx.fillRect(x - 3.5 + sway * (k / 7) ** 2, gy - hh * k / 7, 7, 2);
    ctx.fillStyle = leaf;
    for (let k = 0; k < 6; k++) {
      const ly = gy - hh * (0.45 + k * 0.1), lx = x + sway * ((0.45 + k * 0.1) ** 2), d = k % 2 ? 1 : -1;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.quadraticCurveTo(lx + d * 16, ly - 8, lx + d * 30, ly + 4); ctx.quadraticCurveTo(lx + d * 14, ly + 2, lx, ly); ctx.fill();
    }
  }

  function drawZone(ctx, w, gy, z, t) {
    const sky = ctx.createLinearGradient(0, 0, 0, gy);
    sky.addColorStop(0, `rgb(${z.skyTop})`); sky.addColorStop(1, `rgb(${z.skyBot})`);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, gy + 2);
    const id = z.id;
    if (id === 0) {        // 青竹镇：清晨
      glow(ctx, w * 0.78, gy * 0.28, 150, '#ffe3a1', 0.55); ctx.fillStyle = '#fff4d6'; ctx.beginPath(); ctx.arc(w * 0.78, gy * 0.28, 26, 0, TAU); ctx.fill();
      for (let k = 0; k < 5; k++) { const cx = ((k * 260 - state.camX * 0.03) % (w + 300) + w + 300) % (w + 300) - 150; ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(cx, 60 + k * 23, 70, 12, 0, 0, TAU); ctx.fill(); }
      ridge(ctx, w, gy, 0.05, 150, 60, '#7d9cc0', 1); ridge(ctx, w, gy, 0.12, 80, 40, '#5f7f9c', 4);
      tiles(w, 0.3, 190, (x, i) => roofHouse(ctx, x, gy, 120 + hash(i) * 40, 60 + hash(i, 1) * 30, '#4a5866', '#2a3440', hash(i, 2) > 0.4));
      tiles(w, 0.55, 230, (x, i) => { if (hash(i, 3) > 0.45) bamboo(ctx, x, gy, 180 + hash(i, 4) * 60, '#3c6b4a', '#4e8a5c', i); });
    } else if (id === 1) { // 落日关
      glow(ctx, w * 0.5, gy * 0.72, 260, '#ff9a4a', 0.6); ctx.fillStyle = '#ffd27a'; ctx.beginPath(); ctx.arc(w * 0.5, gy * 0.72, 58, 0, TAU); ctx.fill();
      ridge(ctx, w, gy, 0.05, 110, 70, '#7a3a55', 2); ridge(ctx, w, gy, 0.14, 50, 36, '#4e2236', 6);
      tiles(w, 0.3, 330, (x, i) => {      // 关城与烽火台
        ctx.fillStyle = '#2c1520'; ctx.fillRect(x - 160, gy - 70, 320, 70);
        for (let k = -8; k < 8; k++) ctx.fillRect(x + k * 20, gy - 80, 12, 10);
        ctx.fillRect(x - 30, gy - 150, 60, 80); for (let k = -1; k <= 1; k++) ctx.fillRect(x + k * 22 - 6, gy - 160, 12, 10);
        ctx.fillStyle = '#ffb14a'; ctx.fillRect(x - 6, gy - 130, 12, 16); glow(ctx, x, gy - 122, 26, '#ff8a3a', 0.7);
        ctx.strokeStyle = '#2c1520'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 26, gy - 160); ctx.lineTo(x + 26, gy - 205); ctx.stroke();
        ctx.fillStyle = '#c7372f'; ctx.beginPath(); ctx.moveTo(x + 26, gy - 205); ctx.quadraticCurveTo(x + 46, gy - 200 + Math.sin(t * 4 + i) * 4, x + 62, gy - 196); ctx.lineTo(x + 26, gy - 182); ctx.fill();
      });
    } else if (id === 2) { // 水墨竹林
      ridge(ctx, w, gy, 0.04, 170, 90, 'rgba(70,98,108,0.75)', 3, 1); ridge(ctx, w, gy, 0.09, 110, 70, 'rgba(48,72,82,0.85)', 7, 1);
      ctx.fillStyle = 'rgba(200,225,230,0.12)'; for (let k = 0; k < 3; k++) ctx.fillRect(0, gy - 150 + k * 46 + Math.sin(t * 0.5 + k) * 6, w, 22);
      ridge(ctx, w, gy, 0.18, 40, 30, '#1c2e36', 9);
      tiles(w, 0.42, 70, (x, i) => { if (hash(i, 5) > 0.3) bamboo(ctx, x, gy, 220 + hash(i, 6) * 120, '#203b34', '#2c5446', i); });
    } else if (id === 3) { // 金顶寺
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 6; k++) { const a = -0.5 + k * 0.2; ctx.fillStyle = 'rgba(255,200,110,0.05)'; ctx.beginPath(); ctx.moveTo(w * 0.62, -20); ctx.lineTo(w * 0.62 + Math.sin(a) * 900 - 60, gy); ctx.lineTo(w * 0.62 + Math.sin(a) * 900 + 60, gy); ctx.fill(); }
      ctx.restore();
      ridge(ctx, w, gy, 0.05, 130, 60, '#8a5a2c', 5);
      tiles(w, 0.16, 420, (x, i) => pagoda(ctx, x, gy - 60, 1.25, '#5b3518', '#ffcc66'));
      tiles(w, 0.34, 260, (x, i) => {
        roofHouse(ctx, x, gy, 150, 72, '#6e2c1c', '#3a1d10', false);
        ctx.fillStyle = '#f5c04a'; ctx.fillRect(x - 18, gy - 64, 36, 14); glow(ctx, x, gy - 57, 34, '#ffc95a', 0.5);
        for (let k = 0; k < 3; k++) { const sy = gy - 95 - ((t * 20 + k * 30 + i * 13) % 90); ctx.fillStyle = `rgba(255,235,200,${0.18 * (1 - ((t * 20 + k * 30 + i * 13) % 90) / 90)})`; ctx.beginPath(); ctx.arc(x + Math.sin(t + k + sy * 0.05) * 8, sy, 6 + k * 2, 0, TAU); ctx.fill(); }
      });
    } else if (id === 4) { // 霓虹夜市
      ctx.fillStyle = '#fff'; for (let k = 0; k < 60; k++) ctx.fillRect(hash(k, 9) * w, hash(k, 8) * gy * 0.55, hash(k) > 0.8 ? 2 : 1, 1);
      tiles(w, 0.1, 90, (x, i) => {
        const hh = 120 + hash(i, 1) * 180; ctx.fillStyle = '#140f2c'; ctx.fillRect(x - 36, gy - hh, 72, hh);
        for (let r = 0; r < hh / 16 - 1; r++) for (let c = 0; c < 4; c++) if (hash(i * 31 + r * 7 + c, 2) > 0.55) { ctx.fillStyle = hash(i + r + c, 3) > 0.5 ? 'rgba(255,120,200,0.55)' : 'rgba(120,240,255,0.5)'; ctx.fillRect(x - 28 + c * 16, gy - hh + 10 + r * 16, 8, 6); }
      });
      tiles(w, 0.32, 170, (x, i) => {
        const chars = ['面', '茶', '武', '酒', '馆', '龙'], col = ['#ff4fa3', '#36f5ff', '#ffd23a', '#a46bff'][i & 3 & 3], on = Math.sin(t * 7 + i * 3) > -0.85;
        ctx.fillStyle = '#0c0a1c'; ctx.fillRect(x - 3, gy - 170, 6, 170);
        ctx.strokeStyle = on ? col : rgba(col, 0.25); ctx.lineWidth = 3; ctx.strokeRect(x - 26, gy - 160, 52, 52);
        if (on) glow(ctx, x, gy - 134, 60, col, 0.45);
        ctx.fillStyle = on ? '#fff' : rgba(col, 0.4); ctx.font = `900 34px ${KAI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(chars[((i % 6) + 6) % 6], x, gy - 133);
        glow(ctx, x + 60, gy - 40, 14, '#ff4a3a', 0.9);
      });
    } else {               // 赤鬼擂台
      glow(ctx, w * 0.5, gy, w * 0.7, '#ff3a1a', 0.35);
      ridge(ctx, w, gy, 0.05, 120, 90, '#3a0d12', 11, 1); ridge(ctx, w, gy, 0.12, 60, 50, '#240609', 13, 1);
      tiles(w, 0.3, 260, (x, i) => {
        ctx.fillStyle = '#1a0507'; ctx.fillRect(x - 8, gy - 120, 16, 120);
        ctx.fillRect(x - 20, gy - 130, 40, 12);
        const fl = 0.75 + 0.25 * Math.sin(t * 13 + i * 2);
        glow(ctx, x, gy - 140, 50 * fl, '#ff6a1a', 0.85);
        ctx.fillStyle = '#ffcf5a'; ctx.beginPath(); ctx.moveTo(x - 10, gy - 132); ctx.quadraticCurveTo(x, gy - 170 * fl, x + 10, gy - 132); ctx.fill();
      });
      ctx.fillStyle = 'rgba(255,140,60,0.7)'; for (let k = 0; k < 24; k++) { const px = (hash(k, 4) * w + t * 30 * (0.5 + hash(k))) % w, py = gy - ((t * 50 * (0.4 + hash(k, 2)) + hash(k, 3) * gy) % gy); ctx.fillRect(px, py, 2, 2); }
    }
  }

  function drawGround(ctx, w, h, gy, z) {
    const gg = ctx.createLinearGradient(0, gy, 0, h);
    gg.addColorStop(0, z.ground); gg.addColorStop(1, '#05050a');
    ctx.fillStyle = gg; ctx.fillRect(0, gy, w, h - gy);
    const tile = 48, offX = -(state.camX % tile);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
    for (let x = offX - tile; x < w + tile; x += tile) {
      ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x - 18, h); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let x = offX - tile; x < w + tile; x += tile) ctx.fillRect(x + 4, gy + 4, tile - 10, 3);
    const tg = ctx.createLinearGradient(0, gy - 2, 0, gy + 10);
    const trim = state.domainAlpha > 0.2 ? FORMS[state.domainForm].primary : z.trim;
    tg.addColorStop(0, trim); tg.addColorStop(1, rgba(trim, 0));
    ctx.fillStyle = tg; ctx.fillRect(0, gy - 1, w, 10);
    if (z.id === 0 || z.id === 2) {
      ctx.fillStyle = z.id === 0 ? '#4f7a3a' : '#2d4a3c';
      tiles(w, 1, 37, (x, i) => { if (hash(i, 7) > 0.5) { ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + 3, gy - 7 - hash(i) * 6); ctx.lineTo(x + 6, gy); ctx.fill(); } });
    }
  }

  function drawDomainBackdrop(ctx, w, h, groundY) {
    if (state.domainAlpha <= 0.01) return;
    const a = state.domainAlpha, df = state.domainForm, t = state.totalTime, f = FORMS[df];
    const cx = w * 0.5, cy = h * 0.46;
    ctx.save(); ctx.globalAlpha = a;
    const vg = ctx.createRadialGradient(cx, cy, 20, cx, cy, w * 0.7);
    vg.addColorStop(0, rgba(f.primary, 0.42)); vg.addColorStop(0.5, rgba(f.secondary === '#111827' ? f.accent : f.secondary, 0.35)); vg.addColorStop(1, 'rgba(3,3,8,0.96)');
    ctx.fillStyle = '#05050b'; ctx.fillRect(0, 0, w, groundY); ctx.fillStyle = vg; ctx.fillRect(0, 0, w, groundY);
    ctx.save(); ctx.translate(cx, cy);
    if (df === 3) {          // 八卦阵盘
      ctx.rotate(t * 0.5); ctx.strokeStyle = 'rgba(248,250,252,0.35)'; ctx.lineWidth = 2;
      for (const R of [150, 230, 300]) { ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke(); }
      for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i / 8 * TAU); for (let k = 0; k < 3; k++) { const broken = (i >> k) & 1; ctx.fillStyle = 'rgba(248,250,252,0.5)'; if (broken) { ctx.fillRect(-22, -262 + k * 12, 18, 6); ctx.fillRect(4, -262 + k * 12, 18, 6); } else ctx.fillRect(-22, -262 + k * 12, 44, 6); } ctx.restore(); }
    } else if (df === 2) {   // 水墨：大笔触
      ctx.fillStyle = 'rgba(230,240,245,0.12)'; for (let i = 0; i < 5; i++) { ctx.rotate(1.2); ctx.beginPath(); ctx.ellipse(0, 0, 360, 26 + i * 6, 0, 0, TAU); ctx.fill(); }
    } else if (df === 9 || df === 5) {
      ctx.fillStyle = '#fff'; for (let i = 0; i < 90; i++) { const r = (hash(i) * 600 + t * 260 * (0.3 + hash(i, 1))) % 600, an = hash(i, 2) * TAU; ctx.globalAlpha = a * (r / 600); ctx.fillRect(Math.cos(an) * r, Math.sin(an) * r, 2, 2); }
    } else if (df === 8) {
      ctx.translate(-cx, -cy); ctx.strokeStyle = 'rgba(236,72,153,0.4)'; ctx.lineWidth = 1.2; const hy = groundY * 0.56;
      for (let i = -10; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(cx + i * 30, hy); ctx.lineTo(cx + i * 200, groundY); ctx.stroke(); }
      for (let r = 0; r < 9; r++) { const py = hy + Math.pow((r + (t * 2.5) % 1) / 9, 1.8) * (groundY - hy); ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(w, py); ctx.stroke(); }
    } else {
      ctx.rotate(t * 0.3); ctx.strokeStyle = rgba(f.accent, 0.3); ctx.lineWidth = 3;
      for (let i = 0; i < 12; i++) { ctx.rotate(TAU / 12); ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(420, 0); ctx.stroke(); }
    }
    ctx.restore();
    // 漫画放射速度线
    ctx.strokeStyle = `rgba(255,255,255,${0.28 * a})`; ctx.lineWidth = 2;
    const maxR = Math.hypot(w, h) * 0.65;
    for (let i = 0; i < 48; i++) {
      const ang = (i / 48) * TAU + hash(i + Math.floor(t * 20)) * 0.06, inner = maxR * (0.42 + hash(i, Math.floor(t * 20)) * 0.25);
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * inner, cy + Math.sin(ang) * inner); ctx.lineTo(cx + Math.cos(ang) * maxR, cy + Math.sin(ang) * maxR); ctx.stroke();
    }
    ctx.restore();
  }

  function drawAtmosphere(ctx, w, h, groundY) {
    const zb = getZoneBlend(hero.x), t = state.totalTime;
    drawZone(ctx, w, groundY, zb.cur, t);
    if (zb.blend > 0.01) { ctx.save(); ctx.globalAlpha = zb.blend; drawZone(ctx, w, groundY, zb.next, t); ctx.restore(); }
    drawDomainBackdrop(ctx, w, h, groundY);
    drawGround(ctx, w, h, groundY, zb.blend > 0.5 ? zb.next : zb.cur);
  }

  /* ---------- 主角：少侠（两节手臂、两节腿的骨架） ---------- */
  const POSES = {
    //        torso   后臂[肩,肘]     前臂[肩,肘]      后腿[髋,膝]     前腿[髋,膝]
    idle:     [0.05, [0.5, -1.6], [-0.4, -1.9], [0.22, 0.25], [-0.25, 0.3], 3],
    punch:    [0.22, [0.9, -1.4], [-1.62, -0.05], [0.55, 0.3], [-0.55, 0.5], 4],
    hook:     [0.3, [0.6, -1.2], [-1.25, -1.2], [0.5, 0.35], [-0.5, 0.45], 4],
    uppercut: [-0.22, [0.8, -1.5], [-2.85, -0.25], [0.45, 0.6], [-0.4, 0.2], 0],
    kick:     [-0.36, [1.0, -1.0], [-0.9, -0.8], [0.45, 0.4], [-1.65, 0.05], 0],
    sweep:    [0.5, [1.2, -0.6], [-0.4, -1.0], [0.9, 1.6], [-1.45, 0.05], 14],
    flurry:   [0.26, [-1.3, -0.3], [-1.5, -0.1], [0.55, 0.4], [-1.4, 0.1], 2],
    iaido:    [0.48, [1.4, -0.3], [-0.6, -0.3], [0.95, 1.0], [-0.8, 0.9], 10],
    slash:    [0.3, [0.9, -0.8], [-2.2, -0.2], [0.6, 0.4], [-0.6, 0.6], 4],
    palm:     [0.15, [-1.3, -0.3], [-1.55, -0.05], [0.7, 0.5], [-0.6, 0.7], 6],
    spear:    [0.32, [-1.2, -0.9], [-1.55, -0.3], [0.75, 0.6], [-0.65, 0.7], 6],
    ninja:    [0.62, [1.4, -0.2], [1.2, -0.4], [0.9, 1.2], [-0.7, 1.0], 6],
    float:    [0, [-2.0, -0.4], [-1.2, -0.8], [0.25, 0.6], [-0.35, 0.9], -4],
    victory:  [-0.05, [-2.6, -0.2], [-2.4, -0.6], [0.2, 0.1], [-0.2, 0.1], 0],
    somersault: [0.4, [0.6, -2.0], [-0.6, -2.0], [-0.9, 2.2], [-1.1, 2.3], 0],
  };
  const SKIN = '#f2c49b', HAIR = '#16110e', INK = '#0b0d14';
  function limb(ctx, x, y, a1, a2, l1, l2, col, w1, w2, endR, endCol) {
    const ex = x - Math.sin(a1) * l1, ey = y + Math.cos(a1) * l1, b = a1 + a2;
    const fx = ex - Math.sin(b) * l2, fy = ey + Math.cos(b) * l2;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = w1 + 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.lineTo(fx, fy); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = w1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.lineWidth = w2; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(fx, fy); ctx.stroke();
    if (endR) { ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(fx, fy, endR + 1.5, 0, TAU); ctx.fill(); ctx.fillStyle = endCol; ctx.beginPath(); ctx.arc(fx, fy, endR, 0, TAU); ctx.fill(); }
    return [fx, fy, b];
  }
  function outfit(fi) {
    const f = FORMS[fi];
    const o = { gi: f.primary, pants: f.secondary, sash: f.accent, trim: '#ffffff' };
    if (fi === 0) { o.gi = '#c8322b'; o.pants = '#20263a'; o.sash = '#ffd166'; }
    if (fi === 1) { o.gi = '#f2c94c'; o.pants = '#16181f'; o.sash = '#16181f'; o.trim = '#16181f'; }
    if (fi === 2 || fi === 3 || fi === 9) { o.pants = '#1c2433'; }
    if (fi === 3) { o.sash = '#0b0f18'; }
    if (fi === 5) { o.gi = '#2b2a6e'; o.pants = '#18173d'; o.sash = '#f43f5e'; }
    if (fi === 6) { o.pants = '#4a1610'; o.sash = '#fbbf24'; }
    if (fi === 4) { o.pants = '#6b1a12'; }
    if (fi === 8) { o.gi = '#1b1020'; o.pants = '#0c0810'; o.sash = '#ec4899'; o.trim = '#00f5d4'; }
    return o;
  }
  function drawHero(ctx, sx, sy, formIdx, pose, alpha = 1.0, isGhost = false, spin = 0, facing = 1) {
    const f = FORMS[formIdx], o = outfit(formIdx), t = state.totalTime;
    ctx.save();
    if (!isGhost && hero.invuln > 0 && Math.floor(t * 22) % 2 === 0) alpha *= 0.4;
    ctx.globalAlpha = alpha; ctx.translate(sx, sy);
    if (!isGhost) {
      // 脚下影子与气场
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, (hero.y > 0 ? hero.y : 0) + 2, 20 - Math.min(14, hero.y * 0.05), 4, 0, 0, TAU); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glow(ctx, 0, -34, (formIdx === 9 ? 70 : 52) * (1 + hero.transformFlash * 0.8), f.primary, 0.32 + hero.transformFlash * 0.5);
      if (formIdx === 3) for (let k = 0; k < 2; k++) { const a = t * 3.8 + k * Math.PI; ctx.fillStyle = k ? '#0f172a' : '#ffffff'; ctx.beginPath(); ctx.arc(Math.cos(a) * 36, -34 + Math.sin(a) * 18, 5, 0, TAU); ctx.fill(); }
      if (formIdx === 4 || formIdx === 9) {
        ctx.save(); ctx.translate(0, -58); ctx.rotate(t * 1.4); ctx.strokeStyle = formIdx === 9 ? '#38bdf8' : '#f5c04a'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 20, 0, TAU); ctx.stroke(); for (let i = 0; i < 8; i++) { ctx.rotate(TAU / 8); ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(28, 0); ctx.stroke(); }
        ctx.restore();
      }
      if (formIdx === 7) for (let k = 0; k < 5; k++) { const a = t * 2 + k * 1.26; glow(ctx, Math.cos(a) * 26, -30 + Math.sin(a * 1.3) * 22, 7, '#bff4ff', 0.8); }
      if (formIdx === 5 && Math.random() < 0.3) { ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 1.5; ctx.beginPath(); let px = (Math.random() - 0.5) * 40, py = -60; ctx.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (Math.random() - 0.5) * 16; py += 14; ctx.lineTo(px, py); } ctx.stroke(); }
      ctx.restore();
      // 头带飘带
      ctx.save(); ctx.lineCap = 'round';
      for (const [lw, col] of [[7, INK], [4.5, o.sash]]) {
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
        for (let i = 0; i < hero.scarf.length; i++) { const lx = hero.scarf[i].x - hero.x, ly = -(hero.scarf[i].y - hero.y) - 10; if (i === 0) ctx.moveTo(lx, ly); else ctx.lineTo(lx, ly); }
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.scale(facing, 1);
    if (pose === 'somersault') { ctx.translate(0, -32); ctx.rotate(spin); ctx.translate(0, 32); }
    const P = POSES[pose] || POSES.idle;
    let tilt = P[0], ba = P[1], fa = P[2], bl = P[3], fl = P[4], crouch = P[5];
    if (pose === 'run') {
      const rc = hero.runCycle; tilt = 0.22; crouch = 3 + Math.abs(Math.sin(rc)) * -3;
      bl = [Math.sin(rc) * 0.85, 0.3 + Math.max(0, Math.cos(rc)) * 1.2]; fl = [-Math.sin(rc) * 0.85, 0.3 + Math.max(0, -Math.cos(rc)) * 1.2];
      ba = [-Math.sin(rc) * 0.9, -1.4]; fa = [Math.sin(rc) * 0.9, -1.4];
    } else if (pose === 'idle') { crouch += Math.sin(t * 3) * 1; }
    if (pose === 'flurry') { fa = [-1.5 + Math.sin(t * 50) * 0.5, -0.1]; ba = [-1.3 - Math.sin(t * 50) * 0.5, -0.3]; }
    const ghostCol = isGhost ? f.primary : null;
    const C = (c) => ghostCol || c;
    const hipY = -27 + crouch;
    // 后腿 后臂
    limb(ctx, -2, hipY, bl[0], bl[1], 13, 13, C(o.pants), 8, 7, 4, C('#15131a'));
    ctx.save(); ctx.translate(0, hipY); ctx.rotate(tilt);
    const sh = -19;
    limb(ctx, -3, sh, ba[0], ba[1], 11, 10, C(o.gi), 6.5, 5.5, 3.6, C(SKIN));
    // 躯干：上衣、交领、腰带
    ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(-10.5, sh - 3.5, 21, 25, 6); ctx.fill();
    ctx.fillStyle = C(o.gi); ctx.beginPath(); ctx.roundRect(-9, sh - 2, 18, 22, 5); ctx.fill();
    if (!isGhost) {
      ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(-8, sh - 1, 5, 18);
      ctx.strokeStyle = o.trim; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, sh - 1); ctx.lineTo(3, sh + 11); ctx.moveTo(6, sh - 1); ctx.lineTo(0, sh + 7); ctx.stroke();
      ctx.fillStyle = o.sash; ctx.fillRect(-9.5, sh + 14, 19, 5); ctx.fillRect(-11, sh + 17, 5, 9);
    }
    ctx.restore();
    // 前腿
    limb(ctx, 2, hipY, fl[0], fl[1], 13, 13, C(o.pants), 8, 7, 4, C('#15131a'));
    ctx.save(); ctx.translate(0, hipY); ctx.rotate(tilt);
    // 头：脸、眉眼、发髻、头带
    const hx = 1, hy = sh - 10;
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(hx, hy, 10, 0, TAU); ctx.fill();
    ctx.fillStyle = C(SKIN); ctx.beginPath(); ctx.arc(hx, hy, 8.6, 0, TAU); ctx.fill();
    if (!isGhost) {
      ctx.fillStyle = HAIR; ctx.beginPath(); ctx.arc(hx - 1, hy - 1, 9, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
      ctx.beginPath(); ctx.arc(hx - 7, hy - 9, 4.6, 0, TAU); ctx.fill();
      ctx.fillStyle = o.sash; ctx.fillRect(hx - 9, hy - 6.5, 18, 3);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(hx + 5, hy + 0.5, 2.4, 1.9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = HAIR; ctx.beginPath(); ctx.arc(hx + 5.8, hy + 0.6, 1.3, 0, TAU); ctx.fill();
      ctx.strokeStyle = HAIR; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(hx + 2.2, hy - 2.6); ctx.lineTo(hx + 7.8, hy - 1.6); ctx.stroke();
      ctx.fillStyle = '#c96b5a'; ctx.fillRect(hx + 4, hy + 5, 3, 1.3);
      if (formIdx === 5) { ctx.fillStyle = '#18173d'; ctx.fillRect(hx - 2, hy + 3, 11, 5); }
      if (formIdx === 8) { ctx.fillStyle = '#00f5d4'; ctx.fillRect(hx - 1, hy - 1, 10, 3); glow(ctx, hx + 5, hy, 10, '#00f5d4', 0.6); }
      if (formIdx === 2) { ctx.fillStyle = '#d9dee6'; ctx.beginPath(); ctx.moveTo(hx - 20, hy - 5); ctx.lineTo(hx, hy - 15); ctx.lineTo(hx + 20, hy - 5); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke(); }
    }
    // 前臂 + 武器
    const hand = limb(ctx, 3, sh, fa[0], fa[1], 11, 10, C(o.gi), 6.5, 5.5, 3.8, C(SKIN));
    if (!isGhost) {
      const [wx, wy, wa] = hand;
      ctx.save(); ctx.translate(wx, wy); ctx.rotate(wa);
      if (formIdx === 2 || formIdx === 8) {
        const neon = formIdx === 8, len = 46;
        ctx.save(); ctx.rotate(-0.35); ctx.fillStyle = INK; ctx.fillRect(-2.5, -8, 5, 10);
        ctx.fillStyle = neon ? '#00f5d4' : '#d8e3ee'; ctx.beginPath(); ctx.moveTo(-2.2, 2); ctx.lineTo(2.2, 2); ctx.lineTo(1.2, len); ctx.lineTo(-0.6, len + 5); ctx.closePath(); ctx.fill();
        if (neon) { ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, len * 0.5, 26, '#00f5d4', 0.5); }
        ctx.fillStyle = neon ? '#ec4899' : '#c9a24a'; ctx.fillRect(-5, 0, 10, 2.5);
        ctx.restore();
      } else if (formIdx === 1) {
        const a = t * 22; ctx.fillStyle = '#2b1d12'; ctx.save(); ctx.rotate(-1.2); ctx.fillRect(-2, -3, 4, 16); ctx.restore();
        ctx.strokeStyle = '#999'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 8, Math.sin(a) * 8); ctx.stroke();
        ctx.save(); ctx.translate(Math.cos(a) * 8, Math.sin(a) * 8); ctx.rotate(a); ctx.fillStyle = '#2b1d12'; ctx.fillRect(0, -2, 16, 4); ctx.restore();
      } else if (formIdx === 5) {
        ctx.rotate(-0.2); ctx.fillStyle = '#c7d2fe'; ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(2, 0); ctx.lineTo(0, 16); ctx.closePath(); ctx.fill();
      } else if (formIdx === 6) {
        ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -36); ctx.lineTo(0, 58); ctx.stroke();
        ctx.strokeStyle = '#8b4a1e'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#e8edf2'; ctx.beginPath(); ctx.moveTo(-4, 56); ctx.lineTo(0, 74); ctx.lineTo(4, 56); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(-5, 54); ctx.quadraticCurveTo(-9, 48 + Math.sin(t * 20) * 3, -12, 44); ctx.lineTo(5, 54); ctx.fill();
      } else {
        const hot = hero.attackTimer > 0 || hero.ult.active;
        ctx.globalCompositeOperation = 'lighter';
        glow(ctx, 0, 0, hot ? 20 : 11, formIdx === 7 ? '#bff4ff' : formIdx === 0 ? '#ff7a2b' : f.accent, hot ? 0.9 : 0.5);
      }
      ctx.restore();
    }
    ctx.restore();
    if (!isGhost && formIdx === 6) {          // 风火轮
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const wx of [-7, 7]) { ctx.save(); ctx.translate(wx, -2); ctx.rotate(t * 18); ctx.strokeStyle = '#ff7a2b'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU * 0.8); ctx.stroke(); ctx.restore(); glow(ctx, wx, -2, 12, '#ff5722', 0.6); }
      ctx.restore();
    }
    ctx.restore();
  }

  /* ---------- 敌人 ---------- */
  function drawEnemy(ctx, e, t) {
    const white = e.flash > 0.02, step = Math.sin(t * 9 + e.seed * 5);
    const sq = e.squash || 0;
    ctx.scale(1 + sq * 0.25, 1 - sq * 0.25);
    if (e.type === 'lantern') {          // 灯笼妖
      ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 6, 10); ctx.lineTo(k * 6 + (k < 0 ? step : -step) * 4, 18); ctx.stroke(); }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, -6, 40, '#ff6a2a', 0.55); ctx.restore();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(0, -6, 17.5, 17.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = white ? '#fff' : '#d92c22'; ctx.beginPath(); ctx.ellipse(0, -6, 16, 16, 0, 0, TAU); ctx.fill();
      if (!white) {
        ctx.fillStyle = 'rgba(255,190,90,0.35)'; ctx.beginPath(); ctx.ellipse(-4, -9, 8, 11, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(80,10,10,0.6)'; ctx.lineWidth = 1.2; for (const k of [-9, 0, 9]) { ctx.beginPath(); ctx.ellipse(0, -6, Math.abs(k) * 1.4 + 2, 16, 0, -1.4, 1.4); ctx.stroke(); }
        ctx.fillStyle = '#f5c04a'; ctx.fillRect(-9, -24, 18, 5); ctx.fillRect(-8, 8, 16, 4);
        ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.moveTo(-9, -10); ctx.lineTo(-2, -7); ctx.lineTo(-9, -5); ctx.fill(); ctx.beginPath(); ctx.moveTo(9, -10); ctx.lineTo(2, -7); ctx.lineTo(9, -5); ctx.fill();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-7, 0); for (let k = 0; k < 5; k++) ctx.lineTo(-7 + k * 3.5, k % 2 ? 4 : 1); ctx.lineTo(7, 0); ctx.lineTo(0, 6); ctx.fill();
        ctx.strokeStyle = '#f5c04a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(Math.sin(t * 6 + e.seed) * 3, 22); ctx.stroke();
      }
    } else if (e.type === 'terra') {     // 陶俑兵
      ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineCap = 'round';
      for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 5, 6); ctx.lineTo(k * 5 + (k < 0 ? step : -step) * 5, 18); ctx.stroke(); }
      ctx.strokeStyle = white ? '#fff' : '#8c5a3a'; ctx.lineWidth = 3.5; for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 5, 6); ctx.lineTo(k * 5 + (k < 0 ? step : -step) * 5, 18); ctx.stroke(); }
      ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-16, -34); ctx.lineTo(-12, 16); ctx.stroke();
      ctx.fillStyle = '#c9d2dc'; ctx.beginPath(); ctx.moveTo(-19, -34); ctx.lineTo(-16, -44); ctx.lineTo(-13, -34); ctx.fill();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(-13, -22, 26, 30, 5); ctx.fill();
      ctx.fillStyle = white ? '#fff' : '#a66a42'; ctx.beginPath(); ctx.roundRect(-11.5, -20.5, 23, 27, 4); ctx.fill();
      if (!white) { ctx.fillStyle = '#7a4a2c'; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) ctx.fillRect(-9 + c * 7, -17 + r * 6, 5, 4); ctx.fillStyle = '#5c3820'; ctx.fillRect(-11.5, 2, 23, 4); }
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, -29, 9.5, 0, TAU); ctx.fill();
      ctx.fillStyle = white ? '#fff' : '#b77a50'; ctx.beginPath(); ctx.arc(0, -29, 8, 0, TAU); ctx.fill();
      if (!white) { ctx.fillStyle = '#4a2e1a'; ctx.beginPath(); ctx.arc(0, -33, 8, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.arc(3, -40, 3.5, 0, TAU); ctx.fill(); ctx.fillStyle = '#2a1408'; ctx.fillRect(-6, -29, 4, 2); ctx.fillRect(-1, -29, 4, 2); ctx.fillStyle = '#ff5a36'; ctx.fillRect(-5.5, -29, 2, 1.5); ctx.fillRect(-0.5, -29, 2, 1.5); }
    } else if (e.type === 'kite') {      // 纸鸢妖
      const flap = Math.sin(t * 10 + e.seed) * 0.15;
      ctx.rotate(flap);
      ctx.strokeStyle = 'rgba(240,240,240,0.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 22); for (let k = 1; k < 6; k++) ctx.lineTo(Math.sin(t * 6 + k + e.seed) * 6, 22 + k * 8); ctx.stroke();
      for (let k = 1; k < 5; k++) { ctx.fillStyle = k % 2 ? '#ef4444' : '#f5c04a'; ctx.beginPath(); const bx = Math.sin(t * 6 + k + e.seed) * 6, by = 22 + k * 8; ctx.moveTo(bx - 4, by - 3); ctx.lineTo(bx + 4, by + 3); ctx.lineTo(bx + 4, by - 3); ctx.lineTo(bx - 4, by + 3); ctx.fill(); }
      ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(24, -2); ctx.lineTo(0, 24); ctx.lineTo(-24, -2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = white ? '#fff' : '#f3e6c8'; ctx.beginPath(); ctx.moveTo(0, -23); ctx.lineTo(21, -2); ctx.lineTo(0, 21); ctx.lineTo(-21, -2); ctx.closePath(); ctx.fill();
      if (!white) {
        ctx.fillStyle = '#2f6fd6'; ctx.beginPath(); ctx.moveTo(0, -23); ctx.lineTo(21, -2); ctx.lineTo(0, -2); ctx.fill(); ctx.fillStyle = '#d63a2f'; ctx.beginPath(); ctx.moveTo(0, 21); ctx.lineTo(-21, -2); ctx.lineTo(0, -2); ctx.fill();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(-6, -4, 4, 3, -0.4, 0, TAU); ctx.ellipse(6, -4, 4, 3, 0.4, 0, TAU); ctx.fill();
        ctx.fillStyle = '#ffe14a'; ctx.beginPath(); ctx.arc(-6, -4, 1.5, 0, TAU); ctx.arc(6, -4, 1.5, 0, TAU); ctx.fill();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-6, 5); ctx.lineTo(6, 5); ctx.lineTo(0, 10); ctx.fill();
      }
    } else if (e.type === 'arrow') {     // 火箭
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 5; k++) glow(ctx, 18 + k * 9, Math.sin(t * 30 + k) * 2, 16 - k * 2, k < 2 ? '#ffd23a' : '#ff5a1a', 0.7);
      ctx.restore();
      ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(22, 0); ctx.stroke();
      ctx.strokeStyle = white ? '#fff' : '#9a6a3a'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#e6edf3'; ctx.beginPath(); ctx.moveTo(-36, 0); ctx.lineTo(-24, -6); ctx.lineTo(-24, 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d63a2f'; for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(24, k * 8); ctx.lineTo(20, 0); ctx.fill(); }
    } else if (e.type === 'monk') {      // 醉和尚
      ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.lineCap = 'round';
      for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 7, 4); ctx.lineTo(k * 8 + (k < 0 ? step : -step) * 3, 18); ctx.stroke(); }
      ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(0, -8, 19, 18, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = white ? '#fff' : '#d9772b'; ctx.beginPath(); ctx.ellipse(0, -8, 17.5, 16.5, 0, 0, TAU); ctx.fill();
      if (!white) {
        ctx.fillStyle = '#f2c49b'; ctx.beginPath(); ctx.ellipse(4, -4, 8, 10, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#8a2b1c'; for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.arc(-12 + k * 4, -20 + Math.abs(k - 3) * 2.2, 2, 0, TAU); ctx.fill(); }
      }
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, -31, 10.5, 0, TAU); ctx.fill();
      ctx.fillStyle = white ? '#fff' : '#f2c49b'; ctx.beginPath(); ctx.arc(0, -31, 9, 0, TAU); ctx.fill();
      if (!white) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(-3, -36, 3, 0, TAU); ctx.fill(); ctx.fillStyle = '#e8584a'; ctx.beginPath(); ctx.arc(-5, -28, 2.6, 0, TAU); ctx.arc(5, -28, 2.6, 0, TAU); ctx.fill(); ctx.fillStyle = INK; ctx.fillRect(-5, -32, 4, 1.5); ctx.fillRect(1, -32, 4, 1.5); ctx.fillRect(-2, -26, 5, 1.6); }
      if (e.cd < 0.5 && !white) { ctx.save(); ctx.translate(-16, -36 - (0.5 - e.cd) * 20); drawJar(ctx); ctx.restore(); }
    }
    if (e.frozen > 0 && e.alive) {
      ctx.fillStyle = 'rgba(150,230,255,0.45)'; ctx.strokeStyle = '#e0f7ff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-20, 18); ctx.lineTo(-22, -24); ctx.lineTo(-8, -40); ctx.lineTo(12, -36); ctx.lineTo(22, -14); ctx.lineTo(20, 18); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-14, -30, 4, 22);
    }
    if (e.marked && e.alive) { ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.arc(0, -10, 26, t * 4, t * 4 + TAU); ctx.stroke(); ctx.setLineDash([]); }
  }
  function drawJar(ctx) {
    ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(0, 0, 9.5, 10.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#7a4a22'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 9, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#5a3418'; ctx.fillRect(-4, -12, 8, 4);
    ctx.fillStyle = '#d63a2f'; ctx.fillRect(-5, -4, 10, 8); ctx.fillStyle = '#ffe9a8'; ctx.font = `900 7px ${KAI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('酒', 0, 0.5);
  }

  /* ---------- 首领：赤鬼王 ---------- */
  function drawBoss(ctx, b, t) {
    const white = b.flash > 0.05, breathe = Math.sin(t * 2.4) * 2, lean = b.state === 'charge' ? -0.18 : 0;
    const skin = white ? '#ffffff' : b.enraged ? '#e0362b' : '#b8262a', dark = white ? '#ffffff' : '#5e0f14';
    ctx.rotate(lean);
    if (b.alive) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, -40, b.enraged ? 170 : 120, b.enraged ? '#ff4a1a' : '#ff2a2a', b.enraged ? 0.55 : 0.3);
      if (b.enraged) for (let k = 0; k < 8; k++) { const a = -Math.PI / 2 + (k - 3.5) * 0.28, r = 70 + Math.sin(t * 12 + k) * 10; glow(ctx, Math.cos(a) * r, -95 + Math.sin(a) * r * 0.6, 22, '#ffb23a', 0.6); }
      ctx.restore(); }
    // 腿
    for (const k of [-1, 1]) { ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(k * 22 - 13, 10, 26, 52, 8); ctx.fill(); ctx.fillStyle = dark; ctx.beginPath(); ctx.roundRect(k * 22 - 11, 12, 22, 48, 7); ctx.fill(); ctx.fillStyle = white ? '#fff' : '#2a2a30'; ctx.fillRect(k * 22 - 14, 52, 28, 10); }
    // 狼牙棒（后手）
    ctx.save(); ctx.translate(48, -30 + breathe); ctx.rotate(b.state === 'charge' ? -1.1 : 0.5 + Math.sin(t * 2) * 0.08);
    ctx.fillStyle = INK; ctx.fillRect(-5, -10, 10, 90); ctx.fillStyle = '#4a2e1a'; ctx.fillRect(-3.5, -10, 7, 90);
    ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(0, -36, 19, 30, 0, 0, TAU); ctx.fill(); ctx.fillStyle = white ? '#fff' : '#3a3a44'; ctx.beginPath(); ctx.ellipse(0, -36, 16.5, 27, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#c9d2dc'; for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 14, -36 + Math.sin(a) * 24); ctx.lineTo(Math.cos(a) * 24, -36 + Math.sin(a) * 36); ctx.lineTo(Math.cos(a + 0.3) * 14, -36 + Math.sin(a + 0.3) * 24); ctx.fill(); }
    ctx.restore();
    // 躯干与盔甲
    ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(-50, -92 + breathe, 100, 108, 30); ctx.fill();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.roundRect(-47, -89 + breathe, 94, 102, 28); ctx.fill();
    if (!white) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(-14, -40 + breathe, 12, 18, 0, 0, TAU); ctx.ellipse(14, -40 + breathe, 12, 18, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#c9952e'; ctx.beginPath(); ctx.roundRect(-46, -8 + breathe, 92, 20, 6); ctx.fill();
      ctx.fillStyle = '#2a1a0a'; ctx.beginPath(); ctx.arc(0, 2 + breathe, 13, 0, TAU); ctx.fill(); ctx.save(); if (ctx.getTransform().a < 0) ctx.scale(-1, 1); ctx.fillStyle = '#ffcf5a'; ctx.font = `900 16px ${KAI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('鬼', 0, 3 + breathe); ctx.restore();
      for (const k of [-1, 1]) { ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(k * 48, -78 + breathe, 30, 20, k * 0.3, 0, TAU); ctx.fill(); ctx.fillStyle = '#c9952e'; ctx.beginPath(); ctx.ellipse(k * 48, -78 + breathe, 27, 17, k * 0.3, 0, TAU); ctx.fill(); ctx.fillStyle = '#e8c060'; ctx.beginPath(); ctx.moveTo(k * 40, -94 + breathe); ctx.lineTo(k * 58, -112 + breathe); ctx.lineTo(k * 62, -90 + breathe); ctx.fill(); }
    }
    // 前臂（拳）
    const punch = b.state === 'charge' ? -1.4 : -0.3 + Math.sin(t * 2.4) * 0.1;
    ctx.save(); ctx.translate(-44, -70 + breathe); ctx.rotate(punch);
    ctx.fillStyle = INK; ctx.beginPath(); ctx.roundRect(-14, -4, 28, 64, 12); ctx.fill(); ctx.fillStyle = skin; ctx.beginPath(); ctx.roundRect(-12, -2, 24, 60, 11); ctx.fill();
    ctx.fillStyle = white ? '#fff' : '#c9952e'; ctx.fillRect(-13, 34, 26, 9);
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, 64, 17, 0, TAU); ctx.fill(); ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, 64, 15, 0, TAU); ctx.fill();
    ctx.restore();
    // 头
    const hy = -112 + breathe;
    ctx.fillStyle = white ? '#fff' : '#f2f2ee'; for (let k = 0; k < 11; k++) { const a = Math.PI + k / 10 * Math.PI; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 24, hy + Math.sin(a) * 22); ctx.lineTo(Math.cos(a) * (46 + Math.sin(t * 8 + k) * 4), hy + Math.sin(a) * (40 + Math.sin(t * 8 + k) * 4)); ctx.lineTo(Math.cos(a + 0.25) * 24, hy + Math.sin(a + 0.25) * 22); ctx.fill(); }
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, hy, 29, 0, TAU); ctx.fill(); ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, hy, 26.5, 0, TAU); ctx.fill();
    for (const k of [-1, 1]) { ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(k * 12, hy - 20); ctx.quadraticCurveTo(k * 30, hy - 40, k * 22, hy - 62); ctx.quadraticCurveTo(k * 20, hy - 40, k * 2, hy - 24); ctx.fill(); ctx.fillStyle = white ? '#fff' : '#efe2c0'; ctx.beginPath(); ctx.moveTo(k * 11, hy - 21); ctx.quadraticCurveTo(k * 27, hy - 40, k * 22, hy - 58); ctx.quadraticCurveTo(k * 18, hy - 40, k * 4, hy - 24); ctx.fill(); }
    if (!white) {
      ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-18, hy - 8); ctx.lineTo(-3, hy - 2); ctx.lineTo(-18, hy + 1); ctx.fill(); ctx.beginPath(); ctx.moveTo(18, hy - 8); ctx.lineTo(3, hy - 2); ctx.lineTo(18, hy + 1); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, -11, hy - 3, 12, '#ffe14a', 0.9); glow(ctx, 11, hy - 3, 12, '#ffe14a', 0.9); ctx.restore();
      ctx.fillStyle = '#ffe14a'; ctx.fillRect(-14, hy - 5, 6, 3); ctx.fillRect(8, hy - 5, 6, 3);
      ctx.fillStyle = '#2a0508'; ctx.beginPath(); ctx.roundRect(-14, hy + 8, 28, 10, 4); ctx.fill();
      ctx.fillStyle = '#f2f2ee'; for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 10, hy + 10); ctx.lineTo(k * 12, hy - 2); ctx.lineTo(k * 6, hy + 10); ctx.fill(); }
      for (let k = -2; k <= 2; k++) ctx.fillRect(k * 4.5 - 1.5, hy + 8, 3, 3);
    }
  }

  /* ---------- 关卡物件 ---------- */
  function drawCrate(ctx, x, y, w, h) {
    ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = '#9a6234'; ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    ctx.fillStyle = '#7a4a24'; for (let k = 0; k < 3; k++) ctx.fillRect(x + 1, y + 4 + k * 11, w - 2, 2);
    ctx.strokeStyle = '#5a3418'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + w - 4, y + h - 4); ctx.stroke();
    ctx.fillStyle = '#c9b48a'; for (const [cx, cy] of [[x + 2, y + 2], [x + w - 6, y + 2], [x + 2, y + h - 6], [x + w - 6, y + h - 6]]) ctx.fillRect(cx, cy, 4, 4);
  }

  function drawWorldEntities(ctx, w, h, groundY) {
    const toX = (wx) => wx - state.camX, toY = (wy) => groundY - wy, t = state.totalTime;

    // 浮空木台
    for (const pl of world.platforms) {
      const sx = toX(pl.x), sy = toY(pl.y);
      if (sx + pl.w < -40 || sx > w + 40) continue;
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(sx + 6, sy + 12, pl.w - 12, 6);
      ctx.fillStyle = INK; ctx.fillRect(sx - 2, sy - 2, pl.w + 4, 16);
      ctx.fillStyle = '#8a3a22'; ctx.fillRect(sx, sy, pl.w, 12);
      ctx.fillStyle = '#c2552f'; ctx.fillRect(sx, sy, pl.w, 3);
      ctx.fillStyle = '#5a2414'; for (let k = 16; k < pl.w; k += 24) ctx.fillRect(sx + k, sy + 4, 2, 8);
      ctx.fillStyle = '#f5c04a'; ctx.fillRect(sx - 4, sy - 3, 6, 18); ctx.fillRect(sx + pl.w - 2, sy - 3, 6, 18);
    }

    // 石柱与柱顶蛇妖
    for (const p of world.pipes) {
      const sx = toX(p.x);
      if (sx < -80 || sx > w + 80) continue;
      if (p.piranha && p.piranhaAlive) {
        const pop = Math.max(0, Math.sin(t * 2.5 + p.x) * 34), bx = sx + p.w / 2, by = groundY - p.h - pop;
        ctx.strokeStyle = INK; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx, groundY - p.h + 6); ctx.quadraticCurveTo(bx + 10, by + 14, bx, by); ctx.stroke();
        ctx.strokeStyle = '#3f8a3a'; ctx.lineWidth = 8; ctx.stroke();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(bx - 3, by - 4, 13, 10, -0.3, 0, TAU); ctx.fill();
        ctx.fillStyle = '#4fa848'; ctx.beginPath(); ctx.ellipse(bx - 3, by - 4, 11.5, 8.5, -0.3, 0, TAU); ctx.fill();
        ctx.fillStyle = '#ffe14a'; ctx.fillRect(bx - 8, by - 9, 4, 3); ctx.fillStyle = '#d63a2f'; ctx.beginPath(); ctx.moveTo(bx - 13, by); ctx.lineTo(bx - 22, by + 2 + Math.sin(t * 20) * 2); ctx.lineTo(bx - 13, by + 2); ctx.fill();
      }
      const top = groundY - p.h;
      const g = ctx.createLinearGradient(sx, 0, sx + p.w, 0);
      g.addColorStop(0, '#5b5f6a'); g.addColorStop(0.35, '#9aa0ab'); g.addColorStop(1, '#3a3d46');
      ctx.fillStyle = INK; ctx.fillRect(sx + 2, top + 10, p.w - 4, p.h - 10);
      ctx.fillStyle = g; ctx.fillRect(sx + 5, top + 12, p.w - 10, p.h - 12);
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; for (let y = top + 24; y < groundY - 6; y += 18) ctx.fillRect(sx + 5, y, p.w - 10, 2);
      ctx.fillStyle = INK; ctx.fillRect(sx - 4, top - 2, p.w + 8, 16);
      ctx.fillStyle = '#b4b9c2'; ctx.fillRect(sx - 2, top, p.w + 4, 12);
      ctx.fillStyle = '#d63a2f'; ctx.fillRect(sx + p.w / 2 - 6, top + 2, 12, 8);
    }

    // 箱子 / 宝匣 / 蒸笼 / 秘籍
    for (const b of world.blocks) {
      if (!b.alive) continue;
      const sx = toX(b.x), sy = toY(b.y + b.bump) - b.h;
      if (sx < -50 || sx > w + 50) continue;
      if (b.scrollForm >= 0) {
        const f = FORMS[b.scrollForm];
        if (!b.hit) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, sx + 18, sy + 18, 40 + Math.sin(t * 4) * 6, f.primary, 0.7); ctx.restore(); }
        ctx.fillStyle = INK; ctx.fillRect(sx - 1, sy - 1, b.w + 2, b.h + 2);
        ctx.fillStyle = b.hit ? '#3a3026' : '#f3e2b8'; ctx.fillRect(sx + 1, sy + 1, b.w - 2, b.h - 2);
        ctx.fillStyle = b.hit ? '#2a221a' : '#8a3a22'; ctx.fillRect(sx + 1, sy + 1, b.w - 2, 5); ctx.fillRect(sx + 1, sy + b.h - 6, b.w - 2, 5);
        if (!b.hit) { ctx.fillStyle = f.primary === '#F8FAFC' || f.primary === '#E2E8F0' ? '#1c2433' : '#7a1a12'; ctx.font = `900 19px ${KAI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.short[0], sx + b.w / 2, sy + b.h / 2 + 1); }
      } else if (b.type === '?' || b.hasMushroom) {
        ctx.fillStyle = INK; ctx.fillRect(sx - 1, sy - 1, b.w + 2, b.h + 2);
        if (b.hasMushroom) {
          ctx.fillStyle = b.hit ? '#4a3a28' : '#c9a066'; ctx.fillRect(sx + 1, sy + 1, b.w - 2, b.h - 2);
          ctx.fillStyle = b.hit ? '#3a2c1e' : '#9a7444'; for (let k = 0; k < 4; k++) ctx.fillRect(sx + 1, sy + 5 + k * 8, b.w - 2, 2);
          if (!b.hit) { ctx.fillStyle = '#fff6e0'; ctx.beginPath(); ctx.arc(sx + 18, sy + 18, 9, 0, TAU); ctx.fill(); ctx.fillStyle = '#c9312a'; ctx.font = `900 11px ${KAI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('包', sx + 18, sy + 19); }
        } else {
          ctx.fillStyle = b.hit ? '#4a2a22' : '#b52a22'; ctx.fillRect(sx + 1, sy + 1, b.w - 2, b.h - 2);
          ctx.fillStyle = b.hit ? '#5a4a30' : '#e8b84a'; ctx.fillRect(sx + 1, sy + 1, b.w - 2, 4); ctx.fillRect(sx + 1, sy + b.h - 5, b.w - 2, 4); ctx.fillRect(sx + b.w / 2 - 2, sy + 1, 4, b.h - 2);
          if (!b.hit) { ctx.save(); ctx.translate(sx + 18, sy + 18); ctx.rotate(Math.PI / 4); ctx.fillStyle = '#e8b84a'; ctx.fillRect(-8, -8, 16, 16); ctx.restore(); ctx.fillStyle = '#b52a22'; ctx.font = `900 13px ${KAI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('福', sx + 18, sy + 19); }
        }
      } else drawCrate(ctx, sx, sy, b.w, b.h);
    }

    // 铜钱与包子
    for (const c of world.coins) {
      if (c.got) continue;
      const sx = toX(c.x), sy = toY(c.y);
      if (sx < -30 || sx > w + 30) continue;
      const rx = Math.max(1.5, Math.abs(Math.cos(t * 4 + c.x * 0.02)) * 10);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, sx, sy, 16, '#ffcf5a', 0.35); ctx.restore();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(sx, sy, rx + 1.5, 11.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#e0a83a'; ctx.beginPath(); ctx.ellipse(sx, sy, rx, 10, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.ellipse(sx - rx * 0.25, sy - 2, rx * 0.5, 5, 0, 0, TAU); ctx.fill();
      if (rx > 4) { ctx.fillStyle = INK; ctx.fillRect(sx - rx * 0.3, sy - 3, rx * 0.6, 6); }
    }
    for (const m of world.mushrooms) {
      if (!m.alive) continue;
      const sx = toX(m.x), sy = toY(m.y);
      ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(sx, sy - 10, 15, 12, 0, Math.PI, 0); ctx.lineTo(sx + 15, sy); ctx.lineTo(sx - 15, sy); ctx.fill();
      ctx.fillStyle = '#fff8ea'; ctx.beginPath(); ctx.ellipse(sx, sy - 10, 13.5, 10.5, 0, Math.PI, 0); ctx.lineTo(sx + 13.5, sy - 1.5); ctx.lineTo(sx - 13.5, sy - 1.5); ctx.fill();
      ctx.strokeStyle = '#d9c7a0'; ctx.lineWidth = 1.2; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(sx, sy - 20); ctx.quadraticCurveTo(sx + k * 4, sy - 14, sx + k * 6, sy - 6); ctx.stroke(); }
      ctx.fillStyle = '#e8584a'; ctx.beginPath(); ctx.arc(sx, sy - 19, 2, 0, TAU); ctx.fill();
    }

    // 擂台结界
    if (state.bossLocked) {
      for (const bx of [BOSS_ARENA_LEFT, BOSS_ARENA_RIGHT]) {
        const sx = toX(bx);
        const bg = ctx.createLinearGradient(sx - 16, 0, sx + 16, 0);
        bg.addColorStop(0, 'rgba(255,60,40,0)'); bg.addColorStop(0.5, `rgba(255,80,40,${0.45 + Math.sin(t * 6) * 0.15})`); bg.addColorStop(1, 'rgba(255,60,40,0)');
        ctx.fillStyle = bg; ctx.fillRect(sx - 16, 0, 32, groundY);
        ctx.fillStyle = 'rgba(255,200,120,0.8)'; ctx.font = `900 18px ${KAI}`; ctx.textAlign = 'center';
        for (let k = 0; k < 6; k++) ctx.fillText('封', sx, ((t * 40 + k * 70) % 420) + 20);
      }
    }

    // 胜利铜锣与牌坊
    const flx = toX(FLAG_X);
    if (flx > -140 && flx < w + 340) {
      const cx = toX(CASTLE_X);
      ctx.fillStyle = INK; for (const k of [-70, 70]) ctx.fillRect(cx + k - 9, groundY - 190, 18, 190);
      ctx.fillStyle = '#a3241d'; for (const k of [-70, 70]) ctx.fillRect(cx + k - 7, groundY - 188, 14, 188);
      ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(cx - 118, groundY - 182); ctx.quadraticCurveTo(cx - 100, groundY - 196, cx - 84, groundY - 214); ctx.lineTo(cx + 84, groundY - 214); ctx.quadraticCurveTo(cx + 100, groundY - 196, cx + 118, groundY - 182); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2a3a4a'; ctx.beginPath(); ctx.moveTo(cx - 112, groundY - 185); ctx.quadraticCurveTo(cx - 96, groundY - 197, cx - 82, groundY - 210); ctx.lineTo(cx + 82, groundY - 210); ctx.quadraticCurveTo(cx + 96, groundY - 197, cx + 112, groundY - 185); ctx.closePath(); ctx.fill();
      ctx.fillStyle = INK; ctx.fillRect(cx - 52, groundY - 178, 104, 34); ctx.fillStyle = '#1c2a3a'; ctx.fillRect(cx - 50, groundY - 176, 100, 30);
      ctx.fillStyle = '#f5c04a'; ctx.font = `900 22px ${KAI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('武道登峰', cx, groundY - 160);
      // 锣架
      ctx.fillStyle = INK; ctx.fillRect(flx - 46, groundY - 210, 8, 210); ctx.fillRect(flx + 38, groundY - 210, 8, 210); ctx.fillRect(flx - 50, groundY - 216, 100, 10);
      ctx.fillStyle = '#6a3a1a'; ctx.fillRect(flx - 44, groundY - 208, 4, 208); ctx.fillRect(flx + 40, groundY - 208, 4, 208);
      const ring = state.flagSliding ? Math.sin(state.flagTimer * 30) * Math.max(0, 1 - state.flagTimer) * 0.2 : Math.sin(t * 1.5) * 0.03;
      ctx.save(); ctx.translate(flx, groundY - 150); ctx.rotate(ring);
      if (state.flagSliding) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, 0, 120 * Math.max(0.3, 1 - state.flagTimer * 0.3), '#ffcf5a', 0.8); ctx.restore(); }
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-20, -62); ctx.lineTo(-14, -34); ctx.moveTo(20, -62); ctx.lineTo(14, -34); ctx.stroke();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, 0, 38, 0, TAU); ctx.fill();
      const gg = ctx.createRadialGradient(-10, -10, 4, 0, 0, 36); gg.addColorStop(0, '#ffe9a0'); gg.addColorStop(0.6, '#d9a23a'); gg.addColorStop(1, '#8a5a1a');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, 0, 35, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(90,50,10,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 26, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#7a3a10'; ctx.font = `900 22px ${KAI}`; ctx.fillText('胜', 0, 1);
      ctx.restore();
      if (state.flagSliding) for (let k = 1; k <= 3; k++) { const r = ((state.flagTimer * 160 + k * 60) % 240); ctx.strokeStyle = `rgba(255,220,120,${1 - r / 240})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(flx, groundY - 150, 40 + r, 0, TAU); ctx.stroke(); }
    }

    // 敌人
    for (const e of world.enemies) {
      const sx = toX(e.x), sy = toY(e.y);
      if (sx < -90 || sx > w + 90 || sy > h + 120 || sy < -260) continue;
      if (e.alive && e.y < 4) { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(sx, groundY + 1, 16, 4, 0, 0, TAU); ctx.fill(); }
      ctx.save(); ctx.translate(sx, sy - 16);
      if (e.launched) ctx.rotate(e.rot);
      if (e.type !== 'arrow' && e.alive) ctx.scale(e.x > hero.x ? 1 : -1, 1);
      drawEnemy(ctx, e, t);
      ctx.restore();
    }

    // 首领
    if (world.boss && (world.boss.alive || world.boss.y < 900)) {
      const b = world.boss, bx = toX(b.x), by = toY(b.y);
      if (bx > -260 && bx < w + 320) {
        if (b.alive) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(bx, groundY + 2, 70 - Math.min(50, b.y * 0.2), 9, 0, 0, TAU); ctx.fill(); }
        ctx.save(); ctx.translate(bx, by - 60);
        if (b.defeated) ctx.rotate(b.rot);
        ctx.scale(b.facing < 0 ? 1 : -1, 1);
        ctx.scale(1.05, 1.05);
        drawBoss(ctx, b, t);
        ctx.restore();
      }
    }

    // 飞行道具与碎片
    for (const pr of world.projectiles) {
      const sx = toX(pr.x), sy = toY(pr.y);
      ctx.save(); ctx.translate(sx, sy);
      if (pr.type === 'fireball' || pr.type === 'reflected') {
        ctx.globalCompositeOperation = 'lighter';
        const col = pr.type === 'reflected' ? '#38bdf8' : '#ff5a1a';
        for (let k = 0; k < 5; k++) glow(ctx, -Math.sign(pr.vx) * k * 9, Math.sin(t * 25 + k) * 3, 30 - k * 4, k ? col : '#ffe08a', 0.75);
      } else if (pr.type === 'playerWave') {
        ctx.globalCompositeOperation = 'lighter'; ctx.scale(Math.sign(pr.vx) || 1, 1);
        glow(ctx, 0, 0, 44, pr.col, 0.5);
        ctx.fillStyle = pr.col; ctx.beginPath(); ctx.arc(-14, 0, 34, -1.2, 1.2); ctx.arc(-24, 0, 30, 1.1, -1.1, true); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-14, 0, 34, -0.8, 0.8); ctx.arc(-20, 0, 31, 0.75, -0.75, true); ctx.closePath(); ctx.fill();
      } else if (pr.type === 'playerKunai') {
        ctx.globalCompositeOperation = 'lighter'; ctx.scale(Math.sign(pr.vx) || 1, 1);
        ctx.strokeStyle = 'rgba(34,211,238,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(0, 0); ctx.stroke();
        ctx.fillStyle = '#e0f7ff'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(0, -4); ctx.lineTo(0, 4); ctx.fill(); glow(ctx, 4, 0, 14, '#22d3ee', 0.8);
      } else if (pr.type === 'palm') {
        ctx.globalCompositeOperation = 'lighter'; ctx.scale(Math.sign(pr.vx) || 1, 1); glow(ctx, 0, 0, 50, '#f5c04a', 0.6);
        ctx.fillStyle = 'rgba(255,220,120,0.85)'; ctx.beginPath(); ctx.roundRect(-14, -18, 26, 36, 8); ctx.fill();
        for (let k = -2; k <= 1; k++) { ctx.beginPath(); ctx.roundRect(8, k * 8 - 3, 20, 6, 3); ctx.fill(); }
      } else if (pr.type === 'jar' || pr.type === 'jar') {
        ctx.rotate(pr.rot); drawJar(ctx);
      }
      ctx.restore();
    }
    for (const d of world.debris) {
      ctx.save(); ctx.translate(toX(d.x), toY(d.y)); ctx.rotate(d.rot);
      ctx.fillStyle = INK; ctx.fillRect(-(d.s || 7) - 1, -4, (d.s || 7) * 2 + 2, 8); ctx.fillStyle = d.col; ctx.fillRect(-(d.s || 7), -3, (d.s || 7) * 2, 6);
      ctx.restore();
    }

    // 残影、刀光拖尾与主角
    if (hero.weaponTrail.length > 2) {
      const f = FORMS[hero.form];
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      for (let i = 1; i < hero.weaponTrail.length; i++) {
        const p0 = hero.weaponTrail[i - 1], p1 = hero.weaponTrail[i], frac = i / hero.weaponTrail.length;
        ctx.strokeStyle = f.accent; ctx.globalAlpha = frac * frac * p1.life * 0.7; ctx.lineWidth = frac * 12;
        ctx.beginPath(); ctx.moveTo(toX(p0.x), toY(p0.y)); ctx.lineTo(toX(p1.x), toY(p1.y)); ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = frac * 3; ctx.stroke();
      }
      ctx.restore();
    }
    for (const g of hero.ghosts) drawHero(ctx, toX(g.x), toY(g.y), g.form, g.pose, g.alpha * 0.7, true, g.spin, g.facing || 1);
    drawHero(ctx, toX(hero.x), toY(hero.y), hero.form, hero.pose, 1.0, false, hero.spinAng, hero.facing);

    // 奥义与招式特效（叠加发光）
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (hero.ult.active && hero.ult.form === 2) {
      for (const sw of hero.ult.data.swords) {
        if (sw.y < -500) continue;
        ctx.save(); ctx.translate(toX(sw.x), toY(sw.y)); ctx.rotate(sw.fired ? (hero.facing > 0 ? 0.56 : 2.58) : sw.ang + Math.PI * 0.5);
        glow(ctx, 0, 0, 30, '#38bdf8', 0.5);
        ctx.fillStyle = '#e8f6ff'; ctx.beginPath(); ctx.moveTo(-20, -2.5); ctx.lineTo(26, -1.5); ctx.lineTo(34, 0); ctx.lineTo(26, 1.5); ctx.lineTo(-20, 2.5); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#38bdf8'; ctx.fillRect(-24, -6, 4, 12); ctx.fillRect(-32, -1.5, 8, 3);
        ctx.restore();
      }
    }
    if (hero.ult.active && hero.ult.form === 5 && hero.ult.data.bolts.length > 1) {
      const bolts = hero.ult.data.bolts;
      for (const [lw, col] of [[10, 'rgba(34,211,238,0.35)'], [4, '#7df4ff'], [1.6, '#ffffff']]) {
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
        for (let i = 0; i < bolts.length; i++) { const pt = bolts[i]; const jx = i ? (hash(i, Math.floor(t * 30)) - 0.5) * 16 : 0; if (i === 0) ctx.moveTo(toX(pt.x), toY(pt.y)); else ctx.lineTo(toX(pt.x) + jx, toY(pt.y) + jx); }
        ctx.stroke();
      }
    }
    for (const sl of world.slashes) drawSlash(ctx, sl, toX, toY, w, groundY, t);
    for (const sw of world.shockwaves) {
      const a = clamp(sw.life, 0, 1);
      ctx.strokeStyle = sw.col; ctx.globalAlpha = a; ctx.lineWidth = sw.lw * sw.life * 1.3;
      ctx.beginPath(); ctx.ellipse(toX(sw.x), toY(sw.y), sw.r, sw.flat ? sw.r * 0.3 : sw.r, 0, 0, TAU); ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = sw.lw * sw.life * 0.35; ctx.stroke();
    }
    for (const pt of world.particles) {
      const a = clamp(pt.life, 0, 1), px = toX(pt.x), py = toY(pt.y);
      ctx.globalAlpha = a;
      if (pt.isCoin) { ctx.fillStyle = '#ffcf5a'; ctx.beginPath(); ctx.ellipse(px, py, Math.max(2, Math.abs(Math.cos(t * 15)) * 7), 10, 0, 0, TAU); ctx.fill(); continue; }
      const sp = Math.hypot(pt.vx, pt.vy);
      if (sp > 180 && !pt.dust) {
        ctx.strokeStyle = pt.col; ctx.lineWidth = pt.size * 0.8; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - pt.vx * 0.035, py + pt.vy * 0.035); ctx.stroke();
      } else if (pt.dust) {
        ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(200,190,170,${a * 0.35})`; ctx.beginPath(); ctx.arc(px, py, pt.size * (2 - a), 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'lighter';
      } else glow(ctx, px, py, pt.size * 2.2, pt.col, 1);
    }
    ctx.globalAlpha = 1; ctx.restore();

    for (const pop of world.popups) {
      const age = 1 - clamp(pop.life, 0, 1), sc = pop.big ? (age < 0.12 ? 1.8 - age * 6.6 : 1) : 1;
      ctx.save(); ctx.globalAlpha = clamp(pop.life * 1.6, 0, 1);
      ctx.translate(toX(pop.x), toY(pop.y)); ctx.scale(sc, sc);
      ctx.font = pop.big ? `900 26px ${KAI}` : `800 14px ${SANS}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.strokeStyle = '#05060a'; ctx.lineWidth = pop.big ? 6 : 4; ctx.strokeText(pop.text, 0, 0);
      ctx.fillStyle = pop.col; ctx.fillText(pop.text, 0, 0);
      ctx.restore();
    }
  }

  // 新月形刀光
  function crescent(ctx, r, span, thick, col) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, -span, span); ctx.arc(-thick, 0, r - thick * 0.4, span * 0.92, -span * 0.92, true); ctx.closePath(); ctx.fill();
  }
  function bolt(ctx, x0, y0, x1, y1, seed, col, lw) {
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y0);
    for (let k = 1; k < 10; k++) { const u = k / 10; ctx.lineTo(lerp(x0, x1, u) + (hash(k, seed) - 0.5) * 34, lerp(y0, y1, u) + (hash(k, seed + 1) - 0.5) * 10); }
    ctx.lineTo(x1, y1); ctx.stroke();
  }
  function drawSlash(ctx, sl, toX, toY, w, groundY, t) {
    const a = clamp(sl.life, 0, 1);
    ctx.globalAlpha = 1;
    switch (sl.type) {
      case 'ring': ctx.strokeStyle = sl.col; ctx.globalAlpha = a; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(toX(sl.x), toY(sl.y), sl.r * (1.35 - a * 0.4), 0, TAU); ctx.stroke(); break;
      case 'arc': {
        ctx.save(); ctx.translate(toX(sl.x), toY(sl.y)); ctx.scale(sl.dir || 1, 1); ctx.rotate(sl.tilt || 0);
        const r = sl.r * (1.1 - a * 0.15);
        glow(ctx, r * 0.6, 0, r * 1.1, sl.col, a * 0.45);
        ctx.globalAlpha = a; crescent(ctx, r, 1.25, 16 * a + 4, sl.col);
        crescent(ctx, r - 2, 1.0, 6 * a + 1, '#ffffff');
        ctx.restore(); break;
      }
      case 'streak': {
        ctx.save(); ctx.translate(toX(sl.x), toY(sl.y)); ctx.rotate(sl.ang || 0); ctx.globalAlpha = a;
        const L = sl.len, th = (sl.th || 10) * a;
        glow(ctx, 0, 0, L * 0.55, sl.col, a * 0.35);
        ctx.fillStyle = sl.col; ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.quadraticCurveTo(0, -th, L / 2, 0); ctx.quadraticCurveTo(0, th, -L / 2, 0); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.quadraticCurveTo(0, -th * 0.3, L / 2, 0); ctx.quadraticCurveTo(0, th * 0.3, -L / 2, 0); ctx.fill();
        ctx.restore(); break;
      }
      case 'burst': {
        const x = toX(sl.x), y = toY(sl.y), R = sl.r * (1.4 - a * 0.4);
        glow(ctx, x, y, R * 1.4, sl.col, a * 0.8);
        ctx.fillStyle = '#ffffff'; ctx.globalAlpha = a;
        ctx.beginPath(); const n = 8; for (let k = 0; k < n * 2; k++) { const ang = k / (n * 2) * TAU + sl.rot, rr = k % 2 ? R * 0.22 : R * (0.7 + hash(k, sl.rot * 9) * 0.5); ctx.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr); } ctx.closePath(); ctx.fill();
        break;
      }
      case 'iceSpike': {
        const x = toX(sl.x), grow = Math.min(1, (1 - a) * 6);
        ctx.globalAlpha = a; ctx.fillStyle = 'rgba(190,240,255,0.85)';
        for (let k = -2; k <= 2; k++) { const hh = (60 - Math.abs(k) * 14) * grow; ctx.beginPath(); ctx.moveTo(x + k * 14 - 7, groundY); ctx.lineTo(x + k * 14 + k * 3, groundY - hh); ctx.lineTo(x + k * 14 + 7, groundY); ctx.fill(); }
        glow(ctx, x, groundY - 20, 50, '#67e8f9', a * 0.7); break;
      }
      case 'flamePillar': {
        const sx = toX(sl.x), pw = 120 * a;
        const grd = ctx.createLinearGradient(sx - pw, 0, sx + pw, 0);
        grd.addColorStop(0, 'rgba(230,57,70,0)'); grd.addColorStop(0.35, `rgba(255,90,30,${a * 0.8})`); grd.addColorStop(0.5, `rgba(255,240,180,${a})`); grd.addColorStop(0.65, `rgba(255,90,30,${a * 0.8})`); grd.addColorStop(1, 'rgba(230,57,70,0)');
        ctx.fillStyle = grd; ctx.fillRect(sx - pw, 0, pw * 2, groundY);
        for (let k = 0; k < 14; k++) glow(ctx, sx + Math.sin(t * 9 + k) * pw * 0.5, groundY - ((t * 500 + k * 80) % groundY), 40 * a, k % 2 ? '#ffb23a' : '#ff4a1a', a);
        glow(ctx, sx, groundY, 220 * a, '#ff7a2b', a); break;
      }
      case 'inkArc': {
        ctx.save(); ctx.translate(toX(sl.x), toY(sl.y)); ctx.rotate(sl.ang); ctx.globalAlpha = a;
        ctx.fillStyle = sl.col; ctx.beginPath(); ctx.moveTo(-sl.len * 0.5, 0); ctx.quadraticCurveTo(0, -46 * a, sl.len * 0.5, 0); ctx.quadraticCurveTo(0, -20 * a, -sl.len * 0.5, 0); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5 * a; ctx.beginPath(); ctx.moveTo(-sl.len * 0.5, 0); ctx.quadraticCurveTo(0, -36 * a, sl.len * 0.5, 0); ctx.stroke();
        ctx.restore(); break;
      }
      case 'dragon': {          // 金龙：一条有鳞片、龙头的波形光带
        const sx = toX(sl.x), sy = toY(sl.y), d = sl.dir || 1, prog = 1 - a, head = Math.min(1, prog * 2.2) * sl.len;
        for (let k = 0; k < 46; k++) {
          const u = k / 46, px = sx + d * u * head, py = sy + Math.sin(u * 9 - t * 14) * 38 * (0.3 + u);
          const r = (22 - u * 10) * (0.6 + a * 0.6);
          glow(ctx, px, py, r * 2.2, k % 3 ? '#f4d35e' : '#ff9f1c', a * 0.7);
        }
        const hx = sx + d * head, hy = sy + Math.sin(9 - t * 14) * 38 * 1.3;
        ctx.save(); ctx.translate(hx, hy); ctx.scale(d, 1); ctx.globalAlpha = a;
        ctx.fillStyle = '#ffe9a0'; ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(0, -22); ctx.lineTo(-20, -8); ctx.lineTo(-20, 8); ctx.lineTo(0, 22); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#fff6c8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-6, -16); ctx.quadraticCurveTo(-30, -44, -48, -34); ctx.moveTo(-6, 16); ctx.quadraticCurveTo(-30, 44, -48, 34); ctx.stroke();
        ctx.fillStyle = '#ff3a1a'; ctx.beginPath(); ctx.arc(14, -6, 4, 0, TAU); ctx.fill();
        ctx.restore(); break;
      }
      case 'taichiArray': {
        ctx.save(); ctx.translate(toX(sl.x), toY(sl.y)); ctx.rotate(t * 2.4); ctx.globalAlpha = a * 0.85;
        const R = 140;
        glow(ctx, 0, 0, R * 1.8, '#e2e8f0', a * 0.5);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(0, 0, R, -Math.PI * 0.5, Math.PI * 0.5); ctx.fill();
        ctx.fillStyle = '#090d16'; ctx.beginPath(); ctx.arc(0, 0, R, Math.PI * 0.5, Math.PI * 1.5); ctx.fill();
        ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(0, -R * 0.5, R * 0.5, 0, TAU); ctx.fill();
        ctx.fillStyle = '#090d16'; ctx.beginPath(); ctx.arc(0, R * 0.5, R * 0.5, 0, TAU); ctx.fill();
        ctx.fillStyle = '#090d16'; ctx.beginPath(); ctx.arc(0, -R * 0.5, R * 0.14, 0, TAU); ctx.fill(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(0, R * 0.5, R * 0.14, 0, TAU); ctx.fill();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3; for (const rr of [R + 14, R + 30]) { ctx.beginPath(); ctx.arc(0, 0, rr, 0, TAU); ctx.stroke(); }
        ctx.restore(); break;
      }
      case 'goldenPalm': {
        const sx = toX(sl.x), sy = toY(sl.y), drop = 1 - clamp(sl.life / 1.25, 0, 1);
        const palmY = lerp(sy - 420, sy - 40, easeOutExpo(Math.min(1, drop * 2.4)));
        glow(ctx, sx, palmY - 60, 260 * a, '#f5c04a', a * 0.8);
        ctx.globalAlpha = a; ctx.fillStyle = 'rgba(255,226,140,0.92)';
        ctx.beginPath(); ctx.roundRect(sx - 90, palmY - 110, 180, 140, 34); ctx.fill();
        for (let k = -2; k <= 1; k++) { ctx.beginPath(); ctx.roundRect(sx + k * 38 - 6, palmY - 196, 30, 100 - Math.abs(k + 0.5) * 10, 15); ctx.fill(); }
        ctx.beginPath(); ctx.save(); ctx.translate(sx + 96, palmY - 50); ctx.rotate(-0.7); ctx.roundRect(-14, -50, 28, 70, 14); ctx.restore(); ctx.fill();
        ctx.fillStyle = 'rgba(180,110,20,0.6)'; ctx.font = `900 64px ${KAI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('佛', sx, palmY - 40);
        break;
      }
      case 'lightningPillar': {
        const sx = toX(sl.x);
        glow(ctx, sx, groundY - 30, 120 * a, sl.col, a);
        bolt(ctx, sx + 20, -10, sx, groundY, Math.floor(t * 40) + sx, sl.col, 14 * a);
        bolt(ctx, sx + 20, -10, sx, groundY, Math.floor(t * 40) + sx, '#ffffff', 4 * a);
        break;
      }
      case 'spearThrust': {
        ctx.save(); ctx.translate(toX(sl.x), toY(sl.y)); ctx.rotate(sl.ang); ctx.globalAlpha = a;
        glow(ctx, sl.len * 0.9, 0, 40, '#ffb23a', a);
        ctx.fillStyle = '#ff5722'; ctx.beginPath(); ctx.moveTo(0, -6 * a); ctx.lineTo(sl.len, 0); ctx.lineTo(0, 6 * a); ctx.fill();
        ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.moveTo(0, -2 * a); ctx.lineTo(sl.len, 0); ctx.lineTo(0, 2 * a); ctx.fill();
        ctx.restore(); break;
      }
      case 'phoenixDive': {
        const prog = 1 - clamp(sl.life / 1.1, 0, 1), d = sl.dir || 1;
        const px = toX(sl.x) + d * prog * 760, py = toY(sl.y) + Math.sin(prog * Math.PI) * 150;
        for (let k = 0; k < 18; k++) glow(ctx, px - d * k * 18, py - Math.sin(prog * Math.PI - k * 0.06) * 10, 46 - k * 2, k % 2 ? '#ff5722' : '#ffb23a', a * 0.7);
        ctx.save(); ctx.translate(px, py); ctx.scale(d, 1); ctx.globalAlpha = a;
        const wing = 130 + Math.sin(t * 26) * 30;
        for (const s of [-1, 1]) {
          ctx.fillStyle = 'rgba(255,87,34,0.85)'; ctx.beginPath(); ctx.moveTo(20, 0); ctx.quadraticCurveTo(-30, s * wing, -150, s * 30); ctx.lineTo(-60, 0); ctx.fill();
          ctx.fillStyle = 'rgba(255,200,90,0.8)'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(-20 - k * 22, s * 6); ctx.lineTo(-60 - k * 22, s * (wing * 0.6 - k * 10)); ctx.lineTo(-40 - k * 22, s * 4); ctx.fill(); }
        }
        ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.ellipse(10, 0, 52, 16, 0, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.moveTo(60, -4); ctx.lineTo(80, 0); ctx.lineTo(60, 4); ctx.fill();
        ctx.restore(); break;
      }
      case 'iceSpires': {
        if (sl.shattered) break;
        for (const sp of sl.spires) {
          const sx = toX(sp.x);
          glow(ctx, sx, groundY - sp.h * 0.5, sp.h * 0.6, '#67e8f9', a * 0.35);
          const g = ctx.createLinearGradient(sx, groundY - sp.h, sx, groundY);
          g.addColorStop(0, `rgba(240,252,255,${a})`); g.addColorStop(1, `rgba(14,165,233,${a * 0.7})`);
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx - sp.w * 0.5, groundY); ctx.lineTo(sx - sp.w * 0.1, groundY - sp.h); ctx.lineTo(sx + sp.w * 0.5, groundY); ctx.closePath(); ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,${a * 0.6})`; ctx.beginPath(); ctx.moveTo(sx - sp.w * 0.1, groundY - sp.h); ctx.lineTo(sx, groundY); ctx.lineTo(sx - sp.w * 0.3, groundY); ctx.fill();
        }
        break;
      }
      case 'dimFractures': {
        for (const fr of sl.fracs) {
          const off = sl.shattered ? (1 - a) * 40 : 0;
          ctx.save(); ctx.translate(toX(fr.x1) + off, toY(fr.y1) - off * 0.6); ctx.rotate(fr.ang); ctx.globalAlpha = a;
          glow(ctx, 0, 0, fr.len * 0.4, fr.col, a * 0.3);
          ctx.fillStyle = fr.col; ctx.beginPath(); const th = sl.shattered ? 10 * a : 5; ctx.moveTo(-fr.len / 2, 0); ctx.lineTo(0, -th); ctx.lineTo(fr.len / 2, 0); ctx.lineTo(0, th); ctx.fill();
          ctx.fillStyle = '#ffffff'; ctx.fillRect(-fr.len / 2, -1, fr.len, 2);
          ctx.restore();
        }
        break;
      }
      case 'celestialBeam': {
        const sy = toY(sl.y), bh = 170 * a, d = sl.dir || 1, x0 = toX(sl.x);
        const grd = ctx.createLinearGradient(0, sy - bh, 0, sy + bh);
        grd.addColorStop(0, 'rgba(168,85,247,0)'); grd.addColorStop(0.28, `rgba(56,189,248,${a})`);
        grd.addColorStop(0.5, `rgba(255,255,255,${a})`); grd.addColorStop(0.72, `rgba(168,85,247,${a})`); grd.addColorStop(1, 'rgba(255,209,102,0)');
        ctx.fillStyle = grd; if (d > 0) ctx.fillRect(x0, sy - bh, w - x0 + 40, bh * 2); else ctx.fillRect(-40, sy - bh, x0 + 40, bh * 2);
        glow(ctx, x0, sy, 200 * a, '#a855f7', a);
        for (let k = 0; k < 20; k++) glow(ctx, x0 + d * ((t * 1600 + k * 97) % w), sy + (hash(k) - 0.5) * bh * 1.4, 18, k % 2 ? '#ffd166' : '#38bdf8', a);
        break;
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ============================================================================
     11. 界面：奥义字幕条、状态栏、标题与结算
     ============================================================================ */
  function drawCutInBanner(ctx, w, h) {
    const ci = state.cutIn;
    if (!ci.active) return;
    const p = ci.timer / ci.dur, enter = easeOutExpo(clamp(p / 0.18, 0, 1)), exit = 1 - smoothstep(0.78, 1.0, p);
    ctx.save(); ctx.globalAlpha = exit; ctx.translate(w * 0.5, h * 0.3); ctx.rotate(-0.06);
    const bw = w * 1.5 * enter, bh = 112;
    // 墨笔横扫的底条
    ctx.fillStyle = 'rgba(4,5,12,0.94)'; ctx.beginPath(); ctx.moveTo(-bw / 2, -bh / 2);
    for (let x = -bw / 2; x <= bw / 2; x += 24) ctx.lineTo(x, -bh / 2 + hash(x, 3) * 10);
    for (let x = bw / 2; x >= -bw / 2; x -= 24) ctx.lineTo(x, bh / 2 - hash(x, 5) * 10);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = ci.color; ctx.fillRect(-bw / 2, -bh / 2 + 6, bw, 4); ctx.fillRect(-bw / 2, bh / 2 - 10, bw, 4);
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba(ci.color, 0.15); for (let k = 0; k < 7; k++) ctx.fillRect(((t2(k) * 900 + p * 2400) % (w * 1.6)) - w * 0.8, -bh / 2 + 14 + k * 13, 140, 2);
    ctx.globalCompositeOperation = 'source-over';
    // 人物剪影
    ctx.save(); ctx.translate(-Math.min(w * 0.32, 300) + lerp(-80, 0, enter), 34); ctx.scale(1.55, 1.55);
    drawHero(ctx, 0, 0, ci.formId, hero.pose === 'idle' ? 'palm' : hero.pose, 1, false, 0, 1);
    ctx.restore();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const fs = Math.min(56, Math.max(28, w * 0.05));
    ctx.font = `900 ${fs}px ${KAI}`; ctx.lineJoin = 'round';
    ctx.strokeStyle = rgba(ci.color, 0.9); ctx.lineWidth = 8; ctx.strokeText(ci.cn, lerp(140, 30, enter), -10);
    ctx.fillStyle = '#ffffff'; ctx.fillText(ci.cn, lerp(140, 30, enter), -10);
    ctx.fillStyle = ci.color; ctx.font = `700 12px ${SANS}`;
    ctx.fillText(`第 ${ci.formId + 1} 形 · ${FORMS[ci.formId].cn}  ·  ${ci.en}`, lerp(-60, 30, enter), 32);
    ctx.restore();
  }
  const t2 = (k) => hash(k, 17);

  function drawGameHUD(ctx, w, h) {
    if (state.mode === 'title' || state.noHud) return;
    const pad = Math.max(14, Math.min(24, w * 0.02)), compact = w < 740, f = FORMS[hero.form], zb = getZoneBlend(hero.x);
    ctx.save();
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    for (let i = 0; i < hero.maxHp; i++) {
      const hx = pad + i * 24, hy = pad + 2;
      ctx.fillStyle = i < hero.hp ? '#ef4444' : 'rgba(244, 242, 236, 0.16)';
      ctx.beginPath(); ctx.moveTo(hx + 9, hy + 16);
      ctx.bezierCurveTo(hx - 2, hy + 9, hx, hy, hx + 5, hy); ctx.bezierCurveTo(hx + 8, hy, hx + 9, hy + 3, hx + 9, hy + 3);
      ctx.bezierCurveTo(hx + 9, hy + 3, hx + 10, hy, hx + 13, hy); ctx.bezierCurveTo(hx + 18, hy, hx + 20, hy + 9, hx + 9, hy + 16); ctx.fill();
    }
    const barW = compact ? 52 : 72, barH = 9, barY = pad + 26;
    for (let seg = 0; seg < 3; seg++) {
      const bx = pad + seg * (barW + 5), fill = clamp((state.chi - seg * 100) / 100, 0, 1);
      ctx.fillStyle = 'rgba(244, 242, 236, 0.14)'; ctx.fillRect(bx, barY, barW, barH);
      ctx.fillStyle = fill >= 1 ? '#ffd166' : f.primary; ctx.fillRect(bx, barY, barW * fill, barH);
      if (fill >= 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, bx + barW / 2, barY + 4, barW * 0.6, '#ffd166', 0.25 + Math.sin(state.totalTime * 6) * 0.1); ctx.restore(); }
    }
    const charges = Math.floor(state.chi / 100);
    ctx.fillStyle = charges > 0 ? '#ffd166' : '#8b95a8'; ctx.font = `700 11px ${SANS}`;
    ctx.fillText(`气劲 ×${charges}  ${charges > 0 ? '按空格放奥义' : ''}`, pad, barY + 14);
    ctx.fillStyle = '#f4f2ec'; ctx.font = `700 12px ${SANS}`;
    ctx.fillText(`得分 ${state.score.toLocaleString()}   铜钱 ×${state.coins}`, pad, barY + 30);

    const cx = w * 0.5; ctx.textAlign = 'center';
    ctx.fillStyle = f.primary; ctx.font = `900 ${compact ? 16 : 20}px ${KAI}`;
    ctx.fillText(`第 ${hero.form + 1} 形 · ${f.cn}`, cx, pad);
    ctx.fillStyle = 'rgba(244, 242, 236, 0.7)'; ctx.font = `600 11px ${SANS}`;
    ctx.fillText(zb.cur.name, cx, pad + 24);
    if (state.bossLocked && world.boss && world.boss.alive) {
      const bw = Math.min(380, w * 0.46), bh = 12, by = pad + 44;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.22)'; ctx.fillRect(cx - bw * 0.5, by, bw, bh);
      ctx.fillStyle = world.boss.enraged ? '#ff2e2e' : '#ef4444'; ctx.fillRect(cx - bw * 0.5, by, bw * (world.boss.hp / world.boss.maxHp), bh);
      ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1.2; ctx.strokeRect(cx - bw * 0.5, by, bw, bh);
      ctx.fillStyle = '#ffd166'; ctx.font = `900 14px ${KAI}`;
      ctx.fillText(`赤鬼王 ${world.boss.enraged ? '· 暴怒' : ''}`, cx, by + 16);
    }
    const prog = clamp((hero.x - START_X) / (FLAG_X - START_X), 0, 1), pw = compact ? 105 : 150;
    ctx.textAlign = 'right'; ctx.fillStyle = '#f4f2ec'; ctx.font = `600 11px ${SANS}`;
    ctx.fillText(`进度 ${Math.round(prog * 100)}%`, w - pad, pad);
    ctx.fillStyle = 'rgba(244, 242, 236, 0.16)'; ctx.fillRect(w - pad - pw, pad + 16, pw, 6);
    ctx.fillStyle = '#ffd166'; ctx.fillRect(w - pad - pw, pad + 16, pw * prog, 6);
    const rk = getRankInfo(state.combo, state.score);
    ctx.fillStyle = rk.col; ctx.font = `900 ${compact ? 28 : 38}px "SF Pro Display", ${SANS}`;
    ctx.fillText(rk.letter, w - pad, pad + 28);
    ctx.fillStyle = '#f4f2ec'; ctx.font = `800 12px ${SANS}`;
    ctx.fillText(rk.label, w - pad, pad + (compact ? 58 : 68));
    if (state.combo >= 5) {         // 大号连击数
      const pulse = 1 + Math.max(0, state.comboTimer - 2.9) * 1.5;
      ctx.save(); ctx.translate(w - pad, h * 0.36); ctx.scale(pulse, pulse);
      ctx.font = `italic 900 ${compact ? 40 : 56}px "SF Pro Display", ${SANS}`; ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(0,0,0,0.7)'; ctx.lineWidth = 6; ctx.strokeText(state.combo, 0, 0);
      ctx.fillStyle = state.combo >= 30 ? '#ffd166' : state.combo >= 15 ? '#ff8a3a' : '#ffffff'; ctx.fillText(state.combo, 0, 0);
      ctx.font = `900 16px ${KAI}`; ctx.fillStyle = '#ffd166'; ctx.fillText('连击', 0, compact ? 44 : 60);
      ctx.restore();
    }
    if (state.hurtFlash > 0.01) {
      const hg = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.25, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
      hg.addColorStop(0, 'rgba(239, 68, 68, 0)'); hg.addColorStop(1, `rgba(239, 68, 68, ${state.hurtFlash * 0.55})`);
      ctx.fillStyle = hg; ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  function drawOverlays(ctx, w, h) {
    if (state.mode === 'playing') return;
    ctx.save();
    ctx.fillStyle = state.mode === 'title' ? 'rgba(4, 5, 12, 0.55)' : 'rgba(4, 5, 12, 0.76)';
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const big = (txt, y, size, col, glowCol) => { ctx.font = `900 ${size}px ${KAI}`; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = size * 0.14; ctx.strokeText(txt, w / 2, y); ctx.shadowColor = glowCol || col; ctx.shadowBlur = 30; ctx.fillStyle = col; ctx.fillText(txt, w / 2, y); ctx.shadowBlur = 0; };
    if (state.mode === 'title') {
      ctx.fillStyle = 'rgba(255,209,102,0.85)'; ctx.font = `700 13px ${SANS}`; ctx.fillText('回声游戏厅 · 第 15 期', w / 2, h * 0.2);
      big('十形拳', h * 0.31, Math.min(110, Math.max(56, w * 0.1)), '#ffd166');
      ctx.fillStyle = '#e8f4fa'; ctx.font = `700 ${Math.min(18, Math.max(14, w * 0.018))}px ${SANS}`;
      ctx.fillText('一路打穿六重关卡：十种拳路随时切换，攒满气劲放全屏奥义', w / 2, h * 0.42);
      ctx.fillStyle = 'rgba(232,244,250,0.75)'; ctx.font = `600 13px ${SANS}`;
      ctx.fillText('A / D 移动 · W / K 跳（可二段）· J 三段连招 · L / Shift 闪身', w / 2, h * 0.5);
      ctx.fillText('空格 放奥义 · 1–9、0 或 Q / E 切换拳路 · 顶开带字的秘籍箱换形态', w / 2, h * 0.545);
      if (state.best) { ctx.fillStyle = '#8be9ff'; ctx.fillText(`最高得分 ${state.best.toLocaleString()}`, w / 2, h * 0.6); }
      const pulse = 0.65 + 0.35 * Math.sin(state.totalTime * 5);
      ctx.globalAlpha = pulse; ctx.fillStyle = '#ffd166'; ctx.font = `900 20px ${KAI}`;
      ctx.fillText('点击画面 或 按任意键开打', w / 2, h * 0.68);
    } else if (state.mode === 'paused') {
      big('暂停', h * 0.44, 56, '#f4f2ec', '#38bdf8');
      ctx.fillStyle = '#ffd166'; ctx.font = `600 14px ${SANS}`; ctx.fillText('按 P 继续 · 按 R 重新开始', w / 2, h * 0.54);
    } else if (state.mode === 'gameover') {
      big('败北', h * 0.38, 72, '#ef4444');
      ctx.fillStyle = '#f4f2ec'; ctx.font = `600 15px ${SANS}`;
      ctx.fillText(`得分 ${state.score.toLocaleString()}  ·  最高连击 ${state.maxCombo}  ·  铜钱 ×${state.coins}`, w / 2, h * 0.5);
      if (state.best) ctx.fillText(`最高得分 ${state.best.toLocaleString()}`, w / 2, h * 0.55);
      ctx.fillStyle = '#ffd166'; ctx.font = `900 18px ${KAI}`; ctx.fillText('按 R / 回车 或点击画面 再战', w / 2, h * 0.64);
    } else if (state.mode === 'clear') {
      const rk = getRankInfo(state.maxCombo, state.score);
      big('武道登峰', h * 0.3, 64, '#ffd166');
      ctx.fillStyle = rk.col; ctx.font = `900 76px "SF Pro Display", ${SANS}`; ctx.fillText(rk.letter, w / 2, h * 0.44);
      ctx.fillStyle = '#f4f2ec'; ctx.font = `600 15px ${SANS}`;
      ctx.fillText(`得分 ${state.score.toLocaleString()}  ·  最高连击 ${state.maxCombo}  ·  用时 ${state.playTime.toFixed(1)} 秒`, w / 2, h * 0.55);
      if (state.best) ctx.fillText(`最高得分 ${state.best.toLocaleString()}`, w / 2, h * 0.6);
      ctx.fillStyle = '#38bdf8'; ctx.font = `900 18px ${KAI}`; ctx.fillText('按 R / 回车 或点击画面 再来一局', w / 2, h * 0.7);
    }
    ctx.restore();
  }


  /* ============================================================================
     12. DUAL-PASS BLOOM, CHROMA SPLIT & 60FPS MAIN LOOP
     ============================================================================ */
  const stageCanvas = document.getElementById('stage');
  const stageCtx = stageCanvas.getContext('2d', { alpha: false });
  const sceneCanvas = document.createElement('canvas');
  const sceneCtx = sceneCanvas.getContext('2d', { alpha: false });
  const bloomA = document.createElement('canvas');
  const bloomACtx = bloomA.getContext('2d');
  const bloomB = document.createElement('canvas');
  const bloomBCtx = bloomB.getContext('2d');

  const grainCanvas = document.createElement('canvas');
  grainCanvas.width = 128; grainCanvas.height = 128;
  const gctx = grainCanvas.getContext('2d');
  const gImg = gctx.createImageData(128, 128);
  const gRng = mulberry32(88991);
  for (let i = 0; i < 128 * 128; i++) {
    const v = (gRng() * 255) | 0;
    gImg.data[i * 4] = v; gImg.data[i * 4 + 1] = v; gImg.data[i * 4 + 2] = v; gImg.data[i * 4 + 3] = 255;
  }
  gctx.putImageData(gImg, 0, 0);
  let grainPattern = null;

  function resize() {
    // 按屏幕高度整体缩放：大屏上人物不会显得太小，手机横屏也放得下
    state.vs = clamp(window.innerHeight / 560, 0.72, 1.8);
    state.width = window.innerWidth / state.vs;
    state.height = window.innerHeight / state.vs;
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);

    const k = state.dpr * state.vs;
    const pw = Math.floor(window.innerWidth * state.dpr);
    const ph = Math.floor(window.innerHeight * state.dpr);
    stageCanvas.width = pw; stageCanvas.height = ph;
    stageCtx.setTransform(k, 0, 0, k, 0, 0);

    sceneCanvas.width = pw; sceneCanvas.height = ph;
    sceneCtx.setTransform(k, 0, 0, k, 0, 0);

    bloomA.width = Math.max(64, Math.floor(state.width * 0.24));
    bloomA.height = Math.max(64, Math.floor(state.height * 0.24));
    bloomB.width = Math.max(48, Math.floor(state.width * 0.14));
    bloomB.height = Math.max(24, Math.floor(state.height * 0.08));

    grainPattern = stageCtx.createPattern(grainCanvas, 'repeat');
  }

  function startNewGame() {
    state.mode = 'playing';
    state.playTime = 0;
    state.score = 0; state.coins = 0; state.combo = 0; state.maxCombo = 0;
    state.chi = 120; // Start with 1 full Ultimate charge!
    state.bossLocked = false; state.bossDefeated = false;
    state.flagSliding = false; state.flagTimer = 0;
    state.camZoom = 1.0; state.targetZoom = 1.0; state.domainAlpha = 0;
    state.hurtFlash = 0; state.chromaPulse = 0;
    clearInputs();
    hero.reset();
    world.reset();
    state.camX = Math.max(0, START_X - state.width * 0.43);
    state.camVelX = 0;
    if (state.soundOn) audio.resume();
    stageCanvas.focus();
    updateUI();
    if (!window.__noHub) try { const hh = JSON.parse(localStorage.getItem('echo_hub')) || {}, d = new Date(), k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); (hh.days = hh.days || {})[k] = 'wushu'; (hh.played = hh.played || {}).wushu = k; hh.last = 'wushu'; localStorage.setItem('echo_hub', JSON.stringify(hh)); } catch (e) { /* 存不了就算了 */ }
  }

  function tick(ts) {
    if (!state.lastTs) state.lastTs = ts;
    const rawDt = Math.min((ts - state.lastTs) / 1000, 0.05);
    state.lastTs = ts;

    let dt = rawDt;
    if (state.hitStop > 0) { state.hitStop -= rawDt; dt = 0.0001; }
    if (state.impactFrame > 0) state.impactFrame -= rawDt;

    const W = state.width, H = state.height;
    const groundY = H * 0.78;
    state.totalTime += rawDt;
    state.frame++;

    if (state.mode === 'playing') {
      state.shakeMag *= Math.pow(0.001, rawDt);
      state.shakeX = ((Math.random() - 0.5) * 2 + state.shakeDirX * 0.45) * state.shakeMag;
      state.shakeY = ((Math.random() - 0.5) * 2 + state.shakeDirY * 0.45) * state.shakeMag;
      audio.updateBGM(state.totalTime);
      try { updateGame(dt); } catch (err) { console.error(err); }
    } else if (state.mode === 'title') {
      // Gentle idle animation on Title Screen
      hero.scarf[0].x = hero.x - 7; hero.scarf[0].y = hero.y + 48;
      for (let i = 1; i < hero.scarf.length; i++) {
        hero.scarf[i].x = lerp(hero.scarf[i].x, hero.scarf[i - 1].x - 9, 0.25);
        hero.scarf[i].y = lerp(hero.scarf[i].y, hero.scarf[i - 1].y + Math.sin(state.totalTime * 10 - i * 0.7) * 4, 0.25);
      }
      state.camX = Math.max(0, START_X - W * 0.44);
    }

    // 1. Render World to Offscreen Scene Canvas
    sceneCtx.fillStyle = '#04050a'; sceneCtx.fillRect(0, 0, W, H);
    sceneCtx.save();
    const pivotX = W * state.heroRatio, pivotY = H * 0.58;
    sceneCtx.translate(pivotX + state.shakeX, pivotY + state.shakeY);
    sceneCtx.scale(state.camZoom, state.camZoom);
    sceneCtx.translate(-pivotX, -pivotY);
    drawAtmosphere(sceneCtx, W, H, groundY);
    drawWorldEntities(sceneCtx, W, H, groundY);
    sceneCtx.restore();

    // 2. Composite to Stage + Impact Frame + Chroma Split + Dual-Pass Bloom
    stageCtx.fillStyle = '#020205'; stageCtx.fillRect(0, 0, W, H);
    if (state.impactFrame > 0) stageCtx.filter = 'grayscale(100%) contrast(230%) brightness(0.8)';   // 定格一帧水墨，不做整屏反白
    stageCtx.drawImage(sceneCanvas, 0, 0, W, H);
    stageCtx.filter = 'none';

    if (state.chromaPulse > 0.04 && state.impactFrame <= 0) {
      const split = state.chromaPulse * 9;
      stageCtx.globalCompositeOperation = 'lighter';
      stageCtx.globalAlpha = state.chromaPulse * 0.22;
      stageCtx.drawImage(sceneCanvas, -split, 0, W, H);
      stageCtx.drawImage(sceneCanvas, split, 0, W, H);
      stageCtx.globalAlpha = 1;
      stageCtx.globalCompositeOperation = 'source-over';
    }

    if (state.bloomOn && state.impactFrame <= 0) {
      bloomACtx.clearRect(0, 0, bloomA.width, bloomA.height);
      bloomACtx.filter = 'blur(5px) brightness(1.08) contrast(1.26)';
      bloomACtx.drawImage(sceneCanvas, 0, 0, bloomA.width, bloomA.height);
      bloomACtx.filter = 'none';

      bloomBCtx.clearRect(0, 0, bloomB.width, bloomB.height);
      bloomBCtx.filter = 'blur(7px) brightness(1.06) contrast(1.34)';
      bloomBCtx.drawImage(bloomA, 0, 0, bloomB.width, bloomB.height);
      bloomBCtx.filter = 'none';

      stageCtx.globalCompositeOperation = 'lighter';
      stageCtx.globalAlpha = 0.28; stageCtx.drawImage(bloomA, 0, 0, W, H);
      stageCtx.globalAlpha = 0.16; stageCtx.drawImage(bloomB, -W * 0.14, 0, W * 1.28, H);
      stageCtx.globalAlpha = 1; stageCtx.globalCompositeOperation = 'source-over';
    }

    // Vignette & Subtle Film Grain
    const vig = stageCtx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.34, W * 0.5, H * 0.5, Math.max(W, H) * 0.78);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.44)');
    stageCtx.fillStyle = vig; stageCtx.fillRect(0, 0, W, H);

    if (grainPattern) {
      stageCtx.save(); stageCtx.globalAlpha = 0.022; stageCtx.globalCompositeOperation = 'lighter';
      const gx = (Math.random() * 128) | 0, gy = (Math.random() * 128) | 0;
      stageCtx.translate(-gx, -gy); stageCtx.fillStyle = grainPattern; stageCtx.fillRect(gx, gy, W, H);
      stageCtx.restore();
    }

    // 3. Cut-In, HUD & Overlays
    drawCutInBanner(stageCtx, W, H);
    drawGameHUD(stageCtx, W, H);
    drawOverlays(stageCtx, W, H);

    // Sync Ult Button Pulse
    btnUlt.classList.toggle('ult-ready', state.chi >= 100);

    requestAnimationFrame(tick);
  }

  /* ============================================================================
     13. UI DOCK, KEYBOARD & TOUCH EVENT BINDINGS
     ============================================================================ */
  const btnUlt = document.getElementById('btnUlt');
  const btnPlay = document.getElementById('btnPlay');
  const btnRestart = document.getElementById('btnRestart');
  const btnBloom = document.getElementById('btnBloom');
  const btnSound = document.getElementById('btnSound');
  const formStrip = document.getElementById('formStrip');

  const formBtns = FORMS.map((f, i) => {
    const b = document.createElement('button');
    b.className = 'dock-btn form-pill';
    b.textContent = `${f.key}·${f.short}`;
    b.title = `切换形态 ${f.cn} (快捷键 ${f.key})`;
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.mode === 'title') startNewGame();
      hero.setForm(i, false);
      stageCanvas.focus();
    });
    formStrip.appendChild(b);
    return b;
  });

  function updateUI() {
    btnPlay.textContent = state.mode === 'paused' ? '▶' : '❚❚';
    btnPlay.classList.toggle('active', state.mode === 'paused');
    btnBloom.textContent = state.bloomOn ? '✦ 泛光' : '✧ 泛光';
    btnBloom.classList.toggle('cyan-on', state.bloomOn);
    btnSound.textContent = state.soundOn ? '♪ 音效开' : '♪ 静音';
    btnSound.classList.toggle('amber-on', state.soundOn);
    formBtns.forEach((b, i) => b.classList.toggle('active', i === hero.form));
    document.body.classList.toggle('playing', state.mode === 'playing');
  }

  btnUlt.addEventListener('click', (e) => { e.stopPropagation(); if (state.mode === 'playing') input.ultBuffer = 0.2; stageCanvas.focus(); });
  btnPlay.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.mode === 'playing') state.mode = 'paused';
    else if (state.mode === 'paused') state.mode = 'playing';
    updateUI(); stageCanvas.focus();
  });
  btnRestart.addEventListener('click', (e) => { e.stopPropagation(); startNewGame(); });
  btnBloom.addEventListener('click', (e) => { e.stopPropagation(); state.bloomOn = !state.bloomOn; updateUI(); stageCanvas.focus(); });
  btnSound.addEventListener('click', (e) => {
    e.stopPropagation();
    state.soundOn = !state.soundOn;
    if (state.soundOn) audio.resume();
    updateUI(); stageCanvas.focus();
  });

  // Click canvas to focus or start/restart from overlays
  stageCanvas.addEventListener('pointerdown', () => {
    stageCanvas.focus();
    if (state.soundOn) audio.resume();
    if (state.mode === 'title' || state.mode === 'gameover' || state.mode === 'clear') {
      startNewGame();
    }
  });

  // Keyboard Controls (prevent scrolling on arrows & space)
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    if (state.soundOn) audio.resume();

    if (state.mode === 'title') {
      startNewGame();
      return;
    }
    if (state.mode === 'gameover' || state.mode === 'clear') {
      if (e.code === 'Enter' || e.key === 'r' || e.key === 'R' || e.code === 'Space') startNewGame();
      return;
    }

    if (e.key === 'p' || e.key === 'P') {
      state.mode = state.mode === 'playing' ? 'paused' : 'playing';
      updateUI(); return;
    }
    if (e.key === 'r' || e.key === 'R') { startNewGame(); return; }
    if (e.key === 'm' || e.key === 'M') {
      state.soundOn = !state.soundOn;
      if (state.soundOn) audio.resume();
      updateUI(); return;
    }
    if (e.key === 'b' || e.key === 'B') { state.bloomOn = !state.bloomOn; updateUI(); return; }

    if (state.mode !== 'playing') return;

    // Movement
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') input.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') input.right = true;

    // Jump & Double Jump
    if ((e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'KeyK') && !e.repeat) {
      input.jumpHeld = true;
      input.jumpBuffer = 0.14;
    }
    // 3-Hit Martial Attack
    if ((e.code === 'KeyJ' || e.code === 'KeyZ') && !e.repeat) input.attackBuffer = 0.16;
    // Dash / Shunpo
    if ((e.code === 'KeyL' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat) input.dashBuffer = 0.14;
    // Domain Expansion Ultimate
    if ((e.code === 'Space' || e.code === 'KeyU' || e.code === 'KeyX') && !e.repeat) input.ultBuffer = 0.18;

    // Switch 10 Martial Forms anytime
    if (e.key >= '1' && e.key <= '9') hero.setForm(parseInt(e.key, 10) - 1, false);
    else if (e.key === '0') hero.setForm(9, false);
    else if (e.code === 'KeyQ' && !e.repeat) hero.setForm(hero.form - 1, false);
    else if (e.code === 'KeyE' && !e.repeat) hero.setForm(hero.form + 1, false);
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') input.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') input.right = false;
    if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'KeyK') input.jumpHeld = false;
  });

  window.addEventListener('blur', clearInputs);

  // Touch Controls Binding
  document.querySelectorAll('.tbtn').forEach((btn) => {
    const k = btn.dataset.key;
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (state.mode === 'title') startNewGame();
      if (k === 'left') input.left = true;
      else if (k === 'right') input.right = true;
      else if (k === 'jump') { input.jumpHeld = true; input.jumpBuffer = 0.14; }
      else if (k === 'attack') input.attackBuffer = 0.16;
      else if (k === 'dash') input.dashBuffer = 0.14;
      else if (k === 'ult') input.ultBuffer = 0.18;
    }, { passive: false });
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (k === 'left') input.left = false;
      else if (k === 'right') input.right = false;
      else if (k === 'jump') input.jumpHeld = false;
    }, { passive: false });
  });

  window.addEventListener('resize', resize);

  // 调试入口：预览里推进时间、切形态、放奥义、瞬移
  window.__wushu = {
    start: startNewGame, hero, world, state, FORMS, input,
    sheet(form = 0, scale = 3) {       // 把所有姿势按大比例画到一张图上，用来检查人物骨架
      const ps = Object.keys(POSES).concat(['run']), c = document.createElement('canvas'); c.width = ps.length * 64 * scale; const sv = hero.scarf; hero.scarf = sv.map(() => ({ x: hero.x, y: hero.y + 48 })); c.height = 90 * scale;
      const g = c.getContext('2d'); g.fillStyle = '#5a6a7a'; g.fillRect(0, 0, c.width, c.height); g.scale(scale, scale);
      ps.forEach((p, i) => { hero.runCycle = 1; g.fillStyle = '#fff'; g.font = '8px sans-serif'; g.fillText(p, 4 + i * 64, 10); drawHero(g, 32 + i * 64, 84, form, p, 1, false, 0.6, 1); }); hero.scarf = sv;
      document.body.appendChild(c); c.style.cssText = 'position:fixed;left:0;top:0;z-index:99;max-width:100%'; return ps.join(',');
    },
    step(sec) { for (let t = 0; t < sec && state.mode === 'playing'; t += 1 / 60) updateGame(1 / 60); },
    form(i) { hero.setForm(i, false); }, ult() { state.chi = Math.max(state.chi, 100); triggerUltimate(); },
    attack() { hero.attackCd = 0; performNormalAttack(); }, warp(x) { hero.x = x; state.camX = Math.max(0, x - state.width * 0.44); },
    get s() { return { mode: state.mode, x: Math.round(hero.x), hp: hero.hp, form: hero.form, chi: state.chi, score: state.score, combo: state.combo, alive: world.enemies.filter((e) => e.alive).length, boss: world.boss && world.boss.hp }; },
  };
  window.onload = () => {
    resize();
    hero.reset();
    world.reset();
    updateUI();
    requestAnimationFrame(tick);
  };
})();